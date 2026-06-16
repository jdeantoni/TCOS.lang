import fs from "fs";
import path from "path";

export function patchExtensionMain(
    projectRoot: string,
    languageName: string
): void {

    const languageClass =
        languageName.charAt(0).toUpperCase() +
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

    if (
        !content.includes(
            `${languageClass}DebugConfigurationProvider`
        )
    ) {

        content =
            `import { ${languageClass}DebugConfigurationProvider } from '../cli/generated/${languageName}DebugConfigurationProvider.js';\n`
            + content;
    }

    if (
        !content.includes(
            `new ${languageClass}DebugConfigurationProvider`
        )
    ) {

        content = content.replace(
            "client = startLanguageClient(context);",
            `client = startLanguageClient(context);

    context.subscriptions.push(
        vscode.debug.registerDebugConfigurationProvider(
            'ccfg',
            new ${languageClass}DebugConfigurationProvider()
        )
    );`
        );
    }

    fs.writeFileSync(
        filePath,
        content
    );
}

