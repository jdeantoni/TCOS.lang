import { snapshotNode } from "./graph-utils.js";
import type { InterpreterRuntimeState } from "./state.js";
import type * as types from "./types.js";
import { decodeVariablesReference, encodeVariablesReference, mapVariables } from "./variables.js";
import { findThread } from "./thread-queue.js";

export function getCurrentSourceKey(state: InterpreterRuntimeState): string | undefined {
    const thread = (state.executionQueue[state.lastThreadIndex] ?? state.executionQueue[0])?.thread;
    const node = thread?.currentNode;
    if (node === undefined) return undefined;
    if (isStructuralStepNode(node)) return undefined;
    const range = (node.astNode as any)?.$cstNode?.range;
    if (range === undefined) return undefined;
    return `${range.start.line}`;
}

export function isStructuralStepNode(node: { type?: unknown; getType?: () => string }): boolean {
    return node.type === "starts"
        || node.type === "terminates"
        || node.getType?.() === "starts"
        || node.getType?.() === "terminates";
}

export function getThreads(state: InterpreterRuntimeState): types.ThreadSnapshot[] {
    return state.executionQueue.map(entry => ({
        ...entry.thread.snapshot(),
        readyAt: entry.readyAt
    }));
}

export function getCurrentThread(state: InterpreterRuntimeState): types.ThreadSnapshot | undefined {
    const thread = (state.executionQueue[state.lastThreadIndex] ?? state.executionQueue[0])?.thread;
    return thread?.snapshot();
}

export function getCurrentNode(state: InterpreterRuntimeState): types.NodeSnapshot | undefined {
    const thread = (state.executionQueue[state.lastThreadIndex] ?? state.executionQueue[0])?.thread;
    return thread?.currentNode === undefined ? undefined : snapshotNode(thread.currentNode);
}

export function getSnapshot(state: InterpreterRuntimeState): types.InterpreterSnapshot {
    const snapshot: types.InterpreterSnapshot = {
        status: state.status,
        stepCount: state.stepCount,
        threads: getThreads(state),
        globals: {
            ...Object.fromEntries(state.sigma),
            __T: state.T,
            __sleeping: state.executionQueue.filter(entry => entry.readyAt.t > state.T).length
        }
    };
    const currentThread = getCurrentThread(state);
    const currentNode = getCurrentNode(state);
    if (currentThread !== undefined) snapshot.currentThread = currentThread;
    if (currentNode !== undefined) snapshot.currentNode = currentNode;
    if (state.lastEvent !== undefined) snapshot.lastEvent = state.lastEvent;
    if (state.lastError !== undefined) snapshot.lastError = state.lastError;
    return snapshot;
}

export function getStackTrace(state: InterpreterRuntimeState, threadId: number): types.StackFrame[] {
    const thread = findThread(state, threadId);
    if (thread === undefined) return [];
    const node = thread.currentNode === undefined ? undefined : snapshotNode(thread.currentNode);
    const frame: types.StackFrame = {
        id: thread.id,
        threadId: thread.id,
        name: node === undefined ? `Thread ${thread.id}` : `${node.type} ${node.uid}`
    };
    if (node !== undefined) frame.node = node;
    if (node?.source !== undefined) frame.source = node.source;
    return [frame];
}

export function getScopes(state: InterpreterRuntimeState, threadId: number): types.ScopeSnapshot[] {
    if (findThread(state, threadId) === undefined) return [];
    return [
        { name: "locals", variablesReference: encodeVariablesReference(threadId, "locals"), expensive: false },
        { name: "globals", variablesReference: encodeVariablesReference(threadId, "globals"), expensive: false },
        { name: "temporaries", variablesReference: encodeVariablesReference(threadId, "temporaries"), expensive: false }
    ];
}

export function getVariables(state: InterpreterRuntimeState, variablesReference: number): types.VariableSnapshot[] {
    const decoded = decodeVariablesReference(variablesReference);
    if (decoded === undefined) return [];
    const thread = findThread(state, decoded.threadId);
    if (decoded.scope === "globals") {
        return [
            ...mapVariables(state.sigma, state.sigmaNameMap),
            { name: "__T", value: state.T, type: "number", variablesReference: 0 },
            { name: "__sleeping", value: state.executionQueue.filter(entry => entry.readyAt.t > state.T).length, type: "number", variablesReference: 0 }
        ];
    }
    if (thread === undefined) return [];
    if (decoded.scope === "locals") return mapVariables(thread.locals);
    return thread.tempValues.map((value, index) => ({
        name: `[${index}]`,
        value,
        type: typeof value,
        variablesReference: 0
    }));
}

export function result(state: InterpreterRuntimeState, reason?: types.PauseReason | "thread-end", error?: unknown): types.StepResult {
    const currentThread = getCurrentThread(state);
    const currentNode = getCurrentNode(state);
    const stepResult: types.StepResult = {
        status: state.status,
        stepCount: state.stepCount
    };
    if (reason !== undefined && reason !== "thread-end") stepResult.reason = reason;
    if (currentThread !== undefined) stepResult.currentThread = currentThread;
    if (currentNode !== undefined) stepResult.currentNode = currentNode;
    if (state.lastEvent !== undefined) stepResult.event = state.lastEvent;
    if (error !== undefined) stepResult.error = error;
    return stepResult;
}

export function getDebugState(state: InterpreterRuntimeState, phase: string): Record<string, unknown> {
    const currentThread = getCurrentThread(state);
    const currentNode = getCurrentNode(state);
    return {
        phase,
        status: state.status,
        T: state.T,
        stepCount: state.stepCount,
        currentThreadId: currentThread?.id,
        currentNodeUid: currentNode?.uid,
        currentNodeType: currentNode?.type,
        queue: state.executionQueue.map(entry => ({
            threadId: entry.thread.id,
            nodeUid: entry.thread.currentNode?.uid,
            nodeType: entry.thread.currentNode?.getType(),
            instructionIndex: entry.thread.currentInstructionIndex,
            readyAt: entry.readyAt,
            waitingEvent: entry.waitingEvent,
            locals: Object.fromEntries(entry.thread.locals)
        })),
        globals: Object.fromEntries(state.sigma)
    };
}
