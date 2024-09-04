/* This file is use to interpret the CCFG step by step helpping us to understand how a program execute and the language beheviouse.
    It contains the generetion of the ccfg which representes a program written in a domaine specifecate language.

    In the nodes of CCFG, it contains some functions when the program execute. We need to define these functions thought interface
    to define functions in javaScript.

    We have a global variable sigma to store the value of variables defined in the program. And the calss Thread allow us to simulate
    the execution of a thread.
*/
import { CompositeGeneratorNode } from 'langium/generate';
import { AddSleepInstruction, AssignVarInstruction, CCFG, CreateGlobalVarInstruction, CreateVarInstruction, Edge, Node,OperationInstruction,ReturnInstruction,SetGlobalVarInstruction,SetVarFromGlobalInstruction,TypedElement } from 'ccfg';
import { IGenerator } from 'backend-compiler/GeneratorInterface';
import { Stack } from './TempList.js';
// import { MockDebugSession } from './degugger/mockDebug.js';

// const verifyEqual = "verifyEqual" //verifyEqual,varName1,varName2
export var debug = false; 



let allFunctions : Map<string,Function> = new Map();

export async function interpretfromCCFG(ccfg:CCFG, generator:IGenerator, isDebug:boolean):Promise<void>{
    const sigma: Map<string, any> = new Map<string, any>();
    var ThreadList : Stack<Thread> = new Stack();
    // var debugsession: MockDebugSession | undefined =undefined;
    if(isDebug){
        //debugsession = new MockDebugSession(fileAccessor);
    }
    allFunctions  = compileFunctionDefs(ccfg,generator,sigma,undefined);

    if(ccfg.initialState){
        let threadInit = new Thread(ccfg.initialState);
        ThreadList.push(threadInit);
        await visitAllNodesInterpret(ccfg.initialState, sigma, ThreadList/*, debugsession*/);//breakpointAdresse should be a debug seesion
    }  
}





function compileFunctionDefs(ccfg: CCFG,generator:IGenerator,sigma:Map<string,any>,codeFile?:CompositeGeneratorNode): Map<string,Function> {
    let functionsDefs: Map<string,Function> = new Map()
    for (let node of ccfg.nodes) {
        // if(node.getType() == "ContainerNode"){
        //     functionsDefs += compileFunctionDefs((node as ContainerNode).internalccfg);
        // }else{
            if(!debug && node.functionsDefs.length == 0){
                continue
            }
            if(node.returnType != undefined){
                    for (let fname of node.functionsNames) {
                    // console.log("function name: "+fname);
                        let allFDefs:string[] = [];
                        for (let fdef of node.functionsDefs) {
                            if  (fdef instanceof ReturnInstruction) {
                                let b = fdef as ReturnInstruction;
                                allFDefs= [...allFDefs, ...generator.returnVar(b.varName)];
                            }else if (fdef instanceof CreateVarInstruction){
                                let b = fdef as CreateVarInstruction;
                                allFDefs = [...allFDefs, ...generator.createVar(b.type, b.varName)];
                            }else if (fdef instanceof AssignVarInstruction){
                                let b = fdef as AssignVarInstruction;
                                allFDefs=[...allFDefs, ...generator.assignVar(b.varName, b.value)];
                            } else if (fdef instanceof SetVarFromGlobalInstruction){
                                let b = fdef as SetVarFromGlobalInstruction;
                                allFDefs =[...allFDefs, ...generator.setVarFromGlobal(b.type, b.varName, b.globalVarName)];
                            } else if (fdef instanceof CreateGlobalVarInstruction){
                                let b = fdef as CreateGlobalVarInstruction;
                                allFDefs=[...allFDefs, ...generator.createGlobalVar(b.type, b.varName)];
                            } else if (fdef instanceof SetGlobalVarInstruction){
                                let b = fdef as SetGlobalVarInstruction;
                                allFDefs=[...allFDefs, ...generator.setGlobalVar(b.type, b.globalVarName, b.value)];
                            } else if (fdef instanceof OperationInstruction){
                                let b = fdef as OperationInstruction;
                                allFDefs=[...allFDefs, ...generator.operation( b.varName, b.n1, b.op, b.n2)];
                            } else if (fdef instanceof AddSleepInstruction){
                                let b = fdef as AddSleepInstruction;
                                allFDefs=[...allFDefs, ...generator.createSleep(b.duration)];
                            } 
                            else{
                                console.log("Unknown function definition: "+ fdef.$instructionType+ " pop"+fdef.toString());
                                allFDefs = [...allFDefs, fdef.toString()];
                            }

                        }
                        //console.log("function name: "+fname+ " allFDefs = "+allFDefs);
                        //generator.createFunction(codeFile,fname, node.params, node.returnType,allFDefs);
                        let fnamestring:string = "function" + fname;
                        functionsDefs.set(fnamestring,defineFunction(fnamestring, node.params, allFDefs, sigma))
                }
            }
        // }
    }
    return functionsDefs;
}























/****************************************************************************** INTERPRETER *******************************************************************************/
export class Thread {
    tempValue : Stack<number>;      //The temparal values retrun by function in node (Modify as a stack)
    owner : Node;                   //The strated Node of a thread (the value of the attribute would not be changed)
    currentInstruction : Edge[];    //A list of edge or edges to the next step(varies depending on the visit process. from attribute of edge = current node)

    constructor(owner:Node){
        this.tempValue = new Stack();
        this.owner = owner;
        this.currentInstruction = [...owner.outputEdges];
    }
}

/**
 * browse the ccfg sart with a given node
 * @param startNode 
 * @param sigma 
 * @param ThreadList 
 * @param debugsession 
 * @returns stop the visit
 */
export async function visitAllNodesInterpret(startNode : Node, sigma: Map<string, any>, ThreadList : Stack<Thread>/*,  debugsession: MockDebugSession|undefined*/){ 

    var currentNode : Node = startNode;
    var edgeSelected : Edge|Edge[]|undefined;
    while(currentNode.outputEdges && ((currentNode.outputEdges[0] && currentNode.outputEdges[0].to) || (currentNode.outputEdges[1] && currentNode.outputEdges[1].to))){
        /***** Check breakpoint ******/
        // if(debugsession){
            /*if(debugsession.getBreakpoints().includes(currentNode)){
                debugsession.pauseExecution();
                return;
            }*/
        // }

        switch(currentNode.getType()){
            case "Step":{
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                if(currentNode.functionsDefs.length > 0){
                    nodeCode(currentNode,ThreadList);//retrieve the corresponding function from the node; store retrun value of the function | call function
                }
                currentNode = currentNode.outputEdges[0].to;
                ThreadList.peek().currentInstruction = currentNode.outputEdges;
                /*
                else{
                    if(node.cycles.length!=0){
                        currentNode = node.outputEdges[0].to;
                    }
                }
                */
                break;
            }
            case "Fork":{
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                let threadcurrent :Thread = ThreadList.peek();

                /***************************** Next step *******************************/
                //not debug mode
                edgeSelected = threadcurrent.currentInstruction[0];
                //debug mode
                // if(debugsession){
                    //0.edgeSelected = await askUserChoice(threadcurrent); //user choose the edge(s) to the next step
                    //1.ParalEvent raise        //mock debug : let user choose the next step; sendRequest()
                // }

                //type of edgeSeleted: Edge[] | Edge  ;  creat a new thread for each children then lanch a new visite function
                if(Array.isArray(edgeSelected)){//all of the children execute at the same time
                    threadcurrent.currentInstruction = [];//set to empty list
                    edgeSelected.forEach(edge => {
                            let threadCurrent = new Thread(edge.to);
                            ThreadList.push(threadCurrent);
                            visitAllNodesInterpret(edge.to, sigma, ThreadList/*, debugsession*/);//visit the sub-tree
                            return;
                    });   
                }else{// user select only one edge
                    let threadCurrent = new Thread(edgeSelected.to);
                    ThreadList.push(threadCurrent);
                    visitAllNodesInterpret(edgeSelected.to, sigma, ThreadList/*, debugsession*/);//visit the sub-tree
                    return;
                }
                return;       
                //break;
            }
            case "AndJoin":{//verify if thread.currentInstruction ? = []
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                let threadChild : Thread  = ThreadList.pop();//pop the children thread from the list
                let threadCurrent : Thread = ThreadList.peek();//parent's thread
                //delete the child from list
                threadCurrent.currentInstruction = threadCurrent.currentInstruction.filter(edge => edge.to.uid !== threadChild.owner.uid);

                //pick up sub-tree value
                if(threadChild.tempValue.size()!=0){//suppose the size == 0
                    console.log(threadChild.tempValue.size());
                    threadCurrent.tempValue.push(threadChild.tempValue.peek());
                }

                if(threadCurrent.currentInstruction.length !== 0){ //still have children not-executed
                    currentNode = threadCurrent.currentInstruction[0].from; //the visit of node go back to the fork node
                }else{//all children executed
                    if(currentNode.functionsDefs.length != 0){
                        nodeCode(currentNode,ThreadList);//execute code defined in the AndJoin node
                    }
                    //go to the next node of Andjoin Node
                    currentNode = currentNode.outputEdges[0].to;
                    threadCurrent.currentInstruction = currentNode.outputEdges;
                }
                break;
            }
            
            case "Choice":{
                // in js: 0 represent false; 1 represent true
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                let nodeTrue : Node | undefined;
                let nodeFalse : Node | undefined;
                //get resRight
                let param: number[] = [ThreadList.peek().tempValue.peek()];
                ThreadList.peek().tempValue.pop();
                //evaluation of each edge of choice
                currentNode.outputEdges.forEach(edge => {
                    let f: Function = creatFunctionForEdge(edge,sigma);
                    let bool: boolean = f(param);
                    if (bool) {
                        nodeTrue = edge.to;
                    } 
                    else {
                        nodeFalse = edge.to;
                    }
                });

                //go to the next node which evoluation of the guard is true 
                if(nodeTrue && nodeFalse){
                    currentNode = nodeTrue;
                }
                
                else{
                    console.log("trueNode | flaseNode doesn't existe at node.uid ="+ currentNode.uid);
                    return;
                }
                break;
            }

            case "OrJoin":{
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                /*let promiseList = stack.tempPromiseFunction;
                if(node.cycles.length!=0 && promiseList.getLength()!=0){
                    //let cycle = node.cycles;
                    //let next = cycle[0][1];// begin.uid = 39
                    //visitAllNodes(next,sigma,stack);
                    //let end = cycle[cycle.length-1];//end.uid = 18
                    defineAsyncFunction(promiseList);           //call promiseList 
                    stack.tempPromiseFunction.reduce();
                    stack.tempValueList.reduce();

                    stack.tempPromiseFunction.addTempValue(stack.fork[stack.fork.length-1]);
                    stack.tempValueList.addTempValue(stack.fork[stack.fork.length-1]);
                }*/
                currentNode = currentNode.outputEdges[0].to;
                ThreadList.peek().currentInstruction=currentNode.outputEdges;
                break;
            }
        }
    }
    console.log(sigma);
}

/**
 * evaluate the functions that are in the nodes,define function;
 * @param functionName 
 * @param functionParamList 
 * @param functionBody 
 * @param sigma 
 * @returns un Function object
 */
function defineFunction(functionName: string, functionParamList: TypedElement[], functionBody: string[], sigma: Map<any, any>): Function {
    return new Function('sigma', 'list', `return function ${functionName}(list) {
        ${functionParamList.reverse().map((param, index) => `let ${param.name} = list[${index}];\n`).join('')}
        ${functionBody.join('\n')}
        \n}`)(sigma);
}

/**
 * creat function and call function (depends on with/without parametres and the function return type)
 * @param node 
 * @param ThreadList 
 */
function nodeCode(node:Node,ThreadList:Stack<Thread>):void{
    let functionName="function" + node.functionsNames[0];
    let f = allFunctions.get(functionName)  as Function;
    let thread: Thread = ThreadList.peek();

        if(node.params.length < 1){         //call function without params
            if(node.returnType == "void" ){
                console.log(f());
            }else{//store value in stack
                thread.tempValue.push(f());
            }
        }
        else{                               //call function with params                    // TODO:parametres list
            let param :number[] = [];
            let n : number = node.inputEdges.length;
            for(let i = 0 ; i < n ; i++){//get parametres list
                if(thread.tempValue.size()>0){
                    param.push(thread.tempValue.pop());
                }
            }
            if(node.returnType == "void"){
                console.log(f(param));
            }
            else{//store returned value
                thread.tempValue.push(f(param));
            }
        }
}

/**
 * creat function depends on the label on the guard
 * @param edge 
 * @param sigma 
 * @returns Function object
 */
function creatFunctionForEdge(edge:Edge, sigma:Map<any,any>) : Function{
    let guard : string[] = edge.guards[0].toString().split(",");//["verifyEqual","VarRef2_4_2_6terminate","true"]
    let paramElement = new TypedElement();
    paramElement.name = "resRight";
    paramElement.type = "Number" ;
    let params : TypedElement[] = [paramElement];
    let functionBody : string[] =[];
    var code : string ="return resRight " ;
    if(guard[0]=="verifyEqual"){
        code += "== "
    }
    code += guard[2];
    code += ";"
    functionBody.push(code);    
    return defineFunction("verifyEdges0",params,functionBody,sigma);
}

/*************************** choose next step node ********************************/
//function to ask question and get user input
/*
function askQuestion(rl:ReadLine, query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

//display choise and create a Map to reference choises 
function displayChoices(choices: Edge[]) : Map<string , Edge|Edge[]>  {
    console.log('Please choose the id of one of the following nodes:');
    let choiceMap : Map<string , Edge|Edge[]> = new Map<string , Edge|Edge[]>();
    var i = 1;
    choices.forEach(choice => {
        console.log(`Choice ${i} : ${choice.to.uid}\n`);
        choiceMap.set(i.toString(),choice);
        i++;
    });

    if(i>2){
        console.log(`Choice ${i} : all of these nodes\n`); //all of them at the same time
        choiceMap.set(i.toString(),choices);
    }else{
        console.log("all of the nodes are executed");
    }
    return choiceMap;
}

//check if the choise made by user is in the list of choise
async function validateInput(thread: Thread,rl:ReadLine): Promise<Edge | Edge[]> {
    let choiceMap = displayChoices(thread.currentInstruction);

    while (true) {
        var input = await askQuestion(rl, 'Enter the number of your choice: ');
        if (choiceMap.get(input)) {
            break;
        }else {
            console.log('Invalid choice, please try again.');
        }
    }

    var selectedChoice = choiceMap.get(input);
    if(selectedChoice){
        return selectedChoice;
    }else{
        throw Error("This edge is not in the list of the choise");
    }
}


async function askUserChoice(thread:Thread):Promise<Edge|Edge[]> {
    const readline = require('node:readline');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    var validInput = await validateInput(thread,rl);
    if(Array.isArray(validInput)){
        console.log(`Next step: all`);
    }else{
        console.log(`Next step: ${validInput.to.uid}`);
    }
    
    rl.close();

    return validInput;
}
*/