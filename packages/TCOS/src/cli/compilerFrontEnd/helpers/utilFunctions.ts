import { CompositeGeneratorNode } from "langium/generate";

/**
 * writes the basic functions of the front end of the compiler
 * @param fileNode the file
 */
export function addUtilFunctions(fileNode: CompositeGeneratorNode,rootTypeName: string) {
    fileNode.append(`
    generateCCFG(root: ${rootTypeName}, debug: boolean = false): CCFG {

        //pass 1: create local CCFGs for all nodes
        console.log("pass 1: create local CCFGs for all nodes")
        let astNodeToLocalCCFG = new Map<AstNode, CCFG>()
        for (let n of AstUtils.streamAst(root)){
            let localCCFG = this.createLocalCCFG(n)
            if(debug){
                let dotContent = localCCFG.toDot();
                fs.writeFileSync(\`./generated/localCCFGs/localCCFG\${localCCFG.initialState?.functionsNames[0].replace(/init\d+/g,"")}.dot\`, dotContent);
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
        startsTimerHoleNode.functionsNames = [\`init\${startsTimerHoleNode.uid}Timer\`]
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
    `)
}