
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
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable2_0_2_10currentValue"] = new int();
}}
void function5initializeVar(){
int Variable2_0_2_101437;
Variable2_0_2_101437 = 1;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101437;
}}
void functioninit6Variable(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable4_0_4_10currentValue"] = new int();
}}
void function8initializeVar(){
int Variable4_0_4_101437;
Variable4_0_4_101437 = 3;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable4_0_4_10currentValue"]) = Variable4_0_4_101437;
}}
int function11accessVarRef(){
int VarRef8_4_8_61652;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef8_4_8_61652 = *(int*)sigma["Variable2_0_2_10currentValue"];
}int VarRef8_4_8_6terminates;
VarRef8_4_8_6terminates = VarRef8_4_8_61652;
return VarRef8_4_8_6terminates;
}
int function19accessVarRef(){
int VarRef9_9_9_111652;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef9_9_9_111652 = *(int*)sigma["Variable4_0_4_10currentValue"];
}int VarRef9_9_9_11terminates;
VarRef9_9_9_11terminates = VarRef9_9_9_111652;
return VarRef9_9_9_11terminates;
}
void function21executeAssignment2(int resRight){
int Assignment9_4_9_112627;
Assignment9_4_9_112627 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment9_4_9_112627;
}}
int function28accessVarRef(){
int VarRef11_7_11_91652;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef11_7_11_91652 = *(int*)sigma["Variable2_0_2_10currentValue"];
}int VarRef11_7_11_9terminates;
VarRef11_7_11_9terminates = VarRef11_7_11_91652;
return VarRef11_7_11_9terminates;
}
void function30executeAssignment2(int resRight){
int Assignment11_4_11_92627;
Assignment11_4_11_92627 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable4_0_4_10currentValue"]) = Assignment11_4_11_92627;
}}
int main(){
		functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	int result11accessVarRef = function11accessVarRef();
	LockingQueue<Void> synch32;
	int VarRef8_4_8_6terminate;
	VarRef8_4_8_6terminate = result11accessVarRef;
	if (VarRef8_4_8_6terminate == true){
	int result19accessVarRef = function19accessVarRef();
	function21executeAssignment2(result19accessVarRef);
	Void fakeParam32;
 	synch32.push(fakeParam32);
	}
	if (VarRef8_4_8_6terminate == false){
	int result28accessVarRef = function28accessVarRef();
	function30executeAssignment2(result28accessVarRef);
	Void fakeParam32;
 	synch32.push(fakeParam32);
	}
	Void joinPopped32;
 	synch32.waitAndPop(joinPopped32);
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}}
