import { Thread } from "./Thread.js";
import { creatFunctionForEdge, nodeCode } from "./functionExecution.js";
/**
 * browse the ccfg sart with a given node
 * @param startNode
 * @param sigma
 * @param ThreadList
 * @param debugsession
 * @returns stop the visit
 */
export async function visitAllNodesInterpret(startNode, sigma, ThreadList) {
    let currentNode = startNode;
    while (currentNode.outputEdges && ((currentNode.outputEdges[0] && currentNode.outputEdges[0].to) || (currentNode.outputEdges[1] && currentNode.outputEdges[1].to))) {
        switch (currentNode.getType()) {
            case "Step": {
                currentNode = visitStep(currentNode, ThreadList);
                break;
            }
            case "Fork": {
                visitFork(currentNode, ThreadList, sigma);
                return;
            }
            case "AndJoin": {
                //verify if thread.currentInstruction ? = []
                currentNode = visitAndJoin(currentNode, ThreadList);
                break;
            }
            case "OrJoin": {
                currentNode = visitOrJoin(currentNode, ThreadList);
                break;
            }
            case "Choice": {
                const nextNode = visitChoice(currentNode, ThreadList, sigma);
                if (nextNode === undefined)
                    return;
                currentNode = nextNode;
                break;
            }
        }
    }
    console.log(sigma);
}
function visitStep(currentNode, ThreadList) {
    console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
    if (currentNode.functionsDefs.length > 0) {
        nodeCode(currentNode, ThreadList); //retrieve the corresponding function from the node; store retrun value of the function | call function
    }
    const nextNode = currentNode.outputEdges[0].to;
    ThreadList.peek().currentInstruction = nextNode.outputEdges;
    return nextNode;
}
function visitFork(currentNode, ThreadList, sigma) {
    let edgeSelected;
    console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
    const threadcurrent = ThreadList.peek();
    edgeSelected = threadcurrent.currentInstruction[0];
    if (Array.isArray(edgeSelected)) {
        //all of the children execute at the same time
        threadcurrent.currentInstruction = []; //set to empty list
        edgeSelected.forEach(edge => {
            const threadCurrent = new Thread(edge.to);
            ThreadList.push(threadCurrent);
            visitAllNodesInterpret(edge.to, sigma, ThreadList); //visit the sub-tree
        });
    }
    else { // user select only one edge
        const threadCurrent = new Thread(edgeSelected.to);
        ThreadList.push(threadCurrent);
        visitAllNodesInterpret(edgeSelected.to, sigma, ThreadList); //visit the sub-tree
    }
}
function visitAndJoin(currentNode, ThreadList) {
    console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
    const threadChild = ThreadList.pop(); //pop the children thread from the list
    const threadCurrent = ThreadList.peek(); //parent's thread
    //delete the child from list
    threadCurrent.currentInstruction = threadCurrent.currentInstruction.filter(edge => edge.to.uid !== threadChild.owner.uid);
    //pick up sub-tree value
    if (threadChild.tempValue.size() != 0) { //suppose the size == 0
        console.log(threadChild.tempValue.size());
        threadCurrent.tempValue.push(threadChild.tempValue.peek());
    }
    if (threadCurrent.currentInstruction.length !== 0) { //still have children not-executed
        return threadCurrent.currentInstruction[0].from; //the visit of node go back to the fork node
    }
    else { //all children executed
        if (currentNode.functionsDefs.length != 0) {
            nodeCode(currentNode, ThreadList); //execute code defined in the AndJoin node
        }
        //go to the next node of Andjoin Node
        const nextNode = currentNode.outputEdges[0].to;
        threadCurrent.currentInstruction = nextNode.outputEdges;
        return nextNode;
    }
}
function visitOrJoin(currentNode, ThreadList) {
    console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
    const nextNode = currentNode.outputEdges[0].to;
    ThreadList.peek().currentInstruction = nextNode.outputEdges;
    return nextNode;
}
function visitChoice(currentNode, ThreadList, sigma) {
    console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
    let nodeTrue;
    let nodeFalse;
    //get resRight
    const param = [ThreadList.peek().tempValue.peek()];
    ThreadList.peek().tempValue.pop();
    //evaluation of each edge of choice
    currentNode.outputEdges.forEach(edge => {
        const f = creatFunctionForEdge(edge, sigma);
        const bool = f(param);
        if (bool) {
            nodeTrue = edge.to;
        }
        else {
            nodeFalse = edge.to;
        }
    });
    //go to the next node which evoluation of the guard is true 
    if (nodeTrue && nodeFalse)
        return nodeTrue;
    else {
        console.log("trueNode | flaseNode doesn't existe at node.uid =" + currentNode.uid);
        return undefined;
    }
}
