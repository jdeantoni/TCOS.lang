import fs from 'fs';
import {  CompositeGeneratorNode, toString } from 'langium';
import path from 'path';
import { Model } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { CCFGVisitor } from './SimpleLVisitor';


export function generateCCFG(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);

    const generatedDotFilePath = `${path.join(data.destination, data.name)}.dot`;
    const dotFile = new CompositeGeneratorNode();

    doGenerateCCFG(dotFile, model);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedDotFilePath, toString(dotFile));

    return generatedDotFilePath;
}






function doGenerateCCFG(codeFile: CompositeGeneratorNode, model: Model) {
    var visitor = new CCFGVisitor();
    visitor.visit(model);
    var ccfg = visitor.ccfg;
    codeFile.append(ccfg.toDot());
}




// function getName(node:AstNode | Reference<AstNode> | undefined): string {
//     if(isReference(node)){
//         node = node.ref
//     }
//     if(node !==undefined && node.$cstNode){
//         var r: Range = node.$cstNode?.range
//         return node.$type+r.start.line+"_"+r.start.character+"_"+r.end.line+"_"+r.end.character;
//     }else{
//         return "noName"+globalUnNamedCounter++
//     }
// }

