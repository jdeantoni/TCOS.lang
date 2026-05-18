
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
	Variable1_0_1_101432 = 0;
	sigma.set("Variable1_0_1_10currentValue", Variable1_0_1_101432);
}
async function functioninit9Variable(){
	sigma.set("Variable2_0_2_11currentValue", undefined);
}
async function function11initializeVar(){
	let Variable2_0_2_111432;
	Variable2_0_2_111432 = 42;
	sigma.set("Variable2_0_2_11currentValue", Variable2_0_2_111432);
}
async function function18accessVarRef(){
	let VarRef4_7_4_91647;
	VarRef4_7_4_91647 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_7_4_9terminates;
	VarRef4_7_4_9terminates = VarRef4_7_4_91647;
	return VarRef4_7_4_9terminates;
}
async function function26executeAssignment2(resRight){
	let Assignment6_4_6_112622;
	Assignment6_4_6_112622 = resRight;
	sigma.set("Variable0_0_0_10currentValue", Assignment6_4_6_112622);
}
async function function32executeAssignment2(resRight){
	let Assignment7_4_7_112622;
	Assignment7_4_7_112622 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment7_4_7_112622);
}
async function function27accessVarRef(){
	let VarRef6_9_6_111647;
	VarRef6_9_6_111647 = sigma.get("Variable1_0_1_10currentValue");
	let VarRef6_9_6_11terminates;
	VarRef6_9_6_11terminates = VarRef6_9_6_111647;
	return VarRef6_9_6_11terminates;
}
async function function33accessVarRef(){
	let VarRef7_9_7_111647;
	VarRef7_9_7_111647 = sigma.get("Variable2_0_2_11currentValue");
	let VarRef7_9_7_11terminates;
	VarRef7_9_7_11terminates = VarRef7_9_7_111647;
	return VarRef7_9_7_11terminates;
}
async function main(){
		await functioninit3Variable();
	await function5initializeVar();
	await functioninit6Variable();
	await function8initializeVar();
	await functioninit9Variable();
	await function11initializeVar();
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
		let result18accessVarRef = await function18accessVarRef();
		let VarRef4_7_4_9terminate;
		VarRef4_7_4_9terminate = result18accessVarRef;
		if (VarRef4_7_4_9terminate == true){
			let result27accessVarRef = await function27accessVarRef();
			await function26executeAssignment2(result27accessVarRef);
			let result33accessVarRef = await function33accessVarRef();
			await function32executeAssignment2(result33accessVarRef);
			sync17.push(42);
			flag17 = true;
		}
		if (VarRef4_7_4_9terminate == false){
		}
	}
}
main();
