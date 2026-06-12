import { AstNode} from 'langium';
import { AbstractSemanticTokenProvider, SemanticTokenAcceptor} from 'langium/lsp';

export class SoSSemanticTokenProvider extends AbstractSemanticTokenProvider {
    protected override highlightElement(_node: AstNode, _acceptor: SemanticTokenAcceptor): void | 'prune' | undefined {
        return undefined
    }
}