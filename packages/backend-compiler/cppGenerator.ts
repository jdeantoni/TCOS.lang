import { IGenerator } from "./GeneratorInterface";
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
        #include "../utils/LockingQueue.hpp"
        
        using namespace std::chrono_literals;
        `)  // imports
        
        res.push(`
        class Void{
        };
        
        std::unordered_map<std::string, void*> sigma;
        std::mutex sigma_mutex;  // protects sigma
        
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
}