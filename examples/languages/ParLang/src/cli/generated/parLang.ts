
import { AstNode, Reference, isReference } from "langium";
import { AndJoin, Fork, CCFG, Node, Step } from "../../ccfg/ccfglib.js";
import { Program,Seq,Par,Perio,Stmt1,Stmt2 } from "../../language/generated/ast.js";

export interface SimpleLVisitor {
    visit(node: AstNode| Reference<AstNode>): [Node,Node];
    

     visitProgram(node: Program): [Node,Node];
     visitSeq(node: Seq): [Node,Node];
     visitPar(node: Par): [Node,Node];
     visitPerio(node: Perio): [Node,Node];
     visitStmt1(node: Stmt1): [Node,Node];
     visitStmt2(node: Stmt2): [Node,Node];
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
        if(node.$type == "Program"){
            return this.visitProgram(node as Program);
        }
        if(node.$type == "Seq"){
            return this.visitSeq(node as Seq);
        }
        if(node.$type == "Par"){
            return this.visitPar(node as Par);
        }
        if(node.$type == "Perio"){
            return this.visitPerio(node as Perio);
        }
        if(node.$type == "Stmt1"){
            return this.visitStmt1(node as Stmt1);
        }
        if(node.$type == "Stmt2"){
            return this.visitStmt2(node as Stmt2);
        }
        throw new Error("Not implemented: " + node.$type);
    }
    
    visitProgram(node: Program): [Node,Node] {
        let startsProgramNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsProgramNode.functionsDefs.length>0){
            startsProgramNode.returnType = "void"
        }
        startsProgramNode.functionsNames = [`init${startsProgramNode.uid}Program`]
        this.ccfg.addNode(startsProgramNode)
        let terminatesProgramNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesProgramNode)
        // rule startsProgram
   //premise: starts:event
   //conclusion: stmt:Statement,starts:event
// rule finishProgram
   //premise: stmt:Statement,terminates:event
   //conclusion: terminates:event

        let previousNode =startsProgramNode
        
    {
        let startsnodestartsProgram = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodestartsProgram
    }
    
    //state modifications of startsProgram
        let stmtStartsNodestartsProgram = this.retrieveNode("starts",node.stmt)
        
            {
            let e = this.ccfg.addEdge(previousNode,stmtStartsNodestartsProgram)
            e.guards = [...e.guards, ...[]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}startsProgram`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_stmtfinishProgram = this.retrieveNode("terminates",node.stmt) //retrieve 1
        previousNode = terminatesnode_stmtfinishProgram
    }
    
    //state modifications of finishProgram
        {let e = this.ccfg.addEdge(previousNode,terminatesProgramNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}finishProgram`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsProgramNode,terminatesProgramNode]
    }

    visitSeq(node: Seq): [Node,Node] {
        let startsSeqNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsSeqNode.functionsDefs.length>0){
            startsSeqNode.returnType = "void"
        }
        startsSeqNode.functionsNames = [`init${startsSeqNode.uid}Seq`]
        this.ccfg.addNode(startsSeqNode)
        let terminatesSeqNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesSeqNode)
        // rule startsLhsSeq
   //premise: starts:event
   //conclusion: lhs:Statement,starts:event
// rule startsRhsSeq
   //premise: lhs:Statement,terminates:event
   //conclusion: rhs:Statement,starts:event
// rule finishSeq
   //premise: rhs:Statement,terminates:event
   //conclusion: terminates:event

        let previousNode =startsSeqNode
        
    {
        let startsnodestartsLhsSeq = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodestartsLhsSeq
    }
    
    //state modifications of startsLhsSeq
        let lhsStartsNodestartsLhsSeq = this.retrieveNode("starts",node.lhs)
        
            {
            let e = this.ccfg.addEdge(previousNode,lhsStartsNodestartsLhsSeq)
            e.guards = [...e.guards, ...[]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}startsLhsSeq`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_lhsstartsRhsSeq = this.retrieveNode("terminates",node.lhs) //retrieve 1
        previousNode = terminatesnode_lhsstartsRhsSeq
    }
    
    //state modifications of startsRhsSeq
        let rhsStartsNodestartsRhsSeq = this.retrieveNode("starts",node.rhs)
        
            {
            let e = this.ccfg.addEdge(previousNode,rhsStartsNodestartsRhsSeq)
            e.guards = [...e.guards, ...[]] //FF
            }
            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}startsRhsSeq`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_rhsfinishSeq = this.retrieveNode("terminates",node.rhs) //retrieve 1
        previousNode = terminatesnode_rhsfinishSeq
    }
    
    //state modifications of finishSeq
        {let e = this.ccfg.addEdge(previousNode,terminatesSeqNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}finishSeq`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsSeqNode,terminatesSeqNode]
    }

    visitPar(node: Par): [Node,Node] {
        let startsParNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsParNode.functionsDefs.length>0){
            startsParNode.returnType = "void"
        }
        startsParNode.functionsNames = [`init${startsParNode.uid}Par`]
        this.ccfg.addNode(startsParNode)
        let terminatesParNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesParNode)
        // rule startsPar
   //premise: starts:event
   //conclusion: lhs:Statement,starts:event
   //conclusion: lhs:Statement,starts:event,rhs:Statement,starts:event
// rule finishPar
   //premise: lhs:Statement,terminates:event,rhs:Statement,terminates:event
   //conclusion: terminates:event

        let previousNode =startsParNode
        
    {
        let startsnodestartsPar = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodestartsPar
    }
    
    //state modifications of startsPar
        let startsParForkNode: Node = new Fork("startsParForkNode")
        this.ccfg.addNode(startsParForkNode)
        {let e = this.ccfg.addEdge(previousNode,startsParForkNode)
        e.guards = [...e.guards, ...[]] //BB
        }
        
        let [lhsStartNode/*,lhsTerminatesNode*/] = this.getOrVisitNode(node.lhs)
        this.ccfg.addEdge(startsParForkNode,lhsStartNode)
        
        let [rhsStartNode/*,rhsTerminatesNode*/] = this.getOrVisitNode(node.rhs)
        this.ccfg.addEdge(startsParForkNode,rhsStartNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}startsPar`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    let finishParAndJoinNode: Node = new AndJoin("andJoinNode"+getASTNodeUID(node.lhs))
    this.ccfg.addNode(finishParAndJoinNode)
    let lhsTerminatesNodefinishPar = this.retrieveNode("terminates", node.lhs)
    let rhsTerminatesNodefinishPar = this.retrieveNode("terminates", node.rhs)
    this.ccfg.addEdge(lhsTerminatesNodefinishPar,finishParAndJoinNode)
    this.ccfg.addEdge(rhsTerminatesNodefinishPar,finishParAndJoinNode)
            
    {
        let multipleSynchroNode = this.ccfg.getNodeFromName("andJoinNode"+getASTNodeUID(node.lhs))
        if(multipleSynchroNode == undefined){
            throw new Error("impossible to be there andJoinNode"+getASTNodeUID(node.lhs))
        }
        multipleSynchroNode.params = [...multipleSynchroNode.params, ...[]]
        multipleSynchroNode.functionsDefs = [...multipleSynchroNode.functionsDefs, ...[]] //HH
    }
    
    {
        let andJoinNodenode_lhsfinishPar = this.retrieveNode("andJoinNode",node.lhs) //retrieve 1
        previousNode = andJoinNodenode_lhsfinishPar
    }
    
    //state modifications of finishPar
        {let e = this.ccfg.addEdge(previousNode,terminatesParNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}finishPar`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsParNode,terminatesParNode]
    }

    visitPerio(node: Perio): [Node,Node] {
        let startsPerioNode: Node = new Step("starts"+getASTNodeUID(node),[`sigma["${getASTNodeUID(node)}blocTrigger"] = new int(${node.p});`])
        if(startsPerioNode.functionsDefs.length>0){
            startsPerioNode.returnType = "void"
        }
        startsPerioNode.functionsNames = [`init${startsPerioNode.uid}Perio`]
        this.ccfg.addNode(startsPerioNode)
        let terminatesPerioNode: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesPerioNode)
        // rule perioStart
   //premise: starts:event
   //conclusion: blocTrigger:Timer,starts:event
// rule perioExpires
   //premise: blocTrigger:Timer,terminates:event
   //conclusion: blocTrigger:Timer,starts:event
   //conclusion: blocTrigger:Timer,starts:event,stmt:Statement,starts:event

        let previousNode =startsPerioNode
        
    {
        let startsnodeperioStart = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodeperioStart
    }
    
    //state modifications of perioStart
        let blocTriggerStartsNodeperioStart = this.retrieveNode("starts",node)
        
            let blocTriggerTerminatesNodeperioStart = this.retrieveNode("terminates",node)
            blocTriggerStartsNodeperioStart = new Step("startsblocTrigger"+getASTNodeUID(node))
            this.ccfg.addNode( blocTriggerStartsNodeperioStart)
            blocTriggerStartsNodeperioStart.functionsNames = [`starts${blocTriggerStartsNodeperioStart.uid}blocTrigger`]
            blocTriggerStartsNodeperioStart.returnType = "void"
            blocTriggerStartsNodeperioStart.functionsDefs = [...blocTriggerStartsNodeperioStart.functionsDefs, ...[`std::this_thread::sleep_for(${node.p}ms);`]] //GGG
            blocTriggerTerminatesNodeperioStart = new Step("terminatesblocTrigger"+getASTNodeUID(node))
            this.ccfg.addNode(blocTriggerTerminatesNodeperioStart)
    
            {
            let e1 = this.ccfg.addEdge(previousNode, blocTriggerStartsNodeperioStart)
            e1.guards = [...e1.guards, ...[]] //FFF
            let e2 = this.ccfg.addEdge( blocTriggerStartsNodeperioStart,blocTriggerTerminatesNodeperioStart)
            e2.guards = [...e2.guards, ...[]] //FFF
            }

            
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}perioStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesblocTriggernodeperioExpires = this.retrieveNode("terminatesblocTrigger",node) //retrieve 1
        previousNode = terminatesblocTriggernodeperioExpires
    }
    
    //state modifications of perioExpires
        let perioExpiresForkNode: Node = new Fork("perioExpiresForkNode")
        this.ccfg.addNode(perioExpiresForkNode)
        {let e = this.ccfg.addEdge(previousNode,perioExpiresForkNode)
        e.guards = [...e.guards, ...[]] //BB
        }
        
    let blocTriggerStartsNodeperioExpires = this.retrieveNode("starts"+"blocTrigger",node)
    let blocTriggerTerminatesNodeperioExpires = this.retrieveNode("terminates"+"blocTrigger",node)
    {
    //let e1 = this.ccfg.addEdge(previousNode, blocTriggerStartsNodeperioExpires)
    //e1.guards = [...e1.guards, ...[]] //FF22
    let e2 = this.ccfg.addEdge( blocTriggerStartsNodeperioExpires,blocTriggerTerminatesNodeperioExpires)
    e2.guards = [...e2.guards, ...[]] //FF22
    this.ccfg.addEdge(perioExpiresForkNode,blocTriggerStartsNodeperioExpires)
    }
   
        let [stmtStartNode/*,stmtTerminatesNode*/] = this.getOrVisitNode(node.stmt)
        this.ccfg.addEdge(perioExpiresForkNode,stmtStartNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}perioExpires`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsPerioNode,terminatesPerioNode]
    }

    visitStmt1(node: Stmt1): [Node,Node] {
        let startsStmt1Node: Node = new Step("starts"+getASTNodeUID(node),[`sigma["${getASTNodeUID(node)}fakeState"] = new int(0);`])
        if(startsStmt1Node.functionsDefs.length>0){
            startsStmt1Node.returnType = "void"
        }
        startsStmt1Node.functionsNames = [`init${startsStmt1Node.uid}Stmt1`]
        this.ccfg.addNode(startsStmt1Node)
        let terminatesStmt1Node: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesStmt1Node)
        // rule fugaceStmt1
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =startsStmt1Node
        
    {
        let startsnodefugaceStmt1 = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodefugaceStmt1
    }
    
    //state modifications of fugaceStmt1
        {let e = this.ccfg.addEdge(previousNode,terminatesStmt1Node)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}fugaceStmt1`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsStmt1Node,terminatesStmt1Node]
    }

    visitStmt2(node: Stmt2): [Node,Node] {
        let startsStmt2Node: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsStmt2Node.functionsDefs.length>0){
            startsStmt2Node.returnType = "void"
        }
        startsStmt2Node.functionsNames = [`init${startsStmt2Node.uid}Stmt2`]
        this.ccfg.addNode(startsStmt2Node)
        let terminatesStmt2Node: Node = new Step("terminates"+getASTNodeUID(node))
        this.ccfg.addNode(terminatesStmt2Node)
        // rule fugaceStmt1
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =startsStmt2Node
        
    {
        let startsnodefugaceStmt1 = this.retrieveNode("starts",node) //retrieve 1
        previousNode = startsnodefugaceStmt1
    }
    
    //state modifications of fugaceStmt1
        {let e = this.ccfg.addEdge(previousNode,terminatesStmt2Node)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}fugaceStmt1`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [startsStmt2Node,terminatesStmt2Node]
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

        let startsNode = this.ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsNode !== undefined){
            let terminatesNode = this.ccfg.getNodeFromName("terminates"+getASTNodeUID(node))
            if(terminatesNode === undefined){
                throw new Error("impossible to be there")
            }
            return [startsNode,terminatesNode]
        }
        let [starts,terminates] = this.visit(node)
        return [starts,terminates]
    }

    retrieveNode(prefix: string, node: AstNode | AstNode[] | Reference<AstNode> | Reference<AstNode>[] | undefined): Node {
        if(node === undefined){
            throw new Error("not possible to retrieve a node from an undefined AstNode")
        }
        if(Array.isArray(node) || (prefix != "starts" && prefix != "terminates")){
            let n = this.ccfg.getNodeFromName(prefix+getASTNodeUID(node))
            if(n === undefined){
                throw new Error("impossible to retrieve "+prefix+getASTNodeUID(node)+ "from the ccfg")
            }
            return n
        }
        if(prefix == "starts"){
            return this.getOrVisitNode(node)[0]
        }
        if(prefix == "terminates"){
            return this.getOrVisitNode(node)[1]
        }       
        throw new Error("not possible to retrieve the node given as parameter: "+prefix+getASTNodeUID(node))
    }
    
}
