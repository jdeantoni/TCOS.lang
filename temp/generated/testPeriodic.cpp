
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
	int Variable0_0_0_101376 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Variable0_0_0_101376;
}
void functioninit6Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar(){
	int Variable1_0_1_101376 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101376;
}
void function9periodicStart(){
	sigma["PeriodicBloc3_0_5_3blocTrigger"] = new int(1000);
}
void functionstarts11blocTrigger(){
	std::this_thread::sleep_for(1000ms);
}
int function22accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_13_4_151579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_13_4_15terminates =  VarRef4_13_4_151579;
	return VarRef4_13_4_15terminates;
}
int function24accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_10_4_121579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_10_4_12terminates =  VarRef4_10_4_121579;
	return VarRef4_10_4_12terminates;
}
int function26finishPlus(int n2, int n1){
	int Plus4_9_4_164267 = n2;
	int Plus4_9_4_164292 = n1;
	int Plus4_9_4_164411 = n1; // was Plus4_9_4_164292; but using the parameter name now
	int Plus4_9_4_164416 = n2; // was Plus4_9_4_164267; but using the parameter name now
	int Plus4_9_4_164410 = Plus4_9_4_164411 + Plus4_9_4_164416;
	int Plus4_9_4_16terminates =  Plus4_9_4_164410;
	return Plus4_9_4_16terminates;
}
void function27executeAssignment2(int resRight){
	int Assignment4_4_4_162520 = resRight; // was Assignment4_4_4_162354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment4_4_4_162520;
}
int function33accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_5_7_71579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef7_5_7_7terminates =  VarRef7_5_7_71579;
	return VarRef7_5_7_7terminates;
}
void function35executeAssignment2(int resRight){
	int Assignment7_0_7_72520 = resRight; // was Assignment7_0_7_72354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment7_0_7_72520;
}

int main() {
    functioninit3Variable();
function5initializeVar();
functioninit6Variable();
function8initializeVar();
function9periodicStart();

        LockingQueue<Void> queue29;
            {

            Void fakeParam29;
            queue29.push(fakeParam29);
                }
 //or join node
        Void OrJoinPopped_29;
        queue29.waitAndPop(OrJoinPopped_29);
        
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    