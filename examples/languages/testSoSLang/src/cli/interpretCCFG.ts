import fs from 'fs';
import {  CompositeGeneratorNode, MultiMap, toString } from 'langium';
import path from 'path';
import { Model } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { CCFGVisitor } from './generated/testFSE';
import { CCFG, Edge, Node } from '../ccfg/ccfglib';
import {IGenerator} from './GeneratorInterface';
import chalk from 'chalk';
import {  TempValueList/*,TempValue,StackTempList*/ } from './TempValueList';
import { TypedElement } from "../ccfg/ccfglib";



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

    interpretfromCCFG(ccfg);

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

async function interpretfromCCFG(ccfg:CCFG){
    const sigma: Map<string, any> = new Map<string, any>();
    const stack= new Stack();
    if(ccfg.initialState){
        await visitAllNodesInterpret(ccfg.initialState,sigma,stack);
    } 
}


function doGenerateCode(codeFile: CompositeGeneratorNode, ccfg: CCFG, debug: boolean, generator: IGenerator) {
    let initNode = ccfg.initialState;
    if (initNode == undefined) {
        console.log("No initial state found");
        return;
    }

    generator.createBase(codeFile,debug);
    compileFunctionDefs(ccfg,generator,codeFile);

    
    let currentNode = initNode;
    let insideMain:string[] = visitAllNodes(ccfg, currentNode, /*-1,*/ codeFile,generator, true);
    generator.createMainFunction(codeFile,insideMain);
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
                        let allFDefs:string[] = [];
                        for (let fdef of node.functionsDefs) {
                            let b = fdef.split(",");
                            if (b[0] == ret) {
                                allFDefs= [...allFDefs, ...generator.returnVar(codeFile,b[1])];
                            }else if (b[0]==createVar){
                                allFDefs = [...allFDefs, ...generator.createVar(codeFile,b[1], b[2])];
                            }else if (b[0]==assignVar){
                                allFDefs=[...allFDefs, ...generator.assignVar(codeFile,b[1], b[2])];
                            } else if (b[0]==setVarFromGlobal){
                                allFDefs =[...allFDefs, ...generator.setVarFromGlobal(codeFile,b[1], b[2], b[3])];
                            } else if (b[0]==createGlobalVar){
                                allFDefs=[...allFDefs, ...generator.createGlobalVar(codeFile,b[1], b[2])];
                            } else if (b[0]==setGlobalVar){
                                allFDefs=[...allFDefs, ...generator.setGlobalVar(codeFile,b[1], b[2], b[3])];
                            } else if (b[0]==operation){
                                allFDefs=[...allFDefs, ...generator.operation(codeFile,b[1], b[2], b[3], b[4])];
                            } else{
                                console.log("Unknown function definition: "+b[0]);
                                allFDefs = [...allFDefs, fdef];
                            }

                        }
                        //console.log("function name: "+fname+ " allFDefs = "+allFDefs);
                        generator.createFunction(codeFile,fname, node.params, node.returnType,allFDefs);
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
function visitAllNodes(ccfg: CCFG, currentNode: Node, codeFile: CompositeGeneratorNode, generator: IGenerator, visitIsStarting: boolean = false): string[] {
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
        thisNodeCode = [...thisNodeCode, ...addCorrespondingCode(codeFile, currentNode,ccfg,generator)];
        if(currentNode.outputEdges.length > 1){

            let edgeToVisit: Edge[] = currentNode.outputEdges;
            for(let edge of edgeToVisit){
                continuationsRecursLevel.push(recursLevel-1);
                ///todo  à quoi ce truc sert ? ------------------------------------------------------------------------------------------------
                //codeFile.append(`
                //{`)
                thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, edge.to, /*untilUID,*/ codeFile,generator)];
                //codeFile.append(`
                //}`);

            }
        }else{
            let edge = currentNode.outputEdges[0];
            thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg,edge.to, /*untilUID,*/ codeFile,generator)];
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
                        if(ptn.returnType != "void"){
                            thisNodeCode = [...thisNodeCode, ...generator.createLockingQueue(codeFile,ptn.returnType,syncUID)];
                        }else{
                            thisNodeCode = [...thisNodeCode, ...generator.createSynchronizer(codeFile,syncUID)];
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
                thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ codeFile,generator)];
                if(edge.to.isCycleInitiator){
                    thisNodeCode = [...thisNodeCode, ...addQueuePushCode(edge.to.uid,edge.to,ccfg,codeFile,undefined,generator)];
                }
            }else{
                fifoThreadUid.add(currentNode.uid,edge.to.uid);
                let insideThreadCode:string[] ;
                insideThreadCode = visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ codeFile,generator);
                thisNodeCode = [...thisNodeCode, ...generator.createAndOpenThread(codeFile,edge.to.uid,insideThreadCode)];
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
                thisNodeCode = [...thisNodeCode, ...generator.waitForSynchronizer(codeFile,currentNode.uid)];
            } else {
                thisNodeCode = [...thisNodeCode, ...generator.createVar(codeFile,paramType || "void",paramName)];
                thisNodeCode = [...thisNodeCode, ...generator.receiveFromQueue(codeFile,currentNode.uid,paramType||"void", paramName)];
            }
        }
        thisNodeCode = [...thisNodeCode, ...addCorrespondingCode(codeFile, currentNode,ccfg,generator)];
        let nextNode = currentNode.outputEdges[0].to
        thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg,nextNode, /*untilUID,*/ codeFile,generator)];
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
                thisNodeCode = [...thisNodeCode, ...generator.createFlagToGoBackTo(codeFile,currentNode.uid)];
            }
            if (paramType == "void" || paramType == undefined){
                thisNodeCode = [...thisNodeCode, ...generator.waitForSynchronizer(codeFile,currentNode.uid)];
            } else {
                thisNodeCode = [...thisNodeCode, ...generator.createVar(codeFile,paramType || "void",paramName)];
                thisNodeCode = [...thisNodeCode, ...generator.receiveFromQueue(codeFile,currentNode.uid,paramType||"void", paramName)];
            }
            let nextNode = currentNode.outputEdges[0].to
            thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg,nextNode, /*untilUID,*/ codeFile,generator)];
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
                    
                    thisNodeCode = [...thisNodeCode, ...generator.createSynchronizer(codeFile,syncUID)];
                }
            }
        }

        continuationsRecursLevel.push(recursLevel);

        thisNodeCode = [...thisNodeCode, ...addComparisonVariableDeclaration(codeFile, currentNode,generator)];
        let edgeToVisit: Edge[] = currentNode.outputEdges;
        
        


        for(let edge of edgeToVisit){
            
            let guards: string[] = [];
            for(let guard of edge.guards){
                const guardList=guard.split(",")
                //console.log(guardList)
                
                if (guardList[0] === verifyEqual){
                    guards.push(generator.createEqualsVerif(guardList[1],guardList[2]))
                } 
            }

            let insideOfIf:string[];

            insideOfIf = addCorrespondingCode(codeFile,currentNode,ccfg,generator);
            insideOfIf = [...insideOfIf, ...visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ codeFile,generator)]; 
                        
            
            //special case for choice node when directly linked to join node
            if((edge.to.getType() == "AndJoin" || edge.to.getType() == "OrJoin") && currentNode.functionsDefs.length == 0){
                if(currentNode.returnType == undefined){
                    let ptns: Node[] = getPreviousTypedNodes(currentNode.inputEdges[0]);
                    if(ptns.length > 1){
                        console.log(chalk.red(currentNode.uid+" : multiple previous typed nodes not handled here"))
                    }
                    let ptn = ptns[0]     
                    insideOfIf = [...insideOfIf, ...addQueuePushCode(edge.to.uid, ptn, ccfg, codeFile, ptn.functionsNames[0],generator)];
                }else{
                    insideOfIf = [...insideOfIf, ...addQueuePushCode(edge.to.uid, currentNode, ccfg, codeFile, currentNode.functionsNames[0],generator)];
                }
            }
            thisNodeCode = [...thisNodeCode , ...generator.createIf(codeFile,guards,insideOfIf)];   
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
                thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, toVisit, /*nextUntilUID,*/ codeFile,generator)];
            }
        }   
    }
    recursLevel = recursLevel - 1;
    return thisNodeCode;
}
function getCurrentUID(node: Node): number {
    return node.uid;
}

function addCorrespondingCode(codeFile: CompositeGeneratorNode, currentNode: Node, ccfg: CCFG,generator:IGenerator):string[] {
    
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
    currentNode.functionsNames.forEach(f => {
        let paramNames = getParameterNames(currentNode);
        res =[...res ,...generator.createFuncCall(codeFile,f,paramNames,currentNode.returnType || "void")];
        if(currentNode.functionsDefs.length == 0){
            return []
        }
        

        let queueUID = queueUidToPushIn(currentNode)
        res =[...res ,...addQueuePushCode(queueUID, currentNode, ccfg, codeFile, f,generator)];
        return res;
    });
    if(currentNode.functionsNames.length == 0){
        let queueUID = queueUidToPushIn(currentNode)
        res = [...res, ...addQueuePushCode(queueUID, currentNode, ccfg, codeFile, undefined,generator)];
    }
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
function addQueuePushCode(queueUID: number | undefined, currentNode: Node, ccfg: CCFG, codeFile: CompositeGeneratorNode, f: string|undefined, generator:IGenerator): string[] {
    
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
            res = [...res, ...generator.createSynchronizer(codeFile,queueUID)];
        }
        //codeFile.append(`{\n`)
        if (currentNode.returnType == undefined || currentNode.returnType == "void" || f == undefined) {

            res = [...res, ...generator.activateSynchronizer(codeFile,queueUID)];
        } else {
            res = [...res, ...generator.sendToQueue(codeFile,queueUID,currentNode.returnType || "void",`result${f}`)]
        }
        if(syncNode.isCycleInitiator){
            res = [...res, ...generator.goToFlag(codeFile,queueUID)];
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
function addComparisonVariableDeclaration(codeFile: CompositeGeneratorNode, currentNode: Node,generator:IGenerator) : string[] {
    for(let ie of currentNode.inputEdges){
        let ptnsWithJoin = getPreviousTypedNodes(ie, true);
        let realPtns = getPreviousTypedNodes(ie, false);
        let comparisonVariableCode:string[] = [];
        for (let i = 0; i < realPtns.length; i++) {
            let realPtn = realPtns[i];
            if(realPtn.returnType != "void"){
                let lastDefStatement = realPtn.functionsDefs[realPtn.functionsDefs.length-1];
                let lastDefStatementSplit = lastDefStatement.split(",");
                let returnedVariableName = lastDefStatementSplit[lastDefStatementSplit.length-1];
                returnedVariableName = returnedVariableName.substring(0, returnedVariableName.length-1); //remove semicolum
                let ptn = ptnsWithJoin[0];
                if(ptn.getType() == "AndJoin" || ptn.getType() == "OrJoin"){
                    comparisonVariableCode= [...comparisonVariableCode,...generator.createVar(codeFile,ptn.returnType || "void",returnedVariableName), ...generator.assignVar(codeFile,returnedVariableName,ptn.params[i].name)];
                }else{
                    comparisonVariableCode= [...comparisonVariableCode,...generator.createVar(codeFile,ptn.returnType || "void",returnedVariableName),...generator.assignVar(codeFile,returnedVariableName,`result${ptn.functionsNames[0]}`)];
                    
                    
                }
            }
        }
        return comparisonVariableCode;
    }
    return []
}









/******************************************************************************INTERPRETER******************************************************/
class Stack {
    fork: number[];                             //number of the fork children
    resRight : number[][];                        //value outside of a fork
    forkNode : Node[];                        //node uid
    tempValueList : TempValueList<number>;      //value inside of a fork
    tempChildren : TempValueList<Node>;          //node.uid
    tempFunction : TempValueList<(...args: any[]) => any>;
    

    constructor() {
        this.fork = [];
        this.forkNode = [];
        this.resRight = [];
        this.tempValueList = new TempValueList<number>();
        this.tempChildren = new TempValueList<Node>();
        this.tempFunction = new TempValueList<(...args: any[]) => any>;
    }
}

// browse the ccfg sart with a given node
async function visitAllNodesInterpret(initialState : Node , sigma: Map<string, any>, stack: Stack){
    var currentNode : Node = initialState;
    while(currentNode.outputEdges && ((currentNode.outputEdges[0] && currentNode.outputEdges[0].to) || (currentNode.outputEdges[1] && currentNode.outputEdges[1].to))){
        let node = currentNode;
        if(node.uid == 16){
            console.log("hihi");
        }
        switch(node.getType()){
            case "Step":{
                console.log(node.uid + ": (" + node.getType() + ")->");
                if(node.functionsDefs.length > 0){
                    nodeCode(node,sigma,stack);//define function written in node; call function & store function value
                }
                currentNode = node.outputEdges[0].to;
                if((stack.forkNode.length!=0) && (node.uid == stack.forkNode[stack.forkNode.length-1].uid -1)){ //the end point of a fork
                    stack.tempChildren.last().list.pop();
                    if(stack.tempChildren.last().list.length > 0){//check if we are in a fork node
                        // go back to fork node
                        currentNode = stack.forkNode[stack.forkNode.length-1];
                        /*await visitAllNodes(stack.forkNode[stack.forkNode.length-1],sigma,stack).then(function(){
                            return;
                        });*/
                    }else{//check if we have visited all children of the current fork
                        stack.forkNode.pop();                       //if yes, get out of the current fork
                        stack.fork.pop();
                        stack.tempChildren.reduce();
                    }
                }
                /*
                else{
                    if(node.cycles.length!=0){
                        currentNode = node.outputEdges[0].to;
                    }
                }
                */
                break;
            }
            case "Fork":{//define forks' children
                console.log(node.uid + ": (" + node.getType() + ")->");
                
                //console.log("the length of the current fork:"+ forkList[forkList.length-1]); //nombre of the children which are not executed of the current fork
                let forklist = stack.forkNode;
                if( forklist[forklist.length-1] == undefined || stack.forkNode[forklist.length-1].uid != node.uid ){ //the 1st time to visit this fork node
                    let children = currentNode.outputEdges;
                    stack.tempValueList.addTempValue(children.length);         //reserve places in stack : value
                    stack.tempFunction.addTempValue(children.length);          //reserve places in stack : Function
                    stack.tempChildren.addTempValue(children.length);
                    stack.fork.push(children.length);                          //get in the fork
                    stack.forkNode.push(node);                                 //start node's uid  

                    children.forEach(element => {                               //copy chidren list
                        let nextNode = element.to; 
                        stack.tempChildren.addValueLast(nextNode);
                    });
                }

                //visit children (sub-tree)
                if(stack.tempChildren.last().list.length != 0){
                    currentNode = stack.tempChildren.last().list[stack.tempChildren.last().list.length-1];
                }else{
                    return;
                }

                break;
            }
            case "AndJoin":{//reduce (fork children) & call function difined which are store in the stack
                console.log(node.uid + ": (" + node.getType() + ")->");
                await handleJoinNode(stack,node,sigma).then(function(){
                    currentNode = node.outputEdges[0].to;
                });
                break;
            }
            
            /*
            case "Choice":{
                console.log(node.uid + ": (" + node.getType() + ")->");
                let nodeTrue : Node | undefined;
                let nodeFalse : Node | undefined;
                //get resRight
                let resRight: number = stack.resRight[stack.resRight.length-1];
                //evaluation of each edge of choice
                node.outputEdges.forEach(edge => {
                    let bool: boolean = evaluateEdgeLable(edge,resRight);
                    if (bool) {
                        nodeTrue = edge.to;
                    } 
                    else {
                        nodeFalse = edge.to;
                    }
                });
                //decide what is the next node accroding to the value of resRight
                if(nodeTrue && nodeFalse){
                    if (stack.resRight[stack.resRight.length-1]){//if resRight
                        currentNode = nodeTrue;//next node is the false node
                    }
                    else {
                        currentNode = nodeFalse;//next node is the true node
                    }
                    stack.resRight.pop();
                }
                else{
                    console.log("trueNode | flaseNode doesn't existe at node.uid ="+ node.uid);
                    return;
                }
                break;
            }

            case "OrJoin":{
                console.log(node.uid + ": (" + node.getType() + ")->");
                let promiseList = stack.tempPromiseFunction;
                if(node.cycles.length!=0 && promiseList.getLength()!=0){
                    //let cycle = node.cycles;
                    //let next = cycle[0][1];// begin.uid = 39
                    //visitAllNodes(next,sigma,stack);
                    //let end = cycle[cycle.length-1];//end.uid = 18
                    defineAsyncFunction(promiseList);           //call promiseList 
                    stack.tempPromiseFunction.reduce();
                    stack.tempValueList.reduce();

                    stack.tempPromiseFunction.addTempValue(stack.fork[stack.fork.length-1]);
                    stack.tempValueList.addTempValue(stack.fork[stack.fork.length-1]);
                }
                currentNode = node.outputEdges[0].to;
                break;
            }*/
        }

    }
    console.log(sigma);
    console.log(stack);
}

//evaluate the functions that are in the nodes
//define function; the defined function takes sigma and a list of number as parametre.
function defineFunction(functionName: string, functionParamList: TypedElement[], functionBody: string[], sigma: Map<any, any>): (...args: any[]) => any {
    return new Function('sigma', 'liste', `return function ${functionName}(liste) {
        ${functionParamList.reverse().map((param, index) => `let ${param.name} = liste[${index}];\n`).join('')}
        ${functionBody.join('\n')}
        \n}`)(sigma);
}

function nodeCode(node:Node,sigma:Map<string,any>,stack:Stack):void{
    let functionName="function" + node.functionsNames[0];
    let f = defineFunction(functionName,node.params,node.functionsDefs,sigma);
    let tempValueL = stack.tempFunction;

    if((stack.fork.length != 0) ){
        tempValueL.addValueLast(f);
        if(node.params.length == 0){
            stack.tempValueList.addTempValue(1);//add an empty list
        }
    }else{
        //not in a fork, call function 
        if(node.params.length < 1){         //call function without params
            if(node.returnType == "void" ){
                console.log(f());
            }
        }
        else{                               //call function with params
            if(node.returnType == "void"){
                let param = stack.tempValueList.last().list;
                console.log(f(param));
                stack.tempValueList.reduce();
            }else{//store returned value
                stack.tempValueList.addTempValue(1);
                let param = stack.tempValueList.last();
                stack.tempValueList.addValueLast(f(param));
                stack.tempValueList.reduce();
            }
        }
    }
}

//If the Andjoin node in a fork or not!**********************************************************************
/*
function joinNode(node:Node,sigma:Map<string,any>,stack:Stack):void{
    if(node.functionsDefs.length!=0){
        let functionName="function" + node.functionsNames[0];
        let f = defineFunction(functionName,node.params,node.functionsDefs,sigma);
        let l = stack.tempValueList.last().list;
        console.log(functionName + " return " + f(l))
        stack.tempValueList.addValueLast(f(l))
    }
}

function evaluateEdgeLable(edge : Edge, resRight:number):boolean{
    //get code from: "(VarRef3_4_3_6terminates == true)"
    let edgeLable: string = edge.guards[0];
    let match = edgeLable.match(/\((.*?)\)/);    //"VarRef3_4_3_6terminates == true"
    let code: string| null = match ? match[1] : null;
    let varName: string | null = null;
    //get variable name "VarRef3_4_3_6terminates"
    if (code) {
        let parts = code.split('==');
        if (parts[0]){
            varName = parts[0].trim();
        }
    }
    let bool : boolean = eval(`
        if(${resRight} > 0){
        ${varName} = 1;\n
        }else{
            ${varName} = 0;\n
        }\n
        ${code};
        `)
    return bool;
}
*/

/**************************************Asycn********************************************/

function waitParam(fList:Array<(...args: any[]) => any>, tempfunctionValue:TempValueList<number>) {
    let paramListPromise:number[][]= [];//copy value destination
        //count nombre of the function, and take the same number of the value list from the end of the tempvaleurList
        let nombreOfFunction : number = fList.length;
        let numberOfValueList : number = tempfunctionValue.getLength();
            
        for(let i = numberOfValueList-nombreOfFunction; i < numberOfValueList ; i++){
            let list : number[] = [...tempfunctionValue.last().list];
            paramListPromise.push(list);
            tempfunctionValue.reduce();
        }
        

    return new Promise<void>(function(resolve) {
        console.log("yes0");
        paramListPromise=getMirror(paramListPromise);
        fList.map((f, index) => {
            if(f(paramListPromise[index]) != undefined){
                tempfunctionValue.addValueLast(f(paramListPromise[index]));
                console.log("yes1 : function return "+ f(paramListPromise[index]));
            }else{
                console.log(f(paramListPromise[index]));
                console.log("yes2 : function type void");
            }   
        }
        );
        resolve();
    });
}


//with function list
async function handleJoinNode(stack:Stack,node:Node,sigma:Map<string,any>) {
    let forkList: number[] = stack.fork;
    forkList[forkList.length - 1]--;
    
    if(forkList[forkList.length-1]==0 ){//have visited all children of the current fork
        await waitParam(stack.tempFunction.last().list, stack.tempValueList).then(function(){//call children s fonctions; resultat stroed in stack
            console.log("yes3");
            stack.tempFunction.reduce();
            //code in AndJoin Node
            if (node.functionsDefs.length != 0){
                let functionName="function" + node.functionsNames[0];
                let f = defineFunction(functionName,node.params,node.functionsDefs,sigma);
                let paramList = [...stack.tempValueList.last().list];
                stack.tempValueList.reduce();
                if(f(paramList) != undefined){
                    stack.tempValueList.addTempValue(1);
                    stack.tempValueList.addValueLast(f(paramList));
                }else{
                    console.log(f(paramList));
                }
            }else{
                stack.tempValueList.reduce();
            }
        });
    } 
}


function getMirror(list: number[][]): number[][] {
    let listMirror: number[][] = [];
    while (list.length > 0) {
        let ele = list.pop();
        if (ele) {
            listMirror.push(ele);
        }
    }
    return listMirror;
}