import fs from 'fs';
import { CompositeGeneratorNode, Grammar,  NL, toString } from 'langium';
import { Assignment, BinaryExpression, CollectionRuleSync, EventCombination, EventEmission, EventExpression, MemberCall, MethodMember, NamedElement, RWRule, RuleOpening, SingleRuleSync, SoSSpec, TypeReference, ValuedEventEmission, ValuedEventRef, ValuedEventRefConstantComparison, VariableDeclaration } from '../language-server/generated/ast.js'; //VariableDeclaration
import { extractDestinationAndName, FilePathData } from './cli-util.js';
import path from 'path';
import { inferType } from '../language-server/type-system/infer.js';






export function generateStuffFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ts`;
    const file = new CompositeGeneratorNode();

    writePreambule(file, data);

    file.append(`
    import { Range, integer } from "vscode-languageserver";

    var globalUnNamedCounter:integer = 0

    function getName(node:AstNode | Reference<AstNode> | undefined): string {
        if(isReference(node)){
            node = node.ref
        }
        if(node !==undefined && node.$cstNode){
            var r: Range = node.$cstNode?.range
            return node.$type+r.start.line+"_"+r.start.character+"_"+r.end.line+"_"+r.end.character;
        }else{
            return "noName"+globalUnNamedCounter++
        }
    }
    `)

    let conceptNames: string[] = []

    for (var openedRule of model.rtdAndRules) {
        if (openedRule.onRule?.ref != undefined) {
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
        if (openedRule.onRule?.ref != undefined) {
            name = openedRule.onRule.ref.name
        }
        file.append(`
    visit${name}(node: ${name}): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[${visitVariableDeclaration(openedRule.runtimeState as VariableDeclaration[])}])
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
            //TODO: handle multiple terminate in case the rules premise are comparisons, in which cases a choice node is required

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

/**
 * generates nodes and edges corresponding to the conclusion of a rule. 
 * Require to retrieve the previous node name which itself construct the nodes and edges of the premise
 * @param ruleCF: the current rule
 * @param file : the file containing the generated compiler
 * @param rulesCF: all the rules of the opened concept 
 * @param previousNodeName 
 * @param terminatesNodeName 
 */
function handleConclusion(ruleCF: RuleControlFlow, file: CompositeGeneratorNode, rulesCF: RuleControlFlow[], previousNodeName: string, terminatesNodeName: string) {
    file.append(`
        previousNode = ${getPreviousNodeName(ruleCF, rulesCF, previousNodeName, file)}
    `)
    let actionsString = ""
    actionsString = visitStateModifications(ruleCF, actionsString);
    file.append(`
    previousNode.actions =[...previousNode.actions, ...[${actionsString}]]
    `);
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
    let eventEmissionActions = ""
    for(let emission of ruleCF.rule.conclusion.eventemissions){
        if(emission.$type == "ValuedEventEmission"){
            eventEmissionActions = eventEmissionActions + visitValuedEventEmission(emission as ValuedEventEmission)
        }
    }
    file.append(`
    previousNode.actions =[...previousNode.actions, ...[${eventEmissionActions}]]
    `);
}


/**
 * returns the previous node name. May imply the creation of new nodes in case of multiple synchronizations that may require a decision or join node
 * @param ruleCF 
 * @param previousNodeName 
 * @returns the previous node name
 */
function getPreviousNodeName(ruleCF: RuleControlFlow, allRulesCF:RuleControlFlow[], previousNodeName: string, file: CompositeGeneratorNode): string {
    let isStartingRule = ruleCF.premiseParticipants[0].name == "starts";
    if (isStartingRule) {
        return previousNodeName
    }

    /**
     * TODO : handle the general case where the premise is a complex comparison, typically inside a conjunction or disjunction
     * In this case, a choice node is required after the synchronization node. Somehow, the previous node mechanism should be recursive
     */
    let isSimpleComparison = ruleCF.rule.premise.eventExpression.$type == "ExplicitValuedEventRefConstantComparison"
                            || ruleCF.rule.premise.eventExpression.$type == "ImplicitValuedEventRefConstantComparison";

    if (isSimpleComparison) {
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
        let multipleSynchroName: string = ""
        switch (ruleCF.rule.premise.eventExpression.$type) {
            case "EventConjunction":
                file.append(`
        let ${ruleCF.rule.name}AndJoinNode: Node = new AndJoin("${ruleCF.rule.name}AndJoinNode")
        this.ccfg.addNode(${ruleCF.rule.name}AndJoinNode)
        this.ccfg.addEdge(${ruleCF.premiseParticipants[0].name}TerminatesNode,${ruleCF.rule.name}AndJoinNode)
        this.ccfg.addEdge(${ruleCF.premiseParticipants[indexRight].name}TerminatesNode,${ruleCF.rule.name}AndJoinNode)
                `)
                multipleSynchroName=  `${ruleCF.rule.name}AndJoinNode`
                let lhs = ruleCF.rule.premise.eventExpression.lhs
                if(lhs.$type == "ExplicitValuedEventRef" || lhs.$type == "ImplicitValuedEventRef"){
                    let leftActions: string = visitValuedEventRef(lhs as ValuedEventRef)
                    file.append(`
        ${multipleSynchroName}.actions = [...${multipleSynchroName}.actions, ...[${leftActions}]]
                    `)
                }
                let rhs = ruleCF.rule.premise.eventExpression.rhs
                if(rhs.$type == "ExplicitValuedEventRef" || rhs.$type == "ImplicitValuedEventRef"){
                    let rightActions: string = visitValuedEventRef(rhs as ValuedEventRef)
                    file.append(`
        ${multipleSynchroName}.actions = [...${multipleSynchroName}.actions, ...[${rightActions}]]
                    `)
                }
                break
            case "EventDisjunction":
                file.append(`
        let ${ruleCF.rule.name}OrJoinNode: Node = new OrJoin("${ruleCF.rule.name}OrJoinNode")
        this.ccfg.addNode(${ruleCF.rule.name}OrJoinNode)
        this.ccfg.addEdge(${ruleCF.premiseParticipants[0].name}TerminatesNode,${ruleCF.rule.name}OrJoinNode)
        this.ccfg.addEdge(${ruleCF.premiseParticipants[indexRight].name}TerminatesNode,${ruleCF.rule.name}OrJoinNode)
                `)
                multipleSynchroName= `${ruleCF.rule.name}OrJoinNode`
                break
            case "NaryEventExpression":
                if (ruleCF.rule.premise.eventExpression.policy.operator == "lastOf") {
                    file.append(`
        let ${ruleCF.rule.name}LastOfNode: Node = new AndJoin("${ruleCF.rule.name}LastOfNode")
        this.ccfg.replaceNode(${getEmittingRuleName(ruleCF,allRulesCF)}FakeNode,${ruleCF.rule.name}LastOfNode)                    
                    `)
                    multipleSynchroName= `${ruleCF.rule.name}LastOfNode`
                } else {
                    file.append(`
        let ${ruleCF.rule.name}FirstOfNode: Node = new OrJoin("${ruleCF.rule.name}FirstOfNode")
        this.ccfg.replaceNode(${getEmittingRuleName(ruleCF,allRulesCF)}FakeNode,${ruleCF.rule.name}FirstOfNode)
                    `)
                    multipleSynchroName= `${ruleCF.rule.name}FirstOfNode`
                    break
                }
        }
        if (ruleCF.rule.premise.eventExpression.$type === "NaryEventExpression") {
            return multipleSynchroName
        }
        let ownsACondition = chekIfOwnsACondition(ruleCF.rule.premise.eventExpression as EventCombination)
        if(ownsACondition){
            file.append(`
        let ${ruleCF.rule.name}ConditionNode: Node = new Choice("${ruleCF.rule.name}ConditionNode")
        this.ccfg.addNode(${ruleCF.rule.name}ConditionNode)
        this.ccfg.addEdge(${multipleSynchroName},${ruleCF.rule.name}ConditionNode)
            `)
            return `${ruleCF.rule.name}ConditionNode`
        }else{
            return multipleSynchroName
        }
    } else {
        let varActions: string = visitValuedEventRef(ruleCF.rule.premise.eventExpression as ValuedEventRef)
        file.append(`
        ${ruleCF.premiseParticipants[0].name}TerminatesNode.actions = [...${ruleCF.premiseParticipants[0].name}TerminatesNode.actions, ...[${varActions}]]
        `)
        return `${ruleCF.premiseParticipants[0].name}TerminatesNode`
    }
}

function chekIfOwnsACondition(comb: EventCombination): boolean {
    return comb.lhs.$type == "ExplicitValuedEventRefConstantComparison" || comb.lhs.$type == "ImplicitValuedEventRefConstantComparison"
            ||
           comb.rhs.$type == "ExplicitValuedEventRefConstantComparison" || comb.rhs.$type == "ImplicitValuedEventRefConstantComparison"
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
import { AstNode, Reference, isReference } from "langium";
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



/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState
 * @returns
 */
function visitValuedEventRef(valuedEventRef: ValuedEventRef | undefined): string {
    var res : string = ""
    if (valuedEventRef != undefined) {
        let v = valuedEventRef.tempVar
        let varType = inferType(v, new Map())
        let typeName = getCPPVariableTypeName(varType.$type)
        if(valuedEventRef.tempVar != undefined && valuedEventRef.$type == "ImplicitValuedEventRef"){
            //on the left of = it was getName(node.${(valuedEventRef.membercall as MemberCall).element?.$refText})
            res = res + `\`${typeName}* \${getName(node)}${v.$cstNode?.offset} = \${getName(node.${(valuedEventRef.membercall as MemberCall).element?.$refText})}${"terminates"};//valuedEventRef ${valuedEventRef.tempVar.name}\``
        }
        if(valuedEventRef.tempVar != undefined && valuedEventRef.$type == "ExplicitValuedEventRef"){
            let prev = (valuedEventRef.membercall as MemberCall)?.previous
            res = res + `\`${typeName}* \${getName(node)}${v.$cstNode?.offset} = \${getName(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRef.membercall as MemberCall).element?.$refText};//valuedEventRef ${valuedEventRef.tempVar.name}\``
        }
    }
    return res
}




/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState 
 * @returns 
 */
function visitVariableDeclaration(runtimeState: VariableDeclaration[] | undefined): string {
    var res : string = ""
    if (runtimeState != undefined) {
        for(let vardDecl of runtimeState){
            res = res + `\`sigma["\${getName(node)}${vardDecl.name}"] = new ${getVariableType(vardDecl.type)}();\``
        }
    }
    return res
}

/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState 
 * @returns 
 */
function visitValuedEventEmission(valuedEmission: ValuedEventEmission | undefined): string {
    var res : string = ""
    if (valuedEmission != undefined) {
        let varType = inferType(valuedEmission.data, new Map())
        let typeName = getCPPVariableTypeName(varType.$type)
        if(valuedEmission.data != undefined && valuedEmission.data.$type == "MemberCall"){
            res = createVariableFromMemberCall(valuedEmission.data as MemberCall, typeName)
        }
        if(valuedEmission.data != undefined && valuedEmission.data.$type == "BinaryExpression"){
            let lhs = (valuedEmission.data as BinaryExpression).left
            let lhsType = inferType(lhs, new Map())
            let lhsTypeName = getCPPVariableTypeName(lhsType.$type)
            let leftRes = createVariableFromMemberCall(lhs as MemberCall, lhsTypeName)
            res = res + leftRes+","
            let rhs = (valuedEmission.data as BinaryExpression).right
            let rhsType = inferType(rhs, new Map())
            let rhsTypeName = getCPPVariableTypeName(rhsType.$type)
            let rightRes = createVariableFromMemberCall(rhs as MemberCall, rhsTypeName)
            res = res + rightRes+","
            let applyOp = (valuedEmission.data as BinaryExpression).operator
            res = res + `\`${typeName} \${getName(node)}${valuedEmission.data.$cstNode?.offset} = \${getName(node)}${rhs.$cstNode?.offset} ${applyOp} \${getName(node)}${rhs.$cstNode?.offset};\``
        }
        res = res + `,\`${typeName} \${getName(node)}${(valuedEmission.event as MemberCall).element?.ref?.name} =  \${getName(node)}${valuedEmission.data.$cstNode?.offset};\``
    }
    return res
}

function createVariableFromMemberCall(data: MemberCall, typeName: string): string {
    let res: string = ""
    let prev = (data.previous as MemberCall)?.element
    let elem = data.element?.ref
    if (elem == undefined) {
        return res
    }
    if (elem?.$type == "VariableDeclaration") {
        res = res + `\`${typeName} \${getName(node)}${data.$cstNode?.offset} = *(${typeName} *) sigma["\${getName(node${prev != undefined ? "."+prev.$refText : ""})}${elem.name}"];//${elem.name}}\``
    } else {
        res = res + `\`${typeName} \${getName(node)}${data.$cstNode?.offset} = \${getName(node)}${prev != undefined ? prev?.ref?.$cstNode?.offset : elem.$cstNode?.offset};\ //${elem.name}\``
    }
    return res
}

// function visitValuedEventEmission(valuedEvent: ValuedEventRef | undefined): string {
//     var res : string = ""
//     if (valuedEvent != undefined) {
//         res = res + `\`${getVariableType((valuedEvent.tempVar as TemporaryVariable).type)}* \${getName(node)}${valuedEvent.tempVar.name} = (${getVariableType((valuedEvent.tempVar as TemporaryVariable).type)} *) sigma["\${getName(node.${valuedEvent.tempVar.name})}currentValue"];`}();\``
//     }
//     return res
// }


/**
 * for now in c++ like form but should be an interface to the target language
 * @param ruleCF 
 * @param actionsString 
 * @returns 
 */
function visitStateModifications(ruleCF: RuleControlFlow, actionsString: string) {
    let res : string = ""
    let sep = ""
    for (let action of ruleCF.rule.conclusion.statemodifications) {
        /**
         * TODO: fix this and avoid memory leak by deleting, constructing appropriately...
         */
        let rhsType = inferType(action.rhs, new Map())
        let prev = ((action.rhs as MemberCall).previous as MemberCall)?.element
        let elem = (action.rhs as MemberCall).element?.ref
        if (elem == undefined) {
            return res
        }
        res = res + sep + createVariableFromMemberCall(action.lhs as MemberCall, getCPPVariableTypeName(rhsType.$type))
        sep = ","
        res = res + sep + `\`sigma[\"\${getName(node${prev != undefined ? "."+prev.$refText : ""})}${elem.name}"] = \${getName(node)}${(action.rhs as MemberCall).$cstNode?.offset};//TODO: fix this and avoid memory leak by deleting, constructing appropriately..\``;
    }
    return res;
}

function getCPPVariableTypeName(typeName: string): string {
    switch (typeName) {
        case "integer":
            return "int";
        case "string":
            return "std::string";
        case "boolean":
            return "bool";
        case "void":
            return "void";
        default:
            return "void";
    }
    return "void"
}


function getVariableType(type: TypeReference | undefined) {
    if (type?.primitive) {
        let fullName = type.primitive.name;
        switch (fullName) {
            case "integer":
                return "int";
            case "string":
                return "std::string";
            case "boolean":
                return "bool";
            case "void":
                return "void";
            default:
                return "unknown";
        }
    } else if (type?.reference) {
        return type.reference.ref?.name;
    }
    return "unknown"
}
