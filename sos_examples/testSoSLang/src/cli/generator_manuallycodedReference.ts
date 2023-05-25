import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, Reference, isReference, streamAllContents, streamAst, toString } from 'langium';
import path from 'path';
import { Model, isAssignment, isBloc, isIf, isModel, isParallelBloc, isPlus, isVarDecl, isVarRef } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { Range, integer } from 'vscode-languageclient';


var globalUnNamedCounter:integer = 0
var globalVariableCounter:integer = 0

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedSCXMLFilePath = `${path.join(data.destination, data.name)}.scxml`;

    const scxmlFile = new CompositeGeneratorNode('');

    generateSCXML(scxmlFile, model);


    const generatedCodeFilePath = `${path.join(data.destination, data.name)}.c`;
    const codeFile = new CompositeGeneratorNode();
    const generatedHeaderFilePath = `${path.join(data.destination, data.name)}.h`;
    const headerFile = new CompositeGeneratorNode();
    codeFile.append(`#include "${data.name}.h"`, NL, NL);

    generateCode(codeFile, headerFile, model);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedSCXMLFilePath, toString(scxmlFile));
    fs.writeFileSync(generatedCodeFilePath, toString(codeFile));
    fs.writeFileSync(generatedHeaderFilePath, toString(headerFile));

    return generatedSCXMLFilePath;
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





function generateSCXML(scxmlFile: CompositeGeneratorNode, model: Model) {
    var allClocks: String[] = [];
    for (var node of streamAst(model)) {
        if( isModel(node) || isBloc(node) || isParallelBloc(node) || isVarDecl(node) || isIf(node) || isAssignment(node) || isPlus(node)){ //for all opened Concept
            allClocks.push(getName(node) + "_start");
            allClocks.push(getName(node) + "_finish");
        }
    }
     scxmlFile.append(`
<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" binding="early" xmlns:qt="http://www.qt.io/2015/02/scxml-ext" qt:editorversion="10.0.1" initial="mainState">
    <state id="mainState">
        <parallel id="allRules">`, NL
    );
    for (var node of streamAst(model)) {
        if( isModel(node)){
            const modelName: string = getName(node)
            if (node.statements.length > 0){
                scxmlFile.append(`
                <state id="${modelName}" initial="${modelName}.start${getName(model.statements[0])}">
                        <state id="${modelName}.idle">
                            <transition type="internal" event="${modelName}.start" target="${modelName}.start${getName(model.statements[0])}"/>
                        </state>`, NL
                );     

                for (let index = 0; index < model.statements.length; index++) {
                    const statement: AstNode = model.statements[index];
                    const statementName: string = getName(statement)
                    const nexStateName: string = index == model.statements.length-1 ? modelName+".idle": modelName+".start"+getName(node.statements[index+1])
                    scxmlFile.append(`
                    <state id="${modelName}.start${statementName}">
                            <onentry>
                                <raise event="${statementName}.start"/>
                            </onentry>
                            <transition type="internal" event="${statementName}.finish" target="${nexStateName}"/>
                    </state>`, NL
                    );     
                }
                scxmlFile.append(`
                </state>`, NL
                );  
            }
        }
        if(isBloc(node)){
            const blocName: string = getName(node)
            if (node.statements.length > 0){
                scxmlFile.append(`
                <state id="${blocName}" initial="${blocName}.start${getName(model.statements[0])}">
                        <state id="${blocName}.idle">
                            <transition type="internal" event="${blocName}.start" target="${blocName}.start${getName(node.statements[0])}"/>
                        </state>`, NL
                );     

                for (let index = 0; index < model.statements.length; index++) {
                    const statement: AstNode = model.statements[index];
                    const statementName: string = getName(statement)
                    const nexStateName: string = index == model.statements.length-1 ? blocName+".idle": blocName+".start"+getName(node.statements[index+1])
                    scxmlFile.append(`
                    <state id="${blocName}.start${statementName}">
                            <onentry>
                                <raise event="${statementName}.start"/>
                            </onentry>
                            <transition type="internal" event="${statementName}.finish" target="${nexStateName}"/>
                    </state>`, NL
                    );     
                }
                scxmlFile.append(`
                </state>`, NL
                );  
            }
        }
        if(isParallelBloc(node)){
            const blocName: string = getName(node)
            if (node.statements.length > 0){
                scxmlFile.append(`
                <state id="${blocName}" initial="${blocName}c.idle">
                    <state id="${blocName}.idle">
                        <transition type="internal" event="${blocName}.start" target="${blocName}.startAllStatements">
                            <log label="start ${blocName}"/>
                        </transition>
                    </state>
                    <parallel id="${blocName}.startAllStatements">`, NL
                );     

                for (let index = 0; index < model.statements.length; index++) {
                    const statement: AstNode = model.statements[index];
                    const statementName: string = getName(statement)
                    const nexStateName: string = blocName+".finish"+statementName
                    scxmlFile.append(`
                    <state id="${blocName}.v1Assign1" initial="${blocName}.startv1Assign1">
                        <state id="${blocName}.start${statementName}">
                                <onentry>
                                    <raise event="${statementName}.start"/>
                                </onentry>
                                <transition type="internal" event="${statementName}.finish" target="${nexStateName}"/>
                        </state>
                        <final id="${nexStateName}">
                        </final>`, NL
                    );     
                }
                scxmlFile.append(`
                    <transition type="internal" event="done.state.${blocName}.startAllStatements" target="${blocName}.idle">
                        <log label="finish ${blocName}"/>
                        <raise event="${blocName}.finish"/>
                    </transition>
                    </parallel>
                </state>`, NL
                );  
            }
        }

    }



    // scxmlFile.append(`
    //         SubClocking ${modelName + '_startEvaluation'} <- ${getName(model.statements[0]) + '_startEvaluation'} //should be the first non atomic one
    //         SubClocking ${getName(model.statements[0]) + '_startEvaluation'} <- ${modelName + '_startEvaluation'}`, NL
    // );

    // scxmlFile.append(`
    //         SubClocking ${modelName + '_finishEvaluation'} <- ${getName(model.statements[model.statements.length-1]) + '_finishEvaluation'}
    //         SubClocking ${getName(model.statements[model.statements.length-1]) + '_finishEvaluation'} <- ${modelName + '_finishEvaluation'}`, NL
    // );

    // //model for loop
    // var precedesList: String[][] = [];
    // for (let i = 0; i < model.statements.length - 1; i++) {
    //     const e1 = model.statements[i];
    //     const e2 = model.statements[i + 1];
    //     precedesList.push([getName(e1) + "_finishEvaluation", getName(e2) + "_startEvaluation"]);
    // }
    // var flatList: String[] = precedesList.map(sl => "Precedence "+sl.join(" < "));
    // console.log(flatList);
    // scxmlFile.append(`
    //         ${flatList.join(`
    //         `)}`, NL
    // );


    // for (var node of streamAllContents(model)) {
    //     if(isBloc(node)){

    //         scxmlFile.append(` //bloc stuff
    //                 Precedence ${getName(node) + '_startEvaluation'} < (max: 1) ${getName(node) + '_finishEvaluation'}`, NL
    //        );

    //         scxmlFile.append(`
    //                 SubClocking ${getName(node) + '_startEvaluation'} <- ${getName(node.statements[0]) + '_startEvaluation'} //should be the first non atomic one
    //                 SubClocking ${getName(node.statements[0]) + '_startEvaluation'} <- ${getName(node) + '_startEvaluation'}`, NL
    //         );

    //         scxmlFile.append(`
    //                 SubClocking ${getName(node) + '_finishEvaluation'} <- ${getName(node.statements[node.statements.length-1]) + '_finishEvaluation'}
    //                 SubClocking ${getName(node.statements[node.statements.length-1]) + '_finishEvaluation'} <- ${getName(node) + '_finishEvaluation'}`, NL
    //         );


    //         var precedesList: String[][] = [];
    //         for (let i = 0; i < node.statements.length - 1; i++) {
    //             const e1 = node.statements[i];
    //             const e2 = node.statements[i + 1];
    //             precedesList.push([getName(e1) + "_finishEvaluation", getName(e2) + "_startEvaluation"]);
    //         }
    //         var flatList: String[] = precedesList.map(sl => "Precedence "+sl.join(" < "));
    //         console.log(flatList);
    //         scxmlFile.append(`
    //                 ${flatList.join(`
    //                 `)}`, NL
    //         );
    //     }

    //     if (isVarDecl(node)) { //VarDecl is not atomic
    //         scxmlFile.append(`//varDecl stuff
    //         Precedence ${getName(node) + '_startEvaluation'} < ${getName(node) + '_finishEvaluation'}`,NL
    //         );
    //     }
        
    //     if (isAssignment(node)) { //Assignment is not atomic
    //         scxmlFile.append(`//assignement stuff
    //         Precedence ${getName(node) + '_startEvaluation'} < ${getName(node) + '_finishEvaluation'}`, NL
    //         );

    //     }
        
    //     if (isIf(node)) { //IF is not atomic
    //         scxmlFile.append(`//if stuff
    //         Precedence ${getName(node)}_startEvaluation < ${getName(node)}_finishEvaluation`, NL
    //         );
    //         //other sched rules
    //         scxmlFile.append(`
    //         SubClocking ${getName(node) + '_startEvaluation'} <- ${getName(node) + '_evalCond'}
    //         SubClocking ${getName(node) + '_evalCond'} <- ${getName(node) + '_startEvaluation'}`, NL
    //         );

    //         scxmlFile.append(`
    //         Let tmp_${getName(node)}_xor be ${getName(node)}_condTrue + ${getName(node)}_condFalse //may be 'or' instead of +
    //         Exclusion ${getName(node)}_condTrue # ${getName(node)}_condFalse
    //         Precedence ${getName(node)}_evalCond < tmp_${getName(node)}_xor`, NL
    //         );

    //         scxmlFile.append(`
    //         SubClocking ${getName(node) + '_condTrue'} <- ${getName(node.then) + '_startEvaluation'}
    //         SubClocking ${getName(node.then) + '_startEvaluation'} <- ${getName(node) + '_condTrue'}`, NL
    //         );

    //         if(node.else){
    //             scxmlFile.append(`
    //             SubClocking ${getName(node) + '_condFalse'} <- ${getName(node.else) + '_startEvaluation'}
    //             SubClocking ${getName(node.else) + '_startEvaluation'} <- ${getName(node) + '_condFalse'}`, NL
    //             );

    //             scxmlFile.append(`
    //             Let tmp_${getName(node)}_endThenOrElse be ${getName(node.then)}_finishEvaluation + ${getName(node.else)}_finishEvaluation //may be 'or' instead of +
    //             Precedence tmp_${getName(node)}_endThenOrElse < ${getName(node)}_finishEvaluation`, NL
    //             );
    //         }else{
    //             scxmlFile.append(`
    //             Precedence ${getName(node.then)}_finishEvaluation < ${getName(node)}_finishEvaluation`, NL
    //             );
    //         }

            

    //     }

    // }

    scxmlFile.append(`
        </parallel>
    </state>
</scxml>`, NL
    );


    scxmlFile.append(`
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

