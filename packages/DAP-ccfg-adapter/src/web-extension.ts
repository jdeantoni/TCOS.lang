import * as vscode from 'vscode';
import { activateCCFGDebug } from './activateCCFGDebug';

export function activate(context: vscode.ExtensionContext) {
	activateCCFGDebug(context);	// activateCCFGDebug without 2nd argument launches the Debug Adapter "inlined"
}

export function deactivate() {
	// nothing to do
}