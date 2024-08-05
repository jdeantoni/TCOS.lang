"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AndJoin = exports.OrJoin = exports.Fork = exports.Join = exports.Choice = exports.Step = exports.SyncEdge = exports.CCFG = exports.Edge = exports.Node = exports.TypedElement = void 0;
const chalk_1 = __importDefault(require("chalk"));
class TypedElement {
    name = "";
    type = undefined;
    toString() {
        return (this.type == undefined ? "undefined" : this.type) + " " + this.name;
    }
}
exports.TypedElement = TypedElement;
class Node {
    static uidCounter = 0;
    uid;
    owningCCFG = undefined;
    value; //unused so far
    astNode; //unnused so far
    outputEdges = [];
    inputEdges = [];
    syncNodeIds = [];
    functionsNames = [];
    params = [];
    functionsDefs;
    returnType = undefined;
    numberOfVisits = 0;
    isCycleInitiator = false;
    cycles = [];
    constructor(value, theActions = []) {
        this.uid = Node.uidCounter++;
        this.value = value;
        this.functionsDefs = theActions;
    }
    getType() {
        return this.constructor.name;
    }
    isBefore(n2) {
        if (this.outputEdges.length == 0) {
            return false;
        }
        for (let e of this.outputEdges) {
            if (e.to === n2) {
                return true;
            }
        }
        for (let e of this.outputEdges) {
            return e.to.isBefore(n2);
        }
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
exports.Node = Node;
// export class ContainerNode extends Node {
//     internalccfg: CCFG;
//     constructor(value: any, theActions: string[] = []) {
//         super(value, theActions);
//         this.internalccfg = new CCFG();
//     }
//     addNode(node: Node): Node {
//         return this.internalccfg.addNode(node);
//     }
//     addEdge(from: Node, to: Node, label:string=""): Edge {
//         return this.internalccfg.addEdge(from, to, label);
//     }
//     toDot(): string {
//         return this.internalccfg.toDot();
//     }
//     getNodeFromName(name: string): Node | undefined {
//         let res = this.internalccfg.getNodeFromName(name);
//         if(res == undefined){
//             if(this.owningCCFG != undefined){
//                 return this.owningCCFG.getNodeFromName(name);
//             }
//         }
//         return res;
//     }
//     getNodeByUID(uid: integer): Node | undefined {
//         if(this.owningCCFG != undefined){
//             return this.owningCCFG.getNodeByUID(uid);
//         }
//         return this.internalccfg.getNodeByUID(uid);
//     }
//     replaceNode(oldNode: Node, newNode: Node): void {
//         this.internalccfg.replaceNode(oldNode, newNode);
//     }
// }
class Edge {
    static edgeUIDCounter = 0;
    from;
    to;
    label;
    astNode;
    guards;
    uid;
    constructor(from, to, label) {
        this.from = from;
        this.to = to;
        this.label = label;
        this.guards = [];
        this.uid = Edge.edgeUIDCounter++;
    }
}
exports.Edge = Edge;
class CCFG {
    nodes;
    edges;
    syncEdges = [];
    initialState;
    constructor() {
        this.nodes = [];
        this.edges = [];
    }
    addNode(node) {
        if (this.nodes.length == 0) {
            this.initialState = node;
        }
        if (node.owningCCFG != undefined) {
            node.owningCCFG.nodes = node.owningCCFG.nodes.filter(n => n.uid !== node.uid);
        }
        let res = this.nodes.find(n => n === node);
        if (res == undefined) {
            this.nodes.push(node);
        }
        node.owningCCFG = this;
        return node;
    }
    /**
     * add an edge between from and to. If the targetted node already has an input edge, manage the associated orJoin node
     *
     * @param from
     * @param to
     * @param label
     * @returns
     */
    addEdge(from, to, label = "") {
        let res = this.edges.find(e => e.from === from && e.to === to);
        if (res == undefined) {
            const edge = new Edge(from, to);
            this.edges.push(edge);
            from.outputEdges.push(edge);
            if (to.inputEdges.length == 0) {
                to.inputEdges.push(edge);
                return edge;
            }
            else { //already an input edge. check if an orJoin Node
                if (to.getType() == "OrJoin" || to.getType() == "AndJoin") {
                    edge.to = to;
                    to.inputEdges.push(edge);
                    return edge;
                }
                if (to.inputEdges.length == 1 && (to.inputEdges[0].from.getType() == "OrJoin" || to.inputEdges[0].from.getType() == "AndJoin")) {
                    console.log(chalk_1.default.bgYellow("adding to an existing or join node: " + to.value + " -> " + to.inputEdges[0].from.value + " -> " + to.inputEdges[0].from.uid + " " + to.inputEdges[0].from.getType() + " " + to.inputEdges[0].from.inputEdges.length + " " + to.inputEdges[0].from.inputEdges[0].from.value + " " + to.inputEdges[0].from.inputEdges[0].from.uid + " " + to.inputEdges[0].from.inputEdges[0].from.getType() + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges.length + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.value + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.uid + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.getType() + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges.length + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.value + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.uid + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.getType() + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges.length + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.value + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.uid + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.getType() + " " + to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges.length));
                    edge.to = to.inputEdges[0].from;
                    to.inputEdges[0].from.inputEdges.push(edge);
                    return edge;
                }
                else {
                    let toUID = to.value.startsWith("starts") ? to.value.substring(6) : to.value.startsWith("terminates") ? to.value.substring(10) : to.value;
                    console.log(chalk_1.default.gray("creating a new or Join node: orJoinNode between " + from.uid + " and " + to.uid));
                    let orJoinNode = new OrJoin("orJoinNode" + toUID);
                    this.addNode(orJoinNode);
                    edge.to = orJoinNode;
                    for (let e of to.inputEdges) {
                        e.to = orJoinNode;
                        orJoinNode.inputEdges.push(e);
                    }
                    to.inputEdges = [];
                    let secondEdge = new Edge(orJoinNode, to);
                    this.edges.push(secondEdge);
                    to.inputEdges.push(secondEdge);
                    orJoinNode.outputEdges.push(secondEdge);
                    return edge;
                }
            }
        }
        console.log(chalk_1.default.grey("warning, edge already exists from " + from.uid + ":" + from.value + " to " + to.uid + ":" + to.value));
        return res;
    }
    replaceNode(oldNode, newNode) {
        let index = this.nodes.findIndex(n => n.uid === oldNode.uid);
        if (index != -1) {
            this.nodes[index] = newNode;
            newNode.uid = oldNode.uid;
            newNode.functionsDefs = oldNode.functionsDefs;
            // newNode.value = oldNode.value;
            newNode.returnType = oldNode.returnType;
            newNode.params = oldNode.params;
            newNode.functionsNames = oldNode.functionsNames;
            newNode.owningCCFG = oldNode.owningCCFG;
        }
        for (let edge of this.edges) {
            if (edge.from === oldNode) {
                edge.from = newNode;
                newNode.outputEdges.push(edge);
            }
            if (edge.to === oldNode) {
                edge.to = newNode;
                newNode.inputEdges.push(edge);
            }
        }
        let owningCCFGOldNode = oldNode.owningCCFG;
        if (owningCCFGOldNode != undefined) {
            owningCCFGOldNode.nodes = owningCCFGOldNode.nodes.filter(n => n.uid !== oldNode.uid);
            owningCCFGOldNode.nodes.push(newNode);
        }
    }
    getNodeByUID(uid) {
        for (let n of this.nodes) {
            if (n.uid === uid) {
                return n;
            }
            // if(n.getType() == "ContainerNode"){
            //     let res = (n as ContainerNode).internalccfg.getNodeByUID(uid);
            //     if(res != undefined){
            //         return res;
            //     }
            // }
        }
        return undefined;
    }
    getNodeFromName(name) {
        for (let n of this.nodes) {
            if (n.value === name) {
                return n;
            }
            // if(n.getType() == "ContainerNode"){
            //     let res = (n as ContainerNode).internalccfg.getNodeFromName(name);
            //     if(res != undefined){
            //         return res;
            //     }
            // }
        }
        return undefined;
    }
    addSyncEdge() {
        for (let n of this.nodes) {
            if (n.getType() == "OrJoin" || n.getType() == "AndJoin") {
                for (let n2 of this.nodes) {
                    if ((n2.getType() == "Fork" || n2.getType() == "Choice")
                        &&
                            n2.outputEdges.length > 1) {
                        if (n2.isBefore(n)) {
                            n2.syncNodeIds.push(n.uid);
                            n.syncNodeIds.push(n2.uid);
                            this.syncEdges.push(new SyncEdge(n, n2, "sync"));
                        }
                    }
                }
            }
            // if(n.getType() == "ContainerNode"){
            //     (n as ContainerNode).internalccfg.addSyncEdge();
            // }
        }
    }
    detectCycles() {
        const visited = [];
        const recursionStack = [];
        for (const node of this.nodes) {
            if (this.detectCyclesRec(node, visited, recursionStack)) {
                return true;
            }
        }
        return false;
    }
    detectCyclesRec(node, visited, recursionStack) {
        if (recursionStack.includes(node)) {
            console.log(chalk_1.default.gray("info: cycle detected on node #" + node.uid + " (" + node.value + ")"));
            if (node.getType() == "OrJoin") {
                node.isCycleInitiator = true;
            }
            return true;
        }
        if (visited.includes(node)) {
            return false;
        }
        visited.push(node);
        recursionStack.push(node);
        for (const edge of node.outputEdges) {
            if (this.detectCyclesRec(edge.to, visited, recursionStack)) {
                return true;
            }
        }
        recursionStack.pop();
        return false;
    }
    collectCycles() {
        for (const node of this.nodes) {
            this.findCycles(node, []);
        }
    }
    findCycles(node, path) {
        // const cycles: Node[][] = [];
        if (path.includes(node)) {
            const cycleStartIndex = path.indexOf(node);
            const cycle = path.slice(cycleStartIndex);
            // if (! node.cycles.some( c => c == cycle)){
            // node.cycles.push(cycle);
            console.log(chalk_1.default.gray("info: cycle detected on node #" + node.uid + " (" + node.value + ")\n\t" + cycle.map(n => n.uid).join(" -> ") + " -> " + node.uid));
            for (const n of cycle) {
                if (!n.cycles.some(c => c === cycle)) {
                    n.cycles.push(cycle);
                }
            }
            // }
            return;
        }
        path.push(node);
        for (const edge of node.outputEdges) {
            const nextNode = edge.to;
            const nextPath = [...path];
            this.findCycles(nextNode, nextPath);
        }
        return;
    }
    // detectCycles(): boolean {
    //     const visited: Node[] = [];
    //     const recursionStack: Node[] = [];
    //     for (const node of this.nodes) {
    //         if (this.detectCyclesRec(node, visited, recursionStack)) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
    // private detectCyclesRec(node: Node, visited: Node[], recursionStack: Node[]): boolean {
    //     if (recursionStack.includes(node)) {
    //         console.log(chalk.gray("info: cycle detected on node #"+node.uid+" ("+node.value+")"));
    //         if(node.getType() == "OrJoin"){
    //             node.isCycleInitiator = true;
    //         }
    //         return true;
    //     }
    //     if (visited.includes(node)) {
    //         return false;
    //     }
    //     visited.push(node);
    //     recursionStack.push(node);
    //     for (const edge of node.outputEdges) {
    //         if (this.detectCyclesRec(edge.to, visited, recursionStack)) {
    //             return true;
    //         }
    //     }
    //     recursionStack.pop();
    //     return false;
    // }
    toDot() {
        let wholeDot = 'digraph G {\n';
        let [s, d] = this.dotGetCCFGNodes();
        d = d + this.dotGetCCFGEdges();
        wholeDot += s;
        wholeDot += d;
        wholeDot += '}';
        return wholeDot;
    }
    /**
     *
     * @returns the edges in dot format
     */
    dotGetCCFGEdges() {
        let edgeDot = "";
        // for (let node of this.nodes) {
        //     if (node.getType() == "ContainerNode") {
        //         edgeDot += (node as ContainerNode).internalccfg.dotGetCCFGEdges();
        //     }
        // }
        for (let edge of this.edges) {
            edgeDot += `  "${edge.from.uid}" -> "${edge.to.uid}" [label="${this.dotGetEdgeLabel(edge)}"];\n`;
        }
        // for (let edge of this.syncEdges) {
        //     edgeDot += `  "${edge.from.uid}" -> "${edge.to.uid}" [style="dotted", penwidth = 2, label="${this.dotGetEdgeLabel(edge)}"];\n`;
        // }
        return edgeDot;
    }
    /**
     *
     * @returns a tuple with the first element being the subgraph and the second the nodes
     */
    dotGetCCFGNodes() {
        let subG = "";
        let nodeDot = "";
        for (let node of this.nodes) {
            // if (node.getType() == "ContainerNode") {
            //    subG += `subgraph cluster_${node.uid} {\n`;
            //    subG += `label = "${node.value}";\n`;
            //     let [s, d ] = (node as ContainerNode).internalccfg.dotGetCCFGNodes()
            //     subG += d;
            //     subG += s;
            //     subG += `}\n`;
            // } else {
            let shape = this.dotGetNodeShape(node);
            let label = this.dotGetNodeLabel(node);
            nodeDot += `  "${node.uid}" [label="${label}" shape="${shape}" ${node.isCycleInitiator ? `style="filled" fillcolor="lightblue"` : ``}];\n`;
            // }
        }
        return [subG, nodeDot];
    }
    dotGetEdgeLabel(edge) {
        return edge.guards.map(g => 
        /* a.replaceAll("\"","\\\"")).join("\n")+"\n~~~"+*/
        g.replaceAll("\"", "\\\"")).join("\n");
        /*+"~~~\n";*/
    }
    dotGetNodeLabel(node) {
        if (node.functionsDefs.length == 0) {
            return node.uid.toString() + ":" + node.value;
        }
        return node.uid.toString() + ":" + node.value + ":\n" + node.returnType + " function" + node.functionsNames + "(" + node.params.map(p => p.toString()).join(", ") + "){\n" + node.functionsDefs.map(a => a.replaceAll("\"", "\\\"")).join("\n") + "\n}";
    }
    dotGetNodeShape(node) {
        switch (node.getType()) {
            case "Step":
                return "ellipse";
            case "Choice":
                return "diamond";
            case "OrJoin":
                return "invtriangle";
            case "AndJoin":
                return "invtriangle";
            case "Fork":
                return "triangle";
            case "StartTimer":
                return "parallelogram";
            default:
                return "box";
        }
    }
}
exports.CCFG = CCFG;
class SyncEdge extends Edge {
    constructor(from, to, label) {
        super(from, to, label);
    }
}
exports.SyncEdge = SyncEdge;
class Step extends Node {
    constructor(value, theActions = []) {
        super(value, theActions);
    }
}
exports.Step = Step;
class Choice extends Node {
    constructor(value) {
        super(value);
    }
}
exports.Choice = Choice;
class Join extends Node {
    constructor(value) {
        super(value);
    }
}
exports.Join = Join;
class Fork extends Node {
    constructor(value) {
        super(value);
    }
}
exports.Fork = Fork;
class OrJoin extends Join {
    constructor(value) {
        super(value);
    }
}
exports.OrJoin = OrJoin;
// export class Timer extends Node {
//     constructor(value: any) {
//         super(value);
//     }
// }
// export class StartTimer extends Timer {
//     duration: integer = 0;
//     constructor(value: any, d:integer) {
//         super(value);
//         this.duration = d;
//     }
// }
// export class StopTimer extends Timer {
//     constructor(value: any) {
//         super(value);
//     }
// }
class AndJoin extends Join {
    constructor(value) {
        super(value);
    }
}
exports.AndJoin = AndJoin;
