import chalk from "chalk";
import { AstNode } from "langium";
import { integer } from "vscode-languageclient";

export class TypedElement {
    name: string = ""
    type: (string | undefined) = undefined
    
    toString(): string {
        return (this.type == undefined ? "undefined" : this.type)+" "+ this.name
    }
}

export enum NodeType {
    starts = "starts",
    terminates = "terminates",
    multipleSynchro = "multipleSynchro",
}

export abstract class Node {
 
    static uidCounter: integer = 0;
    uid: integer;
    owningCCFG: CCFG | undefined = undefined;

    astNode: AstNode | undefined; //unnused so far

    outputEdges: Edge[] = [];
    inputEdges: Edge[] = [];

    type: NodeType | undefined = undefined;

    syncNodeIds: integer[] = [];
    functionsNames: string[] = [];
    params: TypedElement[] = []
    functionsDefs: string[];
    returnType: string|undefined = undefined;


    numberOfVisits: integer = 0
    isCycleInitiator: boolean = false;
    cycles: Node[][] = []

    isVisited: boolean = false;

    constructor(astNode?:AstNode, type?: NodeType, theActions: string[] = []) {
        this.uid = Node.uidCounter++;
        this.astNode = astNode;
        this.type = type;
        this.functionsDefs = theActions;
    }

    getType(): string {
        return this.constructor.name;
    }

    isBefore(n2: Node): boolean {
        if(this.isVisited){
            return false;
        }
        this.isVisited = true;
        if (this.outputEdges.length == 0){
            this.isVisited = false;
            return false;
        }
        for (let e of this.outputEdges) {
            if (e.to === n2){
                this.isVisited = false;
                return true;
            }
        }
        for(let e of this.outputEdges){
            return e.to.isBefore(n2);
        }
        this.isVisited = false;
        return false
    }

    cyclePossessAnAndJoin(): boolean {
        return this.cycles.some(c => { return c.some(n => {
            // console.log(n.uid+":"+n.getType())
            if(n.getType() == "AndJoin"){
                return true;
            }
            return false;
        })})
    }

    

}


export class Edge {
    static edgeUIDCounter: integer = 0;

    from: Node;
    to: Node;
    label?: string;
    astNode: AstNode | undefined;
    guards: string[];
    uid: integer;
    constructor(from: Node, to: Node, label?: string) {
        this.from = from;
        this.to = to;
        this.label = label;
        this.guards = []
        this.uid = Edge.edgeUIDCounter++;
    }
}

/**
 * Represents a Control Flow Graph (CCFG).
 * A CCFG consists of nodes and edges that represent the control flow of a program.
 */
export class CCFG {
    nodes: Node[];
    edges: Edge[];
    syncEdges: SyncEdge[] = []
    ;

    initialState: Node | undefined;

    constructor() {
        this.nodes = [];
        this.edges = [];
    }

    /**
     * add a node to the CCFG if not already in it. Change the owningCCFG of the node to this CCFG idf necessary
     */
    addNode(node: Node): Node {
        if(this.nodes.length == 0){
            this.initialState = node;
        }
        if(node.owningCCFG != undefined){
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
    addEdge(from: Node, to: Node, label:string=""): Edge {
        let res : Edge | undefined = this.edges.find(e => e.from === from && e.to === to);
        if (res != undefined) {
            console.log(chalk.grey("warning, edge already exists from "+from.uid+":"+from.type+" to "+to.uid+":"+to.type));
            return res; 
        }
        const edge = new Edge(from, to);
        this.edges.push(edge);
        from.outputEdges.push(edge);

        if(to.inputEdges.length == 0){
            to.inputEdges.push(edge);
            return edge;
        }else{ //already an input edge. check if an orJoin Node
            if (to.getType() == "OrJoin" || to.getType() == "AndJoin") {
                edge.to = to
                to.inputEdges.push(edge)
                return edge
            }
            if (to.inputEdges.length == 1 && (to.inputEdges[0].from.getType() == "OrJoin" || to.inputEdges[0].from.getType() == "AndJoin"))  {
                // console.log(chalk.bgYellow("adding to an existing or join node: "+to.value+" -> "+to.inputEdges[0].from.value+" -> "+to.inputEdges[0].from.uid+" "+to.inputEdges[0].from.getType()+" "+to.inputEdges[0].from.inputEdges.length+" "+to.inputEdges[0].from.inputEdges[0].from.value+" "+to.inputEdges[0].from.inputEdges[0].from.uid+" "+to.inputEdges[0].from.inputEdges[0].from.getType()+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges.length+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.value+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.uid+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.getType()+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges.length+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.value+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.uid+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.getType()+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges.length+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.value+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.uid+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.getType()+" "+to.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges[0].from.inputEdges.length));
                edge.to = to.inputEdges[0].from;
                to.inputEdges[0].from.inputEdges.push(edge);                   
                return edge
            }else{
                // console.log(chalk.gray("creating a new or Join node: orJoinNode between "+from.uid+" and "+to.uid));
                let orJoinNode = new OrJoin(to.astNode);
                this.addNode(orJoinNode)
                
                edge.to = orJoinNode
                for(let e of to.inputEdges){
                    e.to = orJoinNode
                    orJoinNode.inputEdges.push(e)
                }
                to.inputEdges = []
                let secondEdge = new Edge(orJoinNode, to)
                this.edges.push(secondEdge)
                to.inputEdges.push(secondEdge)
                orJoinNode.outputEdges.push(secondEdge)
                return edge
            }
        }
        
    }

    /**
     * replace the oldNode by the newNode in the CCFG. reroute the edges accordingly
     * @param oldNode 
     * @param newNode 
     */
    replaceNode(oldNode: Node, newNode: Node): void {
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
        if (owningCCFGOldNode != undefined){
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
    getNodeByUID(uid: integer): Node | undefined  {
        for(let n of this.nodes){
            if(n.uid === uid){
                return n;
            }
        }
        return undefined
    }

    /**
     * returns the node with the given astNode and type
     * @param astNode 
     * @param t 
     * @returns the node with the given astNode and type or undefined if not found
     */
    getNodeFromASTNode(astNode: AstNode, t?:NodeType): Node | undefined {
        for(let n of this.nodes){
            if(n.astNode != undefined && n.astNode == astNode && n.type == t){
                return n;
            }
        }
        return undefined
    }


    computeCorrespondingNodes(): void {
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

    private findCorrespondingNode(node: Node): Node | undefined {
        const visited: Node[] = [];
        const queue: Node[] = [];
        queue.push(node);

        var splitCounter: integer = -1;

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
                    }else{
                        return current;
                    }
                }
                const joinEdges = current.outputEdges.filter(edge => edge.to.getType() === "OrJoin" || edge.to.getType() === "AndJoin");
                const otherEdges = current.outputEdges.filter(edge => edge.to.getType() !== "OrJoin" && edge.to.getType() !== "AndJoin");
                const sortedEdges = [...joinEdges, ...otherEdges];
                for (const edge of sortedEdges) {
                    const nextNode = edge.to;
                    if (!visited.includes(nextNode)) {
                        if(! queue.includes(nextNode)){
                            queue.push(nextNode);
                        }
                    }
                }
            }
        }

        return undefined;
    }


    addSyncEdge(): void{
        for(let n of this.nodes){
            if(n.getType() == "OrJoin" || n.getType() == "AndJoin"){
                for(let n2 of this.nodes){
                    if((n2.getType() == "Fork" || n2.getType() == "Choice")
                        &&
                        n2.outputEdges.length > 1){
                        if(n2.isBefore(n)){
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





    detectCycles(): boolean {
        const visited: Node[] = [];
        const recursionStack: Node[] = [];
        for (const node of this.nodes) {
            if (this.detectCyclesRec(node, visited, recursionStack)) {
                return true;
            }
        }
        return false;
    }

    private detectCyclesRec(node: Node, visited: Node[], recursionStack: Node[]): boolean {
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

    collectCycles(): void {
        for (const node of this.nodes) {
            this.findCycles(node, []);
        }
    }

    private findCycles(node: Node, path: Node[]): void {
        // const cycles: Node[][] = [];
        if (path.includes(node)) {
            const cycleStartIndex = path.indexOf(node);
            const cycle = path.slice(cycleStartIndex);
            // if (! node.cycles.some( c => c == cycle)){
               // node.cycles.push(cycle);
                console.log(chalk.gray("info: cycle detected on node #" + node.uid + " (" + node.type + ")\n\t" + cycle.map(n => n.uid).join(" -> ") + " -> " + node.uid ));                
                for(const n of cycle){
                    if (! n.cycles.some(c => c === cycle)){    
                        n.cycles.push(cycle);
                    }
                }
            // }
            return ;
        }
        path.push(node);
        for (const edge of node.outputEdges) {
            const nextNode = edge.to;
            const nextPath = [...path];
            this.findCycles(nextNode, nextPath);
        }
        return;
    }
    

    toDot(): string {
        let wholeDot = 'digraph G {\n';
        let [s, d] = this.dotGetCCFGNodes()
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
    private dotGetCCFGEdges() : string{
        let edgeDot = ""
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
    private dotGetCCFGNodes() :[string, string]{
        let subG = ""
        let nodeDot = ""
        for (let node of this.nodes) {
            // if (node.getType() == "ContainerNode") {
            //    subG += `subgraph cluster_${node.uid} {\n`;
            //    subG += `label = "${node.value}";\n`;
            //     let [s, d ] = (node as ContainerNode).internalccfg.dotGetCCFGNodes()
            //     subG += d;
            //     subG += s;
            //     subG += `}\n`;
            // } else {
                let shape: string = this.dotGetNodeShape(node);
                let label: string = this.dotGetNodeLabel(node);
                nodeDot += `  "${node.uid}" [label="${label}" shape="${shape}" ${node.isCycleInitiator?`style="filled" fillcolor="lightblue"`:``}];\n`;
            // }

        }
        return [subG, nodeDot];
    }

    dotGetEdgeLabel(edge: Edge): string {
      
        return edge.guards.map(
            g => 
            /* a.replaceAll("\"","\\\"")).join("\n")+"\n~~~"+*/
            g.replaceAll("\"","\\\"")).join("\n")
            /*+"~~~\n";*/
    }

    dotGetNodeLabel(node: Node): string {
        if(node.functionsDefs.length == 0){
            return node.uid.toString()+"["+node.syncNodeIds.map(i =>i).join(',')+"]"+":"+node.type;
        }
        return node.uid.toString()+"["+node.syncNodeIds.map(i =>i).join(',')+"]"+":"+node.type+":\n"+node.returnType+" function"+node.functionsNames+"("+node.params.map(p => (p as TypedElement).toString()).join(", ")+"){\n"+node.functionsDefs.map(
            a => a.replaceAll("\"","\\\"")).join("\n")+"\n}";
    }

    dotGetNodeShape(node: Node): string {
        switch(node.getType()){
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


    fillHole(h: Hole, ccfg: CCFG): void {
        if(h.inputEdges.length == 0 && h.outputEdges.length == 0){
            console.log(chalk.red("error: hole has no input and no output edge"));
            return;
        }
        for (let inputEdge of h.inputEdges) {
            inputEdge.to = ccfg.initialState as Node;
        }
        let terminalNode = ccfg.nodes.find(n => n.type == "terminates");
        if (terminalNode == undefined) {
           throw new Error("no terminal node found in the ccfg");
        }
        for (let outputEdge of h.outputEdges) {
            outputEdge.from = terminalNode as Node;
        }
        this.nodes = this.nodes.filter(n => n.uid !== h.uid);
        this.nodes = [...this.nodes, ...ccfg.nodes];
        this.edges = [...this.edges, ...ccfg.edges];

    }


}

export class SyncEdge extends Edge {
    constructor(from: Node, to: Node, label?: string) {
        super(from, to, label);
    }
}

export class Step extends Node {
    
    constructor(astNode?:AstNode, type?: NodeType, theActions: string[] = []) {
        super(astNode, type, theActions);
    }
}

export class Choice extends Node {
    constructor(astNode?:AstNode) {
        super(astNode);
    }
}

export class Join extends Node {
    constructor(astNode?:AstNode) {
        super(astNode, NodeType.multipleSynchro);
    }
}

export class Fork extends Node {
    constructor(astNode?:AstNode) {
        super(astNode);
    }
}

export class OrJoin extends Join {
    constructor(astNode?:AstNode) {
        super(astNode);
    }
}


export class AndJoin extends Join {
    constructor(astNode?:AstNode) {
        super(astNode);
    }
}

export class Hole extends Node {
    constructor(astNode?:AstNode) {
        super(astNode);
    }
}

export class TimerHole extends Hole {

    duration: integer = 0;

    constructor(astNode:AstNode, d:integer) {
        super(astNode);
        this.duration = d;
    }
}

export class CollectionHole extends Hole {
    astNodeCollection: AstNode[];
    constructor(astNode:AstNode[]) {
        super(undefined);
        this.astNodeCollection = astNode;
    }
    isSequential: boolean = false;
    parallelSyncPolicy: string = "lastOf";
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

