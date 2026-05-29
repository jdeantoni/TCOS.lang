import { TypedElement } from "ccfg";
export let allFunctions = new Map();
export function setAllFunctions(fns) {
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
export function defineFunction(functionName, functionParamList, functionBody, sigma) {
    return new Function("sigma", "list", `return function ${functionName}(list) {
        ${functionParamList.reverse().map((param, index) => `let ${param.name} = list[${index}];\n`).join("")}
        ${functionBody.join("\n")}
        \n}`)(sigma);
}
/**
 * creat function and call function (depends on with/without parametres and the function return type)
 * @param node
 * @param ThreadList
 */
export function nodeCode(node, ThreadList) {
    const functionName = "function" + node.functionsNames[0];
    const f = allFunctions.get(functionName);
    if (!f)
        return;
    const thread = ThreadList.peek();
    if (node.params.length < 1) { //call function without params
        if (node.returnType == "void") {
            console.log(f());
        }
        else { //store value in stack
            thread.tempValue.push(f());
        }
    }
    else { //call function with params                   
        // TODO:parametres list
        const param = [];
        const n = node.inputEdges.length;
        for (let i = 0; i < n; i++) { //get parametres list
            if (thread.tempValue.size() > 0) {
                param.push(thread.tempValue.pop());
            }
        }
        if (node.returnType == "void") {
            console.log(f(param));
        }
        else { //store returned value
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
export function creatFunctionForEdge(edge, sigma) {
    const guard = edge.guards[0].toString().split(","); //["verifyEqual","VarRef2_4_2_6terminate","true"]
    const paramElement = new TypedElement();
    paramElement.name = "resRight";
    paramElement.type = "Number";
    const params = [paramElement];
    const functionBody = [];
    let code = "return resRight ";
    if (guard[0] == "verifyEqual") {
        code += "== ";
    }
    code += guard[2];
    code += ";";
    functionBody.push(code);
    return defineFunction("verifyEdges0", params, functionBody, sigma);
}
