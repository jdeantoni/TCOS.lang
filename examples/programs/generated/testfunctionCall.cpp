
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
        
        void functioninit21Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable8_0_8_10currentValue"] = new int();}
}
void function23initializeVar(){
	int Variable8_0_8_101432;
	Variable8_0_8_101432 = 0;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable8_0_8_10currentValue"]) = Variable8_0_8_101432;}
}
int function28accessVarRef(){
	int VarRef9_3_9_51647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef9_3_9_51647 = *(int*)sigma["Variable8_0_8_10currentValue"];}
	int VarRef9_3_9_5terminates;
	VarRef9_3_9_5terminates = VarRef9_3_9_51647;
	return VarRef9_3_9_5terminates;
}
void functioninit9Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable1_4_1_14currentValue"] = new int();}
}
void function11initializeVar(){
	int Variable1_4_1_141432;
	Variable1_4_1_141432 = 1;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_4_1_14currentValue"]) = Variable1_4_1_141432;}
}
void functioninit12Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable2_4_2_14currentValue"] = new int();}
}
void function14initializeVar(){
	int Variable2_4_2_141432;
	Variable2_4_2_141432 = 0;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_4_2_14currentValue"]) = Variable2_4_2_141432;}
}
void function18executeAssignment2(int resRight){
	int Assignment3_4_3_112622;
	Assignment3_4_3_112622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_4_2_14currentValue"]) = Assignment3_4_3_112622;}
}
int function19accessVarRef(){
	int VarRef3_9_3_111647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef3_9_3_111647 = *(int*)sigma["Variable1_4_1_14currentValue"];}
	int VarRef3_9_3_11terminates;
	VarRef3_9_3_11terminates = VarRef3_9_3_111647;
	return VarRef3_9_3_11terminates;
}
int main(){
		functioninit21Variable();
	function23initializeVar();
	int result28accessVarRef = function28accessVarRef();
	functioninit9Variable();
	function11initializeVar();
	functioninit12Variable();
	function14initializeVar();
	int result19accessVarRef = function19accessVarRef();
	function18executeAssignment2(result19accessVarRef);
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
