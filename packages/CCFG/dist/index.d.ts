import { AstNode } from "langium";
import { integer } from "vscode-languageclient";
export declare class TypedElement {
    name: string;
    type: (string | undefined);
    toString(): string;
}
export declare enum NodeType {
    starts = "starts",
    terminates = "terminates",
    multipleSynchro = "multipleSynchro"
}
export declare abstract class Node {
    static uidCounter: integer;
    uid: integer;
    owningCCFG: CCFG | undefined;
    astNode: AstNode | undefined;
    outputEdges: Edge[];
    inputEdges: Edge[];
    type: NodeType | undefined;
    syncNodeIds: integer[];
    functionsNames: string[];
    params: TypedElement[];
    functionsDefs: string[];
    returnType: string | undefined;
    numberOfVisits: integer;
    isCycleInitiator: boolean;
    cycles: Node[][];
    isVisited: boolean;
    constructor(astNode?: AstNode, type?: NodeType, theActions?: string[]);
    getType(): string;
    isBefore(n2: Node): boolean;
    cyclePossessAnAndJoin(): boolean;
}
export declare class Edge {
    static edgeUIDCounter: integer;
    from: Node;
    to: Node;
    label?: string;
    astNode: AstNode | undefined;
    guards: string[];
    uid: integer;
    constructor(from: Node, to: Node, label?: string);
}
/**
 * Represents a Control Flow Graph (CCFG).
 * A CCFG consists of nodes and edges that represent the control flow of a program.
 */
export declare class CCFG {
    nodes: Node[];
    edges: Edge[];
    syncEdges: SyncEdge[];
    initialState: Node | undefined;
    constructor();
    cleanVisit(): void;
    /**
     * add a node to the CCFG if not already in it. Change the owningCCFG of the node to this CCFG idf necessary
     */
    addNode(node: Node): Node;
    /**
     * add an edge between from and to. If the targetted node already has an input edge, manage the associated orJoin node
     *
     * @param from
     * @param to
     * @param label
     * @returns
     */
    addEdge(from: Node, to: Node, label?: string): Edge;
    /**
     * replace the oldNode by the newNode in the CCFG. reroute the edges accordingly
     * @param oldNode
     * @param newNode
     */
    replaceNode(oldNode: Node, newNode: Node): void;
    /**
     * returns the node with the given uid
     *
     * @param uid: integer
     * @returns the node with the given uid or undefined if not found
     */
    getNodeByUID(uid: integer): Node | undefined;
    /**
     * returns the node with the given astNode and type
     * @param astNode
     * @param t
     * @returns the node with the given astNode and type or undefined if not found
     */
    getNodeFromASTNode(astNode: AstNode, t?: NodeType): Node | undefined;
    computeCorrespondingNodes(): void;
    private findCorrespondingNode;
    /**
     * this old version tried to be smart... it seems we can exploit thread uid like in the next version
     */
    addSyncEdge(): void;
    detectCycles(): boolean;
    private detectCyclesRec;
    collectCycles(): void;
    private findCycles;
    toDot(): string;
    /**
     *
     * @returns the edges in dot format
     */
    private dotGetCCFGEdges;
    /**
     *
     * @returns a tuple with the first element being the subgraph and the second the nodes
     */
    private dotGetCCFGNodes;
    dotGetEdgeLabel(edge: Edge): string;
    dotGetNodeLabel(node: Node): string;
    dotGetNodeShape(node: Node): string;
    fillHole(h: Hole, ccfg: CCFG): void;
}
export declare class SyncEdge extends Edge {
    constructor(from: Node, to: Node, label?: string);
}
export declare class Step extends Node {
    constructor(astNode?: AstNode, type?: NodeType, theActions?: string[]);
}
export declare class Choice extends Node {
    constructor(astNode?: AstNode);
}
export declare class Join extends Node {
    constructor(astNode?: AstNode);
}
export declare class Fork extends Node {
    constructor(astNode?: AstNode);
}
export declare class OrJoin extends Join {
    constructor(astNode?: AstNode);
}
export declare class AndJoin extends Join {
    constructor(astNode?: AstNode);
}
export declare class Hole extends Node {
    constructor(astNode?: AstNode);
}
export declare class TimerHole extends Hole {
    duration: integer;
    constructor(astNode: AstNode, d: integer);
}
export declare class CollectionHole extends Hole {
    astNodeCollection: AstNode[];
    constructor(astNode: AstNode[]);
    isSequential: boolean;
    parallelSyncPolicy: string;
}
