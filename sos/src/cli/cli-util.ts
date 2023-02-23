import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { AstNode, Grammar,  LangiumDocument, LangiumServices, Mutable, getDocument} from 'langium';
import { URI } from 'vscode-uri';
import { SoSSpec, isGrammar } from '../language-server/generated/ast';
import { createStructuralOperationalSemanticsServices } from '../language-server/structural-operational-semantics-module';
import { NodeFileSystem } from 'langium/node';


export async function extractDocuments(fileName: string, services: LangiumServices): Promise<[LangiumDocument, LangiumDocument[]]> {
    const extensions = services.LanguageMetaData.fileExtensions;
    if (!extensions.includes(path.extname(fileName))) {
        console.error(chalk.yellow(`Please choose a file with one of these extensions: ${extensions}.`));
        process.exit(1);
    }

    if (!fs.existsSync(fileName)) {
        console.error(chalk.red(`File ${fileName} does not exist.`));
        process.exit(1);
    }
    
    const documents = services.shared.workspace.LangiumDocuments.all.toArray();

    
    await services.shared.workspace.DocumentBuilder.build(documents, { validationChecks: 'all' });

    documents.forEach(document=>{
        const validationErrors = (document.diagnostics ?? []).filter(e => e.severity === 1);
        if (validationErrors.length > 0) {
            console.error(chalk.red('ouch ! There are validation errors:'));
            for (const validationError of validationErrors) {
                console.error(chalk.red(
                    `line ${validationError.range.start.line + 1}: ${validationError.message} [${document.textDocument.getText(validationError.range)}]`
                ));
            }
            process.exit(1);
        }
    });
    const mainDocument = services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.file(path.resolve(fileName)));


    var uris2: Set<string> = new Set(); //To be used in later recursion to breal import loop and double visit 
    var allDocuments = []
    const uriString = mainDocument.uri.toString();
    if (!uris2.has(uriString)) {
        uris2.add(uriString);
        const sosSpec = mainDocument.parseResult.value as SoSSpec;
        const importedDocument = services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.file(path.resolve(sosSpec.imports.importURI)));
        allDocuments.push(importedDocument) //TODO: load recusrsively imported grammar
    }
    var grammars = [mainDocument.parseResult.value as Grammar, allDocuments[0].parseResult.value as Grammar]
    await relinkGrammars(grammars);

    return [mainDocument, allDocuments];
}

const { shared: sharedServices/*, langiumServices: langiumServices*/, StructuralOperationalSemantics: sos } = createStructuralOperationalSemanticsServices(NodeFileSystem);


async function relinkGrammars(grammars: Grammar[]): Promise<void> {
    const linker = sos.references.Linker;
    const documentBuilder = sharedServices.workspace.DocumentBuilder;
    const documentFactory = sharedServices.workspace.LangiumDocumentFactory;
    const langiumDocuments = sharedServices.workspace.LangiumDocuments;
    const documents = langiumDocuments.all.toArray();
    // Unlink and delete all document data
    for (const document of documents) {
        linker.unlink(document);
    }
    await documentBuilder.update([], documents.map(e => e.uri));
    // Create and build new documents
    const newDocuments = grammars.map(e => {
        const uri = getDocument(e).uri;
        const newDoc = documentFactory.fromModel(e, uri);
        (e as Mutable<AstNode>).$document = newDoc;
        return newDoc;
    });
    newDocuments.forEach(e => langiumDocuments.addDocument(e));
    await documentBuilder.build(newDocuments, { validationChecks: 'none' });
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
        destination: destination ?? path.join(path.dirname(filePath), 'generated'),
        name: path.basename(filePath)
    };
}
