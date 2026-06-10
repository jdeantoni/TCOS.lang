import path from "path";
import fs from "fs";
import { Grammar, SoSSpec } from "../../../language-server/generated/ast.js";
import { extractDestinationAndName, FilePathData } from "../../cli-util.js";
import { CompositeGeneratorNode, NL, toString } from "langium/generate";
import chalk from "chalk";
import { RuleControlFlow } from "../class/RuleControlFlow.js";
import { HoleSpecifier } from "../class/HoleSpecifier.js";
import { generateCreateLocalCCFGFunctions } from "./generateCreateLocalFunctions.js";
import { conceptNameToHoles, conceptNameToRulesCF } from "../config.js";
import { addUtilFunctions } from "../helpers/utilFunctions.js";
import { extractRuleControlFlowsFromRules } from "../controls/ruleControlFlow.js";
import { writePreambule } from "./preambule.js";
import { identifiesHolesAndSemiHoles } from "../analysis/holeIdentification.js";

// this function is used to generate the code for the visitor pattern of the specified compiler
export function generateCompilerFrontEndFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name+"CompilerFrontEnd")}.ts`;
    const file = new CompositeGeneratorNode();
    const conceptNames: string[] = [];

    writePreambule(file, data);

    for (const openedRule of model.rtdAndRules) {
        if (openedRule.onRule?.ref != undefined) {
            conceptNames.push(openedRule.onRule.ref.name);
        }
    }

    appendAsImport(data, file, conceptNames);
    appendCompilerFrontEndInterface(file, conceptNames);
    appendCompilerFrontEndClass(model, file, conceptNames);
    writeGeneratedFile(data, generatedFilePath, file);

    return generatedFilePath;
}

function appendAsImport(data: FilePathData, file: CompositeGeneratorNode, conceptNames: string[]) {
    if (fs.existsSync(data.destination + "/../../language-server/")) {
        file.append(`import { ${conceptNames.join(",")} } from "../../language-server/generated/ast.js";`, NL);
    } else {
        if (fs.existsSync(data.destination + "/../../language/")) {
            file.append(`import { ${conceptNames.join(",")} } from "../../language/generated/ast.js";`, NL);
        } else {
            console.log(chalk.red("seems that data destination does not target a valid language server or language folder. I'm looking for either this " + data.destination + "/../../language-server/ or this " + data.destination + "/../../language/ folders "));
        }
    }
}

function writeGeneratedFile(data: FilePathData, generatedFilePath: string, file: CompositeGeneratorNode) {
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(file));
}

function appendCompilerFrontEndClass(model: SoSSpec, file: CompositeGeneratorNode, conceptNames: string[]) {
    let langName = model.name;
    langName = langName.charAt(0).toUpperCase() + langName.slice(1);

    file.append(`
export class ${langName}CompilerFrontEnd implements CompilerFrontEnd {
    constructor(debugMode: boolean = false){ 
        debug = debugMode
        if (debug){
            console.log("CompilerFrontEnd created")
        }
    }

    globalCCFG: CCFG = new CCFG();

  
    createLocalCCFG(node: AstNode | Reference<AstNode>): CCFG {
        if(isReference(node)){
            if(node.ref === undefined){
                throw new Error("not possible to visit an undefined AstNode")
            }
            node = node.ref
        }`);

    for (const name of conceptNames) {
        file.append(`
        if(node.$type == "${name}"){
            return this.create${name}LocalCCFG(node as ${name});
        }`);
    }

    file.append(`  
        throw new Error("Not implemented: " + node.$type);
    }
    `, NL);

    appendCreateLocalCCFGMethods(model, file);
    addUtilFunctions(file, model.rtdAndRules[0].onRule?.ref?.$container.rules[0]?.name as string);

    file.append(`
}`, NL);
}

function appendCreateLocalCCFGMethods(model: SoSSpec, file: CompositeGeneratorNode) {
    for (const openedRule of model.rtdAndRules) {
        let name: string = "";
        if (openedRule.onRule?.ref != undefined) {
            name = openedRule.onRule.ref.name;
        }

        const rulesCF: RuleControlFlow[] = extractRuleControlFlowsFromRules(file, openedRule);
        conceptNameToRulesCF.set(name, rulesCF);
        const holes: HoleSpecifier[] = identifiesHolesAndSemiHoles(rulesCF);
        conceptNameToHoles.set(name, holes);

        generateCreateLocalCCFGFunctions(file, name, openedRule);
    }
}

function appendCompilerFrontEndInterface(file: CompositeGeneratorNode, conceptNames: string[]) {
    file.append(`
var debug = false

export interface CompilerFrontEnd {

    createLocalCCFG(node: AstNode| Reference<AstNode>): CCFG;
    `, NL);

    for (const name of conceptNames) {
        file.append(`     create${name}LocalCCFG(node: ${name}): CCFG;`, NL);
    }

    file.append(`
    generateCCFG(node: AstNode): CCFG;
    `, NL);

    file.append("}", NL);
}