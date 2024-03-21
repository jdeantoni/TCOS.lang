
#include <string>
#include <unordered_map>
#include <thread>
#include <mutex>
#include <iostream>
#include "../utils/LockingQueue.hpp"

class Void{
};

std::unordered_map<std::string, void*> sigma;
std::mutex sigma_mutex;  // protects sigma

void functioninit5Variable(){
	sigma["Variable0_0_0_10currentValue"] = new int();
}
void function7initializeVar(){
	int Variable0_0_0_101376 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Variable0_0_0_101376;
}
void functioninit9Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function11initializeVar(){
	int Variable1_0_1_101376 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101376;
}
void function13periodicStart(){
	sigma["PeriodicBloc3_0_5_3blocTrigger"] = new unknown(100);
}
int function27accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_9_4_111579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_9_4_11terminates =  VarRef4_9_4_111579;
	return VarRef4_9_4_11terminates;
}
void function29executeAssignment2(int resRight){
	int Assignment4_4_4_112520 = resRight; // was Assignment4_4_4_112354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment4_4_4_112520;
}
int function36accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_5_7_71579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef7_5_7_7terminates =  VarRef7_5_7_71579;
	return VarRef7_5_7_7terminates;
}
void function38executeAssignment2(int resRight){
	int Assignment7_0_7_72520 = resRight; // was Assignment7_0_7_72354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment7_0_7_72520;
}

int main() {
    functioninit5Variable();
function7initializeVar();
functioninit9Variable();
function11initializeVar();
function13periodicStart();

        LockingQueue<Void> queue31;
            
            Void fakeParam31;
            queue31.push(fakeParam31);
                
           goto queue31;
            queue31: //or join node
        Void OrJoinPopped_31;
        queue31.waitAndPop(OrJoinPopped_31);
        
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    