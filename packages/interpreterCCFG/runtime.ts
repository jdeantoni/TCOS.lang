import type * as ccfg from "ccfg";
import type { ThreadSnapshot } from "./types.js";

export interface Scheduler {
    nextThread(threads: RuntimeThread[], lastThreadIndex: number): number;
}

export interface Clock {
    now(): number;
    sleep(ms: number): Promise<void>;
}

export class RoundRobinScheduler implements Scheduler {
    nextThread(threads: RuntimeThread[], lastThreadIndex: number): number {
        if (threads.length === 0) {
            return -1;
        }
        return (lastThreadIndex + 1) % threads.length;
    }
}

export class RealClock implements Clock {
    now(): number {
        return Date.now();
    }

    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));
    }
}

export class RuntimeThread {
    readonly id: number;
    readonly owner: ccfg.Node;
    readonly parentId: number | undefined;
    readonly waitingJoin: ccfg.Join | undefined;
    currentNode: ccfg.Node | undefined;
    readonly locals: Map<string, unknown>;
    readonly tempValues: unknown[] = [];

    constructor(id: number, owner: ccfg.Node, currentNode: ccfg.Node, parentId?: number, waitingJoin?: ccfg.Join, locals?: Map<string, unknown>) {
        this.id = id;
        this.owner = owner;
        this.currentNode = currentNode;
        this.parentId = parentId;
        this.waitingJoin = waitingJoin;
        this.locals = locals ?? new Map<string, unknown>();
    }

    snapshot(): ThreadSnapshot {
        const snapshot: ThreadSnapshot = {
            id: this.id,
            ownerUid: this.owner.uid,
            tempValues: [...this.tempValues]
        };
        if (this.currentNode !== undefined) {
            snapshot.currentNodeUid = this.currentNode.uid;
        }
        if (this.parentId !== undefined) {
            snapshot.parentId = this.parentId;
        }
        if (this.waitingJoin !== undefined) {
            snapshot.waitingJoinUid = this.waitingJoin.uid;
        }
        return snapshot;
    }
}
