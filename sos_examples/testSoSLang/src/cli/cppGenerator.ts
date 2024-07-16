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
    createFunction(codeFile: CompositeGeneratorNode, fname: string, params: TypedElement[], returnType: string): void {
        codeFile.append(returnType + " function" + fname + `(${params.map(p => (p as TypedElement).toString()).join(", ")}){\n\t`)
    }
    createMainFunction(codeFile: CompositeGeneratorNode): void {
        codeFile.append("int main(){\n\t")
    }
    createFuncCall(codeFile: CompositeGeneratorNode, fname: string, params: string[], typeName: string): void {
        if (typeName == "void") codeFile.append(`function${fname}(${params.join(", ")});\n`);
        else
            codeFile.append(typeName+ " result"+fname+" = function"+fname + `(${params.join(", ")});\n`)
    }
    createIf(codeFile: CompositeGeneratorNode, guards: string[],insideOfIf:CompositeGeneratorNode): void {
        codeFile.append("if (" + guards.join(" && ") + "){\n")
        codeFile.append(insideOfIf.toString())
        codeFile.append("}\n")
    }
    createAndOpenThread(codeFile: CompositeGeneratorNode, uid: number): void {
        codeFile.append(`
            std::thread thread${uid}([&](){\n`
                );
    }
    endThread(codeFile: CompositeGeneratorNode, uid: number): void {
        codeFile.append(`
        });
        thread${uid}.detach();
            `);
    }
    endSection(codeFile: CompositeGeneratorNode): void {
        codeFile.append("}\n")
    }
    createQueue(codeFile: CompositeGeneratorNode, queueUID: number): void {
        codeFile.append(`LockingQueue<Void> queue${queueUID};\n`)
    }
    createLockingQueue(codeFile: CompositeGeneratorNode, typeName: string, queueUID: number): void {
        codeFile.append(`
LockingQueue<${typeName}> queue${queueUID};`);
    }
    receiveFromQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): void {
        codeFile.append("queue" + queueUID + ".waitAndPop("+varName+");\n")
    }
    sendToQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): void {
        codeFile.append("queue" + queueUID + ".push(" + varName + ");\n")
    }
    createSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): void {
        codeFile.append("lockingQueue<Void> synch" + synchUID + ";\n")
    }
    activateSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): void {
        codeFile.append("Void fakeParam"+synchUID+";\n")
        codeFile.append("synch" + synchUID + ".push(fakeParam"+synchUID+");")
    }
    waitForSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): void {
        codeFile.append("Void joinPopped"+synchUID+";\n")
        codeFile.append("synch" + synchUID + ".waitAndPop();\n")
    }
    createEqualsVerif(firstValue: string, secondValue: string): string {
        return firstValue + " == " + secondValue;
    }
    assignVar(codeFile: CompositeGeneratorNode, varName: string, value: string): void {
        codeFile.append(varName + " = " + value + ";\n")
    }
    returnVar(codeFile: CompositeGeneratorNode, varName: string): void {
        codeFile.append("return " + varName + ";\n")
    }
    createVar(codeFile: CompositeGeneratorNode, type: string, varName: string): void {
        codeFile.append(type + " " + varName + ";\n")
    }
    createGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string): void {
        codeFile.append("sigma[\"" + varName + "\"] = new "+type+"();\n")
    }
    setVarFromGlobal(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): void {
        codeFile.append( varName + " = *(" + type + "*)sigma[\"" + value + "\"];\n")
    }
    setGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): void {
        codeFile.append("*(("+type+"*)sigma[\"" + varName + "\"]) = "+value +";\n")
    }
    operation(codeFile: CompositeGeneratorNode, varName: string, n1: string, op: string, n2: string): void {
        codeFile.append(varName + " = " + n1 + " " + op + " " + n2 + ";\n")
    }
}