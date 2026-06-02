
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

async function functioninit24Variable(){
	sigma.set("Variable8_0_8_10currentValue", undefined);
}
async function function26initializeVar(){
	let Variable8_0_8_101432;
	Variable8_0_8_101432 = 0;
	sigma.set("Variable8_0_8_10currentValue", Variable8_0_8_101432);
}
async function function31accessVarRef(){
	let VarRef9_3_9_51647;
	VarRef9_3_9_51647 = sigma.get("Variable8_0_8_10currentValue");
	let VarRef9_3_9_5terminates;
	VarRef9_3_9_5terminates = VarRef9_3_9_51647;
	return VarRef9_3_9_5terminates;
}
async function functioninit10Variable(){
	sigma.set("Variable1_4_1_14currentValue", undefined);
}
async function function12initializeVar(){
	let Variable1_4_1_141432;
	Variable1_4_1_141432 = 1;
	sigma.set("Variable1_4_1_14currentValue", Variable1_4_1_141432);
}
async function functioninit14Variable(){
	sigma.set("Variable2_4_2_14currentValue", undefined);
}
async function function16initializeVar(){
	let Variable2_4_2_141432;
	Variable2_4_2_141432 = 0;
	sigma.set("Variable2_4_2_14currentValue", Variable2_4_2_141432);
}
async function function20executeAssignment2(resRight){
	let Assignment3_4_3_112622;
	Assignment3_4_3_112622 = resRight;
	sigma.set("Variable2_4_2_14currentValue", Assignment3_4_3_112622);
}
async function function21accessVarRef(){
	let VarRef3_9_3_111647;
	VarRef3_9_3_111647 = sigma.get("Variable1_4_1_14currentValue");
	let VarRef3_9_3_11terminates;
	VarRef3_9_3_11terminates = VarRef3_9_3_111647;
	return VarRef3_9_3_11terminates;
}
async function main(){
		await functioninit24Variable();
	await function26initializeVar();
	let result31accessVarRef = await function31accessVarRef();
	await functioninit10Variable();
	await function12initializeVar();
	await functioninit14Variable();
	await function16initializeVar();
	let result21accessVarRef = await function21accessVarRef();
	await function20executeAssignment2(result21accessVarRef);
}
main();
