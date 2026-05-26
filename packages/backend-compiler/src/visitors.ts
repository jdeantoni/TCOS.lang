import { CCFG, Edge, Node, VerifyEqualInstruction } from "ccfg";
import { IGenerator } from "./generator/GeneratorInterface.js";
import { addComparisonVariableDeclaration, addCorrespondingCode, addQueuePushCode, getCurrentUID, getPreviousTypedNodes } from "./compilerBackend.js";
import chalk from "chalk";
import { TraversalContext } from "./TraversalContext.js";

// Il faut refactoriser cette fonction
export function visitAllNodes(ccfg: CCFG, currentNode: Node, generator: IGenerator, ctx: TraversalContext, visitIsStarting: boolean = false): string[] {
    ctx.recursLevel = ctx.recursLevel + 1;
    const currentUID:number = getCurrentUID(currentNode);

    if (currentNode.outputEdges.length == 0 /*|| currentUID == untilUID*/) {
        return [];
    }

    let thisNodeCode:string[] = [];
    currentNode.numberOfVisits = currentNode.numberOfVisits + 1;

    // console.log("try visit "+currentNode.uid  + " nbVisit = "+currentNode.numberOfVisits)
    
    if(currentNode.inputEdges.length > 1){
        
        if (visitIsStarting == false && currentNode.numberOfVisits < currentNode.inputEdges.length) {
            if(currentNode.isCycleInitiator){
                if(! ctx.continuations.includes(currentNode)){
                    // console.log("add continuation "+currentNode.uid  + " nbVisit = "+currentNode.numberOfVisits)
                    ctx.continuationsRecursLevel.push(ctx.recursLevel-1);
                    currentNode.numberOfVisits = currentNode.inputEdges.length;
                    ctx.continuations.push(currentNode);
                }
                return [];
            }
            // console.log("do not visit "+currentNode.uid  + " nbVisit = "+currentNode.numberOfVisits + " inputEdges = "+currentNode.inputEdges.length)
            return [];
        }
        
        if (currentNode.numberOfVisits == currentNode.inputEdges.length){        
            if(! ctx.continuations.includes(currentNode)){
                if(currentNode.isCycleInitiator){
                    ctx.continuationsRecursLevel.push(ctx.recursLevel-1);
                    currentNode.numberOfVisits = currentNode.inputEdges.length;
                }
                ctx.continuations.push(currentNode);
            }
            return [];
        }
    }  
    
    if (ctx.visitedUID.includes(currentUID)){
        return [];
    }
    ctx.visitedUID.push(currentUID);
    // console.log("visit "+currentNode.uid  + " nbVisit = "+currentNode.numberOfVisits)


    // if(currentNode.cycles.length > 0){
    //     console.log("cycle detected in" + currentNode.uid+":"+currentNode.cycles.map(c => c.map(n => n.uid).join("->")).join(" | "))
    // }
    switch(currentNode.getType()){
        case "Step": {
                thisNodeCode = StepNode(thisNodeCode, currentNode, ccfg, generator, ctx);
                break;
            }
        case "Fork": {
                thisNodeCode = ForkNode(thisNodeCode, currentNode, ccfg, generator, ctx);
                break;
            }
        case "AndJoin": {
                thisNodeCode = AndJoinNode(thisNodeCode, currentNode, ccfg, generator, ctx);
                break;
            }
        case "OrJoin": {
                thisNodeCode = OrJoinNode(thisNodeCode, currentNode, ccfg, generator, ctx);
                break;
            }
        case "Choice": {
                thisNodeCode = ChoiceNode(thisNodeCode, currentNode, ccfg, generator, ctx);
                break;
            }
    } 
    
    if(ctx.continuations.length > 0){
        // console.log("recursLevel = "+recursLevel+" continuationsRecursLevel = "+continuationsRecursLevel.at(-1))
        while (ctx.recursLevel == ctx.continuationsRecursLevel.at(-1)){
            const toVisit = ctx.continuations.pop();
            ctx.continuationsRecursLevel.pop();
            if(toVisit != undefined){
                // console.log("continuation of "+toVisit.uid + " from "+currentNode.uid + " nbVisit = "+toVisit.numberOfVisits)
                thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, toVisit, /*nextUntilUID,*/ generator, ctx)];
            }
        }   
    }
    ctx.recursLevel = ctx.recursLevel - 1;
    return thisNodeCode;
}

function StepNode(thisNodeCode: string[], currentNode: Node, ccfg: CCFG, generator: IGenerator, ctx: TraversalContext): string[]{
    thisNodeCode = [...thisNodeCode, ...addCorrespondingCode(currentNode, ccfg, generator, ctx)];
    if(currentNode.outputEdges.length > 1){
        const edgeToVisit: Edge[] = currentNode.outputEdges;
        for(const edge of edgeToVisit){
            ctx.continuationsRecursLevel.push(ctx.recursLevel-1);
            ///todo  à quoi ce truc sert ? ------------------------------------------------------------------------------------------------
            //codeFile.append(`
            //{`)
            thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, edge.to, /*untilUID,*/ generator, ctx)];
            //codeFile.append(`
            //}`);
        }
    }else{
        const edge = currentNode.outputEdges[0];
        thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg,edge.to, /*untilUID,*/ generator, ctx)];
    }
    return thisNodeCode;
}

function ForkNode(thisNodeCode: string[], currentNode: Node, ccfg: CCFG, generator: IGenerator, ctx: TraversalContext): string[]{
    const edgeToVisit: Edge[] = currentNode.outputEdges;
        
    for(const syncUID of currentNode.syncNodeIds){
        const n = ccfg.getNodeByUID(syncUID);
        if (n != undefined){
            const ptns: Node[] = getPreviousTypedNodes(n.inputEdges[0]);
            if(ptns.length > 1){
                throw new Error("multiple previous typed nodes not handled here");
            }
            const ptn = ptns[0];
            if(ptn.returnType != undefined){
                if(!ctx.createdQueueIds.includes(syncUID)){
                    ctx.createdQueueIds.push(syncUID);
                    if(ptn.returnType != "void" && ptn.returnType != undefined){
                        thisNodeCode = [...thisNodeCode, ...generator.createLockingQueue(ptn.returnType,syncUID)];
                    }else{
                        thisNodeCode = [...thisNodeCode, ...generator.createSynchronizer(syncUID)];
                    }
                }
            }
        }
    }

    ctx.continuationsRecursLevel.push(ctx.recursLevel);

    for(const edge of edgeToVisit){
        //console.log("fork node cycles = "+currentNode.cycles.map(c => c.map(n => n.uid).join("->")).join(" | "))
        if (edge.to.cycles.length > 0 && ! edge.to.cyclePossessAnAndJoin()){
            //we have a cycle and no andJoin in the cycle
            //console.log(edge.to.uid+": no andJoin in cycle ")
            thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ generator, ctx)];
            if(edge.to.isCycleInitiator){
                thisNodeCode = [...thisNodeCode, ...addQueuePushCode(edge.to.uid,edge.to,ccfg,undefined,generator, ctx)];
            }
        }else{
            ctx.fifoThreadUid.add(currentNode.uid,edge.to.uid);
            const insideThreadCode = visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ generator, ctx);
            thisNodeCode = [...thisNodeCode, ...generator.createAndOpenThread(edge.to.uid,insideThreadCode)];
        }
    }
    return thisNodeCode;
}

function AndJoinNode(thisNodeCode: string[], currentNode: Node, ccfg: CCFG, generator: IGenerator, ctx: TraversalContext): string[]{
     // let paramNames = getParameterNames(currentNode);
    for(const i of Array.from(Array(currentNode.inputEdges.length).keys())){            
        const ptns :Node[] = getPreviousTypedNodes(currentNode.inputEdges[i]);
        if(ptns.length > 1){
            throw new Error("multiple previous typed nodes not handled here");
        }
        const ptn = ptns[0];
        let paramType: string| undefined = ptn.returnType;

        const paramName = "AndJoinPopped_"+currentNode.uid+"_"+i;
        if(currentNode.params.length > i && (currentNode.params[i].type != undefined)){
            paramType = currentNode.params[i].type;
        }
            
        if(currentNode.functionsDefs.length == 0){
            currentNode.params.push({name: paramName, type: paramType});
            currentNode.returnType = paramType;
        }
        if (paramType == "void"){
            thisNodeCode = [...thisNodeCode, ...generator.waitForSynchronizer(currentNode.uid)];
        } else {
            thisNodeCode = [...thisNodeCode, ...generator.createVar(paramType || "void",paramName)];
            thisNodeCode = [...thisNodeCode, ...generator.receiveFromQueue(currentNode.uid,paramType||"void", paramName)];
        }
    }

    thisNodeCode = [...thisNodeCode, ...addCorrespondingCode( currentNode, ccfg, generator, ctx)];
    const nextNode = currentNode.outputEdges[0].to;
    thisNodeCode = [...thisNodeCode, ...visitAllNodes(ccfg,nextNode, /*untilUID,*/ generator, ctx)];

    return thisNodeCode;
}

function OrJoinNode(thisNodeCode: string[], currentNode: Node, ccfg: CCFG, generator: IGenerator, ctx: TraversalContext): string[]{
    // let paramNames = getParameterNames(currentNode);
    const paramName = "OrJoinPopped_"+currentNode.uid;
    let paramType: string| undefined = undefined;
    for(const e of currentNode.inputEdges){
        const ptns: Node[] = getPreviousTypedNodes(e);
        if(ptns.length > 1){
            throw new Error("multiple previous typed nodes not handled here");
        }
        const ptn = ptns[0];
        paramType = ptn.returnType;
        if(paramType != undefined){
            break;
        }
    }
    if(currentNode.functionsDefs.length == 0){
        currentNode.params.push({name: paramName, type: paramType});
        currentNode.returnType = paramType;
    }
            
    let insideLoopCode: string[] = [];
    if (paramType == "void" || paramType == undefined){
        insideLoopCode = [...insideLoopCode, ...generator.waitForSynchronizer(currentNode.uid)];
    } else {
        insideLoopCode = [...insideLoopCode, ...generator.createVar(paramType || "void",paramName)];
        insideLoopCode = [...insideLoopCode, ...generator.receiveFromQueue(currentNode.uid,paramType||"void", paramName)];
    }
    const nextNode = currentNode.outputEdges[0].to;
    insideLoopCode = [...insideLoopCode, ...visitAllNodes(ccfg,nextNode, /*untilUID,*/ generator, ctx)];
            
    if(currentNode.isCycleInitiator){
        thisNodeCode = [...thisNodeCode, ...generator.createLoop(currentNode.uid,insideLoopCode)]; //ends the while loop
    }else{
        thisNodeCode = [...thisNodeCode, ...insideLoopCode];
    }
    
    return thisNodeCode;
}

function ChoiceNode(thisNodeCode: string[], currentNode: Node, ccfg: CCFG, generator: IGenerator, ctx: TraversalContext): string[]{
    for(const syncUID of currentNode.syncNodeIds){
        const n = ccfg.getNodeByUID(syncUID);
        if (n != undefined){
            const ptns: Node[] = getPreviousTypedNodes(n.inputEdges[0]);
            if(ptns.length > 1){
                throw new Error("multiple previous typed nodes not handled here");
            }
            if(!ctx.createdQueueIds.includes(syncUID)){
                ctx.createdQueueIds.push(syncUID);

    // from here --------------------------------
                thisNodeCode = [...thisNodeCode, ...generator.createSynchronizer(syncUID)];
            }
        }
    }

    ctx.continuationsRecursLevel.push(ctx.recursLevel);

    thisNodeCode = [...thisNodeCode, ...addComparisonVariableDeclaration(currentNode, generator)];
    const edgeToVisit: Edge[] = currentNode.outputEdges;  

    for(const edge of edgeToVisit){
            
        const guards: string[] = [];
        for(const guard of edge.guards){
            //console.log(guardList)     
            if (guard.$instructionType=== "verifyEqualInstruction"){
                const g = guard as VerifyEqualInstruction;
                guards.push(generator.createEqualsVerif(g.n1,g.n2));
            } 
        }

        let insideOfIf:string[];

        insideOfIf = addCorrespondingCode(currentNode, ccfg, generator, ctx);
        insideOfIf = [...insideOfIf, ...visitAllNodes(ccfg, edge.to, /*nextUntilUID,*/ generator, ctx)];             
            
        //special case for choice node when directly linked to join node
        if((edge.to.getType() == "AndJoin" || edge.to.getType() == "OrJoin") && currentNode.functionsDefs.length == 0){
            if(currentNode.returnType == undefined){
                const ptns: Node[] = getPreviousTypedNodes(currentNode.inputEdges[0]);
                if(ptns.length > 1){
                    console.log(chalk.red(currentNode.uid+" : multiple previous typed nodes not handled here"));
                }
                const ptn = ptns[0];     
                insideOfIf = [...insideOfIf, ...addQueuePushCode(edge.to.uid, ptn, ccfg,  ptn.functionsNames[0],generator, ctx)];
            }else{
                insideOfIf = [...insideOfIf, ...addQueuePushCode(edge.to.uid, currentNode, ccfg,  currentNode.functionsNames[0],generator, ctx)];
            }
        }
        thisNodeCode = [...thisNodeCode , ...generator.createIf(guards,insideOfIf)];   
    }

    return thisNodeCode;
}