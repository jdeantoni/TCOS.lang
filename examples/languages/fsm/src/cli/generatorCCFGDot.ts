import fs from 'fs';
import { CompositeGeneratorNode, toString } from 'langium';
import path from 'path';
import { FSMModel } from '../language-server/generated/ast';
import { FilePathData } from './cli-util';
import { CCFGVisitor } from './generated/testFSM';

import { CCFG } from 'ccfg';

export function generateDot(model: FSMModel, data:FilePathData ): CCFG {
    
    const generatedFilePath = `${path.join(data.destination, data.name)}.dot`;

    const dotFile = new CompositeGeneratorNode();
    
    const ccfg = doGenerateCCFG(dotFile, model);


    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(dotFile));
    return ccfg;
}


function doGenerateCCFG(codeFile: CompositeGeneratorNode, model: FSMModel): CCFG {
    var visitor = new CCFGVisitor();
    visitor.visit(model);

    var ccfg = visitor.ccfg;
   
    ccfg.addSyncEdge()

    ccfg.detectCycles();
    ccfg.collectCycles()

    codeFile.append(ccfg.toDot());
    return ccfg;
}