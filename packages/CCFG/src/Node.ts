import { AstNode } from "langium";
import { CCFG, Edge } from "./CCFG.js";
import { integer } from "vscode-languageclient";
import { Instruction, TypedElement } from "./Instruction.js";

export enum NodeType {
    starts = "starts",
    terminates = "terminates",
    multipleSynchro = "multipleSynchro",
}

export abstract class Node {
 
    static uidCounter: integer = 0;
    uid: integer;
    owningCCFG: CCFG | undefined = undefined;

    astNode: AstNode | undefined;

    outputEdges: Edge[] = [];
    inputEdges: Edge[] = [];

    type: NodeType | undefined = undefined;

    syncNodeIds: integer[] = [];
    functionsNames: string[] = [];
    params: TypedElement[] = [];
    functionsDefs: Instruction[];
    returnType: string|undefined = undefined;

    numberOfVisits: integer = 0;
    isCycleInitiator: boolean = false;
    cycles: Node[][] = [];

    isVisited: boolean = false;

    constructor(astNode?:AstNode, type?: NodeType, theActions: Instruction[] = []) {
        this.uid = Node.uidCounter++;
        this.astNode = astNode;
        this.type = type;
        this.functionsDefs = theActions;
    }

    getType(): string { return this.constructor.name; }

    isBefore(n2: Node): boolean {
        if(this.isVisited){
            // console.log(chalk.red("error: already visited"+this.uid));
            return false;
        }
        this.isVisited = true;

        if (this.outputEdges.length == 0){
            // console.log(chalk.gray("ending node reached"));
            this.isVisited = false;
            return false;
        }

        for (const e of this.outputEdges) {
            if (e.to === n2){
                // console.log(chalk.gray("info: "+this.uid+" is before "+n2.uid));
                this.isVisited = false;
                return true;
            }
        }

        for(const e of this.outputEdges){
            // console.log(chalk.gray("info: moving to node"+e.to.uid));
            return e.to.isBefore(n2);
        }
        // console.log(chalk.green("info: no path found from "+this.uid+" to "+n2.uid));
        this.isVisited = false;
        return false;
    }

    cyclePossessAnAndJoin(): boolean {
        return this.cycles.some(c => { return c.some(n => {
            // console.log(n.uid+":"+n.getType())
            if(n.getType() == "AndJoin"){
                return true;
            }
            return false;
        });});
    }
}

export class Step extends Node {
    constructor(astNode?:AstNode, type?: NodeType, theActions: Instruction[] = []) {
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

    constructor(astNode:AstNode, duration:integer) {
        super(astNode);
        this.duration = duration;
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