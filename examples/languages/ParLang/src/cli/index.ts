import chalk from 'chalk';
import { Command } from 'commander';
import { Program } from '../language/generated/ast';
import { ParLangLanguageMetaData } from '../language/generated/module';
import { createParLangServices } from '../language/par-lang-module';
import { extractAstNode } from './cli-util';
import { generateCPPfromCCFG } from './generatorCPPfromCCFG';
import { NodeFileSystem } from 'langium/node';

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createParLangServices(NodeFileSystem).ParLang;
    const model = await extractAstNode<Program>(fileName, services);
    const generatedFilePath = generateCPPfromCCFG(model, fileName, opts.targetDirectory, opts.debug);
    console.log(chalk.green(`CCFG and C++ Code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    targetDirectory ?: string;
    debug ?: boolean;
}

export default function(): void {
    const program = new Command();

    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);

    const fileExtensions = ParLangLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-t, --targetDirectory <dir>', 'destination directory of generating', 'generated')
        .option('-d, --debug ', 'ask for debugging message during execution of the generated code')
        .description('generates the concurrent control flow graph representation of the given source file')
        .action(generateAction);

    program.parse(process.argv);
}
