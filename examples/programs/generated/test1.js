
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

async function function4perioStart(){
	console.log("	function4perioStart started");
	sigma.set("Perio0_0_2_1blocTrigger", undefined);
	sigma.set("Perio0_0_2_1blocTrigger", 1000);
}
async function functioninit36Timer(){
	console.log("	functioninit36Timer started");
	await new Promise(resolve => setTimeout(resolve, 1000));
}
async function function21fugaceStmt1(){
	console.log("	function21fugaceStmt1 started");
	sigma.set("Stmt11_6_1_11fakeState", undefined);
	sigma.set("Stmt11_6_1_11fakeState", 0);
}
async function function24fugaceStmt2(){
	console.log("	function24fugaceStmt2 started");
	sigma.set("Stmt21_14_1_19fakeState", undefined);
	sigma.set("Stmt21_14_1_19fakeState", 0);
}
async function function31fugaceStmt2(){
	console.log("	function31fugaceStmt2 started");
	sigma.set("Stmt21_25_1_30fakeState", undefined);
	sigma.set("Stmt21_25_1_30fakeState", 0);
}
async function function34fugaceStmt1(){
	console.log("	function34fugaceStmt1 started");
	sigma.set("Stmt11_33_1_38fakeState", undefined);
	sigma.set("Stmt11_33_1_38fakeState", 0);
}
async function main(){
		await function4perioStart();
	var sync9 = [];
	sync9.push(42);
	{
		fakeVar9 = sync9.pop();
		while (fakeVar9 == undefined){
			await new Promise(resolve => setTimeout(resolve, 100));
			fakeVar9 = sync9.pop();
		}
	}
	for (let v of sigma){
		console.log(v[0]+" = " + v[1]);
	}
}
main();
