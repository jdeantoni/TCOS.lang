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
    const languageIdent = packageJson.contributes.languages?.[0]?.id;
    if (
        !packageJson.contributes.breakpoints.some(
            (b: any) => b.language === languageId
        )
    ) {
        packageJson.contributes.breakpoints.push({
            language: languageIdent
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
            languages: [languageIdent],
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
            languageId,languageIdent
        )
    ) {
        debuggerContribution.languages.push(
            languageId,languageName,languageIdent
        );
    }

    fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 4)
    );
}

