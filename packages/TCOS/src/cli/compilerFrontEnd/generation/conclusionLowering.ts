import { CompositeGeneratorNode ,NL} from 'langium/generate';
import { EventEmission, MemberCall, RuleOpening, VariableDeclaration } from '../../../language-server/generated/ast.js'; //VariableDeclaration
import { getEventEmissionParticipants, getValuedEventRef } from '../helpers/getterMethodes.js';
import { RuleControlFlow } from '../class/RuleControlFlow.js';
import { TypedElement } from '../class/TypeElement.js';
import { HoleSpecifier } from '../class/HoleSpecifier.js';
import { visitStateModifications, visitValuedEventEmission, visitValuedEventRef } from '../visitor.js';
import { areParticipantsEqualsOrCoupled, isParticipantCollectionBased, isReferenceBased } from '../analysis/participants.js';
import { buildEmissionStages, flattenCompositeEmission, getValuedEmissionFromLeaf } from '../emissionTree.js';
import { buildPremiseGuardString } from '../analysis/premiseGuards.js';

export function handleRuleConclusion(ruleCF: RuleControlFlow, holes: HoleSpecifier[], file: CompositeGeneratorNode, previousNodeName: string, suppressPremiseGuard: boolean = false) {
    let actionsstring = ""
    actionsstring = visitStateModifications(ruleCF, actionsstring);
    const guardString = suppressPremiseGuard ? "" : buildPremiseGuardString(ruleCF)
    let downstreamGuardString = guardString
    
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
        // Guard already applied on the edge to the state-modification node.
        downstreamGuardString = ""
    }

    const params : TypedElement[] = []
    const allValuedEventRef = getValuedEventRef(ruleCF.rule.premise.eventExpression)
    let sep = ""
    for(const valuedEventRef of allValuedEventRef){
        const [actions, param] = visitValuedEventRef(valuedEventRef)
        actionsstring = actionsstring + sep + actions   
        params.push(param)
        sep = ","
    }

    let eventEmissionActions = ""
    let functionType = "void"
    const _allLeafEmissions = ruleCF.rule.conclusion.eventemissions ? flattenCompositeEmission(ruleCF.rule.conclusion.eventemissions) : []
    for(const emission of _allLeafEmissions){
        const valuedEmission = getValuedEmissionFromLeaf(emission)
        if(valuedEmission != undefined){
            const [visitedEmission, returnType] =  visitValuedEventEmission(valuedEmission,file)
            functionType = returnType
            eventEmissionActions = eventEmissionActions + visitedEmission
        }
    }
    let formattedParams = ""
    sep = ""
    for(const p of params){
        formattedParams = formattedParams+ sep + `Object.assign( new TypedElement(), JSON.parse(\`${p.toJSON()}\`))`
        sep = ","
    }

    file.append(`
        ${previousNodeName}.params = [...${previousNodeName}.params, ...[${formattedParams}]]
        ${previousNodeName}.returnType = "${functionType}"
        ${previousNodeName}.functionsNames = [\`\${${previousNodeName}.uid}${ruleCF.rule.name}\`] // overwrite existing name
        ${previousNodeName}.functionsDefs =[...${previousNodeName}.functionsDefs, ...[${eventEmissionActions}]] // GG
    `);

    // Generic conclusion processing preserving seq/par structure by stages.
    // Each stage is a list of parallel emissions; stages are chained sequentially.
    const conclusion = ruleCF.rule.conclusion.eventemissions;
    if (!conclusion) {
        return;
    }

    const stages = buildEmissionStages(conclusion);
    let localPrev = previousNodeName;
    let stageCounter = 0;
    let emissionCounter = 0;

    for (const stage of stages) {
        // Expand a stage to participant branches (an emission can theoretically map to several branches).
        const stageBranches: { participants: TypedElement[]; emission: EventEmission }[] = [];
        for (const emission of stage) {
            for (const participants of getEventEmissionParticipants(emission)) {
                stageBranches.push({ participants, emission });
            }
        }
        if (stageBranches.length === 0) {
            stageCounter++;
            continue;
        }

        if (stageBranches.length === 1) {
            localPrev = appendConclusionBranch(file, ruleCF, holes, localPrev, stageBranches[0].participants, stageBranches[0].emission, downstreamGuardString, emissionCounter++);
        } else {
            const forkNodeName = `fork${ruleCF.rule.name}Stage${stageCounter}`;
            file.append(`
        let ${forkNodeName}: Node = new Fork(node)
        localCCFG.addNode(${forkNodeName})
        {let e = localCCFG.addEdge(${localPrev},${forkNodeName})
        e.guards = [...e.guards, ...[${downstreamGuardString}]]}
            `, NL);

            const branchEnds: string[] = [];
            for (const branch of stageBranches) {
                const endNode = appendConclusionBranch(file, ruleCF, holes, forkNodeName, branch.participants, branch.emission, downstreamGuardString, emissionCounter++);
                branchEnds.push(endNode);
            }

            const hasNextSequentialStage = stageCounter < stages.length - 1;
            if (hasNextSequentialStage) {
                const joinNodeName = `join${ruleCF.rule.name}Stage${stageCounter}`;
                file.append(`
        let ${joinNodeName}: Node = new OrJoin(node)
        localCCFG.addNode(${joinNodeName})
                `, NL);
                for (const endNode of branchEnds) {
                    file.append(`
        localCCFG.addEdge(${endNode},${joinNodeName})
                    `, NL);
                }
                localPrev = joinNodeName;
            }
        }

        stageCounter++;
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
        let holeNodeName = participants.filter(p => p.type != "event").map(p => p.name).join('_') + "Hole";
        if (isParticipantCollectionBased(participants)) {
            const participantsNoEvent = participants.filter(p => p.type != "event");
            holeNodeName = participantsNoEvent.slice(0, participants.length - 2).map(p => p.name).join('_') + "Hole";
        }
        file.append(`
        {let e = localCCFG.addEdge(${fromNodeName},${holeNodeName})
        e.guards = [...e.guards, ...[${guardString}]]}
        `, NL);
        return holeNodeName;
    }

    // Fallback for collection-based routes that are not explicit holes.
    if (isParticipantCollectionBased(participants)) {
        const participantsNoEvent = participants.filter(p => p.type != "event");
        const nodeName = participantsNoEvent.slice(0, participants.length - 2).map(p => p.name).join('_') + "Hole";
        file.append(`
        {let e = localCCFG.addEdge(${fromNodeName},${nodeName})
        e.guards = [...e.guards, ...[${guardString}]]}
        `, NL);
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
        {let e = localCCFG.addEdge(${fromNodeName},${emissionVarName})
        e.guards = [...e.guards, ...[${guardString}]]}
        `, NL);
        return emissionVarName;
    }

    // Reference-based participants (for example `<initialState,σ>`) target another concept instance.
    // They must route through the generated hole node, not through a local variable node.
    if (isReferenceBased(participants)) {
        const nodeName = participants.filter(p => p.type != "event").map(p => p.name).join('_') + "Hole";
        file.append(`
        {let e = localCCFG.addEdge(${fromNodeName},${nodeName})
        e.guards = [...e.guards, ...[${guardString}]]}
        `, NL);
        return nodeName;
    }

    let ruleName: string = "";
    if ((participants[0].astNode as VariableDeclaration).$container.$type == "RuleOpening") {
        ruleName = ((participants[0].astNode as VariableDeclaration).$container as RuleOpening).onRule?.$refText ?? "";
    }
    const nodeName = `${participants[0].name + ruleName}Node`;
    file.append(`
        {let e = localCCFG.addEdge(${fromNodeName},${nodeName})
        e.guards = [...e.guards, ...[${guardString}]]}
    `, NL);
    return nodeName;
}