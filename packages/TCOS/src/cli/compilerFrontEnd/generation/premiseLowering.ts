import { CompositeGeneratorNode } from "langium/generate";
import { RuleControlFlow } from "../class/RuleControlFlow.js";
import { TypedElement } from "../class/TypeElement.js";
import { RuleOpening, VariableDeclaration } from "../../../language-server/generated/ast.js";
import { isBroadcastReceptionParticipants } from "../analysis/participants.js";

export function createJoinNode(file: CompositeGeneratorNode, premiseNodeName: string) {
    file.append(`
        let ${premiseNodeName}: Node = new ${premiseNodeName.endsWith("OrJoinNode") ? "OrJoin" : "AndJoin"}(node)
        localCCFG.addNode(${premiseNodeName})\n `);
}

export function createSimpleBroadcastReceptionNode(file: CompositeGeneratorNode, participantName: string, premiseNodeName: string) {
    file.append(`
        let ${participantName}ReceptionNode : BroadcastEventReception = new BroadcastEventReception(node.${participantName}?.ref??node, "${participantName}")
        localCCFG.addNode(${participantName}ReceptionNode)
        ${participantName}ReceptionNode.functionsNames = [\`\${${participantName}ReceptionNode.uid}receive${participantName}\`]
        ${participantName}ReceptionNode.functionsDefs = [new WaitEventInstruction(\`\${this.getASTNodeUID(node.${participantName}?.ref??node)}\`,\`\${this.getASTNodeUID(node.${participantName}?.ref??node)}${participantName}Payload\`), new AckEventInstruction(\`\${this.getASTNodeUID(node.${participantName}?.ref??node)}Token\`)]
        ${participantName}ReceptionNode.returnType = "void"
        localCCFG.addEdge(${participantName}ReceptionNode,${premiseNodeName})
        `);
}

export function createBroadcastReceptionNodeWithAck(file: CompositeGeneratorNode, receptionParticipantName: string, triggerNodeName: string | undefined) {
    file.append(`
        let ${receptionParticipantName}ReceptionNode : BroadcastEventReception = new BroadcastEventReception(node.${receptionParticipantName}?.ref??node, "${receptionParticipantName}")
        localCCFG.addNode(${receptionParticipantName}ReceptionNode)
        ${receptionParticipantName}ReceptionNode.functionsNames = [\`\${${receptionParticipantName}ReceptionNode.uid}receive${receptionParticipantName}\`]
        ${receptionParticipantName}ReceptionNode.functionsDefs = [new WaitEventInstruction(\`\${this.getASTNodeUID(node.${receptionParticipantName}?.ref??node)}\`,\`\${this.getASTNodeUID(node.${receptionParticipantName}?.ref??node)}${receptionParticipantName}Payload\`), new AckEventInstruction(\`\${this.getASTNodeUID(node.${receptionParticipantName}?.ref??node)}Token\`)]
        ${receptionParticipantName}ReceptionNode.returnType = "void"
        ${triggerNodeName ? `localCCFG.addEdge(${triggerNodeName},${receptionParticipantName}ReceptionNode)` : `// no trigger node identified for causal reception`}
        `);
}

export function addSimpleEdge(file: CompositeGeneratorNode, participantName: string, premiseNodeName: string) {
    file.append(`
        localCCFG.addEdge(${participantName}Hole,${premiseNodeName})\n`);
}

export function addEdgeWithGuard(file: CompositeGeneratorNode, participantNodeName: string | undefined, premiseNodeName: string, edgeGuardString: string) {
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

export function createChoiceNodeForGuards(ruleCF: RuleControlFlow, file: CompositeGeneratorNode, premiseNodeName: string): string {
    const refPath = ruleCF.premiseParticipants[0].filter(p => p.type != "event").map(p => p.name).join('.');
    const refNode = refPath.length > 0 ? `node.${refPath}` : `node`;

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

    return `${ruleCF.rule.name}ChoiceNode`;
}

export function connectStartingRuleNonHoleParticipant(participants: TypedElement[], file: CompositeGeneratorNode, participantName: string, startingPremiseNodeName: string) {
    if (isBroadcastReceptionParticipants(participants)) {
        file.append(`
        let ${participantName}ReceptionNode : BroadcastEventReception = new BroadcastEventReception(node.${participantName}?.ref??node, "${participantName}")
        localCCFG.addNode(${participantName}ReceptionNode)
        ${participantName}ReceptionNode.functionsNames = [\`\${${participantName}ReceptionNode.uid}receive${participantName}\`]
        //removed from below: , new AckEventInstruction(\`\${this.getASTNodeUID(node.${participantName}?.ref??node)}Token
        ${participantName}ReceptionNode.functionsDefs = [new WaitEventInstruction(\`\${this.getASTNodeUID(node.${participantName}?.ref??node)}\`,\`\${this.getASTNodeUID(node.${participantName}?.ref??node)}${participantName}Payload\`)\`)]
        ${participantName}ReceptionNode.returnType = "void"
        localCCFG.addEdge(${participantName}ReceptionNode,${startingPremiseNodeName})
        `);
    } else {
        let ruleName: string = "";
        if ((participants[0].astNode as VariableDeclaration).$container.$type == "RuleOpening") {
            ruleName = ((participants[0].astNode as VariableDeclaration).$container as RuleOpening).onRule?.$refText ?? "";
        }
        file.append(`
        localCCFG.addEdge(${participants[0].name + ruleName}Node,${startingPremiseNodeName})
        `);
    }
}