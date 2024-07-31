import { CompositeGeneratorNode } from "langium";
import { IGenerator } from "./GeneratorInterface";
import { TypedElement } from "../ccfg/ccfglib";


export class CppGenerator implements IGenerator {
    
    nameFile(filename: string): string {
        return `${filename}.js`;
    }
    createBase(codeFile: CompositeGeneratorNode, debug: boolean): void {    
        codeFile.append(`
        import { Range, integer } from "vscode-languageserver";
        `)  // imports

        if(debug){
            codeFile.append(`
            `)
        }// debug
            codeFile.append(`
        class Void{
        };
        
        let sigma = new Map();
        `);// global variables
    }
    endFile(codeFile: CompositeGeneratorNode):void {
    }
    createFunction(codeFile: CompositeGeneratorNode, fname: string, params: TypedElement[], returnType: string,insideFunction:string[]): void {
        codeFile.append(" function" + fname + `(${params.map(p => (p as TypedElement).toString()).join(", ")}){\n`)

        for (let i = 0; i < insideFunction.length; i++) {
            codeFile.append(insideFunction[i])
        }
        codeFile.append("}\n")
    }
    createMainFunction(codeFile: CompositeGeneratorNode,insideMain:string[]): void {
        codeFile.append("async function main(){\n\t");
        for (let i = 0; i < insideMain.length; i++) {
            codeFile.append("\t"+insideMain[i])
        }
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
        threadCode = [...threadCode,`function asyncfuntion${uid}([&](){\n
            `]
        for (let i = 0; i < insideThreadCode.length; i++) {
            threadCode = [...threadCode, "await " + insideThreadCode[i] + ";\n"];
        }
        threadCode = [...threadCode,`});\n`, `await asyncfuntion${uid}();\n`]
        return threadCode
    }
    createQueue(codeFile: CompositeGeneratorNode, queueUID: number): string[] {
        throw new Error("function createQueue should be defined");
    }
    createLockingQueue(codeFile: CompositeGeneratorNode, typeName: string, queueUID: number): string[] {
        throw new Error("function createLockingQueue should be defined");
    }
    receiveFromQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): string[] {
        throw new Error("function receiveFromQueue should be defined");
    }
    sendToQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string, varName: string): string[] {
        throw new Error("function sendToQueue should be defined");
    }
    createSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): string[] {
        throw new Error("function createSynchronizer should be defined");
    }
    activateSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): string[] {
        throw new Error("function activateSynchronizer should be defined");
    }
    waitForSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): string[] {
        throw new Error("function waitForSynchronizer should be defined");
    }
    createLoopStart(codeFile: CompositeGeneratorNode, uid:number): string[] {
        throw new Error("function createFlagToGoBackTo should be defined");
    }
    createLoopEnd(codeFile: CompositeGeneratorNode, uid:number): string[] {
        throw new Error("function createFlagToGoBackTo should be defined");
    }
    setLoopFlag(codeFile: CompositeGeneratorNode, uid:number): string[] {
        throw new Error("function goToFlag should be defined");
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
        return ["let " + varName + ";\n"]

    }
    createGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string): string[] {
        return ["sigma.set(\"" + varName + "\", new "+ type +"());\n"]
    }
    setVarFromGlobal(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): string[] {
        return ["sigma.set(\"" + varName + "\", " + value + ");\n"]
    }
    setGlobalVar(codeFile: CompositeGeneratorNode, type: string, varName: string, value: string): string[] {
        return ["sigma.set(\"" + varName + "\",  " + value + ");\n"]
    }
    operation(codeFile: CompositeGeneratorNode, varName: string, n1: string, op: string, n2: string): string[] {
        return ["let" + varName + " = " + n1 + " " + op + " " + n2 + ";\n"]
    }
}