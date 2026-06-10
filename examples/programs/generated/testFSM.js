
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

async function function0FSMstart(){
	com_create_event_channel("Event3_0_3_8", 1, "void");
	com_create_event_channel("Event4_0_4_8", 1, "void");
}
async function function18init(){
	sigma.set("State6_4_9_5isInitial", true);
}
async function functioninit20State(){
	sigma.set("State6_4_9_5isInitial", undefined);
	sigma.set("State6_4_9_5isInitial", false);
}
async function function24firstStartOfInitialState(){
	sigma.set("State6_4_9_5isInitial", false);
}
async function function40emitsentEvent(){
	let Event3_0_3_8sentEventPayload;
	Event3_0_3_8sentEventPayload = 0;
	await com_emit_event("Event3_0_3_8", Event3_0_3_8sentEventPayload, true);
}
async function functioninit28State(){
	sigma.set("State10_4_13_5isInitial", undefined);
	sigma.set("State10_4_13_5isInitial", false);
}
async function function32firstStartOfInitialState(){
	sigma.set("State10_4_13_5isInitial", false);
}
async function function47emitsentEvent(){
	let Event4_0_4_8sentEventPayload;
	Event4_0_4_8sentEventPayload = 0;
	await com_emit_event("Event4_0_4_8", Event4_0_4_8sentEventPayload, true);
}
async function main(){
		await function0FSMstart();
	var sync52 = [];
	async function thread15(){
            		await function18init();
		var sync64 = [];
		sync64.push(42);
		flag64 = true;
		var flag64 = true;
		while(flag64){
			flag64 = false;
			{
				fakeVar64 = sync64.pop();
				while (fakeVar64 == undefined){
					await new Promise(resolve => setTimeout(resolve, 100));
					fakeVar64 = sync64.pop();
				}
			}
			await functioninit20State();
			var sync25 = [];
			var sync26 = [];
			var sync57 = [];
			var sync39 = [];
			if (State6_4_9_5isInitial == true){
				await function24firstStartOfInitialState();
				sync26.push(42);
				{
					fakeVar26 = sync26.pop();
					while (fakeVar26 == undefined){
						await new Promise(resolve => setTimeout(resolve, 100));
						fakeVar26 = sync26.pop();
					}
				}
				async function thread36(){
            					{
						fakeVar39 = sync39.pop();
						while (fakeVar39 == undefined){
							await new Promise(resolve => setTimeout(resolve, 100));
							fakeVar39 = sync39.pop();
						}
					}
					await function40emitsentEvent();
					async function thread37(){
            						{
							fakeVar57 = sync57.pop();
							while (fakeVar57 == undefined){
								await new Promise(resolve => setTimeout(resolve, 100));
								fakeVar57 = sync57.pop();
							}
						}
					}
					thread37();
					async function thread28(){
            						await functioninit28State();
						var sync33 = [];
						var sync34 = [];
						var sync62 = [];
						var sync46 = [];
						if (State10_4_13_5isInitial == true){
							await function32firstStartOfInitialState();
							sync34.push(42);
							{
								fakeVar34 = sync34.pop();
								while (fakeVar34 == undefined){
									await new Promise(resolve => setTimeout(resolve, 100));
									fakeVar34 = sync34.pop();
								}
							}
							async function thread43(){
            								{
									fakeVar46 = sync46.pop();
									while (fakeVar46 == undefined){
										await new Promise(resolve => setTimeout(resolve, 100));
										fakeVar46 = sync46.pop();
									}
								}
								await function47emitsentEvent();
								async function thread44(){
            									{
										fakeVar62 = sync62.pop();
										while (fakeVar62 == undefined){
											await new Promise(resolve => setTimeout(resolve, 100));
											fakeVar62 = sync62.pop();
										}
									}
								}
								thread44();
								async function thread45(){
            								}
								thread45();
								async function thread64(){
            								}
								thread64();
							}
							thread43();
						}
						if (State10_4_13_5isInitial == false){
							{
								fakeVar33 = sync33.pop();
								while (fakeVar33 == undefined){
									await new Promise(resolve => setTimeout(resolve, 100));
									fakeVar33 = sync33.pop();
								}
							}
							sync33.push(42);
						}
					}
					thread28();
				}
				thread36();
			}
			if (State6_4_9_5isInitial == false){
				{
					fakeVar25 = sync25.pop();
					while (fakeVar25 == undefined){
						await new Promise(resolve => setTimeout(resolve, 100));
						fakeVar25 = sync25.pop();
					}
				}
				sync25.push(42);
			}
		}
	}
	thread15();
}
main();
