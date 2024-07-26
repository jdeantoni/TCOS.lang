
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
const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable0_0_0_10currentValue"] = new int();
}
void function5initializeVar(){
int Variable0_0_0_101437;
Variable0_0_0_101437 = 1;
const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101437;
}
void functioninit6Variable(){
const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar(){
int Variable1_0_1_101437;
Variable1_0_1_101437 = 4;
const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101437;
}
int function15accessVarRef(){
int VarRef3_12_3_141652;
const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef3_12_3_141652 = *(int*)sigma["Variable0_0_0_10currentValue"];
int VarRef3_12_3_14terminates;
VarRef3_12_3_14terminates = VarRef3_12_3_141652;
return VarRef3_12_3_14terminates;
}
void function17executeAssignment2(int resRight){
int Assignment3_7_3_142627;
Assignment3_7_3_142627 = resRight;
const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment3_7_3_142627;
}
int function20accessVarRef(){
int VarRef4_12_4_141652;
const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef4_12_4_141652 = *(int*)sigma["Variable1_0_1_10currentValue"];
int VarRef4_12_4_14terminates;
VarRef4_12_4_14terminates = VarRef4_12_4_141652;
return VarRef4_12_4_14terminates;
}
void function22executeAssignment2(int resRight){
int Assignment4_7_4_142627;
Assignment4_7_4_142627 = resRight;
const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment4_7_4_142627;
}
int main(){
		functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	LockingQueue<Void> synch12;
	std::thread thread13([&](){
	int result15accessVarRef = function15accessVarRef();
	function17executeAssignment2(result15accessVarRef);
	Void fakeParam12;
 	synch12.push(fakeParam12);
	});
	thread13.detach();
	std::thread thread18([&](){
	int result20accessVarRef = function20accessVarRef();
	function22executeAssignment2(result20accessVarRef);
	Void fakeParam12;
 	synch12.push(fakeParam12);
	});
	thread18.detach();
	Void joinPopped12;
 	synch12.waitAndPop(joinPopped12);
	Void joinPopped12;
 	synch12.waitAndPop(joinPopped12);
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}}
