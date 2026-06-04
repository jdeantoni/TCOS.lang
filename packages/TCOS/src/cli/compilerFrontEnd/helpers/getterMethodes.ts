import chalk from "chalk";
import { Assignment, BroadcastedEventRef, CollectionRuleSync, EventCombination, EventEmission, EventExpression, MemberCall, MethodMember, NamedElement, RuleOpening, SimpleEventEmission, SingleRuleSync, TypeReference, ValuedEventRef, ValuedEventRefConstantComparison, VariableDeclaration } from "../../../language-server/generated/ast.js";
import { HoleSpecifier } from "../class/HoleSpecifier.js";
import { RuleControlFlow } from "../class/RuleControlFlow.js";
import { TypedElement } from "../class/TypeElement.js";
import { areParticipantsEqualsOrCoupled, isBroadcastReceptionParticipants, isParticipantCollectionBased } from "../analysis/participants.js";

export function getValuedEventRefConstantComparison(eventExpression : EventExpression): ValuedEventRefConstantComparison[] {
    let res: ValuedEventRefConstantComparison[] = []
    if (eventExpression.$type == "ExplicitValuedEventRefConstantComparison" || eventExpression.$type == "ImplicitValuedEventRefConstantComparison") {
        res.push(eventExpression as ValuedEventRefConstantComparison)
    } else if (eventExpression.$type == "EventConjunction" || eventExpression.$type == "EventDisjunction") {
        let lhsRes = getValuedEventRefConstantComparison((eventExpression as EventCombination).lhs)
        let rhsRes = getValuedEventRefConstantComparison((eventExpression as EventCombination).rhs)
        res = res.concat(lhsRes).concat(rhsRes)
    }
    return res
}

export function getValuedEventRef(eventExpression : EventExpression): ValuedEventRef[] {
    let res: ValuedEventRef[] = []
    if (eventExpression.$type == "ExplicitValuedEventRef" || eventExpression.$type == "ImplicitValuedEventRef") {
        res.push(eventExpression as ValuedEventRef)
    } else if (eventExpression.$type == "EventConjunction" || eventExpression.$type == "EventDisjunction") {
        let lhsRes = getValuedEventRef((eventExpression as EventCombination).lhs)
        let rhsRes = getValuedEventRef((eventExpression as EventCombination).rhs)
        res = res.concat(lhsRes).concat(rhsRes)
    }
    return res
}

export function getPreviousNodeNameFromPremiseParticipants(ruleCF: RuleControlFlow, conceptName: string, holes: HoleSpecifier[]) : string{
    if (ruleCF.premiseParticipants.length == 1) {
        let participants = ruleCF.premiseParticipants[0];
        if (participants.length == 1) { //simple event
            if (holes.some(h => areParticipantsEqualsOrCoupled(h.startingParticipants, participants))) {
                return participants[0].name+conceptName+"Hole"
            }else{
                return participants[0].name+conceptName+"Node"
            }
        }
        if (isParticipantCollectionBased(participants)) {
            if (ruleCF.rule.premise.eventExpression.$type == "NaryEventExpression") { //parallel sync premise on collection
                return participants.filter(p => p.type != "event").map(p => p.name).join('_') + "Hole"
            }

            //sequential collection based premise
            let participantsNoEvent = participants.filter(p => p.type != "event")
            return participantsNoEvent.slice(0,participants.length-2).map(p => p.name).join('_') + "Hole"
        }

        return participants.filter(p => p.type != "event").map(p => p.name).join('_') + "Hole"
    }
    if (ruleCF.premiseParticipants.length > 1) {
        if (ruleCF.rule.premise.eventExpression.$type == "EventConjunction"){
            return ruleCF.rule.name + "AndJoinNode"
        } 
        if(ruleCF.rule.premise.eventExpression.$type == "EventDisjunction"){
            return ruleCF.rule.name + "OrJoinNode"
        }
    }

    console.log(chalk.red("missing case #2 in getPreviousNodeNameFromPremiseParticipants. Use default"))
    return ruleCF.premiseParticipants[0].filter(p => p.type != "event").map(p => p.name).join('_') + "Hole"
    
}

export function getSingleParticipantNodeName(participants: TypedElement[]): string | undefined {
    if (participants.length != 1) {
        return undefined;
    }
    let ruleName = "";
    if ((participants[0].astNode as VariableDeclaration).$container.$type == "RuleOpening") {
        ruleName = ((participants[0].astNode as VariableDeclaration).$container as RuleOpening).onRule?.$refText ?? "";
    }
    return participants[0].name + ruleName + "Node";
}

export function getCausalReceptionPattern(ruleCF: RuleControlFlow, holes: HoleSpecifier[]): { triggerParticipants: TypedElement[]; receptionParticipants: TypedElement[] } | undefined {
    if (ruleCF.rule.premise.eventExpression.$type != "EventConjunction") {
        return undefined;
    }
    if (ruleCF.premiseParticipants.length != 2) {
        return undefined;
    }

    const p0 = ruleCF.premiseParticipants[0];
    const p1 = ruleCF.premiseParticipants[1];
    const isHole = (participants: TypedElement[]) => holes.some(h => areParticipantsEqualsOrCoupled(h.startingParticipants, participants));
    const isReception = (participants: TypedElement[]) => isBroadcastReceptionParticipants(participants) && !isHole(participants);
    const isTrigger = (participants: TypedElement[]) => participants.length == 1 && !isHole(participants);

    if (isReception(p0) && isTrigger(p1)) {
        return { triggerParticipants: p1, receptionParticipants: p0 };
    }
    if (isReception(p1) && isTrigger(p0)) {
        return { triggerParticipants: p0, receptionParticipants: p1 };
    }
    return undefined;
}

/**
 * 
 * @param eventEmission  the event emission
 * @returns a typed element list of the event emission participants
 */
export function getEventEmissionParticipants(eventEmission: EventEmission): TypedElement[][] {
    let res: TypedElement[][] = []
    if (eventEmission.$type == "SimpleEventEmission") {
        res.push(getExplicitEventExpressionParticipants(eventEmission.event as MemberCall))
    }
    if (eventEmission.$type == "ValuedEventEmission") {
        res.push(getExplicitEventExpressionParticipants(eventEmission.event as MemberCall))
    }
    //SingleRuleSync | CollectionRuleSync
    if (eventEmission.$type == "SingleRuleSync") {
        let tmp = getSingleRuleSyncEventExpressionParticipants(eventEmission as SingleRuleSync)
        tmp.push(new TypedElement(undefined,"starts", "event")) //implicit in conclusion
        res.push(tmp)
    }
    if (eventEmission.$type == "CollectionRuleSync") {
        res = getCollectionRuleSyncEventExpressionParticipants(eventEmission as CollectionRuleSync)
    }
    if (eventEmission.$type == "BroadcastedEventEmission") {
        console.log(chalk.yellow("BroadcastedEventEmission detected in getEventEmissionParticipants "+eventEmission.$cstNode?.text))
        res.push(getExplicitEventExpressionParticipants((eventEmission.eventEmission as SimpleEventEmission).event as MemberCall, true))
        // TODO: too restrictive since the eventemission in the broadcast can be also a valued event emission or event a collection one
    }

    return res
}

/**
 * 
 * @param eventExpression the event expression
 * @returns a typed element list of the event synchronisation participants
 */

export function getEventSynchronisationParticipants(eventExpression: EventExpression): TypedElement[][] {
    let res: TypedElement[][] = []
    if (eventExpression.$type == "BroadcastedEventRef") {
        const broadcasted = eventExpression as BroadcastedEventRef;
        if ((broadcasted.eventRef.membercall as MemberCall)?.element?.ref != undefined) {
            res.push(getExplicitEventExpressionParticipants(broadcasted.eventRef.membercall as MemberCall, true));
        }
        return res;
    }

    //explicit event ref
    if (eventExpression.$type == "ExplicitEventRef") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            res.push(getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall))
        }
        return res
    }
    if (eventExpression.$type == "SingleRuleSync") {
        let tmp = getSingleRuleSyncEventExpressionParticipants(eventExpression)
        tmp.push(new TypedElement(undefined,"terminates", "event")) //implicit in premise
        res.push(tmp)
        return res
    }

    if (eventExpression.$type == "ExplicitValuedEventRef" || eventExpression.$type == "ImplicitValuedEventRef") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            let tmp = getValuedEventRefParticipants(eventExpression as ValuedEventRef)
            if (eventExpression.$type == "ImplicitValuedEventRef") {
                tmp.push(new TypedElement(undefined,"terminates", "event")) //implicit in premise
            }
            res.push(tmp)
            return res
        }
    }
    if (eventExpression.$type == "ExplicitValuedEventRefConstantComparison" || eventExpression.$type == "ImplicitValuedEventRefConstantComparison") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            let tmp = getValuedEventRefConstantComparisonParticipants(eventExpression as ValuedEventRefConstantComparison)
            if (eventExpression.$type == "ImplicitValuedEventRefConstantComparison") {
                tmp.push(new TypedElement(undefined,"terminates", "event")) //implicit in premise
            }
            res.push(tmp)
            return res
        }
    }

    if (eventExpression.$type == "EventConjunction" || eventExpression.$type == "EventDisjunction") {
        let left = getEventSynchronisationParticipants(eventExpression.lhs)
        let right = getEventSynchronisationParticipants(eventExpression.rhs)
        res = [...left, ...right]
        return res
    }

    if (eventExpression.$type == "NaryEventExpression") {
        // For firstOf/lastOf on collections, we need to represent this as a participant group
        // that will trigger OrJoin semantics when combined with other premises via conjunction
        const collectionParticipants = getExplicitEventExpressionParticipants(eventExpression.collection as MemberCall);
        
        if (collectionParticipants.length > 0) {
            // Treat the entire collection path as a single participant group
            // The isCollection flag on the participant will trigger special handling
            res.push(collectionParticipants);
        }
        
        return res
    }

    console.log(chalk.bgRed("no event expression found: "+eventExpression.$type))
    return res

}

/**
 * 
 * @param eventExpression the event expression in the shape of a valued event ref
 * @returns a typed element list of the valued event ref participants
 */
function getValuedEventRefParticipants(eventExpression: ValuedEventRef): TypedElement[] {
    let res: TypedElement[] = []
    res = getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall)
    return res
}

/**
 * 
 * @param eventExpression an event expression in the shape of a valued event ref constant comparison
 * @returns a typed element list of the event expression participants
 */
function getValuedEventRefConstantComparisonParticipants(eventExpression: ValuedEventRefConstantComparison): TypedElement[] {
    let res: TypedElement[] = []
    res = getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall)
    return res
}


/**
 * checks if an EventExpression in the shape of a rulesync is emitting an event if it is, returns a list of the participants
 * @param rule a single rule sync
 * @returns a typed element list of the event expression participants
 */

function getSingleRuleSyncEventExpressionParticipants(rule: SingleRuleSync): TypedElement[] {
    let res: TypedElement[] = []
    if ((rule.member as MemberCall)?.element?.ref != undefined) {
        res = getExplicitEventExpressionParticipants(rule.member as MemberCall)
    }

    return res
}

/**
 * gets the event emission participants of a single rule sync, if any
 * @param rule an event expression in the shape of a collection rule sync
 * @returns a typed element list of the participants to the event expression
 */
function getCollectionRuleSyncEventExpressionParticipants(rule: CollectionRuleSync): TypedElement[][] {
    let res: TypedElement[][] = []
    if ((rule.collection as MemberCall)?.element?.ref != undefined) {
        res.push(getExplicitEventExpressionParticipants(rule.collection as MemberCall))
        res[0].forEach((p) => p.isCollection = true)
        res[0] = [...res[0], ...getEventEmissionParticipants(rule.singleRule)[0]]
    }
    return res
}

/**
 * gets the event emission participants of a member call and its anteriors, if any. 
 * @param membercall a member call
 * @returns a typed element list of the event expression participants
 */
function getExplicitEventExpressionParticipants(membercall: MemberCall, isBroadcast: boolean = false): TypedElement[] {
    let res: TypedElement[] = []

    if (membercall?.element?.ref != undefined) {
        if (membercall.element.ref.$type.toString() == "Assignment") {
            let ass = ((membercall.element.ref as unknown) as Assignment)
            let type = ass.terminal.$cstNode?.text
            if (ass.terminal.$cstNode != undefined && type?.startsWith("(")) {
                type = type.substring(1, ass.terminal.$cstNode.text.length - 1)
            }
            let typedElement: TypedElement = new TypedElement(
                membercall,
                ass.feature,
                type,
                ass.operator == "+=",
                isBroadcast
            )
            res.push(typedElement)
        } else {
            let namedElem = ((membercall.element.ref as unknown) as NamedElement)

            let [name, type] = getNameAndTypeOfElement(namedElem);

            let typedElement: TypedElement = new TypedElement(
                namedElem,
                name,
                type,
                false,
                isBroadcast
            )
            res.push(typedElement)
        }
    }
    if (membercall.previous != undefined) {
        return res = [...getExplicitEventExpressionParticipants(membercall.previous as MemberCall, isBroadcast), ...res]
    }
    return res
}

/**
 * extracts the variable type of a name element and returns its name and its type 
 * @param namedElem 
 * @returns [name, type]
 */
function getNameAndTypeOfElement(namedElem: NamedElement): [(string | undefined), (string | undefined)] {
    let type: (string | undefined) = "unknown"
    let name: (string | undefined) = namedElem.name
    if (namedElem.$type == "VariableDeclaration") {
        if ((namedElem as VariableDeclaration).type?.primitive) {
            type = (namedElem as VariableDeclaration).type?.primitive?.name;
        } else {
            type = (namedElem as VariableDeclaration).type?.reference?.ref?.name;
        }
    } else if (namedElem.$type == "MethodMember") {
        name = name + "()"
        if ((namedElem as MethodMember).returnType?.primitive) {
            type = namedElem.returnType.primitive?.name;
        } else {
            type = namedElem.returnType.reference?.ref?.name;
        }
    }
    return [name, type]
}

/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState 
 * @returns 
 */
export function getVariableDeclarationCode(runtimeState: VariableDeclaration[] | undefined): string {
    var res : string = ""
    if (runtimeState != undefined) {
        let sep = ""
        for(let vardDecl of runtimeState){
            if(vardDecl.type != undefined && vardDecl.type.$cstNode?.text == "event"){
                continue
            }else{
                 if(vardDecl.value != undefined && vardDecl.value.$type == "MemberCall"){
                   res = res + sep + `new CreateGlobalVarInstruction(\`\${this.getASTNodeUID(node)}${vardDecl.name}\`,\`${getVariableType(vardDecl.type)}\`)`
                   sep = ","
                   res = res + sep + `new SetGlobalVarInstruction(\`\${this.getASTNodeUID(node)}${vardDecl.name}\`,\`${(vardDecl.value != undefined)?`\${node.${(vardDecl.value as MemberCall).element?.$refText}}`:""}\`,\`${getVariableType(vardDecl.type)}\`)` 
                   
                }else{
                    res = res + sep + `new CreateGlobalVarInstruction(\`\${this.getASTNodeUID(node)}${vardDecl.name}\`,\`${getVariableType(vardDecl.type)}\`)`
                    sep = ","
                    if (vardDecl.value != undefined){
                        res = res + sep + ` new SetGlobalVarInstruction(\`\${this.getASTNodeUID(node)}${vardDecl.name}\`,\`${(vardDecl.value != undefined)?vardDecl.value.$cstNode?.text:""}\`,\`${getVariableType(vardDecl.type)}\`)` 
                    }
                }
                sep= ","
            }
        }
    }
    return res
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
}

function getVariableType(type: TypeReference | undefined) {
    if (type?.primitive) {
        return getCPPVariableTypeName(type.primitive.name);
    } else if (type?.reference && type.reference.ref?.name != undefined) {
        return getCPPVariableTypeName(type.reference.ref?.name);
    }
    return "unknown"
}