import chalk from 'chalk';
import { Command } from 'commander';
import { FSMModel } from '../language-server/generated/ast';
import { FiniteStateMachineLanguageMetaData } from '../language-server/generated/module';
import { createFiniteStateMachineServices } from '../language-server/finite-state-machine-module';
import { extractAstNode } from './cli-util';
import { generateDot } from './generator';
import { NodeFileSystem } from 'langium/node';

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createFiniteStateMachineServices(NodeFileSystem).FiniteStateMachine;
    const model = await extractAstNode<FSMModel>(fileName, services);
    const generatedFilePath = generateDot(model, fileName, opts.destination);
    console.log(chalk.green(`Dot file generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    destination?: string;
}

export default function(): void {
    const program = new Command();

    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);

    const fileExtensions = FiniteStateMachineLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file')
        .action(generateAction);

    program.parse(process.argv);
}
