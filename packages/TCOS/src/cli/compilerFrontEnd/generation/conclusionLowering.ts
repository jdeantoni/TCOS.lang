import { CompositeGeneratorNode ,NL} from 'langium/generate';
import { EventEmission, MemberCall, RuleOpening, VariableDeclaration } from '../../../language-server/generated/ast.js'; //VariableDeclaration
import { getEventEmissionParticipants, getValuedEventRef } from '../helpers/getterMethodes.js';
import { RuleControlFlow } from '../class/RuleControlFlow.js';
import { TypedElement } from '../class/TypeElement.js';
import { HoleSpecifier } from '../class/HoleSpecifier.js';
import { visitStateModifications, visitValuedEventEmission, visitValuedEventRef } from '../visitor.js';
import { areParticipantsEqualsOrCoupled, isParticipantCollectionBased, isReferenceBased, participantNames } from '../analysis/participants.js';
import { buildEmissionStages, flattenCompositeEmission, getValuedEmissionFromLeaf } from '../emissionTree.js';
import { buildPremiseGuardString } from '../analysis/premiseGuards.js';
import { appendEdgeWithGuard } from './premiseLowering.js';

export function handleRuleConclusion(ruleCF: RuleControlFlow, holes: HoleSpecifier[], file: CompositeGeneratorNode, previousNodeName: string, suppressPremiseGuard: boolean = false) {
    const guardString = suppressPremiseGuard ? "" : buildPremiseGuardString(ruleCF)

    // A state modification, if present, becomes the current node and consumes the premise guard
    // on its entry edge, so downstream emissions must not re-apply it.
    let downstreamGuardString = guardString
    const stateModifications = visitStateModifications(ruleCF, "")
    if (stateModifications.length > 0) {
        file.append(`
        {
        let ${ruleCF.rule.name}StateModificationNode: Node = new Step(node, undefined, [${stateModifications}])
        localCCFG.addNode(${ruleCF.rule.name}StateModificationNode)
        {let e = localCCFG.addEdge(${previousNodeName},${ruleCF.rule.name}StateModificationNode)
        e.guards = [...e.guards, ...[${guardString}]]}
        ${previousNodeName} = ${ruleCF.rule.name}StateModificationNode
        }
    `)
        downstreamGuardString = ""
    }

    // Parameters carried by the premise's valued event references.
    const params = getValuedEventRef(ruleCF.rule.premise.eventExpression).map(ref => visitValuedEventRef(ref)[1])
    const formattedParams = params.map(p => `Object.assign( new TypedElement(), JSON.parse(\`${p.toJSON()}\`))`).join(",")

    // Instructions emitted by the conclusion's leaf emissions, and the resulting return type.
    let eventEmissionActions = ""
    let functionType = "void"
    const leafEmissions = ruleCF.rule.conclusion.eventemissions ? flattenCompositeEmission(ruleCF.rule.conclusion.eventemissions) : []
    for (const emission of leafEmissions) {
        const valuedEmission = getValuedEmissionFromLeaf(emission)
        if (valuedEmission != undefined) {
            const [visitedEmission, returnType] = visitValuedEventEmission(valuedEmission, file)
            functionType = returnType
            eventEmissionActions = eventEmissionActions + visitedEmission
        }
    }

    file.append(`
        ${previousNodeName}.params = [...${previousNodeName}.params, ...[${formattedParams}]]
        ${previousNodeName}.returnType = "${functionType}"
        ${previousNodeName}.functionsNames = [\`\${${previousNodeName}.uid}${ruleCF.rule.name}\`] // overwrite existing name
        ${previousNodeName}.functionsDefs =[...${previousNodeName}.functionsDefs, ...[${eventEmissionActions}]] // GG
    `);

    const conclusion = ruleCF.rule.conclusion.eventemissions
    if (!conclusion) {
        return
    }

    // Lower the conclusion stage by stage: a stage runs its branches in parallel (fork/join when
    // there are several), and consecutive stages are chained sequentially.
    const stages = buildEmissionStages(conclusion)
    let localPrev = previousNodeName
    let emissionCounter = 0
    for (let stageCounter = 0; stageCounter < stages.length; stageCounter++) {
        const stageBranches: { participants: TypedElement[]; emission: EventEmission }[] = []
        for (const emission of stages[stageCounter]) {
            for (const participants of getEventEmissionParticipants(emission)) {
                stageBranches.push({ participants, emission })
            }
        }

        if (stageBranches.length === 0) {
            continue
        }

        if (stageBranches.length === 1) {
            localPrev = appendConclusionBranch(file, ruleCF, holes, localPrev, stageBranches[0].participants, stageBranches[0].emission, downstreamGuardString, emissionCounter++)
            continue
        }

        const forkNodeName = `fork${ruleCF.rule.name}Stage${stageCounter}`
        file.append(`
        let ${forkNodeName}: Node = new Fork(node)
        localCCFG.addNode(${forkNodeName})
        {let e = localCCFG.addEdge(${localPrev},${forkNodeName})
        e.guards = [...e.guards, ...[${downstreamGuardString}]]}
            `, NL)

        const branchEnds: string[] = []
        for (const branch of stageBranches) {
            branchEnds.push(appendConclusionBranch(file, ruleCF, holes, forkNodeName, branch.participants, branch.emission, downstreamGuardString, emissionCounter++))
        }

        const hasNextSequentialStage = stageCounter < stages.length - 1
        if (hasNextSequentialStage) {
            const joinNodeName = `join${ruleCF.rule.name}Stage${stageCounter}`
            file.append(`
        let ${joinNodeName}: Node = new OrJoin(node)
        localCCFG.addNode(${joinNodeName})
                `, NL)
            for (const endNode of branchEnds) {
                file.append(`
        localCCFG.addEdge(${endNode},${joinNodeName})
                    `, NL)
            }
            localPrev = joinNodeName
        }
    }
}

export function appendConclusionBranch(
    file: CompositeGeneratorNode,
    ruleCF: RuleControlFlow,
    holes: HoleSpecifier[],
    fromNodeName: string,
    participants: TypedElement[],
    emission: EventEmission,
    guardString: string,
    emissionCounter: number
): string {
    // Prefer hole routing whenever a matching hole exists.
    if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p, participants))) {
        let holeNodeName = participantNames(participants) + "Hole";
        if (isParticipantCollectionBased(participants)) {
            const participantsNoEvent = participants.filter(p => p.type != "event");
            holeNodeName = participantsNoEvent.slice(0, participants.length - 2).map(p => p.name).join('_') + "Hole";
        }
        appendEdgeWithGuard(file, fromNodeName, holeNodeName, guardString);
        return holeNodeName;
    }

    // Fallback for collection-based routes that are not explicit holes.
    if (isParticipantCollectionBased(participants)) {
        const participantsNoEvent = participants.filter(p => p.type != "event");
        const nodeName = participantsNoEvent.slice(0, participants.length - 2).map(p => p.name).join('_') + "Hole";
        appendEdgeWithGuard(file, fromNodeName, nodeName, guardString);
        return nodeName;
    }

    if (participants[0].isBroadcast) {
        const emissionVarName = `${participants[0].name}EmissionNode${emissionCounter}`;
        const payloadVarName = `\${this.getASTNodeUID(node.${participants[0].name}?.ref??node)}${participants[0].name}Payload`;
        const valuedEmission = getValuedEmissionFromLeaf(emission);
        const payloadValue = valuedEmission != undefined
            ? `\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}`
            : "0";
            
        file.append(`
        let ${emissionVarName} : BroadcastEventEmission = new BroadcastEventEmission(node.${participants[0].name}?.ref??node, "${participants[0].name}")
        localCCFG.addNode(${emissionVarName})
        ${emissionVarName}.functionsNames = [\`\${${emissionVarName}.uid}emit${participants[0].name}\`]
        ${emissionVarName}.functionsDefs = [new CreateVarInstruction(\`${payloadVarName}\`,\`std::any\`), new AssignVarInstruction(\`${payloadVarName}\`,\`${payloadValue}\`,\`std::any\`), new EmitEventInstruction(\`\${this.getASTNodeUID(node.${participants[0].name}?.ref??node)}\`,\`${payloadVarName}\`,true)]
        ${emissionVarName}.returnType = "void"
        `, NL);
        appendEdgeWithGuard(file, fromNodeName, emissionVarName, guardString);
        return emissionVarName;
    }

    // Reference-based participants (for example `<initialState,σ>`) target another concept instance.
    // They must route through the generated hole node, not through a local variable node.
    if (isReferenceBased(participants)) {
        const nodeName = participantNames(participants) + "Hole";
        appendEdgeWithGuard(file, fromNodeName, nodeName, guardString);
        return nodeName;
    }

    let ruleName: string = "";
    if ((participants[0].astNode as VariableDeclaration).$container.$type == "RuleOpening") {
        ruleName = ((participants[0].astNode as VariableDeclaration).$container as RuleOpening).onRule?.$refText ?? "";
    }
    const nodeName = `${participants[0].name + ruleName}Node`;
    appendEdgeWithGuard(file, fromNodeName, nodeName, guardString);
    return nodeName;
}