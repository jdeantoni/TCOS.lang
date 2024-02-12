
import { AstNode } from "langium";
import { Graph, Node, Step } from "../../ccfg/ccfglib";
import { Model,Bloc,ParallelBloc,Variable,VarRef,If,Assignment,Conjunction,Plus } from "../../language-server/generated/ast";

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
        throw new Error("Not implemented: " + node.$type);
    }
    

    visitModel(node: Model): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
// rule statementsInOrder1
   //premise: starts:event
// rule finishModel
   //premise: statements:Statement[],last():Statement,terminates:event

        //TODO

        return [startsNode,terminatesNode]
    }

    visitBloc(node: Bloc): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
// rule startsBloc
   //premise: starts:event
// rule finishBloc
   //premise: statements:Statement[],last():Statement,terminates:event

        //TODO

        return [startsNode,terminatesNode]
    }

    visitParallelBloc(node: ParallelBloc): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
// rule startsParallelBloc
   //premise: starts:event
// rule finishParallelBloc
   //premise: 

        //TODO

        return [startsNode,terminatesNode]
    }

    visitVariable(node: Variable): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
// rule initializeVar
   //premise: starts:event

        //TODO

        return [startsNode,terminatesNode]
    }

    visitVarRef(node: VarRef): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
// rule accessVarRef
   //premise: starts:event

        //TODO

        return [startsNode,terminatesNode]
    }

    visitIf(node: If): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
// rule condStart
   //premise: starts:event
// rule condTrueStart
   //premise: cond:VarRef,terminates:event
// rule condFalseStart
   //premise: cond:VarRef,terminates:event
// rule condStop
   //premise: else:Bloc,terminates:event,then:Bloc,terminates:event

        //TODO

        return [startsNode,terminatesNode]
    }

    visitAssignment(node: Assignment): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
// rule executeAssignment
   //premise: starts:event
// rule executeAssignment2
   //premise: expr:Expr,terminates:event

        //TODO

        return [startsNode,terminatesNode]
    }

    visitConjunction(node: Conjunction): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
// rule evaluateConjunction
   //premise: starts:event
// rule evaluateConjunction2
   //premise: lhs:BooleanExpression,terminates:event
// rule evaluateConjunction3
   //premise: lhs:BooleanExpression,terminates:event
// rule evaluateConjunction4
   //premise: rhs:BooleanExpression,terminates:event

        //TODO

        return [startsNode,terminatesNode]
    }

    visitPlus(node: Plus): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
// rule startPlus
   //premise: starts:event
// rule FinishPlus
   //premise: right:Expr,terminates:event,left:Expr,terminates:event

        //TODO

        return [startsNode,terminatesNode]
    }

}
