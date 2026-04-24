/**
 * Interactive loop to generate programs from the installed
 * languages (ParLang, SimpleL) using the TCOS-generated CLIs.
 */

import * as path from 'path';
import { info, success, error, askYesNo, askText, askChoice } from './display';
import { executeCommand } from './commands';
import { LANGUAGES, PROGRAMING_LANGUAGES, ROOT } from './config';

/**
 * Run the program generation wizard in a loop.
 *
 * Each iteration prompts the user for:
 *   - the language folder to use (e.g. "Parlang", "SimpleL"),
 *   - the source file name,
 *   - the target output format (C++, Python or JavaScript),
 *   - whether to enable debug mode.
 *
 * The matching language CLI is then invoked from
 * `examples/programs/`. The loop keeps going until the user declines
 * to generate another program.
 */
export async function generatePrograms(): Promise<Array<string>> {
    const programsFolder = path.join(ROOT, "examples", "programs");
    const CCFGGenerated: Array<string> = [];
    
    let shouldContinue = true;
    
    while (shouldContinue) {
        info("Program Generation :");
        
        const folder = await askChoice("Which language?", Object.keys(LANGUAGES));

        const fileName = await askText("File name (ex: test1): ");
        const sourceFile = fileName + LANGUAGES[folder].extension;
        const dotName = `${fileName}.dot`;
        
        const format = await askChoice("Output format:", PROGRAMING_LANGUAGES);
        const debug = await askYesNo("Enable debug mode?");
        
        const cliPath = path.join("..", "languages", folder, "bin", "cli.js");
        let command = `node ${cliPath} generate ${sourceFile}`;
        
        if (format === "Python") {
            command += " --python";
        } else if (format === "JavaScript") {
            command += " --js";
        }
        
        if (debug) {
            command += " --debug";
        }

        try {
            await executeCommand(command, programsFolder);

            success(`Successfully generated ${sourceFile} in examples/programs/generated/`);
            CCFGGenerated.push(dotName);
        } catch (err) {
            error("Generation failed!");
        }
        
        shouldContinue = await askYesNo("Do you want to generate another program?");
    }
    return CCFGGenerated;
}