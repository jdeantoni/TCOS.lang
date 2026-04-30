/**
 * This file contains functions to describe a messages in the terminal
 */

import * as path from 'path';
import { appendFileSync } from 'fs';
import * as readline from 'readline';
import { executeCommand } from './commands';
import { RED, CYAN, YELLOW, GREEN, RESET, ROOT, INTERACTIVE, BatchResult, InstallResult } from './config';

const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

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

/**
 * This function asks if the user wants to accept the request.
 * @param question 
 * @returns 
 */
export function askYesNo(question: string): Promise<boolean>{
    return new Promise((resolve) => {
        rl.question(`${question} (y/n): `, (answer: string) => {
            const ans = answer.toLowerCase();
            resolve(ans === 'y' || ans === 'yes');
        });
    });
}

/**
 * Ask for a text input
 * @param question 
 * @returns 
 */
export function askText(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer: string) => {
            resolve(answer);
        });
    });
}

/**
 * Function to make a break 
 * @param message 
 * @returns 
 */
export function breakScript(message: string): Promise<void>{
    return new Promise((resolve) => {
        rl.question(message, () => {
            resolve();
        });
    });
}

/**
 * Interactively ask the user whether to open VS Code on a given
 * project, and optionally let them make modifications before
 * resuming the script.
 *
 * If the user accepts, VS Code is launched in
 * `<ROOT>/<basePath>/<name>`. A second prompt asks whether the user
 * wants to edit files; if so, the script pauses until Enter is
 * pressed. For the "TCOS" project, extra hints about the Extension
 * Development Host (F5) are displayed.
 *
 * @param name     Name of the project/subfolder to open.
 * @param basePath Path, relative to the repository root, that
 *                 contains the project folder.
 */
export async function askForVSCode(name: string, basePath: string): Promise<void>{
    if (!INTERACTIVE) return;
    const openVSCode = await askYesNo(`Do you want to open VS Code on ${name}?`);
    
    if (openVSCode) {
        const folder = path.join(ROOT, basePath, name);
        await executeCommand("code .", folder);
        success(`VS Code opened on ${name}!`);
        
        const wantModify = await askYesNo(`Do you want to make modifications on ${name}?`);
        
        if (wantModify) {
            info("You can now:");
            info("  1. Modify files in VS Code");
            
            if (name === "TCOS") {
                info("  2. Press F5 to open Extension Development Host");
                info("  3. Test and debug your changes");
            }
            
            await breakScript("Press Enter when you are done...");
            
            success(`Modifications on ${name} done!`);
        }
    }
}

/**
 * Ask user to choose from a list of options
 * @param question 
 * @param options 
 * @returns 
 */
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

/**
 * Print a summary of batch results: per-program status and totals.
 * Never calls process.exit, purely informative.
 */
export function printFullSummary(installResults: InstallResult[], batchResults: BatchResult[]): boolean {
    console.log("");
    info("=".repeat(60));
    info("SUMMARY");
    info("=".repeat(60));

    // Section installation
    const packagesResults = installResults.filter(r => r.type === "package");
    const languagesResults = installResults.filter(r => r.type === "language");

    console.log("");
    info(">> Packages installation");
    for (const r of packagesResults) {
        if (r.status === "success") success(`   ${r.name}`);
        else error(`   ${r.name}`);
    }

    console.log("");
    info(">> Languages installation");
    for (const r of languagesResults) {
        if (r.status === "success") success(`   ${r.name}`);
        else error(`   ${r.name}`);
    }

    // Section génération
    console.log("");
    info(">> Programs generation");
    for (const r of batchResults) {
        const line = `${r.language}/${r.fileName} (${r.format})`;
        if (r.status === "success") {
            success(`   ${line}`);
        } else {
            error(`  ${line}`);
        }
    }

    // Section commandes à reproduire (si échecs)
    const failed = batchResults.filter(r => r.status === "error" && r.failedCommand);
    if (failed.length > 0) {
        info("");
        info(">> Failed commands (run manually to investigate)");
        for (const r of failed) {
            error(`  ${r.language}/${r.fileName} (${r.format}):`);
            error(`    ${r.failedCommand}`);
        }
    }

    // Totaux
    const installOk = installResults.filter(r => r.status === "success").length;
    const installKo = installResults.length - installOk;
    const batchOk = batchResults.filter(r => r.status === "success").length;
    const batchKo = batchResults.length - batchOk;

    console.log("");
    info("=".repeat(60));
    info(`Install: ${installOk}/${installResults.length} succeeded, ${installKo} error(s)`);
    info(`Batch:   ${batchOk}/${batchResults.length} succeeded, ${batchKo} error(s)`);
    info("=".repeat(60));

    if (batchKo > 0 || installKo > 0) {
        return false;
    } else return true;
}

export function closeInput(): void{
    rl.close();
}

export function startWatcher():void {
    console.log("");
    info("=".repeat(60));
    info("Watcher started. Edit any source file to trigger a rebuild cascade.");
    info("Press Ctrl+C to stop.");
    info("=".repeat(60));
}

export function printSummary(batchResults: BatchResult[]): boolean {
    console.log("");
    info("=".repeat(60));
    info("SUMMARY");
    info("=".repeat(60));

    // Section génération
    console.log("");
    info(">> Programs generation");
    for (const r of batchResults) {
        const line = `${r.language}/${r.fileName} (${r.format})`;
        if (r.status === "success") {
            success(`   ${line}`);
        } else {
            error(`  ${line}`);
        }
    }

    // Section commandes à reproduire (si échecs)
    const failed = batchResults.filter(r => r.status === "error" && r.failedCommand);
    if (failed.length > 0) {
        info("");
        info(">> Failed commands (run manually to investigate)");
        for (const r of failed) {
            error(`  ${r.language}/${r.fileName} (${r.format}):`);
            error(`    ${r.failedCommand}`);
        }
    }

    const batchOk = batchResults.filter(r => r.status === "success").length;
    const batchKo = batchResults.length - batchOk;

    console.log("");
    info("=".repeat(60));
    info(`Batch:   ${batchOk}/${batchResults.length} succeeded, ${batchKo} error(s)`);
    info("=".repeat(60));

    if (batchKo > 0) {
        return false;
    } else return true;
}