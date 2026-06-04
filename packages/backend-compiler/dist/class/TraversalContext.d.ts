import { Node } from "ccfg";
import { MultiMap } from "langium";
export declare class TraversalContext {
    fifoThreadUid: MultiMap<number, number>;
    continuations: Node[];
    continuationsRecursLevel: number[];
    visitedUID: number[];
    recursLevel: number;
    createdQueueIds: number[];
}
