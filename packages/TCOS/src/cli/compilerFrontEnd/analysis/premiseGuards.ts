import { BinaryExpression, ClassicalExpression, MemberCall } from "../../../language-server/generated/ast.js";
import { RuleControlFlow } from "../class/RuleControlFlow.js";
import { getValuedEventRefConstantComparison } from "../helpers/getterMethodes.js";
import { visitValuedEventRefComparison } from "../visitor.js";

function visitPremiseBooleanComparison(expression: ClassicalExpression | undefined): string {
    if (expression == undefined || expression.$type != "BinaryExpression") {
        return "";
    }

    const comparison = expression as BinaryExpression;
    if (comparison.operator != "==") {
        return "";
    }

    const left = formatPremiseGuardOperand(comparison.left);
    const right = formatPremiseGuardOperand(comparison.right);
    if (left == undefined || right == undefined) {
        return "";
    }

    return `new VerifyEqualInstruction(${left},${right})`;
}

export function formatPremiseGuardOperand(expression: ClassicalExpression | undefined): string | undefined {
    if (expression == undefined) {
        return undefined;
    }

    if (expression.$type == "MemberCall") {
        const memberCall = expression as MemberCall;
        if (memberCall.element?.ref != undefined) {
            const previous = (memberCall.previous as MemberCall | undefined)?.element;
            return `\`\${this.getASTNodeUID(node${previous != undefined ? "." + previous.$refText : ""})}${memberCall.element.ref.name}\``;
        }
        if (memberCall.previous != undefined) {
            return formatPremiseGuardOperand(memberCall.previous as ClassicalExpression);
        }
        return undefined;
    }

    if (expression.$type == "BooleanExpression" || expression.$type == "NumberExpression" || expression.$type == "StringExpression") {
        return `\`${expression.$cstNode?.text}\``;
    }

    return undefined;
}

export function buildPremiseGuardString(ruleCF: RuleControlFlow): string {
    const guards: string[] = [];

    for (const comparison of getValuedEventRefConstantComparison(ruleCF.rule.premise.eventExpression)) {
        const guard = visitValuedEventRefComparison(comparison);
        if (guard.length > 0) {
            guards.push(guard);
        }
    }

    for (const comparison of ruleCF.rule.premise.booleanExpression) {
        const guard = visitPremiseBooleanComparison(comparison);
        if (guard.length > 0) {
            guards.push(guard);
        }
    }

    return guards.join(",");
}