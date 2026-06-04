import * as ccfg from "ccfg";
import type { NodeSnapshot, SourceLocation } from "./types.js";
export declare function firstTarget(node: ccfg.Node): ccfg.Node | undefined;
export declare function snapshotNode(node: ccfg.Node): NodeSnapshot;
export declare function sourceLocationFromNode(node: ccfg.Node): SourceLocation | undefined;
export declare function findFirstReachableAndJoin(start: ccfg.Node): ccfg.AndJoin | undefined;
export declare function prepareCCFG(ccfg: {
    computeCorrespondingNodes?: () => void;
    addSyncEdge?: () => void;
    detectCycles?: () => void;
    collectCycles?: () => void;
}): void;
