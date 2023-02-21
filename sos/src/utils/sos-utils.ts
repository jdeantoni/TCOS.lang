import { TemporaryVariable, isBinaryExpression, isTemporaryVariable } from "../language-server/generated/ast"
import { MemberCall, NamedElement, AbstractRule, TypeReference, VariableDeclaration, 
         isTypeReference, isVariableDeclaration, RuleOpening, isMemberCall, isRWRule, isMethodMember,
         isNamedElement, isAssignment, RuleCall, Expression } from "../language-server/generated/ast"
import { isNumberExpression } from "../language-server/generated/ast"

export function getType(elem: MemberCall): NamedElement | AbstractRule;
export function getType(elem: TypeReference | undefined): NamedElement| AbstractRule;
export function getType(elem: NamedElement | undefined): NamedElement| AbstractRule;
export function getType(elem: TemporaryVariable): NamedElement | AbstractRule;
export function getType(elem: VariableDeclaration): NamedElement| AbstractRule;

export function getType(elem:any): NamedElement| AbstractRule {
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
        var temp = (elem.terminal as RuleCall).rule.ref
        if( temp !== undefined){
            return temp
        }
    }

    return {name:'Problem (not type found in generator.ts::getType) elem type is '+elem.type,$container:elem,$type:'TemporaryVariable'}
}




export function print(elem: TemporaryVariable): string;
export function print(elem: Expression | undefined) : string;
export function print(elem: MemberCall): string;
export function print(elem: NamedElement | undefined): string;
export function print(elem: VariableDeclaration | undefined): string;

export function print(elem:any): string {
    if(isTemporaryVariable(elem)){
        return elem.name+":"+getType(elem).name
    }
    if(isNumberExpression(elem)){
        return elem.value.toString()+":number"
    }
    if(isVariableDeclaration(elem)){
            return elem.name+":"+getType(elem).name
    }
    if(isMemberCall(elem)){
        // console.log(elem.element?.ref)
        var s : string =""
        if (elem.element !== undefined) {
            s= elem.element.$refText+":"+getType(elem).name
        }
        return print(elem.previous)+"."+s
    }
    if(isBinaryExpression(elem)){
        return "("+print(elem.left)+" "+elem.operator+" "+print(elem.right)+")"
    }
    if(isNamedElement(elem)){
        return (elem.name)?elem.name:"noName"
    }
    if(isAssignment(elem)){
        var temp = (elem.terminal as RuleCall).rule.ref
        if( temp !== undefined){
            return temp.name
        }
    }
    return 'this';
}


