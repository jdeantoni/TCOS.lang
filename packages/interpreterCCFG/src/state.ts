import type * as ccfg from "ccfg";
import { DiscreteClock, RuntimeThread } from "./runtime.js";
import type * as types from "./types.js";

export interface ExecutionQueueEntry {
    thread: RuntimeThread;
    readyAt: { t: number; microstep: number };
    waitingEvent?: string;
}

export interface InterpreterRuntimeState {
    ccfg: ccfg.CCFG;
    sigma: Map<string, unknown>;
    breakpoints: Set<number>;
    status: types.InterpreterStatus;
    stepCount: number;
    lastEvent: types.DebugEvent | undefined;
    lastError: unknown;
    T: number;
    debug: boolean;
    scheduler: NonNullable<types.CCFGInterpreterOptions["scheduler"]>;
    clock: DiscreteClock;
    maxSteps: number | undefined;
    timeoutMs: number | undefined;
    executionQueue: ExecutionQueueEntry[];
    joinStates: Map<number, types.JoinState>;
    eventChannels: Map<string, types.EventChannel>;
    eventTokenToChannel: Map<number, string>;
    nextThreadId: number;
    lastThreadIndex: number;
    reportedBreakpointUids: Set<number>;
    sigmaNameMap: Map<string, string>;
}

export function createRuntimeState(
    ccfg: ccfg.CCFG,
    options: types.CCFGInterpreterOptions,
    scheduler: NonNullable<types.CCFGInterpreterOptions["scheduler"]>
): InterpreterRuntimeState {
    return {
        ccfg,
        sigma: new Map<string, unknown>(),
        breakpoints: new Set<number>(),
        status: "idle",
        stepCount: 0,
        lastEvent: undefined,
        lastError: undefined,
        T: 0,
        debug: options.debug ?? false,
        scheduler,
        clock: new DiscreteClock(),
        maxSteps: options.maxSteps,
        timeoutMs: options.timeoutMs,
        executionQueue: [],
        joinStates: new Map<number, types.JoinState>(),
        eventChannels: new Map<string, types.EventChannel>(),
        eventTokenToChannel: new Map<number, string>(),
        nextThreadId: 1,
        lastThreadIndex: -1,
        reportedBreakpointUids: new Set<number>(),
        sigmaNameMap: new Map<string, string>()
    };
}
