import { IGenerator } from "./GeneratorInterface.js";
import { TypedElement } from "ccfg";


export class CppGenerator implements IGenerator {
    debug: boolean;

    constructor(debug: boolean = false) {
        this.debug = debug;
    }
    setDebug(debug: boolean): void {
        this.debug = debug;
    }
    
    nameFile(filename: string): string {
        return `${filename}.cpp`;
    }
    createBase(): string[] {    
        let res:string[] = []
        res.push(`
        #include <string>
        #include <unordered_map>
        #include <thread>
        #include <mutex>
        #include <iostream>
        #include <chrono>
        #include <any>
        #include <condition_variable>
        #include <atomic>
        #include <memory>
        #include <vector>
        #include <type_traits>
        #include <stdexcept>
        #include "../utils/LockingQueue.hpp"
        
        using namespace std::chrono_literals;
        `)  // imports
        
        res.push(`
        class Void{
        };
        
        std::unordered_map<std::string, void*> sigma;
        std::mutex sigma_mutex;  // protects sigma

        struct __AckToken {
            explicit __AckToken(int n) : remaining(n) {}

            void done() {
                if (remaining.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                    std::lock_guard<std::mutex> lk(m);
                    cv.notify_all();
                }
            }

            void wait() {
                std::unique_lock<std::mutex> lk(m);
                cv.wait(lk, [&] { return remaining.load(std::memory_order_acquire) == 0; });
            }

        private:
            std::atomic<int> remaining;
            std::mutex m;
            std::condition_variable cv;
        };

        struct __EventMsg {
            std::any payload;
            std::shared_ptr<__AckToken> ack;
        };

        struct __EventChannel {
            int listenerCount;
            std::string payloadKind;
            std::vector<LockingQueue<__EventMsg>> inboxes;
            std::atomic<size_t> nextListenerIndex{0};
            std::mutex listenersMutex;
            std::unordered_map<std::thread::id, size_t> listenerByThread;
        };

        std::unordered_map<std::string, std::shared_ptr<__EventChannel>> eventChannels;
        std::mutex eventRegistryMutex;
        thread_local std::shared_ptr<__AckToken> __lastEventToken = nullptr;

        std::shared_ptr<__EventChannel> __getEventChannel(const std::string& name){
            const std::lock_guard<std::mutex> lock(eventRegistryMutex);
            auto it = eventChannels.find(name);
            if (it == eventChannels.end()) {
                throw std::runtime_error("Unknown event channel: " + name);
            }
            return it->second;
        }

        void __createEventChannel(const std::string& name, int listenerCount, const std::string& payloadKind){
            auto channel = std::make_shared<__EventChannel>();
            channel->listenerCount = listenerCount > 0 ? listenerCount : 1;
            channel->payloadKind = payloadKind;
            channel->inboxes.resize(static_cast<size_t>(channel->listenerCount));
            const std::lock_guard<std::mutex> lock(eventRegistryMutex);
            eventChannels[name] = channel;
        }

        size_t __resolveListenerIndex(const std::shared_ptr<__EventChannel>& channel){
            const std::lock_guard<std::mutex> lock(channel->listenersMutex);
            auto tid = std::this_thread::get_id();
            auto it = channel->listenerByThread.find(tid);
            if (it != channel->listenerByThread.end()) {
                return it->second;
            }
            size_t index = channel->nextListenerIndex.fetch_add(1) % channel->inboxes.size();
            channel->listenerByThread[tid] = index;
            return index;
        }

        void __emitEvent(const std::string& name, const std::any& payload, bool awaitAcks){
            auto channel = __getEventChannel(name);
            auto ack = std::make_shared<__AckToken>(channel->listenerCount);
            __EventMsg msg{payload, ack};
            for (auto& inbox : channel->inboxes) {
                inbox.push(msg);
            }

            if (awaitAcks){
                ack->wait();
            }
        }

        __EventMsg __waitEvent(const std::string& name){
            auto channel = __getEventChannel(name);
            size_t listenerIndex = __resolveListenerIndex(channel);
            __EventMsg event;
            channel->inboxes[listenerIndex].waitAndPop(event);
            return event;
        }

        void __ackEvent(const std::shared_ptr<__AckToken>& token){
            if (!token){
                return;
            }
            token->done();
        }
        
        `);// global variables
        return res
    }
    endFile():string[] {
        return []
    }
    createFunction( fname: string, params: TypedElement[], returnType: string,insideFunction:string[]): string[] {
        let res:string[] = []
        res.push(returnType + " function" + fname + `(${params.map(p => (p as TypedElement).toString()).join(", ")}){\n`)
        if (this.debug){
            res.push(`std::cout << "\tfunction${fname} started" << std::endl;\n`)
        }
        for (let i = 0; i < insideFunction.length; i++) {
            res.push("\t"+insideFunction[i])
        }
        res.push("}\n")
        return res
    }
    createMainFunction(insideMain:string[]): string[] {
        let res:string[] = []
        res.push("int main(){\n\t")
        for (let i = 0; i < insideMain.length; i++) {
            res.push("\t"+insideMain[i])
        }
        res.push("for(auto entry : sigma){ std::cout << entry.first << \" : \" << *((int*)entry.second) << std::endl;}\n");
        res.push("}\n")
        return res
    }
    createFuncCall( fname: string, params: string[], typeName: string): string[] {
        if (typeName == "void"){
            return [`function${fname}(${params.join(", ")});\n`]
        }
        
        return [typeName+ " result"+fname+" = function"+fname + `(${params.join(", ")});\n`]
    }
    createIf( guards: string[],insideOfIf:string[]): string[] {
        let createIfString:string[] = []

        createIfString.push("if (" + guards.join(" && ") + "){\n")
        if(this.debug){
            createIfString.push(`std::cout << "(${guards.join(" && ")}) is TRUE" << std::endl;\n`)
        }
        insideOfIf.forEach(element => {
            createIfString.push("\t"+element)
        });
        createIfString.push("}\n")
        return createIfString
    }
    createAndOpenThread( uid: number,insideThreadCode:string[]): string[] {
        let threadCode:string[] = []
        threadCode = [...threadCode,`std::thread thread${uid}([&](){\n`]
        if(this.debug){
            threadCode.push(`std::cout << "thread${uid} started" << std::endl;\n`)
        }
        for (let i = 0; i < insideThreadCode.length; i++) {
            threadCode = [...threadCode, "\t"+insideThreadCode[i]]
        }
        threadCode = [...threadCode,`});\n`, `thread${uid}.detach();\n`]
        return threadCode


    }
    createQueue( queueUID: number): string[] {
        return [`LockingQueue<Void> queue${queueUID};\n`]
    }
    createLockingQueue( typeName: string, queueUID: number): string[] {
        return [`LockingQueue<${typeName}> queue${queueUID};\n`]
    }
    receiveFromQueue( queueUID: number, typeName: string, varName: string): string[] {
        return ["queue" + queueUID + ".waitAndPop("+varName+");\n"]
    }
    sendToQueue( queueUID: number, typeName: string, varName: string): string[] {
        return ["queue" + queueUID + ".push(" + varName + ");\n"]

    }
    createSynchronizer( synchUID: number): string[] {
        return [`bool flag${synchUID} = true;\n`,`LockingQueue<Void> synch${synchUID};\n`]
    }
    activateSynchronizer( synchUID: number): string[] {
        return ["{Void fakeParam"+synchUID+";\n " ,"synch" + synchUID + ".push(fakeParam"+synchUID+");}\n"]
    }
    waitForSynchronizer( synchUID: number): string[] {
        return ["{Void joinPopped"+synchUID+";\n " ,"synch" + synchUID + ".waitAndPop(joinPopped"+synchUID+");}\n"]
    }
    createLoop( uid:number, insideLoop: string[]): string[] {
        let res = ["flag"+uid+"= true;\nwhile (flag"+uid+ " == true){\n\tflag"+uid+" = false;\n"]
        for (let i = 0; i < insideLoop.length; i++) {
            res.push("\t"+insideLoop[i])
        }
        res.push("}\n")
        return res
    }
    
    setLoopFlag( uid:number): string[] {
        return ["flag"+uid+ " = true;\n"]
    }
    createEqualsVerif(firstValue: string, secondValue: string): string {
        return firstValue + " == " + secondValue
    }
    assignVar( varName: string, value: string): string[] {
        return [varName + " = " + value + ";\n"]
    }
    returnVar( varName: string): string[] {
        return ["return " + varName + ";\n"]
    }
    createVar( type: string, varName: string): string[] {
        return [type + " " + varName + ";\n"]
    }
    createGlobalVar( type: string, varName: string): string[] {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`,"sigma[\"" + varName + "\"] = new "+type+"();}\n"]
    }
    setVarFromGlobal( type: string, varName: string, value: string): string[] {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`,varName + " = *(" + type + "*)sigma[\"" + value + "\"];}\n"]
    }
    setGlobalVar( type: string, varName: string, value: string): string[] {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`,"*(("+type+"*)sigma[\"" + varName + "\"]) = "+value +";}\n"]
    }
    operation( varName: string, n1: string, op: string, n2: string): string[] {
        return [varName + " = " + n1 + " " + op + " " + n2 + ";\n"]
    }
    createSleep( duration: string): string[] {
        return [`std::this_thread::sleep_for(${duration}ms);\n`]
    }

    createEventChannel(channelName: string, listenerCount: number, payloadKind: string): string[] {
        return [`__createEventChannel(${JSON.stringify(channelName)}, ${listenerCount}, ${JSON.stringify(payloadKind)});\n`]
    }

    emitEvent(channelName: string, payload: string, awaitAcks: boolean): string[] {
        return [`__emitEvent(${JSON.stringify(channelName)}, ${payload}, ${awaitAcks ? "true" : "false"});\n`]
    }

    waitEvent(channelName: string, outPayload: string): string[] {
        return [
            `{\n`,
            `\tauto __event = __waitEvent(${JSON.stringify(channelName)});\n`,
            `\t${outPayload} = std::any_cast<std::remove_reference_t<decltype(${outPayload})>>(__event.payload);\n`,
            `\t__lastEventToken = __event.ack;\n`,
            `}\n`
        ]
    }

    ackEvent(token: string): string[] {
        return [`__ackEvent(__lastEventToken);\n`]
    }
}