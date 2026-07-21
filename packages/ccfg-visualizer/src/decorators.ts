import * as vscode from 'vscode';

const THREAD_COLORS = [
    { bg: 'rgba(255,80,80,0.25)',  border: 'rgba(255,80,80,0.8)'  },
    { bg: 'rgba(80,80,255,0.25)',  border: 'rgba(80,80,255,0.8)'  },
    { bg: 'rgba(80,200,80,0.25)',  border: 'rgba(80,200,80,0.8)'  },
    { bg: 'rgba(255,180,0,0.25)',  border: 'rgba(255,180,0,0.8)'  },
    { bg: 'rgba(180,0,255,0.25)',  border: 'rgba(180,0,255,0.8)'  },
];

interface ThreadPosition {
    id:     number;
    file:   string;
    line:   number;
    color?: string;
}

export class ThreadDecoratorManager {
    private decorationTypes: vscode.TextEditorDecorationType[] = [];

    update(threads: ThreadPosition[]): void {
        this.clear();

        // Regroupe les threads par fichier
        const byFile = new Map<string, ThreadPosition[]>();
        for (const t of threads) {
            const list = byFile.get(t.file) ?? [];
            list.push(t);
            byFile.set(t.file, list);
        }

        for (const editor of vscode.window.visibleTextEditors) {
            const filePath = editor.document.uri.fsPath;
            const fileThreads = byFile.get(filePath) ?? [];

            for (const thread of fileThreads) {
                const colors = THREAD_COLORS[thread.id % THREAD_COLORS.length];
                const decorationType = vscode.window.createTextEditorDecorationType({
                    backgroundColor:  colors.bg,
                    borderColor:      colors.border,
                    borderStyle:      'solid',
                    borderWidth:      '0 0 0 3px',
                    isWholeLine:      true,
                    overviewRulerColor: colors.border,
                    overviewRulerLane: vscode.OverviewRulerLane.Left,
                });

                const range = new vscode.Range(
                    thread.line - 1, 0,
                    thread.line - 1, 999
                );

                editor.setDecorations(decorationType, [range]);
                this.decorationTypes.push(decorationType);
            }
        }
    }

    clear(): void {
        for (const dt of this.decorationTypes) {
            dt.dispose();
        }
        this.decorationTypes = [];
    }
}