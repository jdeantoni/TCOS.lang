import { CompositeGeneratorNode, NL } from "langium/generate";
import { RuleOpening, VariableDeclaration } from "../../../language-server/generated/ast.js";
import { HoleSpecifier } from "../class/HoleSpecifier.js";
import { RuleControlFlow } from "../class/RuleControlFlow.js";
import { getCausalReceptionPattern, getPreviousNodeNameFromPremiseParticipants, getSingleParticipantNodeName, getValuedEventRefConstantComparison, getVariableDeclarationCode } from "../helpers/getterMethodes.js";
import { conceptNameToHoles, conceptNameToRulesCF, DEBUG } from "../config.js";
import { handleRuleConclusion } from "./conclusionLowering.js";
import { visitVariableDeclaration } from "../visitor.js";
import { areParticipantsEqualsOrCoupled, isACollectionHole, isATimerHole, isBroadcastReceptionParticipants, participantNames } from "../analysis/participants.js";
import { buildPremiseGuardString } from "../analysis/premiseGuards.js";
import { retrieveStartingRules } from "../controls/ruleControlFlow.js";
import { extractTimerDuration, createTimerHole, createCollectionHole, createSimpleHole } from "./holeLowering.js";
import { createJoinNode, createSimpleBroadcastReceptionNode, createBroadcastReceptionNodeWithAck, addSimpleEdge, addEdgeWithGuard, createChoiceNodeForGuards, connectStartingRuleNonHoleParticipant } from "./premiseLowering.js";

export function generateCreateLocalCCFGFunctions(file: CompositeGeneratorNode, conceptName: string, openedRule: RuleOpening) {
    appendVariableDeclaration(file, conceptName, openedRule);

    const tempHole = conceptNameToHoles.get(conceptName)
    if (tempHole == undefined) {
        throw new Error("holes not found: "+conceptName)
    }
    const holes : HoleSpecifier[] = tempHole;
    const tempRulesCF = conceptNameToRulesCF.get(conceptName)
    if (tempRulesCF == undefined) {
        throw new Error("rulesCF not found: "+conceptName)
    }
    const rulesCF: RuleControlFlow[] = tempRulesCF

    createsHoleNodes(holes, openedRule, file);

    const startingRules = retrieveStartingRules(rulesCF, conceptName);
    if (startingRules.length > 1) {
        throw new Error("multiple starting rules are not supported");
    }

    const startRule: RuleControlFlow | undefined = startingRules[0];

    if (startRule != undefined) {
        handleStartingRule(startRule, conceptName, holes, file);
    }

    for (const ruleCF of rulesCF) {
        if (ruleCF != startRule) {
            handleNonStartingRule(ruleCF, conceptName, holes, file);
        }
    }

    file.append(`
        return localCCFG;
    }`, NL);
}

function handleStartingRule(startRule: RuleControlFlow, conceptName: string, holes: HoleSpecifier[], file: CompositeGeneratorNode) {
    // Handle premise for starting rule if it has multiple participant groups (conjunction/disjunction)
    if (startRule.premiseParticipants.length > 1) {
        const startingPremiseNodeName = getPreviousNodeNameFromPremiseParticipants(startRule, conceptName, holes);
        if(DEBUG) file.append(`        // premise handling for starting rule ${startRule.rule.name}: ${startRule.premiseParticipants.length} participant groups`, NL);
        if(DEBUG) file.append(`        // Creating ${startingPremiseNodeName.endsWith("OrJoinNode")?"OrJoin":"AndJoin"} for conjunction/disjunction`, NL);

        file.append(`
        let ${startingPremiseNodeName}: Node = new ${startingPremiseNodeName.endsWith("OrJoinNode")?"OrJoin":"AndJoin"}(node)
        localCCFG.addNode(${startingPremiseNodeName})\n `);

        for (const participants of startRule.premiseParticipants) {
            const participantName = participantNames(participants);
            if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p, participants))) {
                if (DEBUG) file.append(`             //premise participant is a hole`);
                
                file.append(`
        localCCFG.addEdge(${participantName}Hole,${startingPremiseNodeName})\n`);
            } else {
                // For starting rule, handle broadcast reception or variable declaration events
                connectStartingRuleNonHoleParticipant(participants, file, participantName, startingPremiseNodeName);
            }
        }

        // Call handleRuleConclusion with the premise node as the starting point
        handleRuleConclusion(startRule, holes, file, startingPremiseNodeName);
    } else {
        // No conjunction in premise, use original handling
        handleRuleConclusion(startRule, holes, file, `starts${conceptName}Node`);
    }
}

function handleNonStartingRule(ruleCF: RuleControlFlow, conceptName: string, holes: HoleSpecifier[], file: CompositeGeneratorNode) {
    let premiseNodeName : string= getPreviousNodeNameFromPremiseParticipants(ruleCF, conceptName, holes)
    const allEventValuedComparisons = getValuedEventRefConstantComparison(ruleCF.rule.premise.eventExpression)
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

            createBroadcastReceptionNodeWithAck(file, receptionParticipantName, triggerNodeName);

            premiseNodeName = `${receptionParticipantName}ReceptionNode`;
        } else {
            if(DEBUG) file.append(`        // Creating ${premiseNodeName.endsWith("OrJoinNode")?"OrJoin":"AndJoin"} for conjunction/disjunction`, NL)
            createJoinNode(file, premiseNodeName);

            for (const participants of ruleCF.premiseParticipants) {
                const participantName = participantNames(participants);

                if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p, participants))) {
                    if (DEBUG) file.append(`             //mark a`);
                    addSimpleEdge(file, participantName, premiseNodeName);
                } else {
                    file.append(`               //premise participants in parallel collection but not a hole: ${participants.map(p => p.toJSON())}`);
                    
                    if (isBroadcastReceptionParticipants(participants)) { // explicit broadcast reception in premise
                        createSimpleBroadcastReceptionNode(file, participantName, premiseNodeName);
                    } else { // this is an event from a variable Declaration
                        const participantNodeName = getSingleParticipantNodeName(participants);
                        const edgeGuardString = (routeBooleanPremiseGuardToEntryEdge && !premiseGuardAppliedOnEntryEdge) ? premiseGuardString : "";
                        if (edgeGuardString.length > 0) { premiseGuardAppliedOnEntryEdge = true; }

                        addEdgeWithGuard(file, participantNodeName, premiseNodeName, edgeGuardString);
                    }
                }
            }
        }
    }

    const hasPremiseGuards =
        allEventValuedComparisons.length > 0 ||
        (ruleCF.rule.premise.booleanExpression.length > 0 && !routeBooleanPremiseGuardToEntryEdge)

    if (hasPremiseGuards) {
            premiseNodeName = createChoiceNodeForGuards(ruleCF, file, premiseNodeName);
    }

    handleRuleConclusion(ruleCF, holes, file, premiseNodeName, routeBooleanPremiseGuardToEntryEdge);
}

function createsHoleNodes(holes: HoleSpecifier[], openedRule: RuleOpening, file: CompositeGeneratorNode) {
    for (const h of holes) {
        if (isATimerHole(h.startingParticipants)) {
            const duration = extractTimerDuration(h, openedRule);
            createTimerHole(file, h, duration);
        }
        else if (isACollectionHole(h)) {
            createCollectionHole(file, h);
        }
        else {
            createSimpleHole(file, h);
        }
    }
}

function appendVariableDeclaration(file: CompositeGeneratorNode, conceptName: string, openedRule: RuleOpening) {
    file.append(`
    /**
     * returns the local CCFG of the ${conceptName} node
     * @param a ${conceptName} node 
     * @returns the local CCFG (with holes)
     */
    create${conceptName}LocalCCFG(node: ${conceptName}): CCFG {`);
    file.append(`
        let localCCFG = new CCFG()
    `);
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
}