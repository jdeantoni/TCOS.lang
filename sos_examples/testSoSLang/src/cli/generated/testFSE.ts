
import { AstNode } from "langium";
import { AndJoin, Choice, Fork, Graph, Node, OrJoin, Step } from "../../ccfg/ccfglib";
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
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
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
    
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let statementsTerminatesNode = previousNode
        
        previousNode = statementsTerminatesNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitBloc(node: Bloc): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
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
    
        for (var child of node.statements) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let statementsTerminatesNode = previousNode
        
        previousNode = statementsTerminatesNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitParallelBloc(node: ParallelBloc): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
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
        
        let finishParallelBlocLastOfNode: Node = new AndJoin("finishParallelBlocLastOfNode")
        this.ccfg.replaceNode(startsParallelBlocFakeNode,finishParallelBlocLastOfNode)                    
                    
        previousNode = finishParallelBlocLastOfNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitVariable(node: Variable): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule initializeVar
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitVarRef(node: VarRef): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule accessVarRef
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitIf(node: If): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
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
    
        let [condStartsNode,condTerminatesNode] = this.visit(node.cond)
        this.ccfg.addEdge(previousNode,condStartsNode)
        
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
    
        let [thenStartsNode,thenTerminatesNode] = this.visit(node.then)
        this.ccfg.addEdge(previousNode,thenStartsNode)
        
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
    
        let [elseStartsNode,elseTerminatesNode] = this.visit(node.else)
        this.ccfg.addEdge(previousNode,elseStartsNode)
        
        let condStopOrJoinNode: Node = new OrJoin("condStopOrJoinNode")
        this.ccfg.addNode(condStopOrJoinNode)
        this.ccfg.addEdge(elseTerminatesNode,condStopOrJoinNode)
        this.ccfg.addEdge(thenTerminatesNode,condStopOrJoinNode)
                
        previousNode = condStopOrJoinNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitAssignment(node: Assignment): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
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
    
        let [exprStartsNode,exprTerminatesNode] = this.visit(node.expr)
        this.ccfg.addEdge(previousNode,exprStartsNode)
        
        previousNode = exprTerminatesNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitConjunction(node: Conjunction): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
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
    
        let evaluateConjunctionForkNode: Node = new Fork("evaluateConjunctionForkNode")
        this.ccfg.addNode(evaluateConjunctionForkNode)
        this.ccfg.addEdge(previousNode,evaluateConjunctionForkNode)
        
        let [lhsStartNode,lhsTerminatesNode] = this.visit(node.lhs)
        this.ccfg.addEdge(evaluateConjunctionForkNode,lhsStartNode)
        
        let [rhsStartNode,rhsTerminatesNode] = this.visit(node.rhs)
        this.ccfg.addEdge(evaluateConjunctionForkNode,rhsStartNode)
        
        let evaluateConjunction2AndJoinNode: Node = new AndJoin("evaluateConjunction2AndJoinNode")
        this.ccfg.addNode(evaluateConjunction2AndJoinNode)
        this.ccfg.addEdge(lhsTerminatesNode,evaluateConjunction2AndJoinNode)
        this.ccfg.addEdge(rhsTerminatesNode,evaluateConjunction2AndJoinNode)
                
        let evaluateConjunction2ConditionNode: Node = new Choice("evaluateConjunction2ConditionNode")
        this.ccfg.addNode(evaluateConjunction2ConditionNode)
        this.ccfg.addEdge(evaluateConjunction2AndJoinNode,evaluateConjunction2ConditionNode)
            
        previousNode = evaluateConjunction2ConditionNode
    
        this.ccfg.addEdge(previousNode,joinNode)
        
        let evaluateConjunction3AndJoinNode: Node = new AndJoin("evaluateConjunction3AndJoinNode")
        this.ccfg.addNode(evaluateConjunction3AndJoinNode)
        this.ccfg.addEdge(rhsTerminatesNode,evaluateConjunction3AndJoinNode)
        this.ccfg.addEdge(lhsTerminatesNode,evaluateConjunction3AndJoinNode)
                
        let evaluateConjunction3ConditionNode: Node = new Choice("evaluateConjunction3ConditionNode")
        this.ccfg.addNode(evaluateConjunction3ConditionNode)
        this.ccfg.addEdge(evaluateConjunction3AndJoinNode,evaluateConjunction3ConditionNode)
            
        previousNode = evaluateConjunction3ConditionNode
    
        this.ccfg.addEdge(previousNode,joinNode)
        

        return [startsNode,terminatesNode]
    }

    visitPlus(node: Plus): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
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
    
        let startPlusForkNode: Node = new Fork("startPlusForkNode")
        this.ccfg.addNode(startPlusForkNode)
        this.ccfg.addEdge(previousNode,startPlusForkNode)
        
        let [rightStartNode,rightTerminatesNode] = this.visit(node.right)
        this.ccfg.addEdge(startPlusForkNode,rightStartNode)
        
        let [leftStartNode,leftTerminatesNode] = this.visit(node.left)
        this.ccfg.addEdge(startPlusForkNode,leftStartNode)
        
        let finishPlusAndJoinNode: Node = new AndJoin("finishPlusAndJoinNode")
        this.ccfg.addNode(finishPlusAndJoinNode)
        this.ccfg.addEdge(rightTerminatesNode,finishPlusAndJoinNode)
        this.ccfg.addEdge(leftTerminatesNode,finishPlusAndJoinNode)
                
        previousNode = finishPlusAndJoinNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitBooleanConst(node: BooleanConst): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule evalBooleanConst
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

}