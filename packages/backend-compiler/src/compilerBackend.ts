
import chalk from "chalk";
import { visitAllNodes } from "./visitors.js";
import { CompositeGeneratorNode } from "langium/generate";
import { TraversalContext } from "./TraversalContext.js";
import { CCFG } from "ccfg";
import { compileFunctionDefs } from "./generationFunctionDefs.js";
import { IGenerator } from "./generator/GeneratorInterface.js";

export function generatefromCCFG(ccfg: CCFG, codeFile:CompositeGeneratorNode, generator:IGenerator, filePath:string,debug:boolean): void {
    const ctx = new TraversalContext();
    console.log("Generating code from ");
    doGenerateCode(codeFile, ccfg, debug, generator, ctx);
}

function doGenerateCode(codeFile: CompositeGeneratorNode, ccfg: CCFG, debug: boolean, generator: IGenerator, ctx: TraversalContext) {
    const initNode = ccfg.initialState;
    if (initNode == undefined) {
        console.log(chalk.red("No initial state found in the CCFG, aborting"));
        return;
    }

    generator.setDebug(debug);
    let allCode: string[] = generator.createBase();
    allCode = [...allCode , ...compileFunctionDefs(ccfg, generator, debug)];

    
    const currentNode = initNode;
    const insideMain:string[] = [...visitAllNodes(ccfg, currentNode, generator, ctx, true)];
    allCode = [...allCode, ...generator.createMainFunction(insideMain)];
    allCode = [...allCode, ...generator.endFile()];
    codeFile.append(allCode.join(""));
}