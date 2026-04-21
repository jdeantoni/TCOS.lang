/**
 * This file contains functions to describe a messages in the terminal
 */

import * as path from 'path';
import * as readline from 'readline';
import { executeCommand } from './commands';

const ROOT = path.resolve(__dirname, '../..')

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m';


export function info(message: string): void{
    console.log(CYAN + "[INFO] " + message + RESET);
}

export function success(message: string): void{
    console.log(GREEN + "[SUCCES] " + message + RESET);
}

export function error(message: string): void{
    console.log(RED + "[ERROR] " + message + RESET);
}

export function warning(message: string): void{
    console.log(YELLOW + "[WARNING] "+ message + RESET);
}

/**
 * This function ask 
 * @param question 
 * @returns 
 */
export function askYesNo(question: string): Promise<boolean>{
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question + " (y/n): ", (answer: string) => {
            rl.close();
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
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer: string) => {
            rl.close();
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
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(message, () => {
            rl.close();
            resolve();
        });
    });
}

/**
 * 
 * 
 * @param name 
 * @param basePath 
 */
export async function askForVSCode(name: string, basePath: string): Promise<void>{
    const openVSCode = await askYesNo("Do you want to open VS Code on " + name + "?");
    
    if (openVSCode) {
        const folder = path.join(ROOT, basePath, name);
        await executeCommand("code .", folder);
        success("VS Code opened on " + name + "!");
        
        const wantModify = await askYesNo("Do you want to make modifications on " + name + "?");
        
        if (wantModify) {
            info("You can now:");
            info("  1. Modify files in VS Code");
            
            if (name === "TCOS") {
                info("  2. Press F5 to open Extension Development Host");
                info("  3. Test and debug your changes");
            }
            
            await breakScript("Press Enter when you are done...");
            
            success("Modifications on " + name + " done!");
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
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log(question);
        options.forEach((option, index) => {
            console.log("  " + (index + 1) + ". " + option);
        });
        
        rl.question("Your choice (1-" + options.length + "): ", (answer: string) => {
            rl.close();
            const index = parseInt(answer) - 1;
            if (index >= 0 && index < options.length) {
                resolve(options[index]);
            } else {
                resolve(options[0]); // Default to first option
            }
        });
    });
}