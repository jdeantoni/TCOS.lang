
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
void function15executeAssignment2(int resRight){
int Assignment3_7_3_142524;
Assignment3_7_3_142524 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment3_7_3_142524;
}}
void function21executeAssignment2(int resRight){
int Assignment4_7_4_142524;
Assignment4_7_4_142524 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment4_7_4_142524;
}}
int function16accessVarRef(){
int VarRef3_12_3_141583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef3_12_3_141583 = *(int*)sigma["Variable0_0_0_10currentValue"];
}int VarRef3_12_3_14terminates;
VarRef3_12_3_14terminates = VarRef3_12_3_141583;
return VarRef3_12_3_14terminates;
}
int function22accessVarRef(){
int VarRef4_12_4_141583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef4_12_4_141583 = *(int*)sigma["Variable1_0_1_10currentValue"];
}int VarRef4_12_4_14terminates;
VarRef4_12_4_14terminates = VarRef4_12_4_141583;
return VarRef4_12_4_14terminates;
}
int main(){
		functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	LockingQueue<Void> synch32;
	std::thread thread12([&](){
	int result16accessVarRef = function16accessVarRef();
	function15executeAssignment2(result16accessVarRef);
	Void fakeParam32;
 	synch32.push(fakeParam32);
	});
	thread12.detach();
	std::thread thread18([&](){
	int result22accessVarRef = function22accessVarRef();
	function21executeAssignment2(result22accessVarRef);
	Void fakeParam32;
 	synch32.push(fakeParam32);
	});
	thread18.detach();
	{Void joinPopped32;
 	synch32.waitAndPop(joinPopped32);}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}}
