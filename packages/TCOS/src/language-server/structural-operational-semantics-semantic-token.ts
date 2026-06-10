import { AstNode} from 'langium';
import { AbstractSemanticTokenProvider, SemanticTokenAcceptor} from 'langium/lsp';

export class SoSSemanticTokenProvider extends AbstractSemanticTokenProvider {
    protected override highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor): void | 'prune' | undefined {
        return undefined
    }
}