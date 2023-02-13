/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import {
    AstNode,
    DefaultScopeComputation, DefaultScopeProvider, EMPTY_SCOPE, getContainerOfType, /*interruptAndCheck, LangiumDocument, */LangiumServices,/* MultiMap,
    PrecomputedScopes,*/ReferenceInfo,Scope, ScopeOptions, stream, StreamScope
} from 'langium';
// import { CancellationToken } from 'vscode-jsonrpc';
// import type { StructuralOperationalSemanticsServices } from './structural-operational-semantics-module';
// import { QualifiedNameProvider } from './domain-model-naming';
import { AbstractElement, Assignment, Group, isAssignment, isGroup, isRuleOpening, MemberCall, RuleOpening} from './generated/ast';
import { getRuleOpeningChain, inferType } from './type-system/infer';
import { isRuleOpeningType } from './type-system/descriptions';




export class SoSScopeProvider extends DefaultScopeProvider {

//     constructor(services: LangiumServices) {
//         super(services);
//     }


// //TODO: here we should make the "properties" of the rules available for navigation (e.g. in test1.sos, in the Plus rule opening, 'left' should be made available)


//     override getScope(context: ReferenceInfo): Scope {
//         const referenceType = this.reflection.getReferenceType(context);
//         if (referenceType === ParserRule) {
//             return this.getTypeScope(referenceType, context);
//         } else {
//             return super.getScope(context);
//         }
//     }



//     public getTypeScope(referenceType: string, context: ReferenceInfo): Scope {
//         console.log("###### getTypeScope("+referenceType+","+context.reference.$refText+')')
//         let localScope: Stream<AstNodeDescription> | undefined;
//         const precomputed = getDocument(context.container).precomputedScopes;
//         const rootNode = findRootNode(context.container);
//         if (precomputed && rootNode) {
//             const allDescriptions = precomputed.get(rootNode);
//             if (allDescriptions.length > 0) {
//                 localScope = stream(allDescriptions).filter(des => des.type === ParserRule || des.type === Interface || des.type === Type);
//             }
//         if(isParserRule(context.reference.ref)){
           
//             var pr = (context.reference.ref as ParserRule)
//             console.log("###### a parserRule !!!"+pr.definition.$type)
//             if(isAlternatives(pr.definition)){
//                 console.log("###### if found an alternative "+(pr.definition as Alternatives).elements)
//             } 
//         }
//         }

//         const globalScope = this.getGlobalScope(referenceType, context);
//         if (localScope) {
//             return this.createScope(localScope, globalScope);
//         } else {
//             return globalScope;
//         }
//     }





    
    

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
//}









// export class LoxScopeProvider extends DefaultScopeProvider {

    constructor(services: LangiumServices) {
        super(services);
    }

    override getScope(context: ReferenceInfo): Scope {
        // target element of member calls
        console.log("###getScopeProvider: context.property = "+context.property+"\n\t context.reference.$refText = "+context.reference.$refText)
        if (context.property === 'element' || context.property === 'leftStruct' || context.property === 'leftRTD' || context.property === 'rightStruct' || context.property === 'rightRTD' || context.property === 'right') {
            // for now, `this` and `super` simply target the container class type
            //if (context.reference.$refText === 'this' || context.reference.$refText === 'super') {
                const ruleOpeningItem = getContainerOfType(context.container, isRuleOpening);
                if (ruleOpeningItem) {
                    return this.scopeRuleOpeningMembers(ruleOpeningItem);
                }
           // }
            const memberCall = context.container as MemberCall;
            const previous = memberCall.previous;
            if (!previous) {
                return super.getScope(context);
            }
            const previousType = inferType(previous, new Map());
            if (isRuleOpeningType(previousType)) {
                return this.scopeRuleOpeningMembers(previousType.literal);
            }
            return EMPTY_SCOPE;
        }
        return super.getScope(context);
    }

    private scopeRuleOpeningMembers(ruleOpeningItem: RuleOpening): Scope {
        var allMembers:AstNode[] = getRuleOpeningChain(ruleOpeningItem).flatMap(e => e.runtimeState);
        var allAssignments: Assignment[] = this.getAllAssignments((ruleOpeningItem.onRule.ref?.definition as Group).elements);
        var allScopeElements = allMembers.concat(allAssignments)
        return this.createScopeForNodes(allScopeElements);
    }

    private getAllAssignments(elems: AbstractElement[]): Assignment[] {
        var allAssignments: Assignment[] = [];
        var nestedElems: AbstractElement[] = []
        for (var e of elems) {
            if (isGroup(e)) {
                nestedElems = nestedElems.concat((e as Group).elements);
            } else if (isAssignment(e)) {
                allAssignments.push(e);
            }
        }
        
        if(nestedElems.length > 0){
            return allAssignments.concat(this.getAllAssignments(nestedElems));
        }

        return allAssignments
    }


        /**
     * Create a scope for the given collection of AST nodes, which need to be transformed into respective
     * descriptions first. This is done using the `NameProvider` and `AstNodeDescriptionProvider` services.
     */
        protected override createScopeForNodes(elements: Iterable<AstNode>, outerScope?: Scope, options?: ScopeOptions): Scope {
            const s = stream(elements).map(e => {
                var name
                if(isAssignment(e)){
                    name=(e as Assignment).feature
                }else{
                                    name = this.nameProvider.getName(e);
                }
                if (name) {
                    return this.descriptions.createDescription(e, name);
                }
                return undefined;
            }).nonNullable();
            return new StreamScope(s, outerScope, options);
        }
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


