
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
	Variable1_0_1_101376 = 0;
	sigma.set("Variable1_0_1_10currentValue", Variable1_0_1_101376);
}
async function functioninit12Variable(){
	sigma.set("Variable2_0_2_11currentValue", undefined);
}
async function function14initializeVar(){
	let Variable2_0_2_111376;
	Variable2_0_2_111376 = 42;
	sigma.set("Variable2_0_2_11currentValue", Variable2_0_2_111376);
}
async function function21accessVarRef(){
	let VarRef4_7_4_91582;
	VarRef4_7_4_91582 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_7_4_9terminates;
	VarRef4_7_4_9terminates = VarRef4_7_4_91582;
	return VarRef4_7_4_9terminates;
}
async function function29executeAssignment2(resRight){
	let Assignment6_4_6_112523;
	Assignment6_4_6_112523 = resRight;
	sigma.set("Variable0_0_0_10currentValue", Assignment6_4_6_112523);
}
async function function35executeAssignment2(resRight){
	let Assignment7_4_7_112523;
	Assignment7_4_7_112523 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment7_4_7_112523);
}
async function function30accessVarRef(){
	let VarRef6_9_6_111582;
	VarRef6_9_6_111582 = sigma.get("Variable1_0_1_10currentValue");
	let VarRef6_9_6_11terminates;
	VarRef6_9_6_11terminates = VarRef6_9_6_111582;
	return VarRef6_9_6_11terminates;
}
async function function36accessVarRef(){
	let VarRef7_9_7_111582;
	VarRef7_9_7_111582 = sigma.get("Variable2_0_2_11currentValue");
	let VarRef7_9_7_11terminates;
	VarRef7_9_7_11terminates = VarRef7_9_7_111582;
	return VarRef7_9_7_11terminates;
}
async function main(){
		await functioninit4Variable();
	await function6initializeVar();
	await functioninit8Variable();
	await function10initializeVar();
	await functioninit12Variable();
	await function14initializeVar();
	var sync20 = [];
	sync20.push(42);
	flag20 = true;
	var flag20 = true;
	while(flag20){
		flag20 = false;
		{
			fakeVar20 = sync20.pop();
			while (fakeVar20 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				fakeVar20 = sync20.pop();
			}
		}
		let result21accessVarRef = await function21accessVarRef();
		let VarRef4_7_4_9terminate;
		VarRef4_7_4_9terminate = result21accessVarRef;
		if (VarRef4_7_4_9terminate == true){
			let result30accessVarRef = await function30accessVarRef();
			await function29executeAssignment2(result30accessVarRef);
			let result36accessVarRef = await function36accessVarRef();
			await function35executeAssignment2(result36accessVarRef);
			sync20.push(42);
			flag20 = true;
		}
		if (VarRef4_7_4_9terminate == false){
		}
	}
}
main();
