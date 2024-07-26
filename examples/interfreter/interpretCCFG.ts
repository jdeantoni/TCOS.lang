import fs from 'fs';
import {  CompositeGeneratorNode, /*MultiMap,*/ toString } from 'langium';
import path from 'path';
import { Model } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { CCFGVisitor } from './generated/testFSE';
import { CCFG, Edge, Node, TypedElement } from '../ccfg/ccfglib';
import {IGenerator} from './GeneratorInterface';
//import chalk from 'chalk';
import { TempValueList } from './TempValueList';

class Stack {
    fork: number[];                             //number of the fork children
    resRight : number[];                        //value outside of a fork
    forkName : number[];                        //node uid
    tempValueList : TempValueList<number>;      //value inside of a fork
    tempPromiseFunction :  TempValueList<(()=>Promise<void>)>;
    tempCycle : TempValueList<number>;          //node.uid
    

    constructor() {
        this.fork = [];
        this.forkName = [];
        this.resRight = [];
        this.tempValueList = new TempValueList<number>();
        this.tempPromiseFunction = new TempValueList<(()=>Promise<void>)>;
        this.tempCycle = new TempValueList<number>;
    }
}

export function generatefromCCFG(model: Model, filePath: string, targetDirectory: string | undefined, doDebug: boolean|undefined, generator:IGenerator): string {
    const data = extractDestinationAndName(filePath, targetDirectory);
    

    const generatedDotFilePath = `${path.join(data.destination, data.name)}.dot`;
    const dotFile = new CompositeGeneratorNode();

    
    let ccfg = doGenerateCCFG(dotFile, model);

    
    const sigma: Map<string, any> = new Map<string, any>();
    const stack= new Stack();
    
    //doGenerateCode(codeFile, ccfg, debug, generator,sigma,stack);
    
    if(ccfg.initialState){
        let currentNode = ccfg.initialState;
        visitAllNodes(ccfg, currentNode, sigma, stack);
    }

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedDotFilePath, toString(dotFile));

    return generatedDotFilePath;
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


function visitAllNodes(ccfg: CCFG, currentNode: Node,sigma: Map<string,any>, stack: Stack) {

    if(ccfg.initialState){
        var currentNode : Node = ccfg.initialState;
    }
    
    while(currentNode.outputEdges && ((currentNode.outputEdges[0] && currentNode.outputEdges[0].to) || (currentNode.outputEdges[1] && currentNode.outputEdges[1].to))){
        switch(currentNode.getType()){
            case "Step":{
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                if((currentNode.uid == stack.forkName[stack.forkName.length - 1 ] -1 )){//end fork node
                    if(stack.fork[stack.fork.length-1]==0){//have visited all children of the current fork
                        stack.forkName.pop();                //get out of the current fork
                        stack.fork.pop();                  //get out of the current fork
                    }
                    else{
                        return;
                    }
                }
                if(currentNode.functionsDefs.length > 0){
                    nodeCode(currentNode,sigma,stack);
                }
                currentNode = currentNode.outputEdges[0].to;
                break;
            }
            case "Fork":{//define forks' children
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                let children = currentNode.outputEdges;
                stack.tempValueList.addTempValue(children.length);         //reserve places in stack : value
                stack.tempPromiseFunction.addTempValue(children.length);   //reserve places in stack : Promise
                stack.fork.push(children.length);                          //get in the fork
                stack.forkName.push(currentNode.uid);                               //start node's uid
                //console.log("the length of the current fork:"+ forkList[forkList.length-1]); //nombre of the children which are not executed of the current fork
                //forkNode(currentNode,sigma,stack);  // visit children nodes
                currentNode.outputEdges.forEach(element => {
                    let nextNode = element.to; 
                    visitAllNodes(ccfg,nextNode,sigma,stack);
                });
                
                return;
            }
            case "AndJoin":{//reduce (fork children) & call function difined which are store in the stack
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                let forkList : number[] = stack.fork;
                forkList[forkList.length-1] --;
                if(forkList[forkList.length-1]==0 ){//have visited all children of the current fork
                    //stack.fork.pop();                           //get out of the current fork
                    let promiseList = stack.tempPromiseFunction;
                    defineAsyncFunction(promiseList);           //call promiseList 
                    if(currentNode.functionsDefs.length!=0){
                        nodeCode(currentNode,sigma,stack);
                    }
                    stack.tempPromiseFunction.reduce();
                    stack.tempValueList.reduce();
                }
                currentNode = currentNode.outputEdges[0].to; 
                break;
            }
            case "Choice":{
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                let nodeTrue : Node | undefined;
                let nodeFalse : Node | undefined;
                //get resRight
                let resRight: number = stack.resRight[stack.resRight.length-1];
                //evaluation of each edge of choice
                currentNode.outputEdges.forEach(edge => {
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
                    console.log("trueNode | flaseNode doesn't existe at node.uid ="+ currentNode.uid);
                    return;
                }
                break;
            }
            case "OrJoin":{
                console.log(currentNode.uid + ": (" + currentNode.getType() + ")->");
                if(currentNode.cycles.length!=0){
                    
                    //let cycle = node.cycles;
                    //let begin = cycle[0];// begin.uid = 39
                    //let end = cycle[cycle.length-1];//end.uid = 18

                }
                currentNode = currentNode.outputEdges[0].to;
                break;
            }
        }
    }//while
}

//evaluate the functions that are in the nodes
//define function; the defined function takes sigma and a list of number as parametre.
function defineFunction(functionName: string, functionParamList: TypedElement[], functionBody: string[], sigma: Map<any, any>): (...args: any[]) => any {
    return new Function('sigma', 'liste', `return function ${functionName}(liste) {
        ${functionParamList.reverse().map((param, index) => `let ${param.name} = liste[${index}];\n`).join('')}
        ${functionBody.join('\n')}
        \n}`)(sigma);
}

//define a async function for Fork (return type is not void): add value in stack
function definePromise(stack : Stack , f: (param:number[]) => any , parm : number[] ): () => Promise<void>{
    return () => new Promise<void>((resolve) => {
        console.log("Promise created, it return " + f(parm));
        stack.tempValueList.addValueLast(f(parm));
        resolve();
    });
}

//define a async function for Fork (return type is void): evaluation function
function definePromiseVoid( f: (param:number[]) => void , parm : number[]): () => Promise<void>{
    console.log("param valeur: " + parm);
    let param = [...parm];
    return () => new Promise<void>((resolve) => {
        console.log("Promise created ");
        console.log("param valeur in promise: " + param);
        f(param);
        resolve();
    });
}

//lancer/call Promise obj(s) which are stored in a tempValueList
async function defineAsyncFunction(functionList: TempValueList<(()=>Promise<void>)>) {
    let promiseList = functionList.last().list;
    console.log( promiseList.length + " Promise objects raised");
    await Promise.all(promiseList.map(promiseFn => promiseFn()));
    //return Promise.all(promiseList.map(promiseFn => promiseFn()));
}

//code: define function; decide where we store the value & how to call the functions : depends on (if node in a fork/ node is a joinNode)  
function nodeCode(node:Node,sigma:Map<string,any>,stack:Stack):void{
    let functionName="function" + node.functionsNames[0];
    let f = defineFunction(functionName,node.params,node.functionsDefs,sigma);
            if(node.returnType!= "void"){//store the Temp Value 
                let tempValueL = stack.tempPromiseFunction;
                if((stack.fork.length ==0) ){//when we are not in a fork   // && (stack.fork[stack.fork.length-1]==0)
                    console.log(functionName + " return " + f());
                    stack.resRight.push(f());
                }
                else if((tempValueL.getLength()!=0) && (!tempValueL.isWaiting())){//when we are in a fork, all the children are executed
                    joinNode(node,sigma,stack);
                }
                
                else{//when we are in the children of a fork
                    let promise = definePromise(stack,f,[]);
                    tempValueL.addValueLast(promise);
                }
            }
            else{//return type is void
                let tempValueL = stack.tempPromiseFunction;
                if((stack.fork.length ==0) || (stack.fork[stack.fork.length-1]==0)){//when we are not in a fork
                    let parm = stack.resRight;//get value list from stack
                    console.log(f(parm));
                    stack.resRight.pop();//clean stack
                }
                else if((tempValueL.getLength()!=0) && (!tempValueL.isWaiting())){//when we are in a fork, all the children are executed; node 31/46
                    joinNode(node,sigma,stack);
                }
                else{//when we are in the children of a fork
                    let parm = stack.resRight;//get value list from stack
                    let promise = definePromiseVoid(f,parm);
                    tempValueL.addValueLast(promise);
                    stack.resRight.pop();//clean stack
                }

            }
}

//If the Andjoin node in a fork or not!**********************************************************************
function joinNode(node:Node,sigma:Map<string,any>,stack:Stack):void{
    if(node.functionsDefs.length!=0){
        let functionName="function" + node.functionsNames[0];
        let f = defineFunction(functionName,node.params,node.functionsDefs,sigma);
        let l = stack.tempValueList.last().list;
        console.log(functionName + " return " + f(l))
        stack.resRight.push(f(l))
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