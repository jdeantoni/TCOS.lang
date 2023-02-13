import fs from 'fs';
import { CompositeGeneratorNode, Grammar, NL, toString } from 'langium';
import path from 'path';
import { SoSSpec, VariableDeclaration } from '../language-server/generated/ast'; //VariableDeclaration
import { extractDestinationAndName } from './cli-util';







export function generateStuffFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.txt`;
    const fileNode = new CompositeGeneratorNode();
    for(var openedRule of model.rtdAndRules){
        fileNode.append(`${openedRule.onRule.ref?.name} is opened with:`, NL);
            for(var rtd of openedRule.runtimeState){
                fileNode.append(`\t* ${rtd} of type ${(rtd as VariableDeclaration).type?.primitive}`, NL);
            }
            for(var rwr of openedRule.rules){
                fileNode.append(`\t* ${rwr.premise} of type ${rwr.conclusion}`, NL);
            }
    }
//=' ${/*(statePart instanceof VariableDeclaration)?(statePart as VariableDeclaration).value:''*/typeof(statePart)}
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}
