
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
	mama["Variable2_0_2_10currentValue"] = new int();
}
void function5initializeVar(){
	int Variable2_0_2_101430 = 2; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(mama_mutex);
                (*((int*)mama["Variable2_0_2_10currentValue"])) = Variable2_0_2_101430;
}
void functioninit6Variable(){
	mama["Variable4_0_4_10currentValue"] = new int();
}
void function8initializeVar(){
	int Variable4_0_4_101430 = 3; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(mama_mutex);
                (*((int*)mama["Variable4_0_4_10currentValue"])) = Variable4_0_4_101430;
}
int function11accessVarRef(){
	const std::lock_guard<std::mutex> lock(mama_mutex);
	int VarRef7_5_7_71645 = *(int *) mama["Variable2_0_2_10currentValue"];//currentValue}
	int VarRef7_5_7_7terminates =  VarRef7_5_7_71645;
	return VarRef7_5_7_7terminates;
}
void function13executeAssignment2(int resRight){
	int Assignment7_0_7_72620 = resRight; // was Assignment7_0_7_72452; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(mama_mutex);                                    
                (*((int*)mama["Variable4_0_4_10currentValue"])) = Assignment7_0_7_72620;
}

int main() {
    functioninit3Variable();
function5initializeVar();
functioninit6Variable();
function8initializeVar();
int result11accessVarRef = function11accessVarRef();
function13executeAssignment2(result11accessVarRef);

    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    