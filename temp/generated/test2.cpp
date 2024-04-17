
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

void functioninit3Variable(){
	sigma["Variable0_0_0_10currentValue"] = new int();
}
void function5initializeVar(){
	int Variable0_0_0_101376 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Variable0_0_0_101376;
}
void functioninit6Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar(){
	int Variable1_0_1_101376 = 4; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101376;
}
void functioninit9Variable(){
	sigma["Variable2_0_2_10currentValue"] = new int();
}
void function11initializeVar(){
	int Variable2_0_2_101376 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);
                (*((int*)sigma["Variable2_0_2_10currentValue"])) = Variable2_0_2_101376;
}
int function21accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_18_4_201579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_18_4_20terminates =  VarRef4_18_4_201579;
	return VarRef4_18_4_20terminates;
}
int function23accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_13_4_151579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_13_4_15terminates =  VarRef4_13_4_151579;
	return VarRef4_13_4_15terminates;
}
int function25finishPlus(int n2, int n1){
	int Plus4_12_4_214267 = n2;
	int Plus4_12_4_214292 = n1;
	int Plus4_12_4_214411 = n1; // was Plus4_12_4_214292; but using the parameter name now
	int Plus4_12_4_214416 = n2; // was Plus4_12_4_214267; but using the parameter name now
	int Plus4_12_4_214410 = Plus4_12_4_214411 + Plus4_12_4_214416;
	int Plus4_12_4_21terminates =  Plus4_12_4_214410;
	return Plus4_12_4_21terminates;
}
void function26executeAssignment2(int resRight){
	int Assignment4_7_4_212520 = resRight; // was Assignment4_7_4_212354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment4_7_4_212520;
}
int function32accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef5_18_5_201579 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_18_5_20terminates =  VarRef5_18_5_201579;
	return VarRef5_18_5_20terminates;
}
int function34accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef5_13_5_151579 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_13_5_15terminates =  VarRef5_13_5_151579;
	return VarRef5_13_5_15terminates;
}
int function36finishPlus(int n2, int n1){
	int Plus5_12_5_214267 = n2;
	int Plus5_12_5_214292 = n1;
	int Plus5_12_5_214411 = n1; // was Plus5_12_5_214292; but using the parameter name now
	int Plus5_12_5_214416 = n2; // was Plus5_12_5_214267; but using the parameter name now
	int Plus5_12_5_214410 = Plus5_12_5_214411 + Plus5_12_5_214416;
	int Plus5_12_5_21terminates =  Plus5_12_5_214410;
	return Plus5_12_5_21terminates;
}
void function37executeAssignment2(int resRight){
	int Assignment5_7_5_212520 = resRight; // was Assignment5_7_5_212354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment5_7_5_212520;
}
int function41accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_4_7_61579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef7_4_7_6terminates =  VarRef7_4_7_61579;
	return VarRef7_4_7_6terminates;
}
int function52accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef9_15_9_171579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef9_15_9_17terminates =  VarRef9_15_9_171579;
	return VarRef9_15_9_17terminates;
}
int function54accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef9_10_9_121579 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef9_10_9_12terminates =  VarRef9_10_9_121579;
	return VarRef9_10_9_12terminates;
}
int function56finishPlus(int n2, int n1){
	int Plus9_9_9_184267 = n2;
	int Plus9_9_9_184292 = n1;
	int Plus9_9_9_184411 = n1; // was Plus9_9_9_184292; but using the parameter name now
	int Plus9_9_9_184416 = n2; // was Plus9_9_9_184267; but using the parameter name now
	int Plus9_9_9_184410 = Plus9_9_9_184411 + Plus9_9_9_184416;
	int Plus9_9_9_18terminates =  Plus9_9_9_184410;
	return Plus9_9_9_18terminates;
}
void function57executeAssignment2(int resRight){
	int Assignment9_4_9_182520 = resRight; // was Assignment9_4_9_182354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment9_4_9_182520;
}
int function67accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef12_15_12_171579 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef12_15_12_17terminates =  VarRef12_15_12_171579;
	return VarRef12_15_12_17terminates;
}
int function69accessVarRef(){
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef12_10_12_121579 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef12_10_12_12terminates =  VarRef12_10_12_121579;
	return VarRef12_10_12_12terminates;
}
int function71finishPlus(int n2, int n1){
	int Plus12_9_12_184267 = n2;
	int Plus12_9_12_184292 = n1;
	int Plus12_9_12_184411 = n1; // was Plus12_9_12_184292; but using the parameter name now
	int Plus12_9_12_184416 = n2; // was Plus12_9_12_184267; but using the parameter name now
	int Plus12_9_12_184410 = Plus12_9_12_184411 + Plus12_9_12_184416;
	int Plus12_9_12_18terminates =  Plus12_9_12_184410;
	return Plus12_9_12_18terminates;
}
void function72executeAssignment2(int resRight){
	int Assignment12_4_12_182520 = resRight; // was Assignment12_4_12_182354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment12_4_12_182520;
}
bool function81evalBooleanConst(){
	sigma["BooleanConst16_6_16_10constantValue"] = new bool(true);
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	bool BooleanConst16_6_16_104630 = *(bool *) sigma["BooleanConst16_6_16_10constantValue"];//constantValue}
	bool BooleanConst16_6_16_10terminates =  BooleanConst16_6_16_104630;
	return BooleanConst16_6_16_10terminates;
}
bool function83evalBooleanConst(){
	sigma["BooleanConst16_14_16_19constantValue"] = new bool(false);
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	bool BooleanConst16_14_16_194630 = *(bool *) sigma["BooleanConst16_14_16_19constantValue"];//constantValue}
	bool BooleanConst16_14_16_19terminates =  BooleanConst16_14_16_194630;
	return BooleanConst16_14_16_19terminates;
}
bool function85evaluateConjunction2(){
	bool Conjunction16_5_16_20terminates =  false;
	return Conjunction16_5_16_20terminates;
}
bool function86evaluateConjunction3(){
	bool Conjunction16_5_16_20terminates =  false;
	return Conjunction16_5_16_20terminates;
}
bool function88evaluateConjunction4(){
	bool Conjunction16_5_16_20terminates =  true;
	return Conjunction16_5_16_20terminates;
}
void function89executeAssignment2(int resRight){
	int Assignment16_0_16_202520 = resRight; // was Assignment16_0_16_202354; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
                const std::lock_guard<std::mutex> lock(sigma_mutex);                                    
                (*((int*)sigma["Variable2_0_2_10currentValue"])) = Assignment16_0_16_202520;
}

int main() {
    functioninit3Variable();
function5initializeVar();
functioninit6Variable();
function8initializeVar();
functioninit9Variable();
function11initializeVar();

            LockingQueue<int> queue25;         
            LockingQueue<Void> queue15;
            LockingQueue<int> queue56;         
            LockingQueue<Void> queue74;
            LockingQueue<bool> queue79;
            LockingQueue<bool> queue87;
            std::thread thread16([&](){

            std::thread thread21([&](){
int result21accessVarRef = function21accessVarRef();
{

            queue25.push(result21accessVarRef);
                }

            });
            thread21.detach();
                
            std::thread thread23([&](){
int result23accessVarRef = function23accessVarRef();
{

            queue25.push(result23accessVarRef);
                }

            });
            thread23.detach();
                
        //start of and join node
        
        int AndJoinPopped_25_0;
        queue25.waitAndPop(AndJoinPopped_25_0);
            
        int AndJoinPopped_25_1;
        queue25.waitAndPop(AndJoinPopped_25_1);
            int result25finishPlus = function25finishPlus(AndJoinPopped_25_0, AndJoinPopped_25_1);

        //end of and join node
        function26executeAssignment2(result25finishPlus);
{

            Void fakeParam15;
            queue15.push(fakeParam15);
                }

            });
            thread16.detach();
                
            std::thread thread27([&](){

            LockingQueue<int> queue36;
            std::thread thread32([&](){
int result32accessVarRef = function32accessVarRef();
{

            queue36.push(result32accessVarRef);
                }

            });
            thread32.detach();
                
            std::thread thread34([&](){
int result34accessVarRef = function34accessVarRef();
{

            queue36.push(result34accessVarRef);
                }

            });
            thread34.detach();
                
        //start of and join node
        
        int AndJoinPopped_36_0;
        queue36.waitAndPop(AndJoinPopped_36_0);
            
        int AndJoinPopped_36_1;
        queue36.waitAndPop(AndJoinPopped_36_1);
            int result36finishPlus = function36finishPlus(AndJoinPopped_36_0, AndJoinPopped_36_1);

        //end of and join node
        function37executeAssignment2(result36finishPlus);
{

            Void fakeParam15;
            queue15.push(fakeParam15);
                }

            });
            thread27.detach();
                
        //start of and join node
        
        Void AndJoinPopped_15_0;
        queue15.waitAndPop(AndJoinPopped_15_0);
            
        Void AndJoinPopped_15_1;
        queue15.waitAndPop(AndJoinPopped_15_1);
            
        //end of and join node
        int result41accessVarRef = function41accessVarRef();

        int VarRef7_4_7_6terminates = result41accessVarRef;//Choice node
        if((bool)VarRef7_4_7_6terminates == true){
            std::thread thread52([&](){
int result52accessVarRef = function52accessVarRef();
{

            queue56.push(result52accessVarRef);
                }

            });
            thread52.detach();
                
            std::thread thread54([&](){
int result54accessVarRef = function54accessVarRef();
{

            queue56.push(result54accessVarRef);
                }

            });
            thread54.detach();
                
        //start of and join node
        
        int AndJoinPopped_56_0;
        queue56.waitAndPop(AndJoinPopped_56_0);
            
        int AndJoinPopped_56_1;
        queue56.waitAndPop(AndJoinPopped_56_1);
            int result56finishPlus = function56finishPlus(AndJoinPopped_56_0, AndJoinPopped_56_1);

        //end of and join node
        function57executeAssignment2(result56finishPlus);
{

            Void fakeParam74;
            queue74.push(fakeParam74);
                }

            //END IF (bool)VarRef7_4_7_6terminates == true
        }
            //Choice node
        if((bool)VarRef7_4_7_6terminates == false){
            LockingQueue<int> queue71;
            std::thread thread67([&](){
int result67accessVarRef = function67accessVarRef();
{

            queue71.push(result67accessVarRef);
                }

            });
            thread67.detach();
                
            std::thread thread69([&](){
int result69accessVarRef = function69accessVarRef();
{

            queue71.push(result69accessVarRef);
                }

            });
            thread69.detach();
                
        //start of and join node
        
        int AndJoinPopped_71_0;
        queue71.waitAndPop(AndJoinPopped_71_0);
            
        int AndJoinPopped_71_1;
        queue71.waitAndPop(AndJoinPopped_71_1);
            int result71finishPlus = function71finishPlus(AndJoinPopped_71_0, AndJoinPopped_71_1);

        //end of and join node
        function72executeAssignment2(result71finishPlus);
{

            Void fakeParam74;
            queue74.push(fakeParam74);
                }

            //END IF (bool)VarRef7_4_7_6terminates == false
        }
             //or join node
        Void OrJoinPopped_74;
        queue74.waitAndPop(OrJoinPopped_74);
        
            std::thread thread81([&](){
bool result81evalBooleanConst = function81evalBooleanConst();
{

            queue87.push(result81evalBooleanConst);
                }

                {
        bool BooleanConst16_6_16_10terminates = result81evalBooleanConst;//Choice node
        if((bool)BooleanConst16_6_16_10terminates == false){bool result85evaluateConjunction2 = function85evaluateConjunction2();
{

            queue79.push(result85evaluateConjunction2);
                }

            //END IF (bool)BooleanConst16_6_16_10terminates == false
        }
            
                }
                
                {
                }
                
            });
            thread81.detach();
                
            std::thread thread83([&](){
bool result83evalBooleanConst = function83evalBooleanConst();
{

            queue87.push(result83evalBooleanConst);
                }

                {
        bool BooleanConst16_14_16_19terminates = result83evalBooleanConst;//Choice node
        if((bool)BooleanConst16_14_16_19terminates == false){bool result86evaluateConjunction3 = function86evaluateConjunction3();
{

            queue79.push(result86evaluateConjunction3);
                }

            //END IF (bool)BooleanConst16_14_16_19terminates == false
        }
            
                }
                
                {
                }
                
            });
            thread83.detach();
                
        //start of and join node
        
        bool AndJoinPopped_87_0;
        queue87.waitAndPop(AndJoinPopped_87_0);
            
        bool AndJoinPopped_87_1;
        queue87.waitAndPop(AndJoinPopped_87_1);
            
        //end of and join node
        
        bool BooleanConst16_6_16_10terminates = AndJoinPopped_87_0;
        bool BooleanConst16_14_16_19terminates = AndJoinPopped_87_1;//Choice node
        if((bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_19terminates == true){bool result88evaluateConjunction4 = function88evaluateConjunction4();
{

            queue79.push(result88evaluateConjunction4);
                }

            //END IF (bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_19terminates == true
        }
             //or join node
        bool OrJoinPopped_79;
        queue79.waitAndPop(OrJoinPopped_79);
        function89executeAssignment2(OrJoinPopped_79);

    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    