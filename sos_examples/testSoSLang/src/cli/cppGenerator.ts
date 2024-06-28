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
    createFunction(codeFile: CompositeGeneratorNode, fname: string, params: TypedElement[], returnType: string): void {
        codeFile.append(returnType + " function" + fname + `(${params.map(p => (p as TypedElement).toString()).join(", ")}){\n\t`)
    }
    createMainFunction(codeFile: CompositeGeneratorNode): void {
        codeFile.append("int main(){\n\t")
    }
    createFuncCall(codeFile: CompositeGeneratorNode, fname: string, params: string[], typeName: string): void {
        if (typeName == "void") codeFile.append(`function${fname}(${params.join(", ")});\n`);
        else
            codeFile.append(typeName+ "result"+fname+" = function"+fname + `(${params.join(", ")});\n`)
    }
    createIf(codeFile: CompositeGeneratorNode, guards: string[]): unknown {
        throw new Error("Method not implemented.");
    }
    createLockingQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string): unknown {
        throw new Error("Method not implemented.");
    }
    createAndOpenThread(codefile: any, uid: number): unknown {
        throw new Error("Method not implemented.");
    }
    endThread(codeFile: CompositeGeneratorNode, uid: number): unknown {
        throw new Error("Method not implemented.");
    }
    endSection(codeFile: CompositeGeneratorNode): void {
        codeFile.append("}\n")
    }
    createQueue(codeFile: CompositeGeneratorNode, queueUID: number): void {
        throw new Error("Method not implemented.");
    }
    receiveFromQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string): void;
    receiveFromQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): void;
    receiveFromQueue(codeFile: unknown, queueUID: unknown, typeName: unknown, varName?: unknown): void {
        throw new Error("Method not implemented.");
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
        codeFile.append(type + " " + value + " = *(" + type + "*)sigma[\"" + varName + "\"];\n")
    }
    setGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): void {
        codeFile.append("sigma[\"" + varName + "\"] = new " + type + "(" + value + ");\n")
    }
    operation(codeFile: CompositeGeneratorNode, varName: string, n1: string, op: string, n2: string): void {
        codeFile.append(varName + " = " + n1 + " " + op + " " + n2 + ";\n")
    }
}