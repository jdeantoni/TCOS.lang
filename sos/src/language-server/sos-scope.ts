/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import {
     AstNodeDescription, DefaultScopeComputation, DefaultScopeProvider, findRootNode, getDocument, /*interruptAndCheck, LangiumDocument, */LangiumServices,/* MultiMap,
    PrecomputedScopes,*/ReferenceInfo,Scope, Stream, stream
} from 'langium';
// import { CancellationToken } from 'vscode-jsonrpc';
// import type { StructuralOperationalSemanticsServices } from './structural-operational-semantics-module';
// import { QualifiedNameProvider } from './domain-model-naming';
import { /*ImportStatement,*/  Interface, ParserRule,  Type } from './generated/ast';




export class SoSScopeProvider extends DefaultScopeProvider {

    constructor(services: LangiumServices) {
        super(services);
    }

    override getScope(context: ReferenceInfo): Scope {
        const referenceType = this.reflection.getReferenceType(context);
        if (referenceType === ParserRule) {
            return this.getTypeScope(referenceType, context);
        } else {
            return super.getScope(context);
        }
    }

    private getTypeScope(referenceType: string, context: ReferenceInfo): Scope {
        let localScope: Stream<AstNodeDescription> | undefined;
        const precomputed = getDocument(context.container).precomputedScopes;
        const rootNode = findRootNode(context.container);
        if (precomputed && rootNode) {
            const allDescriptions = precomputed.get(rootNode);
            if (allDescriptions.length > 0) {
                localScope = stream(allDescriptions).filter(des => des.type === ParserRule || des.type === Interface || des.type === Type);
            }
        }

        const globalScope = this.getGlobalScope(referenceType, context);
        if (localScope) {
            return this.createScope(localScope, globalScope);
        } else {
            return globalScope;
        }
    }

//     protected override getGlobalScope(referenceType: string, context: ReferenceInfo): Scope {
//       console.log("############# in getGlobalScope("+referenceType+", "+context.reference+")")
//     //    console.log("------------------------------")
//     //    console.log("############# "+(context.container.$container as SoSSpec))

//     var container: AstNode = context.container
//     while (container.$type != "SoSSpec"){
//         if (container.$container != undefined){
//             container = container.$container
//         }else{
//             break
//         }
//     }
//    var importedUri:string  = (container as SoSSpec).imports.importURI


//         // const grammar = getContainerOfType(context.container, isGrammar);
//         // console.log("--------------"+context.property)
//         // if (!grammar) {
//         //     return EMPTY_SCOPE;
//         // }
//       /*  const importedUris = stream(grammar.imports).map(resolveImportUri).nonNullable();*/


//       this.indexManager.allElements(ParserRule).forEach(elem => console.log(elem.name))

//         let importedElements = this.indexManager.allElements(referenceType)
//             .filter(des => equalURI(des.documentUri, importedUri));
       
//         importedElements.forEach(element => {
//             console.log("elem: "+element)
//         });

//         if (referenceType === AbstractType) {
//             importedElements = importedElements.filter(des => des.type === Interface || des.type === Type);
//         }
//         return new StreamScope(importedElements);


//     }
}




export class SoSScopeComputation extends DefaultScopeComputation {

    // // qualifiedNameProvider: QualifiedNameProvider;

    // constructor(services: StructuralOperationalSemanticsServices) {
    //     super(services);
    //     // this.qualifiedNameProvider = services.references.QualifiedNameProvider;
    // }

    // // /**
    // //  * Exports only types (`DataType or `Entity`) with their qualified names.
    // //  */
    // // override async computeExports(document: LangiumDocument, cancelToken = CancellationToken.None): Promise<AstNodeDescription[]> {
    // //     const descr: AstNodeDescription[] = [];
    // //     for (const modelNode of streamAllContents(document.parseResult.value)) {
    // //         await interruptAndCheck(cancelToken);
    // //         if (isType(modelNode)) {
    // //             let name = this.nameProvider.getName(modelNode);
    // //             if (name) {
    // //                 if (isPackageDeclaration(modelNode.$container)) {
    // //                     name = this.qualifiedNameProvider.getQualifiedName(modelNode.$container as PackageDeclaration, name);
    // //                 }
    // //                 descr.push(this.descriptions.createDescription(modelNode, name, document));
    // //             }
    // //         }
    // //     }
    // //     return descr;
    // // }

    // override async computeLocalScopes(document: LangiumDocument, cancelToken = CancellationToken.None): Promise<PrecomputedScopes> {
    //     const model = document.parseResult.value as SoSSpec;
    //     const scopes = new MultiMap<AstNode, AstNodeDescription>();
    //     await this.processContainer(model, scopes, document, cancelToken);
    //     return scopes;
    // }

    // protected async processContainer(container: SoSSpec, scopes: PrecomputedScopes, document: LangiumDocument, cancelToken: CancellationToken): Promise<AstNodeDescription[]> {
    //     const localDescriptions: AstNodeDescription[] = [];
    //     for (const stateVar of container.sigma) {
    //         await interruptAndCheck(cancelToken);
    //         // if (isType(stateVar)) {
    //         const description = this.descriptions.createDescription(stateVar, stateVar.name, document);
    //         localDescriptions.push(description);
           
    //         // } else if (isPackageDeclaration(stateVar)) {
    //         //     const nestedDescriptions = await this.processContainer(stateVar, scopes, document, cancelToken);
    //         //     for (const description of nestedDescriptions) {
    //         //         // Add qualified names to the container
    //         //         const qualified = this.createQualifiedDescription(stateVar, description, document);
    //         //         localDescriptions.push(qualified);
    //         //     }
    //         // }
    //     }

    //     scopes.addAll(container, localDescriptions);
    //     return localDescriptions;
    // }

    // protected createQualifiedDescription(pack: PackageDeclaration, description: AstNodeDescription, document: LangiumDocument): AstNodeDescription {
    //     const name = this.qualifiedNameProvider.getQualifiedName(pack.name, description.name);
    //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //     return this.descriptions.createDescription(description.node!, name, document);
    // }

}


