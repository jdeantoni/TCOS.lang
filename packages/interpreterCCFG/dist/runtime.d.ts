import type * as ccfg from "ccfg";
import type { ThreadSnapshot } from "./types.js";
export interface Scheduler {
    nextThread(threads: RuntimeThread[], lastThreadIndex: number): number;
}
export interface Clock {
    now(): number;
    sleep(ms: number): Promise<void>;
}
export declare class RoundRobinScheduler implements Scheduler {
    nextThread(threads: RuntimeThread[], lastThreadIndex: number): number;
}
export declare class RealClock implements Clock {
    now(): number;
    sleep(ms: number): Promise<void>;
}
export declare class RuntimeThread {
    readonly id: number;
    readonly owner: ccfg.Node;
    readonly parentId: number | undefined;
    readonly waitingJoin: ccfg.AndJoin | undefined;
    currentNode: ccfg.Node | undefined;
    readonly locals: Map<string, unknown>;
    readonly tempValues: unknown[];
    constructor(id: number, owner: ccfg.Node, currentNode: ccfg.Node, parentId?: number, waitingJoin?: ccfg.AndJoin);
    snapshot(): ThreadSnapshot;
}
