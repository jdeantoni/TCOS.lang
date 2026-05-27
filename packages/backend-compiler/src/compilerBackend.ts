
import chalk from "chalk";
import { visitAllNodes } from "./visitors.js";
import { CompositeGeneratorNode } from "langium/generate";
import {IGenerator} from "./generator/GeneratorInterface.js";
import { TraversalContext } from "./TraversalContext.js";
import { AddSleepInstruction, AssignVarInstruction, CCFG, CreateGlobalVarInstruction, CreateVarInstruction, Edge, Instruction, Node, OperationInstruction, ReturnInstruction, SetGlobalVarInstruction, SetVarFromGlobalInstruction, Step, VerifyEqualInstruction } from "ccfg";

const debug = false;

export function generatefromCCFG(ccfg: CCFG, codeFile:CompositeGeneratorNode, generator:IGenerator, filePath:string,debug:boolean): void {
    const ctx = new TraversalContext();
    console.log("Generating code from ");
    doGenerateCode(codeFile, ccfg, debug, generator, ctx);
}

function doGenerateCode(codeFile: CompositeGeneratorNode, ccfg: CCFG, debug: boolean, generator: IGenerator, ctx: TraversalContext) {
    const initNode = ccfg.initialState;
    if (initNode == undefined) {
        console.log(chalk.red("No initial state found in the CCFG, aborting"));
        return;
    }

    generator.setDebug(debug);
    let allCode: string[] = generator.createBase();
    allCode = [...allCode , ...compileFunctionDefs(ccfg,generator)];

    
    const currentNode = initNode;
    const insideMain:string[] = visitAllNodes(ccfg, currentNode, /*-1,*/ generator, ctx, true);
    allCode = [...allCode, ...generator.createMainFunction(insideMain)];
    allCode = [...allCode, ...generator.endFile()];
    codeFile.append(allCode.join(""));
}

function compileFunctionDefs(ccfg: CCFG,generator:IGenerator): string[] {
    let res: string[] = [];
    for (const node of ccfg.nodes) {
        if(!debug && node.functionsDefs.length == 0){
            continue;
        }
        if(node.returnType != undefined){
            if( node.functionsDefs[0] instanceof Instruction){

                for (const fname of node.functionsNames) {
                    let allFDefs:string[] = [];
                    for (const fdef of node.functionsDefs) {
                        if  (fdef instanceof ReturnInstruction) {
                            const b = fdef as ReturnInstruction;
                            allFDefs= [...allFDefs, ...generator.returnVar(b.varName)];
                        }else if (fdef instanceof CreateVarInstruction){
                            const b = fdef as CreateVarInstruction;
                            allFDefs = [...allFDefs, ...generator.createVar(b.type, b.varName)];
                        }else if (fdef instanceof AssignVarInstruction){
                            const b = fdef as AssignVarInstruction;
                            allFDefs=[...allFDefs, ...generator.assignVar(b.varName, b.value)];
                        } else if (fdef instanceof SetVarFromGlobalInstruction){
                            const b = fdef as SetVarFromGlobalInstruction;
                            allFDefs =[...allFDefs, ...generator.setVarFromGlobal(b.type, b.varName, b.globalVarName)];
                        } else if (fdef instanceof CreateGlobalVarInstruction){
                            const b = fdef as CreateGlobalVarInstruction;
                            allFDefs=[...allFDefs, ...generator.createGlobalVar(b.type, b.varName)];
                        } else if (fdef instanceof SetGlobalVarInstruction){
                            const b = fdef as SetGlobalVarInstruction;
                            allFDefs=[...allFDefs, ...generator.setGlobalVar(b.type, b.globalVarName, b.value)];
                        } else if (fdef instanceof OperationInstruction){
                            const b = fdef as OperationInstruction;
                            allFDefs=[...allFDefs, ...generator.operation( b.varName, b.n1, b.op, b.n2)];
                        } else if (fdef instanceof AddSleepInstruction){
                            const b = fdef as AddSleepInstruction;
                            allFDefs=[...allFDefs, ...generator.createSleep(b.duration)];
                        } 
                        else{
                            console.log("Unknown function definition: "+ fdef.$instructionType+ " pop"+fdef.toString());
                            allFDefs = [...allFDefs, fdef.toString()];
                        }
                    }
                        res = [...res, ...generator.createFunction(fname, node.params, node.returnType,allFDefs) ];
                    }
                }
            }
    }
    return res;
}

export function getCurrentUID(node: Node): number {
    return node.uid;
}

export function addCorrespondingCode(currentNode: Node, ccfg: CCFG,generator:IGenerator, ctx: TraversalContext):string[] {
    if(!debug && currentNode.functionsDefs.length == 0){
        return [];
    }

    if(currentNode.returnType == undefined){
        return [];
    }

    let res:string[] = [];

    if(currentNode.functionsNames == undefined || currentNode.functionsNames.length == 0){
        const queueUID = queueUidToPushIn(currentNode);
        res = [...res, ...addQueuePushCode(queueUID, currentNode, ccfg, undefined,generator, ctx)];
        return res;
    }

    currentNode.functionsNames.forEach(f => {
        const paramNames = getParameterNames(currentNode);
        res =[...res ,...generator.createFuncCall(f,paramNames,currentNode.returnType || "void")];
        if(currentNode.functionsDefs.length == 0){
            return [];
        }
        
        const queueUID = queueUidToPushIn(currentNode);
        res =[...res ,...addQueuePushCode(queueUID, currentNode, ccfg, f,generator, ctx)];
        return res;
    });
    
    return res;
}

function queueUidToPushIn(n: Node): number|undefined {
    for(const e of n.outputEdges){
        if (e.to.getType() == "AndJoin" || e.to.getType() == "OrJoin"){
            return e.to.uid;
        }
        if(e.to.functionsDefs.length == 0 && !(e.to.getType() == "Fork" || e.to.getType() == "Choice")){
            const uid = queueUidToPushIn(e.to);
            if(uid != undefined){
                return uid;
            }
        }
    }
    return undefined;
}

export function addQueuePushCode(queueUID: number | undefined, currentNode: Node, ccfg: CCFG, f: string|undefined, generator:IGenerator, ctx: TraversalContext): string[] {
    let res:string[] = [];

    if (queueUID != undefined) {
        const syncNode = ccfg.getNodeByUID(queueUID);
        if (syncNode == undefined) {
            throw new Error("syncNode is undefined uid = " + queueUID);
        }
        const previousTypeNodes = getPreviousTypedNodes(syncNode.inputEdges[0]);

        if (previousTypeNodes.length > 1) {
            throw new Error("multiple previous typed nodes not handled here");
        }

        if(!ctx.createdQueueIds.includes(queueUID)){
            ctx.createdQueueIds.push(queueUID);
            if (syncNode.returnType != undefined && syncNode.returnType != "void") {
                
                res = [...res, ...generator.createLockingQueue(syncNode.returnType,queueUID)];
            } else {
                
                res = [...res, ...generator.createSynchronizer(queueUID)];
            }
        }

        if (currentNode.returnType == undefined || currentNode.returnType == "void" || f == undefined) {

            res = [...res, ...generator.activateSynchronizer(queueUID)];
        } else {
            res = [...res, ...generator.sendToQueue(queueUID,currentNode.returnType || "void",`result${f}`)];
        }
        if(syncNode.isCycleInitiator){
           res = [...res, ...generator.setLoopFlag(queueUID)];
        }

        return res;
    }
    return [];
}

function getParameterNames(currentNode: Node): string[] {
    const res: string[] = [];
    if(currentNode.params.length > 0){
        if(currentNode.getType() == "AndJoin" ){
            if(currentNode.functionsDefs.length == 0){ //take care parameters are actual parameters not the one added to be able to unpop
                return res;
            }
            for(let i: number = 0; i < currentNode.params.length; i = i +1){
                res.push(`${currentNode.getType()}Popped_${currentNode.uid}_${i}`);
            }
            return res;
        }
        if (currentNode.getType() == "OrJoin"){
            if(currentNode.functionsDefs.length == 0){ //take care parameters are actual parameters not the one added to be able to unpop
                return res;
            }
            res.push(`${currentNode.getType()}Popped_${currentNode.uid}`);
            return res;
        }
        for(const ie of currentNode.inputEdges){
            const previousTypeNodes: Node[] = getPreviousTypedNodes(ie, true);
            for(const previousTypeNode of previousTypeNodes){
                if((previousTypeNode.getType() == "AndJoin" || previousTypeNode.getType() == "OrJoin") && previousTypeNode.functionsDefs.length == 0){ 
                    res.push(`${previousTypeNode.getType()}Popped_${previousTypeNode.uid}`);
                }else{
                    res.push(`result${previousTypeNode.functionsNames[0]}`);
                }
            }
        }
    }
    return res;
}

export function getPreviousTypedNodes(ie: Edge, stopAlsoOnNoCodeJoinNode = false): Node[] {
    const previousTypeNode: Node = ie.from;
    let res : Node[] = [];
    if (previousTypeNode.returnType != undefined && stopAlsoOnNoCodeJoinNode){
        res.push(previousTypeNode);
        return res;
    }

    if (previousTypeNode.returnType != undefined && ! stopAlsoOnNoCodeJoinNode && previousTypeNode.functionsDefs.length > 0){
        res.push(previousTypeNode);
        return res;
    }
          
    for(const e of previousTypeNode.inputEdges){
        res = [...res, ...getPreviousTypedNodes(e,stopAlsoOnNoCodeJoinNode)];  
    }
    return res;
}

export function addComparisonVariableDeclaration(currentNode: Node,generator:IGenerator) : string[] {
    for(const ie of currentNode.inputEdges){
        const previousTypeNodesWithJoin = getPreviousTypedNodes(ie, true);
        const realPreviousTypeNodes = getPreviousTypedNodes(ie, false);
        let comparisonVariableCode:string[] = [];

        for (let i = 0; i < realPreviousTypeNodes.length; i++) {
            const realPreviousTypeNode = realPreviousTypeNodes[i];

            if(realPreviousTypeNode.returnType != "void"){
                const lastDefStatement = realPreviousTypeNode.functionsDefs[realPreviousTypeNode.functionsDefs.length-1];
                const lastDefStatementSplit = lastDefStatement.toString().split(",");
                let returnedVariableName = lastDefStatementSplit[lastDefStatementSplit.length-1];

                returnedVariableName = returnedVariableName.substring(0, returnedVariableName.length-1); //remove semicolum
                const previousTypeNode = previousTypeNodesWithJoin[0];
                if(previousTypeNode.getType() == "AndJoin" || previousTypeNode.getType() == "OrJoin"){
                    comparisonVariableCode= [...comparisonVariableCode,...generator.createVar(previousTypeNode.returnType || "void",returnedVariableName), ...generator.assignVar(returnedVariableName,previousTypeNode.params[i].name)];
                }else{
                    comparisonVariableCode= [...comparisonVariableCode,...generator.createVar(previousTypeNode.returnType || "void",returnedVariableName),...generator.assignVar(returnedVariableName,`result${previousTypeNode.functionsNames[0]}`)];                    
                }
            }
        }
        return comparisonVariableCode;
    }
    return [];
}