import chalk from "chalk";
import { CollectionHoleSpecifier, HoleSpecifier } from "../class/HoleSpecifier.js";
import { RuleControlFlow } from "../class/RuleControlFlow.js";
import { areParticipantsCoupled, areParticipantsEquals } from "./participants.js";
import { getFirstLeafEmission } from "../emissionTree.js";
import { CollectionRuleSync, NaryEventExpression } from "../../../language-server/generated/ast.js";

/**
 * traverse all the rules and identifies the holes. A hole is a participant that is the conclusion of a rule and the premise of another rule (BUT FOR BROADCAST ?)
 * 
 * @param rulesCF: the list of rules of the opened concept 
 * @returns the list of holes, given as a list of TypedElements (the participants of a memberCall) (the ending event is not relevant) 
 */
export function identifiesHoles(rulesCF: RuleControlFlow[]): HoleSpecifier[] {
    let res: HoleSpecifier[] = []
    for (let i = 0; i < rulesCF.length; i++) {
        const currentRule = rulesCF[i];
        const currentConclusionParticipants = currentRule.conclusionParticipants;
        for (let j = 0; j < rulesCF.length; j++) {
            const anotherRule = rulesCF[j];
            const anotherRulePremiseParticipants = anotherRule.premiseParticipants;

            for(let conclusionP of currentConclusionParticipants){
                for(let premiseP of anotherRulePremiseParticipants){
                    if(areParticipantsCoupled(conclusionP, premiseP)){
                        if (conclusionP.some(te => te.isBroadcast)){
                            //broadcasted events do not create holes ? what do they do ?
                            console.log(chalk.yellow("broadcasted event detected in hole identification, skipping hole creation for participants: "+conclusionP.map(tp => tp.name+":"+tp.type+(tp.isCollection?"[]":"")).join(", ")))
                        }else{
                            if(conclusionP.some(te => te.isCollection)){
                                let holeSpecifier = new CollectionHoleSpecifier(conclusionP, premiseP)
                                const _firstEmission = currentRule.rule.conclusion.eventemissions ? getFirstLeafEmission(currentRule.rule.conclusion.eventemissions) : undefined
                                holeSpecifier.isSequential = _firstEmission?.$type == "CollectionRuleSync" && (_firstEmission as CollectionRuleSync).order == "sequential"
                                holeSpecifier.parallelSyncPolicy = (anotherRule.rule.premise.eventExpression.$type == "NaryEventExpression") ?(anotherRule.rule.premise.eventExpression as NaryEventExpression).policy.operator+"" : "undefined"
                                if(res.map(h => h.startingParticipants).some(p => areParticipantsEquals(p, holeSpecifier.startingParticipants)) == false){
                                    res.push(holeSpecifier)
                                }
                            }
                            else{
                                let holeSpecifier = new HoleSpecifier(conclusionP, premiseP)
                                if(res.map(h => h.startingParticipants).some(p => areParticipantsEquals(p, holeSpecifier.startingParticipants)) == false){
                                    res.push(holeSpecifier)
                                }
                            }     
                        }                   
                    }
                }
            } 
        }
    }
    return res
}

/**
 * traverse all the rules and identifies the holes and semi. A hole is a participant that is the conclusion of a rule and the premise of another rule. A semi hole is only started in a conclusion
 * 
 * @param rulesCF: the list of rules of the opened concept 
 * @returns the list of holes and semi holes, given as a list of TypedElements (the participants of a memberCall) (the ending event is not relevant)
 */
export function identifiesHolesAndSemiHoles(rulesCF: RuleControlFlow[]): HoleSpecifier[] {
    let res: HoleSpecifier[] = identifiesHoles(rulesCF)
    for (let i = 0; i < rulesCF.length; i++) {
        const currentRule = rulesCF[i];
        const currentConclusionParticipants = currentRule.conclusionParticipants;
        for (let p of currentConclusionParticipants) {
            if (p[p.length - 1].name == "starts" && ! p[0].isBroadcast) {
                if (!res.some(h => areParticipantsEquals(h.startingParticipants, p))) {
                    console.log(chalk.yellow("adding semi-hole for participants: "+p.map(tp => tp.name+":"+tp.type+(tp.isCollection?"[]":"")).join(", ")))
                    res.push(new HoleSpecifier(p, undefined))
                }
            }
        }
    }
    return res
}