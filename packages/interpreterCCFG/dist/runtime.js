export class RoundRobinScheduler {
    nextThread(threads, lastThreadIndex) {
        if (threads.length === 0) {
            return -1;
        }
        return (lastThreadIndex + 1) % threads.length;
    }
}
export class RealClock {
    now() {
        return Date.now();
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));
    }
}
export class RuntimeThread {
    id;
    owner;
    parentId;
    waitingJoin;
    currentNode;
    locals = new Map();
    tempValues = [];
    constructor(id, owner, currentNode, parentId, waitingJoin) {
        this.id = id;
        this.owner = owner;
        this.currentNode = currentNode;
        this.parentId = parentId;
        this.waitingJoin = waitingJoin;
    }
    snapshot() {
        const snapshot = {
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
