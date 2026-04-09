import { IGenerator } from "./GeneratorInterface.js";
import { TypedElement } from "ccfg";


export class CppGenerator implements IGenerator {
    debug: boolean;
    private readonly channelPayloadKinds: Map<string, string> = new Map();

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

        struct com_EventChannel {
            int listenerCount;
            std::string payloadKind;
            LockingQueue<std::pair<std::any, int>> queue;
            int nextToken;
            std::unordered_map<int, int> pendingAcks;
        };

        std::unordered_map<std::string, std::shared_ptr<com_EventChannel>> eventChannels;
        std::unordered_map<int, std::string> eventTokenToChannel;
        std::mutex eventMutex;
        int com_last_event_token = -1;

        std::shared_ptr<com_EventChannel> com_get_event_channel(const std::string& name){
            const std::lock_guard<std::mutex> lock(eventMutex);
            auto it = eventChannels.find(name);
            if (it == eventChannels.end()) {
                throw std::runtime_error("Unknown event channel: " + name);
            }
            return it->second;
        }

        void com_create_event_channel(const std::string& name, int listenerCount, const std::string& payloadKind){
            const std::lock_guard<std::mutex> lock(eventMutex);
            if (eventChannels.find(name) != eventChannels.end()) {
                return;
            }
            auto channel = std::make_shared<com_EventChannel>();
            channel->listenerCount = listenerCount;
            channel->payloadKind = payloadKind;
            channel->nextToken = 1;
            eventChannels[name] = channel;
        }

        void com_emit_event(const std::string& name, const std::any& payload, bool awaitAcks){
            auto channel = com_get_event_channel(name);

            int token;
            {
                const std::lock_guard<std::mutex> lock(eventMutex);
                token = channel->nextToken;
                channel->nextToken += 1;
                int expectedAcks = awaitAcks ? channel->listenerCount : 0;
                if (expectedAcks > 0) {
                    channel->pendingAcks[token] = expectedAcks;
                    eventTokenToChannel[token] = name;
                }
            }

            channel->queue.push({payload, token});

            if (awaitAcks){
                int remaining = 0;
                do {
                    {
                        const std::lock_guard<std::mutex> lock(eventMutex);
                        auto it = channel->pendingAcks.find(token);
                        remaining = (it == channel->pendingAcks.end()) ? 0 : it->second;
                    }
                    if (remaining > 0) {
                        std::this_thread::sleep_for(10ms);
                    }
                } while (remaining > 0);

                const std::lock_guard<std::mutex> lock(eventMutex);
                channel->pendingAcks.erase(token);
                eventTokenToChannel.erase(token);
            }
        }

        std::pair<std::any, int> com_wait_event(const std::string& name){
            auto channel = com_get_event_channel(name);
            std::pair<std::any, int> event;
            channel->queue.waitAndPop(event);
            return event;
        }

        void com_ack_event(int token){
            const std::lock_guard<std::mutex> lock(eventMutex);
            auto tokenIt = eventTokenToChannel.find(token);
            if (tokenIt == eventTokenToChannel.end()) {
                return;
            }

            auto channelIt = eventChannels.find(tokenIt->second);
            if (channelIt == eventChannels.end()) {
                return;
            }

            auto channel = channelIt->second;
            int remaining = 0;
            auto pendingIt = channel->pendingAcks.find(token);
            if (pendingIt != channel->pendingAcks.end()) {
                remaining = pendingIt->second;
            }
            remaining -= 1;

            if (remaining <= 0) {
                channel->pendingAcks.erase(token);
                eventTokenToChannel.erase(token);
            } else {
                channel->pendingAcks[token] = remaining;
            }
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
        return [`LockingQueue<Void> sync${queueUID};\n`]
    }
    createLockingQueue( typeName: string, queueUID: number): string[] {
        return [`LockingQueue<${typeName}> sync${queueUID};\n`]
    }
    receiveFromQueue( queueUID: number, typeName: string, varName: string): string[] {
        return ["sync" + queueUID + ".waitAndPop("+varName+");\n"]
    }
    sendToQueue( queueUID: number, typeName: string, varName: string): string[] {
        return ["sync" + queueUID + ".push(" + varName + ");\n"]

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
        this.channelPayloadKinds.set(channelName, payloadKind);
        return [`com_create_event_channel(${JSON.stringify(channelName)}, ${listenerCount}, ${JSON.stringify(payloadKind)});\n`]
    }

    emitEvent(channelName: string, payload: string, awaitAcks: boolean): string[] {
        return [`com_emit_event(${JSON.stringify(channelName)}, ${payload}, ${awaitAcks ? "true" : "false"});\n`]
    }

    waitEvent(channelName: string, outPayload: string): string[] {
        const payloadKind = this.channelPayloadKinds.get(channelName);
        return [
            `\n`,
            `\tauto event = com_wait_event(${JSON.stringify(channelName)});\n`,
            ...(payloadKind != undefined && payloadKind != "void"
                ? [`\tauto ${outPayload} = std::any_cast<${payloadKind}>(event.first);\n`]
                : [`\tauto ${outPayload} = std::any{};\n`]),
            `\tauto ${channelName}Token = event.second;\n`,
            `\tcom_last_event_token = event.second;\n`,
            `\n`
        ]
    }

    ackEvent(token: string): string[] {
        return [`com_ack_event(${token});\n`]
    }
}