/**
 * Terminal output: colored log helpers, readline-based prompts,
 * end-of-run summaries, and the ASCII-art banners used to mark
 * which mode (interactive, batch, watcher) is active.
 */

import * as path from 'path';
import { ROOT } from './project';
import { appendFileSync } from 'fs';
import * as readline from 'readline';
import { isInteractive } from './state';
import { executeCommand } from './commands';
import { BatchResult, InstallResult } from './types';

// ============================================================
// Colors
// ============================================================
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m';

// ============================================================
// Logging
// ============================================================

export function info(message: string): void{
    console.log(`${CYAN}[INFO] ${message}${RESET}`);
}

export function success(message: string): void{
    console.log(`${GREEN}[SUCCESS] ${message}${RESET}`);
}

export function error(message: string): void{
    console.log(`${RED}[ERROR] ${message}${RESET}`);
}

export function warning(message: string): void{
    console.log(`${YELLOW}[WARNING] ${message}${RESET}`);
}

export function appendToLog(logPath: string, line: string): void {
    appendFileSync(logPath, `${line}\n`);
}

// ============================================================
// User input (readline)
// ============================================================

const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


export function askYesNo(question: string): Promise<boolean>{
    return new Promise((resolve) => {
        rl.question(`${question} (y/n): `, (answer: string) => {
            const ans = answer.toLowerCase();
            resolve(ans === 'y' || ans === 'yes');
        });
    });
}

export function askChoice(question: string, options: string[]): Promise<string> {
    return new Promise((resolve) => {
        console.log(question);
        options.forEach((option, index) => {
            console.log(`  ${(index + 1)}. ${option}`);
        });
        
        rl.question(`Your choice (1-${options.length}): `, (answer: string) => {
            const index = parseInt(answer) - 1;
            if (index >= 0 && index < options.length) {
                resolve(options[index]);
            } else {
                resolve(options[0]); // Default to first option
            }
        });
    });
}

export function askText(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer: string) => {
            resolve(answer);
        });
    });
}

export function closeInput(): void{
    rl.close();
}

/**
 * Interactively ask the user whether to open VS Code on a given project before 
 * resuming the script.
 * 
 * @param name Name of the project/subfolder to open.
 * @param basePath Path, relative to the repository root, that contains the project folder.
 */
export async function askForVSCode(name: string, basePath: string): Promise<void>{
    if (!isInteractive()) return;
    const openVSCode = await askYesNo(`Do you want to open VS Code on ${name}?`);
    
    if (openVSCode) {
        const folder = path.join(ROOT, basePath, name);
        await executeCommand("code .", folder);

        success(`VS Code opened on ${name}!`);
        info(`To pick up modifications, restart the script or use 'npm run watch'`);
    }
}

// ============================================================
// Summaries
// ============================================================

/**
 * Print a generation-results section followed by the of failled commands.
 * Shared between {@link printSummary} and {@link printFullSummary}.
 * 
 * @param results Per-`(file, format)` generation results.
 */
function printBatchSection(results: BatchResult[]): void {
    console.log("");
    info(">> Programs generation");
    for (const r of results) {
        const line = `${r.language}/${r.fileName} (${r.format})`;
        (r.status === "success") ? success(`   ${line}`) : error(`   ${line}`);
    }

    const failed = results.filter(r => r.status === "error" && r.failedCommand);
    if (failed.length > 0) {
        info("");
        info(">> Failed commands (run manually to investigate)");
        for (const r of failed) {
            error(`  ${r.language}/${r.fileName} (${r.format}):`);
            error(`    ${r.failedCommand}`);
        }
    }
}

/**
 * Print a summary covering generation only (no install section). 
 * Used by the watcher after a single-program rebuild.
 * 
 * @param batchResults Generation results to summarize.
 * @returns `true` if every result is a success.
 */
export function printSummary(batchResults: BatchResult[]): boolean {
    console.log("");
    info("=".repeat(60));
    info("SUMMARY");
    info("=".repeat(60));

    printBatchSection(batchResults);

    const ok = batchResults.filter(r => r.status === "success").length;
    const ko = batchResults.length - ok;

    console.log("");
    info("=".repeat(60));
    info(`Batch:   ${ok}/${batchResults.length} succeeded, ${ko} error(s)`);
    info("=".repeat(60));

    return ko === 0;
}

/**
 * Print full end-of-run summary: package installs, langauge installs, then the generation section.
 * 
 * @param installResults Per node install resluts.
 * @param batchResults Per-`(file, format)` generation results.
 * @returns `true` if every install and every generation succeded.
 */
export function printFullSummary(installResults: InstallResult[], batchResults: BatchResult[]): boolean {
    console.log("");
    info("=".repeat(60));
    info("SUMMARY");
    info("=".repeat(60));

    const packagesResults = installResults.filter(r => r.type === "package");
    const languagesResults = installResults.filter(r => r.type === "language");

    console.log("");
    info(">> Packages installation");
    for (const r of packagesResults) {
        (r.status === "success") ? success(`   ${r.name}`) : error(`   ${r.name}`);
    }

    console.log("");
    info(">> Languages installation");
    for (const r of languagesResults) {
        (r.status === "success") ? success(`   ${r.name}`) : error(`   ${r.name}`);
    }

    printBatchSection(batchResults);

    const installOk = installResults.filter(r => r.status === "success").length;
    const installKo = installResults.length - installOk;
    const batchOk = batchResults.filter(r => r.status === "success").length;
    const batchKo = batchResults.length - batchOk;

    console.log("");
    info("=".repeat(60));
    info(`Install: ${installOk}/${installResults.length} succeeded, ${installKo} error(s)`);
    info(`Batch:   ${batchOk}/${batchResults.length} succeeded, ${batchKo} error(s)`);
    info("=".repeat(60));

    return (batchKo + installKo) === 0;
}

export function startWatcher(): void {
    console.log("");
    info("=".repeat(60));
    info("Watcher started. Edit any source file to trigger a rebuild cascade.");
    info("Press Ctrl+C to stop.");
    info("=".repeat(60));
    console.log("\n");
}

// ============================================================
// Mods
// ============================================================

function watcherMod():void {
    console.log(String.raw` __     __     ______     ______   ______     __  __     ______     ______    `);
    console.log(String.raw`/\ \  _ \ \   /\  __ \   /\__  _\ /\  ___\   /\ \_\ \   /\  ___\   /\  == \   `);
    console.log(String.raw`\ \ \/ ".\ \  \ \  __ \  \/_/\ \/ \ \ \____  \ \  __ \  \ \  __\   \ \  __<   `);
    console.log(String.raw` \ \__/".~\_\  \ \_\ \_\    \ \_\  \ \_____\  \ \_\ \_\  \ \_____\  \ \_\ \_\ `);
    console.log(String.raw`  \/_/   \/_/   \/_/\/_/     \/_/   \/_____/   \/_/\/_/   \/_____/   \/_/ /_/ `);
    console.log(`\n`);
}

function batchMod():void {
    console.log(String.raw` ______     ______     ______   ______     __  __    `);
    console.log(String.raw`/\  == \   /\  __ \   /\__  _\ /\  ___\   /\ \_\ \   `);
    console.log(String.raw`\ \  __<   \ \  __ \  \/_/\ \/ \ \ \____  \ \  __ \  `);
    console.log(String.raw` \ \_____\  \ \_\ \_\    \ \_\  \ \_____\  \ \_\ \_\ `);
    console.log(String.raw`  \/_____/   \/_/\/_/     \/_/   \/_____/   \/_/\/_/ `);
    console.log(`\n`);
}

function interactiveMod():void {
    console.log(String.raw` __     __   __     ______   ______     ______     ______     ______     ______   __     __   __   ______    `);
    console.log(String.raw`/\ \   /\ "-.\ \   /\__  _\ /\  ___\   /\  == \   /\  __ \   /\  ___\   /\__  _\ /\ \   /\ \ / /  /\  ___\   `);
    console.log(String.raw`\ \ \  \ \ \-.  \  \/_/\ \/ \ \  __\   \ \  __<   \ \  __ \  \ \ \____  \/_/\ \/ \ \ \  \ \ \'/   \ \  __\   `);
    console.log(String.raw` \ \_\  \ \_\\"\_\    \ \_\  \ \_____\  \ \_\ \_\  \ \_\ \_\  \ \_____\    \ \_\  \ \_\  \ \__|    \ \_____\ `);
    console.log(String.raw`  \/_/   \/_/ \/_/     \/_/   \/_____/   \/_/ /_/   \/_/\/_/   \/_____/     \/_/   \/_/   \/_/      \/_____/ `);
    console.log(`\n`);
}

/**
 * Display the ASCII-art banner matching the current mode.
 * 
 * Unknown values are silently ignored, so script can call from any code path 
 * without first validating the mode.
 * 
 * @param mod One of `"interactive"`, `"batch"` and `"watcher"`.
 */
export function changeMod(mod: string):void {
    switch (mod) {
        case "interactive":
            interactiveMod();
            break;
        case "batch":
            batchMod();
            break;
        case "watcher":
            watcherMod();
            break;
        default:
            break;
    }
}