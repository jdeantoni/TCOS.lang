
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

void function0statementsInOrder1(){
	
}
void functioninit3Variable(){
	createGlobalVar,int,Variable0_0_0_10currentValue
}
void function5initializeVar(){
	createVar,int,Variable0_0_0_101377
	assignVar,Variable0_0_0_101377,1
	setGlobalVar,int,Variable0_0_0_10currentValue,Variable0_0_0_101377
}
void functioninit6Variable(){
	createGlobalVar,int,Variable1_0_1_10currentValue
}
void function8initializeVar(){
	createVar,int,Variable1_0_1_101377
	assignVar,Variable1_0_1_101377,0
	setGlobalVar,int,Variable1_0_1_10currentValue,Variable1_0_1_101377
}
void function9periodicStart(){
	createGlobalVar,int1000,PeriodicBloc3_0_5_3blocTrigger
}
void function32executeAssignment(){
	
}
void function35executeAssignment2(){
	createVar,int,Assignment7_0_7_72524
	assignVar,Assignment7_0_7_72524,resRight
	setGlobalVar,int,Variable1_0_1_10currentValue,Assignment7_0_7_72524
}
void function15startsBloc(){
	
}
int function36accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef7_5_7_71583
	setVarFromGlobal,int,VarRef7_5_7_71583,Variable0_0_0_10currentValue
	createVar,int,VarRef7_5_7_7terminates
	assignVar,VarRef7_5_7_7terminates,VarRef7_5_7_71583
	return,VarRef7_5_7_7terminates
}
void function18executeAssignment(){
	
}
void function21executeAssignment2(){
	createVar,int,Assignment4_4_4_162524
	assignVar,Assignment4_4_4_162524,resRight
	setGlobalVar,int,Variable0_0_0_10currentValue,Assignment4_4_4_162524
}
void function22startPlus(){
	
}
int function27finishPlus(){
	createVar,int,Plus4_9_4_164387
	assignVar,Plus4_9_4_164387,n1
	createVar,int,Plus4_9_4_164392
	assignVar,Plus4_9_4_164392,n2
	createVar,Plus4_9_4_164386
	operation,Plus4_9_4_164386,Plus4_9_4_164387,+,Plus4_9_4_164392
	createVar,int,Plus4_9_4_16terminates
	assignVar,Plus4_9_4_16terminates,Plus4_9_4_164386
	return,Plus4_9_4_16terminates
}
int function30accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef4_13_4_151583
	setVarFromGlobal,int,VarRef4_13_4_151583,Variable0_0_0_10currentValue
	createVar,int,VarRef4_13_4_15terminates
	assignVar,VarRef4_13_4_15terminates,VarRef4_13_4_151583
	return,VarRef4_13_4_15terminates
}
int function28accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef4_10_4_121583
	setVarFromGlobal,int,VarRef4_10_4_121583,Variable0_0_0_10currentValue
	createVar,int,VarRef4_10_4_12terminates
	assignVar,VarRef4_10_4_12terminates,VarRef4_10_4_121583
	return,VarRef4_10_4_12terminates
}

int main() {
    
        #if DEBUG
            std::cout<<"0 : Step" <<std::endl;
        #endif
        function0statementsInOrder1();

        #if DEBUG
            std::cout<<"38 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"3 : Step" <<std::endl;
        #endif
        functioninit3Variable();

        #if DEBUG
            std::cout<<"5 : Step" <<std::endl;
        #endif
        function5initializeVar();

    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    