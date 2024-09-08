/* This file is use to interpret the CCFG step by step helpping us to understand how a program execute and the language beheviouse.
    It contains the generetion of the ccfg which representes a program written in a domaine specifecate language.

    In the nodes of CCFG, it contains some functions when the program execute. We need to define these functions thought interface
    to define functions in javaScript.

    We have a global variable sigma to store the value of variables defined in the program. And the calss Thread allow us to simulate
    the execution of a thread.
*/
import { CompositeGeneratorNode } from 'langium';
import { CCFG, Edge, Node,TypedElement } from 'ccfg';
import { IGenerator } from 'backend-compiler/GeneratorInterface.js';
//import { compileFunctionDefs } from 'backend-compiler/compilerBackend.js';
import { Stack } from './TempList.js';
// import { MockDebugSession } from './degugger/mockDebug.js';

const createVar = "createVar"   //createVar,type,name
const assignVar = "assignVar"   //assignVar,name,value
const setVarFromGlobal = "setVarFromGlobal" //setVarFromGlobal,type,varName,globalVarName
const createGlobalVar = "createGlobalVar" //createGlobalVar,type,varName
const setGlobalVar = "setGlobalVar" //setGlobalVar,type,varName,value
const operation = "operation" //operation,varName,n1,op,n2
const ret ="return" //return,varName
const verifyEqual = "verifyEqual" //verifyEqual,varName1,varName2
const addSleep = "addSleep" //addSleep,duration
export var debug = false; 



let allFunctions : Map<string,Function> = new Map();

export async function interpretfromCCFG(ccfg:CCFG, generator:IGenerator, isDebug:boolean):Promise<void>{
    const sigma: Map<string, any> = new Map<string, any>();
    var ThreadList : Stack<Thread> = new Stack();

    if(isDebug){
        var debugsession = new MockDebugSession();
    }
    allFunctions  = compileFunctionDefs(ccfg,generator,sigma,undefined);

    if(ccfg.initialState){
        let threadInit = new Thread(ccfg.initialState);
        ThreadList.push(threadInit);
        await visitAllNodesInterpret(ccfg.initialState, sigma, ThreadList,generator, debugsession);//breakpointAdresse should be a debug seesion
        console.log(sigma);
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
                            let b = fdef.split(",");
                            if (b[0] == ret) {
                                allFDefs= [...allFDefs, ...generator.returnVar(b[1])];
                            }else if (b[0]==createVar){
                                allFDefs = [...allFDefs, ...generator.createVar(b[1], b[2])];
                            }else if (b[0]==assignVar){
                                allFDefs=[...allFDefs, ...generator.assignVar(b[1], b[2])];
                            } else if (b[0]==setVarFromGlobal){
                                allFDefs =[...allFDefs, ...generator.setVarFromGlobal(b[1], b[2], b[3])];
                            } else if (b[0]==createGlobalVar){
                                allFDefs=[...allFDefs, ...generator.createGlobalVar(b[1], b[2])];
                            } else if (b[0]==setGlobalVar){
                                allFDefs=[...allFDefs, ...generator.setGlobalVar(b[1], b[2], b[3])];
                            } else if (b[0]==operation){
                                allFDefs=[...allFDefs, ...generator.operation(b[1], b[2], b[3], b[4])];
                            } else if (b[0]==addSleep){
                                allFDefs=[...allFDefs, ...generator.createSleep(b[1])];
                            } 
                            else{
                                console.log("Unknown function definition: "+b[0]);
                                allFDefs = [...allFDefs, fdef];
                            }

                        }
                        //console.log("function name: "+fname+ " allFDefs = "+allFDefs);
                        //generator.createFunction(codeFile,fname, node.params, node.returnType,allFDefs);
                        let fnamestring:string = "function" + fname;
                        functionsDefs.set(fnamestring,defineFunction(fnamestring, node.params, allFDefs, sigma));
                }
            }
        // }
    }
    return functionsDefs;
}









/****************************************************************************** INTERPRETER *******************************************************************************/
export class Thread {
    tempValue : Stack<any>;      //The temparal values retrun by function in node (Modify as a stack)
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
export async function visitAllNodesInterpret(startNode : Node, sigma: Map<string, any>, ThreadList : Stack<Thread>, generator:IGenerator,  debugsession: MockDebugSession|undefined){ 

    var currentNode : Node = startNode;
    var edgeSelected : Edge|Edge[]|undefined;
    while(currentNode.outputEdges && ((currentNode.outputEdges[0] && currentNode.outputEdges[0].to) || (currentNode.outputEdges[1] && currentNode.outputEdges[1].to))){
        /***** Check breakpoint ******/
        if(debugsession){
            if(debugsession.getBreakpoints().includes(currentNode)){
                debugsession.pauseExecution();
                await debugsession.Stepnext();
            }
        }
        switch(currentNode.getType()){
            case "Step":{
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                if(currentNode.functionsDefs.length > 0){
                    nodeCode(currentNode,ThreadList);//retrieve the corresponding function from the node; store retrun value of the function | call function
                }
                let threadcurrent :Thread = ThreadList.peek();
                currentNode = currentNode.outputEdges[0].to;
                threadcurrent.currentInstruction = currentNode.outputEdges;
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
                            visitAllNodesInterpret(edge.to, sigma, ThreadList,generator, debugsession);//visit the sub-tree
                            return;
                    });   
                }else{// user select only one edge
                    let threadCurrent = new Thread(edgeSelected.to);
                    ThreadList.push(threadCurrent);
                    visitAllNodesInterpret(edgeSelected.to, sigma, ThreadList,generator, debugsession);//visit the sub-tree
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
                    //console.log(threadChild.tempValue.size());
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

                //verify the function of this node
                if (currentNode.functionsDefs.length != 0) {
                    nodeCode(currentNode, ThreadList);
                    let boolChoiceNode:boolean = ThreadList.peek().tempValue.pop();
                    if (!boolChoiceNode) { //go to the sibling node
                        let parent: Node = currentNode.inputEdges[0].from;
                        parent.outputEdges.forEach(edge => {
                            if (edge.to.numberOfVisits == 0) {
                                currentNode = edge.to;
                                ThreadList.peek().currentInstruction = currentNode.outputEdges;
                            }
                        });
                        break;
                    }
                }

                //For each edge: Define function for each guard and call it
                let nodeTrue: Node | undefined;
                var boolResult :boolean| undefined =undefined;
                //Choice node has more than 1 output edge, they use the same paramtre stored in the stack
                if(currentNode.outputEdges.length > 1){
                    let param:any[] = [];
                    param = [ThreadList.peek().tempValue.peek()];
                    currentNode.outputEdges.forEach(edge => {
                        if(nodeTrue == undefined){
                            let f:Function = creatFunctionForEdgeGuard(edge.guards[0],sigma,generator);
                            let bool : boolean = f(param);
                            if (bool) {
                                nodeTrue = edge.to;
                            }
                        }
                    });
                }else{//has only 1 output edge, need to store the value in stack
                    let edge:Edge = currentNode.outputEdges[0];
                    let functions:Array<Function> = getMirrorOfList(creatFunctionListForEdge(edge, sigma, generator));
                    boolResult = true;
                        
                    functions.forEach(f => {
                        let param:any[] = [];
                        param = [ThreadList.peek().tempValue.peek()];
                        ThreadList.peek().tempValue.pop();
                        boolResult = boolResult && f(param);
                    });
                    if (boolResult) {
                        nodeTrue = edge.to;
                    }
                }
               //if the choice node's code is valided, we take the path includ this node.
               //go to the next node which evoluation of the guard is true 
                if (nodeTrue) {
                        //A choice node must have a orjoin node in the ccfg
                        let threadCurrent: Thread = new Thread(currentNode);
                        ThreadList.push(threadCurrent);
                        currentNode = nodeTrue;
                        ThreadList.peek().currentInstruction = currentNode.outputEdges;
                }else{
                    let threadCurrent: Thread = new Thread(currentNode);
                    ThreadList.push(threadCurrent);
                    ThreadList.peek().tempValue.push(boolResult as boolean);
                    currentNode = currentNode.outputEdges[0].to;
                    ThreadList.peek().currentInstruction = currentNode.outputEdges;
                }
                break;
            }

            case "OrJoin":{
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                currentNode = currentNode.outputEdges[0].to;
                //ThreadList.peek().currentInstruction=currentNode.outputEdges;
                //ThreadList.pop();//pop the children thread from the list
                let threadChild : Thread  = ThreadList.pop();//pop the children thread from the list
                let threadCurrent : Thread = ThreadList.peek();//parent's thread
                //delete the child from list
                threadCurrent.currentInstruction = currentNode.outputEdges;
                //pick up sub-tree value
                if(threadChild.tempValue.size()!=0){//suppose the size == 0
                    threadCurrent.tempValue.push(threadChild.tempValue.peek());
                }
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
            param = getMirrorOfList(param);
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
 * @param edgeGuard: one element of edge.guards
 * @param sigma 
 * @returns Function object
 */

/*function creatFunctionForEdgeGuard(edgeGuard: String, sigma:Map<any,any>,generator:IGenerator) : Array<Function>{
    let functions:Array<Function> = new Array<Function>;
    //function param
    let paramElement = new TypedElement();
    paramElement.name = "resRight";
    paramElement.type = "Number" ;
    let params : TypedElement[] = [paramElement];
    //function body and function definition
    let guards: string[] = [];
    const guardList= edgeGuard.split(",");
    if (guardList[0] === verifyEqual){
        guards.push(`let ${guardList[1]} = resRight;`);
        guards.push(`return ${generator.createEqualsVerif(guardList[1],guardList[2])}`);
        functions.push(defineFunction("verifyEdges",params,guards,sigma));
    }
    //defineFunction(fnamestring, node.params, allFDefs, sigma)
    return functions;
}*/

function creatFunctionForEdgeGuard(edgeGuard: String, sigma:Map<any,any>,generator:IGenerator) : Function{
    //function param
    let paramElement = new TypedElement();
    paramElement.name = "resRight";
    paramElement.type = "Number" ;
    let params : TypedElement[] = [paramElement];
    //function body and function definition
    let guards: string[] = [];
    const guardList= edgeGuard.split(",");
    if (guardList[0] === verifyEqual){
        guards.push(`let ${guardList[1]} = resRight;`);
        guards.push(`return ${generator.createEqualsVerif(guardList[1],guardList[2])}`);
    }
    return defineFunction("verifyEdges",params,guards,sigma);
}

function creatFunctionListForEdge(edge: Edge, sigma:Map<any,any>,generator:IGenerator):Array<Function>{
    let functions : Array<Function> = [];
    edge.guards.forEach(guard => {
        let f: Function = creatFunctionForEdgeGuard(guard,sigma,generator);
        functions.push(f);
    });
    return functions;
}

function getMirrorOfList(list: any[]): any[] {
    let listMirror: any[] = [];
    while (list.length > 0) {
        let ele = list.pop();
        if (ele != undefined) {
            listMirror.push(ele);
        }
    }
    return listMirror;
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