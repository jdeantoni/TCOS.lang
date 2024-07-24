
import fs from 'fs';
import { AstNode, Reference, isReference, streamAst } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, NodeType,Hole, TimerHole} from "../../ccfg/ccfglib.js";
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

export class ParLangSemanticsCompilerFrontEnd implements CompilerFrontEnd {
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
                        //mark 0

        localCCFG.addEdge(startsProgramNode,stmtHole)
                        //mark 0'

        localCCFG.addEdge(stmtHole,terminatesProgramNode)
        
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
                        //mark 0

        localCCFG.addEdge(startsSeqNode,lhsHole)
                        //mark 0

        localCCFG.addEdge(lhsHole,rhsHole)
                        //mark 0'

        localCCFG.addEdge(rhsHole,terminatesSeqNode)
        
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
            
        let forkstartsParNode: Node = new Fork(node)
        localCCFG.addNode(forkstartsParNode)
        localCCFG.addEdge(startsParNode,forkstartsParNode)
            
                    //mark 2

        localCCFG.addEdge(forkstartsParNode,lhsHole)
                                        //mark 2

        localCCFG.addEdge(forkstartsParNode,rhsHole)
                    
        let finishParOrJoinNode: Node = new OrJoin(node)
        localCCFG.addNode(finishParOrJoinNode)
                             //mark a

        localCCFG.addEdge(lhsHole,finishParOrJoinNode)
                                         //mark a

        localCCFG.addEdge(rhsHole,finishParOrJoinNode)
                                        //mark 0'

        localCCFG.addEdge(finishParOrJoinNode,terminatesParNode)
        
        return localCCFG;
    }
// rule perioStart
   //premise: starts:event
   //conclusion: blocTrigger:Timer,starts:event
// rule perioExpires
   //premise: blocTrigger:Timer,terminates:event
   //conclusion: blocTrigger:Timer,starts:event
	//stmt:Statement,starts:event

    /**
     * returns the local CCFG of the Perio node
     * @param a Perio node 
     * @returns the local CCFG (with holes)
     */
    createPerioLocalCCFG(node: Perio): CCFG {
        let localCCFG = new CCFG()
        let startsPerioNode: Node = new Step(node,NodeType.starts,[`createGlobalVar,int${node.p},${this.getASTNodeUID(node)}blocTrigger`])
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
                        //mark 0

        localCCFG.addEdge(startsPerioNode,blocTriggerHole)
            
        let forkperioExpiresNode: Node = new Fork(node)
        localCCFG.addNode(forkperioExpiresNode)
        localCCFG.addEdge(blocTriggerHole,forkperioExpiresNode)
            
                    //mark 2

        localCCFG.addEdge(forkperioExpiresNode,blocTriggerHole)
                                        //mark 2

        localCCFG.addEdge(forkperioExpiresNode,stmtHole)
                    
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
        let startsStmt1Node: Node = new Step(node,NodeType.starts,[`createGlobalVar,int0,${this.getASTNodeUID(node)}fakeState`])
        if(startsStmt1Node.functionsDefs.length>0){
            startsStmt1Node.returnType = "void"
        }
        startsStmt1Node.functionsNames = [`init${startsStmt1Node.uid}Stmt1`]
        localCCFG.addNode(startsStmt1Node)
        localCCFG.initialState = startsStmt1Node
        let terminatesStmt1Node: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminatesStmt1Node)
                    //mark 0'

        localCCFG.addEdge(startsStmt1Node,terminatesStmt1Node)
        
        return localCCFG;
    }
// rule fugaceStmt1
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
                    //mark 0'

        localCCFG.addEdge(startsStmt2Node,terminatesStmt2Node)
        
        return localCCFG;
    }

    generateCCFG(root: Program): CCFG {

        //pass 1: create local CCFGs for all nodes
        console.log("pass 1: create local CCFGs for all nodes")
        let astNodeToLocalCCFG = new Map<AstNode, CCFG>()
        let i = 0
        for (let n of streamAst(root)){
            let localCCFG = this.createLocalCCFG(n)
            
            let dotContent = localCCFG.toDot();
            fs.writeFileSync(`./localCCFG${i}.dot`, dotContent);
            i = i+1
            if(debug){
                console.log("debug !")
            }
            astNodeToLocalCCFG.set(n, localCCFG)
        }

        //pass 2: connect all local CCFGs
        console.log("pass 2: connect all local CCFGs")
        let globalCCFG = astNodeToLocalCCFG.get(root) as CCFG
        let holeNodes : Hole[] = this.retrieveHoles(globalCCFG)
        //fix point loop until all holes are filled
        while (holeNodes.length > 0) {
            console.log("holes to fill: "+holeNodes.length)
            for (let holeNode of holeNodes) {
                if (holeNode.getType() == "TimerHole") {
                    console.log("filling timer hole: "+holeNode.uid)
                    this.fillTimerHole(holeNode as TimerHole, globalCCFG)
                    continue
                }else{
                    console.log("filling hole: "+holeNode.uid)
                    if (holeNode.astNode === undefined) {
                        throw new Error("Hole has undefined astNode :"+holeNode.uid)
                    }
                    let holeNodeLocalCCFG = astNodeToLocalCCFG.get(holeNode.astNode) as CCFG
                    globalCCFG.fillHole(holeNode, holeNodeLocalCCFG)
                }
            }
            holeNodes = this.retrieveHoles(globalCCFG)
        }

        console.log("global CCFG: "+globalCCFG.toDot()) 

        return globalCCFG
    }

    fillTimerHole(hole: TimerHole, ccfg: CCFG) {
        let node = hole.astNode as AstNode
        let timerHoleLocalCCFG = new CCFG()
        let startsTimerHoleNode: Node = new Step(node,NodeType.starts,[`std::this_thread::sleep_for(${hole.duration}ms);`])
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

    // getOrVisitNode(node:AstNode | Reference<AstNode> |undefined): [Node,Node]{
    //     if(node === undefined){
    //         throw new Error("not possible to get or visit an undefined AstNode")
    //     }     
    //     if(isReference(node)){
    //         if(node.ref === undefined){
    //             throw new Error("not possible to visit an undefined AstNode")
    //         }
    //         node = node.ref
    //     }

    //     let startsNode = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
    //     if(startsNode !== undefined){
    //         let terminatesNode = this.ccfg.getNodeFromName("terminates"+getASTNodeUID(node))
    //         if(terminatesNode === undefined){
    //             throw new Error("impossible to be there")
    //         }
    //         return [startsNode,terminatesNode]
    //     }
    //     let [starts,terminates] = this.visit(node)
    //     return [starts,terminates]
    // }

    // retrieveNode(prefix: string, node: AstNode | AstNode[] | Reference<AstNode> | Reference<AstNode>[] | undefined): Node {
    //     if(node === undefined){
    //         throw new Error("not possible to retrieve a node from an undefined AstNode")
    //     }
    //     if(Array.isArray(node) || (prefix != "starts" && prefix != "terminates")){
    //         let n = this.ccfg.getNodeFromName(prefix+getASTNodeUID(node))
    //         if(n === undefined){
    //             throw new Error("impossible to retrieve "+prefix+getASTNodeUID(node)+ "from the ccfg")
    //         }
    //         return n
    //     }
    //     if(prefix == "starts"){
    //         return this.getOrVisitNode(node)[0]
    //     }
    //     if(prefix == "terminates"){
    //         return this.getOrVisitNode(node)[1]
    //     }       
    //     throw new Error("not possible to retrieve the node given as parameter: "+prefix+getASTNodeUID(node))
    // }
    // 
}
