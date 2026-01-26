
import fs from 'fs';
import { AstNode, Reference, isReference, AstUtils } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, NodeType, Hole, TypedElement, TimerHole, CollectionHole, AddSleepInstruction, AssignVarInstruction, CreateGlobalVarInstruction, CreateVarInstruction, OperationInstruction, ReturnInstruction, SetGlobalVarInstruction, SetVarFromGlobalInstruction, VerifyEqualInstruction, BroadcastEventEmission, BroadcastEventReception} from "ccfg";
import { FSMModel,FSM,Event,State,Transition } from "../../language/generated/ast.js";

var debug = false

export interface CompilerFrontEnd {

    createLocalCCFG(node: AstNode| Reference<AstNode>): CCFG;
    
     createFSMModelLocalCCFG(node: FSMModel): CCFG;
     createFSMLocalCCFG(node: FSM): CCFG;
     createEventLocalCCFG(node: Event): CCFG;
     createStateLocalCCFG(node: State): CCFG;
     createTransitionLocalCCFG(node: Transition): CCFG;

    generateCCFG(node: AstNode): CCFG;
    
}

export class TestFSMCompilerFrontEnd implements CompilerFrontEnd {
    constructor(debugMode: boolean = false){ 
        debug = debugMode
        if (debug){
            console.log("CompilerFrontEnd created")
        }
    }

    globalCCFG: CCFG = new CCFG();

  
    createLocalCCFG(node: AstNode | Reference<AstNode>): CCFG {
        if(isReference(node)){
            if(node.ref === undefined){
                throw new Error("not possible to visit an undefined AstNode")
            }
            node = node.ref
        }
        if(node.$type == "FSMModel"){
            return this.createFSMModelLocalCCFG(node as FSMModel);
        }
        if(node.$type == "FSM"){
            return this.createFSMLocalCCFG(node as FSM);
        }
        if(node.$type == "Event"){
            return this.createEventLocalCCFG(node as Event);
        }
        if(node.$type == "State"){
            return this.createStateLocalCCFG(node as State);
        }
        if(node.$type == "Transition"){
            return this.createTransitionLocalCCFG(node as Transition);
        }  
        throw new Error("Not implemented: " + node.$type);
    }
    
// rule FSMstart
   //premise: starts:event
   //conclusion: fsms:FSM[],fsm:unknown,starts:event
// rule FSMend
   //premise: fsms:FSM[],terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the FSMModel node
     * @param a FSMModel node 
     * @returns the local CCFG (with holes)
     */
    createFSMModelLocalCCFG(node: FSMModel): CCFG {
        let localCCFG = new CCFG()
    
        let startsFSMModelNode: Node = new Step(node,NodeType.starts,[])
        if(startsFSMModelNode.functionsDefs.length>0){
            startsFSMModelNode.returnType = "void"
        }
        startsFSMModelNode.functionsNames = [`init${startsFSMModelNode.uid}FSMModel`]
        localCCFG.addNode(startsFSMModelNode)
        localCCFG.initialState = startsFSMModelNode
        let terminatesFSMModelNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesFSMModelNode)
        
        let fsmsHole: CollectionHole = new CollectionHole(node.fsms)
        fsmsHole.isSequential = false
        fsmsHole.parallelSyncPolicy = "lastOf"
        localCCFG.addNode(fsmsHole)
        
        startsFSMModelNode.params = [...startsFSMModelNode.params, ...[]]
        startsFSMModelNode.returnType = "void"
        startsFSMModelNode.functionsNames = [`${startsFSMModelNode.uid}FSMstart`] // overwrite existing name
        startsFSMModelNode.functionsDefs =[...startsFSMModelNode.functionsDefs, ...[]] // GG
                //mark 1.5
        localCCFG.addEdge(startsFSMModelNode,fsmsHole)
        
        fsmsHole.params = [...fsmsHole.params, ...[]]
        fsmsHole.returnType = "void"
        fsmsHole.functionsNames = [`${fsmsHole.uid}FSMend`] // overwrite existing name
        fsmsHole.functionsDefs =[...fsmsHole.functionsDefs, ...[]] // GG
                //mark 1 { "name": "terminates", "type": "event"}
        {let e = localCCFG.addEdge(fsmsHole,terminatesFSMModelNode)
        e.guards = [...e.guards, ...[]]}
        
        return localCCFG;
    }
// rule init
   //premise: starts:event
   //conclusion: initialState:[State:ID],starts:event

    /**
     * returns the local CCFG of the FSM node
     * @param a FSM node 
     * @returns the local CCFG (with holes)
     */
    createFSMLocalCCFG(node: FSM): CCFG {
        let localCCFG = new CCFG()
    
        let startsFSMNode: Node = new Step(node,NodeType.starts,[])
        if(startsFSMNode.functionsDefs.length>0){
            startsFSMNode.returnType = "void"
        }
        startsFSMNode.functionsNames = [`init${startsFSMNode.uid}FSM`]
        localCCFG.addNode(startsFSMNode)
        localCCFG.initialState = startsFSMNode
        let terminatesFSMNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesFSMNode)
        
        let initialStateHole: Hole = new Hole(node.initialState.ref)
        localCCFG.addNode(initialStateHole)
        
        startsFSMNode.params = [...startsFSMNode.params, ...[]]
        startsFSMNode.returnType = "void"
        startsFSMNode.functionsNames = [`${startsFSMNode.uid}init`] // overwrite existing name
        startsFSMNode.functionsDefs =[...startsFSMNode.functionsDefs, ...[]] // GG
                //mark 0
        {let e = localCCFG.addEdge(startsFSMNode,initialStateHole)
        e.guards = [...e.guards, ...[]]}
            
        return localCCFG;
    }
// rule fugaceEvent
   //premise: starts:event
   //conclusion: waitFeedBack:event
// rule feedbackReceived
   //premise: waitFeedBack:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Event node
     * @param a Event node 
     * @returns the local CCFG (with holes)
     */
    createEventLocalCCFG(node: Event): CCFG {
        let localCCFG = new CCFG()
    
                let waitFeedBackEventNode: Node = new Step(node,NodeType.starts,[])

                localCCFG.addNode(waitFeedBackEventNode)
                // let terminateswaitFeedBackEventNode: Node = new Step(node,NodeType.terminates,[])

                // localCCFG.addNode(terminateswaitFeedBackEventNode)
                // localCCFG.addEdge(startswaitFeedBackEventNode,terminateswaitFeedBackEventNode)
                
        let startsEventNode: Node = new Step(node,NodeType.starts,[])
        if(startsEventNode.functionsDefs.length>0){
            startsEventNode.returnType = "void"
        }
        startsEventNode.functionsNames = [`init${startsEventNode.uid}Event`]
        localCCFG.addNode(startsEventNode)
        localCCFG.initialState = startsEventNode
        let terminatesEventNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesEventNode)
        
        startsEventNode.params = [...startsEventNode.params, ...[]]
        startsEventNode.returnType = "void"
        startsEventNode.functionsNames = [`${startsEventNode.uid}fugaceEvent`] // overwrite existing name
        startsEventNode.functionsDefs =[...startsEventNode.functionsDefs, ...[]] // GG
                //mark 1 { "name": "waitFeedBack", "type": "event"}
        {let e = localCCFG.addEdge(startsEventNode,waitFeedBackEventNode)
        e.guards = [...e.guards, ...[]]}
        
        waitFeedBackEventNode.params = [...waitFeedBackEventNode.params, ...[]]
        waitFeedBackEventNode.returnType = "void"
        waitFeedBackEventNode.functionsNames = [`${waitFeedBackEventNode.uid}feedbackReceived`] // overwrite existing name
        waitFeedBackEventNode.functionsDefs =[...waitFeedBackEventNode.functionsDefs, ...[]] // GG
                //mark 1 { "name": "terminates", "type": "event"}
        {let e = localCCFG.addEdge(waitFeedBackEventNode,terminatesEventNode)
        e.guards = [...e.guards, ...[]]}
        
        return localCCFG;
    }
// rule init
   //premise: starts:event
   //conclusion: outTransitions:[Transition:ID][],transition:unknown,starts:event
// rule end
   //premise: outTransitions:[Transition:ID][],terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the State node
     * @param a State node 
     * @returns the local CCFG (with holes)
     */
    createStateLocalCCFG(node: State): CCFG {
        let localCCFG = new CCFG()
    
        let startsStateNode: Node = new Step(node,NodeType.starts,[])
        if(startsStateNode.functionsDefs.length>0){
            startsStateNode.returnType = "void"
        }
        startsStateNode.functionsNames = [`init${startsStateNode.uid}State`]
        localCCFG.addNode(startsStateNode)
        localCCFG.initialState = startsStateNode
        let terminatesStateNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesStateNode)
        
        let outTransitionsHole: CollectionHole = new CollectionHole(node.outTransitions.map(t => t.ref).filter(ref => ref !== undefined).map(ref => ref as AstNode))
        outTransitionsHole.isSequential = false
        outTransitionsHole.parallelSyncPolicy = "firstOf"
        localCCFG.addNode(outTransitionsHole)
        
        startsStateNode.params = [...startsStateNode.params, ...[]]
        startsStateNode.returnType = "void"
        startsStateNode.functionsNames = [`${startsStateNode.uid}init`] // overwrite existing name
        startsStateNode.functionsDefs =[...startsStateNode.functionsDefs, ...[]] // GG
                //mark 1.5
        localCCFG.addEdge(startsStateNode,outTransitionsHole)
        
        outTransitionsHole.params = [...outTransitionsHole.params, ...[]]
        outTransitionsHole.returnType = "void"
        outTransitionsHole.functionsNames = [`${outTransitionsHole.uid}end`] // overwrite existing name
        outTransitionsHole.functionsDefs =[...outTransitionsHole.functionsDefs, ...[]] // GG
                //mark 1 { "name": "terminates", "type": "event"}
        {let e = localCCFG.addEdge(outTransitionsHole,terminatesStateNode)
        e.guards = [...e.guards, ...[]]}
        
        return localCCFG;
    }
// rule init
   //premise: starts:event
   //conclusion: waitEvent:Event
// rule fire
   //premise: guardEvent:[Event:ID],terminates:event
	//waitEvent:Event
   //conclusion: sentEvent:[Event:ID]
	//terminates:event
	//target:[State:ID],starts:event

    /**
     * returns the local CCFG of the Transition node
     * @param a Transition node 
     * @returns the local CCFG (with holes)
     */
    createTransitionLocalCCFG(node: Transition): CCFG {
        let localCCFG = new CCFG()
    
                let waitEventTransitionNode: Node = new Step(node,NodeType.starts,[])

                localCCFG.addNode(waitEventTransitionNode)
                // let terminateswaitEventTransitionNode: Node = new Step(node,NodeType.terminates,[])

                // localCCFG.addNode(terminateswaitEventTransitionNode)
                // localCCFG.addEdge(startswaitEventTransitionNode,terminateswaitEventTransitionNode)
                
        let startsTransitionNode: Node = new Step(node,NodeType.starts,[new CreateGlobalVarInstruction(`${this.getASTNodeUID(node)}waitEvent`,`unknown`)])
        if(startsTransitionNode.functionsDefs.length>0){
            startsTransitionNode.returnType = "void"
        }
        startsTransitionNode.functionsNames = [`init${startsTransitionNode.uid}Transition`]
        localCCFG.addNode(startsTransitionNode)
        localCCFG.initialState = startsTransitionNode
        let terminatesTransitionNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesTransitionNode)
        
        let targetHole: Hole = new Hole(node.target.ref)
        localCCFG.addNode(targetHole)
        
        startsTransitionNode.params = [...startsTransitionNode.params, ...[]]
        startsTransitionNode.returnType = "void"
        startsTransitionNode.functionsNames = [`${startsTransitionNode.uid}init`] // overwrite existing name
        startsTransitionNode.functionsDefs =[...startsTransitionNode.functionsDefs, ...[]] // GG
                //mark 1 { "name": "waitEvent", "type": "Event"}
        {let e = localCCFG.addEdge(startsTransitionNode,waitEventTransitionNode)
        e.guards = [...e.guards, ...[]]}
        
        let fireAndJoinNode: Node = new AndJoin(node)
        localCCFG.addNode(fireAndJoinNode)
                //premise participants in parallel collection but not a hole: { "name": "guardEvent", "type": "[Event:ID]"},{ "name": "terminates", "type": "event"}
        let guardEventReceptionNode : BroadcastEventReception = new BroadcastEventReception(node.guardEvent?.ref??node, "guardEvent")
        localCCFG.addNode(guardEventReceptionNode)
        localCCFG.addEdge(guardEventReceptionNode,fireAndJoinNode)
                       //premise participants in parallel collection but not a hole: { "name": "waitEvent", "type": "Event"}
        localCCFG.addEdge(waitEventTransitionNode,fireAndJoinNode)
        
        fireAndJoinNode.params = [...fireAndJoinNode.params, ...[]]
        fireAndJoinNode.returnType = "void"
        fireAndJoinNode.functionsNames = [`${fireAndJoinNode.uid}fire`] // overwrite existing name
        fireAndJoinNode.functionsDefs =[...fireAndJoinNode.functionsDefs, ...[]] // GG
    
                //conclusion participants in sequential collection but not a hole: { "name": "sentEvent", "type": "[Event:ID]"}
                
        let sentEventEmissionNode : BroadcastEventEmission = new BroadcastEventEmission(node.sentEvent?.ref??node, "sentEvent")
        localCCFG.addNode(sentEventEmissionNode)
        localCCFG.addEdge(fireAndJoinNode,sentEventEmissionNode)
        fireAndJoinNode = sentEventEmissionNode
        
                //conclusion participants in sequential collection but not a hole: { "name": "terminates", "type": "event"}
                
        localCCFG.addEdge(fireAndJoinNode,terminatesTransitionNode)
        fireAndJoinNode = terminatesTransitionNode
                        //mark 2
        localCCFG.addEdge(fireAndJoinNode,targetHole)
                    fireAndJoinNode = targetHole
                    
        return localCCFG;
    }

    generateCCFG(root: FSMModel, debug: boolean = false): CCFG {

        //pass 1: create local CCFGs for all nodes
        console.log("pass 1: create local CCFGs for all nodes")
        let astNodeToLocalCCFG = new Map<AstNode, CCFG>()
        for (let n of AstUtils.streamAst(root)){
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
        let startsTimerHoleNode: Node = new Step(node,NodeType.starts,[new AddSleepInstruction(hole.duration.toString())])
        startsTimerHoleNode.returnType = "void"
        startsTimerHoleNode.functionsNames = [`init${startsTimerHoleNode.uid}Timer`]
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
    
}
