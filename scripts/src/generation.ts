/**
 * Program generation, in three modes:
 *   - interactive ({@link generatePrograms}): wizard loop driven by user prompts
 *   - batch ({@link generateBatch}): regenerate every discovered program in every format with debug enabled
 *   - per-file ({@link generateFileForAllFormats}): used by the watcher to refresh a single program after a change
 *
 * All three modes share {@link buildGenerationCommand} to build the CLI invocation and return 
 * {@link BatchResult} entries so results can be aggregated and reported uniformly.
 */

import * as path from 'path';
import { readdirSync } from 'fs';
import { BatchResult } from './types';
import { executeCommand } from './commands';
import { LANGUAGES, TARGET_FORMATS, PROGRAMS_FOLDER } from './project';
import { info, success, error, askYesNo, askText, askChoice, warning } from './display';

/**
 * Run the program generation wizard in a loop.
 *
 * Each iteration prompts the user for:
 *   - the language folder to use (e.g. "Parlang", "SimpleL")
 *   - the source file name
 *   - the target output format (C++, Python or JavaScript)
 *   - whether to enable debug mode
 *
 * The matching language CLI is then invoked from `examples/programs/`.
 * The loop keeps going until the user declines to generate another program.
 */
export async function generatePrograms(): Promise<Array<BatchResult>> {
    const results: Array<BatchResult> = [];
    
    let shouldContinue = true;
    
    while (shouldContinue) {
        info("Program Generation :");
        
        const folder = await askChoice("Which language?", Object.keys(LANGUAGES));
        const fileName = await askText("File name (ex: test1): ");
        const sourceFile = fileName + LANGUAGES[folder].extension;
        const format = await askChoice("Output format:", TARGET_FORMATS);
        const debug = await askYesNo("Enable debug mode?");
        
        const command = buildGenerationCommand(folder, sourceFile, format, debug);

        try {
            await executeCommand(command, PROGRAMS_FOLDER);
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
 * 
 * @param language Folder name of the language whose CLI is used (e.g. `"ParLang"`).
 * @param sourceFile Source file name with extension (e.g. `"test1.parlang"`).
 * @param format Target output format from {@link TARGET_FORMATS}.
 * @param debug If `true`, append `--debug` to the command.
 * @returns The fully assembled `node ...` command string.
 */
export function buildGenerationCommand(language: string, sourceFile: string, format: string, debug: boolean): string {
    const cliPath = path.join("..", "languages", language, "bin", "cli.js");
    let command = `node ${cliPath} generate ${sourceFile}`;

    if (format === "Python") command += " --python";
    else if (format === "JavaScript") command += " --js";
    if (debug) command += " --debug";

    return command;
}

// ============================================================
// Batch generation
// ============================================================

/**
 * Discover every programs file under `programsFolder` matching a know languge extension.
 * Returns one entry per file, ready to batch-tested.
 * 
 * Subdirectories are not traversed; only files at the etop level of `programsFolder` are considered.
 * 
 * @param programsFolder Directory to scan
 * @return One `{language, fileName}` pair per matching file where `fileName` is the base name without extension.
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
 * Run the batch: discover all programs, generate each one in all formats with debug enabled. 
 * Never stops on failure — collects results and returns them.
 */
export async function generateBatch(): Promise<BatchResult[]> {
    const programs = discoverPrograms(PROGRAMS_FOLDER);
    const results: BatchResult[] = [];

    info(`[BATCH] Found ${programs.length} program(s) to test in ${TARGET_FORMATS.length} format(s) each.`);

    for (const { language, fileName } of programs) {
        const sourceFile = fileName + LANGUAGES[language].extension;
        info(`[BATCH] ${language}/${fileName}`);
        const fileResults = await generateFileForAllFormats(language, fileName, sourceFile);
        results.push(...fileResults);
    }

    return results;
}

/**
 * Generate a single source file in every target format, with debug enabled.
 *
 * Failures are caught and turned into `"error"` {@link BatchResult}
 * entries with the failed command preserved — the function never throws,
 * so callers can keep iterating over a batch.
 * 
 * @param language Name of the langaguage whose CLI is invoked.
 * @param fileName Source file base name without extension.
 * @param srcFile Source file name with extension.
 * @param cwd Working directory for the generation command.
 * @returns One {@link BatchResult} per format in {@link TARGET_FORMATS}.
 */
export async function generateFileForAllFormats(language: string, fileName: string, srcFile: string, cwd: string = PROGRAMS_FOLDER): Promise<BatchResult[]>{
    const results: BatchResult[] = [];

    for (const format of TARGET_FORMATS){
        const command = buildGenerationCommand(language, srcFile, format, true);

        try {
            await executeCommand(command, cwd);
            results.push({ language, fileName, format, status: "success" });
        } catch {
            warning(`[${language}] ${fileName} (${format}) generation failed`);
            results.push({ language, fileName, format, status: "error", failedCommand: command });
        }
    }
    return results;
}