
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
	int Variable0_0_0_101377 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Variable0_0_0_101377;
}
void functioninit6Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar(){
	int Variable1_0_1_101377 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101377;
}
void functioninit9Variable(){
	sigma["Variable2_0_2_11currentValue"] = new int();
}
void function11initializeVar(){
	int Variable2_0_2_111377 = 42; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable2_0_2_11currentValue"])) = Variable2_0_2_111377;
}
int function14accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_7_4_91583 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_7_4_9terminates =  VarRef4_7_4_91583;
	return VarRef4_7_4_9terminates;
}
int function22accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef6_9_6_111583 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef6_9_6_11terminates =  VarRef6_9_6_111583;
	return VarRef6_9_6_11terminates;
}
void function24executeAssignment2(int resRight){
	int Assignment6_4_6_112524 = resRight; // was Assignment6_4_6_112358; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment6_4_6_112524;
}
int function27accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_9_7_111583 = *(int *) sigma["Variable2_0_2_11currentValue"];//currentValue}
	int VarRef7_9_7_11terminates =  VarRef7_9_7_111583;
	return VarRef7_9_7_11terminates;
}
void function29executeAssignment2(int resRight){
	int Assignment7_4_7_112524 = resRight; // was Assignment7_4_7_112358; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment7_4_7_112524;
}

int main() {
    functioninit3Variable();
function5initializeVar();
functioninit6Variable();
function8initializeVar();
functioninit9Variable();
function11initializeVar();

        LockingQueue<Void> queue31;
            {

            Void fakeParam31;
            queue31.push(fakeParam31);
                
           goto queue31;
            }
queue31: //or join node
        Void OrJoinPopped_31;
        queue31.waitAndPop(OrJoinPopped_31);
        int result14accessVarRef = function14accessVarRef();

        int VarRef4_7_4_9terminates = result14accessVarRef;//Choice node
        if((bool)VarRef4_7_4_9terminates == true){int result22accessVarRef = function22accessVarRef();
function24executeAssignment2(result22accessVarRef);
int result27accessVarRef = function27accessVarRef();
function29executeAssignment2(result27accessVarRef);
{

            Void fakeParam31;
            queue31.push(fakeParam31);
                
           goto queue31;
            }

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
    