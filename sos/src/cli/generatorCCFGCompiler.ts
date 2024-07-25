import fs from 'fs';
import { CompositeGeneratorNode, Grammar,  NL, toString } from 'langium';
import { Assignment, BinaryExpression, CollectionRuleSync, EventCombination, EventEmission, EventExpression, MemberCall, MethodMember, NamedElement, RWRule, RuleOpening, SingleRuleSync, SoSSpec, TypeReference, ValuedEventEmission, ValuedEventRef, ValuedEventRefConstantComparison, VariableDeclaration } from '../language-server/generated/ast.js'; //VariableDeclaration
import { extractDestinationAndName, FilePathData } from './cli-util.js';
import path from 'path';
import { inferType } from '../language-server/type-system/infer.js';
import chalk from 'chalk';


const createVar = "createVar"
const createGlobalVar = "createGlobalVar"
const assignVar = "assignVar"
const setVarFromGlobal = "setVarFromGlobal"
const setGlobalVar = "setGlobalVar"
const operation = "operation"
const ret ="return"
const verifyEqual = "verifyEqual"


// this function is used to generate the code for the visitor pattern of the specified compiler

export function generateStuffFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ts`;
    const file = new CompositeGeneratorNode();

    writePreambule(file, data);

    let conceptNames: string[] = []

    for (var openedRule of model.rtdAndRules) {
        if (openedRule.onRule?.ref != undefined) {
            conceptNames.push(openedRule.onRule.ref.name)
        }
    }
    file.append(`import { ${conceptNames.join(',')} } from "../../language-server/generated/ast";`, NL)
    file.append(`
export interface SimpleLVisitor {
    visit(node: AstNode| Reference<AstNode>): [Node,Node];
    
`, NL)
    for (let name of conceptNames) {
        file.append(`     visit${name}(node: ${name}): [Node,Node];`, NL)
    }
    file.append(`}`, NL)

    file.append(`

    function getASTNodeUID(node: AstNode | AstNode[] | Reference<AstNode> | Reference<AstNode>[] | undefined ): any {
        if(node === undefined){
            throw new Error("not possible to get the UID of an undefined AstNode")
        }
        if(Array.isArray(node)){
           
            if(node.some(n => isReference(n))){
                let unrefed = node.map(r => isReference(r)?(r as Reference<AstNode>).ref:r)
                let noUndef : AstNode[]  = []
                for (let e of unrefed) {
                    if(e !== undefined){
                        noUndef.push(e)
                    }
                }
                return getASTNodeUID(noUndef)
            }
            var rs = node.map(n => (n as AstNode).$cstNode?.range)
            return "array"+rs.map(r => r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character).join("_");
        }
        
        if(isReference(node)){
            return getASTNodeUID(node.ref)
        }

        var r = node.$cstNode?.range
        return node.$type+r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character;
    }


export class CCFGVisitor implements SimpleLVisitor {
    ccfg: CCFG = new CCFG();

  
    

    visit(node: AstNode | Reference<AstNode>): [Node,Node] {
        if(isReference(node)){
            if(node.ref === undefined){
                throw new Error("not possible to visit an undefined AstNode")
            }
            node = node.ref
        }`);

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
    visit${name}(node: ${name}): [Node,Node] {`)
        visitVariableDeclaration(openedRule.runtimeState as VariableDeclaration[], file)
        file.append(`
        let starts${name}Node: Node = new Step("starts"+getASTNodeUID(node),[${getVariableDeclarationCode(openedRule.runtimeState as VariableDeclaration[])}])
        if(starts${name}Node.functionsDefs.length>0){
            starts${name}Node.returnType = "void"
        }
        starts${name}Node.functionsNames = [\`init\${starts${name}Node.uid}${name}\`]
        this.ccfg.addNode(starts${name}Node)
        let terminates${name}Node: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminates${name}Node)
        `);
        let previousNodeName = `starts${name}Node`
        let terminatesNodeName = `terminates${name}Node`

        const rulesCF = createCCFGFromRules(file, openedRule)

        const startingRules = retrieveStartingRules(rulesCF);
        let hasMultipleTerminate = checkIfMultipleTerminate(rulesCF);

        if (hasMultipleTerminate) {
            file.append(`
        let ${name}OrJoinNode: Node = new OrJoin("orJoin"+getASTNodeUID(node))
        this.ccfg.addNode(${name}OrJoinNode)
        this.ccfg.addEdge(${name}OrJoinNode,terminates${name}Node)
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
        return [starts${name}Node,terminates${name}Node]
    }`, NL);
    }


    addUtilFunctions(file);

    file.append(`
}`, NL)

    

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(file));
    return generatedFilePath;
}

/**  retrieves the starting rule of the concept
 * @param rulesCF: the rule to be analyzed
 * */
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

/**creates checks how many possible termination rules are in the concept
 * @param rulesCF: the list of rules of the concept 
 */
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
    let nodeNameFromPreviousNode = (previousNodePrefix+previousNodeParticipant+ruleCF.rule.name).replace(/\./g,"_").replaceAll("(","_").replaceAll(")","_").replaceAll(")","_").replaceAll("\"","").replaceAll("+","")
    
    file.append(`
    {
        let ${nodeNameFromPreviousNode} = this.retrieveNode("${previousNodePrefix}",${previousNodeParticipant}) //retrieve 1
        previousNode = ${nodeNameFromPreviousNode}
    }
    `)

    let actionsString = ""
    actionsString = visitStateModifications(ruleCF, actionsString);
    if(actionsString.length>0){
        file.append(`
    {let ${ruleCF.rule.name}StateModificationNode: Node = new Step("${ruleCF.rule.name}StateModificationNode")
    this.ccfg.addNode(${ruleCF.rule.name}StateModificationNode)
    let e = this.ccfg.addEdge(previousNode,${ruleCF.rule.name}StateModificationNode)
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
        let isParallel = ruleCF.rule.conclusion.eventEmissionOperator != ";";
        if (isParallel) {
            handleParallelMultipleEmissions(file, ruleCF, guardActions, terminatesNodeName);
        }else{
            handleSequentialMultipleEmissions(file, ruleCF, guardActions, terminatesNodeName);
        }
    } else { //single emission
        handleSingleEmission(ruleCF, file, guardActions, terminatesNodeName);
    }
    let eventEmissionActions = ""
    let functionType = "void"
    for(let emission of ruleCF.rule.conclusion.eventemissions){
        if(emission.$type == "ValuedEventEmission"){
            let [visitedEmission, returnType] =  visitValuedEventEmission(emission as ValuedEventEmission,file)
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
 * handles the conclusion of a rule with a single emission. It generates the code for the state modifications and the event emissions
 * @param ruleCF: the current rule
 * @param file: the file containing the generated compiler
 * @param guardActions: the guards of the rule
 * @param terminatesNodeName: the name of the node being terminated
 */
function handleSingleEmission(ruleCF: RuleControlFlow, file: CompositeGeneratorNode, guardActions: string, terminatesNodeName: string) {
    let isEventEmissionACollection: boolean = checkIfEventEmissionIsCollectionBased(ruleCF);
    if (isEventEmissionACollection) {
        let isConcurrent = (ruleCF.rule.conclusion.eventemissions[0] as CollectionRuleSync).order == "concurrent";
        if (isConcurrent) {
            file.append(`
        let ${ruleCF.rule.name}ForkNode: Node = new Fork("${ruleCF.rule.name}ForkNode")
        this.ccfg.addNode(${ruleCF.rule.name}ForkNode)
        {let e = this.ccfg.addEdge(previousNode,${ruleCF.rule.name}ForkNode)
        e.guards = [...e.guards, ...[${guardActions}]] //CC
        }

        let ${ruleCF.rule.name}FakeNode: Node = new AndJoin("${ruleCF.rule.name}FakeNode")    
        this.ccfg.addNode(${ruleCF.rule.name}FakeNode)    
        for (var child of node.${ruleCF.conclusionParticipants[0].name}) {
            let [childStartsNode,childTerminatesNode] = this.getOrVisitNode(child)
            this.ccfg.addEdge(${ruleCF.rule.name}ForkNode,childStartsNode)
            this.ccfg.addEdge(childTerminatesNode,${ruleCF.rule.name}FakeNode)
        }

        `);
        } else { //sequential collection emission
            file.append(`
        let ${ruleCF.rule.name}StepNode = new Step("starts"+getASTNodeUID(node.${ruleCF.conclusionParticipants[0].name}))
        this.ccfg.addNode(${ruleCF.rule.name}StepNode)
        let e = this.ccfg.addEdge(previousNode,${ruleCF.rule.name}StepNode)
        e.guards = [...e.guards, ...[${guardActions}]] //DD

        previousNode = ${ruleCF.rule.name}StepNode
        for (var child of node.${ruleCF.conclusionParticipants[0].name}) {
            let [childStartsNode,childTerminatesNode] = this.getOrVisitNode(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let ${ruleCF.conclusionParticipants[0].name}TerminatesNode = new Step("terminates"+getASTNodeUID(node.${ruleCF.conclusionParticipants[0].name}))
        this.ccfg.addNode(${ruleCF.conclusionParticipants[0].name}TerminatesNode)
        this.ccfg.addEdge(previousNode,${ruleCF.conclusionParticipants[0].name}TerminatesNode)
        `);

        }
    } else { //single emission, single event
        if (ruleCF.conclusionParticipants.length == 0) {
            file.append(`
        // conclusion with no event emission
                `);
        }

        else if (ruleCF.conclusionParticipants[ruleCF.conclusionParticipants.length - 1].name != undefined && ruleCF.conclusionParticipants[ruleCF.conclusionParticipants.length - 1].name == "terminates") {
            file.append(`
        {let e = this.ccfg.addEdge(previousNode,${terminatesNodeName})
        e.guards = [...e.guards, ...[${guardActions}]] //EE
        }
        `);
        } else {
            let toVisitName = ruleCF.conclusionParticipants[0].name;
            let [extraPrefix, participant] = getExtraPrefix(ruleCF, toVisitName);
            file.append(`
        let ${toVisitName}StartsNode${ruleCF.rule.name} = this.retrieveNode("starts",${participant})
        `);
            if (extraPrefix.length != 0) {
                if (ruleCF.conclusionParticipants[0].type != "Timer") {
                    throw new Error("in " + ruleCF.rule.name + ", only timer (and event but not yet supported) can be started/stopped from a rule, was " + ruleCF.conclusionParticipants[0].type + "(" + toVisitName + ")\n\t extraPrefix is " + extraPrefix);
                }
                let duration = ((ruleCF.rule.$container as RuleOpening).runtimeState.filter(rs => rs.name == toVisitName)[0] as VariableDeclaration).value?.$cstNode?.text;
                file.append(`
            let ${toVisitName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates",${participant})
            ${toVisitName}StartsNode${ruleCF.rule.name} = new Step("starts${toVisitName}"+getASTNodeUID(node))
            this.ccfg.addNode( ${toVisitName}StartsNode${ruleCF.rule.name})
            ${toVisitName}StartsNode${ruleCF.rule.name}.functionsNames = [\`starts\${${toVisitName}StartsNode${ruleCF.rule.name}.uid}${toVisitName}\`]
            ${toVisitName}StartsNode${ruleCF.rule.name}.returnType = "void"
            ${toVisitName}StartsNode${ruleCF.rule.name}.functionsDefs = [...${toVisitName}StartsNode${ruleCF.rule.name}.functionsDefs, ...[\`std::this_thread::sleep_for(\${node.${duration}}ms);\`]] //GGG
            ${toVisitName}TerminatesNode${ruleCF.rule.name} = new Step("terminates${toVisitName}"+getASTNodeUID(node))
            this.ccfg.addNode(${toVisitName}TerminatesNode${ruleCF.rule.name})
    
            {
            let e1 = this.ccfg.addEdge(previousNode, ${toVisitName}StartsNode${ruleCF.rule.name})
            e1.guards = [...e1.guards, ...[]] //FFF
            let e2 = this.ccfg.addEdge( ${toVisitName}StartsNode${ruleCF.rule.name},${toVisitName}TerminatesNode${ruleCF.rule.name})
            e2.guards = [...e2.guards, ...[]] //FFF
            }

            `);
            } else {
                file.append(`
            {
            let e = this.ccfg.addEdge(previousNode,${toVisitName}StartsNode${ruleCF.rule.name})
            e.guards = [...e.guards, ...[${guardActions}]] //FF
            }
            `);
            }
        }
    }
}

/**
 * handles the conclusion of a rule with multiple emission that occur concurently. It generates the code for the state modifications and the event emissions
 * @param ruleCF: the current rule
 * @param file: the file containing the generated compiler
 * @param guardActions: the guards of the rule
 * @param terminatesNodeName: the name of the node being terminated
 */

function handleParallelMultipleEmissions(file: CompositeGeneratorNode, ruleCF: RuleControlFlow, guardActions: string, terminatesNodeName: string) {
    file.append(`
        let ${ruleCF.rule.name}ForkNode: Node = new Fork("${ruleCF.rule.name}ForkNode")
        this.ccfg.addNode(${ruleCF.rule.name}ForkNode)
        {let e = this.ccfg.addEdge(previousNode,${ruleCF.rule.name}ForkNode)
        e.guards = [...e.guards, ...[${guardActions}]] //BB
        }
        `);
    let splittedConclusionParticipants = splitArrayByParticipants(ruleCF.conclusionParticipants);
    for (let emissionParticipant of splittedConclusionParticipants) {
        const participantName = emissionParticipant[0].name;
        let [extraPrefix, participant] = getExtraPrefix(ruleCF, participantName);
        if (extraPrefix.length != 0) {
            if (emissionParticipant[0].type != "Timer") {
                throw new Error("only timer (and event but not yet supported) can be started/stopped from a rule, was " + emissionParticipant[0].type);
            }
            file.append(`
    let ${participantName}StartsNode${ruleCF.rule.name} = this.retrieveNode("starts"+${extraPrefix},${participant})
    let ${participantName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates"+${extraPrefix},${participant})
    {
    //let e1 = this.ccfg.addEdge(previousNode, ${participantName}StartsNode${ruleCF.rule.name})
    //e1.guards = [...e1.guards, ...[]] //FF22
    let e2 = this.ccfg.addEdge( ${participantName}StartsNode${ruleCF.rule.name},${participantName}TerminatesNode${ruleCF.rule.name})
    e2.guards = [...e2.guards, ...[]] //FF22
    this.ccfg.addEdge(${ruleCF.rule.name}ForkNode,${participantName}StartsNode${ruleCF.rule.name})
    }
   `);

        } else {
            if(participantName == "this" && emissionParticipant[1].name == "terminates") {
                file.append(`
        this.ccfg.addEdge(previousNode,${terminatesNodeName})
        previousNode = ${terminatesNodeName}
        `);
            }else{

            file.append(`
        let [${participantName}StartNode/*,${participantName}TerminatesNode*/] = this.getOrVisitNode(node.${participantName})
        this.ccfg.addEdge(${ruleCF.rule.name}ForkNode,${participantName}StartNode)
        `);
            }
        }
    }
}


/**
 * handles the conclusion of a rule with multiple emission that occur sequentially. It generates the code for the state modifications and the event emissions
 * @param ruleCF: the current rule
 * @param file: the file containing the generated compiler
 * @param guardActions: the guards of the rule
 * @param terminatesNodeName: the name of the node being terminated
 */
function handleSequentialMultipleEmissions(file: CompositeGeneratorNode, ruleCF: RuleControlFlow, guardActions: string, terminatesNodeName: string) {
    let splittedConclusionParticipants = splitArrayByParticipants(ruleCF.conclusionParticipants);
    //console.log(chalk.bgGreenBright("ruleCF.conclusionParticipants", ruleCF.conclusionParticipants.map(p => p.name)))
    for (let emissionParticipant of splittedConclusionParticipants) {
        //console.log(chalk.bgGreenBright("emissionParticipant", emissionParticipant.map(p => p.name)))
        const participantName = emissionParticipant[0].name;
        let [extraPrefix, participant] = getExtraPrefix(ruleCF, participantName);
        if (extraPrefix.length != 0) {
            if (emissionParticipant[0].type != "Timer") {
                throw new Error("only timer (and event but not yet supported) can be started/stopped from a rule, was " + emissionParticipant[0].type);
            }
            file.append(`
    let ${participantName}StartsNode${ruleCF.rule.name} = this.retrieveNode("starts"+${extraPrefix},${participant})
    let ${participantName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates"+${extraPrefix},${participant})
    {
    let e1 = this.ccfg.addEdge(previousNode, ${participantName}StartsNode${ruleCF.rule.name})
    e1.guards = [...e1.guards, ...[]] //FF3
    let e2 = this.ccfg.addEdge( ${participantName}StartsNode${ruleCF.rule.name},${participantName}TerminatesNode${ruleCF.rule.name})
    e2.guards = [...e2.guards, ...[]] //FF3
    }
   `);

        } else {
            //console.log(chalk.bgGreenBright("participantName", participantName))
            if(participantName == "this" && emissionParticipant[1].name == "terminates") {
                file.append(`
        this.ccfg.addEdge(previousNode,${terminatesNodeName})
        previousNode = ${terminatesNodeName}
        `);
            }else{
                file.append(`
        let [${participantName}StartNode,${participantName}TerminatesNode] = this.getOrVisitNode(node.${participantName})
        this.ccfg.addEdge(previousNode,${participantName}StartNode)
        previousNode = ${participantName}TerminatesNode
        `);
            }
        }

    }
}

/**
 * 
 * @param ruleCF 
 * @param participantName 
 * @returns the extra prefix to be applied in case of a runtime state participant & the actual participant
 * note the participant is a runtime state if the prefix is not empty
 */
function getExtraPrefix(ruleCF: RuleControlFlow, participantName: string|undefined) : [string, string] {
    let elemToVisitIsARuntimeState = (ruleCF.rule.$container as RuleOpening).runtimeState.some(rs => (rs as NamedElement).name == participantName)
    if (elemToVisitIsARuntimeState) {
        return[`"${participantName}"`,"node"];
    } else {
        return["", `node.${participantName}`];
    }
}

/**
 * returns the previous node name. May imply the creation of new nodes in case of multiple synchronizations that may require a decision or join node
 * @param ruleCF 
 * @param allRulesCF
 * @param previousNodeName 
 * @param file
 * 
 * @returns [the previous node prefix, the guards, the parameter typed element in json format]
 */
function handlePreviousPremise(ruleCF: RuleControlFlow, allRulesCF:RuleControlFlow[], previousNodeName: string, file: CompositeGeneratorNode): [string,string,string, TypedElement|undefined] { 
    let isStartingRule = ruleCF.premiseParticipants[0].name == "starts";
    if (isStartingRule) {
        return ["starts","node", "", undefined]
    }

    let isSimpleComparison = ruleCF.rule.premise.eventExpression.$type == "ExplicitValuedEventRefConstantComparison"
                             || ruleCF.rule.premise.eventExpression.$type == "ImplicitValuedEventRefConstantComparison";
    if (isSimpleComparison) {
        return handlePremiseSimpleComparison(file, ruleCF);
    }

    let isMultipleSynchronization = ruleCF.rule.premise.eventExpression.$type == "EventConjunction"
                                    || ruleCF.rule.premise.eventExpression.$type == "EventDisjunction"
                                    || ruleCF.rule.premise.eventExpression.$type == "NaryEventExpression";
    if (isMultipleSynchronization) {
        return handlePremiseMultipleSynchronization(file, ruleCF, allRulesCF);
    } 

    //simple event synchro 
    let [varActions,param] = visitValuedEventRef(ruleCF.rule.premise.eventExpression as ValuedEventRef)
    if(varActions.length>0){
        console.warn(chalk.gray(`in the context of ${ruleCF.rule.name}, these varActions have been disregarded: ${varActions}`))
    }
    let[extraPrefix, participant] = getExtraPrefix(ruleCF, ruleCF.premiseParticipants[0].name);
    if(param.name != "NULL"){
        return [`terminates${extraPrefix.replaceAll(`"`,``)}`, `${participant}`, "", param]
    }
    return [`terminates${extraPrefix.replaceAll(`"`,``)}`, `${participant}`, "", undefined]
    
}

/**
 * returns the previous node name in case of multiple synchronizations that may require a join node. It generates the code for the state modifications and the event emissions
 * @param file 
 * @param ruleCF 
 * @param allRulesCF 
 * @returns [the previous node prefix, the guards, the parameter typed element in json format]
 */

function handlePremiseMultipleSynchronization(file: CompositeGeneratorNode, ruleCF: RuleControlFlow, allRulesCF: RuleControlFlow[]) : [string,string,string, TypedElement|undefined]{
    const indexRight = ruleCF.premiseParticipants.findIndex(p => p.type == "event") + 1
    let multipleSynchroPrefix: string = ""
    let multipleSynchroParticipant: string = ""
    let premiseActions: string = ""
    let premiseGuards: string = ""
    let params: TypedElement[] = []
    let leftParticipantName = ruleCF.premiseParticipants[0].name
    let rightParticipantName = undefined
    switch (ruleCF.rule.premise.eventExpression.$type) {
        case "EventConjunction":
            rightParticipantName = ruleCF.premiseParticipants[indexRight].name
            file.append(`
    let ${ruleCF.rule.name}AndJoinNode: Node = new AndJoin("andJoinNode"+getASTNodeUID(node.${leftParticipantName}))
    this.ccfg.addNode(${ruleCF.rule.name}AndJoinNode)
    let ${leftParticipantName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates", node.${leftParticipantName})
    let ${rightParticipantName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates", node.${rightParticipantName})
    this.ccfg.addEdge(${leftParticipantName}TerminatesNode${ruleCF.rule.name},${ruleCF.rule.name}AndJoinNode)
    this.ccfg.addEdge(${rightParticipantName}TerminatesNode${ruleCF.rule.name},${ruleCF.rule.name}AndJoinNode)
            `)
            multipleSynchroPrefix=  "andJoinNode"
            multipleSynchroParticipant = `node.${leftParticipantName}`
            let [a, g, p] = visitMultipleSynchroEventRef(ruleCF.rule.premise.eventExpression.lhs, ruleCF.rule.premise.eventExpression.rhs);
            premiseActions = a
            premiseGuards = g
            params = p
            break
        case "EventDisjunction":
            rightParticipantName = ruleCF.premiseParticipants[indexRight].name
            file.append(`
    let ${ruleCF.rule.name}OrJoinNode: Node = new OrJoin("orJoinNode"+getASTNodeUID(node.${leftParticipantName}))
    this.ccfg.addNode(${ruleCF.rule.name}OrJoinNode)
    let ${leftParticipantName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates", node.${leftParticipantName})
    let ${rightParticipantName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates", node.${rightParticipantName})
    this.ccfg.addEdge(${leftParticipantName}TerminatesNode${ruleCF.rule.name},${ruleCF.rule.name}OrJoinNode)
    this.ccfg.addEdge(${rightParticipantName}TerminatesNode${ruleCF.rule.name},${ruleCF.rule.name}OrJoinNode)
            `)
            multipleSynchroPrefix= "orJoinNode"
            multipleSynchroParticipant = `node.${leftParticipantName}`
            let [a2, g2,p2] = visitMultipleSynchroEventRef(ruleCF.rule.premise.eventExpression.lhs, ruleCF.rule.premise.eventExpression.rhs);
            premiseActions = a2
            premiseGuards = g2
            params = p2
            break
        case "NaryEventExpression":
            if (ruleCF.rule.premise.eventExpression.policy.operator == "lastOf") {
                file.append(`
    let ${ruleCF.rule.name}LastOfNode: Node = new AndJoin("lastOfNode"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
    this.ccfg.replaceNode(${getEmittingRuleName(ruleCF,allRulesCF)}FakeNode,${ruleCF.rule.name}LastOfNode)                    
                `)
                multipleSynchroPrefix= "lastOfNode"
                multipleSynchroParticipant = `node.${ruleCF.premiseParticipants[0].name}`
            } else {
                file.append(`
    let ${ruleCF.rule.name}FirstOfNode: Node = new OrJoin("firstOfNode"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
    this.ccfg.replaceNode(${getEmittingRuleName(ruleCF,allRulesCF)}FakeNode,${ruleCF.rule.name}FirstOfNode)
                `)
                multipleSynchroPrefix= "firstOfNode"
                multipleSynchroParticipant = `node.${ruleCF.premiseParticipants[0].name}`
                break
            }
    }


    if (ruleCF.rule.premise.eventExpression.$type === "NaryEventExpression") {
        //no premise actions ?
        return [multipleSynchroPrefix,`${multipleSynchroParticipant}`,premiseGuards, undefined]
    }
    let ownsACondition = chekIfOwnsACondition(ruleCF.rule.premise.eventExpression as EventCombination)
    if(ownsACondition){
        file.append(`
    let ${ruleCF.rule.name}ConditionNode: Node = new Choice("conditionNode"+getASTNodeUID(node.${ruleCF.premiseParticipants[0].name}))
    this.ccfg.addNode(${ruleCF.rule.name}ConditionNode)
    let tmpMultipleSynchroNode = this.ccfg.getNodeFromName("${multipleSynchroPrefix}"+getASTNodeUID(${multipleSynchroParticipant}))
    if(tmpMultipleSynchroNode == undefined){
        throw new Error("impossible to be there ${multipleSynchroPrefix}"+getASTNodeUID(${multipleSynchroParticipant}))
    }
    this.ccfg.addEdge(tmpMultipleSynchroNode,${ruleCF.rule.name}ConditionNode)
        `)
        multipleSynchroPrefix= "conditionNode"
        multipleSynchroParticipant = `node.${ruleCF.premiseParticipants[0].name}`
    }

    file.append(`
    {
        let multipleSynchroNode = this.ccfg.getNodeFromName("${multipleSynchroPrefix}"+getASTNodeUID(${multipleSynchroParticipant}))
        if(multipleSynchroNode == undefined){
            throw new Error("impossible to be there ${multipleSynchroPrefix}"+getASTNodeUID(${multipleSynchroParticipant}))
        }
        multipleSynchroNode.params = [...multipleSynchroNode.params, ...[${params.map(p => "Object.assign( new TypedElement(), JSON.parse(`"+p.toJSON()+"`))").join(",")}]]
        multipleSynchroNode.functionsDefs = [...multipleSynchroNode.functionsDefs, ...[${premiseActions}]] //HH
    }
    `)
    
    return [multipleSynchroPrefix,`${multipleSynchroParticipant}`,premiseGuards, undefined]
}


/**
 * returns the previous node name in case of a comparison premise. It generates the code for the state modifications and the event emissions
 * @param file 
 * @param ruleCF 
 * @returns [the previous node prefix, the guards, the parameter typed element in json format]
 */
function handlePremiseSimpleComparison(file: CompositeGeneratorNode, ruleCF: RuleControlFlow) : [string,string,string, TypedElement|undefined]{
    let [extraPrefix, participant] = getExtraPrefix(ruleCF, ruleCF.premiseParticipants[0].name);
    let participantName = ruleCF.premiseParticipants[0].name

    file.append(`
        let ${participantName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates",${participant})
        let ${participantName}ChoiceNode${ruleCF.rule.name} = this.ccfg.getNodeFromName("choiceNode"+getASTNodeUID(${participant}))
        if (${participantName}ChoiceNode${ruleCF.rule.name} == undefined) {
            let ${participantName}ChoiceNode = new Choice("choiceNode"+getASTNodeUID(${participant}))
            this.ccfg.addNode(${participantName}ChoiceNode)
            this.ccfg.addEdge(${participantName}TerminatesNode${ruleCF.rule.name},${participantName}ChoiceNode)
            ${participantName}ChoiceNode${ruleCF.rule.name} = ${participantName}ChoiceNode
        }else{
            this.ccfg.addEdge(${participantName}TerminatesNode${ruleCF.rule.name},${participantName}ChoiceNode${ruleCF.rule.name})
        }
        `);
    let guards: string = visitValuedEventRefComparison(ruleCF.rule.premise.eventExpression as ValuedEventRefConstantComparison);
    return [`choiceNode`+extraPrefix, `${participant}`, guards, undefined];
}


/**
 * puts all the actions and the guards of the rule in strings 
 * @param lhs left hand side of the multiple synchronization
 * @param rhs right hand side of the multiple synchronization
 * @returns [the actions, the guards, the parameters]
 */
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


/**
 * checks if the event expression has a comparison on either side
 * @param comb the event expression
 * @returns true if the event expression has a comparison on either side
 */
function chekIfOwnsACondition(comb: EventCombination): boolean {
    return comb.lhs.$type == "ExplicitValuedEventRefConstantComparison" || comb.lhs.$type == "ImplicitValuedEventRefConstantComparison"
            ||
           comb.rhs.$type == "ExplicitValuedEventRefConstantComparison" || comb.rhs.$type == "ImplicitValuedEventRefConstantComparison"
}


/**
 * returns the name of the rule emitting the event that starts this rule
 * @param ruleCF the current rule
 * @param allRulesCF all the rules of the opened concept
 * @returns the name of the rule emitting the event
 */
function getEmittingRuleName(ruleCF: RuleControlFlow, allRulesCF: RuleControlFlow[]): string {
    let premiseFirstParticipant = ruleCF.premiseParticipants[0]
    for(let rule of allRulesCF){
        if (rule.conclusionParticipants[0].name === premiseFirstParticipant.name){
            return rule.rule.name
        }
    }
    return "NotFound"+premiseFirstParticipant.name
}


/**
 * returns the participants of the event expression
 * @param ruleCF  the current rule
 * @returns a boolean indicating if the event emission is collection based
 */
function checkIfEventEmissionIsCollectionBased(ruleCF: RuleControlFlow) {
    let isEventEmissionACollection: boolean = false;
    for (let p of ruleCF.conclusionParticipants) {
        if (p.isCollection) {
            isEventEmissionACollection = true;
        }
    }
    return isEventEmissionACollection;
}

/**
 * writes the preambule for the visitor file of the compiler 
 * @param fileNode the file 
 * @param data the file path data
 */
function writePreambule(fileNode: CompositeGeneratorNode, data: FilePathData) {
    fileNode.append(`
import { AstNode, Reference, isReference } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, TypedElement } from "../../ccfg/ccfglib";`, NL)
}


/**
 * writes the basic functions of the visitor file of the compiler
 * @param fileNode the file
 */
function addUtilFunctions(fileNode: CompositeGeneratorNode) {
    fileNode.append(`
    getOrVisitNode(node:AstNode | Reference<AstNode> |undefined): [Node,Node]{
        if(node === undefined){
            throw new Error("not possible to get or visit an undefined AstNode")
        }     
        if(isReference(node)){
            if(node.ref === undefined){
                throw new Error("not possible to visit an undefined AstNode")
            }
            node = node.ref
        }

        let startsNode = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsNode !== undefined){
            let terminatesNode = this.ccfg.getNodeFromName("terminates"+getASTNodeUID(node))
            if(terminatesNode === undefined){
                throw new Error("impossible to be there")
            }
            return [startsNode,terminatesNode]
        }
        let [starts,terminates] = this.visit(node)
        return [starts,terminates]
    }

    retrieveNode(prefix: string, node: AstNode | AstNode[] | Reference<AstNode> | Reference<AstNode>[] | undefined): Node {
        if(node === undefined){
            throw new Error("not possible to retrieve a node from an undefined AstNode")
        }
        if(Array.isArray(node) || (prefix != "starts" && prefix != "terminates")){
            let n = this.ccfg.getNodeFromName(prefix+getASTNodeUID(node))
            if(n === undefined){
                throw new Error("impossible to retrieve "+prefix+getASTNodeUID(node)+ "from the ccfg")
            }
            return n
        }
        if(prefix == "starts"){
            return this.getOrVisitNode(node)[0]
        }
        if(prefix == "terminates"){
            return this.getOrVisitNode(node)[1]
        }       
        throw new Error("not possible to retrieve the node given as parameter: "+prefix+getASTNodeUID(node))
    }
    `)
}

/**
 * retrieves a litst of the rule control flows from the openedRule and adds an explanation of the premisses and conclusions of the rules in the file 
 * @param fileNode the file
 * @param openedRule the rule
 * @returns a list of rule control flows
 */
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

/**
 * a class representing a rule control flow
 * @param rule the rule AST node
 * @param premiseParticipants the potentially multiple premises of the rule
 * @param conclusionParticipants the potentially multiple conclusions of the rule
 */
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

/**
 * a class representing a typed element
 * @param name the name of the element
 * @param type the type of the element
 * @param isCollection a boolean indicating if the element is a collection
 * @function toJSON returns the element in json format
 * @function equals returns true if the element is equal to another element
 */

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


/**
 * 
 * @param eventEmission  the event emission
 * @returns a typed element list of the event emission participants
 */
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

/**
 * 
 * @param eventExpression the event expression
 * @returns a typed element list of the event synchronisation participants
 */

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
function getCollectionRuleSyncEventExpressionParticipants(rule: CollectionRuleSync): TypedElement[] {
    let res: TypedElement[] = []
    if ((rule.collection as MemberCall)?.element?.ref != undefined) {
        res = getExplicitEventExpressionParticipants(rule.collection as MemberCall)
        res.forEach((p) => p.isCollection = true)
        res = [...res, ...getEventEmissionParticipants(rule.singleRule)]
    }
    return res
}

/**
 * gets the event emission participants of a member call and its anteriors, if any. 
 * @param membercall a member call
 * @returns a typed element list of the event expression participants
 */
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
 *  splits a list of typed elements by participants
 * @param elements a list of typed elements
 * @returns a 2d list of typed element separated by participants
 */

function splitArrayByParticipants(elements: TypedElement[]): TypedElement[][] {
    const result: TypedElement[][] = [];
    let currentArray: TypedElement[] = [];
    
    for (const element of elements) {
        // console.log(chalk.bgGreenBright("element", element.name, "type", element.type))
        if (element.type === 'event') {
            if (currentArray.length > 0) {
                result.push(currentArray);
                currentArray = [];
            }
            if(element.name == "terminates"){
                currentArray.push(new TypedElement("this", undefined));
                currentArray.push(element);
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
 * 
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

        //guardactionsactions
        if(valuedEventRefComparison.$type == "ImplicitValuedEventRefConstantComparison"){
            //res = res + `\`(bool)\${getASTNodeUID(node.${(valuedEventRefComparison.membercall as MemberCall).element?.$refText})}${"terminates"} == ${(typeof(v) == "string")?v:v.$cstNode?.text}\``
            res = res + `\`${verifyEqual},\${getASTNodeUID(node.${(valuedEventRefComparison.membercall as MemberCall).element?.$refText})}${"terminate"},${(typeof(v) == "string")?v:v.$cstNode?.text}\``
        }
        if(valuedEventRefComparison.$type == "ExplicitValuedEventRefConstantComparison"){
            let prev = (valuedEventRefComparison.membercall as MemberCall)?.previous
            //res = res + `\`(bool)\${getASTNodeUID(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRefComparison.membercall as MemberCall).element?.$refText} == ${(typeof(v) == "string")?v:v.$cstNode?.text}\``
            res = res + `\`${verifyEqual},\${getASTNodeUID(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRefComparison.membercall as MemberCall).element?.$refText},${(typeof(v) == "string")?v:v.$cstNode?.text}\``
        }
        
    }
    return res
}


/**
 * writes out the code for 
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
            res = res + `\`${typeName} \${getASTNodeUID(node)}${v.$cstNode?.offset} = ${v.name};\``//valuedEventRef  \${getName(node.${(valuedEventRef.membercall as MemberCall).element?.$refText})}${"terminates"}\``
            let param:TypedElement = new TypedElement(v.name, typeName)
            return [res, param]
        }
        if(v != undefined && valuedEventRef.$type == "ExplicitValuedEventRef"){
            // let prev = (valuedEventRef.membercall as MemberCall)?.previous
            res = res + `\`${typeName} \${getASTNodeUID(node)}${v.$cstNode?.offset} = ${v.name};\`` //valuedEventRef \${getName(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRef.membercall as MemberCall).element?.$refText};\``
            let param:TypedElement = new TypedElement(v.name, typeName)
            return [res, param]
        }
    
    }
    return ["", new TypedElement("NULL", undefined)]
}


/**
 * creates the visitor code for a new variable declarations
 * @param  runtimeState the variable declarations
 * @param file the file to be written into 
 * @returns 
 */
function visitVariableDeclaration(runtimeState: VariableDeclaration[] | undefined, file : CompositeGeneratorNode): void {
    if (runtimeState != undefined) {
       // res = res + `\`const std::lock_guard<std::mutex> lock(sigma_mutex);\`,`
        for(let vardDecl of runtimeState){
            if(vardDecl.type != undefined && vardDecl.type.$cstNode?.text == "Event"){
                file.append(`
                let starts${vardDecl.name}Node: Node = new Step("starts${vardDecl.name}"+getASTNodeUID(node))\n
                this.ccfg.addNode(starts${vardDecl.name}Node)
                let terminates${vardDecl.name}Node: Node = new Step("terminates${vardDecl.name}"+getASTNodeUID(node))\n
                this.ccfg.addNode(terminates${vardDecl.name}Node)
                this.ccfg.addEdge(starts${vardDecl.name}Node,terminates${vardDecl.name}Node)
                `)
            }
        }
    }
    return
}


/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState 
 * @returns 
 */
function getVariableDeclarationCode(runtimeState: VariableDeclaration[] | undefined): string {
    var res : string = ""
    if (runtimeState != undefined) {
       // res = res + `\`const std::lock_guard<std::mutex> lock(sigma_mutex);\`,`
        let sep = ""
        for(let vardDecl of runtimeState){
            if(vardDecl.type != undefined && vardDecl.type.$cstNode?.text == "Event"){
                continue
            }else{
                 if(vardDecl.value != undefined && vardDecl.value.$type == "MemberCall"){
                   //res = res + sep + `\`sigma["\${getASTNodeUID(node)}${vardDecl.name}"] = new ${getVariableType(vardDecl.type)}(${(vardDecl.value != undefined)?`\${node.${(vardDecl.value as MemberCall).element?.$refText}}`:""});\``
                   res = res + sep + `\`${createGlobalVar},${getVariableType(vardDecl.type)}${(vardDecl.value != undefined)?`\${node.${(vardDecl.value as MemberCall).element?.$refText}}`:""},\${getASTNodeUID(node)}${vardDecl.name}\``
                }else{
                    //res = res + sep + `\`sigma["\${getASTNodeUID(node)}${vardDecl.name}"] = new ${getVariableType(vardDecl.type)}(${(vardDecl.value != undefined)?vardDecl.value.$cstNode?.text:""});\``
                    res = res + sep + `\`${createGlobalVar},${getVariableType(vardDecl.type)}${(vardDecl.value != undefined)?vardDecl.value.$cstNode?.text:""},\${getASTNodeUID(node)}${vardDecl.name}\``
                }
                sep= ","
            }
        }
    }
    return res
}

/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState 
 * @returns 
 */
function visitValuedEventEmission(valuedEmission: ValuedEventEmission | undefined,file:CompositeGeneratorNode): [string, string] {
    var res : string = ""
    if (valuedEmission != undefined) {
        let varType = inferType(valuedEmission.data, new Map())
        let typeName = getCPPVariableTypeName(varType.$type)

        if(valuedEmission.data != undefined && valuedEmission.data.$type == "MemberCall"){
            
            //todo write a node that saves the variable
            res = createVariableFromMemberCall(valuedEmission.data as MemberCall, typeName)
            console.log(res)
        }
        if(valuedEmission.data != undefined && valuedEmission.data.$type == "BinaryExpression"){
            //todo write a node that joins the two variable nodes and saves the result
            let lhs = (valuedEmission.data as BinaryExpression).left
            let lhsType = inferType(lhs, new Map())
            let lhsTypeName = getCPPVariableTypeName(lhsType.$type)
            let leftRes: string = ""; // Declare the variable rightRes
            leftRes = createVariableFromMemberCall(lhs as MemberCall, lhsTypeName);
            res = res + leftRes+","
            let rhs = (valuedEmission.data as BinaryExpression).right
            let rhsType = inferType(rhs, new Map())
            let rhsTypeName = getCPPVariableTypeName(rhsType.$type)
            let rightRes: string = ""; // Declare the variable rightRes
            rightRes  = createVariableFromMemberCall(rhs as MemberCall, rhsTypeName);
            res = res + rightRes+","
            let applyOp = (valuedEmission.data as BinaryExpression).operator
            //res = res + `\`${typeName} \${getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset} = \${getASTNodeUID(node)}${lhs.$cstNode?.offset} ${applyOp} \${getASTNodeUID(node)}${rhs.$cstNode?.offset};\``
            res = res + `\`${createVar},\${getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset}\`,`
            res = res + `\`${operation},\${getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset},\${getASTNodeUID(node)}${lhs.$cstNode?.offset},${applyOp},\${getASTNodeUID(node)}${rhs.$cstNode?.offset}\``
        }
        if(valuedEmission.data != undefined && valuedEmission.data.$type == "BooleanExpression" || valuedEmission.data.$type == "NumberExpression" || valuedEmission.data.$type == "StringExpression"){
            // write a node that sends the value specified 
            //res = `\`${typeName} \${getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name} =  ${valuedEmission.data.$cstNode?.text};\``
            //res = res + "," +`\`return \${getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name};\``
            res = res  +`\`${createVar},${typeName},\${getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\``+ ","
            res = res  +`\`${assignVar},\${getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name},${valuedEmission.data.$cstNode?.text}\``+ ","
            res = res  +`\`${ret},\${getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\``+ ","
            return [res, typeName]
        }
        if(res.length > 0){
            res = res + ","
        }
        console.log(res)
        //res = res + `\`${typeName} \${getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name} =  \${getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset};\``
        //res = res + "," +`\`return \${getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name};\``
        res = res+ `\`${createVar},${typeName},\${getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`,`
        res = res+ `\`${assignVar},\${getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name},\${getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset}\`,`
        res = res+ `\`${ret},\${getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\``
        
        return [res, typeName]
    }
    return [res , "void"]
}

function createVariableFromMemberCall(data: MemberCall, typeName: string): string {
    let res: string = ""
    let prev = (data.previous as MemberCall)?.element
    let elem = data.element?.ref
    if (elem == undefined) {
        return res
    }



    if (elem?.$type == "VariableDeclaration") {
        //res = res +`\`const std::lock_guard<std::mutex> lock(sigma_mutex); \`,`
        //res = res + `\`${typeName} \${getASTNodeUID(node)}${data.$cstNode?.offset} = *(${typeName} *) sigma["\${getASTNodeUID(node${prev != undefined ? "."+prev.$refText : ""})}${elem.name}"];//${elem.name}}\``
        res = res+ `\`${createVar},${typeName},\${getASTNodeUID(node)}${data.$cstNode?.offset}\`,`
        res = res+ `\`${setVarFromGlobal},${typeName},\${getASTNodeUID(node)}${data.$cstNode?.offset},\${getASTNodeUID(node${prev != undefined ? "."+prev.$refText : ""})}${elem.name}\``
    } 
    else if (elem?.$type == "TemporaryVariable") {
        //res = res + `\`${typeName} \${getASTNodeUID(node)}${data.$cstNode?.offset} = ${elem.name}; // was \${getASTNodeUID(node)}${prev != undefined ? prev?.ref?.$cstNode?.offset : elem.$cstNode?.offset}; but using the parameter name now\``
        res = res+ `\`${createVar},${typeName},\${getASTNodeUID(node)}${data.$cstNode?.offset}\`,`
        res = res+ `\`${assignVar},\${getASTNodeUID(node)}${data.$cstNode?.offset},${elem.name}\`` 
    }
    else /*if (elem?.$type == "Assignment")*/ {
        
        //res = res + `\`${typeName} \${getASTNodeUID(node)}${data.$cstNode?.offset} = \${node.${data.$cstNode?.text}};\ //${elem.name}\``
        res = res+ `\`${createVar},${typeName},\${getASTNodeUID(node)}${data.$cstNode?.offset}\`,`
        res = res+ `\`${assignVar},\${getASTNodeUID(node)}${data.$cstNode?.offset},\${node.${data.$cstNode?.text}}\``
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
            //actionsString = actionsString + sep + `\`//TODO: fix this and avoid memory leak by deleting, constructing appropriately
            //    const std::lock_guard<std::mutex> lock(sigma_mutex);\``;                              
            //actionsString = actionsString + sep + `(*((${typeName}*)sigma[\"\${getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}"])) = \${getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset};\``;
            actionsString = actionsString + sep + `\`${setGlobalVar},${typeName},\${getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name},\${getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset}\``
        }else{
            /*actionsString = actionsString + sep + `\`//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((${typeName}*)sigma[\"\${getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}"])) = \${getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset};\``;
            */
           actionsString = actionsString + sep + `\`${setGlobalVar},${typeName},\${getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name},\${getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset}\``
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
        case "Timer": //TO BE FIXED
            return "int";    
        default:
            return "unknown";
    }
    return "void"
}


function getVariableType(type: TypeReference | undefined) {
    if (type?.primitive) {
        return getCPPVariableTypeName(type.primitive.name);
    } else if (type?.reference && type.reference.ref?.name != undefined) {
        return getCPPVariableTypeName(type.reference.ref?.name);
    }
    return "unknown"
}
