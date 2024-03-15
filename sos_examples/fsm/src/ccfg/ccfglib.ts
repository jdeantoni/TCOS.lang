import { AstNode } from "langium";
import { integer } from "vscode-languageclient";

export class TypedElement {
    name: string = ""
    type: (string | undefined) = undefined
    
    // constructor(name: string, type: (string | undefined) = undefined){
    //     this.name = name;
    //     this.type = type;
    // }
    
    toString(): string {
        // console.log("here")
        return (this.type == undefined ? "undefined" : this.type)+" "+ this.name
    }
}

export abstract class Node {
    static uidCounter: integer = 0;
    uid: integer;

    value:any;  //unused so far
    astNode: AstNode | undefined; //unnused so far
   
    outputEdges: Edge[] = [];
    inputEdges: Edge[] = [];

    queueIds: integer[] = [];
    functionsNames: string[] = [];
    params: TypedElement[] = []
    functionsDefs: string[];
    returnType: string;


    numberOfVisits: integer = 0

    constructor(value: any, theActions: string[] = []) {
        this.uid = Node.uidCounter++;
        this.value = value;
        this.functionsDefs = theActions;
        this.returnType = "void";
    }

    getType(): string {
        return this.constructor.name;
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

    getNodeByUID(uid: integer): Node  {
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
            newNode.value = oldNode.value;
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
    }

    getNodeByUID(uid: integer): Node  {
        let res = this.nodes.find(n => n.uid === uid);
        if(res == undefined){
            throw new Error("Node with uid "+uid+" not found");
        }
        return res;
    }

  


    toDot(): string {
        let wholeDot = 'digraph G {\n';
        let [s, d] = this.getCCFGNodes()
        d = d + this.getCCFGEdges();
        wholeDot += s;
        wholeDot += d;
        wholeDot += '}';
        return wholeDot;
    }

    private getCCFGEdges() : string{
        let edgeDot = ""
        for (let node of this.nodes) {
            if (node.getType() == "ContainerNode") {
                edgeDot += (node as ContainerNode).internalccfg.getCCFGEdges();
            }
        }
        for (let edge of this.edges) {
            edgeDot += `  "${edge.from.uid}" -> "${edge.to.uid}" [label="${this.getEdgeLabel(edge)}"];\n`;
        }
        return edgeDot;
    }

    private getCCFGNodes() :[string, string]{
        let subG = ""
        let nodeDot = ""
        for (let node of this.nodes) {
            if (node.getType() == "ContainerNode") {
               subG += `subgraph cluster_${node.uid} {\n`;
               subG += `label = "${node.value}";\n`;
                let [s, d ] = (node as ContainerNode).internalccfg.getCCFGNodes()
                subG += d;
                subG += s;
                subG += `}\n`;
            } else {
                let shape: string = this.getNodeShape(node);
                let label: string = this.getNodeLabel(node);
                nodeDot += `  "${node.uid}" [label="${label}" shape="${shape}"];\n`;
            }

        }
        return [subG, nodeDot];
    }

    getEdgeLabel(edge: Edge): string {
      
        return edge.guards.map(
            g => 
            /* a.replaceAll("\"","\\\"")).join("\n")+"\n~~~"+*/
            g.replaceAll("\"","\\\"")).join("\n")
            /*+"~~~\n";*/
    }

    getNodeLabel(node: Node): string {
        if(node.functionsDefs.length == 0){
            return node.uid.toString();
        }
        return node.uid+":\n"+node.returnType+" function"+node.functionsNames+"("+node.params.map(p => (p as TypedElement).toString()).join(", ")+"){\n"+node.functionsDefs.map(
            a => a.replaceAll("\"","\\\"")).join("\n")+"\n}";
        //return node.value;
        // switch(node.getType()){
        //     case "Step":
        //         return node.returnType+" function"+node.functionsNames+"("+node.params+")"+node.functionsDefs.map(
        //             a => a.replaceAll("\"","\\\"")).join("\n")//uid.toString();
        //     case "Choice":
        //         return "from:"+node.uid+" to "+node.finishNodeUID+"\n"+node.functionsDefs.map(
        //             a => a.replaceAll("\"","\\\"")).join("\n")
        //     case "OrJoin":
        //         return "OR\nfrom:"+node.uid+" to "+node.finishNodeUID+"\n"+node.functionsDefs.map(
        //             a => a.replaceAll("\"","\\\"")).join("\n")
        //     case "AndJoin":
        //         return "AND\nfrom:"+node.uid+" to "+node.finishNodeUID+"\n"+node.functionsDefs.map(
        //             a => a.replaceAll("\"","\\\"")).join("\n")
        //     case "Fork":
        //         return "from:"+node.uid+" to "+node.finishNodeUID+"\n"+node.functionsDefs.map(
        //             a => a.replaceAll("\"","\\\"")).join("\n");
        //     default:
        //         return "???"+node.uid.toString();
        // }
    }

    getNodeShape(node: Node): string {
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

    getNodeFromName(name: string): Node | undefined {
        return this.nodes.find(n => n.value === name);
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



// // Create a new graph
// let graph = new Graph();

// // Add nodes to the graph
// let stepNode1 = new Step("Step Node");
// let stepNode2 = new Step("Step Node");
// let stepNode3 = new Step("Step Node");
// let stepNode4 = new Step("Step Node");
// let stepNode5 = new Step("Step Node");
// let stepNode6 = new Step("Step Node");
// let stepNode7 = new Step("Step Node");

// let choiceNode = new Choice("Choice Node");
// let orJoinNode = new OrJoin("Or Join Node");
// let andJoinNode = new AndJoin("And Join Node");

// let forkNode = new Fork("Fork Node");

// graph.addNode(stepNode1);
// graph.addNode(stepNode2);
// graph.addNode(stepNode3);
// graph.addNode(stepNode4);
// graph.addNode(stepNode5);
// graph.addNode(stepNode6);
// graph.addNode(stepNode7);
// graph.addNode(choiceNode);
// graph.addNode(orJoinNode);
// graph.addNode(andJoinNode);
// graph.addNode(forkNode);

// // Add edges to the graph
// graph.addEdge(stepNode1, choiceNode);
// graph.addEdge(choiceNode, stepNode2);
// graph.addEdge(choiceNode, stepNode3);
// graph.addEdge(stepNode3, orJoinNode);
// graph.addEdge(stepNode2, orJoinNode);
// graph.addEdge(orJoinNode, stepNode4);
// graph.addEdge(stepNode4, forkNode);
// graph.addEdge(forkNode, stepNode5);
// graph.addEdge(forkNode, stepNode6);
// graph.addEdge(stepNode5, andJoinNode);
// graph.addEdge(stepNode6, andJoinNode);
// graph.addEdge(andJoinNode, stepNode7);

// // Export the graph to the Graphviz DOT format
// let dot = graph.toDot();
// console.log(dot);