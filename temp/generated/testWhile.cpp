
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
<<<<<<< HEAD
void function6finishModel(){
	
}
=======
>>>>>>> 0bf961d (correct various funny bugs :))
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
<<<<<<< HEAD
void function24executeAssignment(){
	
}
void function25finishBloc(){
=======
void function21whileBodyEnd(){
	
}
void function24executeAssignment(){
	
}
void function25startsBloc(){
>>>>>>> 0bf961d (correct various funny bugs :))
	
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
<<<<<<< HEAD
int function31accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef3_7_3_91588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef3_7_3_9terminates =  VarRef3_7_3_91588;
	return VarRef3_7_3_9terminates;
=======
void function30finishBloc(){
	
}
void function32finishModel(){
	
>>>>>>> 0bf961d (correct various funny bugs :))
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
<<<<<<< HEAD
    function6finishModel();

                {
=======
    
>>>>>>> 0bf961d (correct various funny bugs :))
#if DEBUG
    std::cout<<"9 : Step" <<std::endl;
#endif
    functioninit9Variable();

#if DEBUG
    std::cout<<"11 : Step" <<std::endl;
#endif
    function11initializeVar();

<<<<<<< HEAD
=======
            Void fakeParam31;
            queue31.push(fakeParam31);
                
>>>>>>> 0bf961d (correct various funny bugs :))
#if DEBUG
    std::cout<<"10 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"13 : Step" <<std::endl;
#endif
    function13whileStart();
<<<<<<< HEAD

#if DEBUG
    std::cout<<"16 : Step" <<std::endl;
#endif
    int result16accessVarRef = function16accessVarRef();

#if DEBUG
    std::cout<<"17 : Step" <<std::endl;
#endif
    
        int VarRef3_7_3_9terminates = result16accessVarRef;//Choice node
        if((bool)VarRef3_7_3_9terminates == true){
#if DEBUG
    std::cout<<"18 : Choice" <<std::endl;
#endif
    function18whileEnd();

#if DEBUG
    std::cout<<"20 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"22 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"24 : Step" <<std::endl;
#endif
    function24executeAssignment();

#if DEBUG
    std::cout<<"27 : Step" <<std::endl;
#endif
    int result27accessVarRef = function27accessVarRef();

#if DEBUG
    std::cout<<"28 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"29 : Step" <<std::endl;
#endif
    function29executeAssignment2(result27accessVarRef);

#if DEBUG
    std::cout<<"25 : Step" <<std::endl;
#endif
    function25finishBloc();

            //END IF (bool)VarRef3_7_3_9terminates == true
        }
            //Choice node
        if((bool)VarRef3_7_3_9terminates == false){
#if DEBUG
    std::cout<<"18 : Choice" <<std::endl;
#endif
    function18whileEnd();

#if DEBUG
    std::cout<<"14 : Step" <<std::endl;
#endif
    function14statementsInOrder1();

#if DEBUG
    std::cout<<"31 : Step" <<std::endl;
#endif
    int result31accessVarRef = function31accessVarRef();

            //END IF (bool)VarRef3_7_3_9terminates == false
        }
            
                }
                
                {
                }
                
=======
 //or join node
        Void OrJoinPopped_31;
        queue31.waitAndPop(OrJoinPopped_31);
        
>>>>>>> 0bf961d (correct various funny bugs :))
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    