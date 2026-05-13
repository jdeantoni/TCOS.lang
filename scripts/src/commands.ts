/**
 * Helpers to execute shell commands as child processes and report
 * their result through the display module.
 */

import { isVerbose } from './state';
import * as readline from 'readline';
import { spawn } from 'child_process';
import { info, success, error, warning, pushIndent, popIndent, writeIndentedLine } from './display';

/**
 * Run a shell command in the given folder as a child process.
 *
 * Output is inherited so colors from the child process are preserved.
 * On success the promise resolves. On a non-zero exit code the promise is rejected,
 * unless `ignoreError` is true, in which case a warning is printed and the promise still resolves.
 *
 * @param command Shell command to execute (e.g. "npm i").
 * @param folder Working directory in which the command is run.
 * @param ignoreError If true, a non-zero exit code is logged as a warning instead of rejecting the promise.
 * @param signal Allows you to signal that the command execution has stopped and kill the process.
 * @returns A promise that resolves once the command finishes.
 */
export function executeCommand(command: string, folder: string, ignoreError: boolean = false, signal?: AbortSignal): Promise<void> {
    
    return new Promise((resolve, reject) => {
        
        if (signal?.aborted) {
            const err = new Error("Build aborted");
            err.name = "AbortError";
            reject(err);
            return;
        }
        
        info(`Execution: ${command}`);
        pushIndent();
        info(`In: ${folder}`);
        pushIndent();

        let cleaned = false;
        const cleanup = () => {
            if (cleaned) return;
            cleaned = true;
            popIndent();
            popIndent();
            
        };

        const processus = spawn(command, [], {
            cwd: folder,
            stdio: isVerbose() ? ['inherit', 'pipe', 'pipe'] : 'ignore',
            shell: true
        });

        const dispatch = (line: string) => writeIndentedLine(line);
        if (processus.stdout) {
            readline.createInterface({ input: processus.stdout }).on('line', dispatch);
        }
        if (processus.stderr) {
            readline.createInterface({ input: processus.stderr }).on('line', dispatch);
        }

        const onAbort = () => processus.kill('SIGTERM');
        signal?.addEventListener('abort', onAbort, {once: true});

        processus.on('close', (code: number) => {
            signal?.removeEventListener('abort', onAbort);

            if (signal?.aborted){
                cleanup();
                const err = new Error("Build aborted");
                err.name = "AbortError";
                reject(err);
                return;
            }

            cleanup();

            if (code === 0) {
                success("Command completed!");
                process.stdout.write('\n');
                resolve();
            } else if (ignoreError){
                warning(`Order completed with this code ${code} (ignored)`);
                if (command === "npm audit fix"){
                    warning("If you want to fix this warning use: npm audit fix --force");
                    warning("This command can including breaking changes");
                }
                process.stdout.write('\n');
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
        processus.on('error', (err: NodeJS.ErrnoException) => {
            signal?.removeEventListener('abort', onAbort);
            cleanup();

            if (err.code === 'ENOENT') {
                error("Impossible to start this command!");
                error(`Command: ${command}`);
                error(`Folder: ${folder}`);
                error(`Reason: The folder does not exist or is not accessible.`);
            } else {
                error("Impossible to start this command!");
                error(`Command: ${command}`);
                error(`Reason: ${err.message}`);
            }
            reject(err);
        });
    });
}
