import * as vscode from 'vscode';
import { ThreadDecoratorManager } from './decorators';
import { CCFGGraphPanel } from './graphPanel';
import { CCFGCapabilities, CCFG_CUSTOM_EVENT, CCFG_CUSTOM_REQUEST } from './ccfgCustomRequests';

export function activate(context: vscode.ExtensionContext) {

    const decorator = new ThreadDecoratorManager();
    let graphPanel: CCFGGraphPanel | undefined;

    async function refreshCapabilities(session: vscode.DebugSession): Promise<CCFGCapabilities | undefined> {
        if (session.type !== 'ccfg') return undefined;
        try {
            const capabilities = await session.customRequest(CCFG_CUSTOM_REQUEST.ccfgCapabilities) as CCFGCapabilities;
            await setCapabilityContexts(capabilities);
            graphPanel?.updateCapabilities(capabilities);
            return capabilities;
        } catch {
            return undefined;
        }
    }

    context.subscriptions.push(
        vscode.debug.onDidReceiveDebugSessionCustomEvent(async e => {
            if (e.session.type !== 'ccfg') return;

            if (e.event === CCFG_CUSTOM_EVENT.threadPositions) {
                decorator.update(e.body.threads);
            }

            if (e.event === CCFG_CUSTOM_EVENT.ccfgGraph) {
                if (graphPanel === undefined) {
                    graphPanel = new CCFGGraphPanel(context, e.session);
                }
                const capabilities = await refreshCapabilities(e.session) ?? e.body.capabilities;
                graphPanel.update({ ...e.body, capabilities });
            }

            if (e.event === CCFG_CUSTOM_EVENT.ccfgCapabilities) {
                const capabilities = await refreshCapabilities(e.session) ?? e.body.capabilities;
                if (capabilities !== undefined) {
                    await setCapabilityContexts(capabilities);
                    graphPanel?.updateCapabilities(capabilities);
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.debug.onDidTerminateDebugSession(session => {
            if (session.type !== 'ccfg') return;
            decorator.clear();
            graphPanel?.dispose();
            graphPanel = undefined;
            void setCapabilityContexts();
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
            void refreshCapabilities(session);
            graphPanel.reveal();
        })
    );
}

export function deactivate() {}

async function setCapabilityContexts(capabilities?: Partial<CCFGCapabilities>): Promise<void> {
    await vscode.commands.executeCommand('setContext', 'ccfg.capabilities.threads', Boolean(capabilities?.threads));
    await vscode.commands.executeCommand('setContext', 'ccfg.capabilities.events', Boolean(capabilities?.events));
    await vscode.commands.executeCommand('setContext', 'ccfg.capabilities.time', Boolean(capabilities?.time));
    await vscode.commands.executeCommand('setContext', 'ccfg.capabilities.mutableVariables', Boolean(capabilities?.mutableVariables));
    await vscode.commands.executeCommand('setContext', 'ccfg.capabilities.stateMachines', Boolean(capabilities?.stateMachines));
}
