import type * as ccfg from "ccfg";
import type { Clock, RuntimeThread, Scheduler } from "./runtime.js";

export type InterpreterStatus = "idle" | "ready" | "running" | "paused" | "stopped" | "terminated" | "error";
export type PauseReason = "breakpoint" | "step" | "pause" | "stopped" | "terminated" | "maxSteps" | "timeout" | "error";

export interface CCFGInterpreterOptions {
    debug?: boolean;
    maxSteps?: number;
    timeoutMs?: number;
    scheduler?: Scheduler;
    clock?: Clock;
    stopOnEntry?: boolean;
    prepareCCFG?: boolean;
}

export interface RunOptions {
    maxSteps?: number;
    timeoutMs?: number;
    ignoreBreakpoints?: boolean;
}

export interface StepResult {
    status: InterpreterStatus;
    reason?: PauseReason;
    stepCount: number;
    currentThread?: ThreadSnapshot;
    currentNode?: NodeSnapshot;
    event?: DebugEvent;
    error?: unknown;
}

export interface InterpreterSnapshot {
    status: InterpreterStatus;
    stepCount: number;
    threads: ThreadSnapshot[];
    currentThread?: ThreadSnapshot;
    currentNode?: NodeSnapshot;
    globals: Record<string, unknown>;
    lastEvent?: DebugEvent;
    lastError?: unknown;
}

export interface ThreadSnapshot {
    id: number;
    currentNodeUid?: number;
    ownerUid: number;
    parentId?: number;
    waitingJoinUid?: number;
    tempValues: unknown[];
}

export interface NodeSnapshot {
    uid: number;
    type: string;
    functionNames: string[];
    source?: SourceLocation;
}

export interface SourceLocation {
    uri?: string;
    path?: string;
    line?: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
}

export interface Breakpoint {
    nodeUid: number;
    verified: boolean;
    source?: SourceLocation;
}

export interface StackFrame {
    id: number;
    threadId: number;
    name: string;
    node?: NodeSnapshot;
    source?: SourceLocation;
}

export interface ScopeSnapshot {
    name: "locals" | "globals" | "temporaries";
    variablesReference: number;
    expensive: boolean;
}

export interface VariableSnapshot {
    name: string;
    value: unknown;
    type: string;
    variablesReference: number;
}

export interface DebugEvent {
    kind: "node" | "thread-start" | "thread-end" | "fork" | "join" | "choice" | "sleep" | "event";
    threadId: number;
    nodeUid?: number;
    message?: string;
    data?: unknown;
}

export interface JoinState {
    expected: number;
    arrived: number;
    parentId: number;
    tempValues: unknown[];
}

export interface EventChannel {
    listenerCount: number;
    payloadKind: string;
    queue: Array<{ payload: unknown; token: number }>;
    nextToken: number;
    pendingAcks: Map<number, number>;
}

export type ThreadPicker = (threads: RuntimeThread[], lastThreadIndex: number) => number;
