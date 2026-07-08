import path from "path";
import fs from "fs";
import { CompositeGeneratorNode, NL, toString } from "langium/generate";

import type { SoSSpec, Grammar } from "../../language-server/generated/ast.js";
import { extractDestinationAndName } from "../cli-util.js";

export function generateDebugFacadeFromSoS(
    model: SoSSpec,
    grammars: Grammar[],
    filePath: string,
    destination: string | undefined
): string {

    const data = extractDestinationAndName(filePath, destination);

    const generatedFilePath = path.join(
        data.destination,
        `${data.name}DapFacade.ts`
    );

    const file = new CompositeGeneratorNode();

    appendDapFacade(
        model,
        file,
        data.name
    );

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }

    fs.writeFileSync(
        generatedFilePath,
        toString(file)
    );

    return generatedFilePath;
}

function appendDapFacade(
    model: SoSSpec,
    file: CompositeGeneratorNode,
    compilerName: string
): void {

const languageName = model.name;
const languageNameCapitalized =
    languageName.charAt(0).toUpperCase()
    + languageName.slice(1);

file.append(`
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { NodeFileSystem } from "langium/node";
import type { CCFG } from "ccfg";

export async function buildCCFG(sourceFile: string): Promise<CCFG> {

    const scriptDir = path.dirname(fileURLToPath(import.meta.url));

    const packageJson = JSON.parse(fs.readFileSync(path.resolve(scriptDir, "../../../package.json"), "utf8"));
    const langiumConfig = JSON.parse(fs.readFileSync(path.resolve(scriptDir, "../../../langium-config.json"), "utf8"));
    const projectName = langiumConfig.projectName;

    const languageId = packageJson.contributes.languages[0].id;

    const { [\`create\${projectName}Services\`]: createServices } = await import(
        pathToFileURL(path.resolve(scriptDir, \`../../language/\${languageId}-module.js\`)).href
    );

    const {${languageNameCapitalized}CompilerFrontEnd} = await import(pathToFileURL(path.resolve(scriptDir,"./${compilerName}CompilerFrontEnd.js")).href);

    const { extractAstNode } = await import(
        pathToFileURL(path.resolve(scriptDir, "../../cli/cli-util.js")).href
    );

    const services = createServices(NodeFileSystem)[projectName];

    const ast = await extractAstNode(path.resolve(sourceFile), services);

    const compilerFrontEnd = new ${languageNameCapitalized}CompilerFrontEnd(false);

    const ccfg = compilerFrontEnd.generateCCFG(ast, false);

    ccfg.addSyncEdge();
    ccfg.detectCycles();
    ccfg.collectCycles();

    return ccfg;
}
`, NL);
}