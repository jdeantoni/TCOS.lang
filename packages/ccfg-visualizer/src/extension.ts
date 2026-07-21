import * as vscode from 'vscode';
import { ThreadDecoratorManager } from './decorators';
import { CCFGGraphPanel } from './graphPanel';

export function activate(context: vscode.ExtensionContext) {

    const decorator = new ThreadDecoratorManager();
    let graphPanel: CCFGGraphPanel | undefined;

    context.subscriptions.push(
        vscode.debug.onDidReceiveDebugSessionCustomEvent(e => {
            if (e.session.type !== 'ccfg') return;

            if (e.event === 'threadPositions') {
                decorator.update(e.body.threads);
            }

            if (e.event === 'ccfgGraph') {
                if (graphPanel === undefined) {
                    graphPanel = new CCFGGraphPanel(context, e.session);
                }
                graphPanel.update(e.body);
            }
        })
    );

    context.subscriptions.push(
        vscode.debug.onDidTerminateDebugSession(session => {
            if (session.type !== 'ccfg') return;
            decorator.clear();
            graphPanel?.dispose();
            graphPanel = undefined;
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ccfg-decorator.openGraph', () => {
            const session = vscode.debug.activeDebugSession;
            if (session?.type !== 'ccfg') {
                vscode.window.showWarningMessage('No active CCFG debug session');
                return;
            }
            if (graphPanel === undefined) {
                graphPanel = new CCFGGraphPanel(context, session);
            }
            graphPanel.reveal();
        })
    );
}

export function deactivate() {}