
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
 // la 
} //c'est ici
void function5initializeVar(){
	int Variable2_0_2_101430;
	Variable2_0_2_101430 = 1;
	*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101430
 // la 
} //c'est ici
void functioninit6Variable(){
	sigma["Variable4_0_4_10currentValue"] = new int();
 // la 
} //c'est ici
void function8initializeVar(){
	int Variable4_0_4_101430;
	Variable4_0_4_101430 = 3;
	*((int*)sigma["Variable4_0_4_10currentValue"]) = Variable4_0_4_101430
 // la 
} //c'est ici
int function11accessVarRef(){
	std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef6_5_6_71645;
	VarRef6_5_6_71645 = *((int*)sigma["Variable4_0_4_10currentValue"]);
	int VarRef6_5_6_7terminates;
	VarRef6_5_6_7terminates = VarRef6_5_6_71645;
	return VarRef6_5_6_7terminates;
 // la 
} //c'est ici
void function13executeAssignment2(int resRight){
	int Assignment6_0_6_72620;
	Assignment6_0_6_72620 = resRight;
	*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment6_0_6_72620
 // la 
} //c'est ici
int function16accessVarRef(){
	std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef8_4_8_61645;
	VarRef8_4_8_61645 = *((int*)sigma["Variable2_0_2_10currentValue"]);
	int VarRef8_4_8_6terminates;
	VarRef8_4_8_6terminates = VarRef8_4_8_61645;
	return VarRef8_4_8_6terminates;
 // la 
} //c'est ici
int function24accessVarRef(){
	std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef9_7_9_91645;
	VarRef9_7_9_91645 = *((int*)sigma["Variable4_0_4_10currentValue"]);
	int VarRef9_7_9_9terminates;
	VarRef9_7_9_9terminates = VarRef9_7_9_91645;
	return VarRef9_7_9_9terminates;
 // la 
} //c'est ici
void function26executeAssignment2(int resRight){
	int Assignment9_4_9_92620;
	Assignment9_4_9_92620 = resRight;
	*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment9_4_9_92620
 // la 
} //c'est ici
int function33accessVarRef(){
	std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef11_7_11_91645;
	VarRef11_7_11_91645 = *((int*)sigma["Variable2_0_2_10currentValue"]);
	int VarRef11_7_11_9terminates;
	VarRef11_7_11_9terminates = VarRef11_7_11_91645;
	return VarRef11_7_11_9terminates;
 // la 
} //c'est ici
void function35executeAssignment2(int resRight){
	int Assignment11_4_11_92620;
	Assignment11_4_11_92620 = resRight;
	*((int*)sigma["Variable4_0_4_10currentValue"]) = Assignment11_4_11_92620
 // la 
} //c'est ici

int main() {
    functioninit3Variable();
function5initializeVar();
functioninit6Variable();
function8initializeVar();
int result11accessVarRef = function11accessVarRef();
function13executeAssignment2(result11accessVarRef);
int result16accessVarRef = function16accessVarRef();

        LockingQueue<Void> queue37;
            
        int return,VarRef8_4_8_6terminate = result16accessVarRef;//Choice node
        if(VarRef8_4_8_6terminates == true){
        // here we have a choice node
        
        int result24accessVarRef = function24accessVarRef();
function26executeAssignment2(result24accessVarRef);
{

            Void fakeParam37;
            queue37.push(fakeParam37);
                }

            //END IF verifyEqual,VarRef8_4_8_6terminates,true
        }
            //Choice node
        if(VarRef8_4_8_6terminates == false){
        // here we have a choice node
        
        int result33accessVarRef = function33accessVarRef();
function35executeAssignment2(result33accessVarRef);
{

            Void fakeParam37;
            queue37.push(fakeParam37);
                }

            //END IF verifyEqual,VarRef8_4_8_6terminates,false
        }
             //or join node
        Void OrJoinPopped_37;
        queue37.waitAndPop(OrJoinPopped_37);
        
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    