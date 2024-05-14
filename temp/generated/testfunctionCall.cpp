
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
	sigma["Variable8_0_8_10currentValue"] = new int();
}
void function5initializeVar(){
	int Variable8_0_8_101377 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable8_0_8_10currentValue"])) = Variable8_0_8_101377;
}
int function9accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef9_3_9_51583 = *(int *) sigma["Variable8_0_8_10currentValue"];//currentValue}
	int VarRef9_3_9_5terminates =  VarRef9_3_9_51583;
	return VarRef9_3_9_5terminates;
}
void functioninit17Variable(){
	sigma["Variable1_4_1_14currentValue"] = new int();
}
void function19initializeVar(){
	int Variable1_4_1_141377 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable1_4_1_14currentValue"])) = Variable1_4_1_141377;
}
void functioninit20Variable(){
	sigma["Variable2_4_2_14currentValue"] = new int();
}
void function22initializeVar(){
	int Variable2_4_2_141377 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable2_4_2_14currentValue"])) = Variable2_4_2_141377;
}
int function25accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef3_9_3_111583 = *(int *) sigma["Variable1_4_1_14currentValue"];//currentValue}
	int VarRef3_9_3_11terminates =  VarRef3_9_3_111583;
	return VarRef3_9_3_11terminates;
}
void function27executeAssignment2(int resRight){
	int Assignment3_4_3_112524 = resRight; // was Assignment3_4_3_112358; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable2_4_2_14currentValue"])) = Assignment3_4_3_112524;
}

int main() {
    functioninit3Variable();
function5initializeVar();
int result9accessVarRef = function9accessVarRef();
functioninit17Variable();
function19initializeVar();
functioninit20Variable();
function22initializeVar();
int result25accessVarRef = function25accessVarRef();
function27executeAssignment2(result25accessVarRef);

    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    