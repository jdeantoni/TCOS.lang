import * as ccfg from "ccfg";
import { findFirstReachableJoin, firstTarget, prepareCCFG, snapshotNode } from "./graph-utils.js";
import { RoundRobinScheduler, RuntimeThread } from "./runtime.js";
import type * as types from "./types.js";


export class DiscreteClock {
    private T = 0;

    now(): number {
        return this.T;
    }

    advanceTo(t: number): void {
        this.T = t;
    }

    async sleep(_ms: number): Promise<void> {
    }
}

interface ExecutionQueueEntry {
    thread: RuntimeThread;
    readyAt: number;
    waitingEvent?: string;
    order: number;
}



export class CCFGInterpreter {
    readonly ccfg: ccfg.CCFG;
    readonly sigma = new Map<string, unknown>();
    readonly breakpoints = new Set<number>();

    status: types.InterpreterStatus = "idle";
    stepCount = 0;
    lastEvent: types.DebugEvent | undefined;
    lastError: unknown;

    T = 0;

    private readonly debug: boolean;
    private readonly scheduler: NonNullable<types.CCFGInterpreterOptions["scheduler"]>;
    private readonly clock: DiscreteClock;
    private readonly maxSteps: number | undefined;
    private readonly timeoutMs: number | undefined;
    private readonly executionQueue: ExecutionQueueEntry[] = [];
    private readonly joinStates = new Map<number, types.JoinState>();
    private readonly eventChannels = new Map<string, types.EventChannel>();
    private readonly eventTokenToChannel = new Map<number, string>();
    private nextThreadId = 1;
    private nextQueueOrder = 1;
    private lastThreadIndex = -1;
    private readonly reportedBreakpointUids = new Set<number>();
    private sigmaNameMap = new Map<string, string>();

    constructor(ccfg: ccfg.CCFG, options: types.CCFGInterpreterOptions = {}) {
        this.ccfg = ccfg;
        this.debug = options.debug ?? false;
        this.scheduler = options.scheduler ?? new RoundRobinScheduler();
        this.clock = new DiscreteClock();
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
        this.executionQueue.length = 0;
        this.joinStates.clear();
        this.eventChannels.clear();
        this.eventTokenToChannel.clear();
        this.T = 0;
        this.clock.advanceTo(0);
        this.stepCount = 0;
        this.lastThreadIndex = -1;
        this.nextThreadId = 1;
        this.nextQueueOrder = 1;
        this.lastEvent = undefined;
        this.lastError = undefined;
        this.reportedBreakpointUids.clear();

        if (this.ccfg.initialState === undefined) {
            this.status = "terminated";
            return;
        }
        this.buildSigmaNameMap();
        this.enqueueThread(this.createThread(this.ccfg.initialState, this.ccfg.initialState));
        this.status = status;
    }

    private buildSigmaNameMap(): void {
        this.sigmaNameMap.clear();
        for (const node of this.ccfg.nodes) {
            // Cherche les nœuds qui créent des variables globales
            for (const instr of node.functionsDefs) {
                if (instr instanceof ccfg.CreateGlobalVarInstruction) {
                    // Le nom source est dans astNode.name si disponible
                    const sourceName = (node.astNode as any)?.name as string | undefined;
                    if (sourceName) {
                        // instr.varName = "Variable0_0_0_10currentValue"
                        // sourceName    = "v1"
                        this.sigmaNameMap.set(instr.varName, sourceName);
                    }
                }
            }
        }
    }

    private advanceTime(): boolean {
        const nextT = Math.min(...this.executionQueue
            .map(entry => entry.readyAt)
            .filter(t => t > this.T));
        if (!Number.isFinite(nextT)) return false;
        this.T = nextT;
        this.clock.advanceTo(nextT);

        for (const entry of this.executionQueue) {
            if (entry.readyAt === this.T) {
                entry.readyAt = 0;
                this.lastEvent = {
                    kind:     "sleep",
                    threadId: entry.thread.id,
                    message:  `wakeup at T=${this.T}`
                };
            }
        }
        this.sortExecutionQueue();

        return true;
    }


    getSleepingThreads(): Array<{ t: number; threadId: number; nodeUid: number }> {
        return this.executionQueue.flatMap(entry => {
            const t = entry.readyAt;
            const thread = entry.thread;
            if (t <= this.T) return [];
            if (thread?.currentNode === undefined) return [];
            return [{ t, threadId: thread.id, nodeUid: thread.currentNode.uid }];
        });
    }

    getCurrentSourceKey(): string | undefined {
        const thread = (this.executionQueue[this.lastThreadIndex] ?? this.executionQueue[0])?.thread;
        const node   = thread?.currentNode;
        if (node === undefined) return undefined;
        const range = (node.astNode as any)?.$cstNode?.range;
        if (range === undefined) return undefined;
        const uri = (node.astNode as any)?.$cstNode?.root?.textDocument?.uri
            ?? (node.astNode as any)?.$document?.uri?.toString()
            ?? '';
        return `${range.start.line}`;
    }

    setBreakpoint(nodeUid: number): void {
        this.breakpoints.add(nodeUid);
    }

    removeBreakpoint(nodeUid: number): void {
        this.breakpoints.delete(nodeUid);
    }

    clearBreakpoints(): void {
        this.breakpoints.clear();
        this.reportedBreakpointUids.clear();
    }

    setBreakpoints(nodeUids: number[]): types.Breakpoint[] {
        this.breakpoints.clear();
        this.reportedBreakpointUids.clear();
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
        return this.executionQueue.map(entry => entry.thread.snapshot());
    }

    getCurrentThread(): types.ThreadSnapshot | undefined {
        const thread = (this.executionQueue[this.lastThreadIndex] ?? this.executionQueue[0])?.thread;
        return thread?.snapshot();
    }

    getCurrentNode(): types.NodeSnapshot | undefined {
        const thread = (this.executionQueue[this.lastThreadIndex] ?? this.executionQueue[0])?.thread;
        return thread?.currentNode === undefined ? undefined : snapshotNode(thread.currentNode);
    }

    getSnapshot(): types.InterpreterSnapshot {
        const snapshot: types.InterpreterSnapshot = {
            status:    this.status,
            stepCount: this.stepCount,
            threads:   this.getThreads(),
            globals:   {
                ...Object.fromEntries(this.sigma),
                __T: this.T,
                __sleeping: this.executionQueue.filter(entry => entry.readyAt > this.T).length,
            }
        };
        const currentThread = this.getCurrentThread();
        const currentNode   = this.getCurrentNode();
        if (currentThread !== undefined) snapshot.currentThread = currentThread;
        if (currentNode   !== undefined) snapshot.currentNode   = currentNode;
        if (this.lastEvent !== undefined) snapshot.lastEvent    = this.lastEvent;
        if (this.lastError !== undefined) snapshot.lastError    = this.lastError;
        return snapshot;
    }

    getStackTrace(threadId: number): types.StackFrame[] {
        const thread = this.findThread(threadId);
        if (thread === undefined) return [];
        const node = thread.currentNode === undefined ? undefined : snapshotNode(thread.currentNode);
        const frame: types.StackFrame = {
            id:       thread.id,
            threadId: thread.id,
            name:     node === undefined ? `Thread ${thread.id}` : `${node.type} ${node.uid}`
        };
        if (node !== undefined)         frame.node   = node;
        if (node?.source !== undefined) frame.source = node.source;
        return [frame];
    }

    getScopes(threadId: number): types.ScopeSnapshot[] {
        if (this.findThread(threadId) === undefined) return [];
        return [
            { name: "locals",      variablesReference: this.encodeVariablesReference(threadId, "locals"),      expensive: false },
            { name: "globals",     variablesReference: this.encodeVariablesReference(threadId, "globals"),     expensive: false },
            { name: "temporaries", variablesReference: this.encodeVariablesReference(threadId, "temporaries"), expensive: false }
        ];
    }

    getVariables(variablesReference: number): types.VariableSnapshot[] {
        const decoded = this.decodeVariablesReference(variablesReference);
        if (decoded === undefined) return [];
        const thread = this.findThread(decoded.threadId);
        if (decoded.scope === "globals") {
            return [
                ...mapVariables(this.sigma,this.sigmaNameMap),
                { name: "__T", value: this.T, type: "number", variablesReference: 0 },
                { name: "__sleeping", value: this.executionQueue.filter(entry => entry.readyAt > this.T).length, type: "number", variablesReference: 0 }
            ];
        }
        if (thread === undefined) return [];
        if (decoded.scope === "locals") return mapVariables(thread.locals);
        return thread.tempValues.map((value, index) => ({
            name:               `[${index}]`,
            value,
            type:               typeof value,
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
        const maxSteps        = options.maxSteps        ?? this.maxSteps;
        const timeoutMs       = options.timeoutMs       ?? this.timeoutMs;
        const ignoreBreakpoints = options.ignoreBreakpoints ?? false;

        while (this.status === "running") {
            if (maxSteps !== undefined && this.stepCount >= maxSteps) {
                this.status = "paused";
                return this.result("maxSteps");
            }
  
            if (timeoutMs !== undefined && this.T >= timeoutMs) {
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
        const before = this.getDebugState("before-step");
        console.log("[CCFGInterpreter.step]", before);
        const result = await this.stepSource(options);
        const after = this.getDebugState("after-step");
        console.log("[CCFGInterpreter.step]", { ...after, result });
        return result;
    }

    private async stepSource(options: types.RunOptions): Promise<types.StepResult> {
        const startLine = this.getCurrentSourceKey();
        const startT = this.T;
        const startStepCount = this.stepCount;
        const maxSourceSteps = options.maxSteps ?? this.maxSteps ?? 1000;

        while (true) {
            const result = await this.advanceOne(options, true);

            if (result.status === "terminated" || result.status === "stopped" || result.status === "error") {
                return result;
            }

            if (this.T !== startT) {
                return result;
            }

            if (this.stepCount - startStepCount >= maxSourceSteps) {
                return result;
            }

            const line = this.getCurrentSourceKey();

            if (line === undefined) {
                if (this.executionQueue.length === 0) {
                    return result;
                }
                continue;
            }

            if (line !== startLine) {
                return result;
            }

            if (!this.hasRunnableThread() && !this.hasScheduledThread()) {
                return result;
            }
        }
    }
    private async advanceOne(options: types.RunOptions, stopAfterStep: boolean): Promise<types.StepResult> {
        if (this.status === "terminated" || this.status === "stopped") {
            return this.result(this.status === "terminated" ? "terminated" : "stopped");
        }
        if (this.status === "idle") {
            this.reset("ready");
        }

        if (this.executionQueue.length === 0) {
            this.status = "terminated";
            console.log("[CCFGInterpreter.advanceOne]", this.getDebugState("advance-terminated-empty"));
            return this.result("terminated");
        }

        try {
            const threadIndex = this.nextRunnableThreadIndex();
            if (threadIndex < 0) {
                if (this.hasScheduledThread()) {
                    this.advanceTime();
                    console.log("[CCFGInterpreter.advanceOne]", this.getDebugState("advance-time"));
                    return this.result();
                }
                this.status = "paused";
                console.log("[CCFGInterpreter.advanceOne]", this.getDebugState("advance-paused-no-runnable"));
                return this.result("step");
            }

            this.lastThreadIndex = threadIndex;
            const thread = this.executionQueue[threadIndex]?.thread;
            if (thread === undefined || thread.currentNode === undefined) {
                this.removeThreadAt(threadIndex);
                console.log("[CCFGInterpreter.advanceOne]", this.getDebugState("advance-removed-empty-thread"));
                return this.result("thread-end");
            }

            const node = thread.currentNode;

            if (!(options.ignoreBreakpoints ?? true)
                && this.breakpoints.has(node.uid)
                && !this.reportedBreakpointUids.has(node.uid)) {
                this.reportedBreakpointUids.add(node.uid);
                this.status = "paused";
                console.log("[CCFGInterpreter.advanceOne]", this.getDebugState("advance-breakpoint"));
                return this.result("breakpoint");
            }

            this.reportedBreakpointUids.delete(node.uid);
            this.status = "running";
            this.lastEvent = { kind: "node", threadId: thread.id, nodeUid: node.uid, message: node.getType() };
            await this.visitNode(thread, node);
            this.stepCount++;

            if (this.executionQueue.length === 0) {
                this.status = "terminated";
                console.log("[CCFGInterpreter.advanceOne]", this.getDebugState("advance-terminated-after-node"));
                return this.result("terminated");
            }

            if (stopAfterStep) {
                this.status = "paused";
                return this.result("step");
            }

            return this.result();
        } catch (error) {
            this.lastError = error;
            this.status    = "error";
            console.log("[CCFGInterpreter.advanceOne]", { ...this.getDebugState("advance-error"), error });
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
        this.executionQueue.length = 0;
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
            await this.visitOrJoin(thread, node as ccfg.OrJoin);
            return;
        }
        if (node instanceof ccfg.Choice || node.getType() === "Choice") {
            thread.currentNode = this.selectChoiceTarget(thread, node);
            return;
        }

        const suspended = await this.executeNodeInstructions(thread, node);
        if (suspended) return;
        thread.currentNode = firstTarget(node);
        if (thread.currentNode === undefined) {
            this.endThread(thread);
        }
    }

    private visitFork(thread: RuntimeThread, node: ccfg.Node): void {
        const outgoing = node.outputEdges;
        const join = this.findCorrespondingJoin(node);
        this.lastEvent = {
            kind:     "fork",
            threadId: thread.id,
            nodeUid:  node.uid,
            data:     { children: outgoing.map(edge => edge.to.uid), joinUid: join?.uid }
        };

        this.removeThread(thread);
        if (join !== undefined && (join instanceof ccfg.AndJoin || join.getType() === "AndJoin")) {
            this.joinStates.set(join.uid, {
                expected:   outgoing.length,
                arrived:    0,
                parentId:   thread.id,
                locals:     thread.locals,
                tempValues: []
            });
        }
        for (const edge of outgoing) {
            const child = this.createThread(edge.to, edge.to, thread.id, join, thread.locals);
            this.enqueueThread(child);
            this.lastEvent = { kind: "thread-start", threadId: child.id, nodeUid: edge.to.uid };
        }
    }

    private async visitAndJoin(thread: RuntimeThread, node: ccfg.AndJoin): Promise<void> {
        const joinState = this.joinStates.get(node.uid);
        if (joinState === undefined) {
            const suspended = await this.executeNodeInstructions(thread, node);
            if (suspended) return;
            thread.currentNode = firstTarget(node);
            return;
        }

        joinState.arrived++;
        joinState.tempValues.push(...thread.tempValues);
        this.endThread(thread);

        if (joinState.arrived < joinState.expected) {
            this.lastEvent = {
                kind:     "join",
                threadId: thread.id,
                nodeUid:  node.uid,
                data:     { arrived: joinState.arrived, expected: joinState.expected }
            };
            return;
        }

        this.joinStates.delete(node.uid);
        const next = firstTarget(node);
        if (next === undefined) return;

        const continuation = this.createThread(next, next, joinState.parentId, undefined, joinState.locals);
        continuation.tempValues.push(...joinState.tempValues);
        await this.executeNodeInstructions(continuation, node);
        this.enqueueThread(continuation);
        this.lastEvent = {
            kind:     "join",
            threadId: continuation.id,
            nodeUid:  node.uid,
            data:     { arrived: joinState.arrived, expected: joinState.expected, resumedAt: next.uid }
        };
    }

    private async visitOrJoin(thread: RuntimeThread, node: ccfg.OrJoin): Promise<void> {
        const suspended = await this.executeNodeInstructions(thread, node);
        if (suspended) return;
        const next = firstTarget(node);
        if (next === undefined) {
            this.endThread(thread);
            return;
        }
        thread.currentNode = next;
        this.lastEvent = {
            kind:     "join",
            threadId: thread.id,
            nodeUid:  node.uid,
            data:     { resumedAt: next.uid }
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


    private async executeNodeInstructions(thread: RuntimeThread, node: ccfg.Node): Promise<boolean> {
        if (this.debug && node.functionsDefs.length > 0) {
            this.lastEvent = {
                kind:     "node",
                threadId: thread.id,
                nodeUid:  node.uid,
                data:     { functions: node.functionsNames, instructions: node.functionsDefs.map(i => i.toString()) }
            };
        }

        if (node.functionsDefs.length === 0) return false;

        this.bindParameters(thread, node.params);
        for (const instruction of node.functionsDefs) {
            const returned = await this.executeInstruction(thread, instruction, node);
            if (returned.didReturn) {
                thread.tempValues.push(returned.value);
                return false;
            }
            if (returned.suspended) return true;
        }
        return false;
    }

    private bindParameters(thread: RuntimeThread, params: ccfg.TypedElement[]): void {
        for (let index = params.length - 1; index >= 0; index--) {
            const param = params[index];
            if (param !== undefined) {
                thread.locals.set(param.name, thread.tempValues.pop());
            }
        }
    }

    private async executeInstruction(
        thread: RuntimeThread,
        instruction: ccfg.Instruction,
        node: ccfg.Node
    ): Promise<{ didReturn: boolean; suspended?: boolean; value?: unknown }> {

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
            const wakeAt   = this.T + duration;
            const nextNode = firstTarget(node);

            this.lastEvent = {
                kind:     "sleep",
                threadId: thread.id,
                message:  `sleep ${duration} → wakeup at T=${wakeAt}`
            };

            if (nextNode !== undefined) {
                thread.currentNode = nextNode;
                this.setThreadReadyAt(thread, wakeAt);
            } else {
                this.endThread(thread);
            }

            return { didReturn: false, suspended: true };
        }

        if (instruction instanceof ccfg.CreateEventChannelInstruction) {
            this.createEventChannel(instruction);
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.EmitEventInstruction) {
            this.emitEventDiscrete(instruction, thread);
            return { didReturn: false };
        }
        if (instruction instanceof ccfg.WaitEventInstruction) {
            const suspended = this.waitEventDiscrete(instruction, thread, node);
            return { didReturn: false, suspended };
        }
        if (instruction instanceof ccfg.AckEventInstruction) {
            this.ackEvent(instruction, thread);
            return { didReturn: false };
        }

        throw new Error(`Unsupported instruction: ${instruction.$instructionType || instruction.toString()}`);
    }

   
    private emitEventDiscrete(instruction: ccfg.EmitEventInstruction, thread: RuntimeThread): void {
        const channel = this.getEventChannel(instruction.channelName);
        const token   = channel.nextToken++;
        const payload = this.evaluateExpression(instruction.payload, thread);

        if (instruction.awaitAcks) {
            channel.pendingAcks.set(token, channel.listenerCount);
            this.eventTokenToChannel.set(token, instruction.channelName);
        }
        channel.queue.push({ payload, token });
        this.unblockEventWaiters(instruction.channelName);

        this.lastEvent = {
            kind:     "event",
            threadId: thread.id,
            message:  "emit",
            data:     { channel: instruction.channelName, token }
        };
    }


    private waitEventDiscrete(
        instruction: ccfg.WaitEventInstruction,
        thread: RuntimeThread,
        node: ccfg.Node
    ): boolean {
        const channel = this.getEventChannel(instruction.channelName);
        const message = channel.queue.shift();

        if (message !== undefined) {
            thread.locals.set(instruction.outPayload, message.payload);
            thread.locals.set(`${instruction.channelName}Token`, message.token);
            thread.locals.set("com_last_event_token", message.token);
            this.lastEvent = {
                kind:     "event",
                threadId: thread.id,
                message:  "wait",
                data:     { channel: instruction.channelName, token: message.token }
            };
            return false; 
        }

        
        this.setThreadWaitingEvent(thread, instruction.channelName);
        thread.currentNode = node;
        return true; 
    }

    private ackEvent(instruction: ccfg.AckEventInstruction, thread: RuntimeThread): void {
        const token       = Number(this.evaluateExpression(instruction.token, thread));
        const channelName = this.eventTokenToChannel.get(token);
        if (channelName === undefined) return;
        const channel   = this.getEventChannel(channelName);
        const remaining = (channel.pendingAcks.get(token) ?? 0) - 1;
        if (remaining <= 0) {
            channel.pendingAcks.delete(token);
            this.eventTokenToChannel.delete(token);
        } else {
            channel.pendingAcks.set(token, remaining);
        }
    }


    private evaluateEdgeGuard(edge: ccfg.Edge, thread: RuntimeThread, choiceValue?: unknown): boolean {
        if (edge.guards.length === 0) return true;
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
        if (trimmed.length === 0) return undefined;
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
        if (trimmed === "true")  return true;
        if (trimmed === "false") return false;
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
            (trimmed.startsWith("'")  && trimmed.endsWith("'"))) {
            return trimmed.slice(1, -1);
        }

        const scope = this.createEvaluationScope(thread);
        if (choiceValue !== undefined) scope.set("resRight", choiceValue);
        if (scope.has(trimmed)) return scope.get(trimmed);

        const names  = [...scope.keys(), "sigma"];
        const values = [...scope.values(), this.sigma];
        return Function(...names, `"use strict"; return (${trimmed});`)(...values);
    }

    private resolveValue(value: string, thread: RuntimeThread): unknown {
        return this.evaluateExpression(value, thread);
    }

    private createEvaluationScope(thread: RuntimeThread): Map<string, unknown> {
        const scope = new Map<string, unknown>();
        for (const [name, value] of this.sigma)        scope.set(name, value);
        for (const [name, value] of thread.locals)     scope.set(name, value);
        return scope;
    }



    private createEventChannel(instruction: ccfg.CreateEventChannelInstruction): void {
        if (this.eventChannels.has(instruction.channelName)) return;
        this.eventChannels.set(instruction.channelName, {
            listenerCount: instruction.listenerCount,
            payloadKind:   instruction.payloadKind,
            queue:         [],
            nextToken:     1,
            pendingAcks:   new Map()
        });
    }

    private getEventChannel(name: string): types.EventChannel {
        const channel = this.eventChannels.get(name);
        if (channel === undefined) throw new Error(`Unknown event channel: ${name}`);
        return channel;
    }

 
    private findCorrespondingJoin(node: ccfg.Node): ccfg.Join | undefined {
        const reachableJoin = findFirstReachableJoin(node);
        if (reachableJoin !== undefined) return reachableJoin;
        for (const uid of node.syncNodeIds) {
            const syncNode = this.ccfg.getNodeByUID(uid);
            if (syncNode instanceof ccfg.Join || syncNode?.getType() === "AndJoin" || syncNode?.getType() === "OrJoin") {
                return syncNode as ccfg.Join;
            }
        }
        return undefined;
    }

    private createThread(owner: ccfg.Node, currentNode: ccfg.Node, parentId?: number, waitingJoin?: ccfg.Join, locals?: Map<string, unknown>): RuntimeThread {
        return new RuntimeThread(this.nextThreadId++, owner, currentNode, parentId, waitingJoin, locals);
    }

    private findThread(threadId: number): RuntimeThread | undefined {
        return this.findQueueEntry(threadId)?.thread;
    }

    private encodeVariablesReference(threadId: number, scope: types.ScopeSnapshot["name"]): number {
        const scopeId = scope === "locals" ? 1 : scope === "globals" ? 2 : 3;
        return threadId * 10 + scopeId;
    }

    private decodeVariablesReference(variablesReference: number): { threadId: number; scope: types.ScopeSnapshot["name"] } | undefined {
        const scopeId  = variablesReference % 10;
        const threadId = Math.floor(variablesReference / 10);
        if (threadId <= 0) return undefined;
        if (scopeId === 1) return { threadId, scope: "locals" };
        if (scopeId === 2) return { threadId, scope: "globals" };
        if (scopeId === 3) return { threadId, scope: "temporaries" };
        return undefined;
    }

    private endThread(thread: RuntimeThread): void {
        this.removeThread(thread);
        this.lastEvent = { kind: "thread-end", threadId: thread.id };
        if (thread.currentNode !== undefined) this.lastEvent.nodeUid = thread.currentNode.uid;
    }

    private removeThread(thread: RuntimeThread): void {
        const index = this.executionQueue.findIndex(entry => entry.thread.id === thread.id);
        if (index >= 0) this.removeThreadAt(index);
    }

    private removeThreadAt(index: number): void {
        this.executionQueue.splice(index, 1);
        if (this.lastThreadIndex >= this.executionQueue.length) {
            this.lastThreadIndex = this.executionQueue.length - 1;
        }
    }

    private nextRunnableThreadIndex(): number {
        const runnable = this.executionQueue.filter(entry => this.isRunnable(entry));
        if (runnable.length === 0) return -1;
        const selected = this.scheduler.nextThread(runnable.map(entry => entry.thread), this.lastRunnableIndex(runnable));
        const entry = runnable[selected];
        if (entry === undefined) return -1;
        return this.executionQueue.findIndex(candidate => candidate.thread.id === entry.thread.id);
    }

    private lastRunnableIndex(runnable: ExecutionQueueEntry[]): number {
        if (this.lastThreadIndex < 0) return -1;
        const lastEntry = this.executionQueue[this.lastThreadIndex];
        if (lastEntry === undefined) return -1;
        return runnable.findIndex(entry => entry.thread.id === lastEntry.thread.id);
    }

    private isRunnable(entry: ExecutionQueueEntry): boolean {
        const thread = entry.thread;
        if (thread.currentNode === undefined) return false;
        if (entry.waitingEvent !== undefined) return false;
        return entry.readyAt <= this.T;
    }

    private hasRunnableThread(): boolean {
        return this.executionQueue.some(entry => this.isRunnable(entry));
    }

    private hasScheduledThread(): boolean {
        return this.executionQueue.some(entry => entry.readyAt > this.T);
    }

    private enqueueThread(thread: RuntimeThread, readyAt = this.T): void {
        this.executionQueue.push({
            thread,
            readyAt,
            order: this.nextQueueOrder++
        });
        this.sortExecutionQueue();
    }

    private findQueueEntry(threadId: number): ExecutionQueueEntry | undefined {
        return this.executionQueue.find(entry => entry.thread.id === threadId);
    }

    private setThreadReadyAt(thread: RuntimeThread, readyAt: number): void {
        const entry = this.findQueueEntry(thread.id);
        if (entry === undefined) return;
        entry.readyAt = readyAt;
        delete entry.waitingEvent;
        this.sortExecutionQueue();
    }

    private setThreadWaitingEvent(thread: RuntimeThread, channelName: string): void {
        const entry = this.findQueueEntry(thread.id);
        if (entry === undefined) return;
        entry.waitingEvent = channelName;
        entry.readyAt = this.T;
    }

    private unblockEventWaiters(channelName: string): void {
        for (const entry of this.executionQueue) {
            if (entry.waitingEvent === channelName) {
                delete entry.waitingEvent;
                entry.readyAt = this.T;
            }
        }
        this.sortExecutionQueue();
    }

    private sortExecutionQueue(): void {
        this.executionQueue.sort((left, right) =>
            left.readyAt - right.readyAt || left.order - right.order
        );
    }

    private result(reason?: types.PauseReason | "thread-end", error?: unknown): types.StepResult {
        const currentThread = this.getCurrentThread();
        const currentNode   = this.getCurrentNode();
        const result: types.StepResult = {
            status:    this.status,
            stepCount: this.stepCount
        };
        if (reason !== undefined && reason !== "thread-end") result.reason = reason;
        if (currentThread !== undefined) result.currentThread = currentThread;
        if (currentNode   !== undefined) result.currentNode   = currentNode;
        if (this.lastEvent !== undefined) result.event        = this.lastEvent;
        if (error !== undefined) result.error                 = error;
        return result;
    }

    private getDebugState(phase: string): Record<string, unknown> {
        const currentThread = this.getCurrentThread();
        const currentNode = this.getCurrentNode();
        return {
            phase,
            status: this.status,
            T: this.T,
            stepCount: this.stepCount,
            currentThreadId: currentThread?.id,
            currentNodeUid: currentNode?.uid,
            currentNodeType: currentNode?.type,
            queue: this.getQueueDebugState(),
            globals: Object.fromEntries(this.sigma)
        };
    }

    private getQueueDebugState(): Array<Record<string, unknown>> {
        return this.executionQueue.map(entry => ({
            threadId: entry.thread.id,
            nodeUid: entry.thread.currentNode?.uid,
            nodeType: entry.thread.currentNode?.getType(),
            readyAt: entry.readyAt,
            waitingEvent: entry.waitingEvent,
            locals: Object.fromEntries(entry.thread.locals)
        }));
    }
}


function mapVariables(
    variables: Map<string, unknown>,
    nameMap?: Map<string, string>
): types.VariableSnapshot[] {
    return [...variables.entries()].map(([name, value]) => ({
        name: nameMap?.get(name) ?? name, 
        value,
        type: typeof value,
        variablesReference: 0
    }));
}

function looseEquals(left: unknown, right: unknown): boolean {
    return left == right;
}

export async function executeCCFG(ccfg: ccfg.CCFG, options: types.CCFGInterpreterOptions & types.RunOptions = {}): Promise<types.StepResult> {
    const interpreter = new CCFGInterpreter(ccfg, options);
    return interpreter.run(options);
}
