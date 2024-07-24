
import fs from 'fs';
import { AstNode, Reference, isReference, streamAst } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, NodeType,Hole, TimerHole,CollectionHole} from "../../ccfg/ccfglib.js";
import { Model,Bloc,ParallelBloc,Variable,VarRef,If,Assignment,Conjunction,Plus,BooleanConst,While,PeriodicBloc,FunctionCall,FunctionDef } from "../../language-server/generated/ast.js";

var debug = false

export interface CompilerFrontEnd {

    createLocalCCFG(node: AstNode| Reference<AstNode>): CCFG;
    
     createModelLocalCCFG(node: Model): CCFG;
     createBlocLocalCCFG(node: Bloc): CCFG;
     createParallelBlocLocalCCFG(node: ParallelBloc): CCFG;
     createVariableLocalCCFG(node: Variable): CCFG;
     createVarRefLocalCCFG(node: VarRef): CCFG;
     createIfLocalCCFG(node: If): CCFG;
     createAssignmentLocalCCFG(node: Assignment): CCFG;
     createConjunctionLocalCCFG(node: Conjunction): CCFG;
     createPlusLocalCCFG(node: Plus): CCFG;
     createBooleanConstLocalCCFG(node: BooleanConst): CCFG;
     createWhileLocalCCFG(node: While): CCFG;
     createPeriodicBlocLocalCCFG(node: PeriodicBloc): CCFG;
     createFunctionCallLocalCCFG(node: FunctionCall): CCFG;
     createFunctionDefLocalCCFG(node: FunctionDef): CCFG;

    generateCCFG(node: AstNode): CCFG;
    
}

export class TestSimpleLCompilerFrontEnd implements CompilerFrontEnd {
    constructor(debugMode: boolean = false){ 
        debug = debugMode
    }

    globalCCFG: CCFG = new CCFG();

  
    createLocalCCFG(node: AstNode | Reference<AstNode>): CCFG {
        if(isReference(node)){
            if(node.ref === undefined){
                throw new Error("not possible to visit an undefined AstNode")
            }
            node = node.ref
        }
        if(node.$type == "Model"){
            return this.createModelLocalCCFG(node as Model);
        }
        if(node.$type == "Bloc"){
            return this.createBlocLocalCCFG(node as Bloc);
        }
        if(node.$type == "ParallelBloc"){
            return this.createParallelBlocLocalCCFG(node as ParallelBloc);
        }
        if(node.$type == "Variable"){
            return this.createVariableLocalCCFG(node as Variable);
        }
        if(node.$type == "VarRef"){
            return this.createVarRefLocalCCFG(node as VarRef);
        }
        if(node.$type == "If"){
            return this.createIfLocalCCFG(node as If);
        }
        if(node.$type == "Assignment"){
            return this.createAssignmentLocalCCFG(node as Assignment);
        }
        if(node.$type == "Conjunction"){
            return this.createConjunctionLocalCCFG(node as Conjunction);
        }
        if(node.$type == "Plus"){
            return this.createPlusLocalCCFG(node as Plus);
        }
        if(node.$type == "BooleanConst"){
            return this.createBooleanConstLocalCCFG(node as BooleanConst);
        }
        if(node.$type == "While"){
            return this.createWhileLocalCCFG(node as While);
        }
        if(node.$type == "PeriodicBloc"){
            return this.createPeriodicBlocLocalCCFG(node as PeriodicBloc);
        }
        if(node.$type == "FunctionCall"){
            return this.createFunctionCallLocalCCFG(node as FunctionCall);
        }
        if(node.$type == "FunctionDef"){
            return this.createFunctionDefLocalCCFG(node as FunctionDef);
        }  
        throw new Error("Not implemented: " + node.$type);
    }
    
// rule statementsInOrder1
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishModel
   //premise: statements:Statement[],last():Statement,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Model node
     * @param a Model node 
     * @returns the local CCFG (with holes)
     */
    createModelLocalCCFG(node: Model): CCFG {
        let localCCFG = new CCFG()
        let startsModelNode: Node = new Step(node,NodeType.starts,[])
        if(startsModelNode.functionsDefs.length>0){
            startsModelNode.returnType = "void"
        }
        startsModelNode.functionsNames = [`init${startsModelNode.uid}Model`]
        localCCFG.addNode(startsModelNode)
        localCCFG.initialState = startsModelNode
        let terminatesModelNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesModelNode)
        
        let statementsHole: CollectionHole = new CollectionHole(node.statements)
        statementsHole.isSequential = true
        statementsHole.parallelSyncPolicy = "undefined"
        localCCFG.addNode(statementsHole)
        
        startsModelNode.returnType = "void"
        startsModelNode.functionsNames = [`${startsModelNode.uid}statementsInOrder1`] //overwrite existing name
        startsModelNode.functionsDefs =[...startsModelNode.functionsDefs, ...[]] //GG
                //mark 1.5
        localCCFG.addEdge(startsModelNode,statementsHole)
        
        statementsHole.returnType = "void"
        statementsHole.functionsNames = [`${statementsHole.uid}finishModel`] //overwrite existing name
        statementsHole.functionsDefs =[...statementsHole.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(statementsHole,terminatesModelNode)
        
        return localCCFG;
    }
// rule startsBloc
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishBloc
   //premise: statements:Statement[],last():Statement,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Bloc node
     * @param a Bloc node 
     * @returns the local CCFG (with holes)
     */
    createBlocLocalCCFG(node: Bloc): CCFG {
        let localCCFG = new CCFG()
        let startsBlocNode: Node = new Step(node,NodeType.starts,[])
        if(startsBlocNode.functionsDefs.length>0){
            startsBlocNode.returnType = "void"
        }
        startsBlocNode.functionsNames = [`init${startsBlocNode.uid}Bloc`]
        localCCFG.addNode(startsBlocNode)
        localCCFG.initialState = startsBlocNode
        let terminatesBlocNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesBlocNode)
        
        let statementsHole: CollectionHole = new CollectionHole(node.statements)
        statementsHole.isSequential = true
        statementsHole.parallelSyncPolicy = "undefined"
        localCCFG.addNode(statementsHole)
        
        startsBlocNode.returnType = "void"
        startsBlocNode.functionsNames = [`${startsBlocNode.uid}startsBloc`] //overwrite existing name
        startsBlocNode.functionsDefs =[...startsBlocNode.functionsDefs, ...[]] //GG
                //mark 1.5
        localCCFG.addEdge(startsBlocNode,statementsHole)
        
        statementsHole.returnType = "void"
        statementsHole.functionsNames = [`${statementsHole.uid}finishBloc`] //overwrite existing name
        statementsHole.functionsDefs =[...statementsHole.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(statementsHole,terminatesBlocNode)
        
        return localCCFG;
    }
// rule startsParallelBloc
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishParallelBloc
   //premise: statements:Statement[],terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the ParallelBloc node
     * @param a ParallelBloc node 
     * @returns the local CCFG (with holes)
     */
    createParallelBlocLocalCCFG(node: ParallelBloc): CCFG {
        let localCCFG = new CCFG()
        let startsParallelBlocNode: Node = new Step(node,NodeType.starts,[])
        if(startsParallelBlocNode.functionsDefs.length>0){
            startsParallelBlocNode.returnType = "void"
        }
        startsParallelBlocNode.functionsNames = [`init${startsParallelBlocNode.uid}ParallelBloc`]
        localCCFG.addNode(startsParallelBlocNode)
        localCCFG.initialState = startsParallelBlocNode
        let terminatesParallelBlocNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesParallelBlocNode)
        
        let statementsHole: CollectionHole = new CollectionHole(node.statements)
        statementsHole.isSequential = false
        statementsHole.parallelSyncPolicy = "lastOf"
        localCCFG.addNode(statementsHole)
        
        startsParallelBlocNode.returnType = "void"
        startsParallelBlocNode.functionsNames = [`${startsParallelBlocNode.uid}startsParallelBloc`] //overwrite existing name
        startsParallelBlocNode.functionsDefs =[...startsParallelBlocNode.functionsDefs, ...[]] //GG
                //mark 1.5
        localCCFG.addEdge(startsParallelBlocNode,statementsHole)
        
        statementsHole.returnType = "void"
        statementsHole.functionsNames = [`${statementsHole.uid}finishParallelBloc`] //overwrite existing name
        statementsHole.functionsDefs =[...statementsHole.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(statementsHole,terminatesParallelBlocNode)
        
        return localCCFG;
    }
// rule initializeVar
   //premise: starts:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Variable node
     * @param a Variable node 
     * @returns the local CCFG (with holes)
     */
    createVariableLocalCCFG(node: Variable): CCFG {
        let localCCFG = new CCFG()
        let startsVariableNode: Node = new Step(node,NodeType.starts,[`createGlobalVar,int,${this.getASTNodeUID(node)}currentValue`])
        if(startsVariableNode.functionsDefs.length>0){
            startsVariableNode.returnType = "void"
        }
        startsVariableNode.functionsNames = [`init${startsVariableNode.uid}Variable`]
        localCCFG.addNode(startsVariableNode)
        localCCFG.initialState = startsVariableNode
        let terminatesVariableNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesVariableNode)
        
        {
        let initializeVarStateModificationNode: Node = new Step(node)
        localCCFG.addNode(initializeVarStateModificationNode)
        let e = localCCFG.addEdge(startsVariableNode,initializeVarStateModificationNode)
        startsVariableNode = initializeVarStateModificationNode
        }
    
        startsVariableNode.returnType = "void"
        startsVariableNode.functionsNames = [`${startsVariableNode.uid}initializeVar`] //overwrite existing name
        startsVariableNode.functionsDefs =[...startsVariableNode.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(startsVariableNode,terminatesVariableNode)
        
        return localCCFG;
    }
// rule accessVarRef
   //premise: starts:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the VarRef node
     * @param a VarRef node 
     * @returns the local CCFG (with holes)
     */
    createVarRefLocalCCFG(node: VarRef): CCFG {
        let localCCFG = new CCFG()
        let startsVarRefNode: Node = new Step(node,NodeType.starts,[])
        if(startsVarRefNode.functionsDefs.length>0){
            startsVarRefNode.returnType = "void"
        }
        startsVarRefNode.functionsNames = [`init${startsVarRefNode.uid}VarRef`]
        localCCFG.addNode(startsVarRefNode)
        localCCFG.initialState = startsVarRefNode
        let terminatesVarRefNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesVarRefNode)
        
        startsVarRefNode.returnType = "int"
        startsVarRefNode.functionsNames = [`${startsVarRefNode.uid}accessVarRef`] //overwrite existing name
        startsVarRefNode.functionsDefs =[...startsVarRefNode.functionsDefs, ...[`lock,variableMutex`,`createVar,int,${this.getASTNodeUID(node)}1583`,`setVarFromGlobal,int,${this.getASTNodeUID(node)}1583,${this.getASTNodeUID(node.theVar)}currentValue`,`createVar,int,${this.getASTNodeUID(node)}terminates`,`assignVar,${this.getASTNodeUID(node)}terminates,${this.getASTNodeUID(node)}1583`,`return,${this.getASTNodeUID(node)}terminates`]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(startsVarRefNode,terminatesVarRefNode)
        
        return localCCFG;
    }
// rule condStart
   //premise: starts:event
   //conclusion: cond:VarRef,starts:event
// rule condTrueStart
   //premise: cond:VarRef,terminates:event
   //conclusion: then:Bloc,starts:event
// rule condFalseStart
   //premise: cond:VarRef,terminates:event
   //conclusion: else:Bloc,starts:event
// rule condStop
   //premise: else:Bloc,terminates:event
	//then:Bloc,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the If node
     * @param a If node 
     * @returns the local CCFG (with holes)
     */
    createIfLocalCCFG(node: If): CCFG {
        let localCCFG = new CCFG()
        let startsIfNode: Node = new Step(node,NodeType.starts,[])
        if(startsIfNode.functionsDefs.length>0){
            startsIfNode.returnType = "void"
        }
        startsIfNode.functionsNames = [`init${startsIfNode.uid}If`]
        localCCFG.addNode(startsIfNode)
        localCCFG.initialState = startsIfNode
        let terminatesIfNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesIfNode)
        
        let condHole: Hole = new Hole(node.cond)
        localCCFG.addNode(condHole)
        
        let thenHole: Hole = new Hole(node.then)
        localCCFG.addNode(thenHole)
        
        let elseHole: Hole = new Hole(node.else)
        localCCFG.addNode(elseHole)
        
        startsIfNode.returnType = "void"
        startsIfNode.functionsNames = [`${startsIfNode.uid}condStart`] //overwrite existing name
        startsIfNode.functionsDefs =[...startsIfNode.functionsDefs, ...[]] //GG
                //mark 0
        localCCFG.addEdge(startsIfNode,condHole)
            
        condHole.returnType = "void"
        condHole.functionsNames = [`${condHole.uid}condTrueStart`] //overwrite existing name
        condHole.functionsDefs =[...condHole.functionsDefs, ...[]] //GG
                //mark 0
        localCCFG.addEdge(condHole,thenHole)
            
        condHole.returnType = "void"
        condHole.functionsNames = [`${condHole.uid}condFalseStart`] //overwrite existing name
        condHole.functionsDefs =[...condHole.functionsDefs, ...[]] //GG
                //mark 0
        localCCFG.addEdge(condHole,elseHole)
            
        let condStopOrJoinNode: Node = new OrJoin(node)
        localCCFG.addNode(condStopOrJoinNode)
                             //mark a
        localCCFG.addEdge(elseHole,condStopOrJoinNode)
                                         //mark a
        localCCFG.addEdge(thenHole,condStopOrJoinNode)
                            
        condStopOrJoinNode.returnType = "void"
        condStopOrJoinNode.functionsNames = [`${condStopOrJoinNode.uid}condStop`] //overwrite existing name
        condStopOrJoinNode.functionsDefs =[...condStopOrJoinNode.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(condStopOrJoinNode,terminatesIfNode)
        
        return localCCFG;
    }
// rule executeAssignment
   //premise: starts:event
   //conclusion: expr:Expr,starts:event
// rule executeAssignment2
   //premise: expr:Expr,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Assignment node
     * @param a Assignment node 
     * @returns the local CCFG (with holes)
     */
    createAssignmentLocalCCFG(node: Assignment): CCFG {
        let localCCFG = new CCFG()
        let startsAssignmentNode: Node = new Step(node,NodeType.starts,[])
        if(startsAssignmentNode.functionsDefs.length>0){
            startsAssignmentNode.returnType = "void"
        }
        startsAssignmentNode.functionsNames = [`init${startsAssignmentNode.uid}Assignment`]
        localCCFG.addNode(startsAssignmentNode)
        localCCFG.initialState = startsAssignmentNode
        let terminatesAssignmentNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesAssignmentNode)
        
        let exprHole: Hole = new Hole(node.expr)
        localCCFG.addNode(exprHole)
        
        startsAssignmentNode.returnType = "void"
        startsAssignmentNode.functionsNames = [`${startsAssignmentNode.uid}executeAssignment`] //overwrite existing name
        startsAssignmentNode.functionsDefs =[...startsAssignmentNode.functionsDefs, ...[]] //GG
                //mark 0
        localCCFG.addEdge(startsAssignmentNode,exprHole)
            
        {
        let executeAssignment2StateModificationNode: Node = new Step(node)
        localCCFG.addNode(executeAssignment2StateModificationNode)
        let e = localCCFG.addEdge(exprHole,executeAssignment2StateModificationNode)
        exprHole = executeAssignment2StateModificationNode
        }
    
        exprHole.returnType = "void"
        exprHole.functionsNames = [`${exprHole.uid}executeAssignment2`] //overwrite existing name
        exprHole.functionsDefs =[...exprHole.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(exprHole,terminatesAssignmentNode)
        
        return localCCFG;
    }
// rule evaluateConjunction
   //premise: starts:event
   //conclusion: lhs:BooleanExpression,starts:event
	//rhs:BooleanExpression,starts:event
// rule evaluateConjunction2
   //premise: lhs:BooleanExpression,terminates:event
   //conclusion: terminates:event
// rule evaluateConjunction3
   //premise: rhs:BooleanExpression,terminates:event
   //conclusion: terminates:event
// rule evaluateConjunction4
   //premise: lhs:BooleanExpression,terminates:event
	//rhs:BooleanExpression,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Conjunction node
     * @param a Conjunction node 
     * @returns the local CCFG (with holes)
     */
    createConjunctionLocalCCFG(node: Conjunction): CCFG {
        let localCCFG = new CCFG()
        let startsConjunctionNode: Node = new Step(node,NodeType.starts,[])
        if(startsConjunctionNode.functionsDefs.length>0){
            startsConjunctionNode.returnType = "void"
        }
        startsConjunctionNode.functionsNames = [`init${startsConjunctionNode.uid}Conjunction`]
        localCCFG.addNode(startsConjunctionNode)
        localCCFG.initialState = startsConjunctionNode
        let terminatesConjunctionNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesConjunctionNode)
        
        let lhsHole: Hole = new Hole(node.lhs)
        localCCFG.addNode(lhsHole)
        
        let rhsHole: Hole = new Hole(node.rhs)
        localCCFG.addNode(rhsHole)
        
        startsConjunctionNode.returnType = "void"
        startsConjunctionNode.functionsNames = [`${startsConjunctionNode.uid}evaluateConjunction`] //overwrite existing name
        startsConjunctionNode.functionsDefs =[...startsConjunctionNode.functionsDefs, ...[]] //GG
    
        let forkevaluateConjunctionNode: Node = new Fork(node)
        localCCFG.addNode(forkevaluateConjunctionNode)
        localCCFG.addEdge(startsConjunctionNode,forkevaluateConjunctionNode)
            
                    //mark 3
        localCCFG.addEdge(forkevaluateConjunctionNode,lhsHole)
                                        //mark 3
        localCCFG.addEdge(forkevaluateConjunctionNode,rhsHole)
                    
        lhsHole.returnType = "bool"
        lhsHole.functionsNames = [`${lhsHole.uid}evaluateConjunction2`] //overwrite existing name
        lhsHole.functionsDefs =[...lhsHole.functionsDefs, ...[`createVar,bool,${this.getASTNodeUID(node)}terminates`,`assignVar,${this.getASTNodeUID(node)}terminates,false`,`return,${this.getASTNodeUID(node)}terminates`,]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(lhsHole,terminatesConjunctionNode)
        
        rhsHole.returnType = "bool"
        rhsHole.functionsNames = [`${rhsHole.uid}evaluateConjunction3`] //overwrite existing name
        rhsHole.functionsDefs =[...rhsHole.functionsDefs, ...[`createVar,bool,${this.getASTNodeUID(node)}terminates`,`assignVar,${this.getASTNodeUID(node)}terminates,false`,`return,${this.getASTNodeUID(node)}terminates`,]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(rhsHole,terminatesConjunctionNode)
        
        let evaluateConjunction4OrJoinNode: Node = new OrJoin(node)
        localCCFG.addNode(evaluateConjunction4OrJoinNode)
                             //mark a
        localCCFG.addEdge(lhsHole,evaluateConjunction4OrJoinNode)
                                         //mark a
        localCCFG.addEdge(rhsHole,evaluateConjunction4OrJoinNode)
                            
        evaluateConjunction4OrJoinNode.returnType = "bool"
        evaluateConjunction4OrJoinNode.functionsNames = [`${evaluateConjunction4OrJoinNode.uid}evaluateConjunction4`] //overwrite existing name
        evaluateConjunction4OrJoinNode.functionsDefs =[...evaluateConjunction4OrJoinNode.functionsDefs, ...[`createVar,bool,${this.getASTNodeUID(node)}terminates`,`assignVar,${this.getASTNodeUID(node)}terminates,true`,`return,${this.getASTNodeUID(node)}terminates`,]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(evaluateConjunction4OrJoinNode,terminatesConjunctionNode)
        
        return localCCFG;
    }
// rule startPlus
   //premise: starts:event
   //conclusion: right:Expr,starts:event
	//left:Expr,starts:event
// rule finishPlus
   //premise: right:Expr,terminates:event
	//left:Expr,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Plus node
     * @param a Plus node 
     * @returns the local CCFG (with holes)
     */
    createPlusLocalCCFG(node: Plus): CCFG {
        let localCCFG = new CCFG()
        let startsPlusNode: Node = new Step(node,NodeType.starts,[])
        if(startsPlusNode.functionsDefs.length>0){
            startsPlusNode.returnType = "void"
        }
        startsPlusNode.functionsNames = [`init${startsPlusNode.uid}Plus`]
        localCCFG.addNode(startsPlusNode)
        localCCFG.initialState = startsPlusNode
        let terminatesPlusNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesPlusNode)
        
        let rightHole: Hole = new Hole(node.right)
        localCCFG.addNode(rightHole)
        
        let leftHole: Hole = new Hole(node.left)
        localCCFG.addNode(leftHole)
        
        startsPlusNode.returnType = "void"
        startsPlusNode.functionsNames = [`${startsPlusNode.uid}startPlus`] //overwrite existing name
        startsPlusNode.functionsDefs =[...startsPlusNode.functionsDefs, ...[]] //GG
    
        let forkstartPlusNode: Node = new Fork(node)
        localCCFG.addNode(forkstartPlusNode)
        localCCFG.addEdge(startsPlusNode,forkstartPlusNode)
            
                    //mark 3
        localCCFG.addEdge(forkstartPlusNode,rightHole)
                                        //mark 3
        localCCFG.addEdge(forkstartPlusNode,leftHole)
                    
        let finishPlusOrJoinNode: Node = new OrJoin(node)
        localCCFG.addNode(finishPlusOrJoinNode)
                             //mark a
        localCCFG.addEdge(rightHole,finishPlusOrJoinNode)
                                         //mark a
        localCCFG.addEdge(leftHole,finishPlusOrJoinNode)
                            
        finishPlusOrJoinNode.returnType = "int"
        finishPlusOrJoinNode.functionsNames = [`${finishPlusOrJoinNode.uid}finishPlus`] //overwrite existing name
        finishPlusOrJoinNode.functionsDefs =[...finishPlusOrJoinNode.functionsDefs, ...[`createVar,int,${this.getASTNodeUID(node)}4387`,`assignVar,${this.getASTNodeUID(node)}4387,n1`,`createVar,int,${this.getASTNodeUID(node)}4392`,`assignVar,${this.getASTNodeUID(node)}4392,n2`,`createVar,${this.getASTNodeUID(node)}4386`,`operation,${this.getASTNodeUID(node)}4386,${this.getASTNodeUID(node)}4387,+,${this.getASTNodeUID(node)}4392`,`createVar,int,${this.getASTNodeUID(node)}terminates`,`assignVar,${this.getASTNodeUID(node)}terminates,${this.getASTNodeUID(node)}4386`,`return,${this.getASTNodeUID(node)}terminates`]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(finishPlusOrJoinNode,terminatesPlusNode)
        
        return localCCFG;
    }
// rule evalBooleanConst
   //premise: starts:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the BooleanConst node
     * @param a BooleanConst node 
     * @returns the local CCFG (with holes)
     */
    createBooleanConstLocalCCFG(node: BooleanConst): CCFG {
        let localCCFG = new CCFG()
        let startsBooleanConstNode: Node = new Step(node,NodeType.starts,[`createGlobalVar,bool${node.value},${this.getASTNodeUID(node)}constantValue`])
        if(startsBooleanConstNode.functionsDefs.length>0){
            startsBooleanConstNode.returnType = "void"
        }
        startsBooleanConstNode.functionsNames = [`init${startsBooleanConstNode.uid}BooleanConst`]
        localCCFG.addNode(startsBooleanConstNode)
        localCCFG.initialState = startsBooleanConstNode
        let terminatesBooleanConstNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesBooleanConstNode)
        
        startsBooleanConstNode.returnType = "bool"
        startsBooleanConstNode.functionsNames = [`${startsBooleanConstNode.uid}evalBooleanConst`] //overwrite existing name
        startsBooleanConstNode.functionsDefs =[...startsBooleanConstNode.functionsDefs, ...[`lock,variableMutex`,`createVar,bool,${this.getASTNodeUID(node)}4606`,`setVarFromGlobal,bool,${this.getASTNodeUID(node)}4606,${this.getASTNodeUID(node)}constantValue`,`createVar,bool,${this.getASTNodeUID(node)}terminates`,`assignVar,${this.getASTNodeUID(node)}terminates,${this.getASTNodeUID(node)}4606`,`return,${this.getASTNodeUID(node)}terminates`]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(startsBooleanConstNode,terminatesBooleanConstNode)
        
        return localCCFG;
    }
// rule whileStart
   //premise: starts:event
   //conclusion: cond:VarRef,starts:event
// rule whileBodyStart
   //premise: cond:VarRef,terminates:event
   //conclusion: body:Bloc,starts:event
// rule whileBodyEnd
   //premise: body:Bloc,terminates:event
   //conclusion: cond:VarRef,starts:event
// rule whileEnd
   //premise: cond:VarRef,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the While node
     * @param a While node 
     * @returns the local CCFG (with holes)
     */
    createWhileLocalCCFG(node: While): CCFG {
        let localCCFG = new CCFG()
        let startsWhileNode: Node = new Step(node,NodeType.starts,[])
        if(startsWhileNode.functionsDefs.length>0){
            startsWhileNode.returnType = "void"
        }
        startsWhileNode.functionsNames = [`init${startsWhileNode.uid}While`]
        localCCFG.addNode(startsWhileNode)
        localCCFG.initialState = startsWhileNode
        let terminatesWhileNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesWhileNode)
        
        let condHole: Hole = new Hole(node.cond)
        localCCFG.addNode(condHole)
        
        let bodyHole: Hole = new Hole(node.body)
        localCCFG.addNode(bodyHole)
        
        startsWhileNode.returnType = "void"
        startsWhileNode.functionsNames = [`${startsWhileNode.uid}whileStart`] //overwrite existing name
        startsWhileNode.functionsDefs =[...startsWhileNode.functionsDefs, ...[]] //GG
                //mark 0
        localCCFG.addEdge(startsWhileNode,condHole)
            
        condHole.returnType = "void"
        condHole.functionsNames = [`${condHole.uid}whileBodyStart`] //overwrite existing name
        condHole.functionsDefs =[...condHole.functionsDefs, ...[]] //GG
                //mark 0
        localCCFG.addEdge(condHole,bodyHole)
            
        bodyHole.returnType = "void"
        bodyHole.functionsNames = [`${bodyHole.uid}whileBodyEnd`] //overwrite existing name
        bodyHole.functionsDefs =[...bodyHole.functionsDefs, ...[]] //GG
                //mark 0
        localCCFG.addEdge(bodyHole,condHole)
            
        condHole.returnType = "void"
        condHole.functionsNames = [`${condHole.uid}whileEnd`] //overwrite existing name
        condHole.functionsDefs =[...condHole.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(condHole,terminatesWhileNode)
        
        return localCCFG;
    }
// rule periodicStart
   //premise: starts:event
   //conclusion: blocTrigger:Timer,starts:event
// rule periodicBodyStart
   //premise: blocTrigger:Timer,terminates:event
   //conclusion: bloc:Bloc,starts:event
	//blocTrigger:Timer,starts:event

    /**
     * returns the local CCFG of the PeriodicBloc node
     * @param a PeriodicBloc node 
     * @returns the local CCFG (with holes)
     */
    createPeriodicBlocLocalCCFG(node: PeriodicBloc): CCFG {
        let localCCFG = new CCFG()
        let startsPeriodicBlocNode: Node = new Step(node,NodeType.starts,[`createGlobalVar,int${node.time},${this.getASTNodeUID(node)}blocTrigger`])
        if(startsPeriodicBlocNode.functionsDefs.length>0){
            startsPeriodicBlocNode.returnType = "void"
        }
        startsPeriodicBlocNode.functionsNames = [`init${startsPeriodicBlocNode.uid}PeriodicBloc`]
        localCCFG.addNode(startsPeriodicBlocNode)
        localCCFG.initialState = startsPeriodicBlocNode
        let terminatesPeriodicBlocNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesPeriodicBlocNode)
        
        let blocTriggerHole: Hole = new TimerHole(node,node.time) //timer hole to ease specific filling
        localCCFG.addNode(blocTriggerHole)
        
        let blocHole: Hole = new Hole(node.bloc)
        localCCFG.addNode(blocHole)
        
        startsPeriodicBlocNode.returnType = "void"
        startsPeriodicBlocNode.functionsNames = [`${startsPeriodicBlocNode.uid}periodicStart`] //overwrite existing name
        startsPeriodicBlocNode.functionsDefs =[...startsPeriodicBlocNode.functionsDefs, ...[]] //GG
                //mark 0
        localCCFG.addEdge(startsPeriodicBlocNode,blocTriggerHole)
            
        blocTriggerHole.returnType = "void"
        blocTriggerHole.functionsNames = [`${blocTriggerHole.uid}periodicBodyStart`] //overwrite existing name
        blocTriggerHole.functionsDefs =[...blocTriggerHole.functionsDefs, ...[]] //GG
    
        let forkperiodicBodyStartNode: Node = new Fork(node)
        localCCFG.addNode(forkperiodicBodyStartNode)
        localCCFG.addEdge(blocTriggerHole,forkperiodicBodyStartNode)
            
                    //mark 3
        localCCFG.addEdge(forkperiodicBodyStartNode,blocHole)
                                        //mark 3
        localCCFG.addEdge(forkperiodicBodyStartNode,blocTriggerHole)
                    
        return localCCFG;
    }
// rule functionCallArgsStart
   //premise: starts:event
   //conclusion: args:Expr[],a:unknown,starts:event
// rule functionCallStarts
   //premise: args:Expr[],last():Expr,terminates:event
   //conclusion: theFunction:[FunctionDef:ID],starts:event
// rule functionCallEnd
   //premise: theFunction:[FunctionDef:ID],terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the FunctionCall node
     * @param a FunctionCall node 
     * @returns the local CCFG (with holes)
     */
    createFunctionCallLocalCCFG(node: FunctionCall): CCFG {
        let localCCFG = new CCFG()
        let startsFunctionCallNode: Node = new Step(node,NodeType.starts,[])
        if(startsFunctionCallNode.functionsDefs.length>0){
            startsFunctionCallNode.returnType = "void"
        }
        startsFunctionCallNode.functionsNames = [`init${startsFunctionCallNode.uid}FunctionCall`]
        localCCFG.addNode(startsFunctionCallNode)
        localCCFG.initialState = startsFunctionCallNode
        let terminatesFunctionCallNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesFunctionCallNode)
        
        let argsHole: CollectionHole = new CollectionHole(node.args)
        argsHole.isSequential = true
        argsHole.parallelSyncPolicy = "undefined"
        localCCFG.addNode(argsHole)
        
        let theFunctionHole: Hole = new Hole(node.theFunction.ref)
        localCCFG.addNode(theFunctionHole)
        
        startsFunctionCallNode.returnType = "void"
        startsFunctionCallNode.functionsNames = [`${startsFunctionCallNode.uid}functionCallArgsStart`] //overwrite existing name
        startsFunctionCallNode.functionsDefs =[...startsFunctionCallNode.functionsDefs, ...[]] //GG
                //mark 1.5
        localCCFG.addEdge(startsFunctionCallNode,argsHole)
        
        argsHole.returnType = "void"
        argsHole.functionsNames = [`${argsHole.uid}functionCallStarts`] //overwrite existing name
        argsHole.functionsDefs =[...argsHole.functionsDefs, ...[]] //GG
                //mark 0
        localCCFG.addEdge(argsHole,theFunctionHole)
            
        theFunctionHole.returnType = "void"
        theFunctionHole.functionsNames = [`${theFunctionHole.uid}functionCallEnd`] //overwrite existing name
        theFunctionHole.functionsDefs =[...theFunctionHole.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(theFunctionHole,terminatesFunctionCallNode)
        
        return localCCFG;
    }
// rule functionDefArgsStart
   //premise: starts:event
   //conclusion: body:Bloc,starts:event
// rule functionDefEnd
   //premise: body:Bloc,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the FunctionDef node
     * @param a FunctionDef node 
     * @returns the local CCFG (with holes)
     */
    createFunctionDefLocalCCFG(node: FunctionDef): CCFG {
        let localCCFG = new CCFG()
        let startsFunctionDefNode: Node = new Step(node,NodeType.starts,[])
        if(startsFunctionDefNode.functionsDefs.length>0){
            startsFunctionDefNode.returnType = "void"
        }
        startsFunctionDefNode.functionsNames = [`init${startsFunctionDefNode.uid}FunctionDef`]
        localCCFG.addNode(startsFunctionDefNode)
        localCCFG.initialState = startsFunctionDefNode
        let terminatesFunctionDefNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesFunctionDefNode)
        
        let bodyHole: Hole = new Hole(node.body)
        localCCFG.addNode(bodyHole)
        
        startsFunctionDefNode.returnType = "void"
        startsFunctionDefNode.functionsNames = [`${startsFunctionDefNode.uid}functionDefArgsStart`] //overwrite existing name
        startsFunctionDefNode.functionsDefs =[...startsFunctionDefNode.functionsDefs, ...[]] //GG
                //mark 0
        localCCFG.addEdge(startsFunctionDefNode,bodyHole)
            
        bodyHole.returnType = "void"
        bodyHole.functionsNames = [`${bodyHole.uid}functionDefEnd`] //overwrite existing name
        bodyHole.functionsDefs =[...bodyHole.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        localCCFG.addEdge(bodyHole,terminatesFunctionDefNode)
        
        return localCCFG;
    }

    generateCCFG(root: Model, debug: boolean = false): CCFG {

        //pass 1: create local CCFGs for all nodes
        console.log("pass 1: create local CCFGs for all nodes")
        let astNodeToLocalCCFG = new Map<AstNode, CCFG>()
        for (let n of streamAst(root)){
            let localCCFG = this.createLocalCCFG(n)
            if(debug){
                let dotContent = localCCFG.toDot();
                fs.writeFileSync(`./generated/localCCFGs/localCCFG${localCCFG.initialState?.functionsNames[0].replace(/initd+/g,"")}.dot`, dotContent);
            }
            astNodeToLocalCCFG.set(n, localCCFG)
        }

        //pass 2: connect all local CCFGs
        console.log("pass 2: connect all local CCFGs")
        let globalCCFG = astNodeToLocalCCFG.get(root) as CCFG
        let holeNodes : Hole[] = this.retrieveHoles(globalCCFG)
        //fix point loop until all holes are filled
        while (holeNodes.length > 0) {
            if (debug) console.log("holes to fill: "+holeNodes.length)
            for (let holeNode of holeNodes) {
                if (holeNode.getType() == "TimerHole") {
                    if (debug) console.log("filling timer hole: "+holeNode.uid)
                    this.fillTimerHole(holeNode as TimerHole, globalCCFG)
                    continue
                }if (holeNode.getType() == "CollectionHole") {
                    if (debug) console.log("filling timer hole: "+holeNode.uid)
                        this.fillCollectionHole(holeNode as CollectionHole, globalCCFG)
                        continue
                }else{
                    if (debug) console.log("filling hole: "+holeNode.uid)
                    if (holeNode.astNode === undefined) {
                        throw new Error("Hole has undefined astNode :"+holeNode.uid)
                    }
                    let holeNodeLocalCCFG = astNodeToLocalCCFG.get(holeNode.astNode) as CCFG
                    globalCCFG.fillHole(holeNode, holeNodeLocalCCFG)
                }
            }
            holeNodes = this.retrieveHoles(globalCCFG)
        }

        return globalCCFG
    }

    fillCollectionHole(hole: CollectionHole, ccfg: CCFG) {
        let holeNodeLocalCCFG = new CCFG()
        let startsCollectionHoleNode: Node = new Step(hole.astNode,NodeType.starts,[])
        holeNodeLocalCCFG.addNode(startsCollectionHoleNode)
        holeNodeLocalCCFG.initialState = startsCollectionHoleNode
        let terminatesCollectionHoleNode: Node = new Step(hole.astNode,NodeType.terminates)
        holeNodeLocalCCFG.addNode(terminatesCollectionHoleNode)
        if(hole.isSequential){
            let previousNode = startsCollectionHoleNode
            for (let e of hole.astNodeCollection){
                let collectionHole : Hole = new Hole(e)
                holeNodeLocalCCFG.addNode(collectionHole)
                holeNodeLocalCCFG.addEdge(previousNode,collectionHole)
                previousNode = collectionHole
            }
            holeNodeLocalCCFG.addEdge(previousNode,terminatesCollectionHoleNode)
            ccfg.fillHole(hole, holeNodeLocalCCFG)
        }
        else{
            let forkNode = new Fork(hole.astNode)
            holeNodeLocalCCFG.addNode(forkNode)
            holeNodeLocalCCFG.addEdge(startsCollectionHoleNode,forkNode)
            let joinNode = undefined
            if(hole.parallelSyncPolicy == "lastOF"){
                joinNode = new AndJoin(hole.astNode)
            }else{
                joinNode = new OrJoin(hole.astNode)
            } 
            holeNodeLocalCCFG.addNode(joinNode)
            holeNodeLocalCCFG.addEdge(joinNode,terminatesCollectionHoleNode)
            for (let e of hole.astNodeCollection){
                let collectionHole : Hole = new Hole(e)
                holeNodeLocalCCFG.addNode(collectionHole)
                holeNodeLocalCCFG.addEdge(forkNode,collectionHole)
                holeNodeLocalCCFG.addEdge(collectionHole,joinNode)
            }
            ccfg.fillHole(hole, holeNodeLocalCCFG)
        }
        return
    }

    fillTimerHole(hole: TimerHole, ccfg: CCFG) {
        let node = hole.astNode as AstNode
        let timerHoleLocalCCFG = new CCFG()
        let startsTimerHoleNode: Node = new Step(node,NodeType.starts,[`std::this_thread::sleep_for(${hole.duration}ms);`])
        timerHoleLocalCCFG.addNode(startsTimerHoleNode)
        timerHoleLocalCCFG.initialState = startsTimerHoleNode
        let terminatesTimerHoleNode: Node = new Step(node,NodeType.terminates)
        timerHoleLocalCCFG.addNode(terminatesTimerHoleNode)
        timerHoleLocalCCFG.addEdge(startsTimerHoleNode,terminatesTimerHoleNode)
        ccfg.fillHole(hole, timerHoleLocalCCFG)
    }

    retrieveHoles(ccfg: CCFG): Hole[] {
        let holes: Hole[] = [];
        for (let node of ccfg.nodes) {
            if (node instanceof Hole) {
                holes.push(node);
            }
        }
        return holes;
    }


    getASTNodeUID(node: AstNode | AstNode[] | Reference<AstNode> | Reference<AstNode>[] | undefined ): any {
        if(node === undefined){
            throw new Error("not possible to get the UID of an undefined AstNode")
        }
        if(Array.isArray(node)){
           
            if(node.some(n => isReference(n))){
                let unrefed = node.map(r => isReference(r)?(r as Reference<AstNode>).ref:r)
                let noUndef : AstNode[]  = []
                for (let e of unrefed) {
                    if(e !== undefined){
                        noUndef.push(e)
                    }
                }
                return this.getASTNodeUID(noUndef)
            }
            var rs = node.map(n => (n as AstNode).$cstNode?.range)
            return "array"+rs.map(r => r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character).join("_");
        }
        
        if(isReference(node)){
            return this.getASTNodeUID(node.ref)
        }

        var r = node.$cstNode?.range
        return node.$type+r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character;
    }

    // getOrVisitNode(node:AstNode | Reference<AstNode> |undefined): [Node,Node]{
    //     if(node === undefined){
    //         throw new Error("not possible to get or visit an undefined AstNode")
    //     }     
    //     if(isReference(node)){
    //         if(node.ref === undefined){
    //             throw new Error("not possible to visit an undefined AstNode")
    //         }
    //         node = node.ref
    //     }

    //     let startsNode = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
    //     if(startsNode !== undefined){
    //         let terminatesNode = this.ccfg.getNodeFromName("terminates"+getASTNodeUID(node))
    //         if(terminatesNode === undefined){
    //             throw new Error("impossible to be there")
    //         }
    //         return [startsNode,terminatesNode]
    //     }
    //     let [starts,terminates] = this.visit(node)
    //     return [starts,terminates]
    // }

    // retrieveNode(prefix: string, node: AstNode | AstNode[] | Reference<AstNode> | Reference<AstNode>[] | undefined): Node {
    //     if(node === undefined){
    //         throw new Error("not possible to retrieve a node from an undefined AstNode")
    //     }
    //     if(Array.isArray(node) || (prefix != "starts" && prefix != "terminates")){
    //         let n = this.ccfg.getNodeFromName(prefix+getASTNodeUID(node))
    //         if(n === undefined){
    //             throw new Error("impossible to retrieve "+prefix+getASTNodeUID(node)+ "from the ccfg")
    //         }
    //         return n
    //     }
    //     if(prefix == "starts"){
    //         return this.getOrVisitNode(node)[0]
    //     }
    //     if(prefix == "terminates"){
    //         return this.getOrVisitNode(node)[1]
    //     }       
    //     throw new Error("not possible to retrieve the node given as parameter: "+prefix+getASTNodeUID(node))
    // }
    // 
}
