import fs from "fs";
import path from "path";

export function patchExtensionMain(
    projectRoot: string,
    languageName: string,
    fileName: string
): void {

    const languageClass = languageName;

    const importFileName = fileName.split('.')[0];

    const languageFileName =
        languageName.charAt(0).toLowerCase() +
        languageName.slice(1);
    
    const filePath = path.join(
        projectRoot,
        "src",
        "extension",
        "main.ts"
    );

    let content = fs.readFileSync(
        filePath,
        "utf8"
    );

    content = content.replace(
        "import type * as vscode from 'vscode';",
        "import * as vscode from 'vscode';"
    );

    content = content.replace(
        'import type * as vscode from "vscode";',
        'import * as vscode from "vscode";'
    );

    const importLine =
        `import { ${languageClass}DebugConfigurationProvider } from '../cli/generated/${importFileName}DebugConfigurationProvider.js';\n`;

    if (
        !content.includes(
            `${languageClass}DebugConfigurationProvider`
        )
    ) {

        content =
            importLine + content;
    }

    const registrationCode =
`client = startLanguageClient(context);

    context.subscriptions.push(
        vscode.debug.registerDebugConfigurationProvider(
            'ccfg',
            new ${languageClass}DebugConfigurationProvider(context)
        )
    );`;

    if (
        !content.includes(
            `new ${languageClass}DebugConfigurationProvider`
        )
    ) {

        content = content.replace(
            "client = startLanguageClient(context);",
            registrationCode
        );
    }

    fs.writeFileSync(
        filePath,
        content
    );
}

