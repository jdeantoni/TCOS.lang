import { CompositeGeneratorNode } from "langium";
import { IGenerator } from "./GeneratorInterface";
import { TypedElement } from "../ccfg/ccfglib";


export class PythonGenerator implements IGenerator {
    isDebug: boolean;

    constructor(debug: boolean) {
        this.isDebug = debug;
    }
    
    goToFlag(codeFile: CompositeGeneratorNode, queueUID: number): string[] {
        throw new Error("Method not implemented.");
    }
    createFlagToGoBackTo(codeFile: CompositeGeneratorNode, uid: number): string[] {
        throw new Error("Method not implemented.");
    }
    
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
    createFunction(codeFile: CompositeGeneratorNode, fname: string, params: TypedElement[], returnType: string,insideFunction:string[]): void {
        codeFile.append(`def function${fname}(${params.map(p => (p as TypedElement).name).join(", ")}): \n`)
        this.nbTabs++;
        for (let i = 0; i < insideFunction.length; i++) {
            codeFile.append(Array(this.nbTabs).join("\t")+insideFunction[i])
        }
        this.nbTabs--;

    }
    createMainFunction(codeFile: CompositeGeneratorNode): void {
        codeFile.append(`def main(): \n`)
        this.nbTabs++;
    }
    createFuncCall(codeFile: CompositeGeneratorNode, fname: string, params: string[], typeName: string): string[] {
        if (typeName == "void"){ 
            return [`function${fname}(${params.join(", ")}); \n`]
        }else
            return [`result${fname} = function${fname}(${params.join(", ")}); \n`]
        }
    createIf(codeFile: CompositeGeneratorNode, guards: string[],insideOfIf:string[]): string[] {
        let createIfString:string[] = []

        createIfString.push(`if ${guards.join(" and ")}: \n`);
        insideOfIf.forEach(element => {
            codeFile.append("\t"+element)
        });
        return createIfString;
    }
    createSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`sync${synchUID} = threading.Event() \n`);
        return [`sync${synchUID} = threading.Event() \n`];
    }
    waitForSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`sync${synchUID}.wait() \n`);
        codeFile.append(Array(this.nbTabs).join("\t")+`sync${synchUID}.clear() \n`);
        return [`sync${synchUID}.wait() `,` sync${synchUID}.clear() \n`];
    } 
    activateSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): string[] 
    {
        codeFile.append(Array(this.nbTabs).join("\t")+`sync${synchUID}.set() \n`);
        return [`sync${synchUID}.set() \n`];
    }
    createAndOpenThread(codeFile: CompositeGeneratorNode, uid: number): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`thread${uid} = threading.Thread(target=thread${uid}) \n`);
        codeFile.append(Array(this.nbTabs).join("\t")+`thread${uid}.start() \n`);
        codeFile.append(Array(this.nbTabs).join("\t")+`thread${uid}.join() \n`);
        return [`thread${uid} = threading.Thread(target=thread${uid}) \n`,`thread${uid}.start() \n`,`thread${uid}.join() \n`];
    }
    endThread(codeFile: CompositeGeneratorNode, uid: number): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`return \n`);
        return [`return \n`];
    }
    endSection(codeFile: CompositeGeneratorNode): void {
        this.nbTabs--;
    }
    createQueue(codeFile: CompositeGeneratorNode, queueUID: number): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`queue${queueUID} = Queue() \n`);
        return [`queue${queueUID} = Queue() \n`];
    }
    createLockingQueue(codeFile: CompositeGeneratorNode, typeName: string, queueUID: number): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`queue${queueUID} = Queue() \n`);
        return [`queue${queueUID} = Queue() \n`];
    }
    receiveFromQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): string[]{
        codeFile.append(Array(this.nbTabs).join("\t")+`${varName} = queue${queueUID}.get() \n`);
        return [`${varName} = queue${queueUID}.get() \n`];
    }
    sendToQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`queue${queueUID}.put(${varName}) \n`);
        return [`queue${queueUID}.put(${varName}) \n`];

    }
    assignVar(codeFile: CompositeGeneratorNode, varName: string, value: string): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`${varName} = ${value} \n`);
        return [`${varName} = ${value} \n`];
    }
    returnVar(codeFile: CompositeGeneratorNode, varName: string): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`return ${varName} \n`);
        return [`return ${varName} \n`];
    }
    createVar(codeFile: CompositeGeneratorNode, type: string, varName: string): string[] {
        return [""];
    }
    createGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`1+1 \n`);
        return [``];
    }
    setVarFromGlobal(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`global ${value} \n`);
        codeFile.append(Array(this.nbTabs).join("\t")+`${varName} = ${value} \n`);
        return [`global ${value} \n`,`${varName} = ${value} \n`];
    }
    setGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`global ${varName} \n`);
        codeFile.append(Array(this.nbTabs).join("\t")+`${varName} = ${value} \n`);
        return [`global ${varName} \n`,`${varName} = ${value} \n`];
    }
    operation(codeFile: CompositeGeneratorNode, varName: string, n1: string, op: string, n2: string): string[] {
        codeFile.append(Array(this.nbTabs).join("\t")+`${varName} = ${n1} ${op} ${n2} \n`);
        return [`${varName} = ${n1} ${op} ${n2} \n`];
    }
}