export var NodeType;
(function (NodeType) {
    NodeType["starts"] = "starts";
    NodeType["terminates"] = "terminates";
    NodeType["multipleSynchro"] = "multipleSynchro";
})(NodeType = NodeType || (NodeType = {}));
export class Node {
    static uidCounter = 0;
    uid;
    owningCCFG = undefined;
    astNode;
    outputEdges = [];
    inputEdges = [];
    type = undefined;
    syncNodeIds = [];
    functionsNames = [];
    params = [];
    functionsDefs;
    returnType = undefined;
    numberOfVisits = 0;
    isCycleInitiator = false;
    cycles = [];
    isVisited = false;
    constructor(astNode, type, theActions = []) {
        this.uid = Node.uidCounter++;
        this.astNode = astNode;
        this.type = type;
        this.functionsDefs = theActions;
    }
    getType() { return this.constructor.name; }
    isBefore(n2) {
        if (this.isVisited) {
            // console.log(chalk.red("error: already visited"+this.uid));
            return false;
        }
        this.isVisited = true;
        if (this.outputEdges.length == 0) {
            // console.log(chalk.gray("ending node reached"));
            this.isVisited = false;
            return false;
        }
        for (const e of this.outputEdges) {
            if (e.to === n2) {
                // console.log(chalk.gray("info: "+this.uid+" is before "+n2.uid));
                this.isVisited = false;
                return true;
            }
        }
        for (const e of this.outputEdges) {
            // console.log(chalk.gray("info: moving to node"+e.to.uid));
            return e.to.isBefore(n2);
        }
        // console.log(chalk.green("info: no path found from "+this.uid+" to "+n2.uid));
        this.isVisited = false;
        return false;
    }
    cyclePossessAnAndJoin() {
        return this.cycles.some(c => {
            return c.some(n => {
                // console.log(n.uid+":"+n.getType())
                if (n.getType() == "AndJoin") {
                    return true;
                }
                return false;
            });
        });
    }
}
export class Step extends Node {
    constructor(astNode, type, theActions = []) {
        super(astNode, type, theActions);
    }
}
export class Choice extends Node {
    constructor(astNode) {
        super(astNode);
    }
}
export class Join extends Node {
    constructor(astNode) {
        super(astNode, NodeType.multipleSynchro);
    }
}
export class Fork extends Node {
    constructor(astNode) {
        super(astNode);
    }
}
export class OrJoin extends Join {
    constructor(astNode) {
        super(astNode);
    }
}
export class AndJoin extends Join {
    constructor(astNode) {
        super(astNode);
    }
}
export class Hole extends Node {
    constructor(astNode) {
        super(astNode);
    }
}
export class TimerHole extends Hole {
    duration = 0;
    constructor(astNode, duration) {
        super(astNode);
        this.duration = duration;
    }
}
export class CollectionHole extends Hole {
    astNodeCollection;
    constructor(astNode) {
        super(undefined);
        this.astNodeCollection = astNode;
    }
    isSequential = false;
    parallelSyncPolicy = "lastOf";
}
