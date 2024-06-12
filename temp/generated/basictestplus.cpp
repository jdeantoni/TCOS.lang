
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
	Variable2_0_2_101430 = 2;
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable2_0_2_10currentValue"])) = Variable2_0_2_101430;
 // la 
} //c'est ici
void functioninit6Variable(){
	sigma["Variable4_0_4_10currentValue"] = new int();
 // la 
} //c'est ici
void function8initializeVar(){
	int Variable4_0_4_101430;
	Variable4_0_4_101430 = 3;
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable4_0_4_10currentValue"])) = Variable4_0_4_101430;
 // la 
} //c'est ici
int function11accessVarRef(){
	std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_5_7_71645;
	VarRef7_5_7_71645 = *((int*)sigma["Variable2_0_2_10currentValuemanager"]);
	int VarRef7_5_7_7terminates;
	VarRef7_5_7_7terminates = VarRef7_5_7_71645;
	return VarRef7_5_7_7terminates;
 // la 
} //c'est ici
void function13executeAssignment2(int resRight){
	int Assignment7_0_7_72620;
	Assignment7_0_7_72620 = resRight;
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable4_0_4_10currentValue"])) = Assignment7_0_7_72620;
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

        #if DEBUG
            std::cout<<"11 : Step" <<std::endl;
        #endif
        int result11accessVarRef = function11accessVarRef();

        #if DEBUG
            std::cout<<"12 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"13 : Step" <<std::endl;
        #endif
        function13executeAssignment2(result11accessVarRef);

        #if DEBUG
            std::cout<<"10 : Step" <<std::endl;
        #endif

        #if DEBUG
            std::cout<<"14 : Step" <<std::endl;
        #endif

    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    