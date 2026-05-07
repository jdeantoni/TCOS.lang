/**
 * Mutable runtime flags, isolated from static project configuration.
 */

let interactive = true;
let verbose = false;

// ============================================================
// Runtime state
// ============================================================
export function setInteractive(value: boolean): void {
    interactive = value;
}

export function isInteractive(): boolean {
    return interactive;
}

export function setVerbose(value: boolean): void {
    verbose = value;
}

export function isVerbose(): boolean {
    return verbose;
}