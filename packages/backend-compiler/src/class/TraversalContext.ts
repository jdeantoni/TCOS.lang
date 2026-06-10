import { Node } from "ccfg";
import { MultiMap } from "langium";

export class TraversalContext {
    fifoThreadUid : MultiMap<number,number> = new MultiMap();
    continuations: Node[] = [];
    continuationsRecursLevel: number[] = [];
    visitedUID: number[] = [];
    recursLevel = 0;
    createdQueueIds: number[] = [];
}