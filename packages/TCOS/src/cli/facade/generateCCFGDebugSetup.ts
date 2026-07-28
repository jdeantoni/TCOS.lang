import fs from "node:fs";
import path from "node:path";

export function generateCCFGDebugSetup(
    projectRoot: string,
    languageName: string,
    fileName: string
): void {
    const importFileName = path.basename(fileName, path.extname(fileName));
    const outPath = path.join(projectRoot, "src", "extension", "ccfgDebugSetup.ts");

    const content =
`
import * as vscode from 'vscode';
import { ${languageName}DebugConfigurationProvider } from '../cli/generated/${importFileName}DebugConfigurationProvider.js';

export function registerCCFGDebug(context: vscode.ExtensionContext): void {

    context.subscriptions.push(
        vscode.debug.registerDebugConfigurationProvider(
            'ccfg',
            new ${languageName}DebugConfigurationProvider(context)
        )
    );

    context.subscriptions.push(
        vscode.debug.registerDebugConfigurationProvider(
            'ccfg',
            {
                provideDebugConfigurations(): vscode.DebugConfiguration[] {
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) return [];
                    return [{
                        type:       'ccfg',
                        name:       'Debug ${languageName}',
                        request:    'launch',
                        sourceFile: editor.document.fileName
                    }];
                }
            },
            vscode.DebugConfigurationProviderTriggerKind.Dynamic
        )
    );
}
`;

    fs.writeFileSync(outPath, content);
}