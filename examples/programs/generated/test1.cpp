
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

void functioninit3Perio(){
	createGlobalVar,int1000,Perio0_0_2_1blocTrigger
}
void functioninit19Stmt1(){
	createGlobalVar,int0,Stmt11_6_1_11fakeState
}
void functioninit21Stmt1(){
	createGlobalVar,int0,Stmt11_14_1_19fakeState
}

int main() {
    
        #if DEBUG
            std::cout<<"0 : Step" <<std::endl;
        #endif
        
        #if DEBUG
            std::cout<<"3 : Step" <<std::endl;
        #endif
        functioninit3Perio();

        LockingQueue<Void> queue8; //queue 2
            {

            Void fakeParam8;
            queue8.push(fakeParam8);
                }
 //or join node
        Void OrJoinPopped_8;
        queue8.waitAndPop(OrJoinPopped_8);
        
        #if DEBUG
            std::cout<<"31 : Step" <<std::endl;
        #endif
        
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    