import { CompositeGeneratorNode } from "langium";
import { IGenerator } from "./GeneratorInterface";
import { TypedElement } from "../ccfg/ccfglib";


export class JsGenerator implements IGenerator {

    debug: boolean = false;

    setDebug(debug: boolean): void {
        this.debug = debug;
    }
    
    nameFile(filename: string): string {
        return `${filename}.js`;
    }
    createBase(): string[] {  
        let res:string[] = []  
        res.push(`
        import { Range, integer } from "vscode-languageserver";
        `)  // imports

        
        res.push(`
        class Void{
        };
        
        let sigma = new Map();
        `);// global variables
        return res
    }
    endFile():string[] {
        return []
    }
    createFunction( fname: string, params: TypedElement[], returnType: string,insideFunction:string[]): string[] {
        let res:string[] = []
        res.push(" function" + fname + `(${params.map(p => (p as TypedElement).toString()).join(", ")}){\n`)

        for (let i = 0; i < insideFunction.length; i++) {
            res.push(insideFunction[i])
        }
        res.push("}\n")
        return res
    }
    createMainFunction(insideMain:string[]): string[] {
        let res:string[] = []
        res.push("async function main(){\n\t");
        for (let i = 0; i < insideMain.length; i++) {
            res.push("\t"+insideMain[i])
        }
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
    createLoop( uid:number, insideLoop: string[]): string[] {
        throw new Error("function createFlagToGoBackTo should be defined");
    }

    setLoopFlag( uid:number): string[] {
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
        return ["sigma.set(\"" + varName + "\", new "+ type +"());\n"]
    }
    setVarFromGlobal( type: string, varName: string, value: string): string[] {
        return ["sigma.set(\"" + varName + "\", " + value + ");\n"]
    }
    setGlobalVar( type: string, varName: string, value: string): string[] {
        return ["sigma.set(\"" + varName + "\",  " + value + ");\n"]
    }
    operation( varName: string, n1: string, op: string, n2: string): string[] {
        return ["let" + varName + " = " + n1 + " " + op + " " + n2 + ";\n"]
    }
    createSleep( duration: string): string[] {
        return ["await new Promise(resolve => setTimeout(resolve, " + duration + "));\n"]
    }
}