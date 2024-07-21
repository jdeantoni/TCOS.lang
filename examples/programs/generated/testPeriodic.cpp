
#include <string>
#include <unordered_map>
#include <thread>
#include <mutex>
#include <iostream>
#include <chrono>
#include "../utils/LockingQueue.hpp"

using namespace std::chrono_literals;

#define DEBUG 1
    
class Void{
};

std::unordered_map<std::string, void*> sigma;
std::mutex sigma_mutex;  // protects sigma

void functioninit3Variable(){
	sigma["Variable0_0_0_10currentValue"] = new int();
 // la 
} //c'est ici
void function5initializeVar(){
	int Variable0_0_0_101430 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Variable0_0_0_101430;
 // la 
} //c'est ici
void functioninit6Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
 // la 
} //c'est ici
void function8initializeVar(){
	int Variable1_0_1_101430 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101430;
 // la 
} //c'est ici
void function9periodicStart(){
	sigma["PeriodicBloc3_0_5_3blocTrigger"] = new int(1000);
 // la 
} //c'est ici
void functionstarts11blocTrigger(){
	std::this_thread::sleep_for(1000ms);
 // la 
} //c'est ici
int function22accessVarRef(){
	lock [variableMutex]
	 create variable [int]  [VarRef4_13_4_151645]
	 assign variable [int] [VarRef4_13_4_151645] ["Variable0_0_0_10currentValuemanager"]
	int VarRef4_13_4_15terminates =  VarRef4_13_4_151645;
	return VarRef4_13_4_15terminates;
 // la 
} //c'est ici
int function24accessVarRef(){
	lock [variableMutex]
	 create variable [int]  [VarRef4_10_4_121645]
	 assign variable [int] [VarRef4_10_4_121645] ["Variable0_0_0_10currentValuemanager"]
	int VarRef4_10_4_12terminates =  VarRef4_10_4_121645;
	return VarRef4_10_4_12terminates;
 // la 
} //c'est ici
int function26finishPlus(int n2, int n1){
	int Plus4_9_4_164391 = n2;
	int Plus4_9_4_164416 = n1;
	int Plus4_9_4_164537 = n1; // was Plus4_9_4_164416; but using the parameter name now
	int Plus4_9_4_164542 = n2; // was Plus4_9_4_164391; but using the parameter name now
	int Plus4_9_4_164536 = Plus4_9_4_164537 + Plus4_9_4_164542;
	int Plus4_9_4_16terminates =  Plus4_9_4_164536;
	return Plus4_9_4_16terminates;
 // la 
} //c'est ici
void function27executeAssignment2(int resRight){
	int Assignment4_4_4_162620 = resRight; // was Assignment4_4_4_162452; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment4_4_4_162620;
 // la 
} //c'est ici
int function32accessVarRef(){
	lock [variableMutex]
	 create variable [int]  [VarRef7_5_7_71645]
	 assign variable [int] [VarRef7_5_7_71645] ["Variable0_0_0_10currentValuemanager"]
	int VarRef7_5_7_7terminates =  VarRef7_5_7_71645;
	return VarRef7_5_7_7terminates;
 // la 
} //c'est ici
void function34executeAssignment2(int resRight){
	int Assignment7_0_7_72620 = resRight; // was Assignment7_0_7_72452; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment7_0_7_72620;
 // la 
} //c'est ici

int main() {
    
        #if DEBUG
            std::cout<<"0 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"2 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"3 : Step" <<std::endl;
        #endif
        functioninit3Variable();

        #if DEBUG
            std::cout<<"5 : Step" <<std::endl;
        #endif
        function5initializeVar();

        #if DEBUG
            std::cout<<"4 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"6 : Step" <<std::endl;
        #endif
        functioninit6Variable();

        #if DEBUG
            std::cout<<"8 : Step" <<std::endl;
        #endif
        function8initializeVar();

        #if DEBUG
            std::cout<<"7 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"9 : Step" <<std::endl;
        #endif
        function9periodicStart();

        LockingQueue<Void> queue29;
            {

            Void fakeParam29;
            queue29.push(fakeParam29);
                
           goto queue29;
            }
queue29: //or join node
        Void OrJoinPopped_29;
        queue29.waitAndPop(OrJoinPopped_29);
        
        #if DEBUG
            std::cout<<"11 : Step" <<std::endl;
        #endif
        functionstarts11blocTrigger();

        #if DEBUG
            std::cout<<"12 : Step" <<std::endl;
        #endif
        function12periodicBodyStart();

            LockingQueue<int> queue26;
            std::thread thread14([&](){

        #if DEBUG
            std::cout<<"14 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"16 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"17 : Step" <<std::endl;
        #endif
        function17executeAssignment();

        #if DEBUG
            std::cout<<"19 : Step" <<std::endl;
        #endif
        function19startPlus();

            std::thread thread22([&](){

        #if DEBUG
            std::cout<<"22 : Step" <<std::endl;
        #endif
        int result22accessVarRef = function22accessVarRef();
{

            queue26.push(result22accessVarRef);
                }

        #if DEBUG
            std::cout<<"23 : Step" <<std::endl;
        #endif
        
            });
            thread22.detach();
                
            std::thread thread24([&](){

        #if DEBUG
            std::cout<<"24 : Step" <<std::endl;
        #endif
        int result24accessVarRef = function24accessVarRef();
{

            queue26.push(result24accessVarRef);
                }

        #if DEBUG
            std::cout<<"25 : Step" <<std::endl;
        #endif
        
            });
            thread24.detach();
                
        //start of and join node
        
        int AndJoinPopped_26_0;
        queue26.waitAndPop(AndJoinPopped_26_0);
            
        int AndJoinPopped_26_1;
        queue26.waitAndPop(AndJoinPopped_26_1);
            
        #if DEBUG
            std::cout<<"26 : AndJoin" <<std::endl;
        #endif
        int result26finishPlus = function26finishPlus(AndJoinPopped_26_0, AndJoinPopped_26_1);

        //end of and join node
        
        #if DEBUG
            std::cout<<"20 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"27 : Step" <<std::endl;
        #endif
        function27executeAssignment2(result26finishPlus);

        #if DEBUG
            std::cout<<"18 : Step" <<std::endl;
        #endif
        function18startsBloc();

        #if DEBUG
            std::cout<<"28 : Step" <<std::endl;
        #endif
        function28finishBloc();

            });
            thread14.detach();
                {

            Void fakeParam29;
            queue29.push(fakeParam29);
                
           goto queue29;
            }

    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    