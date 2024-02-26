#include <string>
    #include <unordered_map>
    #include <thread>
    #include <iostream>
    
    std::unordered_map<std::string, void*> sigma;
  void function0statementsInOrder1(){
	
}
void function3initializeVar(){
	sigma["Variable0_0_0_10currentValue"] = new int();
	int Variable0_0_0_101385 = 1; //undefined
	*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101385;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..
}
void function5initializeVar(){
	sigma["Variable1_0_1_10currentValue"] = new int();
	int Variable1_0_1_101385 = 4; //undefined
	*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101385;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..
}
void function7initializeVar(){
	sigma["Variable2_0_2_10currentValue"] = new int();
	int Variable2_0_2_101385 = 0; //undefined
	*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101385;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..
}
void function9startsParallelBloc(){
	
}
void function12finishParallelBloc(){
	
}
void function13executeAssignment(){
	
}
void function15startPlus(){
	
}
void function16executeAssignment2(){
	int Assignment4_7_4_212363 = Plus4_12_4_21terminates;//valuedEventRef resRight
	int Assignment4_7_4_212529 = Assignment4_7_4_212363; //resRight
	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment4_7_4_212529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..
}
int function18accessVarRef(){
	int VarRef4_18_4_201588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_18_4_20terminates =  VarRef4_18_4_201588;
	return VarRef4_18_4_20terminates;
}
int function20accessVarRef(){
	int VarRef4_13_4_151588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef4_13_4_15terminates =  VarRef4_13_4_151588;
	return VarRef4_13_4_15terminates;
}
int function22finishPlus(){
	int Plus4_12_4_214273 = VarRef4_18_4_20terminates;//valuedEventRef n2
	int Plus4_12_4_214298 = VarRef4_13_4_15terminates;//valuedEventRef n1
	int Plus4_12_4_214417 = Plus4_12_4_214298; //n1
	int Plus4_12_4_214422 = Plus4_12_4_214273; //n2
	int Plus4_12_4_214416 = Plus4_12_4_214422 + Plus4_12_4_214422;
	int Plus4_12_4_21terminates =  Plus4_12_4_214416;
	return Plus4_12_4_21terminates;
}
void function23executeAssignment(){
	
}
void function25startPlus(){
	
}
void function26executeAssignment2(){
	int Assignment5_7_5_212363 = Plus5_12_5_21terminates;//valuedEventRef resRight
	int Assignment5_7_5_212529 = Assignment5_7_5_212363; //resRight
	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..
}
int function28accessVarRef(){
	int VarRef5_18_5_201588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_18_5_20terminates =  VarRef5_18_5_201588;
	return VarRef5_18_5_20terminates;
}
int function30accessVarRef(){
	int VarRef5_13_5_151588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef5_13_5_15terminates =  VarRef5_13_5_151588;
	return VarRef5_13_5_15terminates;
}
int function32finishPlus(){
	int Plus5_12_5_214273 = VarRef5_18_5_20terminates;//valuedEventRef n2
	int Plus5_12_5_214298 = VarRef5_13_5_15terminates;//valuedEventRef n1
	int Plus5_12_5_214417 = Plus5_12_5_214298; //n1
	int Plus5_12_5_214422 = Plus5_12_5_214273; //n2
	int Plus5_12_5_214416 = Plus5_12_5_214422 + Plus5_12_5_214422;
	int Plus5_12_5_21terminates =  Plus5_12_5_214416;
	return Plus5_12_5_21terminates;
}
void function34condStart(){
	
}
int function36accessVarRef(){
	int VarRef7_4_7_61588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef7_4_7_6terminates =  VarRef7_4_7_61588;
	return VarRef7_4_7_6terminates;
}
void function38condTrueStart(){
	
}
void function38condFalseStart(){
	
}
void function39startsBloc(){
	
}
void function42executeAssignment(){
	
}
void function43finishBloc(){
	
}
int function44accessVarRef(){
	int VarRef9_9_9_111588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef9_9_9_11terminates =  VarRef9_9_9_111588;
	return VarRef9_9_9_11terminates;
}
void function45executeAssignment2(){
	int Assignment9_4_9_112363 = VarRef9_9_9_11terminates;//valuedEventRef resRight
	int Assignment9_4_9_112529 = Assignment9_4_9_112363; //resRight
	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_112529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..
}
void function46startsBloc(){
	
}
void function49executeAssignment(){
	
}
void function50finishBloc(){
	
}
int function51accessVarRef(){
	int VarRef12_9_12_111588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef12_9_12_11terminates =  VarRef12_9_12_111588;
	return VarRef12_9_12_11terminates;
}
void function52executeAssignment2(){
	int Assignment12_4_12_112363 = VarRef12_9_12_11terminates;//valuedEventRef resRight
	int Assignment12_4_12_112529 = Assignment12_4_12_112363; //resRight
	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_112529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..
}
void function53condStop(){
	
}
void function54executeAssignment(){
	
}
void function55finishModel(){
	
}
void function56evaluateConjunction(){
	
}
void function57executeAssignment2(){
	int Assignment16_0_16_202363 = Conjunction16_5_16_20terminates;//valuedEventRef resRight
	int Assignment16_0_16_202529 = Assignment16_0_16_202363; //resRight
	*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..
}
bool function60evalBooleanConst(){
	sigma["BooleanConst16_6_16_10constantValue"] = new bool(true);
	bool BooleanConst16_6_16_104636 = *(bool *) sigma["BooleanConst16_6_16_10constantValue"];//constantValue}
	bool BooleanConst16_6_16_10terminates =  BooleanConst16_6_16_104636;
	return BooleanConst16_6_16_10terminates;
}
bool function62evalBooleanConst(){
	sigma["BooleanConst16_14_16_19constantValue"] = new bool(false);
	bool BooleanConst16_14_16_194636 = *(bool *) sigma["BooleanConst16_14_16_19constantValue"];//constantValue}
	bool BooleanConst16_14_16_19terminates =  BooleanConst16_14_16_194636;
	return BooleanConst16_14_16_19terminates;
}
bool function64evaluateConjunction2(){
	bool Conjunction16_5_16_20terminates =  false;
	return Conjunction16_5_16_20terminates;
}
bool function65evaluateConjunction3(){
	bool Conjunction16_5_16_20terminates =  false;
	return Conjunction16_5_16_20terminates;
}
bool function67evaluateConjunction4(){
	bool Conjunction16_5_16_20terminates =  true;
	return Conjunction16_5_16_20terminates;
}

    int main() {
    
            /**    0 : Step **/
            function0statementsInOrder1();

            /**    2 : Step **/
            
            /**    3 : Step **/
            function3initializeVar();

            /**    4 : Step **/
            
            /**    5 : Step **/
            function5initializeVar();

            /**    6 : Step **/
            
            /**    7 : Step **/
            function7initializeVar();

            /**    8 : Step **/
            
            /**    9 : Step **/
            function9startsParallelBloc();

            //std::thread thread13([&](){

            /**    13 : Step **/
            function13executeAssignment();

            /**    15 : Step **/
            function15startPlus();

            //std::thread thread18([&](){

            /**    18 : Step **/
            function18accessVarRef();

            /**    19 : Step **/
            
            // });
            
            //std::thread thread20([&](){

            /**    20 : Step **/
            function20accessVarRef();

            /**    21 : Step **/
            //unused edge 22
            // thread20.join();
            
            /**    22 : AndJoin **/
            function22finishPlus();
//unused edge 22
            // thread18.join();
            
            /**    22 : AndJoin **/
            function22finishPlus();

            /**    16 : Step **/
            function16executeAssignment2();

            /**    14 : Step **/
            
            // });
            
            // });
            
            //std::thread thread23([&](){

            /**    23 : Step **/
            function23executeAssignment();

            /**    25 : Step **/
            function25startPlus();

            //std::thread thread28([&](){

            /**    28 : Step **/
            function28accessVarRef();

            /**    29 : Step **/
            
            // });
            
            //std::thread thread30([&](){

            /**    30 : Step **/
            function30accessVarRef();

            /**    31 : Step **/
            //unused edge 32
            // thread30.join();
            
            /**    32 : AndJoin **/
            function32finishPlus();
//unused edge 32
            // thread28.join();
            
            /**    32 : AndJoin **/
            function32finishPlus();

            /**    26 : Step **/
            function26executeAssignment2();

            /**    24 : Step **/
            //unused edge 12
            // thread23.join();
            
            /**    12 : AndJoin **/
            function12finishParallelBloc();
//unused edge 12
            // thread13.join();
            
            /**    12 : AndJoin **/
            function12finishParallelBloc();

            /**    10 : Step **/
            
            /**    34 : Step **/
            function34condStart();

            /**    36 : Step **/
            function36accessVarRef();

            /**    37 : Step **/
            
            /**    38 : Choice **/
            function38condTrueStart();
function38condFalseStart();

        if((bool)VarRef7_4_7_6terminates == true){
            /**    39 : Step **/
            function39startsBloc();

            /**    41 : Step **/
            
            /**    42 : Step **/
            function42executeAssignment();

            /**    44 : Step **/
            function44accessVarRef();

            /**    45 : Step **/
            function45executeAssignment2();

            /**    43 : Step **/
            function43finishBloc();

            /**    40 : Step **/
            
        }
        
            /**    38 : Choice **/
            function38condTrueStart();
function38condFalseStart();

        if((bool)VarRef7_4_7_6terminates == false){
            /**    46 : Step **/
            function46startsBloc();

            /**    48 : Step **/
            
            /**    49 : Step **/
            function49executeAssignment();

            /**    51 : Step **/
            function51accessVarRef();

            /**    52 : Step **/
            function52executeAssignment2();

            /**    50 : Step **/
            function50finishBloc();

            /**    47 : Step **/
             //or join node
            /**    35 : Step **/
            
            /**    54 : Step **/
            function54executeAssignment();

            /**    56 : Step **/
            function56evaluateConjunction();

            //std::thread thread60([&](){

            /**    60 : Step **/
            function60evalBooleanConst();

            /**    61 : Step **/
            
            /**    64 : Choice **/
            function64evaluateConjunction2();

        if((bool)BooleanConst16_6_16_10terminates == false){
        }
        
            // });
            
            //std::thread thread62([&](){

            /**    62 : Step **/
            function62evalBooleanConst();

            /**    63 : Step **/
            
            /**    65 : Choice **/
            function65evaluateConjunction3();

        if((bool)BooleanConst16_14_16_19terminates == false){
        }
        //unused edge 66
            // thread62.join();
            
            /**    66 : AndJoin **/
            //unused edge 66
            // thread60.join();
            
            /**    66 : AndJoin **/
            
            /**    67 : Choice **/
            function67evaluateConjunction4();

        if((bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_19terminates == true){ //or join node
            /**    57 : Step **/
            function57executeAssignment2();

            /**    55 : Step **/
            function55finishModel();

        }
        
            // });
            
        }
        
            // });
            
            // });
            
    //WARNING !! temporary code to test
    std::cout << "Variable0_0_0_10currentValue: " << *(int *)sigma["Variable0_0_0_10currentValue"] << std::endl;
    std::cout << "Variable1_0_1_10currentValue: " << *(int *)sigma["Variable1_0_1_10currentValue"] << std::endl;
}
    