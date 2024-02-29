#include <string>
    #include <unordered_map>
    #include <thread>
    #include <iostream>
    
    std::unordered_map<std::string, void*> sigma;
  void function7initializeVar(){
	int Variable0_0_0_101385 = 1; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101385;
}
void function11initializeVar(){
	int Variable1_0_1_101385 = 4; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101385;
}
void function15initializeVar(){
	int Variable2_0_2_101385 = 0; //undefined
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101385;
}
void function35executeAssignment2(){
	int Assignment4_7_4_212529 = Assignment4_7_4_212363; //resRight
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment4_7_4_212529;
}
void function50executeAssignment2(){
	int Assignment5_7_5_212529 = Assignment5_7_5_212363; //resRight
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212529;
}
void function69executeAssignment2(){
	int Assignment9_4_9_112529 = Assignment9_4_9_112363; //resRight
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_112529;
}
void function80executeAssignment2(){
	int Assignment12_4_12_112529 = Assignment12_4_12_112363; //resRight
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_112529;
}
void function100executeAssignment2(){
	int Assignment16_0_16_202529 = Assignment16_0_16_202363; //resRight
	//TODO: fix this and avoid memory leak by deleting, constructing appropriately
*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202529;
}

    int main() {
    
            /**    1 : Step **/
            
            /**    3 : Step **/
            
            /**    5 : Step **/
            
            /**    7 : Step **/
            function7initializeVar();

            /**    6 : Step **/
            
            /**    9 : Step **/
            
            /**    11 : Step **/
            function11initializeVar();

            /**    10 : Step **/
            
            /**    13 : Step **/
            
            /**    15 : Step **/
            function15initializeVar();

            /**    14 : Step **/
            
            /**    17 : Step **/
            
            //std::thread thread22([&](){

            /**    22 : Step **/
            
            /**    25 : Step **/
            
            //std::thread thread29([&](){

            /**    29 : Step **/
            
            /**    30 : Step **/
            
            // });
            
            //std::thread thread32([&](){

            /**    32 : Step **/
            
            /**    33 : Step **/
            //unused edge 34
            // thread32.join();
            
            /**    34 : AndJoin **/
            //unused edge 34
            // thread29.join();
            
            /**    34 : AndJoin **/
            
            /**    26 : Step **/
            
            /**    35 : Step **/
            function35executeAssignment2();

            /**    23 : Step **/
            
            // });
            
            // });
            
            //std::thread thread37([&](){

            /**    37 : Step **/
            
            /**    40 : Step **/
            
            //std::thread thread44([&](){

            /**    44 : Step **/
            
            /**    45 : Step **/
            
            // });
            
            //std::thread thread47([&](){

            /**    47 : Step **/
            
            /**    48 : Step **/
            //unused edge 49
            // thread47.join();
            
            /**    49 : AndJoin **/
            //unused edge 49
            // thread44.join();
            
            /**    49 : AndJoin **/
            
            /**    41 : Step **/
            
            /**    50 : Step **/
            function50executeAssignment2();

            /**    38 : Step **/
            //unused edge 20
            // thread37.join();
            
            /**    20 : AndJoin **/
            //unused edge 20
            // thread22.join();
            
            /**    20 : AndJoin **/
            
            /**    18 : Step **/
            
            /**    53 : Step **/
            
            /**    56 : Step **/
            
            /**    57 : Step **/
            
            /**    58 : Choice **/
            
        if((bool)VarRef7_4_7_6terminates == true){
            /**    60 : Step **/
            
            /**    62 : Step **/
            
            /**    64 : Step **/
            
            /**    67 : Step **/
            
            /**    68 : Step **/
            
            /**    69 : Step **/
            function69executeAssignment2();

            /**    65 : Step **/
            
            /**    61 : Step **/
            
        }
        
            /**    58 : Choice **/
            
        if((bool)VarRef7_4_7_6terminates == false){
            /**    71 : Step **/
            
            /**    73 : Step **/
            
            /**    75 : Step **/
            
            /**    78 : Step **/
            
            /**    79 : Step **/
            
            /**    80 : Step **/
            function80executeAssignment2();

            /**    76 : Step **/
            
            /**    72 : Step **/
             //or join node
            /**    54 : Step **/
            
            /**    83 : Step **/
            
            /**    86 : Step **/
            
            //std::thread thread91([&](){

            /**    91 : Step **/
            
            /**    92 : Step **/
            
            /**    96 : Choice **/
            
        if((bool)BooleanConst16_6_16_10terminates == false){
        }
        
            // });
            
            //std::thread thread94([&](){

            /**    94 : Step **/
            
            /**    95 : Step **/
            
            /**    97 : Choice **/
            
        if((bool)BooleanConst16_14_16_19terminates == false){
        }
        //unused edge 98
            // thread94.join();
            
            /**    98 : AndJoin **/
            //unused edge 98
            // thread91.join();
            
            /**    98 : AndJoin **/
            
            /**    99 : Choice **/
            
        if((bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_19terminates == true){ //or join node
            /**    87 : Step **/
            
            /**    100 : Step **/
            function100executeAssignment2();

            /**    84 : Step **/
            
        }
        
            // });
            
        }
        
            // });
            
            // });
            
    //WARNING !! temporary code to test
    std::cout << "Variable0_0_0_10currentValue: " << *(int *)sigma["Variable0_0_0_10currentValue"] << std::endl;
    std::cout << "Variable1_0_1_10currentValue: " << *(int *)sigma["Variable1_0_1_10currentValue"] << std::endl;
}
    