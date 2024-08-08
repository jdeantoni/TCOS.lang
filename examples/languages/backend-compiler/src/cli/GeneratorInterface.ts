
import { TypedElement } from "../../../CCFG/src/ccfglib";

interface IGenerator {
    isDebug: boolean;
    

    setDebug(debug:boolean): void;
    /**
     * nameFile is a function that takes a file name as an argument and returns a filename with a specific extension
     * @param filename the name of the file
     */
    nameFile(filename:string): string;
    /**
     * createBase is a function that takes a the codeFile we write in and writes in all the global variable declarations and imports
     * @param codeFile the codefile to be written in
     * @param debug debug is a boolean that is true if the user wants to print debug statements of the compiler in the output (e.g. print the value of variables at different points in the code) you will have to implement it in the generator
     */
    createBase(): string[];
    /**
     * endFile is a function that takes a the codeFile we write in and does any necessary cleanup at the end of the file
     * @param codeFile the codefile to be written in
     */
    endFile(): string[];
    /**
     * createFunction is a function that takes a the codeFile we write in, a function name, a list of parameters, and a return type and writes in the function declaration
     * @param codeFile the codefile to be written in
     * @param fname the name of the function
     * @param params the parameters of the function
     * @param returnType the return type of the function
     * @param insideFunction a list of the strings for each line of code inside the function in the right order
     */
    createFunction(fname:string,params:TypedElement[],returnType:string,insideFunction:string[]): string[];
    /**
     * createIf is a function that takes a the codeFile we write in and a list of conditions and writes in the start of an if statement with the specified conditions
     * @param codeFile the codefile to be written in
     * @param guards the guards are a list of strings that represent the conditions of the if statement
     * @param insideOfIf the compositegeneratornode containing the code that will be inside the if statement
     */
    createIf( guards: string[],insideOfIf: string[]): string[]; 
    /**
     * createAndOpenThread is a function that takes a the codeFile we write in and a unique identifier and writes in a way to create and open a thread
     * @param codefile the codefile to be written in
     * @param uid the unique identifier of the thread
     */
    createAndOpenThread( uid: number,insideThreadCode:string[]): string[];
    /**
     * createMainFunction is a function that takes a the codeFile we write in and writes in the main function declaration and opening bracket
     * @param codeFile the codefile to be written in
     */
    
    createMainFunction(insideMain:string[]): string[];
    /**
     * createFuncCall is a function that takes a the codeFile we write in, a function name, a list of parameters, and a return type and writes in the function call
     * you should use this function to call functions that you have already declared
     * name the variable that will store the return value of the function with result[fname] 
     * @param codeFile the codefile to be written in
     * @param fname the name of the function
     * @param params the parameters of the function
     * @param typeName the type of the return of the function
     */
    createFuncCall(fname:string,params:string[],typeName:string): string[];
    
    
    /**
     * set a boolean variable to true or false depending if looping (goto loop start) or not. The var is name "flag"+uid
     * @param codeFile the codefile to be written in
     * @param queueUID the unique identifier of the flag
     */
    setLoopFlag( UID: number): string[];
    /**
     * returns the target dependent code to start a loop block on truthiness of specific boolean flag
     * @param codeFile the codefile to be written in
     * @param uid the unique identifier of the flag whose name should be "flag"+uid
     */
    createLoop( uid: number, insideLoop:string[]): string[];

    /**
     * createSynchronizer is a function that takes a the codeFile we write in and a unique identifier and writes in a synchronizer for the threads
     * @param codeFile this is the codefile to be written in
     * @param synchUID this is the unique identifier of the synchronizer
     */
    createSynchronizer( synchUID: number): string[];
    /**
     * activateSynchronizer is a function that takes a the codeFile we write in and a unique identifier and writes in a way to activate the synchronizer
     * @param codeFile this is the codefile to be written in
     * @param synchUID this is the unique identifier of the synchronizer
     */
    activateSynchronizer( synchUID: number): string[];
    /**
     * waitForSynchronizer is a function that takes a the codeFile we write in and a unique identifier and writes in a way to wait for the synchronizer
     * @param codeFile the codefile to be written in
     * @param synchUID the unique identifier of the synchronizer
     */
    waitForSynchronizer( synchUID: number): string[];
    
    /**
     * createQueue is a function that takes a the codeFile we write in and a unique identifier and writes in a way to create a queue
     * @param codeFile the codefile to be written in
     * @param queueUID the unique identifier of the queue
     */
    createQueue(queueUID:number): string[];
    /**
     *  createLockingQueue is a function that takes a the codeFile we write in, a type, and a unique identifier and writes in a way to create a locking queue (a queue that is thread safe)
     * 
     * @param codeFile the codefile to be written in
     * @param typeName the type of the queue
     * @param queueUID the unique identifier of the queue
     */
    createLockingQueue( typeName: string, queueUID: number): string[];
    /**
     *   receiveFromQueue is a function that takes a the codeFile we write in, a unique identifier, a type, and an optional variable name and writes in a way to pop the variables from a queue
     * 
     * @param codeFile the codefile to be written in
     * @param queueUID the unique identifier of the queue
     * @param typeName type of the variable to be popped
     * @param varName name of the variable to be popped
     * */
    receiveFromQueue(queueUID:number,typeName:string,varName:string): string[];
    /**
     * sendToQueue is a function that takes a the codeFile we write in, a unique identifier, a type, and a variable name and writes in a way to push the variable into a queue
     * @param codeFile the codefile to be written in
     * @param queueUID the unique identifier of the queue
     * @param typeName type of the variable to be pushed
     * @param varName name of the variable to be pushed
     */
    sendToQueue(queueUID:number,typeName:string,varName:string): string[];
    /**
     * assignVar is a function that takes a the codeFile we write in, a local variable's name, and a value and writes in a way to set the value of the variable
     * @param codeFile the codefile to be written in
     * @param varName the name of the variable
     * @param value the value to be assigned to the variable
     */
    assignVar(varName:string,value:string): string[];
    /**
     * returnVar is a function that takes a the codeFile we write in and a local variable name and writes in a way to return the variable
     * @param codeFile the codefile to be written in
     * @param varName the name of the variable
     */
    returnVar(varName:string): string[];
    /**
     * createVar is a function that takes a the codeFile we write in, a type, and a local variable name and writes in a way to declare a variable
     * @param codeFile the codefile to be written in
     * @param type the type of the variable
     * @param varName the name of the variable
     */
    createVar(type:string,varName:string): string[];
    /**
     * createGlobalVar is a function that takes a the codeFile we write in, a type, and a global variable name and writes in a way to declare a variable that can be read and written to by all threads and functions
     * @param codeFile the codefile to be written in
     * @param type the type of the variable
     * @param varName the name of the variable
     */
    createGlobalVar(type:string,varName:string): string[];
    /**
     * setVarFromGlobal is a function that takes a the codeFile we write in, a type, a local variable name, and a global variable name and writes in a way to set the local variable from the global variable
     * @param codeFile the codefile to be written in
     * @param type the type of the variable
     * @param varName the name of the variable
     * @param value the name of the global variable
     */
    setVarFromGlobal(type:string,varName:string,value:string): string[];
    /**
     * setGlobalVar is a function that takes a the codeFile we write in, a type, a global variable name, and a value and writes in a way to set the global variable to the value
     * @param codeFile the codefile to be written in
     * @param type the type of the variable
     * @param varName the name of the variable
     * @param value the value to be assigned to the variable
     */
    setGlobalVar(type:string,varName:string,value:string): string[];
    /**
     * operation is a function that takes a the codeFile we write in, a local variable name, an operator, and another local variable name and writes in a way to perform the operation
     * @param codeFile the codefile to be written in
     * @param varName the name of the variable
     * @param n1 the first variable
     * @param op the operator
     * @param n2 the second variable
     */
    operation(varName:string,n1:string,op:string,n2:string): string[];
    /**
     * the createEqualsVerif function is a function that takes two values and returns a string that represents checking if the two values are equal
     * @param firstValue the first value
     * @param secondValue the second value
     */
    createEqualsVerif(firstValue: string, secondValue: string): string;

    /**
     * createSleep is a function that takes a the codeFile we write in, a duration and writes in a way to sleep the thread for the specified duration
     * @param codeFile the codefile to be written in
     * @param duration the duration to sleep the thread for
     * @returns a string array that contains the code to sleep the thread
     **/
    createSleep( duration: string): string[];
}

export {IGenerator};