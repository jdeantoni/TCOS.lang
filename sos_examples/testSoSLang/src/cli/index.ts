import chalk from 'chalk';
import { Command } from 'commander';
import { Model } from '../language-server/generated/ast';
import { SimpleLLanguageMetaData } from '../language-server/generated/module';
import { createSimpleLServices } from '../language-server/simple-l-module';
import { extractAstNode } from './cli-util';
import { generateCCFG } from './generatorCCFG_manuallycodedReference';
import { NodeFileSystem } from 'langium/node';

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createSimpleLServices(NodeFileSystem).SimpleL;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedFilePath = generateCCFG(model, fileName, opts.destination);
    console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    destination?: string;
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
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates the concurrent control flow graph representation of the given source file')
        .action(generateAction);

    program.parse(process.argv);
}
