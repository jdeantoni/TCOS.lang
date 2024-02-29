
import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, Reference, isReference, streamAllContents, streamAst, toString } from 'langium';
import { Model, isAssignment, isBloc, isIf, isModel, isPlus, isVariable, isVarRef } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { Range, integer } from 'vscode-languageclient';
import path from 'path';


var globalUnNamedCounter:integer = 0
var globalVariableCounter:integer = 0

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedCCSLFilePath = `${path.join(data.destination, data.name)}.lc`;

    const ccslFile = new CompositeGeneratorNode();

    ccslFile.append(`Specification test1 {`, NL, NL);
    generateCCSL(ccslFile, model);

    const generatedCodeFilePath = `${path.join(data.destination, data.name)}.c`;
    const codeFile = new CompositeGeneratorNode();
    const generatedHeaderFilePath = `${path.join(data.destination, data.name)}.h`;
    const headerFile = new CompositeGeneratorNode();
    codeFile.append(`#include "test1.h"`, NL, NL);

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
    headerFile.append(`
#include <stdio.h>
#include<stdbool.h>  `, NL, NL);
    
    var allRtdPositions: Map<AstNode,number> = new Map<AstNode, number>();
    var allRtdValues: Map<AstNode,any> = new Map<AstNode, any>();

    for (var node of streamAllContents(model)) {
        if(isVariable(node)){
            allRtdPositions.set(node,globalVariableCounter++)
            allRtdValues.set(node,(node.initialValue)?node.initialValue:0)
        }
    }

    codeFile.append(`
    void* sigma[${globalVariableCounter}] = {${Array.from(allRtdValues.values()).map(element => {"nullptr"}).join(",")};`,NL)

    for (var node of streamAllContents(model)) {

                    if (isVariable(node)){
                        headerFile.append(`int ${getName(node)}_evaluate();`,NL)
                        codeFile.append(`
                        inline int ${getName(node)}_evaluate(){
                            return varList[${allRtdPositions.get(node)}];    
                        }`,NL)
                    }
                    if (isVarRef(node)){
                        headerFile.append(`int ${getName(node)}_evaluate();`,NL)
                        codeFile.append(`
                        inline int ${getName(node)}_evaluate(){
                            int value = ${getName(node.theVar)}_evaluate();
                            return value;    
                        }`,NL)
                    }
                    if (isPlus(node)){
                        headerFile.append(`int ${getName(node)}_evaluate();`,NL)
                        codeFile.append(`
                        inline int ${getName(node)}_evaluate(){
                            int n2 = ${getName(node.right)}_evaluate();
                            int n1 = ${getName(node.left)}_evaluate();
                            return n1 + n2;    
                        }`,NL)
                    }
                    if (isIf(node)){
                        headerFile.append(`bool ${getName(node)}_evalCond();`,NL)
                        codeFile.append(`
                        inline bool ${getName(node)}_evalCond(){
                            bool resCond = ${getName(node.cond)}_evaluate();
                            return resCond;    
                        }`,NL)
                        headerFile.append(`void ${getName(node)}_condTrue();`,NL)
                        codeFile.append(`
                        inline void ${getName(node)}_condTrue(){    
                        }`,NL)
                        headerFile.append(`void ${getName(node)}_condFalse();`,NL)
                        codeFile.append(`
                        inline void ${getName(node)}_condFalse(){    
                        }`,NL)
                    }
                    if (isAssignment(node)){
                        headerFile.append(`int ${getName(node)}_evaluate();`,NL)
                        codeFile.append(`
                        inline int ${getName(node)}_evaluate(){
                            int resRight = ${getName(node.expr)}_evaluate();
                                return varList[${allRtdPositions.get((node.variable as Reference).ref as AstNode)}] = resRight;
                                
                        }`,NL)
                    }   }
}

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
    }
    function generateCCSL(ccslFile: CompositeGeneratorNode, model: Model) {
        var allClocks: String[] = [];
        for (var node of streamAst(model)) {
    
            if( isModel(node) || isBloc(node) || isVariable(node) || isIf(node) || isAssignment(node) ){ //for non atomic rules
                allClocks.push(getName(node) + "_startEvaluation");
                allClocks.push(getName(node) + "_finishEvaluation");
            }
    
            if (isIf(node)) {
                allClocks.push(getName(node) + "_evalCond");
                allClocks.push(getName(node) + "_condTrue");
                allClocks.push(getName(node) + "_condFalse");
            }
        }
        ccslFile.append(`
        Clock ${allClocks.join(` 
            `)} [`, NL
        );

        for (var node of streamAllContents(model)) {
    
            if(isModel(node)){
            
                ccslFile.append(`
                    Precedence ${getName(node) + '_startEvaluation'} < (max: 1) ${getName(node) + '_finishEvaluation'}`, NL
                );
                
                ccslFile.append(`
                    SubClocking ${getName(node) + '_startEvaluation'} <- ${getName(node.statements.at(0)) + '_startEvaluation'} //should be the first non atomic one
                    SubClocking ${getName(node.statements.at(0)) + '_startEvaluation'} <- ${getName(node) + '_startEvaluation'}`, NL
                );
                
                ccslFile.append(`
                    SubClocking ${getName(node) + '_finishEvaluation'} <- ${getName(node.statements.at(node.statements.length-1)) + '_finishEvaluation'} //should be the first non atomic one
                    SubClocking ${getName(node.statements.at(node.statements.length-1)) + '_finishEvaluation'} <- ${getName(node) + '_finishEvaluation'}`, NL
                );
                
                        var loopList: String[][] = [];
                        for (let i = 0; i < node.statements.length - 1; i++) {
                            const e1 = node.statements.at(i);
                            const e2 = node.statements.at(i + 1);
                            loopList.push([getName(e1)+'_finishEvaluation', getName(e2)+'_startEvaluation']);
                        }
                        for(var couple of loopList){
                        
                            ccslFile.append(`
                            Precedence ${couple[0]} < ${couple[1]} `, NL
                            );
                            
                        }
            }
            
            if(isBloc(node)){
            
                ccslFile.append(`
                    Precedence ${getName(node) + '_startEvaluation'} < (max: 1) ${getName(node) + '_finishEvaluation'}`, NL
                );
                
                ccslFile.append(`
                    SubClocking ${getName(node) + '_startEvaluation'} <- ${getName(node.statements.at(0)) + '_startEvaluation'} //should be the first non atomic one
                    SubClocking ${getName(node.statements.at(0)) + '_startEvaluation'} <- ${getName(node) + '_startEvaluation'}`, NL
                );
                
                ccslFile.append(`
                    SubClocking ${getName(node) + '_finishEvaluation'} <- ${getName(node.statements.at(node.statements.length-1)) + '_finishEvaluation'} //should be the first non atomic one
                    SubClocking ${getName(node.statements.at(node.statements.length-1)) + '_finishEvaluation'} <- ${getName(node) + '_finishEvaluation'}`, NL
                );
                
                        var loopList: String[][] = [];
                        for (let i = 0; i < node.statements.length - 1; i++) {
                            const e1 = node.statements.at(i);
                            const e2 = node.statements.at(i + 1);
                            loopList.push([getName(e1)+'_finishEvaluation', getName(e2)+'_startEvaluation']);
                        }
                        for(var couple of loopList){
                        
                            ccslFile.append(`
                            Precedence ${couple[0]} < ${couple[1]} `, NL
                            );
                            
                        }
            }
            
            if(isVariable(node)){
            
                ccslFile.append(`
                    Precedence ${getName(node) + '_startEvaluation'} < (max: 1) ${getName(node) + '_finishEvaluation'}`, NL
                );
                
            }
            
            if(isVarRef(node)){
            
            }
            
            if(isPlus(node)){
            
            }
            
            if(isIf(node)){
            
                ccslFile.append(`
                    Precedence ${getName(node) + '_startEvaluation'} < (max: 1) ${getName(node) + '_finishEvaluation'}`, NL
                );
                
                ccslFile.append(`
                    SubClocking ${getName(node) + '_startEvaluation'} <- ${getName(node) + '_evalCond'} //should be the first non atomic one
                    SubClocking ${getName(node) + '_evalCond'} <- ${getName(node) + '_startEvaluation'}`, NL
                );
                
                ccslFile.append(`
                Let tmp_${getName(node)}_xor be ${getName(node) + '_condTrue'} + ${getName(node) + '_condFalse'} //may be 'or' instead of +
                Exclusion ${getName(node)}_condTrue # ${getName(node)}_condFalse
                Precedence ${getName(node) + '_evalCond'} < tmp_${getName(node)}_xor
                `)
                                    
            }
            
            if(isAssignment(node)){
            
                ccslFile.append(`
                    Precedence ${getName(node) + '_startEvaluation'} < (max: 1) ${getName(node) + '_finishEvaluation'}`, NL
                );
                
            }
            
    }
        ccslFile.append(`
        ]
        //Where should we put the data dependent control specification ?`, NL
        );
    
    
        ccslFile.append(`
        }
        `, NL);
    }
    