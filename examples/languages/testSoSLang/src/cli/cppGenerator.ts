import { CompositeGeneratorNode } from "langium";
import { IGenerator } from "./GeneratorInterface";
import { TypedElement } from "../ccfg/ccfglib";


export class CppGenerator implements IGenerator {
    
    nameFile(filename: string): string {
        return `${filename}.cpp`;
    }
    createBase(codeFile: CompositeGeneratorNode, debug: boolean): void {    
        codeFile.append(`
        #include <string>
        #include <unordered_map>
        #include <thread>
        #include <mutex>
        #include <iostream>
        #include <chrono>
        #include "../utils/LockingQueue.hpp"
        
        using namespace std::chrono_literals;
        `)  // imports

        if(debug){
            codeFile.append(`
        #define DEBUG 1
            `)
        }// debug
            codeFile.append(`
        class Void{
        };
        
        std::unordered_map<std::string, void*> sigma;
        std::mutex sigma_mutex;  // protects sigma
        
        `);// global variables
    }
    endFile(codeFile: CompositeGeneratorNode):void {
    }
    createFunction(codeFile: CompositeGeneratorNode, fname: string, params: TypedElement[], returnType: string,insideFunction:string[]): void {
        codeFile.append(returnType + " function" + fname + `(${params.map(p => (p as TypedElement).toString()).join(", ")}){\n`)

        for (let i = 0; i < insideFunction.length; i++) {
            codeFile.append(insideFunction[i])
        }
        codeFile.append("}\n")
    }
    createMainFunction(codeFile: CompositeGeneratorNode,insideMain:string[]): void {
        codeFile.append("int main(){\n\t")
        for (let i = 0; i < insideMain.length; i++) {
            codeFile.append("\t"+insideMain[i])
        }
        codeFile.append("for(auto entry : sigma){ std::cout << entry.first << \" : \" << *((int*)entry.second) << std::endl;}");
        codeFile.append("}\n")
    }
    createFuncCall(codeFile: CompositeGeneratorNode, fname: string, params: string[], typeName: string): string[] {
        if (typeName == "void"){
            return [`function${fname}(${params.join(", ")});\n`]
        }
        
        return [typeName+ " result"+fname+" = function"+fname + `(${params.join(", ")});\n`]
    }
    createIf(codeFile: CompositeGeneratorNode, guards: string[],insideOfIf:string[]): string[] {
        let createIfString:string[] = []

        createIfString.push("if (" + guards.join(" && ") + "){\n")
        insideOfIf.forEach(element => {
            createIfString.push(element)
        });
        createIfString.push("}\n")
        return createIfString
    }
    createAndOpenThread(codeFile: CompositeGeneratorNode, uid: number,insideThreadCode:string[]): string[] {
        let threadCode:string[] = []
        threadCode = [...threadCode,`std::thread thread${uid}([&](){\n`]
        for (let i = 0; i < insideThreadCode.length; i++) {
            threadCode = [...threadCode, insideThreadCode[i]]
        }
        threadCode = [...threadCode,`});\n`, `thread${uid}.detach();\n`]
        return threadCode


    }
    createQueue(codeFile: CompositeGeneratorNode, queueUID: number): string[] {
        return [`LockingQueue<Void> queue${queueUID};\n`]
    }
    createLockingQueue(codeFile: CompositeGeneratorNode, typeName: string, queueUID: number): string[] {
        return [`LockingQueue<${typeName}> queue${queueUID};`]
    }
    receiveFromQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): string[] {
        return ["queue" + queueUID + ".waitAndPop("+varName+");\n"]
    }
    sendToQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): string[] {
        return ["queue" + queueUID + ".push(" + varName + ");\n"]

    }
    createSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): string[] {
        return ["lockingQueue<Void> synch" + synchUID + ";\n"]
    }
    activateSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): string[] {
        return ["Void fakeParam"+synchUID+";\n " ,"synch" + synchUID + ".push(fakeParam"+synchUID+");\n"]
    }
    waitForSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): string[] {
        return ["Void joinPopped"+synchUID+";\n " ,"synch" + synchUID + ".waitAndPop(joinPopped"+synchUID+");\n"]
    }
    createFlagToGoBackTo(codeFile: CompositeGeneratorNode, uid:number): string[] {
        return ["flag"+uid+ " :\n"]
    }
    goToFlag(codeFile: CompositeGeneratorNode, uid:number): string[] {
        return ["goto flag"+uid+ ";\n"]
    }
    createEqualsVerif(firstValue: string, secondValue: string): string {
        return firstValue + " == " + secondValue
    }
    assignVar(codeFile: CompositeGeneratorNode, varName: string, value: string): string[] {
        return [varName + " = " + value + ";\n"]
    }
    returnVar(codeFile: CompositeGeneratorNode, varName: string): string[] {
        return ["return " + varName + ";\n"]
    }
    createVar(codeFile: CompositeGeneratorNode, type: string, varName: string): string[] {
        return [type + " " + varName + ";\n"]
    }
    createGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string): string[] {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`,"sigma[\"" + varName + "\"] = new "+type+"();\n}"]
    }
    setVarFromGlobal(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): string[] {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`,varName + " = *(" + type + "*)sigma[\"" + value + "\"];\n}"]
    }
    setGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): string[] {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`,"*(("+type+"*)sigma[\"" + varName + "\"]) = "+value +";\n}"]
    }
    operation(codeFile: CompositeGeneratorNode, varName: string, n1: string, op: string, n2: string): string[] {
        return [varName + " = " + n1 + " " + op + " " + n2 + ";\n"]
    }
}