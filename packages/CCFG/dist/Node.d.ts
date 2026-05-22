import { AstNode } from "langium";
import { CCFG, Edge } from "./CCFG.js";
import { integer } from "vscode-languageclient";
import { Instruction, TypedElement } from "./Instruction.js";
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
    functionsDefs: Instruction[];
    returnType: string | undefined;
    numberOfVisits: integer;
    isCycleInitiator: boolean;
    cycles: Node[][];
    isVisited: boolean;
    constructor(astNode?: AstNode, type?: NodeType, theActions?: Instruction[]);
    getType(): string;
    isBefore(n2: Node): boolean;
    cyclePossessAnAndJoin(): boolean;
}
export declare class Step extends Node {
    constructor(astNode?: AstNode, type?: NodeType, theActions?: Instruction[]);
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
    constructor(astNode: AstNode, duration: integer);
}
export declare class CollectionHole extends Hole {
    astNodeCollection: AstNode[];
    constructor(astNode: AstNode[]);
    isSequential: boolean;
    parallelSyncPolicy: string;
}
