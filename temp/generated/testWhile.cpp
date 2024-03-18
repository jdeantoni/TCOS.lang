
#include <string>
#include <unordered_map>
#include <thread>
#include <mutex>
#include <iostream>
#include "../utils/LockingQueue.hpp"

#define DEBUG 0
    
class Void{
};

std::unordered_map<std::string, void*> sigma;
std::mutex sigma_mutex;  // protects sigma

void functioninit5Variable(){
	sigma["Variable0_0_0_10currentValue"] = new int();
}
void function7initializeVar(){
	int Variable0_0_0_101385 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Variable0_0_0_101385;
}
void functioninit9Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function11initializeVar(){
	int Variable1_0_1_101385 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101385;
}
void function13whileStart(){
	
}
void function14statementsInOrder1(){
	
}
int function16accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef3_7_3_91588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef3_7_3_9terminates =  VarRef3_7_3_91588;
	return VarRef3_7_3_9terminates;
}
void function18whileEnd(){
	
}
void function21whileBodyEnd(){
	
}
void function24executeAssignment(){
	
}
void function25startsBloc(){
	
}
int function27accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef5_9_5_111588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_9_5_11terminates =  VarRef5_9_5_111588;
	return VarRef5_9_5_11terminates;
}
void function29executeAssignment2(int resRight){
	int Assignment5_4_5_112529 = resRight; // was Assignment5_4_5_112363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment5_4_5_112529;
}
void function30finishBloc(){
	
}
void function32finishModel(){
	
}

    int main() {
    
#if DEBUG
    std::cout<<"1 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"3 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"5 : Step" <<std::endl;
#endif
    functioninit5Variable();

#if DEBUG
    std::cout<<"7 : Step" <<std::endl;
#endif
    function7initializeVar();

#if DEBUG
    std::cout<<"6 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"9 : Step" <<std::endl;
#endif
    functioninit9Variable();

#if DEBUG
    std::cout<<"11 : Step" <<std::endl;
#endif
    function11initializeVar();

            Void fakeParam31;
            queue31.push(fakeParam31);
                
#if DEBUG
    std::cout<<"10 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"13 : Step" <<std::endl;
#endif
    function13whileStart();
 //or join node
        Void OrJoinPopped_31;
        queue31.waitAndPop(OrJoinPopped_31);
        
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    