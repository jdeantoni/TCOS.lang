import { CompositeGeneratorNode } from "langium/generate";
import { BinaryExpression, MemberCall, RuleOpening, ValuedEventEmission, ValuedEventRef, ValuedEventRefConstantComparison, VariableDeclaration } from "../../language-server/generated/ast.js";
import { inferType } from "../../language-server/type-system/infer.js";
import { RuleControlFlow } from "./class/RuleControlFlow.js";
import { TypedElement } from "./class/TypeElement.js";
import { getCPPVariableTypeName } from "./helpers/getterMethodes.js";

/**
 * 
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState
 * @returns
 */
export function visitValuedEventRefComparison(valuedEventRefComparison: ValuedEventRefConstantComparison | undefined): string {
    let res : string = ""
    
    if (valuedEventRefComparison != undefined) {
        const v = valuedEventRefComparison.literal

        //guardactions
        if(valuedEventRefComparison.$type == "ImplicitValuedEventRefConstantComparison"){
            res = res + `new VerifyEqualInstruction(\`\${this.getASTNodeUID(node.${(valuedEventRefComparison.membercall as MemberCall).element?.$refText})}${"terminate"}\`,\`${(typeof(v) == "string")?v:v.$cstNode?.text}\`)`
        }
        if(valuedEventRefComparison.$type == "ExplicitValuedEventRefConstantComparison"){
            const prev = (valuedEventRefComparison.membercall as MemberCall)?.previous
            res = res + `new VerifyEqualInstruction(\`\${this.getASTNodeUID(node.${prev != undefined?(prev as MemberCall).element?.ref?.name:"TOFIX"})}${(valuedEventRefComparison.membercall as MemberCall).element?.$refText}\`,\`${(typeof(v) == "string")?v:v.$cstNode?.text}\`)`
        }
        
    }
    return res
}

/**
 * writes out the code for 
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState
 * @returns
 */
export function visitValuedEventRef(valuedEventRef: ValuedEventRef | undefined): [string, TypedElement] {
    let res : string = ""
    if (valuedEventRef != undefined) {
        const v = valuedEventRef.tempVar
        const varType = inferType(v, new Map())
        const typeName = getCPPVariableTypeName(varType.$type)
        if(v != undefined && valuedEventRef.$type == "ImplicitValuedEventRef"){
            res = res + `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${v.$cstNode?.offset}\`,\`${typeName}\`)`
            res = res + `new SetVarInstruction(\`\${this.getASTNodeUID(node)}${v.$cstNode?.offset}\`,\`${v.name}\`,\`${typeName}\`)`
            const param:TypedElement = new TypedElement(v,v.name, typeName)
            return [res, param]
        }
        if(v != undefined && valuedEventRef.$type == "ExplicitValuedEventRef"){
            res = res + `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${v.$cstNode?.offset}\`,\`${typeName}\`)`
            res = res + `new SetVarInstruction(\`\${this.getASTNodeUID(node)}${v.$cstNode?.offset}\`,\`${v.name}\`,\`${typeName}\`)`
            const param:TypedElement = new TypedElement(v,v.name, typeName)
            return [res, param]
        }
    
    }
    return ["", new TypedElement(undefined,"NULL", undefined)]
}

/**
 * creates the visitor code for a new variable declarations
 * @param  runtimeState the variable declarations
 * @param file the file to be written into 
 * @returns 
 */
export function visitVariableDeclaration(runtimeState: VariableDeclaration[] | undefined, file : CompositeGeneratorNode): void {
    if (runtimeState != undefined) {
        for(const vardDecl of runtimeState){
            if(vardDecl.type != undefined){
                let ruleName : string = ""
                if (vardDecl.$container.$type == "RuleOpening") {
                    ruleName = (vardDecl.$container as RuleOpening).onRule?.$refText ?? ""
                }
                file.append(`
                let ${vardDecl.name+ruleName}Node: Node = new Step(node,NodeType.starts,[])\n
                localCCFG.addNode(${vardDecl.name+ruleName}Node)
                // let terminates${vardDecl.name+ruleName}Node: Node = new Step(node,NodeType.terminates,[])\n
                // localCCFG.addNode(terminates${vardDecl.name+ruleName}Node)
                // localCCFG.addEdge(starts${vardDecl.name+ruleName}Node,terminates${vardDecl.name+ruleName}Node)
                `)
            }
        }
    }
    return
}

/**
 * for now in c++ like form but should be an interface to the target language
 * @param runtimeState 
 * @returns 
 */
export function visitValuedEventEmission(valuedEmission: ValuedEventEmission | undefined, file:CompositeGeneratorNode): [string, string] {
    let res : string = ""
    if (valuedEmission != undefined) {
        const varType = inferType(valuedEmission.data, new Map())
        const typeName = getCPPVariableTypeName(varType.$type)

        if(valuedEmission.data != undefined && valuedEmission.data.$type == "MemberCall"){
            
            //todo write a node that saves the variable
            res = createVariableFromMemberCall(valuedEmission.data as MemberCall, typeName)
        }
        if(valuedEmission.data != undefined && valuedEmission.data.$type == "BinaryExpression"){
            //todo write a node that joins the two variable nodes and saves the result
            const lhs = (valuedEmission.data as BinaryExpression).left
            const lhsType = inferType(lhs, new Map())
            const lhsTypeName = getCPPVariableTypeName(lhsType.$type)
            let leftRes: string = ""; // Declare the variable rightRes
            leftRes = createVariableFromMemberCall(lhs as MemberCall, lhsTypeName);
            res = res + leftRes+","
            const rhs = (valuedEmission.data as BinaryExpression).right
            const rhsType = inferType(rhs, new Map())
            const rhsTypeName = getCPPVariableTypeName(rhsType.$type)
            let rightRes: string = ""; // Declare the variable rightRes
            rightRes  = createVariableFromMemberCall(rhs as MemberCall, rhsTypeName);
            res = res + rightRes+","
            const applyOp = (valuedEmission.data as BinaryExpression).operator
            res = res + `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset}\`,\`${typeName}\`),`
            res = res + `new OperationInstruction(\`\${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset}\`,\`\${this.getASTNodeUID(node)}${lhs.$cstNode?.offset}\`,\`${applyOp}\`,\`\${this.getASTNodeUID(node)}${rhs.$cstNode?.offset}\`,\`${typeName}\`)`
        }
        if(valuedEmission.data != undefined && valuedEmission.data.$type == "BooleanExpression" || valuedEmission.data.$type == "NumberExpression" || valuedEmission.data.$type == "StringExpression"){
            // write a node that sends the value specified 
            res = res  +`new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`,\`${typeName}\`)`+ ","
            res = res  +`new AssignVarInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`,\`${valuedEmission.data.$cstNode?.text}\`,\`${typeName}\`)`+ ","
            res = res  +`new ReturnInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`)`+ ","
            return [res, typeName]
        }
        if(res.length > 0){
            res = res + ","
        }
        res = res  +`new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`,\`${typeName}\`)`+ ","
        res = res+ `new AssignVarInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`,\`\${this.getASTNodeUID(node)}${valuedEmission.data.$cstNode?.offset}\`,\`${typeName}\`),`
        res = res  +`new ReturnInstruction(\`\${this.getASTNodeUID(node)}${(valuedEmission.event as MemberCall).element?.ref?.name}\`)`+ ","

        return [res, typeName]
    }
    return [res , "void"]
}

/**
 * for now in c++ like form but should be an interface to the target language
 * @param ruleCF 
 * @param actionsstring 
 * @returns 
 */
export function visitStateModifications(ruleCF: RuleControlFlow, actionsstring: string) {
    let sep = ""
    if(actionsstring.length > 0){
        sep = ","
    }
    for (const action of ruleCF.rule.conclusion.statemodifications) {
        let typeName = ""; 
        const rhsType = inferType(action.rhs, new Map());
        typeName = getCPPVariableTypeName(rhsType.$type);
        if (typeName == "unknown") {
            const lhsType = inferType(action.lhs, new Map())
            typeName = getCPPVariableTypeName(lhsType.$type);
        }
        const lhsPrev = ((action.lhs as MemberCall).previous as MemberCall)?.element
        const lhsElem = (action.lhs as MemberCall).element?.ref
        if (lhsElem == undefined) {
            return actionsstring
        }

        if (action.rhs.$type == "MemberCall") {
            const rhsElem = (action.rhs as MemberCall).element?.ref
            if (rhsElem == undefined) {
                return actionsstring
            }

            actionsstring = actionsstring + sep + createVariableFromMemberCall(action.rhs as MemberCall, typeName)
            sep = ","
            
            if(rhsElem.$type == "TemporaryVariable"){
                actionsstring = actionsstring + sep + `new SetGlobalVarInstruction(\`\${this.getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}\`,\`\${this.getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset}\`,\`${typeName}\`)`
            }else{
                actionsstring = actionsstring + sep + `new SetGlobalVarInstruction(\`\${this.getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}\`,\`\${this.getASTNodeUID(node)}${(action.rhs as MemberCall).$cstNode?.offset}\`,\`${typeName}\`)`
            }
        } else if (action.rhs.$type == "BooleanExpression" || action.rhs.$type == "NumberExpression" || action.rhs.$type == "StringExpression") {
            actionsstring = actionsstring + sep + `new SetGlobalVarInstruction(\`\${this.getASTNodeUID(node${lhsPrev != undefined ? "."+lhsPrev.$refText : ""})}${lhsElem.name}\`,\`${action.rhs.$cstNode?.text}\`,\`${typeName}\`)`
        }
    }
    return actionsstring;
}

export function createVariableFromMemberCall(data: MemberCall, typeName: string): string {
    let res: string = ""
    const prev = (data.previous as MemberCall)?.element
    const elem = data.element?.ref
    
    if (elem == undefined) {
        return res
    }

    if (elem?.$type == "VariableDeclaration") {
        res = res+ `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`${typeName}\`),`
        res = res+ `new SetVarFromGlobalInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`\${this.getASTNodeUID(node${prev != undefined ? "."+prev.$refText : ""})}${elem.name}\`,\`${typeName}\`)`
    } 
    else if (elem?.$type == "TemporaryVariable") {
        res = res+ `new CreateVarInstruction(this.getASTNodeUID(node)+\`${data.$cstNode?.offset}\`,\`${typeName}\`),`
        res = res+ `new AssignVarInstruction(this.getASTNodeUID(node)+\`${data.$cstNode?.offset}\`,\`${elem.name}\`,\`${typeName}\`)` 
    }
    else {
                res = res+ `new CreateVarInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`${typeName}\`),`
        res = res+ `new AssignVarInstruction(\`\${this.getASTNodeUID(node)}${data.$cstNode?.offset}\`,\`\${node.${data.$cstNode?.text}}\`,\`${typeName}\`)`
    }
    return res
}