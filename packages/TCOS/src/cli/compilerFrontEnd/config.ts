import { HoleSpecifier } from "./class/HoleSpecifier.js";
import { RuleControlFlow } from "./class/RuleControlFlow.js";

export const DEBUG = true;

export const conceptNameToHoles: Map<string, HoleSpecifier[]> = new Map();
export const conceptNameToRulesCF: Map<string, RuleControlFlow[]> = new Map();