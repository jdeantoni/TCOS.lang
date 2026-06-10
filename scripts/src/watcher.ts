/**
 * File watcher that triggers cascading rebuilds.
 *
 * Watches every package and language source folder plus the `examples/programs/` directory. When a relevant file changes,
 * any in-flight build is aborted and a new rebuild cascade is started, scoped to the changed node and its downstream
 * dependents (or to a single program file if the change is in `examples/programs/`).
 */

import * as path from 'path';
import * as chokidar from 'chokidar';
import { executeCommand } from './commands';
import { DAG, LANGUAGES, ROOT } from './project';
import { BatchResult, InstallResult } from './types';
import { regenerateOneProgram, regeneratePrograms } from './generation';
import { success, warning, error, info, printFullSummary, startWatcher } from './display';
import { buildDependants, checkAbort, computeCascade, findNode, getNodePath } from './utils';

let currentBuildController: AbortController | null = null;

/**
 * Start the file watcher and react to source changes.
 *
 * Prints the initial install + batch summary, then sets up `chokidar` on every DAG node folder and the programs folder.
 * Files in `node_modules`, `out`, `dist`, `generated/` are ignored, as is anything that isn't a `.ts`, `.langium`, or a
 * known language source extension.
 *
 * On every change: any ongoing build is aborted, the changed file is matched to either a DAG node (cascade rebuild) or a
 * program file (single regeneration), and the corresponding action is executed under a fresh {@link AbortController}.
 *
 * @param installResults Initial install results to display in the startup summary.
 * @param batchResults Initial batch results to display in the startup summary.
 */
export function watcherCommand(installResults: InstallResult[], batchResults: BatchResult[]): void{
    buildDependants();
    printFullSummary(installResults, batchResults);
    startWatcher();

    const watcherPaths = [...Object.keys(DAG).map(getNodePath), path.join(ROOT, "examples", "programs"), path.join(ROOT, "examples", "languages")];
    const watcher = chokidar.watch(watcherPaths, {
        ignoreInitial: true,
        ignored: (filePath, stats) => {
            const banFolder = ["node_modules", "out", "dist", "generated"];
            for (const name of banFolder){
                if (filePath.includes(name)) return true;
            }
            if (stats?.isFile() && 
                !(
                    filePath.endsWith(".ts") 
                    || Object.values(LANGUAGES).some(config => filePath.endsWith(config.extension)) 
                    || filePath.endsWith(".langium")
                    || filePath.endsWith(".tcos")
                    || filePath.endsWith(".sos")
                )
            ) return true;

            return false;
        },
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 200,   // ms inactivity time before notification
            pollInterval: 50           // verification frequencies
        }
    });

    watcher.on("change", async (filePath) => {
        
        // Rebuild canceled 
        if (currentBuildController){
            currentBuildController.abort();
            warning("Build in progress canceled due to new change.");
        }
        
        const controller = new AbortController;
        currentBuildController = controller;

        const detected = findNode(filePath);
        if (detected === null) {
            warning(`Modification ignored: ${filePath}`);
            return;
        }
        
        try {
            const relativePath = path.relative(ROOT, filePath);
            if (detected.type === "node") {
                console.log(`detective.name: ${detected.name}`);
                await rebuildAll(detected.name, relativePath, controller.signal);
            } else if (detected.type === "program") {
                await regenerateOneProgram(detected.file, detected.language, controller.signal);
            }
        } catch (error) {
            if ((error as Error).name === "AbortError"){
                info("Build aborted.");
            } else {
                throw error;
            }
        } finally {
            if (currentBuildController === controller){
                currentBuildController = null;
            }
        }
    })
}

/**
 * Rebuild a DAG node and every node that transitively depends on it, then regenerate every program of the
 * languages in the cascade.
 *
 * The cascade order is computed by {@link computeCascade}.
 * On any rebuild failure, the cascade is interrupted at that node, the partial results are summarized and the function
 * returns without throwing. An {@link AbortError} from `signal` propagates up so the watcher can replace the build 
 * with a fresh one.
 *
 * @param nodeName Name of the changed DAG node (entry point of the cascade).
 * @param relativePath Path of the changed file, relative to `ROOT`, used only for logging.
 * @param signal Abort signal cancelled when a newer change supersedes this build.
 */
async function rebuildAll(nodeName: string, relativePath: string, signal: AbortSignal): Promise<void> {
    info(`[${nodeName}] Modified: ${relativePath}`);

    if (!DAG[nodeName]) {
        warning(`[${nodeName}] Cascade not defined (ignore)`);
        return;
    }

    const cascade = computeCascade(nodeName);
    const rebuildResults: InstallResult[] = [];
    const programResults: BatchResult[] = [];

    for (const node of cascade) {
        checkAbort(signal);
        try {
            rebuildResults.push(await rebuildNode(node, signal));
        } catch (err) {
            error(`[${node}] Rebuild failed: ${(err as Error).message}`);
            rebuildResults.push({
                name: node,
                type: DAG[node].folder === "packages" ? "package" : "language",
                status: "error"
            });
            error(`Interrupted cascade at ${node}`);
        }
    }

    const languagesInCascade = cascade.filter(n => DAG[n].folder === "examples/languages");
    for (const language of languagesInCascade) {
        checkAbort(signal);
        const results = await regeneratePrograms(language, signal);
        programResults.push(...results);
    }

    success(`Cascade completed (${cascade.length} nodes rebuilt)`);
    printFullSummary(rebuildResults, programResults);
}

/**
 * Rebuild a single DAG node (package or language).
 * 
 * For packages, runs `npm run build`.
 * For languages, we run `npm run langium:generate`, regenerates the front-end compiler via
 * the TCOS CLI, then `npm run build`.
 * The signal is checked between every step so the build can be aborted promptly.
 *  
 * @param node Name of the DAG node to rebuild.
 * @param signal Abort signal to interrupt the rebuild.
 * @returns Status of the rebuild (`"success"` if no command threw).
 */
async function rebuildNode(node: string, signal: AbortSignal): Promise<InstallResult> {
    const nodeInfo = DAG[node];
    const folder = getNodePath(node);
    const type = nodeInfo.folder === "packages" ? "package" : "language";

    info(`[${node}] Rebuild in progress...`);

    if (type === "package") {
        await executeCommand("npm run build", folder, false, signal);
        checkAbort(signal);
    } else {
        const langConfig = LANGUAGES[node];
        if (!langConfig) throw new Error(`No config for language ${node}`);

        await executeCommand("npm run langium:generate", folder, false, signal);
        checkAbort(signal);
        await executeCommand(
            `node ../../packages/TCOS/bin/cli.js generate ${langConfig.tcosFile} -d ${node}/`,
            path.join(ROOT, "examples", "languages"), 
            false, 
            signal
        );
        checkAbort(signal);
        await executeCommand("npm run build", folder, false, signal);
    }

    success(`[${node}] Rebuild completed!`);
    return { name: node, type, status: "success" };
}