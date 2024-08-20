// import { SemanticTokenTypes } from 'vscode-languageserver';
// import { AstNode } from 'langium';
import { AbstractSemanticTokenProvider,
         AstNode,
         SemanticTokenAcceptor} from 'langium';
// import { isAction, isAssignment, isAtomType, isConclusion, isParameter, isParameterReference, isReturnType, isRuleCall, isTypeAttribute } from './generated/ast';

export class SoSSemanticTokenProvider extends AbstractSemanticTokenProvider {
    protected override highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor): void | 'prune' | undefined {
        return undefined
    }

    // protected highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor): void {
    //     if (isAssignment(node)) {
    //         acceptor({
    //             node,
    //             property: 'feature',
    //             type: SemanticTokenTypes.property
    //         });
    //     } else if (isConclusion(node)) {
    //         if (node.inState) {
    //             acceptor({
    //                 node,
    //                 property: 'feature',
    //                 type: SemanticTokenTypes.property
    //             });
    //         }
    //     } else if (isReturnType(node)) {
    //         acceptor({
    //             node,
    //             property: 'name',
    //             type: SemanticTokenTypes.type
    //         });
    //     } else if (isAtomType(node)) {
    //         if (node.primitiveType || node.refType) {
    //             acceptor({
    //                 node,
    //                 property: node.primitiveType ? 'primitiveType' : 'refType',
    //                 type: SemanticTokenTypes.type
    //             });
    //         }
    //     } else if (isParameter(node)) {
    //         acceptor({
    //             node,
    //             property: 'name',
    //             type: SemanticTokenTypes.parameter
    //         });
    //     } else if (isParameterReference(node)) {
    //         acceptor({
    //             node,
    //             property: 'parameter',
    //             type: SemanticTokenTypes.parameter
    //         });
    //     } else if (isRuleCall(node)) {
    //         if (node.rule.ref?.fragment) {
    //             acceptor({
    //                 node,
    //                 property: 'rule',
    //                 type: SemanticTokenTypes.type
    //             });
    //         }
    //     } else if (isTypeAttribute(node)) {
    //         acceptor({
    //             node,
    //             property: 'name',
    //             type: SemanticTokenTypes.property
    //         });
    //     }
    // }

}