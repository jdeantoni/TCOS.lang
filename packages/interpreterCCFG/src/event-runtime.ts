import type * as ccfg from "ccfg";
import { evaluateExpression } from "./evaluation.js";
import type { RuntimeThread } from "./runtime.js";
import type { InterpreterRuntimeState } from "./state.js";
import type * as types from "./types.js";
import { setThreadWaitingEvent, unblockEventWaiters } from "./thread-queue.js";

export function createEventChannel(state: InterpreterRuntimeState, instruction: ccfg.CreateEventChannelInstruction): void {
    if (state.eventChannels.has(instruction.channelName)) return;
    state.eventChannels.set(instruction.channelName, {
        listenerCount: instruction.listenerCount,
        payloadKind: instruction.payloadKind,
        queue: [],
        nextToken: 1,
        pendingAcks: new Map()
    });
}

export function emitEventDiscrete(state: InterpreterRuntimeState, instruction: ccfg.EmitEventInstruction, thread: RuntimeThread): void {
    const channel = getEventChannel(state, instruction.channelName);
    const token = channel.nextToken++;
    const payload = evaluateExpression(instruction.payload, thread, state.sigma);

    if (instruction.awaitAcks) {
        channel.pendingAcks.set(token, channel.listenerCount);
        state.eventTokenToChannel.set(token, instruction.channelName);
    }
    channel.queue.push({ payload, token });
    unblockEventWaiters(state, instruction.channelName);

    state.lastEvent = {
        kind: "event",
        threadId: thread.id,
        message: "emit",
        data: { channel: instruction.channelName, token }
    };
}

export function waitEventDiscrete(
    state: InterpreterRuntimeState,
    instruction: ccfg.WaitEventInstruction,
    thread: RuntimeThread,
    node: ccfg.Node
): boolean {
    const channel = getEventChannel(state, instruction.channelName);
    const message = channel.queue.shift();

    if (message !== undefined) {
        thread.locals.set(instruction.outPayload, message.payload);
        thread.locals.set(`${instruction.channelName}Token`, message.token);
        thread.locals.set("com_last_event_token", message.token);
        state.lastEvent = {
            kind: "event",
            threadId: thread.id,
            message: "wait",
            data: { channel: instruction.channelName, token: message.token }
        };
        return false;
    }

    setThreadWaitingEvent(state, thread, instruction.channelName);
    thread.currentNode = node;
    return true;
}

export function ackEvent(state: InterpreterRuntimeState, instruction: ccfg.AckEventInstruction, thread: RuntimeThread): void {
    const token = Number(evaluateExpression(instruction.token, thread, state.sigma));
    const channelName = state.eventTokenToChannel.get(token);
    if (channelName === undefined) return;
    const channel = getEventChannel(state, channelName);
    const remaining = (channel.pendingAcks.get(token) ?? 0) - 1;
    if (remaining <= 0) {
        channel.pendingAcks.delete(token);
        state.eventTokenToChannel.delete(token);
    } else {
        channel.pendingAcks.set(token, remaining);
    }
}

function getEventChannel(state: InterpreterRuntimeState, name: string): types.EventChannel {
    const channel = state.eventChannels.get(name);
    if (channel === undefined) throw new Error(`Unknown event channel: ${name}`);
    return channel;
}
