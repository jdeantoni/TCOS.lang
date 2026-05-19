
class Void{}
let sigma = new Map();

async function functioninit3Variable(){
	sigma.set("Variable2_0_2_10currentValue", undefined);
}
async function function5initializeVar(){
	let Variable2_0_2_101432;
	Variable2_0_2_101432 = 1;
	sigma.set("Variable2_0_2_10currentValue", Variable2_0_2_101432);
}
async function functioninit6Variable(){
	sigma.set("Variable4_0_4_10currentValue", undefined);
}
async function function8initializeVar(){
	let Variable4_0_4_101432;
	Variable4_0_4_101432 = 3;
	sigma.set("Variable4_0_4_10currentValue", Variable4_0_4_101432);
}
async function function16accessVarRef(){
	let VarRef8_4_8_61647;
	VarRef8_4_8_61647 = sigma.get("Variable2_0_2_10currentValue");
	let VarRef8_4_8_6terminates;
	VarRef8_4_8_6terminates = VarRef8_4_8_61647;
	return VarRef8_4_8_6terminates;
}
async function function24executeAssignment2(resRight){
	let Assignment9_4_9_112622;
	Assignment9_4_9_112622 = resRight;
	sigma.set("Variable2_0_2_10currentValue", Assignment9_4_9_112622);
}
async function function33executeAssignment2(resRight){
	let Assignment11_4_11_92622;
	Assignment11_4_11_92622 = resRight;
	sigma.set("Variable4_0_4_10currentValue", Assignment11_4_11_92622);
}
async function function25accessVarRef(){
	let VarRef9_9_9_111647;
	VarRef9_9_9_111647 = sigma.get("Variable4_0_4_10currentValue");
	let VarRef9_9_9_11terminates;
	VarRef9_9_9_11terminates = VarRef9_9_9_111647;
	return VarRef9_9_9_11terminates;
}
async function function34accessVarRef(){
	let VarRef11_7_11_91647;
	VarRef11_7_11_91647 = sigma.get("Variable2_0_2_10currentValue");
	let VarRef11_7_11_9terminates;
	VarRef11_7_11_9terminates = VarRef11_7_11_91647;
	return VarRef11_7_11_9terminates;
}
async function main(){
		await functioninit3Variable();
	await function5initializeVar();
	await functioninit6Variable();
	await function8initializeVar();
	let result16accessVarRef = await function16accessVarRef();
	var sync15 = [];
	let VarRef8_4_8_6terminate;
	VarRef8_4_8_6terminate = result16accessVarRef;
	if (VarRef8_4_8_6terminate == true){
		let result25accessVarRef = await function25accessVarRef();
		await function24executeAssignment2(result25accessVarRef);
		sync15.push(42);
	}
	if (VarRef8_4_8_6terminate == false){
		let result34accessVarRef = await function34accessVarRef();
		await function33executeAssignment2(result34accessVarRef);
		sync15.push(42);
	}
	{
		fakeVar15 = sync15.pop();
		while (fakeVar15 == undefined){
			await new Promise(resolve => setTimeout(resolve, 100));
			fakeVar15 = sync15.pop();
		}
	}
}
main();
