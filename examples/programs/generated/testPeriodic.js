
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
async function function38executeAssignment2(resRight){
	let Assignment7_0_7_72622;
	Assignment7_0_7_72622 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment7_0_7_72622);
}
async function functioninit47Timer(){
	await new Promise(resolve => setTimeout(resolve, 1000));
}
async function function39accessVarRef(){
	let VarRef7_5_7_71647;
	VarRef7_5_7_71647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef7_5_7_7terminates;
	VarRef7_5_7_7terminates = VarRef7_5_7_71647;
	return VarRef7_5_7_7terminates;
}
async function function24executeAssignment2(resRight){
	let Assignment4_4_4_162622;
	Assignment4_4_4_162622 = resRight;
	sigma.set("Variable0_0_0_10currentValue", Assignment4_4_4_162622);
}
async function function30finishPlus(n2, n1){
	let Plus4_9_4_164543;
	Plus4_9_4_164543 = n1;
	let Plus4_9_4_164548;
	Plus4_9_4_164548 = n2;
	let Plus4_9_4_164542;
	Plus4_9_4_164542 = Plus4_9_4_164543 + Plus4_9_4_164548;
	let Plus4_9_4_16terminates;
	Plus4_9_4_16terminates = Plus4_9_4_164542;
	return Plus4_9_4_16terminates;
}
async function function33accessVarRef(){
	let VarRef4_13_4_151647;
	VarRef4_13_4_151647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_13_4_15terminates;
	VarRef4_13_4_15terminates = VarRef4_13_4_151647;
	return VarRef4_13_4_15terminates;
}
async function function31accessVarRef(){
	let VarRef4_10_4_121647;
	VarRef4_10_4_121647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_10_4_12terminates;
	VarRef4_10_4_12terminates = VarRef4_10_4_121647;
	return VarRef4_10_4_12terminates;
}
async function main(){
		await functioninit4Variable();
	await function6initializeVar();
	await functioninit8Variable();
	await function10initializeVar();
	await function12periodicStart();
	var sync17 = [];
	sync17.push(42);
	flag17 = true;
	var flag17 = true;
	while(flag17){
		flag17 = false;
		{
			fakeVar17 = sync17.pop();
			while (fakeVar17 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				fakeVar17 = sync17.pop();
			}
		}
		await functioninit47Timer();
		var queue30 = [];
		async function thread18(){
            			async function thread33(){
            				let result33accessVarRef = await function33accessVarRef();
				queue30.push(result33accessVarRef);
			}
			thread33();
			async function thread31(){
            				let result31accessVarRef = await function31accessVarRef();
				queue30.push(result31accessVarRef);
			}
			thread31();
			let AndJoinPopped_30_0;
			{
			AndJoinPopped_30_0 = queue30.pop();
				while (AndJoinPopped_30_0 == undefined){
					await new Promise(resolve => setTimeout(resolve, 100));
					AndJoinPopped_30_0 = queue30.pop();
				}
			}
			let AndJoinPopped_30_1;
			{
			AndJoinPopped_30_1 = queue30.pop();
				while (AndJoinPopped_30_1 == undefined){
					await new Promise(resolve => setTimeout(resolve, 100));
					AndJoinPopped_30_1 = queue30.pop();
				}
			}
			let result30finishPlus = await function30finishPlus(AndJoinPopped_30_0, AndJoinPopped_30_1);
			await function24executeAssignment2(result30finishPlus);
		}
		thread18();
		sync17.push(42);
		flag17 = true;
	}
}
main();
