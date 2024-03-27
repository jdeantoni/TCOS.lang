
#include <string>
#include <unordered_map>
#include <thread>
#include <mutex>
#include <iostream>
#include <chrono>
#include "../utils/LockingQueue.hpp"

using namespace std::chrono_literals;

class Void{
};

std::unordered_map<std::string, void*> sigma;
std::mutex sigma_mutex;  // protects sigma

void functioninit5Variable(){
	sigma["Variable0_0_0_10currentValue"] = new int();
}
void function7initializeVar(){
	int Variable0_0_0_101376 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Variable0_0_0_101376;
}
void functioninit9Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function11initializeVar(){
	int Variable1_0_1_101376 = 4; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101376;
}
void functioninit13Variable(){
	sigma["Variable2_0_2_10currentValue"] = new int();
}
void function15initializeVar(){
	int Variable2_0_2_101376 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable2_0_2_10currentValue"])) = Variable2_0_2_101376;
}
int function29accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_18_4_201579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_18_4_20terminates =  VarRef4_18_4_201579;
	return VarRef4_18_4_20terminates;
}
int function32accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_13_4_151579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_13_4_15terminates =  VarRef4_13_4_151579;
	return VarRef4_13_4_15terminates;
}
int function34finishPlus(int n2, int n1){
	int Plus4_12_4_214267 = n2;
	int Plus4_12_4_214292 = n1;
	int Plus4_12_4_214411 = n1; // was Plus4_12_4_214292; but using the parameter name now
	int Plus4_12_4_214416 = n2; // was Plus4_12_4_214267; but using the parameter name now
	int Plus4_12_4_214410 = Plus4_12_4_214411 + Plus4_12_4_214416;
	int Plus4_12_4_21terminates =  Plus4_12_4_214410;
	return Plus4_12_4_21terminates;
}
void function35executeAssignment2(int resRight){
	int Assignment4_7_4_212520 = resRight; // was Assignment4_7_4_212354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment4_7_4_212520;
}
int function44accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef5_18_5_201579 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_18_5_20terminates =  VarRef5_18_5_201579;
	return VarRef5_18_5_20terminates;
}
int function47accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef5_13_5_151579 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_13_5_15terminates =  VarRef5_13_5_151579;
	return VarRef5_13_5_15terminates;
}
int function49finishPlus(int n2, int n1){
	int Plus5_12_5_214267 = n2;
	int Plus5_12_5_214292 = n1;
	int Plus5_12_5_214411 = n1; // was Plus5_12_5_214292; but using the parameter name now
	int Plus5_12_5_214416 = n2; // was Plus5_12_5_214267; but using the parameter name now
	int Plus5_12_5_214410 = Plus5_12_5_214411 + Plus5_12_5_214416;
	int Plus5_12_5_21terminates =  Plus5_12_5_214410;
	return Plus5_12_5_21terminates;
}
void function50executeAssignment2(int resRight){
	int Assignment5_7_5_212520 = resRight; // was Assignment5_7_5_212354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment5_7_5_212520;
}
int function56accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_4_7_61579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef7_4_7_6terminates =  VarRef7_4_7_61579;
	return VarRef7_4_7_6terminates;
}
int function71accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef9_15_9_171579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef9_15_9_17terminates =  VarRef9_15_9_171579;
	return VarRef9_15_9_17terminates;
}
int function74accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef9_10_9_121579 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef9_10_9_12terminates =  VarRef9_10_9_121579;
	return VarRef9_10_9_12terminates;
}
int function76finishPlus(int n2, int n1){
	int Plus9_9_9_184267 = n2;
	int Plus9_9_9_184292 = n1;
	int Plus9_9_9_184411 = n1; // was Plus9_9_9_184292; but using the parameter name now
	int Plus9_9_9_184416 = n2; // was Plus9_9_9_184267; but using the parameter name now
	int Plus9_9_9_184410 = Plus9_9_9_184411 + Plus9_9_9_184416;
	int Plus9_9_9_18terminates =  Plus9_9_9_184410;
	return Plus9_9_9_18terminates;
}
void function77executeAssignment2(int resRight){
	int Assignment9_4_9_182520 = resRight; // was Assignment9_4_9_182354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment9_4_9_182520;
}
int function91accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef12_15_12_171579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef12_15_12_17terminates =  VarRef12_15_12_171579;
	return VarRef12_15_12_17terminates;
}
int function94accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef12_10_12_121579 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef12_10_12_12terminates =  VarRef12_10_12_121579;
	return VarRef12_10_12_12terminates;
}
int function96finishPlus(int n2, int n1){
	int Plus12_9_12_184267 = n2;
	int Plus12_9_12_184292 = n1;
	int Plus12_9_12_184411 = n1; // was Plus12_9_12_184292; but using the parameter name now
	int Plus12_9_12_184416 = n2; // was Plus12_9_12_184267; but using the parameter name now
	int Plus12_9_12_184410 = Plus12_9_12_184411 + Plus12_9_12_184416;
	int Plus12_9_12_18terminates =  Plus12_9_12_184410;
	return Plus12_9_12_18terminates;
}
void function97executeAssignment2(int resRight){
	int Assignment12_4_12_182520 = resRight; // was Assignment12_4_12_182354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment12_4_12_182520;
}
bool function109evalBooleanConst(){
	sigma["BooleanConst16_6_16_10constantValue"] = new bool(true);
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	bool BooleanConst16_6_16_104630 = *(bool *) sigma["BooleanConst16_6_16_10constantValue"];//constantValue}
	bool BooleanConst16_6_16_10terminates =  BooleanConst16_6_16_104630;
	return BooleanConst16_6_16_10terminates;
}
bool function112evalBooleanConst(){
	sigma["BooleanConst16_14_16_19constantValue"] = new bool(false);
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	bool BooleanConst16_14_16_194630 = *(bool *) sigma["BooleanConst16_14_16_19constantValue"];//constantValue}
	bool BooleanConst16_14_16_19terminates =  BooleanConst16_14_16_194630;
	return BooleanConst16_14_16_19terminates;
}
bool function114evaluateConjunction2(){
	bool Conjunction16_5_16_20terminates =  false;
	return Conjunction16_5_16_20terminates;
}
bool function115evaluateConjunction3(){
	bool Conjunction16_5_16_20terminates =  false;
	return Conjunction16_5_16_20terminates;
}
bool function117evaluateConjunction4(){
	bool Conjunction16_5_16_20terminates =  true;
	return Conjunction16_5_16_20terminates;
}
void function118executeAssignment2(int resRight){
	int Assignment16_0_16_202520 = resRight; // was Assignment16_0_16_202354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable2_0_2_10currentValue"])) = Assignment16_0_16_202520;
}

int main() {
    functioninit5Variable();
function7initializeVar();
functioninit9Variable();
function11initializeVar();
functioninit13Variable();
function15initializeVar();
         
            LockingQueue<Void> queue20;
            std::thread thread22([&](){

            LockingQueue<int> queue34;
            std::thread thread29([&](){
int result29accessVarRef = function29accessVarRef();
{

            queue34.push(result29accessVarRef);
                }

            });
            thread29.detach();
                
            std::thread thread32([&](){
int result32accessVarRef = function32accessVarRef();
{

            queue34.push(result32accessVarRef);
                }

            });
            thread32.detach();
                
        //start of and join node
        
        int AndJoinPopped_34_0;
        queue34.waitAndPop(AndJoinPopped_34_0);
            
        int AndJoinPopped_34_1;
        queue34.waitAndPop(AndJoinPopped_34_1);
            int result34finishPlus = function34finishPlus(AndJoinPopped_34_0, AndJoinPopped_34_1);

        //end of and join node
        function35executeAssignment2(result34finishPlus);
{

            Void fakeParam20;
            queue20.push(fakeParam20);
                }

            });
            thread22.detach();
                
            std::thread thread37([&](){

            LockingQueue<int> queue49;
            std::thread thread44([&](){
int result44accessVarRef = function44accessVarRef();
{

            queue49.push(result44accessVarRef);
                }

            });
            thread44.detach();
                
            std::thread thread47([&](){
int result47accessVarRef = function47accessVarRef();
{

            queue49.push(result47accessVarRef);
                }

            });
            thread47.detach();
                
        //start of and join node
        
        int AndJoinPopped_49_0;
        queue49.waitAndPop(AndJoinPopped_49_0);
            
        int AndJoinPopped_49_1;
        queue49.waitAndPop(AndJoinPopped_49_1);
            int result49finishPlus = function49finishPlus(AndJoinPopped_49_0, AndJoinPopped_49_1);

        //end of and join node
        function50executeAssignment2(result49finishPlus);
{

            Void fakeParam20;
            queue20.push(fakeParam20);
                }

            });
            thread37.detach();
                
        //start of and join node
        
        Void AndJoinPopped_20_0;
        queue20.waitAndPop(AndJoinPopped_20_0);
            
        Void AndJoinPopped_20_1;
        queue20.waitAndPop(AndJoinPopped_20_1);
            
        //end of and join node
        int result56accessVarRef = function56accessVarRef();

        LockingQueue<Void> queue99;
            
        int VarRef7_4_7_6terminates = result56accessVarRef;//Choice node
        if((bool)VarRef7_4_7_6terminates == true){
            LockingQueue<int> queue76;
            std::thread thread71([&](){
int result71accessVarRef = function71accessVarRef();
{

            queue76.push(result71accessVarRef);
                }

            });
            thread71.detach();
                
            std::thread thread74([&](){
int result74accessVarRef = function74accessVarRef();
{

            queue76.push(result74accessVarRef);
                }

            });
            thread74.detach();
                
        //start of and join node
        
        int AndJoinPopped_76_0;
        queue76.waitAndPop(AndJoinPopped_76_0);
            
        int AndJoinPopped_76_1;
        queue76.waitAndPop(AndJoinPopped_76_1);
            int result76finishPlus = function76finishPlus(AndJoinPopped_76_0, AndJoinPopped_76_1);

        //end of and join node
        function77executeAssignment2(result76finishPlus);
{

            Void fakeParam99;
            queue99.push(fakeParam99);
                }

            //END IF (bool)VarRef7_4_7_6terminates == true
        }
            //Choice node
        if((bool)VarRef7_4_7_6terminates == false){
            LockingQueue<int> queue96;
            std::thread thread91([&](){
int result91accessVarRef = function91accessVarRef();
{

            queue96.push(result91accessVarRef);
                }

            });
            thread91.detach();
                
            std::thread thread94([&](){
int result94accessVarRef = function94accessVarRef();
{

            queue96.push(result94accessVarRef);
                }

            });
            thread94.detach();
                
        //start of and join node
        
        int AndJoinPopped_96_0;
        queue96.waitAndPop(AndJoinPopped_96_0);
            
        int AndJoinPopped_96_1;
        queue96.waitAndPop(AndJoinPopped_96_1);
            int result96finishPlus = function96finishPlus(AndJoinPopped_96_0, AndJoinPopped_96_1);

        //end of and join node
        function97executeAssignment2(result96finishPlus);
{

            Void fakeParam99;
            queue99.push(fakeParam99);
                }

            //END IF (bool)VarRef7_4_7_6terminates == false
        }
             //or join node
        Void OrJoinPopped_99;
        queue99.waitAndPop(OrJoinPopped_99);
        
            LockingQueue<bool> queue106;
            LockingQueue<bool> queue116;
            std::thread thread109([&](){
bool result109evalBooleanConst = function109evalBooleanConst();
{

            queue116.push(result109evalBooleanConst);
                }

                {
        bool BooleanConst16_6_16_10terminates = result109evalBooleanConst;//Choice node
        if((bool)BooleanConst16_6_16_10terminates == false){bool result114evaluateConjunction2 = function114evaluateConjunction2();
{

            queue106.push(result114evaluateConjunction2);
                }

            //END IF (bool)BooleanConst16_6_16_10terminates == false
        }
            
                }
                
                {
                }
                
            });
            thread109.detach();
                
            std::thread thread112([&](){
bool result112evalBooleanConst = function112evalBooleanConst();
{

            queue116.push(result112evalBooleanConst);
                }

                {
        bool BooleanConst16_14_16_19terminates = result112evalBooleanConst;//Choice node
        if((bool)BooleanConst16_14_16_19terminates == false){bool result115evaluateConjunction3 = function115evaluateConjunction3();
{

            queue106.push(result115evaluateConjunction3);
                }

            //END IF (bool)BooleanConst16_14_16_19terminates == false
        }
            
                }
                
                {
                }
                
            });
            thread112.detach();
                
        //start of and join node
        
        bool AndJoinPopped_116_0;
        queue116.waitAndPop(AndJoinPopped_116_0);
            
        bool AndJoinPopped_116_1;
        queue116.waitAndPop(AndJoinPopped_116_1);
            
        //end of and join node
        
        bool BooleanConst16_6_16_10terminates = AndJoinPopped_116_0;
        bool BooleanConst16_14_16_19terminates = AndJoinPopped_116_1;//Choice node
        if((bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_19terminates == true){bool result117evaluateConjunction4 = function117evaluateConjunction4();
{

            queue106.push(result117evaluateConjunction4);
                }

            //END IF (bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_19terminates == true
        }
             //or join node
        bool OrJoinPopped_106;
        queue106.waitAndPop(OrJoinPopped_106);
        function118executeAssignment2(OrJoinPopped_106);

    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    