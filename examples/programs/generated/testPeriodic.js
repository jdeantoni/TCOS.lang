
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
async function function9periodicStart(){
	console.log("	function9periodicStart started");
	sigma.set("PeriodicBloc3_0_5_3blocTrigger", undefined);
	sigma.set("PeriodicBloc3_0_5_3blocTrigger", 1000);
}
async function function35executeAssignment2(resRight){
	console.log("	function35executeAssignment2 started");
	let Assignment7_0_7_72534;
	Assignment7_0_7_72534 = resRight;
	sigma.set("Variable1_0_1_10currentValue", Assignment7_0_7_72534);
}
async function functioninit44Timer(){
	console.log("	functioninit44Timer started");
	await new Promise(resolve => setTimeout(resolve, 1000));
}
async function function36accessVarRef(){
	console.log("	function36accessVarRef started");
	let VarRef7_5_7_71593;
	VarRef7_5_7_71593 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef7_5_7_7terminates;
	VarRef7_5_7_7terminates = VarRef7_5_7_71593;
	return VarRef7_5_7_7terminates;
}
async function function21executeAssignment2(resRight){
	console.log("	function21executeAssignment2 started");
	let Assignment4_4_4_162534;
	Assignment4_4_4_162534 = resRight;
	sigma.set("Variable0_0_0_10currentValue", Assignment4_4_4_162534);
}
async function function27finishPlus(n2, n1){
	console.log("	function27finishPlus started");
	let Plus4_9_4_164397;
	Plus4_9_4_164397 = n1;
	let Plus4_9_4_164402;
	Plus4_9_4_164402 = n2;
	let Plus4_9_4_164396;
	Plus4_9_4_164396 = Plus4_9_4_164397 + Plus4_9_4_164402;
	let Plus4_9_4_16terminates;
	Plus4_9_4_16terminates = Plus4_9_4_164396;
	return Plus4_9_4_16terminates;
}
async function function30accessVarRef(){
	console.log("	function30accessVarRef started");
	let VarRef4_13_4_151593;
	VarRef4_13_4_151593 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_13_4_15terminates;
	VarRef4_13_4_15terminates = VarRef4_13_4_151593;
	return VarRef4_13_4_15terminates;
}
async function function28accessVarRef(){
	console.log("	function28accessVarRef started");
	let VarRef4_10_4_121593;
	VarRef4_10_4_121593 = sigma.get("Variable0_0_0_10currentValue");
	let VarRef4_10_4_12terminates;
	VarRef4_10_4_12terminates = VarRef4_10_4_121593;
	return VarRef4_10_4_12terminates;
}
async function main(){
		await functioninit3Variable();
	await function5initializeVar();
	await functioninit6Variable();
	await function8initializeVar();
	await function9periodicStart();
	var sync14 = [];
	sync14.push(42);
	flag14 = true;
	var flag14 = true;
	while(flag14){
		flag14 = false;
		{
			fakeVar14 = sync14.pop();
			while (fakeVar14 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				fakeVar14 = sync14.pop();
			}
		}
		await functioninit44Timer();
		var queue27 = [];
		async function thread15(){
            			console.log("thread15 started");
			async function thread30(){
            				console.log("thread30 started");
				let result30accessVarRef = await function30accessVarRef();
				queue27.push(result30accessVarRef);
			}
			thread30();
			async function thread28(){
            				console.log("thread28 started");
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
		}
		thread15();
		sync14.push(42);
		flag14 = true;
	}
	for (let v of sigma){
		console.log(v[0]+" = " + v[1]);
	}
}
main();
