import fs from 'fs';
import {CompositeGeneratorNode, Grammar, NL, toString } from 'langium';
import { EventExpression, MemberCall, MethodMember, NamedElement, RuleOpening, SingleRuleSync, SoSSpec, ValuedEventRef, ValuedEventRefConstantComparison, VariableDeclaration } from '../language-server/generated/ast'; //VariableDeclaration
import {extractDestinationAndName, FilePathData } from './cli-util';
import path from 'path';
import { Assignment } from 'langium/lib/grammar/generated/ast';







export function generateStuffFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ts`;
    const fileNode = new CompositeGeneratorNode();

    writePreambule(fileNode,data);

    let conceptNames: string[] = []

    for(var openedRule of model.rtdAndRules){
        if (openedRule.onRule.ref != undefined){
            conceptNames.push(openedRule.onRule.ref.name)
        }
    }
    fileNode.append(`import { ${conceptNames.join(',')} } from "../../language-server/generated/ast";`,NL)
    fileNode.append(`
export interface SimpleLVisitor {
    visit(node: AstNode): [Node,Node];
    
`,NL)
    for(let name of conceptNames){
        fileNode.append(`     visit${name}(node: ${name}): [Node,Node];`,NL)
    }
    fileNode.append(`}`,NL)

    fileNode.append(`
export class CCFGVisitor implements SimpleLVisitor {
    ccfg: Graph = new Graph();

    visit(node: AstNode): [Node,Node] {`);
            
    for(let name of conceptNames){
        fileNode.append(`
        if(node.$type == "${name}"){
            return this.visit${name}(node as ${name});
        }`)
    }


    fileNode.append(`
        throw new Error("Not implemented: " + node.$type);
    }
    `,NL);

    for(var openedRule of model.rtdAndRules){
        let name:string = ""
        if (openedRule.onRule.ref != undefined){
            name = openedRule.onRule.ref.name
        }
        fileNode.append(`
    visit${name}(node: ${name}): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)`,NL);
        
        createCCFGFromRules(fileNode,openedRule)
    
        fileNode.append(`
        //TODO

        return [startsNode,terminatesNode]
    }`,NL);
    }

    fileNode.append(`
}`,NL)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}



// function getRwrRuleType(rwr: RWRule) {
//     if (rwr.conclusion.statemodifications.length > 0) {
//         var rawType:string = inferType(rwr.conclusion.statemodifications[rwr.conclusion.statemodifications.length - 1], new Map()).$type;
//         if(rawType ==="number"){
//             return "int"
//         }
//         if(rawType ==="error"){
//             return "void"
//         }
//         if(rawType ==="boolean"){
//             return "bool"
//         }
//     }
//     if (rwr.conclusion.eventemissions.some(em => isValuedEventEmission(em))) {
//         return "void"
//     }
//     return "error in type inference for rule "+rwr.name+" in rule opened on "+(rwr.$container as RuleOpening).onRule
// }

function writePreambule(fileNode: CompositeGeneratorNode, data: FilePathData) {
    fileNode.append(`
import { AstNode } from "langium";
import { AndJoin, Choice, Fork, Graph, Node, OrJoin, Step } from "../../ccfg/ccfglib";`,NL)
}



function createCCFGFromRules(fileNode: CompositeGeneratorNode, openedRule: RuleOpening) {
    for(var rwr of openedRule.rules){
        if(rwr.$type == "RWRule"){
            fileNode.append(`// rule ${rwr.name}`,NL)
            let premiseEventParticipants: TypedElement[] = getPremiseEventExpressionParticipants(rwr.premise.eventExpression);
            fileNode.append(`   //premise: ${premiseEventParticipants.map(p => p.name+":"+p.type+(p.isCollection?"[]":""))}`,NL)   
        }
    }
    /*
     *  1. check if forking
     *  2. check if choices
     *  3. follow the flows from start to couples starts/terminates
     */
}


class TypedElement{
    name: (string |undefined)
    type: (string |undefined)
    isCollection: boolean

    constructor(name: string|undefined, type: string|undefined, isCollection: boolean = false){
        this.name = name
        this.type = type
        this.isCollection = isCollection
    }

}



function getPremiseEventExpressionParticipants(eventExpression: EventExpression): TypedElement[] {
    let res : TypedElement[] = []
    //explicit event ref
    if(eventExpression.$type == "ExplicitEventRef"){
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined){
            res = getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall)
        }
    }
    if(eventExpression.$type == "SingleRuleSync"){
        res = getSingleRuleSyncEventExpressionParticipants(eventExpression)
        res.push(new TypedElement("terminates","event")) //implicit in premise
    }
    if(eventExpression.$type == "ExplicitValuedEventRef" || eventExpression.$type == "ImplicitValuedEventRef"){
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined){
            res = getValuedEventRefParticipants(eventExpression as ValuedEventRef)
            if(eventExpression.$type == "ImplicitValuedEventRef"){
                res.push(new TypedElement("terminates","event")) //implicit in premise
            }
        }
    }
    if(eventExpression.$type == "ExplicitValuedEventRefConstantComparison" || eventExpression.$type == "ImplicitValuedEventRefConstantComparison"){
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined){
            res = getValuedEventRefConstantComparisonParticipants(eventExpression as ValuedEventRefConstantComparison)
            if(eventExpression.$type == "ImplicitValuedEventRefConstantComparison"){
                res.push(new TypedElement("terminates","event")) //implicit in premise
            }
        }
    }

    if(eventExpression.$type == "EventConjunction" || eventExpression.$type == "EventDisjunction"){
        let left = getPremiseEventExpressionParticipants(eventExpression.lhs)
        let right = getPremiseEventExpressionParticipants(eventExpression.rhs)
        res = [...left,...right]
    }


    return res

}

function getValuedEventRefParticipants(eventExpression: ValuedEventRef): TypedElement[] {
    let res : TypedElement[] = []
    res = getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall)
    return res
}

function getValuedEventRefConstantComparisonParticipants(eventExpression: ValuedEventRefConstantComparison): TypedElement[] {
    let res : TypedElement[] = []
    res = getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall)
    return res
}

function getSingleRuleSyncEventExpressionParticipants(rule: SingleRuleSync): TypedElement[] {
    let res : TypedElement[] = []
    if ((rule.member as MemberCall)?.element?.ref != undefined){
        res = getExplicitEventExpressionParticipants(rule.member as MemberCall)
    }

    return res
}

function getExplicitEventExpressionParticipants(membercall: MemberCall): (TypedElement)[] {
    let res : TypedElement[] = []

    if (membercall?.element?.ref != undefined){
        if(membercall.element.ref.$type.toString() == "Assignment"){
            let ass = ((membercall.element.ref as unknown) as Assignment)
            let type = ass.terminal.$cstNode?.text
            if(ass.terminal.$cstNode != undefined && type?.startsWith("(")){
                type = type.substring(1,ass.terminal.$cstNode.text.length-1)
            }
            let typedElement : TypedElement = new TypedElement(
                ass.feature,
                type,
                ass.operator == "+="
            )
            res.push(typedElement)
        }else{
            let namedElem = ((membercall.element.ref as unknown) as NamedElement)
            
            let [name,type] = getNameAndTypeOfElement(namedElem);
            
            let typedElement : TypedElement = new TypedElement(
                name,
                type
            )
            res.push(typedElement)
        }
    }
    if(membercall.previous != undefined){
       return  res = [...getExplicitEventExpressionParticipants(membercall.previous as MemberCall), ...res]
    }
    return res
}

function getNameAndTypeOfElement(namedElem: NamedElement): [(string|undefined),(string|undefined)] {
    let type : (string|undefined) = "unknown"
    let name : (string|undefined) = namedElem.name
    if (namedElem.$type == "VariableDeclaration") {
        if ((namedElem as VariableDeclaration).type?.primitive) {
            type = (namedElem as VariableDeclaration).type?.primitive?.name;
        } else {
            type = (namedElem as VariableDeclaration).type?.reference?.ref?.name;
        }
    } else if (namedElem.$type == "MethodMember") {
        name = name+"()"
        if ((namedElem as MethodMember).returnType?.primitive) {
            type = namedElem.returnType.primitive?.name;
        } else {
            type = namedElem.returnType.reference?.ref?.name;
        }
    }
    return [name,type]
}

