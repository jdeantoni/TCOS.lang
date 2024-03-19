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

export abstract class Node {
 
    static uidCounter: integer = 0;
    uid: integer;
    owningCCFG: CCFG | undefined = undefined;

    value:any;  //unused so far
    astNode: AstNode | undefined; //unnused so far
   
    outputEdges: Edge[] = [];
    inputEdges: Edge[] = [];

    syncNodeIds: integer[] = [];
    functionsNames: string[] = [];
    params: TypedElement[] = []
    functionsDefs: string[];
    returnType: string|undefined = undefined;


    numberOfVisits: integer = 0
    isInCycle: boolean = false;

    constructor(value: any, theActions: string[] = []) {
        this.uid = Node.uidCounter++;
        this.value = value;
        this.functionsDefs = theActions;
    }

    getType(): string {
        return this.constructor.name;
    }

    isBefore(n2: Node): boolean {
        if (this.outputEdges.length == 0){
            return false;
        }
        for (let e of this.outputEdges) {
            if (e.to === n2){
                return true;
            }
        }
        for(let e of this.outputEdges){
            return e.to.isBefore(n2);
        }

        return false
    }
    

}

export class ContainerNode extends Node {

    internalccfg: CCFG;

    constructor(value: any, theActions: string[] = []) {
        super(value, theActions);
        this.internalccfg = new CCFG();
    }

    addNode(node: Node): Node {
        return this.internalccfg.addNode(node);
    }

    addEdge(from: Node, to: Node, label:string=""): Edge {
        return this.internalccfg.addEdge(from, to, label);
    }

    toDot(): string {
        return this.internalccfg.toDot();
    }

    getNodeFromName(name: string): Node | undefined {
        return this.internalccfg.getNodeFromName(name);
    }

    getNodeByUID(uid: integer): Node | undefined {
        if(this.owningCCFG != undefined){
            return this.owningCCFG.getNodeByUID(uid);
        }
        return this.internalccfg.getNodeByUID(uid);
    }

    replaceNode(oldNode: Node, newNode: Node): void {
        this.internalccfg.replaceNode(oldNode, newNode);
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

    addNode(node: Node): Node {
        if(this.nodes.length == 0){
            this.initialState = node;
        }

        let res = this.nodes.find(n => n === node);
        if (res == undefined) {
            this.nodes.push(node);
            node.owningCCFG = this;
        }
        return node;
    }

    addEdge(from: Node, to: Node, label:string=""): Edge {
        let res : Edge | undefined = this.edges.find(e => e.from === from && e.to === to);
        if (res == undefined) {
            const edge = new Edge(from, to);
            this.edges.push(edge);
            from.outputEdges.push(edge);
            to.inputEdges.push(edge);
            return edge;
        }
        return res;
    }

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

    getNodeByUID(uid: integer): Node | undefined  {
        for(let n of this.nodes){
            if(n.uid === uid){
                return n;
            }
            if(n.getType() == "ContainerNode"){
                let res = (n as ContainerNode).internalccfg.getNodeByUID(uid);
                if(res != undefined){
                    return res;
                }
            }
        }
        return undefined
    }

    getNodeFromName(name: string): Node | undefined {
        for(let n of this.nodes){
            if(n.value === name){
                return n;
            }
            if(n.getType() == "ContainerNode"){
                let res = (n as ContainerNode).internalccfg.getNodeFromName(name);
                if(res != undefined){
                    return res;
                }
            }
        }
        return undefined
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
            if(n.getType() == "ContainerNode"){
                (n as ContainerNode).internalccfg.addSyncEdge();
            }
        }

    }

    annotateCycles(): void {
        if(this.initialState == undefined){
            throw new Error("annotateCycles(): No initial state");
        }
        this.annotateCyclesRec(this.initialState, []);
    }

    annotateCyclesRec(n: Node, visited: Node[]): void {
        if(visited.includes(n)){
            console.log(chalk.red("Cycle detected on "+n.uid));
            n.isInCycle = true;
            return;
        }
        visited.push(n);
        for(let e of n.outputEdges){
            this.annotateCyclesRec(e.to, visited);
        }
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
        for (let node of this.nodes) {
            if (node.getType() == "ContainerNode") {
                edgeDot += (node as ContainerNode).internalccfg.dotGetCCFGEdges();
            }
        }
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
            if (node.getType() == "ContainerNode") {
               subG += `subgraph cluster_${node.uid} {\n`;
               subG += `label = "${node.value}";\n`;
                let [s, d ] = (node as ContainerNode).internalccfg.dotGetCCFGNodes()
                subG += d;
                subG += s;
                subG += `}\n`;
            } else {
                let shape: string = this.dotGetNodeShape(node);
                let label: string = this.dotGetNodeLabel(node);
                nodeDot += `  "${node.uid}" [label="${label}" shape="${shape}" ${node.isInCycle?`style="filled" fillcolor="lightblue"`:``}];\n`;
            }

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
            return node.uid.toString()+":"+node.value;
        }
        return node.uid.toString()+":"+node.value+":\n"+node.returnType+" function"+node.functionsNames+"("+node.params.map(p => (p as TypedElement).toString()).join(", ")+"){\n"+node.functionsDefs.map(
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
            default:
                return "box";
        }
    }




}

export class SyncEdge extends Edge {
    constructor(from: Node, to: Node, label?: string) {
        super(from, to, label);
    }
}

export class Step extends Node {
    
    constructor(value: any, theActions: string[] = []) {
        super(value, theActions);
    }
}

export class Choice extends Node {
    constructor(value: any) {
        super(value);
    }
}

export class Join extends Node {
    constructor(value: any) {
        super(value);
    }
}

export class Fork extends Node {
    constructor(value: any) {
        super(value);
    }
}

export class OrJoin extends Join {
    constructor(value: any) {
        super(value);
    }
}

export class AndJoin extends Join {
    constructor(value: any) {
        super(value);
    }
}

