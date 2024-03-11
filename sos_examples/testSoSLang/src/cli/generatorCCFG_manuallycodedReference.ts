import fs from 'fs';
import {  CompositeGeneratorNode, toString } from 'langium';
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
    std::cout << "Variable0_0_0_10currentValue: " << *(int *)sigma["Variable0_0_0_10currentValue"] << std::endl;
    std::cout << "Variable1_0_1_10currentValue: " << *(int *)sigma["Variable1_0_1_10currentValue"] << std::endl;
}
    `);

}


function compileFunctionDefs(ccfg: CCFG) : string {
    let functionsDefs = "";
    for (let node of ccfg.nodes) {
        if(node.getType() == "ContainerNode"){
            functionsDefs += compileFunctionDefs((node as ContainerNode).internalccfg);
        }else{
            for (let fname of node.functionsNames) {
                // console.log("function name: "+fname);
            functionsDefs += node.returnType + " function" + fname + `(${node.params.map(p => (p as TypedElement).toString()).join(", ")}){\n\t`;
            functionsDefs += node.functionsDefs.map(a => a).join("\n\t") + "\n";
            functionsDefs += "}\n";
        
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

let fifoThreadUid : number[]= [];
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
    console.log(currentNode.getType()+"  OK  uid: "+currentUID);
        
    switch(currentNode.getType()){
    case "Step":
        {
        codeFile.append(`//Step node`);
        addCorrespondingCode(codeFile, currentNode);
        if(currentNode.outputEdges.length > 1){

            let edgeToVisit: Edge[] = currentNode.outputEdges;
            for(let edge of edgeToVisit){
                visitAllNodes(ccfg, edge.to, /*untilUID,*/ codeFile);
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
        
        for(let edge of edgeToVisit){
            fifoThreadUid.push(edge.to.uid);
            codeFile.append(`
            //std::thread thread${edge.to.uid}([&](){\n`
            );
            visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ codeFile);
            codeFile.append(`
            // });
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
        let edgeToVisit: Edge[] = currentNode.inputEdges;
        codeFile.append(`
        //start of and join node`);
        for(let edge of edgeToVisit){
            let threadUid = fifoThreadUid.pop();
            codeFile.append(`//unused edge ${edge.to.uid}
            // thread${threadUid}.join();
            `);
        }
        addCorrespondingCode(codeFile, currentNode);
        codeFile.append(`
        //end of and join node`);
        let nextNode = currentNode.outputEdges[0].to
        visitAllNodes(ccfg,nextNode, /*untilUID,*/ codeFile);
        break;
        }
    case "OrJoin":
        {
            codeFile.append(` //or join node`);
            let nextNode = currentNode.outputEdges[0].to
            visitAllNodes(ccfg,nextNode, /*untilUID,*/ codeFile);
            break;
        }
    case "Choice":
        {   
        addComparisonVariableDeclaration(codeFile, currentNode);
        let edgeToVisit: Edge[] = currentNode.outputEdges;
        for(let edge of edgeToVisit){
            codeFile.append(`//Choice node`);
            addCorrespondingCode(codeFile, currentNode);
                codeFile.append(`
        if(${edge.guards.join(" && ")}){`
                );
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

function addCorrespondingCode(codeFile: CompositeGeneratorNode, currentNode: Node) {
    codeFile.append(`
            std::cout << "${currentNode.uid} : ${currentNode.getType()}" <<std::endl;
            `);

    currentNode.functionsNames.forEach(f => {
        if(currentNode.returnType != "void"){
            codeFile.append(`${currentNode.returnType} result${f} = `);
        }
        codeFile.append(`function${f}(`)
        if(currentNode.params.length > 0){
            let sep = ""
            for(let ie of currentNode.inputEdges){
                let ptn: Node = getPreviousTypedNode(ie)
                codeFile.append(sep)
                codeFile.append(`result${ptn.functionsNames[0]}`);
                sep=","
            }
        }
        codeFile.append(`);\n`);
    });
}

function getPreviousTypedNode(ie: Edge): Node {
    let ptn: Node = ie.from
    if (ptn.returnType != "void"){
        return ptn
    }else{
        for(let e of ptn.inputEdges){
            return getPreviousTypedNode(e)
        }
    }
    return ptn;
}

function addComparisonVariableDeclaration(codeFile: CompositeGeneratorNode, currentNode: Node) {
    for(let ie of currentNode.inputEdges){
        let ptn: Node = getPreviousTypedNode(ie)
        if(ptn.returnType != "void"){
            let lastDefStatement = ptn.functionsDefs[ptn.functionsDefs.length-1];
            let lastDefStatementSplit = lastDefStatement.split(" ");
            let returnedVariableName = lastDefStatementSplit[lastDefStatementSplit.length-1];
            returnedVariableName = returnedVariableName.substring(0, returnedVariableName.length-1); //remove semicolumn

            codeFile.append(`${ptn.returnType} ${returnedVariableName} = result${ptn.functionsNames[0]};`);
        }
    }
}

