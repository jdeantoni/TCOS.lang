import { CompositeGeneratorNode } from "langium";
import { IGenerator } from "./GeneratorInterface";
import { TypedElement } from "../ccfg/ccfglib";


export class PythonGenerator implements IGenerator {

    debug: boolean = false;

    setDebug(debug: boolean): void {
        this.debug = debug;
    }


    setLoopFlag( queueUID: number): string[] {
        return [`flag${queueUID} = True\n`];
    }
    createLoop( uid: number, insideLoop: string[]): string[] {
        let res = [`while flag${uid} == True: \n`,`\tflag${uid} = False \n`];
        for (let i = 0; i < insideLoop.length; i++) {
            res.push("\t"+insideLoop[i])
        }
        return res; 
    }
    
    createEqualsVerif(firstValue: string, secondValue: string): string {
        firstValue = firstValue.charAt(0).toUpperCase() + firstValue.slice(1);
        secondValue = secondValue.charAt(0).toUpperCase() + secondValue.slice(1);
        return firstValue + " == " + secondValue;
    }
    nbTabs:number = 1;
    nameFile(filename: string): string {
        return `${filename}.py`;
    }
    createBase(): string[] {
        let res:string[] = []
        // imports ----------------------------------------------------------------------------------------------------
        res.push(`import threading \n`) 
        res.push(`import time \n`) 
        res.push(`from queue import Queue, LifoQueue\n`)
        
        // global variables ---------------------------------------------------------------------------------------
        res.push(`##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma \n`) 
        res.push(`returnQueue = LifoQueue()\n`);
        res.push(`sigma: dict = {}\nsigma_mutex = threading.Lock()\n`) 
        return res
    }
    endFile(): string[] {
        let res:string[] = []
        res.push(`if __name__ == "__main__": \n`)
        res.push(`\tmain() \n`)
        return res
    }

    createFunction( fname: string, params: TypedElement[], returnType: string,insideFunction:string[]): string[] {
        let res:string[] = []
        res.push(`def function${fname}(${params.map(p => (p as TypedElement).name).join(", ")}): \n`)
        if (this.debug){
            res.push(`\tprint("\tfunction${fname} started") \n`)
        }
        for (let i = 0; i < insideFunction.length; i++) {
            res.push("\t"+insideFunction[i])
        }
        return res
    }
    createMainFunction(insideMain:string[]): string[] {
        let res:string[] = []
        res.push(`def main(): \n`)
        for (let i = 0; i < insideMain.length; i++) {
            res.push("\t"+insideMain[i])
        }
        if (this.debug){
            res.push(`\tfor v in sigma:\n\t\tprint(str(v)+" = " + str(sigma[v])) \n`)
        }
        return res
    }
    createFuncCall( fname: string, params: string[], typeName: string): string[] {
        if (typeName == "void"){ 
            return [`function${fname}(${params.join(", ")}); \n`]
        }else
            return [`result${fname} = function${fname}(${params.join(", ")}); \n`]
        }
    createIf( guards: string[],insideOfIf:string[]): string[] {
        let createIfString:string[] = []

        createIfString.push(`if ${guards.join(" and ")}: \n`);
        if (this.debug){
            createIfString.push(`\tprint("(${guards.join(" and ")}) is TRUE") \n`)
        }
        insideOfIf.forEach(element => {
            createIfString.push("\t"+element)
        });
        return createIfString;
    }
    createSynchronizer( synchUID: number): string[] {
        return [`sync${synchUID} = Queue() \n`];
    }
    waitForSynchronizer( synchUID: number): string[] {
        return [`sync${synchUID}.get() \n`];
    } 
    activateSynchronizer( synchUID: number): string[] 
    {
        return [`sync${synchUID}.put(42) \n`];
    }
    createAndOpenThread( uid: number,insideThreadCode:string[]): string[] {
        let res = [`def codeThread${uid}():\n`]
        if (this.debug){
            res.push(`\tprint("thread${uid} started") \n`)
        }
        for (let i = 0; i < insideThreadCode.length; i++) {
            res.push("\t"+insideThreadCode[i])
        }
        res = [...res, ...[`thread${uid} = threading.Thread(target=codeThread${uid}) \n`,`thread${uid}.start() \n`,`thread${uid}.join() \n`]]
        return res
    }
    endThread( uid: number): string[] {
        return [`return \n`];
    }
    endSection(codeFile: CompositeGeneratorNode): void {
        this.nbTabs--;
    }
    createQueue( queueUID: number): string[] {
        return [`queue${queueUID} = Queue() \n`];
    }
    createLockingQueue( typeName: string, queueUID: number): string[] {
        return [`queue${queueUID} = Queue() \n`];
    }
    receiveFromQueue( queueUID: number, typeName: string, varName: string): string[]{
        return [`${varName} = queue${queueUID}.get() \n`];
    }
    sendToQueue( queueUID: number, typeName: string, varName: string): string[] {
        return [`queue${queueUID}.put(${varName}) \n`];

    }
    assignVar( varName: string, value: string): string[] {
        if(value == "true" || value == "false"){
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        return [`${varName} = ${value} \n`];
    }
    returnVar( varName: string): string[] {
        return [`return ${varName} \n`];
    }
    createVar( type: string, varName: string): string[] {
        return [`\n`];
    }
    createGlobalVar( type: string, varName: string): string[] {
        return [`sigma_mutex.acquire()\n`,`sigma["${varName}"] = ${type}()\n`,`sigma_mutex.release()\n`];
    }
    setVarFromGlobal( type: string, varName: string, value: string): string[] {
        return [`sigma_mutex.acquire()\n`,`${varName} = sigma["${value}"]\n`,`sigma_mutex.release()\n`];
    }
    setGlobalVar( type: string, varName: string, value: string): string[] {
        if(value == "true" || value == "false"){
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        return [`sigma_mutex.acquire()\n`,`sigma["${varName}"] = ${value}\n`,`sigma_mutex.release()\n`];
    }
    operation( varName: string, n1: string, op: string, n2: string): string[] {
        return [`${varName} = ${n1} ${op} ${n2} \n`];
    }
    createSleep( duration: string): string[] {
        return [`time.sleep(${duration}//1000) \n`];
    }
}