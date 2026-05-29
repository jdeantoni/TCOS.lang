import { Edge, Node, TypedElement } from "ccfg";
import { GuardFunction, NodeFunction } from "./types.js";
import { Stack } from "./TempList.js";
import { Thread } from "./Thread.js";

export let allFunctions : Map<string, NodeFunction> = new Map();

export function setAllFunctions(fns: Map<string, NodeFunction>): void{
    allFunctions = fns;
}

/**
 * evaluate the functions that are in the nodes,define function;
 * @param functionName 
 * @param functionParamList 
 * @param functionBody 
 * @param sigma 
 * @returns un Function object
 */
export function defineFunction(functionName: string, functionParamList: TypedElement[], functionBody: string[], sigma: Map<string, unknown>): NodeFunction {
    return new Function("sigma", "list", `return function ${functionName}(list) {
        ${functionParamList.reverse().map((param, index) => `let ${param.name} = list[${index}];\n`).join("")}
        ${functionBody.join("\n")}
        \n}`)(sigma) as NodeFunction;
}

/**
 * creat function and call function (depends on with/without parametres and the function return type)
 * @param node 
 * @param ThreadList 
 */
export function nodeCode(node: Node, ThreadList: Stack<Thread>):void{
    const functionName="function" + node.functionsNames[0];
    const f = allFunctions.get(functionName);
    if (!f) return;
    const thread: Thread = ThreadList.peek();

        if(node.params.length < 1){         //call function without params
            if(node.returnType == "void" ){
                console.log(f());
            }else{ //store value in stack
                thread.tempValue.push(f() as number);
            }
        }
        else{                               //call function with params                   
            // TODO:parametres list
            const param :number[] = [];
            const n : number = node.inputEdges.length;
            for(let i = 0 ; i < n ; i++){ //get parametres list
                if(thread.tempValue.size()>0){
                    param.push(thread.tempValue.pop());
                }
            }
            if(node.returnType == "void"){
                console.log(f(param));
            }
            else{ //store returned value
                thread.tempValue.push(f(param) as number);
            }
        }
}

/**
 * creat function depends on the label on the guard
 * @param edge 
 * @param sigma 
 * @returns Function object
 */
export function creatFunctionForEdge(edge: Edge, sigma: Map<string, unknown>) : GuardFunction{
    const guard : string[] = edge.guards[0].toString().split(","); //["verifyEqual","VarRef2_4_2_6terminate","true"]
    const paramElement = new TypedElement();
    paramElement.name = "resRight";
    paramElement.type = "Number" ;
    const params : TypedElement[] = [paramElement];
    const functionBody : string[] =[];
    let code : string ="return resRight ";

    if(guard[0]=="verifyEqual"){
        code += "== ";
    }

    code += guard[2];
    code += ";";
    functionBody.push(code);
       
    return defineFunction("verifyEdges0",params,functionBody,sigma) as unknown as GuardFunction;
}