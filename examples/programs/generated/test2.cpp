
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
	int Variable0_0_0_101430;
Variable0_0_0_101430 = 1;
*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101430;
}
void functioninit6Variable(){
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar(){
	int Variable1_0_1_101430;
Variable1_0_1_101430 = 4;
*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101430;
}
void functioninit9Variable(){
	sigma["Variable2_0_2_10currentValue"] = new int();
}
void function11initializeVar(){
	int Variable2_0_2_101430;
Variable2_0_2_101430 = 0;
*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101430;
}
int function21accessVarRef(){
	int VarRef4_18_4_201645;
VarRef4_18_4_201645 = *(int*)sigma["Variable0_0_0_10currentValue"];
int VarRef4_18_4_20terminates;
VarRef4_18_4_20terminates = VarRef4_18_4_201645;
return VarRef4_18_4_20terminates;
}
int function23accessVarRef(){
	int VarRef4_13_4_151645;
VarRef4_13_4_151645 = *(int*)sigma["Variable0_0_0_10currentValue"];
int VarRef4_13_4_15terminates;
VarRef4_13_4_15terminates = VarRef4_13_4_151645;
return VarRef4_13_4_15terminates;
}
int function25finishPlus(int n2, int n1){
	int Plus4_12_4_214537;
Plus4_12_4_214537 = n1;
int Plus4_12_4_214542;
Plus4_12_4_214542 = n2;
Plus4_12_4_214536 undefined;
Plus4_12_4_214536 = Plus4_12_4_214537 + Plus4_12_4_214542;
int Plus4_12_4_21terminates;
Plus4_12_4_21terminates = Plus4_12_4_214536;
return Plus4_12_4_21terminates;
}
void function26executeAssignment2(int resRight){
	int Assignment4_7_4_212620;
Assignment4_7_4_212620 = resRight;
*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment4_7_4_212620;
}
int function32accessVarRef(){
	int VarRef5_18_5_201645;
VarRef5_18_5_201645 = *(int*)sigma["Variable1_0_1_10currentValue"];
int VarRef5_18_5_20terminates;
VarRef5_18_5_20terminates = VarRef5_18_5_201645;
return VarRef5_18_5_20terminates;
}
int function34accessVarRef(){
	int VarRef5_13_5_151645;
VarRef5_13_5_151645 = *(int*)sigma["Variable1_0_1_10currentValue"];
int VarRef5_13_5_15terminates;
VarRef5_13_5_15terminates = VarRef5_13_5_151645;
return VarRef5_13_5_15terminates;
}
int function36finishPlus(int n2, int n1){
	int Plus5_12_5_214537;
Plus5_12_5_214537 = n1;
int Plus5_12_5_214542;
Plus5_12_5_214542 = n2;
Plus5_12_5_214536 undefined;
Plus5_12_5_214536 = Plus5_12_5_214537 + Plus5_12_5_214542;
int Plus5_12_5_21terminates;
Plus5_12_5_21terminates = Plus5_12_5_214536;
return Plus5_12_5_21terminates;
}
void function37executeAssignment2(int resRight){
	int Assignment5_7_5_212620;
Assignment5_7_5_212620 = resRight;
*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212620;
}
int function41accessVarRef(){
	int VarRef7_4_7_61645;
VarRef7_4_7_61645 = *(int*)sigma["Variable0_0_0_10currentValue"];
int VarRef7_4_7_6terminates;
VarRef7_4_7_6terminates = VarRef7_4_7_61645;
return VarRef7_4_7_6terminates;
}
int function52accessVarRef(){
	int VarRef9_15_9_171645;
VarRef9_15_9_171645 = *(int*)sigma["Variable0_0_0_10currentValue"];
int VarRef9_15_9_17terminates;
VarRef9_15_9_17terminates = VarRef9_15_9_171645;
return VarRef9_15_9_17terminates;
}
int function54accessVarRef(){
	int VarRef9_10_9_121645;
VarRef9_10_9_121645 = *(int*)sigma["Variable1_0_1_10currentValue"];
int VarRef9_10_9_12terminates;
VarRef9_10_9_12terminates = VarRef9_10_9_121645;
return VarRef9_10_9_12terminates;
}
int function56finishPlus(int n2, int n1){
	int Plus9_9_9_184537;
Plus9_9_9_184537 = n1;
int Plus9_9_9_184542;
Plus9_9_9_184542 = n2;
Plus9_9_9_184536 undefined;
Plus9_9_9_184536 = Plus9_9_9_184537 + Plus9_9_9_184542;
int Plus9_9_9_18terminates;
Plus9_9_9_18terminates = Plus9_9_9_184536;
return Plus9_9_9_18terminates;
}
void function57executeAssignment2(int resRight){
	int Assignment9_4_9_182620;
Assignment9_4_9_182620 = resRight;
*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_182620;
}
int function67accessVarRef(){
	int VarRef12_15_12_171645;
VarRef12_15_12_171645 = *(int*)sigma["Variable0_0_0_10currentValue"];
int VarRef12_15_12_17terminates;
VarRef12_15_12_17terminates = VarRef12_15_12_171645;
return VarRef12_15_12_17terminates;
}
int function69accessVarRef(){
	int VarRef12_10_12_121645;
VarRef12_10_12_121645 = *(int*)sigma["Variable1_0_1_10currentValue"];
int VarRef12_10_12_12terminates;
VarRef12_10_12_12terminates = VarRef12_10_12_121645;
return VarRef12_10_12_12terminates;
}
int function71finishPlus(int n2, int n1){
	int Plus12_9_12_184537;
Plus12_9_12_184537 = n1;
int Plus12_9_12_184542;
Plus12_9_12_184542 = n2;
Plus12_9_12_184536 undefined;
Plus12_9_12_184536 = Plus12_9_12_184537 + Plus12_9_12_184542;
int Plus12_9_12_18terminates;
Plus12_9_12_18terminates = Plus12_9_12_184536;
return Plus12_9_12_18terminates;
}
void function72executeAssignment2(int resRight){
	int Assignment12_4_12_182620;
Assignment12_4_12_182620 = resRight;
*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_182620;
}
bool function81evalBooleanConst(){
	sigma["BooleanConst16_6_16_10constantValue"] = new booltrue();
bool BooleanConst16_6_16_104765;
BooleanConst16_6_16_104765 = *(bool*)sigma["BooleanConst16_6_16_10constantValue"];
bool BooleanConst16_6_16_10terminates;
BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104765;
return BooleanConst16_6_16_10terminates;
}
bool function83evalBooleanConst(){
	sigma["BooleanConst16_14_16_19constantValue"] = new boolfalse();
bool BooleanConst16_14_16_194765;
BooleanConst16_14_16_194765 = *(bool*)sigma["BooleanConst16_14_16_19constantValue"];
bool BooleanConst16_14_16_19terminates;
BooleanConst16_14_16_19terminates = BooleanConst16_14_16_194765;
return BooleanConst16_14_16_19terminates;
}
bool function85evaluateConjunction2(){
	bool Conjunction16_5_16_20terminates;
Conjunction16_5_16_20terminates = false;
return Conjunction16_5_16_20terminates;
}
bool function86evaluateConjunction3(){
	bool Conjunction16_5_16_20terminates;
Conjunction16_5_16_20terminates = false;
return Conjunction16_5_16_20terminates;
}
bool function88evaluateConjunction4(){
	bool Conjunction16_5_16_20terminates;
Conjunction16_5_16_20terminates = true;
return Conjunction16_5_16_20terminates;
}
void function89executeAssignment2(int resRight){
	int Assignment16_0_16_202620;
Assignment16_0_16_202620 = resRight;
*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202620;
}
int main(){
	functioninit3Variable();
function5initializeVar();
functioninit6Variable();
function8initializeVar();
functioninit9Variable();
function11initializeVar();
lockingQueue<Void> synch25;
lockingQueue<Void> synch15;
lockingQueue<Void> synch56;
lockingQueue<Void> synch74;
lockingQueue<Void> synch79;
lockingQueue<Void> synch87;

            std::thread thread16([&](){

            std::thread thread21([&](){
int result21accessVarRef = function21accessVarRef();
queue25.push(result21accessVarRef);

        });
        thread21.detach();
            
            std::thread thread23([&](){
int result23accessVarRef = function23accessVarRef();
queue25.push(result23accessVarRef);

        });
        thread23.detach();
            int AndJoinPopped_25_0;
queue25.waitAndPop(AndJoinPopped_25_0);
int AndJoinPopped_25_1;
queue25.waitAndPop(AndJoinPopped_25_1);
int result25finishPlus = function25finishPlus(AndJoinPopped_25_0, AndJoinPopped_25_1);
function26executeAssignment2(result25finishPlus);
Void fakeParam15;
synch15.push(fakeParam15);
        });
        thread16.detach();
            
            std::thread thread27([&](){
lockingQueue<Void> synch36;

            std::thread thread32([&](){
int result32accessVarRef = function32accessVarRef();
queue36.push(result32accessVarRef);

        });
        thread32.detach();
            
            std::thread thread34([&](){
int result34accessVarRef = function34accessVarRef();
queue36.push(result34accessVarRef);

        });
        thread34.detach();
            int AndJoinPopped_36_0;
queue36.waitAndPop(AndJoinPopped_36_0);
int AndJoinPopped_36_1;
queue36.waitAndPop(AndJoinPopped_36_1);
int result36finishPlus = function36finishPlus(AndJoinPopped_36_0, AndJoinPopped_36_1);
function37executeAssignment2(result36finishPlus);
Void fakeParam15;
synch15.push(fakeParam15);
        });
        thread27.detach();
            Void joinPopped15;
synch15.waitAndPop();
Void joinPopped15;
synch15.waitAndPop();
int result41accessVarRef = function41accessVarRef();
int VarRef7_4_7_6terminate;
VarRef7_4_7_6terminate = result41accessVarRef;
if (VarRef7_4_7_6terminate == true){

            std::thread thread52([&](){
int result52accessVarRef = function52accessVarRef();
queue56.push(result52accessVarRef);

        });
        thread52.detach();
            
            std::thread thread54([&](){
int result54accessVarRef = function54accessVarRef();
queue56.push(result54accessVarRef);

        });
        thread54.detach();
            int AndJoinPopped_56_0;
queue56.waitAndPop(AndJoinPopped_56_0);
int AndJoinPopped_56_1;
queue56.waitAndPop(AndJoinPopped_56_1);
int result56finishPlus = function56finishPlus(AndJoinPopped_56_0, AndJoinPopped_56_1);
function57executeAssignment2(result56finishPlus);
Void fakeParam74;
synch74.push(fakeParam74);}
if (VarRef7_4_7_6terminate == false){
lockingQueue<Void> synch71;

            std::thread thread67([&](){
int result67accessVarRef = function67accessVarRef();
queue71.push(result67accessVarRef);

        });
        thread67.detach();
            
            std::thread thread69([&](){
int result69accessVarRef = function69accessVarRef();
queue71.push(result69accessVarRef);

        });
        thread69.detach();
            int AndJoinPopped_71_0;
queue71.waitAndPop(AndJoinPopped_71_0);
int AndJoinPopped_71_1;
queue71.waitAndPop(AndJoinPopped_71_1);
int result71finishPlus = function71finishPlus(AndJoinPopped_71_0, AndJoinPopped_71_1);
function72executeAssignment2(result71finishPlus);
Void fakeParam74;
synch74.push(fakeParam74);}
Void joinPopped74;
synch74.waitAndPop();

            std::thread thread81([&](){
bool result81evalBooleanConst = function81evalBooleanConst();
queue87.push(result81evalBooleanConst);
bool BooleanConst16_6_16_10terminate;
BooleanConst16_6_16_10terminate = result81evalBooleanConst;
if (BooleanConst16_6_16_10terminate == false){
bool result85evaluateConjunction2 = function85evaluateConjunction2();
queue79.push(result85evaluateConjunction2);
}

        });
        thread81.detach();
            
            std::thread thread83([&](){
bool result83evalBooleanConst = function83evalBooleanConst();
queue87.push(result83evalBooleanConst);
bool BooleanConst16_14_16_19terminate;
BooleanConst16_14_16_19terminate = result83evalBooleanConst;
if (BooleanConst16_14_16_19terminate == false){
bool result86evaluateConjunction3 = function86evaluateConjunction3();
queue79.push(result86evaluateConjunction3);
}

        });
        thread83.detach();
            bool AndJoinPopped_87_0;
queue87.waitAndPop(AndJoinPopped_87_0);
bool AndJoinPopped_87_1;
queue87.waitAndPop(AndJoinPopped_87_1);
bool BooleanConst16_6_16_10terminate;
BooleanConst16_6_16_10terminate = AndJoinPopped_87_0;
bool BooleanConst16_14_16_19terminate;
BooleanConst16_14_16_19terminate = AndJoinPopped_87_1;
if (BooleanConst16_6_16_10terminate == true && BooleanConst16_14_16_19terminate == true){
bool result88evaluateConjunction4 = function88evaluateConjunction4();
queue79.push(result88evaluateConjunction4);
}
bool OrJoinPopped_79;
queue79.waitAndPop(OrJoinPopped_79);
function89executeAssignment2(OrJoinPopped_79);
}
