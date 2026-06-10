const debug = false;
export function addCorrespondingCode(currentNode, ccfg, generator, ctx) {
    if (!debug && currentNode.functionsDefs.length == 0) {
        return [];
    }
    if (currentNode.returnType == undefined) {
        return [];
    }
    let res = [];
    if (currentNode.functionsNames == undefined || currentNode.functionsNames.length == 0) {
        const queueUID = queueUidToPushIn(currentNode);
        res = [...res, ...addQueuePushCode(queueUID, currentNode, ccfg, undefined, generator, ctx)];
        return res;
    }
    currentNode.functionsNames.forEach(f => {
        const paramNames = getParameterNames(currentNode);
        res = [...res, ...generator.createFuncCall(f, paramNames, currentNode.returnType || "void")];
        if (currentNode.functionsDefs.length == 0) {
            return [];
        }
        const queueUID = queueUidToPushIn(currentNode);
        res = [...res, ...addQueuePushCode(queueUID, currentNode, ccfg, f, generator, ctx)];
        return res;
    });
    return res;
}
export function addQueuePushCode(queueUID, currentNode, ccfg, f, generator, ctx) {
    let res = [];
    if (queueUID != undefined) {
        const syncNode = ccfg.getNodeByUID(queueUID);
        if (syncNode == undefined) {
            throw new Error("syncNode is undefined uid = " + queueUID);
        }
        const previousTypeNodes = getPreviousTypedNodes(syncNode.inputEdges[0]);
        if (previousTypeNodes.length > 1) {
            throw new Error("multiple previous typed nodes not handled here");
        }
        if (!ctx.createdQueueIds.includes(queueUID)) {
            ctx.createdQueueIds.push(queueUID);
            if (syncNode.returnType != undefined && syncNode.returnType != "void") {
                res = [...res, ...generator.createLockingQueue(syncNode.returnType, queueUID)];
            }
            else {
                res = [...res, ...generator.createSynchronizer(queueUID)];
            }
        }
        if (currentNode.returnType == undefined || currentNode.returnType == "void" || f == undefined) {
            res = [...res, ...generator.activateSynchronizer(queueUID)];
        }
        else {
            res = [...res, ...generator.sendToQueue(queueUID, currentNode.returnType || "void", `result${f}`)];
        }
        if (syncNode.isCycleInitiator) {
            res = [...res, ...generator.setLoopFlag(queueUID)];
        }
        return res;
    }
    return [];
}
export function getPreviousTypedNodes(ie, stopAlsoOnNoCodeJoinNode = false) {
    const previousTypeNode = ie.from;
    let res = [];
    if (previousTypeNode.returnType != undefined && stopAlsoOnNoCodeJoinNode) {
        res.push(previousTypeNode);
        return res;
    }
    if (previousTypeNode.returnType != undefined && !stopAlsoOnNoCodeJoinNode && previousTypeNode.functionsDefs.length > 0) {
        res.push(previousTypeNode);
        return res;
    }
    for (const edge of previousTypeNode.inputEdges) {
        res = [...res, ...getPreviousTypedNodes(edge, stopAlsoOnNoCodeJoinNode)];
    }
    return res;
}
export function addComparisonVariableDeclaration(currentNode, generator) {
    for (const inputEdge of currentNode.inputEdges) {
        const previousTypeNodesWithJoin = getPreviousTypedNodes(inputEdge, true);
        const realPreviousTypeNodes = getPreviousTypedNodes(inputEdge, false);
        let comparisonVariableCode = [];
        for (let i = 0; i < realPreviousTypeNodes.length; i++) {
            const realPreviousTypeNode = realPreviousTypeNodes[i];
            if (realPreviousTypeNode.returnType != "void") {
                const lastDefStatement = realPreviousTypeNode.functionsDefs[realPreviousTypeNode.functionsDefs.length - 1];
                const lastDefStatementSplit = lastDefStatement.toString().split(",");
                let returnedVariableName = lastDefStatementSplit[lastDefStatementSplit.length - 1];
                returnedVariableName = returnedVariableName.substring(0, returnedVariableName.length - 1); //remove semicolum
                const previousTypeNode = previousTypeNodesWithJoin[0];
                if (previousTypeNode.getType() == "AndJoin" || previousTypeNode.getType() == "OrJoin") {
                    comparisonVariableCode = [...comparisonVariableCode, ...generator.createVar(previousTypeNode.returnType
                            || "void", returnedVariableName), ...generator.assignVar(returnedVariableName, previousTypeNode.params[i].name)];
                }
                else {
                    comparisonVariableCode = [...comparisonVariableCode, ...generator.createVar(previousTypeNode.returnType
                            || "void", returnedVariableName), ...generator.assignVar(returnedVariableName, `result${previousTypeNode.functionsNames[0]}`)];
                }
            }
        }
        return comparisonVariableCode;
    }
    return [];
}
function queueUidToPushIn(n) {
    for (const edge of n.outputEdges) {
        if (edge.to.getType() == "AndJoin" || edge.to.getType() == "OrJoin") {
            return edge.to.uid;
        }
        if (edge.to.functionsDefs.length == 0 && !(edge.to.getType() == "Fork" || edge.to.getType() == "Choice")) {
            const uid = queueUidToPushIn(edge.to);
            if (uid != undefined) {
                return uid;
            }
        }
    }
    return undefined;
}
function getParameterNames(currentNode) {
    const res = [];
    if (currentNode.params.length > 0) {
        if (currentNode.getType() == "AndJoin") {
            if (currentNode.functionsDefs.length == 0) { //take care parameters are actual parameters not the one added to be able to unpop
                return res;
            }
            for (let i = 0; i < currentNode.params.length; i = i + 1) {
                res.push(`${currentNode.getType()}Popped_${currentNode.uid}_${i}`);
            }
            return res;
        }
        if (currentNode.getType() == "OrJoin") {
            if (currentNode.functionsDefs.length == 0) { //take care parameters are actual parameters not the one added to be able to unpop
                return res;
            }
            res.push(`${currentNode.getType()}Popped_${currentNode.uid}`);
            return res;
        }
        for (const ie of currentNode.inputEdges) {
            const previousTypeNodes = getPreviousTypedNodes(ie, true);
            for (const previousTypeNode of previousTypeNodes) {
                if ((previousTypeNode.getType() == "AndJoin" || previousTypeNode.getType() == "OrJoin") && previousTypeNode.functionsDefs.length == 0) {
                    res.push(`${previousTypeNode.getType()}Popped_${previousTypeNode.uid}`);
                }
                else {
                    res.push(`result${previousTypeNode.functionsNames[0]}`);
                }
            }
        }
    }
    return res;
}
