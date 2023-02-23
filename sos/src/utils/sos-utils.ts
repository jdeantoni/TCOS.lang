import {isAbstractRule, isCrossReference } from "langium/lib/grammar/generated/ast"
import { CrossReference, TemporaryVariable, isBinaryExpression, isRuleCall, isTemporaryVariable } from "../language-server/generated/ast"
import { MemberCall, NamedElement, AbstractRule, TypeReference, VariableDeclaration, 
         isTypeReference, isVariableDeclaration, RuleOpening, isMemberCall, isRWRule, isMethodMember,
         isNamedElement, isAssignment, RuleCall, Expression } from "../language-server/generated/ast"
import { isNumberExpression } from "../language-server/generated/ast"
import { AstNode, Reference, isReference } from "langium"

export function getType(elem: MemberCall): NamedElement | AbstractRule;
export function getType(elem: TypeReference | undefined): NamedElement| AbstractRule;
export function getType(elem: NamedElement | undefined): NamedElement| AbstractRule;
export function getType(elem: TemporaryVariable): NamedElement | AbstractRule;
export function getType(elem: VariableDeclaration): NamedElement| AbstractRule;
export function getType(elem: Expression): NamedElement| AbstractRule;

export function getType(elem:any): NamedElement| AbstractRule {
    if(isAssignment(elem)){
        if(isRuleCall(elem.terminal)){
            return (elem.terminal as RuleCall).rule.ref as AbstractRule
        }else{
            return (elem.terminal as CrossReference).type.ref as AbstractRule
            
        }
    }
    
    if(isTypeReference(elem)){
        if (elem.primitive){
            return elem.primitive
        }else{
            if(elem.reference?.ref){
                return elem.reference?.ref
            }
        }
    }
    if(isTemporaryVariable(elem)){
        if (elem.type){
            return getType(elem?.type)
        }else{
            return {name:'void', $container:(elem.$container as RuleOpening), $type:'SoSPrimitiveType'}
        }
    }
    if(isVariableDeclaration(elem)){
        if (elem.type){
            return getType(elem?.type)
        }else{
            return {name:'void', $container:(elem.$container as RuleOpening), $type:'SoSPrimitiveType'}
        }
    }
    if(isMemberCall(elem)){
        if (elem.element !== undefined) {
            return getType(elem.element.ref)
        }
    }
    if(isRWRule(elem)){
        return {name:'event', $container:(elem.$container as RuleOpening), $type:'SoSPrimitiveType'}
    }
    if(isMethodMember(elem)){
        return getType(elem.returnType)
    }
    if(isNamedElement(elem)){
        return elem
    }
    if(isAssignment(elem)){
        var temp = undefined
        if(isRuleCall(elem.terminal)){
            temp = (elem.terminal as RuleCall).rule.ref
        }
        if(isCrossReference(elem.terminal)){
            temp = (elem.terminal as CrossReference).type.ref as AbstractRule
        }
        if( temp !== undefined){
            return temp
        }
    }

    return {name:'Problem (not type found in generator.ts::getType) elem type is '+elem,$container:elem,$type:'TemporaryVariable'}
}




export function print(elem: TemporaryVariable, separator:string): string;
export function print(elem: Expression | undefined, separator:string) : string;
export function print(elem: MemberCall, separator:string): string;
export function print(elem: NamedElement | undefined, separator:string): string;
export function print(elem: VariableDeclaration | undefined, separator:string): string;
export function print(elem: AstNode | undefined, separator:string): string;
export function print(elem: Reference | undefined, separator:string): string;
export function print(elem: AbstractRule | undefined, separator:string): string;

export function print(elem:any, separator:string=""): string {
    if(isTemporaryVariable(elem)){
        return elem.name//+":"+getType(elem).name
    }
    if(isNumberExpression(elem)){
        return elem.value.toString()//+":number"
    }
    if(isVariableDeclaration(elem)){
            return elem.name//+":"+getType(elem).name
    }
    if(isReference(elem)){
        return print(elem.ref,separator)//+":"+getType(elem).name
    }
    if(isMemberCall(elem)){
        // console.log(elem.element?.ref)
        var s : string =""
        if (elem.element !== undefined) {
            //s = print(elem.element) -> give the final type !!!
            var parenthesisOrNot=""
            if(elem.explicitOperationCall){
                var args:string=""
                var sep=""
                for(let arg of elem.arguments){
                    args += sep+print(arg,".") //warning problem in case of complex memberCall argument
                    sep=","
                }
                
                parenthesisOrNot = "("+args+")"
            }
            s= elem.element.$refText+parenthesisOrNot//+":"+getType(elem).name

        }
        if(elem.previous){
            return print(elem.previous,separator)+separator+s
        }else{
            return s;
        }
        
    }

    if(isBinaryExpression(elem)){
        return print(elem.left,separator)+" "+elem.operator+" "+print(elem.right,separator)
    }
    if(isNamedElement(elem)){
        return (elem.name)?elem.name:"noName"
    }
    if(isAssignment(elem)){
        var temp = undefined
        if(isRuleCall(elem.terminal)){
            temp = (elem.terminal as RuleCall).rule.ref
        }
        if(isCrossReference(elem.terminal)){
            console.log((elem.terminal as CrossReference).terminal?.$type)
            temp = (elem.terminal as CrossReference).terminal
        }
        if(temp !== undefined){
            return print(temp,separator)
        }
    }
    if(isAbstractRule(elem)){
        return elem.name
    }

    return '';
}


