import { CompositeGeneratorNode, NL } from "langium/generate";
import { FilePathData } from "../cli-util.js";

/**
 * writes the preambule for the visitor file of the compiler 
 * @param fileNode the file 
 * @param data the file path data
 */
export function writePreambule(fileNode: CompositeGeneratorNode, _data: FilePathData) {
    fileNode.append(`
import fs from 'fs';
import { AstNode, Reference, isReference, AstUtils } from "langium";
import { AndJoin, Choice, Fork, CCFG, Node, OrJoin, Step, NodeType, Hole, TypedElement, TimerHole, CollectionHole, AddSleepInstruction, AssignVarInstruction, CreateGlobalVarInstruction, CreateVarInstruction, OperationInstruction, ReturnInstruction, SetGlobalVarInstruction, SetVarFromGlobalInstruction, VerifyEqualInstruction} from "ccfg";`, NL);
}