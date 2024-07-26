
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
int Variable0_0_0_101377;
Variable0_0_0_101377 = 1;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101377;
}}
void functioninit6Variable(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable1_0_1_10currentValue"] = new int();
}}
void function8initializeVar(){
int Variable1_0_1_101377;
Variable1_0_1_101377 = 4;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101377;
}}
void functioninit9Variable(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable2_0_2_10currentValue"] = new int();
}}
void function11initializeVar(){
int Variable2_0_2_101377;
Variable2_0_2_101377 = 0;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101377;
}}
void function89executeAssignment2(int resRight){
int Assignment16_0_16_202524;
Assignment16_0_16_202524 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202524;
}}
int function50accessVarRef(){
int VarRef7_4_7_61583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef7_4_7_61583 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef7_4_7_6terminates;
VarRef7_4_7_6terminates = VarRef7_4_7_61583;
return VarRef7_4_7_6terminates;
}
bool function95evaluateConjunction2(){
bool Conjunction16_5_16_20terminates;
Conjunction16_5_16_20terminates = false;
return Conjunction16_5_16_20terminates;
}
bool function96evaluateConjunction3(){
bool Conjunction16_5_16_20terminates;
Conjunction16_5_16_20terminates = false;
return Conjunction16_5_16_20terminates;
}
bool function99evaluateConjunction4(){
bool Conjunction16_5_16_20terminates;
Conjunction16_5_16_20terminates = true;
return Conjunction16_5_16_20terminates;
}
void function18executeAssignment2(int resRight){
int Assignment4_7_4_212524;
Assignment4_7_4_212524 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment4_7_4_212524;
}}
void function32executeAssignment2(int resRight){
int Assignment5_7_5_212524;
Assignment5_7_5_212524 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212524;
}}
bool function100evalBooleanConst(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["BooleanConst16_6_16_10constantValue"] = new bool(true);
}bool BooleanConst16_6_16_104606;
{const std::lock_guard<std::mutex> lock(sigma_mutex);BooleanConst16_6_16_104606 = *(bool*)sigma["BooleanConst16_6_16_10constantValue"];
}bool BooleanConst16_6_16_10terminates;
BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104606;
return BooleanConst16_6_16_10terminates;
}
bool function102evalBooleanConst(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["BooleanConst16_14_16_19constantValue"] = new bool(false);
}bool BooleanConst16_14_16_194606;
{const std::lock_guard<std::mutex> lock(sigma_mutex);BooleanConst16_14_16_194606 = *(bool*)sigma["BooleanConst16_14_16_19constantValue"];
}bool BooleanConst16_14_16_19terminates;
BooleanConst16_14_16_19terminates = BooleanConst16_14_16_194606;
return BooleanConst16_14_16_19terminates;
}
int function24finishPlus(int n2, int n1){
int Plus4_12_4_214387;
Plus4_12_4_214387 = n1;
int Plus4_12_4_214392;
Plus4_12_4_214392 = n2;
int Plus4_12_4_214386;
Plus4_12_4_214386 = Plus4_12_4_214387 + Plus4_12_4_214392;
int Plus4_12_4_21terminates;
Plus4_12_4_21terminates = Plus4_12_4_214386;
return Plus4_12_4_21terminates;
}
int function38finishPlus(int n2, int n1){
int Plus5_12_5_214387;
Plus5_12_5_214387 = n1;
int Plus5_12_5_214392;
Plus5_12_5_214392 = n2;
int Plus5_12_5_214386;
Plus5_12_5_214386 = Plus5_12_5_214387 + Plus5_12_5_214392;
int Plus5_12_5_21terminates;
Plus5_12_5_21terminates = Plus5_12_5_214386;
return Plus5_12_5_21terminates;
}
void function58executeAssignment2(int resRight){
int Assignment9_4_9_182524;
Assignment9_4_9_182524 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_182524;
}}
void function75executeAssignment2(int resRight){
int Assignment12_4_12_182524;
Assignment12_4_12_182524 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_182524;
}}
int function27accessVarRef(){
int VarRef4_18_4_201583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef4_18_4_201583 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef4_18_4_20terminates;
VarRef4_18_4_20terminates = VarRef4_18_4_201583;
return VarRef4_18_4_20terminates;
}
int function25accessVarRef(){
int VarRef4_13_4_151583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef4_13_4_151583 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef4_13_4_15terminates;
VarRef4_13_4_15terminates = VarRef4_13_4_151583;
return VarRef4_13_4_15terminates;
}
int function41accessVarRef(){
int VarRef5_18_5_201583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef5_18_5_201583 = *(int*)sigma["Variable1_0_1_10currentValue"];
}int VarRef5_18_5_20terminates;
VarRef5_18_5_20terminates = VarRef5_18_5_201583;
return VarRef5_18_5_20terminates;
}
int function39accessVarRef(){
int VarRef5_13_5_151583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef5_13_5_151583 = *(int*)sigma["Variable1_0_1_10currentValue"];
}int VarRef5_13_5_15terminates;
VarRef5_13_5_15terminates = VarRef5_13_5_151583;
return VarRef5_13_5_15terminates;
}
int function64finishPlus(int n2, int n1){
int Plus9_9_9_184387;
Plus9_9_9_184387 = n1;
int Plus9_9_9_184392;
Plus9_9_9_184392 = n2;
int Plus9_9_9_184386;
Plus9_9_9_184386 = Plus9_9_9_184387 + Plus9_9_9_184392;
int Plus9_9_9_18terminates;
Plus9_9_9_18terminates = Plus9_9_9_184386;
return Plus9_9_9_18terminates;
}
int function81finishPlus(int n2, int n1){
int Plus12_9_12_184387;
Plus12_9_12_184387 = n1;
int Plus12_9_12_184392;
Plus12_9_12_184392 = n2;
int Plus12_9_12_184386;
Plus12_9_12_184386 = Plus12_9_12_184387 + Plus12_9_12_184392;
int Plus12_9_12_18terminates;
Plus12_9_12_18terminates = Plus12_9_12_184386;
return Plus12_9_12_18terminates;
}
int function67accessVarRef(){
int VarRef9_15_9_171583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef9_15_9_171583 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef9_15_9_17terminates;
VarRef9_15_9_17terminates = VarRef9_15_9_171583;
return VarRef9_15_9_17terminates;
}
int function65accessVarRef(){
int VarRef9_10_9_121583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef9_10_9_121583 = *(int*)sigma["Variable1_0_1_10currentValue"];
}int VarRef9_10_9_12terminates;
VarRef9_10_9_12terminates = VarRef9_10_9_121583;
return VarRef9_10_9_12terminates;
}
int function84accessVarRef(){
int VarRef12_15_12_171583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef12_15_12_171583 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef12_15_12_17terminates;
VarRef12_15_12_17terminates = VarRef12_15_12_171583;
return VarRef12_15_12_17terminates;
}
int function82accessVarRef(){
int VarRef12_10_12_121583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef12_10_12_121583 = *(int*)sigma["Variable1_0_1_10currentValue"];
}int VarRef12_10_12_12terminates;
VarRef12_10_12_12terminates = VarRef12_10_12_121583;
return VarRef12_10_12_12terminates;
}
int main(){
		functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	functioninit9Variable();
	function11initializeVar();
	LockingQueue<Void> synch49;
	LockingQueue<Void> synch115;
	LockingQueue<bool> queue97;	LockingQueue<bool> queue98;	LockingQueue<int> queue24;	LockingQueue<int> queue64;	std::thread thread15([&](){
	std::thread thread27([&](){
	int result27accessVarRef = function27accessVarRef();
	queue24.push(result27accessVarRef);
	});
	thread27.detach();
	std::thread thread25([&](){
	int result25accessVarRef = function25accessVarRef();
	queue24.push(result25accessVarRef);
	});
	thread25.detach();
	int AndJoinPopped_24_0;
	queue24.waitAndPop(AndJoinPopped_24_0);
	int AndJoinPopped_24_1;
	queue24.waitAndPop(AndJoinPopped_24_1);
	int result24finishPlus = function24finishPlus(AndJoinPopped_24_0, AndJoinPopped_24_1);
	function18executeAssignment2(result24finishPlus);
	Void fakeParam115;
 	synch115.push(fakeParam115);
	});
	thread15.detach();
	std::thread thread29([&](){
	LockingQueue<int> queue38;	std::thread thread41([&](){
	int result41accessVarRef = function41accessVarRef();
	queue38.push(result41accessVarRef);
	});
	thread41.detach();
	std::thread thread39([&](){
	int result39accessVarRef = function39accessVarRef();
	queue38.push(result39accessVarRef);
	});
	thread39.detach();
	int AndJoinPopped_38_0;
	queue38.waitAndPop(AndJoinPopped_38_0);
	int AndJoinPopped_38_1;
	queue38.waitAndPop(AndJoinPopped_38_1);
	int result38finishPlus = function38finishPlus(AndJoinPopped_38_0, AndJoinPopped_38_1);
	function32executeAssignment2(result38finishPlus);
	Void fakeParam115;
 	synch115.push(fakeParam115);
	});
	thread29.detach();
	{Void joinPopped115;
 	synch115.waitAndPop(joinPopped115);}
	int result50accessVarRef = function50accessVarRef();
	int VarRef7_4_7_6terminate;
	VarRef7_4_7_6terminate = result50accessVarRef;
	if (VarRef7_4_7_6terminate == true){
	std::thread thread67([&](){
	int result67accessVarRef = function67accessVarRef();
	queue64.push(result67accessVarRef);
	});
	thread67.detach();
	std::thread thread65([&](){
	int result65accessVarRef = function65accessVarRef();
	queue64.push(result65accessVarRef);
	});
	thread65.detach();
	int AndJoinPopped_64_0;
	queue64.waitAndPop(AndJoinPopped_64_0);
	int AndJoinPopped_64_1;
	queue64.waitAndPop(AndJoinPopped_64_1);
	int result64finishPlus = function64finishPlus(AndJoinPopped_64_0, AndJoinPopped_64_1);
	function58executeAssignment2(result64finishPlus);
	Void fakeParam49;
 	synch49.push(fakeParam49);
	}
	if (VarRef7_4_7_6terminate == false){
	LockingQueue<int> queue81;	std::thread thread84([&](){
	int result84accessVarRef = function84accessVarRef();
	queue81.push(result84accessVarRef);
	});
	thread84.detach();
	std::thread thread82([&](){
	int result82accessVarRef = function82accessVarRef();
	queue81.push(result82accessVarRef);
	});
	thread82.detach();
	int AndJoinPopped_81_0;
	queue81.waitAndPop(AndJoinPopped_81_0);
	int AndJoinPopped_81_1;
	queue81.waitAndPop(AndJoinPopped_81_1);
	int result81finishPlus = function81finishPlus(AndJoinPopped_81_0, AndJoinPopped_81_1);
	function75executeAssignment2(result81finishPlus);
	Void fakeParam49;
 	synch49.push(fakeParam49);
	}
	{Void joinPopped49;
 	synch49.waitAndPop(joinPopped49);}
	std::thread thread100([&](){
	bool result100evalBooleanConst = function100evalBooleanConst();
	queue98.push(result100evalBooleanConst);
	bool BooleanConst16_6_16_10terminate;
	BooleanConst16_6_16_10terminate = result100evalBooleanConst;
	if (BooleanConst16_6_16_10terminate == false){
	bool result95evaluateConjunction2 = function95evaluateConjunction2();
	queue97.push(result95evaluateConjunction2);
	}
	});
	thread100.detach();
	std::thread thread102([&](){
	bool result102evalBooleanConst = function102evalBooleanConst();
	queue98.push(result102evalBooleanConst);
	bool BooleanConst16_14_16_19terminate;
	BooleanConst16_14_16_19terminate = result102evalBooleanConst;
	if (BooleanConst16_14_16_19terminate == false){
	bool result96evaluateConjunction3 = function96evaluateConjunction3();
	queue97.push(result96evaluateConjunction3);
	}
	});
	thread102.detach();
	bool AndJoinPopped_98_0;
	queue98.waitAndPop(AndJoinPopped_98_0);
	bool AndJoinPopped_98_1;
	queue98.waitAndPop(AndJoinPopped_98_1);
	bool BooleanConst16_6_16_10terminate;
	BooleanConst16_6_16_10terminate = AndJoinPopped_98_0;
	bool BooleanConst16_14_16_19terminate;
	BooleanConst16_14_16_19terminate = AndJoinPopped_98_1;
	if (BooleanConst16_6_16_10terminate == true && BooleanConst16_14_16_19terminate == true){
	bool result99evaluateConjunction4 = function99evaluateConjunction4();
	queue97.push(result99evaluateConjunction4);
	bool OrJoinPopped_97;
	queue97.waitAndPop(OrJoinPopped_97);
	function89executeAssignment2(OrJoinPopped_97);
	}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}}
