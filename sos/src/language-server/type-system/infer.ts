import { AstNode } from "langium";
import { BinaryExpression, /*RuleOpening, */isBinaryExpression, isBooleanExpression, isFieldMember, isMemberCall,  isNilExpression, isNumberExpression, isStringExpression, isTypeReference, isUnaryExpression, isVariableDeclaration, MemberCall, TypeReference, isRuleOpening, RuleOpening, isAssignment, ParserRule, isRuleCall, isTemporaryVariable, isCrossReference } from "../generated/ast.js";
import { createBooleanType, createRuleOpeningType as createRuleOpeningType, createErrorType, createNilType, createNumberType, createStringType, createVoidType, isFunctionType, isStringType, TypeDescription, createParserRuleType } from "./descriptions.js";

export function inferType(node: AstNode | undefined, cache: Map<AstNode, TypeDescription>): TypeDescription {
    let type: TypeDescription | undefined;
    if (!node) {
        return createErrorType('Could not infer type for undefined', node);
    }
    const existing = cache.get(node);
    if (existing) {
        return existing;
    }
    // Prevent recursive inference errors
    cache.set(node, createErrorType('Recursive definition', node));
    if (isStringExpression(node)) {
        type = createStringType(node);
    } else if (isNumberExpression(node)) {
        type = createNumberType(node);
    } else if (isBooleanExpression(node)) {
        type = createBooleanType(node);
    } else if (isNilExpression(node)) {
        type = createNilType();
    // } else if (isFunctionDeclaration(node) || isMethodMember(node)) {
    //     const returnType = inferType(node.returnType, cache);
    //     const parameters = node.parameters.map(e => ({
    //         name: e.name,
    //         type: inferType(e.type, cache)
    //     }));
    //     type = createFunctionType(returnType, parameters);
    } else if (isTypeReference(node)) {
        type = inferTypeRef(node, cache);
    } else if (isMemberCall(node)) {
        type = inferMemberCall(node, cache);
        if (node.explicitOperationCall) {
            if (isFunctionType(type)) {
                type = type.returnType;
            }
        }
    } else if (isVariableDeclaration(node)) {
        if (node.type) {
            type = inferType(node.type, cache);
        } else if (node.value) {
            type = inferType(node.value, cache);
        } else {
            type = createErrorType('No type hint for this element', node);
        }
    // } else if (isParameter(node)) {
    //     type = inferType(node.type, cache);
    }
    else if (isTemporaryVariable(node)) {
        if (node.type) {
            type = inferType(node.type, cache);
        } else {
            type = createErrorType('No type hint for this element', node);
        }
    // } else if (isParameter(node)) {
    //     type = inferType(node.type, cache);
    } else if (isFieldMember(node)) {
        type = inferType(node.type, cache);
    } else if (isRuleOpening(node)) {
        type = createRuleOpeningType(node);
    } else if (isBinaryExpression(node)) {
        type = inferBinaryExpression(node, cache);
    } else if (isUnaryExpression(node)) {
        if (node.operator === '!') {
            type = createBooleanType();
        } else {
            type = createNumberType();
        }
    // } else if (isPrintStatement(node)) {
    //     type = createVoidType();
    // } else if (isReturnStatement(node)) {
    //     if (!node.value) {
    //         type = createVoidType();
    //     } else {
    //         type = inferType(node.value, cache);
    //     }
    } else if(isAssignment(node)){
        if(isRuleCall(node.terminal)){
            type = createParserRuleType(node.terminal.rule.ref as ParserRule)
        }
        if(isCrossReference(node.terminal)){
            type = inferType(node.terminal.terminal, cache)
        }
    }else if(isRuleCall(node)){
            type = createParserRuleType(node.rule.ref as ParserRule)
        }
        


    if (!type) {
        type = createErrorType('Could not infer type for ' + node.$type, node);
    }

    cache.set(node, type);
    return type;
}

function inferTypeRef(node: TypeReference, cache: Map<AstNode, TypeDescription>): TypeDescription {
    if (node.primitive) {
        if (node.primitive.name === 'integer') {
            return createNumberType();
        } else if (node.primitive.name === 'string') {
            return createStringType();
        } else if (node.primitive.name === 'boolean') {
            return createBooleanType();
        } else if (node.primitive.name === 'void') {
            return createVoidType();
        }
    } else if (node.reference) {
        if (node.reference.ref && isRuleOpening(node.reference.ref)) {
            return createRuleOpeningType(node.reference.ref);
        }
    // } else if (node.returnType) {
    //     const returnType = inferType(node.returnType, cache);
    //     const parameters = node.parameters.map((e, i) => ({
    //         name: e.name ?? `$${i}`,
    //         type: inferType(e.type, cache)
    //     }));
    //     return createFunctionType(returnType, parameters);
    }
    return createErrorType('Could not infer type for this reference', node);
}

function inferMemberCall(node: MemberCall, cache: Map<AstNode, TypeDescription>): TypeDescription {
    const element = node.element?.ref;
    if (element) {
        return inferType(element, cache);
    } else if (node.explicitOperationCall && node.previous) {
        const previousType = inferType(node.previous, cache);
        if (isFunctionType(previousType)) {
            return previousType.returnType;
        }
        return createErrorType('Cannot call operation on non-function type', node);
    }
    return createErrorType('Could not infer type for element ' + node.element?.$refText, node);
}

function inferBinaryExpression(expr: BinaryExpression, cache: Map<AstNode, TypeDescription>): TypeDescription {
    if (['-', '*', '/', '%'].includes(expr.operator)) {
        return createNumberType();
    } else if (['and', 'or', '<', '<=', '>', '>=', '==', '!='].includes(expr.operator)) {
        return createBooleanType();
    }
    const left = inferType(expr.left, cache);
    const right = inferType(expr.right, cache);
    if (expr.operator === '+') {
        if (isStringType(left) || isStringType(right)) {
            return createStringType();
        } else {
            return createNumberType();
        }
    }
    /* else if (expr.operator === ':=') {
        return right;
    }*/
    return createErrorType('Could not infer type from binary expression', expr);
}

export function getRuleOpeningChain(ruleOpeningItem: RuleOpening): RuleOpening[] {
    const set = new Set<RuleOpening>();
    let value: RuleOpening | undefined = ruleOpeningItem;
    while (value && !set.has(value)) {
        set.add(value);
       // value = value.superClass?.ref;
    }
    // Sets preserve insertion order
    return Array.from(set);
}
