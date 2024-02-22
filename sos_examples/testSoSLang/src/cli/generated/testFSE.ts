
import { AstNode, Reference, isReference } from "langium";
import { AndJoin, Choice, Fork, Graph, Node, OrJoin, Step } from "../../ccfg/ccfglib";

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
    ccfg: Graph = new Graph();

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
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let statementsTerminatesNode = previousNode
        
    previousNode.actions =[...previousNode.actions, ...[]]
    
        statementsTerminatesNode.actions = [...statementsTerminatesNode.actions, ...[]]
        
        previousNode = statementsTerminatesNode
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    

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
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let statementsTerminatesNode = previousNode
        
    previousNode.actions =[...previousNode.actions, ...[]]
    
        statementsTerminatesNode.actions = [...statementsTerminatesNode.actions, ...[]]
        
        previousNode = statementsTerminatesNode
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    

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
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let forkNode: Node = new Fork("startsParallelBlocForkNode")
        this.ccfg.addNode(forkNode)
        this.ccfg.addEdge(previousNode,forkNode)

        let startsParallelBlocFakeNode: Node = new AndJoin("startsParallelBlocFakeNode")    
        this.ccfg.addNode(startsParallelBlocFakeNode)    
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(forkNode,childStartsNode)
            this.ccfg.addEdge(childTerminatesNode,startsParallelBlocFakeNode)
        }
        
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let finishParallelBlocLastOfNode: Node = new AndJoin("finishParallelBlocLastOfNode")
        this.ccfg.replaceNode(startsParallelBlocFakeNode,finishParallelBlocLastOfNode)                    
                    
        previousNode = finishParallelBlocLastOfNode
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    

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
    
    previousNode.actions =[...previousNode.actions, ...[`void ${getName(node)}1385 = ${node.initialValue}; //undefined`,`*(sigma["${getName(node)}currentValue"]) = ${getName(node)}1385;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..`]]
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    

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
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        
    previousNode.actions =[...previousNode.actions, ...[`int ${getName(node)}1588 = *(int *) sigma["${getName(node.theVar)}currentValue"];//currentValue}`,`int ${getName(node)}terminates =  ${getName(node)}1588;`]]
    

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
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let [condStartsNode,condTerminatesNode] = this.visit(node.cond)
        this.ccfg.addEdge(previousNode,condStartsNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    
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
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let [thenStartsNode,thenTerminatesNode] = this.visit(node.then)
        this.ccfg.addEdge(previousNode,thenStartsNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    
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
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let [elseStartsNode,elseTerminatesNode] = this.visit(node.else)
        this.ccfg.addEdge(previousNode,elseStartsNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let condStopOrJoinNode: Node = new OrJoin("condStopOrJoinNode")
        this.ccfg.addNode(condStopOrJoinNode)
        this.ccfg.addEdge(elseTerminatesNode,condStopOrJoinNode)
        this.ccfg.addEdge(thenTerminatesNode,condStopOrJoinNode)
                
        previousNode = condStopOrJoinNode
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    

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
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let [exprStartsNode,exprTerminatesNode] = this.visit(node.expr)
        this.ccfg.addEdge(previousNode,exprStartsNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    
        exprTerminatesNode.actions = [...exprTerminatesNode.actions, ...[`int ${getName(node)}2363 = ${getName(node.expr)}terminates;//valuedEventRef resRight`]]
        
        previousNode = exprTerminatesNode
    
    previousNode.actions =[...previousNode.actions, ...[`int ${getName(node)}2529 = ${getName(node)}2363; //resRight`,`*(sigma["${getName(node.variable)}currentValue"]) = ${getName(node)}2529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..`]]
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    

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
   //premise: lhs:BooleanExpression,terminates:event,rhs:BooleanExpression,terminates:event
   //conclusion: terminates:event
// rule evaluateConjunction3
   //premise: rhs:BooleanExpression,terminates:event,lhs:BooleanExpression,terminates:event
   //conclusion: terminates:event

        let joinNode: Node = new OrJoin(node.$cstNode?.text+" or join")
        this.ccfg.addNode(joinNode)
        this.ccfg.addEdge(joinNode,terminatesNode)
        
        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let evaluateConjunctionForkNode: Node = new Fork("evaluateConjunctionForkNode")
        this.ccfg.addNode(evaluateConjunctionForkNode)
        this.ccfg.addEdge(previousNode,evaluateConjunctionForkNode)
        
        let [lhsStartNode,lhsTerminatesNode] = this.visit(node.lhs)
        this.ccfg.addEdge(evaluateConjunctionForkNode,lhsStartNode)
        
        let [rhsStartNode,rhsTerminatesNode] = this.visit(node.rhs)
        this.ccfg.addEdge(evaluateConjunctionForkNode,rhsStartNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let evaluateConjunction2AndJoinNode: Node = new AndJoin("evaluateConjunction2AndJoinNode")
        this.ccfg.addNode(evaluateConjunction2AndJoinNode)
        this.ccfg.addEdge(lhsTerminatesNode,evaluateConjunction2AndJoinNode)
        this.ccfg.addEdge(rhsTerminatesNode,evaluateConjunction2AndJoinNode)
                
        evaluateConjunction2AndJoinNode.actions = [...evaluateConjunction2AndJoinNode.actions, ...[`bool ${getName(node)}3612 = ${getName(node.rhs)}terminates;//valuedEventRef res`]]
                    
        let evaluateConjunction2ConditionNode: Node = new Choice("evaluateConjunction2ConditionNode")
        this.ccfg.addNode(evaluateConjunction2ConditionNode)
        this.ccfg.addEdge(evaluateConjunction2AndJoinNode,evaluateConjunction2ConditionNode)
            
        previousNode = evaluateConjunction2ConditionNode
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        this.ccfg.addEdge(previousNode,joinNode)
        
    previousNode.actions =[...previousNode.actions, ...[`bool ${getName(node)}3743 = ${getName(node)}3612; //res`,`bool ${getName(node)}terminates =  ${getName(node)}3743;`]]
    
        let evaluateConjunction3AndJoinNode: Node = new AndJoin("evaluateConjunction3AndJoinNode")
        this.ccfg.addNode(evaluateConjunction3AndJoinNode)
        this.ccfg.addEdge(rhsTerminatesNode,evaluateConjunction3AndJoinNode)
        this.ccfg.addEdge(lhsTerminatesNode,evaluateConjunction3AndJoinNode)
                
        evaluateConjunction3AndJoinNode.actions = [...evaluateConjunction3AndJoinNode.actions, ...[`bool ${getName(node)}3790 = ${getName(node.lhs)}terminates;//valuedEventRef res`]]
                    
        let evaluateConjunction3ConditionNode: Node = new Choice("evaluateConjunction3ConditionNode")
        this.ccfg.addNode(evaluateConjunction3ConditionNode)
        this.ccfg.addEdge(evaluateConjunction3AndJoinNode,evaluateConjunction3ConditionNode)
            
        previousNode = evaluateConjunction3ConditionNode
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        this.ccfg.addEdge(previousNode,joinNode)
        
    previousNode.actions =[...previousNode.actions, ...[`bool ${getName(node)}3921 = ${getName(node)}3612; //res`,`bool ${getName(node)}terminates =  ${getName(node)}3921;`]]
    

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
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let startPlusForkNode: Node = new Fork("startPlusForkNode")
        this.ccfg.addNode(startPlusForkNode)
        this.ccfg.addEdge(previousNode,startPlusForkNode)
        
        let [rightStartNode,rightTerminatesNode] = this.visit(node.right)
        this.ccfg.addEdge(startPlusForkNode,rightStartNode)
        
        let [leftStartNode,leftTerminatesNode] = this.visit(node.left)
        this.ccfg.addEdge(startPlusForkNode,leftStartNode)
        
    previousNode.actions =[...previousNode.actions, ...[]]
    
        let finishPlusAndJoinNode: Node = new AndJoin("finishPlusAndJoinNode")
        this.ccfg.addNode(finishPlusAndJoinNode)
        this.ccfg.addEdge(rightTerminatesNode,finishPlusAndJoinNode)
        this.ccfg.addEdge(leftTerminatesNode,finishPlusAndJoinNode)
                
        finishPlusAndJoinNode.actions = [...finishPlusAndJoinNode.actions, ...[`int ${getName(node)}4133 = ${getName(node.right)}terminates;//valuedEventRef n2`]]
                    
        finishPlusAndJoinNode.actions = [...finishPlusAndJoinNode.actions, ...[`int ${getName(node)}4158 = ${getName(node.left)}terminates;//valuedEventRef n1`]]
                    
        previousNode = finishPlusAndJoinNode
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        
    previousNode.actions =[...previousNode.actions, ...[`int ${getName(node)}4277 = ${getName(node)}4158; //n1`,`int ${getName(node)}4282 = ${getName(node)}4133; //n2`,`int ${getName(node)}4276 = ${getName(node)}4282 + ${getName(node)}4282;`,`int ${getName(node)}terminates =  ${getName(node)}4276;`]]
    

        return [startsNode,terminatesNode]
    }

    visitBooleanConst(node: BooleanConst): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts",[])
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule evalBooleanConst
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
    previousNode.actions =[...previousNode.actions, ...[]]
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        
    previousNode.actions =[...previousNode.actions, ...[`void ${getName(node)}4455 = ${node.value}; //undefined`,`void ${getName(node)}terminates =  ${getName(node)}4455;`]]
    

        return [startsNode,terminatesNode]
    }

}
