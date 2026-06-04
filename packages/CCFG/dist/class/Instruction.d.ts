import { integer } from "vscode-languageclient";
export declare class Instruction {
    readonly $instructionType: string;
    constructor(type: string);
    toString(): string;
}
export declare class ReturnInstruction extends Instruction {
    varName: string;
    constructor(varName: string);
    toString(): string;
}
export declare class CreateVarInstruction extends Instruction {
    varName: string;
    type: string;
    constructor(name: string, type: string);
    toString(): string;
}
export declare class CreateGlobalVarInstruction extends Instruction {
    varName: string;
    type: string;
    constructor(name: string, type: string);
    toString(): string;
}
export declare class CreateEventChannelInstruction extends Instruction {
    channelName: string;
    listenerCount: integer;
    payloadKind: string;
    constructor(name: string, listenerCount: integer, payloadKind: string);
    toString(): string;
}
export declare class EmitEventInstruction extends Instruction {
    channelName: string;
    payload: string;
    awaitAcks: boolean;
    constructor(name: string, payload: string, awaitAcks?: boolean);
    toString(): string;
}
export declare class WaitEventInstruction extends Instruction {
    channelName: string;
    outPayload: string;
    constructor(name: string, outPayload: string);
    toString(): string;
}
export declare class AckEventInstruction extends Instruction {
    token: string;
    constructor(token: string);
    toString(): string;
}
export declare class AssignVarInstruction extends Instruction {
    value: string;
    varName: string;
    type: string;
    constructor(varName: string, value: string, type?: string);
    toString(): string;
}
export declare class SetVarFromGlobalInstruction extends Instruction {
    varName: string;
    globalVarName: string;
    type: string;
    constructor(name: string, globalVarName: string, type?: string);
    toString(): string;
}
export declare class SetGlobalVarInstruction extends Instruction {
    globalVarName: string;
    value: string;
    type: string;
    constructor(globalVarName: string, value: string, type?: string);
    toString(): string;
}
export declare class OperationInstruction extends Instruction {
    varName: string;
    n1: string;
    op: string;
    n2: string;
    type: string;
    constructor(varName: string, n1: string, op: string, n2: string, type?: string);
    toString(): string;
}
export declare class VerifyEqualInstruction extends Instruction {
    n1: string;
    n2: string;
    constructor(n1: string, n2: string);
    toString(): string;
}
export declare class AddSleepInstruction extends Instruction {
    duration: string;
    constructor(duration: string);
    toString(): string;
}
export declare class TypedElement {
    name: string;
    type: (string | undefined);
    toString(): string;
}
