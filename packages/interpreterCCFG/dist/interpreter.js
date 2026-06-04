import * as ccfg from "ccfg";
import { findFirstReachableAndJoin, firstTarget, prepareCCFG, snapshotNode } from "./graph-utils.js";
import { RealClock, RoundRobinScheduler, RuntimeThread } from "./runtime.js";
export class CCFGInterpreter {
    ccfg;
    sigma = new Map();
    breakpoints = new Set();
    status = "idle";
    stepCount = 0;
    lastEvent;
    lastError;
    debug;
    scheduler;
    clock;
    maxSteps;
    timeoutMs;
    threads = [];
    joinStates = new Map();
    eventChannels = new Map();
    eventTokenToChannel = new Map();
    nextThreadId = 1;
    lastThreadIndex = -1;
    constructor(ccfg, options = {}) {
        this.ccfg = ccfg;
        this.debug = options.debug ?? false;
        this.scheduler = options.scheduler ?? new RoundRobinScheduler();
        this.clock = options.clock ?? new RealClock();
        this.maxSteps = options.maxSteps;
        this.timeoutMs = options.timeoutMs;
        if (options.prepareCCFG ?? true) {
            prepareCCFG(this.ccfg);
        }
        this.reset(options.stopOnEntry ? "paused" : "ready");
    }
    static fromCCFG(ccfg, options = {}) {
        return new CCFGInterpreter(ccfg, options);
    }
    reset(status = "ready") {
        this.sigma.clear();
        this.threads.length = 0;
        this.joinStates.clear();
        this.eventChannels.clear();
        this.eventTokenToChannel.clear();
        this.stepCount = 0;
        this.lastThreadIndex = -1;
        this.nextThreadId = 1;
        this.lastEvent = undefined;
        this.lastError = undefined;
        if (this.ccfg.initialState === undefined) {
            this.status = "terminated";
            return;
        }
        this.threads.push(this.createThread(this.ccfg.initialState, this.ccfg.initialState));
        this.status = status;
    }
    setBreakpoint(nodeUid) {
        this.breakpoints.add(nodeUid);
    }
    removeBreakpoint(nodeUid) {
        this.breakpoints.delete(nodeUid);
    }
    clearBreakpoints() {
        this.breakpoints.clear();
    }
    setBreakpoints(nodeUids) {
        this.breakpoints.clear();
        const result = [];
        for (const nodeUid of nodeUids) {
            const node = this.ccfg.getNodeByUID(nodeUid);
            if (node !== undefined) {
                this.breakpoints.add(nodeUid);
            }
            const breakpoint = {
                nodeUid,
                verified: node !== undefined
            };
            const source = node === undefined ? undefined : snapshotNode(node).source;
            if (source !== undefined) {
                breakpoint.source = source;
            }
            result.push(breakpoint);
        }
        return result;
    }
    getThreads() {
        return this.threads.map(thread => thread.snapshot());
    }
    getCurrentThread() {
        const thread = this.threads[this.lastThreadIndex] ?? this.threads[0];
        return thread?.snapshot();
    }
    getCurrentNode() {
        const thread = this.threads[this.lastThreadIndex] ?? this.threads[0];
        return thread?.currentNode === undefined ? undefined : snapshotNode(thread.currentNode);
    }
    getSnapshot() {
        const snapshot = {
            status: this.status,
            stepCount: this.stepCount,
            threads: this.getThreads(),
            globals: Object.fromEntries(this.sigma)
        };
        const currentThread = this.getCurrentThread();
        const currentNode = this.getCurrentNode();
        if (currentThread !== undefined) {
            snapshot.currentThread = currentThread;
        }
        if (currentNode !== undefined) {
            snapshot.currentNode = currentNode;
        }
        if (this.lastEvent !== undefined) {
            snapshot.lastEvent = this.lastEvent;
        }
        if (this.lastError !== undefined) {
            snapshot.lastError = this.lastError;
        }
        return snapshot;
    }
    getStackTrace(threadId) {
        const thread = this.findThread(threadId);
        if (thread === undefined) {
            return [];
        }
        const node = thread.currentNode === undefined ? undefined : snapshotNode(thread.currentNode);
        const frame = {
            id: thread.id,
            threadId: thread.id,
            name: node === undefined ? `Thread ${thread.id}` : `${node.type} ${node.uid}`
        };
        if (node !== undefined) {
            frame.node = node;
        }
        if (node?.source !== undefined) {
            frame.source = node.source;
        }
        return [frame];
    }
    getScopes(threadId) {
        if (this.findThread(threadId) === undefined) {
            return [];
        }
        return [
            { name: "locals", variablesReference: this.encodeVariablesReference(threadId, "locals"), expensive: false },
            { name: "globals", variablesReference: this.encodeVariablesReference(threadId, "globals"), expensive: false },
            { name: "temporaries", variablesReference: this.encodeVariablesReference(threadId, "temporaries"), expensive: false }
        ];
    }
    getVariables(variablesReference) {
        const decoded = this.decodeVariablesReference(variablesReference);
        if (decoded === undefined) {
            return [];
        }
        const thread = this.findThread(decoded.threadId);
        if (decoded.scope === "globals") {
            return mapVariables(this.sigma);
        }
        if (thread === undefined) {
            return [];
        }
        if (decoded.scope === "locals") {
            return mapVariables(thread.locals);
        }
        return thread.tempValues.map((value, index) => ({
            name: `[${index}]`,
            value,
            type: typeof value,
            variablesReference: 0
        }));
    }
    async execute(options = {}) {
        return this.resume(options);
    }
    async run(options = {}) {
        return this.resume({ ...options, ignoreBreakpoints: true });
    }
    async continueExecution(options = {}) {
        return this.resume(options);
    }
    async resume(options = {}) {
        if (this.status === "terminated" || this.status === "stopped") {
            return this.result(this.status === "terminated" ? "terminated" : "stopped");
        }
        if (this.status === "idle") {
            this.reset("ready");
        }
        this.status = "running";
        const startedAt = this.clock.now();
        const maxSteps = options.maxSteps ?? this.maxSteps;
        const timeoutMs = options.timeoutMs ?? this.timeoutMs;
        const ignoreBreakpoints = options.ignoreBreakpoints ?? false;
        while (this.status === "running") {
            if (maxSteps !== undefined && this.stepCount >= maxSteps) {
                this.status = "paused";
                return this.result("maxSteps");
            }
            if (timeoutMs !== undefined && this.clock.now() - startedAt >= timeoutMs) {
                this.status = "paused";
                return this.result("timeout");
            }
            const result = await this.advanceOne({ ignoreBreakpoints }, false);
            if (result.status !== "running") {
                return result;
            }
        }
        return this.result();
    }
    async step(options = {}) {
        return this.advanceOne(options, true);
    }
    async advanceOne(options, stopAfterStep) {
        if (this.status === "terminated" || this.status === "stopped") {
            return this.result(this.status === "terminated" ? "terminated" : "stopped");
        }
        if (this.status === "idle") {
            this.reset("ready");
        }
        if (this.threads.length === 0) {
            this.status = "terminated";
            return this.result("terminated");
        }
        try {
            const threadIndex = this.scheduler?.nextThread(this.threads, this.lastThreadIndex) ?? -1;
            if (threadIndex < 0) {
                this.status = "terminated";
                return this.result("terminated");
            }
            this.lastThreadIndex = threadIndex;
            const thread = this.threads[threadIndex];
            if (thread === undefined || thread.currentNode === undefined) {
                this.removeThreadAt(threadIndex);
                return this.result("thread-end");
            }
            const node = thread.currentNode;
            if (!(options.ignoreBreakpoints ?? true) && this.breakpoints.has(node.uid)) {
                this.status = "paused";
                return this.result("breakpoint");
            }
            this.status = "running";
            this.lastEvent = { kind: "node", threadId: thread.id, nodeUid: node.uid, message: node.getType() };
            await this.visitNode(thread, node);
            this.stepCount++;
            if (this.threads.length === 0) {
                this.status = "terminated";
                return this.result("terminated");
            }
            if (stopAfterStep) {
                this.status = "paused";
                return this.result("step");
            }
            return this.result();
        }
        catch (error) {
            this.lastError = error;
            this.status = "error";
            return this.result("error", error);
        }
    }
    async next(options = {}) {
        return this.step(options);
    }
    async stepIn(options = {}) {
        return this.step(options);
    }
    async stepOver(options = {}) {
        return this.step(options);
    }
    async stepOut(options = {}) {
        return this.step(options);
    }
    pause() {
        if (this.status === "running" || this.status === "ready") {
            this.status = "paused";
        }
        return this.result("pause");
    }
    stop() {
        this.status = "stopped";
        this.threads.length = 0;
        return this.result("stopped");
    }
    async visitNode(thread, node) {
        if (node instanceof ccfg.Fork || node.getType() === "Fork") {
            this.visitFork(thread, node);
            return;
        }
        if (node instanceof ccfg.AndJoin || node.getType() === "AndJoin") {
            await this.visitAndJoin(thread, node);
            return;
        }
        if (node instanceof ccfg.OrJoin || node.getType() === "OrJoin") {
            thread.currentNode = firstTarget(node);
            return;
        }
        if (node instanceof ccfg.Choice || node.getType() === "Choice") {
            thread.currentNode = this.selectChoiceTarget(thread, node);
            return;
        }
        await this.executeNodeInstructions(thread, node);
        thread.currentNode = firstTarget(node);
        if (thread.currentNode === undefined) {
            this.endThread(thread);
        }
    }
    visitFork(thread, node) {
        const outgoing = node.outputEdges;
        const join = this.findCorrespondingAndJoin(node);
        this.lastEvent = {
            kind: "fork",
            threadId: thread.id,
            nodeUid: node.uid,
            data: { children: outgoing.map(edge => edge.to.uid), joinUid: join?.uid }
        };
        this.removeThread(thread);
        if (join !== undefined) {
            this.joinStates.set(join.uid, {
                expected: outgoing.length,
                arrived: 0,
                parentId: thread.id,
                tempValues: []
            });
        }
        for (const edge of outgoing) {
            const child = this.createThread(edge.to, edge.to, thread.id, join);
            for (const [name, value] of thread.locals) {
                child.locals.set(name, value);
            }
            this.threads.push(child);
            this.lastEvent = { kind: "thread-start", threadId: child.id, nodeUid: edge.to.uid };
        }
    }
    async visitAndJoin(thread, node) {
        const joinState = this.joinStates.get(node.uid);
        if (joinState === undefined) {
            await this.executeNodeInstructions(thread, node);
            thread.currentNode = firstTarget(node);
            return;
        }
        joinState.arrived++;
        joinState.tempValues.push(...thread.tempValues);
        this.endThread(thread);
        if (joinState.arrived < joinState.expected) {
            this.lastEvent = {
                kind: "join",
                threadId: thread.id,
                nodeUid: node.uid,
                data: { arrived: joinState.arrived, expected: joinState.expected }
            };
            return;
        }
        this.joinStates.delete(node.uid);
        const next = firstTarget(node);
        if (next === undefined) {
            return;
        }
        const continuation = this.createThread(next, next, joinState.parentId);
        continuation.tempValues.push(...joinState.tempValues);
        await this.executeNodeInstructions(continuation, node);
        this.threads.push(continuation);
        this.lastEvent = {
            kind: "join",
            threadId: continuation.id,
            nodeUid: node.uid,
            data: { arrived: joinState.arrived, expected: joinState.expected, resumedAt: next.uid }
        };
    }
    selectChoiceTarget(thread, node) {
        const choiceValue = thread.tempValues.length > 0 ? thread.tempValues.pop() : undefined;
        for (const edge of node.outputEdges) {
            if (this.evaluateEdgeGuard(edge, thread, choiceValue)) {
                this.lastEvent = { kind: "choice", threadId: thread.id, nodeUid: node.uid, data: { target: edge.to.uid } };
                return edge.to;
            }
        }
        return node.outputEdges[0]?.to;
    }
    async executeNodeInstructions(thread, node) {
        if (this.debug && node.functionsDefs.length > 0) {
            this.lastEvent = {
                kind: "node",
                threadId: thread.id,
                nodeUid: node.uid,
                data: { functions: node.functionsNames, instructions: node.functionsDefs.map(i => i.toString()) }
            };
        }
        this.bindParameters(thread, node.params);
        for (const instruction of node.functionsDefs) {
            const returned = await this.executeInstruction(thread, instruction);
            if (returned.didReturn) {
                thread.tempValues.push(returned.value);
                return;
            }
        }
    }
    bindParameters(thread, params) {
        for (let index = params.length - 1; index >= 0; index--) {
            const param = params[index];
            if (param !== undefined) {
                thread.locals.set(param.name, thread.tempValues.pop());
            }
        }
    }
    async executeInstruction(thread, instruction) {
        if (instruction instanceof ccfg.CreateVarInstruction) {
            thread.locals.set(instruction.varName, undefined);
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.AssignVarInstruction) {
            thread.locals.set(instruction.varName, this.evaluateExpression(instruction.value, thread));
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.CreateGlobalVarInstruction) {
            this.sigma.set(instruction.varName, undefined);
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.SetVarFromGlobalInstruction) {
            thread.locals.set(instruction.varName, this.sigma.get(instruction.globalVarName));
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.SetGlobalVarInstruction) {
            this.sigma.set(instruction.globalVarName, this.evaluateExpression(instruction.value, thread));
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.OperationInstruction) {
            const value = this.evaluateExpression(`${instruction.n1} ${instruction.op} ${instruction.n2}`, thread);
            thread.locals.set(instruction.varName, value);
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.ReturnInstruction) {
            return { didReturn: true, value: this.resolveValue(instruction.varName, thread) };
        }
        if (instruction instanceof ccfg.AddSleepInstruction) {
            const duration = Number(this.evaluateExpression(instruction.duration, thread));
            this.lastEvent = { kind: "sleep", threadId: thread.id, message: `${duration}` };
            await this.clock.sleep(duration);
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.CreateEventChannelInstruction) {
            this.createEventChannel(instruction);
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.EmitEventInstruction) {
            await this.emitEvent(instruction, thread);
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.WaitEventInstruction) {
            await this.waitEvent(instruction, thread);
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.AckEventInstruction) {
            this.ackEvent(instruction, thread);
            return { didReturn: false };
        }
        throw new Error(`Unsupported ccfg.CCFG instruction: ${instruction.$instructionType || instruction.toString()}`);
    }
    evaluateEdgeGuard(edge, thread, choiceValue) {
        if (edge.guards.length === 0) {
            return true;
        }
        return edge.guards.every(guard => {
            if (guard instanceof ccfg.VerifyEqualInstruction) {
                const left = choiceValue ?? this.resolveValue(guard.n1, thread);
                return looseEquals(left, this.resolveValue(guard.n2, thread));
            }
            return Boolean(this.evaluateExpression(guard.toString(), thread, choiceValue));
        });
    }
    evaluateExpression(expression, thread, choiceValue) {
        const trimmed = expression.trim();
        if (trimmed.length === 0) {
            return undefined;
        }
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            return Number(trimmed);
        }
        if (trimmed === "true") {
            return true;
        }
        if (trimmed === "false") {
            return false;
        }
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.slice(1, -1);
        }
        const scope = this.createEvaluationScope(thread);
        if (choiceValue !== undefined) {
            scope.set("resRight", choiceValue);
        }
        if (scope.has(trimmed)) {
            return scope.get(trimmed);
        }
        const names = [...scope.keys(), "sigma"];
        const values = [...scope.values(), this.sigma];
        return Function(...names, `"use strict"; return (${trimmed});`)(...values);
    }
    resolveValue(value, thread) {
        return this.evaluateExpression(value, thread);
    }
    createEvaluationScope(thread) {
        const scope = new Map();
        for (const [name, value] of this.sigma) {
            scope.set(name, value);
        }
        for (const [name, value] of thread.locals) {
            scope.set(name, value);
        }
        return scope;
    }
    createEventChannel(instruction) {
        if (this.eventChannels.has(instruction.channelName)) {
            return;
        }
        this.eventChannels.set(instruction.channelName, {
            listenerCount: instruction.listenerCount,
            payloadKind: instruction.payloadKind,
            queue: [],
            nextToken: 1,
            pendingAcks: new Map()
        });
    }
    async emitEvent(instruction, thread) {
        const channel = this.getEventChannel(instruction.channelName);
        const token = channel.nextToken++;
        const expectedAcks = instruction.awaitAcks ? channel.listenerCount : 0;
        const payload = this.evaluateExpression(instruction.payload, thread);
        if (expectedAcks > 0) {
            channel.pendingAcks.set(token, expectedAcks);
            this.eventTokenToChannel.set(token, instruction.channelName);
        }
        channel.queue.push({ payload, token });
        this.lastEvent = { kind: "event", threadId: thread.id, message: "emit", data: { channel: instruction.channelName, token } };
        while (instruction.awaitAcks && (channel.pendingAcks.get(token) ?? 0) > 0) {
            await this.clock.sleep(10);
        }
    }
    async waitEvent(instruction, thread) {
        const channel = this.getEventChannel(instruction.channelName);
        let message = channel.queue.shift();
        while (message === undefined) {
            await this.clock.sleep(10);
            message = channel.queue.shift();
        }
        thread.locals.set(instruction.outPayload, message.payload);
        thread.locals.set(`${instruction.channelName}Token`, message.token);
        thread.locals.set("com_last_event_token", message.token);
        this.lastEvent = { kind: "event", threadId: thread.id, message: "wait", data: { channel: instruction.channelName, token: message.token } };
    }
    ackEvent(instruction, thread) {
        const token = Number(this.evaluateExpression(instruction.token, thread));
        const channelName = this.eventTokenToChannel.get(token);
        if (channelName === undefined) {
            return;
        }
        const channel = this.getEventChannel(channelName);
        const remaining = (channel.pendingAcks.get(token) ?? 0) - 1;
        if (remaining <= 0) {
            channel.pendingAcks.delete(token);
            this.eventTokenToChannel.delete(token);
        }
        else {
            channel.pendingAcks.set(token, remaining);
        }
    }
    getEventChannel(name) {
        const channel = this.eventChannels.get(name);
        if (channel === undefined) {
            throw new Error(`Unknown event channel: ${name}`);
        }
        return channel;
    }
    findCorrespondingAndJoin(node) {
        for (const uid of node.syncNodeIds) {
            const syncNode = this.ccfg.getNodeByUID(uid);
            if (syncNode instanceof ccfg.AndJoin || syncNode?.getType() === "AndJoin") {
                return syncNode;
            }
        }
        return findFirstReachableAndJoin(node);
    }
    createThread(owner, currentNode, parentId, waitingJoin) {
        return new RuntimeThread(this.nextThreadId++, owner, currentNode, parentId, waitingJoin);
    }
    findThread(threadId) {
        return this.threads.find(thread => thread.id === threadId);
    }
    encodeVariablesReference(threadId, scope) {
        const scopeId = scope === "locals" ? 1 : scope === "globals" ? 2 : 3;
        return threadId * 10 + scopeId;
    }
    decodeVariablesReference(variablesReference) {
        const scopeId = variablesReference % 10;
        const threadId = Math.floor(variablesReference / 10);
        if (threadId <= 0) {
            return undefined;
        }
        if (scopeId === 1) {
            return { threadId, scope: "locals" };
        }
        if (scopeId === 2) {
            return { threadId, scope: "globals" };
        }
        if (scopeId === 3) {
            return { threadId, scope: "temporaries" };
        }
        return undefined;
    }
    endThread(thread) {
        this.removeThread(thread);
        this.lastEvent = { kind: "thread-end", threadId: thread.id };
        if (thread.currentNode !== undefined) {
            this.lastEvent.nodeUid = thread.currentNode.uid;
        }
    }
    removeThread(thread) {
        const index = this.threads.findIndex(candidate => candidate.id === thread.id);
        if (index >= 0) {
            this.removeThreadAt(index);
        }
    }
    removeThreadAt(index) {
        this.threads.splice(index, 1);
        if (this.lastThreadIndex >= this.threads.length) {
            this.lastThreadIndex = this.threads.length - 1;
        }
    }
    result(reason, error) {
        const currentThread = this.getCurrentThread();
        const currentNode = this.getCurrentNode();
        const result = {
            status: this.status,
            stepCount: this.stepCount
        };
        if (reason !== undefined && reason !== "thread-end") {
            result.reason = reason;
        }
        if (currentThread !== undefined) {
            result.currentThread = currentThread;
        }
        if (currentNode !== undefined) {
            result.currentNode = currentNode;
        }
        if (this.lastEvent !== undefined) {
            result.event = this.lastEvent;
        }
        if (error !== undefined) {
            result.error = error;
        }
        return result;
    }
}
function mapVariables(variables) {
    return [...variables.entries()].map(([name, value]) => ({
        name,
        value,
        type: typeof value,
        variablesReference: 0
    }));
}
function looseEquals(left, right) {
    // CCFG guards are generated with JavaScript truthiness in mind: e.g. 1 == true, 0 == false.
    // eslint-disable-next-line eqeqeq
    return left == right;
}
export async function executeCCFG(ccfg, options = {}) {
    const interpreter = new CCFGInterpreter(ccfg, options);
    return interpreter.run(options);
}
