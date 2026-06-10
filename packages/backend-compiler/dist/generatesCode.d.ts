import { CCFG, Edge, Node } from "ccfg";
import { TraversalContext } from "./class/TraversalContext.js";
import { IGenerator } from "./generator/GeneratorInterface.js";
export declare function addCorrespondingCode(currentNode: Node, ccfg: CCFG, generator: IGenerator, ctx: TraversalContext): string[];
export declare function addQueuePushCode(queueUID: number | undefined, currentNode: Node, ccfg: CCFG, f: string | undefined, generator: IGenerator, ctx: TraversalContext): string[];
export declare function getPreviousTypedNodes(ie: Edge, stopAlsoOnNoCodeJoinNode?: boolean): Node[];
export declare function addComparisonVariableDeclaration(currentNode: Node, generator: IGenerator): string[];
