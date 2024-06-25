import { CompositeGeneratorNode } from "langium";

interface IGenerator {
    createLockingQueue(codeFile: CompositeGeneratorNode, queueUID: number, typeName: string): unknown;
    endThread(codeFile: CompositeGeneratorNode, uid: number): unknown;
    createAndOpenThread(codefile: any, uid: number): unknown;
    createFile(filename:string): string;
    createBase(file: CompositeGeneratorNode,debug:boolean): void;
    createFunction(file:CompositeGeneratorNode,fname:string,params:string[],returnType:string): void;
    createMainFunction(file:CompositeGeneratorNode): void;
    createFuncCall(file: CompositeGeneratorNode,fname:string,params:string[],typeName:string): void;
    endFunction(file: CompositeGeneratorNode): void;
    assignVar(file: CompositeGeneratorNode,varName:string,value:string): void;
    returnVar(file: CompositeGeneratorNode,varName:string): void;
    createVar(file: CompositeGeneratorNode,type:string,varName:string): void;
    createGlobalVar(file: CompositeGeneratorNode,type:string,varName:string): void;
    setVarFromGlobal(file: CompositeGeneratorNode,type:string,varName:string,value:string): void;
    setGlobalVar(file: CompositeGeneratorNode,type:string,varName:string,value:string): void;
    operation(file: CompositeGeneratorNode,varName:string,n1:string,op:string,n2:string): void;
    createQueue(file: CompositeGeneratorNode,queueUID:number): void;
    receiveFromQueue(file: CompositeGeneratorNode,queueUID:number,typeName:string): void;
    receiveFromQueue(file: CompositeGeneratorNode,queueUID:number,typeName:string,varName:string): void;
}

export {IGenerator};