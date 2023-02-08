import fs from 'fs';
import { CompositeGeneratorNode, Grammar, NL, toString } from 'langium';
import path from 'path';
import { SoSSpec } from '../language-server/generated/ast'; //VariableDeclaration
import { extractDestinationAndName } from './cli-util';







export function generateStuffFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('"use strict";', NL, NL);

    model.sigma.forEach(ruleOpening => fileNode.append(`console.log(${ruleOpening.onRule.ref?.name} 'is opened');`, NL));
//=' ${/*(statePart instanceof VariableDeclaration)?(statePart as VariableDeclaration).value:''*/typeof(statePart)}
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}
