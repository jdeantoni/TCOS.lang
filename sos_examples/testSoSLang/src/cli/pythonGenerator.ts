import { CompositeGeneratorNode } from "langium";
import { IGenerator } from "./GeneratorInterface";
import { TypedElement } from "../ccfg/ccfglib";


export class PythonGenerator implements IGenerator {
    
    createEqualsVerif(firstValue: string, secondValue: string): string {
        if (firstValue == "true" ) firstValue = "True";
        if (firstValue == "false" ) firstValue = "False";
        if (secondValue == "true" ) secondValue = "True";
        if (secondValue == "false" ) secondValue = "False";
        return firstValue + " == " + secondValue;
    }
    nbTabs:number = 1;
    nameFile(filename: string): string {
        return `${filename}.py`;
    }
    createBase(codeFile: CompositeGeneratorNode, debug: boolean): void {
        // imports ----------------------------------------------------------------------------------------------------
        codeFile.append(`import threading \n`) 
        codeFile.append(`import time \n`) 
        codeFile.append(`from queue import Queue, LifoQueue\n`)
        if(debug){
            codeFile.append(`#define DEBUG 1 \n`)
        } // debug
        // global variables ---------------------------------------------------------------------------------------
        codeFile.append(`##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma \n`) 
        codeFile.append(`returnQueue = LifoQueue()\n`); 
        
    }
    endFile(codeFile: CompositeGeneratorNode): void {
        codeFile.append(`if __name__ == "__main__": \n`)
        codeFile.append(`\tmain() \n`)
    }
    createFunction(codeFile: CompositeGeneratorNode, fname: string, params: TypedElement[], returnType: string): void {
        codeFile.append(`def function${fname}(${params.map(p => (p as TypedElement).name).join(", ")}): \n`)
        this.nbTabs++;
    }
    createMainFunction(codeFile: CompositeGeneratorNode): void {
        codeFile.append(`def main(): \n`)
        this.nbTabs++;
    }
    createFuncCall(codeFile: CompositeGeneratorNode, fname: string, params: string[], typeName: string): void {
        if (typeName == "void") codeFile.append(Array(this.nbTabs).join("\t")+`function${fname}(${params.join(", ")}); \n`);
        else
            codeFile.append(Array(this.nbTabs).join("\t")+`result${fname} = function${fname}(${params.join(", ")}); \n`)
    }
    createIf(codeFile: CompositeGeneratorNode, guards: string[]): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`if ${guards.join(" and ")}: \n`);
        this.nbTabs++;
    }
    createSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`sync${synchUID} = threading.Event() \n`);
    }
    waitForSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`sync${synchUID}.wait() \n`);
        codeFile.append(Array(this.nbTabs).join("\t")+`sync${synchUID}.clear() \n`);
    } 
    activateSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): void 
    {
        codeFile.append(Array(this.nbTabs).join("\t")+`sync${synchUID}.set() \n`);
    }
    createAndOpenThread(codeFile: CompositeGeneratorNode, uid: number): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`thread${uid} = threading.Thread(target=thread${uid}) \n`);
        codeFile.append(Array(this.nbTabs).join("\t")+`thread${uid}.start() \n`);
        codeFile.append(Array(this.nbTabs).join("\t")+`thread${uid}.join() \n`);
    }
    endThread(codeFile: CompositeGeneratorNode, uid: number): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`return \n`);
    }
    endSection(codeFile: CompositeGeneratorNode): void {
        this.nbTabs--;
    }
    createQueue(codeFile: CompositeGeneratorNode, queueUID: number): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`queue${queueUID} = Queue() \n`);
    }
    createLockingQueue(codeFile: CompositeGeneratorNode, typeName: string, queueUID: number): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`queue${queueUID} = Queue() \n`);
    }
    receiveFromQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): void{
        codeFile.append(Array(this.nbTabs).join("\t")+`${varName} = queue${queueUID}.get() \n`);
    }
    sendToQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`queue${queueUID}.put(${varName}) \n`);
    }
    assignVar(codeFile: CompositeGeneratorNode, varName: string, value: string): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`${varName} = ${value} \n`);
    }
    returnVar(codeFile: CompositeGeneratorNode, varName: string): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`return ${varName} \n`);
    }
    createVar(codeFile: CompositeGeneratorNode, type: string, varName: string): void {
    }
    createGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`1+1 \n`);
    }
    setVarFromGlobal(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`global ${value} \n`);
        codeFile.append(Array(this.nbTabs).join("\t")+`${varName} = ${value} \n`);
    }
    setGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`global ${varName} \n`);
        codeFile.append(Array(this.nbTabs).join("\t")+`${varName} = ${value} \n`);
    }
    operation(codeFile: CompositeGeneratorNode, varName: string, n1: string, op: string, n2: string): void {
        codeFile.append(Array(this.nbTabs).join("\t")+`${varName} = ${n1} ${op} ${n2} \n`);
    }
}