import { RWRule } from "../../../language-server/generated/ast.js";
import { TypedElement } from "./TypeElement.js";

/**
 * a class representing a rule control flow
 * @param rule the rule AST node
 * @param premiseParticipants the potentially multiple premises of the rule
 * @param conclusionParticipants the potentially multiple conclusions of the rule
 */
export class RuleControlFlow {
    rule: RWRule;
    premiseParticipants: TypedElement[][]; 
    conclusionParticipants: TypedElement[][];
    constructor(rule: RWRule, premiseParticipants: TypedElement[][], conclusionParticipants: TypedElement[][]) {
        this.rule = rule;
        this.premiseParticipants = premiseParticipants;
        this.conclusionParticipants = conclusionParticipants;
    }
}