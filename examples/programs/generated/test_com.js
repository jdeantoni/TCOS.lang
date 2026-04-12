
class Void{}
let sigma = new Map();
let eventChannels = new Map();
let eventTokenToChannel = new Map();

function __createEventChannel(name, listenerCount, payloadKind){
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

function __getEventChannel(name){
    if (!eventChannels.has(name)){
        throw new Error('Unknown event channel: ' + name);
    }
    return eventChannels.get(name);
}

async function __emitEvent(name, payload, awaitAcks){
    let channel = __getEventChannel(name);
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

async function __waitEvent(name){
    let channel = __getEventChannel(name);
    let message = channel.queue.shift();
    while (message == undefined){
        await new Promise(resolve => setTimeout(resolve, 10));
        message = channel.queue.shift();
    }
    return message;
}

function __ackEvent(token){
    let channelName = eventTokenToChannel.get(token);
    if (channelName == undefined){
        return;
    }
    let channel = __getEventChannel(channelName);
    let remaining = (channel.pendingAcks.get(token) || 0) - 1;
    if (remaining <= 0){
        channel.pendingAcks.delete(token);
        eventTokenToChannel.delete(token);
    } else {
        channel.pendingAcks.set(token, remaining);
    }
}

let __lastEventToken = undefined;

async function function0startsProgram(){
	console.log("	function0startsProgram started");
	__createEventChannel("ComID0_20_0_24", 1, "void");
	__createEventChannel("ComID0_20_0_24", 1, "void");
}
async function function6perioStart(){
	console.log("	function6perioStart started");
	sigma.set("Perio2_0_4_1blocTrigger", undefined);
	sigma.set("Perio2_0_4_1blocTrigger", 1000);
}
async function functioninit53Timer(){
	console.log("	functioninit53Timer started");
	await new Promise(resolve => setTimeout(resolve, 1000));
}
async function function25finishWait(){
	console.log("	function25finishWait started");
	{
		const __event = await __waitEvent("ComID0_20_0_24");
		ComID0_20_0_24waitIDPayload = __event.payload;
		ComID0_20_0_24Token = __event.token;
		__lastEventToken = __event.token;
	}
	__ackEvent(ComID0_20_0_24Token);
}
async function function52emitnotifyID(){
	console.log("	function52emitnotifyID started");
	let ComID0_20_0_24notifyIDPayload;
	ComID0_20_0_24notifyIDPayload = 0;
	await __emitEvent("ComID0_20_0_24", ComID0_20_0_24notifyIDPayload, true);
}
async function function31fugaceStmt1(){
	console.log("	function31fugaceStmt1 started");
	sigma.set("Stmt13_18_3_23fakeState", undefined);
	sigma.set("Stmt13_18_3_23fakeState", 0);
}
async function function34fugaceStmt1(){
	console.log("	function34fugaceStmt1 started");
	sigma.set("Stmt13_25_3_30fakeState", undefined);
	sigma.set("Stmt13_25_3_30fakeState", 0);
}
async function function45fugaceStmt2(){
	console.log("	function45fugaceStmt2 started");
	sigma.set("Stmt23_38_3_43fakeState", undefined);
	sigma.set("Stmt23_38_3_43fakeState", 0);
}
async function function48fugaceStmt2(){
	console.log("	function48fugaceStmt2 started");
	sigma.set("Stmt23_46_3_51fakeState", undefined);
	sigma.set("Stmt23_46_3_51fakeState", 0);
}
async function main(){
		await function0startsProgram();
	await function6perioStart();
	var sync11 = [];
	sync11.push(42);
	flag11 = true;
	var flag11 = true;
	while(flag11){
		flag11 = false;
		{
			fakeVar11 = sync11.pop();
			while (fakeVar11 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				fakeVar11 = sync11.pop();
			}
		}
		await functioninit53Timer();
		var sync17 = [];
		async function thread12(){
            			console.log("thread12 started");
			async function thread18(){
            				console.log("thread18 started");
				await function25finishWait();
				await function31fugaceStmt1();
				await function34fugaceStmt1();
				sync17.push(42);
			}
			thread18();
			async function thread36(){
            				console.log("thread36 started");
				await function45fugaceStmt2();
				await function48fugaceStmt2();
				await function52emitnotifyID();
				sync17.push(42);
			}
			thread36();
		}
		thread12();
		sync11.push(42);
		flag11 = true;
		{
			fakeVar17 = sync17.pop();
			while (fakeVar17 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				fakeVar17 = sync17.pop();
			}
		}
		{
			fakeVar17 = sync17.pop();
			while (fakeVar17 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				fakeVar17 = sync17.pop();
			}
		}
	}
	for (let v of sigma){
		console.log(v[0]+" = " + v[1]);
	}
}
main();
