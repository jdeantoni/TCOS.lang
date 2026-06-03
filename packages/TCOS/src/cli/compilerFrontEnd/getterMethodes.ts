import chalk from "chalk";
import { Assignment, CollectionRuleSync, EventCombination, EventEmission, EventExpression, MemberCall, MethodMember, NamedElement, SingleRuleSync, TypeReference, ValuedEventRef, ValuedEventRefConstantComparison, VariableDeclaration } from "../../language-server/generated/ast.js";
import { RuleControlFlow } from "./class/RuleControlFlow.js";
import { isParticipantCollectionBased } from "./generatorCCFGCompiler.js";
import { TypedElement } from "./class/TypeElement.js";

export function getValuedEventRefConstantComparison(eventExpression : EventExpression): ValuedEventRefConstantComparison[] {
    let res: ValuedEventRefConstantComparison[] = [];
    if (eventExpression.$type == "ExplicitValuedEventRefConstantComparison" || eventExpression.$type == "ImplicitValuedEventRefConstantComparison") {
        res.push(eventExpression as ValuedEventRefConstantComparison);
    } else if (eventExpression.$type == "EventConjunction" || eventExpression.$type == "EventDisjunction") {
        const lhsRes = getValuedEventRefConstantComparison((eventExpression as EventCombination).lhs);
        const rhsRes = getValuedEventRefConstantComparison((eventExpression as EventCombination).rhs);
        res = res.concat(lhsRes).concat(rhsRes);
    }
    return res;
}

export function getValuedEventRef(eventExpression : EventExpression): ValuedEventRef[] {
    let res: ValuedEventRef[] = [];
    if (eventExpression.$type == "ExplicitValuedEventRef" || eventExpression.$type == "ImplicitValuedEventRef") {
        res.push(eventExpression as ValuedEventRef);
    } else if (eventExpression.$type == "EventConjunction" || eventExpression.$type == "EventDisjunction") {
        const lhsRes = getValuedEventRef((eventExpression as EventCombination).lhs);
        const rhsRes = getValuedEventRef((eventExpression as EventCombination).rhs);
        res = res.concat(lhsRes).concat(rhsRes);
    }
    return res;
}

export function getPreviousNodeNameFromPremiseParticipants(ruleCF: RuleControlFlow, conceptName: string) : string{
    if (ruleCF.premiseParticipants.length == 1) {
        const participants = ruleCF.premiseParticipants[0];
        if (participants.length == 1) { //simple event
            return participants[0].name+conceptName+"Hole";
        }
        if (isParticipantCollectionBased(participants)) {
            if (ruleCF.rule.premise.eventExpression.$type == "NaryEventExpression") { //parallel sync premise on collection
                return participants.filter(p => p.type != "event").map(p => p.name).join("_") + "Hole";
            }

            //sequential collection based premise
            const participantsNoEvent = participants.filter(p => p.type != "event");
            return participantsNoEvent.slice(0,participants.length-2).map(p => p.name).join("_") + "Hole";
        }

        return participants.filter(p => p.type != "event").map(p => p.name).join("_") + "Hole";
    }
    if (ruleCF.premiseParticipants.length > 1) {
        if (ruleCF.rule.premise.eventExpression.$type == "EventConjunction"){
            return ruleCF.rule.name + "AndJoinNode";
        } 
        if(ruleCF.rule.premise.eventExpression.$type == "EventDisjunction"){
            return ruleCF.rule.name + "OrJoinNode";
        }
    }

    console.log(chalk.red("missing case #2 in getPreviousNodeNameFromPremiseParticipants. Use default"));
    return ruleCF.premiseParticipants[0].filter(p => p.type != "event").map(p => p.name).join("_") + "Hole";
    
}

export function getCPPVariableTypeName(typeName: string): string {
    switch (typeName) {
        case "integer":
            return "int";
        case "string":
            return "std::string";
        case "boolean":
            return "bool";
        case "void":
            return "void";
        case "Timer": //TO BE FIXED
            return "int";    
        default:
            return "unknown";
    }
    return "void";
}

function getVariableType(type: TypeReference | undefined) {
    if (type?.primitive) {
        return getCPPVariableTypeName(type.primitive.name);
    } else if (type?.reference && type.reference.ref?.name != undefined) {
        return getCPPVariableTypeName(type.reference.ref?.name);
    }
    return "unknown";
}

/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState 
 * @returns 
 */
export function getVariableDeclarationCode(runtimeState: VariableDeclaration[] | undefined): string {
    let res : string = "";
    if (runtimeState != undefined) {
        let sep = "";
        for(const vardDecl of runtimeState){
            if(vardDecl.type != undefined && vardDecl.type.$cstNode?.text == "Event"){
                continue;
            }else{
                 if(vardDecl.value != undefined && vardDecl.value.$type == "MemberCall"){
                   res = res + sep + `new CreateGlobalVarInstruction(\`\${this.getASTNodeUID(node)}${vardDecl.name}\`,\`${getVariableType(vardDecl.type)}\`)`;
                   sep = ",";
                   res = res + sep + `new SetGlobalVarInstruction(\`\${this.getASTNodeUID(node)}${vardDecl.name}\`,\`${(vardDecl.value != undefined)?`\${node.${(vardDecl.value as MemberCall).element?.$refText}}`:""}\`,\`${getVariableType(vardDecl.type)}\`)`; 
                   
                }else{
                    res = res + sep + `new CreateGlobalVarInstruction(\`\${this.getASTNodeUID(node)}${vardDecl.name}\`,\`${getVariableType(vardDecl.type)}\`)`;
                    sep = ",";
                    if (vardDecl.value != undefined){
                        res = res + sep + ` new SetGlobalVarInstruction(\`\${this.getASTNodeUID(node)}${vardDecl.name}\`,\`${(vardDecl.value != undefined)?vardDecl.value.$cstNode?.text:""}\`,\`${getVariableType(vardDecl.type)}\`)`; 
                    }
                }
                sep= ",";
            }
        }
    }
    return res;
}

/**
 * 
 * @param eventEmission  the event emission
 * @returns a typed element list of the event emission participants
 */
export function getEventEmissionParticipants(eventEmission: EventEmission): TypedElement[][] {
    let res: TypedElement[][] = [];
    if (eventEmission.$type == "SimpleEventEmission") {
        res.push(getExplicitEventExpressionParticipants(eventEmission.event as MemberCall));
    }
    if (eventEmission.$type == "ValuedEventEmission") {
        res.push(getExplicitEventExpressionParticipants(eventEmission.event as MemberCall));
    }
    //SingleRuleSync | CollectionRuleSync
    if (eventEmission.$type == "SingleRuleSync") {
        const tmp = getSingleRuleSyncEventExpressionParticipants(eventEmission as SingleRuleSync);
        tmp.push(new TypedElement(undefined,"starts", "event")); //implicit in conclusion
        res.push(tmp);
    }
    if (eventEmission.$type == "CollectionRuleSync") {
        res = getCollectionRuleSyncEventExpressionParticipants(eventEmission as CollectionRuleSync);
    }

    return res;
}

/**
 * 
 * @param eventExpression the event expression
 * @returns a typed element list of the event synchronisation participants
 */
export function getEventSynchronisationParticipants(eventExpression: EventExpression): TypedElement[][] {
    let res: TypedElement[][] = [];
    //explicit event ref
    if (eventExpression.$type == "ExplicitEventRef") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            res.push(getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall));
        }
        return res;
    }
    if (eventExpression.$type == "SingleRuleSync") {
        const tmp = getSingleRuleSyncEventExpressionParticipants(eventExpression);
        tmp.push(new TypedElement(undefined,"terminates", "event")); //implicit in premise
        res.push(tmp);
        return res;
    }

    if (eventExpression.$type == "ExplicitValuedEventRef" || eventExpression.$type == "ImplicitValuedEventRef") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            const tmp = getValuedEventRefParticipants(eventExpression as ValuedEventRef);
            if (eventExpression.$type == "ImplicitValuedEventRef") {
                tmp.push(new TypedElement(undefined,"terminates", "event")); //implicit in premise
            }
            res.push(tmp);
            return res;
        }
    }
    if (eventExpression.$type == "ExplicitValuedEventRefConstantComparison" || eventExpression.$type == "ImplicitValuedEventRefConstantComparison") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            const tmp = getValuedEventRefConstantComparisonParticipants(eventExpression as ValuedEventRefConstantComparison);
            if (eventExpression.$type == "ImplicitValuedEventRefConstantComparison") {
                tmp.push(new TypedElement(undefined,"terminates", "event")); //implicit in premise
            }
            res.push(tmp);
            return res;
        }
    }

    if (eventExpression.$type == "EventConjunction" || eventExpression.$type == "EventDisjunction") {
        const left = getEventSynchronisationParticipants(eventExpression.lhs);
        const right = getEventSynchronisationParticipants(eventExpression.rhs);
        res = [...left, ...right];
        return res;
    }

    if (eventExpression.$type == "NaryEventExpression") {
        res.push(getExplicitEventExpressionParticipants(eventExpression.collection as MemberCall));
        return res;
    }

    console.log(chalk.bgRed("no event expression found: "+eventExpression.$type));
    return res;

}

/**
 * 
 * @param eventExpression the event expression in the shape of a valued event ref
 * @returns a typed element list of the valued event ref participants
 */
function getValuedEventRefParticipants(eventExpression: ValuedEventRef): TypedElement[] {
    let res: TypedElement[] = [];
    res = getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall);
    return res;
}

/**
 * 
 * @param eventExpression an event expression in the shape of a valued event ref constant comparison
 * @returns a typed element list of the event expression participants
 */
function getValuedEventRefConstantComparisonParticipants(eventExpression: ValuedEventRefConstantComparison): TypedElement[] {
    let res: TypedElement[] = [];
    res = getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall);
    return res;
}

/**
 * checks if an EventExpression in the shape of a rulesync is emitting an event if it is, returns a list of the participants
 * @param rule a single rule sync
 * @returns a typed element list of the event expression participants
 */
function getSingleRuleSyncEventExpressionParticipants(rule: SingleRuleSync): TypedElement[] {
    let res: TypedElement[] = [];
    if ((rule.member as MemberCall)?.element?.ref != undefined) {
        res = getExplicitEventExpressionParticipants(rule.member as MemberCall);
    }

    return res;
}

/**
 * gets the event emission participants of a single rule sync, if any
 * @param rule an event expression in the shape of a collection rule sync
 * @returns a typed element list of the participants to the event expression
 */
function getCollectionRuleSyncEventExpressionParticipants(rule: CollectionRuleSync): TypedElement[][] {
    const res: TypedElement[][] = [];
    if ((rule.collection as MemberCall)?.element?.ref != undefined) {
        res.push(getExplicitEventExpressionParticipants(rule.collection as MemberCall));
        res[0].forEach((p) => p.isCollection = true);
        res[0] = [...res[0], ...getEventEmissionParticipants(rule.singleRule)[0]];
    }
    return res;
}

/**
 * gets the event emission participants of a member call and its anteriors, if any. 
 * @param membercall a member call
 * @returns a typed element list of the event expression participants
 */
function getExplicitEventExpressionParticipants(membercall: MemberCall): TypedElement[] {
    let res: TypedElement[] = [];

    if (membercall?.element?.ref != undefined) {
        if (membercall.element.ref.$type.toString() == "Assignment") {
            const ass = ((membercall.element.ref as unknown) as Assignment);
            let type = ass.terminal.$cstNode?.text;
            if (ass.terminal.$cstNode != undefined && type?.startsWith("(")) {
                type = type.substring(1, ass.terminal.$cstNode.text.length - 1);
            }
            const typedElement: TypedElement = new TypedElement(
                membercall,
                ass.feature,
                type,
                ass.operator == "+="
            );
            res.push(typedElement);
        } else {
            const namedElem = ((membercall.element.ref as unknown) as NamedElement);

            const [name, type] = getNameAndTypeOfElement(namedElem);

            const typedElement: TypedElement = new TypedElement(
                namedElem,
                name,
                type
            );
            res.push(typedElement);
        }
    }
    if (membercall.previous != undefined) {
        return res = [...getExplicitEventExpressionParticipants(membercall.previous as MemberCall), ...res];
    }
    return res;
}

/**
 * extracts the variable type of a name element and returns its name and its type 
 * @param namedElem 
 * @returns [name, type]
 */
function getNameAndTypeOfElement(namedElem: NamedElement): [(string | undefined), (string | undefined)] {
    let type: (string | undefined) = "unknown";
    let name: (string | undefined) = namedElem.name;
    if (namedElem.$type == "VariableDeclaration") {
        if ((namedElem as VariableDeclaration).type?.primitive) {
            type = (namedElem as VariableDeclaration).type?.primitive?.name;
        } else {
            type = (namedElem as VariableDeclaration).type?.reference?.ref?.name;
        }
    } else if (namedElem.$type == "MethodMember") {
        name = name + "()";
        if ((namedElem as MethodMember).returnType?.primitive) {
            type = namedElem.returnType.primitive?.name;
        } else {
            type = namedElem.returnType.reference?.ref?.name;
        }
    }
    return [name, type];
}
