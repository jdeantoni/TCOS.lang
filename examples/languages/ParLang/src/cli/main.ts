import type { Program } from '../language/generated/ast.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { ParLangLanguageMetaData } from '../language/generated/module.js';
import { createParLangServices } from '../language/par-lang-module.js';
import { extractAstNode } from './cli-util.js';
import { NodeFileSystem } from 'langium/node';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { generatefromCCFG } from './compilerBackend.js';
import { IGenerator } from './GeneratorInterface.js';
import { PythonGenerator } from './pythonGenerator.js';
import { CppGenerator } from './cppGenerator.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createParLangServices(NodeFileSystem).ParLang;
    const model = await extractAstNode<Program>(fileName, services);
    let generator:IGenerator;
     if (opts.python != undefined && opts.python) {
         generator = new PythonGenerator();
     } else {
        generator = new CppGenerator();
     }
    const generatedFilePath = generatefromCCFG(model, fileName, opts.targetDirectory, opts.debug,generator);
    console.log(chalk.green(`CCFG and code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    targetDirectory ?: string;
    debug ?: boolean;
    python ?: boolean;
}

export default function(): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    const fileExtensions = ParLangLanguageMetaData.fileExtensions.join(', ');
    program
    .command('generate')
    .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
    .option('-t, --targetDirectory <dir>', 'destination directory of generating', 'generated')
    .option('-d, --debug ', 'ask for debugging message during execution of the generated code', false)
    .option('--python', 'compile into python', false)
    .description('generates the concurrent control flow graph representation of the given source file')
    .action(generateAction);

    program.parse(process.argv);
}