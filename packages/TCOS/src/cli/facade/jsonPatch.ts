import fs from "fs";
import path from "path";

export function patchPackageJson(
    projectRoot: string,
    languageId: string
): void {

    const packageJsonPath = path.join(
        projectRoot,
        "package.json"
    );
    const languageName =
        languageId.charAt(0).toLowerCase() +
        languageId.slice(1);
    const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
    );

    packageJson.contributes ??= {};
    packageJson.contributes.breakpoints ??= [];
    packageJson.contributes.debuggers ??= [];

    if (
        !packageJson.contributes.breakpoints.some(
            (b: any) => b.language === languageId
        )
    ) {
        packageJson.contributes.breakpoints.push({
            language: languageName
        });
    }

    let debuggerContribution =
        packageJson.contributes.debuggers.find(
            (d: any) => d.type === "ccfg"
        );

    if (!debuggerContribution) {

        debuggerContribution = {
            type: "ccfg",
            label: "CCFG Debug",
            languages: [],
            configurationAttributes: {
                launch: {}
            }
        };

        packageJson.contributes.debuggers.push(
            debuggerContribution
        );
    }

    debuggerContribution.languages ??= [];

    if (
        !debuggerContribution.languages.includes(
            languageId
        )
    ) {
        debuggerContribution.languages.push(
            languageId,languageName
        );
    }

    fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 4)
    );
}

