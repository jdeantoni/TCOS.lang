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

    const languageName =
        model.name;

    file.append(`
import * as vscode from 'vscode';

export class ${languageName}DebugConfigurationProvider
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

        const language = "${model.name}";

        config.type = "ccfg";
        config.request = "launch";

        config.name = config.name ?? "Debug ${model.name}";

        config.language = language;
        config.sourceFile = editor.document.fileName;

        config.compilerFrontEndPath =
            this.context.asAbsolutePath(
                "generated/${compilerName}/${compilerName}CompilerFrontEnd.js"
            );

        return config;
    }
}
`, NL);
}