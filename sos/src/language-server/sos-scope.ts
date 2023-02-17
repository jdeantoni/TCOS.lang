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
import { Assignment, isAssignment, isMemberCall, isRuleOpening, isRWRule, isSchedulingRule, isSoSSpec, isTemporaryVariable, MemberCall, MethodMember, Parameter, ParserRule, RuleOpening, RWRule, SoSSpec, VariableDeclaration} from './generated/ast';
import { getRuleOpeningChain, inferType } from './type-system/infer';
import { isParserRuleType, isRuleOpeningType } from './type-system/descriptions';
import { AbstractElement } from './generated/ast';
import { isGroup } from './generated/ast';
import { Group } from './generated/ast';




export class SoSScopeProvider extends DefaultScopeProvider {

    constructor(services: LangiumServices) {
        super(services);
    }

    override getScope(context: ReferenceInfo): Scope {
        // target element of member calls
        // console.log("###getScopeProvider: context.property = "+context.property+"\n\t context.reference.$refText = "+context.reference.$refText)        
        
        if (context.property === 'element' || context.property === 'left' || context.property === 'right') {
            // for now, `this` and `super` simply target the container class type
            if (context.reference.$refText === 'this' || context.reference.$refText === 'struct') {
                // context.reference.ref = ruleOpeningItem ?
                const ruleOpeningItem = getContainerOfType(context.container, isRuleOpening);
                if (ruleOpeningItem) {
                    return this.scopeRuleOpeningMembers(ruleOpeningItem);
                }
            }

            const memberCall = context.container as MemberCall;
            const previous = memberCall.previous;
            if (!previous) {
               // return super.getScope(context);
                const ruleOpeningItem = getContainerOfType(context.container, isRuleOpening);
                const potentialSchedulingRuleItem = getContainerOfType(context.container, isSchedulingRule);
                if (ruleOpeningItem) {
                    if (potentialSchedulingRuleItem){
                     return this.scopeRuleOpeningMembers(ruleOpeningItem, true);
                    }
                    else {
                        return this.scopeRuleOpeningMembers(ruleOpeningItem);
                    }
                }
            }
            if (isMemberCall(previous) && previous.element !== undefined /*&& previous.element.$refText === 'this'*/){
                const ruleOpeningItem = getContainerOfType(previous.$container, isRuleOpening);
                if (ruleOpeningItem) {
                    return this.scopeRuleOpeningMembers(ruleOpeningItem);
                }
            }
            const previousType = inferType(previous, new Map());
            if (isRuleOpeningType(previousType)) {
                return this.scopeRuleOpeningMembers(previousType.literal);
            }else if (isParserRuleType(previousType)) {
                //either the rule has been open and then we need the cope of this ruleOpening or not and then only "assigments" have to be considered
                const sosSpecItem: SoSSpec | undefined = getContainerOfType(previous?.$container, isSoSSpec);
                if (sosSpecItem){
                    for(var ro of sosSpecItem.rtdAndRules){
                        if (isRuleOpening(ro)){
                            if (ro.onRule.$refText === previousType.literal.name){
                                return this.scopeRuleOpeningMembers(ro);
                            }
                        }
                    }
                }
                if(isMemberCall(previous)){
                    const ruleOpeningItem: RuleOpening | undefined = getContainerOfType(previous?.$container, isRuleOpening);
                    if (ruleOpeningItem){
                        return this.scopeParsingRule(previousType.literal, ruleOpeningItem);
                    }
                }


            }
            return EMPTY_SCOPE;
        }
        return super.getScope(context);
    }

    private scopeParsingRule(parserRuleItem: ParserRule, ruleOpeningItem: RuleOpening): Scope {
        var allScopeElements: AstNode[] = (parserRuleItem !== undefined)?this.getAllAssignments(parserRuleItem.definition) : [];
        this.addListFunctions(ruleOpeningItem, allScopeElements);
        allScopeElements = allScopeElements.concat(this.addClocks(ruleOpeningItem))

        return this.createScopeForNodes(allScopeElements);
    }

    private addListFunctions(ruleOpeningItem: RuleOpening, allScopeElements: AstNode[]) {
        var atFunction: MethodMember = {
            name: "at",
            $containerProperty: "methods",
            $container: ruleOpeningItem,
            $document: ruleOpeningItem.$document,
            $cstNode: ruleOpeningItem.$cstNode,
            parameters: [],
            $type: 'MethodMember',
            returnType: {
                $container: undefined as unknown as MethodMember, //not sure how to do better
                $type: 'TypeReference'
            }
        }


        var p: Parameter = {
            $container: atFunction,
            $type: 'Parameter',
            name: 'i'
        }

        atFunction.parameters.push(p)

        allScopeElements.push(atFunction);

        var lengthFunction: MethodMember = {
            name: "length",
            $containerProperty: "methods",
            $container: ruleOpeningItem,
            $document: ruleOpeningItem.$document,
            $cstNode: ruleOpeningItem.$cstNode,
            parameters: [],
            $type: 'MethodMember',
            returnType: {
                $container: undefined as unknown as MethodMember, //not sure how to do better
                $type: 'TypeReference'
            }
        }

        allScopeElements.push(lengthFunction);
        
    }

    private scopeRuleOpeningMembers(ruleOpeningItem: RuleOpening, isForSchedulingRule: boolean = false): Scope {
        
        var allScopeElements: AstNode[] = (ruleOpeningItem.onRule?.ref !== undefined)?this.getAllAssignments(ruleOpeningItem.onRule.ref.definition) : [];        
        //if (! isForSchedulingRule){
            var allMembers:AstNode[] = getRuleOpeningChain(ruleOpeningItem).flatMap(e => e.runtimeState);
            for(var rule of ruleOpeningItem.rules){
                if(isRWRule(rule)){
                    for(var prem of (rule as RWRule).premise){
                        if(isTemporaryVariable(prem.right)){
                            allMembers.push(prem.right)
                        }
                    }
                }
            }
            allScopeElements = allMembers.concat(allScopeElements)
        //}else{
            for(var rule of ruleOpeningItem.rules){
                if(rule){
                    if(isRWRule(rule)){
                        allScopeElements.push(rule)
                    }
                    if(isSchedulingRule(rule)){
                        if(rule.loop){
                            allScopeElements.push(rule.loop.itVar)
                        }
                    }
                }
                
            }
       // }
        allScopeElements = allScopeElements.concat(this.addClocks(ruleOpeningItem))

        this.addListFunctions(ruleOpeningItem,allScopeElements)

        return this.createScopeForNodes(allScopeElements);
    }
    

    private addClocks(ruleOpeningItem: RuleOpening): AstNode[] {
        var res : AstNode[] =[]
        const start: VariableDeclaration = {
            $container: ruleOpeningItem,
            $type: 'VariableDeclaration',
            name: "startEvaluation",
            $cstNode: ruleOpeningItem.$cstNode,
            $containerProperty: "clocks",
            assignment: false
        };
        start.type = {
            $container: start,
            $type: 'TypeReference',
            primitive: 'event'
        };
        res.push(start);

        const finish: VariableDeclaration = {
            $container: ruleOpeningItem,
            $type: 'VariableDeclaration',
            name: "finishEvaluation",
            $cstNode: ruleOpeningItem.$cstNode,
            $containerProperty: "clocks",
            assignment: false
        };
        finish.type = {
            $container: finish,
            $type: 'TypeReference',
            primitive: 'event'
        };
        res.push(finish);
        
        return res
    }

    private getAllAssignments(element: AbstractElement): Assignment[] {
        var allAssignments: Assignment[] = [];
        // var def = rule.definition;
        // if (def === undefined){
        //     return allAssignments;
        // }
        // var nestedElems: AbstractElement[] = []
        //  for (var e of rule.element) {
            if (isGroup(element)) {
                for (var e of (element as Group).elements){
                    allAssignments = allAssignments.concat(this.getAllAssignments(e));
                }
            }else
             if (isAssignment(element)) {
                allAssignments.push(element);
            }
        // }
        
        // if(nestedElems.length > 0){
        //     return allAssignments.concat(this.getAllAssignments(nestedElems));
        // }

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


