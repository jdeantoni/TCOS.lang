import * as ccfg from "ccfg";
import { evaluateExpression, resolveValue } from "./evaluation.js";
import { firstTarget } from "./graph-utils.js";
import type { RuntimeThread } from "./runtime.js";
import type { InterpreterRuntimeState } from "./state.js";
import { ackEvent, createEventChannel, emitEventDiscrete, waitEventDiscrete } from "./event-runtime.js";
import { endThread, setThreadReadyAt } from "./thread-queue.js";

interface InstructionResult {
    didReturn: boolean;
    suspended?: boolean;
    completed?: boolean;
    value?: unknown;
}

export async function executeNodeInstructions(
    state: InterpreterRuntimeState,
    thread: RuntimeThread,
    node: ccfg.Node
): Promise<InstructionResult> {
    if (state.debug && node.functionsDefs.length > 0) {
        state.lastEvent = {
            kind: "node",
            threadId: thread.id,
            nodeUid: node.uid,
            data: { functions: node.functionsNames, instructions: node.functionsDefs.map(i => i.toString()) }
        };
    }

    if (node.functionsDefs.length === 0) return { didReturn: false, completed: true };

    if (thread.currentInstructionIndex === undefined) {
        thread.currentInstructionIndex = 0;
        bindParameters(thread, node.params);
    }

    const instructionIndex = thread.currentInstructionIndex;
    const instruction = node.functionsDefs[instructionIndex];
    if (instruction === undefined) {
        thread.currentInstructionIndex = undefined;
        return { didReturn: false, completed: true };
    }

    const returned = await executeInstruction(state, thread, instruction, node, instructionIndex);
    if (returned.didReturn) {
        thread.currentInstructionIndex = undefined;
        thread.tempValues.push(returned.value);
        return { didReturn: true, completed: true };
    }
    if (returned.suspended) {
        return { didReturn: false, suspended: true };
    }

    thread.currentInstructionIndex = instructionIndex + 1;
    if (thread.currentInstructionIndex >= node.functionsDefs.length) {
        thread.currentInstructionIndex = undefined;
        return { didReturn: false, completed: true };
    }
    return { didReturn: false, completed: false };
}

function bindParameters(thread: RuntimeThread, params: ccfg.TypedElement[]): void {
    for (let index = params.length - 1; index >= 0; index--) {
        const param = params[index];
        if (param !== undefined) {
            thread.locals.set(param.name, thread.tempValues.pop());
        }
    }
}

async function executeInstruction(
    state: InterpreterRuntimeState,
    thread: RuntimeThread,
    instruction: ccfg.Instruction,
    node: ccfg.Node,
    instructionIndex: number
): Promise<InstructionResult> {
    if (state.debug) console.log("EXEC", instruction.constructor.name);
    if (instruction instanceof ccfg.CreateVarInstruction) {
        thread.locals.set(instruction.varName, undefined);
        return { didReturn: false };
    }
    if (instruction instanceof ccfg.AssignVarInstruction) {
        thread.locals.set(instruction.varName, evaluateExpression(instruction.value, thread, state.sigma));
        return { didReturn: false };
    }
    if (instruction instanceof ccfg.CreateGlobalVarInstruction) {
        state.sigma.set(instruction.varName, undefined);
        return { didReturn: false };
    }
    if (instruction instanceof ccfg.SetVarFromGlobalInstruction) {
        thread.locals.set(instruction.varName, state.sigma.get(instruction.globalVarName));
        return { didReturn: false };
    }
    if (instruction instanceof ccfg.SetGlobalVarInstruction) {
        state.sigma.set(instruction.globalVarName, evaluateExpression(instruction.value, thread, state.sigma));
        return { didReturn: false };
    }
    if (instruction instanceof ccfg.OperationInstruction) {
        const value = evaluateExpression(`${instruction.n1} ${instruction.op} ${instruction.n2}`, thread, state.sigma);
        thread.locals.set(instruction.varName, value);
        return { didReturn: false };
    }
    if (instruction instanceof ccfg.ReturnInstruction) {
        return { didReturn: true, value: resolveValue(instruction.varName, thread, state.sigma) };
    }

    if (instruction instanceof ccfg.AddSleepInstruction) {
        const duration = Number(evaluateExpression(instruction.duration, thread, state.sigma));
        const wakeAt = state.T + duration;
        const nextNode = firstTarget(node);

        state.lastEvent = {
            kind: "sleep",
            threadId: thread.id,
            message: `sleep ${duration} -> wakeup at T=${wakeAt}`
        };

        if (nextNode !== undefined) {
            thread.currentNode = nextNode;
            thread.currentInstructionIndex = undefined;
            setThreadReadyAt(state, thread, wakeAt);
        } else {
            endThread(state, thread);
        }

        return { didReturn: false, suspended: true };
    }

    if (instruction instanceof ccfg.CreateEventChannelInstruction) {
        createEventChannel(state, instruction);
        return { didReturn: false };
    }
    if (instruction instanceof ccfg.EmitEventInstruction) {
        emitEventDiscrete(state, instruction, thread);
        return { didReturn: false };
    }
    if (instruction instanceof ccfg.WaitEventInstruction) {
        const suspended = waitEventDiscrete(state, instruction, thread, node);
        if (suspended) {
            thread.currentInstructionIndex = instructionIndex;
        }
        return { didReturn: false, suspended };
    }
    if (instruction instanceof ccfg.AckEventInstruction) {
        ackEvent(state, instruction, thread);
        return { didReturn: false };
    }

    throw new Error(`Unsupported instruction: ${instruction.$instructionType || instruction.toString()}`);
}
