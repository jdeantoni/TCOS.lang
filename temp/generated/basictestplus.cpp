
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
	sigma["Variable2_0_2_10currentValue"] = new int();
 // la 
} //c'est ici
void function5initializeVar(){
	int Variable2_0_2_101430;
	Variable2_0_2_101430 = 1;
	*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101430
 // la 
} //c'est ici
void functioninit6Variable(){
	sigma["Variable4_0_4_10currentValue"] = new int();
 // la 
} //c'est ici
void function8initializeVar(){
	int Variable4_0_4_101430;
	Variable4_0_4_101430 = 3;
	*((int*)sigma["Variable4_0_4_10currentValue"]) = Variable4_0_4_101430
 // la 
} //c'est ici
int function11accessVarRef(){
	std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef6_4_6_61645;
	VarRef6_4_6_61645 = *((int*)sigma["Variable2_0_2_10currentValue"]);
	int VarRef6_4_6_6terminates;
	VarRef6_4_6_6terminates = VarRef6_4_6_61645;
	return VarRef6_4_6_6terminates;
 // la 
} //c'est ici
int function19accessVarRef(){
	std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_9_7_111645;
	VarRef7_9_7_111645 = *((int*)sigma["Variable4_0_4_10currentValue"]);
	int VarRef7_9_7_11terminates;
	VarRef7_9_7_11terminates = VarRef7_9_7_111645;
	return VarRef7_9_7_11terminates;
 // la 
} //c'est ici
void function21executeAssignment2(int resRight){
	int Assignment7_4_7_112620;
	Assignment7_4_7_112620 = resRight;
	*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment7_4_7_112620
 // la 
} //c'est ici
int function28accessVarRef(){
	std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef10_9_10_111645;
	VarRef10_9_10_111645 = *((int*)sigma["Variable2_0_2_10currentValue"]);
	int VarRef10_9_10_11terminates;
	VarRef10_9_10_11terminates = VarRef10_9_10_111645;
	return VarRef10_9_10_11terminates;
 // la 
} //c'est ici
void function30executeAssignment2(int resRight){
	int Assignment10_4_10_112620;
	Assignment10_4_10_112620 = resRight;
	*((int*)sigma["Variable4_0_4_10currentValue"]) = Assignment10_4_10_112620
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
        function9condStart();

        #if DEBUG
            std::cout<<"11 : Step" <<std::endl;
        #endif
        int result11accessVarRef = function11accessVarRef();

        #if DEBUG
            std::cout<<"12 : Step" <<std::endl;
        #endif
        
        LockingQueue<Void> queue32;
            
        int return,VarRef6_4_6_6terminate = result11accessVarRef;//Choice node
        if((bool)VarRef6_4_6_6terminates == true){
        #if DEBUG
            std::cout<<"13 : Choice" <<std::endl;
        #endif
        function13condFalseStart();

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
        int result19accessVarRef = function19accessVarRef();

        #if DEBUG
            std::cout<<"20 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"21 : Step" <<std::endl;
        #endif
        function21executeAssignment2(result19accessVarRef);
{

            Void fakeParam32;
            queue32.push(fakeParam32);
                }

        #if DEBUG
            std::cout<<"18 : Step" <<std::endl;
        #endif
        function18startsBloc();

        #if DEBUG
            std::cout<<"22 : Step" <<std::endl;
        #endif
        function22finishBloc();

        #if DEBUG
            std::cout<<"15 : Step" <<std::endl;
        #endif
        
            //END IF (bool)VarRef6_4_6_6terminates == true
        }
            //Choice node
        if((bool)VarRef6_4_6_6terminates == false){
        #if DEBUG
            std::cout<<"13 : Choice" <<std::endl;
        #endif
        function13condFalseStart();

        #if DEBUG
            std::cout<<"23 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"25 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"26 : Step" <<std::endl;
        #endif
        function26executeAssignment();

        #if DEBUG
            std::cout<<"28 : Step" <<std::endl;
        #endif
        int result28accessVarRef = function28accessVarRef();

        #if DEBUG
            std::cout<<"29 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"30 : Step" <<std::endl;
        #endif
        function30executeAssignment2(result28accessVarRef);
{

            Void fakeParam32;
            queue32.push(fakeParam32);
                }

        #if DEBUG
            std::cout<<"27 : Step" <<std::endl;
        #endif
        function27startsBloc();

        #if DEBUG
            std::cout<<"31 : Step" <<std::endl;
        #endif
        function31finishBloc();

        #if DEBUG
            std::cout<<"24 : Step" <<std::endl;
        #endif
        
            //END IF (bool)VarRef6_4_6_6terminates == false
        }
             //or join node
        Void OrJoinPopped_32;
        queue32.waitAndPop(OrJoinPopped_32);
        
        #if DEBUG
            std::cout<<"10 : Step" <<std::endl;
        #endif
        function10statementsInOrder1();

        #if DEBUG
            std::cout<<"33 : Step" <<std::endl;
        #endif
        function33finishModel();

    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    