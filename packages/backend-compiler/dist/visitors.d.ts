import { TraversalContext } from "./class/TraversalContext.js";
import { IGenerator } from "./generator/GeneratorInterface.js";
import { CCFG, Node } from "ccfg";
export declare function visitAllNodes(ccfg: CCFG, currentNode: Node, generator: IGenerator, ctx: TraversalContext, visitIsStarting?: boolean): string[];
