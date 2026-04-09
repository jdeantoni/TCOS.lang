import { IGenerator } from "./GeneratorInterface.js";
import { TypedElement } from "ccfg";


export class PythonGenerator implements IGenerator {
    debug: boolean;

    constructor(debug: boolean = false) {
        this.debug = debug;
    }
    setDebug(debug: boolean): void {
        this.debug = debug;
    }
    
    // goToFlag(codeFile: CompositeGeneratorNode, queueUID: number): string[] {
    //     throw new Error("Method not implemented.");
    // }
    
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
        res.push(`from queue import Queue\n`)
        res.push(`from dataclasses import dataclass\n`)
        
        // global variables ---------------------------------------------------------------------------------------
        res.push(`\n\n`) 
        res.push(`@dataclass()\n`)
        res.push(`class EventChannel:\n`)
        res.push(`\tlistener_count: int\n`)
        res.push(`\tpayload_kind: str\n`)
        res.push(`\tqueue: Queue[tuple[object, int]]\n`)
        res.push(`\tnext_token: int\n`)
        res.push(`\tpending_acks: dict[int, int]\n`)
        res.push(`\n`)
        res.push(`sigma: dict[str, object] = {}\n`)
        res.push(`sigma_mutex = threading.Lock()\n`) 
        res.push(`event_channels: dict[str, EventChannel] = {}\n`)
        res.push(`event_token_to_channel: dict[int, str] = {}\n`)
        res.push(`event_mutex = threading.Lock()\n`)
        res.push(`com_last_event_token = None # seems weak\n`)
        res.push(`\n`)
        res.push(`def com_create_event_channel(name: str, listener_count: int, payload_kind: str) -> None:\n`)
        res.push(`\twith event_mutex:\n`)
        res.push(`\t\tif name in event_channels:\n`)
        res.push(`\t\t\treturn\n`)
        res.push(`\t\tevent_channels[name] = EventChannel(\n`)
        res.push(`\t\t\t\t\t\t\t\tlistener_count=listener_count,\n`)
        res.push(`\t\t\t\t\t\t\t\tpayload_kind=payload_kind,\n`)
        res.push(`\t\t\t\t\t\t\t\tqueue=Queue(),\n`)
        res.push(`\t\t\t\t\t\t\t\tnext_token=1,\n`)
        res.push(`\t\t\t\t\t\t\t\tpending_acks={}\n`)
        res.push(`\t\t\t\t\t\t\t)\n`)
        res.push(`\t\n`)
        res.push(`\n`)
        res.push(`def com_get_event_channel(name: str) -> EventChannel:\n`)
        res.push(`\tif name not in event_channels:\n`)
        res.push(`\t\traise RuntimeError(f"Unknown event channel: {name}")\n`)
        res.push(`\treturn event_channels[name]\n`)
        res.push(`\n`)
        res.push(`def com_emit_event(name: str, payload:object, await_acks: bool) -> None:\n`)
        res.push(`\tchannel: EventChannel = com_get_event_channel(name)\n`)
        res.push(`\twith event_mutex:\n`)
        res.push(`\t\ttoken = channel.next_token\n`)
        res.push(`\t\tchannel.next_token += 1\n`)
        res.push(`\t\texpected_acks: int = channel.listener_count if await_acks else 0\n`)
        res.push(`\t\tif expected_acks > 0:\n`)
        res.push(`\t\t\tchannel.pending_acks[token] = expected_acks\n`)
        res.push(`\t\t\tevent_token_to_channel[token] = name\n`)
        res.push(`\tchannel.queue.put((payload, token))\n`)
        res.push(`\t#should it be built-in or a TCOS semantic result ?\n`)
        res.push(`\tif await_acks:\n`)
        res.push(`\t\tremaining: int = channel.pending_acks.get(token, 0)\n`)
        res.push(`\t\twhile remaining > 0:\t\n`)
        res.push(`\t\t\tremaining = channel.pending_acks.get(token, 0)\t\n`)
        res.push(`\t\t\ttime.sleep(0.01)\n`)
        res.push(`\t\t\n`)
        res.push(`\t\twith event_mutex:\n`)
        res.push(`\t\t\tchannel.pending_acks.pop(token, None)\n`)
        res.push(`\t\t\tevent_token_to_channel.pop(token, None)\n`)
        res.push(`\n`)
        res.push(`def com_wait_event(name:str)-> tuple[object, int]:\n`)
        res.push(`\tchannel: EventChannel = com_get_event_channel(name)\n`)
        res.push(`\treturn channel.queue.get(block=True)\n`)
        res.push(`\n`)
        res.push(`def com_ack_event(token: int) -> None:\n`)
        res.push(`\twith event_mutex:\n`)
        res.push(`\t\tchannel_name: str|None = event_token_to_channel.get(token)\n`)
        res.push(`\t\tif channel_name is None:\n`)
        res.push(`\t\t\treturn\n`)
        res.push(`\t\tchannel: EventChannel = com_get_event_channel(channel_name)\n`)
        res.push(`\t\tremaining = channel.pending_acks.get(token, 0) - 1\n`)
        res.push(`\t\tif remaining <= 0:\n`)
        res.push(`\t\t\tchannel.pending_acks.pop(token, None)\n`)
        res.push(`\t\t\tevent_token_to_channel.pop(token, None)\n`)
        res.push(`\t\telse:\n`)
        res.push(`\t\t\tchannel.pending_acks[token] = remaining\n`)
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
            return [`function${fname}(${params.join(", ")}) \n`]
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
        res = [...res, ...[`thread${uid} = threading.Thread(target=codeThread${uid}) \n`,`thread${uid}.start() \n`]]
        return res
    }
    endThread( uid: number): string[] {
        return [`return \n`];
    }
    endSection(): void {
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

    createEventChannel(channelName: string, listenerCount: number, payloadKind: string): string[] {
        return [`com_create_event_channel(${JSON.stringify(channelName)}, ${listenerCount}, ${JSON.stringify(payloadKind)}) \n`];
    }

    emitEvent(channelName: string, payload: string, awaitAcks: boolean = false): string[] {
        return [`com_emit_event(${JSON.stringify(channelName)}, ${payload}, ${awaitAcks ? "True" : "False"}) \n`];
    }

    waitEvent(channelName: string, outPayload: string): string[] {
        return [`global com_last_event_token\n`,`(${outPayload}, com_last_event_token) = com_wait_event(${JSON.stringify(channelName)}) \n`,`${channelName}Token = com_last_event_token \n`];
    }

    ackEvent(token: string): string[] {
        return [`com_ack_event(${token}) \n`];
    }
}