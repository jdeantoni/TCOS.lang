import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { Grammar,  LangiumDocument} from 'langium';
import { LangiumServices } from 'langium/lsp';
import { URI } from 'vscode-uri';
import { SoSSpec, isGrammar } from '../language-server/generated/ast.js';
import { WorkspaceFolder } from 'vscode-languageserver';


export async function extractDocuments(fileName: string, services: LangiumServices): Promise<[LangiumDocument, LangiumDocument[]]> {
    const extensions = services.LanguageMetaData.fileExtensions;
    verificationOfDocumetnsToBeExtracted(extensions, fileName);
    
    const folders: WorkspaceFolder[] = [{
        uri: URI.file(path.resolve(path.dirname(fileName))).toString(),
        name: 'main'
    }];

    await services.shared.workspace.WorkspaceManager.initializeWorkspace(folders);

    const documents = services.shared.workspace.LangiumDocuments.all.toArray();
    await services.shared.workspace.DocumentBuilder.build(documents, { validation: true });

    const mainDocument: LangiumDocument =await  services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.file(path.resolve(fileName)));

    return [mainDocument, documents];
}

function verificationOfDocumetnsToBeExtracted(extensions: readonly string[], fileName: string) {
    if (!extensions.includes(path.extname(fileName))) {
        console.error(chalk.yellow(`Please choose a file with one of these extensions: ${extensions}.`));
        process.exit(1);
    }

    if (!fs.existsSync(fileName)) {
        console.error(chalk.red(`File ${fileName} does not exist.`));
        process.exit(1);
    }
}

/**
 * Read a sos model with the grammar models from workspace located in the same folder.
 * @param fileName the main sos specification file
 * @param services the language services
 * @returns a tuple with the model indicated by the fileName and a list of
 *          grammar models from the workspace.
chr */
export async function extractSosAndGrammarModels(fileName: string, services: LangiumServices): Promise<[SoSSpec, Grammar[]]> {
    const [mainDocument, allDocuments] = await extractDocuments(fileName, services);
    return [
        mainDocument.parseResult?.value as SoSSpec,
        allDocuments
            .filter(d=>isGrammar(d.parseResult?.value))
            .map(d=>d.parseResult?.value as Grammar)
    ];
}

export interface FilePathData {
    destination: string,
    name: string
}

export function extractDestinationAndName(filePath: string, destination: string | undefined): FilePathData {
    filePath = path.basename(filePath, path.extname(filePath)).replace(/[.-]/g, '');
    return {
        destination: path.join(path.dirname(filePath), `./${destination}/src/cli/generated`),
        name: path.basename(filePath)
    };
}
