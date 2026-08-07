import * as vscode from 'vscode';

const THREAD_COLORS = [
    '#FF5050',
    '#5050FF',
    '#50C850',
    '#FFB400',
    '#B400FF'
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
            if (!t.file || !Number.isInteger(t.line) || t.line <= 0) {
                continue;
            }
            const list = byFile.get(t.file) ?? [];
            list.push(t);
            byFile.set(t.file, list);
        }

        for (const editor of vscode.window.visibleTextEditors) {
            const filePath = editor.document.uri.fsPath;
            const fileThreads = byFile.get(filePath) ?? [];

            for (const thread of fileThreads) {
                const borderColor = thread.color ?? THREAD_COLORS[(thread.id - 1) % THREAD_COLORS.length];
                const decorationType = vscode.window.createTextEditorDecorationType({
                    backgroundColor:  toRgba(borderColor, 0.25),
                    borderColor,
                    borderStyle:      'solid',
                    borderWidth:      '0 0 0 3px',
                    isWholeLine:      true,
                    overviewRulerColor: borderColor,
                    overviewRulerLane: vscode.OverviewRulerLane.Left,
                });

                const range = new vscode.Range(
                    thread.line - 1, 0,
                    thread.line - 1, Number.MAX_SAFE_INTEGER
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

function toRgba(color: string, alpha: number): string {
    const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (hex === null) {
        return color;
    }
    const red = parseInt(hex[1], 16);
    const green = parseInt(hex[2], 16);
    const blue = parseInt(hex[3], 16);
    return `rgba(${red},${green},${blue},${alpha})`;
}
