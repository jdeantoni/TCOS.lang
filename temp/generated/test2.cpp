#include <string>
    #include <unordered_map>
    #include <thread>
    #include <iostream>
    
    std::unordered_map<std::string, void*> sigma;
  void function1statementsInOrder1(){
	
}
void function5initializeVar(){
	sigma["Variable0_0_0_10currentValue"] = new int();
	int Variable0_0_0_101385 = 1; //undefined
	*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101385;
}
void function8initializeVar(){
	sigma["Variable1_0_1_10currentValue"] = new int();
	int Variable1_0_1_101385 = 4; //undefined
	*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101385;
}
void function11initializeVar(){
	sigma["Variable2_0_2_10currentValue"] = new int();
	int Variable2_0_2_101385 = 0; //undefined
	*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101385;
}
void function14startsParallelBloc(){
	
}
void function17finishParallelBloc(){
	
}
void function19executeAssignment(){
	
}
void function22startPlus(){
	
}
void function23executeAssignment2(){
	int Assignment4_7_4_212363 = Plus4_12_4_21terminates;//valuedEventRef resRight
	int Assignment4_7_4_212529 = Assignment4_7_4_212363; //resRight
	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment4_7_4_212529;
}
int function26accessVarRef(){
	int VarRef4_18_4_201588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_18_4_20terminates =  VarRef4_18_4_201588;
	return VarRef4_18_4_20terminates;
}
int function29accessVarRef(){
	int VarRef4_13_4_151588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_13_4_15terminates =  VarRef4_13_4_151588;
	return VarRef4_13_4_15terminates;
}
int function31finishPlus(){
	int Plus4_12_4_214273 = VarRef4_18_4_20terminates;//valuedEventRef n2
	int Plus4_12_4_214298 = VarRef4_13_4_15terminates;//valuedEventRef n1
	int Plus4_12_4_214417 = Plus4_12_4_214298; //n1
	int Plus4_12_4_214422 = Plus4_12_4_214273; //n2
	int Plus4_12_4_214416 = Plus4_12_4_214422 + Plus4_12_4_214422;
	int Plus4_12_4_21terminates =  Plus4_12_4_214416;
	return Plus4_12_4_21terminates;
}
void function33executeAssignment(){
	
}
void function36startPlus(){
	
}
void function37executeAssignment2(){
	int Assignment5_7_5_212363 = Plus5_12_5_21terminates;//valuedEventRef resRight
	int Assignment5_7_5_212529 = Assignment5_7_5_212363; //resRight
	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212529;
}
int function40accessVarRef(){
	int VarRef5_18_5_201588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_18_5_20terminates =  VarRef5_18_5_201588;
	return VarRef5_18_5_20terminates;
}
int function43accessVarRef(){
	int VarRef5_13_5_151588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_13_5_15terminates =  VarRef5_13_5_151588;
	return VarRef5_13_5_15terminates;
}
int function45finishPlus(){
	int Plus5_12_5_214273 = VarRef5_18_5_20terminates;//valuedEventRef n2
	int Plus5_12_5_214298 = VarRef5_13_5_15terminates;//valuedEventRef n1
	int Plus5_12_5_214417 = Plus5_12_5_214298; //n1
	int Plus5_12_5_214422 = Plus5_12_5_214273; //n2
	int Plus5_12_5_214416 = Plus5_12_5_214422 + Plus5_12_5_214422;
	int Plus5_12_5_21terminates =  Plus5_12_5_214416;
	return Plus5_12_5_21terminates;
}
void function48condStart(){
	
}
int function51accessVarRef(){
	int VarRef7_4_7_61588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef7_4_7_6terminates =  VarRef7_4_7_61588;
	return VarRef7_4_7_6terminates;
}
void function53condTrueStart(){
	
}
void function53condFalseStart(){
	
}
void function55startsBloc(){
	
}
void function59executeAssignment(){
	
}
void function60finishBloc(){
	
}
int function62accessVarRef(){
	int VarRef9_9_9_111588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef9_9_9_11terminates =  VarRef9_9_9_111588;
	return VarRef9_9_9_11terminates;
}
void function63executeAssignment2(){
	int Assignment9_4_9_112363 = VarRef9_9_9_11terminates;//valuedEventRef resRight
	int Assignment9_4_9_112529 = Assignment9_4_9_112363; //resRight
	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_112529;
}
void function65startsBloc(){
	
}
void function69executeAssignment(){
	
}
void function70finishBloc(){
	
}
int function72accessVarRef(){
	int VarRef12_9_12_111588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef12_9_12_11terminates =  VarRef12_9_12_111588;
	return VarRef12_9_12_11terminates;
}
void function73executeAssignment2(){
	int Assignment12_4_12_112363 = VarRef12_9_12_11terminates;//valuedEventRef resRight
	int Assignment12_4_12_112529 = Assignment12_4_12_112363; //resRight
	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_112529;
}
void function74condStop(){
	
}
void function76executeAssignment(){
	
}
void function77finishModel(){
	
}
void function79evaluateConjunction(){
	
}
void function80executeAssignment2(){
	int Assignment16_0_16_202363 = Conjunction16_5_16_20terminates;//valuedEventRef resRight
	int Assignment16_0_16_202529 = Assignment16_0_16_202363; //resRight
	*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202529;
}
bool function84evalBooleanConst(){
	sigma["BooleanConst16_6_16_10constantValue"] = new bool(true);
	bool BooleanConst16_6_16_104636 = *(bool *) sigma["BooleanConst16_6_16_10constantValue"];//constantValue}
	bool BooleanConst16_6_16_10terminates =  BooleanConst16_6_16_104636;
	return BooleanConst16_6_16_10terminates;
}
bool function87evalBooleanConst(){
	sigma["BooleanConst16_14_16_19constantValue"] = new bool(false);
	bool BooleanConst16_14_16_194636 = *(bool *) sigma["BooleanConst16_14_16_19constantValue"];//constantValue}
	bool BooleanConst16_14_16_19terminates =  BooleanConst16_14_16_194636;
	return BooleanConst16_14_16_19terminates;
}
bool function89evaluateConjunction2(){
	bool Conjunction16_5_16_20terminates =  false;
	return Conjunction16_5_16_20terminates;
}
bool function90evaluateConjunction3(){
	bool Conjunction16_5_16_20terminates =  false;
	return Conjunction16_5_16_20terminates;
}
bool function92evaluateConjunction4(){
	bool Conjunction16_5_16_20terminates =  true;
	return Conjunction16_5_16_20terminates;
}

    int main() {
    
            /**    1 : Step **/
            function1statementsInOrder1();

            /**    3 : Step **/
            
            /**    5 : Step **/
            function5initializeVar();

            /**    6 : Step **/
            
            /**    8 : Step **/
            function8initializeVar();

            /**    9 : Step **/
            
            /**    11 : Step **/
            function11initializeVar();

            /**    12 : Step **/
            
            /**    14 : Step **/
            function14startsParallelBloc();

            //std::thread thread19([&](){

            /**    19 : Step **/
            function19executeAssignment();

            /**    22 : Step **/
            function22startPlus();

            //std::thread thread26([&](){

            /**    26 : Step **/
            function26accessVarRef();

            /**    27 : Step **/
            
            // });
            
            //std::thread thread29([&](){

            /**    29 : Step **/
            function29accessVarRef();

            /**    30 : Step **/
            //unused edge 31
            // thread29.join();
            
            /**    31 : AndJoin **/
            function31finishPlus();
//unused edge 31
            // thread26.join();
            
            /**    31 : AndJoin **/
            function31finishPlus();

            /**    23 : Step **/
            function23executeAssignment2();

            /**    20 : Step **/
            
            // });
            
            // });
            
            //std::thread thread33([&](){

            /**    33 : Step **/
            function33executeAssignment();

            /**    36 : Step **/
            function36startPlus();

            //std::thread thread40([&](){

            /**    40 : Step **/
            function40accessVarRef();

            /**    41 : Step **/
            
            // });
            
            //std::thread thread43([&](){

            /**    43 : Step **/
            function43accessVarRef();

            /**    44 : Step **/
            //unused edge 45
            // thread43.join();
            
            /**    45 : AndJoin **/
            function45finishPlus();
//unused edge 45
            // thread40.join();
            
            /**    45 : AndJoin **/
            function45finishPlus();

            /**    37 : Step **/
            function37executeAssignment2();

            /**    34 : Step **/
            //unused edge 17
            // thread33.join();
            
            /**    17 : AndJoin **/
            function17finishParallelBloc();
//unused edge 17
            // thread19.join();
            
            /**    17 : AndJoin **/
            function17finishParallelBloc();

            /**    15 : Step **/
            
            /**    48 : Step **/
            function48condStart();

            /**    51 : Step **/
            function51accessVarRef();

            /**    52 : Step **/
            
            /**    53 : Choice **/
            function53condTrueStart();
function53condFalseStart();

        if((bool)VarRef7_4_7_6terminates == true){
            /**    55 : Step **/
            function55startsBloc();

            /**    57 : Step **/
            
            /**    59 : Step **/
            function59executeAssignment();

            /**    62 : Step **/
            function62accessVarRef();

            /**    63 : Step **/
            function63executeAssignment2();

            /**    60 : Step **/
            function60finishBloc();

            /**    56 : Step **/
            
        }
        
            /**    53 : Choice **/
            function53condTrueStart();
function53condFalseStart();

        if((bool)VarRef7_4_7_6terminates == false){
            /**    65 : Step **/
            function65startsBloc();

            /**    67 : Step **/
            
            /**    69 : Step **/
            function69executeAssignment();

            /**    72 : Step **/
            function72accessVarRef();

            /**    73 : Step **/
            function73executeAssignment2();

            /**    70 : Step **/
            function70finishBloc();

            /**    66 : Step **/
             //or join node
            /**    49 : Step **/
            
            /**    76 : Step **/
            function76executeAssignment();

            /**    79 : Step **/
            function79evaluateConjunction();

            //std::thread thread84([&](){

            /**    84 : Step **/
            function84evalBooleanConst();

            /**    85 : Step **/
            
            /**    89 : Choice **/
            function89evaluateConjunction2();

        if((bool)BooleanConst16_6_16_10terminates == false){
        }
        
            // });
            
            //std::thread thread87([&](){

            /**    87 : Step **/
            function87evalBooleanConst();

            /**    88 : Step **/
            
            /**    90 : Choice **/
            function90evaluateConjunction3();

        if((bool)BooleanConst16_14_16_19terminates == false){
        }
        //unused edge 91
            // thread87.join();
            
            /**    91 : AndJoin **/
            //unused edge 91
            // thread84.join();
            
            /**    91 : AndJoin **/
            
            /**    92 : Choice **/
            function92evaluateConjunction4();

        if((bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_19terminates == true){ //or join node
            /**    80 : Step **/
            function80executeAssignment2();

            /**    77 : Step **/
            function77finishModel();

        }
        
            // });
            
        }
        
            // });
            
            // });
            
    //WARNING !! temporary code to test
    std::cout << "Variable0_0_0_10currentValue: " << *(int *)sigma["Variable0_0_0_10currentValue"] << std::endl;
    std::cout << "Variable1_0_1_10currentValue: " << *(int *)sigma["Variable1_0_1_10currentValue"] << std::endl;
}
    