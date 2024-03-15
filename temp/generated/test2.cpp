
#include <string>
#include <unordered_map>
#include <thread>
#include <iostream>
#include "../utils/LockingQueue.hpp"
    
class Void{
};
std::unordered_map<std::string, void*> sigma;


void functioninit5Variable(){
	sigma["Variable0_0_0_10currentValue"] = new int();
}
void function7initializeVar(){
	int Variable0_0_0_101385 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
	(*((int*)sigma["Variable0_0_0_10currentValue"])) = Variable0_0_0_101385;
}
void functioninit9Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function11initializeVar(){
	int Variable1_0_1_101385 = 4; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
	(*((int*)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101385;
}
void functioninit13Variable(){
	sigma["Variable2_0_2_10currentValue"] = new int();
}
void function15initializeVar(){
	int Variable2_0_2_101385 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
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
	int VarRef4_18_4_201588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_18_4_20terminates =  VarRef4_18_4_201588;
	return VarRef4_18_4_20terminates;
}
int function32accessVarRef(){
	int VarRef4_13_4_151588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_13_4_15terminates =  VarRef4_13_4_151588;
	return VarRef4_13_4_15terminates;
}
int function34finishPlus(int n2, int n1){
	int Plus4_12_4_214276 = n2;
	int Plus4_12_4_214301 = n1;
	int Plus4_12_4_214420 = n1; // was Plus4_12_4_214301; but using the parameter name now
	int Plus4_12_4_214425 = n2; // was Plus4_12_4_214276; but using the parameter name now
	int Plus4_12_4_214419 = Plus4_12_4_214425 + Plus4_12_4_214425;
	int Plus4_12_4_21terminates =  Plus4_12_4_214419;
	return Plus4_12_4_21terminates;
}
void function35executeAssignment2(int resRight){
	int Assignment4_7_4_212529 = resRight; // was Assignment4_7_4_212363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
	(*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment4_7_4_212529;
}
void function37executeAssignment(){
	
}
void function40startPlus(){
	
}
int function44accessVarRef(){
	int VarRef5_18_5_201588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_18_5_20terminates =  VarRef5_18_5_201588;
	return VarRef5_18_5_20terminates;
}
int function47accessVarRef(){
	int VarRef5_13_5_151588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_13_5_15terminates =  VarRef5_13_5_151588;
	return VarRef5_13_5_15terminates;
}
int function49finishPlus(int n2, int n1){
	int Plus5_12_5_214276 = n2;
	int Plus5_12_5_214301 = n1;
	int Plus5_12_5_214420 = n1; // was Plus5_12_5_214301; but using the parameter name now
	int Plus5_12_5_214425 = n2; // was Plus5_12_5_214276; but using the parameter name now
	int Plus5_12_5_214419 = Plus5_12_5_214425 + Plus5_12_5_214425;
	int Plus5_12_5_21terminates =  Plus5_12_5_214419;
	return Plus5_12_5_21terminates;
}
void function50executeAssignment2(int resRight){
	int Assignment5_7_5_212529 = resRight; // was Assignment5_7_5_212363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
	(*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment5_7_5_212529;
}
void function53condStart(){
	
}
int function56accessVarRef(){
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
void function67startPlus(){
	
}
int function71accessVarRef(){
	int VarRef9_14_9_161588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef9_14_9_16terminates =  VarRef9_14_9_161588;
	return VarRef9_14_9_16terminates;
}
int function74accessVarRef(){
	int VarRef9_9_9_111588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef9_9_9_11terminates =  VarRef9_9_9_111588;
	return VarRef9_9_9_11terminates;
}
int function76finishPlus(int n2, int n1){
	int Plus9_8_9_174276 = n2;
	int Plus9_8_9_174301 = n1;
	int Plus9_8_9_174420 = n1; // was Plus9_8_9_174301; but using the parameter name now
	int Plus9_8_9_174425 = n2; // was Plus9_8_9_174276; but using the parameter name now
	int Plus9_8_9_174419 = Plus9_8_9_174425 + Plus9_8_9_174425;
	int Plus9_8_9_17terminates =  Plus9_8_9_174419;
	return Plus9_8_9_17terminates;
}
void function77executeAssignment2(int resRight){
	int Assignment9_4_9_172529 = resRight; // was Assignment9_4_9_172363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
	(*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment9_4_9_172529;
}
void function83executeAssignment(){
	
}
void function84finishBloc(){
	
}
int function86accessVarRef(){
	int VarRef12_9_12_111588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef12_9_12_11terminates =  VarRef12_9_12_111588;
	return VarRef12_9_12_11terminates;
}
void function88executeAssignment2(int resRight){
	int Assignment12_4_12_112529 = resRight; // was Assignment12_4_12_112363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
	(*((int*)sigma["Variable0_0_0_10currentValue"])) = Assignment12_4_12_112529;
}
void function89condStop(){
	
}
void function91executeAssignment(){
	
}
void function92finishModel(){
	
}
void function94evaluateConjunction(){
	
}
bool function99evalBooleanConst(){
	sigma["BooleanConst16_6_16_10constantValue"] = new bool(true);
	bool BooleanConst16_6_16_104639 = *(bool *) sigma["BooleanConst16_6_16_10constantValue"];//constantValue}
	bool BooleanConst16_6_16_10terminates =  BooleanConst16_6_16_104639;
	return BooleanConst16_6_16_10terminates;
}
bool function102evalBooleanConst(){
	sigma["BooleanConst16_14_16_18constantValue"] = new bool(true);
	bool BooleanConst16_14_16_184639 = *(bool *) sigma["BooleanConst16_14_16_18constantValue"];//constantValue}
	bool BooleanConst16_14_16_18terminates =  BooleanConst16_14_16_184639;
	return BooleanConst16_14_16_18terminates;
}
bool function104evaluateConjunction2(){
	bool Conjunction16_5_16_19terminates =  false;
	return Conjunction16_5_16_19terminates;
}
bool function105evaluateConjunction3(){
	bool Conjunction16_5_16_19terminates =  false;
	return Conjunction16_5_16_19terminates;
}
bool function107evaluateConjunction4(){
	bool Conjunction16_5_16_19terminates =  true;
	return Conjunction16_5_16_19terminates;
}
void function108executeAssignment2(int resRight){
	int Assignment16_0_16_192529 = resRight; // was Assignment16_0_16_192363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
	(*((int*)sigma["Variable2_0_2_10currentValue"])) = Assignment16_0_16_192529;
}

    int main() {
    
            std::cout << "1 : Step" <<std::endl;
            
            std::cout << "3 : Step" <<std::endl;
            
            std::cout << "5 : Step" <<std::endl;
            functioninit5Variable();

            std::cout << "7 : Step" <<std::endl;
            function7initializeVar();

            std::cout << "6 : Step" <<std::endl;
            
            std::cout << "9 : Step" <<std::endl;
            functioninit9Variable();

            std::cout << "11 : Step" <<std::endl;
            function11initializeVar();

            std::cout << "10 : Step" <<std::endl;
            
            std::cout << "13 : Step" <<std::endl;
            functioninit13Variable();

            std::cout << "15 : Step" <<std::endl;
            function15initializeVar();

            std::cout << "14 : Step" <<std::endl;
            
            std::cout << "17 : Step" <<std::endl;
            function17startsParallelBloc();
         
        LockingQueue<Void> queue20;
        std::thread thread22([&](){

            std::cout << "22 : Step" <<std::endl;
            function22executeAssignment();

            std::cout << "25 : Step" <<std::endl;
            function25startPlus();

        LockingQueue<int> queue34;
        std::thread thread29([&](){

            std::cout << "29 : Step" <<std::endl;
            int result29accessVarRef = function29accessVarRef();

            queue34.push(result29accessVarRef);
                
            std::cout << "30 : Step" <<std::endl;
            
        });
        thread29.detach();
            
        std::thread thread32([&](){

            std::cout << "32 : Step" <<std::endl;
            int result32accessVarRef = function32accessVarRef();

            queue34.push(result32accessVarRef);
                
            std::cout << "33 : Step" <<std::endl;
            
        });
        thread32.detach();
            
        //start of and join node
        
        int AndJoinPopped_34_0;
        queue34.waitAndPop(AndJoinPopped_34_0);
            
        int AndJoinPopped_34_1;
        queue34.waitAndPop(AndJoinPopped_34_1);
            
            std::cout << "34 : AndJoin" <<std::endl;
            int result34finishPlus = function34finishPlus(AndJoinPopped_34_0, AndJoinPopped_34_1);

        //end of and join node
        
            std::cout << "26 : Step" <<std::endl;
            
            std::cout << "35 : Step" <<std::endl;
            function35executeAssignment2(result34finishPlus);

            Void fakeParam20;
            queue20.push(fakeParam20);
                
            std::cout << "23 : Step" <<std::endl;
            
        });
        thread22.detach();
            
        std::thread thread37([&](){

            std::cout << "37 : Step" <<std::endl;
            function37executeAssignment();

            std::cout << "40 : Step" <<std::endl;
            function40startPlus();

        LockingQueue<int> queue49;
        std::thread thread44([&](){

            std::cout << "44 : Step" <<std::endl;
            int result44accessVarRef = function44accessVarRef();

            queue49.push(result44accessVarRef);
                
            std::cout << "45 : Step" <<std::endl;
            
        });
        thread44.detach();
            
        std::thread thread47([&](){

            std::cout << "47 : Step" <<std::endl;
            int result47accessVarRef = function47accessVarRef();

            queue49.push(result47accessVarRef);
                
            std::cout << "48 : Step" <<std::endl;
            
        });
        thread47.detach();
            
        //start of and join node
        
        int AndJoinPopped_49_0;
        queue49.waitAndPop(AndJoinPopped_49_0);
            
        int AndJoinPopped_49_1;
        queue49.waitAndPop(AndJoinPopped_49_1);
            
            std::cout << "49 : AndJoin" <<std::endl;
            int result49finishPlus = function49finishPlus(AndJoinPopped_49_0, AndJoinPopped_49_1);

        //end of and join node
        
            std::cout << "41 : Step" <<std::endl;
            
            std::cout << "50 : Step" <<std::endl;
            function50executeAssignment2(result49finishPlus);

            Void fakeParam20;
            queue20.push(fakeParam20);
                
            std::cout << "38 : Step" <<std::endl;
            
        });
        thread37.detach();
            
        //start of and join node
        
        Void AndJoinPopped_20_0;
        queue20.waitAndPop(AndJoinPopped_20_0);
            
        Void AndJoinPopped_20_1;
        queue20.waitAndPop(AndJoinPopped_20_1);
            
            std::cout << "20 : AndJoin" <<std::endl;
            function20finishParallelBloc();

        //end of and join node
        
            std::cout << "18 : Step" <<std::endl;
            
            std::cout << "53 : Step" <<std::endl;
            function53condStart();

            std::cout << "56 : Step" <<std::endl;
            int result56accessVarRef = function56accessVarRef();

            std::cout << "57 : Step" <<std::endl;
            
        LockingQueue<Void> queue89;
        
        int VarRef7_4_7_6terminates = result56accessVarRef;//Choice node
        if((bool)VarRef7_4_7_6terminates == true){
            std::cout << "58 : Choice" <<std::endl;
            function58condFalseStart();

            std::cout << "60 : Step" <<std::endl;
            
            std::cout << "62 : Step" <<std::endl;
            
            std::cout << "64 : Step" <<std::endl;
            function64executeAssignment();

            std::cout << "67 : Step" <<std::endl;
            function67startPlus();

        LockingQueue<int> queue76;
        std::thread thread71([&](){

            std::cout << "71 : Step" <<std::endl;
            int result71accessVarRef = function71accessVarRef();

            queue76.push(result71accessVarRef);
                
            std::cout << "72 : Step" <<std::endl;
            
        });
        thread71.detach();
            
        std::thread thread74([&](){

            std::cout << "74 : Step" <<std::endl;
            int result74accessVarRef = function74accessVarRef();

            queue76.push(result74accessVarRef);
                
            std::cout << "75 : Step" <<std::endl;
            
        });
        thread74.detach();
            
        //start of and join node
        
        int AndJoinPopped_76_0;
        queue76.waitAndPop(AndJoinPopped_76_0);
            
        int AndJoinPopped_76_1;
        queue76.waitAndPop(AndJoinPopped_76_1);
            
            std::cout << "76 : AndJoin" <<std::endl;
            int result76finishPlus = function76finishPlus(AndJoinPopped_76_0, AndJoinPopped_76_1);

        //end of and join node
        
            std::cout << "68 : Step" <<std::endl;
            
            std::cout << "77 : Step" <<std::endl;
            function77executeAssignment2(result76finishPlus);

            Void fakeParam89;
            queue89.push(fakeParam89);
                
            std::cout << "65 : Step" <<std::endl;
            function65finishBloc();

            std::cout << "61 : Step" <<std::endl;
            
            //END IF (bool)VarRef7_4_7_6terminates == true
        }
            //Choice node
        if((bool)VarRef7_4_7_6terminates == false){
            std::cout << "58 : Choice" <<std::endl;
            function58condFalseStart();

            std::cout << "79 : Step" <<std::endl;
            
            std::cout << "81 : Step" <<std::endl;
            
            std::cout << "83 : Step" <<std::endl;
            function83executeAssignment();

            std::cout << "86 : Step" <<std::endl;
            int result86accessVarRef = function86accessVarRef();

            std::cout << "87 : Step" <<std::endl;
            
            std::cout << "88 : Step" <<std::endl;
            function88executeAssignment2(result86accessVarRef);

            Void fakeParam89;
            queue89.push(fakeParam89);
                
            std::cout << "84 : Step" <<std::endl;
            function84finishBloc();

            std::cout << "80 : Step" <<std::endl;
            
            //END IF (bool)VarRef7_4_7_6terminates == false
        }
             //or join node
        Void OrJoinPopped_89;
        queue89.waitAndPop(OrJoinPopped_89);
        
            std::cout << "54 : Step" <<std::endl;
            
            std::cout << "91 : Step" <<std::endl;
            function91executeAssignment();

            std::cout << "94 : Step" <<std::endl;
            function94evaluateConjunction();

        LockingQueue<bool> queue96;
        LockingQueue<bool> queue106;
        std::thread thread99([&](){

            std::cout << "99 : Step" <<std::endl;
            bool result99evalBooleanConst = function99evalBooleanConst();

            queue106.push(result99evalBooleanConst);
                
            std::cout << "100 : Step" <<std::endl;
            
                {
        bool BooleanConst16_6_16_10terminates = result99evalBooleanConst;//Choice node
        if((bool)BooleanConst16_6_16_10terminates == false){
            std::cout << "104 : Choice" <<std::endl;
            bool result104evaluateConjunction2 = function104evaluateConjunction2();

            queue96.push(result104evaluateConjunction2);
                
            //END IF (bool)BooleanConst16_6_16_10terminates == false
        }
            
                }
                
                {
                }
                
        });
        thread99.detach();
            
        std::thread thread102([&](){

            std::cout << "102 : Step" <<std::endl;
            bool result102evalBooleanConst = function102evalBooleanConst();

            queue106.push(result102evalBooleanConst);
                
            std::cout << "103 : Step" <<std::endl;
            
                {
        bool BooleanConst16_14_16_18terminates = result102evalBooleanConst;//Choice node
        if((bool)BooleanConst16_14_16_18terminates == false){
            std::cout << "105 : Choice" <<std::endl;
            bool result105evaluateConjunction3 = function105evaluateConjunction3();

            queue96.push(result105evaluateConjunction3);
                
            //END IF (bool)BooleanConst16_14_16_18terminates == false
        }
            
                }
                
                {
                }
                
        //start of and join node
        
        bool AndJoinPopped_106_0;
        queue106.waitAndPop(AndJoinPopped_106_0);
            
        bool AndJoinPopped_106_1;
        queue106.waitAndPop(AndJoinPopped_106_1);
            
            std::cout << "106 : AndJoin" <<std::endl;
            
        //end of and join node
        
        bool BooleanConst16_6_16_10terminates = AndJoinPopped_106_0;
        bool BooleanConst16_14_16_18terminates = AndJoinPopped_106_1;//Choice node
        if((bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_18terminates == true){
            std::cout << "107 : Choice" <<std::endl;
            bool result107evaluateConjunction4 = function107evaluateConjunction4();

            queue96.push(result107evaluateConjunction4);
                
            //END IF (bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_18terminates == true
        }
             //or join node
        bool OrJoinPopped_96;
        queue96.waitAndPop(OrJoinPopped_96);
        
            std::cout << "95 : Step" <<std::endl;
            
            std::cout << "108 : Step" <<std::endl;
            function108executeAssignment2(OrJoinPopped_96);

            std::cout << "92 : Step" <<std::endl;
            function92finishModel();

        });
        thread102.detach();
            
    //WARNING !! temporary code to test
    for(auto entry : sigma){
        std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;
    }
}
    