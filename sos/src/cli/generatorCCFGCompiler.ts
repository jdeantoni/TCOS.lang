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
    visit(node: AstNode): [Node,Node,Node];
    
`, NL)
    for (let name of conceptNames) {
        file.append(`     visit${name}(node: ${name}): [Node, Node,Node];`, NL)
    }
    file.append(`}`, NL)

    file.append(`

function getASTNodeUID(node: AstNode | AstNode[]): any {
    if(Array.isArray(node)){
        var rs = node.map(n => n.$cstNode?.range)
        return "array"+rs.map(r => r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character).join("_");
    }
    var r = node.$cstNode?.range
    return node.$type+r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character;
}

export class CCFGVisitor implements SimpleLVisitor {
    ccfg: CCFG = new CCFG();

  
    

    visit(node: AstNode): [Node,Node,Node] {`);

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
    visit${name}(node: ${name}): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let starts${name}Node: Node = new Step("starts"+getASTNodeUID(node),[${visitVariableDeclaration(openedRule.runtimeState as VariableDeclaration[])}])
        if(starts${name}Node.functionsDefs.length>0){
            starts${name}Node.returnType = "void"
        }
        starts${name}Node.functionsNames = [\`init\${starts${name}Node.uid}${name}\`]
        ccfg.addNode(starts${name}Node)
        let terminates${name}Node: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminates${name}Node)
        `);
        let previousNodeName = `starts${name}Node`
        let terminatesNodeName = `terminates${name}Node`

        const rulesCF = createCCFGFromRules(file, openedRule)

        const startingRules = retrieveStartingRules(rulesCF);
        let hasMultipleTerminate = checkIfMultipleTerminate(rulesCF);

        if (hasMultipleTerminate) {
            file.append(`
        let ${name}OrJoinNode: Node = new OrJoin("orJoin"+getASTNodeUID(node))
        ccfg.addNode(${name}OrJoinNode)
        ccfg.addEdge(${name}OrJoinNode,terminates${name}Node)
        `)
            terminatesNodeName = `${name}OrJoinNode`
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
        return [ccfg,starts${name}Node,terminates${name}Node]
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

    
    let [previousNodePrefix, previousNodeParticipant, guardActions, param] = handlePreviousPremise(ruleCF, rulesCF, previousNodeName, file)
    let nodeNameFromPreviousNode = (previousNodePrefix+previousNodeParticipant+ruleCF.rule.name).replace(/\./g,"_")
    file.append(`
    {

        let ${nodeNameFromPreviousNode} = ccfg.getNodeFromName("${previousNodePrefix}"+getASTNodeUID(${previousNodeParticipant}))
        if(${nodeNameFromPreviousNode} == undefined){
            throw new Error("impossible to be there ${nodeNameFromPreviousNode}")
        }
        previousNode = ${nodeNameFromPreviousNode}
    }
    `)


    let actionsString = ""
    actionsString = visitStateModifications(ruleCF, actionsString);
    if(actionsString.length>0){
        file.append(`
    {let ${ruleCF.rule.name}StateModificationNode: Node = new Step("${ruleCF.rule.name}StateModificationNode")
    ccfg.addNode(${ruleCF.rule.name}StateModificationNode)
    let e = ccfg.addEdge(previousNode,${ruleCF.rule.name}StateModificationNode)
    e.guards = [...e.guards, ...[${guardActions}]]`)
    
    if(param != undefined){
        file.append(`
    ${ruleCF.rule.name}StateModificationNode.params = [...${ruleCF.rule.name}StateModificationNode.params, ...[Object.assign( new TypedElement(), JSON.parse(\`${param.toJSON()}\`))]]
    `)
    }

    file.append(`
    previousNode = ${ruleCF.rule.name}StateModificationNode
    }`)
    guardActions = ""
    
        file.append(`
    previousNode.functionsNames = [...previousNode.functionsNames, ...[\`\${previousNode.uid}${ruleCF.rule.name}\`]] 
    previousNode.functionsDefs =[...previousNode.functionsDefs, ...[${actionsString}]] //AA
    `);
    }
    
    let isMultipleEmission = ruleCF.rule.conclusion.eventemissions.length > 1;
    if (isMultipleEmission) {
        file.append(`
        let ${ruleCF.rule.name}ForkNode: Node = new Fork("${ruleCF.rule.name}ForkNode")
        ccfg.addNode(${ruleCF.rule.name}ForkNode)
        {let e = ccfg.addEdge(previousNode,${ruleCF.rule.name}ForkNode)
        e.guards = [...e.guards, ...[${guardActions}]] //BB
        }
        `);
        let splittedConclusionParticipants = splitArrayByParticipants(ruleCF.conclusionParticipants);
        for (let emissionParticipant of splittedConclusionParticipants) {
            const participantName = emissionParticipant[0].name;
            file.append(`
        let [${participantName}CCFG, ${participantName}StartNode/*,${participantName}TerminatesNode*/] = this.visit(node.${participantName})
        ccfg.addNode(${participantName}CCFG)
        ccfg.addEdge(${ruleCF.rule.name}ForkNode,${participantName}StartNode)
        `)
        }
    } else { //single emission
        let isEventEmissionACollection: boolean = checkIfEventEmissionIsCollectionBased(ruleCF);
        if (isEventEmissionACollection) {
            let isConcurrent = (ruleCF.rule.conclusion.eventemissions[0] as CollectionRuleSync).order == "concurrent";
            if (isConcurrent) {
                file.append(`
        let ${ruleCF.rule.name}ForkNode: Node = new Fork("${ruleCF.rule.name}ForkNode")
        ccfg.addNode(${ruleCF.rule.name}ForkNode)
        {let e = ccfg.addEdge(previousNode,${ruleCF.rule.name}ForkNode)
        e.guards = [...e.guards, ...[${guardActions}]] //CC
        }

        let ${ruleCF.rule.name}FakeNode: Node = new AndJoin("${ruleCF.rule.name}FakeNode")    
        ccfg.addNode(${ruleCF.rule.name}FakeNode)    
        for (var child of node.${ruleCF.conclusionParticipants[0].name}) {
            let [childCCFG,childStartsNode,childTerminatesNode] = this.visit(child)
            ccfg.addNode(childCCFG)
            ccfg.addEdge(${ruleCF.rule.name}ForkNode,childStartsNode)
            ccfg.addEdge(childTerminatesNode,${ruleCF.rule.name}FakeNode)
        }

        `);
            } else {
                file.append(`
        let ${ruleCF.rule.name}StepNode = new Step("starts"+getASTNodeUID(node.${ruleCF.conclusionParticipants[0].name}))
        ccfg.addNode(${ruleCF.rule.name}StepNode)
        let e = ccfg.addEdge(previousNode,${ruleCF.rule.name}StepNode)
        e.guards = [...e.guards, ...[${guardActions}]] //DD

        previousNode = ${ruleCF.rule.name}StepNode
        for (var child of node.${ruleCF.conclusionParticipants[0].name}) {
            let [childCCFG,childStartsNode,childTerminatesNode] = this.visit(child)
            ccfg.addNode(childCCFG)
            ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let ${ruleCF.conclusionParticipants[0].name}TerminatesNode = new Step("terminates"+getASTNodeUID(node.${ruleCF.conclusionParticipants[0].name}))
        ccfg.addNode(${ruleCF.conclusionParticipants[0].name}TerminatesNode)
        ccfg.addEdge(previousNode,${ruleCF.conclusionParticipants[0].name}TerminatesNode)
        `);

            }
        } else { //single emission, single event
            if (ruleCF.conclusionParticipants[ruleCF.conclusionParticipants.length - 1].name != undefined && ruleCF.conclusionParticipants[ruleCF.conclusionParticipants.length - 1].name == "terminates") {
                file.append(`
        {let e = ccfg.addEdge(previousNode,${terminatesNodeName})
        e.guards = [...e.guards, ...[${guardActions}]] //EE
        }
        `);
            } else {
                let toVisitName = ruleCF.conclusionParticipants[0].name;
                file.append(`
        let ${toVisitName}CCFG${ruleCF.rule.name} = ccfg.getNodeFromName(getASTNodeUID(node.${toVisitName})+"ContainerNode")
        let ${toVisitName}StartsNode${ruleCF.rule.name} = ccfg.getNodeFromName("starts"+getASTNodeUID(node.${toVisitName}))
        let ${toVisitName}TerminatesNode${ruleCF.rule.name} = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.${toVisitName}))
        if (${toVisitName}CCFG${ruleCF.rule.name} == undefined) {
            let [${toVisitName}CCFG, ${toVisitName}StartsNode,${toVisitName}TerminatesNode] = this.visit(node.${toVisitName})
            ccfg.addNode(${toVisitName}CCFG)
            ${toVisitName}CCFG${ruleCF.rule.name} = ${toVisitName}CCFG
            ${toVisitName}StartsNode${ruleCF.rule.name} = ${toVisitName}StartsNode
            ${toVisitName}TerminatesNode${ruleCF.rule.name} = ${toVisitName}TerminatesNode
        }else{
            let ${toVisitName}OrJoinNode = new OrJoin("orJoinNode"+getASTNodeUID(node.${toVisitName}))
            ccfg.addNode(${toVisitName}OrJoinNode)
            let ${nodeNameFromPreviousNode} = ccfg.getNodeFromName("${previousNodePrefix}"+getASTNodeUID(${previousNodeParticipant}))
            if(${nodeNameFromPreviousNode} == undefined){
                throw new Error("impossible to be there ${nodeNameFromPreviousNode}")
            }
            ccfg.addEdge(${nodeNameFromPreviousNode},${toVisitName}OrJoinNode)
            let ${toVisitName}StartsNode = ccfg.getNodeFromName("starts"+getASTNodeUID(node.${toVisitName}))
            if(${toVisitName}StartsNode != undefined){
                for(let e of ${toVisitName}StartsNode.inputEdges){
                    e.to = ${toVisitName}OrJoinNode
                }
                ccfg.addEdge(${toVisitName}OrJoinNode,${toVisitName}StartsNode)
            }
        }
    
        if(${toVisitName}TerminatesNode${ruleCF.rule.name} == undefined || ${toVisitName}StartsNode${ruleCF.rule.name} == undefined || ${toVisitName}CCFG${ruleCF.rule.name} == undefined){
            throw new Error("impossible to be there ${toVisitName}TerminatesNode${ruleCF.rule.name} ${toVisitName}StartsNode${ruleCF.rule.name} ${toVisitName}CCFG${ruleCF.rule.name}")
        }
        {
        let e = ccfg.addEdge(previousNode,${toVisitName}StartsNode${ruleCF.rule.name})
        e.guards = [...e.guards, ...[${guardActions}]] //FF
        }
        `);

            }
        }
    }
    let eventEmissionActions = ""
    let functionType = "void"
    for(let emission of ruleCF.rule.conclusion.eventemissions){
        if(emission.$type == "ValuedEventEmission"){
            let [visitedEmission, returnType] =  visitValuedEventEmission(emission as ValuedEventEmission)
            functionType = returnType
            eventEmissionActions = eventEmissionActions + visitedEmission
        }
    }
    file.append(`
        previousNode.returnType = "${functionType}"
        previousNode.functionsNames = [\`\${previousNode.uid}${ruleCF.rule.name}\`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[${eventEmissionActions}]] //GG
    `);

}


/**
 * returns the previous node name. May imply the creation of new nodes in case of multiple synchronizations that may require a decision or join node
 * @param ruleCF 
 * @param previousNodeName 
 * @returns [the previous node name, the guards, the parameter typed element in json format]
 */
function handlePreviousPremise(ruleCF: RuleControlFlow, allRulesCF:RuleControlFlow[], previousNodeName: string, file: CompositeGeneratorNode): [string,string,string, TypedElement|undefined] { 
    let isStartingRule = ruleCF.premiseParticipants[0].name == "starts";
    if (isStartingRule) {
        return ["starts","node", "", undefined]
    }

    let isSimpleComparison = ruleCF.rule.premise.eventExpression.$type == "ExplicitValuedEventRefConstantComparison"
                            || ruleCF.rule.premise.eventExpression.$type == "ImplicitValuedEventRefConstantComparison";

    if (isSimpleComparison) {
        file.append(`
        let ${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name} = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
            if(${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name} == undefined){
                throw new Error("impossible to be there ${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name}")
            }
        let ${ruleCF.premiseParticipants[0].name}ChoiceNode${ruleCF.rule.name} = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
        if (${ruleCF.premiseParticipants[0].name}ChoiceNode${ruleCF.rule.name} == undefined) {
            let ${ruleCF.premiseParticipants[0].name}ChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
            ccfg.addNode(${ruleCF.premiseParticipants[0].name}ChoiceNode)
            ccfg.addEdge(${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name},${ruleCF.premiseParticipants[0].name}ChoiceNode)
            ${ruleCF.premiseParticipants[0].name}ChoiceNode${ruleCF.rule.name} = ${ruleCF.premiseParticipants[0].name}ChoiceNode
        }else{
            ccfg.addEdge(${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name},${ruleCF.premiseParticipants[0].name}ChoiceNode${ruleCF.rule.name})
        }
        `)
        let guards: string = visitValuedEventRefComparison(ruleCF.rule.premise.eventExpression as ValuedEventRefConstantComparison);
        return [`choiceNode`,`node.${ruleCF.premiseParticipants[0].name}`, guards, undefined]
    }

    let isMultipleSynchronization = ruleCF.rule.premise.eventExpression.$type == "EventConjunction"
        || ruleCF.rule.premise.eventExpression.$type == "EventDisjunction"
        || ruleCF.rule.premise.eventExpression.$type == "NaryEventExpression";

    if (isMultipleSynchronization) {
        const indexRight = ruleCF.premiseParticipants.findIndex(p => p.type == "event") + 1
        let multipleSynchroPrefix: string = ""
        let multipleSynchroParticipant: string = ""
        let premiseActions: string = ""
        let premiseGuards: string = ""
        let params: TypedElement[] = []
        switch (ruleCF.rule.premise.eventExpression.$type) {
            case "EventConjunction":
                file.append(`
        let ${ruleCF.rule.name}AndJoinNode: Node = new AndJoin("andJoinNode"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
        ccfg.addNode(${ruleCF.rule.name}AndJoinNode)
        let ${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name} = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
        let ${ruleCF.premiseParticipants[indexRight].name}TerminatesNode${ruleCF.rule.name} = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.${ruleCF.premiseParticipants[indexRight].name}))
        if(${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name} == undefined || ${ruleCF.premiseParticipants[indexRight].name}TerminatesNode${ruleCF.rule.name} == undefined){
            throw new Error("impossible to be there ${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name} ${ruleCF.premiseParticipants[indexRight].name}TerminatesNode${ruleCF.rule.name}")
        }
        ccfg.addEdge(${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name},${ruleCF.rule.name}AndJoinNode)
        ccfg.addEdge(${ruleCF.premiseParticipants[indexRight].name}TerminatesNode${ruleCF.rule.name},${ruleCF.rule.name}AndJoinNode)
                `)
                multipleSynchroPrefix=  "andJoinNode"
                multipleSynchroParticipant = `node.${ruleCF.premiseParticipants[0].name}`
                let [a, g, p] = visitMultipleSynchroEventRef(ruleCF.rule.premise.eventExpression.lhs, ruleCF.rule.premise.eventExpression.rhs);
                premiseActions = a
                premiseGuards = g
                params = p
                break
            case "EventDisjunction":
                file.append(`
        let ${ruleCF.rule.name}OrJoinNode: Node = new OrJoin("orJoinNode"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
        ccfg.addNode(${ruleCF.rule.name}OrJoinNode)
        let ${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name} = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
        let ${ruleCF.premiseParticipants[indexRight].name}TerminatesNode${ruleCF.rule.name} = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.${ruleCF.premiseParticipants[indexRight].name}))
        if(${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name} == undefined || ${ruleCF.premiseParticipants[indexRight].name}TerminatesNode${ruleCF.rule.name} == undefined){
            throw new Error("impossible to be there ${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name} ${ruleCF.premiseParticipants[indexRight].name}TerminatesNode${ruleCF.rule.name}")
        }
        ccfg.addEdge(${ruleCF.premiseParticipants[0].name}TerminatesNode${ruleCF.rule.name},${ruleCF.rule.name}OrJoinNode)
        ccfg.addEdge(${ruleCF.premiseParticipants[indexRight].name}TerminatesNode${ruleCF.rule.name},${ruleCF.rule.name}OrJoinNode)
                `)
                multipleSynchroPrefix= "orJoinNode"
                multipleSynchroParticipant = `node.${ruleCF.premiseParticipants[0].name}`
                let [a2, g2,p2] = visitMultipleSynchroEventRef(ruleCF.rule.premise.eventExpression.lhs, ruleCF.rule.premise.eventExpression.rhs);
                premiseActions = a2
                premiseGuards = g2
                params = p2
                break
            case "NaryEventExpression":
                if (ruleCF.rule.premise.eventExpression.policy.operator == "lastOf") {
                    file.append(`
        let ${ruleCF.rule.name}LastOfNode: Node = new AndJoin("lastOfNode"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
        ccfg.replaceNode(${getEmittingRuleName(ruleCF,allRulesCF)}FakeNode,${ruleCF.rule.name}LastOfNode)                    
                    `)
                    multipleSynchroPrefix= "lastOfNode"
                    multipleSynchroParticipant = `node.${ruleCF.premiseParticipants[0].name}`
                } else {
                    file.append(`
        let ${ruleCF.rule.name}FirstOfNode: Node = new OrJoin("firstOfNode"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
        ccfg.replaceNode(${getEmittingRuleName(ruleCF,allRulesCF)}FakeNode,${ruleCF.rule.name}FirstOfNode)
                    `)
                    multipleSynchroPrefix= "lastOfNode"
                    multipleSynchroParticipant = `node.${ruleCF.premiseParticipants[0].name}`
                    break
                }
        }


        if (ruleCF.rule.premise.eventExpression.$type === "NaryEventExpression") {
            //no premise actions ?
            return [multipleSynchroPrefix,multipleSynchroParticipant,premiseGuards, undefined]
        }
        let ownsACondition = chekIfOwnsACondition(ruleCF.rule.premise.eventExpression as EventCombination)
        if(ownsACondition){
            file.append(`
        let ${ruleCF.rule.name}ConditionNode: Node = new Choice("conditionNode"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
        ccfg.addNode(${ruleCF.rule.name}ConditionNode)
        let tmpMultipleSynchroNode = ccfg.getNodeFromName("${multipleSynchroPrefix}"+getASTNodeUID(${multipleSynchroParticipant}))
        if(tmpMultipleSynchroNode == undefined){
            throw new Error("impossible to be there ${multipleSynchroPrefix}"+getASTNodeUID(${multipleSynchroParticipant}))
        }
        ccfg.addEdge(tmpMultipleSynchroNode,${ruleCF.rule.name}ConditionNode)
            `)
            multipleSynchroPrefix= "conditionNode"
            multipleSynchroParticipant = `node.${ruleCF.premiseParticipants[0].name}`
        }

        file.append(`
        {
            let multipleSynchroNode = ccfg.getNodeFromName("${multipleSynchroPrefix}"+getASTNodeUID(${multipleSynchroParticipant}))
            if(multipleSynchroNode == undefined){
                throw new Error("impossible to be there ${multipleSynchroPrefix}"+getASTNodeUID(${multipleSynchroParticipant}))
            }
            multipleSynchroNode.params = [...multipleSynchroNode.params, ...[${params.map(p => "Object.assign( new TypedElement(), JSON.parse(`"+p.toJSON()+"`))").join(",")}]]
            multipleSynchroNode.functionsDefs = [...multipleSynchroNode.functionsDefs, ...[${premiseActions}]] //HH
        }
        `)
        
        return [multipleSynchroPrefix,multipleSynchroParticipant,premiseGuards, undefined]
        
    } else {
        let [varActions,param] = visitValuedEventRef(ruleCF.rule.premise.eventExpression as ValuedEventRef)
        if(varActions.length>0){
            console.log("varActions removed: ",varActions)
        }
        if(param.name != "NULL"){
            return [`terminates`, `node.${ruleCF.premiseParticipants[0].name}`, "", param]
        }
        return [`terminates`, `node.${ruleCF.premiseParticipants[0].name}`, "", undefined]
    }
}

function visitMultipleSynchroEventRef(lhs: EventExpression, rhs: EventExpression) :[string, string, TypedElement[]]{
    let actions : string = ""
    let guards : string = ""
    let params : TypedElement[] = []
    if (lhs.$type == "ExplicitValuedEventRef" || lhs.$type == "ImplicitValuedEventRef") {
        let [leftActions, p] = visitValuedEventRef(lhs as ValuedEventRef);
        params.push(p)
        if(actions.length>0){
            actions+=","      
        }
        actions+=leftActions 
    }
    if (rhs.$type == "ExplicitValuedEventRef" || rhs.$type == "ImplicitValuedEventRef") {
        let [rightActions, p] = visitValuedEventRef(rhs as ValuedEventRef);
        params.push(p)
        if(actions.length>0){
            actions+=","       
        }
        actions+=rightActions
    }
    if (lhs.$type == "ExplicitValuedEventRefConstantComparison" || lhs.$type == "ImplicitValuedEventRefConstantComparison") {
        let leftGuards: string = visitValuedEventRefComparison(lhs as ValuedEventRefConstantComparison);
        if(guards.length>0){
            guards+="," 
        }
        guards+=leftGuards      
    }
    if (rhs.$type == "ExplicitValuedEventRefConstantComparison" || rhs.$type == "ImplicitValuedEventRefConstantComparison") {
        let rightGuards: string = visitValuedEventRefComparison(rhs as ValuedEventRefConstantComparison);
        if(guards.length>0){
            guards+="," 
        }
        guards+=rightGuards
    }
    return [actions,guards,params]
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
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, ContainerNode, TypedElement } from "../../ccfg/ccfglib";`, NL)
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
    toJSON() {
        return `{ "name": "${this.name}", "type": "${this.type}"}`
    }
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
function visitValuedEventRefComparison(valuedEventRefComparison: ValuedEventRefConstantComparison | undefined): string {
    var res : string = ""
    
    if (valuedEventRefComparison != undefined) {
        let v = valuedEventRefComparison.literal
        // let varType: TypeDescription

        // if(typeof(valuedEventRefComparison.literal) == "string"){
        //     varType = createStringType(undefined)
        // }else{
        //     varType = inferType(valuedEventRefComparison.literal, new Map())
        // }
        if(valuedEventRefComparison.$type == "ImplicitValuedEventRefConstantComparison"){
            res = res + `\`(bool)\${getName(node.${(valuedEventRefComparison.membercall as MemberCall).element?.$refText})}${"terminates"} == ${(typeof(v) == "string")?v:v.$cstNode?.text}\``
        }
        if(valuedEventRefComparison.$type == "ExplicitValuedEventRefConstantComparison"){
            let prev = (valuedEventRefComparison.membercall as MemberCall)?.previous
            res = res + `\`(bool)\${getName(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRefComparison.membercall as MemberCall).element?.$refText} == ${(typeof(v) == "string")?v:v.$cstNode?.text}\``
        }
    }
    return res
}


/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState
 * @returns
 */
function visitValuedEventRef(valuedEventRef: ValuedEventRef | undefined): [string, TypedElement] {
    var res : string = ""
    if (valuedEventRef != undefined) {
        let v = valuedEventRef.tempVar
        let varType = inferType(v, new Map())
        let typeName = getCPPVariableTypeName(varType.$type)
        if(v != undefined && valuedEventRef.$type == "ImplicitValuedEventRef"){
            res = res + `\`${typeName} \${getName(node)}${v.$cstNode?.offset} = ${v.name};\``//valuedEventRef  \${getName(node.${(valuedEventRef.membercall as MemberCall).element?.$refText})}${"terminates"}\``
            let param:TypedElement = new TypedElement(v.name, typeName)
            return [res, param]
        }
        if(v != undefined && valuedEventRef.$type == "ExplicitValuedEventRef"){
            // let prev = (valuedEventRef.membercall as MemberCall)?.previous
            res = res + `\`${typeName} \${getName(node)}${v.$cstNode?.offset} = ${v.name};\`` //valuedEventRef \${getName(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRef.membercall as MemberCall).element?.$refText};\``
            let param:TypedElement = new TypedElement(v.name, typeName)
            return [res, param]
        }
    
    }
    return ["", new TypedElement("NULL", undefined)]
}




/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState 
 * @returns 
 */
function visitVariableDeclaration(runtimeState: VariableDeclaration[] | undefined): string {
    var res : string = ""
    if (runtimeState != undefined) {
       // res = res + `\`const std::lock_guard<std::mutex> lock(sigma_mutex);\`,`
        for(let vardDecl of runtimeState){
            res = res + `\`sigma["\${getName(node)}${vardDecl.name}"] = new ${getVariableType(vardDecl.type)}(${(vardDecl.value != undefined)?`\${node.${(vardDecl.value as MemberCall).element?.$refText}}`:""});\``
        }
    }
    return res
}

/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState 
 * @returns 
 */
function visitValuedEventEmission(valuedEmission: ValuedEventEmission | undefined): [string, string] {
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
            res = res + `\`${typeName} \${getName(node)}${valuedEmission.data.$cstNode?.offset} = \${getName(node)}${lhs.$cstNode?.offset} ${applyOp} \${getName(node)}${rhs.$cstNode?.offset};\``
        }
        if(valuedEmission.data != undefined && valuedEmission.data.$type == "BooleanExpression" || valuedEmission.data.$type == "NumberExpression" || valuedEmission.data.$type == "StringExpression"){
            res = `\`${typeName} \${getName(node)}${(valuedEmission.event as MemberCall).element?.ref?.name} =  ${valuedEmission.data.$cstNode?.text};\``
            res = res + "," +`\`return \${getName(node)}${(valuedEmission.event as MemberCall).element?.ref?.name};\``
            return [res, typeName]
        }
        if(res.length > 0){
            res = res + ","
        }
        res = res + `\`${typeName} \${getName(node)}${(valuedEmission.event as MemberCall).element?.ref?.name} =  \${getName(node)}${valuedEmission.data.$cstNode?.offset};\``
        res = res + "," +`\`return \${getName(node)}${(valuedEmission.event as MemberCall).element?.ref?.name};\``
        return [res, typeName]
    }
    return [res, "void"]
}

function createVariableFromMemberCall(data: MemberCall, typeName: string): string {
    let res: string = ""
    let prev = (data.previous as MemberCall)?.element
    let elem = data.element?.ref
    if (elem == undefined) {
        return res
    }
    if (elem?.$type == "VariableDeclaration") {
        res = res +`\`const std::lock_guard<std::mutex> lock(sigma_mutex);\`,`
        res = res + `\`${typeName} \${getName(node)}${data.$cstNode?.offset} = *(${typeName} *) sigma["\${getName(node${prev != undefined ? "."+prev.$refText : ""})}${elem.name}"];//${elem.name}}\``
    } 
    else if (elem?.$type == "TemporaryVariable") {
        res = res + `\`${typeName} \${getName(node)}${data.$cstNode?.offset} = ${elem.name}; // was \${getName(node)}${prev != undefined ? prev?.ref?.$cstNode?.offset : elem.$cstNode?.offset}; but using the parameter name now\``
    }
    else /*if (elem?.$type == "Assignment")*/ {
        res = res + `\`${typeName} \${getName(node)}${data.$cstNode?.offset} = \${node.${data.$cstNode?.text}};\ //${elem.name}\``
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
    let sep = ""
    if(actionsString.length > 0){
        sep = ","
    }
    for (let action of ruleCF.rule.conclusion.statemodifications) {
        /**
         * TODO: fix this and avoid memory leak by deleting, constructing appropriately...
         */
        let typeName = ""; 
        let rhsType = inferType(action.rhs, new Map());
        typeName = getCPPVariableTypeName(rhsType.$type);
        if (typeName == "unknown") {
            let lhsType = inferType(action.lhs, new Map())
            typeName = getCPPVariableTypeName(lhsType.$type);
        }
        // let rhsPrev = ((action.rhs as MemberCall).previous as MemberCall)?.element
        let rhsElem = (action.rhs as MemberCall).element?.ref
        if (rhsElem == undefined) {
            return actionsString
        }
        let lhsPrev = ((action.lhs as MemberCall).previous as MemberCall)?.element
        let lhsElem = (action.lhs as MemberCall).element?.ref
        if (lhsElem == undefined) {
            return actionsString
        }

        actionsString = actionsString + sep + createVariableFromMemberCall(action.rhs as MemberCall, typeName)
        sep = ","
        
        if(rhsElem.$type == "TemporaryVariable"){
            actionsString = actionsString + sep + `\`//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((${typeName}*)sigma[\"\${getName(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}"])) = \${getName(node)}${(action.rhs as MemberCall).$cstNode?.offset};\``;
        }else{
            actionsString = actionsString + sep + `\`//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((${typeName}*)sigma[\"\${getName(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}"])) = \${getName(node)}${(action.rhs as MemberCall).$cstNode?.offset};\``;
            
        }
    }
    return actionsString;
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
            return "unknown";
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
