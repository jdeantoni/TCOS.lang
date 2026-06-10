
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
	sigma.set("Variable2_0_2_10currentValue", undefined);
}
async function function6initializeVar(){
	let Variable2_0_2_101376;
	Variable2_0_2_101376 = 1;
	sigma.set("Variable2_0_2_10currentValue", Variable2_0_2_101376);
}
async function functioninit8Variable(){
	sigma.set("Variable4_0_4_10currentValue", undefined);
}
async function function10initializeVar(){
	let Variable4_0_4_101376;
	Variable4_0_4_101376 = 3;
	sigma.set("Variable4_0_4_10currentValue", Variable4_0_4_101376);
}
async function function18accessVarRef(){
	let VarRef8_4_8_61582;
	VarRef8_4_8_61582 = sigma.get("Variable2_0_2_10currentValue");
	let VarRef8_4_8_6terminates;
	VarRef8_4_8_6terminates = VarRef8_4_8_61582;
	return VarRef8_4_8_6terminates;
}
async function function26executeAssignment2(resRight){
	let Assignment9_4_9_112523;
	Assignment9_4_9_112523 = resRight;
	sigma.set("Variable2_0_2_10currentValue", Assignment9_4_9_112523);
}
async function function35executeAssignment2(resRight){
	let Assignment11_4_11_92523;
	Assignment11_4_11_92523 = resRight;
	sigma.set("Variable4_0_4_10currentValue", Assignment11_4_11_92523);
}
async function function27accessVarRef(){
	let VarRef9_9_9_111582;
	VarRef9_9_9_111582 = sigma.get("Variable4_0_4_10currentValue");
	let VarRef9_9_9_11terminates;
	VarRef9_9_9_11terminates = VarRef9_9_9_111582;
	return VarRef9_9_9_11terminates;
}
async function function36accessVarRef(){
	let VarRef11_7_11_91582;
	VarRef11_7_11_91582 = sigma.get("Variable2_0_2_10currentValue");
	let VarRef11_7_11_9terminates;
	VarRef11_7_11_9terminates = VarRef11_7_11_91582;
	return VarRef11_7_11_9terminates;
}
async function main(){
		await functioninit4Variable();
	await function6initializeVar();
	await functioninit8Variable();
	await function10initializeVar();
	let result18accessVarRef = await function18accessVarRef();
	var sync17 = [];
	let VarRef8_4_8_6terminate;
	VarRef8_4_8_6terminate = result18accessVarRef;
	if (VarRef8_4_8_6terminate == true){
		let result27accessVarRef = await function27accessVarRef();
		await function26executeAssignment2(result27accessVarRef);
		sync17.push(42);
	}
	if (VarRef8_4_8_6terminate == false){
		let result36accessVarRef = await function36accessVarRef();
		await function35executeAssignment2(result36accessVarRef);
		sync17.push(42);
	}
	{
		fakeVar17 = sync17.pop();
		while (fakeVar17 == undefined){
			await new Promise(resolve => setTimeout(resolve, 100));
			fakeVar17 = sync17.pop();
		}
	}
}
main();
