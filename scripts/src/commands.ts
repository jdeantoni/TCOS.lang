/**
 * Helpers to execute shell commands as child processes and report
 * their result through the display module.
 */

import { spawn } from 'child_process';
import { info, success, error, warning } from './display';

/**
 * Run a shell command in the given folder as a child process.
 *
 * Output is inherited so colors from the child process are preserved.
 * On success the promise resolves. On a non-zero exit code the promise
 * is rejected, unless `ignoreError` is true, in which case a warning
 * is printed and the promise still resolves.
 *
 * @param command Shell command to execute (e.g. "npm i").
 * @param folder Working directory in which the command is run.
 * @param ignoreError If true, a non-zero exit code is logged as a warning instead of rejecting the promise.
 * @returns A promise that resolves once the command finishes.
 */
export function executeCommand(command: string, folder: string, ignoreError: boolean = false): Promise<void> {
    
    info(`Execution: ${command}`);
    info(`In: ${folder}`);

    return new Promise((resolve, reject) => {

        const processus = spawn(command, [], {
            cwd: folder,
            stdio: 'inherit',   // connect to terminal to preserve colors from the child process
            shell: true
        });

        processus.on('close', (code: number) => {
            
            if (code === 0) {
                success("Order completed!");
                resolve();
            } else if (ignoreError){
                warning(`Order completed with this code ${code} (ignored)`);
                if (command === "npm audit fix"){
                    info("If you want to fix this warning use: npm audit fix --force");
                    warning("This command can including breaking changes");
                }
                resolve();
            } else {
                error("The command failed!");
                error(`Command: ${command}`);
                error(`Folder: ${folder}`);
                error(`Code: ${code}`);
                reject(new Error("Command failed: " + command));
            }
        });

        // if the order can't start
        processus.on('error', (err: Error) => {
            error("Impossible to start this command!");
            error(`Command: ${command}`);
            error(`Reason: ${err.message}`);
            reject(err);
        });
    });
}
