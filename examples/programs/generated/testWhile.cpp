
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
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable0_0_0_10currentValue"] = new int();}
}
void function5initializeVar(){
int Variable0_0_0_101377;
Variable0_0_0_101377 = 1;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101377;}
}
void functioninit6Variable(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable1_0_1_10currentValue"] = new int();}
}
void function8initializeVar(){
int Variable1_0_1_101377;
Variable1_0_1_101377 = 0;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101377;}
}
void functioninit9Variable(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Variable2_0_2_11currentValue"] = new int();}
}
void function11initializeVar(){
int Variable2_0_2_111377;
Variable2_0_2_111377 = 42;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable2_0_2_11currentValue"]) = Variable2_0_2_111377;}
}
int function18accessVarRef(){
int VarRef4_7_4_91583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef4_7_4_91583 = *(int*)sigma["Variable0_0_0_10currentValue"];}
int VarRef4_7_4_9terminates;
VarRef4_7_4_9terminates = VarRef4_7_4_91583;
return VarRef4_7_4_9terminates;
}
void function26executeAssignment2(int resRight){
int Assignment6_4_6_112524;
Assignment6_4_6_112524 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment6_4_6_112524;}
}
void function32executeAssignment2(int resRight){
int Assignment7_4_7_112524;
Assignment7_4_7_112524 = resRight;
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment7_4_7_112524;}
}
int function27accessVarRef(){
int VarRef6_9_6_111583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef6_9_6_111583 = *(int*)sigma["Variable1_0_1_10currentValue"];}
int VarRef6_9_6_11terminates;
VarRef6_9_6_11terminates = VarRef6_9_6_111583;
return VarRef6_9_6_11terminates;
}
int function33accessVarRef(){
int VarRef7_9_7_111583;
{const std::lock_guard<std::mutex> lock(sigma_mutex);VarRef7_9_7_111583 = *(int*)sigma["Variable2_0_2_11currentValue"];}
int VarRef7_9_7_11terminates;
VarRef7_9_7_11terminates = VarRef7_9_7_111583;

return VarRef7_9_7_11terminates;
}
int main(){
		functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	functioninit9Variable();
	function11initializeVar();
	LockingQueue<Void> synch17;
	{Void fakeParam17;
 	synch17.push(fakeParam17);}

	goto flag17;
	flag17 :
	{Void joinPopped17;
 	synch17.waitAndPop(joinPopped17);}
	int result18accessVarRef = function18accessVarRef();
	int VarRef4_7_4_9terminate;
	VarRef4_7_4_9terminate = result18accessVarRef;
	if (VarRef4_7_4_9terminate == true){
	int result27accessVarRef = function27accessVarRef();
	function26executeAssignment2(result27accessVarRef);
	int result33accessVarRef = function33accessVarRef();
	function32executeAssignment2(result33accessVarRef);
	{Void fakeParam17;
 	synch17.push(fakeParam17);}

	goto flag17;
	}
	if (VarRef4_7_4_9terminate == false){
	}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}}
