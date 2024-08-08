import { IGenerator } from "./GeneratorInterface";
import { TypedElement } from "../../../CCFG/src/ccfglib.js";


export class JsGenerator implements IGenerator {

    isDebug: boolean = false;

    setDebug(debug: boolean): void {
        this.isDebug = debug;
    }
    
    nameFile(filename: string): string {
        return `${filename}.js`;
    }
    createBase(): string[] {  
        let res:string[] = []  

        res.push(`
class Void{}
let sigma = new Map();

`);// global variables
        return res
    }
    endFile():string[] {
        return [`main();\n`]
    }
    createFunction( fname: string, params: TypedElement[], returnType: string,insideFunction:string[]): string[] {
        let res:string[] = []
        res.push("async function function" + fname + `(${params.map(p => (p as TypedElement).name).join(", ")}){\n`)

        if (this.isDebug){
            res.push(`\tconsole.log("\tfunction${fname} started");\n`)
        }
        for (let i = 0; i < insideFunction.length; i++) {
            res.push("\t"+insideFunction[i])
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
        if (this.isDebug){
            res.push(`\tfor (let v of sigma){\n`)
            res.push(`\t\tconsole.log(v[0]+" = " + v[1]);\n`)
            res.push(`\t}\n`)
        }
        res.push("}\n")
        return res
    }
    createFuncCall( fname: string, params: string[], typeName: string): string[] {
        if (typeName == "void"){
            return [`await function${fname}(${params.join(", ")});\n`]
        }
        
        return ["let result"+fname+" = await function"+fname + `(${params.join(", ")});\n`]
    }
    createIf( guards: string[],insideOfIf:string[]): string[] {
        let createIfString:string[] = []

        createIfString.push("if (" + guards.join(" && ") + "){\n")
        if (this.isDebug){
            createIfString.push(`\tconsole.log("(${guards.join(" && ")}) is TRUE");\n`)
        }
        insideOfIf.forEach(element => {
            createIfString.push("\t"+element)
        });
        createIfString.push("}\n")
        return createIfString
    }

    createAndOpenThread( uid: number,insideThreadCode:string[]): string[] {
        let threadCode:string[] = []
        threadCode = [...threadCode,`async function thread${uid}(){
            `]
        if (this.isDebug){
            threadCode.push(`\tconsole.log("thread${uid} started");\n`)
        }
        for (let i = 0; i < insideThreadCode.length; i++) {
            threadCode = [...threadCode, "\t" + insideThreadCode[i]];
        }
        threadCode = [...threadCode,`}\n`]
        threadCode = [...threadCode, `thread${uid}();\n`]
        return threadCode
    }
    createQueue( queueUID: number): string[] {
        return [`var queue${queueUID} = [];\n`]
    }
    createLockingQueue( typeName: string, queueUID: number): string[] {
        return [`var queue${queueUID} = [];\n`]
    }
    receiveFromQueue( queueUID: number, typeName: string, varName: string): string[] {
        return [`{\n`,`${varName} = queue${queueUID}.pop();\n`,`\twhile (${varName} == undefined){\n`,`\t\tawait new Promise(resolve => setTimeout(resolve, 100));\n`,`\t\t${varName} = queue${queueUID}.pop();\n`,`\t}\n`,`}\n`]

    }
    sendToQueue( queueUID: number, typeName: string, varName: string): string[] {
        return [`queue${queueUID}.push(${varName});\n`]
    }
    createSynchronizer( synchUID: number): string[] {
        return [`var sync${synchUID} = [];\n`]
    }
    activateSynchronizer( synchUID: number): string[] {
        return [`sync${synchUID}.push(42);\n`]
    }
    waitForSynchronizer( synchUID: number): string[] {
        return [`{\n`,`\tfakeVar${synchUID} = sync${synchUID}.pop();\n`,`\twhile (fakeVar${synchUID} == undefined){\n`,`\t\tawait new Promise(resolve => setTimeout(resolve, 100));\n`,`\t\tfakeVar${synchUID} = sync${synchUID}.pop();\n`,`\t}\n`,`}\n`]

    }
    createLoop( uid:number, insideLoop: string[]): string[] {
        let res = []
        res.push(`var flag${uid} = true;\n`)
        res.push(`while(flag${uid}){\n`)
        res.push(`\tflag${uid} = false;\n`)
        for (let i = 0; i < insideLoop.length; i++) {
            res.push("\t"+insideLoop[i])
        }
        res.push(`}\n`)
        return res
    }

    setLoopFlag( uid:number): string[] {
        return [`flag${uid} = true;\n`]
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
        return [`sigma.set("${varName}", undefined);\n`]
    }
    setVarFromGlobal( type: string, varName: string, value: string): string[] {
        return [`${varName} = sigma.get("${value}");\n`]
    }
    setGlobalVar( type: string, varName: string, value: string): string[] {
        return [`sigma.set("${varName}", ${value});\n`]
    }
    operation( varName: string, n1: string, op: string, n2: string): string[] {
        return [varName + " = " + n1 + " " + op + " " + n2 + ";\n"]
    }
    createSleep( duration: string): string[] {
        return ["await new Promise(resolve => setTimeout(resolve, " + duration + "));\n"]
    }
}