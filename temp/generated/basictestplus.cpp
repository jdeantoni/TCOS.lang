
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
sigma["Variable2_0_2_10currentValue"] = new int();
}
void function5initializeVar(){
int Variable2_0_2_101430;
Variable2_0_2_101430 = 1;
*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101430;
}
void functioninit6Variable(){
sigma["Variable4_0_4_10currentValue"] = new int();
}
void function8initializeVar(){
int Variable4_0_4_101430;
Variable4_0_4_101430 = 3;
*((int*)sigma["Variable4_0_4_10currentValue"]) = Variable4_0_4_101430;
}
int function11accessVarRef(){
int VarRef8_4_8_61645;
VarRef8_4_8_61645 = *(int*)sigma["Variable2_0_2_10currentValue"];
int VarRef8_4_8_6terminates;
VarRef8_4_8_6terminates = VarRef8_4_8_61645;
return VarRef8_4_8_6terminates;
}
int function19accessVarRef(){
int VarRef9_9_9_111645;
VarRef9_9_9_111645 = *(int*)sigma["Variable4_0_4_10currentValue"];
int VarRef9_9_9_11terminates;
VarRef9_9_9_11terminates = VarRef9_9_9_111645;
return VarRef9_9_9_11terminates;
}
void function21executeAssignment2(int resRight){
int Assignment9_4_9_112620;
Assignment9_4_9_112620 = resRight;
*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment9_4_9_112620;
}
int function28accessVarRef(){
int VarRef11_7_11_91645;
VarRef11_7_11_91645 = *(int*)sigma["Variable2_0_2_10currentValue"];
int VarRef11_7_11_9terminates;
VarRef11_7_11_9terminates = VarRef11_7_11_91645;
return VarRef11_7_11_9terminates;
}
void function30executeAssignment2(int resRight){
int Assignment11_4_11_92620;
Assignment11_4_11_92620 = resRight;
*((int*)sigma["Variable4_0_4_10currentValue"]) = Assignment11_4_11_92620;
}
int main(){
	functioninit3Variable();
function5initializeVar();
functioninit6Variable();
function8initializeVar();
int result11accessVarRef = function11accessVarRef();
int VarRef8_4_8_6terminate;
VarRef8_4_8_6terminate = result11accessVarRef;
if (VarRef8_4_8_6terminate == true){
int result19accessVarRef = function19accessVarRef();
function21executeAssignment2(result19accessVarRef);
}
if (VarRef8_4_8_6terminate == false){
int result28accessVarRef = function28accessVarRef();
function30executeAssignment2(result28accessVarRef);
}
}
