import chalk from 'chalk';
import { Command } from 'commander';
import { StructuralOperationalSemanticsLanguageMetaData } from '../language-server/generated/module.js';
import { createStructuralOperationalSemanticsServices } from '../language-server/structural-operational-semantics-module.js';

import { extractSosAndGrammarModels } from './cli-util.js';
import { NodeFileSystem } from 'langium/node';

import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { generateCompilerFrontEndFromSoS } from './compilerFrontEnd/generation/generateCompilerFrontEnd.js';
import { generateDebugFacadeFromSoS } from './facade/facadeGeneration.js';
import { generateDebugConfigFromSoS } from './facade/debugConfigGeneration.js';

import { patchExtensionMain } from './facade/extensionPatch.js';
import {generateCCFGDebugSetup} from './facade/generateCCFGDebugSetup.js'
import { patchPackageJson } from './facade/jsonPatch.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export type GenerateOptions = {
    destination?: string;
};

export const generateAction = async (
    fileName: string,
    opts: GenerateOptions
): Promise<void> => {

    const services =
        createStructuralOperationalSemanticsServices(NodeFileSystem)
            .StructuralOperationalSemantics;

    const [model, grammars] =
        await extractSosAndGrammarModels(fileName, services);

    const destination = opts.destination ?? '.';

    const compilerPath =
        generateCompilerFrontEndFromSoS(
            model,
            grammars,
            fileName,
            destination
        );

    console.log(
        chalk.green(`Compiler front end generated: ${compilerPath}`)
    );

    const facadePath =
        generateDebugFacadeFromSoS(
            model,
            grammars,
            fileName,
            destination
        );

    console.log(
        chalk.green(`DAP facade generated: ${facadePath}`)
    );

    const providerPath =
        generateDebugConfigFromSoS(
            model,
            fileName,
            destination
        );

    console.log(
        chalk.green(`DebugConfigurationProvider generated: ${providerPath}`)
    );

    const projectRoot = path.resolve(
        path.dirname(fileName),
        destination
    );

    generateCCFGDebugSetup(projectRoot, model.name, fileName);
    patchExtensionMain(projectRoot, model.name, fileName);
    patchPackageJson(projectRoot, model.name);

    console.log(
        chalk.green('VSCode extension patched successfully')
    );
};

export default function (): void {

    const program = new Command();

    program.version(
        JSON.parse(packageContent).version
    );

    const fileExtensions =
        StructuralOperationalSemanticsLanguageMetaData.fileExtensions.join(', ');

    program
        .command('generate')
        .argument(
            '<file>',
            `source file (possible file extensions: ${fileExtensions})`
        )
        .option(
            '-d, --destination <dir>',
            'destination directory of generating'
        )
        .description(
            'generates compiler + DAP facade + debug provider for CCFG runtime'
        )
        .action(generateAction);

    program.parse(process.argv);
};