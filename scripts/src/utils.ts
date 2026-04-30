import * as path from 'path';
import { DAG, LANGUAGES, ROOT } from "./config";

const dependents: Record<string, string[]> = {};

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
 * 
 * @param filePath 
 * @returns 
 */
export function findNode(filePath: string): {type: "dag-node", name:string} | {type: "program", file: string, language: string} | null {
    for (const nodeName of Object.keys(DAG)){
        const srcPath = getNodePath(nodeName);
        if (filePath.startsWith(srcPath)){
            return {type: "dag-node", name: nodeName};
        }
    }

    const programFolder = path.join(ROOT, "examples", "programs");
    if (filePath.startsWith(programFolder)){
        const fileName = path.basename(filePath);
        for (const [langName, config] of Object.entries(LANGUAGES)){
            if (fileName.endsWith(config.extension)){
                return {type: "program", file: fileName, language:langName};
            }
        }
    }
    return null;
}

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
 * @param startNode the node who that changed after modification.
 * @returns nodes who are reachables in the order of the DAG.
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