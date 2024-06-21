
import { AstNode, Reference, isReference } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, TypedElement } from "../../ccfg/ccfglib";
import { Model,Bloc,ParallelBloc,Variable,VarRef,If,Assignment,Conjunction,Plus,BooleanConst,While,PeriodicBloc,FunctionCall,FunctionDef } from "../../language-server/generated/ast";

export interface SimpleLVisitor {
    visit(node: AstNode| Reference<AstNode>): [Node,Node];
    

     visitModel(node: Model): [Node,Node];
     visitBloc(node: Bloc): [Node,Node];
     visitParallelBloc(node: ParallelBloc): [Node,Node];
     visitVariable(node: Variable): [Node,Node];
     visitVarRef(node: VarRef): [Node,Node];
     visitIf(node: If): [Node,Node];
     visitAssignment(node: Assignment): [Node,Node];
     visitConjunction(node: Conjunction): [Node,Node];
     visitPlus(node: Plus): [Node,Node];
     visitBooleanConst(node: BooleanConst): [Node,Node];
     visitWhile(node: While): [Node,Node];
     visitPeriodicBloc(node: PeriodicBloc): [Node,Node];
     visitFunctionCall(node: FunctionCall): [Node,Node];
     visitFunctionDef(node: FunctionDef): [Node,Node];
}


    function getASTNodeUID(node: AstNode | AstNode[] | Reference<AstNode> | Reference<AstNode>[] | undefined ): any {
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
                return getASTNodeUID(noUndef)
            }
            var rs = node.map(n => (n as AstNode).$cstNode?.range)
            return "array"+rs.map(r => r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character).join("_");
        }
        
        if(isReference(node)){
            return getASTNodeUID(node.ref)
        }

        var r = node.$cstNode?.range
        return node.$type+r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character;
    }


export class CCFGVisitor implements SimpleLVisitor {
    ccfg: CCFG = new CCFG();

  
    

    visit(node: AstNode | Reference<AstNode>): [Node,Node] {
        if(isReference(node)){
            if(node.ref === undefined){
                throw new Error("not possible to visit an undefined AstNode")
            }
            node = node.ref
        }
        if(node.$type == "Model"){
            return this.visitModel(node as Model);
        }
        if(node.$type == "Bloc"){
            return this.visitBloc(node as Bloc);
        }
        if(node.$type == "ParallelBloc"){
            return this.visitParallelBloc(node as ParallelBloc);
        }
        if(node.$type == "Variable"){
            return this.visitVariable(node as Variable);
        }
        if(node.$type == "VarRef"){
            return this.visitVarRef(node as VarRef);
        }
        if(node.$type == "If"){
            return this.visitIf(node as If);
        }
        if(node.$type == "Assignment"){
            return this.visitAssignment(node as Assignment);
        }
        if(node.$type == "Conjunction"){
            return this.visitConjunction(node as Conjunction);
        }
        if(node.$type == "Plus"){
            return this.visitPlus(node as Plus);
        }
        if(node.$type == "BooleanConst"){
            return this.visitBooleanConst(node as BooleanConst);
        }
        if(node.$type == "While"){
            return this.visitWhile(node as While);
        }
        if(node.$type == "PeriodicBloc"){
            return this.visitPeriodicBloc(node as PeriodicBloc);
        }
        if(node.$type == "FunctionCall"){
            return this.visitFunctionCall(node as FunctionCall);
        }
        if(node.$type == "FunctionDef"){
            return this.visitFunctionDef(node as FunctionDef);
        }
        throw new Error("Not implemented: " + node.$type);
    }
    
    visitModel(node: Model): [Node,Node] {
        let startsModelNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsModelNode.functionsDefs.length>0){
            startsModelNode.returnType = "void"
        }
        startsModelNode.functionsNames = [`init${startsModelNode.uid}Model`]
        this.ccfg.addNode(startsModelNode)
        let terminatesModelNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesModelNode)
        // rule statementsInOrder1
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishModel
   //premise: statements:Statement[],last():Statement,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodestatementsInOrder1 = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodestatementsInOrder1
    }
    
        let statementsInOrder1StepNode = new Step("starts"+getASTNodeUID(node.statements))
        this.ccfg.addNode(statementsInOrder1StepNode)
        let e = this.ccfg.addEdge(previousNode,statementsInOrder1StepNode)
        e.guards = [...e.guards, ...[]] //DD

        previousNode = statementsInOrder1StepNode
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.getOrVisitNode(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let statementsTerminatesNode = new Step("terminates"+getASTNodeUID(node.statements))
        this.ccfg.addNode(statementsTerminatesNode)
        this.ccfg.addEdge(previousNode,statementsTerminatesNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}statementsInOrder1`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_statementsfinishModel = this.retrieveNode("terminates",node.statements) //retrieve 1
        previousNode = terminatesnode_statementsfinishModel
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesModelNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}finishModel`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsModelNode,terminatesModelNode]
    }

    visitBloc(node: Bloc): [Node,Node] {
        let startsBlocNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsBlocNode.functionsDefs.length>0){
            startsBlocNode.returnType = "void"
        }
        startsBlocNode.functionsNames = [`init${startsBlocNode.uid}Bloc`]
        this.ccfg.addNode(startsBlocNode)
        let terminatesBlocNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesBlocNode)
        // rule startsBloc
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishBloc
   //premise: statements:Statement[],last():Statement,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodestartsBloc = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodestartsBloc
    }
    
        let startsBlocStepNode = new Step("starts"+getASTNodeUID(node.statements))
        this.ccfg.addNode(startsBlocStepNode)
        let e = this.ccfg.addEdge(previousNode,startsBlocStepNode)
        e.guards = [...e.guards, ...[]] //DD

        previousNode = startsBlocStepNode
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.getOrVisitNode(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let statementsTerminatesNode = new Step("terminates"+getASTNodeUID(node.statements))
        this.ccfg.addNode(statementsTerminatesNode)
        this.ccfg.addEdge(previousNode,statementsTerminatesNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}startsBloc`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_statementsfinishBloc = this.retrieveNode("terminates",node.statements) //retrieve 1
        previousNode = terminatesnode_statementsfinishBloc
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesBlocNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}finishBloc`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsBlocNode,terminatesBlocNode]
    }

    visitParallelBloc(node: ParallelBloc): [Node,Node] {
        let startsParallelBlocNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsParallelBlocNode.functionsDefs.length>0){
            startsParallelBlocNode.returnType = "void"
        }
        startsParallelBlocNode.functionsNames = [`init${startsParallelBlocNode.uid}ParallelBloc`]
        this.ccfg.addNode(startsParallelBlocNode)
        let terminatesParallelBlocNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesParallelBlocNode)
        // rule startsParallelBloc
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishParallelBloc
   //premise: statements:Statement[],terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodestartsParallelBloc = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodestartsParallelBloc
    }
    
        let startsParallelBlocForkNode: Node = new Fork("startsParallelBlocForkNode")
        this.ccfg.addNode(startsParallelBlocForkNode)
        {let e = this.ccfg.addEdge(previousNode,startsParallelBlocForkNode)
        e.guards = [...e.guards, ...[]] //CC
        }

        let startsParallelBlocFakeNode: Node = new AndJoin("startsParallelBlocFakeNode")    
        this.ccfg.addNode(startsParallelBlocFakeNode)    
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.getOrVisitNode(child)
            this.ccfg.addEdge(startsParallelBlocForkNode,childStartsNode)
            this.ccfg.addEdge(childTerminatesNode,startsParallelBlocFakeNode)
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}startsParallelBloc`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    let finishParallelBlocLastOfNode: Node = new AndJoin("lastOfNode"+getASTNodeUID(node.statements))
    this.ccfg.replaceNode(startsParallelBlocFakeNode,finishParallelBlocLastOfNode)                    
                
    {
        let lastOfNodenode_statementsfinishParallelBloc = this.retrieveNode("lastOfNode",node.statements) //retrieve 1
        previousNode = lastOfNodenode_statementsfinishParallelBloc
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesParallelBlocNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}finishParallelBloc`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsParallelBlocNode,terminatesParallelBlocNode]
    }

    visitVariable(node: Variable): [Node,Node] {
        let startsVariableNode: Node = new Step("starts"+getASTNodeUID(node),[`createGlobalVar,int,${getASTNodeUID(node)}currentValue`])
        if(startsVariableNode.functionsDefs.length>0){
            startsVariableNode.returnType = "void"
        }
        startsVariableNode.functionsNames = [`init${startsVariableNode.uid}Variable`]
        this.ccfg.addNode(startsVariableNode)
        let terminatesVariableNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesVariableNode)
        // rule initializeVar
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodeinitializeVar = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodeinitializeVar
    }
    
    {let initializeVarStateModificationNode: Node = new Step("initializeVarStateModificationNode")
    this.ccfg.addNode(initializeVarStateModificationNode)
    let e = this.ccfg.addEdge(previousNode,initializeVarStateModificationNode)
    e.guards = [...e.guards, ...[]]
    previousNode = initializeVarStateModificationNode
    }
    previousNode.functionsNames = [...previousNode.functionsNames, ...[`${previousNode.uid}initializeVar`]] 
    previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`createVar,int,${getASTNodeUID(node)}1430`,`assignVar,${getASTNodeUID(node)}1430,${node.initialValue}`,`setGlobalVar,int,${getASTNodeUID(node)}currentValue,${getASTNodeUID(node)}1430`]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesVariableNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}initializeVar`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsVariableNode,terminatesVariableNode]
    }

    visitVarRef(node: VarRef): [Node,Node] {
        let startsVarRefNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsVarRefNode.functionsDefs.length>0){
            startsVarRefNode.returnType = "void"
        }
        startsVarRefNode.functionsNames = [`init${startsVarRefNode.uid}VarRef`]
        this.ccfg.addNode(startsVarRefNode)
        let terminatesVarRefNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesVarRefNode)
        // rule accessVarRef
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodeaccessVarRef = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodeaccessVarRef
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesVarRefNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "int"
        previousNode.functionsNames = [`${previousNode.uid}accessVarRef`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`lock,variableMutex`,`createVar,int,${getASTNodeUID(node)}1645`,`setVarFromGlobal,int,${getASTNodeUID(node)}1645,${getASTNodeUID(node.theVar)}currentValue`,`createVar,int,${getASTNodeUID(node)}terminates`,`assignVar,${getASTNodeUID(node)}terminates,${getASTNodeUID(node)}1645`,`return,${getASTNodeUID(node)}terminates`]] //GG
    
        return [startsVarRefNode,terminatesVarRefNode]
    }

    visitIf(node: If): [Node,Node] {
        let startsIfNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsIfNode.functionsDefs.length>0){
            startsIfNode.returnType = "void"
        }
        startsIfNode.functionsNames = [`init${startsIfNode.uid}If`]
        this.ccfg.addNode(startsIfNode)
        let terminatesIfNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesIfNode)
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
   //premise: else:Bloc,terminates:event,then:Bloc,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodecondStart = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodecondStart
    }
    
        let condStartsNodecondStart = this.retrieveNode("starts",node.cond)
        
            {
            let e = this.ccfg.addEdge(previousNode,condStartsNodecondStart)
            e.guards = [...e.guards, ...[]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}condStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        let condTerminatesNodecondTrueStart = this.retrieveNode("terminates",node.cond)
        let condChoiceNodecondTrueStart = this.ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if (condChoiceNodecondTrueStart == undefined) {
            let condChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.cond))
            this.ccfg.addNode(condChoiceNode)
            this.ccfg.addEdge(condTerminatesNodecondTrueStart,condChoiceNode)
            condChoiceNodecondTrueStart = condChoiceNode
        }else{
            this.ccfg.addEdge(condTerminatesNodecondTrueStart,condChoiceNodecondTrueStart)
        }
        
    {
        let choiceNodenode_condcondTrueStart = this.retrieveNode("choiceNode",node.cond) //retrieve 1
        previousNode = choiceNodenode_condcondTrueStart
    }
    
        let thenStartsNodecondTrueStart = this.retrieveNode("starts",node.then)
        
            {
            let e = this.ccfg.addEdge(previousNode,thenStartsNodecondTrueStart)
            e.guards = [...e.guards, ...[`verifyEqual,${getASTNodeUID(node.cond)}terminates,true`]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}condTrueStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        let condTerminatesNodecondFalseStart = this.retrieveNode("terminates",node.cond)
        let condChoiceNodecondFalseStart = this.ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if (condChoiceNodecondFalseStart == undefined) {
            let condChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.cond))
            this.ccfg.addNode(condChoiceNode)
            this.ccfg.addEdge(condTerminatesNodecondFalseStart,condChoiceNode)
            condChoiceNodecondFalseStart = condChoiceNode
        }else{
            this.ccfg.addEdge(condTerminatesNodecondFalseStart,condChoiceNodecondFalseStart)
        }
        
    {
        let choiceNodenode_condcondFalseStart = this.retrieveNode("choiceNode",node.cond) //retrieve 1
        previousNode = choiceNodenode_condcondFalseStart
    }
    
        let elseStartsNodecondFalseStart = this.retrieveNode("starts",node.else)
        
            {
            let e = this.ccfg.addEdge(previousNode,elseStartsNodecondFalseStart)
            e.guards = [...e.guards, ...[`verifyEqual,${getASTNodeUID(node.cond)}terminates,false`]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}condFalseStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    let condStopOrJoinNode: Node = new OrJoin("orJoinNode"+getASTNodeUID(node.else))
    this.ccfg.addNode(condStopOrJoinNode)
    let elseTerminatesNodecondStop = this.retrieveNode("terminates", node.else)
    let thenTerminatesNodecondStop = this.retrieveNode("terminates", node.then)
    this.ccfg.addEdge(elseTerminatesNodecondStop,condStopOrJoinNode)
    this.ccfg.addEdge(thenTerminatesNodecondStop,condStopOrJoinNode)
            
    {
        let multipleSynchroNode = this.ccfg.getNodeFromName("orJoinNode"+getASTNodeUID(node.else))
        if(multipleSynchroNode == undefined){
            throw new Error("impossible to be there orJoinNode"+getASTNodeUID(node.else))
        }
        multipleSynchroNode.params = [...multipleSynchroNode.params, ...[]]
        multipleSynchroNode.functionsDefs = [...multipleSynchroNode.functionsDefs, ...[]] //HH
    }
    
    {
        let orJoinNodenode_elsecondStop = this.retrieveNode("orJoinNode",node.else) //retrieve 1
        previousNode = orJoinNodenode_elsecondStop
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesIfNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}condStop`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsIfNode,terminatesIfNode]
    }

    visitAssignment(node: Assignment): [Node,Node] {
        let startsAssignmentNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsAssignmentNode.functionsDefs.length>0){
            startsAssignmentNode.returnType = "void"
        }
        startsAssignmentNode.functionsNames = [`init${startsAssignmentNode.uid}Assignment`]
        this.ccfg.addNode(startsAssignmentNode)
        let terminatesAssignmentNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesAssignmentNode)
        // rule executeAssignment
   //premise: starts:event
   //conclusion: expr:Expr,starts:event
// rule executeAssignment2
   //premise: expr:Expr,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodeexecuteAssignment = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodeexecuteAssignment
    }
    
        let exprStartsNodeexecuteAssignment = this.retrieveNode("starts",node.expr)
        
            {
            let e = this.ccfg.addEdge(previousNode,exprStartsNodeexecuteAssignment)
            e.guards = [...e.guards, ...[]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}executeAssignment`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_exprexecuteAssignment2 = this.retrieveNode("terminates",node.expr) //retrieve 1
        previousNode = terminatesnode_exprexecuteAssignment2
    }
    
    {let executeAssignment2StateModificationNode: Node = new Step("executeAssignment2StateModificationNode")
    this.ccfg.addNode(executeAssignment2StateModificationNode)
    let e = this.ccfg.addEdge(previousNode,executeAssignment2StateModificationNode)
    e.guards = [...e.guards, ...[]]
    executeAssignment2StateModificationNode.params = [...executeAssignment2StateModificationNode.params, ...[Object.assign( new TypedElement(), JSON.parse(`{ "name": "resRight", "type": "int"}`))]]
    
    previousNode = executeAssignment2StateModificationNode
    }
    previousNode.functionsNames = [...previousNode.functionsNames, ...[`${previousNode.uid}executeAssignment2`]] 
    previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`createVar,int,${getASTNodeUID(node)}2620`,`assignVar,${getASTNodeUID(node)}2620,resRight`,`setGlobalVar,int,${getASTNodeUID(node.variable)}currentValue,${getASTNodeUID(node)}2620`]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesAssignmentNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}executeAssignment2`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsAssignmentNode,terminatesAssignmentNode]
    }

    visitConjunction(node: Conjunction): [Node,Node] {
        let startsConjunctionNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsConjunctionNode.functionsDefs.length>0){
            startsConjunctionNode.returnType = "void"
        }
        startsConjunctionNode.functionsNames = [`init${startsConjunctionNode.uid}Conjunction`]
        this.ccfg.addNode(startsConjunctionNode)
        let terminatesConjunctionNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesConjunctionNode)
        // rule evaluateConjunction
   //premise: starts:event
   //conclusion: lhs:BooleanExpression,starts:event
   //conclusion: lhs:BooleanExpression,starts:event,rhs:BooleanExpression,starts:event
// rule evaluateConjunction2
   //premise: lhs:BooleanExpression,terminates:event
   //conclusion: terminates:event
// rule evaluateConjunction3
   //premise: rhs:BooleanExpression,terminates:event
   //conclusion: terminates:event
// rule evaluateConjunction4
   //premise: lhs:BooleanExpression,terminates:event,rhs:BooleanExpression,terminates:event
   //conclusion: terminates:event

        let ConjunctionOrJoinNode: Node = new OrJoin("orJoin"+getASTNodeUID(node))
        this.ccfg.addNode(ConjunctionOrJoinNode)
        this.ccfg.addEdge(ConjunctionOrJoinNode,terminatesConjunctionNode)
        
        let previousNode =undefined
        
    {
        let startsnodeevaluateConjunction = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodeevaluateConjunction
    }
    
        let evaluateConjunctionForkNode: Node = new Fork("evaluateConjunctionForkNode")
        this.ccfg.addNode(evaluateConjunctionForkNode)
        {let e = this.ccfg.addEdge(previousNode,evaluateConjunctionForkNode)
        e.guards = [...e.guards, ...[]] //BB
        }
        
        let [lhsStartNode/*,lhsTerminatesNode*/] = this.getOrVisitNode(node.lhs)
        this.ccfg.addEdge(evaluateConjunctionForkNode,lhsStartNode)
        
        let [rhsStartNode/*,rhsTerminatesNode*/] = this.getOrVisitNode(node.rhs)
        this.ccfg.addEdge(evaluateConjunctionForkNode,rhsStartNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}evaluateConjunction`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        let lhsTerminatesNodeevaluateConjunction2 = this.retrieveNode("terminates",node.lhs)
        let lhsChoiceNodeevaluateConjunction2 = this.ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.lhs))
        if (lhsChoiceNodeevaluateConjunction2 == undefined) {
            let lhsChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.lhs))
            this.ccfg.addNode(lhsChoiceNode)
            this.ccfg.addEdge(lhsTerminatesNodeevaluateConjunction2,lhsChoiceNode)
            lhsChoiceNodeevaluateConjunction2 = lhsChoiceNode
        }else{
            this.ccfg.addEdge(lhsTerminatesNodeevaluateConjunction2,lhsChoiceNodeevaluateConjunction2)
        }
        
    {
        let choiceNodenode_lhsevaluateConjunction2 = this.retrieveNode("choiceNode",node.lhs) //retrieve 1
        previousNode = choiceNodenode_lhsevaluateConjunction2
    }
    
        {let e = this.ccfg.addEdge(previousNode,ConjunctionOrJoinNode)
        e.guards = [...e.guards, ...[`verifyEqual,${getASTNodeUID(node.lhs)}terminates,false`]] //EE
        }
        
        previousNode.returnType = "bool"
        previousNode.functionsNames = [`${previousNode.uid}evaluateConjunction2`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`createVar,bool,${getASTNodeUID(node)}terminates`,`assignVar,${getASTNodeUID(node)}terminates,false`,`return,${getASTNodeUID(node)}terminates`,]] //GG
    
        let rhsTerminatesNodeevaluateConjunction3 = this.retrieveNode("terminates",node.rhs)
        let rhsChoiceNodeevaluateConjunction3 = this.ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.rhs))
        if (rhsChoiceNodeevaluateConjunction3 == undefined) {
            let rhsChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.rhs))
            this.ccfg.addNode(rhsChoiceNode)
            this.ccfg.addEdge(rhsTerminatesNodeevaluateConjunction3,rhsChoiceNode)
            rhsChoiceNodeevaluateConjunction3 = rhsChoiceNode
        }else{
            this.ccfg.addEdge(rhsTerminatesNodeevaluateConjunction3,rhsChoiceNodeevaluateConjunction3)
        }
        
    {
        let choiceNodenode_rhsevaluateConjunction3 = this.retrieveNode("choiceNode",node.rhs) //retrieve 1
        previousNode = choiceNodenode_rhsevaluateConjunction3
    }
    
        {let e = this.ccfg.addEdge(previousNode,ConjunctionOrJoinNode)
        e.guards = [...e.guards, ...[`verifyEqual,${getASTNodeUID(node.rhs)}terminates,false`]] //EE
        }
        
        previousNode.returnType = "bool"
        previousNode.functionsNames = [`${previousNode.uid}evaluateConjunction3`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`createVar,bool,${getASTNodeUID(node)}terminates`,`assignVar,${getASTNodeUID(node)}terminates,false`,`return,${getASTNodeUID(node)}terminates`,]] //GG
    
    let evaluateConjunction4AndJoinNode: Node = new AndJoin("andJoinNode"+getASTNodeUID(node.lhs))
    this.ccfg.addNode(evaluateConjunction4AndJoinNode)
    let lhsTerminatesNodeevaluateConjunction4 = this.retrieveNode("terminates", node.lhs)
    let rhsTerminatesNodeevaluateConjunction4 = this.retrieveNode("terminates", node.rhs)
    this.ccfg.addEdge(lhsTerminatesNodeevaluateConjunction4,evaluateConjunction4AndJoinNode)
    this.ccfg.addEdge(rhsTerminatesNodeevaluateConjunction4,evaluateConjunction4AndJoinNode)
            
    let evaluateConjunction4ConditionNode: Node = new Choice("conditionNode"+getASTNodeUID(node.lhs))
    this.ccfg.addNode(evaluateConjunction4ConditionNode)
    let tmpMultipleSynchroNode = this.ccfg.getNodeFromName("andJoinNode"+getASTNodeUID(node.lhs))
    if(tmpMultipleSynchroNode == undefined){
        throw new Error("impossible to be there andJoinNode"+getASTNodeUID(node.lhs))
    }
    this.ccfg.addEdge(tmpMultipleSynchroNode,evaluateConjunction4ConditionNode)
        
    {
        let multipleSynchroNode = this.ccfg.getNodeFromName("conditionNode"+getASTNodeUID(node.lhs))
        if(multipleSynchroNode == undefined){
            throw new Error("impossible to be there conditionNode"+getASTNodeUID(node.lhs))
        }
        multipleSynchroNode.params = [...multipleSynchroNode.params, ...[]]
        multipleSynchroNode.functionsDefs = [...multipleSynchroNode.functionsDefs, ...[]] //HH
    }
    
    {
        let conditionNodenode_lhsevaluateConjunction4 = this.retrieveNode("conditionNode",node.lhs) //retrieve 1
        previousNode = conditionNodenode_lhsevaluateConjunction4
    }
    
        {let e = this.ccfg.addEdge(previousNode,ConjunctionOrJoinNode)
        e.guards = [...e.guards, ...[`verifyEqual,${getASTNodeUID(node.lhs)}terminates,true`,`verifyEqual,${getASTNodeUID(node.rhs)}terminates,true`]] //EE
        }
        
        previousNode.returnType = "bool"
        previousNode.functionsNames = [`${previousNode.uid}evaluateConjunction4`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`createVar,bool,${getASTNodeUID(node)}terminates`,`assignVar,${getASTNodeUID(node)}terminates,true`,`return,${getASTNodeUID(node)}terminates`,]] //GG
    
        return [startsConjunctionNode,terminatesConjunctionNode]
    }

    visitPlus(node: Plus): [Node,Node] {
        let startsPlusNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsPlusNode.functionsDefs.length>0){
            startsPlusNode.returnType = "void"
        }
        startsPlusNode.functionsNames = [`init${startsPlusNode.uid}Plus`]
        this.ccfg.addNode(startsPlusNode)
        let terminatesPlusNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesPlusNode)
        // rule startPlus
   //premise: starts:event
   //conclusion: right:Expr,starts:event
   //conclusion: right:Expr,starts:event,left:Expr,starts:event
// rule finishPlus
   //premise: right:Expr,terminates:event,left:Expr,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodestartPlus = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodestartPlus
    }
    
        let startPlusForkNode: Node = new Fork("startPlusForkNode")
        this.ccfg.addNode(startPlusForkNode)
        {let e = this.ccfg.addEdge(previousNode,startPlusForkNode)
        e.guards = [...e.guards, ...[]] //BB
        }
        
        let [rightStartNode/*,rightTerminatesNode*/] = this.getOrVisitNode(node.right)
        this.ccfg.addEdge(startPlusForkNode,rightStartNode)
        
        let [leftStartNode/*,leftTerminatesNode*/] = this.getOrVisitNode(node.left)
        this.ccfg.addEdge(startPlusForkNode,leftStartNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}startPlus`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    let finishPlusAndJoinNode: Node = new AndJoin("andJoinNode"+getASTNodeUID(node.right))
    this.ccfg.addNode(finishPlusAndJoinNode)
    let rightTerminatesNodefinishPlus = this.retrieveNode("terminates", node.right)
    let leftTerminatesNodefinishPlus = this.retrieveNode("terminates", node.left)
    this.ccfg.addEdge(rightTerminatesNodefinishPlus,finishPlusAndJoinNode)
    this.ccfg.addEdge(leftTerminatesNodefinishPlus,finishPlusAndJoinNode)
            
    {
        let multipleSynchroNode = this.ccfg.getNodeFromName("andJoinNode"+getASTNodeUID(node.right))
        if(multipleSynchroNode == undefined){
            throw new Error("impossible to be there andJoinNode"+getASTNodeUID(node.right))
        }
        multipleSynchroNode.params = [...multipleSynchroNode.params, ...[Object.assign( new TypedElement(), JSON.parse(`{ "name": "n2", "type": "int"}`)),Object.assign( new TypedElement(), JSON.parse(`{ "name": "n1", "type": "int"}`))]]
        multipleSynchroNode.functionsDefs = [...multipleSynchroNode.functionsDefs, ...[`int ${getASTNodeUID(node)}4391 = n2;`,`int ${getASTNodeUID(node)}4416 = n1;`]] //HH
    }
    
    {
        let andJoinNodenode_rightfinishPlus = this.retrieveNode("andJoinNode",node.right) //retrieve 1
        previousNode = andJoinNodenode_rightfinishPlus
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesPlusNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "int"
        previousNode.functionsNames = [`${previousNode.uid}finishPlus`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`createVar,int,${getASTNodeUID(node)}4537`,`assignVar,${getASTNodeUID(node)}4537,n1`,`createVar,int,${getASTNodeUID(node)}4542`,`assignVar,${getASTNodeUID(node)}4542,n2`,`createVar,${getASTNodeUID(node)}4536`,`operation,${getASTNodeUID(node)}4536,${getASTNodeUID(node)}4537,+,${getASTNodeUID(node)}4542`,`createVar,int,${getASTNodeUID(node)}terminates`,`assignVar,${getASTNodeUID(node)}terminates,${getASTNodeUID(node)}4536`,`return,${getASTNodeUID(node)}terminates`]] //GG
    
        return [startsPlusNode,terminatesPlusNode]
    }

    visitBooleanConst(node: BooleanConst): [Node,Node] {
        let startsBooleanConstNode: Node = new Step("starts"+getASTNodeUID(node),[`createGlobalVar,bool${node.value},${getASTNodeUID(node)}constantValue`])
        if(startsBooleanConstNode.functionsDefs.length>0){
            startsBooleanConstNode.returnType = "void"
        }
        startsBooleanConstNode.functionsNames = [`init${startsBooleanConstNode.uid}BooleanConst`]
        this.ccfg.addNode(startsBooleanConstNode)
        let terminatesBooleanConstNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesBooleanConstNode)
        // rule evalBooleanConst
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodeevalBooleanConst = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodeevalBooleanConst
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesBooleanConstNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "bool"
        previousNode.functionsNames = [`${previousNode.uid}evalBooleanConst`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`lock,variableMutex`,`createVar,bool,${getASTNodeUID(node)}4765`,`setVarFromGlobal,bool,${getASTNodeUID(node)}4765,${getASTNodeUID(node)}constantValue`,`createVar,bool,${getASTNodeUID(node)}terminates`,`assignVar,${getASTNodeUID(node)}terminates,${getASTNodeUID(node)}4765`,`return,${getASTNodeUID(node)}terminates`]] //GG
    
        return [startsBooleanConstNode,terminatesBooleanConstNode]
    }

    visitWhile(node: While): [Node,Node] {
        let startsWhileNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsWhileNode.functionsDefs.length>0){
            startsWhileNode.returnType = "void"
        }
        startsWhileNode.functionsNames = [`init${startsWhileNode.uid}While`]
        this.ccfg.addNode(startsWhileNode)
        let terminatesWhileNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesWhileNode)
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
   //conclusion: terminates:unknown

        let previousNode =undefined
        
    {
        let startsnodewhileStart = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodewhileStart
    }
    
        let condStartsNodewhileStart = this.retrieveNode("starts",node.cond)
        
            {
            let e = this.ccfg.addEdge(previousNode,condStartsNodewhileStart)
            e.guards = [...e.guards, ...[]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}whileStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        let condTerminatesNodewhileBodyStart = this.retrieveNode("terminates",node.cond)
        let condChoiceNodewhileBodyStart = this.ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if (condChoiceNodewhileBodyStart == undefined) {
            let condChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.cond))
            this.ccfg.addNode(condChoiceNode)
            this.ccfg.addEdge(condTerminatesNodewhileBodyStart,condChoiceNode)
            condChoiceNodewhileBodyStart = condChoiceNode
        }else{
            this.ccfg.addEdge(condTerminatesNodewhileBodyStart,condChoiceNodewhileBodyStart)
        }
        
    {
        let choiceNodenode_condwhileBodyStart = this.retrieveNode("choiceNode",node.cond) //retrieve 1
        previousNode = choiceNodenode_condwhileBodyStart
    }
    
        let bodyStartsNodewhileBodyStart = this.retrieveNode("starts",node.body)
        
            {
            let e = this.ccfg.addEdge(previousNode,bodyStartsNodewhileBodyStart)
            e.guards = [...e.guards, ...[`verifyEqual,${getASTNodeUID(node.cond)}terminates,true`]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}whileBodyStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_bodywhileBodyEnd = this.retrieveNode("terminates",node.body) //retrieve 1
        previousNode = terminatesnode_bodywhileBodyEnd
    }
    
        let condStartsNodewhileBodyEnd = this.retrieveNode("starts",node.cond)
        
            {
            let e = this.ccfg.addEdge(previousNode,condStartsNodewhileBodyEnd)
            e.guards = [...e.guards, ...[]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}whileBodyEnd`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        let condTerminatesNodewhileEnd = this.retrieveNode("terminates",node.cond)
        let condChoiceNodewhileEnd = this.ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if (condChoiceNodewhileEnd == undefined) {
            let condChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.cond))
            this.ccfg.addNode(condChoiceNode)
            this.ccfg.addEdge(condTerminatesNodewhileEnd,condChoiceNode)
            condChoiceNodewhileEnd = condChoiceNode
        }else{
            this.ccfg.addEdge(condTerminatesNodewhileEnd,condChoiceNodewhileEnd)
        }
        
    {
        let choiceNodenode_condwhileEnd = this.retrieveNode("choiceNode",node.cond) //retrieve 1
        previousNode = choiceNodenode_condwhileEnd
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesWhileNode)
        e.guards = [...e.guards, ...[`verifyEqual,${getASTNodeUID(node.cond)}terminates,false`]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}whileEnd`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsWhileNode,terminatesWhileNode]
    }

    visitPeriodicBloc(node: PeriodicBloc): [Node,Node] {
        let startsPeriodicBlocNode: Node = new Step("starts"+getASTNodeUID(node),[`createGlobalVar,int${node.time},${getASTNodeUID(node)}blocTrigger`])
        if(startsPeriodicBlocNode.functionsDefs.length>0){
            startsPeriodicBlocNode.returnType = "void"
        }
        startsPeriodicBlocNode.functionsNames = [`init${startsPeriodicBlocNode.uid}PeriodicBloc`]
        this.ccfg.addNode(startsPeriodicBlocNode)
        let terminatesPeriodicBlocNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesPeriodicBlocNode)
        // rule periodicStart
   //premise: starts:event
   //conclusion: blocTrigger:Timer,starts:event
// rule periodicBodyStart
   //premise: blocTrigger:Timer,terminates:event
   //conclusion: bloc:Bloc,starts:event
   //conclusion: bloc:Bloc,starts:event,blocTrigger:Timer,starts:event

        let previousNode =undefined
        
    {
        let startsnodeperiodicStart = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodeperiodicStart
    }
    
        let blocTriggerStartsNodeperiodicStart = this.retrieveNode("starts",node)
        
            let blocTriggerTerminatesNodeperiodicStart = this.retrieveNode("terminates",node)
            blocTriggerStartsNodeperiodicStart = new Step("startsblocTrigger"+getASTNodeUID(node))
            this.ccfg.addNode( blocTriggerStartsNodeperiodicStart)
            blocTriggerStartsNodeperiodicStart.functionsNames = [`starts${blocTriggerStartsNodeperiodicStart.uid}blocTrigger`]
            blocTriggerStartsNodeperiodicStart.returnType = "void"
            blocTriggerStartsNodeperiodicStart.functionsDefs = [...blocTriggerStartsNodeperiodicStart.functionsDefs, ...[`std::this_thread::sleep_for(${node.time}ms);`]] //GGG
            blocTriggerTerminatesNodeperiodicStart = new Step("terminatesblocTrigger"+getASTNodeUID(node))
            this.ccfg.addNode(blocTriggerTerminatesNodeperiodicStart)
    
            {
            let e1 = this.ccfg.addEdge(previousNode, blocTriggerStartsNodeperiodicStart)
            e1.guards = [...e1.guards, ...[]] //FFF
            let e2 = this.ccfg.addEdge( blocTriggerStartsNodeperiodicStart,blocTriggerTerminatesNodeperiodicStart)
            e2.guards = [...e2.guards, ...[]] //FFF
            }

            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}periodicStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesblocTriggernodeperiodicBodyStart = this.retrieveNode("terminatesblocTrigger",node) //retrieve 1
        previousNode = terminatesblocTriggernodeperiodicBodyStart
    }
    
        let periodicBodyStartForkNode: Node = new Fork("periodicBodyStartForkNode")
        this.ccfg.addNode(periodicBodyStartForkNode)
        {let e = this.ccfg.addEdge(previousNode,periodicBodyStartForkNode)
        e.guards = [...e.guards, ...[]] //BB
        }
        
        let [blocStartNode/*,blocTerminatesNode*/] = this.getOrVisitNode(node.bloc)
        this.ccfg.addEdge(periodicBodyStartForkNode,blocStartNode)
        
    let blocTriggerStartsNodeperiodicBodyStart = this.retrieveNode("starts"+"blocTrigger",node)
    let blocTriggerTerminatesNodeperiodicBodyStart = this.retrieveNode("terminates"+"blocTrigger",node)
    {
    //let e1 = this.ccfg.addEdge(previousNode, blocTriggerStartsNodeperiodicBodyStart)
    //e1.guards = [...e1.guards, ...[]] //FF22
    let e2 = this.ccfg.addEdge( blocTriggerStartsNodeperiodicBodyStart,blocTriggerTerminatesNodeperiodicBodyStart)
    e2.guards = [...e2.guards, ...[]] //FF22
    this.ccfg.addEdge(periodicBodyStartForkNode,blocTriggerStartsNodeperiodicBodyStart)
    }
   
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}periodicBodyStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsPeriodicBlocNode,terminatesPeriodicBlocNode]
    }

    visitFunctionCall(node: FunctionCall): [Node,Node] {
        let startsFunctionCallNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsFunctionCallNode.functionsDefs.length>0){
            startsFunctionCallNode.returnType = "void"
        }
        startsFunctionCallNode.functionsNames = [`init${startsFunctionCallNode.uid}FunctionCall`]
        this.ccfg.addNode(startsFunctionCallNode)
        let terminatesFunctionCallNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesFunctionCallNode)
        // rule functionCallArgsStart
   //premise: starts:event
   //conclusion: args:Expr[],a:unknown,starts:event
// rule functionCallStarts
   //premise: args:Expr[],last():Expr,terminates:event
   //conclusion: theFunction:[FunctionDef:ID],starts:event
// rule functionCallEnd
   //premise: theFunction:[FunctionDef:ID],terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodefunctionCallArgsStart = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodefunctionCallArgsStart
    }
    
        let functionCallArgsStartStepNode = new Step("starts"+getASTNodeUID(node.args))
        this.ccfg.addNode(functionCallArgsStartStepNode)
        let e = this.ccfg.addEdge(previousNode,functionCallArgsStartStepNode)
        e.guards = [...e.guards, ...[]] //DD

        previousNode = functionCallArgsStartStepNode
        for (var child of node.args) {
            let [childStartsNode,childTerminatesNode] = this.getOrVisitNode(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let argsTerminatesNode = new Step("terminates"+getASTNodeUID(node.args))
        this.ccfg.addNode(argsTerminatesNode)
        this.ccfg.addEdge(previousNode,argsTerminatesNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}functionCallArgsStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_argsfunctionCallStarts = this.retrieveNode("terminates",node.args) //retrieve 1
        previousNode = terminatesnode_argsfunctionCallStarts
    }
    
        let theFunctionStartsNodefunctionCallStarts = this.retrieveNode("starts",node.theFunction)
        
            {
            let e = this.ccfg.addEdge(previousNode,theFunctionStartsNodefunctionCallStarts)
            e.guards = [...e.guards, ...[]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}functionCallStarts`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_theFunctionfunctionCallEnd = this.retrieveNode("terminates",node.theFunction) //retrieve 1
        previousNode = terminatesnode_theFunctionfunctionCallEnd
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesFunctionCallNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}functionCallEnd`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsFunctionCallNode,terminatesFunctionCallNode]
    }

    visitFunctionDef(node: FunctionDef): [Node,Node] {
        let startsFunctionDefNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsFunctionDefNode.functionsDefs.length>0){
            startsFunctionDefNode.returnType = "void"
        }
        startsFunctionDefNode.functionsNames = [`init${startsFunctionDefNode.uid}FunctionDef`]
        this.ccfg.addNode(startsFunctionDefNode)
        let terminatesFunctionDefNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesFunctionDefNode)
        // rule functionDefArgsStart
   //premise: starts:event
   //conclusion: body:Bloc,starts:event
// rule functionDefEnd
   //premise: body:Bloc,terminates:event
   //conclusion: terminates:unknown

        let previousNode =undefined
        
    {
        let startsnodefunctionDefArgsStart = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodefunctionDefArgsStart
    }
    
        let bodyStartsNodefunctionDefArgsStart = this.retrieveNode("starts",node.body)
        
            {
            let e = this.ccfg.addEdge(previousNode,bodyStartsNodefunctionDefArgsStart)
            e.guards = [...e.guards, ...[]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}functionDefArgsStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_bodyfunctionDefEnd = this.retrieveNode("terminates",node.body) //retrieve 1
        previousNode = terminatesnode_bodyfunctionDefEnd
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesFunctionDefNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}functionDefEnd`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsFunctionDefNode,terminatesFunctionDefNode]
    }

    getOrVisitNode(node:AstNode | Reference<AstNode> |undefined): [Node,Node]{
        if(node === undefined){
            throw new Error("not possible to get or visit an undefined AstNode")
        }     
        if(isReference(node)){
            if(node.ref === undefined){
                throw new Error("not possible to visit an undefined AstNode")
            }
            node = node.ref
        }

        let startsNode = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsNode !== undefined){
            let terminatesNode = this.ccfg.getNodeFromName("terminates"+getASTNodeUID(node))
            if(terminatesNode === undefined){
                throw new Error("impossible to be there")
            }
            return [startsNode,terminatesNode]
        }
        let [starts,terminates] = this.visit(node)
        return [starts,terminates]
    }

    retrieveNode(prefix: string, node: AstNode | AstNode[] | Reference<AstNode> | Reference<AstNode>[] | undefined): Node {
        if(node === undefined){
            throw new Error("not possible to retrieve a node from an undefined AstNode")
        }
        if(Array.isArray(node) || (prefix != "starts" && prefix != "terminates")){
            let n = this.ccfg.getNodeFromName(prefix+getASTNodeUID(node))
            if(n === undefined){
                throw new Error("impossible to retrieve "+prefix+getASTNodeUID(node)+ "from the ccfg")
            }
            return n
        }
        if(prefix == "starts"){
            return this.getOrVisitNode(node)[0]
        }
        if(prefix == "terminates"){
            return this.getOrVisitNode(node)[1]
        }       
        throw new Error("not possible to retrieve the node given as parameter: "+prefix+getASTNodeUID(node))
    }
    
}
