#include <string>
    #include <unordered_map>
    #include <thread>
    #include <iostream>
    
    std::unordered_map<std::string, void*> sigma;
  void functioninit1Model(){
	
}
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
void functioninit60Bloc(){
	
}
void function64executeAssignment(){
	
}
void function65finishBloc(){
	
}
int function67accessVarRef(){
	int VarRef9_9_9_111588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
	int VarRef9_9_9_11terminates =  VarRef9_9_9_111588;
	return VarRef9_9_9_11terminates;
}
void function69executeAssignment2(int resRight){
	int Assignment9_4_9_112529 = resRight; // was Assignment9_4_9_112363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
	(*((int*)sigma["Variable1_0_1_10currentValue"])) = Assignment9_4_9_112529;
}
void functioninit71Bloc(){
	
}
void function75executeAssignment(){
	
}
void function76finishBloc(){
	
}
int function78accessVarRef(){
	int VarRef12_9_12_111588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
	int VarRef12_9_12_11terminates =  VarRef12_9_12_111588;
	return VarRef12_9_12_11terminates;
}
void function80executeAssignment2(int resRight){
	int Assignment12_4_12_112529 = resRight; // was Assignment12_4_12_112363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
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
bool function91evalBooleanConst(){
	sigma["BooleanConst16_6_16_10constantValue"] = new bool(true);
	bool BooleanConst16_6_16_104639 = *(bool *) sigma["BooleanConst16_6_16_10constantValue"];//constantValue}
	bool BooleanConst16_6_16_10terminates =  BooleanConst16_6_16_104639;
	return BooleanConst16_6_16_10terminates;
}
bool function94evalBooleanConst(){
	sigma["BooleanConst16_14_16_19constantValue"] = new bool(false);
	bool BooleanConst16_14_16_194639 = *(bool *) sigma["BooleanConst16_14_16_19constantValue"];//constantValue}
	bool BooleanConst16_14_16_19terminates =  BooleanConst16_14_16_194639;
	return BooleanConst16_14_16_19terminates;
}
bool function96evaluateConjunction2(){
	bool Conjunction16_5_16_20terminates =  false;
	return Conjunction16_5_16_20terminates;
}
bool function97evaluateConjunction3(){
	bool Conjunction16_5_16_20terminates =  false;
	return Conjunction16_5_16_20terminates;
}
bool function99evaluateConjunction4(){
	bool Conjunction16_5_16_20terminates =  true;
	return Conjunction16_5_16_20terminates;
}
void function100executeAssignment2(int resRight){
	int Assignment16_0_16_202529 = resRight; // was Assignment16_0_16_202363; but using the parameter name now
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
	(*((int*)sigma["Variable2_0_2_10currentValue"])) = Assignment16_0_16_202529;
}

    int main() {
    //Step node
            std::cout << "1 : Step" <<std::endl;
            functioninit1Model();
//Step node
            std::cout << "3 : Step" <<std::endl;
            //Step node
            std::cout << "5 : Step" <<std::endl;
            functioninit5Variable();
//Step node
            std::cout << "7 : Step" <<std::endl;
            function7initializeVar();
//Step node
            std::cout << "6 : Step" <<std::endl;
            //Step node
            std::cout << "9 : Step" <<std::endl;
            functioninit9Variable();
//Step node
            std::cout << "11 : Step" <<std::endl;
            function11initializeVar();
//Step node
            std::cout << "10 : Step" <<std::endl;
            //Step node
            std::cout << "13 : Step" <<std::endl;
            functioninit13Variable();
//Step node
            std::cout << "15 : Step" <<std::endl;
            function15initializeVar();
//Step node
            std::cout << "14 : Step" <<std::endl;
            //Step node
            std::cout << "17 : Step" <<std::endl;
            function17startsParallelBloc();

            //std::thread thread22([&](){
//Step node
            std::cout << "22 : Step" <<std::endl;
            function22executeAssignment();
//Step node
            std::cout << "25 : Step" <<std::endl;
            function25startPlus();

            //std::thread thread29([&](){
//Step node
            std::cout << "29 : Step" <<std::endl;
            int result29accessVarRef = function29accessVarRef();
//Step node
            std::cout << "30 : Step" <<std::endl;
            
            // });
            
            //std::thread thread32([&](){
//Step node
            std::cout << "32 : Step" <<std::endl;
            int result32accessVarRef = function32accessVarRef();
//Step node
            std::cout << "33 : Step" <<std::endl;
            
            // });
            
        //start of and join node//unused edge 34
            // thread32.join();
            //unused edge 34
            // thread29.join();
            
            std::cout << "34 : AndJoin" <<std::endl;
            int result34finishPlus = function34finishPlus(result29accessVarRef,result32accessVarRef);

        //end of and join node//Step node
            std::cout << "26 : Step" <<std::endl;
            //Step node
            std::cout << "35 : Step" <<std::endl;
            function35executeAssignment2(result34finishPlus);
//Step node
            std::cout << "23 : Step" <<std::endl;
            
            // });
            
            //std::thread thread37([&](){
//Step node
            std::cout << "37 : Step" <<std::endl;
            function37executeAssignment();
//Step node
            std::cout << "40 : Step" <<std::endl;
            function40startPlus();

            //std::thread thread44([&](){
//Step node
            std::cout << "44 : Step" <<std::endl;
            int result44accessVarRef = function44accessVarRef();
//Step node
            std::cout << "45 : Step" <<std::endl;
            
            // });
            
            //std::thread thread47([&](){
//Step node
            std::cout << "47 : Step" <<std::endl;
            int result47accessVarRef = function47accessVarRef();
//Step node
            std::cout << "48 : Step" <<std::endl;
            
            // });
            
        //start of and join node//unused edge 49
            // thread47.join();
            //unused edge 49
            // thread44.join();
            
            std::cout << "49 : AndJoin" <<std::endl;
            int result49finishPlus = function49finishPlus(result44accessVarRef,result47accessVarRef);

        //end of and join node//Step node
            std::cout << "41 : Step" <<std::endl;
            //Step node
            std::cout << "50 : Step" <<std::endl;
            function50executeAssignment2(result49finishPlus);
//Step node
            std::cout << "38 : Step" <<std::endl;
            
            // });
            
        //start of and join node//unused edge 20
            // thread37.join();
            //unused edge 20
            // thread22.join();
            
            std::cout << "20 : AndJoin" <<std::endl;
            function20finishParallelBloc();

        //end of and join node//Step node
            std::cout << "18 : Step" <<std::endl;
            //Step node
            std::cout << "53 : Step" <<std::endl;
            function53condStart();
//Step node
            std::cout << "56 : Step" <<std::endl;
            int result56accessVarRef = function56accessVarRef();
//Step node
            std::cout << "57 : Step" <<std::endl;
            int VarRef7_4_7_6terminates = result56accessVarRef;//Choice node
            std::cout << "58 : Choice" <<std::endl;
            function58condFalseStart();

        if((bool)VarRef7_4_7_6terminates == true){//Step node
            std::cout << "60 : Step" <<std::endl;
            functioninit60Bloc();
//Step node
            std::cout << "62 : Step" <<std::endl;
            //Step node
            std::cout << "64 : Step" <<std::endl;
            function64executeAssignment();
//Step node
            std::cout << "67 : Step" <<std::endl;
            int result67accessVarRef = function67accessVarRef();
//Step node
            std::cout << "68 : Step" <<std::endl;
            //Step node
            std::cout << "69 : Step" <<std::endl;
            function69executeAssignment2(result67accessVarRef);
//Step node
            std::cout << "65 : Step" <<std::endl;
            function65finishBloc();
//Step node
            std::cout << "61 : Step" <<std::endl;
            
            //END IF (bool)VarRef7_4_7_6terminates == true
        }
            //Choice node
            std::cout << "58 : Choice" <<std::endl;
            function58condFalseStart();

        if((bool)VarRef7_4_7_6terminates == false){//Step node
            std::cout << "71 : Step" <<std::endl;
            functioninit71Bloc();
//Step node
            std::cout << "73 : Step" <<std::endl;
            //Step node
            std::cout << "75 : Step" <<std::endl;
            function75executeAssignment();
//Step node
            std::cout << "78 : Step" <<std::endl;
            int result78accessVarRef = function78accessVarRef();
//Step node
            std::cout << "79 : Step" <<std::endl;
            //Step node
            std::cout << "80 : Step" <<std::endl;
            function80executeAssignment2(result78accessVarRef);
//Step node
            std::cout << "76 : Step" <<std::endl;
            function76finishBloc();
//Step node
            std::cout << "72 : Step" <<std::endl;
            
            //END IF (bool)VarRef7_4_7_6terminates == false
        }
             //or join node//Step node
            std::cout << "54 : Step" <<std::endl;
            //Step node
            std::cout << "83 : Step" <<std::endl;
            function83executeAssignment();
//Step node
            std::cout << "86 : Step" <<std::endl;
            function86evaluateConjunction();

            //std::thread thread91([&](){
//Step node
            std::cout << "91 : Step" <<std::endl;
            bool result91evalBooleanConst = function91evalBooleanConst();
//Step node
            std::cout << "92 : Step" <<std::endl;
            bool BooleanConst16_6_16_10terminates = result91evalBooleanConst;//Choice node
            std::cout << "96 : Choice" <<std::endl;
            bool result96evaluateConjunction2 = function96evaluateConjunction2();

        if((bool)BooleanConst16_6_16_10terminates == false){
            //END IF (bool)BooleanConst16_6_16_10terminates == false
        }
            
            // });
            
            //std::thread thread94([&](){
//Step node
            std::cout << "94 : Step" <<std::endl;
            bool result94evalBooleanConst = function94evalBooleanConst();
//Step node
            std::cout << "95 : Step" <<std::endl;
            bool BooleanConst16_14_16_19terminates = result94evalBooleanConst;//Choice node
            std::cout << "97 : Choice" <<std::endl;
            bool result97evaluateConjunction3 = function97evaluateConjunction3();

        if((bool)BooleanConst16_14_16_19terminates == false){
            //END IF (bool)BooleanConst16_14_16_19terminates == false
        }
            
        //start of and join node//unused edge 98
            // thread94.join();
            //unused edge 98
            // thread91.join();
            
            std::cout << "98 : AndJoin" <<std::endl;
            
        //end of and join nodebool BooleanConst16_6_16_10terminates = result91evalBooleanConst;//Choice node
            std::cout << "99 : Choice" <<std::endl;
            bool result99evaluateConjunction4 = function99evaluateConjunction4();

        if((bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_19terminates == true){
            //END IF (bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_19terminates == true
        }
             //or join node//Step node
            std::cout << "87 : Step" <<std::endl;
            //Step node
            std::cout << "100 : Step" <<std::endl;
            function100executeAssignment2(result96evaluateConjunction2);
//Step node
            std::cout << "84 : Step" <<std::endl;
            function84finishModel();

            // });
            
    //WARNING !! temporary code to test
    std::cout << "Variable0_0_0_10currentValue: " << *(int *)sigma["Variable0_0_0_10currentValue"] << std::endl;
    std::cout << "Variable1_0_1_10currentValue: " << *(int *)sigma["Variable1_0_1_10currentValue"] << std::endl;
}
    