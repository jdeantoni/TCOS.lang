import { AstNode } from "langium";
import { BooleanExpression, NumberExpression, ParserRule, RuleOpening, StringExpression } from "../../generated/ast.js";

export type TypeDescription =
    | NilTypeDescription
    | VoidTypeDescription
    | BooleanTypeDescription
    | StringTypeDescription
    | NumberTypeDescription
    | FunctionTypeDescription
    | RuleOpeningTypeDescription
    | ParserRuleTypeDescription
    | ErrorType;

export interface NilTypeDescription {
    readonly $type: "nil"
}

export interface VoidTypeDescription {
    readonly $type: "void"
}

export interface BooleanTypeDescription {
    readonly $type: "boolean"
    readonly literal?: BooleanExpression
}

export interface StringTypeDescription {
    readonly $type: "string"
    readonly literal?: StringExpression
}

export interface NumberTypeDescription {
    readonly $type: "integer",
    readonly literal?: NumberExpression
}

export interface FunctionTypeDescription {
    readonly $type: "function"
    readonly returnType: TypeDescription
    readonly parameters: FunctionParameter[]
}

export interface FunctionParameter {
    name: string
    type: TypeDescription
}

export interface ParserRuleTypeDescription {
    readonly $type: "ParserRule"
    readonly literal: ParserRule
}

export interface RuleOpeningTypeDescription {
    readonly $type: "ruleOpening"
    readonly literal: RuleOpening
}

export interface ErrorType {
    readonly $type: "error"
    readonly source?: AstNode
    readonly message: string
}