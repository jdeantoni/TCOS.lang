/**
 * Mutable runtime flags, isolated from static project configuration.
 */

let verbose = false;

// ============================================================
// Runtime state
// ============================================================

export function setVerbose(value: boolean): void {
    verbose = value;
}

export function isVerbose(): boolean {
    return verbose;
}