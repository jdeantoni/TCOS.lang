import fs from 'fs';
import {AstNode, CompositeGeneratorNode, Grammar, NL, streamAst, toString } from 'langium';
import { MemberCall,  RWRule, RuleOpening, SoSSpec, TemporaryVariable, isBinaryExpression, isRWRule, isRuleOpening, isTemporaryVariable, isVariableDeclaration } from '../language-server/generated/ast'; //VariableDeclaration
import { extractDestinationAndName, FilePathData } from './cli-util';
import { print } from '../utils/sos-utils';
import { inferType } from '../language-server/type-system/infer';
import path from 'path';







export function generateStuffFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ts`;
    const fileNode = new CompositeGeneratorNode();

    writePreambule(fileNode,data);


    for(var openedRule of model.rtdAndRules){
        if(openedRule.rules.filter(r => isRWRule(r)).length > 0){
            fileNode.append(`
                    if (is${openedRule.onRule.ref?.name}(node)){`)
            for(var rwr of openedRule.rules){
                if (isRWRule(rwr)){
                    const rwrRuleType:string = getRwrRuleType(rwr);
                    fileNode.append(`
                        headerFile.append(\`${rwrRuleType} \${getName(node)}_${rwr.name}();\`,NL)
                        codeFile.append(\`
                        inline ${rwrRuleType} \${getName(node)}_${rwr.name}(){`)
                        
                        
                    for(var prem of rwr.premise){
                        if(isTemporaryVariable(prem.right)){
                            if(prem.left){
                                fileNode.append(`
                            ${getAstNodeType(prem.right)} ${(prem.right as TemporaryVariable).name} = \${getName(node.${print(prem.left,"")})}_evaluate();`)
                            }     
                        }
                    }
    
                    //should be linked by ccsl
                    // if(rwr.conclusion.ruleStart){
                    //     fileNode.append(`
                    //         call ${rwr.conclusion.ruleStart}
                    //     `)
                    // }
                    for(var os of rwr.conclusion.outState){
                        if (isVariableDeclaration((os as MemberCall).element?.ref)){
                            fileNode.append(`
                            return varList[\${allRtdPositions.get(node)}];`)
                        }
                        else if(isBinaryExpression(os) && os.operator ==='='){ //left is a VarRef
                                fileNode.append(`
                                return varList[\${allRtdPositions.get((node.left as Reference).ref as AstNode)}] = ${print(os.right,"")};
                            `)
                        }
                        else{
                            fileNode.append(`
                            return ${print(os,"")};`)
                        }
                        
                    }


                fileNode.append(//      
                `    
                        }\`,NL)`);
                }
            }
            fileNode.append(`
                    }`);
        
        }
    }
    

            // for(var rtd of openedRule.runtimeState){
            //     fileNode.append(`\t* var ${rtd.name} of type ${getType(rtd).name}`, NL);
            // }
            // for(var rwr of openedRule.rules){
            //     if (isRWRule(rwr)){
            //         fileNode.append(`\t* `)
            //         for(var prem of rwr.premise){
            //             if(prem.left !== undefined){
            //                 var premRight:string = ""
            //                 if(prem.right !==undefined){
            //                     if(isTemporaryVariable(prem.right)){
            //                         premRight=print(prem.right)
            //                     }else{
            //                         premRight=print(prem.right as Expression)
            //                     }
                                
            //                 }
            //                 fileNode.append(`${premRight}:= ${print(prem.left)} `)  
                         
            //             }
            //         }
            //         if(rwr.conclusion.ruleStart){
            //             fileNode.append(" => call rule "+print(rwr.conclusion.ruleStart))
            //         }
            //         if(rwr.conclusion.outState.length > 0){
            //             fileNode.append("  =>  ")
            //         }
            //         for(var os of rwr.conclusion.outState){
            //             fileNode.append(print(os))
            //         }
            //         fileNode.append(NL)
            //     }
            //     else if (isSchedulingConstraint(rwr)){
            //         fileNode.append(`\t* Sched:${print(rwr.left)} ${rwr.operator} ${print(rwr.right)}`, NL);
            //     }
            // }
    
    fileNode.append(//        return varList[\${allRtdPositions.get(node)}];
        `   }
}`,NL);

    fileNode.append(`
    function getName(node:AstNode | Reference<AstNode> | undefined): string {
        if(isReference(node)){
            node = node.ref
        }
        if(node !==undefined && node.$cstNode){
            var r: Range = node.$cstNode?.range
            return node.$type+r.start.line+"_"+r.start.character+"_"+r.end.line+"_"+r.end.character;
        }else{
            return "noName"+globalUnNamedCounter++
        }
    }`)


    generateThegenerateCCSLFunction(fileNode,model)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}


function getAstNodeType(node: AstNode) {
   
        var rawType = inferType(node, new Map());
        if(rawType.$type ==="number"){
            return "int"
        }
        if(rawType.$type ==="error"){
            console.log("error type inference:"+rawType.message)
            return "void"
        }
        if(rawType.$type ==="boolean"){
            return "bool"
        }
   
    return "error in type inference for node "+node+":"+node.$type
}


function getRwrRuleType(rwr: RWRule) {
    if (rwr.conclusion.outState.length > 0) {
        var rawType:string = inferType(rwr.conclusion.outState[rwr.conclusion.outState.length - 1], new Map()).$type;
        if(rawType ==="number"){
            return "int"
        }
        if(rawType ==="error"){
            return "void"
        }
        if(rawType ==="boolean"){
            return "bool"
        }
    }
    if (rwr.conclusion.ruleStart) {
        return "void"
    }
    return "error in type inference for rule "+rwr.name+" in rule opened on "+(rwr.$container as RuleOpening).onRule
}

function writePreambule(fileNode: CompositeGeneratorNode, data: FilePathData) {
    fileNode.append(`
import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, Reference, isReference, streamAllContents, streamAst, toString } from 'langium';
import { Model, isAssignment, isBloc, isIf, isModel, isPlus, isVarDecl, isVarRef } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { Range, integer } from 'vscode-languageclient';
import path from 'path';


var globalUnNamedCounter:integer = 0
var globalVariableCounter:integer = 0

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedCCSLFilePath = \`\${path.join(data.destination, data.name)}.lc\`;

    const ccslFile = new CompositeGeneratorNode();

    ccslFile.append(\`Specification ${data.name} {\`, NL, NL);
    generateCCSL(ccslFile, model);

    const generatedCodeFilePath = \`\${path.join(data.destination, data.name)}.c\`;
    const codeFile = new CompositeGeneratorNode();
    const generatedHeaderFilePath = \`\${path.join(data.destination, data.name)}.h\`;
    const headerFile = new CompositeGeneratorNode();
    codeFile.append(\`#include "${data.name}.h"\`, NL, NL);

    generateCode(codeFile, headerFile, model);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedCCSLFilePath, toString(ccslFile));
    fs.writeFileSync(generatedCodeFilePath, toString(codeFile));
    fs.writeFileSync(generatedHeaderFilePath, toString(headerFile));

    return generatedCCSLFilePath;
}


function generateCode(codeFile: CompositeGeneratorNode, headerFile: CompositeGeneratorNode, model: Model) {
    headerFile.append(\`
#include <stdio.h>
#include<stdbool.h>  \`, NL, NL);
    
    var allRtdPositions: Map<AstNode,number> = new Map<AstNode, number>();
    var allRtdValues: Map<AstNode,number> = new Map<AstNode, number>();

    for (var node of streamAllContents(model)) {
        if(isVarDecl(node)){
            allRtdPositions.set(node,globalVariableCounter++)
            allRtdValues.set(node,(node.initialValue)?node.initialValue:0)
        }
    }

    codeFile.append(\`
    int varList[\${globalVariableCounter}] = {\${Array.from(allRtdValues.values()).join(",")}};
    \`,NL)

    for (var node of streamAllContents(model)) {`,NL)
}




function generateThegenerateCCSLFunction(fileNode: CompositeGeneratorNode, model: SoSSpec) {
    fileNode.append(`
    function generateCCSL(ccslFile: CompositeGeneratorNode, model: Model) {
        var allClocks: String[] = [];
        for (var node of streamAst(model)) {
    `);
    var nonAtomicRuleName: string[]=[]
   // for(let ro of model.rtdAndRules){
        // if (ro.isNonAtomic && ro.onRule.ref !== undefined){
        //     nonAtomicRuleName.push(ro.onRule.ref.name)
        // }
   // }
    var isTests:string[] = nonAtomicRuleName.map(rn => " is"+rn+"(node) ");
    fileNode.append(`
            if(${isTests.join("||")}){ //for non atomic rules
                allClocks.push(getName(node) + "_startEvaluation");
                allClocks.push(getName(node) + "_finishEvaluation");
            }
    `);
    for(var openedRule of model.rtdAndRules){
        if(openedRule.rules.filter(r => isRWRule(r)).length > 1){
            fileNode.append(`
            if (is${openedRule.onRule.ref?.name}(node)) {`);
            for(let rwr of openedRule.rules.filter(r => isRWRule(r))){
                fileNode.append(`
                allClocks.push(getName(node) + "_${(rwr as RWRule).name}");`)
            }
            fileNode.append(`
            }`)

        }
    }
    
    fileNode.append(`
        }
        ccslFile.append(\`
        Clock \${allClocks.join(\` 
            \`)} [\`, NL
        );

        for (var node of streamAllContents(model)) {
    `);

    for(let node of streamAst(model)){
        if(isRuleOpening(node)){
            fileNode.append(`
            if(is${node.onRule.$refText}(node)){
            `)
            
            // if(node.isNonAtomic){
            //     fileNode.append(`
            //     ccslFile.append(\`
            //         Precedence \${getName(node) + '_startEvaluation'} < (max: 1) \${getName(node) + '_finishEvaluation'}\`, NL
            //     );
            //     `)
            // }
            // for(let schedRule of node.rules){
            //     if(isControlFlowRule(schedRule)){
            //         if(schedRule.loop === undefined){
            //             if(schedRule.constraint.operator === "coincides_with"){
            //                 var leftArg:string = getQueryStringFromMemberCall(schedRule.constraint.left)
            //                 var rightArg:string = getQueryStringFromMemberCall(schedRule.constraint.right)
            //                 createCoincidence(fileNode,leftArg,rightArg)
            //             }
            //             if(schedRule.constraint.operator === "precedes"){
            //                 var leftArg:string = getQueryStringFromMemberCall(schedRule.constraint.left)
            //                 if(isMemberCall(schedRule.constraint.right)){
            //                     var rightArg:string = getQueryStringFromMemberCall(schedRule.constraint.right)
            //                     createPrecedence(fileNode,leftArg,rightArg)
            //                 }
            //                 //TODO generalize and add recursion
            //                 if(isBinaryExpression(schedRule.constraint.right)){
            //                     if(schedRule.constraint.right.operator == "xor"){
            //                         fileNode.append(`
            //     ccslFile.append(\`
            //     Let tmp_\${getName(node)}_xor be \${getName(${getQueryStringFromMemberCall(schedRule.constraint.right.left)}} + \${getName(${getQueryStringFromMemberCall(schedRule.constraint.right.right)}} //may be 'or' instead of +
            //     Exclusion \${getName(node)}_condTrue # \${getName(node)}_condFalse
            //     Precedence \${getName(${leftArg}} < tmp_\${getName(node)}_xor
            //     \`)
            //                         `)
                                    
            //                     }
            //                 }
            //             }
            //         }else{
            //             fileNode.append(`
            //             var loopList: String[][] = [];
            //             for (let ${schedRule.loop.itVar.name} = ${schedRule.loop.lowerBound}; ${schedRule.loop.itVar.name} < node.${print(schedRule.loop.upperBound,".")} - 1; i++) {
            //                 const e1 = ${getQueryStringFromMemberCall(schedRule.constraint.left,true)};
            //                 const e2 = ${getQueryStringFromMemberCall(schedRule.constraint.right,true)};
            //                 loopList.push([getName(e1)+'_${getQueryStringFromMemberCall(schedRule.constraint.left,false,true)}', getName(e2)+'_${getQueryStringFromMemberCall(schedRule.constraint.right,false,true)}']);
            //             }
            //             for(var couple of loopList){
            //             `)
            //             if(schedRule.constraint.operator === "coincides_with"){
            //                 fileNode.append(`
            //                 ccslFile.append(\`
            //                 SubClock \${couple[0]} <- \${couple[1]}
            //                 SubClock \${couple[1]} <- \${couple[0]} \`, NL
            //                 );
            //                 `)
            //             }
            //             if(schedRule.constraint.operator === "precedes"){
            //                 fileNode.append(`
            //                 ccslFile.append(\`
            //                 Precedence \${couple[0]} < \${couple[1]} \`, NL
            //                 );
            //                 `)
            //             }
            //             fileNode.append(`
            //             }`
            //             )
                       
            // // var flatList: String[] = precedesList.map(sl => "Precedence "+sl.join(" < "));
            // // console.log(flatList);
            // // ccslFile.append(`
            // //         ${flatList.join(`
            // //         `)}`, NL
            // // );
            //         }
            //     }
            // }
            fileNode.append(`
            }
            `)
        }

    }

    fileNode.append(`
    }
        ccslFile.append(\`
        ]
        //Where should we put the data dependent control specification ?\`, NL
        );
    
    
        ccslFile.append(\`
        }
        \`, NL);
    }
    `)
}

// function createCoincidence(fileNode:CompositeGeneratorNode, arg0: string, arg1: string) {
//     fileNode.append(`
//                 ccslFile.append(\`
//                     SubClocking \${getName(${arg0}} <- \${getName(${arg1}} //should be the first non atomic one
//                     SubClocking \${getName(${arg1}} <- \${getName(${arg0}}\`, NL
//                 );
//                 `)
// }

// function createPrecedence(fileNode: CompositeGeneratorNode, leftArg: string, rightArg: string) {
//     fileNode.append(`
//                 ccslFile.append(\`
//                     Precedence \${getName(${leftArg}} < \${getName(${rightArg}} \`, NL
//                 );
//                 `)
// }

// function getQueryStringFromMemberCall(expr: Expression,noLast=false,onlyLast=false): string {
//     var rawQuery = "node."+print(expr,".")
//     var splitQuery = rawQuery.split(".")
//     var lastSeg = splitQuery.pop()
//     if(onlyLast){
//         if(lastSeg){
//             return lastSeg;
//         }
//     }
//     splitQuery = splitQuery.map(q => (q=="first()")?"at(0)":q).map(q => (q=="last()")?"at("+splitQuery.slice(0,splitQuery.indexOf(q)).join(".")+".length-1)":q)
//     return splitQuery.join(".")+((noLast)?"":`) + '_${lastSeg}'`)
// }



