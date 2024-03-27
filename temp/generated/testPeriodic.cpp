
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
	sigma["PeriodicBloc3_0_5_3blocTrigger"] = new int(1000);
}
void functionstarts16blocTrigger(){
	std::this_thread::sleep_for(1000ms);
}
int function31accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_13_4_151579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_13_4_15terminates =  VarRef4_13_4_151579;
	return VarRef4_13_4_15terminates;
}
int function34accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_10_4_121579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_10_4_12terminates =  VarRef4_10_4_121579;
	return VarRef4_10_4_12terminates;
}
int function36finishPlus(int n2, int n1){
	int Plus4_9_4_164267 = n2;
	int Plus4_9_4_164292 = n1;
	int Plus4_9_4_164411 = n1; // was Plus4_9_4_164292; but using the parameter name now
	int Plus4_9_4_164416 = n2; // was Plus4_9_4_164267; but using the parameter name now
	int Plus4_9_4_164410 = Plus4_9_4_164411 + Plus4_9_4_164416;
	int Plus4_9_4_16terminates =  Plus4_9_4_164410;
	return Plus4_9_4_16terminates;
}
void function37executeAssignment2(int resRight){
	int Assignment4_4_4_162520 = resRight; // was Assignment4_4_4_162354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment4_4_4_162520;
}
int function44accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_5_7_71579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef7_5_7_7terminates =  VarRef7_5_7_71579;
	return VarRef7_5_7_7terminates;
}
void function46executeAssignment2(int resRight){
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

        LockingQueue<Void> queue39;
            {

            Void fakeParam39;
            queue39.push(fakeParam39);
                
           goto queue39;
            }
queue39: //or join node
        Void OrJoinPopped_39;
        queue39.waitAndPop(OrJoinPopped_39);
        functionstarts16blocTrigger();

            std::thread thread20([&](){

            LockingQueue<int> queue36;
            std::thread thread31([&](){
int result31accessVarRef = function31accessVarRef();
{

            queue36.push(result31accessVarRef);
                }

            });
            thread31.detach();
                
            std::thread thread34([&](){
int result34accessVarRef = function34accessVarRef();
{

            queue36.push(result34accessVarRef);
                }

            });
            thread34.detach();
                
        //start of and join node
        
        int AndJoinPopped_36_0;
        queue36.waitAndPop(AndJoinPopped_36_0);
            
        int AndJoinPopped_36_1;
        queue36.waitAndPop(AndJoinPopped_36_1);
            int result36finishPlus = function36finishPlus(AndJoinPopped_36_0, AndJoinPopped_36_1);

        //end of and join node
        function37executeAssignment2(result36finishPlus);

            });
            thread20.detach();
                {

                    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
            Void fakeParam39;
            queue39.push(fakeParam39);
                
           goto queue39;
            }

    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    