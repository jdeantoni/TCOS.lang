import type * as ccfg from "ccfg";
import { RuntimeThread } from "./runtime.js";
import type { ExecutionQueueEntry, InterpreterRuntimeState } from "./state.js";

export function advanceTime(state: InterpreterRuntimeState): boolean {
    const nextT = Math.min(...state.executionQueue
        .map(entry => entry.readyAt)
        .filter(t => t > state.T));
    if (!Number.isFinite(nextT)) return false;
    state.T = nextT;
    state.clock.advanceTo(nextT);

    for (const entry of state.executionQueue) {
        if (entry.readyAt === state.T) {
            entry.readyAt = 0;
            state.lastEvent = {
                kind: "sleep",
                threadId: entry.thread.id,
                message: `wakeup at T=${state.T}`
            };
        }
    }
    sortExecutionQueue(state);
    return true;
}

export function getSleepingThreads(state: InterpreterRuntimeState): Array<{ t: number; threadId: number; nodeUid: number }> {
    return state.executionQueue.flatMap(entry => {
        const t = entry.readyAt;
        const thread = entry.thread;
        if (t <= state.T) return [];
        if (thread?.currentNode === undefined) return [];
        return [{ t, threadId: thread.id, nodeUid: thread.currentNode.uid }];
    });
}

export function createThread(
    state: InterpreterRuntimeState,
    owner: ccfg.Node,
    currentNode: ccfg.Node,
    parentId?: number,
    waitingJoin?: ccfg.Join,
    locals?: Map<string, unknown>
): RuntimeThread {
    return new RuntimeThread(state.nextThreadId++, owner, currentNode, parentId, waitingJoin, locals);
}

export function findThread(state: InterpreterRuntimeState, threadId: number): RuntimeThread | undefined {
    return findQueueEntry(state, threadId)?.thread;
}

export function endThread(state: InterpreterRuntimeState, thread: RuntimeThread): void {
    removeThread(state, thread);
    state.lastEvent = { kind: "thread-end", threadId: thread.id };
    if (thread.currentNode !== undefined) state.lastEvent.nodeUid = thread.currentNode.uid;
}

export function removeThread(state: InterpreterRuntimeState, thread: RuntimeThread): void {
    const index = state.executionQueue.findIndex(entry => entry.thread.id === thread.id);
    if (index >= 0) removeThreadAt(state, index);
}

export function removeThreadAt(state: InterpreterRuntimeState, index: number): void {
    state.executionQueue.splice(index, 1);
    if (state.lastThreadIndex >= state.executionQueue.length) {
        state.lastThreadIndex = state.executionQueue.length - 1;
    }
}

export function nextRunnableThreadIndex(state: InterpreterRuntimeState): number {
    const runnable = state.executionQueue.filter(entry => isRunnable(state, entry));
    if (runnable.length === 0) return -1;
    const selected = state.scheduler.nextThread(runnable.map(entry => entry.thread), lastRunnableIndex(state, runnable));
    const entry = runnable[selected];
    if (entry === undefined) return -1;
    return state.executionQueue.findIndex(candidate => candidate.thread.id === entry.thread.id);
}

export function runnableThreadIndex(state: InterpreterRuntimeState, threadId: number): number {
    return state.executionQueue.findIndex(entry => entry.thread.id === threadId && isRunnable(state, entry));
}

export function hasRunnableThread(state: InterpreterRuntimeState): boolean {
    return state.executionQueue.some(entry => isRunnable(state, entry));
}

export function hasScheduledThread(state: InterpreterRuntimeState): boolean {
    return state.executionQueue.some(entry => entry.readyAt > state.T);
}

export function enqueueThread(state: InterpreterRuntimeState, thread: RuntimeThread, readyAt = state.T): void {
    state.executionQueue.push({
        thread,
        readyAt,
        order: state.nextQueueOrder++
    });
    sortExecutionQueue(state);
}

export function findQueueEntry(state: InterpreterRuntimeState, threadId: number): ExecutionQueueEntry | undefined {
    return state.executionQueue.find(entry => entry.thread.id === threadId);
}

export function setThreadReadyAt(state: InterpreterRuntimeState, thread: RuntimeThread, readyAt: number): void {
    const entry = findQueueEntry(state, thread.id);
    if (entry === undefined) return;
    entry.readyAt = readyAt;
    delete entry.waitingEvent;
    sortExecutionQueue(state);
}

export function setThreadWaitingEvent(state: InterpreterRuntimeState, thread: RuntimeThread, channelName: string): void {
    const entry = findQueueEntry(state, thread.id);
    if (entry === undefined) return;
    entry.waitingEvent = channelName;
    entry.readyAt = state.T;
}

export function unblockEventWaiters(state: InterpreterRuntimeState, channelName: string): void {
    for (const entry of state.executionQueue) {
        if (entry.waitingEvent === channelName) {
            delete entry.waitingEvent;
            entry.readyAt = state.T;
        }
    }
    sortExecutionQueue(state);
}

export function sortExecutionQueue(state: InterpreterRuntimeState): void {
    state.executionQueue.sort((left, right) =>
        left.readyAt - right.readyAt || left.order - right.order
    );
}

function lastRunnableIndex(state: InterpreterRuntimeState, runnable: ExecutionQueueEntry[]): number {
    if (state.lastThreadIndex < 0) return -1;
    const lastEntry = state.executionQueue[state.lastThreadIndex];
    if (lastEntry === undefined) return -1;
    return runnable.findIndex(entry => entry.thread.id === lastEntry.thread.id);
}

function isRunnable(state: InterpreterRuntimeState, entry: ExecutionQueueEntry): boolean {
    const thread = entry.thread;
    if (thread.currentNode === undefined) return false;
    if (entry.waitingEvent !== undefined) return false;
    return entry.readyAt <= state.T;
}
