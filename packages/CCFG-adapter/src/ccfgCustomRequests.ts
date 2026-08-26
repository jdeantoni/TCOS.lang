import { RuntimeCapabilities, RuntimeVisualization } from './InterpreterRuntime';

export const CCFG_CUSTOM_REQUEST = {
	toggleFormatting: 'toggleFormatting',
	getDot: 'getDot',
	ccfgCapabilities: 'ccfgCapabilities',
	ccfgStep: 'ccfgStep',
	ccfgAdvanceTime: 'ccfgAdvanceTime',
	ccfgStepThread: 'ccfgStepThread'
} as const;

export type CCFGCustomRequestName = typeof CCFG_CUSTOM_REQUEST[keyof typeof CCFG_CUSTOM_REQUEST];

export interface CCFGCustomRequestArgs {
	toggleFormatting: undefined;
	getDot: undefined;
	ccfgCapabilities: undefined;
	ccfgStep: undefined;
	ccfgAdvanceTime: undefined;
	ccfgStepThread: { threadId: number };
}

export interface CCFGCustomRequestResult {
	toggleFormatting: void;
	getDot: RuntimeVisualization;
	ccfgCapabilities: RuntimeCapabilities;
	ccfgStep: void;
	ccfgAdvanceTime: void;
	ccfgStepThread: void;
}

export type CCFGCustomRequestHandler<K extends CCFGCustomRequestName = CCFGCustomRequestName> = (
	args: CCFGCustomRequestArgs[K]
) => Promise<CCFGCustomRequestResult[K]> | CCFGCustomRequestResult[K];

export const CCFG_CUSTOM_EVENT = {
	threadPositions: 'threadPositions',
	ccfgGraph: 'ccfgGraph',
	ccfgCapabilities: 'ccfgCapabilities'
} as const;

export interface CCFGCustomEventPayload {
	threadPositions: { threads: RuntimeVisualization['threadPositions'] };
	ccfgGraph: {
		dot: RuntimeVisualization['dot'];
		activeNodes: RuntimeVisualization['activeNodes'];
		threads: RuntimeVisualization['threads'];
		capabilities: RuntimeCapabilities;
	};
	ccfgCapabilities: { capabilities: RuntimeCapabilities };
}
