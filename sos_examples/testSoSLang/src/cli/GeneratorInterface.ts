import { CompositeGeneratorNode } from "langium";
import { TypedElement } from "../ccfg/ccfglib";

interface IGenerator {


    // nameFile is a function that takes a file name as an argument and returns a filename with a specific extension
    nameFile(filename:string): string;
    // createBase is a function that takes a the codeFile we write in and writes in all the global variable declarations and imports
    createBase(codeFile: CompositeGeneratorNode,debug:boolean): void;
    // endFile is a function that takes a the codeFile write in and does any necessary cleanup at the end of the file 
    endFile(codeFile: CompositeGeneratorNode): void;
    // createFunction is a function that takes a the codeFile we write in, a function name, a list of parameters, and a return type and writes in the function declaration
    createFunction(codeFile:CompositeGeneratorNode,fname:string,params:TypedElement[],returnType:string): void;
    // createMainFunction is a function that takes a the codeFile we write in and writes in the main function declaration and opening bracket
    createMainFunction(codeFile:CompositeGeneratorNode): void;
    // createFuncCall is a function that takes a the codeFile we write in, a function name, a list of parameters, and a return type and writes in the function call
    createFuncCall(codeFile: CompositeGeneratorNode,fname:string,params:string[],typeName:string): void;
    // createIf is a function that takes a the codeFile we write in and a list of conditions and writes in an if statement with the specified conditions
    createIf(codeFile: CompositeGeneratorNode, guards: string[]): void;  /// the guards are a list of strings that represent the conditions of the if statement
    // createSynchronizer is a function that takes a the codeFile we write in and a unique identifier and writes in a synchronizer for the threads
    createSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): void;
    // activateSynchronizer is a function that takes a the codeFile we write in and a unique identifier and writes in a way to activate the synchronizer
    activateSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): void;
    // waitForSynchronizer is a function that takes a the codeFile we write in and a unique identifier and writes in a way to wait for the synchronizer activation
    waitForSynchronizer(codeFile: CompositeGeneratorNode, synchUID: number): void;
    // createAndOpenThread is a function that takes a the codeFile we write in and a unique identifier and writes in a way to create and open a thread
    createAndOpenThread(codefile: any, uid: number): void;
    // endThread is a function that takes a the codeFile we write in and a unique identifier and writes in a way to end a thread
    endThread(codeFile: CompositeGeneratorNode, uid: number): void;
    // endSection is a function that takes a the codeFile we write in and writes in a way to end a section of code (e.g. a function or if statement)
    endSection(codeFile: CompositeGeneratorNode): void;
    // createQueue is a function that takes a the codeFile we write in and a unique identifier and writes in a way to create a queue
    createQueue(codeFile: CompositeGeneratorNode,queueUID:number): void;
    // createLockingQueue is a function that takes a the codeFile we write in, a type, and a unique identifier and writes in a way to create a locking queue (a queue that is thread safe)
    createLockingQueue(codeFile: CompositeGeneratorNode, typeName: string, queueUID: number): void;
    // receiveFromQueue is a function that takes a the codeFile we write in, a unique identifier, a type, and an optional variable name and writes in a way to pop the variables from a queue
    receiveFromQueue(codeFile: CompositeGeneratorNode,queueUID:number,typeName:string,varName:string): void;
    /**
     * sendToQueue is a function that takes a the codeFile we write in, a unique identifier, a type, and a variable name and writes in a way to push the variable into a queue
     * @param codeFile 
     * @param queueUID 
     * @param typeName 
     * @param varName 
     */
    sendToQueue(codeFile: CompositeGeneratorNode,queueUID:number,typeName:string,varName:string): void;
    // assignVar is a function that takes a the codeFile we write in, a local variable's name, and a value and writes in a way to set the value of the variable
    assignVar(codeFile: CompositeGeneratorNode,varName:string,value:string): void;
    // returnVar is a function that takes a the codeFile we write in and a local variable name and writes in a way to return the variable
    returnVar(codeFile: CompositeGeneratorNode,varName:string): void;
    // createVar is a function that takes a the codeFile we write in, a type, and a local variable name and writes in a way to declare a variable
    createVar(codeFile: CompositeGeneratorNode,type:string,varName:string): void;
    // createGlobalVar is a function that takes a the codeFile we write in, a type, and a global variable name and writes in a way to declare a global variable
    createGlobalVar(codeFile: CompositeGeneratorNode,type:string,varName:string): void;
    // setVarFromGlobal is a function that takes a the codeFile we write in, a type, a local variable name, and a global variable name and writes in a way to set the local variable from the global variable
    setVarFromGlobal(codeFile: CompositeGeneratorNode,type:string,varName:string,value:string): void;
    // setGlobalVar is a function that takes a the codeFile we write in, a type, a global variable name, and a value and writes in a way to set the global variable to the value
    setGlobalVar(codeFile: CompositeGeneratorNode,type:string,varName:string,value:string): void;
    // createOperation is a function that takes a the codeFile we write in, a local variable name, an operator, and another local variable name and writes in a way to perform the operation
    operation(codeFile: CompositeGeneratorNode,varName:string,n1:string,op:string,n2:string): void;
    // createEqualsVerif is a function that takes two values and returns a string that represents checking if the two values are equal 
    createEqualsVerif(firstValue: string, secondValue: string): string;
}

export {IGenerator};