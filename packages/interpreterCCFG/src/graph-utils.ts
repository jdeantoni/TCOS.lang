import * as ccfg from "ccfg";
import type { NodeSnapshot, SourceLocation } from "./types.js";

export function firstTarget(node: ccfg.Node): ccfg.Node | undefined {
    return node.outputEdges[0]?.to;
}

export function snapshotNode(node: ccfg.Node): NodeSnapshot {
    const snapshot: NodeSnapshot = {
        uid: node.uid,
        type: node.getType(),
        functionNames: [...node.functionsNames]
    };
    const source = sourceLocationFromNode(node);
    if (source !== undefined) {
        snapshot.source = source;
    }
    return snapshot;
}

export function sourceLocationFromNode(node: ccfg.Node): SourceLocation | undefined {
    const cstNode = (node.astNode as { $cstNode?: { range?: CstRange; root?: { textDocument?: { uri?: string } } } } | undefined)?.$cstNode;
    const range = cstNode?.range;
    if (range === undefined) {
        return undefined;
    }

    const source: SourceLocation = {
        line: range.start.line + 1,
        column: range.start.character + 1,
        endLine: range.end.line + 1,
        endColumn: range.end.character + 1
    };
    const uri = cstNode?.root?.textDocument?.uri;
    if (uri !== undefined) {
        source.uri = uri;
    }
    return source;
}

interface CstRange {
    start: { line: number; character: number };
    end: { line: number; character: number };
}

export function findFirstReachableAndJoin(start: ccfg.Node): ccfg.AndJoin | undefined {
    const join = findFirstReachableJoin(start);
    if (join instanceof ccfg.AndJoin || join?.getType() === "AndJoin") {
        return join as ccfg.AndJoin;
    }
    return undefined;
}

export function findFirstReachableJoin(start: ccfg.Node): ccfg.Join | undefined {
    const visited = new Set<number>();
    const queue = [...start.outputEdges.map(edge => edge.to)];
    while (queue.length > 0) {
        const node = queue.shift();
        if (node === undefined || visited.has(node.uid)) {
            continue;
        }
        visited.add(node.uid);
        if (node instanceof ccfg.Join || node.getType() === "AndJoin" || node.getType() === "OrJoin") {
            return node as ccfg.Join;
        }
        queue.push(...node.outputEdges.map(edge => edge.to));
    }
    return undefined;
}

export function prepareCCFG(ccfg: { computeCorrespondingNodes?: () => void; addSyncEdge?: () => void; detectCycles?: () => void; collectCycles?: () => void }): void {
    ccfg.computeCorrespondingNodes?.();
    ccfg.addSyncEdge?.();
    ccfg.detectCycles?.();
    ccfg.collectCycles?.();
}
