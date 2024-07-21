
import { AstNode, Reference, isReference } from "langium";
import { AndJoin, Fork, CCFG, Node, OrJoin, Step } from "../../ccfg/ccfglib";
import { FSMModel,FSM,Event,State,Transition } from "../../language-server/generated/ast";

export interface SimpleLVisitor {
    visit(node: AstNode| Reference<AstNode>): [Node,Node];
    

     visitFSMModel(node: FSMModel): [ Node,Node];
     visitFSM(node: FSM): [ Node,Node];
     visitEvent(node: Event): [ Node,Node];
     visitState(node: State): [ Node,Node];
     visitTransition(node: Transition): [ Node,Node];
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
        // let ccfg: this.ccfg//ContainerNode = new ContainerNode(getASTNodeUID(node))
        // this.ccfg.addNode(ccfg) //temporaryly add the container to the global ccfg

        let startsFSMModelNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsFSMModelNode.functionsDefs.length>0){
            startsFSMModelNode.returnType = "void"
        }
        startsFSMModelNode.functionsNames = [`init${startsFSMModelNode.uid}FSMModel`]
        this.ccfg.addNode(startsFSMModelNode)
        let terminatesFSMModelNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesFSMModelNode)
        // rule FSMstart
   //premise: starts:event
   //conclusion: fsms:FSM[],fsm:unknown,starts:event
// rule FSMend
   //premise: fsms:FSM[],terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsgetASTNodeUID_node_FSMstart = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsgetASTNodeUID_node_FSMstart == undefined){
            throw new Error("impossible to be there startsgetASTNodeUID_node_FSMstart")
        }
        previousNode = startsgetASTNodeUID_node_FSMstart
    }
    
        let FSMstartForkNode: Node = new Fork("FSMstartForkNode")
        this.ccfg.addNode(FSMstartForkNode)
        {let e = this.ccfg.addEdge(previousNode,FSMstartForkNode)
        e.guards = [...e.guards, ...[]] //CC
        }

        let FSMstartFakeNode: Node = new AndJoin("FSMstartFakeNode")    
        this.ccfg.addNode(FSMstartFakeNode)    
        for (var child of node.fsms) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            // this.ccfg.addNode(childCCFG)
            this.ccfg.addEdge(FSMstartForkNode,childStartsNode)
            this.ccfg.addEdge(childTerminatesNode,FSMstartFakeNode)
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}FSMstart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    let FSMendLastOfNode: Node = new AndJoin("lastOfNode"+getASTNodeUID(node.fsms))
    this.ccfg.replaceNode(FSMstartFakeNode,FSMendLastOfNode)                    
                
    {
        let lastOfNodegetASTNodeUID_node_fsms_FSMend = this.ccfg.getNodeFromName("lastOfNode"+getASTNodeUID(node.fsms))
        if(lastOfNodegetASTNodeUID_node_fsms_FSMend == undefined){
            throw new Error("impossible to be there lastOfNodegetASTNodeUID_node_fsms_FSMend")
        }
        previousNode = lastOfNodegetASTNodeUID_node_fsms_FSMend
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesFSMModelNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}FSMend`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsFSMModelNode,terminatesFSMModelNode]
    }

    visitFSM(node: FSM): [Node,Node] {
        // let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))
        // this.ccfg.addNode(ccfg) //temporaryly add the container to the global ccfg


        let startsFSMNode: Node = new Step("starts"+getASTNodeUID(node),[`sigma["${getASTNodeUID(node)}currentState"] = new unknown();`])
        if(startsFSMNode.functionsDefs.length>0){
            startsFSMNode.returnType = "void"
        }
        startsFSMNode.functionsNames = [`init${startsFSMNode.uid}FSM`]
        this.ccfg.addNode(startsFSMNode)
        let terminatesFSMNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesFSMNode)
        // rule init
   //premise: starts:event
   //conclusion: initialState:[State:ID],starts:event

        let previousNode =undefined
        
    {
        let startsgetASTNodeUID_node_init = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsgetASTNodeUID_node_init == undefined){
            throw new Error("impossible to be there startsgetASTNodeUID_node_init")
        }
        previousNode = startsgetASTNodeUID_node_init
    }
    
    {let initStateModificationNode: Node = new Step("initStateModificationNode")
    this.ccfg.addNode(initStateModificationNode)
    let e = this.ccfg.addEdge(previousNode,initStateModificationNode)
    e.guards = [...e.guards, ...[]]
    previousNode = initStateModificationNode
    }
    previousNode.functionsNames = [...previousNode.functionsNames, ...[`${previousNode.uid}init`]] 
    previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`unknown ${getASTNodeUID(node)}546 = ${node.initialState}; //undefined`,`//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((unknown*)sigma["${getASTNodeUID(node)}currentState"])) = ${getASTNodeUID(node)}546;`]] //AA
    
        let initialStateCCFGinit = this.ccfg.getNodeFromName(getASTNodeUID(node.initialState))
        let initialStateStartsNodeinit = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node.initialState))
        let initialStateTerminatesNodeinit = this.ccfg.getNodeFromName("terminates"+getASTNodeUID(node.initialState))
        if (initialStateCCFGinit == undefined) {
            let [initialStateStartsNode,initialStateTerminatesNode] = this.visit(node.initialState)
            // this.ccfg.addNode(initialStateCCFG)
            // initialStateCCFGinit = initialStateCCFG
            initialStateStartsNodeinit = initialStateStartsNode
            initialStateTerminatesNodeinit = initialStateTerminatesNode
            if(initialStateTerminatesNodeinit == undefined || initialStateStartsNodeinit == undefined /*|| initialStateCCFGinit == undefined*/){
                throw new Error("impossible to be there initialStateTerminatesNodeinit initialStateStartsNodeinit initialStateCCFGinit")
            }
            {
            let e = this.ccfg.addEdge(previousNode,initialStateStartsNodeinit)
            e.guards = [...e.guards, ...[]] //FF
            }
            
        }else{
            let initialStateOrJoinNode = new OrJoin("orJoinNode"+getASTNodeUID(node.initialState))
            this.ccfg.addNode(initialStateOrJoinNode)
            let startsgetASTNodeUID_node_init = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
            if(startsgetASTNodeUID_node_init == undefined){
                throw new Error("impossible to be there startsgetASTNodeUID_node_init")
            }
            this.ccfg.addEdge(startsgetASTNodeUID_node_init,initialStateOrJoinNode)
            let initialStateStartsNode = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node.initialState))
            if(initialStateStartsNode != undefined){
                for(let e of initialStateStartsNode.inputEdges){
                    e.to = initialStateOrJoinNode
                    initialStateOrJoinNode.inputEdges.push(e)
                }
                initialStateStartsNode.inputEdges = []
                this.ccfg.addEdge(initialStateOrJoinNode,initialStateStartsNode)
            }
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}init`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsFSMNode,terminatesFSMNode]
    }

    visitEvent(node: Event): [Node,Node] {
        // let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))
        // this.ccfg.addNode(ccfg) //temporaryly add the container to the global ccfg


        let startsEventNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsEventNode.functionsDefs.length>0){
            startsEventNode.returnType = "void"
        }
        startsEventNode.functionsNames = [`init${startsEventNode.uid}Event`]
        this.ccfg.addNode(startsEventNode)
        let terminatesEventNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesEventNode)
        // rule fugaceEvent
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsgetASTNodeUID_node_fugaceEvent = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsgetASTNodeUID_node_fugaceEvent == undefined){
            throw new Error("impossible to be there startsgetASTNodeUID_node_fugaceEvent")
        }
        previousNode = startsgetASTNodeUID_node_fugaceEvent
    }
    
        {let e = this.ccfg.addEdge(previousNode,terminatesEventNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}fugaceEvent`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsEventNode,terminatesEventNode]
    }

    visitState(node: State): [Node,Node] {
        // let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))
        // this.ccfg.addNode(ccfg) //temporaryly add the container to the global ccfg


        let startsStateNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsStateNode.functionsDefs.length>0){
            startsStateNode.returnType = "void"
        }
        startsStateNode.functionsNames = [`init${startsStateNode.uid}State`]
        this.ccfg.addNode(startsStateNode)
        let terminatesStateNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesStateNode)
        // rule init
   //premise: starts:event
   //conclusion: outTransitions:[Transition:ID][],transition:unknown,starts:event
// rule end
   //premise: outTransitions:[Transition:ID][],terminates:event
   //conclusion: outTransitions:[Transition:ID][],transition:unknown,terminates:event
   //conclusion: outTransitions:[Transition:ID][],transition:unknown,terminates:event,terminates:event

        let StateOrJoinNode: Node = new OrJoin("orJoin"+getASTNodeUID(node))
        this.ccfg.addNode(StateOrJoinNode)
        this.ccfg.addEdge(StateOrJoinNode,terminatesStateNode)
        
        let previousNode =undefined
        
    {
        let startsgetASTNodeUID_node_init = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsgetASTNodeUID_node_init == undefined){
            throw new Error("impossible to be there startsgetASTNodeUID_node_init")
        }
        previousNode = startsgetASTNodeUID_node_init
    }
    
        let initForkNode: Node = new Fork("initForkNode")
        this.ccfg.addNode(initForkNode)
        {let e = this.ccfg.addEdge(previousNode,initForkNode)
        e.guards = [...e.guards, ...[]] //CC
        }

        let initFakeNode: Node = new AndJoin("initFakeNode")    
        this.ccfg.addNode(initFakeNode)    
        for (var child of node.outTransitions) {
            let [childStartsNode,childTerminatesNode] = this.visit(child)
            // this.ccfg.addNode(childCCFG)
            this.ccfg.addEdge(initForkNode,childStartsNode)
            this.ccfg.addEdge(childTerminatesNode,initFakeNode)
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}init`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    let endFirstOfNode: Node = new OrJoin("firstOfNode"+getASTNodeUID(node.outTransitions))
    this.ccfg.replaceNode(initFakeNode,endFirstOfNode)
                
    {
        let firstOfNodegetASTNodeUID_node_outTransitions_end = this.ccfg.getNodeFromName("firstOfNode"+getASTNodeUID(node.outTransitions))
        if(firstOfNodegetASTNodeUID_node_outTransitions_end == undefined){
            throw new Error("impossible to be there firstOfNodegetASTNodeUID_node_outTransitions_end")
        }
        previousNode = firstOfNodegetASTNodeUID_node_outTransitions_end
    }
    
        // let endForkNode: Node = new Fork("endForkNode")
        // this.ccfg.addNode(endForkNode)
        // {let e = this.ccfg.addEdge(previousNode,endForkNode)
        // e.guards = [...e.guards, ...[]] //BB
        // }
        
        // let [outTransitionsStartNode/*,outTransitionsTerminatesNode*/] = this.visit(node.outTransitions)
        // this.ccfg.addNode(outTransitionsCCFG)
        // this.ccfg.addEdge(endForkNode,outTransitionsStartNode)
        
        this.ccfg.addEdge(previousNode,StateOrJoinNode)

        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}end`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsStateNode,terminatesStateNode]
    }

    visitTransition(node: Transition): [Node,Node] {
        // let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))
        // this.ccfg.addNode(ccfg) //temporaryly add the container to the global ccfg


        let startsTransitionNode: Node = new Step("starts"+getASTNodeUID(node),[`sigma["${getASTNodeUID(node)}isSensitive"] = new bool(false);`])
        if(startsTransitionNode.functionsDefs.length>0){
            startsTransitionNode.returnType = "void"
        }
        startsTransitionNode.functionsNames = [`init${startsTransitionNode.uid}Transition`]
        this.ccfg.addNode(startsTransitionNode)
        let terminatesTransitionNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesTransitionNode)
        // rule init
   //premise: starts:event
// rule fire
   //premise: guardEvent:[Event:ID],terminates:event
   //conclusion: sentEvent:[Event:ID],starts:event
   //conclusion: sentEvent:[Event:ID],starts:event,terminates:event
   //conclusion: sentEvent:[Event:ID],starts:event,terminates:event,target:[State:ID],starts:event

        let previousNode =undefined
        
    {
        let startsgetASTNodeUID_node_init = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsgetASTNodeUID_node_init == undefined){
            throw new Error("impossible to be there startsgetASTNodeUID_node_init")
        }
        previousNode = startsgetASTNodeUID_node_init
    }
    
        // conclusion with no event emission
                
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}init`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesgetASTNodeUID_node_guardEvent_fire = this.getOrVisitNode(node.guardEvent)[1]
        if(terminatesgetASTNodeUID_node_guardEvent_fire == undefined){
            throw new Error("impossible to be there terminatesgetASTNodeUID_node_guardEvent_fire")
        }
        previousNode = terminatesgetASTNodeUID_node_guardEvent_fire
    }
    
        let fireForkNode: Node = new Fork("fireForkNode")
        this.ccfg.addNode(fireForkNode)
        {let e = this.ccfg.addEdge(previousNode,fireForkNode)
        e.guards = [...e.guards, ...[]] //BB
        }
        
        let [sentEventStartNode/*,sentEventTerminatesNode*/] =this.getOrVisitNode(node.sentEvent)
        // this.ccfg.addNode(sentEventCCFG)
        this.ccfg.addEdge(fireForkNode,sentEventStartNode)
        
        let [targetStartNode/*,targetTerminatesNode*/] = this.getOrVisitNode(node.target)
        // this.ccfg.addNode(targetCCFG)
        this.ccfg.addEdge(fireForkNode,targetStartNode)

        this.ccfg.addEdge(fireForkNode,terminatesTransitionNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}fire`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsTransitionNode,terminatesTransitionNode]
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
        console.log("getOrVisitNode: "+node.$cstNode?.text)

        let startsNode = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsNode !== undefined){
            console.log("          GET  "+startsNode.uid)
            let terminatesNode = this.ccfg.getNodeFromName("terminates"+getASTNodeUID(node))
            if(terminatesNode === undefined){
                throw new Error("impossible to be there")
            }
            return [startsNode,terminatesNode]
        }
        console.log("          VISIT")
        let [starts,terminates] = this.visit(node)
        return [starts,terminates]
    }
}