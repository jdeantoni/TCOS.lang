import { AstNode } from "langium";
import {
    BooleanExpression,
    RuleOpening,
    NumberExpression,
    StringExpression,
    ParserRule
} from "../generated/ast.js"
import { BooleanTypeDescription, ErrorType, FunctionParameter, FunctionTypeDescription, NilTypeDescription, NumberTypeDescription, ParserRuleTypeDescription, RuleOpeningTypeDescription, StringTypeDescription, TypeDescription, VoidTypeDescription } from "./interfaces/TypeDescription.js";

export function createNilType(): NilTypeDescription {
    return {
        $type: "nil"
    };
}

export function isNilType(item: TypeDescription): item is NilTypeDescription {
    return item.$type === "nil";
}

export function createVoidType(): VoidTypeDescription {
    return {
        $type: "void"
    }
}

export function isVoidType(item: TypeDescription): item is VoidTypeDescription {
    return item.$type === "void";
}

export function createBooleanType(literal?: BooleanExpression): BooleanTypeDescription {
    return {
        $type: "boolean",
        literal
    };
}

export function isBooleanType(item: TypeDescription): item is BooleanTypeDescription {
    return item.$type === "boolean";
}

export function createStringType(literal?: StringExpression): StringTypeDescription {
    return {
        $type: "string",
        literal
    };
}

export function isStringType(item: TypeDescription): item is StringTypeDescription {
    return item.$type === "string";
}

export function createNumberType(literal?: NumberExpression): NumberTypeDescription {
    return {
        $type: "integer",
        literal
    };
}

export function isNumberType(item: TypeDescription): item is NumberTypeDescription {
    return item.$type === "integer";
}

export function createFunctionType(returnType: TypeDescription, parameters: FunctionParameter[]): FunctionTypeDescription {
    return {
        $type: "function",
        parameters,
        returnType
    };
}

export function isFunctionType(item: TypeDescription): item is FunctionTypeDescription {
    return item.$type === "function";
}

export function createParserRuleType(literal: ParserRule): ParserRuleTypeDescription {
    return {
        $type: "ParserRule",
        literal
    };
}

export function isParserRuleType(item: TypeDescription): item is ParserRuleTypeDescription {
    return item.$type === "ParserRule";
}

export function createRuleOpeningType(literal: RuleOpening): RuleOpeningTypeDescription {
    return {
        $type: "ruleOpening",
        literal
    };
}

export function isRuleOpeningType(item: TypeDescription): item is RuleOpeningTypeDescription {
    return item.$type === "ruleOpening";
}

export function createErrorType(message: string, source?: AstNode): ErrorType {
    return {
        $type: "error",
        message,
        source
    };
}

export function isErrorType(item: TypeDescription): item is ErrorType {
    return item.$type === "error";
}

export function typeToString(item: TypeDescription): string {
    if (isRuleOpeningType(item)) {
        return (item.literal.name === undefined)?"noName":item.literal.name;
    } else if (isFunctionType(item)) {
        const params = item.parameters.map(e => `${e.name}: ${typeToString(e.type)}`).join(', ');
        return `(${params}) => ${typeToString(item.returnType)}`;
    } else {
        return item.$type;
    }
}
