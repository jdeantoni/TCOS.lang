
import { AstNode, Reference, isReference } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step } from "../../ccfg/ccfglib";

    import { Range, integer } from "vscode-languageserver";

    var globalUnNamedCounter:integer = 0

    function getName(node:AstNode | Reference<AstNode> | undefined): string {
        if(isReference(node)){
            node = node.ref
        }
        if(node !==undefined && node.$cstNode){
            var r: Range = node.$cstNode?.range
            return node.$type+r.start.line+"_"+r.start.character+"_"+r.end.line+"_"+r.end.character;
        }else{
            return "noName"+globalUnNamedCounter++
        }
    }
    import { Model,Bloc,ParallelBloc,Variable,VarRef,If,Assignment,Conjunction,Plus,BooleanConst } from "../../language-server/generated/ast";

export interface SimpleLVisitor {
    visit(node: AstNode): [Node,Node];
    

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
}

export class CCFGVisitor implements SimpleLVisitor {
    ccfg: CCFG = new CCFG();

    visit(node: AstNode): [Node,Node] {
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
        throw new Error("Not implemented: " + node.$type);
    }
    
    visitModel(node: Model): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule statementsInOrder1
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishModel
   //premise: statements:Statement[],last():Statement,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        let statementsInOrder1StepNode = new Step("statementsInOrder1StepNode")
        this.ccfg.addNode(statementsInOrder1StepNode)
        let e = this.ccfg.addEdge(previousNode,statementsInOrder1StepNode)
        e.guards = [...e.guards, ...[]] //DD
        // statementsInOrder1StepNode.actions = [...statementsInOrder1StepNode.actions, ...[]] //DD
        previousNode = statementsInOrder1StepNode
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let statementsTerminatesNode = previousNode
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    
        statementsTerminatesNode.actions = [...statementsTerminatesNode.actions, ...[]] //II
        
        previousNode = statementsTerminatesNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        // terminatesNode.actions = [...terminatesNode.actions, ...[]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    

        return [startsNode,terminatesNode]
    }

    visitBloc(node: Bloc): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule startsBloc
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishBloc
   //premise: statements:Statement[],last():Statement,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        let startsBlocStepNode = new Step("startsBlocStepNode")
        this.ccfg.addNode(startsBlocStepNode)
        let e = this.ccfg.addEdge(previousNode,startsBlocStepNode)
        e.guards = [...e.guards, ...[]] //DD
        // startsBlocStepNode.actions = [...startsBlocStepNode.actions, ...[]] //DD
        previousNode = startsBlocStepNode
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let statementsTerminatesNode = previousNode
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    
        statementsTerminatesNode.actions = [...statementsTerminatesNode.actions, ...[]] //II
        
        previousNode = statementsTerminatesNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        // terminatesNode.actions = [...terminatesNode.actions, ...[]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    

        return [startsNode,terminatesNode]
    }

    visitParallelBloc(node: ParallelBloc): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule startsParallelBloc
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishParallelBloc
   //premise: statements:Statement[],terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        let startsParallelBlocForkNode: Node = new Fork("startsParallelBlocForkNode")
        this.ccfg.addNode(startsParallelBlocForkNode)
        {let e = this.ccfg.addEdge(previousNode,startsParallelBlocForkNode)
        e.guards = [...e.guards, ...[]] //CC
        }
        // startsParallelBlocForkNode.actions = [...startsParallelBlocForkNode.actions, ...[]] //CC


        let startsParallelBlocFakeNode: Node = new AndJoin("startsParallelBlocFakeNode")    
        this.ccfg.addNode(startsParallelBlocFakeNode)    
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(startsParallelBlocForkNode,childStartsNode)
            this.ccfg.addEdge(childTerminatesNode,startsParallelBlocFakeNode)
        }
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    
        let finishParallelBlocLastOfNode: Node = new AndJoin("finishParallelBlocLastOfNode")
        this.ccfg.replaceNode(startsParallelBlocFakeNode,finishParallelBlocLastOfNode)                    
                    
        previousNode = finishParallelBlocLastOfNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        // terminatesNode.actions = [...terminatesNode.actions, ...[]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    

        return [startsNode,terminatesNode]
    }

    visitVariable(node: Variable): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[`sigma["${getName(node)}currentValue"] = new int();`])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule initializeVar
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[`int ${getName(node)}1385 = ${node.initialValue}; //undefined`,`*((int*)sigma["${getName(node)}currentValue"]) = ${getName(node)}1385;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..`]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        // terminatesNode.actions = [...terminatesNode.actions, ...[]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    

        return [startsNode,terminatesNode]
    }

    visitVarRef(node: VarRef): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule accessVarRef
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        // terminatesNode.actions = [...terminatesNode.actions, ...[]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[`int ${getName(node)}1588 = *(int *) sigma["${getName(node.theVar)}currentValue"];//currentValue}`,`int ${getName(node)}terminates =  ${getName(node)}1588;`]] //GG
    

        return [startsNode,terminatesNode]
    }

    visitIf(node: If): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
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
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        let [condStartsNode,condTerminatesNode] = this.visit(node.cond)
        {let e = this.ccfg.addEdge(previousNode,condStartsNode)
        e.guards = [...e.guards, ...[]] //FF
        }
        // condStartsNode.actions = [...condStartsNode.actions, ...[]] //FF
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    
        let condChoiceNodecondTrueStart = this.ccfg.getNodeFromName("condChoiceNode")
        if (condChoiceNodecondTrueStart == undefined) {
            let condChoiceNode = new Choice("condChoiceNode")
            this.ccfg.addNode(condChoiceNode)
            this.ccfg.addEdge(condTerminatesNode,condChoiceNode)
            condChoiceNodecondTrueStart = condChoiceNode
        }else{
            this.ccfg.addEdge(condTerminatesNode,condChoiceNodecondTrueStart)
        }
        
        previousNode = condChoiceNodecondTrueStart
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        let [thenStartsNode,thenTerminatesNode] = this.visit(node.then)
        {let e = this.ccfg.addEdge(previousNode,thenStartsNode)
        e.guards = [...e.guards, ...[`(bool)${getName(node.cond)}terminates == true`]] //FF
        }
        // thenStartsNode.actions = [...thenStartsNode.actions, ...[`(bool)${getName(node.cond)}terminates == true`]] //FF
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    
        let condChoiceNodecondFalseStart = this.ccfg.getNodeFromName("condChoiceNode")
        if (condChoiceNodecondFalseStart == undefined) {
            let condChoiceNode = new Choice("condChoiceNode")
            this.ccfg.addNode(condChoiceNode)
            this.ccfg.addEdge(condTerminatesNode,condChoiceNode)
            condChoiceNodecondFalseStart = condChoiceNode
        }else{
            this.ccfg.addEdge(condTerminatesNode,condChoiceNodecondFalseStart)
        }
        
        previousNode = condChoiceNodecondFalseStart
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        let [elseStartsNode,elseTerminatesNode] = this.visit(node.else)
        {let e = this.ccfg.addEdge(previousNode,elseStartsNode)
        e.guards = [...e.guards, ...[`(bool)${getName(node.cond)}terminates == false`]] //FF
        }
        // elseStartsNode.actions = [...elseStartsNode.actions, ...[`(bool)${getName(node.cond)}terminates == false`]] //FF
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    
        let condStopOrJoinNode: Node = new OrJoin("condStopOrJoinNode")
        this.ccfg.addNode(condStopOrJoinNode)
        this.ccfg.addEdge(elseTerminatesNode,condStopOrJoinNode)
        this.ccfg.addEdge(thenTerminatesNode,condStopOrJoinNode)
                
        condStopOrJoinNode.actions = [...condStopOrJoinNode.actions, ...[]] //HH
        
        previousNode = condStopOrJoinNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        // terminatesNode.actions = [...terminatesNode.actions, ...[]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    

        return [startsNode,terminatesNode]
    }

    visitAssignment(node: Assignment): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule executeAssignment
   //premise: starts:event
   //conclusion: expr:Expr,starts:event
// rule executeAssignment2
   //premise: expr:Expr,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        let [exprStartsNode,exprTerminatesNode] = this.visit(node.expr)
        {let e = this.ccfg.addEdge(previousNode,exprStartsNode)
        e.guards = [...e.guards, ...[]] //FF
        }
        // exprStartsNode.actions = [...exprStartsNode.actions, ...[]] //FF
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    
        exprTerminatesNode.actions = [...exprTerminatesNode.actions, ...[`int ${getName(node)}2363 = ${getName(node.expr)}terminates;//valuedEventRef resRight`]] //II
        
        previousNode = exprTerminatesNode
    
    previousNode.actions =[...previousNode.actions, ...[`int ${getName(node)}2529 = ${getName(node)}2363; //resRight`,`*((int*)sigma["${getName(node.variable)}currentValue"]) = ${getName(node)}2529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..`]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        // terminatesNode.actions = [...terminatesNode.actions, ...[]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    

        return [startsNode,terminatesNode]
    }

    visitConjunction(node: Conjunction): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
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
   //premise: rhs:BooleanExpression,terminates:event,lhs:BooleanExpression,terminates:event
   //conclusion: terminates:event

        let joinNode: Node = new OrJoin(node.$cstNode?.text+" or join")
        this.ccfg.addNode(joinNode)
        this.ccfg.addEdge(joinNode,terminatesNode)
        
        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        let evaluateConjunctionForkNode: Node = new Fork("evaluateConjunctionForkNode")
        this.ccfg.addNode(evaluateConjunctionForkNode)
        {let e = this.ccfg.addEdge(previousNode,evaluateConjunctionForkNode)
        e.guards = [...e.guards, ...[]] //BB
        }
        // evaluateConjunctionForkNode.actions = [...evaluateConjunctionForkNode.actions, ...[]] //BB
        
        let [lhsStartNode,lhsTerminatesNode] = this.visit(node.lhs)
        this.ccfg.addEdge(evaluateConjunctionForkNode,lhsStartNode)
        
        let [rhsStartNode,rhsTerminatesNode] = this.visit(node.rhs)
        this.ccfg.addEdge(evaluateConjunctionForkNode,rhsStartNode)
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    
        let lhsChoiceNodeevaluateConjunction2 = this.ccfg.getNodeFromName("lhsChoiceNode")
        if (lhsChoiceNodeevaluateConjunction2 == undefined) {
            let lhsChoiceNode = new Choice("lhsChoiceNode")
            this.ccfg.addNode(lhsChoiceNode)
            this.ccfg.addEdge(lhsTerminatesNode,lhsChoiceNode)
            lhsChoiceNodeevaluateConjunction2 = lhsChoiceNode
        }else{
            this.ccfg.addEdge(lhsTerminatesNode,lhsChoiceNodeevaluateConjunction2)
        }
        
        previousNode = lhsChoiceNodeevaluateConjunction2
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,joinNode)
        e.guards = [...e.guards, ...[`(bool)${getName(node.lhs)}terminates == false`]] //EE
        }
        // joinNode.actions = [...joinNode.actions, ...[`(bool)${getName(node.lhs)}terminates == false`]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[`bool ${getName(node)}terminates =  ${getName(node)}3725;`]] //GG
    
        let rhsChoiceNodeevaluateConjunction3 = this.ccfg.getNodeFromName("rhsChoiceNode")
        if (rhsChoiceNodeevaluateConjunction3 == undefined) {
            let rhsChoiceNode = new Choice("rhsChoiceNode")
            this.ccfg.addNode(rhsChoiceNode)
            this.ccfg.addEdge(rhsTerminatesNode,rhsChoiceNode)
            rhsChoiceNodeevaluateConjunction3 = rhsChoiceNode
        }else{
            this.ccfg.addEdge(rhsTerminatesNode,rhsChoiceNodeevaluateConjunction3)
        }
        
        previousNode = rhsChoiceNodeevaluateConjunction3
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,joinNode)
        e.guards = [...e.guards, ...[`(bool)${getName(node.rhs)}terminates == false`]] //EE
        }
        // joinNode.actions = [...joinNode.actions, ...[`(bool)${getName(node.rhs)}terminates == false`]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[`bool ${getName(node)}terminates =  ${getName(node)}3887;`]] //GG
    
        let evaluateConjunction4AndJoinNode: Node = new AndJoin("evaluateConjunction4AndJoinNode")
        this.ccfg.addNode(evaluateConjunction4AndJoinNode)
        this.ccfg.addEdge(rhsTerminatesNode,evaluateConjunction4AndJoinNode)
        this.ccfg.addEdge(lhsTerminatesNode,evaluateConjunction4AndJoinNode)
                
        let evaluateConjunction4ConditionNode: Node = new Choice("evaluateConjunction4ConditionNode")
        this.ccfg.addNode(evaluateConjunction4ConditionNode)
        this.ccfg.addEdge(evaluateConjunction4AndJoinNode,evaluateConjunction4ConditionNode)
            
        evaluateConjunction4ConditionNode.actions = [...evaluateConjunction4ConditionNode.actions, ...[]] //HH
        
        previousNode = evaluateConjunction4ConditionNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,joinNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        // joinNode.actions = [...joinNode.actions, ...[]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[`bool ${getName(node)}terminates =  ${getName(node)}4060;`]] //GG
    

        return [startsNode,terminatesNode]
    }

    visitPlus(node: Plus): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule startPlus
   //premise: starts:event
   //conclusion: right:Expr,starts:event
   //conclusion: right:Expr,starts:event,left:Expr,starts:event
// rule finishPlus
   //premise: right:Expr,terminates:event,left:Expr,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        let startPlusForkNode: Node = new Fork("startPlusForkNode")
        this.ccfg.addNode(startPlusForkNode)
        {let e = this.ccfg.addEdge(previousNode,startPlusForkNode)
        e.guards = [...e.guards, ...[]] //BB
        }
        // startPlusForkNode.actions = [...startPlusForkNode.actions, ...[]] //BB
        
        let [rightStartNode,rightTerminatesNode] = this.visit(node.right)
        this.ccfg.addEdge(startPlusForkNode,rightStartNode)
        
        let [leftStartNode,leftTerminatesNode] = this.visit(node.left)
        this.ccfg.addEdge(startPlusForkNode,leftStartNode)
        
    previousNode.actions =[...previousNode.actions, ...[]] //GG
    
        let finishPlusAndJoinNode: Node = new AndJoin("finishPlusAndJoinNode")
        this.ccfg.addNode(finishPlusAndJoinNode)
        this.ccfg.addEdge(rightTerminatesNode,finishPlusAndJoinNode)
        this.ccfg.addEdge(leftTerminatesNode,finishPlusAndJoinNode)
                
        finishPlusAndJoinNode.actions = [...finishPlusAndJoinNode.actions, ...[`int ${getName(node)}4273 = ${getName(node.right)}terminates;//valuedEventRef n2`,`int ${getName(node)}4298 = ${getName(node.left)}terminates;//valuedEventRef n1`]] //HH
        
        previousNode = finishPlusAndJoinNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        // terminatesNode.actions = [...terminatesNode.actions, ...[]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[`int ${getName(node)}4417 = ${getName(node)}4298; //n1`,`int ${getName(node)}4422 = ${getName(node)}4273; //n2`,`int ${getName(node)}4416 = ${getName(node)}4422 + ${getName(node)}4422;`,`int ${getName(node)}terminates =  ${getName(node)}4416;`]] //GG
    

        return [startsNode,terminatesNode]
    }

    visitBooleanConst(node: BooleanConst): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[`sigma["${getName(node)}constantValue"] = new bool(${node.value});`])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule evalBooleanConst
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]] //AA
    
        {let e = this.ccfg.addEdge(previousNode,terminatesNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        // terminatesNode.actions = [...terminatesNode.actions, ...[]]    //EE
        
    previousNode.actions =[...previousNode.actions, ...[`bool ${getName(node)}4636 = *(bool *) sigma["${getName(node)}constantValue"];//constantValue}`,`bool ${getName(node)}terminates =  ${getName(node)}4636;`]] //GG
    

        return [startsNode,terminatesNode]
    }

}
