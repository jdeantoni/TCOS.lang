import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, Reference, isReference, streamAllContents, streamAst, toString } from 'langium';
import path from 'path';
import { Model, isAssignment, isBloc, isIf, isModel, isPlus, isVarDecl, isVarRef } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { Range, integer } from 'vscode-languageclient';


var globalUnNamedCounter:integer = 0
var globalVariableCounter:integer = 0

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedCCSLFilePath = `${path.join(data.destination, data.name)}.lc`;

    const ccslFile = new CompositeGeneratorNode();

    ccslFile.append(`Specification ${data.name} {`, NL, NL);
    generateCCSL(ccslFile, model);

    const generatedCodeFilePath = `${path.join(data.destination, data.name)}.c`;
    const codeFile = new CompositeGeneratorNode();
    const generatedHeaderFilePath = `${path.join(data.destination, data.name)}.h`;
    const headerFile = new CompositeGeneratorNode();
    codeFile.append(`#include "${data.name}.h"`, NL, NL);

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
    headerFile.append('#include <stdio.h>', NL, NL);
    
    var allRtdPositions: Map<AstNode,number> = new Map<AstNode, number>();
    var allRtdValues: Map<AstNode,number> = new Map<AstNode, number>();

    for (var node of streamAllContents(model)) {
        if(isVarDecl(node)){
            allRtdPositions.set(node,globalVariableCounter++)
            allRtdValues.set(node,(node.initialValue)?node.initialValue:0)
        }
    }

    codeFile.append(`
    int varList[${globalVariableCounter}] = {${Array.from(allRtdValues.values()).join(",")}};
    `,NL)

    for (var node of streamAllContents(model)) {
        if(isVarDecl(node)){
            headerFile.append(`int ${getName(node)}_evaluate();`,NL)
            codeFile.append(`
            inline int ${getName(node)}_evaluate(){
                return varList[${allRtdPositions.get(node)}];
            }`,NL)
        }
        if(isPlus(node)){
            headerFile.append(`int ${getName(node)}_evaluate();`,NL)
            codeFile.append(`
            inline int ${getName(node)}_evaluate(){
                int n1 = ${getName((node.left))}_evaluate();
                int n2 = ${getName((node.right))}_evaluate();
                return n1 + n2;
            }`,NL)
        }
        if(isAssignment(node)){
            headerFile.append(`void ${getName(node)}_evaluate();`,NL)
            codeFile.append(`
            inline void ${getName(node)}_evaluate(){
                int resRight = ${getName(node.right)}_evaluate();
                varList[${allRtdPositions.get((node.left as Reference).ref as AstNode)}] = resRight;
            }`,NL)
        }

        if(isVarRef(node)){
            headerFile.append(`int ${getName(node)}_evaluate();`,NL)
            codeFile.append(`
            inline int ${getName(node)}_evaluate(){
                int value = ${getName(node.ref)}_evaluate();
                return value;
            }`,NL)
        }

    }


}





function generateCCSL(ccslFile: CompositeGeneratorNode, model: Model) {
    var allClocks: String[] = [];
    for (var node of streamAst(model)) {
        if(isBloc(node) || isModel(node) || isAssignment(node) || isVarDecl(node) || isIf(node)){ //for non atomic rules
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

    ccslFile.append(`
        Precedence ${getName(model) + '_startEvaluation'} < (max: 1) ${getName(model) + '_finishEvaluation'}`, NL
    );

    ccslFile.append(`
            SubClocking ${getName(model) + '_startEvaluation'} <- ${getName(model.statements[0]) + '_startEvaluation'} //should be the first non atomic one
            SubClocking ${getName(model.statements[0]) + '_startEvaluation'} <- ${getName(model) + '_startEvaluation'}`, NL
    );

    ccslFile.append(`
            SubClocking ${getName(model) + '_finishEvaluation'} <- ${getName(model.statements[model.statements.length-1]) + '_finishEvaluation'}
            SubClocking ${getName(model.statements[model.statements.length-1]) + '_finishEvaluation'} <- ${getName(model) + '_finishEvaluation'}`, NL
    );

    //model for loop
    var precedesList: String[][] = [];
    for (let i = 0; i < model.statements.length - 1; i++) {
        const e1 = model.statements[i];
        const e2 = model.statements[i + 1];
        precedesList.push([getName(e1) + "_finishEvaluation", getName(e2) + "_startEvaluation"]);
    }
    var flatList: String[] = precedesList.map(sl => "Precedence "+sl.join(" < "));
    console.log(flatList);
    ccslFile.append(`
            ${flatList.join(`
            `)}`, NL
    );


    for (var node of streamAllContents(model)) {
        if(isBloc(node)){

            ccslFile.append(` //bloc stuff
                    Precedence ${getName(node) + '_startEvaluation'} < (max: 1) ${getName(node) + '_finishEvaluation'}`, NL
           );

            ccslFile.append(`
                    SubClocking ${getName(node) + '_startEvaluation'} <- ${getName(node.statements[0]) + '_startEvaluation'} //should be the first non atomic one
                    SubClocking ${getName(node.statements[0]) + '_startEvaluation'} <- ${getName(node) + '_startEvaluation'}`, NL
            );

            ccslFile.append(`
                    SubClocking ${getName(node) + '_finishEvaluation'} <- ${getName(node.statements[node.statements.length-1]) + '_finishEvaluation'}
                    SubClocking ${getName(node.statements[node.statements.length-1]) + '_finishEvaluation'} <- ${getName(node) + '_finishEvaluation'}`, NL
            );


            var precedesList: String[][] = [];
            for (let i = 0; i < node.statements.length - 1; i++) {
                const e1 = node.statements[i];
                const e2 = node.statements[i + 1];
                precedesList.push([getName(e1) + "_finishEvaluation", getName(e2) + "_startEvaluation"]);
            }
            var flatList: String[] = precedesList.map(sl => "Precedence "+sl.join(" < "));
            console.log(flatList);
            ccslFile.append(`
                    ${flatList.join(`
                    `)}`, NL
            );
        }

        if (isVarDecl(node)) { //VarDecl is not atomic
            ccslFile.append(`//varDecl stuff
            Precedence ${getName(node) + '_startEvaluation'} < ${getName(node) + '_finishEvaluation'}`,NL
            );
        }
        
        if (isAssignment(node)) { //Assignment is not atomic
            ccslFile.append(`//assignement stuff
            Precedence ${getName(node) + '_startEvaluation'} < ${getName(node) + '_finishEvaluation'}`, NL
            );

        }
        
        if (isIf(node)) { //IF is not atomic
            ccslFile.append(`//if stuff
            Precedence ${getName(node)}_startEvaluation < ${getName(node)}_finishEvaluation`, NL
            );
            //other sched rules
            ccslFile.append(`
            SubClocking ${getName(node) + '_startEvaluation'} <- ${getName(node) + '_evalCond'}
            SubClocking ${getName(node) + '_evalCond'} <- ${getName(node) + '_startEvaluation'}`, NL
            );

            ccslFile.append(`
            Let tmp_${getName(node)}_xor be ${getName(node)}_condTrue + ${getName(node)}_condFalse //may be 'or' instead of +
            Exclusion ${getName(node)}_condTrue # ${getName(node)}_condFalse
            Precedence ${getName(node)}_evalCond < tmp_${getName(node)}_xor`, NL
            );

            ccslFile.append(`
            SubClocking ${getName(node) + '_condTrue'} <- ${getName(node.then) + '_startEvaluation'}
            SubClocking ${getName(node.then) + '_startEvaluation'} <- ${getName(node) + '_condTrue'}`, NL
            );

            if(node.else){
                ccslFile.append(`
                SubClocking ${getName(node) + '_condFalse'} <- ${getName(node.else) + '_startEvaluation'}
                SubClocking ${getName(node.else) + '_startEvaluation'} <- ${getName(node) + '_condFalse'}`, NL
                );

                ccslFile.append(`
                Let tmp_${getName(node)}_endThenOrElse be ${getName(node.then)}_finishEvaluation + ${getName(node.else)}_finishEvaluation //may be 'or' instead of +
                Precedence tmp_${getName(node)}_endThenOrElse < ${getName(node)}_finishEvaluation`, NL
                );
            }else{
                ccslFile.append(`
                Precedence ${getName(node.then)}_finishEvaluation < ${getName(node)}_finishEvaluation`, NL
                );
            }

            

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

