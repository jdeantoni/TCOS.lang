import { CompositeGeneratorNode } from "langium/generate";
import { HoleSpecifier, CollectionHoleSpecifier } from "../class/HoleSpecifier.js";
import { RuleOpening, VariableDeclaration } from "../../../language-server/generated/ast.js";
import { participantNames, leadingParticipant, isReferenceBased } from "../analysis/participants.js";

export function extractTimerDuration(hole: HoleSpecifier, openedRule: RuleOpening): string {
    const durationVar = (openedRule.runtimeState as VariableDeclaration[]).find(rs =>
        rs.name == hole.startingParticipants[hole.startingParticipants.length - 2 >= 0 ? hole.startingParticipants.length - 2 : 0].name
    );
    return durationVar?.value?.$cstNode?.text ?? "";
}

export function createTimerHole(file: CompositeGeneratorNode, hole: HoleSpecifier, duration: string) {
    const holeName = participantNames(hole.startingParticipants);
    file.append(`
        let ${holeName}Hole: Hole = new TimerHole(node,node.${duration}) //timer hole to ease specific filling
        localCCFG.addNode(${holeName}Hole)
        `);
}

export function createCollectionHole(file: CompositeGeneratorNode, hole: HoleSpecifier) {
    const holeName = participantNames(leadingParticipant(hole.startingParticipants));
    let refNode: string = `node.${participantNames(leadingParticipant(hole.startingParticipants), ".")}`;

    if (isReferenceBased(hole.startingParticipants)) {
        refNode = refNode + ".map(t => t.ref).filter(ref => ref !== undefined).map(ref => ref as AstNode)";
    }

    const collectionHole = hole as CollectionHoleSpecifier;
    file.append(`
        let ${holeName}Hole: CollectionHole = new CollectionHole(${refNode})
        ${holeName}Hole.isSequential = ${collectionHole.isSequential}
        ${holeName}Hole.parallelSyncPolicy = "${collectionHole.parallelSyncPolicy}"
        localCCFG.addNode(${holeName}Hole)
        `);
}

export function createSimpleHole(file: CompositeGeneratorNode, hole: HoleSpecifier) {
    const holeName = participantNames(hole.startingParticipants);
    let refNode: string = `node.${participantNames(hole.startingParticipants, ".")}`;

    if (isReferenceBased(hole.startingParticipants)) {
        refNode = refNode + ".ref";
    }

    file.append(`
        let ${holeName}Hole: Hole = new Hole(${refNode})
        localCCFG.addNode(${holeName}Hole)
        `);
}
