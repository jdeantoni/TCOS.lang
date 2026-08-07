import { getCurrentSourceKey, getDebugState, result } from "./debug-state.js";
import { visitNode } from "./node-dispatch.js";
import type { InterpreterRuntimeState } from "./state.js";
import type * as types from "./types.js";
import { advanceTime, hasRunnableThread, hasScheduledThread, nextRunnableThreadIndex, removeThreadAt, runnableThreadIndex } from "./thread-queue.js";

export async function resume(state: InterpreterRuntimeState, options: types.RunOptions = {}): Promise<types.StepResult> {
    if (state.status === "terminated" || state.status === "stopped") {
        return result(state, state.status === "terminated" ? "terminated" : "stopped");
    }
    if (state.status === "idle") {
        state.status = "ready";
    }

    state.status = "running";
    const maxSteps = options.maxSteps ?? state.maxSteps;
    const timeoutMs = options.timeoutMs ?? state.timeoutMs;
    const ignoreBreakpoints = options.ignoreBreakpoints ?? false;

    while (state.status === "running") {
        if (maxSteps !== undefined && state.stepCount >= maxSteps) {
            state.status = "paused";
            return result(state, "maxSteps");
        }

        if (timeoutMs !== undefined && state.T >= timeoutMs) {
            state.status = "paused";
            return result(state, "timeout");
        }

        const stepResult = await advanceOne(state, { ignoreBreakpoints }, false);
        if (stepResult.status !== "running") {
            return stepResult;
        }
    }

    return result(state);
}

export async function step(state: InterpreterRuntimeState, options: types.RunOptions = {}): Promise<types.StepResult> {
    const stepResult = await stepOver(state, options);
    return stepResult;
}

export async function stepOver(state: InterpreterRuntimeState, options: types.RunOptions = {}): Promise<types.StepResult> {
    const startLine = getCurrentSourceKey(state);
    const startT = state.T;
    const startStepCount = state.stepCount;
    const maxSourceSteps = options.maxSteps ?? state.maxSteps ?? 1000;

    while (true) {
        const stepResult = await advanceOne(state, options, true);
        if (stepResult.status === "terminated" || stepResult.status === "stopped" || stepResult.status === "error") {
            return stepResult;
        }
        if (state.T !== startT) {
            return stepResult;
        }

        if (state.stepCount - startStepCount >= maxSourceSteps) {
            return stepResult;
        }

        const line = getCurrentSourceKey(state);
        console.log("current line :", line);
        console.log("start line : ", startLine);
        if (line === undefined) {
            if (state.executionQueue.length === 0) {
                return stepResult;
            }
            continue;
        }

        if (line !== startLine) {
            return stepResult;
        }

        if (!hasRunnableThread(state) && !hasScheduledThread(state)) {
            return stepResult;
        }
    }
}

export async function stepInto(state: InterpreterRuntimeState, options: types.RunOptions = {}): Promise<types.StepResult> {
    const startNodeUid = getCurrentNodeUid(state);
    const startT = state.T;
    const startStepCount = state.stepCount;
    const maxNodeSteps = options.maxSteps ?? state.maxSteps ?? 1000;

    while (true) {
        const stepResult = await advanceOne(state, options, true);
        if (stepResult.status === "terminated" || stepResult.status === "stopped" || stepResult.status === "error") {
            return stepResult;
        }
        if (state.T !== startT) {
            return stepResult;
        }

        if (state.stepCount - startStepCount >= maxNodeSteps) {
            return stepResult;
        }

        const currentNodeUid = getCurrentNodeUid(state);
        if (currentNodeUid === undefined) {
            if (state.executionQueue.length === 0) {
                return stepResult;
            }
            continue;
        }

        if (currentNodeUid !== startNodeUid) {
            return stepResult;
        }

        if (!hasRunnableThread(state) && !hasScheduledThread(state)) {
            return stepResult;
        }
    }
}

async function advanceOne(
    state: InterpreterRuntimeState,
    options: types.RunOptions,
    stopAfterStep: boolean
): Promise<types.StepResult> {
    if (state.status === "terminated" || state.status === "stopped") {
        return result(state, state.status === "terminated" ? "terminated" : "stopped");
    }
    if (state.status === "idle") {
        state.status = "ready";
    }

    if (state.executionQueue.length === 0) {
        state.status = "terminated";
        //if (state.debug) console.log("[CCFGInterpreter.advanceOne]", getDebugState(state, "advance-terminated-empty"));
        return result(state, "terminated");
    }

    try {
        const preferredThreadIndex = options.threadId === undefined ? -1 : runnableThreadIndex(state, options.threadId);
        const threadIndex = preferredThreadIndex >= 0 ? preferredThreadIndex : nextRunnableThreadIndex(state);
        if (threadIndex < 0) {
            if (hasScheduledThread(state)) {
                advanceTime(state);
                //if (state.debug) console.log("[CCFGInterpreter.advanceOne]", getDebugState(state, "advance-time"));
                return result(state);
            }
            state.status = "paused";
            //if (state.debug) console.log("[CCFGInterpreter.advanceOne]", getDebugState(state, "advance-paused-no-runnable"));
            return result(state, "step");
        }

        state.lastThreadIndex = threadIndex;
        const thread = state.executionQueue[threadIndex]?.thread;
        if (thread === undefined || thread.currentNode === undefined) {
            removeThreadAt(state, threadIndex);
            //if (state.debug) console.log("[CCFGInterpreter.advanceOne]", getDebugState(state, "advance-removed-empty-thread"));
            return result(state, "thread-end");
        }

        const node = thread.currentNode;

        if (!(options.ignoreBreakpoints ?? true)
            && state.breakpoints.has(node.uid)
            && !state.reportedBreakpointUids.has(node.uid)) {
            state.reportedBreakpointUids.add(node.uid);
            state.status = "paused";
            //if (state.debug) console.log("[CCFGInterpreter.advanceOne]", getDebugState(state, "advance-breakpoint"));
            return result(state, "breakpoint");
        }

        state.reportedBreakpointUids.delete(node.uid);
        state.status = "running";
        state.lastEvent = { kind: "node", threadId: thread.id, nodeUid: node.uid, message: node.getType() };
        await visitNode(state, thread, node);
        state.stepCount++;

        if (state.executionQueue.length === 0) {
            state.status = "terminated";
            //if (state.debug) console.log("[CCFGInterpreter.advanceOne]", getDebugState(state, "advance-terminated-after-node"));
            return result(state, "terminated");
        }

        if (stopAfterStep) {
            state.status = "paused";
            return result(state, "step");
        }

        return result(state);
    } catch (error) {
        state.lastError = error;
        state.status = "error";
        //if (state.debug) console.log("[CCFGInterpreter.advanceOne]", { ...getDebugState(state, "advance-error"), error });
        return result(state, "error", error);
    }
}

function getCurrentNodeUid(state: InterpreterRuntimeState): number | undefined {
    const thread = state.executionQueue[state.lastThreadIndex]?.thread ?? state.executionQueue[0]?.thread;
    return thread?.currentNode?.uid;
}
