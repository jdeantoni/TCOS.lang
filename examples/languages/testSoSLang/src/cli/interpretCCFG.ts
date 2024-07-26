import fs from 'fs';
import {  CompositeGeneratorNode, toString } from 'langium';
import path from 'path';
import { Model } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { CCFGVisitor } from './generated/testFSE';
import { CCFG,/* Edge,*/ Node } from '../ccfg/ccfglib';
import {IGenerator} from './GeneratorInterface';
import {  TempValueList/*,TempValue,StackTempList*/ } from './TempValueList';
import { TypedElement } from "../ccfg/ccfglib";



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
                        functionsDefs.set(fname,defineFunction(fname,node.params, allFDefs,sigma))
                }
            }
        // }
    }
    return functionsDefs;
}







/******************************************************************************INTERPRETER******************************************************/
class Stack {
    fork: number[];                             //number of the fork children
    forkNode : Node[];                        //node uid
    tempValueList : TempValueList<number>;      //value inside of a fork
    tempChildren : TempValueList<Node>;          //node.uid
    tempFunction : TempValueList<Function>;
    

    constructor() {
        this.fork = [];
        this.forkNode = [];
        this.tempValueList = new TempValueList<number>();
        this.tempChildren = new TempValueList<Node>();
        this.tempFunction = new TempValueList<Function>();
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
                if((stack.forkNode.length!=0) && (node.uid == stack.forkNode[stack.forkNode.length-1].uid -1)){ //the end point of a fork
                    stack.tempChildren.last().list.pop();
                    if(stack.tempChildren.last().list.length > 0){//check if we have visited all children of the current fork
                        //if no, go back to fork node
                        currentNode = stack.forkNode[stack.forkNode.length-1];
                    }else{//check if we have visited all children of the current fork
                        stack.forkNode.pop();                       //if yes, get out of the current fork
                        stack.fork.pop();
                        stack.tempChildren.reduce();
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
                let forklist = stack.forkNode;
                if( forklist[forklist.length-1] == undefined || stack.forkNode[forklist.length-1].uid != node.uid ){ //the 1st time to visit this fork node
                    let children = currentNode.outputEdges;
                    stack.tempValueList.addTempValue(children.length);         //reserve places in stack : value
                    stack.tempFunction.addTempValue(children.length);          //reserve places in stack : Function
                    stack.tempChildren.addTempValue(children.length);          //reserve places in stack : Function
                    stack.fork.push(children.length);                          //get in the fork
                    stack.forkNode.push(node);                                 //start node's uid  

                    children.forEach(element => {                               //copy chidren list
                        let nextNode = element.to; 
                        stack.tempChildren.addValueLast(nextNode);
                    });
                }

                //visit children (sub-tree)
                if(stack.tempChildren.last().list.length != 0){
                    currentNode = stack.tempChildren.last().list[stack.tempChildren.last().list.length-1];
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
            
            /*
            case "Choice":{
                console.log(node.uid + ": (" + node.getType() + ")->");
                let nodeTrue : Node | undefined;
                let nodeFalse : Node | undefined;
                //get resRight
                let resRight: number = stack.resRight[stack.resRight.length-1];
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
                    if (stack.resRight[stack.resRight.length-1]){//if resRight
                        currentNode = nodeTrue;//next node is the false node
                    }
                    else {
                        currentNode = nodeFalse;//next node is the true node
                    }
                    stack.resRight.pop();
                }
                else{
                    console.log("trueNode | flaseNode doesn't existe at node.uid ="+ node.uid);
                    return;
                }
                break;
            }

            case "OrJoin":{
                console.log(node.uid + ": (" + node.getType() + ")->");
                let promiseList = stack.tempPromiseFunction;
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
                }
                currentNode = node.outputEdges[0].to;
                break;
            }*/
        }

    }
    console.log(sigma);
    console.log(stack);
}

//evaluate the functions that are in the nodes
//define function; the defined function takes sigma and a list of number as parametre.
function defineFunction(functionName: string, functionParamList: TypedElement[], functionBody: string[], sigma: Map<any, any>): Function {
    return new Function('sigma', 'liste', `return function ${functionName}(liste) {
        ${functionParamList.reverse().map((param, index) => `let ${param.name} = liste[${index}];\n`).join('')}
        ${functionBody.join('\n')}
        \n}`)(sigma);
}

function nodeCode(node:Node,sigma:Map<string,any>,stack:Stack):void{
    let functionName="function" + node.functionsNames[0];
    let f = allFunctions.get(functionName)  as Function;
    let tempValueL = stack.tempFunction;

    if((stack.fork.length != 0) ){
        tempValueL.addValueLast(f);
        if(node.params.length == 0){
            stack.tempValueList.addTempValue(1);//add an empty list
        }
    }else{
        //not in a fork, call function 
        if(node.params.length < 1){         //call function without params
            if(node.returnType == "void" ){
                console.log(f());
            }
        }
        else{                               //call function with params
            if(node.returnType == "void"){
                let param = stack.tempValueList.last().list;
                console.log(f(param));
                stack.tempValueList.reduce();
            }else{//store returned value
                stack.tempValueList.addTempValue(1);
                let param = stack.tempValueList.last();
                stack.tempValueList.addValueLast(f(param));
                stack.tempValueList.reduce();
            }
        }
    }
}

//If the Andjoin node in a fork or not!**********************************************************************
/*
function joinNode(node:Node,sigma:Map<string,any>,stack:Stack):void{
    if(node.functionsDefs.length!=0){
        let functionName="function" + node.functionsNames[0];
        let f = defineFunction(functionName,node.params,node.functionsDefs,sigma);
        let l = stack.tempValueList.last().list;
        console.log(functionName + " return " + f(l))
        stack.tempValueList.addValueLast(f(l))
    }
}

function evaluateEdgeLable(edge : Edge, resRight:number):boolean{
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
    let bool : boolean = eval(`
        if(${resRight} > 0){
        ${varName} = 1;\n
        }else{
            ${varName} = 0;\n
        }\n
        ${code};
        `)
    return bool;
}
*/

/**************************************Asycn********************************************/

function waitParam(fList:Array<Function>, tempfunctionValue:TempValueList<number>) {
    let paramListPromise:number[][]= [];//copy value destination
        //count nombre of the function, and take the same number of the value list from the end of the tempvaleurList
        let nombreOfFunction : number = fList.length;
        let numberOfValueList : number = tempfunctionValue.getLength();
            
        for(let i = numberOfValueList-nombreOfFunction; i < numberOfValueList ; i++){
            let list : number[] = [...tempfunctionValue.last().list];
            paramListPromise.push(list);
            tempfunctionValue.reduce();
        }
        

    return new Promise<void>(function(resolve) {
        console.log("yes0");
        paramListPromise=getMirror(paramListPromise);
        fList.map((f, index) => {
            if(f(paramListPromise[index]) != undefined){
                tempfunctionValue.addValueLast(f(paramListPromise[index]));
                console.log("yes1 : function return "+ f(paramListPromise[index]));
            }else{
                console.log(f(paramListPromise[index]));
                console.log("yes2 : function type void");
            }   
        }
        );
        resolve();
    });
}


//with function list
async function handleJoinNode(stack:Stack,node:Node,sigma:Map<string,any>) {
    let forkList: number[] = stack.fork;
    forkList[forkList.length - 1]--;
    
    if(forkList[forkList.length-1]==0 ){//have visited all children of the current fork
        await waitParam(stack.tempFunction.last().list, stack.tempValueList).then(function(){//call children s fonctions; resultat stroed in stack
            console.log("yes3");
            stack.tempFunction.reduce();
            //code in AndJoin Node
            if (node.functionsDefs.length != 0){
                let functionName="function" + node.functionsNames[0];
                let f = allFunctions.get(functionName) as Function;
                let paramList = [...stack.tempValueList.last().list];
                stack.tempValueList.reduce();
                if(f(paramList) != undefined){
                    stack.tempValueList.addTempValue(1);
                    stack.tempValueList.addValueLast(f(paramList));
                }else{
                    console.log(f(paramList));
                }
            }else{
                stack.tempValueList.reduce();
            }
        });
    } 
}


function getMirror(list: number[][]): number[][] {
    let listMirror: number[][] = [];
    while (list.length > 0) {
        let ele = list.pop();
        if (ele) {
            listMirror.push(ele);
        }
    }
    return listMirror;
}