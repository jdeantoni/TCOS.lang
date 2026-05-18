
class Void{}
let sigma = new Map();

async function functioninit3Variable(){
	sigma.set("Variable0_0_0_10currentValue", undefined);
}
async function function5initializeVar(){
	let Variable0_0_0_101432;
	Variable0_0_0_101432 = 1;
	sigma.set("Variable0_0_0_10currentValue", Variable0_0_0_101432);
}
async function functioninit6Variable(){
	sigma.set("Variable1_0_1_10currentValue", undefined);
}
async function function8initializeVar(){
	let Variable1_0_1_101432;
	Variable1_0_1_101432 = 4;
	sigma.set("Variable1_0_1_10currentValue", Variable1_0_1_101432);
}
async function function15executeAssignment2(resRight){
	let Assignment3_7_3_142622;
	Assignment3_7_3_142622 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment3_7_3_142622);
}
async function function21executeAssignment2(resRight){
	let Assignment4_7_4_142622;
	Assignment4_7_4_142622 = resRight;
	sigma.set("Variable0_0_0_10currentValue", Assignment4_7_4_142622);
}
async function function16accessVarRef(){
	let VarRef3_12_3_141647;
	VarRef3_12_3_141647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef3_12_3_14terminates;
	VarRef3_12_3_14terminates = VarRef3_12_3_141647;
	return VarRef3_12_3_14terminates;
}
async function function22accessVarRef(){
	let VarRef4_12_4_141647;
	VarRef4_12_4_141647 = sigma.get("Variable1_0_1_10currentValue");
	let VarRef4_12_4_14terminates;
	VarRef4_12_4_14terminates = VarRef4_12_4_141647;
	return VarRef4_12_4_14terminates;
}
async function main(){
		await functioninit3Variable();
	await function5initializeVar();
	await functioninit6Variable();
	await function8initializeVar();
	var sync32 = [];
	async function thread12(){
            		let result16accessVarRef = await function16accessVarRef();
		await function15executeAssignment2(result16accessVarRef);
		sync32.push(42);
	}
	thread12();
	async function thread18(){
            		let result22accessVarRef = await function22accessVarRef();
		await function21executeAssignment2(result22accessVarRef);
		sync32.push(42);
	}
	thread18();
	{
		fakeVar32 = sync32.pop();
		while (fakeVar32 == undefined){
			await new Promise(resolve => setTimeout(resolve, 100));
			fakeVar32 = sync32.pop();
		}
	}
}
main();
