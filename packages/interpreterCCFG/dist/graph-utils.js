import * as ccfg from "ccfg";
export function firstTarget(node) {
    return node.outputEdges[0]?.to;
}
export function snapshotNode(node) {
    const snapshot = {
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
export function sourceLocationFromNode(node) {
    const cstNode = node.astNode?.$cstNode;
    const range = cstNode?.range;
    if (range === undefined) {
        return undefined;
    }
    const source = {
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
export function findFirstReachableAndJoin(start) {
    const visited = new Set();
    const queue = [...start.outputEdges.map(edge => edge.to)];
    while (queue.length > 0) {
        const node = queue.shift();
        if (node === undefined || visited.has(node.uid)) {
            continue;
        }
        visited.add(node.uid);
        if (node instanceof ccfg.AndJoin || node.getType() === "AndJoin") {
            return node;
        }
        queue.push(...node.outputEdges.map(edge => edge.to));
    }
    return undefined;
}
export function prepareCCFG(ccfg) {
    ccfg.computeCorrespondingNodes?.();
    ccfg.addSyncEdge?.();
    ccfg.detectCycles?.();
    ccfg.collectCycles?.();
}
