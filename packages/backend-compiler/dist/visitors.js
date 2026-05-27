import chalk from "chalk";
import { addComparisonVariableDeclaration, addCorrespondingCode, addQueuePushCode, getPreviousTypedNodes } from "./codeEmission.js";
export function visitAllNodes(ccfg, currentNode, generator, ctx, visitIsStarting = false) {
    ctx.recursLevel = ctx.recursLevel + 1;
    const currentUID = currentNode.uid;
    let thisNodeCode = [];
    if (currentNode.outputEdges.length == 0)
        return [];
    currentNode.numberOfVisits = currentNode.numberOfVisits + 1;
    if (tryDeferVisit(currentNode, visitIsStarting, ctx))
        return [];
    if (ctx.visitedUID.includes(currentUID))
        return [];
    ctx.visitedUID.push(currentUID);
    switch (currentNode.getType()) {
        case "Step": {
            thisNodeCode = StepNode(thisNodeCode, currentNode, ccfg, generator, ctx);
            break;
        }
        case "Fork": {
            thisNodeCode = ForkNode(thisNodeCode, currentNode, ccfg, generator, ctx);
            break;
        }
        case "AndJoin": {
            thisNodeCode = AndJoinNode(thisNodeCode, currentNode, ccfg, generator, ctx);
            break;
        }
        case "OrJoin": {
            thisNodeCode = OrJoinNode(thisNodeCode, currentNode, ccfg, generator, ctx);
            break;
        }
        case "Choice": {
            thisNodeCode = ChoiceNode(thisNodeCode, currentNode, ccfg, generator, ctx);
            break;
        }
    }
    if (ctx.continuations.length > 0) {
        while (ctx.recursLevel == ctx.continuationsRecursLevel.at(-1)) {
            const toVisit = ctx.continuations.pop();
            ctx.continuationsRecursLevel.pop();
            if (toVisit != undefined) {
                thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, toVisit, generator, ctx)];
            }
        }
    }
    ctx.recursLevel = ctx.recursLevel - 1;
    return thisNodeCode;
}
function tryDeferVisit(currentNode, visitIsStarting, ctx) {
    if (currentNode.inputEdges.length <= 1)
        return false;
    const node = currentNode.inputEdges.length;
    if (visitIsStarting == false && currentNode.numberOfVisits < node) {
        if (currentNode.isCycleInitiator && !ctx.continuations.includes(currentNode)) {
            ctx.continuationsRecursLevel.push(ctx.recursLevel - 1);
            currentNode.numberOfVisits = node;
            ctx.continuations.push(currentNode);
        }
        return true;
    }
    if (currentNode.numberOfVisits === node) {
        if (!ctx.continuations.includes(currentNode)) {
            if (currentNode.isCycleInitiator) {
                ctx.continuationsRecursLevel.push(ctx.recursLevel - 1);
                currentNode.numberOfVisits = node;
            }
            ctx.continuations.push(currentNode);
        }
        return true;
    }
    return false;
}
function StepNode(thisNodeCode, currentNode, ccfg, generator, ctx) {
    thisNodeCode = [...thisNodeCode, ...addCorrespondingCode(currentNode, ccfg, generator, ctx)];
    if (currentNode.outputEdges.length > 1) {
        const edgeToVisit = currentNode.outputEdges;
        for (const edge of edgeToVisit) {
            ctx.continuationsRecursLevel.push(ctx.recursLevel - 1);
            thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, edge.to, generator, ctx)];
        }
    }
    else {
        const edge = currentNode.outputEdges[0];
        thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, edge.to, generator, ctx)];
    }
    return thisNodeCode;
}
function ForkNode(thisNodeCode, currentNode, ccfg, generator, ctx) {
    const edgeToVisit = currentNode.outputEdges;
    for (const syncUID of currentNode.syncNodeIds) {
        const node = ccfg.getNodeByUID(syncUID);
        if (node != undefined) {
            const previousTypeNodes = getPreviousTypedNodes(node.inputEdges[0]);
            if (previousTypeNodes.length > 1) {
                throw new Error("multiple previous typed nodes not handled here");
            }
            const previousTypeNode = previousTypeNodes[0];
            if (previousTypeNode.returnType != undefined) {
                if (!ctx.createdQueueIds.includes(syncUID)) {
                    ctx.createdQueueIds.push(syncUID);
                    if (previousTypeNode.returnType != "void" && previousTypeNode.returnType != undefined) {
                        thisNodeCode = [...thisNodeCode, ...generator.createLockingQueue(previousTypeNode.returnType, syncUID)];
                    }
                    else {
                        thisNodeCode = [...thisNodeCode, ...generator.createSynchronizer(syncUID)];
                    }
                }
            }
        }
    }
    ctx.continuationsRecursLevel.push(ctx.recursLevel);
    for (const edge of edgeToVisit) {
        if (edge.to.cycles.length > 0 && !edge.to.cyclePossessAnAndJoin()) {
            //we have a cycle and no andJoin in the cycle
            thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, edge.to, generator, ctx)];
            if (edge.to.isCycleInitiator) {
                thisNodeCode = [...thisNodeCode, ...addQueuePushCode(edge.to.uid, edge.to, ccfg, undefined, generator, ctx)];
            }
        }
        else {
            ctx.fifoThreadUid.add(currentNode.uid, edge.to.uid);
            const insideThreadCode = visitAllNodes(ccfg, edge.to, generator, ctx);
            thisNodeCode = [...thisNodeCode, ...generator.createAndOpenThread(edge.to.uid, insideThreadCode)];
        }
    }
    return thisNodeCode;
}
function AndJoinNode(thisNodeCode, currentNode, ccfg, generator, ctx) {
    for (const i of Array.from(Array(currentNode.inputEdges.length).keys())) {
        const previousTypeNodes = getPreviousTypedNodes(currentNode.inputEdges[i]);
        if (previousTypeNodes.length > 1) {
            throw new Error("multiple previous typed nodes not handled here");
        }
        const previousTypeNode = previousTypeNodes[0];
        let paramType = previousTypeNode.returnType;
        const paramName = "AndJoinPopped_" + currentNode.uid + "_" + i;
        if (currentNode.params.length > i && (currentNode.params[i].type != undefined)) {
            paramType = currentNode.params[i].type;
        }
        if (currentNode.functionsDefs.length == 0) {
            currentNode.params.push({ name: paramName, type: paramType });
            currentNode.returnType = paramType;
        }
        if (paramType == "void") {
            thisNodeCode = [...thisNodeCode, ...generator.waitForSynchronizer(currentNode.uid)];
        }
        else {
            thisNodeCode = [...thisNodeCode, ...generator.createVar(paramType || "void", paramName)];
            thisNodeCode = [...thisNodeCode, ...generator.receiveFromQueue(currentNode.uid, paramType || "void", paramName)];
        }
    }
    thisNodeCode = [...thisNodeCode, ...addCorrespondingCode(currentNode, ccfg, generator, ctx)];
    const nextNode = currentNode.outputEdges[0].to;
    thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, nextNode, generator, ctx)];
    return thisNodeCode;
}
function OrJoinNode(thisNodeCode, currentNode, ccfg, generator, ctx) {
    const paramName = "OrJoinPopped_" + currentNode.uid;
    let paramType = undefined;
    for (const edge of currentNode.inputEdges) {
        const previousTypeNodes = getPreviousTypedNodes(edge);
        if (previousTypeNodes.length > 1) {
            throw new Error("multiple previous typed nodes not handled here");
        }
        const previousTypeNode = previousTypeNodes[0];
        paramType = previousTypeNode.returnType;
        if (paramType != undefined) {
            break;
        }
    }
    if (currentNode.functionsDefs.length == 0) {
        currentNode.params.push({ name: paramName, type: paramType });
        currentNode.returnType = paramType;
    }
    let insideLoopCode = [];
    if (paramType == "void" || paramType == undefined) {
        insideLoopCode = [...insideLoopCode, ...generator.waitForSynchronizer(currentNode.uid)];
    }
    else {
        insideLoopCode = [...insideLoopCode, ...generator.createVar(paramType || "void", paramName)];
        insideLoopCode = [...insideLoopCode, ...generator.receiveFromQueue(currentNode.uid, paramType || "void", paramName)];
    }
    const nextNode = currentNode.outputEdges[0].to;
    insideLoopCode = [...insideLoopCode, ...visitAllNodes(ccfg, nextNode, generator, ctx)];
    if (currentNode.isCycleInitiator) {
        thisNodeCode = [...thisNodeCode, ...generator.createLoop(currentNode.uid, insideLoopCode)]; //ends the while loop
    }
    else {
        thisNodeCode = [...thisNodeCode, ...insideLoopCode];
    }
    return thisNodeCode;
}
function ChoiceNode(thisNodeCode, currentNode, ccfg, generator, ctx) {
    for (const syncUID of currentNode.syncNodeIds) {
        const node = ccfg.getNodeByUID(syncUID);
        if (node != undefined) {
            const previousTypeNodes = getPreviousTypedNodes(node.inputEdges[0]);
            if (previousTypeNodes.length > 1) {
                throw new Error("multiple previous typed nodes not handled here");
            }
            if (!ctx.createdQueueIds.includes(syncUID)) {
                ctx.createdQueueIds.push(syncUID);
                thisNodeCode = [...thisNodeCode, ...generator.createSynchronizer(syncUID)];
            }
        }
    }
    ctx.continuationsRecursLevel.push(ctx.recursLevel);
    thisNodeCode = [...thisNodeCode, ...addComparisonVariableDeclaration(currentNode, generator)];
    const edgeToVisit = currentNode.outputEdges;
    for (const edge of edgeToVisit) {
        const guards = [];
        for (const guard of edge.guards) {
            if (guard.$instructionType === "verifyEqualInstruction") {
                const g = guard;
                guards.push(generator.createEqualsVerif(g.n1, g.n2));
            }
        }
        let insideOfIf;
        insideOfIf = addCorrespondingCode(currentNode, ccfg, generator, ctx);
        insideOfIf = [...insideOfIf, ...visitAllNodes(ccfg, edge.to, generator, ctx)];
        //special case for choice node when directly linked to join node
        if ((edge.to.getType() == "AndJoin" || edge.to.getType() == "OrJoin") && currentNode.functionsDefs.length == 0) {
            if (currentNode.returnType == undefined) {
                const previousTypeNodes = getPreviousTypedNodes(currentNode.inputEdges[0]);
                if (previousTypeNodes.length > 1) {
                    console.log(chalk.red(currentNode.uid + " : multiple previous typed nodes not handled here"));
                }
                const previousTypeNode = previousTypeNodes[0];
                insideOfIf = [...insideOfIf, ...addQueuePushCode(edge.to.uid, previousTypeNode, ccfg, previousTypeNode.functionsNames[0], generator, ctx)];
            }
            else {
                insideOfIf = [...insideOfIf, ...addQueuePushCode(edge.to.uid, currentNode, ccfg, currentNode.functionsNames[0], generator, ctx)];
            }
        }
        thisNodeCode = [...thisNodeCode, ...generator.createIf(guards, insideOfIf)];
    }
    return thisNodeCode;
}
