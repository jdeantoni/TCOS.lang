import { CompositeGeneratorNode } from 'langium';
import { CCFG } from 'ccfg';
import { IGenerator } from './GeneratorInterface';
export declare function generatefromCCFG(ccfg: CCFG, codeFile: CompositeGeneratorNode, generator: IGenerator, filePath: string, debug: boolean): void;
