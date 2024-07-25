
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
	assignVar,Variable1_0_1_101377,4
	setGlobalVar,int,Variable1_0_1_10currentValue,Variable1_0_1_101377
}
void functioninit9Variable(){
	createGlobalVar,int,Variable2_0_2_10currentValue
}
void function11initializeVar(){
	createVar,int,Variable2_0_2_101377
	assignVar,Variable2_0_2_101377,0
	setGlobalVar,int,Variable2_0_2_10currentValue,Variable2_0_2_101377
}
void function12startsParallelBloc(){
	
}
void function43condStart(){
	
}
void function48condFalseStart(){
	
}
void function49condStop(){
	
}
void function86executeAssignment(){
	
}
void function89executeAssignment2(){
	createVar,int,Assignment16_0_16_202524
	assignVar,Assignment16_0_16_202524,resRight
	setGlobalVar,int,Variable2_0_2_10currentValue,Assignment16_0_16_202524
}
int function50accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef7_4_7_61583
	setVarFromGlobal,int,VarRef7_4_7_61583,Variable0_0_0_10currentValue
	createVar,int,VarRef7_4_7_6terminates
	assignVar,VarRef7_4_7_6terminates,VarRef7_4_7_61583
	return,VarRef7_4_7_6terminates
}
void function52startsBloc(){
	
}
void function69startsBloc(){
	
}
void function90evaluateConjunction(){
	
}
bool function95evaluateConjunction2(){
	createVar,bool,Conjunction16_5_16_20terminates
	assignVar,Conjunction16_5_16_20terminates,false
	return,Conjunction16_5_16_20terminates
}
bool function96evaluateConjunction3(){
	createVar,bool,Conjunction16_5_16_20terminates
	assignVar,Conjunction16_5_16_20terminates,false
	return,Conjunction16_5_16_20terminates
}
bool function99evaluateConjunction4(){
	createVar,bool,Conjunction16_5_16_20terminates
	assignVar,Conjunction16_5_16_20terminates,true
	return,Conjunction16_5_16_20terminates
}
void function15executeAssignment(){
	
}
void function18executeAssignment2(){
	createVar,int,Assignment4_7_4_212524
	assignVar,Assignment4_7_4_212524,resRight
	setGlobalVar,int,Variable1_0_1_10currentValue,Assignment4_7_4_212524
}
void function29executeAssignment(){
	
}
void function32executeAssignment2(){
	createVar,int,Assignment5_7_5_212524
	assignVar,Assignment5_7_5_212524,resRight
	setGlobalVar,int,Variable1_0_1_10currentValue,Assignment5_7_5_212524
}
bool function100evalBooleanConst(){
	createGlobalVar,booltrue,BooleanConst16_6_16_10constantValue
	lock,variableMutex
	createVar,bool,BooleanConst16_6_16_104606
	setVarFromGlobal,bool,BooleanConst16_6_16_104606,BooleanConst16_6_16_10constantValue
	createVar,bool,BooleanConst16_6_16_10terminates
	assignVar,BooleanConst16_6_16_10terminates,BooleanConst16_6_16_104606
	return,BooleanConst16_6_16_10terminates
}
bool function102evalBooleanConst(){
	createGlobalVar,boolfalse,BooleanConst16_14_16_19constantValue
	lock,variableMutex
	createVar,bool,BooleanConst16_14_16_194606
	setVarFromGlobal,bool,BooleanConst16_14_16_194606,BooleanConst16_14_16_19constantValue
	createVar,bool,BooleanConst16_14_16_19terminates
	assignVar,BooleanConst16_14_16_19terminates,BooleanConst16_14_16_194606
	return,BooleanConst16_14_16_19terminates
}
void function19startPlus(){
	
}
int function24finishPlus(){
	createVar,int,Plus4_12_4_214387
	assignVar,Plus4_12_4_214387,n1
	createVar,int,Plus4_12_4_214392
	assignVar,Plus4_12_4_214392,n2
	createVar,Plus4_12_4_214386
	operation,Plus4_12_4_214386,Plus4_12_4_214387,+,Plus4_12_4_214392
	createVar,int,Plus4_12_4_21terminates
	assignVar,Plus4_12_4_21terminates,Plus4_12_4_214386
	return,Plus4_12_4_21terminates
}
void function33startPlus(){
	
}
int function38finishPlus(){
	createVar,int,Plus5_12_5_214387
	assignVar,Plus5_12_5_214387,n1
	createVar,int,Plus5_12_5_214392
	assignVar,Plus5_12_5_214392,n2
	createVar,Plus5_12_5_214386
	operation,Plus5_12_5_214386,Plus5_12_5_214387,+,Plus5_12_5_214392
	createVar,int,Plus5_12_5_21terminates
	assignVar,Plus5_12_5_21terminates,Plus5_12_5_214386
	return,Plus5_12_5_21terminates
}
void function55executeAssignment(){
	
}
void function58executeAssignment2(){
	createVar,int,Assignment9_4_9_182524
	assignVar,Assignment9_4_9_182524,resRight
	setGlobalVar,int,Variable1_0_1_10currentValue,Assignment9_4_9_182524
}
void function72executeAssignment(){
	
}
void function75executeAssignment2(){
	createVar,int,Assignment12_4_12_182524
	assignVar,Assignment12_4_12_182524,resRight
	setGlobalVar,int,Variable0_0_0_10currentValue,Assignment12_4_12_182524
}
int function27accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef4_18_4_201583
	setVarFromGlobal,int,VarRef4_18_4_201583,Variable0_0_0_10currentValue
	createVar,int,VarRef4_18_4_20terminates
	assignVar,VarRef4_18_4_20terminates,VarRef4_18_4_201583
	return,VarRef4_18_4_20terminates
}
int function25accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef4_13_4_151583
	setVarFromGlobal,int,VarRef4_13_4_151583,Variable0_0_0_10currentValue
	createVar,int,VarRef4_13_4_15terminates
	assignVar,VarRef4_13_4_15terminates,VarRef4_13_4_151583
	return,VarRef4_13_4_15terminates
}
int function41accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef5_18_5_201583
	setVarFromGlobal,int,VarRef5_18_5_201583,Variable1_0_1_10currentValue
	createVar,int,VarRef5_18_5_20terminates
	assignVar,VarRef5_18_5_20terminates,VarRef5_18_5_201583
	return,VarRef5_18_5_20terminates
}
int function39accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef5_13_5_151583
	setVarFromGlobal,int,VarRef5_13_5_151583,Variable1_0_1_10currentValue
	createVar,int,VarRef5_13_5_15terminates
	assignVar,VarRef5_13_5_15terminates,VarRef5_13_5_151583
	return,VarRef5_13_5_15terminates
}
void function59startPlus(){
	
}
int function64finishPlus(){
	createVar,int,Plus9_9_9_184387
	assignVar,Plus9_9_9_184387,n1
	createVar,int,Plus9_9_9_184392
	assignVar,Plus9_9_9_184392,n2
	createVar,Plus9_9_9_184386
	operation,Plus9_9_9_184386,Plus9_9_9_184387,+,Plus9_9_9_184392
	createVar,int,Plus9_9_9_18terminates
	assignVar,Plus9_9_9_18terminates,Plus9_9_9_184386
	return,Plus9_9_9_18terminates
}
void function76startPlus(){
	
}
int function81finishPlus(){
	createVar,int,Plus12_9_12_184387
	assignVar,Plus12_9_12_184387,n1
	createVar,int,Plus12_9_12_184392
	assignVar,Plus12_9_12_184392,n2
	createVar,Plus12_9_12_184386
	operation,Plus12_9_12_184386,Plus12_9_12_184387,+,Plus12_9_12_184392
	createVar,int,Plus12_9_12_18terminates
	assignVar,Plus12_9_12_18terminates,Plus12_9_12_184386
	return,Plus12_9_12_18terminates
}
int function67accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef9_15_9_171583
	setVarFromGlobal,int,VarRef9_15_9_171583,Variable0_0_0_10currentValue
	createVar,int,VarRef9_15_9_17terminates
	assignVar,VarRef9_15_9_17terminates,VarRef9_15_9_171583
	return,VarRef9_15_9_17terminates
}
int function65accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef9_10_9_121583
	setVarFromGlobal,int,VarRef9_10_9_121583,Variable1_0_1_10currentValue
	createVar,int,VarRef9_10_9_12terminates
	assignVar,VarRef9_10_9_12terminates,VarRef9_10_9_121583
	return,VarRef9_10_9_12terminates
}
int function84accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef12_15_12_171583
	setVarFromGlobal,int,VarRef12_15_12_171583,Variable0_0_0_10currentValue
	createVar,int,VarRef12_15_12_17terminates
	assignVar,VarRef12_15_12_17terminates,VarRef12_15_12_171583
	return,VarRef12_15_12_17terminates
}
int function82accessVarRef(){
	lock,variableMutex
	createVar,int,VarRef12_10_12_121583
	setVarFromGlobal,int,VarRef12_10_12_121583,Variable1_0_1_10currentValue
	createVar,int,VarRef12_10_12_12terminates
	assignVar,VarRef12_10_12_12terminates,VarRef12_10_12_121583
	return,VarRef12_10_12_12terminates
}

int main() {
    
        #if DEBUG
            std::cout<<"0 : Step" <<std::endl;
        #endif
        function0statementsInOrder1();

        #if DEBUG
            std::cout<<"104 : Step" <<std::endl;
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
    