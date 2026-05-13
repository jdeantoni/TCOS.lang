/**
 * Terminal output: colored log helpers, readline-based prompts,
 * end-of-run summaries, and the ASCII-art banners used to mark
 * which mode (interactive, batch, watcher) is active.
 */

import { appendFileSync } from 'fs';
import { BatchResult, InstallResult } from './types';

// ============================================================
// Colors
// ============================================================

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
 
// ============================================================
// Indentation
// ============================================================
let indentLevel = 0;
const INDENT_UNIT = '    ';
 
export function getIndent(): string {
    return INDENT_UNIT.repeat(indentLevel);
}
 
export function pushIndent(): void {
    indentLevel++;
}
 
export function popIndent(): void {
    if (indentLevel > 0) indentLevel--;
}
 
export function writeIndentedLine(line: string): void {
    process.stdout.write(`${getIndent()}${line}\n`);
}
 
// ============================================================
// Logging
// ============================================================
 
export function info(message: string): void {
    process.stdout.write(`${getIndent()}${CYAN}[INFO] ${message}${RESET}\n`);
}
 
export function success(message: string): void {
    process.stdout.write(`${getIndent()}${GREEN}[SUCCESS] ${message}${RESET}\n`);
}
 
export function error(message: string): void {
    process.stdout.write(`${getIndent()}${RED}[ERROR] ${message}${RESET}\n`);
}
 
export function warning(message: string): void {
    process.stdout.write(`${getIndent()}${YELLOW}[WARNING] ${message}${RESET}\n`);
}
 
export function appendToLog(logPath: string, line: string): void {
    appendFileSync(logPath, `${line}\n`);
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
        console.log("");
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
    console.log("");
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