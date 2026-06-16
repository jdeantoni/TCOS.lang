import fs from "fs";
import path from "path";

export function patchExtensionMain(projectRoot: string): void {

    const filePath =
        path.join(projectRoot, "src", "extension", "main.ts");

    let content =
        fs.readFileSync(filePath, "utf8");

    if (!content.includes("CCFGDebugConfigProvider")) {

        content =
            `import { CCFGDebugConfigProvider } from '../debug/CCFGDebugConfigProvider.js';\n`
            + content;

        content =
            content.replace(
                "client = startLanguageClient(context);",

                `client = startLanguageClient(context);

    context.subscriptions.push(
        vscode.debug.registerDebugConfigurationProvider(
            'ccfg',
            new CCFGDebugConfigProvider(context)
        )
    );`
            );

        fs.writeFileSync(filePath, content);
    }
}