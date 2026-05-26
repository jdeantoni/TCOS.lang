import { AddSleepInstruction, AssignVarInstruction, CreateGlobalVarInstruction, CreateVarInstruction, Instruction, OperationInstruction, ReturnInstruction, SetGlobalVarInstruction, SetVarFromGlobalInstruction } from "ccfg";
import chalk from "chalk";
import { visitAllNodes } from "./visitors.js";
import { TraversalContext } from "./TraversalContext.js";
const debug = false;
export function generatefromCCFG(ccfg, codeFile, generator, filePath, debug) {
    const ctx = new TraversalContext();
    console.log("Generating code from ");
    doGenerateCode(codeFile, ccfg, debug, generator, ctx);
}
function doGenerateCode(codeFile, ccfg, debug, generator, ctx) {
    const initNode = ccfg.initialState;
    if (initNode == undefined) {
        console.log(chalk.red("No initial state found in the CCFG, aborting"));
        return;
    }
    generator.setDebug(debug);
    let allCode = generator.createBase();
    allCode = [...allCode, ...compileFunctionDefs(ccfg, generator)];
    const currentNode = initNode;
    const insideMain = visitAllNodes(ccfg, currentNode, /*-1,*/ generator, ctx, true);
    allCode = [...allCode, ...generator.createMainFunction(insideMain)];
    allCode = [...allCode, ...generator.endFile()];
    codeFile.append(allCode.join(""));
    //console.log(codeFile);
}
// On pourrais refactoriser cette fonction car celle-ci est compliqué à comprendre
function compileFunctionDefs(ccfg, generator) {
    let res = [];
    for (const node of ccfg.nodes) {
        if (!debug && node.functionsDefs.length == 0) {
            continue;
        }
        if (node.returnType != undefined) {
            if (node.functionsDefs[0] instanceof Instruction) {
                for (const fname of node.functionsNames) {
                    let allFDefs = [];
                    for (const fdef of node.functionsDefs) {
                        if (fdef instanceof ReturnInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.returnVar(b.varName)];
                        }
                        else if (fdef instanceof CreateVarInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.createVar(b.type, b.varName)];
                        }
                        else if (fdef instanceof AssignVarInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.assignVar(b.varName, b.value)];
                        }
                        else if (fdef instanceof SetVarFromGlobalInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.setVarFromGlobal(b.type, b.varName, b.globalVarName)];
                        }
                        else if (fdef instanceof CreateGlobalVarInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.createGlobalVar(b.type, b.varName)];
                        }
                        else if (fdef instanceof SetGlobalVarInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.setGlobalVar(b.type, b.globalVarName, b.value)];
                        }
                        else if (fdef instanceof OperationInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.operation(b.varName, b.n1, b.op, b.n2)];
                        }
                        else if (fdef instanceof AddSleepInstruction) {
                            const b = fdef;
                            allFDefs = [...allFDefs, ...generator.createSleep(b.duration)];
                        }
                        else {
                            console.log("Unknown function definition: " + fdef.$instructionType + " pop" + fdef.toString());
                            allFDefs = [...allFDefs, fdef.toString()];
                        }
                    }
                    //console.log("function name: "+fname+ " allFDefs = "+allFDefs);
                    res = [...res, ...generator.createFunction(fname, node.params, node.returnType, allFDefs)];
                }
            }
        }
        // }
    }
    return res;
}
export function getCurrentUID(node) {
    return node.uid;
}
export function addCorrespondingCode(currentNode, ccfg, generator, ctx) {
    if (!debug && currentNode.functionsDefs.length == 0) {
        return [];
    }
    if (debug) {
        /*codeFile.append(`
        #if DEBUG
            std::cout<<"${currentNode.uid} : ${currentNode.getType()}" <<std::endl;
        #endif
        `);*/
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
function queueUidToPushIn(n) {
    for (const e of n.outputEdges) {
        if (e.to.getType() == "AndJoin" || e.to.getType() == "OrJoin") {
            return e.to.uid;
        }
        if (e.to.functionsDefs.length == 0 && !(e.to.getType() == "Fork" || e.to.getType() == "Choice")) {
            const uid = queueUidToPushIn(e.to);
            if (uid != undefined) {
                return uid;
            }
        }
    }
    return undefined;
}
export function addQueuePushCode(queueUID, currentNode, ccfg, f, generator, ctx) {
    let res = [];
    if (queueUID != undefined) {
        const syncNode = ccfg.getNodeByUID(queueUID);
        if (syncNode == undefined) {
            throw new Error("syncNode is undefined uid = " + queueUID);
        }
        const ptns = getPreviousTypedNodes(syncNode.inputEdges[0]);
        if (ptns.length > 1) {
            throw new Error("multiple previous typed nodes not handled here");
        }
        //        let ptn = ptns[0];
        if (!ctx.createdQueueIds.includes(queueUID)) {
            ctx.createdQueueIds.push(queueUID);
            if (syncNode.returnType != undefined && syncNode.returnType != "void") {
                res = [...res, ...generator.createLockingQueue(syncNode.returnType, queueUID)];
            }
            else {
                res = [...res, ...generator.createSynchronizer(queueUID)];
            }
        }
        //codeFile.append(`{\n`)
        if (currentNode.returnType == undefined || currentNode.returnType == "void" || f == undefined) {
            res = [...res, ...generator.activateSynchronizer(queueUID)];
        }
        else {
            res = [...res, ...generator.sendToQueue(queueUID, currentNode.returnType || "void", `result${f}`)];
        }
        if (syncNode.isCycleInitiator) {
            res = [...res, ...generator.setLoopFlag(queueUID)];
        }
        //codeFile.append(`}\n`)
        return res;
    }
    return [];
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
            const ptns = getPreviousTypedNodes(ie, true);
            for (const ptn of ptns) {
                if ((ptn.getType() == "AndJoin" || ptn.getType() == "OrJoin") && ptn.functionsDefs.length == 0) {
                    res.push(`${ptn.getType()}Popped_${ptn.uid}`);
                }
                else {
                    res.push(`result${ptn.functionsNames[0]}`);
                }
            }
        }
    }
    return res;
}
export function getPreviousTypedNodes(ie, stopAlsoOnNoCodeJoinNode = false) {
    const ptn = ie.from;
    let res = [];
    if (ptn.returnType != undefined && stopAlsoOnNoCodeJoinNode) {
        res.push(ptn);
        return res;
    }
    if (ptn.returnType != undefined && !stopAlsoOnNoCodeJoinNode && ptn.functionsDefs.length > 0) {
        res.push(ptn);
        return res;
    }
    for (const e of ptn.inputEdges) {
        res = [...res, ...getPreviousTypedNodes(e, stopAlsoOnNoCodeJoinNode)];
    }
    return res;
}
export function addComparisonVariableDeclaration(currentNode, generator) {
    for (const ie of currentNode.inputEdges) {
        const ptnsWithJoin = getPreviousTypedNodes(ie, true);
        const realPtns = getPreviousTypedNodes(ie, false);
        let comparisonVariableCode = [];
        for (let i = 0; i < realPtns.length; i++) {
            const realPtn = realPtns[i];
            if (realPtn.returnType != "void") {
                const lastDefStatement = realPtn.functionsDefs[realPtn.functionsDefs.length - 1];
                const lastDefStatementSplit = lastDefStatement.toString().split(",");
                let returnedVariableName = lastDefStatementSplit[lastDefStatementSplit.length - 1];
                returnedVariableName = returnedVariableName.substring(0, returnedVariableName.length - 1); //remove semicolum
                const ptn = ptnsWithJoin[0];
                if (ptn.getType() == "AndJoin" || ptn.getType() == "OrJoin") {
                    comparisonVariableCode = [...comparisonVariableCode, ...generator.createVar(ptn.returnType || "void", returnedVariableName), ...generator.assignVar(returnedVariableName, ptn.params[i].name)];
                }
                else {
                    comparisonVariableCode = [...comparisonVariableCode, ...generator.createVar(ptn.returnType || "void", returnedVariableName), ...generator.assignVar(returnedVariableName, `result${ptn.functionsNames[0]}`)];
                }
            }
        }
        return comparisonVariableCode;
    }
    return [];
}
