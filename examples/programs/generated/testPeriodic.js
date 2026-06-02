
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
	let Variable0_0_0_101432;
	Variable0_0_0_101432 = 1;
	sigma.set("Variable0_0_0_10currentValue", Variable0_0_0_101432);
}
async function functioninit8Variable(){
	sigma.set("Variable1_0_1_10currentValue", undefined);
}
async function function10initializeVar(){
	let Variable1_0_1_101432;
	Variable1_0_1_101432 = 0;
	sigma.set("Variable1_0_1_10currentValue", Variable1_0_1_101432);
}
async function function12periodicStart(){
	sigma.set("PeriodicBloc3_0_5_3blocTrigger", undefined);
	sigma.set("PeriodicBloc3_0_5_3blocTrigger", 1000);
}
async function function33executeAssignment2(resRight){
	let Assignment7_0_7_72622;
	Assignment7_0_7_72622 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment7_0_7_72622);
}
async function functioninit42Timer(){
	await new Promise(resolve => setTimeout(resolve, 1000));
}
async function function34accessVarRef(){
	let VarRef7_5_7_71647;
	VarRef7_5_7_71647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef7_5_7_7terminates;
	VarRef7_5_7_7terminates = VarRef7_5_7_71647;
	return VarRef7_5_7_7terminates;
}
async function function22executeAssignment2(resRight){
	let Assignment4_4_4_162622;
	Assignment4_4_4_162622 = resRight;
	sigma.set("Variable0_0_0_10currentValue", Assignment4_4_4_162622);
}
async function function28accessVarRef(){
	let VarRef4_13_4_151647;
	VarRef4_13_4_151647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_13_4_15terminates;
	VarRef4_13_4_15terminates = VarRef4_13_4_151647;
	return VarRef4_13_4_15terminates;
}
async function main(){
		await functioninit4Variable();
	await function6initializeVar();
	await functioninit8Variable();
	await function10initializeVar();
	await function12periodicStart();
	await functioninit42Timer();
	let result28accessVarRef = await function28accessVarRef();
}
main();
