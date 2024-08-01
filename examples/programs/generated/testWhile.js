
class Void{}
let sigma = new Map();

async function functioninit3Variable(){
	console.log("	functioninit3Variable started");
	sigma.set("Variable0_0_0_10currentValue", undefined);
}
async function function5initializeVar(){
	console.log("	function5initializeVar started");
	let Variable0_0_0_101387;
	Variable0_0_0_101387 = 1;
	sigma.set("Variable0_0_0_10currentValue", Variable0_0_0_101387);
}
async function functioninit6Variable(){
	console.log("	functioninit6Variable started");
	sigma.set("Variable1_0_1_10currentValue", undefined);
}
async function function8initializeVar(){
	console.log("	function8initializeVar started");
	let Variable1_0_1_101387;
	Variable1_0_1_101387 = 0;
	sigma.set("Variable1_0_1_10currentValue", Variable1_0_1_101387);
}
async function functioninit9Variable(){
	console.log("	functioninit9Variable started");
	sigma.set("Variable2_0_2_11currentValue", undefined);
}
async function function11initializeVar(){
	console.log("	function11initializeVar started");
	let Variable2_0_2_111387;
	Variable2_0_2_111387 = 42;
	sigma.set("Variable2_0_2_11currentValue", Variable2_0_2_111387);
}
async function function18accessVarRef(){
	console.log("	function18accessVarRef started");
	let VarRef4_7_4_91593;
	VarRef4_7_4_91593 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_7_4_9terminates;
	VarRef4_7_4_9terminates = VarRef4_7_4_91593;
	return VarRef4_7_4_9terminates;
}
async function function26executeAssignment2(resRight){
	console.log("	function26executeAssignment2 started");
	let Assignment6_4_6_112534;
	Assignment6_4_6_112534 = resRight;
	sigma.set("Variable0_0_0_10currentValue", Assignment6_4_6_112534);
}
async function function32executeAssignment2(resRight){
	console.log("	function32executeAssignment2 started");
	let Assignment7_4_7_112534;
	Assignment7_4_7_112534 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment7_4_7_112534);
}
async function function27accessVarRef(){
	console.log("	function27accessVarRef started");
	let VarRef6_9_6_111593;
	VarRef6_9_6_111593 = sigma.get("Variable1_0_1_10currentValue");
	let VarRef6_9_6_11terminates;
	VarRef6_9_6_11terminates = VarRef6_9_6_111593;
	return VarRef6_9_6_11terminates;
}
async function function33accessVarRef(){
	console.log("	function33accessVarRef started");
	let VarRef7_9_7_111593;
	VarRef7_9_7_111593 = sigma.get("Variable2_0_2_11currentValue");
	let VarRef7_9_7_11terminates;
	VarRef7_9_7_11terminates = VarRef7_9_7_111593;
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
			console.log("(VarRef4_7_4_9terminate == true) is TRUE");
			let result27accessVarRef = await function27accessVarRef();
			await function26executeAssignment2(result27accessVarRef);
			let result33accessVarRef = await function33accessVarRef();
			await function32executeAssignment2(result33accessVarRef);
			sync17.push(42);
			flag17 = true;
		}
		if (VarRef4_7_4_9terminate == false){
			console.log("(VarRef4_7_4_9terminate == false) is TRUE");
		}
	}
	for (let v of sigma){
		console.log(v[0]+" = " + v[1]);
	}
}
main();
