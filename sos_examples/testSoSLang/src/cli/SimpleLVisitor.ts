import { AstNode } from "langium";
import { Assignment, Bloc, Conjunction, Disjunction, If, Model, ParallelBloc, Plus, Variable, VarRef } from "../language-server/generated/ast";
import { AndJoin, Choice, Fork, Graph, Node, OrJoin, Step } from "../ccfg/ccfglib";

export interface SimpleLVisitor {
    visit(node: AstNode): [Node,Node];

    visitAssignment(node: Assignment): [Node,Node];
    visitBloc(node: Bloc): [Node,Node];
    visitConjunction(node: Conjunction): [Node,Node];
    visitDisjunction(node: Disjunction): [Node,Node];
    visitIf(node: If): [Node,Node];
    visitModel(node: Model): [Node,Node];
    visitParallelBloc(node: ParallelBloc): [Node,Node];
    visitPlus(node: Plus): [Node,Node];
    visitVariable(node: Variable): [Node,Node];
    visitVarRef(node: VarRef): [Node,Node];
}

export class CCFGVisitor implements SimpleLVisitor {
    ccfg: Graph = new Graph();


    visit(node: AstNode): [Node,Node] {
        if (node.$type == "Assignment") {
            return this.visitAssignment(node as Assignment);
        }
        if (node.$type == "Bloc") {
            return this.visitBloc(node as Bloc);
        }
        if (node.$type == "Conjunction") {
            return this.visitConjunction(node as Conjunction);
        }
        if (node.$type == "Disjunction") {
            return this.visitDisjunction(node as Disjunction);
        }
        if (node.$type == "If") {
            return this.visitIf(node as If);
        }
        if (node.$type == "Model") {
            return this.visitModel(node as Model);
        }
        if (node.$type == "ParallelBloc") {
            return this.visitParallelBloc(node as ParallelBloc);
        }
        if (node.$type == "Plus") {
            return this.visitPlus(node as Plus);
        }
        if (node.$type == "Variable") {
            return this.visitVariable(node as Variable);
        }
        if (node.$type == "VarRef") {
            return this.visitVarRef(node as VarRef);
        }
        throw new Error("Not implemented: " + node.$type);
    }



    visitAssignment(node: Assignment): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        
        let [exprStartNode,exprTerminatesNode] = this.visit(node.expr)

        this.ccfg.addEdge(startsNode,exprStartNode)
        this.ccfg.addEdge(exprTerminatesNode,terminatesNode)

        return [startsNode,terminatesNode]
    }
    visitBloc(node: Bloc): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        
        let previous = startsNode
        for (var child of node.statements) {
            let [childStartNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(previous,childStartNode)
            previous = childTerminatesNode
        }
        this.ccfg.addEdge(previous,terminatesNode)

        return [startsNode,terminatesNode]
    }

    visitConjunction(node: Conjunction): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        
    //lazy version

        let [leftStartNode,leftTerminatesNode] = this.visit(node.lhs)
        let [rightStartNode,rightTerminatesNode] = this.visit(node.rhs)

        this.ccfg.addEdge(startsNode,leftStartNode)

        let joinNode: Node = new OrJoin(node.$cstNode?.text+" or join")
        this.ccfg.addNode(joinNode)
        let choiceNode: Node = new Choice(node.$cstNode?.text+" choice")
        this.ccfg.addNode(choiceNode)


        this.ccfg.addEdge(leftTerminatesNode,choiceNode)
        this.ccfg.addEdge(choiceNode, rightStartNode, "true")
        this.ccfg.addEdge(choiceNode,joinNode, "false")
        this.ccfg.addEdge(rightTerminatesNode,joinNode)

        this.ccfg.addEdge(joinNode,terminatesNode)

        return [startsNode,terminatesNode]
    }
    visitDisjunction(node: Disjunction): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        
    //lazy version

        let [leftStartNode,leftTerminatesNode] = this.visit(node.lhs)
        let [rightStartNode,rightTerminatesNode] = this.visit(node.rhs)

        this.ccfg.addEdge(startsNode,leftStartNode)

        let joinNode: Node = new OrJoin(node.$cstNode?.text+" or join")
        this.ccfg.addNode(joinNode)
        let choiceNode: Node = new Choice(node.$cstNode?.text+" choice")
        this.ccfg.addNode(choiceNode)


        this.ccfg.addEdge(leftTerminatesNode,choiceNode)
        this.ccfg.addEdge(choiceNode, rightStartNode, "false")
        this.ccfg.addEdge(choiceNode,joinNode, "true")
        this.ccfg.addEdge(rightTerminatesNode,joinNode)

        this.ccfg.addEdge(joinNode,terminatesNode)

        return [startsNode,terminatesNode]
    }
    visitIf(node: If): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        
        let [condStartNode,condTerminatesNode] = this.visit(node.cond)
        let [thenStartNode,thenTerminatesNode] = this.visit(node.then)

        this.ccfg.addEdge(startsNode,condStartNode)
        let choiceNode: Node = new Choice(node.$cstNode?.text+" choice")
        this.ccfg.addNode(choiceNode)
        
        this.ccfg.addEdge(condTerminatesNode,choiceNode)
        this.ccfg.addEdge(choiceNode,thenStartNode, "true")


        if(node.else != undefined){
            let [elseStartNode,elseTerminatesNode] = this.visit(node.else)
            let joinNode: Node = new OrJoin(node.$cstNode?.text+" or join")
            this.ccfg.addNode(joinNode)
            this.ccfg.addEdge(thenTerminatesNode,joinNode)
            this.ccfg.addEdge(choiceNode,elseStartNode, "false")
            this.ccfg.addEdge(elseTerminatesNode,joinNode)
            this.ccfg.addEdge(joinNode,terminatesNode)
        }else{
            this.ccfg.addEdge(choiceNode,terminatesNode, "false")
            this.ccfg.addEdge(thenTerminatesNode,terminatesNode)
        }


        return [startsNode,terminatesNode]
    }
    visitModel(node: Model): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        
        let previous = startsNode
        for (var child of node.statements) {
            let [childStartNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(previous,childStartNode)
            previous = childTerminatesNode
        }
        this.ccfg.addEdge(previous,terminatesNode)

        return [startsNode,terminatesNode]
    }
    visitParallelBloc(node: ParallelBloc): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        let joinNode: Node = new AndJoin(node.$cstNode?.text+" and join")
        this.ccfg.addNode(joinNode)
        let forkNode: Node = new Fork(node.$cstNode?.text+" fork")
        this.ccfg.addNode(forkNode)

        this.ccfg.addEdge(startsNode,forkNode)

        for (var child of node.statements) {
            let [childStartNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(forkNode,childStartNode)
            this.ccfg.addEdge(childTerminatesNode,joinNode)
        }
        this.ccfg.addEdge(joinNode,terminatesNode)

        return [startsNode,terminatesNode]
    }
    visitPlus(node: Plus): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        let joinNode: Node = new AndJoin(node.$cstNode?.text+" or join")
        this.ccfg.addNode(joinNode)
        let forkNode: Node = new Fork(node.$cstNode?.text+" fork")
        this.ccfg.addNode(forkNode)

        let [leftStartNode,leftTerminatesNode] = this.visit(node.left)
        this.ccfg.addEdge(startsNode,forkNode)
        this.ccfg.addEdge(forkNode,leftStartNode)
        this.ccfg.addEdge(leftTerminatesNode,joinNode)

        let [rightStartNode,rightTerminatesNode] = this.visit(node.right)
        this.ccfg.addEdge(forkNode,rightStartNode)
        this.ccfg.addEdge(rightTerminatesNode,joinNode)
        
        this.ccfg.addEdge(joinNode,terminatesNode)

        return [startsNode,terminatesNode]
    }
    visitVariable(node: Variable): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        
        this.ccfg.addEdge(startsNode,terminatesNode)

        return [startsNode,terminatesNode]
    }
    visitVarRef(node: VarRef): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        
        this.ccfg.addEdge(startsNode,terminatesNode)

        return [startsNode,terminatesNode]
    }
}

