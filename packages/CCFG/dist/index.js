import chalk from "chalk";
export class Instruction {
    $instructionType = "";
    constructor(type) {
        this.$instructionType = type;
    }
    toString() {
        return "undefined instruction";
    }
}
export class ReturnInstruction extends Instruction {
    varName = "";
    constructor(varName) {
        super("returnInstruction");
        this.varName = varName;
    }
    toString() {
        return "return," + this.varName;
    }
}
export class CreateVarInstruction extends Instruction {
    varName = "";
    type = "";
    constructor(name, type) {
        super("createVarInstruction");
        this.varName = name;
        this.type = type;
    }
    toString() {
        return "createVar," + this.type + "," + this.varName;
    }
}
export class CreateGlobalVarInstruction extends Instruction {
    varName = "";
    type = "";
    constructor(name, type) {
        super("createGlobalVarInstruction");
        this.varName = name;
        this.type = type;
    }
    toString() {
        return "createGlobalVar," + this.type + "," + this.varName;
    }
}
export class AssignVarInstruction extends Instruction {
    value = "";
    varName = "";
    type = "";
    constructor(varName, value, type = "") {
        super("assignVarInstruction");
        this.value = value;
        this.varName = varName;
        this.type = type;
    }
    toString() {
        return "assignVar," + this.varName + "," + this.value;
    }
}
export class SetVarFromGlobalInstruction extends Instruction {
    varName = "";
    globalVarName = "";
    type = "";
    constructor(name, globalVarName, type = "") {
        super("setVarFromGlobalInstruction");
        this.varName = name;
        this.globalVarName = globalVarName;
        this.type = type;
    }
    toString() {
        return "setVarFromGlobal," + this.type + "," + this.varName + "," + this.globalVarName;
    }
}
export class SetGlobalVarInstruction extends Instruction {
    globalVarName = "";
    value = "";
    type = "";
    constructor(globalVarName, value, type = "") {
        super("setGlobalVarInstruction");
        this.value = value;
        this.globalVarName = globalVarName;
        this.type = type;
    }
    toString() {
        return "setGlobalVar," + this.type + "," + this.globalVarName + "," + this.value;
    }
}
export class OperationInstruction extends Instruction {
    varName = "";
    n1 = "";
    op = "";
    n2 = "";
    type = "";
    constructor(varName, n1, op, n2, type = "") {
        super("operationInstruction");
        this.varName = varName;
        this.n1 = n1;
        this.op = op;
        this.n2 = n2;
        this.type = type;
    }
    toString() {
        return "operation," + this.varName + "," + this.n1 + "," + this.op + "," + this.n2;
    }
}
export class VerifyEqualInstruction extends Instruction {
    n1 = "";
    n2 = "";
    constructor(n1, n2) {
        super("verifyEqualInstruction");
        this.n1 = n1;
        this.n2 = n2;
    }
    toString() {
        return "verifyEqual," + this.n1 + "," + this.n2;
    }
}
export class AddSleepInstruction extends Instruction {
    duration = "";
    constructor(duration) {
        super("addSleepInstruction");
        this.duration = duration;
    }
    toString() {
        return "addSleep," + this.duration;
    }
}
export class TypedElement {
    name = "";
    type = undefined;
    toString() {
        return (this.type == undefined ? "undefined" : this.type) + " " + this.name;
    }
}
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
    astNode; //unnused so far
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
    getType() {
        return this.constructor.name;
    }
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
        for (let e of this.outputEdges) {
            if (e.to === n2) {
                // console.log(chalk.gray("info: "+this.uid+" is before "+n2.uid));
                this.isVisited = false;
                return true;
            }
        }
        for (let e of this.outputEdges) {
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
export class Edge {
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
/**
 * Represents a Control Flow Graph (CCFG).
 * A CCFG consists of nodes and edges that represent the control flow of a program.
 */
export class CCFG {
    nodes;
    edges;
    syncEdges = [];
    initialState;
    constructor() {
        this.nodes = [];
        this.edges = [];
    }
    cleanVisit() {
        for (let n of this.nodes) {
            n.isVisited = false;
        }
    }
    /**
     * add a node to the CCFG if not already in it. Change the owningCCFG of the node to this CCFG idf necessary
     */
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
        if (res != undefined) {
            console.log(chalk.grey("warning, edge already exists from " + from.uid + ":" + from.type + " to " + to.uid + ":" + to.type));
            return res;
        }
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
                // console.log(chalk.bgYellow("adding to an existing or join node: "+to.value+" -> "+to.inputEdges[0].from.value+" -> "+to.inputEdges[0].from.uid+" "+to.inputEdges[0].from.getType()+" "+to.inputEdges[0].from.inputEdges.length+" "+to.inputEdges[0].from.inputEdges[0].from.value+" "+to.inputEdges[0].from.inputEdges[0].from.uid+" "+to.inputEdges[0].from.inputEdges[0].from.getType()+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges.length+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.value+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.uid+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.getType()+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges.length+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.value+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.uid+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.getType()+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges.length+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.value+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.uid+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.getType()+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges.length));
                edge.to = to.inputEdges[0].from;
                to.inputEdges[0].from.inputEdges.push(edge);
                return edge;
            }
            else {
                // console.log(chalk.gray("creating a new or Join node: orJoinNode between "+from.uid+" and "+to.uid));
                let orJoinNode = new OrJoin(to.astNode);
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
    /**
     * replace the oldNode by the newNode in the CCFG. reroute the edges accordingly
     * @param oldNode
     * @param newNode
     */
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
    /**
     * returns the node with the given uid
     *
     * @param uid: integer
     * @returns the node with the given uid or undefined if not found
     */
    getNodeByUID(uid) {
        for (let n of this.nodes) {
            if (n.uid === uid) {
                return n;
            }
        }
        return undefined;
    }
    /**
     * returns the node with the given astNode and type
     * @param astNode
     * @param t
     * @returns the node with the given astNode and type or undefined if not found
     */
    getNodeFromASTNode(astNode, t) {
        for (let n of this.nodes) {
            if (n.astNode != undefined && n.astNode == astNode && n.type == t) {
                return n;
            }
        }
        return undefined;
    }
    computeCorrespondingNodes() {
        for (const node of this.nodes) {
            if (node.getType() === "Fork" || node.getType() === "Choice") {
                const correspondingNode = this.findCorrespondingNode(node);
                if (correspondingNode) {
                    node.syncNodeIds.push(correspondingNode.uid);
                    correspondingNode.syncNodeIds.push(node.uid);
                }
            }
        }
    }
    findCorrespondingNode(node) {
        const visited = [];
        const queue = [];
        queue.push(node);
        var splitCounter = -1;
        while (queue.length > 0) {
            const current = queue.shift();
            if (current) {
                visited.push(current);
                if ((current.getType() === "Fork" || current.getType() === "Choice")) {
                    splitCounter = splitCounter + 1;
                }
                if ((current.getType() === "OrJoin" || current.getType() === "AndJoin")) {
                    if (splitCounter > 0) {
                        splitCounter = splitCounter - 1;
                    }
                    else {
                        return current;
                    }
                }
                const joinEdges = current.outputEdges.filter(edge => edge.to.getType() === "OrJoin" || edge.to.getType() === "AndJoin");
                const otherEdges = current.outputEdges.filter(edge => edge.to.getType() !== "OrJoin" && edge.to.getType() !== "AndJoin");
                const sortedEdges = [...joinEdges, ...otherEdges];
                for (const edge of sortedEdges) {
                    const nextNode = edge.to;
                    if (!visited.includes(nextNode)) {
                        if (!queue.includes(nextNode)) {
                            queue.push(nextNode);
                        }
                    }
                }
            }
        }
        return undefined;
    }
    /**
     * this old version tried to be smart... it seems we can exploit thread uid like in the next version
     */
    addSyncEdge() {
        for (let n of this.nodes) {
            this.cleanVisit();
            if (n.getType() == "OrJoin" || n.getType() == "AndJoin") {
                for (let n2 of this.nodes) {
                    this.cleanVisit();
                    if ((n2.getType() == "Fork" || n2.getType() == "Choice")
                        &&
                            n2.outputEdges.length > 1) {
                        // console.log(chalk.gray("info: checking sync edge between "+n2.uid+" and "+n.uid));
                        if (n2.isBefore(n)) {
                            // console.log(chalk.gray("info: adding sync edge between "+n2.uid+" and "+n.uid));
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
    // /**
    //  * this version takes into account the fact that the fork/join nodes where always successives in the list of nodes uid...
    //  * should be even smarter since it may be more complex than that
    //  */
    // addSyncEdge(): void{
    //     for(let n of this.nodes){
    //         this.cleanVisit();
    //         if(n.getType() == "OrJoin" || n.getType() == "AndJoin"){
    //             console.log(chalk.red("info: checking sync edge for "+n.getType()+":"+n.uid));
    //             let previousUid = n.uid-1;
    //             let potentialSyncNode = this.nodes.find(n2 => n2.uid == previousUid);
    //             if(potentialSyncNode == undefined){
    //                 console.log(chalk.red("error: no potential sync node found for "+n.getType()+":"+n.uid));
    //             }
    //             if(potentialSyncNode != undefined && (potentialSyncNode.getType() == "Fork" || potentialSyncNode.getType() == "Choice")){
    //                 if(potentialSyncNode.isBefore(n)){
    //                     console.log(chalk.gray("info: adding sync edge between "+potentialSyncNode.uid+" and "+n.uid));
    //                     potentialSyncNode.syncNodeIds.push(n.uid);
    //                     n.syncNodeIds.push(potentialSyncNode.uid);
    //                     this.syncEdges.push(new SyncEdge(n, potentialSyncNode, "sync"));
    //                 }else{
    //                     console.log(chalk.red("error: potential sync node is not before "+n.getType()+":"+n.uid+"(outputEdges: "+potentialSyncNode.outputEdges.length+")"));
    //                 }
    //             }else{
    //                 let currentUid = previousUid - 1;
    //                 tq: while(currentUid > 0){
    //                     let potentialSyncNode = this.nodes.find(n2 => n2.uid == currentUid);
    //                     if(potentialSyncNode != undefined && (potentialSyncNode.getType() == "Fork" || potentialSyncNode.getType() == "Choice")){
    //                         if (potentialSyncNode.isBefore(n)){
    //                             console.log(chalk.gray("info2: adding sync edge between "+potentialSyncNode.uid+" and "+n.uid));
    //                             potentialSyncNode.syncNodeIds.push(n.uid);
    //                             n.syncNodeIds.push(potentialSyncNode.uid);
    //                             this.syncEdges.push(new SyncEdge(n, potentialSyncNode, "sync"));
    //                             break tq;
    //                         }
    //                     }
    //                     currentUid = currentUid - 1;
    //                 }
    //             }
    //         }
    //         // if(n.getType() == "ContainerNode"){
    //         //     (n as ContainerNode).internalccfg.addSyncEdge();
    //         // }
    //     }
    // }
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
            console.log(chalk.gray("info: cycle detected on node #" + node.uid + " (" + node.type + ")"));
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
            console.log(chalk.gray("info: cycle detected on node #" + node.uid + " (" + node.type + ")\n\t" + cycle.map(n => n.uid).join(" -> ") + " -> " + node.uid));
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
        g.toString().replaceAll("\"", "\\\"")).join("\n");
        /*+"~~~\n";*/
    }
    dotGetNodeLabel(node) {
        if (node.functionsDefs.length == 0) {
            return node.uid.toString() + "[" + node.syncNodeIds.map(i => i).join(',') + "]" + ":" + node.getType() + ((node.type == undefined || node.type == NodeType.multipleSynchro) ? "" : "_" + node.type);
        }
        return node.uid.toString() + "[" + node.syncNodeIds.map(i => i).join(',') + "]" + ":" + node.getType() + ((node.type == undefined || node.type == NodeType.multipleSynchro) ? "" : "_" + node.type) + ":\n" + node.returnType + " function" + node.functionsNames + "(" + node.params.map(p => p.toString()).join(", ") + "){\n" + node.functionsDefs.map(a => a.toString().replaceAll("\"", "\\\"")).join("\n") + "\n}";
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
            case "Hole":
                return "cylinder";
            case "CollectionHole":
                return "cylinder";
            default:
                return "box";
        }
    }
    fillHole(h, ccfg) {
        if (h.inputEdges.length == 0 && h.outputEdges.length == 0) {
            console.log(chalk.red("error: hole has no input and no output edge"));
            return;
        }
        for (let inputEdge of h.inputEdges) {
            inputEdge.to = ccfg.initialState;
            ccfg.initialState?.inputEdges.push(inputEdge);
        }
        let terminalNode = ccfg.nodes.find(n => n.type == "terminates");
        if (terminalNode == undefined) {
            throw new Error("no terminal node found in the ccfg");
        }
        for (let outputEdge of h.outputEdges) {
            outputEdge.from = terminalNode;
            terminalNode.outputEdges.push(outputEdge);
        }
        this.nodes = this.nodes.filter(n => n.uid !== h.uid);
        this.nodes = [...this.nodes, ...ccfg.nodes];
        this.edges = [...this.edges, ...ccfg.edges];
    }
}
export class SyncEdge extends Edge {
    constructor(from, to, label) {
        super(from, to, label);
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
    constructor(astNode, d) {
        super(astNode);
        this.duration = d;
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
