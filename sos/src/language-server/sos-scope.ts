/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import {
    AstNode,
    DefaultScopeComputation, DefaultScopeProvider, EMPTY_SCOPE, getContainerOfType, LangiumServices, ReferenceInfo,Scope, ScopeOptions, stream, streamAllContents, StreamScope
} from 'langium';

import { AbstractRule, Assignment, CollectionRuleSync, CrossReference, isAbstractRule, isAlternatives, isAssignment, isCollectionRuleSync, isMemberCall, isRuleOpening, isRuleSync, isRWRule, 
         isSoSSpec, isTemporaryVariable, MemberCall, MethodMember, Parameter,isCrossReference, isGrammar,
         ParserRule, RuleOpening, RWRule, SoSSpec, TypeReference, VariableDeclaration,
         Alternatives,
         FieldMember,
         isParserRule} from './generated/ast.js';
import { getRuleOpeningChain, inferType } from './type-system/infer.js';
import { isParserRuleType, isRuleOpeningType } from './type-system/descriptions.js';
import { AbstractElement } from './generated/ast.js';
import { isGroup } from './generated/ast.js';
import { Group } from './generated/ast.js';
import { getType } from '../utils/sos-utils.js';




export class SoSScopeProvider extends DefaultScopeProvider {

    constructor(services: LangiumServices) {
        super(services);
    }

    override getScope(context: ReferenceInfo): Scope {
        // target element of member calls
        //console.log("###getScopeProvider: context.property = "+context.property+"\n\t context.reference.$refText = "+context.reference.$refText)        
        


        if (context.property === 'element' /*|| context.property === 'left' || context.property === 'right' || context.property === "reference"*/) {
            const memberCall = context.container as MemberCall;
            const previous = memberCall.previous;
            if (!previous) {
               // return super.getScope(context);
                const ruleOpeningItem = getContainerOfType(context.container, isRuleOpening);
                if (ruleOpeningItem) {
                    return this.scopeRuleOpeningMembers(ruleOpeningItem);
                }
            }
            //TODO: should never write a so crappy code ! To be refactored !
            if (isMemberCall(previous) && previous.element !== undefined){
                const collectionRuleSync = getContainerOfType(previous.$container, isCollectionRuleSync);
                if(collectionRuleSync){
                    if((collectionRuleSync.collection as MemberCall).element?.ref){
                        let collectionElemRef = (collectionRuleSync.collection as MemberCall).element?.ref
                        if(collectionElemRef != undefined){
                            var terminal = (collectionElemRef as unknown as Assignment).terminal
                            if (isCrossReference(terminal)){
                                if(isParserRule((terminal as CrossReference).type.ref)){
                                    const parserRuleItem = (terminal as CrossReference).type.ref
                                    const sosSpec = getContainerOfType(context.container, isSoSSpec)
                                    if(sosSpec){
                                        for(var ro of sosSpec.rtdAndRules){
                                            if (isRuleOpening(ro)){
                                                if (ro.onRule?.ref?.name === (parserRuleItem as ParserRule).name){
                                                    return this.scopeParsingRule(parserRuleItem as ParserRule,ro)
                                                }
                                            }
                                        }
                                        //should only take assignement as a variant of scopePArsingRule
                                    }
                                }
                            }
                        }
                    }
                }
                const ruleOpeningItem = getContainerOfType(previous.$container, isRuleOpening);
                if (ruleOpeningItem) {
                    return this.scopeRuleOpeningMembers(ruleOpeningItem,previous);
                }
            }
            const previousType = inferType(previous, new Map());
            if (isRuleOpeningType(previousType)) {
                throw new String("in sos-scope.ts line 54")
               // return this.scopeRuleOpeningMembers(previousType.literal);
            }else if (isParserRuleType(previousType)) {
                //either the rule has been open and then we need the cope of this ruleOpening or not and then only "assigments" have to be considered
                const sosSpecItem: SoSSpec | undefined = getContainerOfType(previous?.$container, isSoSSpec);
                if (sosSpecItem){
                    for(var ro of sosSpecItem.rtdAndRules){
                        if (isRuleOpening(ro)){
                            if (ro.onRule?.$refText === previousType.literal.name){
                                
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

    // private scopeCollectionRuleMembers(collectionRuleItem: CollectionRuleSync, ruleOpeningItem: RuleOpening): Scope {
    //     var allScopeElements: AstNode[] = (parserRuleItem !== undefined)?this.getAllAssignments(parserRuleItem.definition) : [];
    //     this.addListFunctions(ruleOpeningItem, allScopeElements);
    //     allScopeElements = allScopeElements.concat(this.addClocks(ruleOpeningItem))

    //     return this.createScopeForNodes(allScopeElements);
    // }

    private scopeParsingRule(parserRuleItem: ParserRule, ruleOpeningItem: RuleOpening): Scope {
        var allScopeElements: AstNode[] = (parserRuleItem !== undefined)?this.getAllAssignments(parserRuleItem.definition) : [];
        this.addListFunctions(ruleOpeningItem, allScopeElements);
        allScopeElements = allScopeElements.concat(this.addClocks(ruleOpeningItem))
        allScopeElements = allScopeElements.concat(this.getAllTemporaryVariable(ruleOpeningItem))
        allScopeElements = allScopeElements.concat(this.getAllRuntimeState(ruleOpeningItem))
        return this.createScopeForNodes(allScopeElements);
    }

    private addListFunctions(ruleOpeningItem: RuleOpening, allScopeElements: AstNode[], context:MemberCall | undefined = undefined) {
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

        if(context){
            var type = getType(context)
            var returnType : TypeReference = {
                reference: {ref:(isAbstractRule(type)?type:undefined), $refText:((isAbstractRule(type)?type.name:'undefined'))},
                $container: atFunction,
                $type: "TypeReference"
            }
            atFunction.returnType = returnType
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
        if(context){
            var type = getType(context)
            var returnType : TypeReference = {
                $container: lengthFunction,
                $type: "TypeReference"
            }
            returnType.primitive={name:"integer",$container:returnType,$type:"SoSPrimitiveType"}
            lengthFunction.returnType = returnType
        }

        allScopeElements.push(lengthFunction);
        
        var firstFunction: MethodMember = {
            name: "first",
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
        if(context){
            var type = getType(context)
            var returnType : TypeReference = {
                reference: {ref:(isAbstractRule(type)?type:undefined), $refText:((isAbstractRule(type)?type.name:'undefined'))},
                $container: firstFunction,
                $type: "TypeReference"
            }
            firstFunction.returnType = returnType
        }

        allScopeElements.push(firstFunction);

        var lastFunction: MethodMember = {
            name: "last",
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

        if(context){
            var type = getType(context)
            var returnType : TypeReference = {
                reference: {ref:(isAbstractRule(type)?type:undefined), $refText:((isAbstractRule(type)?type.name:'undefined'))},
                $container: lastFunction,
                $type: "TypeReference"
            }
            lastFunction.returnType = returnType
        }
        allScopeElements.push(lastFunction);

        var allReaders: MethodMember = {
            name: "allReaders",
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

        if(context){
            var type = getType(context)
            var returnType : TypeReference = {
                reference: {ref:(isAbstractRule(type)?type:undefined), $refText:((isAbstractRule(type)?type.name:'undefined'))},
                $container: allReaders,
                $type: "TypeReference"
            }
            allReaders.returnType = returnType
        }
        allScopeElements.push(allReaders);

    }

    private scopeRuleOpeningMembers(ruleOpeningItem: RuleOpening, context: MemberCall | undefined = undefined): Scope {
        
        var allScopeElements: AstNode[] = (ruleOpeningItem.onRule?.ref !== undefined)?this.getAllAssignments(ruleOpeningItem.onRule.ref.definition) : [];
        allScopeElements = allScopeElements.concat((ruleOpeningItem.onRule?.ref !== undefined)?this.getAllRules(ruleOpeningItem.onRule.ref.definition):[])        
        //if (! isForControlFlowRule)
        var allMembers:AstNode[] = []
        if (context && context.element && context.element.ref && isAssignment(context.element.ref) 
            && isCrossReference((context.element.ref as unknown as Assignment).terminal)){
            var parserRule = ((context.element.ref as unknown as Assignment).terminal as CrossReference).type.ref
            var sosSpec =  getContainerOfType(ruleOpeningItem?.$container, isSoSSpec);
            var contextRuleOpeningItem = undefined
            if (sosSpec){
                for(let rule of sosSpec?.rtdAndRules){
                    if (isRuleOpening(rule) && rule.onRule?.ref === parserRule){
                        contextRuleOpeningItem = rule
                    }
                }
            }
            if(contextRuleOpeningItem){
                allMembers= getRuleOpeningChain(contextRuleOpeningItem).flatMap(e => e.runtimeState);
            }
        }else{
            allMembers = getRuleOpeningChain(ruleOpeningItem).flatMap(e => e.runtimeState);
        }
            for(let rule of ruleOpeningItem.rules){
                if(isRWRule(rule)){
                    /**
                     * TODO: add temporary variable in scope with recursive call
                     */
                    for(let expr of streamAllContents((rule as RWRule).premise.eventExpression)){
                        if(isTemporaryVariable(expr)){
                            allMembers.push(expr)
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
                    // if(isControlFlowRule(rule)){
                    //     if(rule.loop){
                    //         allScopeElements.push(rule.loop.itVar)
                    //     }
                    // }
                }
                
            }
       // }
        allScopeElements = allScopeElements.concat(this.addClocks(ruleOpeningItem))
        allScopeElements = allScopeElements.concat(this.getAllTemporaryVariable(ruleOpeningItem))
        this.addListFunctions(ruleOpeningItem,allScopeElements,context)

        for(let v of ruleOpeningItem.runtimeState){
            if ((v as VariableDeclaration).type?.primitive?.name == "Timer"){
                const starts: FieldMember = {
                    $container: v,
                    $type: 'FieldMember',
                    name: "starts",
                    $cstNode: ruleOpeningItem.$cstNode,
                    $containerProperty: "clocks",
                   type:{} as TypeReference
                };
                starts.type = {
                    $container: starts,
                    $type: 'TypeReference',
                };
                starts.type.primitive = { name: 'event', $container: starts.type, $type: 'SoSPrimitiveType' };
                const terminates: FieldMember = {
                    $container: v,
                    $type: 'FieldMember',
                    name: "terminates",
                    $cstNode: ruleOpeningItem.$cstNode,
                    $containerProperty: "clocks",
                    type:{} as TypeReference
                };
                terminates.type = {
                    $container: terminates,
                    $type: 'TypeReference',
                };
                terminates.type.primitive = { name: 'event', $container: starts.type, $type: 'SoSPrimitiveType' };
            }
        }

        return this.createScopeForNodes(allScopeElements);
    }
    

    private addClocks(ruleOpeningItem: RuleOpening): AstNode[] {
        var res : AstNode[] =[]
        res.push(this.addClock(ruleOpeningItem, "starts"));
        res.push(this.addClock(ruleOpeningItem, "updates"));
        res.push(this.addClock(ruleOpeningItem, "cleanup"));
        res.push(this.addClock(ruleOpeningItem, "terminates"));
        
        return res
    }

    private addClock(ruleOpeningItem: RuleOpening, clockName: string): VariableDeclaration {
        const finish: VariableDeclaration = {
            $container: ruleOpeningItem,
            $type: 'VariableDeclaration',
            name: clockName,
            $cstNode: ruleOpeningItem.$cstNode,
            $containerProperty: "clocks",
            assignment: false
        };
        finish.type = {
            $container: finish,
            $type: 'TypeReference',
        };
        finish.type.primitive = { name: 'event', $container: finish.type, $type: 'SoSPrimitiveType' };

        return finish;
    }

    private getAllTemporaryVariable(ruleOpeningItem: RuleOpening): AstNode[] {
        var alltempVars: AstNode[] = [];
        ruleOpeningItem.rules.forEach(rule => {
            if (isRWRule(rule) && (rule as RWRule)?.conclusion !== undefined){

                for(let emission of (rule as RWRule)?.conclusion?.eventemissions){
                    if (isRuleSync(emission)){
                        if (isCollectionRuleSync(emission)) {
                            if (isTemporaryVariable((emission as CollectionRuleSync).varDecl)) {
                                alltempVars.push((emission as CollectionRuleSync).varDecl);
                            }
                    }
                    }
                    
                }
            }
        });
        return alltempVars
    }

    private getAllRuntimeState(ruleOpeningItem: RuleOpening): AstNode[] {
        var allVars: AstNode[] = [];
        ruleOpeningItem.runtimeState.forEach(v => allVars.push(v));
        return allVars
    }

    private getAllAssignments(element: AbstractElement): Assignment[] {
        var allAssignments: Assignment[] = [];

        if (isGroup(element)) {
            for (let e of (element as Group).elements) {
                allAssignments = allAssignments.concat(this.getAllAssignments(e));
            }
        } else if (isAlternatives(element)) {
            for (let e of (element as Alternatives).elements) {
                allAssignments = allAssignments.concat(this.getAllAssignments(e));
            }
        }
         else
            if (isAssignment(element)) {
                allAssignments.push(element);
            }
        return allAssignments
    }


    private getAllRules(element: AbstractElement): AbstractRule[] {
        var allAbstractRules: AbstractRule[] = [];
        const grammar = getContainerOfType(element.$container, isGrammar);

        if (grammar) {
            allAbstractRules = allAbstractRules.concat(grammar.rules)
        }
        return allAbstractRules
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


