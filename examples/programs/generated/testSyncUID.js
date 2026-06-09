
class Void{}
let sigma = new Map();
let eventChannels = new Map();
let eventTokenToChannel = new Map();

function com_create_event_channel(name, listenerCount, payloadKind){
    if (eventChannels.has(name)){
        return;
    }
    eventChannels.set(name, {
        listenerCount: listenerCount,
        payloadKind: payloadKind,
        queue: [],
        nextToken: 1,
        pendingAcks: new Map()
    });
}

function com_get_event_channel(name){
    if (!eventChannels.has(name)){
        throw new Error('Unknown event channel: ' + name);
    }
    return eventChannels.get(name);
}

async function com_emit_event(name, payload, awaitAcks){
    let channel = com_get_event_channel(name);
    let token = channel.nextToken++;
    let expectedAcks = awaitAcks ? channel.listenerCount : 0;
    if (expectedAcks > 0){
        channel.pendingAcks.set(token, expectedAcks);
        eventTokenToChannel.set(token, name);
    }
    channel.queue.push({payload: payload, token: token});

    if (awaitAcks){
        while ((channel.pendingAcks.get(token) || 0) > 0){
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        channel.pendingAcks.delete(token);
        eventTokenToChannel.delete(token);
    }
}

async function com_wait_event(name){
    let channel = com_get_event_channel(name);
    let message = channel.queue.shift();
    while (message == undefined){
        await new Promise(resolve => setTimeout(resolve, 10));
        message = channel.queue.shift();
    }
    return message;
}

function com_ack_event(token){
    let channelName = eventTokenToChannel.get(token);
    if (channelName == undefined){
        return;
    }
    let channel = com_get_event_channel(channelName);
    let remaining = (channel.pendingAcks.get(token) || 0) - 1;
    if (remaining <= 0){
        channel.pendingAcks.delete(token);
        eventTokenToChannel.delete(token);
    } else {
        channel.pendingAcks.set(token, remaining);
    }
}

let com_last_event_token = undefined;

async function functioninit4Variable(){
	sigma.set("Variable0_0_0_10currentValue", undefined);
}
async function function6initializeVar(){
	let Variable0_0_0_101376;
	Variable0_0_0_101376 = 1;
	sigma.set("Variable0_0_0_10currentValue", Variable0_0_0_101376);
}
async function functioninit8Variable(){
	sigma.set("Variable1_0_1_10currentValue", undefined);
}
async function function10initializeVar(){
	let Variable1_0_1_101376;
	Variable1_0_1_101376 = 4;
	sigma.set("Variable1_0_1_10currentValue", Variable1_0_1_101376);
}
async function function17executeAssignment2(resRight){
	let Assignment3_7_3_142523;
	Assignment3_7_3_142523 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment3_7_3_142523);
}
async function function23executeAssignment2(resRight){
	let Assignment4_7_4_142523;
	Assignment4_7_4_142523 = resRight;
	sigma.set("Variable0_0_0_10currentValue", Assignment4_7_4_142523);
}
async function function18accessVarRef(){
	let VarRef3_12_3_141582;
	VarRef3_12_3_141582 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef3_12_3_14terminates;
	VarRef3_12_3_14terminates = VarRef3_12_3_141582;
	return VarRef3_12_3_14terminates;
}
async function function24accessVarRef(){
	let VarRef4_12_4_141582;
	VarRef4_12_4_141582 = sigma.get("Variable1_0_1_10currentValue");
	let VarRef4_12_4_14terminates;
	VarRef4_12_4_14terminates = VarRef4_12_4_141582;
	return VarRef4_12_4_14terminates;
}
async function main(){
		await functioninit4Variable();
	await function6initializeVar();
	await functioninit8Variable();
	await function10initializeVar();
	var sync34 = [];
	async function thread14(){
            		let result18accessVarRef = await function18accessVarRef();
		await function17executeAssignment2(result18accessVarRef);
		sync34.push(42);
	}
	thread14();
	async function thread20(){
            		let result24accessVarRef = await function24accessVarRef();
		await function23executeAssignment2(result24accessVarRef);
		sync34.push(42);
	}
	thread20();
	{
		fakeVar34 = sync34.pop();
		while (fakeVar34 == undefined){
			await new Promise(resolve => setTimeout(resolve, 100));
			fakeVar34 = sync34.pop();
		}
	}
}
main();
