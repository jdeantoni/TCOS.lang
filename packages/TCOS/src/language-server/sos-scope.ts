/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import {
    AstNode,
    AstUtils,
    DefaultScopeProvider, EMPTY_SCOPE, isReference, ReferenceInfo,Scope, ScopeOptions, stream , StreamScope
} from 'langium';


import { AbstractRule, Assignment, CollectionRuleSync, CompositeEventEmission, CrossReference, EventEmission, isAbstractRule, isAlternatives, isAssignment, isCollectionRuleSync, isMemberCall, isParallelEventEmission, isRuleOpening, isRuleSync, isRWRule, isSequentialEventEmission, 
         isSoSSpec, isTemporaryVariable, MemberCall,isCrossReference, isGrammar,
         ParserRule, RuleOpening, RWRule, SoSSpec, TypeReference, VariableDeclaration,
         Alternatives, MethodMember, FieldMember, 
         isParserRule} from './generated/ast.js';
import { getRuleOpeningChain, inferType } from './type-system/infer.js';
import { isParserRuleType, isRuleOpeningType } from './type-system/descriptions.js';
import { AbstractElement } from './generated/ast.js';
import { isGroup } from './generated/ast.js';
import { Group } from './generated/ast.js';
import { getType } from '../utils/sos-utils.js';
import { LangiumServices } from 'langium/lsp';

export class SoSScopeProvider extends DefaultScopeProvider {

    constructor(services: LangiumServices) {
        super(services);
    }

    override getScope(context: ReferenceInfo): Scope {

        if (context.property === 'element') {
            const memberCall = context.container as MemberCall;
            const previous = memberCall.previous;
            if (!previous) {
                const ruleOpeningItem = AstUtils.getContainerOfType(context.container, isRuleOpening);
                
                if (ruleOpeningItem) {
                    return this.scopeRuleOpeningMembers(ruleOpeningItem);
                }
            }
            
            //TODO: should never write a so crappy code ! To be refactored !
            if (isMemberCall(previous) && previous.element !== undefined){
                const collectionRuleSync = AstUtils.getContainerOfType(previous.$container, isCollectionRuleSync);
                if(collectionRuleSync){
                    if((collectionRuleSync.collection as MemberCall).element?.ref){
                        const collectionElemRef = (collectionRuleSync.collection as MemberCall).element?.ref
                        if(collectionElemRef != undefined){
                            const terminal = this.getTerminalFromRef(collectionElemRef);
                            const scope = this.scopeFromCrossReferenceTerminal(terminal, context);
                            if (scope) return scope;
                        }
                    }
                }
                if(isReference(previous.element)){
                    const elemRef = previous.element?.ref
                        if(elemRef != undefined){
                            const terminal = this.getTerminalFromRef(elemRef);
                            const scope = this.scopeFromCrossReferenceTerminal(terminal, context);
                            if (scope) return scope;
                        }
                }
                const ruleOpeningItem = AstUtils.getContainerOfType(previous.$container, isRuleOpening);
                if (ruleOpeningItem) {
                    return this.scopeRuleOpeningMembers(ruleOpeningItem,previous);
                }
                
            }
            const previousType = inferType(previous, new Map());
            if (isRuleOpeningType(previousType)) {
                throw new String("in sos-scope.ts line 54")
            }else if (isParserRuleType(previousType)) {
                //either the rule has been open and then we need the cope of this ruleOpening or not and then only "assigments" have to be considered
                const sosSpecItem: SoSSpec | undefined = AstUtils.getContainerOfType(previous?.$container, isSoSSpec);
                if (sosSpecItem){
                    for(const ro of sosSpecItem.rtdAndRules){
                        if (isRuleOpening(ro)){
                            if (ro.onRule?.$refText === previousType.literal.name){
                                return this.scopeRuleOpeningMembers(ro);
                            }
                        }
                    }
                }
                if(isMemberCall(previous)){
                    const ruleOpeningItem: RuleOpening | undefined = AstUtils.getContainerOfType(previous?.$container, isRuleOpening);

                    if (ruleOpeningItem){
                        return this.scopeParsingRule(previousType.literal, ruleOpeningItem);
                    }
                }
            }
            return EMPTY_SCOPE;
        }
        return super.getScope(context);
    }

    private getTerminalFromRef(ref: AstNode): AbstractElement | undefined {
        const asAssignment = ref as unknown as Assignment;
        if (isAssignment(asAssignment)) {
            return (ref as unknown as Assignment).terminal;
        }
        return undefined;
    }

    private scopeFromCrossReferenceTerminal(terminal: unknown, context: ReferenceInfo): Scope | undefined {
        if (isCrossReference(terminal as unknown)) {
            const crossRef = terminal as CrossReference;
            if (isParserRule(crossRef.type.ref)) {
                const parserRuleItem = crossRef.type.ref as ParserRule;
                const sosSpec = AstUtils.getContainerOfType(context.container, isSoSSpec);
                if (sosSpec) {
                    for (const ro of sosSpec.rtdAndRules) {
                        if (isRuleOpening(ro)) {
                            if (ro.onRule?.ref?.name === parserRuleItem.name) {
                                return this.scopeParsingRule(parserRuleItem, ro);
                            }
                        }
                    }
                    // should only take assignment as a variant of scopeParsingRule
                }
            }
        }
        return undefined;
    }

    private scopeParsingRule(parserRuleItem: ParserRule, ruleOpeningItem: RuleOpening, initialMembers: AstNode[] = []): Scope {
        let allScopeElements: AstNode[] = (parserRuleItem !== undefined)?this.getAllAssignments(parserRuleItem.definition) : [];
        allScopeElements = allScopeElements.concat(initialMembers)
        this.addListFunctions(ruleOpeningItem, allScopeElements);
        allScopeElements = allScopeElements.concat(this.addClocks(ruleOpeningItem))
        allScopeElements = allScopeElements.concat(this.getAllTemporaryVariable(ruleOpeningItem))
        allScopeElements = allScopeElements.concat(this.getAllRuntimeState(ruleOpeningItem))
        return this.createScopeForNodes(allScopeElements);
    }

    private addListFunctions(ruleOpeningItem: RuleOpening, allScopeElements: AstNode[], context: MemberCall | undefined = undefined) {
        const contextType = context ? getType(context) : undefined;
        const ruleRef = (isAbstractRule(contextType) ? contextType : undefined);
        const refText = (isAbstractRule(contextType) ? contextType.name : 'undefined');

        const at = this.makeMethodMember("at", ruleOpeningItem);
        at.parameters.push({ $container: at, $type: 'Parameter', name: 'i' });
        if (contextType) {
            at.returnType = { reference: { ref: ruleRef, $refText: refText }, $container: at, $type: "TypeReference" };
        }
        allScopeElements.push(at);

        const length = this.makeMethodMember("length", ruleOpeningItem);
        if (contextType) {
            length.returnType = { $container: length, $type: "TypeReference" };
            length.returnType.primitive = { name: "integer", $container: length.returnType, $type: 'SoSPrimitiveType' };
        }
        allScopeElements.push(length);

        for (const name of ["first", "last", "allReaders"] as const) {
            const method = this.makeMethodMember(name, ruleOpeningItem);
            if (contextType) {
                method.returnType = { reference: { ref: ruleRef, $refText: refText }, $container: method, $type: "TypeReference" };
            }
            allScopeElements.push(method);
        }
    }

    private makeMethodMember(name: string, ruleOpeningItem: RuleOpening): MethodMember {
        return {
            name,
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
        };
    }

    private scopeRuleOpeningMembers(ruleOpeningItem: RuleOpening, context: MemberCall | undefined = undefined, initialMembers:AstNode[] = []): Scope {
        
        let allScopeElements: AstNode[] = (ruleOpeningItem.onRule?.ref !== undefined)?this.getAllAssignments(ruleOpeningItem.onRule.ref.definition) : [];
        allScopeElements = allScopeElements.concat(initialMembers)
        allScopeElements = allScopeElements.concat((ruleOpeningItem.onRule?.ref !== undefined)?this.getAllRules(ruleOpeningItem.onRule.ref.definition):[])        

        let allMembers: AstNode[] = []
        if (context && context.element && context.element.ref && isAssignment(context.element.ref) 
            && isCrossReference((context.element.ref as unknown as Assignment).terminal)){
            const parserRule = ((context.element.ref as unknown as Assignment).terminal as CrossReference).type.ref
            const sosSpec =  AstUtils.getContainerOfType(ruleOpeningItem?.$container, isSoSSpec);
            let contextRuleOpeningItem = undefined
            if (sosSpec){
                for(const rule of sosSpec?.rtdAndRules){
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
            if(context && isReference(context.element)){
                if (ruleOpeningItem && context.element.ref && context.element.ref.$type.toString() == "Assignment" && ((context.element.ref as unknown as  Assignment).terminal as CrossReference).type){
                    const parserRuleItem = ((context.element.ref as unknown as  Assignment).terminal as CrossReference).type.ref as ParserRule
                    if(parserRuleItem){
                        const allScopeElements: AstNode[] = (parserRuleItem !== undefined)?this.getAllAssignments(parserRuleItem.definition) : [];
                        allMembers = allMembers.concat(allScopeElements)
                    }
                }
            }         
        }

        for(const rule of ruleOpeningItem.rules){
            if(isRWRule(rule)){
                /**
                 * TODO: add temporary variable in scope with recursive call
                 */
                for(const expr of AstUtils.streamAllContents((rule as RWRule).premise.eventExpression)){
                    if(isTemporaryVariable(expr)){
                        allMembers.push(expr)
                    }
                }
            }
        }

        allScopeElements = allMembers.concat(allScopeElements)
        for(const rule of ruleOpeningItem.rules){
            if(rule){
                if(isRWRule(rule)){
                    allScopeElements.push(rule)
                }
            }
            
        }

        allScopeElements = allScopeElements.concat(this.addClocks(ruleOpeningItem))
        allScopeElements = allScopeElements.concat(this.getAllTemporaryVariable(ruleOpeningItem))
        this.addListFunctions(ruleOpeningItem,allScopeElements,context)

        for(const variable of ruleOpeningItem.runtimeState){
            if ((variable as VariableDeclaration).type?.primitive?.name == "Timer"){
                const starts: FieldMember = this.makeFieldMember("starts", ruleOpeningItem);
                starts.type = {
                    $container: starts,
                    $type: 'TypeReference',
                };
                starts.type.primitive = { name: 'event', $container: starts.type, $type: 'SoSPrimitiveType' };
                const terminates: FieldMember = this.makeFieldMember("terminates", ruleOpeningItem);
                terminates.type = {
                    $container: terminates,
                    $type: 'TypeReference',
                };
                // TODO: starts.type? its not terminates.type 
                terminates.type.primitive = { name: 'event', $container: starts.type, $type: 'SoSPrimitiveType' };
                
                allScopeElements.push(starts);
                allScopeElements.push(terminates);
            }
        }

        return this.createScopeForNodes(allScopeElements);
    }

    private makeFieldMember(name: string, ruleOpeningItem: RuleOpening): FieldMember{
        return {
            $container: ruleOpeningItem,
            $type: 'FieldMember',
            name,
            $cstNode: ruleOpeningItem.$cstNode,
            $containerProperty: "clocks",
            type:{} as TypeReference
        };
    }
    
    private addClocks(ruleOpeningItem: RuleOpening): AstNode[] {
        const res : AstNode[] =[]
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

    private flattenAllEmissions(ce: CompositeEventEmission): EventEmission[] {
        if (isParallelEventEmission(ce) || isSequentialEventEmission(ce)) {
            return [ce.lefteventemission, ...this.flattenAllEmissions(ce.righteventemission)];
        }
        return [ce as EventEmission];
    }

    private getAllTemporaryVariable(ruleOpeningItem: RuleOpening): AstNode[] {
        const alltempVars: AstNode[] = [];
        ruleOpeningItem.rules.forEach(rule => {
            if (isRWRule(rule) && (rule as RWRule)?.conclusion !== undefined){
                const composite = (rule as RWRule)?.conclusion?.eventemissions;
                if (composite) {
                    for (const emission of this.flattenAllEmissions(composite)) {
                        if (isRuleSync(emission)) {
                            if (isCollectionRuleSync(emission)) {
                                if (isTemporaryVariable((emission as CollectionRuleSync).varDecl)) {
                                    alltempVars.push((emission as CollectionRuleSync).varDecl);
                                }
                            }
                        }
                    }
                }
            }
        });
        return alltempVars
    }

    private getAllRuntimeState(ruleOpeningItem: RuleOpening): AstNode[] {
        const allVars: AstNode[] = [];
        ruleOpeningItem.runtimeState.forEach(v => allVars.push(v));
        return allVars
    }

    private getAllAssignments(element: AbstractElement): Assignment[] {
        let allAssignments: Assignment[] = [];

        if (isGroup(element)) {
            for (const e of (element as Group).elements) {
                allAssignments = allAssignments.concat(this.getAllAssignments(e));
            }
        } else if (isAlternatives(element)) {
            for (const e of (element as Alternatives).elements) {
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
        let allAbstractRules: AbstractRule[] = [];
        const grammar = AstUtils.getContainerOfType(element.$container, isGrammar);

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
            let name
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