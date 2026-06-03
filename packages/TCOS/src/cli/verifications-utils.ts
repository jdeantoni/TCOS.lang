import fs from "fs";
import chalk from "chalk";
import { LangiumServices } from "langium/lsp";
import path from "path";

export function verificationOfDocumentsToBeExtracted(services: LangiumServices, fileName: string) {
    const extensions = services.LanguageMetaData.fileExtensions;
    if (!extensions.includes(path.extname(fileName))) {
        console.error(chalk.yellow(`Please choose a file with one of these extensions: ${extensions}.`));
        process.exit(1);
    }

    if (!fs.existsSync(fileName)) {
        console.error(chalk.red(`File ${fileName} does not exist.`));
        process.exit(1);
    }
}