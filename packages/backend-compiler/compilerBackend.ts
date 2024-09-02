
import {  CompositeGeneratorNode, MultiMap } from 'langium';
import { AddSleepInstruction, AssignVarInstruction, CCFG, CreateGlobalVarInstruction, CreateVarInstruction, Edge, Node, OperationInstruction, ReturnInstruction, SetGlobalVarInstruction, SetVarFromGlobalInstruction, VerifyEqualInstruction } from 'ccfg';
import {IGenerator} from './GeneratorInterface';
import chalk from 'chalk';


const createVar = "createVar"   //createVar,type,name
const assignVar = "assignVar"   //assignVar,name,value
const setVarFromGlobal = "setVarFromGlobal" //setVarFromGlobal,type,varName,globalVarName
const createGlobalVar = "createGlobalVar" //createGlobalVar,type,varName
const setGlobalVar = "setGlobalVar" //setGlobalVar,type,varName,value
const operation = "operation" //operation,varName,n1,op,n2
const ret ="return" //return,varName
const verifyEqual = "verifyEqual" //verifyEqual,varName1,varName2
const addSleep = "addSleep" //addSleep,duration
let debug = false;

export function generatefromCCFG(ccfg: CCFG, codeFile:CompositeGeneratorNode, generator:IGenerator, filePath:string,debug:boolean): void {



    doGenerateCode(codeFile, ccfg, debug, generator);

    
}
function doGenerateCode(codeFile: CompositeGeneratorNode, ccfg: CCFG, debug: boolean, generator: IGenerator) {
    let initNode = ccfg.initialState;
    if (initNode == undefined) {
        console.log(chalk.red("No initial state found in the CCFG, aborting"));
        return;
    }

    generator.setDebug(debug);
    let allCode: string[] = generator.createBase();
    allCode = [...allCode , ...compileFunctionDefs(ccfg,generator)];

    
    let currentNode = initNode;
    let insideMain:string[] = visitAllNodes(ccfg, currentNode, /*-1,*/ generator, true);
    allCode = [...allCode, ...generator.createMainFunction(insideMain)];
    allCode = [...allCode, ...generator.endFile()];
    codeFile.append(allCode.join(""));
    //console.log(codeFile);
}




function compileFunctionDefs(ccfg: CCFG,generator:IGenerator): string[] {
    let res: string[] = [];
    for (let node of ccfg.nodes) {
        // if(node.getType() == "ContainerNode"){
        //     functionsDefs += compileFunctionDefs((node as ContainerNode).internalccfg);
        // }else{
            if(!debug && node.functionsDefs.length == 0){
                continue
            }
            if(node.returnType != undefined){
                if(typeof node.functionsDefs[0] == "string"){
                    for (let fname of node.functionsNames) {
                    // console.log("function name: "+fname);
                        let allFDefs:string[] = [];
                        for (let fdef of node.functionsDefs) {
                            if  (fdef.$instructionType == "ReturnInstruction") {
                                let b = fdef as ReturnInstruction;
                                allFDefs= [...allFDefs, ...generator.returnVar(b.varName)];
                            }else if (fdef.$instructionType =="CreateVarInstruction"){
                                let b = fdef as CreateVarInstruction;
                                allFDefs = [...allFDefs, ...generator.createVar(b.type, b.varName)];
                            }else if (fdef.$instructionType == "AssignVarInstruction"){
                                let b = fdef as AssignVarInstruction;
                                allFDefs=[...allFDefs, ...generator.assignVar(b.varName, b.value)];
                            } else if (fdef.$instructionType=="setVarFromGlobalInstruction"){
                                let b = fdef as SetVarFromGlobalInstruction;
                                allFDefs =[...allFDefs, ...generator.setVarFromGlobal(b.type, b.varName, b.globalVarName)];
                            } else if (fdef.$instructionType=="createGlobalVarInstruction"){
                                let b = fdef as CreateGlobalVarInstruction;
                                allFDefs=[...allFDefs, ...generator.createGlobalVar(b.type, b.varName)];
                            } else if (fdef.$instructionType=="setGlobalVarInstruction"){
                                let b = fdef as SetGlobalVarInstruction;
                                allFDefs=[...allFDefs, ...generator.setGlobalVar(b.type, b.globalVarName, b.value)];
                            } else if (fdef.$instructionType=="operationInstruction"){
                                let b = fdef as OperationInstruction;
                                allFDefs=[...allFDefs, ...generator.operation( b.varName, b.n1, b.op, b.n2)];
                            } else if (fdef.$instructionType=="addSleepInstruction"){
                                let b = fdef as AddSleepInstruction;
                                allFDefs=[...allFDefs, ...generator.createSleep(b.duration)];
                            } 
                            else{
                                console.log("Unknown function definition: "+fdef.toString());
                                allFDefs = [...allFDefs, fdef.toString()];
                            }

                        }
                        //console.log("function name: "+fname+ " allFDefs = "+allFDefs);
                        res = [...res, ...generator.createFunction(fname, node.params, node.returnType,allFDefs) ];
                    }
                }
            }
        // }
    }
    return res;
}

let fifoThreadUid : MultiMap<number,number> = new MultiMap();
let continuations: Node[] = []
let continuationsRecursLevel: number[] = []
let visitedUID: number[] = []
let recursLevel = 0;
let createdQueueIds: number[] = []
function visitAllNodes(ccfg: CCFG, currentNode: Node, generator: IGenerator, visitIsStarting: boolean = false): string[] {
    recursLevel = recursLevel + 1;
    let currentUID:number = getCurrentUID(currentNode);

    if (currentNode.outputEdges.length == 0 /*|| currentUID == untilUID*/) {
        return []
    }


    let thisNodeCode:string[] = [];
    currentNode.numberOfVisits = currentNode.numberOfVisits + 1;

    // console.log("try visit "+currentNode.uid  + " nbVisit = "+currentNode.numberOfVisits)
    
    if(currentNode.inputEdges.length > 1){
        
        if (visitIsStarting == false && currentNode.numberOfVisits < currentNode.inputEdges.length) {
            if(currentNode.isCycleInitiator){
                if(! continuations.includes(currentNode)){
                    // console.log("add continuation "+currentNode.uid  + " nbVisit = "+currentNode.numberOfVisits)
                    continuationsRecursLevel.push(recursLevel-1);
                    currentNode.numberOfVisits = currentNode.inputEdges.length;
                    continuations.push(currentNode);
                }
                return []
            }
            // console.log("do not visit "+currentNode.uid  + " nbVisit = "+currentNode.numberOfVisits + " inputEdges = "+currentNode.inputEdges.length)
            return []
        }
        
        if (currentNode.numberOfVisits == currentNode.inputEdges.length){        
            if(! continuations.includes(currentNode)){
                if(currentNode.isCycleInitiator){
                    continuationsRecursLevel.push(recursLevel-1);
                    currentNode.numberOfVisits = currentNode.inputEdges.length;
                }
                continuations.push(currentNode);
            }
            return []
        }
    }  
    
    if (visitedUID.includes(currentUID)){
        return []
    }
    visitedUID.push(currentUID);
    // console.log("visit "+currentNode.uid  + " nbVisit = "+currentNode.numberOfVisits)


    // if(currentNode.cycles.length > 0){
    //     console.log("cycle detected in" + currentNode.uid+":"+currentNode.cycles.map(c => c.map(n => n.uid).join("->")).join(" | "))
    // }
    switch(currentNode.getType()){
    case "Step":
        {
        thisNodeCode = [...thisNodeCode, ...addCorrespondingCode(currentNode,ccfg,generator)];
        if(currentNode.outputEdges.length > 1){

            let edgeToVisit: Edge[] = currentNode.outputEdges;
            for(let edge of edgeToVisit){
                continuationsRecursLevel.push(recursLevel-1);
                ///todo  à quoi ce truc sert ? ------------------------------------------------------------------------------------------------
                //codeFile.append(`
                //{`)
                thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, edge.to, /*untilUID,*/ generator)];
                //codeFile.append(`
                //}`);

            }
        }else{
            let edge = currentNode.outputEdges[0];
            thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg,edge.to, /*untilUID,*/ generator)];
        }
        
        break;
        }
    case "Fork":
        {
        let edgeToVisit: Edge[] = currentNode.outputEdges;
        
        for(let syncUID of currentNode.syncNodeIds){
            let n = ccfg.getNodeByUID(syncUID);
            if (n != undefined){
                let ptns: Node[] = getPreviousTypedNodes(n.inputEdges[0]);
                if(ptns.length > 1){
                    throw new Error("multiple previous typed nodes not handled here")
                }
                let ptn = ptns[0]
                if(ptn.returnType != undefined){
                    if(!createdQueueIds.includes(syncUID)){
                        createdQueueIds.push(syncUID);
                        if(ptn.returnType != "void" && ptn.returnType != undefined){
                            thisNodeCode = [...thisNodeCode, ...generator.createLockingQueue(ptn.returnType,syncUID)];
                        }else{
                            thisNodeCode = [...thisNodeCode, ...generator.createSynchronizer(syncUID)];
                        }
                    }
                }
            }
        }

        continuationsRecursLevel.push(recursLevel);

        for(let edge of edgeToVisit){
            //console.log("fork node cycles = "+currentNode.cycles.map(c => c.map(n => n.uid).join("->")).join(" | "))
            if (edge.to.cycles.length > 0 && ! edge.to.cyclePossessAnAndJoin()){
                //we have a cycle and no andJoin in the cycle
                //console.log(edge.to.uid+": no andJoin in cycle ")
                thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ generator)];
                if(edge.to.isCycleInitiator){
                    thisNodeCode = [...thisNodeCode, ...addQueuePushCode(edge.to.uid,edge.to,ccfg,undefined,generator)];
                }
            }else{
                fifoThreadUid.add(currentNode.uid,edge.to.uid);
                let insideThreadCode:string[] ;
                insideThreadCode = visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ generator);
                thisNodeCode = [...thisNodeCode, ...generator.createAndOpenThread(edge.to.uid,insideThreadCode)];
            }
        }

        break;
        }
    case "AndJoin":
        {
        // let paramNames = getParameterNames(currentNode);
        for(let i of Array.from(Array(currentNode.inputEdges.length).keys())){            
            let ptns :Node[] = getPreviousTypedNodes(currentNode.inputEdges[i]);
            if(ptns.length > 1){
                throw new Error("multiple previous typed nodes not handled here")
            }
            let ptn = ptns[0]
            let paramType: string| undefined = ptn.returnType

            let paramName = "AndJoinPopped_"+currentNode.uid+"_"+i;
            if(currentNode.params.length > i && (currentNode.params[i].type != undefined)){
                paramType = currentNode.params[i].type
            }
            
            if(currentNode.functionsDefs.length == 0){
                currentNode.params.push({name: paramName, type: paramType})
                currentNode.returnType = paramType
            }
            if (paramType == "void"){
                thisNodeCode = [...thisNodeCode, ...generator.waitForSynchronizer(currentNode.uid)];
            } else {
                thisNodeCode = [...thisNodeCode, ...generator.createVar(paramType || "void",paramName)];
                thisNodeCode = [...thisNodeCode, ...generator.receiveFromQueue(currentNode.uid,paramType||"void", paramName)];
            }
        }
        thisNodeCode = [...thisNodeCode, ...addCorrespondingCode( currentNode,ccfg,generator)];
        let nextNode = currentNode.outputEdges[0].to
        thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg,nextNode, /*untilUID,*/ generator)];
        break;
        }
    case "OrJoin":
        {
            // let paramNames = getParameterNames(currentNode);
            let paramName = "OrJoinPopped_"+currentNode.uid;
            let paramType: string| undefined = undefined
            for(let e of currentNode.inputEdges){
                let ptns: Node[] = getPreviousTypedNodes(e);
                if(ptns.length > 1){
                    throw new Error("multiple previous typed nodes not handled here")
                }
                let ptn = ptns[0]
                paramType = ptn.returnType
                if(paramType != undefined){
                    break
                }
            }
            if(currentNode.functionsDefs.length == 0){
                currentNode.params.push({name: paramName, type: paramType})
                currentNode.returnType = paramType
            }
            
            let insideLoopCode: string[] = []
            if (paramType == "void" || paramType == undefined){
                insideLoopCode = [...insideLoopCode, ...generator.waitForSynchronizer(currentNode.uid)];
            } else {
                insideLoopCode = [...insideLoopCode, ...generator.createVar(paramType || "void",paramName)];
                insideLoopCode = [...insideLoopCode, ...generator.receiveFromQueue(currentNode.uid,paramType||"void", paramName)];
            }
            let nextNode = currentNode.outputEdges[0].to
            insideLoopCode = [...insideLoopCode, ...visitAllNodes(ccfg,nextNode, /*untilUID,*/ generator)];
            
            if(currentNode.isCycleInitiator){
                thisNodeCode = [...thisNodeCode, ...generator.createLoop(currentNode.uid,insideLoopCode)]; //ends the while loop
            }else{
                thisNodeCode = [...thisNodeCode, ...insideLoopCode];
            }
            break;
        }
    case "Choice":
        {
        for(let syncUID of currentNode.syncNodeIds){
            let n = ccfg.getNodeByUID(syncUID);
            if (n != undefined){
                let ptns: Node[] = getPreviousTypedNodes(n.inputEdges[0]);
                if(ptns.length > 1){
                    throw new Error("multiple previous typed nodes not handled here")
                }
                if(!createdQueueIds.includes(syncUID)){
                    createdQueueIds.push(syncUID);
                    

    // from here --------------------------------
                    thisNodeCode = [...thisNodeCode, ...generator.createSynchronizer(syncUID)];
                }
            }
        }

        continuationsRecursLevel.push(recursLevel);

        thisNodeCode = [...thisNodeCode, ...addComparisonVariableDeclaration( currentNode,generator)];
        let edgeToVisit: Edge[] = currentNode.outputEdges;
        
        


        for(let edge of edgeToVisit){
            
            let guards: string[] = [];
            for(let guard of edge.guards){
                //console.log(guardList)
                
                if (guard.$instructionType=== "verifyEqualInstruction"){
                    let g = guard as VerifyEqualInstruction;
                    guards.push(generator.createEqualsVerif(g.n1,g.n2))
                } 
            }

            let insideOfIf:string[];

            insideOfIf = addCorrespondingCode(currentNode,ccfg,generator);
            insideOfIf = [...insideOfIf, ...visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ generator)]; 
                        
            
            //special case for choice node when directly linked to join node
            if((edge.to.getType() == "AndJoin" || edge.to.getType() == "OrJoin") && currentNode.functionsDefs.length == 0){
                if(currentNode.returnType == undefined){
                    let ptns: Node[] = getPreviousTypedNodes(currentNode.inputEdges[0]);
                    if(ptns.length > 1){
                        console.log(chalk.red(currentNode.uid+" : multiple previous typed nodes not handled here"))
                    }
                    let ptn = ptns[0]     
                    insideOfIf = [...insideOfIf, ...addQueuePushCode(edge.to.uid, ptn, ccfg,  ptn.functionsNames[0],generator)];
                }else{
                    insideOfIf = [...insideOfIf, ...addQueuePushCode(edge.to.uid, currentNode, ccfg,  currentNode.functionsNames[0],generator)];
                }
            }
            thisNodeCode = [...thisNodeCode , ...generator.createIf(guards,insideOfIf)];   
        }

        break;
        }
    } 
    
    if(continuations.length > 0){
        // console.log("recursLevel = "+recursLevel+" continuationsRecursLevel = "+continuationsRecursLevel.at(-1))
        while (recursLevel == continuationsRecursLevel.at(-1)){
            let toVisit = continuations.pop();
            continuationsRecursLevel.pop();
            if(toVisit != undefined){
                // console.log("continuation of "+toVisit.uid + " from "+currentNode.uid + " nbVisit = "+toVisit.numberOfVisits)
                thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, toVisit, /*nextUntilUID,*/ generator)];
            }
        }   
    }
    recursLevel = recursLevel - 1;
    return thisNodeCode;
}
function getCurrentUID(node: Node): number {
    return node.uid;
}

function addCorrespondingCode(currentNode: Node, ccfg: CCFG,generator:IGenerator):string[] {
    
    if(!debug && currentNode.functionsDefs.length == 0){
        return []
    }
    if(debug){
        /*codeFile.append(`
        #if DEBUG
            std::cout<<"${currentNode.uid} : ${currentNode.getType()}" <<std::endl;
        #endif
        `);*/
    }

    if(currentNode.returnType == undefined){
        return []
    }
    let res:string[] = [];
    if(currentNode.functionsNames == undefined || currentNode.functionsNames.length == 0){
        let queueUID = queueUidToPushIn(currentNode)
        res = [...res, ...addQueuePushCode(queueUID, currentNode, ccfg, undefined,generator)];
        return res;
    }
    currentNode.functionsNames.forEach(f => {
        let paramNames = getParameterNames(currentNode);
        res =[...res ,...generator.createFuncCall(f,paramNames,currentNode.returnType || "void")];
        if(currentNode.functionsDefs.length == 0){
            return []
        }
        

        let queueUID = queueUidToPushIn(currentNode)
        res =[...res ,...addQueuePushCode(queueUID, currentNode, ccfg, f,generator)];
        return res
    });
    
    return res;
}



function queueUidToPushIn(n: Node): number|undefined {
    for(let e of n.outputEdges){
        if (e.to.getType() == "AndJoin" || e.to.getType() == "OrJoin"){
            return e.to.uid
        }
        if(e.to.functionsDefs.length == 0 && !(e.to.getType() == "Fork" || e.to.getType() == "Choice")){
            let uid = queueUidToPushIn(e.to)
            if(uid != undefined){
                return uid
            }
        }
    }
    return undefined
}
/////   todo : add the code to push in the queue
function addQueuePushCode(queueUID: number | undefined, currentNode: Node, ccfg: CCFG, f: string|undefined, generator:IGenerator): string[] {
    
    let res:string[] = [];
    if (queueUID != undefined) {
        
        let syncNode = ccfg.getNodeByUID(queueUID);
        if (syncNode == undefined) {
            throw new Error("syncNode is undefined uid = " + queueUID);
        }
        let ptns = getPreviousTypedNodes(syncNode.inputEdges[0]);
        if (ptns.length > 1) {
            throw new Error("multiple previous typed nodes not handled here");
        }
//        let ptn = ptns[0];
        if(!createdQueueIds.includes(queueUID)){
            createdQueueIds.push(queueUID);
            if (syncNode.returnType != undefined && syncNode.returnType != "void") {
                
                res = [...res, ...generator.createLockingQueue(syncNode.returnType,queueUID)];
            } else {
                
                res = [...res, ...generator.createSynchronizer(queueUID)];
            }
        }
        //codeFile.append(`{\n`)
        if (currentNode.returnType == undefined || currentNode.returnType == "void" || f == undefined) {

            res = [...res, ...generator.activateSynchronizer(queueUID)];
        } else {
            res = [...res, ...generator.sendToQueue(queueUID,currentNode.returnType || "void",`result${f}`)]
        }
        if(syncNode.isCycleInitiator){
           res = [...res, ...generator.setLoopFlag(queueUID)];
        }
        //codeFile.append(`}\n`)
        return res;
    }
    return []
}

function getParameterNames(currentNode: Node): string[] {
    let res: string[] = []
    if(currentNode.params.length > 0){
        if(currentNode.getType() == "AndJoin" ){
            if(currentNode.functionsDefs.length == 0){ //take care parameters are actual parameters not the one added to be able to unpop
                return res
            }
            for(let i: number = 0; i < currentNode.params.length; i = i +1){
                res.push(`${currentNode.getType()}Popped_${currentNode.uid}_${i}`);
            }
            return res
        }
        if (currentNode.getType() == "OrJoin"){
            if(currentNode.functionsDefs.length == 0){ //take care parameters are actual parameters not the one added to be able to unpop
                return res
            }
            res.push(`${currentNode.getType()}Popped_${currentNode.uid}`);
            return res
        }
        for(let ie of currentNode.inputEdges){
            let ptns: Node[] = getPreviousTypedNodes(ie, true)
            for(let ptn of ptns){
                if((ptn.getType() == "AndJoin" || ptn.getType() == "OrJoin") && ptn.functionsDefs.length == 0){ 
                    res.push(`${ptn.getType()}Popped_${ptn.uid}`);
                }else{
                    res.push(`result${ptn.functionsNames[0]}`);
                }
            }
        }
    }
    return res
}
function getPreviousTypedNodes(ie: Edge, stopAlsoOnNoCodeJoinNode = false): Node[] {
    let ptn: Node = ie.from
    let res : Node[] = []
    if (ptn.returnType != undefined && stopAlsoOnNoCodeJoinNode){
        res.push(ptn)
        return res
    }
    if (ptn.returnType != undefined && ! stopAlsoOnNoCodeJoinNode && ptn.functionsDefs.length > 0){
        res.push(ptn)
        return res
    }
          
    for(let e of ptn.inputEdges){
        res = [...res, ...getPreviousTypedNodes(e,stopAlsoOnNoCodeJoinNode)]  
    }
    return res;
}
//////////// todo : add the code to do the comparison
function addComparisonVariableDeclaration(currentNode: Node,generator:IGenerator) : string[] {
    for(let ie of currentNode.inputEdges){
        let ptnsWithJoin = getPreviousTypedNodes(ie, true);
        let realPtns = getPreviousTypedNodes(ie, false);
        let comparisonVariableCode:string[] = [];
        for (let i = 0; i < realPtns.length; i++) {
            let realPtn = realPtns[i];
            if(realPtn.returnType != "void"){
                let lastDefStatement = realPtn.functionsDefs[realPtn.functionsDefs.length-1];
                let lastDefStatementSplit = lastDefStatement.toString().split(",");
                let returnedVariableName = lastDefStatementSplit[lastDefStatementSplit.length-1];
                returnedVariableName = returnedVariableName.substring(0, returnedVariableName.length-1); //remove semicolum
                let ptn = ptnsWithJoin[0];
                if(ptn.getType() == "AndJoin" || ptn.getType() == "OrJoin"){
                    comparisonVariableCode= [...comparisonVariableCode,...generator.createVar(ptn.returnType || "void",returnedVariableName), ...generator.assignVar(returnedVariableName,ptn.params[i].name)];
                }else{
                    comparisonVariableCode= [...comparisonVariableCode,...generator.createVar(ptn.returnType || "void",returnedVariableName),...generator.assignVar(returnedVariableName,`result${ptn.functionsNames[0]}`)];
                    
                    
                }
            }
        }
        return comparisonVariableCode;
    }
    return []
}

