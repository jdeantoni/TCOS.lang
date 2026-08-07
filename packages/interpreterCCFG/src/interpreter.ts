import * as ccfg from "ccfg";
import { getCurrentNode, getCurrentSourceKey, getCurrentThread, getScopes, getSnapshot, getStackTrace, getThreads, getVariables, result } from "./debug-state.js";
import { resume, step, stepInto, stepOver } from "./execution.js";
import { prepareCCFG, snapshotNode } from "./graph-utils.js";
import { DiscreteClock, RandomScheduler } from "./runtime.js";
import { createRuntimeState, type InterpreterRuntimeState } from "./state.js";
import { createThread, enqueueThread, findThread, getSleepingThreads } from "./thread-queue.js";
import type * as types from "./types.js";

export { DiscreteClock } from "./runtime.js";

export class CCFGInterpreter {
    private readonly state: InterpreterRuntimeState;

    constructor(ccfg: ccfg.CCFG, options: types.CCFGInterpreterOptions = {}) {
        const scheduler = options.scheduler ?? new RandomScheduler();
        this.state = createRuntimeState(ccfg, options, scheduler);

        if (options.prepareCCFG ?? true) {
            prepareCCFG(this.state.ccfg);
        }
        this.reset(options.stopOnEntry ? "paused" : "ready");
    }

    get ccfg(): ccfg.CCFG {
        return this.state.ccfg;
    }

    get sigma(): Map<string, unknown> {
        return this.state.sigma;
    }

    get breakpoints(): Set<number> {
        return this.state.breakpoints;
    }

    get status(): types.InterpreterStatus {
        return this.state.status;
    }

    set status(status: types.InterpreterStatus) {
        this.state.status = status;
    }

    get stepCount(): number {
        return this.state.stepCount;
    }

    get lastEvent(): types.DebugEvent | undefined {
        return this.state.lastEvent;
    }

    get lastError(): unknown {
        return this.state.lastError;
    }

    get T(): number {
        return this.state.T;
    }

    static fromCCFG(ccfg: ccfg.CCFG, options: types.CCFGInterpreterOptions = {}): CCFGInterpreter {
        return new CCFGInterpreter(ccfg, options);
    }

    reset(status: types.InterpreterStatus = "ready"): void {
        this.state.sigma.clear();
        this.state.executionQueue.length = 0;
        this.state.joinStates.clear();
        this.state.eventChannels.clear();
        this.state.eventTokenToChannel.clear();
        this.state.T = 0;
        this.state.clock.advanceTo(0);
        this.state.stepCount = 0;
        this.state.lastThreadIndex = -1;
        this.state.nextThreadId = 1;
        this.state.nextQueueOrder = 1;
        this.state.lastEvent = undefined;
        this.state.lastError = undefined;
        this.state.reportedBreakpointUids.clear();

        if (this.state.ccfg.initialState === undefined) {
            this.state.status = "terminated";
            return;
        }
        this.buildSigmaNameMap();
        enqueueThread(this.state, createThread(this.state, this.state.ccfg.initialState, this.state.ccfg.initialState));
        this.state.status = status;
    }

    getSleepingThreads(): Array<{ t: number; threadId: number; nodeUid: number }> {
        return getSleepingThreads(this.state);
    }

    getCurrentSourceKey(): string | undefined {
        return getCurrentSourceKey(this.state);
    }

    setBreakpoint(nodeUid: number): void {
        this.state.breakpoints.add(nodeUid);
    }

    removeBreakpoint(nodeUid: number): void {
        this.state.breakpoints.delete(nodeUid);
    }

    clearBreakpoints(): void {
        this.state.breakpoints.clear();
        this.state.reportedBreakpointUids.clear();
    }

    setBreakpoints(nodeUids: number[]): types.Breakpoint[] {
        this.state.breakpoints.clear();
        this.state.reportedBreakpointUids.clear();
        const result: types.Breakpoint[] = [];
        for (const nodeUid of nodeUids) {
            const node = this.state.ccfg.getNodeByUID(nodeUid);
            if (node !== undefined) {
                this.state.breakpoints.add(nodeUid);
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
        return getThreads(this.state);
    }

    getCurrentThread(): types.ThreadSnapshot | undefined {
        return getCurrentThread(this.state);
    }

    getCurrentNode(): types.NodeSnapshot | undefined {
        return getCurrentNode(this.state);
    }

    getSnapshot(): types.InterpreterSnapshot {
        return getSnapshot(this.state);
    }

    getStackTrace(threadId: number): types.StackFrame[] {
        return getStackTrace(this.state, threadId);
    }

    getScopes(threadId: number): types.ScopeSnapshot[] {
        return getScopes(this.state, threadId);
    }

    getVariables(variablesReference: number): types.VariableSnapshot[] {
        return getVariables(this.state, variablesReference);
    }

    setVariable(variablesReference: number, name: string, value: unknown): boolean {
        const scope = this.getScopesForVariableReference(variablesReference);
        if (scope === undefined) return false;

        if (scope.scope === "globals") {
            if (name === "__T" && typeof value === "number") {
                this.state.T = value;
                this.state.clock.advanceTo(value);
                return true;
            }
            if (name.startsWith("__")) return false;
            this.state.sigma.set(this.toInternalGlobalName(name), value);
            return true;
        }

        const thread = findThread(this.state, scope.threadId);
        if (thread === undefined) return false;

        if (scope.scope === "locals") {
            thread.locals.set(name, value);
            return true;
        }

        const temporaryIndex = /^\[(\d+)\]$/.exec(name)?.[1];
        if (temporaryIndex === undefined) return false;
        const index = Number(temporaryIndex);
        if (!Number.isInteger(index) || index < 0 || index >= thread.tempValues.length) return false;
        thread.tempValues[index] = value;
        return true;
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
        return resume(this.state, options);
    }

    async step(options: types.RunOptions = {}): Promise<types.StepResult> {
        return step(this.state, options);
    }

    async next(options: types.RunOptions = {}): Promise<types.StepResult> {
        return this.stepOver(options);
    }

    async stepIn(options: types.RunOptions = {}): Promise<types.StepResult> {
        return stepInto(this.state, options);
    }

    async stepOver(options: types.RunOptions = {}): Promise<types.StepResult> {
        return stepOver(this.state, options);
    }

    async stepOut(options: types.RunOptions = {}): Promise<types.StepResult> {
        return stepOver(this.state, options);
    }

    pause(): types.StepResult {
        if (this.state.status === "running" || this.state.status === "ready") {
            this.state.status = "paused";
        }
        return result(this.state, "pause");
    }

    stop(): types.StepResult {
        this.state.status = "stopped";
        this.state.executionQueue.length = 0;
        return result(this.state, "stopped");
    }

    private buildSigmaNameMap(): void {
        this.state.sigmaNameMap.clear();
        for (const node of this.state.ccfg.nodes) {
            for (const instr of node.functionsDefs) {
                if (instr instanceof ccfg.CreateGlobalVarInstruction) {
                    const sourceName = (node.astNode as any)?.name as string | undefined;
                    if (sourceName) {
                        this.state.sigmaNameMap.set(instr.varName, sourceName);
                    }
                }
            }
        }
    }

    private getScopesForVariableReference(variablesReference: number): { threadId: number; scope: types.ScopeSnapshot["name"] } | undefined {
        const scopeId = variablesReference % 10;
        const threadId = Math.floor(variablesReference / 10);
        if (scopeId === 1) return { threadId, scope: "locals" };
        if (scopeId === 2) return { threadId, scope: "globals" };
        if (scopeId === 3) return { threadId, scope: "temporaries" };
        return undefined;
    }

    private toInternalGlobalName(name: string): string {
        for (const [internalName, sourceName] of this.state.sigmaNameMap) {
            if (sourceName === name) return internalName;
        }
        return name;
    }
}

export async function executeCCFG(ccfg: ccfg.CCFG, options: types.CCFGInterpreterOptions & types.RunOptions = {}): Promise<types.StepResult> {
    const interpreter = new CCFGInterpreter(ccfg, options);
    return interpreter.run(options);
}
