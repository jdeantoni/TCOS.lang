import { EventEmitter } from 'events';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

export interface FileAccessor {
	isWindows: boolean;
	readFile(path: string): Promise<Uint8Array>;
	writeFile(path: string, contents: Uint8Array): Promise<void>;
}
export interface RuntimeVisualization {

    dot: string;

    activeNodes: {
        nodeUid: number;
        threadId: number;
        color: string;
    }[];

    threadPositions: {
        id: number;
        file: string;
        line: number;
    }[];

    threads: {
        id: number;
        label: string;
        color: string;
        T: number;
    }[];
}

export interface RuntimeCapabilities {
    threads: boolean;
    events: boolean;
    time: boolean;
    mutableVariables: boolean;
    stateMachines: boolean;
    currentNode?: {
        uid: number;
        type: string;
    };
    lastEvent?: {
        kind: string;
        message?: string;
        data?: unknown;
    };
}
export interface IRuntimeBreakpoint {
	id: number;
	line: number;
	verified: boolean;
}

interface IRuntimeStepInTargets {
	id: number;
	label: string;
}

interface IRuntimeStackFrame {
	index: number;
	name: string;
	file: string;
	line: number;
	column?: number;
	instruction?: number;
}

interface IRuntimeStack {
	count: number;
	frames: IRuntimeStackFrame[];
}

export type IRuntimeVariableType = number | boolean | string | RuntimeVariable[];

export class RuntimeVariable {
	private _memory?: Uint8Array;
	public reference?: number;

	constructor(public readonly name: string, private _value: IRuntimeVariableType) {}

	public get value() {
		return this._value;
	}

	public set value(value: IRuntimeVariableType) {
		this._value = value;
		this._memory = undefined;
	}

	public get memory() {
		if (this._memory === undefined && typeof this._value === 'string') {
			this._memory = new TextEncoder().encode(this._value);
		}
		return this._memory;
	}

	public setMemory(data: Uint8Array, offset = 0) {
		const memory = this.memory;
		if (!memory) {
			return;
		}
		memory.set(data, offset);
		this._memory = memory;
		this._value = new TextDecoder().decode(memory);
	}
}

export function timeout(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export class CCFGRuntime extends EventEmitter {
	private ccfg: any;
	private interpreter: any;
	private interpreterModulePromise: Promise<any> | undefined;
	private sourceFile = '';
	private breakpointId = 1;
	private breakpoints = new Map<string, IRuntimeBreakpoint[]>();
	private locals = new Map<string, RuntimeVariable>();
	private globals = new Map<string, RuntimeVariable>();
	private selectedThreadId: number | undefined;

	constructor(private fileAccessor: FileAccessor) {
		super();
		void this.fileAccessor;
	}

	public get sourceFilePath() {
		return this.sourceFile;
	}

	public async start(ccfg: any, sourceFile: string, stopOnEntry: boolean, debug: boolean): Promise<void> {
		this.ccfg = ccfg;
		this.sourceFile = sourceFile;
		const { CCFGInterpreter } = await this.loadInterpreterModule();
		console.log("interpreter module loaded")
		this.interpreter = new CCFGInterpreter(ccfg, { stopOnEntry, debug, prepareCCFG: false });
		this.applyBreakpoints();
		this.syncVariables();

		if (stopOnEntry) {
			this.sendEvent('stopOnEntry');
			return;
		}

	
		this.continue(false);
	
	}

	public clearBreakpoints(pathValue: string): void {
		this.breakpoints.delete(this.normalizePathAndCasing(pathValue));
		this.applyBreakpoints();
	}

	public clearBreakPoint(pathValue: string, line: number): IRuntimeBreakpoint | undefined {
		const pathKey = this.normalizePathAndCasing(pathValue);
		const list = this.breakpoints.get(pathKey);
		if (list === undefined) {
			return undefined;
		}
		const index = list.findIndex(breakpoint => breakpoint.line === line);
		if (index < 0) {
			return undefined;
		}
		const [removed] = list.splice(index, 1);
		if (list.length === 0) {
			this.breakpoints.delete(pathKey);
		}
		this.applyBreakpoints();
		return removed;
	}

	public async setBreakPoint(pathValue: string, line: number): Promise<IRuntimeBreakpoint> {
		const pathKey = this.normalizePathAndCasing(pathValue);
		const bp: IRuntimeBreakpoint = { verified: false, line, id: this.breakpointId++ };
		const list = this.breakpoints.get(pathKey) ?? [];
		list.push(bp);
		this.breakpoints.set(pathKey, list);
		this.applyBreakpoints();
		return bp;
	}

	public getBreakpoints(pathValue: string, line: number): number[] {
		const pathKey = this.normalizePathAndCasing(pathValue);
		const nodes = this.getNodesForPath(pathKey).filter(node => this.toDebuggerLine(node.source?.line) === line);
		return nodes.map(node => this.toDebuggerColumn(node.source?.column) ?? 0);
	}

	public continue(reverse: boolean): void {
		void this.runContinue(reverse);
	}

	public stepOver(reverse: boolean): void {
		void this.runStep("over", reverse);
	}

	public stepIn(targetId: number | undefined): void {
		void this.runStep("into", false);
	}

	public stepOut(): void {
		void this.runStep("out", false);
	}

	public step(instruction: boolean, reverse: boolean): void {
		void this.runStep(instruction ? "into" : "over", reverse);
	}

	public getStepInTargets(frameId: number): IRuntimeStepInTargets[] {
		const current = this.getCurrentNode();
		if (current === undefined || frameId < 0) {
			return [];
		}
		const node = this.ccfg?.getNodeByUID?.(current.uid);
		if (node === undefined) {
			return [];
		}
		return node.outputEdges.map((edge: any) => ({ id: edge.to.uid, label: `${edge.to.getType()} ${edge.to.uid}` }));
	}

	public stack(startFrame: number, endFrame: number, threadId?: number): IRuntimeStack {
		if (this.interpreter === undefined) {
			return { count: 0, frames: [] };
		}
		const resolvedThreadId = this.resolveThreadId(threadId);
		if (resolvedThreadId === undefined) {
			return { count: 0, frames: [] };
		}
		this.selectedThreadId = resolvedThreadId;

		const frames = (this.interpreter.getStackTrace(resolvedThreadId) ?? []).map((frame: any) => {
			const source = frame.source ?? frame.node?.source;
			return {
				index: resolvedThreadId,
				name: frame.name ?? `Thread ${resolvedThreadId}`,
				file: source?.path ?? this.sourceFile,
				line: this.toDebuggerLine(source?.line) ?? 0,
				column: this.toDebuggerColumn(source?.column),
				instruction: frame.node?.uid
			};
		});

		return {
			count: frames.length,
			frames: frames.slice(startFrame, endFrame)
		};
	}

	public getThreads(): Array<{ id: number; name: string }> {
		const snapshot = this.interpreter?.getSnapshot?.();
		if (snapshot?.threads?.length) {
			return snapshot.threads.map((thread: any) => ({ id: thread.id, name: `thread ${thread.id}` }));
		}
		return [{ id: 1, name: 'thread 1' }];
	}

	public getStoppedThreadId(): number {
		return this.getCurrentThreadId() ?? 1;
	}

	public selectThread(threadId: number | undefined): void {
		if (this.resolveThreadId(threadId) !== undefined) {
			this.selectedThreadId = threadId;
		}
	}

	public getLocalVariables(): RuntimeVariable[] {
		this.syncVariables();
		return Array.from(this.locals.values());
	}

	public async getGlobalVariables(_cancellationToken?: () => boolean): Promise<RuntimeVariable[]> {
		this.syncVariables();
		return Array.from(this.globals.values());
	}

	public getLocalVariable(name: string): RuntimeVariable | undefined {
		this.syncVariables();
		return this.locals.get(name);
	}

	public setVariable(scopeName: 'locals' | 'globals' | 'temporaries', name: string, value: IRuntimeVariableType): boolean {
		if (this.interpreter?.setVariable === undefined) {
			return false;
		}
		const threadId = this.resolveThreadId(this.selectedThreadId);
		if (threadId === undefined) {
			return false;
		}
		const scope = (this.interpreter.getScopes(threadId) ?? []).find((candidate: any) => candidate.name === scopeName);
		if (scope === undefined) {
			return false;
		}
		const didSet = this.interpreter.setVariable(scope.variablesReference, name, value);
		this.syncVariables();
		return didSet;
	}

	public setDataBreakpoint(_address: string, _accessType: 'read' | 'write' | 'readWrite'): boolean {
		return true;
	}

	public clearAllDataBreakpoints(): void {
		return;
	}

	public setExceptionsFilters(_namedException: string | undefined, _otherExceptions: boolean): void {
		return;
	}

	public setInstructionBreakpoint(_address: number): boolean {
		return true;
	}

	public clearInstructionBreakpoints(): void {
		return;
	}

	public disassemble(address: number, instructionCount: number): Array<{ address: number; instruction: string; line?: number }> {
		const nodes = this.ccfg?.nodes ?? [];
		return nodes.slice(address, address + instructionCount).map((node: any, index: number) => ({
			address: address + index,
			instruction: `${node.getType()} ${node.uid}`,
			line: this.toDebuggerLine(node.source?.line)
		}));
	}

	public pause(): any {
		const result = this.interpreter?.pause?.();
		this.syncVariables();
		return result ?? { status: 'paused', stepCount: 0 };
	}

	public stop(): any {
		//console.log('[CCFGRuntime.stop]', this.getInterpreterDebugState('before-stop'));
		const result = this.interpreter?.stop?.();
		this.syncVariables();
		//console.log('[CCFGRuntime.stop]', { ...this.getInterpreterDebugState('after-stop'), result });
		return result ?? { status: 'stopped', stepCount: 0 };
	}

	private async runContinue(_reverse: boolean): Promise<void> {
		if (this.interpreter === undefined) {
			return;
		}
		const result = await this.interpreter.continueExecution({ ignoreBreakpoints: false });
		this.syncVariables();
		this.emitStopForResult(result);
	}

	private async runStep(mode: "over" | "into" | "out", _reverse: boolean): Promise<void> {
		if (this.interpreter === undefined) return;

		//console.log('[CCFGRuntime.runStep]', { mode, ...this.getInterpreterDebugState('before-step') });
		const result = mode === "into"
			? await this.interpreter.stepIn({ ignoreBreakpoints: true })
			: mode === "out"
				? await this.interpreter.stepOut({ ignoreBreakpoints: true })
				: await this.interpreter.stepOver({ ignoreBreakpoints: true });
		this.syncVariables();
		/*console.log('[CCFGRuntime.runStep]', {
			mode,
			...this.getInterpreterDebugState('after-step'),
			result,
			locals: Array.from(this.locals.entries()).map(([name, variable]) => ({ name, value: variable.value })),
			globals: Array.from(this.globals.entries()).map(([name, variable]) => ({ name, value: variable.value }))
		});*/
		this.emitStopForResult(result);
	}

	private emitStopForResult(result: any): void {
		if (result?.reason === 'breakpoint') {
			this.sendEvent('stopOnBreakpoint');
			return;
		}
		if (result?.status === 'terminated' || result?.reason === 'terminated') {
			this.sendEvent('end');
			return;
		}
		if (result?.status === 'paused' || result?.reason === 'step') {
			this.sendEvent('stopOnStep');
			return;
		}
		this.sendEvent('stopOnStep');
	}

	private syncVariables(): void {
		this.locals.clear();
		this.globals.clear();
		if (this.interpreter === undefined) {
			return;
		}

		const snapshot = this.interpreter.getSnapshot?.();
		const threadId = this.getCurrentThreadId();
		/*console.log('[CCFGRuntime.syncVariables]', {
			threadId,
			status: snapshot?.status,
			stepCount: snapshot?.stepCount,
			currentThreadId: snapshot?.currentThread?.id,
			currentNodeUid: snapshot?.currentNode?.uid,
			threadIds: snapshot?.threads?.map((thread: any) => thread.id) ?? [],
			globalKeys: Object.keys(snapshot?.globals ?? {})
		});*/
		if (threadId === undefined) {
			for (const [name, value] of Object.entries(snapshot?.globals ?? {})) {
				this.globals.set(name, new RuntimeVariable(name, this.toRuntimeValue(value)));
			}
			return;
		}

		for (const scope of this.interpreter.getScopes(threadId) ?? []) {
			const values = this.interpreter.getVariables(scope.variablesReference) ?? [];
			const target = scope.name === 'locals' ? this.locals : scope.name === 'globals' ? this.globals : undefined;
			if (target === undefined) {
				continue;
			}
			for (const value of values) {
				target.set(value.name, new RuntimeVariable(value.name, this.toRuntimeValue(value.value)));
			}
		}
		for (const [name, value] of Object.entries(snapshot?.globals ?? {})) {
			if (name.startsWith('__')) {
				this.globals.set(name, new RuntimeVariable(name, this.toRuntimeValue(value)));
			}
		}
	}

	private toRuntimeValue(value: unknown): IRuntimeVariableType {
		if (Array.isArray(value)) {
			return value.map((item, index) => new RuntimeVariable(`[${index}]`, this.toRuntimeValue(item)));
		}
		if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
			return value;
		}
		return value as unknown as IRuntimeVariableType;
	}

	private getCurrentThreadId(): number | undefined {
		const snapshot = this.interpreter?.getSnapshot?.();
		if (this.selectedThreadId !== undefined && snapshot?.threads?.some((thread: any) => thread.id === this.selectedThreadId)) {
			return this.selectedThreadId;
		}
		return snapshot?.currentThread?.id ?? snapshot?.threads?.[0]?.id;
	}

	private resolveThreadId(threadId: number | undefined): number | undefined {
		const snapshot = this.interpreter?.getSnapshot?.();
		if (threadId !== undefined && snapshot?.threads?.some((thread: any) => thread.id === threadId)) {
			return threadId;
		}
		return snapshot?.currentThread?.id ?? snapshot?.threads?.[0]?.id;
	}

	private getCurrentNode(): any | undefined {
		return this.interpreter?.getSnapshot?.().currentNode;
	}

	/*private getInterpreterDebugState(phase: string): Record<string, unknown> {
		const snapshot = this.interpreter?.getSnapshot?.();
		return {
			phase,
			status: snapshot?.status,
			stepCount: snapshot?.stepCount,
			currentThreadId: snapshot?.currentThread?.id,
			currentNodeUid: snapshot?.currentNode?.uid,
			currentNodeType: snapshot?.currentNode?.type,
			threads: snapshot?.threads?.map((thread: any) => ({
				id: thread.id,
				currentNodeUid: thread.currentNodeUid,
				waitingJoinUid: thread.waitingJoinUid
			})) ?? [],
			globals: snapshot?.globals
		};
	}*/

	private getNodesForPath(pathKey: string): any[] {
		return (this.ccfg?.nodes ?? []).filter((node: any) => {
			const source = this.getNodeSource(node);
			if (source?.path === undefined) {
				return this.normalizePathAndCasing(this.sourceFile) === pathKey;
			}
			return this.normalizePathAndCasing(source.path) === pathKey;
		});
	}

	private getNodeSource(node: any): any {
		const source = node?.source;
		if (source !== undefined) {
			return source;
		}
		const range = node?.astNode?.$cstNode?.range;
		const uri = node?.astNode?.$cstNode?.root?.textDocument?.uri;
		if (range === undefined) {
			return undefined;
		}
		return {
			path: uri,
			line: range.start.line + 1,
			column: range.start.character + 1,
			endLine: range.end.line + 1,
			endColumn: range.end.character + 1
		};
	}

	private applyBreakpoints(): void {
		if (this.interpreter === undefined || this.ccfg === undefined) {
			return;
		}

		this.interpreter.clearBreakpoints?.();
		const nodeIds: number[] = [];
		for (const [pathKey, breakpoints] of this.breakpoints.entries()) {
			for (const breakpoint of breakpoints) {
				breakpoint.verified = false;
				const nodes = this.getNodesForPath(pathKey)
					.filter(node => this.toDebuggerLine(this.getNodeSource(node)?.line) === breakpoint.line)
					.map(node => node.uid);
				if (nodes.length > 0) {
					nodeIds.push(...nodes);
					breakpoint.verified = true;
					this.sendEvent('breakpointValidated', breakpoint);
				}
			}
		}

		if (nodeIds.length > 0) {
			this.interpreter.setBreakpoints?.(nodeIds);
		}
	}

	private async loadInterpreterModule(): Promise<any> {
		if (this.interpreterModulePromise === undefined) {
			const modulePath = path.resolve(__dirname, '../../interpreterCCFG/out/src/InterpretCCFG.js');
			const dynamicImport = new Function('specifier', 'return import(specifier);') as (specifier: string) => Promise<any>;
			this.interpreterModulePromise = dynamicImport(pathToFileURL(modulePath).href);
		}
		return this.interpreterModulePromise;
	}

	private toDebuggerLine(line: number | undefined): number | undefined {
		return line === undefined ? undefined : Math.max(0, line - 1);
	}

	private toDebuggerColumn(column: number | undefined): number | undefined {
		return column === undefined ? undefined : Math.max(0, column - 1);
	}

	private normalizePathAndCasing(pathValue: string): string {
		if (!pathValue) {
			throw new Error('path is undefined');
		}
		if (this.fileAccessor.isWindows) {
			return pathValue.replace(/\//g, '\\').toLowerCase();
		}
		return pathValue.replace(/\\/g, '/');
	}

	private sendEvent(event: string, ...args: any[]): void {
		setTimeout(() => {
			this.emit(event, ...args);
		}, 0);
	}
	public getVisualization(): RuntimeVisualization {
    const COLORS = [
        '#FF5050', '#5050FF', '#50C850', '#FFB400', '#B400FF',
        '#00C8FF', '#FF9600', '#C800C8', '#00C896', '#FF0096'
    ];

    const threads = this.getThreads();
    const snapshot = this.interpreter?.getSnapshot?.();
    const T = snapshot?.globals?.['__T'] ?? 0;

    return {
        dot: this.ccfg?.toDot?.() ?? '',
        activeNodes: (snapshot?.threads ?? []).map((t: any, i: number) => ({
            nodeUid:  t.currentNodeUid,
            threadId: t.id,
            color:    COLORS[i % COLORS.length]
        })),
        threadPositions: (snapshot?.threads ?? []).flatMap((t: any, i: number) => {
            const node = this.ccfg?.getNodeByUID?.(t.currentNodeUid);
            const source = node === undefined ? undefined : this.getNodeSource(node);
            if (source?.line === undefined || source.line <= 0) {
                return [];
            }
            return [{
                id:    t.id,
                file:  source.path ?? this.sourceFile,
                line:  source.line,
                color: COLORS[i % COLORS.length]
            }];
        }),
        threads: threads.map((t, i) => {
            const threadSnapshot = snapshot?.threads?.find((thread: any) => thread.id === t.id);
            const node = this.getNodeByUid(threadSnapshot?.currentNodeUid);
            return {
                id:    t.id,
                label: this.getThreadLabel(t.id, node),
                color: COLORS[i % COLORS.length],
                T:     Number(T)
            };
        })
    };
}

public getCapabilities(): RuntimeCapabilities {
    const snapshot = this.interpreter?.getSnapshot?.();
    const currentNode = this.getNodeByUid(snapshot?.currentNode?.uid);
    const activeNodes = (snapshot?.threads ?? [])
        .map((thread: any) => this.getNodeByUid(thread.currentNodeUid))
        .filter((node: any | undefined): node is any => node !== undefined);
    const relevantNodes = [
        currentNode,
        ...activeNodes
    ].filter((node: any | undefined): node is any => node !== undefined);
    const lastEvent = snapshot?.lastEvent;

    const hasThreads =
        (snapshot?.threads?.length ?? 0) > 1
        || relevantNodes.some(node => this.isParallelNode(node))
        || lastEvent?.kind === 'fork'
        || lastEvent?.kind === 'join'
        || lastEvent?.kind === 'thread-start'
        || lastEvent?.kind === 'thread-end';

    const hasEvents =
        relevantNodes.some(node => this.nodeHasInstruction(node, 'Event'))
        || lastEvent?.kind === 'event';

    const hasTime =
        Number(snapshot?.globals?.['__sleeping'] ?? 0) > 0
        || relevantNodes.some(node => this.nodeHasInstruction(node, 'Sleep'))
        || lastEvent?.kind === 'sleep';

    const mutableNames = [
        ...this.getLocalVariables().map(variable => variable.name),
        ...Array.from(this.globals.keys()).filter(name => !name.startsWith('__'))
    ];

    const hasStateMachine =
        relevantNodes.some(node => /state|fsm/i.test(`${node.getType?.() ?? ''} ${node.functionsNames?.join(' ') ?? ''}`))
        || mutableNames.some(name => /state|fsm/i.test(name));

    const capabilities: RuntimeCapabilities = {
        threads: hasThreads,
        events: hasEvents,
        time: hasTime,
        mutableVariables: mutableNames.length > 0,
        stateMachines: hasStateMachine
    };

    if (currentNode !== undefined) {
        capabilities.currentNode = {
            uid: currentNode.uid,
            type: currentNode.getType?.() ?? 'Node'
        };
    }
    if (lastEvent !== undefined) {
        capabilities.lastEvent = {
            kind: lastEvent.kind,
            message: lastEvent.message,
            data: lastEvent.data
        };
    }

    return capabilities;
}

public async advanceTime(): Promise<any> {
    if (this.interpreter === undefined) return;
    const result = await this.interpreter.continueExecution({ 
        ignoreBreakpoints: true, 
        maxSteps: 1 
    });
    this.syncVariables();
    return result;
}

public async stepThread(threadId: number): Promise<any> {
    if (this.interpreter === undefined) return;
    const result = await this.interpreter.step({ 
        ignoreBreakpoints: false,
        threadId 
    });
    this.syncVariables();
    return result;
}

private getNodeByUid(uid: number | undefined): any | undefined {
    if (uid === undefined) return undefined;
    return this.ccfg?.getNodeByUID?.(uid);
}

private isParallelNode(node: any): boolean {
    const type = node.getType?.();
    return type === 'Fork' || type === 'AndJoin' || type === 'OrJoin' || type === 'Join';
}

private nodeHasInstruction(node: any, pattern: string): boolean {
    return (node.functionsDefs ?? []).some((instruction: any) =>
        instruction?.constructor?.name?.includes(pattern)
    );
}

private getThreadLabel(threadId: number, node: any | undefined): string {
    if (node === undefined) {
        return `Thread ${threadId}`;
    }
    const type = node.getType?.() ?? 'Node';
    return `Thread ${threadId} · ${type} ${node.uid}`;
}

	
}
