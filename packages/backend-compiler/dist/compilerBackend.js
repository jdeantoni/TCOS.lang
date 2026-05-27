import chalk from "chalk";
import { visitAllNodes } from "./visitors.js";
import { TraversalContext } from "./TraversalContext.js";
import { compileFunctionDefs } from "./generationFunctionDefs.js";
export function generatefromCCFG(ccfg, codeFile, generator, filePath, debug) {
    const ctx = new TraversalContext();
    console.log("Generating code from ");
    doGenerateCode(codeFile, ccfg, debug, generator, ctx);
}
function doGenerateCode(codeFile, ccfg, debug, generator, ctx) {
    const initNode = ccfg.initialState;
    if (initNode == undefined) {
        console.log(chalk.red("No initial state found in the CCFG, aborting"));
        return;
    }
    generator.setDebug(debug);
    let allCode = generator.createBase();
    allCode = [...allCode, ...compileFunctionDefs(ccfg, generator, debug)];
    const currentNode = initNode;
    const insideMain = visitAllNodes(ccfg, currentNode, /*-1,*/ generator, ctx, true);
    allCode = [...allCode, ...generator.createMainFunction(insideMain)];
    allCode = [...allCode, ...generator.endFile()];
    codeFile.append(allCode.join(""));
}
