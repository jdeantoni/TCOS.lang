
        #include <string>
        #include <unordered_map>
        #include <thread>
        #include <mutex>
        #include <iostream>
        #include <chrono>
        #include "../utils/LockingQueue.hpp"
        
        using namespace std::chrono_literals;
        
        #define DEBUG 1
            
        class Void{
        };
        
        std::unordered_map<std::string, void*> sigma;
        std::mutex sigma_mutex;  // protects sigma
        
        void functioninit3Variable(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable0_0_0_10currentValue"] = new int();
}}
void function5initializeVar(){
int Variable0_0_0_101381;
Variable0_0_0_101381 = 1;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101381;
}}
void functioninit6Variable(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable1_0_1_10currentValue"] = new int();
}}
void function8initializeVar(){
int Variable1_0_1_101381;
Variable1_0_1_101381 = 4;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101381;
}}
void functioninit9Variable(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable2_0_2_10currentValue"] = new int();
}}
void function11initializeVar(){
int Variable2_0_2_101381;
Variable2_0_2_101381 = 0;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101381;
}}
int function21accessVarRef(){
int VarRef4_18_4_201587;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef4_18_4_201587 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef4_18_4_20terminates;
VarRef4_18_4_20terminates = VarRef4_18_4_201587;
return VarRef4_18_4_20terminates;
}
int function23accessVarRef(){
int VarRef4_13_4_151587;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef4_13_4_151587 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef4_13_4_15terminates;
VarRef4_13_4_15terminates = VarRef4_13_4_151587;
return VarRef4_13_4_15terminates;
}
int function25finishPlus(int n2, int n1){
int Plus4_12_4_214247 = n2;int Plus4_12_4_214272 = n1;int Plus4_12_4_214391;
Plus4_12_4_214391 = n1;
int Plus4_12_4_214396;
Plus4_12_4_214396 = n2;
int Plus4_12_4_214390;
Plus4_12_4_214390 = Plus4_12_4_214391 + Plus4_12_4_214396;
int Plus4_12_4_21terminates;
Plus4_12_4_21terminates = Plus4_12_4_214390;
return Plus4_12_4_21terminates;
}
void function26executeAssignment2(int resRight){
int Assignment4_7_4_212528;
Assignment4_7_4_212528 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment4_7_4_212528;
}}
int function32accessVarRef(){
int VarRef5_18_5_201587;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef5_18_5_201587 = *(int*)sigma["Variable1_0_1_10currentValue"];
}int VarRef5_18_5_20terminates;
VarRef5_18_5_20terminates = VarRef5_18_5_201587;
return VarRef5_18_5_20terminates;
}
int function34accessVarRef(){
int VarRef5_13_5_151587;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef5_13_5_151587 = *(int*)sigma["Variable1_0_1_10currentValue"];
}int VarRef5_13_5_15terminates;
VarRef5_13_5_15terminates = VarRef5_13_5_151587;
return VarRef5_13_5_15terminates;
}
int function36finishPlus(int n2, int n1){
int Plus5_12_5_214247 = n2;int Plus5_12_5_214272 = n1;int Plus5_12_5_214391;
Plus5_12_5_214391 = n1;
int Plus5_12_5_214396;
Plus5_12_5_214396 = n2;
int Plus5_12_5_214390;
Plus5_12_5_214390 = Plus5_12_5_214391 + Plus5_12_5_214396;
int Plus5_12_5_21terminates;
Plus5_12_5_21terminates = Plus5_12_5_214390;
return Plus5_12_5_21terminates;
}
void function37executeAssignment2(int resRight){
int Assignment5_7_5_212528;
Assignment5_7_5_212528 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212528;
}}
int function41accessVarRef(){
int VarRef7_4_7_61587;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef7_4_7_61587 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef7_4_7_6terminates;
VarRef7_4_7_6terminates = VarRef7_4_7_61587;
return VarRef7_4_7_6terminates;
}
int function52accessVarRef(){
int VarRef9_15_9_171587;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef9_15_9_171587 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef9_15_9_17terminates;
VarRef9_15_9_17terminates = VarRef9_15_9_171587;
return VarRef9_15_9_17terminates;
}
int function54accessVarRef(){
int VarRef9_10_9_121587;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef9_10_9_121587 = *(int*)sigma["Variable1_0_1_10currentValue"];
}int VarRef9_10_9_12terminates;
VarRef9_10_9_12terminates = VarRef9_10_9_121587;
return VarRef9_10_9_12terminates;
}
int function56finishPlus(int n2, int n1){
int Plus9_9_9_184247 = n2;int Plus9_9_9_184272 = n1;int Plus9_9_9_184391;
Plus9_9_9_184391 = n1;
int Plus9_9_9_184396;
Plus9_9_9_184396 = n2;
int Plus9_9_9_184390;
Plus9_9_9_184390 = Plus9_9_9_184391 + Plus9_9_9_184396;
int Plus9_9_9_18terminates;
Plus9_9_9_18terminates = Plus9_9_9_184390;
return Plus9_9_9_18terminates;
}
void function57executeAssignment2(int resRight){
int Assignment9_4_9_182528;
Assignment9_4_9_182528 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_182528;
}}
int function67accessVarRef(){
int VarRef12_15_12_171587;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef12_15_12_171587 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef12_15_12_17terminates;
VarRef12_15_12_17terminates = VarRef12_15_12_171587;
return VarRef12_15_12_17terminates;
}
int function69accessVarRef(){
int VarRef12_10_12_121587;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef12_10_12_121587 = *(int*)sigma["Variable1_0_1_10currentValue"];
}int VarRef12_10_12_12terminates;
VarRef12_10_12_12terminates = VarRef12_10_12_121587;
return VarRef12_10_12_12terminates;
}
int function71finishPlus(int n2, int n1){
int Plus12_9_12_184247 = n2;int Plus12_9_12_184272 = n1;int Plus12_9_12_184391;
Plus12_9_12_184391 = n1;
int Plus12_9_12_184396;
Plus12_9_12_184396 = n2;
int Plus12_9_12_184390;
Plus12_9_12_184390 = Plus12_9_12_184391 + Plus12_9_12_184396;
int Plus12_9_12_18terminates;
Plus12_9_12_18terminates = Plus12_9_12_184390;
return Plus12_9_12_18terminates;
}
void function72executeAssignment2(int resRight){
int Assignment12_4_12_182528;
Assignment12_4_12_182528 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_182528;
}}
bool function81evalBooleanConst(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["BooleanConst16_6_16_10constantValue"] = new bool();
}{const std::lock_guard<std::mutex> lock(sigma_mutex);*((bool*)sigma["BooleanConst16_6_16_10constantValue"]) = true;
}bool BooleanConst16_6_16_104610;
{const std::lock_guard<std::mutex> lock(sigma_mutex);BooleanConst16_6_16_104610 = *(bool*)sigma["BooleanConst16_6_16_10constantValue"];
}bool BooleanConst16_6_16_10terminates;
BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104610;
return BooleanConst16_6_16_10terminates;
}
bool function83evalBooleanConst(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["BooleanConst16_14_16_19constantValue"] = new bool();
}{const std::lock_guard<std::mutex> lock(sigma_mutex);*((bool*)sigma["BooleanConst16_14_16_19constantValue"]) = false;
}bool BooleanConst16_14_16_194610;
{const std::lock_guard<std::mutex> lock(sigma_mutex);BooleanConst16_14_16_194610 = *(bool*)sigma["BooleanConst16_14_16_19constantValue"];
}bool BooleanConst16_14_16_19terminates;
BooleanConst16_14_16_19terminates = BooleanConst16_14_16_194610;
return BooleanConst16_14_16_19terminates;
}
bool function85evaluateConjunction2(){
bool Conjunction16_5_16_20terminates;
Conjunction16_5_16_20terminates = false;
return Conjunction16_5_16_20terminates;
}
bool function86evaluateConjunction3(){
bool Conjunction16_5_16_20terminates;
Conjunction16_5_16_20terminates = false;
return Conjunction16_5_16_20terminates;
}
bool function88evaluateConjunction4(){
bool Conjunction16_5_16_20terminates;
Conjunction16_5_16_20terminates = true;
return Conjunction16_5_16_20terminates;
}
void function89executeAssignment2(int resRight){
int Assignment16_0_16_202528;
Assignment16_0_16_202528 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202528;
}}
int main(){
		functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	functioninit9Variable();
	function11initializeVar();
	LockingQueue<int> queue25;	LockingQueue<Void> synch15;
	LockingQueue<int> queue56;	LockingQueue<Void> synch74;
	LockingQueue<bool> queue79;	LockingQueue<bool> queue87;	std::thread thread16([&](){
	std::thread thread21([&](){
	int result21accessVarRef = function21accessVarRef();
	queue25.push(result21accessVarRef);
	});
	thread21.detach();
	std::thread thread23([&](){
	int result23accessVarRef = function23accessVarRef();
	queue25.push(result23accessVarRef);
	});
	thread23.detach();
	int AndJoinPopped_25_0;
	queue25.waitAndPop(AndJoinPopped_25_0);
	int AndJoinPopped_25_1;
	queue25.waitAndPop(AndJoinPopped_25_1);
	int result25finishPlus = function25finishPlus(AndJoinPopped_25_0, AndJoinPopped_25_1);
	function26executeAssignment2(result25finishPlus);
	Void fakeParam15;
 	synch15.push(fakeParam15);
	});
	thread16.detach();
	std::thread thread27([&](){
	LockingQueue<int> queue36;	std::thread thread32([&](){
	int result32accessVarRef = function32accessVarRef();
	queue36.push(result32accessVarRef);
	});
	thread32.detach();
	std::thread thread34([&](){
	int result34accessVarRef = function34accessVarRef();
	queue36.push(result34accessVarRef);
	});
	thread34.detach();
	int AndJoinPopped_36_0;
	queue36.waitAndPop(AndJoinPopped_36_0);
	int AndJoinPopped_36_1;
	queue36.waitAndPop(AndJoinPopped_36_1);
	int result36finishPlus = function36finishPlus(AndJoinPopped_36_0, AndJoinPopped_36_1);
	function37executeAssignment2(result36finishPlus);
	Void fakeParam15;
 	synch15.push(fakeParam15);
	});
	thread27.detach();
	{Void joinPopped15;
 	synch15.waitAndPop(joinPopped15);}
	{Void joinPopped15;
 	synch15.waitAndPop(joinPopped15);}
	int result41accessVarRef = function41accessVarRef();
	int VarRef7_4_7_6terminate;
	VarRef7_4_7_6terminate = result41accessVarRef;
	if (VarRef7_4_7_6terminate == true){
	std::thread thread52([&](){
	int result52accessVarRef = function52accessVarRef();
	queue56.push(result52accessVarRef);
	});
	thread52.detach();
	std::thread thread54([&](){
	int result54accessVarRef = function54accessVarRef();
	queue56.push(result54accessVarRef);
	});
	thread54.detach();
	int AndJoinPopped_56_0;
	queue56.waitAndPop(AndJoinPopped_56_0);
	int AndJoinPopped_56_1;
	queue56.waitAndPop(AndJoinPopped_56_1);
	int result56finishPlus = function56finishPlus(AndJoinPopped_56_0, AndJoinPopped_56_1);
	function57executeAssignment2(result56finishPlus);
	Void fakeParam74;
 	synch74.push(fakeParam74);
	}
	if (VarRef7_4_7_6terminate == false){
	LockingQueue<int> queue71;	std::thread thread67([&](){
	int result67accessVarRef = function67accessVarRef();
	queue71.push(result67accessVarRef);
	});
	thread67.detach();
	std::thread thread69([&](){
	int result69accessVarRef = function69accessVarRef();
	queue71.push(result69accessVarRef);
	});
	thread69.detach();
	int AndJoinPopped_71_0;
	queue71.waitAndPop(AndJoinPopped_71_0);
	int AndJoinPopped_71_1;
	queue71.waitAndPop(AndJoinPopped_71_1);
	int result71finishPlus = function71finishPlus(AndJoinPopped_71_0, AndJoinPopped_71_1);
	function72executeAssignment2(result71finishPlus);
	Void fakeParam74;
 	synch74.push(fakeParam74);
	}
	{Void joinPopped74;
 	synch74.waitAndPop(joinPopped74);}
	std::thread thread81([&](){
	bool result81evalBooleanConst = function81evalBooleanConst();
	queue87.push(result81evalBooleanConst);
	bool BooleanConst16_6_16_10terminate;
	BooleanConst16_6_16_10terminate = result81evalBooleanConst;
	if (BooleanConst16_6_16_10terminate == false){
	bool result85evaluateConjunction2 = function85evaluateConjunction2();
	queue79.push(result85evaluateConjunction2);
	}
	});
	thread81.detach();
	std::thread thread83([&](){
	bool result83evalBooleanConst = function83evalBooleanConst();
	queue87.push(result83evalBooleanConst);
	bool BooleanConst16_14_16_19terminate;
	BooleanConst16_14_16_19terminate = result83evalBooleanConst;
	if (BooleanConst16_14_16_19terminate == false){
	bool result86evaluateConjunction3 = function86evaluateConjunction3();
	queue79.push(result86evaluateConjunction3);
	}
	});
	thread83.detach();
	bool AndJoinPopped_87_0;
	queue87.waitAndPop(AndJoinPopped_87_0);
	bool AndJoinPopped_87_1;
	queue87.waitAndPop(AndJoinPopped_87_1);
	bool BooleanConst16_6_16_10terminate;
	BooleanConst16_6_16_10terminate = AndJoinPopped_87_0;
	bool BooleanConst16_14_16_19terminate;
	BooleanConst16_14_16_19terminate = AndJoinPopped_87_1;
	if (BooleanConst16_6_16_10terminate == true && BooleanConst16_14_16_19terminate == true){
	bool result88evaluateConjunction4 = function88evaluateConjunction4();
	queue79.push(result88evaluateConjunction4);
	}
	bool OrJoinPopped_79;
	queue79.waitAndPop(OrJoinPopped_79);
	function89executeAssignment2(OrJoinPopped_79);
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}}
