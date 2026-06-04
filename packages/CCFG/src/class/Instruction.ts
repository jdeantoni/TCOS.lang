import { integer } from "vscode-languageclient";

export class Instruction{
    readonly $instructionType: string = "";
    constructor(type: string){
        this.$instructionType = type;
    }

    toString(): string { return "undefined instruction"; }
}

export class ReturnInstruction extends Instruction{
    varName: string = "";
    constructor(varName: string){
        super("returnInstruction");
        this.varName = varName;
    }

    toString(): string { return "return,"+this.varName; }
}

export class CreateVarInstruction extends Instruction{
    varName: string = "";
    type: string = "";
    constructor(name: string, type: string){
        super("createVarInstruction");
        this.varName = name;
        this.type = type;
    }

    toString(): string { return "createVar,"+this.type+","+this.varName; }
}

export class CreateGlobalVarInstruction extends Instruction{
    varName: string = "";
    type: string = "";
    constructor(name: string, type: string){
        super("createGlobalVarInstruction");
        this.varName = name;
        this.type = type;
    }

    toString(): string { return "createGlobalVar,"+this.type+","+this.varName; }
}

export class CreateEventChannelInstruction extends Instruction {
    channelName: string = ""
    listenerCount: integer = 0
    payloadKind: string = ""
    constructor(name: string, listenerCount: integer, payloadKind: string) {
        super("createEventChannelInstruction")
        this.channelName = name
        this.listenerCount = listenerCount
        this.payloadKind = payloadKind
    }
    toString(): string {
        return "createEventChannel,"+this.channelName+","+this.listenerCount+","+this.payloadKind
    }
}

export class EmitEventInstruction extends Instruction {
    channelName: string = ""
    payload: string = ""
    awaitAcks: boolean = true
    constructor(name: string, payload: string, awaitAcks: boolean = true) {
        super("emitEventInstruction")
        this.channelName = name
        this.payload = payload
        this.awaitAcks = awaitAcks
    }
    toString(): string {
        return "emitEvent,"+this.channelName+","+this.payload+","+this.awaitAcks
    }
}

export class WaitEventInstruction extends Instruction {
    channelName: string = ""
    outPayload: string = ""
    constructor(name: string, outPayload: string) {
        super("waitEventInstruction")
        this.channelName = name
        this.outPayload = outPayload
    }
    toString(): string {
        return "waitEvent,"+this.channelName+","+this.outPayload
    }
}

export class AckEventInstruction extends Instruction {
    token: string = ""
    constructor(token: string) {
        super("ackEventInstruction")
        this.token = token
    }
    toString(): string {
        return "ackEvent,"+this.token
    }
}

export class AssignVarInstruction extends Instruction{
    value: string = "";
    varName: string = "";
    type: string = "";
    constructor( varName: string,value:string,type: string = ""){
        super("assignVarInstruction");
        this.value = value;
        this.varName = varName;
        this.type = type;
    }

    toString(): string { return "assignVar,"+this.varName+","+this.value; }
}

export class SetVarFromGlobalInstruction extends Instruction{
    varName: string = "";
    globalVarName: string = "";
    type: string = "";
    constructor(name: string, globalVarName: string,type: string = ""){
        super("setVarFromGlobalInstruction");
        this.varName = name;
        this.globalVarName = globalVarName;
        this.type = type;
    }

    toString(): string {
        return "setVarFromGlobal,"+this.type+","+this.varName+","+this.globalVarName
    }
}

export class SetGlobalVarInstruction extends Instruction{
    globalVarName: string = "";
    value: string = "";
    type: string = "";
    constructor(globalVarName: string, value: string,type: string = ""){
        super("setGlobalVarInstruction");
        this.value = value;
        this.globalVarName = globalVarName;
        this.type = type;
    }

    toString(): string {
        return "setGlobalVar,"+this.type+","+this.globalVarName+","+this.value;
    }
}

export class OperationInstruction extends Instruction{
    varName: string = "";
    n1: string = "";
    op: string = "";
    n2: string = "";
    type: string = "";
    constructor(varName: string, n1: string, op: string, n2: string,type: string = ""){
        super("operationInstruction");
        this.varName = varName;
        this.n1 = n1;
        this.op = op;
        this.n2 = n2;
        this.type = type;
    }

    toString(): string {
        return "operation,"+this.varName+","+this.n1+","+this.op+","+this.n2;
    }
}

export class VerifyEqualInstruction extends Instruction{
    n1: string = "";
    n2: string = "";
    constructor(n1: string, n2: string){
        super("verifyEqualInstruction");
        this.n1 = n1;
        this.n2 = n2;
    }

    toString(): string { return "verifyEqual,"+this.n1+","+this.n2; }
}

export class AddSleepInstruction extends Instruction{
    duration: string = "";
    constructor(duration: string){
        super("addSleepInstruction");
        this.duration = duration;
    }

    toString(): string { return "addSleep,"+this.duration; }
}

export class TypedElement {
    name: string = "";
    type: (string | undefined) = undefined;
    
    toString(): string {
        return (this.type == undefined ? "undefined" : this.type)+" "+ this.name;
    }
}