import * as ccfg from "ccfg";
import { evaluateEdgeGuard } from "./evaluation.js";
import { findFirstReachableJoin, firstTarget } from "./graph-utils.js";
import { executeNodeInstructions } from "./instruction-executor.js";
import type { RuntimeThread } from "./runtime.js";
import type { InterpreterRuntimeState } from "./state.js";
import { createThread, endThread, enqueueThread, removeThread } from "./thread-queue.js";

export async function visitNode(state: InterpreterRuntimeState, thread: RuntimeThread, node: ccfg.Node): Promise<void> {
    if (state.debug) console.log("VISIT", node.uid, node.getType(), node.functionsDefs.map(f => f.constructor.name));
    if (node instanceof ccfg.Fork || node.getType() === "Fork") {
        visitFork(state, thread, node);
        return;
    }
    if (node instanceof ccfg.AndJoin || node.getType() === "AndJoin") {
        await visitAndJoin(state, thread, node as ccfg.AndJoin);
        return;
    }
    if (node instanceof ccfg.OrJoin || node.getType() === "OrJoin") {
        await visitOrJoin(state, thread, node as ccfg.OrJoin);
        return;
    }
    if (node instanceof ccfg.Choice || node.getType() === "Choice") {
        thread.currentNode = selectChoiceTarget(state, thread, node);
        return;
    }

    const suspended = await executeNodeInstructions(state, thread, node);
    if (suspended.suspended) return;
    if (!suspended.completed) return;
    thread.currentNode = firstTarget(node);
    if (thread.currentNode === undefined) {
        endThread(state, thread);
    }
}

function visitFork(state: InterpreterRuntimeState, thread: RuntimeThread, node: ccfg.Node): void {
    const outgoing = node.outputEdges;
    const join = findCorrespondingJoin(state, node);
    state.lastEvent = {
        kind: "fork",
        threadId: thread.id,
        nodeUid: node.uid,
        data: { children: outgoing.map(edge => edge.to.uid), joinUid: join?.uid }
    };

    removeThread(state, thread);
    if (join !== undefined && (join instanceof ccfg.AndJoin || join.getType() === "AndJoin")) {
        state.joinStates.set(join.uid, {
            expected: outgoing.length,
            arrived: 0,
            parentId: thread.id,
            locals: thread.locals,
            tempValues: []
        });
    }
    for (const edge of outgoing) {
        const child = createThread(state, edge.to, edge.to, thread.id, join, thread.locals);
        enqueueThread(state, child);
        state.lastEvent = { kind: "thread-start", threadId: child.id, nodeUid: edge.to.uid };
    }
}

async function visitAndJoin(state: InterpreterRuntimeState, thread: RuntimeThread, node: ccfg.AndJoin): Promise<void> {
    const joinState = state.joinStates.get(node.uid);
    if (joinState === undefined) {
        const suspended = await executeNodeInstructions(state, thread, node);
        if (suspended.suspended) return;
        if (!suspended.completed) return;
        thread.currentNode = firstTarget(node);
        return;
    }

    joinState.arrived++;
    joinState.tempValues.push(...thread.tempValues);

    if (joinState.arrived < joinState.expected) {
        endThread(state, thread);
        state.lastEvent = {
            kind: "join",
            threadId: thread.id,
            nodeUid: node.uid,
            data: { arrived: joinState.arrived, expected: joinState.expected }
        };
        return;
    }

    state.joinStates.delete(node.uid);
    thread.tempValues.length = 0;
    thread.tempValues.push(...joinState.tempValues);
    thread.currentNode = node;
    thread.currentInstructionIndex = undefined;
    state.lastEvent = {
        kind: "join",
        threadId: thread.id,
        nodeUid: node.uid,
        data: { arrived: joinState.arrived, expected: joinState.expected, resumedAt: node.uid }
    };
}

async function visitOrJoin(state: InterpreterRuntimeState, thread: RuntimeThread, node: ccfg.OrJoin): Promise<void> {
    const next = firstTarget(node);
    if (next !== undefined) {
        const alreadyRunning = state.executionQueue.some(
            entry => entry.thread.id !== thread.id
                && entry.thread.currentNode?.uid === next.uid
        );
        if (alreadyRunning) {
            endThread(state, thread);
            return;
        }
    }
    const suspended = await executeNodeInstructions(state, thread, node);
    if (suspended.suspended) return;
    if (!suspended.completed) return;
    if (next === undefined) {
        endThread(state, thread);
        return;
    }
    thread.currentNode = next;
    state.lastEvent = {
        kind: "join",
        threadId: thread.id,
        nodeUid: node.uid,
        data: { resumedAt: next.uid }
    };
}

function selectChoiceTarget(state: InterpreterRuntimeState, thread: RuntimeThread, node: ccfg.Node): ccfg.Node | undefined {
    const choiceValue = thread.tempValues.length > 0 ? thread.tempValues.pop() : undefined;
    for (const edge of node.outputEdges) {
        if (evaluateEdgeGuard(edge, thread, state.sigma, choiceValue)) {
            state.lastEvent = { kind: "choice", threadId: thread.id, nodeUid: node.uid, data: { target: edge.to.uid } };
            return edge.to;
        }
    }
    return node.outputEdges[0]?.to;
}

function findCorrespondingJoin(state: InterpreterRuntimeState, node: ccfg.Node): ccfg.Join | undefined {
    const reachableJoin = findFirstReachableJoin(node);
    if (reachableJoin !== undefined) return reachableJoin;
    for (const uid of node.syncNodeIds) {
        const syncNode = state.ccfg.getNodeByUID(uid);
        if (syncNode instanceof ccfg.Join || syncNode?.getType() === "AndJoin" || syncNode?.getType() === "OrJoin") {
            return syncNode as ccfg.Join;
        }
    }
    return undefined;
}
