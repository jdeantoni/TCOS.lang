import fs from 'fs';
import {  CompositeGeneratorNode, MultiMap, toString } from 'langium';
import path from 'path';
import { Model } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { CCFGVisitor } from './generated/testFSE';
import { CCFG, ContainerNode, Edge, Node, TypedElement } from '../ccfg/ccfglib';


export function generateCCFG(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);

    const generatedDotFilePath = `${path.join(data.destination, data.name)}.dot`;
    const dotFile = new CompositeGeneratorNode();

    const generatedCodeFilePath = `${path.join(data.destination, data.name)}.cpp`;
    const cppFile = new CompositeGeneratorNode();

    //TODO split the code generation in order to do function generation after the main generation
    // const semanticFunctionsHeaderFilePath = `${path.join(data.destination, data.name)}SemanticFunctions.hpp`;
    // const semanticFunctionsHeaderFile = new CompositeGeneratorNode();
    
    // const semanticFunctionsCodeFilePath = `${path.join(data.destination, data.name)}SemanticFunctions.cpp`;
    // const semanticFunctionsCodeFile = new CompositeGeneratorNode();

    let ccfg = doGenerateCCFG(dotFile, model);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedDotFilePath, toString(dotFile));

    
    
    doGenerateCPP(cppFile, ccfg);


    

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedCodeFilePath, toString(cppFile));

    return generatedDotFilePath;
}


function doGenerateCCFG(codeFile: CompositeGeneratorNode, model: Model): CCFG {
    var visitor = new CCFGVisitor();
    let [res] = visitor.visit(model);

    var ccfg = (res as ContainerNode).internalccfg;
   
    ccfg.addSyncEdge()

    codeFile.append(ccfg.toDot());
    return ccfg;
}

function doGenerateCPP(codeFile: CompositeGeneratorNode, ccfg: CCFG): void {
    
    
    
    let initNode = ccfg.initialState;
    if (initNode == undefined) {
        console.log("No initial state found");
        return;
    }
    
    codeFile.append(`
#include <string>
#include <unordered_map>
#include <thread>
#include <iostream>
#include "../utils/LockingQueue.hpp"
    
class Void{
};
std::unordered_map<std::string, void*> sigma;


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
        std::cout << entry.first << " : " << entry.second << std::endl;
    }
}
    `);

}


function compileFunctionDefs(ccfg: CCFG) : string {
    let functionsDefs = "";
    for (let node of ccfg.nodes) {
        if(node.getType() == "ContainerNode"){
            functionsDefs += compileFunctionDefs((node as ContainerNode).internalccfg);
        }else{
            if(node.returnType != undefined){
                for (let fname of node.functionsNames) {
                // console.log("function name: "+fname);
                    functionsDefs += node.returnType + " function" + fname + `(${node.params.map(p => (p as TypedElement).toString()).join(", ")}){\n\t`;
                    functionsDefs += node.functionsDefs.map(a => a).join("\n\t") + "\n";
                    functionsDefs += "}\n";
                }
            }
        }
    }
    return functionsDefs;
}

function getCurrentUID(node: Node): number {
    switch(node.getType()){
        case "Step":
            return node.uid;
        case "Fork":
            return node.uid;
        case "AndJoin":
            return node.uid;
        case "OrJoin":
            return node.uid;
        case "Choice":
            return node.uid;
    } 
    return node.uid;
}

let fifoThreadUid : MultiMap<number,number> = new MultiMap();
let continuations: Node[] = []
let visitedUID: number[] = []
function visitAllNodes(ccfg:CCFG, currentNode: Node, codeFile: CompositeGeneratorNode, visitIsStarting: boolean = false): void {
    let currentUID = getCurrentUID(currentNode);

    if (currentNode.outputEdges.length == 0 /*|| currentUID == untilUID*/) {
        return
    }



    currentNode.numberOfVisits = currentNode.numberOfVisits + 1;
    // console.log(currentNode.getType()+"  pre  uid: "+currentUID+" visit#:"+currentNode.numberOfVisits);

    if(currentNode.inputEdges.length > 1){
        if (visitIsStarting == false && currentNode.numberOfVisits < currentNode.inputEdges.length) {
            return
        }
        if (currentNode.numberOfVisits == currentNode.inputEdges.length){
            if(! continuations.includes(currentNode)){
                continuations.push(currentNode);
            }
            return
        }
    }  
    
    if (visitedUID.includes(currentUID)){
        return
    }
    visitedUID.push(currentUID);
    //console.log(currentNode.getType()+"  OK  uid: "+currentUID);
        
    switch(currentNode.getType()){
    case "Step":
        {
        addCorrespondingCode(codeFile, currentNode,ccfg);
        if(currentNode.outputEdges.length > 1){

            let edgeToVisit: Edge[] = currentNode.outputEdges;
            for(let edge of edgeToVisit){
                codeFile.append(`
                {`)
                visitAllNodes(ccfg, edge.to, /*untilUID,*/ codeFile);
                codeFile.append(`
                }
                `);
            }
            if(continuations.length > 0){
                let toVisit = continuations.pop();
                if(toVisit != undefined){
                    visitAllNodes(ccfg, toVisit, /*nextUntilUID,*/ codeFile);
                }
                
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

        for(let edge of edgeToVisit){
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
        if(continuations.length > 0){
            let toVisit = continuations.pop();
            if(toVisit != undefined){
                visitAllNodes(ccfg, toVisit, /*nextUntilUID,*/ codeFile);
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
            // if(paramNames.length > i){
            //     paramName = paramNames[i]
            // }
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
                // paramName = "result"+ptn.functionsNames.join("_");
                // if(paramNames.length > i){
                //     paramName = paramNames[i]
                // }
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
                codeFile.append(`
        LockingQueue<${(ptn.returnType!="void")?ptn.returnType : "Void"}> queue${syncUID};
        `);
            }
        }
        addComparisonVariableDeclaration(codeFile, currentNode);
        let edgeToVisit: Edge[] = currentNode.outputEdges;
        for(let edge of edgeToVisit){
            codeFile.append(`//Choice node`);
            codeFile.append(`
        if(${edge.guards.join(" && ")}){`
                );
                addCorrespondingCode(codeFile, currentNode,ccfg);
                visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ codeFile);                
                codeFile.append(`
            //END IF ${edge.guards.join(" && ")}
        }
            `);
        }
        if(continuations.length > 0){
            let toVisit = continuations.pop();
            if(toVisit != undefined){
                visitAllNodes(ccfg, toVisit, /*nextUntilUID,*/ codeFile);
            }
            
        }
        break;
        }
    } 
    
    return;
}

// function getNextNodeWithCode(currentNode: Node): Node {
//     if (currentNode.functionsDefs.length > 0){
//         return currentNode
//     }
//     for(let e of currentNode.outputEdges){
//         if(e.to.functionsDefs.length > 0){
//             return e.to
//         }
//         let n = getNextNodeWithCode(e.to)
//         return n
//     }
//     return currentNode
// }


function queueUidToPushIn(n: Node): number|undefined {
    for(let e of n.outputEdges){
        if (e.to.getType() == "AndJoin" || e.to.getType() == "OrJoin"){
            return e.to.uid
        }
        if(e.to.functionsDefs.length == 0){
            let uid = queueUidToPushIn(e.to)
            if(uid != undefined){
                return uid
            }
        }
    }
    return undefined
}


function addCorrespondingCode(codeFile: CompositeGeneratorNode, currentNode: Node, ccfg: CCFG) {
    codeFile.append(`
            std::cout << "${currentNode.uid} : ${currentNode.getType()}" <<std::endl;
            `);
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
        if(queueUID != undefined){
            if(currentNode.returnType == undefined || currentNode.returnType == "void"){
                //create a fake parameter to push in the queue
                let syncNode = ccfg.getNodeByUID(queueUID)
                if(syncNode == undefined){
                    throw new Error("syncNode is undefined uid = "+queueUID)
                }
                let ptns = getPreviousTypedNodes(syncNode.inputEdges[0]);
                if(ptns.length > 1){
                    throw new Error("multiple previous typed nodes not handled here")
                }
                let ptn = ptns[0];
                codeFile.append(`
            ${(ptn.returnType!="void")?ptn.returnType: "Void"} fakeParam${queueUID};
            queue${queueUID}.push(fakeParam${queueUID});
                `);
            }else{
                codeFile.append(`
            queue${queueUID}.push(result${f});
                `);
            }
        }
    });
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
        // let zaza
        // (zaza as unknown as string).toString()
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

