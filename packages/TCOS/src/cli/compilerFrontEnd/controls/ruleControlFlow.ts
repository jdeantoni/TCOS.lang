import chalk from "chalk";
import { RuleControlFlow } from "../class/RuleControlFlow.js";
import { DEBUG } from "../config.js";
import { TypedElement } from "../class/TypeElement.js";
import { getEventEmissionParticipants, getEventSynchronisationParticipants } from "../helpers/getterMethodes.js";
import { CompositeGeneratorNode, NL } from "langium/generate";
import { flattenCompositeEmission } from "../emissionTree.js";
import { RuleOpening } from "../../../language-server/generated/ast.js";

/**  retrieves the starting rule of the concept
 * @param rulesCF: the rule to be analyzed
 * */
export function retrieveStartingRules(rulesCF: RuleControlFlow[], conceptName?: string) {
    const startingRule = [];
    const guardedStartRules: string[] = [];
    for (const r of rulesCF) {
        const hasStartsParticipant = r.premiseParticipants.some(participants => participants[0]?.name == "starts");
        if (!hasStartsParticipant) {
            continue;
        }

        const isGuarded = r.rule.premise.booleanExpression.length > 0;
        const isPlainStartsPremise = r.premiseParticipants.length == 1
            && r.premiseParticipants[0].length == 1
            && r.premiseParticipants[0][0].name == "starts";

        if (!isGuarded && isPlainStartsPremise) {
            startingRule.push(r);
        } else {
            guardedStartRules.push(r.rule.name);
        }
    }

    if (guardedStartRules.length > 0) {
        console.warn(chalk.yellow(`warning: ${conceptName ?? "concept"} has guarded or composite start-related rule(s) (${guardedStartRules.join(", ")}); they will not be treated as the unique bootstrap start rule.`));
    }

    return startingRule;
}

/**
 * retrieves a litst of the rule control flows from the openedRule and adds an explanation of the premisses and conclusions of the rules in the file 
 * @param fileNode the file
 * @param openedRule the rule
 * @returns a list of rule control flows
 */
export function extractRuleControlFlowsFromRules(fileNode: CompositeGeneratorNode, openedRule: RuleOpening): RuleControlFlow[] {
    const res: RuleControlFlow[] = []
    for (const rwr of openedRule.rules) {
        if (rwr.$type == "RWRule") {

            if(DEBUG) fileNode.append(`// rule ${rwr.name}`, NL)
            if(DEBUG) fileNode.append(`   //premise expr type: ${rwr.premise.eventExpression.$type}`, NL)
            const premiseEventParticipants: TypedElement[][] = getEventSynchronisationParticipants(rwr.premise.eventExpression);
            if(DEBUG) fileNode.append(`   //premise participants count: ${premiseEventParticipants.length}`, NL)
            if(DEBUG) fileNode.append(`   //premise: ${premiseEventParticipants.map(pa => pa.map(p => p.name + ":" + p.type + (p.isCollection ? "[]" : ""))).join("\n\t//")}`, NL)
            let conclusionEventParticipants: TypedElement[][] = []
            if (rwr.conclusion.eventemissions) {
                for (const emission of flattenCompositeEmission(rwr.conclusion.eventemissions)) {
                    conclusionEventParticipants = [...conclusionEventParticipants, ...getEventEmissionParticipants(emission)]
                }
            }
            if(DEBUG) fileNode.append(`   //conclusion: ${conclusionEventParticipants.map(pa => pa.map(p => p.name + ":" + p.type + (p.isCollection ? "[]" : ""))).join("\n\t//")}`, NL)
            const ruleControlFlow = new RuleControlFlow(rwr, premiseEventParticipants, conclusionEventParticipants)
            res.push(ruleControlFlow)
        }
    }
    return res
}