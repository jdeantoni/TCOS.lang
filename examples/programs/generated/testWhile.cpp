
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
void functioninit9Variable(){
	createGlobalVar,int,Variable2_0_2_11currentValue
}
void function11initializeVar(){
	createVar,int,Variable2_0_2_111377
	assignVar,Variable2_0_2_111377,42
	setGlobalVar,int,Variable2_0_2_11currentValue,Variable2_0_2_111377
}
void function12whileStart(){
	
}
void function16whileEnd(){
	
}
int function18accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef4_7_4_91583
	setVarFromGlobal,int,VarRef4_7_4_91583,Variable0_0_0_10currentValue
	createVar,int,VarRef4_7_4_9terminates
	assignVar,VarRef4_7_4_9terminates,VarRef4_7_4_91583
	return,VarRef4_7_4_9terminates
}
void function20startsBloc(){
	
}
void function23executeAssignment(){
	
}
void function26executeAssignment2(){
	createVar,int,Assignment6_4_6_112524
	assignVar,Assignment6_4_6_112524,resRight
	setGlobalVar,int,Variable0_0_0_10currentValue,Assignment6_4_6_112524
}
void function29executeAssignment(){
	
}
void function32executeAssignment2(){
	createVar,int,Assignment7_4_7_112524
	assignVar,Assignment7_4_7_112524,resRight
	setGlobalVar,int,Variable1_0_1_10currentValue,Assignment7_4_7_112524
}
int function27accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef6_9_6_111583
	setVarFromGlobal,int,VarRef6_9_6_111583,Variable1_0_1_10currentValue
	createVar,int,VarRef6_9_6_11terminates
	assignVar,VarRef6_9_6_11terminates,VarRef6_9_6_111583
	return,VarRef6_9_6_11terminates
}
int function33accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef7_9_7_111583
	setVarFromGlobal,int,VarRef7_9_7_111583,Variable2_0_2_11currentValue
	createVar,int,VarRef7_9_7_11terminates
	assignVar,VarRef7_9_7_11terminates,VarRef7_9_7_111583
	return,VarRef7_9_7_11terminates
}

int main() {
    
        #if DEBUG
            std::cout<<"0 : Step" <<std::endl;
        #endif
        function0statementsInOrder1();

        #if DEBUG
            std::cout<<"35 : Step" <<std::endl;
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
    