import chalk from 'chalk';
import { Command } from 'commander';
import { Model } from '../language-server/generated/ast';
import { SimpleLLanguageMetaData } from '../language-server/generated/module';
import { createSimpleLServices } from '../language-server/simple-l-module';
import { extractAstNode, extractDestinationAndName } from './cli-util';
import { NodeFileSystem } from 'langium/node';
import { generatefromCCFG } from 'backend-compiler/compilerBackend';
import { CompositeGeneratorNode, toString } from 'langium';
import path from 'path';
import fs from 'fs';
import { CCFG } from 'ccfg';
import { SimpleLCompilerFrontEnd } from './generated/simpleLCompilerFrontEnd';
import { IGenerator } from 'backend-compiler/GeneratorInterface';
import { PythonGenerator } from 'backend-compiler/pythonGenerator';
import { CppGenerator } from 'backend-compiler/cppGenerator';
import { JsGenerator } from 'backend-compiler/jsGenerator';


export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    console.log("started")
    const services = createSimpleLServices(NodeFileSystem).SimpleL;
    const model = await extractAstNode<Model>(fileName, services);

    const data = extractDestinationAndName(fileName, opts.targetDirectory);
    

    const generatedDotFilePath = `${path.join(data.destination, data.name)}.dot`;
    const dotFile = new CompositeGeneratorNode();


    
    let debug: boolean = false;
    let ccfg = doGenerateCCFG(dotFile, model,debug);
    const codeFile = new CompositeGeneratorNode();
    console.log(data.destination)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedDotFilePath, toString(dotFile));

    let filePath = path.join(data.destination, data.name);
    

    let generator:IGenerator;
    if (opts.python) {
        generator = new PythonGenerator(debug);
    } else if(opts.js != undefined && opts.js){
        generator = new JsGenerator();
    } else {
        generator = new CppGenerator(debug);
    }

    let generatedCodeFilePath = generator.nameFile(filePath);



    generatefromCCFG(ccfg, codeFile, generator, filePath,debug)
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedCodeFilePath, toString(codeFile));

    console.log(chalk.green(`CCFG and Code generated successfully: ${generatedCodeFilePath}`));
};

export type GenerateOptions = {
    targetDirectory ?: string;
    debug ?: boolean;
    python ?: boolean;
    js ?: boolean;
}

export default function(): void {
    console.log("started")
    const program = new Command();

    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);

    const fileExtensions = SimpleLLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-t, --targetDirectory <dir>', 'destination directory of generating', 'generated')
        .option('-d, --debug ', 'ask for debugging message during execution of the generated code')
        .option('--python', 'compile into python', 'output.cpp')
        .option('--js', 'compile into js', 'output.cpp')
        .description('generates the concurrent control flow graph representation and the executable code of the given source file')
        .action(generateAction);

    program.parse(process.argv);
}


function doGenerateCCFG(codeFile: CompositeGeneratorNode, model: Model,debug:boolean): CCFG {
    var compilerFrontEnd = new SimpleLCompilerFrontEnd(debug);
    var ccfg = compilerFrontEnd.generateCCFG(model);
   
    ccfg.addSyncEdge()

    ccfg.detectCycles();
    ccfg.collectCycles()

    codeFile.append(ccfg.toDot());
    return ccfg;
}
