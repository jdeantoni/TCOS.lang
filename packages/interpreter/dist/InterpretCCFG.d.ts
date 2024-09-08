import { CCFG, Edge, Node } from 'ccfg';
import { IGenerator } from 'backend-compiler/GeneratorInterface.js';
import { Stack } from './TempList.js';
export declare var debug: boolean;
export declare function interpretfromCCFG(ccfg: CCFG, generator: IGenerator, isDebug: boolean): Promise<void>;
/****************************************************************************** INTERPRETER *******************************************************************************/
export declare class Thread {
    tempValue: Stack<number>;
    owner: Node;
    currentInstruction: Edge[];
    constructor(owner: Node);
}

/**
 * browse the ccfg sart with a given node
 * @param startNode
 * @param sigma
 * @param ThreadList
 * @param debugsession
 * @returns stop the visit
 */
export declare function visitAllNodesInterpret(startNode: Node, sigma: Map<string, any>, ThreadList: Stack<Thread>): Promise<void>;

