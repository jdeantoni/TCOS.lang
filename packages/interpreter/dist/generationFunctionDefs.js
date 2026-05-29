import { AddSleepInstruction, AssignVarInstruction, CreateGlobalVarInstruction, CreateVarInstruction, OperationInstruction, ReturnInstruction, SetGlobalVarInstruction, SetVarFromGlobalInstruction } from "ccfg";
import { defineFunction } from "./functionExecution.js";
export const debug = false;
export function compileFunctionDefs(ccfg, generator, sigma, _codeFile) {
    const functionsDefs = new Map();
    for (const node of ccfg.nodes) {
        if (!debug && node.functionsDefs.length == 0) {
            continue;
        }
        if (node.returnType != undefined) {
            for (const fname of node.functionsNames) {
                let allFDefs = [];
                for (const fdef of node.functionsDefs) {
                    if (fdef instanceof ReturnInstruction) {
                        const b = fdef;
                        allFDefs = [...allFDefs, ...generator.returnVar(b.varName)];
                    }
                    else if (fdef instanceof CreateVarInstruction) {
                        const b = fdef;
                        allFDefs = [...allFDefs, ...generator.createVar(b.type, b.varName)];
                    }
                    else if (fdef instanceof AssignVarInstruction) {
                        const b = fdef;
                        allFDefs = [...allFDefs, ...generator.assignVar(b.varName, b.value)];
                    }
                    else if (fdef instanceof SetVarFromGlobalInstruction) {
                        const b = fdef;
                        allFDefs = [...allFDefs, ...generator.setVarFromGlobal(b.type, b.varName, b.globalVarName)];
                    }
                    else if (fdef instanceof CreateGlobalVarInstruction) {
                        const b = fdef;
                        allFDefs = [...allFDefs, ...generator.createGlobalVar(b.type, b.varName)];
                    }
                    else if (fdef instanceof SetGlobalVarInstruction) {
                        const b = fdef;
                        allFDefs = [...allFDefs, ...generator.setGlobalVar(b.type, b.globalVarName, b.value)];
                    }
                    else if (fdef instanceof OperationInstruction) {
                        const b = fdef;
                        allFDefs = [...allFDefs, ...generator.operation(b.varName, b.n1, b.op, b.n2)];
                    }
                    else if (fdef instanceof AddSleepInstruction) {
                        const b = fdef;
                        allFDefs = [...allFDefs, ...generator.createSleep(b.duration)];
                    }
                    else {
                        console.log("Unknown function definition: " + fdef.$instructionType + " pop" + fdef.toString());
                        allFDefs = [...allFDefs, fdef.toString()];
                    }
                }
                const fnamestring = "function" + fname;
                functionsDefs.set(fnamestring, defineFunction(fnamestring, node.params, allFDefs, sigma));
            }
        }
    }
    return functionsDefs;
}
