
        #include <string>
        #include <unordered_map>
        #include <thread>
        #include <mutex>
        #include <iostream>
        #include <chrono>
        #include "../utils/LockingQueue.hpp"
        
        using namespace std::chrono_literals;
        
        class Void{
        };
        
        std::unordered_map<std::string, void*> sigma;
        std::mutex sigma_mutex;  // protects sigma
        
        void functioninit3Variable(){
sigma["Variable0_0_0_10currentValue"] = new int();
}
void function5initializeVar(){
int Variable0_0_0_101437;
Variable0_0_0_101437 = 1;
*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101437;
}
void functioninit6Variable(){
sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar(){
int Variable1_0_1_101437;
Variable1_0_1_101437 = 0;
*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101437;
}
void function9periodicStart(){
sigma["PeriodicBloc3_0_5_3blocTrigger"] = new int1000();
}
void functionstarts11blocTrigger(){
std::this_thread::sleep_for(1000ms);}
int function22accessVarRef(){
int VarRef4_13_4_151652;
VarRef4_13_4_151652 = *(int*)sigma["Variable0_0_0_10currentValue"];
int VarRef4_13_4_15terminates;
VarRef4_13_4_15terminates = VarRef4_13_4_151652;
return VarRef4_13_4_15terminates;
}
int function24accessVarRef(){
int VarRef4_10_4_121652;
VarRef4_10_4_121652 = *(int*)sigma["Variable0_0_0_10currentValue"];
int VarRef4_10_4_12terminates;
VarRef4_10_4_12terminates = VarRef4_10_4_121652;
return VarRef4_10_4_12terminates;
}
int function26finishPlus(int n2, int n1){
int Plus4_9_4_164398 = n2;int Plus4_9_4_164423 = n1;int Plus4_9_4_164544;
Plus4_9_4_164544 = n1;
int Plus4_9_4_164549;
Plus4_9_4_164549 = n2;
Plus4_9_4_164543 undefined;
Plus4_9_4_164543 = Plus4_9_4_164544 + Plus4_9_4_164549;
int Plus4_9_4_16terminates;
Plus4_9_4_16terminates = Plus4_9_4_164543;
return Plus4_9_4_16terminates;
}
void function27executeAssignment2(int resRight){
int Assignment4_4_4_162627;
Assignment4_4_4_162627 = resRight;
*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment4_4_4_162627;
}
int function32accessVarRef(){
int VarRef7_5_7_71652;
VarRef7_5_7_71652 = *(int*)sigma["Variable0_0_0_10currentValue"];
int VarRef7_5_7_7terminates;
VarRef7_5_7_7terminates = VarRef7_5_7_71652;
return VarRef7_5_7_7terminates;
}
void function34executeAssignment2(int resRight){
int Assignment7_0_7_72627;
Assignment7_0_7_72627 = resRight;
*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment7_0_7_72627;
}
int main(){
		functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	function9periodicStart();
	lockingQueue<Void> synch29;
	Void fakeParam29;
 	synch29.push(fakeParam29);
	goto flag29;
	flag29 :
	Void joinPopped29;
 	synch29.waitAndPop(joinPopped29);
	functionstarts11blocTrigger();
	LockingQueue<int> queue26;	std::thread thread14([&](){
	std::thread thread22([&](){
	int result22accessVarRef = function22accessVarRef();
	queue26.push(result22accessVarRef);
	});
	thread22.detach();
	std::thread thread24([&](){
	int result24accessVarRef = function24accessVarRef();
	queue26.push(result24accessVarRef);
	});
	thread24.detach();
	int AndJoinPopped_26_0;
	queue26.waitAndPop(AndJoinPopped_26_0);
	int AndJoinPopped_26_1;
	queue26.waitAndPop(AndJoinPopped_26_1);
	int result26finishPlus = function26finishPlus(AndJoinPopped_26_0, AndJoinPopped_26_1);
	function27executeAssignment2(result26finishPlus);
	});
	thread14.detach();
	Void fakeParam29;
 	synch29.push(fakeParam29);
	goto flag29;
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}}
