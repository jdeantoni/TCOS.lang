import fs from "node:fs";
import path from "node:path";

export function patchExtensionMain(
    projectRoot: string,
    languageName: string,
    fileName: string
): void {
    const filePath = path.join(projectRoot, "src", "extension", "main.ts");
    let content = fs.readFileSync(filePath, "utf8");

    content = content.replace(
        /import type \* as vscode from ['"]vscode['"]/,
        `import * as vscode from 'vscode'`
    );

    const importLine = `import { registerCCFGDebug } from './ccfgDebugSetup.js';\n`;
    if (!content.includes('registerCCFGDebug')) {
        content = importLine + content;
    }

    if (!content.includes('registerCCFGDebug(context)')) {
        content = content.replace(
            "client = startLanguageClient(context);",
            `client = startLanguageClient(context);\n    registerCCFGDebug(context);`
        );
    }

    fs.writeFileSync(filePath, content);
}