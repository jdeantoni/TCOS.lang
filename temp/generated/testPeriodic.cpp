
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
	int Variable0_0_0_101361 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Variable0_0_0_101361;
}
void functioninit6Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar(){
	int Variable1_0_1_101361 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101361;
}
void function9periodicStart(){
	sigma["PeriodicBloc3_0_5_3blocTrigger"] = new int(1000);
	sigma["PeriodicBloc3_0_5_3isExecuting"] = new bool(false);
}
void functionstarts11blocTrigger(){
	std::this_thread::sleep_for(1000ms);
}
int function25accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_13_4_151567 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_13_4_15terminates =  VarRef4_13_4_151567;
	return VarRef4_13_4_15terminates;
}
int function27accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_10_4_121567 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_10_4_12terminates =  VarRef4_10_4_121567;
	return VarRef4_10_4_12terminates;
}
int function29finishPlus(int n2, int n1){
	int Plus4_9_4_164243 = n2;
	int Plus4_9_4_164268 = n1;
	int Plus4_9_4_164387 = n1; // was Plus4_9_4_164268; but using the parameter name now
	int Plus4_9_4_164392 = n2; // was Plus4_9_4_164243; but using the parameter name now
	int Plus4_9_4_164386 = Plus4_9_4_164387 + Plus4_9_4_164392;
	int Plus4_9_4_16terminates =  Plus4_9_4_164386;
	return Plus4_9_4_16terminates;
}
void function30executeAssignment2(int resRight){
	int Assignment4_4_4_162508 = resRight; // was Assignment4_4_4_162342; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment4_4_4_162508;
}
int function34accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_5_7_71567 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef7_5_7_7terminates =  VarRef7_5_7_71567;
	return VarRef7_5_7_7terminates;
}
void function36executeAssignment2(int resRight){
	int Assignment7_0_7_72508 = resRight; // was Assignment7_0_7_72342; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment7_0_7_72508;
}

int main() {
    functioninit3Variable();
function5initializeVar();
functioninit6Variable();
function8initializeVar();
function9periodicStart();

        LockingQueue<Void> queue16;
            {

            Void fakeParam16;
            queue16.push(fakeParam16);
                }
 //or join node
        Void OrJoinPopped_16;
        queue16.waitAndPop(OrJoinPopped_16);
        functionstarts11blocTrigger();

        LockingQueue<Void> queue14;
            {

            Void fakeParam14;
            queue14.push(fakeParam14);
                
           goto queue14;
            }

                {
                }
                
                {queue14: //or join node
        Void OrJoinPopped_14;
        queue14.waitAndPop(OrJoinPopped_14);
        //Choice node
        if(else){{

            Void fakeParam14;
            queue14.push(fakeParam14);
                
           goto queue14;
            }

            //END IF else
        }
            //Choice node
        if(isExecuting == false){
            std::thread thread17([&](){

            std::thread thread25([&](){
int result25accessVarRef = function25accessVarRef();

        LockingQueue<int> queue29;
            {

            queue29.push(result25accessVarRef);
                }

            });
            thread25.detach();
                
            std::thread thread27([&](){
int result27accessVarRef = function27accessVarRef();
{

            queue29.push(result27accessVarRef);
                }

            });
            thread27.detach();
                
        //start of and join node
        
        int AndJoinPopped_29_0;
        queue29.waitAndPop(AndJoinPopped_29_0);
            
        int AndJoinPopped_29_1;
        queue29.waitAndPop(AndJoinPopped_29_1);
            int result29finishPlus = function29finishPlus(AndJoinPopped_29_0, AndJoinPopped_29_1);

        //end of and join node
        function30executeAssignment2(result29finishPlus);

            });
            thread17.detach();
                
            //END IF isExecuting == false
        }
            //Choice node
        if(isExecuting == true){int result34accessVarRef = function34accessVarRef();
function36executeAssignment2(result34accessVarRef);

            //END IF isExecuting == true
        }
            
                }
                
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    