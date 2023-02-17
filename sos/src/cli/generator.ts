import fs from 'fs';
import { CompositeGeneratorNode, Grammar, NL, toString } from 'langium';
import path from 'path';
import { Expression, MemberCall, NamedElement, RuleCall, SoSSpec, VariableDeclaration, isAssignment, isExpression, isMemberCall, isNamedElement, isRWRule } from '../language-server/generated/ast'; //VariableDeclaration
import { extractDestinationAndName } from './cli-util';







export function generateStuffFromSoS(model: SoSSpec, grammar: Grammar[], filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.txt`;
    const fileNode = new CompositeGeneratorNode();


    for(var openedRule of model.rtdAndRules){
        fileNode.append(`${openedRule.onRule.ref?.name} is opened with:`, NL);
            for(var rtd of openedRule.runtimeState){
                fileNode.append(`\t* var ${rtd.name} of type ${(rtd as VariableDeclaration).type?.primitive}`, NL);
            }
            for(var rwr of openedRule.rules){
                if (isRWRule(rwr)){
                    for(var prem of rwr.premise){
                        if(prem.left !== undefined){
                            fileNode.append(`\t\t - prem: ${print(prem.left)}`,NL)    
                        }
                    }
                    fileNode.append(`\t* RWR: ${rwr.premise} leading to ${rwr.conclusion}`, NL);
                }else{
                    fileNode.append(`\t* Query:${rwr}`, NL);
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

function print(elem: Expression | undefined) : string;
function print(elem: MemberCall): string;
function print(elem: NamedElement | undefined): string;


function print(elem:any): string {
  
    if(isMemberCall(elem)){
        console.log(elem.element?.ref)
        var s : string =""
        if (elem.element !== undefined) {
            s= elem.element.$refText+":"+print(elem.element.ref)
        }
        return print(elem.previous)+"."+s
    }
    if(isExpression(elem)){
        return "this is a expression"
    }
    if(isNamedElement(elem)){
        return (elem.name)?elem.name:"noName"
    }
    if(isAssignment(elem)){
        var temp = (elem.terminal as RuleCall).rule.ref
        if( temp !== undefined){
            return temp.name
        }
    }
    return 'this';
}


