import * as path from 'path';
import { info, succes, error, askForVSCode } from './display';
import { executeCommand } from './commands';

const ROOT = path.resolve(__dirname, '../..')

export async function installAllPackages(): Promise<void>{
    const packages: { [key: string]: string[] } = {
        "CCFG": [],
        "backend-compiler": ["ccfg"],
        "TCOS": ["ccfg", "backend-compiler"],
    };

    for (const name of Object.keys(packages)) {
        const dependances = packages[name];
        await installPackage(name, dependances);

        await askForVSCode(name, "packages");
    }
    succes("All packages installed!");
}

/**
 * 
 * @param name 
 * @param dependances 
 * @returns 
 */
async function installPackage(name: string, dependances: string[]): Promise<void> {
    
    info(name + " installation...");
    const folder = path.join(ROOT, "packages", name);

    try {
        await executeCommand("npm i", folder);
        await executeCommand("npm audit fix" , folder, true);

        if (dependances.length > 0) {
            const deps = dependances.join(" ");
            await executeCommand("npm link " + deps, folder);
        }
        await executeCommand("npm run build", folder);

        if (name !== "TCOS") {
            await executeCommand("npm link", folder);
        }

        succes(name + " installed!");
    } catch (err) {
        error(name + " installation failed!");
        throw err;
    }
}

export async function installAllLanguages(): Promise<void>{
    const languages: { [key: string]: { dependances: string[], tcosFile: string } } = {
        "ParLang": { 
            dependances: ["ccfg", "backend-compiler"],
            tcosFile: "parLang.tcos"
        },
        "simpleL": {
            dependances: ["ccfg", "backend-compiler"],
            tcosFile: "simpleL.tcos"
        }
    };

    for (const name of Object.keys(languages)) {
        const config = languages[name];
        await installLanguage(name, config.dependances, config.tcosFile);
        await askForVSCode(name, "examples/languages");
    }
    succes("All languages installed!");
}

async function installLanguage(name: string, dependances: string[], tcosFile: string): Promise<void>{
    info(name + " installation...");

    const folder = path.join(ROOT, "examples", "languages", name);
    const languagesFolder = path.join(ROOT, "examples", "languages");

    try {
        await executeCommand("npm i", folder);
        await executeCommand("npm audit fix", folder, true);
        await executeCommand("npm run langium:generate", folder);
        if (dependances.length > 0) {
            const deps = dependances.join(" ");
            await executeCommand("npm link " + deps, folder);
        }

        // Générer le front-end compiler
        await executeCommand(
            "node ../../packages/TCOS/bin/cli.js generate " + tcosFile + " -d " + name + "/",
            languagesFolder
        );

        await executeCommand("npm run build", folder);

        succes(name + " installed!");
    } catch (err) {
        error(name + " installation failed!");
        throw err;
    }
}