
import fs from 'fs';
import { AstNode, Reference, isReference, AstUtils } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, NodeType, Hole, TypedElement, TimerHole, CollectionHole, AddSleepInstruction, AssignVarInstruction, CreateGlobalVarInstruction, CreateVarInstruction, OperationInstruction, ReturnInstruction, SetGlobalVarInstruction, SetVarFromGlobalInstruction, VerifyEqualInstruction, BroadcastEventEmission, BroadcastEventReception, CreateEventChannelInstruction, EmitEventInstruction, WaitEventInstruction, AckEventInstruction} from "ccfg";
import { Program,Seq,Par,Perio,Stmt1,Stmt2,Notify,Wait,ComID } from "../../language/generated/ast.js";

var debug = false

export interface CompilerFrontEnd {

    createLocalCCFG(node: AstNode| Reference<AstNode>): CCFG;
    
     createProgramLocalCCFG(node: Program): CCFG;
     createSeqLocalCCFG(node: Seq): CCFG;
     createParLocalCCFG(node: Par): CCFG;
     createPerioLocalCCFG(node: Perio): CCFG;
     createStmt1LocalCCFG(node: Stmt1): CCFG;
     createStmt2LocalCCFG(node: Stmt2): CCFG;
     createNotifyLocalCCFG(node: Notify): CCFG;
     createWaitLocalCCFG(node: Wait): CCFG;
     createComIDLocalCCFG(node: ComID): CCFG;

    generateCCFG(node: AstNode): CCFG;
    
}

export class ParLangCompilerFrontEnd implements CompilerFrontEnd {
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
        if(node.$type == "Program"){
            return this.createProgramLocalCCFG(node as Program);
        }
        if(node.$type == "Seq"){
            return this.createSeqLocalCCFG(node as Seq);
        }
        if(node.$type == "Par"){
            return this.createParLocalCCFG(node as Par);
        }
        if(node.$type == "Perio"){
            return this.createPerioLocalCCFG(node as Perio);
        }
        if(node.$type == "Stmt1"){
            return this.createStmt1LocalCCFG(node as Stmt1);
        }
        if(node.$type == "Stmt2"){
            return this.createStmt2LocalCCFG(node as Stmt2);
        }
        if(node.$type == "Notify"){
            return this.createNotifyLocalCCFG(node as Notify);
        }
        if(node.$type == "Wait"){
            return this.createWaitLocalCCFG(node as Wait);
        }
        if(node.$type == "ComID"){
            return this.createComIDLocalCCFG(node as ComID);
        }  
        throw new Error("Not implemented: " + node.$type);
    }
    
// rule startsProgram
   //premise expr type: ExplicitEventRef
   //premise participants count: 1
   //premise: starts:event
   //conclusion: stmt:Statement,starts:event
// rule finishProgram
   //premise expr type: SingleRuleSync
   //premise participants count: 1
   //premise: stmt:Statement,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Program node
     * @param a Program node 
     * @returns the local CCFG (with holes)
     */
    createProgramLocalCCFG(node: Program): CCFG {
        let localCCFG = new CCFG()
    
        let startsProgramNode: Node = new Step(node,NodeType.starts,[])
        if(startsProgramNode.functionsDefs.length>0){
            startsProgramNode.returnType = "void"
        }
        startsProgramNode.functionsNames = [`init${startsProgramNode.uid}Program`]
        localCCFG.addNode(startsProgramNode)
        localCCFG.initialState = startsProgramNode
        let terminatesProgramNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesProgramNode)
        
        let stmtHole: Hole = new Hole(node.stmt)
        localCCFG.addNode(stmtHole)
        
        startsProgramNode.params = [...startsProgramNode.params, ...[]]
        startsProgramNode.returnType = "void"
        startsProgramNode.functionsNames = [`${startsProgramNode.uid}startsProgram`] // overwrite existing name
        startsProgramNode.functionsDefs =[...startsProgramNode.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(startsProgramNode,stmtHole)
        e.guards = [...e.guards, ...[]]}
    
        // premise handling for rule finishProgram: 1 participant groups

        stmtHole.params = [...stmtHole.params, ...[]]
        stmtHole.returnType = "void"
        stmtHole.functionsNames = [`${stmtHole.uid}finishProgram`] // overwrite existing name
        stmtHole.functionsDefs =[...stmtHole.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(stmtHole,terminatesProgramNode)
        e.guards = [...e.guards, ...[]]}
    

        return localCCFG;
    }
// rule startsLhsSeq
   //premise expr type: ExplicitEventRef
   //premise participants count: 1
   //premise: starts:event
   //conclusion: lhs:Statement,starts:event
// rule startsRhsSeq
   //premise expr type: SingleRuleSync
   //premise participants count: 1
   //premise: lhs:Statement,terminates:event
   //conclusion: rhs:Statement,starts:event
// rule finishSeq
   //premise expr type: SingleRuleSync
   //premise participants count: 1
   //premise: rhs:Statement,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Seq node
     * @param a Seq node 
     * @returns the local CCFG (with holes)
     */
    createSeqLocalCCFG(node: Seq): CCFG {
        let localCCFG = new CCFG()
    
        let startsSeqNode: Node = new Step(node,NodeType.starts,[])
        if(startsSeqNode.functionsDefs.length>0){
            startsSeqNode.returnType = "void"
        }
        startsSeqNode.functionsNames = [`init${startsSeqNode.uid}Seq`]
        localCCFG.addNode(startsSeqNode)
        localCCFG.initialState = startsSeqNode
        let terminatesSeqNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesSeqNode)
        
        let lhsHole: Hole = new Hole(node.lhs)
        localCCFG.addNode(lhsHole)
        
        let rhsHole: Hole = new Hole(node.rhs)
        localCCFG.addNode(rhsHole)
        
        startsSeqNode.params = [...startsSeqNode.params, ...[]]
        startsSeqNode.returnType = "void"
        startsSeqNode.functionsNames = [`${startsSeqNode.uid}startsLhsSeq`] // overwrite existing name
        startsSeqNode.functionsDefs =[...startsSeqNode.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(startsSeqNode,lhsHole)
        e.guards = [...e.guards, ...[]]}
    
        // premise handling for rule startsRhsSeq: 1 participant groups

        lhsHole.params = [...lhsHole.params, ...[]]
        lhsHole.returnType = "void"
        lhsHole.functionsNames = [`${lhsHole.uid}startsRhsSeq`] // overwrite existing name
        lhsHole.functionsDefs =[...lhsHole.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(lhsHole,rhsHole)
        e.guards = [...e.guards, ...[]]}
    
        // premise handling for rule finishSeq: 1 participant groups

        rhsHole.params = [...rhsHole.params, ...[]]
        rhsHole.returnType = "void"
        rhsHole.functionsNames = [`${rhsHole.uid}finishSeq`] // overwrite existing name
        rhsHole.functionsDefs =[...rhsHole.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(rhsHole,terminatesSeqNode)
        e.guards = [...e.guards, ...[]]}
    

        return localCCFG;
    }
// rule startsPar
   //premise expr type: ExplicitEventRef
   //premise participants count: 1
   //premise: starts:event
   //conclusion: lhs:Statement,starts:event
	//rhs:Statement,starts:event
// rule finishPar
   //premise expr type: EventConjunction
   //premise participants count: 2
   //premise: lhs:Statement,terminates:event
	//rhs:Statement,terminates:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Par node
     * @param a Par node 
     * @returns the local CCFG (with holes)
     */
    createParLocalCCFG(node: Par): CCFG {
        let localCCFG = new CCFG()
    
        let startsParNode: Node = new Step(node,NodeType.starts,[])
        if(startsParNode.functionsDefs.length>0){
            startsParNode.returnType = "void"
        }
        startsParNode.functionsNames = [`init${startsParNode.uid}Par`]
        localCCFG.addNode(startsParNode)
        localCCFG.initialState = startsParNode
        let terminatesParNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesParNode)
        
        let lhsHole: Hole = new Hole(node.lhs)
        localCCFG.addNode(lhsHole)
        
        let rhsHole: Hole = new Hole(node.rhs)
        localCCFG.addNode(rhsHole)
        
        startsParNode.params = [...startsParNode.params, ...[]]
        startsParNode.returnType = "void"
        startsParNode.functionsNames = [`${startsParNode.uid}startsPar`] // overwrite existing name
        startsParNode.functionsDefs =[...startsParNode.functionsDefs, ...[]] // GG
    
        let forkstartsParStage0: Node = new Fork(node)
        localCCFG.addNode(forkstartsParStage0)
        {let e = localCCFG.addEdge(startsParNode,forkstartsParStage0)
        e.guards = [...e.guards, ...[]]}
            

        {let e = localCCFG.addEdge(forkstartsParStage0,lhsHole)
        e.guards = [...e.guards, ...[]]}
    

        {let e = localCCFG.addEdge(forkstartsParStage0,rhsHole)
        e.guards = [...e.guards, ...[]]}
    
        // premise handling for rule finishPar: 2 participant groups
        // Creating AndJoin for conjunction/disjunction

        let finishParAndJoinNode: Node = new AndJoin(node)
        localCCFG.addNode(finishParAndJoinNode)
              //mark a
        localCCFG.addEdge(lhsHole,finishParAndJoinNode)
             //mark a
        localCCFG.addEdge(rhsHole,finishParAndJoinNode)

        finishParAndJoinNode.params = [...finishParAndJoinNode.params, ...[]]
        finishParAndJoinNode.returnType = "void"
        finishParAndJoinNode.functionsNames = [`${finishParAndJoinNode.uid}finishPar`] // overwrite existing name
        finishParAndJoinNode.functionsDefs =[...finishParAndJoinNode.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(finishParAndJoinNode,terminatesParNode)
        e.guards = [...e.guards, ...[]]}
    

        return localCCFG;
    }
// rule perioStart
   //premise expr type: ExplicitEventRef
   //premise participants count: 1
   //premise: starts:event
   //conclusion: blocTrigger:Timer,starts:event
// rule perioExpires
   //premise expr type: SingleRuleSync
   //premise participants count: 1
   //premise: blocTrigger:Timer,terminates:event
   //conclusion: stmt:Statement,starts:event
	//blocTrigger:Timer,starts:event

    /**
     * returns the local CCFG of the Perio node
     * @param a Perio node 
     * @returns the local CCFG (with holes)
     */
    createPerioLocalCCFG(node: Perio): CCFG {
        let localCCFG = new CCFG()
    
                let blocTriggerPerioNode: Node = new Step(node,NodeType.starts,[])

                localCCFG.addNode(blocTriggerPerioNode)
                // let terminatesblocTriggerPerioNode: Node = new Step(node,NodeType.terminates,[])

                // localCCFG.addNode(terminatesblocTriggerPerioNode)
                // localCCFG.addEdge(startsblocTriggerPerioNode,terminatesblocTriggerPerioNode)
                
        let startsPerioNode: Node = new Step(node,NodeType.starts,[new CreateGlobalVarInstruction(`${this.getASTNodeUID(node)}blocTrigger`,`int`),new SetGlobalVarInstruction(`${this.getASTNodeUID(node)}blocTrigger`,`${node.p}`,`int`)])
        if(startsPerioNode.functionsDefs.length>0){
            startsPerioNode.returnType = "void"
        }
        startsPerioNode.functionsNames = [`init${startsPerioNode.uid}Perio`]
        localCCFG.addNode(startsPerioNode)
        localCCFG.initialState = startsPerioNode
        let terminatesPerioNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesPerioNode)
        
        let blocTriggerHole: Hole = new TimerHole(node,node.p) //timer hole to ease specific filling
        localCCFG.addNode(blocTriggerHole)
        
        let stmtHole: Hole = new Hole(node.stmt)
        localCCFG.addNode(stmtHole)
        
        startsPerioNode.params = [...startsPerioNode.params, ...[]]
        startsPerioNode.returnType = "void"
        startsPerioNode.functionsNames = [`${startsPerioNode.uid}perioStart`] // overwrite existing name
        startsPerioNode.functionsDefs =[...startsPerioNode.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(startsPerioNode,blocTriggerHole)
        e.guards = [...e.guards, ...[]]}
    
        // premise handling for rule perioExpires: 1 participant groups

        blocTriggerHole.params = [...blocTriggerHole.params, ...[]]
        blocTriggerHole.returnType = "void"
        blocTriggerHole.functionsNames = [`${blocTriggerHole.uid}perioExpires`] // overwrite existing name
        blocTriggerHole.functionsDefs =[...blocTriggerHole.functionsDefs, ...[]] // GG
    
        let forkperioExpiresStage0: Node = new Fork(node)
        localCCFG.addNode(forkperioExpiresStage0)
        {let e = localCCFG.addEdge(blocTriggerHole,forkperioExpiresStage0)
        e.guards = [...e.guards, ...[]]}
            

        {let e = localCCFG.addEdge(forkperioExpiresStage0,stmtHole)
        e.guards = [...e.guards, ...[]]}
    

        {let e = localCCFG.addEdge(forkperioExpiresStage0,blocTriggerHole)
        e.guards = [...e.guards, ...[]]}
    

        return localCCFG;
    }
// rule fugaceStmt1
   //premise expr type: ExplicitEventRef
   //premise participants count: 1
   //premise: starts:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Stmt1 node
     * @param a Stmt1 node 
     * @returns the local CCFG (with holes)
     */
    createStmt1LocalCCFG(node: Stmt1): CCFG {
        let localCCFG = new CCFG()
    
                let fakeStateStmt1Node: Node = new Step(node,NodeType.starts,[])

                localCCFG.addNode(fakeStateStmt1Node)
                // let terminatesfakeStateStmt1Node: Node = new Step(node,NodeType.terminates,[])

                // localCCFG.addNode(terminatesfakeStateStmt1Node)
                // localCCFG.addEdge(startsfakeStateStmt1Node,terminatesfakeStateStmt1Node)
                
        let startsStmt1Node: Node = new Step(node,NodeType.starts,[new CreateGlobalVarInstruction(`${this.getASTNodeUID(node)}fakeState`,`int`), new SetGlobalVarInstruction(`${this.getASTNodeUID(node)}fakeState`,`0`,`int`)])
        if(startsStmt1Node.functionsDefs.length>0){
            startsStmt1Node.returnType = "void"
        }
        startsStmt1Node.functionsNames = [`init${startsStmt1Node.uid}Stmt1`]
        localCCFG.addNode(startsStmt1Node)
        localCCFG.initialState = startsStmt1Node
        let terminatesStmt1Node: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesStmt1Node)
        
        startsStmt1Node.params = [...startsStmt1Node.params, ...[]]
        startsStmt1Node.returnType = "void"
        startsStmt1Node.functionsNames = [`${startsStmt1Node.uid}fugaceStmt1`] // overwrite existing name
        startsStmt1Node.functionsDefs =[...startsStmt1Node.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(startsStmt1Node,terminatesStmt1Node)
        e.guards = [...e.guards, ...[]]}
    

        return localCCFG;
    }
// rule fugaceStmt2
   //premise expr type: ExplicitEventRef
   //premise participants count: 1
   //premise: starts:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Stmt2 node
     * @param a Stmt2 node 
     * @returns the local CCFG (with holes)
     */
    createStmt2LocalCCFG(node: Stmt2): CCFG {
        let localCCFG = new CCFG()
    
                let fakeStateStmt2Node: Node = new Step(node,NodeType.starts,[])

                localCCFG.addNode(fakeStateStmt2Node)
                // let terminatesfakeStateStmt2Node: Node = new Step(node,NodeType.terminates,[])

                // localCCFG.addNode(terminatesfakeStateStmt2Node)
                // localCCFG.addEdge(startsfakeStateStmt2Node,terminatesfakeStateStmt2Node)
                
        let startsStmt2Node: Node = new Step(node,NodeType.starts,[new CreateGlobalVarInstruction(`${this.getASTNodeUID(node)}fakeState`,`int`), new SetGlobalVarInstruction(`${this.getASTNodeUID(node)}fakeState`,`0`,`int`)])
        if(startsStmt2Node.functionsDefs.length>0){
            startsStmt2Node.returnType = "void"
        }
        startsStmt2Node.functionsNames = [`init${startsStmt2Node.uid}Stmt2`]
        localCCFG.addNode(startsStmt2Node)
        localCCFG.initialState = startsStmt2Node
        let terminatesStmt2Node: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesStmt2Node)
        
        startsStmt2Node.params = [...startsStmt2Node.params, ...[]]
        startsStmt2Node.returnType = "void"
        startsStmt2Node.functionsNames = [`${startsStmt2Node.uid}fugaceStmt2`] // overwrite existing name
        startsStmt2Node.functionsDefs =[...startsStmt2Node.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(startsStmt2Node,terminatesStmt2Node)
        e.guards = [...e.guards, ...[]]}
    

        return localCCFG;
    }
// rule startsNotifyAssynchronous
   //premise expr type: ExplicitEventRef
   //premise participants count: 1
   //premise: starts:event
   //conclusion: notifyID:[ComID:ID]
	//terminates:event

    /**
     * returns the local CCFG of the Notify node
     * @param a Notify node 
     * @returns the local CCFG (with holes)
     */
    createNotifyLocalCCFG(node: Notify): CCFG {
        let localCCFG = new CCFG()
    
        let startsNotifyNode: Node = new Step(node,NodeType.starts,[])
        if(startsNotifyNode.functionsDefs.length>0){
            startsNotifyNode.returnType = "void"
        }
        startsNotifyNode.functionsNames = [`init${startsNotifyNode.uid}Notify`]
        localCCFG.addNode(startsNotifyNode)
        localCCFG.initialState = startsNotifyNode
        let terminatesNotifyNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesNotifyNode)
        
        startsNotifyNode.params = [...startsNotifyNode.params, ...[]]
        startsNotifyNode.returnType = "void"
        startsNotifyNode.functionsNames = [`${startsNotifyNode.uid}startsNotifyAssynchronous`] // overwrite existing name
        startsNotifyNode.functionsDefs =[...startsNotifyNode.functionsDefs, ...[]] // GG
    
        let notifyIDEmissionNode0 : BroadcastEventEmission = new BroadcastEventEmission(node.notifyID?.ref??node, "notifyID")
        localCCFG.addNode(notifyIDEmissionNode0)
        notifyIDEmissionNode0.functionsNames = [`${notifyIDEmissionNode0.uid}emitnotifyID`]
        notifyIDEmissionNode0.functionsDefs = [new CreateVarInstruction(`${this.getASTNodeUID(node.notifyID?.ref??node)}notifyIDPayload`,`std::any`), new AssignVarInstruction(`${this.getASTNodeUID(node.notifyID?.ref??node)}notifyIDPayload`,`0`,`std::any`), new EmitEventInstruction(`${this.getASTNodeUID(node.notifyID?.ref??node)}`,`${this.getASTNodeUID(node.notifyID?.ref??node)}notifyIDPayload`,true)]
        notifyIDEmissionNode0.returnType = "void"
        

        {let e = localCCFG.addEdge(startsNotifyNode,notifyIDEmissionNode0)
        e.guards = [...e.guards, ...[]]}
    

        {let e = localCCFG.addEdge(notifyIDEmissionNode0,terminatesNotifyNode)
        e.guards = [...e.guards, ...[]]}
    

        return localCCFG;
    }
// rule startsWait
   //premise expr type: ExplicitEventRef
   //premise participants count: 1
   //premise: starts:event
   //conclusion: waitCom:event
// rule finishWait
   //premise expr type: EventConjunction
   //premise participants count: 2
   //premise: waitID:[ComID:ID],starts:event
	//waitCom:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Wait node
     * @param a Wait node 
     * @returns the local CCFG (with holes)
     */
    createWaitLocalCCFG(node: Wait): CCFG {
        let localCCFG = new CCFG()
    
                let waitComWaitNode: Node = new Step(node,NodeType.starts,[])

                localCCFG.addNode(waitComWaitNode)
                // let terminateswaitComWaitNode: Node = new Step(node,NodeType.terminates,[])

                // localCCFG.addNode(terminateswaitComWaitNode)
                // localCCFG.addEdge(startswaitComWaitNode,terminateswaitComWaitNode)
                
        let startsWaitNode: Node = new Step(node,NodeType.starts,[])
        if(startsWaitNode.functionsDefs.length>0){
            startsWaitNode.returnType = "void"
        }
        startsWaitNode.functionsNames = [`init${startsWaitNode.uid}Wait`]
        localCCFG.addNode(startsWaitNode)
        localCCFG.initialState = startsWaitNode
        let terminatesWaitNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesWaitNode)
        
        startsWaitNode.params = [...startsWaitNode.params, ...[]]
        startsWaitNode.returnType = "void"
        startsWaitNode.functionsNames = [`${startsWaitNode.uid}startsWait`] // overwrite existing name
        startsWaitNode.functionsDefs =[...startsWaitNode.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(startsWaitNode,waitComWaitNode)
        e.guards = [...e.guards, ...[]]}
    
        // premise handling for rule finishWait: 2 participant groups
        // Causal lowering for conjunction: trigger event then broadcast reception

        let waitIDReceptionNode : BroadcastEventReception = new BroadcastEventReception(node.waitID?.ref??node, "waitID")
        localCCFG.addNode(waitIDReceptionNode)
        waitIDReceptionNode.functionsNames = [`${waitIDReceptionNode.uid}receivewaitID`]
        waitIDReceptionNode.functionsDefs = [new WaitEventInstruction(`${this.getASTNodeUID(node.waitID?.ref??node)}`,`${this.getASTNodeUID(node.waitID?.ref??node)}waitIDPayload`), new AckEventInstruction(`${this.getASTNodeUID(node.waitID?.ref??node)}Token`)]
        waitIDReceptionNode.returnType = "void"
        localCCFG.addEdge(waitComWaitNode,waitIDReceptionNode)
        
        waitIDReceptionNode.params = [...waitIDReceptionNode.params, ...[]]
        waitIDReceptionNode.returnType = "void"
        waitIDReceptionNode.functionsNames = [`${waitIDReceptionNode.uid}finishWait`] // overwrite existing name
        waitIDReceptionNode.functionsDefs =[...waitIDReceptionNode.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(waitIDReceptionNode,terminatesWaitNode)
        e.guards = [...e.guards, ...[]]}
    

        return localCCFG;
    }
// rule fugaceCom
   //premise expr type: ExplicitEventRef
   //premise participants count: 1
   //premise: starts:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the ComID node
     * @param a ComID node 
     * @returns the local CCFG (with holes)
     */
    createComIDLocalCCFG(node: ComID): CCFG {
        let localCCFG = new CCFG()
    
        let startsComIDNode: Node = new Step(node,NodeType.starts,[])
        if(startsComIDNode.functionsDefs.length>0){
            startsComIDNode.returnType = "void"
        }
        startsComIDNode.functionsNames = [`init${startsComIDNode.uid}ComID`]
        localCCFG.addNode(startsComIDNode)
        localCCFG.initialState = startsComIDNode
        let terminatesComIDNode: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesComIDNode)
        
        startsComIDNode.params = [...startsComIDNode.params, ...[]]
        startsComIDNode.returnType = "void"
        startsComIDNode.functionsNames = [`${startsComIDNode.uid}fugaceCom`] // overwrite existing name
        startsComIDNode.functionsDefs =[...startsComIDNode.functionsDefs, ...[]] // GG
    
        {let e = localCCFG.addEdge(startsComIDNode,terminatesComIDNode)
        e.guards = [...e.guards, ...[]]}
    

        return localCCFG;
    }

    generateCCFG(root: Program, debug: boolean = false): CCFG {

        //pass 1: create local CCFGs for all nodes
        console.log("pass 1: create local CCFGs for all nodes")
        let astNodeToLocalCCFG = new Map<AstNode, CCFG>()
        for (let n of AstUtils.streamAst(root)){
            let localCCFG = this.createLocalCCFG(n)
            if(debug){
                let dotContent = localCCFG.toDot();
                fs.writeFileSync(`./generated/localCCFGs/localCCFG${localCCFG.initialState?.functionsNames[0].replace(/init\d+/g,"")}.dot`, dotContent);
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
                    if (debug) console.log("filling collection hole: "+holeNode.uid)
                        this.fillCollectionHole(holeNode as CollectionHole, globalCCFG, astNodeToLocalCCFG)
                        continue
                }else{
                    if (debug) console.log("filling hole: "+holeNode.uid)
                    if (holeNode.astNode === undefined) {
                        throw new Error("Hole has undefined astNode :"+holeNode.uid)
                    }
                    let holeNodeLocalCCFG = astNodeToLocalCCFG.get(holeNode.astNode) as CCFG
                    if (holeNodeLocalCCFG.alreadyUsedToFillHole) { //is already filled as a consequence of another hole being filled in this same iteration of the loop
                        let sourceEdge = holeNode.inputEdges[0];
                        let newEdge = globalCCFG.addEdge(sourceEdge.from, holeNodeLocalCCFG.initialState as Node, sourceEdge.label)
                        newEdge.guards = [...newEdge.guards, ...sourceEdge.guards]
                        //clean global CCFG from old hole and edge to hole
                        globalCCFG.nodes = globalCCFG.nodes.filter(node => node !== holeNode)
                        globalCCFG.edges = globalCCFG.edges.filter(edge => edge !== sourceEdge)
                    }else{
                        globalCCFG.fillHole(holeNode, holeNodeLocalCCFG)
                        holeNodeLocalCCFG.alreadyUsedToFillHole = true
                    }
                }
            }
            holeNodes = this.retrieveHoles(globalCCFG)

        }

        // Post-process once after all holes are filled.
        this.postProcessCCFGForChannelInitialization(globalCCFG);

        return globalCCFG
    }

    fillCollectionHole(hole: CollectionHole, globalCCFG: CCFG, astNodeToLocalCCFG: Map<AstNode, CCFG>) {
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
            if (holeNodeLocalCCFG.alreadyUsedToFillHole) { //is already filled as a consequence of another hole being filled in this same iteration of the loop
                let sourceEdge = hole.inputEdges[0];
                let newEdge = globalCCFG.addEdge(sourceEdge.from, holeNodeLocalCCFG.initialState as Node, sourceEdge.label)
                newEdge.guards = [...newEdge.guards, ...sourceEdge.guards]
                //clean global CCFG from old hole and edge to hole
                globalCCFG.nodes = globalCCFG.nodes.filter(node => node !== hole)
                globalCCFG.edges = globalCCFG.edges.filter(edge => edge !== sourceEdge)
            }else{
                globalCCFG.fillHole(hole, holeNodeLocalCCFG)
                holeNodeLocalCCFG.alreadyUsedToFillHole = true
            }
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
            joinNode.syncNodeIds.push(forkNode.uid)
            forkNode.syncNodeIds.push(joinNode.uid)
            holeNodeLocalCCFG.addEdge(joinNode,terminatesCollectionHoleNode)
            for (let e of hole.astNodeCollection){
                let collectionHole : Hole = new Hole(e)
                holeNodeLocalCCFG.addNode(collectionHole)
                holeNodeLocalCCFG.addEdge(forkNode,collectionHole)
                holeNodeLocalCCFG.addEdge(collectionHole,joinNode)
            }
             if (holeNodeLocalCCFG.alreadyUsedToFillHole) { //is already filled as a consequence of another hole being filled in this same iteration of the loop
                let sourceEdge = hole.inputEdges[0];
                let newEdge = globalCCFG.addEdge(sourceEdge.from, holeNodeLocalCCFG.initialState as Node, sourceEdge.label)
                newEdge.guards = [...newEdge.guards, ...sourceEdge.guards]
                //clean global CCFG from old hole and edge to hole
                globalCCFG.nodes = globalCCFG.nodes.filter(node => node !== hole)
                globalCCFG.edges = globalCCFG.edges.filter(edge => edge !== sourceEdge)
            }else{
                globalCCFG.fillHole(hole, holeNodeLocalCCFG)
                holeNodeLocalCCFG.alreadyUsedToFillHole = true
            }
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

    postProcessCCFGForChannelInitialization(ccfg: CCFG): void {
            if (ccfg.initialState == undefined) {
                return;
            }

            const channels = new Map<string, { listenerCount: number; payloadKind: string }>();

            // Collect all event channels from all nodes
            for (const node of ccfg.nodes) {
                for (const fdef of node.functionsDefs) {
                    if (fdef instanceof CreateEventChannelInstruction) {
                        const previous = channels.get(fdef.channelName);
                        if (previous == undefined) {
                            channels.set(fdef.channelName, { listenerCount: fdef.listenerCount, payloadKind: fdef.payloadKind });
                        } else {
                            channels.set(fdef.channelName, {
                                listenerCount: Math.max(previous.listenerCount, fdef.listenerCount),
                                payloadKind: previous.payloadKind != "void" ? previous.payloadKind : fdef.payloadKind
                            });
                        }
                    } else if (fdef instanceof EmitEventInstruction || fdef instanceof WaitEventInstruction) {
                        const channelName = fdef.channelName;
                        if (!channels.has(channelName)) {
                            channels.set(channelName, { listenerCount: 1, payloadKind: "void" });
                        }
                    }
                }
            }

            // Prepend channel initialization instructions to the start node
            const channelInstructions = [];
            for (const [channelName, cfg] of channels) {
                channelInstructions.push(new CreateEventChannelInstruction(channelName, cfg.listenerCount, cfg.payloadKind));
            }

            // Prepend to existing instructions at the start node
            ccfg.initialState.functionsDefs = [...channelInstructions, ...ccfg.initialState.functionsDefs];
        }
    
}
