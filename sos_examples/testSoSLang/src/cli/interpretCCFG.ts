import fs from 'fs';
import {  CompositeGeneratorNode, MultiMap, toString } from 'langium';
import path from 'path';
import { Model } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { CCFGVisitor } from './generated/testFSE';
import { CCFG, Edge, Node } from '../ccfg/ccfglib';
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
let debug = false;

export function generatefromCCFG(model: Model, filePath: string, targetDirectory: string | undefined, doDebug: boolean|undefined, generator:IGenerator): string {
    const data = extractDestinationAndName(filePath, targetDirectory);
    

    const generatedDotFilePath = `${path.join(data.destination, data.name)}.dot`;
    const dotFile = new CompositeGeneratorNode();

    
    let ccfg = doGenerateCCFG(dotFile, model);

    const generatedCodeFilePath = generator.nameFile(`${path.join(data.destination, data.name)}`);
    const codeFile = new CompositeGeneratorNode();
    let debug: boolean = false;

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedDotFilePath, toString(dotFile));


    debug = doDebug != undefined ? doDebug : false;

    doGenerateCode(codeFile, ccfg, debug, generator);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedCodeFilePath, toString(codeFile));

    return generatedDotFilePath;
}
function doGenerateCode(codeFile: CompositeGeneratorNode, ccfg: CCFG, debug: boolean, generator: IGenerator) {
    let initNode = ccfg.initialState;
    if (initNode == undefined) {
        console.log("No initial state found");
        return;
    }

    generator.createBase(codeFile,debug);
    compileFunctionDefs(ccfg,generator,codeFile);

    generator.createMainFunction(codeFile);
    
    let currentNode = initNode;
    visitAllNodes(ccfg, currentNode, /*-1,*/ codeFile,generator, true);
    generator.endSection(codeFile);

    generator.endFile(codeFile);
}



function doGenerateCCFG(codeFile: CompositeGeneratorNode, model: Model): CCFG {
    var visitor = new CCFGVisitor();
    visitor.visit(model);

    var ccfg = visitor.ccfg
   
    ccfg.addSyncEdge()

    ccfg.detectCycles();
    ccfg.collectCycles()

    codeFile.append(ccfg.toDot());
    return ccfg;
}

function compileFunctionDefs(ccfg: CCFG,generator:IGenerator,codeFile:CompositeGeneratorNode): string {
    let functionsDefs = "";
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
                        generator.createFunction(codeFile,fname, node.params, node.returnType);
                        for (let fdef of node.functionsDefs) {
                            let b = fdef.split(",");
                            if (b[0] == ret) {
                                generator.returnVar(codeFile,b[1]);
                            }else if (b[0]==createVar){
                                generator.createVar(codeFile,b[1], b[2]);
                            }else if (b[0]==assignVar){
                                generator.assignVar(codeFile,b[1], b[2]);
                            } else if (b[0]==setVarFromGlobal){
                                generator.setVarFromGlobal(codeFile,b[1], b[2], b[3]);
                            } else if (b[0]==createGlobalVar){
                                generator.createGlobalVar(codeFile,b[1], b[2]);
                            } else if (b[0]==setGlobalVar){
                                generator.setGlobalVar(codeFile,b[1], b[2], b[3]);
                            } else if (b[0]==operation){
                                generator.operation(codeFile,b[1], b[2], b[3], b[4]);
                            } else{
                                console.log("Unknown function definition: "+b[0]);
                            }

                        }
                        generator.endSection(codeFile);
                    }
                }
            }
        // }
    }
    return functionsDefs;
}

let fifoThreadUid : MultiMap<number,number> = new MultiMap();
let continuations: Node[] = []
let continuationsRecursLevel: number[] = []
let visitedUID: number[] = []
let recursLevel = 0;
let createdQueueIds: number[] = []
function visitAllNodes(ccfg: CCFG, currentNode: Node, codeFile: CompositeGeneratorNode, generator: IGenerator, visitIsStarting: boolean = false) {
    recursLevel = recursLevel + 1;
    let currentUID:number = getCurrentUID(currentNode);

    if (currentNode.outputEdges.length == 0 /*|| currentUID == untilUID*/) {
        return
    }



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
                return
            }
            // console.log("do not visit "+currentNode.uid  + " nbVisit = "+currentNode.numberOfVisits + " inputEdges = "+currentNode.inputEdges.length)
            return
        }
        
        if (currentNode.numberOfVisits == currentNode.inputEdges.length){        
            if(! continuations.includes(currentNode)){
                if(currentNode.isCycleInitiator){
                    continuationsRecursLevel.push(recursLevel-1);
                    currentNode.numberOfVisits = currentNode.inputEdges.length;
                }
                continuations.push(currentNode);
            }
            return
        }
    }  
    
    if (visitedUID.includes(currentUID)){
        return
    }
    visitedUID.push(currentUID);
    // console.log("visit "+currentNode.uid  + " nbVisit = "+currentNode.numberOfVisits)


    // if(currentNode.cycles.length > 0){
    //     console.log("cycle detected in" + currentNode.uid+":"+currentNode.cycles.map(c => c.map(n => n.uid).join("->")).join(" | "))
    // }
    switch(currentNode.getType()){
    case "Step":
        {
        addCorrespondingCode(codeFile, currentNode,ccfg,generator);
        if(currentNode.outputEdges.length > 1){

            let edgeToVisit: Edge[] = currentNode.outputEdges;
            for(let edge of edgeToVisit){
                continuationsRecursLevel.push(recursLevel-1);
                ///todo  à quoi ce truc sert ? ------------------------------------------------------------------------------------------------
                //codeFile.append(`
                //{`)
                visitAllNodes(ccfg, edge.to, /*untilUID,*/ codeFile,generator);
                //codeFile.append(`
                //}`);

            }
        }else{
            let edge = currentNode.outputEdges[0];
            visitAllNodes(ccfg,edge.to, /*untilUID,*/ codeFile,generator);
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
                        generator.createSynchronizer(codeFile,syncUID);
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
                visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ codeFile,generator);
                if(edge.to.isCycleInitiator){
                    addQueuePushCode(edge.to.uid,edge.to,ccfg,codeFile,undefined,generator);
                }
            }else{
                fifoThreadUid.add(currentNode.uid,edge.to.uid);
                generator.createAndOpenThread(codeFile,edge.to.uid);
                visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ codeFile,generator);
                generator.endThread(codeFile,edge.to.uid);
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
                generator.waitForSynchronizer(codeFile,currentNode.uid);
            } else {
                generator.createVar(codeFile,paramType || "void",paramName);
                generator.receiveFromQueue(codeFile,currentNode.uid,paramType||"void", paramName);
            }
        }
        addCorrespondingCode(codeFile, currentNode,ccfg,generator);
        let nextNode = currentNode.outputEdges[0].to
        visitAllNodes(ccfg,nextNode, /*untilUID,*/ codeFile,generator);
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
            if(currentNode.isCycleInitiator){
                generator.createQueue(codeFile,currentNode.uid);
            }
            if (paramType == "void" || paramType == undefined){
                generator.waitForSynchronizer(codeFile,currentNode.uid);
            } else {
            generator.createVar(codeFile,paramType || "void",paramName);
            generator.receiveFromQueue(codeFile,currentNode.uid,paramType||"void", paramName);
            }
            let nextNode = currentNode.outputEdges[0].to
            visitAllNodes(ccfg,nextNode, /*untilUID,*/ codeFile,generator);
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
                    
                    generator.createSynchronizer(codeFile,syncUID);
                }
            }
        }

        continuationsRecursLevel.push(recursLevel);

        addComparisonVariableDeclaration(codeFile, currentNode,generator);
        let edgeToVisit: Edge[] = currentNode.outputEdges;
        
        


        for(let edge of edgeToVisit){
            
            let guards: string[] = [];
            for(let guard of edge.guards){
                const guardList=guard.split(",")
                console.log(guardList)
                
                if (guardList[0] === verifyEqual){
                    guards.push(generator.createEqualsVerif(guardList[1],guardList[2]))
                } 
            }

            let insideOfIf:CompositeGeneratorNode= new CompositeGeneratorNode();

            addCorrespondingCode(insideOfIf, currentNode,ccfg,generator);
            visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ insideOfIf,generator); 
                        
            
            //special case for choice node when directly linked to join node
            if((edge.to.getType() == "AndJoin" || edge.to.getType() == "OrJoin") && currentNode.functionsDefs.length == 0){
                if(currentNode.returnType == undefined){
                    let ptns: Node[] = getPreviousTypedNodes(currentNode.inputEdges[0]);
                    if(ptns.length > 1){
                        console.log(chalk.red(currentNode.uid+" : multiple previous typed nodes not handled here"))
                    }
                    let ptn = ptns[0]     
                    addQueuePushCode(edge.to.uid, ptn, ccfg, insideOfIf, ptn.functionsNames[0],generator);
                }else{
                    addQueuePushCode(edge.to.uid, currentNode, ccfg, insideOfIf, currentNode.functionsNames[0],generator);
                }
            }
            generator.createIf(codeFile,guards,insideOfIf);   
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
                visitAllNodes(ccfg, toVisit, /*nextUntilUID,*/ codeFile,generator);
            }
        }   
    }
    recursLevel = recursLevel - 1;
    return;
}
function getCurrentUID(node: Node): number {
    return node.uid;
}

function addCorrespondingCode(codeFile: CompositeGeneratorNode, currentNode: Node, ccfg: CCFG,generator:IGenerator) {
    
    if(!debug && currentNode.functionsDefs.length == 0){
        return
    }
    if(debug){
        /*codeFile.append(`
        #if DEBUG
            std::cout<<"${currentNode.uid} : ${currentNode.getType()}" <<std::endl;
        #endif
        `);*/
    }

    if(currentNode.returnType == undefined){
        return
    }

    currentNode.functionsNames.forEach(f => {
        let paramNames = getParameterNames(currentNode);
        generator.createFuncCall(codeFile,f,paramNames,currentNode.returnType || "void");
        if(currentNode.functionsDefs.length == 0){
            return
        }
        

        let queueUID = queueUidToPushIn(currentNode)
        addQueuePushCode(queueUID, currentNode, ccfg, codeFile, f,generator);
    });
    if(currentNode.functionsNames.length == 0){
        let queueUID = queueUidToPushIn(currentNode)
        addQueuePushCode(queueUID, currentNode, ccfg, codeFile, undefined,generator);
    }
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
function addQueuePushCode(queueUID: number | undefined, currentNode: Node, ccfg: CCFG, codeFile: CompositeGeneratorNode, f: string|undefined, generator:IGenerator) {
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
            generator.createSynchronizer(codeFile,queueUID);
        }
        //codeFile.append(`{\n`)
        if (currentNode.returnType == undefined || currentNode.returnType == "void" || f == undefined) {

            generator.activateSynchronizer(codeFile,queueUID);
        } else {
            generator.sendToQueue(codeFile,queueUID,currentNode.returnType || "void",`result${f}`)
        }
        if(syncNode.isCycleInitiator){
            if(currentNode.returnType == undefined || currentNode.returnType == "void" || f == undefined){
                codeFile.append(`goto synch${syncNode.uid};\n`);
            }else{
                codeFile.append(`
                goto queue${syncNode.uid};
                 `);
            }
        }
        //codeFile.append(`}\n`)
    }
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
function addComparisonVariableDeclaration(codeFile: CompositeGeneratorNode, currentNode: Node,generator:IGenerator) {
    for(let ie of currentNode.inputEdges){
        let ptnsWithJoin = getPreviousTypedNodes(ie, true);
        let realPtns = getPreviousTypedNodes(ie, false);
        for (let i = 0; i < realPtns.length; i++) {
            let realPtn = realPtns[i];
            if(realPtn.returnType != "void"){
                let lastDefStatement = realPtn.functionsDefs[realPtn.functionsDefs.length-1];
                let lastDefStatementSplit = lastDefStatement.split(",");
                let returnedVariableName = lastDefStatementSplit[lastDefStatementSplit.length-1];
                returnedVariableName = returnedVariableName.substring(0, returnedVariableName.length-1); //remove semicolum
                let ptn = ptnsWithJoin[0];
                if(ptn.getType() == "AndJoin" || ptn.getType() == "OrJoin"){
                    generator.createVar(codeFile,ptn.returnType || "void",returnedVariableName);
                    generator.assignVar(codeFile,returnedVariableName,ptn.params[i].name);
                }else{
                    generator.createVar(codeFile,ptn.returnType || "void",returnedVariableName);
                    generator.assignVar(codeFile,returnedVariableName,`result${ptn.functionsNames[0]}`);
                    
                }
            }
        }
    }
}
