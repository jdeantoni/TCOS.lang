/**
 * Interactive loop to generate programs from the installed
 * languages (ParLang, SimpleL) using the TCOS-generated CLIs.
 */

import * as path from 'path';
import { info, success, error, askYesNo, askText, askChoice, warning } from './display';
import { executeCommand } from './commands';
import { BatchResult, LANGUAGES, PROGRAMING_LANGUAGES, ROOT } from './config';
import { readdirSync } from 'fs';

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
export async function generatePrograms(): Promise<Array<BatchResult>> {
    const programsFolder = path.join(ROOT, "examples", "programs");
    const results: Array<BatchResult> = [];
    
    let shouldContinue = true;
    
    while (shouldContinue) {
        info("Program Generation :");
        
        const folder = await askChoice("Which language?", Object.keys(LANGUAGES));
        const fileName = await askText("File name (ex: test1): ");
        const sourceFile = fileName + LANGUAGES[folder].extension;
        const format = await askChoice("Output format:", PROGRAMING_LANGUAGES);
        const debug = await askYesNo("Enable debug mode?");
        
        const command = buildGenerationCommand(folder, sourceFile, format, debug);

        try {
            await executeCommand(command, programsFolder);
            success(`Successfully generated ${sourceFile} in examples/programs/generated/`);
            results.push({
                language: folder,
                fileName,
                format,
                status: "success",
                dotName: `${fileName}.dot`
            });
        } catch (err) {
            error("Generation failed!");
            results.push({
                language: folder,
                fileName,
                format,
                status: "error",
                failedCommand: command
            });
        }
        
        shouldContinue = await askYesNo("Do you want to generate another program?");
    }
    return results;
}

/**
 * Build the CLI command to generate a program with a given format and debug flag.
 * Extracted for reuse between interactive and batch modes.
 */
function buildGenerationCommand(language: string, sourceFile: string, format: string, debug: boolean): string {
    const cliPath = path.join("..", "languages", language, "bin", "cli.js");
    let command = `node ${cliPath} generate ${sourceFile}`;

    if (format === "Python") command += " --python";
    else if (format === "JavaScript") command += " --js";
    if (debug) command += " --debug";

    return command;
}

// === Batch generation ===

/**
 * Discover all program files in examples/programs/ that match a known language extension.
 * Returns a list of { language, fileName } pairs ready to be tested.
 * 
 * @param programsFolder
 * @return 
 */
function discoverPrograms(programsFolder: string): Array<{ language: string, fileName: string }> {
    // Build a reverse map: extension -> language name
    const extensionToLanguage: Record<string, string> = {};
    for (const [langName, config] of Object.entries(LANGUAGES)) {
        extensionToLanguage[config.extension] = langName;
    }

    const discovered: Array<{ language: string, fileName: string }> = [];
    const entries = readdirSync(programsFolder, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isFile()) continue;

        for (const [ext, lang] of Object.entries(extensionToLanguage)) {
            if (entry.name.endsWith(ext)) {
                const fileName = entry.name.slice(0, -ext.length);
                discovered.push({ language: lang, fileName });
                break;
            }
        }
    }

    return discovered;
}

/**
 * Run the batch: discover all programs, generate each one in all formats
 * with debug enabled. Never stops on failure — collects results and returns them.
 */
export async function generateBatch(): Promise<BatchResult[]> {
    const programsFolder = path.join(ROOT, "examples", "programs");
    const programs = discoverPrograms(programsFolder);
    const results: BatchResult[] = [];

    info(`[BATCH] Found ${programs.length} program(s) to test in ${PROGRAMING_LANGUAGES.length} format(s) each.`);

    for (const prog of programs) {
        const sourceFile = prog.fileName + LANGUAGES[prog.language].extension;

        for (const format of PROGRAMING_LANGUAGES) {
            const command = buildGenerationCommand(prog.language, sourceFile, format, true);
            info(`[BATCH] ${prog.language}/${prog.fileName} (${format})`);

            try {
                await executeCommand(command, programsFolder);
                results.push({
                    language: prog.language,
                    fileName: prog.fileName,
                    format,
                    status: "success"
                });
            } catch (err) {
                warning(`[BATCH] ${prog.language}/${prog.fileName} (${format}) failed`);
                results.push({
                    language: prog.language,
                    fileName: prog.fileName,
                    format,
                    status: "error",
                    failedCommand: command
                });
            }
        }
    }

    return results;
}