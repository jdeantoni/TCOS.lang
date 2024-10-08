import type { Model } from '../language/generated/ast.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { SimpleLLanguageMetaData } from '../language/generated/module.js';
import { createSimpleLServices } from '../language/simple-l-module.js';
import { extractAstNode, extractDestinationAndName } from './cli-util.js';
import { NodeFileSystem } from 'langium/node';
// import * as url from 'node:url';
import * as fs from 'fs';
import * as path from 'node:path';
import { generatefromCCFG } from 'backend-compiler/compilerBackend';
import { IGenerator } from 'backend-compiler/GeneratorInterface';
import { PythonGenerator } from 'backend-compiler/pythonGenerator';
import { CppGenerator } from 'backend-compiler/cppGenerator';
import { JsGenerator } from 'backend-compiler/jsGenerator';
import { CompositeGeneratorNode, toString } from 'langium/generate';
import { SimpleLCompilerFrontEnd } from './generated/simpleLCompilerFrontEnd.js';
import { CCFG } from 'ccfg';
// const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createSimpleLServices(NodeFileSystem).SimpleL;
    const model = await extractAstNode<Model>(fileName, services);

    const data = extractDestinationAndName(fileName, opts.targetDirectory);
    

    const generatedDotFilePath = `${path.join(data.destination, data.name)}.dot`;
    const dotFile = new CompositeGeneratorNode();


    
    let debug: boolean = false;
    let ccfg = doGenerateCCFG(dotFile, model,debug);
    const codeFile = new CompositeGeneratorNode();
    
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedDotFilePath, toString(dotFile));


    let generator:IGenerator;
     if (opts.python != undefined && opts.python) {
         generator = new PythonGenerator();
     } 
     else if(opts.js != undefined && opts.js){
         generator = new JsGenerator();
     } else{
        generator = new CppGenerator();
     }
     

    let filePath = path.join(data.destination, data.name);
    let generatedCodeFilePath = generator.nameFile(filePath);
    generatefromCCFG(ccfg, codeFile, generator, filePath,debug)
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedCodeFilePath, toString(codeFile));
    console.log(chalk.green(`CCFG and code generated successfully: ${data.destination}`));
};

export type GenerateOptions = {
    targetDirectory ?: string;
    debug ?: boolean;
    python ?: boolean;
    js ?: boolean;
}

export default function(): void {
    const program = new Command();

    const fileExtensions = SimpleLLanguageMetaData.fileExtensions.join(', ');
    program
    .command('generate')
    .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
    .option('-t, --targetDirectory <dir>', 'destination directory of generating', 'generated')
    .option('-d, --debug ', 'ask for debugging message during execution of the generated code', false)
    .option('--python', 'compile into python', false)
    .option('--js', 'compile into js', false)
    .description('generates the concurrent control flow graph representation of the given source file')
    .action(generateAction);

    program.parse(process.argv);
}

function doGenerateCCFG(codeFile: CompositeGeneratorNode, model: Model,debug:boolean): CCFG {
    var compilerFrontEnd = new SimpleLCompilerFrontEnd();
    var ccfg = compilerFrontEnd.generateCCFG(model, debug);
   
    ccfg.addSyncEdge()

    ccfg.detectCycles();
    ccfg.collectCycles()

    codeFile.append(ccfg.toDot());
    return ccfg;
}