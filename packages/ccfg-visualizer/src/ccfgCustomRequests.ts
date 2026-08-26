export const CCFG_CUSTOM_REQUEST = {
    ccfgCapabilities: 'ccfgCapabilities',
    ccfgStep: 'ccfgStep',
    ccfgAdvanceTime: 'ccfgAdvanceTime',
    ccfgStepThread: 'ccfgStepThread'
} as const;

export type CCFGCustomRequestName = typeof CCFG_CUSTOM_REQUEST[keyof typeof CCFG_CUSTOM_REQUEST];

export interface CCFGCapabilities {
    threads: boolean;
    events: boolean;
    time: boolean;
    mutableVariables: boolean;
    stateMachines: boolean;
    currentNode?: {
        uid: number;
        type: string;
    };
    lastEvent?: {
        kind: string;
        message?: string;
        data?: unknown;
    };
}

export interface CCFGCustomRequestArgs {
    ccfgCapabilities: undefined;
    ccfgStep: undefined;
    ccfgAdvanceTime: undefined;
    ccfgStepThread: { threadId: number };
}

export interface CCFGCustomRequestResult {
    ccfgCapabilities: CCFGCapabilities;
    ccfgStep: void;
    ccfgAdvanceTime: void;
    ccfgStepThread: void;
}

export const CCFG_CUSTOM_EVENT = {
    threadPositions: 'threadPositions',
    ccfgGraph: 'ccfgGraph',
    ccfgCapabilities: 'ccfgCapabilities'
} as const;
