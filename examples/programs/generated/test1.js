
class Void{}
let sigma = new Map();

async function function3perioStart(){
	console.log("	function3perioStart started");
	sigma.set("Perio0_0_2_1blocTrigger", undefined);
	sigma.set("Perio0_0_2_1blocTrigger", 1000);
}
async function functioninit31Timer(){
	console.log("	functioninit31Timer started");
	await new Promise(resolve => setTimeout(resolve, 1000));
}
async function function19fugaceStmt1(){
	console.log("	function19fugaceStmt1 started");
	sigma.set("Stmt11_6_1_11fakeState", undefined);
	sigma.set("Stmt11_6_1_11fakeState", 0);
}
async function function29fugaceStmt1(){
	console.log("	function29fugaceStmt1 started");
	sigma.set("Stmt11_33_1_38fakeState", undefined);
	sigma.set("Stmt11_33_1_38fakeState", 0);
}
async function main(){
		await function3perioStart();
	var sync8 = [];
	sync8.push(42);
	flag8 = true;
	var flag8 = true;
	while(flag8){
		flag8 = false;
		{
			fakeVar8 = sync8.pop();
			while (fakeVar8 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				fakeVar8 = sync8.pop();
			}
		}
		await functioninit31Timer();
		var sync14 = [];
		async function thread9(){
            			console.log("thread9 started");
			async function thread15(){
            				console.log("thread15 started");
				await function19fugaceStmt1();
				sync14.push(42);
			}
			thread15();
			async function thread23(){
            				console.log("thread23 started");
				await function29fugaceStmt1();
				sync14.push(42);
			}
			thread23();
		}
		thread9();
		sync8.push(42);
		flag8 = true;
		{
			fakeVar14 = sync14.pop();
			while (fakeVar14 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				fakeVar14 = sync14.pop();
			}
		}
		{
			fakeVar14 = sync14.pop();
			while (fakeVar14 == undefined){
				await new Promise(resolve => setTimeout(resolve, 100));
				fakeVar14 = sync14.pop();
			}
		}
	}
	for (let v of sigma){
		console.log(v[0]+" = " + v[1]);
	}
}
main();
