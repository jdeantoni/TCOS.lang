import * as vscode from 'vscode';

interface GraphData {
    dot:         string;
    activeNodes: Array<{ nodeUid: number; threadId: number; color: string }>;
    threads:     Array<{ id: number; color: string; T: number }>;
}

export class CCFGGraphPanel {
    private panel: vscode.WebviewPanel;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly session:  vscode.DebugSession
    ) {
        this.panel = vscode.window.createWebviewPanel(
            'ccfgGraph',
            'CCFG Graph',
            vscode.ViewColumn.Beside,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        this.panel.webview.html = this.getHtml();

        this.panel.webview.onDidReceiveMessage(msg => {
            this.handleWebviewMessage(msg);
        });
    }

    update(data: GraphData): void {
        this.panel.webview.postMessage({ command: 'update', data });
    }

    reveal(): void {
        this.panel.reveal(vscode.ViewColumn.Beside);
    }

    dispose(): void {
        this.panel.dispose();
    }

    private async handleWebviewMessage(msg: any): Promise<void> {
        switch (msg.command) {
            case 'continue':
                await this.session.customRequest('continue', { threadId: 1 });
                break;
            case 'step':
                await this.session.customRequest('next', { threadId: 1 });
                break;
            case 'ccfgStep':
                await this.session.customRequest('ccfgStep', {});
                break;
            case 'ccfgAdvanceTime':
                await this.session.customRequest('ccfgAdvanceTime', {});
                break;
            case 'ccfgStepThread':
                await this.session.customRequest('ccfgStepThread', { threadId: msg.threadId });
                break;
        }
    }

    private getHtml(): string {
        return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script src="https://cdnjs.cloudflare.com/ajax/libs/viz.js/2.1.2/viz.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/viz.js/2.1.2/full.render.js"></script>
<style>
    * { box-sizing: border-box; }
    body {
        margin: 0;
        background: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        font-family: var(--vscode-font-family);
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
    }
    #toolbar {
        padding: 6px 8px;
        background: var(--vscode-editorGroupHeader-tabsBackground);
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        align-items: center;
        border-bottom: 1px solid var(--vscode-panel-border);
        flex-shrink: 0;
    }
    button {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
        border: none;
        padding: 4px 10px;
        cursor: pointer;
        border-radius: 2px;
        font-size: 12px;
    }
    button:hover { opacity: 0.8; }
    #thread-buttons { display: flex; gap: 4px; }
    #zoom-controls {
        display: flex;
        gap: 2px;
        align-items: center;
        margin-left: 4px;
        border-left: 1px solid var(--vscode-panel-border);
        padding-left: 8px;
    }
    #zoom-level {
        font-size: 11px;
        opacity: 0.7;
        min-width: 40px;
        text-align: center;
    }
    #time-display {
        margin-left: auto;
        font-size: 12px;
        opacity: 0.7;
    }
    #graph {
        flex: 1;
        overflow: hidden;
        position: relative;
        cursor: grab;
        user-select: none;
    }
    #graph:active { cursor: grabbing; }
    #graph-inner {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
    }
    #graph svg {
        display: block;
    }
    #placeholder {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.5;
        text-align: center;
    }
</style>
</head>
<body>
<div id="toolbar">
    <button onclick="send('continue')"> Continue</button>
    <button onclick="send('step')"> Step</button>
    <button onclick="send('ccfgStep')"> Step Source</button>
    <button onclick="send('ccfgAdvanceTime')"> Advance T</button>
    <div id="thread-buttons"></div>
    <div id="zoom-controls">
        <button onclick="zoomIn()">+</button>
        <span id="zoom-level">100%</span>
        <button onclick="zoomOut()">−</button>
        <button onclick="resetZoom()" title="Reset zoom">⟳</button>
        <button onclick="fitGraph()" title="Fit to window">[]</button>
    </div>
    <span id="time-display">T = 0</span>
</div>
<div id="graph">
    <div id="graph-inner"></div>
    <p id="placeholder">Waiting for debug session...</p>
</div>

<script>
    const vscode = acquireVsCodeApi();
    const viz    = new Viz();


    let scale  = 1.0;
    let offsetX = 20;
    let offsetY = 20;
    let isPanning = false;
    let panStart  = { x: 0, y: 0 };

    const graphEl = document.getElementById('graph');
    const inner   = document.getElementById('graph-inner');

    function applyTransform() {
        inner.style.transform = \`translate(\${offsetX}px, \${offsetY}px) scale(\${scale})\`;
        document.getElementById('zoom-level').textContent = Math.round(scale * 100) + '%';
    }

    function zoomAt(deltaScale, cx, cy) {
        const newScale = Math.min(5, Math.max(0.1, scale * deltaScale));
        offsetX = cx - (cx - offsetX) * (newScale / scale);
        offsetY = cy - (cy - offsetY) * (newScale / scale);
        scale   = newScale;
        applyTransform();
    }

    function zoomIn()    { zoomAt(1.2, graphEl.clientWidth / 2, graphEl.clientHeight / 2); }
    function zoomOut()   { zoomAt(1 / 1.2, graphEl.clientWidth / 2, graphEl.clientHeight / 2); }
    function resetZoom() { scale = 1; offsetX = 20; offsetY = 20; applyTransform(); }

    function fitGraph() {
        const svg = inner.querySelector('svg');
        if (!svg) return;
        const svgW = svg.viewBox.baseVal.width  || svg.clientWidth;
        const svgH = svg.viewBox.baseVal.height || svg.clientHeight;
        if (!svgW || !svgH) return;
        const containerW = graphEl.clientWidth  - 32;
        const containerH = graphEl.clientHeight - 32;
        const newScale   = Math.min(containerW / svgW, containerH / svgH, 1);
        scale   = newScale;
        offsetX = (containerW - svgW * scale) / 2 + 16;
        offsetY = 16;
        applyTransform();
    }

  
    graphEl.addEventListener('wheel', e => {
        e.preventDefault();
        const rect  = graphEl.getBoundingClientRect();
        const cx    = e.clientX - rect.left;
        const cy    = e.clientY - rect.top;
        const delta = e.deltaY > 0 ? 1 / 1.15 : 1.15;
        zoomAt(delta, cx, cy);
    }, { passive: false });


    graphEl.addEventListener('mousedown', e => {
        if (e.target.tagName === 'BUTTON') return;
        isPanning = true;
        panStart  = { x: e.clientX - offsetX, y: e.clientY - offsetY };
        graphEl.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
        if (!isPanning) return;
        offsetX = e.clientX - panStart.x;
        offsetY = e.clientY - panStart.y;
        applyTransform();
    });
    window.addEventListener('mouseup', () => {
        isPanning = false;
        graphEl.style.cursor = 'grab';
    });


    function send(command, extra = {}) {
        vscode.postMessage({ command, ...extra });
    }

    function renderThreadButtons(threads) {
        document.getElementById('thread-buttons').innerHTML =
            threads.map(t =>
                \`<button
                    style="border-left: 3px solid \${t.color}"
                    onclick="send('ccfgStepThread', { threadId: \${t.id} })">
                     T\${t.id}
                </button>\`
            ).join('');
    }

    function colorDot(dot, activeNodes) {
        let result = dot;
        for (const n of activeNodes) {
            result = result.replace(
                \`"\${n.nodeUid}" [\`,
                \`"\${n.nodeUid}" [fillcolor="\${n.color}" style="filled" \`
            );
        }
        return result;
    }

    let firstRender = true;

    function renderGraph(data) {
        const colored = colorDot(data.dot, data.activeNodes);
        viz.renderSVGElement(colored)
            .then(svg => {
                document.getElementById('placeholder').style.display = 'none';
                inner.innerHTML = '';
                inner.appendChild(svg);
                applyTransform();
                if (firstRender) {
                    firstRender = false;
                    setTimeout(fitGraph, 50);
                }
            })
            .catch(err => console.error('viz.js error:', err));

        renderThreadButtons(data.threads);
        const T = data.threads[0]?.T ?? 0;
        document.getElementById('time-display').textContent = \`T = \${T}\`;
    }

    window.addEventListener('message', e => {
        const msg = e.data;
        if (msg.command === 'update') {
            renderGraph(msg.data);
        }
    });

    applyTransform();
</script>
</body>
</html>`;
    }
}