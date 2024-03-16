
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
	int Variable1_0_1_101385 = 4; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101385;
}
void functioninit13Variable(){
	sigma["Variable2_0_2_10currentValue"] = new int();
}
void function15initializeVar(){
	int Variable2_0_2_101385 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable2_0_2_10currentValue"])) = Variable2_0_2_101385;
}
void function17startsParallelBloc(){
	
}
void function20finishParallelBloc(){
	
}
void function22executeAssignment(){
	
}
void function25startPlus(){
	
}
int function29accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_18_4_201588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_18_4_20terminates =  VarRef4_18_4_201588;
	return VarRef4_18_4_20terminates;
}
int function32accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_13_4_151588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_13_4_15terminates =  VarRef4_13_4_151588;
	return VarRef4_13_4_15terminates;
}
int function34finishPlus(int n2, int n1){
	int Plus4_12_4_214279 = n2;
	int Plus4_12_4_214304 = n1;
	int Plus4_12_4_214423 = n1; // was Plus4_12_4_214304; but using the parameter name now
	int Plus4_12_4_214428 = n2; // was Plus4_12_4_214279; but using the parameter name now
	int Plus4_12_4_214422 = Plus4_12_4_214428 + Plus4_12_4_214428;
	int Plus4_12_4_21terminates =  Plus4_12_4_214422;
	return Plus4_12_4_21terminates;
}
void function35executeAssignment2(int resRight){
	int Assignment4_7_4_212529 = resRight; // was Assignment4_7_4_212363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment4_7_4_212529;
}
void function37executeAssignment(){
	
}
void function40startPlus(){
	
}
int function44accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef5_18_5_201588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_18_5_20terminates =  VarRef5_18_5_201588;
	return VarRef5_18_5_20terminates;
}
int function47accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef5_13_5_151588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_13_5_15terminates =  VarRef5_13_5_151588;
	return VarRef5_13_5_15terminates;
}
int function49finishPlus(int n2, int n1){
	int Plus5_12_5_214279 = n2;
	int Plus5_12_5_214304 = n1;
	int Plus5_12_5_214423 = n1; // was Plus5_12_5_214304; but using the parameter name now
	int Plus5_12_5_214428 = n2; // was Plus5_12_5_214279; but using the parameter name now
	int Plus5_12_5_214422 = Plus5_12_5_214428 + Plus5_12_5_214428;
	int Plus5_12_5_21terminates =  Plus5_12_5_214422;
	return Plus5_12_5_21terminates;
}
void function50executeAssignment2(int resRight){
	int Assignment5_7_5_212529 = resRight; // was Assignment5_7_5_212363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment5_7_5_212529;
}
void function53condStart(){
	
}
int function56accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_4_7_61588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef7_4_7_6terminates =  VarRef7_4_7_61588;
	return VarRef7_4_7_6terminates;
}
void function58condFalseStart(){
	
}
void function64executeAssignment(){
	
}
void function65finishBloc(){
	
}
int function67accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef9_9_9_111588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef9_9_9_11terminates =  VarRef9_9_9_111588;
	return VarRef9_9_9_11terminates;
}
void function69executeAssignment2(int resRight){
	int Assignment9_4_9_112529 = resRight; // was Assignment9_4_9_112363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment9_4_9_112529;
}
void function75executeAssignment(){
	
}
void function76finishBloc(){
	
}
int function78accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef12_9_12_111588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef12_9_12_11terminates =  VarRef12_9_12_111588;
	return VarRef12_9_12_11terminates;
}
void function80executeAssignment2(int resRight){
	int Assignment12_4_12_112529 = resRight; // was Assignment12_4_12_112363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment12_4_12_112529;
}
void function81condStop(){
	
}
void function83executeAssignment(){
	
}
void function84finishModel(){
	
}
void function86evaluateConjunction(){
	
}
bool function90evalBooleanConst(){
	sigma["BooleanConst16_6_16_10constantValue"] = new bool(true);
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	bool BooleanConst16_6_16_104642 = *(bool *) sigma["BooleanConst16_6_16_10constantValue"];//constantValue}
	bool BooleanConst16_6_16_10terminates =  BooleanConst16_6_16_104642;
	return BooleanConst16_6_16_10terminates;
}
void function92evaluateConjunction3(){
	
}
bool function94evalBooleanConst(){
	sigma["BooleanConst16_14_16_18constantValue"] = new bool(true);
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	bool BooleanConst16_14_16_184642 = *(bool *) sigma["BooleanConst16_14_16_18constantValue"];//constantValue}
	bool BooleanConst16_14_16_18terminates =  BooleanConst16_14_16_184642;
	return BooleanConst16_14_16_18terminates;
}
void function95evaluateConjunction4(){
	
}
void function96executeAssignment2(int resRight){
	int Assignment16_0_16_192529 = resRight; // was Assignment16_0_16_192363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable2_0_2_10currentValue"])) = Assignment16_0_16_192529;
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

#if DEBUG
    std::cout<<"14 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"17 : Step" <<std::endl;
#endif
    function17startsParallelBloc();
         
        LockingQueue<Void> queue20;
        std::thread thread22([&](){

#if DEBUG
    std::cout<<"22 : Step" <<std::endl;
#endif
    function22executeAssignment();

#if DEBUG
    std::cout<<"25 : Step" <<std::endl;
#endif
    function25startPlus();

        LockingQueue<int> queue34;
        std::thread thread29([&](){

#if DEBUG
    std::cout<<"29 : Step" <<std::endl;
#endif
    int result29accessVarRef = function29accessVarRef();

            queue34.push(result29accessVarRef);
                
#if DEBUG
    std::cout<<"30 : Step" <<std::endl;
#endif
    
        });
        thread29.detach();
            
        std::thread thread32([&](){

#if DEBUG
    std::cout<<"32 : Step" <<std::endl;
#endif
    int result32accessVarRef = function32accessVarRef();

            queue34.push(result32accessVarRef);
                
#if DEBUG
    std::cout<<"33 : Step" <<std::endl;
#endif
    
        });
        thread32.detach();
            
        //start of and join node
        
        int AndJoinPopped_34_0;
        queue34.waitAndPop(AndJoinPopped_34_0);
            
        int AndJoinPopped_34_1;
        queue34.waitAndPop(AndJoinPopped_34_1);
            
#if DEBUG
    std::cout<<"34 : AndJoin" <<std::endl;
#endif
    int result34finishPlus = function34finishPlus(AndJoinPopped_34_0, AndJoinPopped_34_1);

        //end of and join node
        
#if DEBUG
    std::cout<<"26 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"35 : Step" <<std::endl;
#endif
    function35executeAssignment2(result34finishPlus);

            Void fakeParam20;
            queue20.push(fakeParam20);
                
#if DEBUG
    std::cout<<"23 : Step" <<std::endl;
#endif
    
        });
        thread22.detach();
            
        std::thread thread37([&](){

#if DEBUG
    std::cout<<"37 : Step" <<std::endl;
#endif
    function37executeAssignment();

#if DEBUG
    std::cout<<"40 : Step" <<std::endl;
#endif
    function40startPlus();

        LockingQueue<int> queue49;
        std::thread thread44([&](){

#if DEBUG
    std::cout<<"44 : Step" <<std::endl;
#endif
    int result44accessVarRef = function44accessVarRef();

            queue49.push(result44accessVarRef);
                
#if DEBUG
    std::cout<<"45 : Step" <<std::endl;
#endif
    
        });
        thread44.detach();
            
        std::thread thread47([&](){

#if DEBUG
    std::cout<<"47 : Step" <<std::endl;
#endif
    int result47accessVarRef = function47accessVarRef();

            queue49.push(result47accessVarRef);
                
#if DEBUG
    std::cout<<"48 : Step" <<std::endl;
#endif
    
        });
        thread47.detach();
            
        //start of and join node
        
        int AndJoinPopped_49_0;
        queue49.waitAndPop(AndJoinPopped_49_0);
            
        int AndJoinPopped_49_1;
        queue49.waitAndPop(AndJoinPopped_49_1);
            
#if DEBUG
    std::cout<<"49 : AndJoin" <<std::endl;
#endif
    int result49finishPlus = function49finishPlus(AndJoinPopped_49_0, AndJoinPopped_49_1);

        //end of and join node
        
#if DEBUG
    std::cout<<"41 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"50 : Step" <<std::endl;
#endif
    function50executeAssignment2(result49finishPlus);

            Void fakeParam20;
            queue20.push(fakeParam20);
                
#if DEBUG
    std::cout<<"38 : Step" <<std::endl;
#endif
    
        });
        thread37.detach();
            
        //start of and join node
        
        Void AndJoinPopped_20_0;
        queue20.waitAndPop(AndJoinPopped_20_0);
            
        Void AndJoinPopped_20_1;
        queue20.waitAndPop(AndJoinPopped_20_1);
            
#if DEBUG
    std::cout<<"20 : AndJoin" <<std::endl;
#endif
    function20finishParallelBloc();

        //end of and join node
        
#if DEBUG
    std::cout<<"18 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"53 : Step" <<std::endl;
#endif
    function53condStart();

#if DEBUG
    std::cout<<"56 : Step" <<std::endl;
#endif
    int result56accessVarRef = function56accessVarRef();

#if DEBUG
    std::cout<<"57 : Step" <<std::endl;
#endif
    
        LockingQueue<Void> queue81;
        
        int VarRef7_4_7_6terminates = result56accessVarRef;//Choice node
        if((bool)VarRef7_4_7_6terminates == true){
#if DEBUG
    std::cout<<"58 : Choice" <<std::endl;
#endif
    function58condFalseStart();

#if DEBUG
    std::cout<<"60 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"62 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"64 : Step" <<std::endl;
#endif
    function64executeAssignment();

#if DEBUG
    std::cout<<"67 : Step" <<std::endl;
#endif
    int result67accessVarRef = function67accessVarRef();

#if DEBUG
    std::cout<<"68 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"69 : Step" <<std::endl;
#endif
    function69executeAssignment2(result67accessVarRef);

            Void fakeParam81;
            queue81.push(fakeParam81);
                
#if DEBUG
    std::cout<<"65 : Step" <<std::endl;
#endif
    function65finishBloc();

#if DEBUG
    std::cout<<"61 : Step" <<std::endl;
#endif
    
            //END IF (bool)VarRef7_4_7_6terminates == true
        }
            //Choice node
        if((bool)VarRef7_4_7_6terminates == false){
#if DEBUG
    std::cout<<"58 : Choice" <<std::endl;
#endif
    function58condFalseStart();

#if DEBUG
    std::cout<<"71 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"73 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"75 : Step" <<std::endl;
#endif
    function75executeAssignment();

#if DEBUG
    std::cout<<"78 : Step" <<std::endl;
#endif
    int result78accessVarRef = function78accessVarRef();

#if DEBUG
    std::cout<<"79 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"80 : Step" <<std::endl;
#endif
    function80executeAssignment2(result78accessVarRef);

            Void fakeParam81;
            queue81.push(fakeParam81);
                
#if DEBUG
    std::cout<<"76 : Step" <<std::endl;
#endif
    function76finishBloc();

#if DEBUG
    std::cout<<"72 : Step" <<std::endl;
#endif
    
            //END IF (bool)VarRef7_4_7_6terminates == false
        }
             //or join node
        Void OrJoinPopped_81;
        queue81.waitAndPop(OrJoinPopped_81);
        
#if DEBUG
    std::cout<<"54 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"83 : Step" <<std::endl;
#endif
    function83executeAssignment();

#if DEBUG
    std::cout<<"86 : Step" <<std::endl;
#endif
    function86evaluateConjunction();

#if DEBUG
    std::cout<<"90 : Step" <<std::endl;
#endif
    bool result90evalBooleanConst = function90evalBooleanConst();

#if DEBUG
    std::cout<<"91 : Step" <<std::endl;
#endif
    
        LockingQueue<bool> queue88;
        
        bool BooleanConst16_6_16_10terminates = result90evalBooleanConst;//Choice node
        if((bool)BooleanConst16_6_16_10terminates == true){
#if DEBUG
    std::cout<<"92 : Choice" <<std::endl;
#endif
    function92evaluateConjunction3();

#if DEBUG
    std::cout<<"94 : Step" <<std::endl;
#endif
    bool result94evalBooleanConst = function94evalBooleanConst();

            queue88.push(result94evalBooleanConst);
                
#if DEBUG
    std::cout<<"95 : Step" <<std::endl;
#endif
    function95evaluateConjunction4();

            //END IF (bool)BooleanConst16_6_16_10terminates == true
        }
            //Choice node
        if((bool)BooleanConst16_6_16_10terminates == false){
#if DEBUG
    std::cout<<"92 : Choice" <<std::endl;
#endif
    function92evaluateConjunction3();

            queue88.push(result90evalBooleanConst);
                
            //END IF (bool)BooleanConst16_6_16_10terminates == false
        }
             //or join node
        bool OrJoinPopped_88;
        queue88.waitAndPop(OrJoinPopped_88);
        
#if DEBUG
    std::cout<<"87 : Step" <<std::endl;
#endif
    
#if DEBUG
    std::cout<<"96 : Step" <<std::endl;
#endif
    function96executeAssignment2(OrJoinPopped_88);

#if DEBUG
    std::cout<<"84 : Step" <<std::endl;
#endif
    function84finishModel();

    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    