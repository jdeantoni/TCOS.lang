import { AstNode } from "langium";
import { integer } from "vscode-languageclient";
import { Hole, Node, NodeType } from "./Node.js";
import { Instruction } from "./Instruction.js";
/**
 * Represents a Control Flow Graph (CCFG).
 * A CCFG consists of nodes and edges that represent the control flow of a program.
 */
export declare class CCFG {
    nodes: Node[];
    edges: Edge[];
    syncEdges: SyncEdge[];
    alreadyUsedToFillHole: boolean;
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
    addEdge(from: Node, to: Node, _label?: string): Edge;
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
     * @param nodeType
     * @returns the node with the given astNode and type or undefined if not found
     */
    getNodeFromASTNode(astNode: AstNode, nodeType?: NodeType): Node | undefined;
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
    fillHole(hole: Hole, ccfg: CCFG): void;
}
export declare class Edge {
    static edgeUIDCounter: integer;
    from: Node;
    to: Node;
    label?: string;
    astNode: AstNode | undefined;
    guards: Instruction[];
    uid: integer;
    constructor(from: Node, to: Node, label?: string);
}
export declare class SyncEdge extends Edge {
    constructor(from: Node, to: Node, label?: string);
}
