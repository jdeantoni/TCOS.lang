
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
async function functioninit12Variable(){
	sigma.set("Variable2_0_2_10currentValue", undefined);
}
async function function14initializeVar(){
	let Variable2_0_2_101376;
	Variable2_0_2_101376 = 0;
	sigma.set("Variable2_0_2_10currentValue", Variable2_0_2_101376);
}
async function function80executeAssignment2(resRight){
	let Assignment16_0_16_202523;
	Assignment16_0_16_202523 = resRight;
	sigma.set("Variable2_0_2_10currentValue", Assignment16_0_16_202523);
}
async function function47accessVarRef(){
	let VarRef7_4_7_61582;
	VarRef7_4_7_61582 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef7_4_7_6terminates;
	VarRef7_4_7_6terminates = VarRef7_4_7_61582;
	return VarRef7_4_7_6terminates;
}
async function function21executeAssignment2(resRight){
	let Assignment4_7_4_212523;
	Assignment4_7_4_212523 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment4_7_4_212523);
}
async function function32executeAssignment2(resRight){
	let Assignment5_7_5_212523;
	Assignment5_7_5_212523 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment5_7_5_212523);
}
async function function85evalBooleanConst(){
	sigma.set("BooleanConst16_6_16_10constantValue", undefined);
	sigma.set("BooleanConst16_6_16_10constantValue", true);
	let BooleanConst16_6_16_104605;
	BooleanConst16_6_16_104605 = sigma.get("BooleanConst16_6_16_10constantValue");
	let BooleanConst16_6_16_10terminates;
	BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104605;
	return BooleanConst16_6_16_10terminates;
}
async function function55executeAssignment2(resRight){
	let Assignment9_4_9_182523;
	Assignment9_4_9_182523 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment9_4_9_182523);
}
async function function69executeAssignment2(resRight){
	let Assignment12_4_12_182523;
	Assignment12_4_12_182523 = resRight;
	sigma.set("Variable0_0_0_10currentValue", Assignment12_4_12_182523);
}
async function function27accessVarRef(){
	let VarRef4_18_4_201582;
	VarRef4_18_4_201582 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_18_4_20terminates;
	VarRef4_18_4_20terminates = VarRef4_18_4_201582;
	return VarRef4_18_4_20terminates;
}
async function function38accessVarRef(){
	let VarRef5_18_5_201582;
	VarRef5_18_5_201582 = sigma.get("Variable1_0_1_10currentValue");
	let VarRef5_18_5_20terminates;
	VarRef5_18_5_20terminates = VarRef5_18_5_201582;
	return VarRef5_18_5_20terminates;
}
async function function61accessVarRef(){
	let VarRef9_15_9_171582;
	VarRef9_15_9_171582 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef9_15_9_17terminates;
	VarRef9_15_9_17terminates = VarRef9_15_9_171582;
	return VarRef9_15_9_17terminates;
}
async function function75accessVarRef(){
	let VarRef12_15_12_171582;
	VarRef12_15_12_171582 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef12_15_12_17terminates;
	VarRef12_15_12_17terminates = VarRef12_15_12_171582;
	return VarRef12_15_12_17terminates;
}
async function main(){
		await functioninit4Variable();
	await function6initializeVar();
	await functioninit8Variable();
	await function10initializeVar();
	await functioninit12Variable();
	await function14initializeVar();
	var sync101 = [];
	async function thread18(){
            		let result27accessVarRef = await function27accessVarRef();
	}
	thread18();
	async function thread29(){
            		let result38accessVarRef = await function38accessVarRef();
	}
	thread29();
}
main();
