import { CompositeGeneratorNode } from "langium/generate";
import { CCFG } from "ccfg";
import { IGenerator } from "./generator/GeneratorInterface.js";
export declare function generatefromCCFG(ccfg: CCFG, codeFile: CompositeGeneratorNode, generator: IGenerator, filePath: string, debug: boolean): void;
