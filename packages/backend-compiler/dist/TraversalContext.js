import { MultiMap } from "langium";
export class TraversalContext {
    fifoThreadUid = new MultiMap();
    continuations = [];
    continuationsRecursLevel = [];
    visitedUID = [];
    recursLevel = 0;
    createdQueueIds = [];
}
