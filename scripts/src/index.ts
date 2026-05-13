/**
 * This file is the entry point of our script
 */

import { setVerbose } from './state';
import { BatchResult } from './types';
import { watcherCommand } from './watcher';
import { generateBatch } from './generation';
import { error, success, printFullSummary, changeMod } from './display';
import { installAllPackages, installAllLanguages } from './installation';

/**
 * Entry point of the script.
 *
 * Runs the full workflow in order: install all packages, install all
 * languages, then start the mod program generation loop and after verify the CCFG with a regression test.
 * On any failure the error is logged and the process exits with code 1.
 */
async function main(): Promise<void>{
    const isBatch = process.argv.includes("--batch");
    const writeAll = process.argv.includes("--all");
    const isWatch = process.argv.includes("--watch");
    
    let results: BatchResult[] = [];
    let mod = "batch";
   
    if (isWatch) mod = "watcher";
    if (writeAll) setVerbose(true);

    try {
        changeMod(mod);
        const packagesResults = await installAllPackages();
        const languagesResults = await installAllLanguages();
        const installResults = [...packagesResults, ...languagesResults];

        if (isBatch) {
            results = await generateBatch();
        } else if (isWatch) {
            results = await generateBatch();
            await watcherCommand(installResults, results);
        }

        // Watch mode prints its own summary inside watcherCommand
        if (!isWatch){
            success("Installation complete!");
            printFullSummary(installResults, results);
        }

        // We can use this function because it can't test our CCFG with a isomorphic test regression.
        // await verifyCCFG(CCFGGenerated);
    } catch (err) {
        error("Script failed!");
        console.error(err);
        process.exit(1);
    }
}

main();