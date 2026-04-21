// This file contains functions to execute commands in the terminal

import { spawn } from 'child_process';
import { info, success, error, warning } from './display';

export function executeCommand(command: string, folder: string, ignoreError: boolean = false): Promise<void> {
    
    info("Execution: " + command);
    info("In: " + folder);

    return new Promise((resolve, reject) => {

        const parties = command.split(' ');
        const programme = parties[0];
        const arguments_ = parties.slice(1);

        const processus = spawn(programme, arguments_, {
            cwd: folder,
            stdio: 'inherit',   // connect to terminal to preserve colors from the child process
            shell: true
        });

        processus.on('close', (code: number) => {
            
            if (code === 0) {
                success("Order completed!");
                resolve();
            } else if (ignoreError){
                warning("Order completed with this code " + code + " (ignored)");
                if (command === "npm audit fix"){
                    info("If you want to fix this warning use: " + "npm audit fix --force");
                    warning("This command can including breaking changes");
                }
                resolve();
            } else {
                error("The command failed!");
                error("Command : " + command);
                error("folder  : " + folder);
                error("Code    : " + code);
                reject(new Error("Command failed: " + command));
            }
        });

        // if the order can't start
        processus.on('error', (err: Error) => {
            error("Impossible to start this command!");
            error("Command : " + command);
            error("Reason   : " + err.message);
            reject(err);
        });
    });
}
