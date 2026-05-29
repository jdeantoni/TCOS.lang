/* This file is use to interpret the CCFG step by step helpping us to understand how a program execute and the language beheviouse.
    It contains the generetion of the ccfg which representes a program written in a domaine specifecate language.

    In the nodes of CCFG, it contains some functions when the program execute. We need to define these functions thought interface
    to define functions in javaScript.

    We have a global variable sigma to store the value of variables defined in the program. And the calss Thread allow us to simulate
    the execution of a thread.
*/
import { Thread } from "./Thread.js";
import { Stack } from "./TempList.js";
import { CCFG } from "ccfg";
import { IGenerator } from "backend-compiler/GeneratorInterface";
import { compileFunctionDefs } from "./generationFunctionDefs.js";
import { visitAllNodesInterpret } from "./visitAllNodesInterpreter.js";
import { setAllFunctions } from "./functionExecution.js";

export async function interpretfromCCFG(ccfg:CCFG, generator:IGenerator, isDebug:boolean):Promise<void>{
    const sigma: Map<string, unknown> = new Map<string, unknown>();
    const ThreadList : Stack<Thread> = new Stack();

    setAllFunctions(compileFunctionDefs(ccfg,generator,sigma,undefined));

    if(ccfg.initialState){
        const threadInit = new Thread(ccfg.initialState);
        ThreadList.push(threadInit);
        await visitAllNodesInterpret(ccfg.initialState, sigma, ThreadList); //breakpointAdresse should be a debug seesion
    }  
}