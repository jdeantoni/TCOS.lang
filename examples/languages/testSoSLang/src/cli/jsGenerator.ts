import { CompositeGeneratorNode } from "langium";
import { IGenerator } from "./GeneratorInterface";
import { TypedElement } from "../ccfg/ccfglib";


export class JsGenerator implements IGenerator {
    
    nameFile(filename: string): string {
        return `${filename}.js`;
    }
    createBase( debug: boolean): void {    
        throw Error('not implemented function')
    }
    endFile(codeFile: CompositeGeneratorNode):void {
    }
    createFunction(codeFile: CompositeGeneratorNode, fname: string, params: TypedElement[], returnType: string,insideFunction:string[]): void {
        throw Error('not implemented function')
    }
    createMainFunction(codeFile: CompositeGeneratorNode,insideMain:string[]): void {
        throw Error('not implemented function')
    }
    createFuncCall( fname: string, params: string[], typeName: string): string[] {
        if (typeName == "void"){
            return [`function${fname}(${params.join(", ")});\n`]
        }
        
        return [typeName+ " result"+fname+" = function" + fname + `(${params.join(", ")});\n`]
    }
    createIf( guards: string[],insideOfIf:string[]): string[] {
        let createIfString:string[] = []

        createIfString.push("if (" + guards.join(" && ") + "){\n")
        insideOfIf.forEach(element => {
            createIfString.push(element)
        });
        createIfString.push("}\n")
        return createIfString
    }

    createAndOpenThread( uid: number,insideThreadCode:string[]): string[] {
        let threadCode:string[] = []
        threadCode = [...threadCode,`function asyncfuntion${uid}([&](){\n
            `]
        for (let i = 0; i < insideThreadCode.length; i++) {
            threadCode = [...threadCode, "await " + insideThreadCode[i] + ";\n"];
        }
        threadCode = [...threadCode,`});\n`, `await asyncfuntion${uid}();\n`]
        return threadCode
    }
    createQueue( queueUID: number): string[] {
        throw new Error("function createQueue should be defined");
    }
    createLockingQueue( typeName: string, queueUID: number): string[] {
        throw new Error("function createLockingQueue should be defined");
    }
    receiveFromQueue( queueUID: number, typeName: string, varName: string): string[] {
        throw new Error("function receiveFromQueue should be defined");
    }
    sendToQueue( queueUID: number, typeName: string, varName: string): string[] {
        throw new Error("function sendToQueue should be defined");
    }
    createSynchronizer( synchUID: number): string[] {
        throw new Error("function createSynchronizer should be defined");
    }
    activateSynchronizer( synchUID: number): string[] {
        throw new Error("function activateSynchronizer should be defined");
    }
    waitForSynchronizer( synchUID: number): string[] {
        throw new Error("function waitForSynchronizer should be defined");
    }
    createFlagToGoBackTo( uid:number): string[] {
        throw new Error("function createFlagToGoBackTo should be defined");
    }
    goToFlag( uid:number): string[] {
        throw new Error("function goToFlag should be defined");
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
        return ["let " + varName + ";\n"]

    }
    createGlobalVar( type: string, varName: string): string[] {
        var typeJS:string = type;
        switch (type){
            case "int" :
                typeJS = "Number";
                break;
            case "string" :
                typeJS = "String";
                break;
        }
        return ["sigma.set(\"" + varName + "\", new "+ typeJS +"());\n"]
    }
    setVarFromGlobal( type: string, varName: string, value: string): string[] {
        return [`let tempVariable = sigma.get("${value}");\n
            ${varName }= tempVariable;\n
            `]
    }
    setGlobalVar( type: string, varName: string, value: string): string[] {
        return ["sigma.set(\"" + varName + "\",  " + value + ");\n"]
    }
    operation( varName: string, n1: string, op: string, n2: string): string[] {
        return ["let" + varName + " = " + n1 + " " + op + " " + n2 + ";\n"]
    }
}