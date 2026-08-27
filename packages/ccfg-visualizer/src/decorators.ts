import * as vscode from 'vscode';

const THREAD_COLORS = [
    '#FF5050',
    '#5050FF',
    '#50C850',
    '#FFB400',
    '#B400FF'
];

const THREAD_HIGHLIGHT_ALPHA = 0.25;

interface ThreadPosition {
    id:     number;
    nodeUid?: number;
    file:   string;
    line:   number;
    column?: number;
    color?: string;
}

interface ThreadDecorationSegment {
    thread: ThreadPosition;
    range: vscode.Range;
    isWholeLine: boolean;
}

interface CachedThreadSegment {
    file: string;
    line: number;
    column?: number;
    nodeUid?: number;
    range: vscode.Range;
    isWholeLine: boolean;
}

export class ThreadDecoratorManager {
    private decorationTypes: vscode.TextEditorDecorationType[] = [];
    private readonly segmentCache = new Map<number, CachedThreadSegment>();

    update(threads: ThreadPosition[]): void {
        this.clearDecorations();

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

            for (const segment of buildDecorationSegments(editor.document, fileThreads, this.segmentCache)) {
                const { thread, range, isWholeLine } = segment;
                const borderColor = thread.color ?? THREAD_COLORS[(thread.id - 1) % THREAD_COLORS.length];
                const decorationType = vscode.window.createTextEditorDecorationType({
                    backgroundColor:  toRgba(borderColor, THREAD_HIGHLIGHT_ALPHA),
                    borderColor,
                    borderStyle:      'solid',
                    borderWidth:      '0 0 0 3px',
                    isWholeLine,
                    overviewRulerColor: borderColor,
                    overviewRulerLane: vscode.OverviewRulerLane.Left,
                });

                editor.setDecorations(decorationType, [range]);
                this.decorationTypes.push(decorationType);
                this.segmentCache.set(thread.id, {
                    file: thread.file,
                    line: thread.line,
                    column: thread.column,
                    nodeUid: thread.nodeUid,
                    range,
                    isWholeLine
                });
            }
        }

        const activeThreadIds = new Set(threads.map(thread => thread.id));
        for (const threadId of this.segmentCache.keys()) {
            if (!activeThreadIds.has(threadId)) {
                this.segmentCache.delete(threadId);
            }
        }
    }

    clear(): void {
        this.clearDecorations();
        this.segmentCache.clear();
    }

    private clearDecorations(): void {
        for (const dt of this.decorationTypes) {
            dt.dispose();
        }
        this.decorationTypes = [];
    }
}

function buildDecorationSegments(
    document: vscode.TextDocument,
    threads: ThreadPosition[],
    cache: ReadonlyMap<number, CachedThreadSegment>
): ThreadDecorationSegment[] {
    const byLine = new Map<number, ThreadPosition[]>();
    for (const thread of threads) {
        const lineIndex = thread.line - 1;
        if (lineIndex < 0 || lineIndex >= document.lineCount) {
            continue;
        }
        const lineThreads = byLine.get(lineIndex) ?? [];
        lineThreads.push(thread);
        byLine.set(lineIndex, lineThreads);
    }

    const segments: ThreadDecorationSegment[] = [];
    for (const [lineIndex, lineThreads] of byLine) {
        if (lineThreads.length === 1) {
            const thread = lineThreads[0];
            if (thread === undefined) {
                continue;
            }
            const nextSegment = {
                thread,
                range: new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_SAFE_INTEGER),
                isWholeLine: true
            };
            segments.push(preserveSegmentIfUnchanged(nextSegment, cache));
            continue;
        }

        const lineEnd = document.lineAt(lineIndex).range.end.character;
        const sortedThreads = [...lineThreads].sort((a, b) =>
            toCharacter(a.column) - toCharacter(b.column) || a.id - b.id
        );

        for (let i = 0; i < sortedThreads.length; i++) {
            const thread = sortedThreads[i];
            if (thread === undefined) {
                continue;
            }
            const start = clampCharacter(toCharacter(thread.column), lineEnd);
            const end = nextThreadCharacter(sortedThreads, i, lineEnd);
            const nextSegment = {
                thread,
                range: new vscode.Range(lineIndex, start, lineIndex, Math.max(start, end)),
                isWholeLine: false
            };
            segments.push(preserveSegmentIfUnchanged(nextSegment, cache));
        }
    }
    return segments;
}

function preserveSegmentIfUnchanged(
    segment: ThreadDecorationSegment,
    cache: ReadonlyMap<number, CachedThreadSegment>
): ThreadDecorationSegment {
    const cached = cache.get(segment.thread.id);
    if (cached === undefined || !isSameThreadNode(segment.thread, cached)) {
        return segment;
    }
    return {
        ...segment,
        range: cached.range,
        isWholeLine: cached.isWholeLine
    };
}

function isSameThreadNode(thread: ThreadPosition, cached: CachedThreadSegment): boolean {
    if (thread.file !== cached.file || thread.line !== cached.line) {
        return false;
    }
    if (thread.nodeUid !== undefined || cached.nodeUid !== undefined) {
        return thread.nodeUid === cached.nodeUid;
    }
    return thread.column === cached.column;
}

function nextThreadCharacter(threads: ThreadPosition[], currentIndex: number, lineEnd: number): number {
    const currentStart = toCharacter(threads[currentIndex]?.column);
    for (let i = currentIndex + 1; i < threads.length; i++) {
        const nextStart = toCharacter(threads[i]?.column);
        if (nextStart > currentStart) {
            return clampCharacter(nextStart, lineEnd);
        }
    }
    return lineEnd;
}

function toCharacter(column: number | undefined): number {
    if (column === undefined || !Number.isInteger(column)) {
        return 0;
    }
    return Math.max(0, column - 1);
}

function clampCharacter(character: number, lineEnd: number): number {
    return Math.min(Math.max(0, character), lineEnd);
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
