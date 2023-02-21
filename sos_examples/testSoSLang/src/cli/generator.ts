import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, streamAllContents, toString } from 'langium';
import path from 'path';
import { Model, VarDecl, VarRef, isIf, isPlus, isVarDecl } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { Range, integer } from 'vscode-languageclient';


var globalUnNamedCounter:integer = 0

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.lc`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('Specification prec {', NL, NL);
    var allClocks:String[]=[]
    for(var node of streamAllContents(model)){
        allClocks.push(getName(node)+"_startEvaluation")
        allClocks.push(getName(node)+"_finishEvaluation")

        if(isVarDecl(node)){
            allClocks.push(getName(node)+"_getCurrentValue")
        }
        if(isPlus(node)){
            allClocks.push(getName(node)+"_plusRWR")
        }
        if(isIf(node)){
            allClocks.push(getName(node)+"_evalCond")
            allClocks.push(getName(node)+"_condTrue")
            allClocks.push(getName(node)+"_condFalse")
        }
    }
    fileNode.append(`
    Clock ${allClocks.join(` 
        `)} {`,NL
    )

    fileNode.append(`
            SubClocking ${getName(model)+'_startEvaluation'} <- ${getName(model.statements[0])+'_startEvaluation'}
            SubClocking ${getName(model.statements[0])+'_startEvaluation'} <- ${getName(model)+'_startEvaluation'}`,NL
    )

    fileNode.append(`
            SubClocking ${getName(model)+'_finishEvaluation'} <- ${getName(model.statements[0])+'_finishEvaluation'}
            SubClocking ${getName(model.statements[0])+'_finishEvaluation'} <- ${getName(model)+'_finishEvaluation'}`,NL
    )

    //model for loop
    var precedesList:String[][] = []
    for (let i = 0; i < model.statements.length -1; i++) {
        const e1 = model.statements[i];
        const e2 = model.statements[i+1];
        precedesList.push([getName(e1)+"_finishEvaluation",getName(e2)+"_startEvaluation"])
    }
    var flatList:String[] = precedesList.map(sl => sl.join(" < "))
    console.log(flatList)
    fileNode.append(`
            ${flatList.join(`
            `)}`,NL
    )


    for(var node of streamAllContents(model)){
        if(isVarDecl(node)){ //VarDecl is atomic
            fileNode.append(`
            SubClocking ${getName(model)+'_startEvaluation'} <- ${getName(model)+'_finishEvaluation'}
            SubClocking ${getName(model)+'_finishEvaluation'} <- ${getName(model)+'_startEvaluation'}`,NL
            )
        }
        if(isPlus(node)){//Plus is atomic
            fileNode.append(`
            SubClocking ${getName(model)+'_startEvaluation'} <- ${getName(model)+'_finishEvaluation'}
            SubClocking ${getName(model)+'_finishEvaluation'} <- ${getName(model)+'_startEvaluation'}`,NL
            )

            //ordering due to internal call
            fileNode.append(`
            SubClocking ${getName(node.left.ref.ref as VarDecl)}_finishEvaluation <- ${getName(node)}_plusRWR
            SubClocking ${getName(node)}_plusRWR <- ${getName(node.left.ref.ref as VarDecl)}_finishEvaluation`,NL
            )
            fileNode.append(`
            SubClocking ${getName((node.right as VarRef).ref.ref as VarDecl)}_finishEvaluation <- ${getName(node)}_plusRWR
            SubClocking ${getName(node)}_plusRWR <- ${getName((node.right as VarRef).ref.ref as VarDecl)}_finishEvaluation`,NL
            )

        }
        if(isIf(node)){ //IF is not atomic
            fileNode.append(`
            ${getName(node)}_startEvaluation < ${getName(node)}_finishEvaluation`,NL
            )
            //other sched rules
            fileNode.append(`
            SubClocking ${getName(model)+'_startEvaluation'} <- ${getName(model)+'_evalCond'}
            SubClocking ${getName(model)+'_evalCond'} <- ${getName(model)+'_startEvaluation'}`,NL
            )
            
            fileNode.append(`
            let tmp_${getName(node)}_xor = ${getName(node)}_condTrue or ${getName(node)}_condFalse
            ${getName(node)}_condTrue # ${getName(node)}_condFalse
            ${getName(node)}_evlCond < tmp_${getName(node)}_xor`,NL
            )
        }
        
    }

    fileNode.append(`
    //Where should we put the data dependent control specification ?`,NL
    )


    fileNode.append(`
    }
    `,NL)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}
function getName(node:AstNode): string {
    if(node.$cstNode){
        var r: Range = node.$cstNode?.range
        return node.$type+r.start.line+"_"+r.start.character+"_"+r.end.line+"_"+r.end.character;
    }else{
        return "noName"+globalUnNamedCounter++
    }
}

