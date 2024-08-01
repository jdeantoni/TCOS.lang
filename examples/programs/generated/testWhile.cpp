
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
std::cout << "	functioninit3Variable started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable0_0_0_10currentValue"] = new int();}
}
void function5initializeVar(){
std::cout << "	function5initializeVar started" << std::endl;
	int Variable0_0_0_101387;
	Variable0_0_0_101387 = 1;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101387;}
}
void functioninit6Variable(){
std::cout << "	functioninit6Variable started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable1_0_1_10currentValue"] = new int();}
}
void function8initializeVar(){
std::cout << "	function8initializeVar started" << std::endl;
	int Variable1_0_1_101387;
	Variable1_0_1_101387 = 0;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101387;}
}
void functioninit9Variable(){
std::cout << "	functioninit9Variable started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable2_0_2_11currentValue"] = new int();}
}
void function11initializeVar(){
std::cout << "	function11initializeVar started" << std::endl;
	int Variable2_0_2_111387;
	Variable2_0_2_111387 = 42;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_0_2_11currentValue"]) = Variable2_0_2_111387;}
}
int function18accessVarRef(){
std::cout << "	function18accessVarRef started" << std::endl;
	int VarRef4_7_4_91593;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_7_4_91593 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_7_4_9terminates;
	VarRef4_7_4_9terminates = VarRef4_7_4_91593;
	return VarRef4_7_4_9terminates;
}
void function26executeAssignment2(int resRight){
std::cout << "	function26executeAssignment2 started" << std::endl;
	int Assignment6_4_6_112534;
	Assignment6_4_6_112534 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment6_4_6_112534;}
}
void function32executeAssignment2(int resRight){
std::cout << "	function32executeAssignment2 started" << std::endl;
	int Assignment7_4_7_112534;
	Assignment7_4_7_112534 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment7_4_7_112534;}
}
int function27accessVarRef(){
std::cout << "	function27accessVarRef started" << std::endl;
	int VarRef6_9_6_111593;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef6_9_6_111593 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef6_9_6_11terminates;
	VarRef6_9_6_11terminates = VarRef6_9_6_111593;
	return VarRef6_9_6_11terminates;
}
int function33accessVarRef(){
std::cout << "	function33accessVarRef started" << std::endl;
	int VarRef7_9_7_111593;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef7_9_7_111593 = *(int*)sigma["Variable2_0_2_11currentValue"];}
	int VarRef7_9_7_11terminates;
	VarRef7_9_7_11terminates = VarRef7_9_7_111593;
	return VarRef7_9_7_11terminates;
}
int main(){
		functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	functioninit9Variable();
	function11initializeVar();
	bool flag17 = true;
	LockingQueue<Void> synch17;
	{Void fakeParam17;
 	synch17.push(fakeParam17);}
	flag17 = true;
	flag17= true;
while (flag17 == true){
	flag17 = false;
		{Void joinPopped17;
 		synch17.waitAndPop(joinPopped17);}
		int result18accessVarRef = function18accessVarRef();
		int VarRef4_7_4_9terminate;
		VarRef4_7_4_9terminate = result18accessVarRef;
		if (VarRef4_7_4_9terminate == true){
		std::cout << "(VarRef4_7_4_9terminate == true) is TRUE" << std::endl;
			int result27accessVarRef = function27accessVarRef();
			function26executeAssignment2(result27accessVarRef);
			int result33accessVarRef = function33accessVarRef();
			function32executeAssignment2(result33accessVarRef);
			{Void fakeParam17;
 			synch17.push(fakeParam17);}
			flag17 = true;
		}
		if (VarRef4_7_4_9terminate == false){
		std::cout << "(VarRef4_7_4_9terminate == false) is TRUE" << std::endl;
		}
	}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
