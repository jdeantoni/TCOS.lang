import fs from 'fs';
import { CompositeGeneratorNode, Grammar, NL, toString } from 'langium';
import { CollectionRuleSync, EventEmission, EventExpression, MemberCall, MethodMember, NamedElement, RWRule, RuleOpening, SingleRuleSync, SoSSpec, ValuedEventRef, ValuedEventRefConstantComparison, VariableDeclaration } from '../language-server/generated/ast'; //VariableDeclaration
import { extractDestinationAndName, FilePathData } from './cli-util';
import path from 'path';
import { Assignment } from 'langium/lib/grammar/generated/ast';







export function generateStuffFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ts`;
    const file = new CompositeGeneratorNode();

    writePreambule(file, data);

    let conceptNames: string[] = []

    for (var openedRule of model.rtdAndRules) {
        if (openedRule.onRule.ref != undefined) {
            conceptNames.push(openedRule.onRule.ref.name)
        }
    }
    file.append(`import { ${conceptNames.join(',')} } from "../../language-server/generated/ast";`, NL)
    file.append(`
export interface SimpleLVisitor {
    visit(node: AstNode): [Node,Node];
    
`, NL)
    for (let name of conceptNames) {
        file.append(`     visit${name}(node: ${name}): [Node,Node];`, NL)
    }
    file.append(`}`, NL)

    file.append(`
export class CCFGVisitor implements SimpleLVisitor {
    ccfg: Graph = new Graph();

    visit(node: AstNode): [Node,Node] {`);

    for (let name of conceptNames) {
        file.append(`
        if(node.$type == "${name}"){
            return this.visit${name}(node as ${name});
        }`)
    }


    file.append(`
        throw new Error("Not implemented: " + node.$type);
    }
    `);

    for (var openedRule of model.rtdAndRules) {
        let name: string = ""
        if (openedRule.onRule.ref != undefined) {
            name = openedRule.onRule.ref.name
        }
        file.append(`
    visit${name}(node: ${name}): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        `);
        let previousNodeName = "startsNode"
        let terminatesNodeName = "terminatesNode"

        const rulesCF = createCCFGFromRules(file, openedRule)

        const startingRules = retrieveStartingRules(rulesCF);
        let hasMultipleTerminate = checkIfMultipleTerminate(rulesCF);

        if (hasMultipleTerminate) {
            file.append(`
        let joinNode: Node = new OrJoin(node.$cstNode?.text+" or join")
        this.ccfg.addNode(joinNode)
        this.ccfg.addEdge(joinNode,terminatesNode)
        `)
            terminatesNodeName = "joinNode"
        }
        file.append(`
        let previousNode =undefined
        `)
        handleConclusion(startingRules[0], file, rulesCF, previousNodeName, terminatesNodeName);
        for (let ruleCF of rulesCF) {
            if (ruleCF != startingRules[0]) {
                handleConclusion(ruleCF, file, rulesCF, previousNodeName, terminatesNodeName);
            }
        }

        file.append(`

        return [startsNode,terminatesNode]
    }`, NL);
    }

    file.append(`
}`, NL)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(file));
    return generatedFilePath;
}


function retrieveStartingRules(rulesCF: RuleControlFlow[]) {
    let startingRule = [];
    for (let r of rulesCF) {
        for (let p of r.premiseParticipants) {
            if (p.name != undefined && p.name == "starts") {
                startingRule.push(r);
            }
        }
    }
    return startingRule;
}

function checkIfMultipleTerminate(rulesCF: RuleControlFlow[]) {
    let terminatingRules = [];
    for (let r of rulesCF) {
        for (let p of r.conclusionParticipants) {
            if (p.name != undefined && p.name == "terminates") {
                terminatingRules.push(r);
            }
        }
    }
    let hasMultipleTerminate = terminatingRules.length > 1;
    return hasMultipleTerminate;
}


function handleConclusion(ruleCF: RuleControlFlow, file: CompositeGeneratorNode, rulesCF: RuleControlFlow[], previousNodeName: string, terminatesNodeName: string) {
    file.append(`
        previousNode = ${getPreviousNodeName(ruleCF, rulesCF, previousNodeName, file)}
    `)
    let isMultipleEmission = ruleCF.rule.conclusion.eventemissions.length > 1;
    if (isMultipleEmission) {
        file.append(`
        let ${ruleCF.rule.name}ForkNode: Node = new Fork("${ruleCF.rule.name}ForkNode")
        this.ccfg.addNode(${ruleCF.rule.name}ForkNode)
        this.ccfg.addEdge(previousNode,${ruleCF.rule.name}ForkNode)
        `);
        let splittedConclusionParticipants = splitArrayByParticipants(ruleCF.conclusionParticipants);
        for (let emissionParticipant of splittedConclusionParticipants) {
            const participantName = emissionParticipant[0].name;
            file.append(`
        let [${participantName}StartNode,${participantName}TerminatesNode] = this.visit(node.${participantName})
        this.ccfg.addEdge(${ruleCF.rule.name}ForkNode,${participantName}StartNode)
        `)
        }
    } else { //single emission
        let isEventEmissionACollection: boolean = checkIfEventEmissionIsCollectionBased(ruleCF);
        if (isEventEmissionACollection) {
            let isConcurrent = (ruleCF.rule.conclusion.eventemissions[0] as CollectionRuleSync).order == "concurrent";
            if (isConcurrent) {
                file.append(`
        let forkNode: Node = new Fork("${ruleCF.rule.name}ForkNode")
        this.ccfg.addNode(forkNode)
        this.ccfg.addEdge(previousNode,forkNode)

        let ${ruleCF.rule.name}FakeNode: Node = new AndJoin("${ruleCF.rule.name}FakeNode")    
        this.ccfg.addNode(${ruleCF.rule.name}FakeNode)    
        for (var child of node.${ruleCF.conclusionParticipants[0].name}) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(forkNode,childStartsNode)
            this.ccfg.addEdge(childTerminatesNode,${ruleCF.rule.name}FakeNode)
        }
        `);
            } else {
                file.append(`
        for (var child of node.${ruleCF.conclusionParticipants[0].name}) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let ${ruleCF.conclusionParticipants[0].name}TerminatesNode = previousNode
        `);

            }
        } else { //single emission, single event
            if (ruleCF.conclusionParticipants[ruleCF.conclusionParticipants.length - 1].name != undefined && ruleCF.conclusionParticipants[ruleCF.conclusionParticipants.length - 1].name == "terminates") {
                file.append(`
        this.ccfg.addEdge(previousNode,${terminatesNodeName})
        `);
            } else {
                let toVisitName = ruleCF.conclusionParticipants[0].name;
                file.append(`
        let [${toVisitName}StartsNode,${toVisitName}TerminatesNode] = this.visit(node.${toVisitName})
        this.ccfg.addEdge(previousNode,${toVisitName}StartsNode)
        `);

            }
        }
    }
}

/**
 * returns the previous node name. May imply the creation of new nodes in case of multiple synchronizations that may require a decision or join node
 * @param ruleCF 
 * @param previousNodeName 
 * @returns the previous node name
 */
function getPreviousNodeName(ruleCF: RuleControlFlow, allRulesCF:RuleControlFlow[], previousNodeName: string, file: CompositeGeneratorNode): string {
    let isStartingRule = ruleCF.premiseParticipants[ruleCF.premiseParticipants.length - 1].name == "starts";
    if (isStartingRule) {
        return previousNodeName
    }

    let isComparison = ruleCF.rule.premise.eventExpression.$type == "ExplicitValuedEventRefConstantComparison"
                       || ruleCF.rule.premise.eventExpression.$type == "ImplicitValuedEventRefConstantComparison";

    if (isComparison) {
        file.append(`
        let ${ruleCF.premiseParticipants[0].name}ChoiceNode${ruleCF.rule.name} = this.ccfg.getNodeFromName("${ruleCF.premiseParticipants[0].name}ChoiceNode")
        if (${ruleCF.premiseParticipants[0].name}ChoiceNode${ruleCF.rule.name} == undefined) {
            let ${ruleCF.premiseParticipants[0].name}ChoiceNode = new Choice("${ruleCF.premiseParticipants[0].name}ChoiceNode")
            this.ccfg.addNode(${ruleCF.premiseParticipants[0].name}ChoiceNode)
            this.ccfg.addEdge(${ruleCF.premiseParticipants[0].name}TerminatesNode,${ruleCF.premiseParticipants[0].name}ChoiceNode)
            ${ruleCF.premiseParticipants[0].name}ChoiceNode${ruleCF.rule.name} = ${ruleCF.premiseParticipants[0].name}ChoiceNode
        }else{
            this.ccfg.addEdge(${ruleCF.premiseParticipants[0].name}TerminatesNode,${ruleCF.premiseParticipants[0].name}ChoiceNode${ruleCF.rule.name})
        }
        `)
        return `${ruleCF.premiseParticipants[0].name}ChoiceNode${ruleCF.rule.name}`
    }

    let isMultipleSynchronization = ruleCF.rule.premise.eventExpression.$type == "EventConjunction"
        || ruleCF.rule.premise.eventExpression.$type == "EventDisjunction"
        || ruleCF.rule.premise.eventExpression.$type == "NaryEventExpression";

    if (isMultipleSynchronization) {
        const indexRight = ruleCF.premiseParticipants.findIndex(p => p.type == "event") + 1

        switch (ruleCF.rule.premise.eventExpression.$type) {
            case "EventConjunction":
                file.append(`
        let ${ruleCF.rule.name}AndJoinNode: Node = new AndJoin("${ruleCF.rule.name}AndJoinNode")
        this.ccfg.addNode(${ruleCF.rule.name}AndJoinNode)
        this.ccfg.addEdge(${ruleCF.premiseParticipants[0].name}TerminatesNode,${ruleCF.rule.name}AndJoinNode)
        this.ccfg.addEdge(${ruleCF.premiseParticipants[indexRight].name}TerminatesNode,${ruleCF.rule.name}AndJoinNode)
                `)
                return `${ruleCF.rule.name}AndJoinNode`
            case "EventDisjunction":
                file.append(`
        let ${ruleCF.rule.name}OrJoinNode: Node = new OrJoin("${ruleCF.rule.name}OrJoinNode")
        this.ccfg.addNode(${ruleCF.rule.name}OrJoinNode)
        this.ccfg.addEdge(${ruleCF.premiseParticipants[0].name}TerminatesNode,${ruleCF.rule.name}OrJoinNode)
        this.ccfg.addEdge(${ruleCF.premiseParticipants[indexRight].name}TerminatesNode,${ruleCF.rule.name}OrJoinNode)
                `)
                return `${ruleCF.rule.name}OrJoinNode`
            case "NaryEventExpression":
                if (ruleCF.rule.premise.eventExpression.policy.operator == "lastOf") {
                    file.append(`
        let ${ruleCF.rule.name}LastOfNode: Node = new AndJoin("${ruleCF.rule.name}LastOfNode")
        this.ccfg.replaceNode(${getEmittingRuleName(ruleCF,allRulesCF)}FakeNode,${ruleCF.rule.name}LastOfNode)                    
                    `)
                    return `${ruleCF.rule.name}LastOfNode`
                } else {
                    file.append(`
        let ${ruleCF.rule.name}FirstOfNode: Node = new OrJoin("${ruleCF.rule.name}FirstOfNode")
        this.ccfg.replaceNode(${getEmittingRuleName(ruleCF,allRulesCF)}FakeNode,${ruleCF.rule.name}FirstOfNode)
                    `)
                    return `${ruleCF.rule.name}FirstOfNode`

                }
        }
        throw new Error("multiple synchronization in getPreviousNodeName Not implemented: " + ruleCF.rule.premise.eventExpression.$type);

    } else {
        return `${ruleCF.premiseParticipants[0].name}TerminatesNode`
    }
}

function getEmittingRuleName(ruleCF: RuleControlFlow, allRulesCF: RuleControlFlow[]): string {
    let premiseFirstParticipant = ruleCF.premiseParticipants[0]
    for(let rule of allRulesCF){
        if (rule.conclusionParticipants[0].name === premiseFirstParticipant.name){
            return rule.rule.name
        }
    }
    return "NotFound"+premiseFirstParticipant.name
}



function checkIfEventEmissionIsCollectionBased(ruleCF: RuleControlFlow) {
    let isEventEmissionACollection: boolean = false;
    for (let p of ruleCF.conclusionParticipants) {
        if (p.isCollection) {
            isEventEmissionACollection = true;
        }
    }
    return isEventEmissionACollection;
}

function writePreambule(fileNode: CompositeGeneratorNode, data: FilePathData) {
    fileNode.append(`
import { AstNode } from "langium";
import { AndJoin, Choice, Fork, Graph, Node, OrJoin, Step } from "../../ccfg/ccfglib";`, NL)
}



function createCCFGFromRules(fileNode: CompositeGeneratorNode, openedRule: RuleOpening): RuleControlFlow[] {
    let res: RuleControlFlow[] = []
    for (var rwr of openedRule.rules) {
        if (rwr.$type == "RWRule") {

            fileNode.append(`// rule ${rwr.name}`, NL)
            let premiseEventParticipants: TypedElement[] = getEventSynchronisationParticipants(rwr.premise.eventExpression);
            fileNode.append(`   //premise: ${premiseEventParticipants.map(p => p.name + ":" + p.type + (p.isCollection ? "[]" : ""))}`, NL)
            let conclusionEventParticipants: TypedElement[] = []
            for (let emission of rwr.conclusion.eventemissions) {
                conclusionEventParticipants = [...conclusionEventParticipants, ...getEventEmissionParticipants(emission)]
                fileNode.append(`   //conclusion: ${conclusionEventParticipants.map(p => p.name + ":" + p.type + (p.isCollection ? "[]" : ""))}`, NL)
            }
            let ruleControlFlow = new RuleControlFlow(rwr, premiseEventParticipants, conclusionEventParticipants)
            res.push(ruleControlFlow)
        }
    }
    return res
}

class RuleControlFlow {
    rule: RWRule
    premiseParticipants: TypedElement[]
    conclusionParticipants: TypedElement[]
    constructor(rule: RWRule, premiseParticipants: TypedElement[], conclusionParticipants: TypedElement[]) {
        this.rule = rule
        this.premiseParticipants = premiseParticipants
        this.conclusionParticipants = conclusionParticipants
    }

}

class TypedElement {
    name: (string | undefined)
    type: (string | undefined)
    isCollection: boolean

    constructor(name: string | undefined, type: string | undefined, isCollection: boolean = false) {
        this.name = name
        this.type = type
        this.isCollection = isCollection
    }

    equals(other: TypedElement): boolean {
        return this.name == other.name && this.type == other.type
    }

}

function getEventEmissionParticipants(eventEmission: EventEmission): TypedElement[] {
    let res: TypedElement[] = []
    if (eventEmission.$type == "SimpleEventEmission") {
        res = getExplicitEventExpressionParticipants(eventEmission.event as MemberCall)
    }
    if (eventEmission.$type == "ValuedEventEmission") {
        res = getExplicitEventExpressionParticipants(eventEmission.event as MemberCall)
    }
    //SingleRuleSync | CollectionRuleSync
    if (eventEmission.$type == "SingleRuleSync") {
        res = getSingleRuleSyncEventExpressionParticipants(eventEmission as SingleRuleSync)
        res.push(new TypedElement("starts", "event")) //implicit in conclusion
    }
    if (eventEmission.$type == "CollectionRuleSync") {
        res = getCollectionRuleSyncEventExpressionParticipants(eventEmission as CollectionRuleSync)
    }

    return res
}

function getEventSynchronisationParticipants(eventExpression: EventExpression): TypedElement[] {
    let res: TypedElement[] = []
    //explicit event ref
    if (eventExpression.$type == "ExplicitEventRef") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            res = getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall)
        }
    }
    if (eventExpression.$type == "SingleRuleSync") {
        res = getSingleRuleSyncEventExpressionParticipants(eventExpression)
        res.push(new TypedElement("terminates", "event")) //implicit in premise
    }

    if (eventExpression.$type == "ExplicitValuedEventRef" || eventExpression.$type == "ImplicitValuedEventRef") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            res = getValuedEventRefParticipants(eventExpression as ValuedEventRef)
            if (eventExpression.$type == "ImplicitValuedEventRef") {
                res.push(new TypedElement("terminates", "event")) //implicit in premise
            }
        }
    }
    if (eventExpression.$type == "ExplicitValuedEventRefConstantComparison" || eventExpression.$type == "ImplicitValuedEventRefConstantComparison") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            res = getValuedEventRefConstantComparisonParticipants(eventExpression as ValuedEventRefConstantComparison)
            if (eventExpression.$type == "ImplicitValuedEventRefConstantComparison") {
                res.push(new TypedElement("terminates", "event")) //implicit in premise
            }
        }
    }

    if (eventExpression.$type == "EventConjunction" || eventExpression.$type == "EventDisjunction") {
        let left = getEventSynchronisationParticipants(eventExpression.lhs)
        let right = getEventSynchronisationParticipants(eventExpression.rhs)
        res = [...left, ...right]
    }

    if (eventExpression.$type == "NaryEventExpression") {
        res = getExplicitEventExpressionParticipants(eventExpression.collection as MemberCall)
    }


    return res

}

function getValuedEventRefParticipants(eventExpression: ValuedEventRef): TypedElement[] {
    let res: TypedElement[] = []
    res = getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall)
    return res
}

function getValuedEventRefConstantComparisonParticipants(eventExpression: ValuedEventRefConstantComparison): TypedElement[] {
    let res: TypedElement[] = []
    res = getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall)
    return res
}

function getSingleRuleSyncEventExpressionParticipants(rule: SingleRuleSync): TypedElement[] {
    let res: TypedElement[] = []
    if ((rule.member as MemberCall)?.element?.ref != undefined) {
        res = getExplicitEventExpressionParticipants(rule.member as MemberCall)
    }

    return res
}

function getCollectionRuleSyncEventExpressionParticipants(rule: CollectionRuleSync): TypedElement[] {
    let res: TypedElement[] = []
    if ((rule.collection as MemberCall)?.element?.ref != undefined) {
        res = getExplicitEventExpressionParticipants(rule.collection as MemberCall)
        res.forEach((p) => p.isCollection = true)
        res = [...res, ...getEventEmissionParticipants(rule.singleRule)]
    }
    return res
}

function getExplicitEventExpressionParticipants(membercall: MemberCall): (TypedElement)[] {
    let res: TypedElement[] = []

    if (membercall?.element?.ref != undefined) {
        if (membercall.element.ref.$type.toString() == "Assignment") {
            let ass = ((membercall.element.ref as unknown) as Assignment)
            let type = ass.terminal.$cstNode?.text
            if (ass.terminal.$cstNode != undefined && type?.startsWith("(")) {
                type = type.substring(1, ass.terminal.$cstNode.text.length - 1)
            }
            let typedElement: TypedElement = new TypedElement(
                ass.feature,
                type,
                ass.operator == "+="
            )
            res.push(typedElement)
        } else {
            let namedElem = ((membercall.element.ref as unknown) as NamedElement)

            let [name, type] = getNameAndTypeOfElement(namedElem);

            let typedElement: TypedElement = new TypedElement(
                name,
                type
            )
            res.push(typedElement)
        }
    }
    if (membercall.previous != undefined) {
        return res = [...getExplicitEventExpressionParticipants(membercall.previous as MemberCall), ...res]
    }
    return res
}

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




function splitArrayByParticipants(elements: TypedElement[]): TypedElement[][] {
    const result: TypedElement[][] = [];
    let currentArray: TypedElement[] = [];
    
    for (const element of elements) {
        if (element.type === 'event') {
            if (currentArray.length > 0) {
                result.push(currentArray);
                currentArray = [];
            }
        } else {
            currentArray.push(element);
        }
    }
    
    if (currentArray.length > 0) {
        result.push(currentArray);
    }
    
    return result;
}
