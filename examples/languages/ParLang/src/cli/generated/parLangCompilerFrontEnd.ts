
import fs from 'fs';
import { AstNode, Reference, isReference, streamAst } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, NodeType, Hole, TypedElement, TimerHole, CollectionHole} from "ccfg";
import { Program,Seq,Par,Perio,Stmt1,Stmt2 } from "../../language/generated/ast.js";

var debug = false

export interface CompilerFrontEnd {

    createLocalCCFG(node: AstNode| Reference<AstNode>): CCFG;
    
     createProgramLocalCCFG(node: Program): CCFG;
     createSeqLocalCCFG(node: Seq): CCFG;
     createParLocalCCFG(node: Par): CCFG;
     createPerioLocalCCFG(node: Perio): CCFG;
     createStmt1LocalCCFG(node: Stmt1): CCFG;
     createStmt2LocalCCFG(node: Stmt2): CCFG;

    generateCCFG(node: AstNode): CCFG;
    
}

export class ParLangCompilerFrontEnd implements CompilerFrontEnd {
    constructor(debugMode: boolean = false){ 
        debug = debugMode
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
        throw new Error("Not implemented: " + node.$type);
    }
    
// rule startsProgram
   //premise: starts:event
   //conclusion: stmt:Statement,starts:event
// rule finishProgram
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
        startsProgramNode.functionsNames = [`${startsProgramNode.uid}startsProgram`] //overwrite existing name
        startsProgramNode.functionsDefs =[...startsProgramNode.functionsDefs, ...[]] //GG
                //mark 0
        {let e = localCCFG.addEdge(startsProgramNode,stmtHole)
        e.guards = [...e.guards, ...[]]}
            
        stmtHole.params = [...stmtHole.params, ...[]]
        stmtHole.returnType = "void"
        stmtHole.functionsNames = [`${stmtHole.uid}finishProgram`] //overwrite existing name
        stmtHole.functionsDefs =[...stmtHole.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        {let e = localCCFG.addEdge(stmtHole,terminatesProgramNode)
        e.guards = [...e.guards, ...[]]}
        
        return localCCFG;
    }
// rule startsLhsSeq
   //premise: starts:event
   //conclusion: lhs:Statement,starts:event
// rule startsRhsSeq
   //premise: lhs:Statement,terminates:event
   //conclusion: rhs:Statement,starts:event
// rule finishSeq
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
        startsSeqNode.functionsNames = [`${startsSeqNode.uid}startsLhsSeq`] //overwrite existing name
        startsSeqNode.functionsDefs =[...startsSeqNode.functionsDefs, ...[]] //GG
                //mark 0
        {let e = localCCFG.addEdge(startsSeqNode,lhsHole)
        e.guards = [...e.guards, ...[]]}
            
        lhsHole.params = [...lhsHole.params, ...[]]
        lhsHole.returnType = "void"
        lhsHole.functionsNames = [`${lhsHole.uid}startsRhsSeq`] //overwrite existing name
        lhsHole.functionsDefs =[...lhsHole.functionsDefs, ...[]] //GG
                //mark 0
        {let e = localCCFG.addEdge(lhsHole,rhsHole)
        e.guards = [...e.guards, ...[]]}
            
        rhsHole.params = [...rhsHole.params, ...[]]
        rhsHole.returnType = "void"
        rhsHole.functionsNames = [`${rhsHole.uid}finishSeq`] //overwrite existing name
        rhsHole.functionsDefs =[...rhsHole.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        {let e = localCCFG.addEdge(rhsHole,terminatesSeqNode)
        e.guards = [...e.guards, ...[]]}
        
        return localCCFG;
    }
// rule startsPar
   //premise: starts:event
   //conclusion: lhs:Statement,starts:event
	//rhs:Statement,starts:event
// rule finishPar
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
        startsParNode.functionsNames = [`${startsParNode.uid}startsPar`] //overwrite existing name
        startsParNode.functionsDefs =[...startsParNode.functionsDefs, ...[]] //GG
    
        let forkstartsParNode: Node = new Fork(node)
        localCCFG.addNode(forkstartsParNode)
        localCCFG.addEdge(startsParNode,forkstartsParNode)
            
                    //mark 3
        localCCFG.addEdge(forkstartsParNode,lhsHole)
                                        //mark 3
        localCCFG.addEdge(forkstartsParNode,rhsHole)
                    
        let finishParAndJoinNode: Node = new AndJoin(node)
        localCCFG.addNode(finishParAndJoinNode)
                             //mark a
        localCCFG.addEdge(lhsHole,finishParAndJoinNode)
                                         //mark a
        localCCFG.addEdge(rhsHole,finishParAndJoinNode)
                            
        finishParAndJoinNode.params = [...finishParAndJoinNode.params, ...[]]
        finishParAndJoinNode.returnType = "void"
        finishParAndJoinNode.functionsNames = [`${finishParAndJoinNode.uid}finishPar`] //overwrite existing name
        finishParAndJoinNode.functionsDefs =[...finishParAndJoinNode.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        {let e = localCCFG.addEdge(finishParAndJoinNode,terminatesParNode)
        e.guards = [...e.guards, ...[]]}
        
        return localCCFG;
    }
// rule perioStart
   //premise: starts:event
   //conclusion: blocTrigger:Timer,starts:event
// rule perioExpires
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
        let startsPerioNode: Node = new Step(node,NodeType.starts,[`createGlobalVar,int,${this.getASTNodeUID(node)}blocTrigger`,`setGlobalVar,int,${this.getASTNodeUID(node)}blocTrigger,${node.p}`])
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
        startsPerioNode.functionsNames = [`${startsPerioNode.uid}perioStart`] //overwrite existing name
        startsPerioNode.functionsDefs =[...startsPerioNode.functionsDefs, ...[]] //GG
                //mark 0
        {let e = localCCFG.addEdge(startsPerioNode,blocTriggerHole)
        e.guards = [...e.guards, ...[]]}
            
        blocTriggerHole.params = [...blocTriggerHole.params, ...[]]
        blocTriggerHole.returnType = "void"
        blocTriggerHole.functionsNames = [`${blocTriggerHole.uid}perioExpires`] //overwrite existing name
        blocTriggerHole.functionsDefs =[...blocTriggerHole.functionsDefs, ...[]] //GG
    
        let forkperioExpiresNode: Node = new Fork(node)
        localCCFG.addNode(forkperioExpiresNode)
        localCCFG.addEdge(blocTriggerHole,forkperioExpiresNode)
            
                    //mark 3
        localCCFG.addEdge(forkperioExpiresNode,stmtHole)
                                        //mark 3
        localCCFG.addEdge(forkperioExpiresNode,blocTriggerHole)
                    
        return localCCFG;
    }
// rule fugaceStmt1
   //premise: starts:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Stmt1 node
     * @param a Stmt1 node 
     * @returns the local CCFG (with holes)
     */
    createStmt1LocalCCFG(node: Stmt1): CCFG {
        let localCCFG = new CCFG()
        let startsStmt1Node: Node = new Step(node,NodeType.starts,[`createGlobalVar,int,${this.getASTNodeUID(node)}fakeState`,`setGlobalVar,int,${this.getASTNodeUID(node)}fakeState,0`])
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
        startsStmt1Node.functionsNames = [`${startsStmt1Node.uid}fugaceStmt1`] //overwrite existing name
        startsStmt1Node.functionsDefs =[...startsStmt1Node.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        {let e = localCCFG.addEdge(startsStmt1Node,terminatesStmt1Node)
        e.guards = [...e.guards, ...[]]}
        
        return localCCFG;
    }
// rule fugaceStmt2
   //premise: starts:event
   //conclusion: terminates:event

    /**
     * returns the local CCFG of the Stmt2 node
     * @param a Stmt2 node 
     * @returns the local CCFG (with holes)
     */
    createStmt2LocalCCFG(node: Stmt2): CCFG {
        let localCCFG = new CCFG()
        let startsStmt2Node: Node = new Step(node,NodeType.starts,[])
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
        startsStmt2Node.functionsNames = [`${startsStmt2Node.uid}fugaceStmt2`] //overwrite existing name
        startsStmt2Node.functionsDefs =[...startsStmt2Node.functionsDefs, ...[]] //GG
                //mark 1 { "name": "terminates", "type": "event"}
        {let e = localCCFG.addEdge(startsStmt2Node,terminatesStmt2Node)
        e.guards = [...e.guards, ...[]]}
        
        return localCCFG;
    }

    generateCCFG(root: Program, debug: boolean = false): CCFG {

        //pass 1: create local CCFGs for all nodes
        console.log("pass 1: create local CCFGs for all nodes")
        let astNodeToLocalCCFG = new Map<AstNode, CCFG>()
        for (let n of streamAst(root)){
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
        let startsTimerHoleNode: Node = new Step(node,NodeType.starts,[`addSleep,${hole.duration}`])
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
