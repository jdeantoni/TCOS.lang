import fs from 'fs';
import {  CompositeGeneratorNode, MultiMap, toString } from 'langium';
import path from 'path';
import { Model } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { CCFGVisitor } from './generated/testFSE';
import { CCFG, Edge, FunctionDef, Node, TypedElement } from '../ccfg/ccfglib';
import chalk from 'chalk';
import { isType } from 'langium/lib/grammar/generated/ast';


let debug = false;
export function generateCPPfromCCFG(model: Model, filePath: string, targetDirectory: string | undefined, doDebug: boolean|undefined): string {
    const data = extractDestinationAndName(filePath, targetDirectory);

    const generatedDotFilePath = `${path.join(data.destination, data.name)}.dot`;
    const dotFile = new CompositeGeneratorNode();

    const generatedCodeFilePath = `${path.join(data.destination, data.name)}.cpp`;
    const cppFile = new CompositeGeneratorNode();

    let ccfg = doGenerateCCFG(dotFile, model);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedDotFilePath, toString(dotFile));


    debug = doDebug != undefined ? doDebug : false;
    doGenerateCPP(cppFile, ccfg, debug);


    

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedCodeFilePath, toString(cppFile));

    return generatedDotFilePath;
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

function doGenerateCPP(codeFile: CompositeGeneratorNode, ccfg: CCFG, debug: boolean = false): void {
    
    
    
    let initNode = ccfg.initialState;
    if (initNode == undefined) {
        console.log("No initial state found");
        return;
    }
    
    codeFile.append(`
#include <string>
#include <unordered_map>
#include <thread>
#include <mutex>
#include <iostream>
#include <chrono>
#include "../utils/LockingQueue.hpp"

using namespace std::chrono_literals;
`)
if(debug){
    codeFile.append(`
#define DEBUG 1
    `)
}
    codeFile.append(`
class Void{
};

std::unordered_map<std::string, void*> sigma;
std::mutex sigma_mutex;  // protects sigma

`);

    let functionsDefs = ""
    functionsDefs = compileFunctionDefs(ccfg);
    
    codeFile.append(functionsDefs);
    codeFile.append(`
int main() {
    `);

    let currentNode = initNode;
    visitAllNodes(ccfg, currentNode, /*-1,*/ codeFile, true);

    codeFile.append(`
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    `);

}


function compileFunctionDefs(ccfg: CCFG) : string {
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
                        functionsDefs += node.returnType + " function" + fname + `(${node.params.map(p => (p as TypedElement).toString()).join(", ")}){\n\t`;
                        functionsDefs += node.functionsDefs.map(a => a).join("\n\t") + "\n // la \n";
                        functionsDefs += "} //c'est ici\n";
                    }
                }
                else {
                    const FuncDefs = node.functionsDefs as FunctionDef[];
                    for (let func of node.functionsDefs) {
                        
                    
                    }
                }
            }
        // }
    }
    return functionsDefs;
}

function getCurrentUID(node: Node): number {
    return node.uid;
}

let fifoThreadUid : MultiMap<number,number> = new MultiMap();
let continuations: Node[] = []
let continuationsRecursLevel: number[] = []
let visitedUID: number[] = []
let recursLevel = 0;
let createdQueueIds: number[] = []
function visitAllNodes(ccfg:CCFG, currentNode: Node, codeFile: CompositeGeneratorNode, visitIsStarting: boolean = false): void {
    recursLevel = recursLevel + 1;
    let currentUID = getCurrentUID(currentNode);

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
        addCorrespondingCode(codeFile, currentNode,ccfg);
        if(currentNode.outputEdges.length > 1){

            let edgeToVisit: Edge[] = currentNode.outputEdges;
            for(let edge of edgeToVisit){
                continuationsRecursLevel.push(recursLevel-1);
                codeFile.append(`
                {`)
                visitAllNodes(ccfg, edge.to, /*untilUID,*/ codeFile);
                codeFile.append(`
                }
                `);

            }
        }else{
            let edge = currentNode.outputEdges[0];
            visitAllNodes(ccfg,edge.to, /*untilUID,*/ codeFile);
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
                            codeFile.append(`
            LockingQueue<${ptn.returnType}> queue${syncUID};`);
                        }else{
                            codeFile.append(`         
            LockingQueue<Void> queue${syncUID};`);       
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
                visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ codeFile);
                if(edge.to.isCycleInitiator){
                    addQueuePushCode(edge.to.uid,edge.to,ccfg,codeFile,undefined)
                }
            }else{
                fifoThreadUid.add(currentNode.uid,edge.to.uid);
                codeFile.append(`
            std::thread thread${edge.to.uid}([&](){\n`
                );
                visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ codeFile);
                codeFile.append(`
            });
            thread${edge.to.uid}.detach();
                `);
            }
        }

        break;
        }
    case "AndJoin":
        {
        codeFile.append(`
        //start of and join node
        `);
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
            paramType = paramType != "void" ? paramType : "Void"
            codeFile.append(`
        ${paramType} ${paramName};
        queue${currentNode.uid}.waitAndPop(${paramName});
            `);
        }
        addCorrespondingCode(codeFile, currentNode,ccfg);
        codeFile.append(`
        //end of and join node
        `);
        let nextNode = currentNode.outputEdges[0].to
        visitAllNodes(ccfg,nextNode, /*untilUID,*/ codeFile);
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
            paramType = paramType != "void" ? paramType : "Void"
            if(currentNode.isCycleInitiator){
                codeFile.append(`queue${currentNode.uid}:`);
            }
            codeFile.append(` //or join node
        ${paramType} ${paramName};
        queue${currentNode.uid}.waitAndPop(${paramName});
        `);
            let nextNode = currentNode.outputEdges[0].to
            visitAllNodes(ccfg,nextNode, /*untilUID,*/ codeFile);
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
                let ptn = ptns[0]
                if(!createdQueueIds.includes(syncUID)){
                    createdQueueIds.push(syncUID);
                    codeFile.append(`
        LockingQueue<${(ptn.returnType!="void")?ptn.returnType : "Void"}> queue${syncUID};
            `);
                }
            }
        }

        continuationsRecursLevel.push(recursLevel);

        addComparisonVariableDeclaration(codeFile, currentNode);
        let edgeToVisit: Edge[] = currentNode.outputEdges;
        for(let edge of edgeToVisit){
            codeFile.append(`//Choice node`);
            codeFile.append(`
        if(${edge.guards.join(" && ")}){`
                );
                addCorrespondingCode(codeFile, currentNode,ccfg);
                visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ codeFile);                
                
                //special case for choice node when directly linked to join node
                if((edge.to.getType() == "AndJoin" || edge.to.getType() == "OrJoin") && currentNode.functionsDefs.length == 0){
                    if(currentNode.returnType == undefined){
                        let ptns: Node[] = getPreviousTypedNodes(currentNode.inputEdges[0]);
                        if(ptns.length > 1){
                            console.log(chalk.red(currentNode.uid+" : multiple previous typed nodes not handled here"))
                        }
                        let ptn = ptns[0]     
                        addQueuePushCode(edge.to.uid, ptn, ccfg, codeFile, ptn.functionsNames[0]);
                    }else{
                        addQueuePushCode(edge.to.uid, currentNode, ccfg, codeFile, currentNode.functionsNames[0]);
                    
                    }
                }
                codeFile.append(`
            //END IF ${edge.guards.join(" && ")}
        }
            `);
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
                visitAllNodes(ccfg, toVisit, /*nextUntilUID,*/ codeFile);
            }
        }   
    }
    recursLevel = recursLevel - 1;
    return;
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


function addCorrespondingCode(codeFile: CompositeGeneratorNode, currentNode: Node, ccfg: CCFG) {
    
    if(!debug && currentNode.functionsDefs.length == 0){
        return
    }
    if(debug){
        codeFile.append(`
        #if DEBUG
            std::cout<<"${currentNode.uid} : ${currentNode.getType()}" <<std::endl;
        #endif
        `);
    }

    if(currentNode.returnType == undefined){
        return
    }

    currentNode.functionsNames.forEach(f => {
        if(currentNode.returnType != undefined && currentNode.returnType != "void"){
            codeFile.append(`${currentNode.returnType} result${f} = `);
        }
        codeFile.append(`function${f}(`)
        let paramNames = getParameterNames(currentNode);
        let sep = ""
        for(let i = 0; i < paramNames.length; i++){
            codeFile.append(sep+paramNames[i]);
            sep=", "
        }
        codeFile.append(`);\n`);
        if(currentNode.functionsDefs.length == 0){
            return
        }

        let queueUID = queueUidToPushIn(currentNode)
        addQueuePushCode(queueUID, currentNode, ccfg, codeFile, f);
    });
    if(currentNode.functionsNames.length == 0){
        let queueUID = queueUidToPushIn(currentNode)
        addQueuePushCode(queueUID, currentNode, ccfg, codeFile, undefined);
    }
}

function addQueuePushCode(queueUID: number | undefined, currentNode: Node, ccfg: CCFG, codeFile: CompositeGeneratorNode, f: string|undefined) {
    if (queueUID != undefined) {

        let syncNode = ccfg.getNodeByUID(queueUID);
        if (syncNode == undefined) {
            throw new Error("syncNode is undefined uid = " + queueUID);
        }
        let ptns = getPreviousTypedNodes(syncNode.inputEdges[0]);
        if (ptns.length > 1) {
            throw new Error("multiple previous typed nodes not handled here");
        }
        let ptn = ptns[0];
        if(!createdQueueIds.includes(queueUID)){
            createdQueueIds.push(queueUID);
            codeFile.append(`
        LockingQueue<${(ptn.returnType!="void")?ptn.returnType : "Void"}> queue${queueUID};
            `);
        }
        codeFile.append(`{\n`)
        if (currentNode.returnType == undefined || currentNode.returnType == "void" || f == undefined) {
            //create a fake parameter to push in the queue
            codeFile.append(`
            ${(ptn.returnType != "void") ? ptn.returnType : "Void"} fakeParam${queueUID};
            queue${queueUID}.push(fakeParam${queueUID});
                `);
        } else {
            codeFile.append(`
            queue${queueUID}.push(result${f});
                `);
        }
        if(syncNode.isCycleInitiator){
           codeFile.append(`
           goto queue${syncNode.uid};
            `);
        }
        codeFile.append(`}\n`)
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



function addComparisonVariableDeclaration(codeFile: CompositeGeneratorNode, currentNode: Node) {
    for(let ie of currentNode.inputEdges){
        let ptnsWithJoin = getPreviousTypedNodes(ie, true);
        let realPtns = getPreviousTypedNodes(ie, false);
        for (let i = 0; i < realPtns.length; i++) {
            let realPtn = realPtns[i];
            if(realPtn.returnType != "void"){
                let lastDefStatement = realPtn.functionsDefs[realPtn.functionsDefs.length-1];
                let lastDefStatementSplit = lastDefStatement.split(" ");
                let returnedVariableName = lastDefStatementSplit[lastDefStatementSplit.length-1];
                returnedVariableName = returnedVariableName.substring(0, returnedVariableName.length-1); //remove semicolumn
                let ptn = ptnsWithJoin[0];
                if(ptn.getType() == "AndJoin" || ptn.getType() == "OrJoin"){
                    codeFile.append(`
        ${ptn.returnType} ${returnedVariableName} = ${ptn.params[i].name};`);
                }else{
                codeFile.append(`
        ${ptn.returnType} ${returnedVariableName} = result${ptn.functionsNames[0]};`);
                }
            }
        }
    }
}

