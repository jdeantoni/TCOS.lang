import * as ccfg from "ccfg";
import { findFirstReachableAndJoin, firstTarget, prepareCCFG, snapshotNode } from "./graph-utils.js";
import { RealClock, RoundRobinScheduler, RuntimeThread } from "./runtime.js";
import type * as types from "./types.js";

export class CCFGInterpreter {
    readonly ccfg: ccfg.CCFG;
    readonly sigma = new Map<string, unknown>();
    readonly breakpoints = new Set<number>();

    status: types.InterpreterStatus = "idle";
    stepCount = 0;
    lastEvent: types.DebugEvent | undefined;
    lastError: unknown;

    private readonly debug: boolean;
    private readonly scheduler: NonNullable<types.CCFGInterpreterOptions["scheduler"]>;
    private readonly clock: NonNullable<types.CCFGInterpreterOptions["clock"]>;
    private readonly maxSteps: number | undefined;
    private readonly timeoutMs: number | undefined;
    private readonly threads: RuntimeThread[] = [];
    private readonly joinStates = new Map<number, types.JoinState>();
    private readonly eventChannels = new Map<string, types.EventChannel>();
    private readonly eventTokenToChannel = new Map<number, string>();
    private nextThreadId = 1;
    private lastThreadIndex = -1;

    constructor(ccfg: ccfg.CCFG, options: types.CCFGInterpreterOptions = {}) {
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

    static fromCCFG(ccfg: ccfg.CCFG, options: types.CCFGInterpreterOptions = {}): CCFGInterpreter {
        return new CCFGInterpreter(ccfg, options);
    }

    reset(status: types.InterpreterStatus = "ready"): void {
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

    setBreakpoint(nodeUid: number): void {
        this.breakpoints.add(nodeUid);
    }

    removeBreakpoint(nodeUid: number): void {
        this.breakpoints.delete(nodeUid);
    }

    clearBreakpoints(): void {
        this.breakpoints.clear();
    }

    setBreakpoints(nodeUids: number[]): types.Breakpoint[] {
        this.breakpoints.clear();
        const result: types.Breakpoint[] = [];
        for (const nodeUid of nodeUids) {
            const node = this.ccfg.getNodeByUID(nodeUid);
            if (node !== undefined) {
                this.breakpoints.add(nodeUid);
            }
            const breakpoint: types.Breakpoint = {
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

    getThreads(): types.ThreadSnapshot[] {
        return this.threads.map(thread => thread.snapshot());
    }

    getCurrentThread(): types.ThreadSnapshot | undefined {
        const thread = this.threads[this.lastThreadIndex] ?? this.threads[0];
        return thread?.snapshot();
    }

    getCurrentNode(): types.NodeSnapshot | undefined {
        const thread = this.threads[this.lastThreadIndex] ?? this.threads[0];
        return thread?.currentNode === undefined ? undefined : snapshotNode(thread.currentNode);
    }

    getSnapshot(): types.InterpreterSnapshot {
        const snapshot: types.InterpreterSnapshot = {
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

    getStackTrace(threadId: number): types.StackFrame[] {
        const thread = this.findThread(threadId);
        if (thread === undefined) {
            return [];
        }
        const node = thread.currentNode === undefined ? undefined : snapshotNode(thread.currentNode);
        const frame: types.StackFrame = {
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

    getScopes(threadId: number): types.ScopeSnapshot[] {
        if (this.findThread(threadId) === undefined) {
            return [];
        }
        return [
            { name: "locals", variablesReference: this.encodeVariablesReference(threadId, "locals"), expensive: false },
            { name: "globals", variablesReference: this.encodeVariablesReference(threadId, "globals"), expensive: false },
            { name: "temporaries", variablesReference: this.encodeVariablesReference(threadId, "temporaries"), expensive: false }
        ];
    }

    getVariables(variablesReference: number): types.VariableSnapshot[] {
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

    async execute(options: types.RunOptions = {}): Promise<types.StepResult> {
        return this.resume(options);
    }

    async run(options: types.RunOptions = {}): Promise<types.StepResult> {
        return this.resume({ ...options, ignoreBreakpoints: true });
    }

    async continueExecution(options: types.RunOptions = {}): Promise<types.StepResult> {
        return this.resume(options);
    }

    async resume(options: types.RunOptions = {}): Promise<types.StepResult> {
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

    async step(options: types.RunOptions = {}): Promise<types.StepResult> {
        return this.advanceOne(options, true);
    }

    private async advanceOne(options: types.RunOptions, stopAfterStep: boolean): Promise<types.StepResult> {
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
        } catch (error) {
            this.lastError = error;
            this.status = "error";
            return this.result("error", error);
        }
    }

    async next(options: types.RunOptions = {}): Promise<types.StepResult> {
        return this.step(options);
    }

    async stepIn(options: types.RunOptions = {}): Promise<types.StepResult> {
        return this.step(options);
    }

    async stepOver(options: types.RunOptions = {}): Promise<types.StepResult> {
        return this.step(options);
    }

    async stepOut(options: types.RunOptions = {}): Promise<types.StepResult> {
        return this.step(options);
    }

    pause(): types.StepResult {
        if (this.status === "running" || this.status === "ready") {
            this.status = "paused";
        }
        return this.result("pause");
    }

    stop(): types.StepResult {
        this.status = "stopped";
        this.threads.length = 0;
        return this.result("stopped");
    }

    private async visitNode(thread: RuntimeThread, node: ccfg.Node): Promise<void> {
        if (node instanceof ccfg.Fork || node.getType() === "Fork") {
            this.visitFork(thread, node);
            return;
        }
        if (node instanceof ccfg.AndJoin || node.getType() === "AndJoin") {
            await this.visitAndJoin(thread, node as ccfg.AndJoin);
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

    private visitFork(thread: RuntimeThread, node: ccfg.Node): void {
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

    private async visitAndJoin(thread: RuntimeThread, node: ccfg.AndJoin): Promise<void> {
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

    private selectChoiceTarget(thread: RuntimeThread, node: ccfg.Node): ccfg.Node | undefined {
        const choiceValue = thread.tempValues.length > 0 ? thread.tempValues.pop() : undefined;
        for (const edge of node.outputEdges) {
            if (this.evaluateEdgeGuard(edge, thread, choiceValue)) {
                this.lastEvent = { kind: "choice", threadId: thread.id, nodeUid: node.uid, data: { target: edge.to.uid } };
                return edge.to;
            }
        }
        return node.outputEdges[0]?.to;
    }

    private async executeNodeInstructions(thread: RuntimeThread, node: ccfg.Node): Promise<void> {
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

    private bindParameters(thread: RuntimeThread, params: ccfg.TypedElement[]): void {
        for (let index = params.length - 1; index >= 0; index--) {
            const param = params[index];
            if (param !== undefined) {
                thread.locals.set(param.name, thread.tempValues.pop());
            }
        }
    }

    private async executeInstruction(thread: RuntimeThread, instruction: ccfg.Instruction): Promise<{ didReturn: boolean; value?: unknown }> {
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

    private evaluateEdgeGuard(edge: ccfg.Edge, thread: RuntimeThread, choiceValue?: unknown): boolean {
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

    private evaluateExpression(expression: string, thread: RuntimeThread, choiceValue?: unknown): unknown {
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

    private resolveValue(value: string, thread: RuntimeThread): unknown {
        return this.evaluateExpression(value, thread);
    }

    private createEvaluationScope(thread: RuntimeThread): Map<string, unknown> {
        const scope = new Map<string, unknown>();
        for (const [name, value] of this.sigma) {
            scope.set(name, value);
        }
        for (const [name, value] of thread.locals) {
            scope.set(name, value);
        }
        return scope;
    }

    private createEventChannel(instruction: ccfg.CreateEventChannelInstruction): void {
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

    private async emitEvent(instruction: ccfg.EmitEventInstruction, thread: RuntimeThread): Promise<void> {
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

    private async waitEvent(instruction: ccfg.WaitEventInstruction, thread: RuntimeThread): Promise<void> {
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

    private ackEvent(instruction: ccfg.AckEventInstruction, thread: RuntimeThread): void {
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
        } else {
            channel.pendingAcks.set(token, remaining);
        }
    }

    private getEventChannel(name: string): types.EventChannel {
        const channel = this.eventChannels.get(name);
        if (channel === undefined) {
            throw new Error(`Unknown event channel: ${name}`);
        }
        return channel;
    }

    private findCorrespondingAndJoin(node: ccfg.Node): ccfg.AndJoin | undefined {
        for (const uid of node.syncNodeIds) {
            const syncNode = this.ccfg.getNodeByUID(uid);
            if (syncNode instanceof ccfg.AndJoin || syncNode?.getType() === "AndJoin") {
                return syncNode as ccfg.AndJoin;
            }
        }
        return findFirstReachableAndJoin(node);
    }

    private createThread(owner: ccfg.Node, currentNode: ccfg.Node, parentId?: number, waitingJoin?: ccfg.AndJoin): RuntimeThread {
        return new RuntimeThread(this.nextThreadId++, owner, currentNode, parentId, waitingJoin);
    }

    private findThread(threadId: number): RuntimeThread | undefined {
        return this.threads.find(thread => thread.id === threadId);
    }

    private encodeVariablesReference(threadId: number, scope: types.ScopeSnapshot["name"]): number {
        const scopeId = scope === "locals" ? 1 : scope === "globals" ? 2 : 3;
        return threadId * 10 + scopeId;
    }

    private decodeVariablesReference(variablesReference: number): { threadId: number; scope: types.ScopeSnapshot["name"] } | undefined {
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

    private endThread(thread: RuntimeThread): void {
        this.removeThread(thread);
        this.lastEvent = { kind: "thread-end", threadId: thread.id };
        if (thread.currentNode !== undefined) {
            this.lastEvent.nodeUid = thread.currentNode.uid;
        }
    }

    private removeThread(thread: RuntimeThread): void {
        const index = this.threads.findIndex(candidate => candidate.id === thread.id);
        if (index >= 0) {
            this.removeThreadAt(index);
        }
    }

    private removeThreadAt(index: number): void {
        this.threads.splice(index, 1);
        if (this.lastThreadIndex >= this.threads.length) {
            this.lastThreadIndex = this.threads.length - 1;
        }
    }

    private result(reason?: types.PauseReason | "thread-end", error?: unknown): types.StepResult {
        const currentThread = this.getCurrentThread();
        const currentNode = this.getCurrentNode();
        const result: types.StepResult = {
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

function mapVariables(variables: Map<string, unknown>): types.VariableSnapshot[] {
    return [...variables.entries()].map(([name, value]) => ({
        name,
        value,
        type: typeof value,
        variablesReference: 0
    }));
}

function looseEquals(left: unknown, right: unknown): boolean {
    // CCFG guards are generated with JavaScript truthiness in mind: e.g. 1 == true, 0 == false.
    // eslint-disable-next-line eqeqeq
    return left == right;
}

export async function executeCCFG(ccfg: ccfg.CCFG, options: types.CCFGInterpreterOptions & types.RunOptions = {}): Promise<types.StepResult> {
    const interpreter = new CCFGInterpreter(ccfg, options);
    return interpreter.run(options);
}
