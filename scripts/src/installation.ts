/**
 * This file is use to installed all packages and languages for our software.
 */

import * as path from "path";
import { executeCommand } from "./commands";
import { DAG, LANGUAGES, ROOT } from "./project";
import { info, success, error, popIndent, pushIndent } from "./display";
import { installationOptions, InstallResult, LanguageConfig } from "./types";

/**
 * Run the standard npm pipeline in the given folder.
 *
 * Always runs `npm install` followed by `npm audit fix` (errors
 * ignored). Then, depending on `options`:
 *  - links the given local packages with `npm link <deps>`,
 *  - executes any custom steps in order,
 *  - runs `npm run build` (unless explicitly disabled),
 *  - exposes the current package globally with `npm link`.
 *
 * @param folder  Working directory in which the commands are run.
 * @param options Pipeline configuration:
 *  - `link`: names of local packages to link as dependencies of this folder.
 *  - `customSteps`: extra async steps to run after linking and before the build.
 *  - `build`: set to `false` to skip `npm run build` (default: `true`).
 *  - `linkSelf`: if `true`, run `npm link` at the end to expose this package globally.
 */
async function runNpmPipeline(folder: string, options: installationOptions = {}): Promise<void>{
    await executeCommand("npm i", folder);
    await executeCommand("npm audit fix" , folder, true);

    if (options.link && options.link.length > 0){
        await executeCommand(`npm link ${options.link.join(" ")}`, folder);
    }

    if (options.customSteps){
        for (const step of options.customSteps){
            await step();
        }
    }

    if (options.build !== false){
        await executeCommand("npm run build", folder);
    }

    if (options.linkSelf) {
        await executeCommand("npm link", folder);
    }
}

export async function installAllPackages(): Promise<InstallResult[]>{

    const results: InstallResult[] = [];
    for (const [name, info] of Object.entries(DAG)) {
        if (info.folder === "packages" && name !== "interpreter"){
            const  result = await installPackage(name, info.dependsOn);
            results.push(result);
        }
    }
    return results;
}

export async function installAllLanguages(): Promise<InstallResult[]>{

    const results: InstallResult[] = [];
    for (const name of Object.keys(LANGUAGES)) {
        const result = await installLanguage(name, LANGUAGES[name]);
        results.push(result);
    }
    return results;
}

/**
 * Install a single package located in `<ROOT>/packages/<name>`.
 *
 * Delegates to {@link runNpmPipeline} with the appropriate options:
 * the given local dependencies are linked, and every package except
 * "TCOS" is exposed globally with `npm link` so the others can
 * depend on it.
 *
 * @param name        Folder name of the package to install.
 * @param dependances Names of already-linked local packages this one
 *                    depends on.
 * @throws Rethrows any error from the pipeline after logging an
 *         installation-failed message.
 */
async function installPackage(name: string, dependances: string[]): Promise<InstallResult> {
    info(`${name} installation...`);
    pushIndent();
    const folder = path.join(ROOT, "packages", name);

    try {
        await runNpmPipeline(folder, {
            link: dependances,
            linkSelf: name !== "tcos"
        });
        popIndent();
        success(`${name} dependances was installed!`);
        return {name, type: "package", status: "success"};
    } catch (err) {
        popIndent();
        error(`${name} installation failed!`);
        console.error(err);
        return {name, type: "package", status: "error"};
    }
    finally{
        console.log("");
    }
}

/**
 * Install a single language located in `<ROOT>/examples/languages/<name>`.
 *
 * Delegates to {@link runNpmPipeline} with the language-specific
 * options: the given local dependencies are linked, then two custom
 * steps run before the build — `npm run langium:generate` to
 * regenerate the Langium artifacts, and the TCOS CLI to generate
 * the front-end compiler from the language's `.tcos` file.
 *
 * @param name Folder name of the language to install.
 * @param config Language configuration:
 *               - `dependances`: names of already-linked local packages this language depends on.
 *               - `tcosFile`: `.tcos` file passed to the TCOS CLI to generate the front-end compiler.
 * @throws Rethrows any error from the pipeline after logging an installation-failed message.
 */
async function installLanguage(name: string, config: LanguageConfig): Promise<InstallResult>{
    info(`${name} installation...`);
    pushIndent();
    const languagesFolder = path.join(ROOT, "examples", "languages");
    const folder = path.join(languagesFolder, name);

    try {
        await runNpmPipeline(folder, {
            link: config.npmLinks,
            customSteps: [
                () => executeCommand("npm run langium:generate", folder),
                () => executeCommand(
                    `node ../../packages/TCOS/bin/cli.js generate ${config.tcosFile} -d ${name}/`,
                    languagesFolder
                )
            ]
        });
        popIndent();
        success(`${name} dependances was installed!`);
        return {name, type: "language", status: "success"};
    } catch (err) {
        popIndent();
        error(`${name} installation failed!`);
        console.error(err);
        return {name, type: "language", status: "error"};
    }
    finally{
        console.log("");
    }
}