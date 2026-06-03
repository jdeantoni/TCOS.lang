import { CompositeGeneratorNode, NL} from "langium/generate";
import { CollectionRuleSync, MemberCall, NaryEventExpression, RuleOpening, ValuedEventEmission } from "../../language-server/generated/ast.js"; //VariableDeclaration
import { TypedElement } from "./class/TypeElement.js";
import { RuleControlFlow } from "./class/RuleControlFlow.js";
import { CollectionHoleSpecifier, HoleSpecifier } from "./class/HoleSpecifier.js";
import { DEBUG } from "./config.js";
import { getEventEmissionParticipants, getEventSynchronisationParticipants, getValuedEventRef, getValuedEventRefConstantComparison } from "./getterMethodes.js";
import { visitStateModifications, visitValuedEventEmission, visitValuedEventRef, visitValuedEventRefComparison } from "./visitor.js";

export function isReferenceBased(participants: TypedElement[]): boolean {
    return participants.some(p => p.type != undefined && p.type[0] == "[");
}

export function handleRuleConclusion(ruleCF: RuleControlFlow, holes: HoleSpecifier[], file: CompositeGeneratorNode, previousNodeName: string) {
    let actionsstring = "";
    actionsstring = visitStateModifications(ruleCF, actionsstring);
    let guardString = "";
    const allEventValuedComparisons = getValuedEventRefConstantComparison(ruleCF.rule.premise.eventExpression);
    let sep = "";
    for(const comparison of allEventValuedComparisons){
        guardString = guardString + sep + visitValuedEventRefComparison(comparison);
        sep =",";
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
    `);
    }

    const params : TypedElement[] = [];
    const allValuedEventRef = getValuedEventRef(ruleCF.rule.premise.eventExpression);
    sep = "";
    for(const valuedEventRef of allValuedEventRef){
        const [actions, param] = visitValuedEventRef(valuedEventRef);
        actionsstring = actionsstring + sep + actions;   
        params.push(param);
        sep = ",";
    }

    let eventEmissionActions = "";
    let functionType = "void";
    for(const emission of ruleCF.rule.conclusion.eventemissions){
        if(emission.$type == "ValuedEventEmission"){
            const [visitedEmission, returnType] =  visitValuedEventEmission(emission as ValuedEventEmission,file);
            functionType = returnType;
            eventEmissionActions = eventEmissionActions + visitedEmission;
        }
    }
    let formattedParams = "";
    sep = "";
    for(const p of params){
        formattedParams = formattedParams+ sep + `Object.assign( new TypedElement(), JSON.parse(\`${p.toJSON()}\`))`;
        sep = ",";
    }

    file.append(`
        ${previousNodeName}.params = [...${previousNodeName}.params, ...[${formattedParams}]]
        ${previousNodeName}.returnType = "${functionType}"
        ${previousNodeName}.functionsNames = [\`\${${previousNodeName}.uid}${ruleCF.rule.name}\`] //overwrite existing name
        ${previousNodeName}.functionsDefs =[...${previousNodeName}.functionsDefs, ...[${eventEmissionActions}]] //GG
    `);


    if (ruleCF.conclusionParticipants.length == 1 && isRuleConclusionCollectionBased(ruleCF) == false) {
        const participants = ruleCF.conclusionParticipants[0];
        if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p,participants))) {
            if(DEBUG) file.append("            //mark 0");
            file.append(`
        {let e = localCCFG.addEdge(${previousNodeName},${participants.filter(p=>p.type != "event").map(p => p.name?.replace(/\(\)/,"")).join("_")}Hole)
        e.guards = [...e.guards, ...[${guardString}]]}
            `);
        } else {
            if(DEBUG) file.append(`            //mark 1 ${participants.map(p=>p.toJSON())}`);
            file.append(`
        {let e = localCCFG.addEdge(${previousNodeName},${participants.filter(p=>p.type == "event").map(p => p.name).join("_")}${(ruleCF.rule.$container as RuleOpening)?.onRule?.ref?.name}Node)
        e.guards = [...e.guards, ...[${guardString}]]}
        `);
        console.log(`${participants.filter(p=>p.type == "event").map(p => p.name).join("_")}${(ruleCF.rule.$container as RuleOpening)?.onRule?.ref?.name}Node`);
    
        }
    }
    //Several participants in the conclusion
    
        //collection based conclusion are handles as special holes
    if (isRuleConclusionCollectionBased(ruleCF)) {
        let nodeName : string = "";
        if (ruleCF.rule.premise.eventExpression.$type == "NaryEventExpression") { //parallel sync premise on collection
            nodeName = ruleCF.conclusionParticipants[0].filter(p => p.type != "event").map(p => p.name).join("_") + "Hole";
        }

        //sequential collection based premise
        const participantsNoEvent = ruleCF.conclusionParticipants[0].filter(p => p.type != "event");
        nodeName =  participantsNoEvent.slice(0,ruleCF.conclusionParticipants[0].length-2).map(p => p.name).join("_") + "Hole";
        if(DEBUG) file.append("            //mark 1.5");
        file.append(`
        localCCFG.addEdge(${previousNodeName},${nodeName})
        `);
    }

    if (ruleCF.rule.conclusion.eventEmissionOperator == ";") {
        for (const participants of ruleCF.conclusionParticipants) {
            if (holes.map(h => h.startingParticipants).some(p => areParticipantsEquals(p,participants))) {
                if(DEBUG) file.append("                    //mark 2");
                file.append(`
        localCCFG.addEdge(${previousNodeName},${participants.filter(p=>p.type != "event").map(p => p.name).join("_")}Hole)
                    ${previousNodeName} = ${participants.filter(p=>p.type != "event").map(p => p.name).join("_")}Hole
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
        for (const participants of ruleCF.conclusionParticipants) {
            if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p,participants))) {
                if(DEBUG) file.append("                    //mark 3");
                file.append(`
        localCCFG.addEdge(fork${ruleCF.rule.name}Node,${participants.filter(p=>p.type != "event").map(p => p.name).join("_")}Hole)
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
    const res: HoleSpecifier[] = [];
    for (let i = 0; i < rulesCF.length; i++) {
        const currentRule = rulesCF[i];
        const currentConclusionParticipants = currentRule.conclusionParticipants;
        for (let j = 0; j < rulesCF.length; j++) {
            const anotherRule = rulesCF[j];
            const anotherRulePremiseParticipants = anotherRule.premiseParticipants;

            for(const conclusionP of currentConclusionParticipants){
                for(const premiseP of anotherRulePremiseParticipants){
                    if(areParticipantsCoupled(conclusionP, premiseP)){
                        if(conclusionP.some(te => te.isCollection)){
                            const holeSpecifier = new CollectionHoleSpecifier(conclusionP, premiseP);
                            holeSpecifier.isSequential = currentRule.rule.conclusion.eventemissions[0].$type == "CollectionRuleSync" && (currentRule.rule.conclusion.eventemissions[0] as CollectionRuleSync).order == "sequential";
                            holeSpecifier.parallelSyncPolicy = (anotherRule.rule.premise.eventExpression.$type == "NaryEventExpression") ?(anotherRule.rule.premise.eventExpression as NaryEventExpression).policy.operator+"" : "undefined";
                            if(res.map(h => h.startingParticipants).some(p => areParticipantsEquals(p, holeSpecifier.startingParticipants)) == false){
                                res.push(holeSpecifier);
                            }
                        }
                        else{
                            const holeSpecifier = new HoleSpecifier(conclusionP, premiseP);
                            if(res.map(h => h.startingParticipants).some(p => areParticipantsEquals(p, holeSpecifier.startingParticipants)) == false){
                                res.push(holeSpecifier);
                            }
                        }                        
                    }
                }
            } 
        }
    }
    return res;
}

/**
 * traverse all the rules and identifies the holes and semi. A hole is a participant that is the conclusion of a rule and the premise of another rule. A semi hole is only started in a conclusion
 * 
 * @param rulesCF: the list of rules of the opened concept 
 * @returns the list of holes and semi holes, given as a list of TypedElements (the participants of a memberCall) (the ending event is not relevant)
 */
export function identifiesHolesAndSemiHoles(rulesCF: RuleControlFlow[]): HoleSpecifier[] {
    const res: HoleSpecifier[] = identifiesHoles(rulesCF);
    for (let i = 0; i < rulesCF.length; i++) {
        const currentRule = rulesCF[i];
        const currentConclusionParticipants = currentRule.conclusionParticipants;
        for (const p of currentConclusionParticipants) {
            if (p[p.length - 1].name == "starts") {
                if (!res.some(h => areParticipantsEquals(h.startingParticipants, p))) {
                    res.push(new HoleSpecifier(p, undefined));
                }
            }
        }
    }
    return res;
}

function areParticipantsEquals(p1: TypedElement[], p2: TypedElement[]): boolean {
    if(p1.length != p2.length){
        return false;
    }
    for(let i = 0; i < p1.length; i++){
        if(p1[i].name != p2[i].name || p1[i].type != p2[i].type){
            return false;
        }
    }
    return true;
}

function areParticipantsCoupled(p1: TypedElement[], p2: TypedElement[]): boolean {
    
    if(isParticipantCollectionBased(p1) && isParticipantCollectionBased(p2)){
        //sanitize collection based participants
        const p1Copy = [];
        for(const p of p1){
            if(p.isCollection){
                p1Copy.push(p);
                break;
            }
            p1Copy.push(p);
        }
        p1Copy.push(p1[p1.length-1]);
        p1= p1Copy;
        const p2Copy = [];
        for(const p of p2){
            if(p.isCollection){
                p2Copy.push(p);
                break;
            }
            p2Copy.push(p);
        }
        p2Copy.push(p2[p2.length-1]);
        p2 = p2Copy;
    }


    if(p1.length != p2.length){
        return false;
    }
    for(let i = 0; i < p1.length-1; i++){
        if(p1[i].name != p2[i].name || p1[i].type != p2[i].type){
            return false;
        }
    }
    if( p1.length > 1 &&
        ((p1[p1.length-1].name == "starts" &&  p2[p2.length-1].name == "terminates")
        ||
        (p1[p1.length-1].name == "terminates" &&  p2[p2.length-1].name == "starts"))
    ){
        return true;
    }else{
        return false;
    }
}

export function areParticipantsEqualsOrCoupled(p1: TypedElement[], p2: TypedElement[]): boolean {
    if(p1.length != p2.length){
        return false;
    }
    for(let i = 0; i < p1.length-1; i++){
        if(p1[i].name != p2[i].name || p1[i].type != p2[i].type){
            return false;
        }
    }
    
    if(p1[p1.length-1].type == "event" &&  p2[p2.length-1].type == "event"){
        return true;
    }

    return false;
 
}

/**  retrieves the starting rule of the concept
 * @param rulesCF: the rule to be analyzed
 * */
export function retrieveStartingRules(rulesCF: RuleControlFlow[]) {
    const startingRule = [];
    for (const r of rulesCF) {
        for (const participants of r.premiseParticipants) {
            for (const p of participants) {
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
    for (const participant of ruleCF.conclusionParticipants) {
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
export function extractRuleControlFlowsFromRules(fileNode: CompositeGeneratorNode, openedRule: RuleOpening): RuleControlFlow[] {
    const res: RuleControlFlow[] = [];
    for (const rwr of openedRule.rules) {
        if (rwr.$type == "RWRule") {

            if(DEBUG) fileNode.append(`// rule ${rwr.name}`, NL);
            const premiseEventParticipants: TypedElement[][] = getEventSynchronisationParticipants(rwr.premise.eventExpression);
            if(DEBUG) fileNode.append(`   //premise: ${premiseEventParticipants.map(pa => pa.map(p => p.name + ":" + p.type + (p.isCollection ? "[]" : ""))).join("\n\t//")}`, NL);
            let conclusionEventParticipants: TypedElement[][] = [];
            for (const emission of rwr.conclusion.eventemissions) {
                conclusionEventParticipants = [...conclusionEventParticipants, ...getEventEmissionParticipants(emission)];
            }
            if(DEBUG) fileNode.append(`   //conclusion: ${conclusionEventParticipants.map(pa => pa.map(p => p.name + ":" + p.type + (p.isCollection ? "[]" : ""))).join("\n\t//")}`, NL);
            const ruleControlFlow = new RuleControlFlow(rwr, premiseEventParticipants, conclusionEventParticipants);
            res.push(ruleControlFlow);
        }
    }
    return res;
}

export function createVariableFromMemberCall(data: MemberCall, typeName: string): string {
    let res: string = "";
    const prev = (data.previous as MemberCall)?.element;
    const elem = data.element?.ref;
    
    if (elem == undefined) {
        return res;
    }

    if (elem?.$type == "VariableDeclaration") {
        res = res+ `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`${typeName}\`),`;
        res = res+ `new SetVarFromGlobalInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`\${this.getASTNodeUID(node${prev != undefined ? "."+prev.$refText : ""})}${elem.name}\`,\`${typeName}\`)`;
    } 
    else if (elem?.$type == "TemporaryVariable") {
        res = res+ `new CreateVarInstruction(this.getASTNodeUID(node)+\`${data.$cstNode?.offset}\`,\`${typeName}\`),`;
        res = res+ `new AssignVarInstruction(this.getASTNodeUID(node)+\`${data.$cstNode?.offset}\`,\`${elem.name}\`,\`${typeName}\`)`; 
    }
    else /*if (elem?.$type == "Assignment")*/ {
                res = res+ `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`${typeName}\`),`;
        res = res+ `new AssignVarInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`\${node.${data.$cstNode?.text}}\`,\`${typeName}\`)`;
    }
    return res;
}

/**
 * determines if the participant (TypedElement[]) is a Timer or not
 * @param p a list of typed elements
 * @returns 
 */
export function isATimerHole(p: TypedElement[]): boolean {
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
export function isACollectionHole(h: HoleSpecifier): boolean {
    return isParticipantCollectionBased(h.startingParticipants);
}

export function isParticipantCollectionBased(participant: TypedElement[]): boolean {
    for (const p of participant) {
        if (p.isCollection) {
            return true;
        }
    }
    return false;
}