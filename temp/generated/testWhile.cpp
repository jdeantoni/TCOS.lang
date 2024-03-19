
#include <string>
#include <unordered_map>
#include <thread>
#include <mutex>
#include <iostream>
#include "../utils/LockingQueue.hpp"

#define DEBUG 1
    
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
void functioninit13Variable(){
	sigma["Variable2_0_2_11currentValue"] = new int();
}
void function15initializeVar(){
	int Variable2_0_2_111385 = 42; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable2_0_2_11currentValue"])) = Variable2_0_2_111385;
}
void function17whileStart(){
	
}
void function18statementsInOrder1(){
	
}
int function20accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_7_4_91588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_7_4_9terminates =  VarRef4_7_4_91588;
	return VarRef4_7_4_9terminates;
}
void function22whileEnd(){
	
}
void function25whileBodyEnd(){
	
}
void function28executeAssignment(){
	
}
int function31accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef6_9_6_111588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef6_9_6_11terminates =  VarRef6_9_6_111588;
	return VarRef6_9_6_11terminates;
}
void function33executeAssignment2(int resRight){
	int Assignment6_4_6_112529 = resRight; // was Assignment6_4_6_112363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment6_4_6_112529;
}
void function35executeAssignment(){
	
}
void function36startsBloc(){
	
}
int function38accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_9_7_111588 = *(int *) sigma["Variable2_0_2_11currentValue"];//currentValue}
	int VarRef7_9_7_11terminates =  VarRef7_9_7_111588;
	return VarRef7_9_7_11terminates;
}
void function40executeAssignment2(int resRight){
	int Assignment7_4_7_112529 = resRight; // was Assignment7_4_7_112363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment7_4_7_112529;
}
void function41finishBloc(){
	
}
void function43finishModel(){
	
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

#if DEBUG
    std::cout<<"10 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"13 : Step" <<std::endl;
#endif
    functioninit13Variable();

#if DEBUG
    std::cout<<"15 : Step" <<std::endl;
#endif
    function15initializeVar();

        LockingQueue<Void> queue42;
            
            Void fakeParam42;
            queue42.push(fakeParam42);
                
           goto queue42;
            
#if DEBUG
    std::cout<<"14 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"17 : Step" <<std::endl;
#endif
    function17whileStart();
queue42: //or join node
        Void OrJoinPopped_42;
        queue42.waitAndPop(OrJoinPopped_42);
        
#if DEBUG
    std::cout<<"20 : Step" <<std::endl;
#endif
    int result20accessVarRef = function20accessVarRef();

#if DEBUG
    std::cout<<"21 : Step" <<std::endl;
#endif
    
        int VarRef4_7_4_9terminates = result20accessVarRef;//Choice node
        if((bool)VarRef4_7_4_9terminates == true){
#if DEBUG
    std::cout<<"22 : Choice" <<std::endl;
#endif
    function22whileEnd();

#if DEBUG
    std::cout<<"24 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"26 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"28 : Step" <<std::endl;
#endif
    function28executeAssignment();

#if DEBUG
    std::cout<<"31 : Step" <<std::endl;
#endif
    int result31accessVarRef = function31accessVarRef();

#if DEBUG
    std::cout<<"32 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"33 : Step" <<std::endl;
#endif
    function33executeAssignment2(result31accessVarRef);

#if DEBUG
    std::cout<<"29 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"35 : Step" <<std::endl;
#endif
    function35executeAssignment();

#if DEBUG
    std::cout<<"38 : Step" <<std::endl;
#endif
    int result38accessVarRef = function38accessVarRef();

#if DEBUG
    std::cout<<"39 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"40 : Step" <<std::endl;
#endif
    function40executeAssignment2(result38accessVarRef);

            Void fakeParam42;
            queue42.push(fakeParam42);
                
           goto queue42;
            
#if DEBUG
    std::cout<<"36 : Step" <<std::endl;
#endif
    function36startsBloc();

#if DEBUG
    std::cout<<"41 : Step" <<std::endl;
#endif
    function41finishBloc();

#if DEBUG
    std::cout<<"25 : Step" <<std::endl;
#endif
    function25whileBodyEnd();

            //END IF (bool)VarRef4_7_4_9terminates == true
        }
            //Choice node
        if((bool)VarRef4_7_4_9terminates == false){
#if DEBUG
    std::cout<<"22 : Choice" <<std::endl;
#endif
    function22whileEnd();

#if DEBUG
    std::cout<<"18 : Step" <<std::endl;
#endif
    function18statementsInOrder1();

#if DEBUG
    std::cout<<"43 : Step" <<std::endl;
#endif
    function43finishModel();

            //END IF (bool)VarRef4_7_4_9terminates == false
        }
            
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    