/**
 * Verification of generated CCFGs against their expected references.
 *
 * For each `.dot` file, the expected graph (under `examples/programs/expected/`) and the generated graph 
 * (under `examples/programs/generated/`) are loaded and compared node by node. 
 * Results are written to per-file log files under `LOGS_DIR`.
 *
 * @remarks
 * The isomorphism check via {@link isGraphIsomorphic} is currently
 * **not used**: the algorithm is too slow on our graphs and
 * crashes. Node analysis is therefore performed without any prior
 * structural check.
 *
 * @todo 
 * Find a solution to validate graph isomorphism (faster algorithm, custom implementation,
 * or approximate structural comparison) without crashing the script.
 */

import * as path from 'path';
import dotparser from 'dotparser'; 
import { LOGS_DIR } from './config';
import { success, info, error, warning, appendToLog} from './display';
import { Graph, isGraphIsomorphic, NodeId } from '@graphty/algorithms';
import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'fs';


/**
 * Verify a batch of generated CCFG DOT files against their expected
 * references.
 *
 * The log directory is created if missing. For each file name in
 * `CCFGGenerated`, the function:
 *   - loads the expected and generated graphs from `examples/programs/expected/` and `examples/programs/generated/`
 *   - tests structural isomorphism with {@link isGraphIsomorphic}
 *   - on a match, delegates node-attribute comparison to {@link analysisCCFG}
 *   - on a mismatch, logs that the structures differ and skips the node analysis.
 *
 * A run header is written to each per-file log before the result.
 *
 * @param generatedFiles File names (e.g. `"test1.dot"`) present in
 *                      both the expected and generated folders.
 */
export async function verifyCCFG(generatedFiles: Array<string>):Promise<void>{

    const CCFGExpectedPath = path.join("..", "examples", "programs", "expected");
    const CCFGGeneratedPath = path.join("..", "examples", "programs", "generated");

    if (!existsSync(LOGS_DIR)) {
        mkdirSync(LOGS_DIR, {recursive: true});
    }

    for (const generated of generatedFiles) {
        const dotReferenced = path.join(CCFGExpectedPath, generated);
        const dotGenerated = path.join(CCFGGeneratedPath, generated);

        const graphReferenced = loadAsGraph(dotReferenced);
        const graphGenerated = loadAsGraph(dotGenerated);

        const result = isGraphIsomorphic(graphReferenced, graphGenerated);

        const logPath = getLogPath(generated);
        writeRunHeader(logPath, generated);

        if (result.isIsomorphic &&  result.mapping) {
            info(`CCFG node analysis: ${generated}`);
            appendToLog(logPath, "Structure: Isomorphic");
            analysisCCFG(graphReferenced, graphGenerated, result.mapping, logPath);
        } else {
            warning(`CCFG not isomorphic: ${generated}`);
            appendToLog(logPath, "Structure: NOT isomorphic");
            appendToLog(logPath, "Node analysis (graphs have different structure).");
        }
    }
}

/**
 * Compare node attributes between two isomorphic graphs and log the result.
 * 
 * Iterates over every node of the reference graph, looks up its
 * counterpart in the generated graph using `mapping`, and compares
 * their `data` attributes via JSON equality. Every comparison
 * (match or mismatch) is appended to the log file, followed by a
 * summary of the number of nodes analyzed and differences found.
 * 
 * @param graphReferenced The expected graph (refernce).
 * @param graphGenerated The generated graph to validate.
 * @param mapping Node-id mapping from the reference graph to 
 *                the generated graph, as return by {@link isGraphIsomorphic}
 * @param logPath Path to the log file append result to.
 */
function analysisCCFG(graphReferenced: Graph, graphGenerated: Graph, mapping: Map<NodeId, NodeId>, logPath: string): void{
    let differencesFound = 0;
    let nodesAnalyzed = 0;
    const details: string[] = [];

    for (const refNode of graphReferenced.nodes()) {
        nodesAnalyzed++;
        const refId = refNode.id;
        const genId = mapping.get(refId);
        if (genId === undefined) continue;

        const genNode = graphGenerated.getNode(genId);
        if (!genNode) continue;

        const refAttrs = refNode.data;
        const genAttrs = genNode.data;

        if (JSON.stringify(refAttrs) !== JSON.stringify(genAttrs)) {
            error(`Node different: ref ${refId} <-> gen ${genId}`);
            differencesFound++;
            details.push(`  [DIFF] ref ${refId} <-> gen ${genId}:`);
            details.push(`      - expected:  ${JSON.stringify(refAttrs)}`);
            details.push(`      - generated: ${JSON.stringify(genAttrs)}`);
        } else {
            details.push(`  [OK] ref ${refId} <-> gen ${genId}: ${JSON.stringify(refAttrs)}`);
        }
    }

    appendToLog(logPath, `Nodes analysis:`);
    appendToLog(logPath, `  - ${nodesAnalyzed} node(s) analyzed`);
    appendToLog(logPath, `  - ${differencesFound === 0 ? "No difference" : `${differencesFound} difference(s)`}`);
    appendToLog(logPath, `  Details:`);
    for (const line of details) {
        appendToLog(logPath, line);
    }

    if (differencesFound === 0) {
        success("No node difference between the reference and the generated.");
    } else {
        warning(`${differencesFound} node(s) differ.`);
    }
}

/**
 * Load a DOT file and build an in-memory directed {@link Graph}.
 * 
 * The file is read, sanitized with {@link sanitizeDot} to handle multi-line quoted strings, and parsed via `dotparser`.
 * Node statements add node with its attributes.
 * For edge statements of the form `A -> B -> C -> ...`, an edge is created between each consecutive pair of nodes 
 * (`A→B`, then `B→C`, etc.). Any endpoint not yet in the graph is added on the fly.
 * 
 * @param dotPath path to the `.dot` file.
 * @returns A directed populated from the DOT file.
 */
function loadAsGraph(dotPath: string): Graph {
    const content = sanitizeDot(readFileSync(dotPath, 'utf-8'));
    const ast = dotparser(content);
    const graph = new Graph({ directed: true });

    for (const stmt of ast[0].children) {
        if (stmt.type === 'node_stmt') {
            const id = stmt.node_id.id;
            const attrs: Record<string, string> = {};
            for (const attr of stmt.attr_list) {
                const value = `${attr.eq}`;
                attrs[attr.id] = attr.id === "label" ? normalizeLabel(value) : value;
            }
            graph.addNode(id, attrs);
        } else if (stmt.type === 'edge_stmt') {
            for (let i = 0; i < stmt.edge_list.length - 1; i++) {
                const source = stmt.edge_list[i].id;
                const target = stmt.edge_list[i + 1].id;
                if (source === undefined || target === undefined) continue;

                if (!graph.hasNode(source)) graph.addNode(source);
                if (!graph.hasNode(target)) graph.addNode(target);
                graph.addEdge(source, target);
            }
        }
    }
    return graph;
}

function getLogPath(generated: string): string{
    const baseName = generated.replace(/\.dot$/, "");
    return path.join(LOGS_DIR, `${baseName}.log`);
}

function sanitizeDot(content: string): string {
    let result = '';
    let inQuotes = false;
    let escaped = false;
    for (const c of content) {
        if (escaped) {
            result += c;
            escaped = false;
            continue;
        }
        if (c === '\\') {
            result += c;
            escaped = true;
            continue;
        }
        if (c === '"') {
            inQuotes = !inQuotes;
            result += c;
            continue;
        }
        if (inQuotes && c === '\n') {
            result += '\\n';
            continue;
        }
        if (inQuotes && c === '\r') {
            result += '\\r';
            continue;
        }
        result += c;
    }
    return result;
}

function normalizeLabel(label: string): string {
    return label.replace(/^\d+/, "N");
}

function writeRunHeader(logPath: string, dotFileName: string): void{
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    const header = [
        "",
        "========================================",
        `Run: ${timestamp}`,
        "========================================",
        `File: ${dotFileName}`
    ].join("\n");
    appendFileSync(logPath, header + "\n");
}