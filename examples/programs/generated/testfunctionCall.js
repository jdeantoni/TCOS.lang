
class Void{}
let sigma = new Map();

async function functioninit21Variable(){
	sigma.set("Variable8_0_8_10currentValue", undefined);
}
async function function23initializeVar(){
	let Variable8_0_8_101432;
	Variable8_0_8_101432 = 0;
	sigma.set("Variable8_0_8_10currentValue", Variable8_0_8_101432);
}
async function function28accessVarRef(){
	let VarRef9_3_9_51647;
	VarRef9_3_9_51647 = sigma.get("Variable8_0_8_10currentValue");
	let VarRef9_3_9_5terminates;
	VarRef9_3_9_5terminates = VarRef9_3_9_51647;
	return VarRef9_3_9_5terminates;
}
async function functioninit9Variable(){
	sigma.set("Variable1_4_1_14currentValue", undefined);
}
async function function11initializeVar(){
	let Variable1_4_1_141432;
	Variable1_4_1_141432 = 1;
	sigma.set("Variable1_4_1_14currentValue", Variable1_4_1_141432);
}
async function functioninit12Variable(){
	sigma.set("Variable2_4_2_14currentValue", undefined);
}
async function function14initializeVar(){
	let Variable2_4_2_141432;
	Variable2_4_2_141432 = 0;
	sigma.set("Variable2_4_2_14currentValue", Variable2_4_2_141432);
}
async function function18executeAssignment2(resRight){
	let Assignment3_4_3_112622;
	Assignment3_4_3_112622 = resRight;
	sigma.set("Variable2_4_2_14currentValue", Assignment3_4_3_112622);
}
async function function19accessVarRef(){
	let VarRef3_9_3_111647;
	VarRef3_9_3_111647 = sigma.get("Variable1_4_1_14currentValue");
	let VarRef3_9_3_11terminates;
	VarRef3_9_3_11terminates = VarRef3_9_3_111647;
	return VarRef3_9_3_11terminates;
}
async function main(){
		await functioninit21Variable();
	await function23initializeVar();
	let result28accessVarRef = await function28accessVarRef();
	await functioninit9Variable();
	await function11initializeVar();
	await functioninit12Variable();
	await function14initializeVar();
	let result19accessVarRef = await function19accessVarRef();
	await function18executeAssignment2(result19accessVarRef);
}
main();
