import fs from 'fs';
import {  CompositeGeneratorNode, toString } from 'langium';
import path from 'path';
import { Model } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { CCFGVisitor } from './generated/testFSE';
import { CCFG, Edge, Node } from '../ccfg/ccfglib';
import { IGenerator } from './GeneratorInterface';
import { TempList } from './TempValueList';
import { TypedElement } from "../ccfg/ccfglib";
/*import { get } from 'http';*/



const createVar = "createVar"   //createVar,type,name
const assignVar = "assignVar"   //assignVar,name,value
const setVarFromGlobal = "setVarFromGlobal" //setVarFromGlobal,type,varName,globalVarName
const createGlobalVar = "createGlobalVar" //createGlobalVar,type,varName
const setGlobalVar = "setGlobalVar" //setGlobalVar,type,varName,value
const operation = "operation" //operation,varName,n1,op,n2
const ret ="return" //return,varName
// const verifyEqual = "verifyEqual" //verifyEqual,varName1,varName2
let debug = false;

export function generatefromCCFG(model: Model, filePath: string, targetDirectory: string | undefined, doDebug: boolean|undefined, generator:IGenerator): string {
    const data = extractDestinationAndName(filePath, targetDirectory);
    

    const generatedDotFilePath = `${path.join(data.destination, data.name)}.dot`;
    const dotFile = new CompositeGeneratorNode();

    
    let ccfg = doGenerateCCFG(dotFile, model);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedDotFilePath, toString(dotFile))

    interpretfromCCFG(ccfg,generator);
;
    return generatedDotFilePath;
}


let allFunctions : Map<string,Function> = new Map()
async function interpretfromCCFG(ccfg:CCFG, generator:IGenerator):Promise<void>{
    const sigma: Map<string, any> = new Map<string, any>();
    allFunctions  = compileFunctionDefs(ccfg,generator,sigma,undefined);

    const stack= new Stack();
    if(ccfg.initialState){
        await visitAllNodesInterpret(ccfg.initialState,sigma,stack);
    } 
}


function doGenerateCCFG(codeFile: CompositeGeneratorNode, model: Model): CCFG {
    var visitor = new CCFGVisitor();
    visitor.visit(model);

    var ccfg = visitor.ccfg
   
    ccfg.addSyncEdge()

    ccfg.detectCycles();
    ccfg.collectCycles()

    codeFile.append(ccfg.toDot());
    return ccfg;
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
                            } else{
                                console.log("Unknown function definition: "+b[0]);
                                allFDefs = [...allFDefs, fdef];
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







/****************************************************************************** INTERPRETER ******************************************************/
class Stack {
    fork: number[];                             //number of the fork children
    forkNode : Node[];                          //ForkNode : when finish visiting sub-branch, go back to forkNode 
    tempValue : Array<TempList<number>>;      //temporary value
    tempChildren : Array<TempList<Node>>;         //children node of a ForkNode 
    tempFunction : Array<TempList<Function>>;     //callback functions list
    

    constructor() {
        this.fork = [];
        this.forkNode = [];
        this.tempValue = new Array();
        this.tempChildren = new Array();
        this.tempFunction = new Array();
    }

    addTempValue() : void {
        let newTempList = new TempList<number>();
        this.tempValue.push(newTempList);
    }

    addTempChildren() : void {
        let newTempList = new TempList<Node>();
        this.tempChildren.push(newTempList);
    }

    addTempFunction() : void {
        let newTempList = new TempList<Function>();
        this.tempFunction.push(newTempList);
    }
}

// browse the ccfg sart with a given node
async function visitAllNodesInterpret(initialState : Node , sigma: Map<string, any>, stack: Stack){
    var currentNode : Node = initialState;
    while(currentNode.outputEdges && ((currentNode.outputEdges[0] && currentNode.outputEdges[0].to) || (currentNode.outputEdges[1] && currentNode.outputEdges[1].to))){
        let node = currentNode;
        switch(node.getType()){
            case "Step":{
                console.log(node.uid + ": (" + node.getType() + ")->");
                if(node.functionsDefs.length > 0){
                    nodeCode(node,sigma,stack);//define function written in node; call function & store function value
                }
                currentNode = node.outputEdges[0].to;

                if((stack.forkNode.length!=0) && (node.uid == stack.forkNode[stack.forkNode.length-1].uid -1)){ //the last node of the subtree of the current ForkNode
                    stack.tempChildren[stack.tempChildren.length-1].getList().pop();
                    if(stack.tempChildren[stack.tempChildren.length-1].getList().length > 0){//check if we have visited all children of the current fork
                        //if no, go back to the current ForkNode
                        currentNode = stack.forkNode[stack.forkNode.length-1];
                    }else{//if yes, get out of the current fork
                        stack.forkNode.pop();                       
                        stack.fork.pop();
                        stack.tempChildren.pop();
                    }
                }
                /*
                else{
                    if(node.cycles.length!=0){
                        currentNode = node.outputEdges[0].to;
                    }
                }
                */
                break;
            }
            case "Fork":{//define forks' children
                console.log(node.uid + ": (" + node.getType() + ")->");
                //console.log("the length of the current fork:"+ forkList[forkList.length-1]); //nombre of the children which are not executed of the current fork
                if( stack.forkNode[stack.forkNode.length-1] == undefined || stack.forkNode[stack.forkNode.length-1].uid != node.uid ){ //the 1st time to visit this fork node
                    let children = currentNode.outputEdges;
                    stack.fork.push(children.length);                             //get in the fork
                    stack.forkNode.push(node);                                      //start node's uid

                    stack.addTempValue();                    //reserve places in stack : value
                    stack.addTempChildren();                 //reserve places in stack : Children list
                    
                    children.forEach(element => {            //copy chidren list
                        let nextNode : Node = element.to; 
                        let tempList : TempList<Node> = stack.tempChildren[stack.tempChildren.length-1];
                        tempList.addValue(nextNode);
                    });
                }

                //visit children (sub-tree)
                if(stack.tempChildren[stack.tempChildren.length-1].getList().length != 0){
                    stack.addTempFunction()                  //reserve places in stack for each sub-tree
                    currentNode = stack.tempChildren[stack.tempChildren.length-1].last();
                }else{
                    return;
                }
                break;
            }
            case "AndJoin":{//reduce (fork children) & call function difined which are store in the stack
                console.log(node.uid + ": (" + node.getType() + ")->");
                await handleJoinNode(stack,node,sigma).then(function(){
                    currentNode = node.outputEdges[0].to;
                });
                break;
            }
            
            case "Choice":{
                console.log(node.uid + ": (" + node.getType() + ")->");
                let nodeTrue : Node | undefined;
                let nodeFalse : Node | undefined;
                //get resRight
                let resRight: number[] = [...stack.tempValue[stack.tempValue.length-1].getList()];
                stack.tempValue.pop();
                //evaluation of each edge of choice
                node.outputEdges.forEach(edge => {
                    let bool: boolean = evaluateEdgeLable(edge,resRight);
                    if (bool) {
                        nodeTrue = edge.to;
                    } 
                    else {
                        nodeFalse = edge.to;
                    }
                });
                //decide what is the next node accroding to the value of resRight
                if(nodeTrue && nodeFalse){
                    if (resRight[0]){//if resRight
                        currentNode = nodeTrue;//next node is the false node
                    }
                    else {
                        currentNode = nodeFalse;//next node is the true node
                    }
                }
                else{
                    console.log("trueNode | flaseNode doesn't existe at node.uid ="+ node.uid);
                    return;
                }
                break;
            }

            case "OrJoin":{
                console.log(node.uid + ": (" + node.getType() + ")->");
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
                currentNode = node.outputEdges[0].to;
                break;
            }
        }

    }
    console.log(sigma);
    console.log(stack);
}

//evaluate the functions that are in the nodes
//define function; the defined function takes sigma and a list of number as parametre.
function defineFunction(functionName: string, functionParamList: TypedElement[], functionBody: string[], sigma: Map<any, any>): Function {
    return new Function('sigma', 'list', `return function ${functionName}(list) {
        ${functionParamList.reverse().map((param, index) => `let ${param.name} = list[${index}];\n`).join('')}
        ${functionBody.join('\n')}
        \n}`)(sigma);
}

function nodeCode(node:Node,sigma:Map<string,any>,stack:Stack):void{
    let functionName="function" + node.functionsNames[0];
    let f = allFunctions.get(functionName)  as Function;
    let tempF = stack.tempFunction;

    /*************************************************************** in a fork, call function directly ***************************************/
    if((stack.fork.length != 0) ){//we are in a fork
        tempF[tempF.length-1].addValue(f);
    }else{
        /************************************************************ not in a fork, call function directly ***************************************/
        if(node.params.length < 1){         //call function without params
            if(node.returnType == "void" ){
                console.log(f());
            }else{//store value in stack
                stack.addTempValue();//add an empty list
                stack.tempValue[stack.tempValue.length-1].addValue(f());
            }
        }
        else{                               //call function with params
            let param = [...stack.tempValue[stack.tempValue.length-1].getList()];
            if(node.returnType == "void"){
                console.log(f(param));
            }
            else{//store returned value
                stack.addTempValue();//add an empty list
                stack.tempValue[stack.tempValue.length-1].addValue(f(param));
            }
            stack.tempValue.pop();
        }
    }
}

function evaluateEdgeLable(edge : Edge, resRight:number[]):boolean{
    //get code from: "(VarRef3_4_3_6terminates == true)"
    let edgeLable: string = edge.guards[0];
    let match = edgeLable.match(/\((.*?)\)/);    //"VarRef3_4_3_6terminates == true"
    let code: string| null = match ? match[1] : null;
    let varName: string | null = null;
    //get variable name "VarRef3_4_3_6terminates"
    if (code) {
        let parts = code.split('==');
        if (parts[0]){
            varName = parts[0].trim();
        }
    }
    if(resRight.length>1){
        throw Error("number of parametre is not correct");
    }
    else{
        var bool : boolean = eval(`
            if(${resRight} > 0){
            ${varName} = 1;\n
            }else{
                ${varName} = 0;\n
            }\n
            ${code};
        `)
    }
    
    return bool;
}


/**************************************Asycn********************************************/

function waitParam(tempFunctionList:Array<TempList<Function>>, stack:Stack) {//call the functions stored in the list;
    return new Promise<void>(function(resolve) {
        console.log("yes0");
        tempFunctionList.forEach(functionList => {
            functionList.getList().forEach(f => {//ele is a Function
                let param : number[]|undefined = stack.tempValue.pop()?.getList()
                if(f(param)!= undefined){
                    stack.addTempValue();
                    stack.tempValue[stack.tempValue.length-1].addValue(f(param));
                    //console.log("yes1 : function return "+ f(param));
                    console.log(`yes1 : ${f.name} return ${f(param)}`);
                }else{
                    console.log(f(param));
                    console.log(`yes2 : ${f.name} return type void`);
                }
            });
        });
        resolve();
    });


}

/*function wait(fList:Array<Function>, tempfunctionValue:TempValueList<number>){
    return new Promise<void>(function(resolve) {
        let paramList:number[]=tempfunctionValue.getlastList();

        fList.map(f => {
            if(node.params.length < 1){         //call function without params
                if(node.returnType == "void" ){
                    console.log(f());
                }else{
                    stack.tempValueList.reserveTempList(1);
                    stack.tempValueList.addValueAtLastTempList(f());
                }
            }
            else{                               //call function with params
                let param = [...stack.tempValueList.getlastList()];
                if(node.returnType == "void"){
                    console.log(f(param));
                }
                else{//store returned value
                    stack.tempValueList.reserveTempList(1);
                    stack.tempValueList.addValueAtLastTempList(f(param));
                }
                stack.tempValueList.reduce();
            }

        });
        resolve();
    });
    
}
*/





//with function list
async function handleJoinNode(stack:Stack,node:Node,sigma:Map<string,any>) {
    let forkList: number[] = stack.fork;
    forkList[forkList.length - 1]--;
    
    if(forkList[forkList.length-1]==0 ){//have visited all children of the current fork
        //numbre of the list of functions should be as the same as the number of the inputedges of the JoindNode 
        let numInput : number = node.inputEdges.length;
        let functionList : Array<TempList<Function>> = [];//copy of list

        //extract the function list of the current sub-tree only.
        for(let i=0 ;i<numInput;i++){
            //let l: TempList<Function>|undefined = stack.tempFunction?.pop();
            let l: TempList<Function> = stack.tempFunction[stack.tempFunction.length-1];
            if(l!=undefined){
                functionList.push(l);
                stack.tempFunction.pop();
            }else{
                throw Error("Number of function list is not enough");
            }
        }

        await waitParam(functionList, stack).then(function(){//call children s fonctions; resultat stroed in stack
            console.log("yes3");
            //code in AndJoin Node
            if (node.functionsDefs.length != 0){
                let functionName="function" + node.functionsNames[0];
                //let functionName=node.functionsNames;
                let f = allFunctions.get(functionName) as Function;
                let paramList = [...stack.tempValue[stack.tempValue.length-1].getList()];
                stack.tempValue.pop();
                if(f(paramList) != undefined){
                    stack.addTempValue();
                    stack.tempValue[stack.addTempValue.length-1].addValue(f(paramList));
                }else{
                    console.log(f(paramList));
                }
            }else{
                stack.tempValue.pop();
            }
        });
    } 
}

/*
function getMirror(list: number[][]): number[][] {
    let listMirror: number[][] = [];
    while (list.length > 0) {
        let ele = list.pop();
        if (ele) {
            listMirror.push(ele);
        }
    }
    return listMirror;
}*/