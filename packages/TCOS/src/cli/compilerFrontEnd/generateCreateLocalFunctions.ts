import { CompositeGeneratorNode, NL } from "langium/generate";
import { RuleOpening, VariableDeclaration } from "../../language-server/generated/ast.js";
import { CollectionHoleSpecifier, HoleSpecifier } from "./class/HoleSpecifier.js";
import { RuleControlFlow } from "./class/RuleControlFlow.js";
import { areParticipantsEqualsOrCoupled, handleRuleConclusion, isACollectionHole, isATimerHole, isReferenceBased, retrieveStartingRules } from "./generatorCCFGCompiler.js";
import { DEBUG, conceptNameToHoles, conceptNameToRulesCF } from "./config.js";
import { getPreviousNodeNameFromPremiseParticipants, getValuedEventRefConstantComparison, getVariableDeclarationCode } from "./getterMethodes.js";
import { visitVariableDeclaration } from "./visitor.js";


export function generateCreateLocalCCFGFunctions(file: CompositeGeneratorNode, conceptName: string, openedRule: RuleOpening) {
    file.append(`
    /**
     * returns the local CCFG of the ${conceptName} node
     * @param a ${conceptName} node 
     * @returns the local CCFG (with holes)
     */
    create${conceptName}LocalCCFG(node: ${conceptName}): CCFG {`);

    visitVariableDeclaration(openedRule.runtimeState as VariableDeclaration[], file);
    file.append(`
        let localCCFG = new CCFG()
        let starts${conceptName}Node: Node = new Step(node,NodeType.starts,[${getVariableDeclarationCode(openedRule.runtimeState as VariableDeclaration[])}])
        if(starts${conceptName}Node.functionsDefs.length>0){
            starts${conceptName}Node.returnType = "void"
        }
        starts${conceptName}Node.functionsNames = [\`init\${starts${conceptName}Node.uid}${conceptName}\`]
        localCCFG.addNode(starts${conceptName}Node)
        localCCFG.initialState = starts${conceptName}Node
        let terminates${conceptName}Node: Node = new Step(node,NodeType.terminates)
        localCCFG.addNode(terminates${conceptName}Node)
        `);

    const tempHole = conceptNameToHoles.get(conceptName);
    if (tempHole == undefined) {
        throw new Error("holes not found: "+conceptName);
    }
    const holes : HoleSpecifier[] = tempHole;
    const tempRulesCF = conceptNameToRulesCF.get(conceptName);
    if (tempRulesCF == undefined) {
        throw new Error("rulesCF not found: "+conceptName);
    }
    const rulesCF: RuleControlFlow[] = tempRulesCF;

    //creates hole nodes
    for (const h of holes) {
        
        if (isATimerHole(h.startingParticipants)){
            const refNode = "node";
            const duration = ((openedRule.runtimeState as VariableDeclaration[]).filter(rs => rs.name == h.startingParticipants[h.startingParticipants.length-2 >= 0 ? h.startingParticipants.length-2:0].name)[0] as VariableDeclaration).value?.$cstNode?.text;
            file.append(`
        let ${h.startingParticipants.filter(p => p.type != "event").map(p => p.name).join("_")}Hole: Hole = new TimerHole(${refNode},node.${duration}) //timer hole to ease specific filling
        localCCFG.addNode(${h.startingParticipants.filter(p => p.type != "event").map(p => p.name).join("_")}Hole)
        `);
        }else
        if (isACollectionHole(h)){
            const refNode : string = `node.${h.startingParticipants.slice(0,h.startingParticipants.length-2).filter(p => p.type != "event").map(p => p.name).join(".")}`;
            file.append(`
        let ${h.startingParticipants.slice(0,h.startingParticipants.length-2).filter(p => p.type != "event").map(p => p.name).join("_")}Hole: CollectionHole = new CollectionHole(${refNode})
        ${h.startingParticipants.slice(0,h.startingParticipants.length-2).filter(p => p.type != "event").map(p => p.name).join("_")}Hole.isSequential = ${(h as CollectionHoleSpecifier).isSequential}
        ${h.startingParticipants.slice(0,h.startingParticipants.length-2).filter(p => p.type != "event").map(p => p.name).join("_")}Hole.parallelSyncPolicy = "${(h as CollectionHoleSpecifier).parallelSyncPolicy}"
        localCCFG.addNode(${h.startingParticipants.slice(0,h.startingParticipants.length-2).filter(p => p.type != "event").map(p => p.name).join("_")}Hole)
        `);

        }else{
            let refNode : string = `node.${h.startingParticipants.filter(p => p.type != "event").map(p => p.name).join(".")}`;
            if (isReferenceBased(h.startingParticipants)){
                refNode = refNode + ".ref";
            }
            file.append(`
        let ${h.startingParticipants.filter(p => p.type != "event").map(p => p.name).join("_")}Hole: Hole = new Hole(${refNode})
        localCCFG.addNode(${h.startingParticipants.filter(p => p.type != "event").map(p => p.name).join("_")}Hole)
        `);

        }
    }

    const startingRules = retrieveStartingRules(rulesCF);
    if (startingRules.length > 1) {
        throw new Error("multiple starting rules are not supported");
    }

    const startRule: RuleControlFlow = startingRules[0];
    handleRuleConclusion(startRule, holes, file, `starts${conceptName}Node`);


    for (const ruleCF of rulesCF) {
        if (ruleCF != startingRules[0]) {
            let premiseNodeName : string= getPreviousNodeNameFromPremiseParticipants(ruleCF, conceptName);
            //manage premise (most of the time the premise's node is already existing since a hole.)
            
            if (ruleCF.premiseParticipants.length > 1) {
                file.append(`
        let ${premiseNodeName}: Node = new ${premiseNodeName.endsWith("OrJoinNode")?"OrJoin":"AndJoin"}(node)
        localCCFG.addNode(${premiseNodeName})
                `);
                for (const participants of ruleCF.premiseParticipants) {
                    if (holes.map(h => h.startingParticipants).some(p => areParticipantsEqualsOrCoupled(p, participants))) {
                        if (DEBUG) file.append("             //mark a");
                        file.append(`
        localCCFG.addEdge(${participants.filter(p => p.type != "event").map(p => p.name).join("_")}Hole,${premiseNodeName})
                            `);
                    } else {
                        file.append(`
                //premise participants in parallel collection but not a hole: ${participants.map(p => p.toJSON())}
                        `);
                    }
                }
            }


            const allEventValuedComparisons = getValuedEventRefConstantComparison(ruleCF.rule.premise.eventExpression);
            
            if (allEventValuedComparisons.length > 0) {
                    const refNode = `node.${ruleCF.premiseParticipants[0].filter(p => p.type != "event").map(p => p.name).join(".")}`;
                    file.append(`
        let ${ruleCF.rule.name}ChoiceNode = undefined
        if(${premiseNodeName}.outputEdges.filter(e => e.to.getType() == "Choice").length == 1){
            ${ruleCF.rule.name}ChoiceNode = ${premiseNodeName}.outputEdges.filter(e => e.to.getType() == "Choice")[0].to
        }else{
            ${ruleCF.rule.name}ChoiceNode = new Choice(${refNode})
            localCCFG.addNode(${ruleCF.rule.name}ChoiceNode)
        }
        localCCFG.addEdge(${premiseNodeName},${ruleCF.rule.name}ChoiceNode)
                `);
                    premiseNodeName = `${ruleCF.rule.name}ChoiceNode`;
                }

            handleRuleConclusion(ruleCF, holes, file, premiseNodeName);

        }
    }


    file.append(`
        return localCCFG;
    }`, NL);
}