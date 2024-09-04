import fs from 'fs';
import { AstNode, Grammar} from 'langium';
import { CompositeGeneratorNode ,NL,toString} from 'langium/generate';
import { Assignment, BinaryExpression, CollectionRuleSync, EventCombination, EventEmission, EventExpression, MemberCall, MethodMember, NamedElement, NaryEventExpression, RWRule, RuleOpening, SingleRuleSync, SoSSpec, TypeReference, ValuedEventEmission, ValuedEventRef, ValuedEventRefConstantComparison, VariableDeclaration } from '../language-server/generated/ast.js'; //VariableDeclaration
import { extractDestinationAndName, FilePathData } from './cli-util.js';
import path from 'path';
import { inferType } from '../language-server/type-system/infer.js';
import chalk from 'chalk';





const DEBUG = true

var conceptNameToHoles: Map<string, HoleSpecifier[]> = new Map()
var conceptNameToRulesCF: Map<string, RuleControlFlow[]> = new Map()

// this function is used to generate the code for the visitor pattern of the specified compiler

export function generateCompilerFrontEndFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name+"CompilerFrontEnd")}.ts`;
    const file = new CompositeGeneratorNode();

    writePreambule(file, data);

    let conceptNames: string[] = []

    for (var openedRule of model.rtdAndRules) {
        if (openedRule.onRule?.ref != undefined) {
            conceptNames.push(openedRule.onRule.ref.name)
        }
    }
    if (fs.existsSync(data.destination+"/../../language-server/")) {
        file.append(`import { ${conceptNames.join(',')} } from "../../language-server/generated/ast.js";`, NL)
    }else{
        if (fs.existsSync(data.destination+"/../../language/")) {
            file.append(`import { ${conceptNames.join(',')} } from "../../language/generated/ast.js";`, NL)
        }else{
            console.log(chalk.red("seems that data destination does not target a valid language server or language folder. I'm looking for either this "+data.destination+"/../../language-server/ or this "+data.destination+"/../../language/ folders "))
        }
    }
    
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
        if (debug){
            console.log("CompilerFrontEnd created")
        }
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
            let premiseNodeName : string= getPreviousNodeNameFromPremiseParticipants(ruleCF, conceptName)
            //manage premise (most of the time the premise's node is already existing since a hole.)
            
            if (ruleCF.premiseParticipants.length > 1) {
                file.append(`
        let ${premiseNodeName}: Node = new ${premiseNodeName.endsWith("OrJoinNode")?"OrJoin":"AndJoin"}(node)
        localCCFG.addNode(${premiseNodeName})
                `);
                for (let participants of ruleCF.premiseParticipants) {
                    if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p, participants))) {
                        if (DEBUG) file.append(`             //mark a`);
                        file.append(`
        localCCFG.addEdge(${participants.filter(p => p.type != "event").map(p => p.name).join('_')}Hole,${premiseNodeName})
                            `);
                    } else {
                        file.append(`
                //premise participants in parallel collection but not a hole: ${participants.map(p => p.toJSON())}
                        `);
                    }
                }
            }


            let allEventValuedComparisons = getValuedEventRefConstantComparison(ruleCF.rule.premise.eventExpression)
            
            if (allEventValuedComparisons.length > 0) {
                    let refNode = `node.${ruleCF.premiseParticipants[0].filter(p => p.type != "event").map(p => p.name).join('.')}`
                    file.append(`
        let ${ruleCF.rule.name}ChoiceNode = undefined
        if(${premiseNodeName}.outputEdges.filter(e => e.to.getType() == "Choice").length == 1){
            ${ruleCF.rule.name}ChoiceNode = ${premiseNodeName}.outputEdges.filter(e => e.to.getType() == "Choice")[0].to
        }else{
            ${ruleCF.rule.name}ChoiceNode = new Choice(${refNode})
            localCCFG.addNode(${ruleCF.rule.name}ChoiceNode)
        }
        localCCFG.addEdge(${premiseNodeName},${ruleCF.rule.name}ChoiceNode)
                `);
                    premiseNodeName = `${ruleCF.rule.name}ChoiceNode`
                }

            handleRuleConclusion(ruleCF, holes, file, premiseNodeName);

        }
    }


    file.append(`
        return localCCFG;
    }`, NL);
}


function getValuedEventRefConstantComparison(eventExpression : EventExpression): ValuedEventRefConstantComparison[] {
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

function getValuedEventRef(eventExpression : EventExpression): ValuedEventRef[] {
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
    let guardString = ""
    let allEventValuedComparisons = getValuedEventRefConstantComparison(ruleCF.rule.premise.eventExpression)
    let sep = ""
    for(let comparison of allEventValuedComparisons){
        guardString = guardString + sep + visitValuedEventRefComparison(comparison)
        sep =","
    }
    
    if(actionsstring.length>0){
        file.append(`
        {
        let ${ruleCF.rule.name}StateModificationNode: Node = new Step(node, undefined, [${actionsstring}])
        localCCFG.addNode(${ruleCF.rule.name}StateModificationNode)
        {let e = localCCFG.addEdge(${previousNodeName},${ruleCF.rule.name}StateModificationNode)
        e.guards = [...e.guards, ...[${guardString}]]}
        ${previousNodeName} = ${ruleCF.rule.name}StateModificationNode
        }
    `)
    }

    let params : TypedElement[] = []
    let allValuedEventRef = getValuedEventRef(ruleCF.rule.premise.eventExpression)
    sep = ""
    for(let valuedEventRef of allValuedEventRef){
        let [actions, param] = visitValuedEventRef(valuedEventRef)
        actionsstring = actionsstring + sep + actions   
        params.push(param)
        sep = ","
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
    let formattedParams = ""
    sep = ""
    for(let p of params){
        formattedParams = formattedParams+ sep + `Object.assign( new TypedElement(), JSON.parse(\`${p.toJSON()}\`))`
        sep = ","
    }

    file.append(`
        ${previousNodeName}.params = [...${previousNodeName}.params, ...[${formattedParams}]]
        ${previousNodeName}.returnType = "${functionType}"
        ${previousNodeName}.functionsNames = [\`\${${previousNodeName}.uid}${ruleCF.rule.name}\`] //overwrite existing name
        ${previousNodeName}.functionsDefs =[...${previousNodeName}.functionsDefs, ...[${eventEmissionActions}]] //GG
    `);


    if (ruleCF.conclusionParticipants.length == 1 && isRuleConclusionCollectionBased(ruleCF) == false) {
        let participants = ruleCF.conclusionParticipants[0];
        if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p,participants))) {
            if(DEBUG) file.append(`            //mark 0`);
            file.append(`
        {let e = localCCFG.addEdge(${previousNodeName},${participants.filter(p=>p.type != "event").map(p => p.name?.replace(/\(\)/,"")).join('_')}Hole)
        e.guards = [...e.guards, ...[${guardString}]]}
            `);
        } else {
            if(DEBUG) file.append(`            //mark 1 ${participants.map(p=>p.toJSON())}`);
            file.append(`
        {let e = localCCFG.addEdge(${previousNodeName},${participants.filter(p=>p.type == "event").map(p => p.name).join('_')}${(ruleCF.rule.$container as RuleOpening)?.onRule?.ref?.name}Node)
        e.guards = [...e.guards, ...[${guardString}]]}
        `);
        console.log(`${participants.filter(p=>p.type == "event").map(p => p.name).join('_')}${(ruleCF.rule.$container as RuleOpening)?.onRule?.ref?.name}Node`)
    
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

        //guardactions
        if(valuedEventRefComparison.$type == "ImplicitValuedEventRefConstantComparison"){
            res = res + `new VerifyEqualInstruction(\`\${this.getASTNodeUID(node.${(valuedEventRefComparison.membercall as MemberCall).element?.$refText})}${"terminate"}\`,\`${(typeof(v) == "string")?v:v.$cstNode?.text}\`)`
        }
        if(valuedEventRefComparison.$type == "ExplicitValuedEventRefConstantComparison"){
            let prev = (valuedEventRefComparison.membercall as MemberCall)?.previous
            res = res + `new VerifyEqualInstruction(\`\${this.getASTNodeUID(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRefComparison.membercall as MemberCall).element?.$refText}\`,\`${(typeof(v) == "string")?v:v.$cstNode?.text}\`)`
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
            res = res + `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${v.$cstNode?.offset}\`,\`${typeName}\`)`
            res = res + `new SetVarInstruction(\`\${this.getASTNodeUID(node)}${v.$cstNode?.offset}\`,\`${v.name}\`,\`${typeName}\`)`
            let param:TypedElement = new TypedElement(v,v.name, typeName)
            return [res, param]
        }
        if(v != undefined && valuedEventRef.$type == "ExplicitValuedEventRef"){
            // let prev = (valuedEventRef.membercall as MemberCall)?.previous
            res = res + `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${v.$cstNode?.offset}\`,\`${typeName}\`)`
            res = res + `new SetVarInstruction(\`\${this.getASTNodeUID(node)}${v.$cstNode?.offset}\`,\`${v.name}\`,\`${typeName}\`)`
            let param:TypedElement = new TypedElement(v,v.name, typeName)
            return [res, param]
        }
    
    }
    return ["", new TypedElement(undefined,"NULL", undefined)]
}


/**
 * creates the visitor code for a new variable declarations
 * @param  runtimeState the variable declarations
 * @param file the file to be written into 
 * @returns 
 */
function visitVariableDeclaration(runtimeState: VariableDeclaration[] | undefined, file : CompositeGeneratorNode): void {
    if (runtimeState != undefined) {
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
                   //res = res + sep + `\`sigma["\${getASTNodeUID(node)}${vardDecl.name}"] = new ${getVariableType(vardDecl.type)}(${(vardDecl.value != undefined)?`\${node.${(vardDecl.value as MemberCall).element?.$refText}}`:""});\``
                   res = res + sep + `new CreateGlobalVarInstruction(\`\${this.getASTNodeUID(node)}${vardDecl.name}\`,\`${getVariableType(vardDecl.type)}\`)`
                   sep = ","
                   res = res + sep + `new SetGlobalVarInstruction(\`\${this.getASTNodeUID(node)}${vardDecl.name}\`,\`${(vardDecl.value != undefined)?`\${node.${(vardDecl.value as MemberCall).element?.$refText}}`:""}\`,\`${getVariableType(vardDecl.type)}\`)` 
                   
                //    `\`${assignVar},\${getASTNodeUID(node)}${vardDecl.name},${(vardDecl.value != undefined)?(vardDecl.value as MemberCall).element?.$refText:""}\``
                }else{
                    //res = res + sep + `\`sigma["\${getASTNodeUID(node)}${vardDecl.name}"] = new ${getVariableType(vardDecl.type)}(${(vardDecl.value != undefined)?vardDecl.value.$cstNode?.text:""});\``
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
            res = res + `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset}\`,\`${typeName}\`),`
            res = res + `new OperationInstruction(\`\${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset}\`,\`\${this.getASTNodeUID(node)}${lhs.$cstNode?.offset}\`,\`${applyOp}\`,\`\${this.getASTNodeUID(node)}${rhs.$cstNode?.offset}\`,\`${typeName}\`)`
        }
        if(valuedEmission.data != undefined && valuedEmission.data.$type == "BooleanExpression" || valuedEmission.data.$type == "NumberExpression" || valuedEmission.data.$type == "StringExpression"){
            // write a node that sends the value specified 
            res = res  +`new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`,\`${typeName}\`)`+ ","
            res = res  +`new AssignVarInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`,\`${valuedEmission.data.$cstNode?.text}\`,\`${typeName}\`)`+ ","
            res = res  +`new ReturnInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`)`+ ","
            return [res, typeName]
        }
        if(res.length > 0){
            res = res + ","
        }
        res = res  +`new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`,\`${typeName}\`)`+ ","
        res = res+ `new AssignVarInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`,\`\${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset}\`,\`${typeName}\`),`
        res = res  +`new ReturnInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`)`+ ","

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
        res = res+ `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`${typeName}\`),`
        res = res+ `new SetVarFromGlobalInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`\${this.getASTNodeUID(node${prev != undefined ? "."+prev.$refText : ""})}${elem.name}\`,\`${typeName}\`)`
    } 
    else if (elem?.$type == "TemporaryVariable") {
        res = res+ `new CreateVarInstruction(this.getASTNodeUID(node)+\`${data.$cstNode?.offset}\`,\`${typeName}\`),`
        res = res+ `new AssignVarInstruction(this.getASTNodeUID(node)+\`${data.$cstNode?.offset}\`,\`${elem.name}\`,\`${typeName}\`)` 
    }
    else /*if (elem?.$type == "Assignment")*/ {
                res = res+ `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`${typeName}\`),`
        res = res+ `new AssignVarInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`\${node.${data.$cstNode?.text}}\`,\`${typeName}\`)`
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
        let typeName = ""; 
        let rhsType = inferType(action.rhs, new Map());
        typeName = getCPPVariableTypeName(rhsType.$type);
        if (typeName == "unknown") {
            let lhsType = inferType(action.lhs, new Map())
            typeName = getCPPVariableTypeName(lhsType.$type);
        }
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
            actionsstring = actionsstring + sep + `new SetGlobalVarInstruction(\`\${this.getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}\`,\`\${this.getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset}\`,\`${typeName}\`)`
        }else{
            actionsstring = actionsstring + sep + `new SetGlobalVarInstruction(\`\${this.getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}\`,\`\${this.getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset}\`,\`${typeName}\`)`
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


/**
 * writes the preambule for the visitor file of the compiler 
 * @param fileNode the file 
 * @param data the file path data
 */
function writePreambule(fileNode: CompositeGeneratorNode, data: FilePathData) {
    fileNode.append(`
import fs from 'fs';
import { AstNode, Reference, isReference, AstUtils } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, NodeType, Hole, TypedElement, TimerHole, CollectionHole, AddSleepInstruction, AssignVarInstruction, CreateGlobalVarInstruction, CreateVarInstruction, OperationInstruction, ReturnInstruction, SetGlobalVarInstruction, SetVarFromGlobalInstruction, VerifyEqualInstruction} from "ccfg";`, NL)
}


/**
 * writes the basic functions of the front end of the compiler
 * @param fileNode the file
 */
function addUtilFunctions(fileNode: CompositeGeneratorNode,rootTypeName: string) {
    fileNode.append(`
    generateCCFG(root: ${rootTypeName}, debug: boolean = false): CCFG {

        //pass 1: create local CCFGs for all nodes
        console.log("pass 1: create local CCFGs for all nodes")
        let astNodeToLocalCCFG = new Map<AstNode, CCFG>()
        for (let n of AstUtils.streamAst(root)){
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
        let startsTimerHoleNode: Node = new Step(node,NodeType.starts,[new AddSleepInstruction(hole.duration.toString())])
        startsTimerHoleNode.returnType = "void"
        startsTimerHoleNode.functionsNames = [\`init\${startsTimerHoleNode.uid}Timer\`]
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
    `)
}


