#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { NodeFileSystem } from "langium/node";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const simpleLRoot = path.join(repoRoot, "examples/languages/simpleL");
const inputFile = path.resolve(process.argv[2] ?? path.join(repoRoot, "examples/programs/basictestplus.simple"));

const { createSimpleLServices } = await import(pathToFileURL(path.join(simpleLRoot, "out/language/simple-l-module.js")).href);
const { extractAstNode } = await import(pathToFileURL(path.join(simpleLRoot, "out/cli/cli-util.js")).href);
const { SimpleLCompilerFrontEnd } = await import(pathToFileURL(path.join(simpleLRoot, "out/cli/generated/simpleLCompilerFrontEnd.js")).href);
const { CCFGInterpreter } = await import(pathToFileURL(path.join(repoRoot, "packages/interpreterCCFG/out/InterpretCCFG.js")).href);

const services = createSimpleLServices(NodeFileSystem).SimpleL;
const model = await extractAstNode(inputFile, services);

const compilerFrontEnd = new SimpleLCompilerFrontEnd(false);
const ccfg = compilerFrontEnd.generateCCFG(model, false);
ccfg.addSyncEdge();
ccfg.detectCycles();
ccfg.collectCycles();
console.log(ccfg.toDot());

if (process.env.DUMP === "1") {
    console.log(JSON.stringify({
        nodes: ccfg.nodes.map(node => ({
            uid: node.uid,
            type: node.getType(),
            nodeType: node.type,
            functionsNames: node.functionsNames,
            out: node.outputEdges.map(edge => edge.to.uid),
            in: node.inputEdges.map(edge => edge.from.uid),
            instructions: node.functionsDefs.map(instruction => instruction.toString())
        })),
        edges: ccfg.edges.map(edge => ({
            from: edge.from.uid,
            to: edge.to.uid,
            guards: edge.guards.map(guard => guard.toString())
        })),
        syncEdges: ccfg.syncEdges.map(edge => ({
            from: edge.from.uid,
            to: edge.to.uid,
            guards: edge.guards.map(guard => guard.toString())
        }))
    }, null, 2));
}

const interpreter = new CCFGInterpreter(ccfg, { debug: false });
let result;
const startedAt = Date.now();
if (process.env.TRACE === "1") {
    for (let i = 0; i < 80; i++) {
        result = await interpreter.step();
        const snapshot = interpreter.getSnapshot();
        console.log(JSON.stringify({
            step: snapshot.stepCount,
            status: snapshot.status,
            reason: result.reason,
            currentNode: snapshot.currentNode,
            event: snapshot.lastEvent,
            globals: snapshot.globals,
            thread: snapshot.currentThread
        }));
        if (snapshot.status === "terminated" || snapshot.status === "error") {
            break;
        }
    }
} else {
    result = await interpreter.run({ maxSteps: 1000, timeoutMs: 5000 });
}

console.log(JSON.stringify({
    file: inputFile,
    nodes: ccfg.nodes.length,
    edges: ccfg.edges.length,
    elapsedMs: Date.now() - startedAt,
    result,
    snapshot: interpreter.getSnapshot()
}, null, 2));
