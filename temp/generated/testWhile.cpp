
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
void functioninit13Variable(){
	sigma["Variable2_0_2_11currentValue"] = new int();
}
void function15initializeVar(){
	int Variable2_0_2_111376 = 42; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable2_0_2_11currentValue"])) = Variable2_0_2_111376;
}
int function20accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_7_4_91579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_7_4_9terminates =  VarRef4_7_4_91579;
	return VarRef4_7_4_9terminates;
}
int function31accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef6_9_6_111579 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef6_9_6_11terminates =  VarRef6_9_6_111579;
	return VarRef6_9_6_11terminates;
}
void function33executeAssignment2(int resRight){
	int Assignment6_4_6_112520 = resRight; // was Assignment6_4_6_112354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment6_4_6_112520;
}
int function38accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_9_7_111579 = *(int *) sigma["Variable2_0_2_11currentValue"];//currentValue}
	int VarRef7_9_7_11terminates =  VarRef7_9_7_111579;
	return VarRef7_9_7_11terminates;
}
void function40executeAssignment2(int resRight){
	int Assignment7_4_7_112520 = resRight; // was Assignment7_4_7_112354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment7_4_7_112520;
}

int main() {
    functioninit5Variable();
function7initializeVar();
functioninit9Variable();
function11initializeVar();
functioninit13Variable();
function15initializeVar();

        LockingQueue<Void> queue42;
            
            Void fakeParam42;
            queue42.push(fakeParam42);
                
           goto queue42;
            queue42: //or join node
        Void OrJoinPopped_42;
        queue42.waitAndPop(OrJoinPopped_42);
        int result20accessVarRef = function20accessVarRef();

        int VarRef4_7_4_9terminates = result20accessVarRef;//Choice node
        if((bool)VarRef4_7_4_9terminates == true){int result31accessVarRef = function31accessVarRef();
function33executeAssignment2(result31accessVarRef);
int result38accessVarRef = function38accessVarRef();
function40executeAssignment2(result38accessVarRef);

            Void fakeParam42;
            queue42.push(fakeParam42);
                
           goto queue42;
            
            //END IF (bool)VarRef4_7_4_9terminates == true
        }
            //Choice node
        if((bool)VarRef4_7_4_9terminates == false){
            //END IF (bool)VarRef4_7_4_9terminates == false
        }
            
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    