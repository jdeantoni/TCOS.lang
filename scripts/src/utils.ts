/**
 * Cross-cutting helpers for the watcher: DAG traversal (dependents map, cascade computation),
 * file-to-node matching, abort-signal checking, and dispatch to the right mode banner.
 */

import * as path from "path";
import { DAG, LANGUAGES, ROOT } from "./project";
import { FoundNode } from "./types";

const dependents: Record<string, string[]> = {};

/**
 * Build  the reverse map of the DAG: for each node, the list of nodes that directly depend on it.
 * 
 * Must be called once before {@link computeCascade}.
 * Mutates the module-level `dependents` map: callers don't need to inspect the return value.
 */
export function buildDependants(): void{
    for (const name  of Object.keys(DAG)){
        dependents[name] = [];
    }
    for (const [name, info] of Object.entries(DAG)){
        for (const parent of info.dependsOn){
            dependents[parent].push(name);
        }
    }
}

/**
 * Identify what a changed file path corresponds to, so the watcher
 * knows what to rebuild.
 *
 * Two cases are recognized:
 * - `"node"`: change affecting a DAG node. Either a file inside
 *      a node's source folder, or a TCOS spec file at the root of
 *      `examples/languages/` declared by some entry of
 *      {@link LANGUAGES}.
 * - `"program"`: program source file under `examples/programs/`
 *      matching a known language extension.
 *
 * @param filePath Absolute path of the changed file.
 * @returns A discriminated record describing the change, or
 *          `null` if the path isn't tracked.
 */
export function findNode(filePath: string): FoundNode | null {
    for (const nodeName of Object.keys(DAG)) {
        if (filePath.startsWith(getNodePath(nodeName))) {
            return { type: "node", name: nodeName };
        }
    }

    const fileName = path.basename(filePath);

    const languagesFolder = path.join(ROOT, "examples", "languages") + path.sep;
    if (filePath.startsWith(languagesFolder)) {
        for (const [langName, config] of Object.entries(LANGUAGES)) {
            if (fileName === config.tcosFile) {
                return { type: "node", name: langName };
            }
        }
    }

    const programsFolder = path.join(ROOT, "examples", "programs") + path.sep;
    if (filePath.startsWith(programsFolder)) {
        for (const [langName, config] of Object.entries(LANGUAGES)) {
            if (fileName.endsWith(config.extension)) {
                return { type: "program", file: fileName, language: langName };
            }
        }
    }
    return null;
}

/**
 * Resolve the absolute source folder of a DAG node.
 * 
 * HAndles the special case of `ccfg` and `tcos`,whose folder names are upper-cased on disk 
 * (`CCFG`, `TCOS`) even though the DAG keys are lower-case.
 * 
 * @param nodeName Key of the node in {@link DAG}.
 * @returns Absolute path to the node's source folder.
 */
export function getNodePath(nodeName: string): string{
    const node = DAG[nodeName];
    if (!node) throw new Error(`Unknown node: ${nodeName}`);
    
    let folderName = nodeName;
    if (nodeName === "ccfg" || nodeName === "tcos") {
        folderName = nodeName.toUpperCase();
    }
    
    return path.join(ROOT, node.folder, folderName);
}

/**
 * This function is a fake topological sorting. We use Depth-Fisrt Search algorithm (DFS) 
 * because our Directed Acyclic Graph (DAG) is very small (6 nodes) and our DAG is a static
 * variable.
 * With our DAG, we know X is depende of Y and the question after that is:
 * Who depent directly of X?
 * So, we search all nodes reachable.
 * 
 * @param startNode The node who that changed after modification.
 * @returns Nodes who are reachables in the order of the DAG.
 */
export function computeCascade(startNode: string): string[] {
    const reachable = new Set<string>();
    function explore(node: string) {
        if (reachable.has(node)) return;
        reachable.add(node);
        for (const child of dependents[node]) explore(child);
    }
    explore(startNode);
    
    return Object.keys(DAG).filter(name => reachable.has(name));
}

/**
 * Throw an {@link Error} named `"AbortError"` if the signal is already aborted. 
 * Use between long-running steps so a build can stop promptly when a newer change supersedes it.
 * 
 * @param signal Abort signal to inspect.
 */
export function checkAbort(signal: AbortSignal): void{
    if (signal.aborted){
        const err = new Error("Build aborted");
        err.name = "AbortError";
        throw err;
    }
}