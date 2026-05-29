import { NodeFunction } from "./types.js";
import { CompositeGeneratorNode } from "langium/generate";
import { IGenerator } from "backend-compiler/GeneratorInterface";
import { AddSleepInstruction, AssignVarInstruction, CCFG, CreateGlobalVarInstruction, CreateVarInstruction, Edge, Node,OperationInstruction,ReturnInstruction,SetGlobalVarInstruction,SetVarFromGlobalInstruction,TypedElement } from "ccfg";
import { defineFunction } from "./functionExecution.js";

export const debug = false; 

export function compileFunctionDefs(ccfg: CCFG,generator:IGenerator,sigma:Map<string,unknown>,_codeFile?:CompositeGeneratorNode): Map<string, NodeFunction> {
    const functionsDefs: Map<string,NodeFunction> = new Map();
    for (const node of ccfg.nodes) {
        if(!debug && node.functionsDefs.length == 0){
            continue;
        }

        if(node.returnType != undefined){
            for (const fname of node.functionsNames) {
                let allFDefs:string[] = [];
                
                for (const fdef of node.functionsDefs) {

                    if  (fdef instanceof ReturnInstruction) {
                        const b = fdef as ReturnInstruction;
                        allFDefs= [...allFDefs, ...generator.returnVar(b.varName)];
                    }else if (fdef instanceof CreateVarInstruction){
                        const b = fdef as CreateVarInstruction;
                        allFDefs = [...allFDefs, ...generator.createVar(b.type, b.varName)];
                    }else if (fdef instanceof AssignVarInstruction){
                        const b = fdef as AssignVarInstruction;
                        allFDefs=[...allFDefs, ...generator.assignVar(b.varName, b.value)];
                    } else if (fdef instanceof SetVarFromGlobalInstruction){
                        const b = fdef as SetVarFromGlobalInstruction;
                        allFDefs =[...allFDefs, ...generator.setVarFromGlobal(b.type, b.varName, b.globalVarName)];
                    } else if (fdef instanceof CreateGlobalVarInstruction){
                        const b = fdef as CreateGlobalVarInstruction;
                        allFDefs=[...allFDefs, ...generator.createGlobalVar(b.type, b.varName)];
                    } else if (fdef instanceof SetGlobalVarInstruction){
                        const b = fdef as SetGlobalVarInstruction;
                        allFDefs=[...allFDefs, ...generator.setGlobalVar(b.type, b.globalVarName, b.value)];
                    } else if (fdef instanceof OperationInstruction){
                        const b = fdef as OperationInstruction;
                        allFDefs=[...allFDefs, ...generator.operation( b.varName, b.n1, b.op, b.n2)];
                    } else if (fdef instanceof AddSleepInstruction){
                        const b = fdef as AddSleepInstruction;
                        allFDefs=[...allFDefs, ...generator.createSleep(b.duration)];
                    } 
                    else{
                        console.log("Unknown function definition: "+ fdef.$instructionType+ " pop"+fdef.toString());
                        allFDefs = [...allFDefs, fdef.toString()];
                    }

                }
                
                const fnamestring:string = "function" + fname;
                functionsDefs.set(fnamestring,defineFunction(fnamestring, node.params, allFDefs, sigma));
            }
        }
    }
    return functionsDefs;
}