import { Stack } from "./TempList.js";
export class Thread {
    tempValue; //The temparal values retrun by function in node (Modify as a stack)
    owner; //The strated Node of a thread (the value of the attribute would not be changed)
    currentInstruction; //A list of edge or edges to the next step(varies depending on the visit process. from attribute of edge = current node)
    constructor(owner) {
        this.tempValue = new Stack();
        this.owner = owner;
        this.currentInstruction = [...owner.outputEdges];
    }
}
