/**
 * This file is the entry point of our script
 */

import { error, success, closeInput } from './display';
import { installAllPackages, installAllLanguages } from './installation';
import { generatePrograms } from './generation';

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
   
    try {
        await installAllPackages();
        await installAllLanguages();

        success("Installation complete!");

        await generatePrograms();

        // We can use this function because it can't test our CCFG with a isomorphic test regression.
        // await verifyCCFG(CCFGGenerated);

        success("End");
    } catch (err) {
        error("Script failed!");
        console.error(err);
        process.exit(1);
    } finally {
        closeInput();
    }
}

// Start the script to intall and link our packages and install our languages.
main();