import { CompositeGeneratorNode, NL } from "langium/generate";
import { RuleOpening, VariableDeclaration } from "../../../language-server/generated/ast.js";
import { CollectionHoleSpecifier, HoleSpecifier } from "../class/HoleSpecifier.js";
import { RuleControlFlow } from "../class/RuleControlFlow.js";
import { getCausalReceptionPattern, getPreviousNodeNameFromPremiseParticipants, getSingleParticipantNodeName, getValuedEventRefConstantComparison, getVariableDeclarationCode } from "../helpers/getterMethodes.js";
import { conceptNameToHoles, conceptNameToRulesCF, DEBUG } from "../config.js";
import { handleRuleConclusion } from "./conclusionLowering.js";
import { visitVariableDeclaration } from "../visitor.js";
import { areParticipantsEqualsOrCoupled, isACollectionHole, isATimerHole, isBroadcastReceptionParticipants, isReferenceBased } from "../analysis/participants.js";
import { buildPremiseGuardString } from "../analysis/premiseGuards.js";
import { retrieveStartingRules } from "../controls/ruleControlFlow.js";

export function generateCreateLocalCCFGFunctions(file: CompositeGeneratorNode, conceptName: string, openedRule: RuleOpening) {
    file.append(`
    /**
     * returns the local CCFG of the ${conceptName} node
     * @param a ${conceptName} node 
     * @returns the local CCFG (with holes)
     */
    create${conceptName}LocalCCFG(node: ${conceptName}): CCFG {`);
    file.append(`
        let localCCFG = new CCFG()
    `)
    visitVariableDeclaration(openedRule.runtimeState as VariableDeclaration[], file);
    file.append(`
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
            if (isReferenceBased(h.startingParticipants)){
                refNode = refNode + ".map(t => t.ref).filter(ref => ref !== undefined).map(ref => ref as AstNode)"
            }
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

    const startingRules = retrieveStartingRules(rulesCF, conceptName);
    if (startingRules.length > 1) {
        throw new Error("multiple starting rules are not supported");
    }

    let startRule: RuleControlFlow | undefined = startingRules[0];
    
    if (startRule != undefined) {
        // Handle premise for starting rule if it has multiple participant groups (conjunction/disjunction)
        if (startRule.premiseParticipants.length > 1) {
            let startingPremiseNodeName = getPreviousNodeNameFromPremiseParticipants(startRule, conceptName, holes);
            if(DEBUG) file.append(`        // premise handling for starting rule ${startRule.rule.name}: ${startRule.premiseParticipants.length} participant groups`, NL);
            if(DEBUG) file.append(`        // Creating ${startingPremiseNodeName.endsWith("OrJoinNode")?"OrJoin":"AndJoin"} for conjunction/disjunction`, NL);
            
            file.append(`
        let ${startingPremiseNodeName}: Node = new ${startingPremiseNodeName.endsWith("OrJoinNode")?"OrJoin":"AndJoin"}(node)
        localCCFG.addNode(${startingPremiseNodeName})\n `);
            
            for (let participants of startRule.premiseParticipants) {
                if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p, participants))) {
                    if (DEBUG) file.append(`             //premise participant is a hole`);
                    file.append(`
        localCCFG.addEdge(${participants.filter(p => p.type != "event").map(p => p.name).join('_')}Hole,${startingPremiseNodeName})\n`);
                } else {
                    // For starting rule, handle broadcast reception or variable declaration events
                    if (isBroadcastReceptionParticipants(participants)) {
                        file.append(`
        let ${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode : BroadcastEventReception = new BroadcastEventReception(node.${participants.filter(p => p.type != "event").map(p => p.name).join('_')}?.ref??node, "${participants.filter(p => p.type != "event").map(p => p.name).join('_')}")
        localCCFG.addNode(${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode)
        ${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode.functionsNames = [\`\${${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode.uid}receive${participants.filter(p => p.type != "event").map(p => p.name).join('_')}\`]
        //removed from below: , new AckEventInstruction(\`\${this.getASTNodeUID(node.${participants.filter(p => p.type != "event").map(p => p.name).join('_')}?.ref??node)}Token
        ${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode.functionsDefs = [new WaitEventInstruction(\`\${this.getASTNodeUID(node.${participants.filter(p => p.type != "event").map(p => p.name).join('_')}?.ref??node)}\`,\`\${this.getASTNodeUID(node.${participants.filter(p => p.type != "event").map(p => p.name).join('_')}?.ref??node)}${participants.filter(p => p.type != "event").map(p => p.name).join('_')}Payload\`)\`)]
        ${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode.returnType = "void"
        localCCFG.addEdge(${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode,${startingPremiseNodeName})
        `);
                    } else {
                        let ruleName : string = ""
                        if ((participants[0].astNode as VariableDeclaration).$container.$type == "RuleOpening") {
                            ruleName = ((participants[0].astNode as VariableDeclaration).$container as RuleOpening).onRule?.$refText ?? ""
                        }
                        file.append(`
        localCCFG.addEdge(${participants[0].name+ruleName}Node,${startingPremiseNodeName})
        `);
                    }
                }
            }
            
            // Call handleRuleConclusion with the premise node as the starting point
            handleRuleConclusion(startRule, holes, file, startingPremiseNodeName);
        } else {
            // No conjunction in premise, use original handling
            handleRuleConclusion(startRule, holes, file, `starts${conceptName}Node`);
        }
    }


    for (let ruleCF of rulesCF) {
        if (ruleCF != startRule) {
            let premiseNodeName : string= getPreviousNodeNameFromPremiseParticipants(ruleCF, conceptName, holes)
            let allEventValuedComparisons = getValuedEventRefConstantComparison(ruleCF.rule.premise.eventExpression)
            const routeBooleanPremiseGuardToEntryEdge =
                ruleCF.premiseParticipants.length > 1 &&
                ruleCF.rule.premise.booleanExpression.length > 0 &&
                allEventValuedComparisons.length == 0;
            const premiseGuardString = buildPremiseGuardString(ruleCF)
            let premiseGuardAppliedOnEntryEdge = false
            //manage premise (most of the time the premise's node is already existing since a hole. (but sometimes from event in varDeclaration))
            if(DEBUG) file.append(`        // premise handling for rule ${ruleCF.rule.name}: ${ruleCF.premiseParticipants.length} participant groups`, NL)

            if (ruleCF.premiseParticipants.length > 1) {
                const causalReceptionPattern = getCausalReceptionPattern(ruleCF, holes);
                if (causalReceptionPattern != undefined) {
                    if (DEBUG) file.append(`        // Causal lowering for conjunction: trigger event then broadcast reception`, NL);
                    const receptionParticipantName = causalReceptionPattern.receptionParticipants.filter(p => p.type != "event").map(p => p.name).join('_');
                    const triggerNodeName = getSingleParticipantNodeName(causalReceptionPattern.triggerParticipants);
                    file.append(`
        let ${receptionParticipantName}ReceptionNode : BroadcastEventReception = new BroadcastEventReception(node.${receptionParticipantName}?.ref??node, "${receptionParticipantName}")
        localCCFG.addNode(${receptionParticipantName}ReceptionNode)
        ${receptionParticipantName}ReceptionNode.functionsNames = [\`\${${receptionParticipantName}ReceptionNode.uid}receive${receptionParticipantName}\`]
        ${receptionParticipantName}ReceptionNode.functionsDefs = [new WaitEventInstruction(\`\${this.getASTNodeUID(node.${receptionParticipantName}?.ref??node)}\`,\`\${this.getASTNodeUID(node.${receptionParticipantName}?.ref??node)}${receptionParticipantName}Payload\`), new AckEventInstruction(\`\${this.getASTNodeUID(node.${receptionParticipantName}?.ref??node)}Token\`)]
        ${receptionParticipantName}ReceptionNode.returnType = "void"
        ${triggerNodeName ? `localCCFG.addEdge(${triggerNodeName},${receptionParticipantName}ReceptionNode)` : `// no trigger node identified for causal reception`}
        `);
                    premiseNodeName = `${receptionParticipantName}ReceptionNode`;
                } else {
                    if(DEBUG) file.append(`        // Creating ${premiseNodeName.endsWith("OrJoinNode")?"OrJoin":"AndJoin"} for conjunction/disjunction`, NL)
                    file.append(`
        let ${premiseNodeName}: Node = new ${premiseNodeName.endsWith("OrJoinNode")?"OrJoin":"AndJoin"}(node)
        localCCFG.addNode(${premiseNodeName})\n `);
                    for (let participants of ruleCF.premiseParticipants) {
                        if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p, participants))) {
                            if (DEBUG) file.append(`             //mark a`);
                            file.append(`
        localCCFG.addEdge(${participants.filter(p => p.type != "event").map(p => p.name).join('_')}Hole,${premiseNodeName})\n`);
                        } else {
                            file.append(`               //premise participants in parallel collection but not a hole: ${participants.map(p => p.toJSON())}`);
                            if (isBroadcastReceptionParticipants(participants)) { // explicit broadcast reception in premise
                                file.append(`
        let ${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode : BroadcastEventReception = new BroadcastEventReception(node.${participants.filter(p => p.type != "event").map(p => p.name).join('_')}?.ref??node, "${participants.filter(p => p.type != "event").map(p => p.name).join('_')}")
        localCCFG.addNode(${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode)
        ${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode.functionsNames = [\`\${${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode.uid}receive${participants.filter(p => p.type != "event").map(p => p.name).join('_')}\`]
        ${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode.functionsDefs = [new WaitEventInstruction(\`\${this.getASTNodeUID(node.${participants.filter(p => p.type != "event").map(p => p.name).join('_')}?.ref??node)}\`,\`\${this.getASTNodeUID(node.${participants.filter(p => p.type != "event").map(p => p.name).join('_')}?.ref??node)}${participants.filter(p => p.type != "event").map(p => p.name).join('_')}Payload\`), new AckEventInstruction(\`\${this.getASTNodeUID(node.${participants.filter(p => p.type != "event").map(p => p.name).join('_')}?.ref??node)}Token\`)]
        ${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode.returnType = "void"
        localCCFG.addEdge(${participants.filter(p => p.type != "event").map(p => p.name).join('_')}ReceptionNode,${premiseNodeName})
        `);
                            }else{ // this is an event from a variable Declaration
                                const participantNodeName = getSingleParticipantNodeName(participants);
                                const edgeGuardString = (routeBooleanPremiseGuardToEntryEdge && !premiseGuardAppliedOnEntryEdge) ? premiseGuardString : "";
                                if (edgeGuardString.length > 0) {
                                    premiseGuardAppliedOnEntryEdge = true;
                                }
                                file.append(`
        ${participantNodeName ? `{
        let premiseParticipantSource = ${participantNodeName}
        if(${participantNodeName}.outputEdges.filter(e => e.to.getType() == "Choice").length == 1){
            premiseParticipantSource = ${participantNodeName}.outputEdges.filter(e => e.to.getType() == "Choice")[0].to
        }
        {let e = localCCFG.addEdge(premiseParticipantSource,${premiseNodeName})
        e.guards = [...e.guards, ...[${edgeGuardString}]]}
        }` : `// no participant node identified`}
        `);
                            }
                        }
                    }
                }
            }


            let hasPremiseGuards =
                allEventValuedComparisons.length > 0 ||
                (ruleCF.rule.premise.booleanExpression.length > 0 && !routeBooleanPremiseGuardToEntryEdge)
            
            if (hasPremiseGuards) {
                    let refPath = ruleCF.premiseParticipants[0].filter(p => p.type != "event").map(p => p.name).join('.')
                    let refNode = refPath.length > 0 ? `node.${refPath}` : `node`
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

            handleRuleConclusion(ruleCF, holes, file, premiseNodeName, routeBooleanPremiseGuardToEntryEdge);

        }
    }


    file.append(`
        return localCCFG;
    }`, NL);
}
