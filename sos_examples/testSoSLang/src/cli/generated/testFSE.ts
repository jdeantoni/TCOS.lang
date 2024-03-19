
import { AstNode, Reference, isReference } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, ContainerNode, TypedElement } from "../../ccfg/ccfglib";

    import { Range, integer } from "vscode-languageserver";

    var globalUnNamedCounter:integer = 0

    function getName(node:AstNode | Reference<AstNode> | undefined): string {
        if(isReference(node)){
            node = node.ref
        }
        if(node !==undefined && node.$cstNode){
            var r: Range = node.$cstNode?.range
            return node.$type+r.start.line+"_"+r.start.character+"_"+r.end.line+"_"+r.end.character;
        }else{
            return "noName"+globalUnNamedCounter++
        }
    }
    import { Model,Bloc,ParallelBloc,Variable,VarRef,If,Assignment,Conjunction,Plus,BooleanConst,While } from "../../language-server/generated/ast";

export interface SimpleLVisitor {
    visit(node: AstNode): [Node,Node,Node];
    

     visitModel(node: Model): [Node, Node,Node];
     visitBloc(node: Bloc): [Node, Node,Node];
     visitParallelBloc(node: ParallelBloc): [Node, Node,Node];
     visitVariable(node: Variable): [Node, Node,Node];
     visitVarRef(node: VarRef): [Node, Node,Node];
     visitIf(node: If): [Node, Node,Node];
     visitAssignment(node: Assignment): [Node, Node,Node];
     visitConjunction(node: Conjunction): [Node, Node,Node];
     visitPlus(node: Plus): [Node, Node,Node];
     visitBooleanConst(node: BooleanConst): [Node, Node,Node];
     visitWhile(node: While): [Node, Node,Node];
}


function getASTNodeUID(node: AstNode | AstNode[]): any {
    if(Array.isArray(node)){
        var rs = node.map(n => n.$cstNode?.range)
        return "array"+rs.map(r => r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character).join("_");
    }
    var r = node.$cstNode?.range
    return node.$type+r?.start.line+"_"+r?.start.character+"_"+r?.end.line+"_"+r?.end.character;
}

export class CCFGVisitor implements SimpleLVisitor {
    ccfg: CCFG = new CCFG();

  
    

    visit(node: AstNode): [Node,Node,Node] {
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
        if(node.$type == "While"){
            return this.visitWhile(node as While);
        }
        throw new Error("Not implemented: " + node.$type);
    }
    
    visitModel(node: Model): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsModelNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsModelNode.functionsDefs.length>0){
            startsModelNode.returnType = "void"
        }
        startsModelNode.functionsNames = [`init${startsModelNode.uid}Model`]
        ccfg.addNode(startsModelNode)
        let terminatesModelNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesModelNode)
        // rule statementsInOrder1
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishModel
   //premise: statements:Statement[],last():Statement,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodestatementsInOrder1 = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodestatementsInOrder1 == undefined){
            throw new Error("impossible to be there startsnodestatementsInOrder1")
        }
        previousNode = startsnodestatementsInOrder1
    }
    
        let statementsInOrder1StepNode = new Step("starts"+getASTNodeUID(node.statements))
        ccfg.addNode(statementsInOrder1StepNode)
        let e = ccfg.addEdge(previousNode,statementsInOrder1StepNode)
        e.guards = [...e.guards, ...[]] //DD

        previousNode = statementsInOrder1StepNode
        for (var child of node.statements) {
            let [childCCFG,childStartsNode,childTerminatesNode] = this.visit(child)
            ccfg.addNode(childCCFG)
            ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let statementsTerminatesNode = new Step("terminates"+getASTNodeUID(node.statements))
        ccfg.addNode(statementsTerminatesNode)
        ccfg.addEdge(previousNode,statementsTerminatesNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}statementsInOrder1`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_statementsfinishModel = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.statements))
        if(terminatesnode_statementsfinishModel == undefined){
            throw new Error("impossible to be there terminatesnode_statementsfinishModel")
        }
        previousNode = terminatesnode_statementsfinishModel
    }
    
        {let e = ccfg.addEdge(previousNode,terminatesModelNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}finishModel`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [ccfg,startsModelNode,terminatesModelNode]
    }

    visitBloc(node: Bloc): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsBlocNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsBlocNode.functionsDefs.length>0){
            startsBlocNode.returnType = "void"
        }
        startsBlocNode.functionsNames = [`init${startsBlocNode.uid}Bloc`]
        ccfg.addNode(startsBlocNode)
        let terminatesBlocNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesBlocNode)
        // rule startsBloc
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishBloc
   //premise: statements:Statement[],last():Statement,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodestartsBloc = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodestartsBloc == undefined){
            throw new Error("impossible to be there startsnodestartsBloc")
        }
        previousNode = startsnodestartsBloc
    }
    
        let startsBlocStepNode = new Step("starts"+getASTNodeUID(node.statements))
        ccfg.addNode(startsBlocStepNode)
        let e = ccfg.addEdge(previousNode,startsBlocStepNode)
        e.guards = [...e.guards, ...[]] //DD

        previousNode = startsBlocStepNode
        for (var child of node.statements) {
            let [childCCFG,childStartsNode,childTerminatesNode] = this.visit(child)
            ccfg.addNode(childCCFG)
            ccfg.addEdge(previousNode,childStartsNode)
            previousNode = childTerminatesNode
        }
        let statementsTerminatesNode = new Step("terminates"+getASTNodeUID(node.statements))
        ccfg.addNode(statementsTerminatesNode)
        ccfg.addEdge(previousNode,statementsTerminatesNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}startsBloc`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_statementsfinishBloc = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.statements))
        if(terminatesnode_statementsfinishBloc == undefined){
            throw new Error("impossible to be there terminatesnode_statementsfinishBloc")
        }
        previousNode = terminatesnode_statementsfinishBloc
    }
    
        {let e = ccfg.addEdge(previousNode,terminatesBlocNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}finishBloc`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [ccfg,startsBlocNode,terminatesBlocNode]
    }

    visitParallelBloc(node: ParallelBloc): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsParallelBlocNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsParallelBlocNode.functionsDefs.length>0){
            startsParallelBlocNode.returnType = "void"
        }
        startsParallelBlocNode.functionsNames = [`init${startsParallelBlocNode.uid}ParallelBloc`]
        ccfg.addNode(startsParallelBlocNode)
        let terminatesParallelBlocNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesParallelBlocNode)
        // rule startsParallelBloc
   //premise: starts:event
   //conclusion: statements:Statement[],s:unknown,starts:event
// rule finishParallelBloc
   //premise: statements:Statement[],terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodestartsParallelBloc = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodestartsParallelBloc == undefined){
            throw new Error("impossible to be there startsnodestartsParallelBloc")
        }
        previousNode = startsnodestartsParallelBloc
    }
    
        let startsParallelBlocForkNode: Node = new Fork("startsParallelBlocForkNode")
        ccfg.addNode(startsParallelBlocForkNode)
        {let e = ccfg.addEdge(previousNode,startsParallelBlocForkNode)
        e.guards = [...e.guards, ...[]] //CC
        }

        let startsParallelBlocFakeNode: Node = new AndJoin("startsParallelBlocFakeNode")    
        ccfg.addNode(startsParallelBlocFakeNode)    
        for (var child of node.statements) {
            let [childCCFG,childStartsNode,childTerminatesNode] = this.visit(child)
            ccfg.addNode(childCCFG)
            ccfg.addEdge(startsParallelBlocForkNode,childStartsNode)
            ccfg.addEdge(childTerminatesNode,startsParallelBlocFakeNode)
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}startsParallelBloc`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    let finishParallelBlocLastOfNode: Node = new AndJoin("lastOfNode"+getASTNodeUID(node.statements))
    ccfg.replaceNode(startsParallelBlocFakeNode,finishParallelBlocLastOfNode)                    
                
    {
        let lastOfNodenode_statementsfinishParallelBloc = ccfg.getNodeFromName("lastOfNode"+getASTNodeUID(node.statements))
        if(lastOfNodenode_statementsfinishParallelBloc == undefined){
            throw new Error("impossible to be there lastOfNodenode_statementsfinishParallelBloc")
        }
        previousNode = lastOfNodenode_statementsfinishParallelBloc
    }
    
        {let e = ccfg.addEdge(previousNode,terminatesParallelBlocNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}finishParallelBloc`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [ccfg,startsParallelBlocNode,terminatesParallelBlocNode]
    }

    visitVariable(node: Variable): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsVariableNode: Node = new Step("starts"+getASTNodeUID(node),[`sigma["${getName(node)}currentValue"] = new int();`])
        if(startsVariableNode.functionsDefs.length>0){
            startsVariableNode.returnType = "void"
        }
        startsVariableNode.functionsNames = [`init${startsVariableNode.uid}Variable`]
        ccfg.addNode(startsVariableNode)
        let terminatesVariableNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesVariableNode)
        // rule initializeVar
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodeinitializeVar = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodeinitializeVar == undefined){
            throw new Error("impossible to be there startsnodeinitializeVar")
        }
        previousNode = startsnodeinitializeVar
    }
    
    {let initializeVarStateModificationNode: Node = new Step("initializeVarStateModificationNode")
    ccfg.addNode(initializeVarStateModificationNode)
    let e = ccfg.addEdge(previousNode,initializeVarStateModificationNode)
    e.guards = [...e.guards, ...[]]
    previousNode = initializeVarStateModificationNode
    }
    previousNode.functionsNames = [...previousNode.functionsNames, ...[`${previousNode.uid}initializeVar`]] 
    previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`int ${getName(node)}1385 = ${node.initialValue}; //undefined`,`//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["${getName(node)}currentValue"])) = ${getName(node)}1385;`]] //AA
    
        {let e = ccfg.addEdge(previousNode,terminatesVariableNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}initializeVar`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [ccfg,startsVariableNode,terminatesVariableNode]
    }

    visitVarRef(node: VarRef): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsVarRefNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsVarRefNode.functionsDefs.length>0){
            startsVarRefNode.returnType = "void"
        }
        startsVarRefNode.functionsNames = [`init${startsVarRefNode.uid}VarRef`]
        ccfg.addNode(startsVarRefNode)
        let terminatesVarRefNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesVarRefNode)
        // rule accessVarRef
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodeaccessVarRef = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodeaccessVarRef == undefined){
            throw new Error("impossible to be there startsnodeaccessVarRef")
        }
        previousNode = startsnodeaccessVarRef
    }
    
        {let e = ccfg.addEdge(previousNode,terminatesVarRefNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "int"
        previousNode.functionsNames = [`${previousNode.uid}accessVarRef`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`const std::lock_guard<std::mutex> lock(sigma_mutex);`,`int ${getName(node)}1588 = *(int *) sigma["${getName(node.theVar)}currentValue"];//currentValue}`,`int ${getName(node)}terminates =  ${getName(node)}1588;`,`return ${getName(node)}terminates;`]] //GG
    
        return [ccfg,startsVarRefNode,terminatesVarRefNode]
    }

    visitIf(node: If): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsIfNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsIfNode.functionsDefs.length>0){
            startsIfNode.returnType = "void"
        }
        startsIfNode.functionsNames = [`init${startsIfNode.uid}If`]
        ccfg.addNode(startsIfNode)
        let terminatesIfNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesIfNode)
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
        
    {
        let startsnodecondStart = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodecondStart == undefined){
            throw new Error("impossible to be there startsnodecondStart")
        }
        previousNode = startsnodecondStart
    }
    
        let condCCFGcondStart = ccfg.getNodeFromName(getASTNodeUID(node.cond))
        let condStartsNodecondStart = ccfg.getNodeFromName("starts"+getASTNodeUID(node.cond))
        let condTerminatesNodecondStart = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.cond))
        if (condCCFGcondStart == undefined) {
            let [condCCFG, condStartsNode,condTerminatesNode] = this.visit(node.cond)
            ccfg.addNode(condCCFG)
            condCCFGcondStart = condCCFG
            condStartsNodecondStart = condStartsNode
            condTerminatesNodecondStart = condTerminatesNode
            if(condTerminatesNodecondStart == undefined || condStartsNodecondStart == undefined || condCCFGcondStart == undefined){
                throw new Error("impossible to be there condTerminatesNodecondStart condStartsNodecondStart condCCFGcondStart")
            }
            {
            let e = ccfg.addEdge(previousNode,condStartsNodecondStart)
            e.guards = [...e.guards, ...[]] //FF
            }
        }else{
            let condOrJoinNode = new OrJoin("orJoinNode"+getASTNodeUID(node.cond))
            ccfg.addNode(condOrJoinNode)
            let startsnodecondStart = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
            if(startsnodecondStart == undefined){
                throw new Error("impossible to be there startsnodecondStart")
            }
            ccfg.addEdge(startsnodecondStart,condOrJoinNode)
            let condStartsNode = ccfg.getNodeFromName("starts"+getASTNodeUID(node.cond))
            if(condStartsNode != undefined){
                for(let e of condStartsNode.inputEdges){
                    e.to = condOrJoinNode
                    condOrJoinNode.inputEdges.push(e)
                }
                condStartsNode.inputEdges = []
                ccfg.addEdge(condOrJoinNode,condStartsNode)
            }
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}condStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        let condTerminatesNodecondTrueStart = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.cond))
            if(condTerminatesNodecondTrueStart == undefined){
                throw new Error("impossible to be there condTerminatesNodecondTrueStart")
            }
        let condChoiceNodecondTrueStart = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if (condChoiceNodecondTrueStart == undefined) {
            let condChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.cond))
            ccfg.addNode(condChoiceNode)
            ccfg.addEdge(condTerminatesNodecondTrueStart,condChoiceNode)
            condChoiceNodecondTrueStart = condChoiceNode
        }else{
            ccfg.addEdge(condTerminatesNodecondTrueStart,condChoiceNodecondTrueStart)
        }
        
    {
        let choiceNodenode_condcondTrueStart = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if(choiceNodenode_condcondTrueStart == undefined){
            throw new Error("impossible to be there choiceNodenode_condcondTrueStart")
        }
        previousNode = choiceNodenode_condcondTrueStart
    }
    
        let thenCCFGcondTrueStart = ccfg.getNodeFromName(getASTNodeUID(node.then))
        let thenStartsNodecondTrueStart = ccfg.getNodeFromName("starts"+getASTNodeUID(node.then))
        let thenTerminatesNodecondTrueStart = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.then))
        if (thenCCFGcondTrueStart == undefined) {
            let [thenCCFG, thenStartsNode,thenTerminatesNode] = this.visit(node.then)
            ccfg.addNode(thenCCFG)
            thenCCFGcondTrueStart = thenCCFG
            thenStartsNodecondTrueStart = thenStartsNode
            thenTerminatesNodecondTrueStart = thenTerminatesNode
            if(thenTerminatesNodecondTrueStart == undefined || thenStartsNodecondTrueStart == undefined || thenCCFGcondTrueStart == undefined){
                throw new Error("impossible to be there thenTerminatesNodecondTrueStart thenStartsNodecondTrueStart thenCCFGcondTrueStart")
            }
            {
            let e = ccfg.addEdge(previousNode,thenStartsNodecondTrueStart)
            e.guards = [...e.guards, ...[`(bool)${getName(node.cond)}terminates == true`]] //FF
            }
        }else{
            let thenOrJoinNode = new OrJoin("orJoinNode"+getASTNodeUID(node.then))
            ccfg.addNode(thenOrJoinNode)
            let choiceNodenode_condcondTrueStart = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
            if(choiceNodenode_condcondTrueStart == undefined){
                throw new Error("impossible to be there choiceNodenode_condcondTrueStart")
            }
            ccfg.addEdge(choiceNodenode_condcondTrueStart,thenOrJoinNode)
            let thenStartsNode = ccfg.getNodeFromName("starts"+getASTNodeUID(node.then))
            if(thenStartsNode != undefined){
                for(let e of thenStartsNode.inputEdges){
                    e.to = thenOrJoinNode
                    thenOrJoinNode.inputEdges.push(e)
                }
                thenStartsNode.inputEdges = []
                ccfg.addEdge(thenOrJoinNode,thenStartsNode)
            }
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}condTrueStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        let condTerminatesNodecondFalseStart = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.cond))
            if(condTerminatesNodecondFalseStart == undefined){
                throw new Error("impossible to be there condTerminatesNodecondFalseStart")
            }
        let condChoiceNodecondFalseStart = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if (condChoiceNodecondFalseStart == undefined) {
            let condChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.cond))
            ccfg.addNode(condChoiceNode)
            ccfg.addEdge(condTerminatesNodecondFalseStart,condChoiceNode)
            condChoiceNodecondFalseStart = condChoiceNode
        }else{
            ccfg.addEdge(condTerminatesNodecondFalseStart,condChoiceNodecondFalseStart)
        }
        
    {
        let choiceNodenode_condcondFalseStart = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if(choiceNodenode_condcondFalseStart == undefined){
            throw new Error("impossible to be there choiceNodenode_condcondFalseStart")
        }
        previousNode = choiceNodenode_condcondFalseStart
    }
    
        let elseCCFGcondFalseStart = ccfg.getNodeFromName(getASTNodeUID(node.else))
        let elseStartsNodecondFalseStart = ccfg.getNodeFromName("starts"+getASTNodeUID(node.else))
        let elseTerminatesNodecondFalseStart = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.else))
        if (elseCCFGcondFalseStart == undefined) {
            let [elseCCFG, elseStartsNode,elseTerminatesNode] = this.visit(node.else)
            ccfg.addNode(elseCCFG)
            elseCCFGcondFalseStart = elseCCFG
            elseStartsNodecondFalseStart = elseStartsNode
            elseTerminatesNodecondFalseStart = elseTerminatesNode
            if(elseTerminatesNodecondFalseStart == undefined || elseStartsNodecondFalseStart == undefined || elseCCFGcondFalseStart == undefined){
                throw new Error("impossible to be there elseTerminatesNodecondFalseStart elseStartsNodecondFalseStart elseCCFGcondFalseStart")
            }
            {
            let e = ccfg.addEdge(previousNode,elseStartsNodecondFalseStart)
            e.guards = [...e.guards, ...[`(bool)${getName(node.cond)}terminates == false`]] //FF
            }
        }else{
            let elseOrJoinNode = new OrJoin("orJoinNode"+getASTNodeUID(node.else))
            ccfg.addNode(elseOrJoinNode)
            let choiceNodenode_condcondFalseStart = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
            if(choiceNodenode_condcondFalseStart == undefined){
                throw new Error("impossible to be there choiceNodenode_condcondFalseStart")
            }
            ccfg.addEdge(choiceNodenode_condcondFalseStart,elseOrJoinNode)
            let elseStartsNode = ccfg.getNodeFromName("starts"+getASTNodeUID(node.else))
            if(elseStartsNode != undefined){
                for(let e of elseStartsNode.inputEdges){
                    e.to = elseOrJoinNode
                    elseOrJoinNode.inputEdges.push(e)
                }
                elseStartsNode.inputEdges = []
                ccfg.addEdge(elseOrJoinNode,elseStartsNode)
            }
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}condFalseStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    let condStopOrJoinNode: Node = new OrJoin("orJoinNode"+getASTNodeUID(node.else))
    ccfg.addNode(condStopOrJoinNode)
    let elseTerminatesNodecondStop = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.else))
    let thenTerminatesNodecondStop = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.then))
    if(elseTerminatesNodecondStop == undefined || thenTerminatesNodecondStop == undefined){
        throw new Error("impossible to be there elseTerminatesNodecondStop thenTerminatesNodecondStop")
    }
    ccfg.addEdge(elseTerminatesNodecondStop,condStopOrJoinNode)
    ccfg.addEdge(thenTerminatesNodecondStop,condStopOrJoinNode)
            
    {
        let multipleSynchroNode = ccfg.getNodeFromName("orJoinNode"+getASTNodeUID(node.else))
        if(multipleSynchroNode == undefined){
            throw new Error("impossible to be there orJoinNode"+getASTNodeUID(node.else))
        }
        multipleSynchroNode.params = [...multipleSynchroNode.params, ...[]]
        multipleSynchroNode.functionsDefs = [...multipleSynchroNode.functionsDefs, ...[]] //HH
    }
    
    {
        let orJoinNodenode_elsecondStop = ccfg.getNodeFromName("orJoinNode"+getASTNodeUID(node.else))
        if(orJoinNodenode_elsecondStop == undefined){
            throw new Error("impossible to be there orJoinNodenode_elsecondStop")
        }
        previousNode = orJoinNodenode_elsecondStop
    }
    
        {let e = ccfg.addEdge(previousNode,terminatesIfNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}condStop`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [ccfg,startsIfNode,terminatesIfNode]
    }

    visitAssignment(node: Assignment): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsAssignmentNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsAssignmentNode.functionsDefs.length>0){
            startsAssignmentNode.returnType = "void"
        }
        startsAssignmentNode.functionsNames = [`init${startsAssignmentNode.uid}Assignment`]
        ccfg.addNode(startsAssignmentNode)
        let terminatesAssignmentNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesAssignmentNode)
        // rule executeAssignment
   //premise: starts:event
   //conclusion: expr:Expr,starts:event
// rule executeAssignment2
   //premise: expr:Expr,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodeexecuteAssignment = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodeexecuteAssignment == undefined){
            throw new Error("impossible to be there startsnodeexecuteAssignment")
        }
        previousNode = startsnodeexecuteAssignment
    }
    
        let exprCCFGexecuteAssignment = ccfg.getNodeFromName(getASTNodeUID(node.expr))
        let exprStartsNodeexecuteAssignment = ccfg.getNodeFromName("starts"+getASTNodeUID(node.expr))
        let exprTerminatesNodeexecuteAssignment = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.expr))
        if (exprCCFGexecuteAssignment == undefined) {
            let [exprCCFG, exprStartsNode,exprTerminatesNode] = this.visit(node.expr)
            ccfg.addNode(exprCCFG)
            exprCCFGexecuteAssignment = exprCCFG
            exprStartsNodeexecuteAssignment = exprStartsNode
            exprTerminatesNodeexecuteAssignment = exprTerminatesNode
            if(exprTerminatesNodeexecuteAssignment == undefined || exprStartsNodeexecuteAssignment == undefined || exprCCFGexecuteAssignment == undefined){
                throw new Error("impossible to be there exprTerminatesNodeexecuteAssignment exprStartsNodeexecuteAssignment exprCCFGexecuteAssignment")
            }
            {
            let e = ccfg.addEdge(previousNode,exprStartsNodeexecuteAssignment)
            e.guards = [...e.guards, ...[]] //FF
            }
        }else{
            let exprOrJoinNode = new OrJoin("orJoinNode"+getASTNodeUID(node.expr))
            ccfg.addNode(exprOrJoinNode)
            let startsnodeexecuteAssignment = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
            if(startsnodeexecuteAssignment == undefined){
                throw new Error("impossible to be there startsnodeexecuteAssignment")
            }
            ccfg.addEdge(startsnodeexecuteAssignment,exprOrJoinNode)
            let exprStartsNode = ccfg.getNodeFromName("starts"+getASTNodeUID(node.expr))
            if(exprStartsNode != undefined){
                for(let e of exprStartsNode.inputEdges){
                    e.to = exprOrJoinNode
                    exprOrJoinNode.inputEdges.push(e)
                }
                exprStartsNode.inputEdges = []
                ccfg.addEdge(exprOrJoinNode,exprStartsNode)
            }
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}executeAssignment`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_exprexecuteAssignment2 = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.expr))
        if(terminatesnode_exprexecuteAssignment2 == undefined){
            throw new Error("impossible to be there terminatesnode_exprexecuteAssignment2")
        }
        previousNode = terminatesnode_exprexecuteAssignment2
    }
    
    {let executeAssignment2StateModificationNode: Node = new Step("executeAssignment2StateModificationNode")
    ccfg.addNode(executeAssignment2StateModificationNode)
    let e = ccfg.addEdge(previousNode,executeAssignment2StateModificationNode)
    e.guards = [...e.guards, ...[]]
    executeAssignment2StateModificationNode.params = [...executeAssignment2StateModificationNode.params, ...[Object.assign( new TypedElement(), JSON.parse(`{ "name": "resRight", "type": "int"}`))]]
    
    previousNode = executeAssignment2StateModificationNode
    }
    previousNode.functionsNames = [...previousNode.functionsNames, ...[`${previousNode.uid}executeAssignment2`]] 
    previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`int ${getName(node)}2529 = resRight; // was ${getName(node)}2363; but using the parameter name now`,`//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["${getName(node.variable)}currentValue"])) = ${getName(node)}2529;`]] //AA
    
        {let e = ccfg.addEdge(previousNode,terminatesAssignmentNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}executeAssignment2`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [ccfg,startsAssignmentNode,terminatesAssignmentNode]
    }

    visitConjunction(node: Conjunction): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsConjunctionNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsConjunctionNode.functionsDefs.length>0){
            startsConjunctionNode.returnType = "void"
        }
        startsConjunctionNode.functionsNames = [`init${startsConjunctionNode.uid}Conjunction`]
        ccfg.addNode(startsConjunctionNode)
        let terminatesConjunctionNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesConjunctionNode)
        // rule evaluateConjunction
   //premise: starts:event
   //conclusion: lhs:BooleanExpression,starts:event
   //conclusion: lhs:BooleanExpression,starts:event,rhs:BooleanExpression,starts:event
// rule evaluateConjunction2
   //premise: lhs:BooleanExpression,terminates:event
   //conclusion: terminates:event
// rule evaluateConjunction3
   //premise: rhs:BooleanExpression,terminates:event
   //conclusion: terminates:event
// rule evaluateConjunction4
   //premise: lhs:BooleanExpression,terminates:event,rhs:BooleanExpression,terminates:event
   //conclusion: terminates:event

        let ConjunctionOrJoinNode: Node = new OrJoin("orJoin"+getASTNodeUID(node))
        ccfg.addNode(ConjunctionOrJoinNode)
        ccfg.addEdge(ConjunctionOrJoinNode,terminatesConjunctionNode)
        
        let previousNode =undefined
        
    {
        let startsnodeevaluateConjunction = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodeevaluateConjunction == undefined){
            throw new Error("impossible to be there startsnodeevaluateConjunction")
        }
        previousNode = startsnodeevaluateConjunction
    }
    
        let evaluateConjunctionForkNode: Node = new Fork("evaluateConjunctionForkNode")
        ccfg.addNode(evaluateConjunctionForkNode)
        {let e = ccfg.addEdge(previousNode,evaluateConjunctionForkNode)
        e.guards = [...e.guards, ...[]] //BB
        }
        
        let [lhsCCFG, lhsStartNode/*,lhsTerminatesNode*/] = this.visit(node.lhs)
        ccfg.addNode(lhsCCFG)
        ccfg.addEdge(evaluateConjunctionForkNode,lhsStartNode)
        
        let [rhsCCFG, rhsStartNode/*,rhsTerminatesNode*/] = this.visit(node.rhs)
        ccfg.addNode(rhsCCFG)
        ccfg.addEdge(evaluateConjunctionForkNode,rhsStartNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}evaluateConjunction`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        let lhsTerminatesNodeevaluateConjunction2 = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.lhs))
            if(lhsTerminatesNodeevaluateConjunction2 == undefined){
                throw new Error("impossible to be there lhsTerminatesNodeevaluateConjunction2")
            }
        let lhsChoiceNodeevaluateConjunction2 = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.lhs))
        if (lhsChoiceNodeevaluateConjunction2 == undefined) {
            let lhsChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.lhs))
            ccfg.addNode(lhsChoiceNode)
            ccfg.addEdge(lhsTerminatesNodeevaluateConjunction2,lhsChoiceNode)
            lhsChoiceNodeevaluateConjunction2 = lhsChoiceNode
        }else{
            ccfg.addEdge(lhsTerminatesNodeevaluateConjunction2,lhsChoiceNodeevaluateConjunction2)
        }
        
    {
        let choiceNodenode_lhsevaluateConjunction2 = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.lhs))
        if(choiceNodenode_lhsevaluateConjunction2 == undefined){
            throw new Error("impossible to be there choiceNodenode_lhsevaluateConjunction2")
        }
        previousNode = choiceNodenode_lhsevaluateConjunction2
    }
    
        {let e = ccfg.addEdge(previousNode,ConjunctionOrJoinNode)
        e.guards = [...e.guards, ...[`(bool)${getName(node.lhs)}terminates == false`]] //EE
        }
        
        previousNode.returnType = "bool"
        previousNode.functionsNames = [`${previousNode.uid}evaluateConjunction2`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`bool ${getName(node)}terminates =  false;`,`return ${getName(node)}terminates;`]] //GG
    
        let rhsTerminatesNodeevaluateConjunction3 = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.rhs))
            if(rhsTerminatesNodeevaluateConjunction3 == undefined){
                throw new Error("impossible to be there rhsTerminatesNodeevaluateConjunction3")
            }
        let rhsChoiceNodeevaluateConjunction3 = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.rhs))
        if (rhsChoiceNodeevaluateConjunction3 == undefined) {
            let rhsChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.rhs))
            ccfg.addNode(rhsChoiceNode)
            ccfg.addEdge(rhsTerminatesNodeevaluateConjunction3,rhsChoiceNode)
            rhsChoiceNodeevaluateConjunction3 = rhsChoiceNode
        }else{
            ccfg.addEdge(rhsTerminatesNodeevaluateConjunction3,rhsChoiceNodeevaluateConjunction3)
        }
        
    {
        let choiceNodenode_rhsevaluateConjunction3 = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.rhs))
        if(choiceNodenode_rhsevaluateConjunction3 == undefined){
            throw new Error("impossible to be there choiceNodenode_rhsevaluateConjunction3")
        }
        previousNode = choiceNodenode_rhsevaluateConjunction3
    }
    
        {let e = ccfg.addEdge(previousNode,ConjunctionOrJoinNode)
        e.guards = [...e.guards, ...[`(bool)${getName(node.rhs)}terminates == false`]] //EE
        }
        
        previousNode.returnType = "bool"
        previousNode.functionsNames = [`${previousNode.uid}evaluateConjunction3`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`bool ${getName(node)}terminates =  false;`,`return ${getName(node)}terminates;`]] //GG
    
    let evaluateConjunction4AndJoinNode: Node = new AndJoin("andJoinNode"+getASTNodeUID(node.lhs))
    ccfg.addNode(evaluateConjunction4AndJoinNode)
    let lhsTerminatesNodeevaluateConjunction4 = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.lhs))
    let rhsTerminatesNodeevaluateConjunction4 = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.rhs))
    if(lhsTerminatesNodeevaluateConjunction4 == undefined || rhsTerminatesNodeevaluateConjunction4 == undefined){
        throw new Error("impossible to be there lhsTerminatesNodeevaluateConjunction4 rhsTerminatesNodeevaluateConjunction4")
    }
    ccfg.addEdge(lhsTerminatesNodeevaluateConjunction4,evaluateConjunction4AndJoinNode)
    ccfg.addEdge(rhsTerminatesNodeevaluateConjunction4,evaluateConjunction4AndJoinNode)
            
    let evaluateConjunction4ConditionNode: Node = new Choice("conditionNode"+getASTNodeUID(node.lhs))
    ccfg.addNode(evaluateConjunction4ConditionNode)
    let tmpMultipleSynchroNode = ccfg.getNodeFromName("andJoinNode"+getASTNodeUID(node.lhs))
    if(tmpMultipleSynchroNode == undefined){
        throw new Error("impossible to be there andJoinNode"+getASTNodeUID(node.lhs))
    }
    ccfg.addEdge(tmpMultipleSynchroNode,evaluateConjunction4ConditionNode)
        
    {
        let multipleSynchroNode = ccfg.getNodeFromName("conditionNode"+getASTNodeUID(node.lhs))
        if(multipleSynchroNode == undefined){
            throw new Error("impossible to be there conditionNode"+getASTNodeUID(node.lhs))
        }
        multipleSynchroNode.params = [...multipleSynchroNode.params, ...[]]
        multipleSynchroNode.functionsDefs = [...multipleSynchroNode.functionsDefs, ...[]] //HH
    }
    
    {
        let conditionNodenode_lhsevaluateConjunction4 = ccfg.getNodeFromName("conditionNode"+getASTNodeUID(node.lhs))
        if(conditionNodenode_lhsevaluateConjunction4 == undefined){
            throw new Error("impossible to be there conditionNodenode_lhsevaluateConjunction4")
        }
        previousNode = conditionNodenode_lhsevaluateConjunction4
    }
    
        {let e = ccfg.addEdge(previousNode,ConjunctionOrJoinNode)
        e.guards = [...e.guards, ...[`(bool)${getName(node.lhs)}terminates == true`,`(bool)${getName(node.rhs)}terminates == true`]] //EE
        }
        
        previousNode.returnType = "bool"
        previousNode.functionsNames = [`${previousNode.uid}evaluateConjunction4`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`bool ${getName(node)}terminates =  true;`,`return ${getName(node)}terminates;`]] //GG
    
        return [ccfg,startsConjunctionNode,terminatesConjunctionNode]
    }

    visitPlus(node: Plus): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsPlusNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsPlusNode.functionsDefs.length>0){
            startsPlusNode.returnType = "void"
        }
        startsPlusNode.functionsNames = [`init${startsPlusNode.uid}Plus`]
        ccfg.addNode(startsPlusNode)
        let terminatesPlusNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesPlusNode)
        // rule startPlus
   //premise: starts:event
   //conclusion: right:Expr,starts:event
   //conclusion: right:Expr,starts:event,left:Expr,starts:event
// rule finishPlus
   //premise: right:Expr,terminates:event,left:Expr,terminates:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodestartPlus = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodestartPlus == undefined){
            throw new Error("impossible to be there startsnodestartPlus")
        }
        previousNode = startsnodestartPlus
    }
    
        let startPlusForkNode: Node = new Fork("startPlusForkNode")
        ccfg.addNode(startPlusForkNode)
        {let e = ccfg.addEdge(previousNode,startPlusForkNode)
        e.guards = [...e.guards, ...[]] //BB
        }
        
        let [rightCCFG, rightStartNode/*,rightTerminatesNode*/] = this.visit(node.right)
        ccfg.addNode(rightCCFG)
        ccfg.addEdge(startPlusForkNode,rightStartNode)
        
        let [leftCCFG, leftStartNode/*,leftTerminatesNode*/] = this.visit(node.left)
        ccfg.addNode(leftCCFG)
        ccfg.addEdge(startPlusForkNode,leftStartNode)
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}startPlus`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    let finishPlusAndJoinNode: Node = new AndJoin("andJoinNode"+getASTNodeUID(node.right))
    ccfg.addNode(finishPlusAndJoinNode)
    let rightTerminatesNodefinishPlus = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.right))
    let leftTerminatesNodefinishPlus = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.left))
    if(rightTerminatesNodefinishPlus == undefined || leftTerminatesNodefinishPlus == undefined){
        throw new Error("impossible to be there rightTerminatesNodefinishPlus leftTerminatesNodefinishPlus")
    }
    ccfg.addEdge(rightTerminatesNodefinishPlus,finishPlusAndJoinNode)
    ccfg.addEdge(leftTerminatesNodefinishPlus,finishPlusAndJoinNode)
            
    {
        let multipleSynchroNode = ccfg.getNodeFromName("andJoinNode"+getASTNodeUID(node.right))
        if(multipleSynchroNode == undefined){
            throw new Error("impossible to be there andJoinNode"+getASTNodeUID(node.right))
        }
        multipleSynchroNode.params = [...multipleSynchroNode.params, ...[Object.assign( new TypedElement(), JSON.parse(`{ "name": "n2", "type": "int"}`)),Object.assign( new TypedElement(), JSON.parse(`{ "name": "n1", "type": "int"}`))]]
        multipleSynchroNode.functionsDefs = [...multipleSynchroNode.functionsDefs, ...[`int ${getName(node)}4276 = n2;`,`int ${getName(node)}4301 = n1;`]] //HH
    }
    
    {
        let andJoinNodenode_rightfinishPlus = ccfg.getNodeFromName("andJoinNode"+getASTNodeUID(node.right))
        if(andJoinNodenode_rightfinishPlus == undefined){
            throw new Error("impossible to be there andJoinNodenode_rightfinishPlus")
        }
        previousNode = andJoinNodenode_rightfinishPlus
    }
    
        {let e = ccfg.addEdge(previousNode,terminatesPlusNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "int"
        previousNode.functionsNames = [`${previousNode.uid}finishPlus`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`int ${getName(node)}4420 = n1; // was ${getName(node)}4301; but using the parameter name now`,`int ${getName(node)}4425 = n2; // was ${getName(node)}4276; but using the parameter name now`,`int ${getName(node)}4419 = ${getName(node)}4420 + ${getName(node)}4425;`,`int ${getName(node)}terminates =  ${getName(node)}4419;`,`return ${getName(node)}terminates;`]] //GG
    
        return [ccfg,startsPlusNode,terminatesPlusNode]
    }

    visitBooleanConst(node: BooleanConst): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsBooleanConstNode: Node = new Step("starts"+getASTNodeUID(node),[`sigma["${getName(node)}constantValue"] = new bool(${node.value});`])
        if(startsBooleanConstNode.functionsDefs.length>0){
            startsBooleanConstNode.returnType = "void"
        }
        startsBooleanConstNode.functionsNames = [`init${startsBooleanConstNode.uid}BooleanConst`]
        ccfg.addNode(startsBooleanConstNode)
        let terminatesBooleanConstNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesBooleanConstNode)
        // rule evalBooleanConst
   //premise: starts:event
   //conclusion: terminates:event

        let previousNode =undefined
        
    {
        let startsnodeevalBooleanConst = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodeevalBooleanConst == undefined){
            throw new Error("impossible to be there startsnodeevalBooleanConst")
        }
        previousNode = startsnodeevalBooleanConst
    }
    
        {let e = ccfg.addEdge(previousNode,terminatesBooleanConstNode)
        e.guards = [...e.guards, ...[]] //EE
        }
        
        previousNode.returnType = "bool"
        previousNode.functionsNames = [`${previousNode.uid}evalBooleanConst`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[`const std::lock_guard<std::mutex> lock(sigma_mutex);`,`bool ${getName(node)}4639 = *(bool *) sigma["${getName(node)}constantValue"];//constantValue}`,`bool ${getName(node)}terminates =  ${getName(node)}4639;`,`return ${getName(node)}terminates;`]] //GG
    
        return [ccfg,startsBooleanConstNode,terminatesBooleanConstNode]
    }

    visitWhile(node: While): [Node,Node,Node] {
        let ccfg: ContainerNode = new ContainerNode(getASTNodeUID(node))


        let startsWhileNode: Node = new Step("starts"+getASTNodeUID(node),[])
        if(startsWhileNode.functionsDefs.length>0){
            startsWhileNode.returnType = "void"
        }
        startsWhileNode.functionsNames = [`init${startsWhileNode.uid}While`]
        ccfg.addNode(startsWhileNode)
        let terminatesWhileNode: Node = new Step("terminates"+getASTNodeUID(node))
        ccfg.addNode(terminatesWhileNode)
        // rule whileStart
   //premise: starts:event
   //conclusion: cond:VarRef,starts:event
// rule whileBodyStart
   //premise: cond:VarRef,terminates:event
   //conclusion: body:Bloc,starts:event
// rule whileBodyEnd
   //premise: body:Bloc,terminates:event
   //conclusion: cond:VarRef,starts:event
// rule whileEnd
   //premise: cond:VarRef,terminates:event
   //conclusion: terminates:unknown

        let previousNode =undefined
        
    {
        let startsnodewhileStart = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
        if(startsnodewhileStart == undefined){
            throw new Error("impossible to be there startsnodewhileStart")
        }
        previousNode = startsnodewhileStart
    }
    
        let condCCFGwhileStart = ccfg.getNodeFromName(getASTNodeUID(node.cond))
        let condStartsNodewhileStart = ccfg.getNodeFromName("starts"+getASTNodeUID(node.cond))
        let condTerminatesNodewhileStart = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.cond))
        if (condCCFGwhileStart == undefined) {
            let [condCCFG, condStartsNode,condTerminatesNode] = this.visit(node.cond)
            ccfg.addNode(condCCFG)
            condCCFGwhileStart = condCCFG
            condStartsNodewhileStart = condStartsNode
            condTerminatesNodewhileStart = condTerminatesNode
            if(condTerminatesNodewhileStart == undefined || condStartsNodewhileStart == undefined || condCCFGwhileStart == undefined){
                throw new Error("impossible to be there condTerminatesNodewhileStart condStartsNodewhileStart condCCFGwhileStart")
            }
            {
            let e = ccfg.addEdge(previousNode,condStartsNodewhileStart)
            e.guards = [...e.guards, ...[]] //FF
            }
        }else{
            let condOrJoinNode = new OrJoin("orJoinNode"+getASTNodeUID(node.cond))
            ccfg.addNode(condOrJoinNode)
            let startsnodewhileStart = ccfg.getNodeFromName("starts"+getASTNodeUID(node))
            if(startsnodewhileStart == undefined){
                throw new Error("impossible to be there startsnodewhileStart")
            }
            ccfg.addEdge(startsnodewhileStart,condOrJoinNode)
            let condStartsNode = ccfg.getNodeFromName("starts"+getASTNodeUID(node.cond))
            if(condStartsNode != undefined){
                for(let e of condStartsNode.inputEdges){
                    e.to = condOrJoinNode
                    condOrJoinNode.inputEdges.push(e)
                }
                condStartsNode.inputEdges = []
                ccfg.addEdge(condOrJoinNode,condStartsNode)
            }
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}whileStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        let condTerminatesNodewhileBodyStart = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.cond))
            if(condTerminatesNodewhileBodyStart == undefined){
                throw new Error("impossible to be there condTerminatesNodewhileBodyStart")
            }
        let condChoiceNodewhileBodyStart = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if (condChoiceNodewhileBodyStart == undefined) {
            let condChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.cond))
            ccfg.addNode(condChoiceNode)
            ccfg.addEdge(condTerminatesNodewhileBodyStart,condChoiceNode)
            condChoiceNodewhileBodyStart = condChoiceNode
        }else{
            ccfg.addEdge(condTerminatesNodewhileBodyStart,condChoiceNodewhileBodyStart)
        }
        
    {
        let choiceNodenode_condwhileBodyStart = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if(choiceNodenode_condwhileBodyStart == undefined){
            throw new Error("impossible to be there choiceNodenode_condwhileBodyStart")
        }
        previousNode = choiceNodenode_condwhileBodyStart
    }
    
        let bodyCCFGwhileBodyStart = ccfg.getNodeFromName(getASTNodeUID(node.body))
        let bodyStartsNodewhileBodyStart = ccfg.getNodeFromName("starts"+getASTNodeUID(node.body))
        let bodyTerminatesNodewhileBodyStart = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.body))
        if (bodyCCFGwhileBodyStart == undefined) {
            let [bodyCCFG, bodyStartsNode,bodyTerminatesNode] = this.visit(node.body)
            ccfg.addNode(bodyCCFG)
            bodyCCFGwhileBodyStart = bodyCCFG
            bodyStartsNodewhileBodyStart = bodyStartsNode
            bodyTerminatesNodewhileBodyStart = bodyTerminatesNode
            if(bodyTerminatesNodewhileBodyStart == undefined || bodyStartsNodewhileBodyStart == undefined || bodyCCFGwhileBodyStart == undefined){
                throw new Error("impossible to be there bodyTerminatesNodewhileBodyStart bodyStartsNodewhileBodyStart bodyCCFGwhileBodyStart")
            }
            {
            let e = ccfg.addEdge(previousNode,bodyStartsNodewhileBodyStart)
            e.guards = [...e.guards, ...[`(bool)${getName(node.cond)}terminates == true`]] //FF
            }
        }else{
            let bodyOrJoinNode = new OrJoin("orJoinNode"+getASTNodeUID(node.body))
            ccfg.addNode(bodyOrJoinNode)
            let choiceNodenode_condwhileBodyStart = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
            if(choiceNodenode_condwhileBodyStart == undefined){
                throw new Error("impossible to be there choiceNodenode_condwhileBodyStart")
            }
            ccfg.addEdge(choiceNodenode_condwhileBodyStart,bodyOrJoinNode)
            let bodyStartsNode = ccfg.getNodeFromName("starts"+getASTNodeUID(node.body))
            if(bodyStartsNode != undefined){
                for(let e of bodyStartsNode.inputEdges){
                    e.to = bodyOrJoinNode
                    bodyOrJoinNode.inputEdges.push(e)
                }
                bodyStartsNode.inputEdges = []
                ccfg.addEdge(bodyOrJoinNode,bodyStartsNode)
            }
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}whileBodyStart`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
    {
        let terminatesnode_bodywhileBodyEnd = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.body))
        if(terminatesnode_bodywhileBodyEnd == undefined){
            throw new Error("impossible to be there terminatesnode_bodywhileBodyEnd")
        }
        previousNode = terminatesnode_bodywhileBodyEnd
    }
    
        let condCCFGwhileBodyEnd = ccfg.getNodeFromName(getASTNodeUID(node.cond))
        let condStartsNodewhileBodyEnd = ccfg.getNodeFromName("starts"+getASTNodeUID(node.cond))
        let condTerminatesNodewhileBodyEnd = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.cond))
        if (condCCFGwhileBodyEnd == undefined) {
            let [condCCFG, condStartsNode,condTerminatesNode] = this.visit(node.cond)
            ccfg.addNode(condCCFG)
            condCCFGwhileBodyEnd = condCCFG
            condStartsNodewhileBodyEnd = condStartsNode
            condTerminatesNodewhileBodyEnd = condTerminatesNode
            if(condTerminatesNodewhileBodyEnd == undefined || condStartsNodewhileBodyEnd == undefined || condCCFGwhileBodyEnd == undefined){
                throw new Error("impossible to be there condTerminatesNodewhileBodyEnd condStartsNodewhileBodyEnd condCCFGwhileBodyEnd")
            }
            {
            let e = ccfg.addEdge(previousNode,condStartsNodewhileBodyEnd)
            e.guards = [...e.guards, ...[]] //FF
            }
        }else{
            let condOrJoinNode = new OrJoin("orJoinNode"+getASTNodeUID(node.cond))
            ccfg.addNode(condOrJoinNode)
            let terminatesnode_bodywhileBodyEnd = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.body))
            if(terminatesnode_bodywhileBodyEnd == undefined){
                throw new Error("impossible to be there terminatesnode_bodywhileBodyEnd")
            }
            ccfg.addEdge(terminatesnode_bodywhileBodyEnd,condOrJoinNode)
            let condStartsNode = ccfg.getNodeFromName("starts"+getASTNodeUID(node.cond))
            if(condStartsNode != undefined){
                for(let e of condStartsNode.inputEdges){
                    e.to = condOrJoinNode
                    condOrJoinNode.inputEdges.push(e)
                }
                condStartsNode.inputEdges = []
                ccfg.addEdge(condOrJoinNode,condStartsNode)
            }
        }

        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}whileBodyEnd`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        let condTerminatesNodewhileEnd = ccfg.getNodeFromName("terminates"+getASTNodeUID(node.cond))
            if(condTerminatesNodewhileEnd == undefined){
                throw new Error("impossible to be there condTerminatesNodewhileEnd")
            }
        let condChoiceNodewhileEnd = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if (condChoiceNodewhileEnd == undefined) {
            let condChoiceNode = new Choice("choiceNode"+getASTNodeUID(node.cond))
            ccfg.addNode(condChoiceNode)
            ccfg.addEdge(condTerminatesNodewhileEnd,condChoiceNode)
            condChoiceNodewhileEnd = condChoiceNode
        }else{
            ccfg.addEdge(condTerminatesNodewhileEnd,condChoiceNodewhileEnd)
        }
        
    {
        let choiceNodenode_condwhileEnd = ccfg.getNodeFromName("choiceNode"+getASTNodeUID(node.cond))
        if(choiceNodenode_condwhileEnd == undefined){
            throw new Error("impossible to be there choiceNodenode_condwhileEnd")
        }
        previousNode = choiceNodenode_condwhileEnd
    }
    
        {let e = ccfg.addEdge(previousNode,terminatesWhileNode)
        e.guards = [...e.guards, ...[`(bool)${getName(node.cond)}terminates == false`]] //EE
        }
        
        previousNode.returnType = "void"
        previousNode.functionsNames = [`${previousNode.uid}whileEnd`] //overwrite existing name
        previousNode.functionsDefs =[...previousNode.functionsDefs, ...[]] //GG
    
        return [ccfg,startsWhileNode,terminatesWhileNode]
    }

}
