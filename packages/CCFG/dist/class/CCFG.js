import chalk from "chalk";
import { NodeType, OrJoin } from "./Node.js";
import console from "console";
/**
 * Represents a Control Flow Graph (CCFG).
 * A CCFG consists of nodes and edges that represent the control flow of a program.
 */
export class CCFG {
    nodes;
    edges;
    syncEdges = [];
    alreadyUsedToFillHole = false;
    initialState;
    constructor() {
        this.nodes = [];
        this.edges = [];
    }
    cleanVisit() {
        for (const n of this.nodes) {
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
        const res = this.nodes.find(n => n === node);
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
    addEdge(from, to, _label = "") {
        const res = this.edges.find(e => e.from === from && e.to === to);
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
                edge.to = to.inputEdges[0].from;
                to.inputEdges[0].from.inputEdges.push(edge);
                return edge;
            }
            else {
                const orJoinNode = new OrJoin(to.astNode);
                this.addNode(orJoinNode);
                edge.to = orJoinNode;
                for (const e of to.inputEdges) {
                    e.to = orJoinNode;
                    orJoinNode.inputEdges.push(e);
                }
                to.inputEdges = [];
                const secondEdge = new Edge(orJoinNode, to);
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
        const index = this.nodes.findIndex(n => n.uid === oldNode.uid);
        if (index != -1) {
            this.nodes[index] = newNode;
            newNode.uid = oldNode.uid;
            newNode.functionsDefs = oldNode.functionsDefs;
            newNode.returnType = oldNode.returnType;
            newNode.params = oldNode.params;
            newNode.functionsNames = oldNode.functionsNames;
            newNode.owningCCFG = oldNode.owningCCFG;
        }
        for (const edge of this.edges) {
            if (edge.from === oldNode) {
                edge.from = newNode;
                newNode.outputEdges.push(edge);
            }
            if (edge.to === oldNode) {
                edge.to = newNode;
                newNode.inputEdges.push(edge);
            }
        }
        const owningCCFGOldNode = oldNode.owningCCFG;
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
        for (const n of this.nodes) {
            if (n.uid === uid) {
                return n;
            }
        }
        return undefined;
    }
    /**
     * returns the node with the given astNode and type
     * @param astNode
     * @param nodeType
     * @returns the node with the given astNode and type or undefined if not found
     */
    getNodeFromASTNode(astNode, nodeType) {
        for (const n of this.nodes) {
            if (n.astNode != undefined && n.astNode == astNode && n.type == nodeType) {
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
        let splitCounter = -1;
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
        for (const n of this.nodes) {
            this.cleanVisit();
            if (n.getType() == "OrJoin" || n.getType() == "AndJoin") {
                for (const n2 of this.nodes) {
                    this.cleanVisit();
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
        if (path.includes(node)) {
            const cycleStartIndex = path.indexOf(node);
            const cycle = path.slice(cycleStartIndex);
            console.log(chalk.gray("info: cycle detected on node #" + node.uid + " (" + node.type + ")\n\t" + cycle.map(n => n.uid).join(" -> ") + " -> " + node.uid));
            for (const n of cycle) {
                if (!n.cycles.some(c => c === cycle)) {
                    n.cycles.push(cycle);
                }
            }
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
        let wholeDot = "digraph G {\n";
        let [s, d] = this.dotGetCCFGNodes();
        d = d + this.dotGetCCFGEdges();
        wholeDot += s;
        wholeDot += d;
        wholeDot += "}";
        return wholeDot;
    }
    /**
     *
     * @returns the edges in dot format
     */
    dotGetCCFGEdges() {
        let edgeDot = "";
        for (const edge of this.edges) {
            edgeDot += `  "${edge.from.uid}" -> "${edge.to.uid}" [label="${this.dotGetEdgeLabel(edge)}"];\n`;
        }
        return edgeDot;
    }
    /**
     *
     * @returns a tuple with the first element being the subgraph and the second the nodes
     */
    dotGetCCFGNodes() {
        const subG = "";
        let nodeDot = "";
        for (const node of this.nodes) {
            const shape = this.dotGetNodeShape(node);
            const label = this.dotGetNodeLabel(node);
            nodeDot += `  "${node.uid}" [label="${label}" shape="${shape}" ${node.isCycleInitiator ? "style=\"filled\" fillcolor=\"lightblue\"" : ""}];\n`;
        }
        return [subG, nodeDot];
    }
    dotGetEdgeLabel(edge) {
        return edge.guards.map(g => g.toString().replaceAll("\"", "\\\"")).join("\n");
    }
    dotGetNodeLabel(node) {
        if (node.functionsDefs.length == 0) {
            return node.uid.toString() + "[" + node.syncNodeIds.map(i => i).join(",") + "]" + ":" + node.getType() + ((node.type == undefined || node.type == NodeType.multipleSynchro) ? "" : "_" + node.type);
        }
        return node.uid.toString() + "[" + node.syncNodeIds.map(i => i).join(",") + "]" + ":" + node.getType() + ((node.type == undefined || node.type == NodeType.multipleSynchro) ? "" : "_" + node.type) + ":\n" + node.returnType + " function" + node.functionsNames + "(" + node.params.map(p => p.toString()).join(", ") + "){\n" + node.functionsDefs.map(a => a.toString().replaceAll("\"", "\\\"")).join("\n") + "\n}";
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
            case "BroadcastEventEmission":
                return "cds";
            case "BroadcastEventReception":
                return "cds";
            default:
                return "box";
        }
    }
    fillHole(hole, ccfg) {
        if (hole.inputEdges.length == 0 && hole.outputEdges.length == 0) {
            console.log(chalk.red("error: hole has no input and no output edge"));
            return;
        }
        for (const inputEdge of hole.inputEdges) {
            inputEdge.to = ccfg.initialState;
            ccfg.initialState?.inputEdges.push(inputEdge);
        }
        const terminalNode = ccfg.nodes.find(node => node.type == "terminates");
        if (terminalNode == undefined) {
            throw new Error("no terminal node found in the ccfg");
        }
        for (const outputEdge of hole.outputEdges) {
            outputEdge.from = terminalNode;
            terminalNode.outputEdges.push(outputEdge);
        }
        this.nodes = this.nodes.filter(node => node.uid !== hole.uid);
        this.nodes = [...this.nodes, ...ccfg.nodes];
        this.edges = [...this.edges, ...ccfg.edges];
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
export class SyncEdge extends Edge {
    constructor(from, to, label) {
        super(from, to, label);
    }
}
