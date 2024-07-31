import chalk from 'chalk';
import { Command } from 'commander';
import { StructuralOperationalSemanticsLanguageMetaData } from '../language-server/generated/module.js';
import { createStructuralOperationalSemanticsServices } from '../language-server/structural-operational-semantics-module.js';

import { extractSosAndGrammarModels } from './cli-util.js';
import { generateCompilerFrontEndFromSoS } from './generatorCCFGCompiler.js';
import { NodeFileSystem } from 'langium/node';

import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');


export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createStructuralOperationalSemanticsServices(NodeFileSystem).StructuralOperationalSemantics;
    const model = await extractSosAndGrammarModels(fileName, services);
    const generatedFilePath = generateCompilerFrontEndFromSoS(model[0],model[1], fileName, opts.destination);
    console.log(chalk.green(`Compiler front end generated successfully: ${generatedFilePath}`));
    
};

export type GenerateOptions = {
    destination?: string;
}

export default function(): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    const fileExtensions = StructuralOperationalSemanticsLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates CCSL & C code')
        .action(generateAction);

    program.parse(process.argv);
}
