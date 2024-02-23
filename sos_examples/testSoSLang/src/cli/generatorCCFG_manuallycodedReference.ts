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

    doGenerateCPP(cppFile, ccfg);


    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedDotFilePath, toString(dotFile));

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
    currentNode = visitAllNodes(currentNode, codeFile);

    codeFile.append(`
    //WARNING !! temporary code to test
    std::cout << "Variable0_0_0_10currentValue: " << *(int *)sigma["Variable0_0_0_10currentValue"] << std::endl;
    std::cout << "Variable1_0_1_10currentValue: " << *(int *)sigma["Variable1_0_1_10currentValue"] << std::endl;
}
    `);

}

let fifoThreadUid : number[]= [];
    let comesFromChoice = false

function visitAllNodes(currentNode: Node, codeFile: CompositeGeneratorNode) {
    let returnsFromRecursion = false;
    while (currentNode.outputEdges.length > 0 
            && ( currentNode.inputEdges.length <= 1 || returnsFromRecursion)
     ) {
        returnsFromRecursion = false;
        console.log(currentNode.getType()+"   uid: "+currentNode.uid);
        
        if(! comesFromChoice){
            codeFile.append(`
             /**    ${currentNode.uid} **/
            `);
            currentNode.actions.forEach(a => {
                codeFile.append(`${a}\n`);
            })
        }
        comesFromChoice = false;
        switch(currentNode.getType()){
        case "Step":
            {
            // if(currentNode.outputEdges.length > 1){
            //     let edgeToVisit: Edge[] = currentNode.outputEdges;
            //     for(let edge of edgeToVisit){
            //         currentNode = visitAllNodes(edge.to, codeFile);
            //     }
            //     returnsFromRecursion = true;
            // }else{
                let edge = currentNode.outputEdges[0];
                currentNode = edge.to;
            // }
            
            break;
            }
        case "Fork":
            {
            let edgeToVisit: Edge[] = currentNode.outputEdges;
            // console.log(edgeToVisit);
            for(let edge of edgeToVisit){
                fifoThreadUid.push(edge.to.uid);
                codeFile.append(`
                //std::thread thread${edge.to.uid}([&](){\n`
                );
                currentNode = visitAllNodes(edge.to, codeFile);
                codeFile.append(`
               // });
                `);
            }
            returnsFromRecursion = true;

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
            currentNode = currentNode.outputEdges[0].to;
            break;
            }
        case "OrJoin":
            {
                codeFile.append(` //or join node`);
                currentNode = currentNode.outputEdges[0].to;
                break;
            }
        case "Choice":
            {   
    
            let edgeToVisit: Edge[] = currentNode.outputEdges;
            for(let edge of edgeToVisit){
                
                codeFile.append(`
            if(${edge.to.actions}){`
                );
                comesFromChoice = true;
                currentNode = visitAllNodes(edge.to, codeFile);                
                codeFile.append(`
            }
            `);
            }
            returnsFromRecursion = true;
            break;
            }
        }   
    }
    return currentNode;
}

