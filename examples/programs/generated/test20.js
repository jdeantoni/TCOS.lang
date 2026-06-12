
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
	Variable1_0_1_101432 = 4;
	sigma.set("Variable1_0_1_10currentValue", Variable1_0_1_101432);
}
async function functioninit12Variable(){
	sigma.set("Variable2_0_2_10currentValue", undefined);
}
async function function14initializeVar(){
	let Variable2_0_2_101432;
	Variable2_0_2_101432 = 0;
	sigma.set("Variable2_0_2_10currentValue", Variable2_0_2_101432);
}
async function function92executeAssignment2(resRight){
	let Assignment16_0_16_202622;
	Assignment16_0_16_202622 = resRight;
	sigma.set("Variable2_0_2_10currentValue", Assignment16_0_16_202622);
}
async function function53accessVarRef(){
	let VarRef7_4_7_61647;
	VarRef7_4_7_61647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef7_4_7_6terminates;
	VarRef7_4_7_6terminates = VarRef7_4_7_61647;
	return VarRef7_4_7_6terminates;
}
async function function98evaluateConjunction2(){
	let Conjunction16_5_16_20terminates;
	Conjunction16_5_16_20terminates = false;
	return Conjunction16_5_16_20terminates;
}
async function function99evaluateConjunction3(){
	let Conjunction16_5_16_20terminates;
	Conjunction16_5_16_20terminates = false;
	return Conjunction16_5_16_20terminates;
}
async function function102evaluateConjunction4(){
	let Conjunction16_5_16_20terminates;
	Conjunction16_5_16_20terminates = true;
	return Conjunction16_5_16_20terminates;
}
async function function21executeAssignment2(resRight){
	let Assignment4_7_4_212622;
	Assignment4_7_4_212622 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment4_7_4_212622);
}
async function function35executeAssignment2(resRight){
	let Assignment5_7_5_212622;
	Assignment5_7_5_212622 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment5_7_5_212622);
}
async function function104evalBooleanConst(){
	sigma.set("BooleanConst16_6_16_10constantValue", undefined);
	sigma.set("BooleanConst16_6_16_10constantValue", true);
	let BooleanConst16_6_16_104771;
	BooleanConst16_6_16_104771 = sigma.get("BooleanConst16_6_16_10constantValue");
	let BooleanConst16_6_16_10terminates;
	BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104771;
	return BooleanConst16_6_16_10terminates;
}
async function function107evalBooleanConst(){
	sigma.set("BooleanConst16_14_16_19constantValue", undefined);
	sigma.set("BooleanConst16_14_16_19constantValue", false);
	let BooleanConst16_14_16_194771;
	BooleanConst16_14_16_194771 = sigma.get("BooleanConst16_14_16_19constantValue");
	let BooleanConst16_14_16_19terminates;
	BooleanConst16_14_16_19terminates = BooleanConst16_14_16_194771;
	return BooleanConst16_14_16_19terminates;
}
async function function27finishPlus(n2, n1){
	let Plus4_12_4_214543;
	Plus4_12_4_214543 = n1;
	let Plus4_12_4_214548;
	Plus4_12_4_214548 = n2;
	let Plus4_12_4_214542;
	Plus4_12_4_214542 = Plus4_12_4_214543 + Plus4_12_4_214548;
	let Plus4_12_4_21terminates;
	Plus4_12_4_21terminates = Plus4_12_4_214542;
	return Plus4_12_4_21terminates;
}
async function function41finishPlus(n2, n1){
	let Plus5_12_5_214543;
	Plus5_12_5_214543 = n1;
	let Plus5_12_5_214548;
	Plus5_12_5_214548 = n2;
	let Plus5_12_5_214542;
	Plus5_12_5_214542 = Plus5_12_5_214543 + Plus5_12_5_214548;
	let Plus5_12_5_21terminates;
	Plus5_12_5_21terminates = Plus5_12_5_214542;
	return Plus5_12_5_21terminates;
}
async function function61executeAssignment2(resRight){
	let Assignment9_4_9_182622;
	Assignment9_4_9_182622 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment9_4_9_182622);
}
async function function78executeAssignment2(resRight){
	let Assignment12_4_12_182622;
	Assignment12_4_12_182622 = resRight;
	sigma.set("Variable0_0_0_10currentValue", Assignment12_4_12_182622);
}
async function function30accessVarRef(){
	let VarRef4_18_4_201647;
	VarRef4_18_4_201647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_18_4_20terminates;
	VarRef4_18_4_20terminates = VarRef4_18_4_201647;
	return VarRef4_18_4_20terminates;
}
async function function28accessVarRef(){
	let VarRef4_13_4_151647;
	VarRef4_13_4_151647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_13_4_15terminates;
	VarRef4_13_4_15terminates = VarRef4_13_4_151647;
	return VarRef4_13_4_15terminates;
}
async function function44accessVarRef(){
	let VarRef5_18_5_201647;
	VarRef5_18_5_201647 = sigma.get("Variable1_0_1_10currentValue");
	let VarRef5_18_5_20terminates;
	VarRef5_18_5_20terminates = VarRef5_18_5_201647;
	return VarRef5_18_5_20terminates;
}
async function function42accessVarRef(){
	let VarRef5_13_5_151647;
	VarRef5_13_5_151647 = sigma.get("Variable1_0_1_10currentValue");
	let VarRef5_13_5_15terminates;
	VarRef5_13_5_15terminates = VarRef5_13_5_151647;
	return VarRef5_13_5_15terminates;
}
async function function67finishPlus(n2, n1){
	let Plus9_9_9_184543;
	Plus9_9_9_184543 = n1;
	let Plus9_9_9_184548;
	Plus9_9_9_184548 = n2;
	let Plus9_9_9_184542;
	Plus9_9_9_184542 = Plus9_9_9_184543 + Plus9_9_9_184548;
	let Plus9_9_9_18terminates;
	Plus9_9_9_18terminates = Plus9_9_9_184542;
	return Plus9_9_9_18terminates;
}
async function function84finishPlus(n2, n1){
	let Plus12_9_12_184543;
	Plus12_9_12_184543 = n1;
	let Plus12_9_12_184548;
	Plus12_9_12_184548 = n2;
	let Plus12_9_12_184542;
	Plus12_9_12_184542 = Plus12_9_12_184543 + Plus12_9_12_184548;
	let Plus12_9_12_18terminates;
	Plus12_9_12_18terminates = Plus12_9_12_184542;
	return Plus12_9_12_18terminates;
}
async function function70accessVarRef(){
	let VarRef9_15_9_171647;
	VarRef9_15_9_171647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef9_15_9_17terminates;
	VarRef9_15_9_17terminates = VarRef9_15_9_171647;
	return VarRef9_15_9_17terminates;
}
async function function68accessVarRef(){
	let VarRef9_10_9_121647;
	VarRef9_10_9_121647 = sigma.get("Variable1_0_1_10currentValue");
	let VarRef9_10_9_12terminates;
	VarRef9_10_9_12terminates = VarRef9_10_9_121647;
	return VarRef9_10_9_12terminates;
}
async function function87accessVarRef(){
	let VarRef12_15_12_171647;
	VarRef12_15_12_171647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef12_15_12_17terminates;
	VarRef12_15_12_17terminates = VarRef12_15_12_171647;
	return VarRef12_15_12_17terminates;
}
async function function85accessVarRef(){
	let VarRef12_10_12_121647;
	VarRef12_10_12_121647 = sigma.get("Variable1_0_1_10currentValue");
	let VarRef12_10_12_12terminates;
	VarRef12_10_12_12terminates = VarRef12_10_12_121647;
	return VarRef12_10_12_12terminates;
}
async function main(){
		await functioninit4Variable();
	await function6initializeVar();
	await functioninit8Variable();
	await function10initializeVar();
	await functioninit12Variable();
	await function14initializeVar();
	var sync120 = [];
	var sync52 = [];
	var queue100 = [];
	var queue101 = [];
	var queue27 = [];
	var queue67 = [];
	async function thread18(){
            		async function thread30(){
            			let result30accessVarRef = await function30accessVarRef();
			queue27.push(result30accessVarRef);
		}
		thread30();
		async function thread28(){
            			let result28accessVarRef = await function28accessVarRef();
			queue27.push(result28accessVarRef);
		}
		thread28();
		let AndJoinPopped_27_0;
		{
		AndJoinPopped_27_0 = queue27.pop();
			while (AndJoinPopped_27_0 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				AndJoinPopped_27_0 = queue27.pop();
			}
		}
		let AndJoinPopped_27_1;
		{
		AndJoinPopped_27_1 = queue27.pop();
			while (AndJoinPopped_27_1 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				AndJoinPopped_27_1 = queue27.pop();
			}
		}
		let result27finishPlus = await function27finishPlus(AndJoinPopped_27_0, AndJoinPopped_27_1);
		await function21executeAssignment2(result27finishPlus);
		sync120.push(42);
	}
	thread18();
	async function thread32(){
            		var queue41 = [];
		async function thread44(){
            			let result44accessVarRef = await function44accessVarRef();
			queue41.push(result44accessVarRef);
		}
		thread44();
		async function thread42(){
            			let result42accessVarRef = await function42accessVarRef();
			queue41.push(result42accessVarRef);
		}
		thread42();
		let AndJoinPopped_41_0;
		{
		AndJoinPopped_41_0 = queue41.pop();
			while (AndJoinPopped_41_0 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				AndJoinPopped_41_0 = queue41.pop();
			}
		}
		let AndJoinPopped_41_1;
		{
		AndJoinPopped_41_1 = queue41.pop();
			while (AndJoinPopped_41_1 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				AndJoinPopped_41_1 = queue41.pop();
			}
		}
		let result41finishPlus = await function41finishPlus(AndJoinPopped_41_0, AndJoinPopped_41_1);
		await function35executeAssignment2(result41finishPlus);
		sync120.push(42);
	}
	thread32();
	{
		fakeVar120 = sync120.pop();
		while (fakeVar120 == undefined){
			await new Promise(resolve => setTimeout(resolve, 100));
			fakeVar120 = sync120.pop();
		}
	}
	let result53accessVarRef = await function53accessVarRef();
	let VarRef7_4_7_6terminate;
	VarRef7_4_7_6terminate = result53accessVarRef;
	if (VarRef7_4_7_6terminate == true){
		async function thread70(){
            			let result70accessVarRef = await function70accessVarRef();
			queue67.push(result70accessVarRef);
		}
		thread70();
		async function thread68(){
            			let result68accessVarRef = await function68accessVarRef();
			queue67.push(result68accessVarRef);
		}
		thread68();
		let AndJoinPopped_67_0;
		{
		AndJoinPopped_67_0 = queue67.pop();
			while (AndJoinPopped_67_0 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				AndJoinPopped_67_0 = queue67.pop();
			}
		}
		let AndJoinPopped_67_1;
		{
		AndJoinPopped_67_1 = queue67.pop();
			while (AndJoinPopped_67_1 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				AndJoinPopped_67_1 = queue67.pop();
			}
		}
		let result67finishPlus = await function67finishPlus(AndJoinPopped_67_0, AndJoinPopped_67_1);
		await function61executeAssignment2(result67finishPlus);
		sync52.push(42);
	}
	if (VarRef7_4_7_6terminate == false){
		var queue84 = [];
		async function thread87(){
            			let result87accessVarRef = await function87accessVarRef();
			queue84.push(result87accessVarRef);
		}
		thread87();
		async function thread85(){
            			let result85accessVarRef = await function85accessVarRef();
			queue84.push(result85accessVarRef);
		}
		thread85();
		let AndJoinPopped_84_0;
		{
		AndJoinPopped_84_0 = queue84.pop();
			while (AndJoinPopped_84_0 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				AndJoinPopped_84_0 = queue84.pop();
			}
		}
		let AndJoinPopped_84_1;
		{
		AndJoinPopped_84_1 = queue84.pop();
			while (AndJoinPopped_84_1 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				AndJoinPopped_84_1 = queue84.pop();
			}
		}
		let result84finishPlus = await function84finishPlus(AndJoinPopped_84_0, AndJoinPopped_84_1);
		await function78executeAssignment2(result84finishPlus);
		sync52.push(42);
	}
	{
		fakeVar52 = sync52.pop();
		while (fakeVar52 == undefined){
			await new Promise(resolve => setTimeout(resolve, 100));
			fakeVar52 = sync52.pop();
		}
	}
	async function thread104(){
            		let result104evalBooleanConst = await function104evalBooleanConst();
		queue101.push(result104evalBooleanConst);
		let BooleanConst16_6_16_10terminate;
		BooleanConst16_6_16_10terminate = result104evalBooleanConst;
		if (BooleanConst16_6_16_10terminate == false){
			let result98evaluateConjunction2 = await function98evaluateConjunction2();
			queue100.push(result98evaluateConjunction2);
		}
	}
	thread104();
	async function thread107(){
            		let result107evalBooleanConst = await function107evalBooleanConst();
		queue101.push(result107evalBooleanConst);
		let BooleanConst16_14_16_19terminate;
		BooleanConst16_14_16_19terminate = result107evalBooleanConst;
		if (BooleanConst16_14_16_19terminate == false){
			let result99evaluateConjunction3 = await function99evaluateConjunction3();
			queue100.push(result99evaluateConjunction3);
		}
	}
	thread107();
	let AndJoinPopped_101_0;
	{
	AndJoinPopped_101_0 = queue101.pop();
		while (AndJoinPopped_101_0 == undefined){
			await new Promise(resolve => setTimeout(resolve, 100));
			AndJoinPopped_101_0 = queue101.pop();
		}
	}
	let AndJoinPopped_101_1;
	{
	AndJoinPopped_101_1 = queue101.pop();
		while (AndJoinPopped_101_1 == undefined){
			await new Promise(resolve => setTimeout(resolve, 100));
			AndJoinPopped_101_1 = queue101.pop();
		}
	}
	let BooleanConst16_6_16_10terminate;
	BooleanConst16_6_16_10terminate = AndJoinPopped_101_0;
	let BooleanConst16_14_16_19terminate;
	BooleanConst16_14_16_19terminate = AndJoinPopped_101_1;
	if (BooleanConst16_6_16_10terminate == true && BooleanConst16_14_16_19terminate == true){
		let result102evaluateConjunction4 = await function102evaluateConjunction4();
		queue100.push(result102evaluateConjunction4);
		let OrJoinPopped_100;
		{
		OrJoinPopped_100 = queue100.pop();
			while (OrJoinPopped_100 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				OrJoinPopped_100 = queue100.pop();
			}
		}
		await function92executeAssignment2(OrJoinPopped_100);
	}
}
main();
