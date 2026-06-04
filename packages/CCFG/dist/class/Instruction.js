export class Instruction {
    $instructionType = "";
    constructor(type) {
        this.$instructionType = type;
    }
    toString() { return "undefined instruction"; }
}
export class ReturnInstruction extends Instruction {
    varName = "";
    constructor(varName) {
        super("returnInstruction");
        this.varName = varName;
    }
    toString() { return "return," + this.varName; }
}
export class CreateVarInstruction extends Instruction {
    varName = "";
    type = "";
    constructor(name, type) {
        super("createVarInstruction");
        this.varName = name;
        this.type = type;
    }
    toString() { return "createVar," + this.type + "," + this.varName; }
}
export class CreateGlobalVarInstruction extends Instruction {
    varName = "";
    type = "";
    constructor(name, type) {
        super("createGlobalVarInstruction");
        this.varName = name;
        this.type = type;
    }
    toString() { return "createGlobalVar," + this.type + "," + this.varName; }
}
export class CreateEventChannelInstruction extends Instruction {
    channelName = "";
    listenerCount = 0;
    payloadKind = "";
    constructor(name, listenerCount, payloadKind) {
        super("createEventChannelInstruction");
        this.channelName = name;
        this.listenerCount = listenerCount;
        this.payloadKind = payloadKind;
    }
    toString() {
        return "createEventChannel," + this.channelName + "," + this.listenerCount + "," + this.payloadKind;
    }
}
export class EmitEventInstruction extends Instruction {
    channelName = "";
    payload = "";
    awaitAcks = true;
    constructor(name, payload, awaitAcks = true) {
        super("emitEventInstruction");
        this.channelName = name;
        this.payload = payload;
        this.awaitAcks = awaitAcks;
    }
    toString() {
        return "emitEvent," + this.channelName + "," + this.payload + "," + this.awaitAcks;
    }
}
export class WaitEventInstruction extends Instruction {
    channelName = "";
    outPayload = "";
    constructor(name, outPayload) {
        super("waitEventInstruction");
        this.channelName = name;
        this.outPayload = outPayload;
    }
    toString() {
        return "waitEvent," + this.channelName + "," + this.outPayload;
    }
}
export class AckEventInstruction extends Instruction {
    token = "";
    constructor(token) {
        super("ackEventInstruction");
        this.token = token;
    }
    toString() {
        return "ackEvent," + this.token;
    }
}
export class AssignVarInstruction extends Instruction {
    value = "";
    varName = "";
    type = "";
    constructor(varName, value, type = "") {
        super("assignVarInstruction");
        this.value = value;
        this.varName = varName;
        this.type = type;
    }
    toString() { return "assignVar," + this.varName + "," + this.value; }
}
export class SetVarFromGlobalInstruction extends Instruction {
    varName = "";
    globalVarName = "";
    type = "";
    constructor(name, globalVarName, type = "") {
        super("setVarFromGlobalInstruction");
        this.varName = name;
        this.globalVarName = globalVarName;
        this.type = type;
    }
    toString() {
        return "setVarFromGlobal," + this.type + "," + this.varName + "," + this.globalVarName;
    }
}
export class SetGlobalVarInstruction extends Instruction {
    globalVarName = "";
    value = "";
    type = "";
    constructor(globalVarName, value, type = "") {
        super("setGlobalVarInstruction");
        this.value = value;
        this.globalVarName = globalVarName;
        this.type = type;
    }
    toString() {
        return "setGlobalVar," + this.type + "," + this.globalVarName + "," + this.value;
    }
}
export class OperationInstruction extends Instruction {
    varName = "";
    n1 = "";
    op = "";
    n2 = "";
    type = "";
    constructor(varName, n1, op, n2, type = "") {
        super("operationInstruction");
        this.varName = varName;
        this.n1 = n1;
        this.op = op;
        this.n2 = n2;
        this.type = type;
    }
    toString() {
        return "operation," + this.varName + "," + this.n1 + "," + this.op + "," + this.n2;
    }
}
export class VerifyEqualInstruction extends Instruction {
    n1 = "";
    n2 = "";
    constructor(n1, n2) {
        super("verifyEqualInstruction");
        this.n1 = n1;
        this.n2 = n2;
    }
    toString() { return "verifyEqual," + this.n1 + "," + this.n2; }
}
export class AddSleepInstruction extends Instruction {
    duration = "";
    constructor(duration) {
        super("addSleepInstruction");
        this.duration = duration;
    }
    toString() { return "addSleep," + this.duration; }
}
export class TypedElement {
    name = "";
    type = undefined;
    toString() {
        return (this.type == undefined ? "undefined" : this.type) + " " + this.name;
    }
}
