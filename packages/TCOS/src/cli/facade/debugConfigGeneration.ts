import path from "path";
import fs from "fs";
import { CompositeGeneratorNode, NL, toString } from "langium/generate";

import type { SoSSpec } from "../../language-server/generated/ast.js";
import { extractDestinationAndName } from "../cli-util.js";


export function generateDebugConfigFromSoS(
    model: SoSSpec,
    filePath: string,
    destination: string | undefined
): string {

    const data = extractDestinationAndName(filePath, destination);

    const generatedFilePath = path.join(
        data.destination,
        `${data.name}DebugConfigurationProvider.ts`
    );

    const file = new CompositeGeneratorNode();

    appendDebugConfigurationProvider(model, file, data.name);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }

    fs.writeFileSync(generatedFilePath, toString(file));

    return generatedFilePath;
}

function appendDebugConfigurationProvider(
    model: SoSSpec,
    file: CompositeGeneratorNode,
    compilerName: string
): void {

    file.append(`
import * as vscode from 'vscode';
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

export class ${model.name}DebugConfigurationProvider
implements vscode.DebugConfigurationProvider {

    constructor(private context: vscode.ExtensionContext) {}
    
    resolveDebugConfiguration(
        folder: vscode.WorkspaceFolder | undefined,
        config: vscode.DebugConfiguration
    ): vscode.ProviderResult<vscode.DebugConfiguration> {

        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showErrorMessage("No active editor.");
            return undefined;
        }
        const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf8"));
        const languageIdent = packageJson.contributes.languages[0].id;

        if (editor.document.languageId === languageIdent){
            config.type = "ccfg";
            config.request = "launch";

            config.name = config.name ?? "Debug ${model.name}";

            config.sourceFile = editor.document.fileName;
            config.debugServer = 4711;
            config.language = "${model.name}";

            config.facadePath =
                this.context.asAbsolutePath(
                    "out/cli/generated/${compilerName}DapFacade.js"
                );
        }

        return config;
    }
}
`, NL);
}