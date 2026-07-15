import type { ScopeSnapshot, VariableSnapshot } from "./types.js";

export function mapVariables(
    variables: Map<string, unknown>,
    nameMap?: Map<string, string>
): VariableSnapshot[] {
    return [...variables.entries()].map(([name, value]) => ({
        name: nameMap?.get(name) ?? name,
        value,
        type: typeof value,
        variablesReference: 0
    }));
}

export function encodeVariablesReference(threadId: number, scope: ScopeSnapshot["name"]): number {
    const scopeId = scope === "locals" ? 1 : scope === "globals" ? 2 : 3;
    return threadId * 10 + scopeId;
}

export function decodeVariablesReference(variablesReference: number): { threadId: number; scope: ScopeSnapshot["name"] } | undefined {
    const scopeId  = variablesReference % 10;
    const threadId = Math.floor(variablesReference / 10);
    if (threadId <= 0) return undefined;
    if (scopeId === 1) return { threadId, scope: "locals" };
    if (scopeId === 2) return { threadId, scope: "globals" };
    if (scopeId === 3) return { threadId, scope: "temporaries" };
    return undefined;
}
