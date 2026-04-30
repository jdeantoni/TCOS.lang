/**
 * This file is the entry point of our script
 */

import { watcherCommand } from './watch';
import { generatePrograms, generateBatch } from './generation';
import { BatchResult, setInteractive, setVerbose } from './config';
import { error, success, closeInput, printFullSummary } from './display';
import { installAllPackages, installAllLanguages } from './installation';

// TODO(isomorphism): Reintegrate verifyCCFG when the comparison strategy is finalized with the leader. See notes/isomorphism.md
// import { verifyCCFG } from './verification';

/**
 * Entry point of the script.
 *
 * Runs the full workflow in order: install all packages, install all
 * languages, then start the interactive program generation loop and after verify the CCFG with a test regression.
 * On any failure the error is logged and the process exits with code 1. The readline input is always closed at the end.
 */
async function main(): Promise<void>{
    const isBatch = process.argv.includes("--batch");
    const writeAll = process.argv.includes("--all");
    const isWatch = process.argv.includes("--watch");
    
    let results: BatchResult[] = [];
   
    if (isBatch || isWatch) setInteractive(false);
    if (writeAll) setVerbose(true);

    try {
        const packagesResults = await installAllPackages();
        const languagesResults = await installAllLanguages();
        const installResults = [...packagesResults, ...languagesResults];

        if (isBatch) {
            results = await generateBatch();
        } else if (isWatch) {
            await watcherCommand();
        } else {
            results = await generatePrograms();
        }

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
    } finally {
        closeInput();
    }
}

main();