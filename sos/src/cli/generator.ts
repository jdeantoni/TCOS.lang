import fs from 'fs';
import { CompositeGeneratorNode, Grammar, NL, toString } from 'langium';
import path from 'path';
import { Expression, SoSSpec, isRWRule, isSchedulingConstraint, isTemporaryVariable } from '../language-server/generated/ast'; //VariableDeclaration
import { extractDestinationAndName } from './cli-util';
import { getType, print } from '../utils/sos-utils';







export function generateStuffFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.txt`;
    const fileNode = new CompositeGeneratorNode();


    for(var openedRule of model.rtdAndRules){
        fileNode.append(`${openedRule.onRule.ref?.name} is opened with:`, NL);
            for(var rtd of openedRule.runtimeState){
                fileNode.append(`\t* var ${rtd.name} of type ${getType(rtd).name}`, NL);
            }
            for(var rwr of openedRule.rules){
                if (isRWRule(rwr)){
                    fileNode.append(`\t* `)
                    for(var prem of rwr.premise){
                        if(prem.left !== undefined){
                            var premRight:string = ""
                            if(prem.right !==undefined){
                                if(isTemporaryVariable(prem.right)){
                                    premRight=print(prem.right)
                                }else{
                                    premRight=print(prem.right as Expression)
                                }
                                
                            }
                            fileNode.append(`${premRight}:= ${print(prem.left)} `)  
                         
                        }
                    }
                    if(rwr.conclusion.ruleStart){
                        fileNode.append(" => call rule "+print(rwr.conclusion.ruleStart))
                    }
                    if(rwr.conclusion.outState.length > 0){
                        fileNode.append("  =>  ")
                    }
                    for(var os of rwr.conclusion.outState){
                        fileNode.append(print(os))
                    }
                    fileNode.append(NL)
                }
                else if (isSchedulingConstraint(rwr)){
                    fileNode.append(`\t* Sched:${print(rwr.left)} ${rwr.operator} ${print(rwr.right)}`, NL);
                }
            }
    }
//=' ${/*(statePart instanceof VariableDeclaration)?(statePart as VariableDeclaration).value:''*/typeof(statePart)}
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}





