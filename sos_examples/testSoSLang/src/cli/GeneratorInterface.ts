import { CompositeGeneratorNode } from "langium";
import { TypedElement } from "../ccfg/ccfglib";

interface IGenerator {
    nameFile(filename:string): string;
    createBase(codeFile: CompositeGeneratorNode,debug:boolean): void;
    createFunction(codeFile:CompositeGeneratorNode,fname:string,params:TypedElement[],returnType:string): void;
    createMainFunction(codeFile:CompositeGeneratorNode): void;
    createFuncCall(codeFile: CompositeGeneratorNode,fname:string,params:string[],typeName:string): void;
    createIf(codeFile: CompositeGeneratorNode, guards: string[]): unknown;
    createLockingQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string): unknown;
    createAndOpenThread(codefile: any, uid: number): unknown;
    endThread(codeFile: CompositeGeneratorNode, uid: number): unknown;
    endSection(codeFile: CompositeGeneratorNode): void;
    createQueue(codeFile: CompositeGeneratorNode,queueUID:number): void;
    receiveFromQueue(codeFile: CompositeGeneratorNode,queueUID:number,typeName:string,varName:string): void;
    assignVar(codeFile: CompositeGeneratorNode,varName:string,value:string): void;
    returnVar(codeFile: CompositeGeneratorNode,varName:string): void;
    createVar(codeFile: CompositeGeneratorNode,type:string,varName:string): void;
    createGlobalVar(codeFile: CompositeGeneratorNode,type:string,varName:string): void;
    setVarFromGlobal(codeFile: CompositeGeneratorNode,type:string,varName:string,value:string): void;
    setGlobalVar(codeFile: CompositeGeneratorNode,type:string,varName:string,value:string): void;
    operation(codeFile: CompositeGeneratorNode,varName:string,n1:string,op:string,n2:string): void;
}

export {IGenerator};