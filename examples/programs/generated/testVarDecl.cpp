
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
	int Variable0_0_0_101430;
Variable0_0_0_101430 = 1;
*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101430;
}
void functioninit6Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar(){
	int Variable1_0_1_101430;
Variable1_0_1_101430 = 4;
*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101430;
}
int function11accessVarRef(){
	int VarRef2_5_2_71645;
VarRef2_5_2_71645 = *(int*)sigma["Variable0_0_0_10currentValue"];
int VarRef2_5_2_7terminates;
VarRef2_5_2_7terminates = VarRef2_5_2_71645;
return VarRef2_5_2_7terminates;
}
void function13executeAssignment2(int resRight){
	int Assignment2_0_2_72620;
Assignment2_0_2_72620 = resRight;
*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment2_0_2_72620;
}
int main(){
	functioninit3Variable();
function5initializeVar();
functioninit6Variable();
function8initializeVar();
int result11accessVarRef = function11accessVarRef();
function13executeAssignment2(result11accessVarRef);
}
