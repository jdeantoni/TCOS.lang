import fs from 'fs';
import { AstNode, CompositeGeneratorNode, Grammar,  NL, toString } from 'langium';
import { Assignment, BinaryExpression, CollectionRuleSync, EventEmission, EventExpression, MemberCall, MethodMember, NamedElement, NaryEventExpression, RWRule, RuleOpening, SingleRuleSync, SoSSpec, TypeReference, ValuedEventEmission, ValuedEventRef, ValuedEventRefConstantComparison, VariableDeclaration } from '../language-server/generated/ast.js'; //VariableDeclaration
import { extractDestinationAndName, FilePathData } from './cli-util.js';
import path from 'path';
import { inferType } from '../language-server/type-system/infer.js';
import chalk from 'chalk';


const lock= "lock"
const createVar = "createVar"
const createGlobalVar = "createGlobalVar"
const assignVar = "assignVar"
const setVarFromGlobal = "setVarFromGlobal"
const setGlobalVar = "setGlobalVar"
const operation = "operation"
const ret ="return"
// const verifyEqual = "verifyEqual"

const DEBUG = true

var conceptNameToHoles: Map<string, HoleSpecifier[]> = new Map()
var conceptNameToRulesCF: Map<string, RuleControlFlow[]> = new Map()

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
    file.append(`import { ${conceptNames.join(',')} } from "../../language/generated/ast.js";`, NL)
    file.append(`
var debug = false

export interface CompilerFrontEnd {

    createLocalCCFG(node: AstNode| Reference<AstNode>): CCFG;
    `, NL)
    for (let name of conceptNames) {
        file.append(`     create${name}LocalCCFG(node: ${name}): CCFG;`, NL)
    }

    file.append(`
    generateCCFG(node: AstNode): CCFG;
    `,NL)

    file.append(`}`, NL)

    let langName = model.name
    langName = langName.charAt(0).toUpperCase() + langName.slice(1)
    file.append(`
export class ${langName}CompilerFrontEnd implements CompilerFrontEnd {
    constructor(debugMode: boolean = false){ 
        debug = debugMode
    }

    globalCCFG: CCFG = new CCFG();

  
    createLocalCCFG(node: AstNode | Reference<AstNode>): CCFG {
        if(isReference(node)){
            if(node.ref === undefined){
                throw new Error("not possible to visit an undefined AstNode")
            }
            node = node.ref
        }`);

    for (let name of conceptNames) {
        file.append(`
        if(node.$type == "${name}"){
            return this.create${name}LocalCCFG(node as ${name});
        }`)
    }
    
    file.append(`  
        throw new Error("Not implemented: " + node.$type);
    }
    `,NL);

    for (var openedRule of model.rtdAndRules) {
        let name: string = ""
        if (openedRule.onRule?.ref != undefined) {
            name = openedRule.onRule.ref.name
        }

        const rulesCF: RuleControlFlow[] = extractRuleControlFlowsFromRules(file, openedRule);
        conceptNameToRulesCF.set(name, rulesCF)
        const holes: HoleSpecifier[] = identifiesHolesAndSemiHoles(rulesCF);
        conceptNameToHoles.set(name, holes)

        generateCreateLocalCCFGFunctions(file, name, openedRule);
    }


    addUtilFunctions(file,model.rtdAndRules[0].onRule?.ref?.$container.rules[0]?.name as string);

    file.append(`
}`, NL)


    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(file));
    return generatedFilePath;
}

function generateCreateLocalCCFGFunctions(file: CompositeGeneratorNode, conceptName: string, openedRule: RuleOpening) {
    file.append(`
    /**
     * returns the local CCFG of the ${conceptName} node
     * @param a ${conceptName} node 
     * @returns the local CCFG (with holes)
     */
    create${conceptName}LocalCCFG(node: ${conceptName}): CCFG {`);

    visitVariableDeclaration(openedRule.runtimeState as VariableDeclaration[], file);
    file.append(`
        let localCCFG = new CCFG()
        let starts${conceptName}Node: Node = new Step(node,NodeType.starts,[${getVariableDeclarationCode(openedRule.runtimeState as VariableDeclaration[])}])
        if(starts${conceptName}Node.functionsDefs.length>0){
            starts${conceptName}Node.returnType = "void"
        }
        starts${conceptName}Node.functionsNames = [\`init\${starts${conceptName}Node.uid}${conceptName}\`]
        localCCFG.addNode(starts${conceptName}Node)
        localCCFG.initialState = starts${conceptName}Node
        let terminates${conceptName}Node: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminates${conceptName}Node)
        `);

    let tempHole = conceptNameToHoles.get(conceptName)
    if (tempHole == undefined) {
        throw new Error("holes not found: "+conceptName)
    }
    const holes : HoleSpecifier[] = tempHole;
    let tempRulesCF = conceptNameToRulesCF.get(conceptName)
    if (tempRulesCF == undefined) {
        throw new Error("rulesCF not found: "+conceptName)
    }
    const rulesCF: RuleControlFlow[] = tempRulesCF

    //creates hole nodes
    for (let h of holes) {
        
        if (isATimerHole(h.startingParticipants)){
            let refNode = `node`
            let duration = ((openedRule.runtimeState as VariableDeclaration[]).filter(rs => rs.name == h.startingParticipants[h.startingParticipants.length-2 >= 0 ? h.startingParticipants.length-2:0].name)[0] as VariableDeclaration).value?.$cstNode?.text;
            file.append(`
        let ${h.startingParticipants.filter(p => p.type != "event").map(p => p.name).join('_')}Hole: Hole = new TimerHole(${refNode},node.${duration}) //timer hole to ease specific filling
        localCCFG.addNode(${h.startingParticipants.filter(p => p.type != "event").map(p => p.name).join('_')}Hole)
        `)
        }else
        if (isACollectionHole(h)){
            let refNode : string = `node.${h.startingParticipants.slice(0,h.startingParticipants.length-2).filter(p => p.type != "event").map(p => p.name).join('.')}`
            file.append(`
        let ${h.startingParticipants.slice(0,h.startingParticipants.length-2).filter(p => p.type != "event").map(p => p.name).join('_')}Hole: CollectionHole = new CollectionHole(${refNode})
        ${h.startingParticipants.slice(0,h.startingParticipants.length-2).filter(p => p.type != "event").map(p => p.name).join('_')}Hole.isSequential = ${(h as CollectionHoleSpecifier).isSequential}
        ${h.startingParticipants.slice(0,h.startingParticipants.length-2).filter(p => p.type != "event").map(p => p.name).join('_')}Hole.parallelSyncPolicy = "${(h as CollectionHoleSpecifier).parallelSyncPolicy}"
        localCCFG.addNode(${h.startingParticipants.slice(0,h.startingParticipants.length-2).filter(p => p.type != "event").map(p => p.name).join('_')}Hole)
        `)

        }else{
            let refNode : string = `node.${h.startingParticipants.filter(p => p.type != "event").map(p => p.name).join('.')}`
            if (isReferenceBased(h.startingParticipants)){
                refNode = refNode + ".ref"
            }
            file.append(`
        let ${h.startingParticipants.filter(p => p.type != "event").map(p => p.name).join('_')}Hole: Hole = new Hole(${refNode})
        localCCFG.addNode(${h.startingParticipants.filter(p => p.type != "event").map(p => p.name).join('_')}Hole)
        `)

        }
    }

    const startingRules = retrieveStartingRules(rulesCF);
    if (startingRules.length > 1) {
        throw new Error("multiple starting rules are not supported");
    }

    let startRule: RuleControlFlow = startingRules[0];
    handleRuleConclusion(startRule, holes, file, `starts${conceptName}Node`);


    for (let ruleCF of rulesCF) {
        if (ruleCF != startingRules[0]) {
            //manage premise (most of the time the premise's node is already existing since a hole.)
            if (ruleCF.premiseParticipants.length == 1) {
                let previousNodeName : string= getPreviousNodeNameFromPremiseParticipants(ruleCF, conceptName)                   
                handleRuleConclusion(ruleCF, holes, file, previousNodeName);
            }
            if (ruleCF.premiseParticipants.length > 1) {
                file.append(`
        let ${ruleCF.rule.name}OrJoinNode: Node = new OrJoin(node)
        localCCFG.addNode(${ruleCF.rule.name}OrJoinNode)
                `);
                for (let participants of ruleCF.premiseParticipants) {
                    if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p, participants))) {
                        if (DEBUG) file.append(`             //mark a`);
                        file.append(`
        localCCFG.addEdge(${participants.filter(p => p.type != "event").map(p => p.name).join('_')}Hole,${ruleCF.rule.name}OrJoinNode)
                            `);
                    } else {
                        file.append(`
                //premise participants in parallel collection but not a hole: ${participants.map(p => p.toJSON())}
                        `);
                    }
                }

                handleRuleConclusion(ruleCF, holes, file, `${ruleCF.rule.name}OrJoinNode`);
            }
        }
    }


    file.append(`
        return localCCFG;
    }`, NL);
}

function isReferenceBased(participants: TypedElement[]): boolean {
    return participants.some(p => p.type != undefined && p.type[0] == "[")
}

function getPreviousNodeNameFromPremiseParticipants(ruleCF: RuleControlFlow, conceptName: string) : string{
    if (ruleCF.premiseParticipants.length == 1) {
        let participants = ruleCF.premiseParticipants[0];
        if (participants.length == 1) { //simple event
            return participants[0].name+conceptName+"Hole"
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

function handleRuleConclusion(ruleCF: RuleControlFlow, holes: HoleSpecifier[], file: CompositeGeneratorNode, previousNodeName: string) {
    let actionsstring = ""
    actionsstring = visitStateModifications(ruleCF, actionsstring);
    if(actionsstring.length>0){
        file.append(`
        {
        let ${ruleCF.rule.name}StateModificationNode: Node = new Step(node)
        localCCFG.addNode(${ruleCF.rule.name}StateModificationNode)
        let e = localCCFG.addEdge(${previousNodeName},${ruleCF.rule.name}StateModificationNode)
        ${previousNodeName} = ${ruleCF.rule.name}StateModificationNode
        }
    `)
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
        ${previousNodeName}.returnType = "${functionType}"
        ${previousNodeName}.functionsNames = [\`\${${previousNodeName}.uid}${ruleCF.rule.name}\`] //overwrite existing name
        ${previousNodeName}.functionsDefs =[...${previousNodeName}.functionsDefs, ...[${eventEmissionActions}]] //GG
    `);


    if (ruleCF.conclusionParticipants.length == 1 && isRuleConclusionCollectionBased(ruleCF) == false) {
        let participants = ruleCF.conclusionParticipants[0];
        if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p,participants))) {
            if(DEBUG) file.append(`            //mark 0`);
            file.append(`
        localCCFG.addEdge(${previousNodeName},${participants.filter(p=>p.type != "event").map(p => p.name?.replace(/\(\)/,"")).join('_')}Hole)
            `);
        } else {
            if(DEBUG) file.append(`            //mark 1 ${participants.map(p=>p.toJSON())}`);
            file.append(`
        localCCFG.addEdge(${previousNodeName},${participants.filter(p=>p.type == "event").map(p => p.name).join('_')}${(ruleCF.rule.$container as RuleOpening)?.onRule?.ref?.name}Node)
        `);
    
        }
    }
    //Several participants in the conclusion
    
        //collection based conclusion are handles as special holes
    if (isRuleConclusionCollectionBased(ruleCF)) {
        let nodeName : string = ""
        if (ruleCF.rule.premise.eventExpression.$type == "NaryEventExpression") { //parallel sync premise on collection
            nodeName = ruleCF.conclusionParticipants[0].filter(p => p.type != "event").map(p => p.name).join('_') + "Hole"
        }

        //sequential collection based premise
        let participantsNoEvent = ruleCF.conclusionParticipants[0].filter(p => p.type != "event")
        nodeName =  participantsNoEvent.slice(0,ruleCF.conclusionParticipants[0].length-2).map(p => p.name).join('_') + "Hole"
        if(DEBUG) file.append(`            //mark 1.5`);
        file.append(`
        localCCFG.addEdge(${previousNodeName},${nodeName})
        `)
    }

    if (ruleCF.rule.conclusion.eventEmissionOperator == ";") {
        for (let participants of ruleCF.conclusionParticipants) {
            if (holes.map(h => h.startingParticipants).some(p => areParticipantsEquals(p,participants))) {
                if(DEBUG) file.append(`                    //mark 2`);
                file.append(`
        localCCFG.addEdge(${previousNodeName},${participants.filter(p=>p.type != "event").map(p => p.name).join('_')}Hole)
                    ${previousNodeName} = ${participants.filter(p=>p.type != "event").map(p => p.name).join('_')}Hole
                    `);
            } else {
                if(DEBUG) file.append(`
                //conclusion participants in sequential collection but not a hole: ${participants.map(p=>p.toJSON())}
                `);
            }
        }
    }
    if (ruleCF.rule.conclusion.eventEmissionOperator == "||") {
        file.append(`
        let fork${ruleCF.rule.name}Node: Node = new Fork(node)
        localCCFG.addNode(fork${ruleCF.rule.name}Node)
        localCCFG.addEdge(${previousNodeName},fork${ruleCF.rule.name}Node)
            `, NL);
        for (let participants of ruleCF.conclusionParticipants) {
            if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p,participants))) {
                if(DEBUG) file.append(`                    //mark 3`);
                file.append(`
        localCCFG.addEdge(fork${ruleCF.rule.name}Node,${participants.filter(p=>p.type != "event").map(p => p.name).join('_')}Hole)
                    `);
            } else {
                if(DEBUG) file.append(`
                //conclusion participants in parallel collection but not a hole: ${participants.map(p => p.toJSON())}
                `);
            }
        }
    }
}

// function generateVisitFunctions(file: CompositeGeneratorNode, name: string, openedRule: RuleOpening) {
    
//     file.append( `
//     /**
//      * returns the local CCFG of the ${name} node
//      * @param a ${name} node 
//      * @returns the local CCFG (with holes)
//      */
//     visit${name}(node: ${name}): CCFG {`,NL);
//     let tempHole = conceptNameToHoles.get(name)
//     if (tempHole == undefined) {
//         throw new Error("holes not found: "+name)
//     }
//     //const holesParticipants : TypedElement[][] = tempHole;

// }
    

/**
 * traverse all the rules and identifies the holes. A hole is a participant that is the conclusion of a rule and the premise of another rule
 * 
 * @param rulesCF: the list of rules of the opened concept 
 * @returns the list of holes, given as a list of TypedElements (the participants of a memberCall) (the ending event is not relevant) 
 */
function identifiesHoles(rulesCF: RuleControlFlow[]): HoleSpecifier[] {
    let res: HoleSpecifier[] = []
    for (let i = 0; i < rulesCF.length; i++) {
        const currentRule = rulesCF[i];
        const currentConclusionParticipants = currentRule.conclusionParticipants;
        for (let j = 0; j < rulesCF.length; j++) {
            const anotherRule = rulesCF[j];
            const anotherRulePremiseParticipants = anotherRule.premiseParticipants;

            for(let conclusionP of currentConclusionParticipants){
                for(let premiseP of anotherRulePremiseParticipants){
                    if(areParticipantsCoupled(conclusionP, premiseP)){
                        if(conclusionP.some(te => te.isCollection)){
                            let holeSpecifier = new CollectionHoleSpecifier(conclusionP, premiseP)
                            holeSpecifier.isSequential = currentRule.rule.conclusion.eventemissions[0].$type == "CollectionRuleSync" && (currentRule.rule.conclusion.eventemissions[0] as CollectionRuleSync).order == "sequential"
                            holeSpecifier.parallelSyncPolicy = (anotherRule.rule.premise.eventExpression.$type == "NaryEventExpression") ?(anotherRule.rule.premise.eventExpression as NaryEventExpression).policy.operator+"" : "undefined"
                            if(res.map(h => h.startingParticipants).some(p => areParticipantsEquals(p, holeSpecifier.startingParticipants)) == false){
                                res.push(holeSpecifier)
                            }
                        }
                        else{
                            let holeSpecifier = new HoleSpecifier(conclusionP, premiseP)
                            if(res.map(h => h.startingParticipants).some(p => areParticipantsEquals(p, holeSpecifier.startingParticipants)) == false){
                                res.push(holeSpecifier)
                            }
                        }                        
                    }
                }
            } 
        }
    }
    return res
}



/**
 * traverse all the rules and identifies the holes and semi. A hole is a participant that is the conclusion of a rule and the premise of another rule. A semi hole is only started in a conclusion
 * 
 * @param rulesCF: the list of rules of the opened concept 
 * @returns the list of holes and semi holes, given as a list of TypedElements (the participants of a memberCall) (the ending event is not relevant)
 */
function identifiesHolesAndSemiHoles(rulesCF: RuleControlFlow[]): HoleSpecifier[] {
    let res: HoleSpecifier[] = identifiesHoles(rulesCF)
    for (let i = 0; i < rulesCF.length; i++) {
        const currentRule = rulesCF[i];
        const currentConclusionParticipants = currentRule.conclusionParticipants;
        for (let p of currentConclusionParticipants) {
            if (p[p.length - 1].name == "starts") {
                if (!res.some(h => areParticipantsEquals(h.startingParticipants, p))) {
                    res.push(new HoleSpecifier(p, undefined))
                }
            }
        }
    }
    return res
}


function areParticipantsEquals(p1: TypedElement[], p2: TypedElement[]): boolean {
    if(p1.length != p2.length){
        return false
    }
    for(let i = 0; i < p1.length; i++){
        if(p1[i].name != p2[i].name || p1[i].type != p2[i].type){
            return false
        }
    }
    return true
}

function areParticipantsCoupled(p1: TypedElement[], p2: TypedElement[]): boolean {
    
    if(isParticipantCollectionBased(p1) && isParticipantCollectionBased(p2)){
        //sanitize collection based participants
        let p1Copy = []
        for(let p of p1){
            if(p.isCollection){
                p1Copy.push(p)
                break
            }
            p1Copy.push(p)
        }
        p1Copy.push(p1[p1.length-1])
        p1= p1Copy
        let p2Copy = []
        for(let p of p2){
            if(p.isCollection){
                p2Copy.push(p)
                break
            }
            p2Copy.push(p)
        }
        p2Copy.push(p2[p2.length-1])
        p2 = p2Copy
    }


    if(p1.length != p2.length){
        return false
    }
    for(let i = 0; i < p1.length-1; i++){
        if(p1[i].name != p2[i].name || p1[i].type != p2[i].type){
            return false
        }
    }
    if( p1.length > 1 &&
        ((p1[p1.length-1].name == "starts" &&  p2[p2.length-1].name == "terminates")
        ||
        (p1[p1.length-1].name == "terminates" &&  p2[p2.length-1].name == "starts"))
    ){
        return true
    }else{
        return false
    }
}

function areParticipantsEqualsOrCoupled(p1: TypedElement[], p2: TypedElement[]): boolean {
    if(p1.length != p2.length){
        return false
    }
    for(let i = 0; i < p1.length-1; i++){
        if(p1[i].name != p2[i].name || p1[i].type != p2[i].type){
            return false
        }
    }
    
    if(p1[p1.length-1].type == "event" &&  p2[p2.length-1].type == "event"){
        return true
    }

    return false
 
}


/**  retrieves the starting rule of the concept
 * @param rulesCF: the rule to be analyzed
 * */
function retrieveStartingRules(rulesCF: RuleControlFlow[]) {
    let startingRule = [];
    for (let r of rulesCF) {
        for (let participants of r.premiseParticipants) {
            for (let p of participants) {
                if (p.name != undefined && p.name == "starts") {
                    startingRule.push(r);
                }
            }
        }
    }
    return startingRule;
}

// /**checks how many possible termination rules are in the concept
//  * @param rulesCF: the list of rules of the concept 
//  */
// function checkIfMultipleTerminate(rulesCF: RuleControlFlow[]): boolean {
//     let terminatingRules = [];
//     for (let r of rulesCF) {
//         for (let participants of r.conclusionParticipants) {
//             for (let p of participants) {
//                 if (p.name != undefined && p.name == "terminates") {
//                     terminatingRules.push(r);
//                 }
//             }
//         }
//     }
//     let hasMultipleTerminate = terminatingRules.length > 1;
//     return hasMultipleTerminate;
// }

// /**
//  * generates nodes and edges corresponding to the conclusion of a rule. 
//  * Require to retrieve the previous node name which itself construct the nodes and edges of the premise
//  * @param ruleCF: the current rule
//  * @param file : the file containing the generated compiler
//  * @param rulesCF: all the rules of the opened concept 
//  * @param previousNodeName 
//  * @param terminatesNodeName 
//  */
// function handleConclusion(ruleCF: RuleControlFlow, file: CompositeGeneratorNode, rulesCF: RuleControlFlow[], previousNodeName: string, terminatesNodeName: string) {

//     let [previousNodePrefix, previousNodeParticipant, guardActions, param] = handlePreviousPremise(ruleCF, rulesCF, previousNodeName, file)
//     let nodeNameFromPreviousNode = (previousNodePrefix+previousNodeParticipant+ruleCF.rule.name).replace(/\./g,"_").replaceAll("(","_").replaceAll(")","_").replaceAll(")","_").replaceAll("\"","").replaceAll("+","")
    
//     file.append(`
//     {
//         let ${nodeNameFromPreviousNode} = this.retrieveNode("${previousNodePrefix}",${previousNodeParticipant}) //retrieve 1
//         previousNode = ${nodeNameFromPreviousNode}
//     }
//     `)

//     let actionsstring = ""
//     actionsstring = visitStateModifications(ruleCF, actionsstring);
//     if(actionsstring.length>0){
//         file.append(`
//     {let ${ruleCF.rule.name}StateModificationNode: Node = new Step("${ruleCF.rule.name}StateModificationNode")
//     this.ccfg.addNode(${ruleCF.rule.name}StateModificationNode)
//     let e = this.ccfg.addEdge(previousNode,${ruleCF.rule.name}StateModificationNode)
//     e.guards = [...e.guards, ...[${guardActions}]]`)
    
//         if(param != undefined){
//             file.append(`
//     ${ruleCF.rule.name}StateModificationNode.params = [...${ruleCF.rule.name}StateModificationNode.params, ...[Object.assign( new TypedElement(), JSON.parse(\`${param.toJSON()}\`))]]
//     `)
//         }

//         file.append(`
//     previousNode = ${ruleCF.rule.name}StateModificationNode
//     }`)
//         guardActions = ""
    
//         file.append(`
//     previousNode.functionsNames = [...previousNode.functionsNames, ...[\`\${previousNode.uid}${ruleCF.rule.name}\`]] 
//     previousNode.functionsDefs =[...previousNode.functionsDefs, ...[${actionsstring}]] //AA
//     `);
//     }
    
//     let isMultipleEmission = ruleCF.rule.conclusion.eventemissions.length > 1;
//     if (isMultipleEmission) {
//         let isParallel = ruleCF.rule.conclusion.eventEmissionOperator != ";";
//         if (isParallel) {
//             handleParallelMultipleEmissions(file, ruleCF, guardActions, terminatesNodeName);
//         }else{
//             handleSequentialMultipleEmissions(file, ruleCF, guardActions, terminatesNodeName);
//         }
//     } else { //single emission
//         handleSingleEmission(ruleCF, file, guardActions, terminatesNodeName);
//     }
//     let eventEmissionActions = ""
//     let functionType = "void"
//     for(let emission of ruleCF.rule.conclusion.eventemissions){
//         if(emission.$type == "ValuedEventEmission"){
//             let [visitedEmission, returnType] =  visitValuedEventEmission(emission as ValuedEventEmission,file)
//             functionType = returnType
//             eventEmissionActions = eventEmissionActions + visitedEmission
//         }
//     }
//     file.append(`
//         previousNode.returnType = "${functionType}"
//         previousNode.functionsNames = [\`\${previousNode.uid}${ruleCF.rule.name}\`] //overwrite existing name
//         previousNode.functionsDefs =[...previousNode.functionsDefs, ...[${eventEmissionActions}]] //GG
//     `);

// }

// /**
//  * handles the conclusion of a rule with a single emission. It generates the code for the state modifications and the event emissions
//  * @param ruleCF: the current rule
//  * @param file: the file containing the generated compiler
//  * @param guardActions: the guards of the rule
//  * @param terminatesNodeName: the name of the node being terminated
//  */
// function handleSingleEmission(ruleCF: RuleControlFlow, file: CompositeGeneratorNode, guardActions: string, terminatesNodeName: string) {
//     let isEventEmissionACollection: boolean = checkIfEventEmissionIsCollectionBased(ruleCF);
//     if (isEventEmissionACollection) {
//         let isConcurrent = (ruleCF.rule.conclusion.eventemissions[0] as CollectionRuleSync).order == "concurrent";
//         if (isConcurrent) {
//             file.append(`
//         let ${ruleCF.rule.name}ForkNode: Node = new Fork("${ruleCF.rule.name}ForkNode")
//         this.ccfg.addNode(${ruleCF.rule.name}ForkNode)
//         {let e = this.ccfg.addEdge(previousNode,${ruleCF.rule.name}ForkNode)
//         e.guards = [...e.guards, ...[${guardActions}]] //CC
//         }

//         let ${ruleCF.rule.name}FakeNode: Node = new AndJoin("${ruleCF.rule.name}FakeNode")    
//         this.ccfg.addNode(${ruleCF.rule.name}FakeNode)    
//         for (var child of node.${ruleCF.conclusionParticipants[0].name}) {
//             let [childStartsNode,childTerminatesNode] = this.getOrVisitNode(child)
//             this.ccfg.addEdge(${ruleCF.rule.name}ForkNode,childStartsNode)
//             this.ccfg.addEdge(childTerminatesNode,${ruleCF.rule.name}FakeNode)
//         }

//         `);
//         } else { //sequential collection emission
//             file.append(`
//         let ${ruleCF.rule.name}StepNode = new Step("starts"+getASTNodeUID(node.${ruleCF.conclusionParticipants[0].name}))
//         this.ccfg.addNode(${ruleCF.rule.name}StepNode)
//         let e = this.ccfg.addEdge(previousNode,${ruleCF.rule.name}StepNode)
//         e.guards = [...e.guards, ...[${guardActions}]] //DD

//         previousNode = ${ruleCF.rule.name}StepNode
//         for (var child of node.${ruleCF.conclusionParticipants[0].name}) {
//             let [childStartsNode,childTerminatesNode] = this.getOrVisitNode(child)
//             this.ccfg.addEdge(previousNode,childStartsNode)
//             previousNode = childTerminatesNode
//         }
//         let ${ruleCF.conclusionParticipants[0].name}TerminatesNode = new Step("terminates"+getASTNodeUID(node.${ruleCF.conclusionParticipants[0].name}))
//         this.ccfg.addNode(${ruleCF.conclusionParticipants[0].name}TerminatesNode)
//         this.ccfg.addEdge(previousNode,${ruleCF.conclusionParticipants[0].name}TerminatesNode)
//         `);

//         }
//     } else { //single emission, single event
//         if (ruleCF.conclusionParticipants.length == 0) {
//             file.append(`
//         // conclusion with no event emission
//                 `);
//         }

//         else if (ruleCF.conclusionParticipants[ruleCF.conclusionParticipants.length - 1].name != undefined && ruleCF.conclusionParticipants[ruleCF.conclusionParticipants.length - 1].name == "terminates") {
//             file.append(`
//         {let e = this.ccfg.addEdge(previousNode,${terminatesNodeName})
//         e.guards = [...e.guards, ...[${guardActions}]] //EE
//         }
//         `);
//         } else {
//             let toVisitName = ruleCF.conclusionParticipants[0].name;
//             let [extraPrefix, participant] = getExtraPrefix(ruleCF, toVisitName);
//             file.append(`
//         let ${toVisitName}StartsNode${ruleCF.rule.name} = this.retrieveNode("starts",${participant})
//         `);
//             if (extraPrefix.length != 0) {
//                 if (ruleCF.conclusionParticipants[0].type != "Timer") {
//                     throw new Error("in " + ruleCF.rule.name + ", only timer (and event but not yet supported) can be started/stopped from a rule, was " + ruleCF.conclusionParticipants[0].type + "(" + toVisitName + ")\n\t extraPrefix is " + extraPrefix);
//                 }
//                 let duration = ((ruleCF.rule.$container as RuleOpening).runtimeState.filter(rs => rs.name == toVisitName)[0] as VariableDeclaration).value?.$cstNode?.text;
//                 file.append(`
//             let ${toVisitName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates",${participant})
//             ${toVisitName}StartsNode${ruleCF.rule.name} = new Step("starts${toVisitName}"+getASTNodeUID(node))
//             this.ccfg.addNode( ${toVisitName}StartsNode${ruleCF.rule.name})
//             ${toVisitName}StartsNode${ruleCF.rule.name}.functionsNames = [\`starts\${${toVisitName}StartsNode${ruleCF.rule.name}.uid}${toVisitName}\`]
//             ${toVisitName}StartsNode${ruleCF.rule.name}.returnType = "void"
//             ${toVisitName}StartsNode${ruleCF.rule.name}.functionsDefs = [...${toVisitName}StartsNode${ruleCF.rule.name}.functionsDefs, ...[\`std::this_thread::sleep_for(\${node.${duration}}ms);\`]] //GGG
//             ${toVisitName}TerminatesNode${ruleCF.rule.name} = new Step("terminates${toVisitName}"+getASTNodeUID(node))
//             this.ccfg.addNode(${toVisitName}TerminatesNode${ruleCF.rule.name})
    
//             {
//             let e1 = this.ccfg.addEdge(previousNode, ${toVisitName}StartsNode${ruleCF.rule.name})
//             e1.guards = [...e1.guards, ...[]] //FFF
//             let e2 = this.ccfg.addEdge( ${toVisitName}StartsNode${ruleCF.rule.name},${toVisitName}TerminatesNode${ruleCF.rule.name})
//             e2.guards = [...e2.guards, ...[]] //FFF
//             }

//             `);
//             } else {
//                 file.append(`
//             {
//             let e = this.ccfg.addEdge(previousNode,${toVisitName}StartsNode${ruleCF.rule.name})
//             e.guards = [...e.guards, ...[${guardActions}]] //FF
//             }
//             `);
//             }
//         }
//     }
// }

// /**
//  * handles the conclusion of a rule with multiple emission that occur concurently. It generates the code for the state modifications and the event emissions
//  * @param ruleCF: the current rule
//  * @param file: the file containing the generated compiler
//  * @param guardActions: the guards of the rule
//  * @param terminatesNodeName: the name of the node being terminated
//  */

// function handleParallelMultipleEmissions(file: CompositeGeneratorNode, ruleCF: RuleControlFlow, guardActions: string, terminatesNodeName: string) {
//     file.append(`
//         let ${ruleCF.rule.name}ForkNode: Node = new Fork("${ruleCF.rule.name}ForkNode")
//         this.ccfg.addNode(${ruleCF.rule.name}ForkNode)
//         {let e = this.ccfg.addEdge(previousNode,${ruleCF.rule.name}ForkNode)
//         e.guards = [...e.guards, ...[${guardActions}]] //BB
//         }
//         `);
//     let splittedConclusionParticipants = ruleCF.conclusionParticipants;
//     for (let emissionParticipant of splittedConclusionParticipants) {
//         const participantName = emissionParticipant[0].name;
//         let [extraPrefix, participant] = getExtraPrefix(ruleCF, participantName);
//         if (extraPrefix.length != 0) {
//             if (emissionParticipant[0].type != "Timer") {
//                 throw new Error("only timer (and event but not yet supported) can be started/stopped from a rule, was " + emissionParticipant[0].type);
//             }
//             file.append(`
//     let ${participantName}StartsNode${ruleCF.rule.name} = this.retrieveNode("starts"+${extraPrefix},${participant})
//     let ${participantName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates"+${extraPrefix},${participant})
//     {
//     //let e1 = this.ccfg.addEdge(previousNode, ${participantName}StartsNode${ruleCF.rule.name})
//     //e1.guards = [...e1.guards, ...[]] //FF22
//     let e2 = this.ccfg.addEdge( ${participantName}StartsNode${ruleCF.rule.name},${participantName}TerminatesNode${ruleCF.rule.name})
//     e2.guards = [...e2.guards, ...[]] //FF22
//     this.ccfg.addEdge(${ruleCF.rule.name}ForkNode,${participantName}StartsNode${ruleCF.rule.name})
//     }
//    `);

//         } else {
//             if(participantName == "this" && emissionParticipant[1].name == "terminates") {
//                 file.append(`
//         this.ccfg.addEdge(previousNode,${terminatesNodeName})
//         previousNode = ${terminatesNodeName}
//         `);
//             }else{

//             file.append(`
//         let [${participantName}StartNode/*,${participantName}TerminatesNode*/] = this.getOrVisitNode(node.${participantName})
//         this.ccfg.addEdge(${ruleCF.rule.name}ForkNode,${participantName}StartNode)
//         `);
//             }
//         }
//     }
// }


// /**
//  * handles the conclusion of a rule with multiple emission that occur sequentially. It generates the code for the state modifications and the event emissions
//  * @param ruleCF: the current rule
//  * @param file: the file containing the generated compiler
//  * @param guardActions: the guards of the rule
//  * @param terminatesNodeName: the name of the node being terminated
//  */
// function handleSequentialMultipleEmissions(file: CompositeGeneratorNode, ruleCF: RuleControlFlow, guardActions: string, terminatesNodeName: string) {
//     let splittedConclusionParticipants = ruleCF.conclusionParticipants;
//     //console.log(chalk.bgGreenBright("ruleCF.conclusionParticipants", ruleCF.conclusionParticipants.map(p => p.name)))
//     for (let emissionParticipant of splittedConclusionParticipants) {
//         //console.log(chalk.bgGreenBright("emissionParticipant", emissionParticipant.map(p => p.name)))
//         const participantName = emissionParticipant[0].name;
//         let [extraPrefix, participant] = getExtraPrefix(ruleCF, participantName);
//         if (extraPrefix.length != 0) {
//             if (emissionParticipant[0].type != "Timer") {
//                 throw new Error("only timer (and event but not yet supported) can be started/stopped from a rule, was " + emissionParticipant[0].type);
//             }
//             file.append(`
//     let ${participantName}StartsNode${ruleCF.rule.name} = this.retrieveNode("starts"+${extraPrefix},${participant})
//     let ${participantName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates"+${extraPrefix},${participant})
//     {
//     let e1 = this.ccfg.addEdge(previousNode, ${participantName}StartsNode${ruleCF.rule.name})
//     e1.guards = [...e1.guards, ...[]] //FF3
//     let e2 = this.ccfg.addEdge( ${participantName}StartsNode${ruleCF.rule.name},${participantName}TerminatesNode${ruleCF.rule.name})
//     e2.guards = [...e2.guards, ...[]] //FF3
//     }
//    `);

//         } else {
//             //console.log(chalk.bgGreenBright("participantName", participantName))
//             if(participantName == "this" && emissionParticipant[1].name == "terminates") {
//                 file.append(`
//         this.ccfg.addEdge(previousNode,${terminatesNodeName})
//         previousNode = ${terminatesNodeName}
//         `);
//             }else{
//                 file.append(`
//         let [${participantName}StartNode,${participantName}TerminatesNode] = this.getOrVisitNode(node.${participantName})
//         this.ccfg.addEdge(previousNode,${participantName}StartNode)
//         previousNode = ${participantName}TerminatesNode
//         `);
//             }
//         }

//     }
// }

// /**
//  * 
//  * @param ruleCF 
//  * @param participantName 
//  * @returns the extra prefix to be applied in case of a runtime state participant & the actual participant
//  * note the participant is a runtime state if the prefix is not empty
//  */
// function getExtraPrefix(ruleCF: RuleControlFlow, participantName: string|undefined) : [string, string] {
//     let elemToVisitIsARuntimeState = (ruleCF.rule.$container as RuleOpening).runtimeState.some(rs => (rs as NamedElement).name == participantName)
//     if (elemToVisitIsARuntimeState) {
//         return[`"${participantName}"`,"node"];
//     } else {
//         return["", `node.${participantName}`];
//     }
// }



// /**
//  * returns the previous node name in case of a comparison premise. It generates the code for the state modifications and the event emissions
//  * @param file 
//  * @param ruleCF 
//  * @returns [the previous node prefix, the guards, the parameter typed element in json format]
//  */
// function handlePremiseSimpleComparison(file: CompositeGeneratorNode, ruleCF: RuleControlFlow) : [string,string,string, TypedElement|undefined]{
//     let [extraPrefix, participant] = getExtraPrefix(ruleCF, ruleCF.premiseParticipants[0].name);
//     let participantName = ruleCF.premiseParticipants[0].name

//     file.append(`
//         let ${participantName}TerminatesNode${ruleCF.rule.name} = this.retrieveNode("terminates",${participant})
//         let ${participantName}ChoiceNode${ruleCF.rule.name} = this.ccfg.getNodeFromName("choiceNode"+getASTNodeUID(${participant}))
//         if (${participantName}ChoiceNode${ruleCF.rule.name} == undefined) {
//             let ${participantName}ChoiceNode = new Choice("choiceNode"+getASTNodeUID(${participant}))
//             this.ccfg.addNode(${participantName}ChoiceNode)
//             this.ccfg.addEdge(${participantName}TerminatesNode${ruleCF.rule.name},${participantName}ChoiceNode)
//             ${participantName}ChoiceNode${ruleCF.rule.name} = ${participantName}ChoiceNode
//         }else{
//             this.ccfg.addEdge(${participantName}TerminatesNode${ruleCF.rule.name},${participantName}ChoiceNode${ruleCF.rule.name})
//         }
//         `);
//     let guards: string = visitValuedEventRefComparison(ruleCF.rule.premise.eventExpression as ValuedEventRefConstantComparison);
//     return [`choiceNode`+extraPrefix, `${participant}`, guards, undefined];
// }


// /**
//  * puts all the actions and the guards of the rule in strings 
//  * @param lhs left hand side of the multiple synchronization
//  * @param rhs right hand side of the multiple synchronization
//  * @returns [the actions, the guards, the parameters]
//  */
// function visitMultipleSynchroEventRef(lhs: EventExpression, rhs: EventExpression) :[string, string, TypedElement[]]{
//     let actions : string = ""
//     let guards : string = ""
//     let params : TypedElement[] = []
//     if (lhs.$type == "ExplicitValuedEventRef" || lhs.$type == "ImplicitValuedEventRef") {
//         let [leftActions, p] = visitValuedEventRef(lhs as ValuedEventRef);
//         params.push(p)
//         if(actions.length>0){
//             actions+=","      
//         }
//         actions+=leftActions 
//     }
//     if (rhs.$type == "ExplicitValuedEventRef" || rhs.$type == "ImplicitValuedEventRef") {
//         let [rightActions, p] = visitValuedEventRef(rhs as ValuedEventRef);
//         params.push(p)
//         if(actions.length>0){
//             actions+=","       
//         }
//         actions+=rightActions
//     }
//     if (lhs.$type == "ExplicitValuedEventRefConstantComparison" || lhs.$type == "ImplicitValuedEventRefConstantComparison") {
//         let leftGuards: string = visitValuedEventRefComparison(lhs as ValuedEventRefConstantComparison);
//         if(guards.length>0){
//             guards+="," 
//         }
//         guards+=leftGuards      
//     }
//     if (rhs.$type == "ExplicitValuedEventRefConstantComparison" || rhs.$type == "ImplicitValuedEventRefConstantComparison") {
//         let rightGuards: string = visitValuedEventRefComparison(rhs as ValuedEventRefConstantComparison);
//         if(guards.length>0){
//             guards+="," 
//         }
//         guards+=rightGuards
//     }
//     return [actions,guards,params]
// }


// /**
//  * checks if the event expression has a comparison on either side
//  * @param comb the event expression
//  * @returns true if the event expression has a comparison on either side
//  */
// function chekIfOwnsACondition(comb: EventCombination): boolean {
//     return comb.lhs.$type == "ExplicitValuedEventRefConstantComparison" || comb.lhs.$type == "ImplicitValuedEventRefConstantComparison"
//             ||
//            comb.rhs.$type == "ExplicitValuedEventRefConstantComparison" || comb.rhs.$type == "ImplicitValuedEventRefConstantComparison"
// }


// /**
//  * returns the name of the rule emitting the event that starts this rule
//  * @param ruleCF the current rule
//  * @param allRulesCF all the rules of the opened concept
//  * @returns the name of the rule emitting the event
//  */
// function getEmittingRuleName(ruleCF: RuleControlFlow, allRulesCF: RuleControlFlow[]): string {
//     let premiseFirstParticipant = ruleCF.premiseParticipants[0]
//     for(let rule of allRulesCF){
//         if (rule.conclusionParticipants[0].name === premiseFirstParticipant.name){
//             return rule.rule.name
//         }
//     }
//     return "NotFound"+premiseFirstParticipant.name
// }


/**
 * returns the participants of the event expression
 * @param ruleCF  the current rule
 * @returns a boolean indicating if the event emission is collection based
 */
function isRuleConclusionCollectionBased(ruleCF: RuleControlFlow) {
    let isEventEmissionACollection: boolean = false;
    for (let participant of ruleCF.conclusionParticipants) {
        isEventEmissionACollection = isParticipantCollectionBased(participant);
        if (isEventEmissionACollection) {
            return true;
        }
    }
    return false;
}

/**
 * writes the preambule for the visitor file of the compiler 
 * @param fileNode the file 
 * @param data the file path data
 */
function writePreambule(fileNode: CompositeGeneratorNode, data: FilePathData) {
    fileNode.append(`
import fs from 'fs';
import { AstNode, Reference, isReference, streamAst } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, NodeType,Hole, TimerHole,CollectionHole} from "../../ccfg/ccfglib.js";`, NL)
}


/**
 * writes the basic functions of the visitor file of the compiler
 * @param fileNode the file
 */
function addUtilFunctions(fileNode: CompositeGeneratorNode,rootTypeName: string) {
    fileNode.append(`
    generateCCFG(root: ${rootTypeName}, debug: boolean = false): CCFG {

        //pass 1: create local CCFGs for all nodes
        console.log("pass 1: create local CCFGs for all nodes")
        let astNodeToLocalCCFG = new Map<AstNode, CCFG>()
        for (let n of streamAst(root)){
            let localCCFG = this.createLocalCCFG(n)
            if(debug){
                let dotContent = localCCFG.toDot();
                fs.writeFileSync(\`./generated/localCCFGs/localCCFG\${localCCFG.initialState?.functionsNames[0].replace(/init\d+/g,"")}.dot\`, dotContent);
            }
            astNodeToLocalCCFG.set(n, localCCFG)
        }

        //pass 2: connect all local CCFGs
        console.log("pass 2: connect all local CCFGs")
        let globalCCFG = astNodeToLocalCCFG.get(root) as CCFG
        let holeNodes : Hole[] = this.retrieveHoles(globalCCFG)
        //fix point loop until all holes are filled
        while (holeNodes.length > 0) {
            if (debug) console.log("holes to fill: "+holeNodes.length)
            for (let holeNode of holeNodes) {
                if (holeNode.getType() == "TimerHole") {
                    if (debug) console.log("filling timer hole: "+holeNode.uid)
                    this.fillTimerHole(holeNode as TimerHole, globalCCFG)
                    continue
                }if (holeNode.getType() == "CollectionHole") {
                    if (debug) console.log("filling timer hole: "+holeNode.uid)
                        this.fillCollectionHole(holeNode as CollectionHole, globalCCFG)
                        continue
                }else{
                    if (debug) console.log("filling hole: "+holeNode.uid)
                    if (holeNode.astNode === undefined) {
                        throw new Error("Hole has undefined astNode :"+holeNode.uid)
                    }
                    let holeNodeLocalCCFG = astNodeToLocalCCFG.get(holeNode.astNode) as CCFG
                    globalCCFG.fillHole(holeNode, holeNodeLocalCCFG)
                }
            }
            holeNodes = this.retrieveHoles(globalCCFG)
        }

        return globalCCFG
    }

    fillCollectionHole(hole: CollectionHole, ccfg: CCFG) {
        let holeNodeLocalCCFG = new CCFG()
        let startsCollectionHoleNode: Node = new Step(hole.astNode,NodeType.starts,[])
        holeNodeLocalCCFG.addNode(startsCollectionHoleNode)
        holeNodeLocalCCFG.initialState = startsCollectionHoleNode
        let terminatesCollectionHoleNode: Node = new Step(hole.astNode,NodeType.terminates)
        holeNodeLocalCCFG.addNode(terminatesCollectionHoleNode)
        if(hole.isSequential){
            let previousNode = startsCollectionHoleNode
            for (let e of hole.astNodeCollection){
                let collectionHole : Hole = new Hole(e)
                holeNodeLocalCCFG.addNode(collectionHole)
                holeNodeLocalCCFG.addEdge(previousNode,collectionHole)
                previousNode = collectionHole
            }
            holeNodeLocalCCFG.addEdge(previousNode,terminatesCollectionHoleNode)
            ccfg.fillHole(hole, holeNodeLocalCCFG)
        }
        else{
            let forkNode = new Fork(hole.astNode)
            holeNodeLocalCCFG.addNode(forkNode)
            holeNodeLocalCCFG.addEdge(startsCollectionHoleNode,forkNode)
            let joinNode = undefined
            if(hole.parallelSyncPolicy == "lastOF"){
                joinNode = new AndJoin(hole.astNode)
            }else{
                joinNode = new OrJoin(hole.astNode)
            } 
            holeNodeLocalCCFG.addNode(joinNode)
            holeNodeLocalCCFG.addEdge(joinNode,terminatesCollectionHoleNode)
            for (let e of hole.astNodeCollection){
                let collectionHole : Hole = new Hole(e)
                holeNodeLocalCCFG.addNode(collectionHole)
                holeNodeLocalCCFG.addEdge(forkNode,collectionHole)
                holeNodeLocalCCFG.addEdge(collectionHole,joinNode)
            }
            ccfg.fillHole(hole, holeNodeLocalCCFG)
        }
        return
    }

    fillTimerHole(hole: TimerHole, ccfg: CCFG) {
        let node = hole.astNode as AstNode
        let timerHoleLocalCCFG = new CCFG()
        let startsTimerHoleNode: Node = new Step(node,NodeType.starts,[\`std::this_thread::sleep_for(\${hole.duration}ms);\`])
        timerHoleLocalCCFG.addNode(startsTimerHoleNode)
        timerHoleLocalCCFG.initialState = startsTimerHoleNode
        let terminatesTimerHoleNode: Node = new Step(node,NodeType.terminates)
        timerHoleLocalCCFG.addNode(terminatesTimerHoleNode)
        timerHoleLocalCCFG.addEdge(startsTimerHoleNode,terminatesTimerHoleNode)
        ccfg.fillHole(hole, timerHoleLocalCCFG)
    }

    retrieveHoles(ccfg: CCFG): Hole[] {
        let holes: Hole[] = [];
        for (let node of ccfg.nodes) {
            if (node instanceof Hole) {
                holes.push(node);
            }
        }
        return holes;
    }


    getASTNodeUID(node: AstNode | AstNode[] | Reference<AstNode> | Reference<AstNode>[] | undefined ): any {
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
                return this.getASTNodeUID(noUndef)
            }
            var rs = node.map(n => (n as AstNode).$cstNode?.range)
            return "array"+rs.map(r => r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character).join("_");
        }
        
        if(isReference(node)){
            return this.getASTNodeUID(node.ref)
        }

        var r = node.$cstNode?.range
        return node.$type+r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character;
    }

    // getOrVisitNode(node:AstNode | Reference<AstNode> |undefined): [Node,Node]{
    //     if(node === undefined){
    //         throw new Error("not possible to get or visit an undefined AstNode")
    //     }     
    //     if(isReference(node)){
    //         if(node.ref === undefined){
    //             throw new Error("not possible to visit an undefined AstNode")
    //         }
    //         node = node.ref
    //     }

    //     let startsNode = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
    //     if(startsNode !== undefined){
    //         let terminatesNode = this.ccfg.getNodeFromName("terminates"+getASTNodeUID(node))
    //         if(terminatesNode === undefined){
    //             throw new Error("impossible to be there")
    //         }
    //         return [startsNode,terminatesNode]
    //     }
    //     let [starts,terminates] = this.visit(node)
    //     return [starts,terminates]
    // }

    // retrieveNode(prefix: string, node: AstNode | AstNode[] | Reference<AstNode> | Reference<AstNode>[] | undefined): Node {
    //     if(node === undefined){
    //         throw new Error("not possible to retrieve a node from an undefined AstNode")
    //     }
    //     if(Array.isArray(node) || (prefix != "starts" && prefix != "terminates")){
    //         let n = this.ccfg.getNodeFromName(prefix+getASTNodeUID(node))
    //         if(n === undefined){
    //             throw new Error("impossible to retrieve "+prefix+getASTNodeUID(node)+ "from the ccfg")
    //         }
    //         return n
    //     }
    //     if(prefix == "starts"){
    //         return this.getOrVisitNode(node)[0]
    //     }
    //     if(prefix == "terminates"){
    //         return this.getOrVisitNode(node)[1]
    //     }       
    //     throw new Error("not possible to retrieve the node given as parameter: "+prefix+getASTNodeUID(node))
    // }
    // `)
}

/**
 * retrieves a litst of the rule control flows from the openedRule and adds an explanation of the premisses and conclusions of the rules in the file 
 * @param fileNode the file
 * @param openedRule the rule
 * @returns a list of rule control flows
 */
function extractRuleControlFlowsFromRules(fileNode: CompositeGeneratorNode, openedRule: RuleOpening): RuleControlFlow[] {
    let res: RuleControlFlow[] = []
    for (var rwr of openedRule.rules) {
        if (rwr.$type == "RWRule") {

            if(DEBUG) fileNode.append(`// rule ${rwr.name}`, NL)
            let premiseEventParticipants: TypedElement[][] = getEventSynchronisationParticipants(rwr.premise.eventExpression);
            if(DEBUG) fileNode.append(`   //premise: ${premiseEventParticipants.map(pa => pa.map(p => p.name + ":" + p.type + (p.isCollection ? "[]" : ""))).join("\n\t//")}`, NL)
            let conclusionEventParticipants: TypedElement[][] = []
            for (let emission of rwr.conclusion.eventemissions) {
                conclusionEventParticipants = [...conclusionEventParticipants, ...getEventEmissionParticipants(emission)]
            }
            if(DEBUG) fileNode.append(`   //conclusion: ${conclusionEventParticipants.map(pa => pa.map(p => p.name + ":" + p.type + (p.isCollection ? "[]" : ""))).join("\n\t//")}`, NL)
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
    premiseParticipants: TypedElement[][] 
    conclusionParticipants: TypedElement[][]
    constructor(rule: RWRule, premiseParticipants: TypedElement[][], conclusionParticipants: TypedElement[][]) {
        this.rule = rule
        this.premiseParticipants = premiseParticipants
        this.conclusionParticipants = conclusionParticipants
    }

}

/**
 * a class representing a typed element
 * @param astNode the ast node of the element
 * @param name the name of the element
 * @param type the type of the element
 * @param isCollection a boolean indicating if the element is a collection
 * @function toJSON returns the element in json format
 * @function equals returns true if the element is equal to another element
 */

class TypedElement {
    astNode: AstNode | undefined
    name: (string | undefined)
    type: (string | undefined)
    isCollection: boolean

    constructor(astNode: AstNode | undefined, name: string | undefined, type: string | undefined, isCollection: boolean = false) {
        this.astNode = astNode
        this.name = name
        this.type = type
        this.isCollection = isCollection
    }

    equals(other: TypedElement): boolean {
        return this.name == other.name && this.type == other.type
    }

    toJSON() {
        return `{ "name": "${this.name}", "type": "${this.type}"}`
    }
}

class HoleSpecifier{

    startingParticipants: TypedElement[] = []
    terminatingParticipants: TypedElement[] | undefined = [] //if undefined -> semi hole

    constructor(startingParticipants: TypedElement[], terminatingParticipants: TypedElement[] | undefined) {
        this.startingParticipants = startingParticipants
        this.terminatingParticipants = terminatingParticipants
    }
   
}

class CollectionHoleSpecifier extends HoleSpecifier{

    constructor(startingParticipants: TypedElement[], terminatingParticipants: TypedElement[] | undefined) {
        super(startingParticipants, terminatingParticipants)
    }

    isSequential: boolean = true
    parallelSyncPolicy: string = "lastOF"
    
}


/**
 * 
 * @param eventEmission  the event emission
 * @returns a typed element list of the event emission participants
 */
function getEventEmissionParticipants(eventEmission: EventEmission): TypedElement[][] {
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

    return res
}

/**
 * 
 * @param eventExpression the event expression
 * @returns a typed element list of the event synchronisation participants
 */

function getEventSynchronisationParticipants(eventExpression: EventExpression): TypedElement[][] {
    let res: TypedElement[][] = []
    // console.log(chalk.red("-------------------"))
    //explicit event ref
    if (eventExpression.$type == "ExplicitEventRef") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            // console.log(chalk.bgGreenBright("explicit event ref"))
            res.push(getExplicitEventExpressionParticipants(eventExpression.membercall as MemberCall))
        }
        return res
    }
    if (eventExpression.$type == "SingleRuleSync") {
        let tmp = getSingleRuleSyncEventExpressionParticipants(eventExpression)
        tmp.push(new TypedElement(undefined,"terminates", "event")) //implicit in premise
        // console.log(chalk.bgGreenBright("single rule sync"))
        res.push(tmp)
        return res
    }

    if (eventExpression.$type == "ExplicitValuedEventRef" || eventExpression.$type == "ImplicitValuedEventRef") {
        if ((eventExpression.membercall as MemberCall)?.element?.ref != undefined) {
            let tmp = getValuedEventRefParticipants(eventExpression as ValuedEventRef)
            if (eventExpression.$type == "ImplicitValuedEventRef") {
                tmp.push(new TypedElement(undefined,"terminates", "event")) //implicit in premise
            }
            // console.log(chalk.bgGreenBright("explicit valued event ref"))
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
            // console.log(chalk.bgGreenBright("explicit valued event ref constant comparison"))
            res.push(tmp)
            return res
        }
    }

    if (eventExpression.$type == "EventConjunction" || eventExpression.$type == "EventDisjunction") {
        let left = getEventSynchronisationParticipants(eventExpression.lhs)
        let right = getEventSynchronisationParticipants(eventExpression.rhs)
        // console.log(chalk.bgGreenBright("event conjunction or disjunction"))
        res = [...left, ...right]
        return res
    }

    if (eventExpression.$type == "NaryEventExpression") {
        // console.log(chalk.bgGreenBright("nary event expression"))
        res.push(getExplicitEventExpressionParticipants(eventExpression.collection as MemberCall))
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
function getExplicitEventExpressionParticipants(membercall: MemberCall): TypedElement[] {
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
                ass.operator == "+="
            )
            res.push(typedElement)
        } else {
            let namedElem = ((membercall.element.ref as unknown) as NamedElement)

            let [name, type] = getNameAndTypeOfElement(namedElem);

            let typedElement: TypedElement = new TypedElement(
                namedElem,
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


// /**
//  *  splits a list of typed elements by participants
//  * @param elements a list of typed elements
//  * @returns a 2d list of typed element separated by participants
//  */

// function splitArrayByParticipants(elements: TypedElement[]): TypedElement[][] {
//     const result: TypedElement[][] = [];
//     let currentArray: TypedElement[] = [];
    
//     for (const element of elements) {
//         // console.log(chalk.bgGreenBright("element", element.name, "type", element.type))
//         if (element.type === 'event') {
//             if (currentArray.length > 0) {
//                 result.push(currentArray);
//                 currentArray = [];
//             }
//             if(element.name == "terminates"){
//                 // currentArray.push(new TypedElement("this", undefined));
//                 currentArray.push(element);
//                 result.push(currentArray);
//                 currentArray = [];
//             }
//         } else {
//             currentArray.push(element);
//         }
//     }
    
//     if (currentArray.length > 0) {
//         result.push(currentArray);
//     }
    
//     return result;
// }


// /**
//  * 
//  * for now in c++ like form but should be an interface to the target language
//  * @param runtimeState
//  * @returns
//  */
// function visitValuedEventRefComparison(valuedEventRefComparison: ValuedEventRefConstantComparison | undefined): string {
//     var res : string = ""
    
//     if (valuedEventRefComparison != undefined) {
//         let v = valuedEventRefComparison.literal
//         // let varType: TypeDescription

//         // if(typeof(valuedEventRefComparison.literal) == "string"){
//         //     varType = createstringType(undefined)
//         // }else{
//         //     varType = inferType(valuedEventRefComparison.literal, new Map())
//         // }

//         //guardactionsactions
//         if(valuedEventRefComparison.$type == "ImplicitValuedEventRefConstantComparison"){
//             //res = res + `\`(bool)\${this.getASTNodeUID(node.${(valuedEventRefComparison.membercall as MemberCall).element?.$refText})}${"terminates"} == ${(typeof(v) == "string")?v:v.$cstNode?.text}\``
//             res = res + `\`${verifyEqual},\${this.getASTNodeUID(node.${(valuedEventRefComparison.membercall as MemberCall).element?.$refText})}${"terminate"},${(typeof(v) == "string")?v:v.$cstNode?.text}\``
//         }
//         if(valuedEventRefComparison.$type == "ExplicitValuedEventRefConstantComparison"){
//             let prev = (valuedEventRefComparison.membercall as MemberCall)?.previous
//             //res = res + `\`(bool)\${this.getASTNodeUID(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRefComparison.membercall as MemberCall).element?.$refText} == ${(typeof(v) == "string")?v:v.$cstNode?.text}\``
//             res = res + `\`${verifyEqual},\${this.getASTNodeUID(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRefComparison.membercall as MemberCall).element?.$refText},${(typeof(v) == "string")?v:v.$cstNode?.text}\``
//         }
        
//     }
//     return res
// }


// /**
//  * writes out the code for 
//  * for now in c++ like form but should be an interface to the target language
//  * @param runtimeState
//  * @returns
//  */
// function visitValuedEventRef(valuedEventRef: ValuedEventRef | undefined): [string, TypedElement] {
//     var res : string = ""
//     if (valuedEventRef != undefined) {
//         let v = valuedEventRef.tempVar
//         let varType = inferType(v, new Map())
//         let typeName = getCPPVariableTypeName(varType.$type)
//         if(v != undefined && valuedEventRef.$type == "ImplicitValuedEventRef"){
//             res = res + `\`${typeName} \${this.getASTNodeUID(node)}${v.$cstNode?.offset} = ${v.name};\``//valuedEventRef  \${getName(node.${(valuedEventRef.membercall as MemberCall).element?.$refText})}${"terminates"}\``
//             let param:TypedElement = new TypedElement(v,v.name, typeName)
//             return [res, param]
//         }
//         if(v != undefined && valuedEventRef.$type == "ExplicitValuedEventRef"){
//             // let prev = (valuedEventRef.membercall as MemberCall)?.previous
//             res = res + `\`${typeName} \${this.getASTNodeUID(node)}${v.$cstNode?.offset} = ${v.name};\`` //valuedEventRef \${getName(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRef.membercall as MemberCall).element?.$refText};\``
//             let param:TypedElement = new TypedElement(v,v.name, typeName)
//             return [res, param]
//         }
    
//     }
//     return ["", new TypedElement(undefined,"NULL", undefined)]
// }


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
                localCCFG.addNode(starts${vardDecl.name}Node)
                let terminates${vardDecl.name}Node: Node = new Step("terminates${vardDecl.name}"+getASTNodeUID(node))\n
                localCCFG.addNode(terminates${vardDecl.name}Node)
                localCCFG.addEdge(starts${vardDecl.name}Node,terminates${vardDecl.name}Node)
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
                   //res = res + sep + `\`sigma["\${this.getASTNodeUID(node)}${vardDecl.name}"] = new ${getVariableType(vardDecl.type)}(${(vardDecl.value != undefined)?`\${node.${(vardDecl.value as MemberCall).element?.$refText}}`:""});\``
                   res = res + sep + `\`${createGlobalVar},${getVariableType(vardDecl.type)}${(vardDecl.value != undefined)?`\${node.${(vardDecl.value as MemberCall).element?.$refText}}`:""},\${this.getASTNodeUID(node)}${vardDecl.name}\``
                }else{
                    //res = res + sep + `\`sigma["\${this.getASTNodeUID(node)}${vardDecl.name}"] = new ${getVariableType(vardDecl.type)}(${(vardDecl.value != undefined)?vardDecl.value.$cstNode?.text:""});\``
                    res = res + sep + `\`${createGlobalVar},${getVariableType(vardDecl.type)}${(vardDecl.value != undefined)?vardDecl.value.$cstNode?.text:""},\${this.getASTNodeUID(node)}${vardDecl.name}\``
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
            //res = res + `\`${typeName} \${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset} = \${this.getASTNodeUID(node)}${lhs.$cstNode?.offset} ${applyOp} \${this.getASTNodeUID(node)}${rhs.$cstNode?.offset};\``
            res = res + `\`${createVar},\${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset}\`,`
            res = res + `\`${operation},\${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset},\${this.getASTNodeUID(node)}${lhs.$cstNode?.offset},${applyOp},\${this.getASTNodeUID(node)}${rhs.$cstNode?.offset}\``
        }
        if(valuedEmission.data != undefined && valuedEmission.data.$type == "BooleanExpression" || valuedEmission.data.$type == "NumberExpression" || valuedEmission.data.$type == "StringExpression"){
            // write a node that sends the value specified 
            //res = `\`${typeName} \${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name} =  ${valuedEmission.data.$cstNode?.text};\``
            //res = res + "," +`\`return \${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name};\``
            res = res  +`\`${createVar},${typeName},\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\``+ ","
            res = res  +`\`${assignVar},\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name},${valuedEmission.data.$cstNode?.text}\``+ ","
            res = res  +`\`${ret},\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\``+ ","
            return [res, typeName]
        }
        if(res.length > 0){
            res = res + ","
        }
        console.log(res)
        //res = res + `\`${typeName} \${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name} =  \${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset};\``
        //res = res + "," +`\`return \${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name};\``
        res = res+ `\`${createVar},${typeName},\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`,`
        res = res+ `\`${assignVar},\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name},\${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset}\`,`
        res = res+ `\`${ret},\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\``
        
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
        //res = res + `\`${typeName} \${this.getASTNodeUID(node)}${data.$cstNode?.offset} = *(${typeName} *) sigma["\${this.getASTNodeUID(node${prev != undefined ? "."+prev.$refText : ""})}${elem.name}"];//${elem.name}}\``
        res = res+ `\`${lock},variableMutex\`,`
        res = res+ `\`${createVar},${typeName},\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,`
        res = res+ `\`${setVarFromGlobal},${typeName},\${this.getASTNodeUID(node)}${data.$cstNode?.offset},\${this.getASTNodeUID(node${prev != undefined ? "."+prev.$refText : ""})}${elem.name}\``
    } 
    else if (elem?.$type == "TemporaryVariable") {
        //res = res + `\`${typeName} \${this.getASTNodeUID(node)}${data.$cstNode?.offset} = ${elem.name}; // was \${this.getASTNodeUID(node)}${prev != undefined ? prev?.ref?.$cstNode?.offset : elem.$cstNode?.offset}; but using the parameter name now\``
        res = res+ `\`${createVar},${typeName},\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,`
        res = res+ `\`${assignVar},\${this.getASTNodeUID(node)}${data.$cstNode?.offset},${elem.name}\`` 
    }
    else /*if (elem?.$type == "Assignment")*/ {
        
        //res = res + `\`${typeName} \${this.getASTNodeUID(node)}${data.$cstNode?.offset} = \${node.${data.$cstNode?.text}};\ //${elem.name}\``
        res = res+ `\`${createVar},${typeName},\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,`
        res = res+ `\`${assignVar},\${this.getASTNodeUID(node)}${data.$cstNode?.offset},\${node.${data.$cstNode?.text}}\``
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
 * @param actionsstring 
 * @returns 
 */
function visitStateModifications(ruleCF: RuleControlFlow, actionsstring: string) {
    let sep = ""
    if(actionsstring.length > 0){
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
            return actionsstring
        }
        let lhsPrev = ((action.lhs as MemberCall).previous as MemberCall)?.element
        let lhsElem = (action.lhs as MemberCall).element?.ref
        if (lhsElem == undefined) {
            return actionsstring
        }

        actionsstring = actionsstring + sep + createVariableFromMemberCall(action.rhs as MemberCall, typeName)
        sep = ","
        
        if(rhsElem.$type == "TemporaryVariable"){
            //actionsstring = actionsstring + sep + `\`//TODO: fix this and avoid memory leak by deleting, constructing appropriately
            //    const std::lock_guard<std::mutex> lock(sigma_mutex);\``;                              
            //actionsstring = actionsstring + sep + `(*((${typeName}*)sigma[\"\${this.getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}"])) = \${this.getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset};\``;
            actionsstring = actionsstring + sep + `\`${setGlobalVar},${typeName},\${this.getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name},\${this.getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset}\``
        }else{
            /*actionsstring = actionsstring + sep + `\`//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((${typeName}*)sigma[\"\${this.getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}"])) = \${this.getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset};\``;
            */
           actionsstring = actionsstring + sep + `\`${setGlobalVar},${typeName},\${this.getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name},\${this.getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset}\``
        }
    }
    return actionsstring;
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


/**
 * determines if the participant (TypedElement[]) is a Timer or not
 * @param p a list of typed elements
 * @returns 
 */
function isATimerHole(p: TypedElement[]): boolean {
    for (const element of p) {
        if (element.type === "Timer") {
            return true;
        }
    }
    return false;
}


/**
 * determines if the participant (TypedElement[]) is a Collection or not
 * @param p a list of typed elements
 * @returns 
 */
function isACollectionHole(h: HoleSpecifier): boolean {
    return isParticipantCollectionBased(h.startingParticipants);
}


function isParticipantCollectionBased(participant: TypedElement[]): boolean {
    for (let p of participant) {
        if (p.isCollection) {
            return true;
        }
    }
    return false;
}



