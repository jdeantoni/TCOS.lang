import { TypedElement } from "ccfg";
import { IGenerator } from "./GeneratorInterface.js";


export class JsGenerator implements IGenerator {

    debug: boolean = false;

    setDebug(debug: boolean = false): void {
        this.debug = debug;
    }
    
    nameFile(filename: string): string {
        return `${filename}.js`;
    }
    createBase(): string[] {  
        let res:string[] = []  

        res.push(`
class Void{}
let sigma = new Map();
let eventChannels = new Map();
let eventTokenToChannel = new Map();

function com_create_event_channel(name, listenerCount, payloadKind){
    if (eventChannels.has(name)){
        return;
    }
    eventChannels.set(name, {
        listenerCount: listenerCount,
        payloadKind: payloadKind,
        queue: [],
        nextToken: 1,
        pendingAcks: new Map()
    });
}

function com_get_event_channel(name){
    if (!eventChannels.has(name)){
        throw new Error('Unknown event channel: ' + name);
    }
    return eventChannels.get(name);
}

async function com_emit_event(name, payload, awaitAcks){
    let channel = com_get_event_channel(name);
    let token = channel.nextToken++;
    let expectedAcks = awaitAcks ? channel.listenerCount : 0;
    if (expectedAcks > 0){
        channel.pendingAcks.set(token, expectedAcks);
        eventTokenToChannel.set(token, name);
    }
    channel.queue.push({payload: payload, token: token});

    if (awaitAcks){
        while ((channel.pendingAcks.get(token) || 0) > 0){
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        channel.pendingAcks.delete(token);
        eventTokenToChannel.delete(token);
    }
}

async function com_wait_event(name){
    let channel = com_get_event_channel(name);
    let message = channel.queue.shift();
    while (message == undefined){
        await new Promise(resolve => setTimeout(resolve, 10));
        message = channel.queue.shift();
    }
    return message;
}

function com_ack_event(token){
    let channelName = eventTokenToChannel.get(token);
    if (channelName == undefined){
        return;
    }
    let channel = com_get_event_channel(channelName);
    let remaining = (channel.pendingAcks.get(token) || 0) - 1;
    if (remaining <= 0){
        channel.pendingAcks.delete(token);
        eventTokenToChannel.delete(token);
    } else {
        channel.pendingAcks.set(token, remaining);
    }
}

let com_last_event_token = undefined;

`);// global variables
        return res
    }
    endFile():string[] {
        return [`main();\n`]
    }
    createFunction( fname: string, params: TypedElement[], returnType: string,insideFunction:string[]): string[] {
        let res:string[] = []
        res.push("async function function" + fname + `(${params.map(p => (p as TypedElement).name).join(", ")}){\n`)

        if (this.debug){
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
        if (this.debug){
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
        if (this.debug){
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
        if (this.debug){
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

    createEventChannel(channelName: string, listenerCount: number, payloadKind: string): string[] {
        return [`com_create_event_channel(${JSON.stringify(channelName)}, ${listenerCount}, ${JSON.stringify(payloadKind)});\n`]
    }

    emitEvent(channelName: string, payload: string, awaitAcks: boolean): string[] {
        return [`await com_emit_event(${JSON.stringify(channelName)}, ${payload}, ${awaitAcks});\n`]
    }

    waitEvent(channelName: string, outPayload: string): string[] {
        return [`{\n`,`\tconst com_event = await com_wait_event(${JSON.stringify(channelName)});\n`,`\t${outPayload} = com_event.payload;\n`,`\tcom_last_event_token = com_event.token;\n`,`\t${channelName}Token = com_last_event_token;\n`,`}\n`]
    }

    ackEvent(token: string): string[] {
        return [`com_ack_event(${token});\n`]
    }
}