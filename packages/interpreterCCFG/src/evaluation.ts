import * as ccfg from "ccfg";
import type { RuntimeThread } from "./runtime.js";

export function evaluateEdgeGuard(edge: ccfg.Edge, thread: RuntimeThread, sigma: Map<string, unknown>, choiceValue?: unknown): boolean {
    if (edge.guards.length === 0) return true;
    return edge.guards.every(guard => {
        if (guard instanceof ccfg.VerifyEqualInstruction) {
            const left = choiceValue ?? resolveValue(guard.n1, thread, sigma);
            return looseEquals(left, resolveValue(guard.n2, thread, sigma));
        }
        return Boolean(evaluateExpression(guard.toString(), thread, sigma, choiceValue));
    });
}

export function evaluateExpression(expression: string, thread: RuntimeThread, sigma: Map<string, unknown>, choiceValue?: unknown): unknown {
    const trimmed = expression.trim();
    if (trimmed.length === 0) return undefined;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    if (trimmed === "true")  return true;
    if (trimmed === "false") return false;
    if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
        (trimmed.startsWith("'")  && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1);
    }

    const scope = createEvaluationScope(thread, sigma);
    if (choiceValue !== undefined) scope.set("resRight", choiceValue);
    if (scope.has(trimmed)) return scope.get(trimmed);

    const names  = [...scope.keys(), "sigma"];
    const values = [...scope.values(), sigma];
    return Function(...names, `"use strict"; return (${trimmed});`)(...values);
}

export function resolveValue(value: string, thread: RuntimeThread, sigma: Map<string, unknown>): unknown {
    return evaluateExpression(value, thread, sigma);
}

function createEvaluationScope(thread: RuntimeThread, sigma: Map<string, unknown>): Map<string, unknown> {
    const scope = new Map<string, unknown>();
    for (const [name, value] of sigma)        scope.set(name, value);
    for (const [name, value] of thread.locals) scope.set(name, value);
    return scope;
}

function looseEquals(left: unknown, right: unknown): boolean {
    return left == right;
}
