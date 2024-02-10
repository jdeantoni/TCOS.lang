import fs from 'fs';
import {CompositeGeneratorNode, Grammar, NL, toString } from 'langium';
import {MemberCall, RuleOpening, SoSSpec } from '../language-server/generated/ast'; //VariableDeclaration
import {extractDestinationAndName, FilePathData } from './cli-util';
import path from 'path';







export function generateStuffFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ts`;
    const fileNode = new CompositeGeneratorNode();

    writePreambule(fileNode,data);

    let conceptNames: string[] = []

    for(var openedRule of model.rtdAndRules){
        if (openedRule.onRule.ref != undefined){
            conceptNames.push(openedRule.onRule.ref.name)
        }
    }
    fileNode.append(`import { ${conceptNames.join(',')} } from "../../language-server/generated/ast";`,NL)
    fileNode.append(`
export interface SimpleLVisitor {
    visit(node: AstNode): [Node,Node];
    
`,NL)
    for(let name of conceptNames){
        fileNode.append(`     visit${name}(node: ${name}): [Node,Node];`,NL)
    }
    fileNode.append(`}`,NL)

    fileNode.append(`
export class CCFGVisitor implements SimpleLVisitor {
    ccfg: Graph = new Graph();

    visit(node: AstNode): [Node,Node] {`);
            
    for(let name of conceptNames){
        fileNode.append(`
        if(node.$type == "${name}"){
            return this.visit${name}(node as ${name});
        }`)
    }


    fileNode.append(`
        throw new Error("Not implemented: " + node.$type);
    }
    `,NL);

    for(var openedRule of model.rtdAndRules){
        let name:string = ""
        if (openedRule.onRule.ref != undefined){
            name = openedRule.onRule.ref.name
        }
        fileNode.append(`
    visit${name}(node: ${name}): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)`,NL);
        
        createCCFGFromRules(fileNode,openedRule)
    
        fileNode.append(`
        //TODO

        return [startsNode,terminatesNode]
    }`,NL);
    }

    fileNode.append(`
}`,NL)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}



// function getRwrRuleType(rwr: RWRule) {
//     if (rwr.conclusion.statemodifications.length > 0) {
//         var rawType:string = inferType(rwr.conclusion.statemodifications[rwr.conclusion.statemodifications.length - 1], new Map()).$type;
//         if(rawType ==="number"){
//             return "int"
//         }
//         if(rawType ==="error"){
//             return "void"
//         }
//         if(rawType ==="boolean"){
//             return "bool"
//         }
//     }
//     if (rwr.conclusion.eventemissions.some(em => isValuedEventEmission(em))) {
//         return "void"
//     }
//     return "error in type inference for rule "+rwr.name+" in rule opened on "+(rwr.$container as RuleOpening).onRule
// }

function writePreambule(fileNode: CompositeGeneratorNode, data: FilePathData) {
    fileNode.append(`
import { AstNode } from "langium";
import { AndJoin, Choice, Fork, Graph, Node, OrJoin, Step } from "../../ccfg/ccfglib";`,NL)
}



function createCCFGFromRules(fileNode: CompositeGeneratorNode, openedRule: RuleOpening) {
    for(var rwr of openedRule.rules){
        if(rwr.$type == "RWRule"){
            fileNode.append(`// rule ${rwr.name}`,NL)
            if(rwr.premise.eventExpression.$type == "ExplicitEventRef"
                //&&
                //(rwr.premise.eventExpression.membercall as MemberCall).element=="this")
            ){
                fileNode.append(`// rwr.premise.eventExpression.membercall elem : ${(rwr.premise.eventExpression.membercall as MemberCall).element?.ref?.name}`,NL)
                if((rwr.premise.eventExpression.membercall as MemberCall).previous != undefined){
                    fileNode.append(`// rwr.premise.eventExpression.membercall previous : ${((rwr.premise.eventExpression.membercall as MemberCall).previous as MemberCall).element?.ref?.$type}`,NL)
                }

            }
        }
    }
    /*
     *  1. check if forking
     *  2. check if choices
     *  3. follow the flows from start to couples starts/terminates
     */
}

