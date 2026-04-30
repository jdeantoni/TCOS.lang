import * as path from 'path';
import { readdirSync } from 'fs';
import * as chokidar from 'chokidar';
import { executeCommand } from './commands';
import { buildGenerationCommand } from './generation';
import { buildDependants, computeCascade, findNode, getNodePath } from './utils';
import { success, warning, error, info, printFullSummary, startWatcher, printSummary } from './display';
import { ROOT, DAG, LANGUAGES, InstallResult, BatchResult, PROGRAMING_LANGUAGES } from './config';

export function watcherCommand(): void{
    buildDependants();
    startWatcher();

    const watcherPaths = [...Object.keys(DAG).map(getNodePath), path.join(ROOT, "examples", "programs")];
    const watcher = chokidar.watch(watcherPaths, {
        ignoreInitial: true,
        ignored: (filePath, stats) => {
            const banFolder = ["node_modules", "out", "dist", "generated"];
            for (const name of banFolder){
                if (filePath.includes(name)) return true;
            }
            if (stats?.isFile() && !(filePath.endsWith(".ts") 
                || Object.values(LANGUAGES).some(config => filePath.endsWith(config.extension)))) return true;

            return false;
        },
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 200,   // ms d'inactivité avant de notifier
            pollInterval: 50           // fréquence de vérification
        }
    });

    watcher.on("change", async (filePath) => {
        const detected = findNode(filePath);
    
        if (detected === null) {
            warning(`Modification ignored: ${filePath}`);
            return;
        }
        
        if (detected.type === "dag-node") {
            const relativePath = path.relative(ROOT, filePath);
            await rebuildAll(detected.name, relativePath);
        } else {
            // type === "program"
            await regenerateOneProgram(detected.file, detected.language);
        }
    })
}

/**
 * 
 * @param nodeName 
 * @param relativePath 
 * @returns 
 */
async function rebuildAll(nodeName: string, relativePath: string): Promise<void>{
    info(`[${nodeName}] Modified : ${relativePath}`);
    
    if (!DAG[nodeName]) {
        warning(`[${nodeName}] Cascade not defined (ignore)`);
        return;
    }

    const cascade = computeCascade(nodeName);

    const rebuildResults: InstallResult[] = [];
    const programResults: BatchResult[] = [];

    for (const node of cascade){
        info(`[${node}] Rebuild in progress...`);
        const childNode = DAG[node];
        const folder = getNodePath(node);

        try {
            if (childNode.folder === "packages"){
                await executeCommand("npm run build", folder);
            } else if (childNode.folder === "examples/languages") {
                const langConfig = LANGUAGES[node];
                if (!langConfig) throw new Error(`No config for language ${node}`);

                await executeCommand("npm run langium:generate", folder);
                await executeCommand(`node ../../packages/TCOS/bin/cli.js generate ${langConfig.tcosFile} -d ${node}/`,
                    path.join(ROOT, "examples", "languages"));
                await executeCommand("npm run build", folder);
            }

            success(`[${node}] Rebuild completed!`);
            rebuildResults.push({
                name: node,
                type: childNode.folder === "packages" ? "package" : "language",
                status: "success"
            });
        } catch (err) {
            error(`[${node}] Rebuild failed : ${(err as Error).message}`);
            rebuildResults.push({
                name: node,
                type: childNode.folder === "packages" ? "package" : "language",
                status: "error"
            });

            error(`Interrupted cascade at ${node}`);
            printFullSummary(rebuildResults, programResults);
            return;
        }
    }
    const languagesInCascade = cascade.filter(node => DAG[node].folder === "examples/languages");
    for (const language of languagesInCascade) {
        const results = await regeneratePrograms(language);
        programResults.push(...results);
    }
    
    success(`Cascade completed (${cascade.length} nodes rebuilt)`);
    printFullSummary(rebuildResults, programResults);
}

async function regeneratePrograms(language: string): Promise<BatchResult[]> {
    const results: BatchResult[] = [];
    const langConfig = LANGUAGES[language];
    if (!langConfig) return [];
    
    const programsFolder = path.join(ROOT, "examples", "programs");
    
    const files = readdirSync(programsFolder).filter(f => f.endsWith(langConfig.extension));
    
    info(`[${language}] Regenerating ${files.length} programs...`);
    
    for (const file of files) {
        const fileName = file.slice(0, -langConfig.extension.length);
        
        for (const format of PROGRAMING_LANGUAGES) {
            const command = buildGenerationCommand(language, file, format, true);
            
            try {
                await executeCommand(command, programsFolder);
                results.push({
                    language,
                    fileName,
                    format,
                    status: "success"
                });
            } catch (err) {
                warning(`[${language}] ${fileName} (${format}) regeneration failed`);
                results.push({
                    language,
                    fileName,
                    format,
                    status: "error",
                    failedCommand: command
                });
            }
        }
    }
    
    return results;
}

async function regenerateOneProgram(fileName: string, language: string): Promise<void>{
    const results: BatchResult[] = [];
    const langConfig = LANGUAGES[language];
    if (!langConfig) return;

    const programsFolder = path.join(ROOT, "examples", "programs");
    const files = readdirSync(programsFolder).filter(f => f.endsWith(langConfig.extension));
    
    for (const file of files){
        if (file.startsWith(fileName)){
            info(`[${language}] Regenerating program...`);

            for (const format of PROGRAMING_LANGUAGES){
                const command = buildGenerationCommand(language, file, format, true);

                try {
                    await executeCommand(command, programsFolder);
                    results.push({
                        language,
                        fileName,
                        format,
                        status: "success"
                    });
                    
                } catch (error) {
                    warning(`[${language}] ${fileName} (${format}) regeneration failed`);
                    results.push({
                        language,
                        fileName,
                        format,
                        status: "error",
                        failedCommand: command
                    });
                }
            }
        }
    }
    printSummary(results);
}