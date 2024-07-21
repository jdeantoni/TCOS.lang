import chalk from 'chalk';
import { Command } from 'commander';
import { Model } from '../language-server/generated/ast';
import { SimpleLLanguageMetaData } from '../language-server/generated/module';
import { createSimpleLServices } from '../language-server/simple-l-module';
import { extractAstNode } from './cli-util';
import { generateCPPfromCCFG } from './generatorCPPfromCCFG';
import { NodeFileSystem } from 'langium/node';

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createSimpleLServices(NodeFileSystem).SimpleL;
    const model = await extractAstNode<Model>(fileName, services);
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

    const fileExtensions = SimpleLLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-t, --targetDirectory <dir>', 'destination directory of generating', 'generated')
        .option('-d, --debug ', 'ask for debugging message during execution of the generated code')
        .description('generates the concurrent control flow graph representation of the given source file')
        .action(generateAction);

    program.parse(process.argv);
}
