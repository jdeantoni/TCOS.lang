import fs from 'fs';
import {  CompositeGeneratorNode, toString } from 'langium';
import path from 'path';
import { Model } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { CCFGVisitor } from './generated/testFSE';
import { CCFG, Edge, Node } from '../ccfg/ccfglib';


export function generateCCFG(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);

    const generatedDotFilePath = `${path.join(data.destination, data.name)}.dot`;
    const dotFile = new CompositeGeneratorNode();

    const generatedCodeFilePath = `${path.join(data.destination, data.name)}.cpp`;
    const cppFile = new CompositeGeneratorNode();

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
    visitor.visit(model);
    var ccfg = visitor.ccfg;
    codeFile.append(ccfg.toDot());
    return ccfg;
}

function doGenerateCPP(codeFile: CompositeGeneratorNode, ccfg: CCFG): void {
    let initNode = ccfg.initialState;
    if (initNode == undefined) {
        console.log("No initial state found");
        return;
    }
    
    codeFile.append(`#include <string>
    #include <unordered_map>
    #include <thread>
    #include <iostream>
    
    std::unordered_map<std::string, void*> sigma;
    int main(){
        `);

    let currentNode = initNode;
    currentNode = visitAllNodes(ccfg, currentNode, -1, codeFile, true);

    codeFile.append(`
    //WARNING !! temporary code to test
    std::cout << "Variable0_0_0_10currentValue: " << *(int *)sigma["Variable0_0_0_10currentValue"] << std::endl;
    std::cout << "Variable1_0_1_10currentValue: " << *(int *)sigma["Variable1_0_1_10currentValue"] << std::endl;
}
    `);

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

let fifoThreadUid : number[]= [];

function visitAllNodes(ccfg:CCFG, currentNode: Node, untilUID: number | undefined, codeFile: CompositeGeneratorNode, visitIsStarting: boolean = false): Node {
    let currentUID = getCurrentUID(currentNode);

    if (currentNode.outputEdges.length == 0 || currentUID == untilUID) {
        return currentNode;
    }

    currentNode.numberOfVisits = currentNode.numberOfVisits + 1;
    if (visitIsStarting == false && currentNode.numberOfVisits != currentNode.inputEdges.length) {
        return currentNode;
    }   

    console.log(currentNode.getType()+"   uid: "+currentNode.uid);
        
    codeFile.append(`
        /**    ${currentNode.uid} : ${currentNode.getType()} **/
    `);
    currentNode.actions.forEach(a => {
        codeFile.append(`${a}\n`);
    })
        
    switch(currentNode.getType()){
    case "Step":
        {
        if(currentNode.outputEdges.length > 1){
            // let nexUntilUID = currentNode.outputEdges[0].to.finishNodeUID
            // if(nexUntilUID == undefined){
            //     throw new Error("finishNodeUID is undefined in current node "+currentNode.uid);
            // }
            let edgeToVisit: Edge[] = currentNode.outputEdges;
            for(let edge of edgeToVisit){
                visitAllNodes(ccfg, edge.to, untilUID, codeFile);
            }
        }else{
            let edge = currentNode.outputEdges[0];
            visitAllNodes(ccfg,edge.to, untilUID, codeFile);
        }
        
        break;
        }
    case "Fork":
        {
        let nextUntilUID = currentNode.inputEdges[0].from.finishNodeUID
        if(nextUntilUID == undefined){
            throw new Error("finishNodeUID is undefined in current node "+currentNode.uid);
        }
        // let tempFinishNode = ccfg.getNodeByUID(tempFinishNodeUID);
        // let nextUntilUID = tempFinishNode.inputEdges[0].from.uid;
        
        let edgeToVisit: Edge[] = currentNode.outputEdges;
        
        for(let edge of edgeToVisit){
            fifoThreadUid.push(edge.to.uid);
            codeFile.append(`
            //std::thread thread${edge.to.uid}([&](){\n`
            );
            visitAllNodes(ccfg, edge.to, nextUntilUID, codeFile);
            codeFile.append(`
            // });
            `);
        }
        let nextNode = ccfg.getNodeByUID(nextUntilUID)
        visitAllNodes(ccfg,nextNode, nextNode.finishNodeUID, codeFile);
        break;
        }
    case "AndJoin":
        {
        let edgeToVisit: Edge[] = currentNode.inputEdges;
        for(let edge of edgeToVisit){
            let threadUid = fifoThreadUid.pop();
            codeFile.append(` //edge${edge.from.uid}.join();
            // thread${threadUid}.join();
            `);
        }
        let nextNode = currentNode.outputEdges[0].to
        visitAllNodes(ccfg,nextNode, untilUID, codeFile);
        break;
        }
    case "OrJoin":
        {
            codeFile.append(` //or join node`);
            let nextNode = currentNode.outputEdges[0].to
            visitAllNodes(ccfg,nextNode, untilUID, codeFile);
            break;
        }
    case "Choice":
        {   
        let nextUntilUID = currentNode.finishNodeUID
        if(nextUntilUID == undefined){
            throw new Error("finishNodeUID is undefined in current node "+currentNode.uid);
        }
        let edgeToVisit: Edge[] = currentNode.outputEdges;
        for(let edge of edgeToVisit){
            codeFile.append(`
        if(${edge.guards.join(" && ")}){`
            );
            visitAllNodes(ccfg, edge.to, nextUntilUID, codeFile);                
            codeFile.append(`
        }
        `);
        }
        let nextNode = ccfg.getNodeByUID(nextUntilUID);
        visitAllNodes(ccfg,nextNode, untilUID, codeFile);
        break;
        }
    }  
        
    return currentNode;
}

