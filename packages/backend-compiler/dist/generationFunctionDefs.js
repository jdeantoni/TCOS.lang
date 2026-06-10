import { CreateEventChannelInstruction, EmitEventInstruction, WaitEventInstruction, AckEventInstruction, AddSleepInstruction, AssignVarInstruction, CreateGlobalVarInstruction, CreateVarInstruction, Instruction, OperationInstruction, ReturnInstruction, SetGlobalVarInstruction, SetVarFromGlobalInstruction } from "ccfg";
export function compileFunctionDefs(ccfg, generator, debug) {
    let res = [];
    for (const node of ccfg.nodes) {
        if (!debug && node.functionsDefs.length == 0) {
            continue;
        }
        if (node.returnType != undefined) {
            if (node.functionsDefs[0] instanceof Instruction) {
                for (const fname of node.functionsNames) {
                    let allFDefs = [];
                    for (const fdef of node.functionsDefs) {
                        if (fdef instanceof ReturnInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.returnVar(b.varName)];
                        }
                        else if (fdef instanceof CreateVarInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.createVar(b.type, b.varName)];
                        }
                        else if (fdef instanceof AssignVarInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.assignVar(b.varName, b.value)];
                        }
                        else if (fdef instanceof SetVarFromGlobalInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.setVarFromGlobal(b.type, b.varName, b.globalVarName)];
                        }
                        else if (fdef instanceof CreateGlobalVarInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.createGlobalVar(b.type, b.varName)];
                        }
                        else if (fdef instanceof SetGlobalVarInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.setGlobalVar(b.type, b.globalVarName, b.value)];
                        }
                        else if (fdef instanceof OperationInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.operation(b.varName, b.n1, b.op, b.n2)];
                        }
                        else if (fdef instanceof AddSleepInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.createSleep(b.duration)];
                        }
                        else if (fdef instanceof CreateEventChannelInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.createEventChannel(b.channelName, b.listenerCount, b.payloadKind)];
                        }
                        else if (fdef instanceof EmitEventInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.emitEvent(b.channelName, b.payload, b.awaitAcks)];
                        }
                        else if (fdef instanceof WaitEventInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.waitEvent(b.channelName, b.outPayload)];
                        }
                        else if (fdef instanceof AckEventInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.ackEvent(b.token)];
                        }
                        else {
                            console.log("Unknown function definition: " + fdef.$instructionType + " pop" + fdef.toString());
                            allFDefs = [...allFDefs, fdef.toString()];
                        }
                    }
                    res = [...res, ...generator.createFunction(fname, node.params, node.returnType, allFDefs)];
                }
            }
        }
    }
    return res;
}
