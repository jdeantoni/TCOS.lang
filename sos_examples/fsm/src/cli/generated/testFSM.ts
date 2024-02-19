
import { AstNode } from "langium";
import { AndJoin, Choice, Fork, Graph, Node, OrJoin, Step } from "../../ccfg/ccfglib";
import { FSMModel,FSM,Event,State,Transition } from "../../language-server/generated/ast";

export interface SimpleLVisitor {
    visit(node: AstNode): [Node,Node];
    

     visitFSMModel(node: FSMModel): [Node,Node];
     visitFSM(node: FSM): [Node,Node];
     visitEvent(node: Event): [Node,Node];
     visitState(node: State): [Node,Node];
     visitTransition(node: Transition): [Node,Node];
}

export class CCFGVisitor implements SimpleLVisitor {
    ccfg: Graph = new Graph();

    visit(node: AstNode): [Node,Node] {
        if(node.$type == "FSMModel"){
            return this.visitFSMModel(node as FSMModel);
        }
        if(node.$type == "FSM"){
            return this.visitFSM(node as FSM);
        }
        if(node.$type == "Event"){
            return this.visitEvent(node as Event);
        }
        if(node.$type == "State"){
            return this.visitState(node as State);
        }
        if(node.$type == "Transition"){
            return this.visitTransition(node as Transition);
        }
        throw new Error("Not implemented: " + node.$type);
    }
    
    visitFSMModel(node: FSMModel): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule FSMstart
   //premise: starts:event
   //conclusion: fsms:FSM[],fsm:unknown,starts:event
// rule FSMend
   //premise: fsms:FSM[],terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
        let forkNode: Node = new Fork("FSMstartForkNode")
        this.ccfg.addNode(forkNode)
        this.ccfg.addEdge(previousNode,forkNode)

        let FSMstartFakeNode: Node = new AndJoin("FSMstartFakeNode")    
        this.ccfg.addNode(FSMstartFakeNode)    
        for (var child of node.fsms) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(forkNode,childStartsNode)
            this.ccfg.addEdge(childTerminatesNode,FSMstartFakeNode)
        }
        
        let FSMendLastOfNode: Node = new AndJoin("FSMendLastOfNode")
        this.ccfg.replaceNode(FSMstartFakeNode,FSMendLastOfNode)                    
                    
        previousNode = FSMendLastOfNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitFSM(node: FSM): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule init
   //premise: starts:event
   //conclusion: initialState:[State:ID],starts:event
// rule end
   //premise: terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
        if(node.initialState.ref != undefined){
          let [initialStateStartsNode,initialStateTerminatesNode] = this.visit(node.initialState.ref)
           this.ccfg.addEdge(previousNode,initialStateStartsNode)
           previousNode = initialStateTerminatesNode
        }
        
       
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitEvent(node: Event): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule fugaceEvent
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitState(node: State): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule init
   //premise: starts:event
   //conclusion: outTransitions:[Transition:ID][],transition:unknown,starts:event
// rule end
   //premise: outTransitions:[Transition:ID][],terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
        let forkNode: Node = new Fork("initForkNode")
        this.ccfg.addNode(forkNode)
        this.ccfg.addEdge(previousNode,forkNode)

        let initFakeNode: Node = new AndJoin("initFakeNode")    
        this.ccfg.addNode(initFakeNode)    
        for (var child of node.outTransitions) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            this.ccfg.addEdge(forkNode,childStartsNode)
            this.ccfg.addEdge(childTerminatesNode,initFakeNode)
        }
        
        let endLastOfNode: Node = new AndJoin("endLastOfNode")
        this.ccfg.replaceNode(initFakeNode,endLastOfNode)                    
                    
        previousNode = endLastOfNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

    visitTransition(node: Transition): [Node,Node] {
        let startsNode: Node = new Step(node.$cstNode?.text+" starts")
        this.ccfg.addNode(startsNode)
        let terminatesNode: Node = new Step(node.$cstNode?.text+" terminates")
        this.ccfg.addNode(terminatesNode)
        // rule init
   //premise: starts:event
   //conclusion: starts:event
// rule fire
   //premise: guardEvent:[Event:ID],terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
        previousNode = startsNode
    
        let [startsStartsNode,startsTerminatesNode] = this.visit(node.starts)
        this.ccfg.addEdge(previousNode,startsStartsNode)
        
        previousNode = guardEventTerminatesNode
    
        this.ccfg.addEdge(previousNode,terminatesNode)
        

        return [startsNode,terminatesNode]
    }

}
