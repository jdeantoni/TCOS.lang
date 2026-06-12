import { BroadcastedEventEmission, CompositeEventEmission, EventEmission, isParallelEventEmission, isSequentialEventEmission, ValuedEventEmission } from "../../language-server/generated/ast.js";

/**
 * Recursively flattens a CompositeEventEmission tree into its leaf EventEmissions,
 * preserving left-to-right order. Do NOT use when structure matters (sequential chains,
 * parallel forks with nested children) — only use for analysis/scanning passes.
 */
export function flattenCompositeEmission(ce: CompositeEventEmission): EventEmission[] {
    if (isParallelEventEmission(ce) || isSequentialEventEmission(ce)) {
        return [ce.lefteventemission, ...flattenCompositeEmission(ce.righteventemission)];
    }
    return [ce as EventEmission];
}

export function buildEmissionStages(ce: CompositeEventEmission): EventEmission[][] {
    if (isSequentialEventEmission(ce)) {
        return [[ce.lefteventemission], ...buildEmissionStages(ce.righteventemission)];
    }
    if (isParallelEventEmission(ce)) {
        const rightStages = buildEmissionStages(ce.righteventemission);
        if (rightStages.length === 0) {
            return [[ce.lefteventemission]];
        }
        // Left emission starts in parallel with the first stage of the right process.
        rightStages[0] = [ce.lefteventemission, ...rightStages[0]];
        return rightStages;
    }
    return [[ce as EventEmission]];
}

/**
 * Returns the leftmost leaf EventEmission of a CompositeEventEmission tree.
 */
export function getFirstLeafEmission(ce: CompositeEventEmission): EventEmission | undefined {
    if (isParallelEventEmission(ce) || isSequentialEventEmission(ce)) {
        return ce.lefteventemission;
    }
    return ce as EventEmission;
}

export function getValuedEmissionFromLeaf(emission: EventEmission): ValuedEventEmission | undefined {
    if (emission.$type == "ValuedEventEmission") {
        return emission as ValuedEventEmission;
    }
    if (emission.$type == "BroadcastedEventEmission") {
        const nested = (emission as BroadcastedEventEmission).eventEmission as EventEmission | undefined;
        if (nested != undefined && nested.$type == "ValuedEventEmission") {
            return nested as ValuedEventEmission;
        }
    }
    return undefined;
}