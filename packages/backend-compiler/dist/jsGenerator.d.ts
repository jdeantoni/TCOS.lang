import { IGenerator } from "./GeneratorInterface";
import { TypedElement } from "ccfg";
export declare class JsGenerator implements IGenerator {
    debug: boolean;
    setDebug(debug?: boolean): void;
    nameFile(filename: string): string;
    createBase(): string[];
    endFile(): string[];
    createFunction(fname: string, params: TypedElement[], returnType: string, insideFunction: string[]): string[];
    createMainFunction(insideMain: string[]): string[];
    createFuncCall(fname: string, params: string[], typeName: string): string[];
    createIf(guards: string[], insideOfIf: string[]): string[];
    createAndOpenThread(uid: number, insideThreadCode: string[]): string[];
    createQueue(queueUID: number): string[];
    createLockingQueue(typeName: string, queueUID: number): string[];
    receiveFromQueue(queueUID: number, typeName: string, varName: string): string[];
    sendToQueue(queueUID: number, typeName: string, varName: string): string[];
    createSynchronizer(synchUID: number): string[];
    activateSynchronizer(synchUID: number): string[];
    waitForSynchronizer(synchUID: number): string[];
    createLoop(uid: number, insideLoop: string[]): string[];
    setLoopFlag(uid: number): string[];
    createEqualsVerif(firstValue: string, secondValue: string): string;
    assignVar(varName: string, value: string): string[];
    returnVar(varName: string): string[];
    createVar(type: string, varName: string): string[];
    createGlobalVar(type: string, varName: string): string[];
    setVarFromGlobal(type: string, varName: string, value: string): string[];
    setGlobalVar(type: string, varName: string, value: string): string[];
    operation(varName: string, n1: string, op: string, n2: string): string[];
    createSleep(duration: string): string[];
}