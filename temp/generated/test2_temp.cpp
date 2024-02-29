#include <string>
    #include <unordered_map>
    #include <thread>
    #include <iostream>
    
    std::unordered_map<std::string, void*> sigma;
    int main(){
        
        /**    0 : Step **/
    
        /**    2 : Step **/
    
        /**    3 : Step **/
    sigma["Variable0_0_0_10currentValue"] = new int();
int Variable0_0_0_101385 = 1; //undefined
*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101385;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..

        /**    4 : Step **/
    
        /**    5 : Step **/
    sigma["Variable1_0_1_10currentValue"] = new int();
int Variable1_0_1_101385 = 4; //undefined
*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101385;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..

        /**    6 : Step **/
    
        /**    7 : Step **/
    sigma["Variable2_0_2_10currentValue"] = new int();
int Variable2_0_2_101385 = 0; //undefined
*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101385;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..

        /**    8 : Step **/
    
        /**    9 : Step **/
    
        /**    11 : Fork **/
    
        std::thread thread13([&](){

        /**    13 : Step **/
    
        /**    15 : Step **/
    
        /**    17 : Fork **/
    
        std::thread thread18([&](){

        /**    18 : Step **/
    int VarRef4_18_4_201588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
int VarRef4_18_4_20terminates =  VarRef4_18_4_201588;

        /**    19 : Step **/
    
         });
            
        std::thread thread20([&](){

        /**    20 : Step **/
    int VarRef4_13_4_151588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
    int VarRef4_13_4_15terminates =  VarRef4_13_4_151588;

        /**    21 : Step **/
    
          });

        /**    22 : AndJoin **/
        thread20.join();
        thread18.join();
        int Plus4_12_4_214273 = VarRef4_18_4_20terminates;//valuedEventRef n2
        int Plus4_12_4_214298 = VarRef4_13_4_15terminates;//valuedEventRef n1
        int Plus4_12_4_214417 = Plus4_12_4_214298; //n1
        int Plus4_12_4_214422 = Plus4_12_4_214273; //n2
        int Plus4_12_4_214416 = Plus4_12_4_214422 + Plus4_12_4_214422;
        int Plus4_12_4_21terminates =  Plus4_12_4_214416;    
        
            
        /**    16 : Step **/
    int Assignment4_7_4_212363 = Plus4_12_4_21terminates;//valuedEventRef resRight
int Assignment4_7_4_212529 = Assignment4_7_4_212363; //resRight
*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment4_7_4_212529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..

             });
            
            std::thread thread23([&](){

        /**    23 : Step **/
    
        /**    25 : Step **/
    
        /**    27 : Fork **/
    
            std::thread thread28([&](){

        /**    28 : Step **/
    int VarRef5_18_5_201588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
int VarRef5_18_5_20terminates =  VarRef5_18_5_201588;

        /**    29 : Step **/
    
            });
            
            std::thread thread30([&](){

        /**    30 : Step **/
    int VarRef5_13_5_151588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
int VarRef5_13_5_15terminates =  VarRef5_13_5_151588;

        /**    31 : Step **/
    });
        /**    32 : AndJoin **/
    
        thread30.join();
        thread28.join();

        int Plus5_12_5_214273 = VarRef5_18_5_20terminates;//valuedEventRef n2
int Plus5_12_5_214298 = VarRef5_13_5_15terminates;//valuedEventRef n1
int Plus5_12_5_214417 = Plus5_12_5_214298; //n1
int Plus5_12_5_214422 = Plus5_12_5_214273; //n2
int Plus5_12_5_214416 = Plus5_12_5_214422 + Plus5_12_5_214422;
int Plus5_12_5_21terminates =  Plus5_12_5_214416;    
            
            
        /**    26 : Step **/
    int Assignment5_7_5_212363 = Plus5_12_5_21terminates;//valuedEventRef resRight
int Assignment5_7_5_212529 = Assignment5_7_5_212363; //resRight
*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..

             });
            
        /**    10 : Step **/
    
        /**    34 : Step **/
    
        /**    36 : Step **/
    int VarRef7_4_7_61588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
int VarRef7_4_7_6terminates =  VarRef7_4_7_61588;

        /**    37 : Step **/
    
        /**    38 : Choice **/
    
        if((bool)VarRef7_4_7_6terminates == true){
        /**    39 : Step **/
    
        /**    41 : Step **/
    
        /**    42 : Step **/
    
        /**    44 : Step **/
    int VarRef9_9_9_111588 = *(int *) sigma["Variable0_0_0_10currentValue"];//currentValue}
int VarRef9_9_9_11terminates =  VarRef9_9_9_111588;

        /**    45 : Step **/
    int Assignment9_4_9_112363 = VarRef9_9_9_11terminates;//valuedEventRef resRight
int Assignment9_4_9_112529 = Assignment9_4_9_112363; //resRight
*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_112529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..

        /**    43 : Step **/
    
        /**    40 : Step **/
    
        }
        
        if((bool)VarRef7_4_7_6terminates == false){
        /**    46 : Step **/
    
        /**    48 : Step **/
    
        /**    49 : Step **/
    
        /**    51 : Step **/
    int VarRef12_9_12_111588 = *(int *) sigma["Variable1_0_1_10currentValue"];//currentValue}
int VarRef12_9_12_11terminates =  VarRef12_9_12_111588;

        /**    52 : Step **/
    int Assignment12_4_12_112363 = VarRef12_9_12_11terminates;//valuedEventRef resRight
int Assignment12_4_12_112529 = Assignment12_4_12_112363; //resRight
*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_112529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..

        /**    50 : Step **/
    
        /**    47 : Step **/
    
        /**    53 : OrJoin **/
     //or join node
        }
        
        /**    35 : Step **/
    
        /**    54 : Step **/
    
        /**    56 : Step **/
    
        /**    59 : Fork **/
    
            //std::thread thread60([&](){

        /**    60 : Step **/
    sigma["BooleanConst16_6_16_10constantValue"] = new bool(true);
bool BooleanConst16_6_16_104636 = *(bool *) sigma["BooleanConst16_6_16_10constantValue"];//constantValue}
bool BooleanConst16_6_16_10terminates =  BooleanConst16_6_16_104636;

        /**    61 : Step **/
    
        /**    64 : Choice **/
    bool Conjunction16_5_16_20terminates =  false;

        if((bool)BooleanConst16_6_16_10terminates == false){
        }
        
            // });
            
            //std::thread thread62([&](){

        /**    62 : Step **/
    sigma["BooleanConst16_14_16_19constantValue"] = new bool(false);
bool BooleanConst16_14_16_194636 = *(bool *) sigma["BooleanConst16_14_16_19constantValue"];//constantValue}
bool BooleanConst16_14_16_19terminates =  BooleanConst16_14_16_194636;

        /**    63 : Step **/
    
        /**    65 : Choice **/
    bool Conjunction16_5_16_20terminates =  false;

        if((bool)BooleanConst16_14_16_19terminates == false){
        }
        
        /**    66 : AndJoin **/
     //edge61.join();
            // thread62.join();
             //edge63.join();
            // thread60.join();
            
        /**    67 : Choice **/
    bool Conjunction16_5_16_20terminates =  true;

        if((bool)BooleanConst16_6_16_10terminates == true && (bool)BooleanConst16_14_16_19terminates == true){
        }
        
        /**    58 : OrJoin **/
     //or join node
            // });
            
        /**    57 : Step **/
    int Assignment16_0_16_202363 = Conjunction16_5_16_20terminates;//valuedEventRef resRight
int Assignment16_0_16_202529 = Assignment16_0_16_202363; //resRight
*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202529;//TODO: fix this and avoid memory leak by deleting, constructing appropriately..

    //WARNING !! temporary code to test
    std::cout << "Variable0_0_0_10currentValue: " << *(int *)sigma["Variable0_0_0_10currentValue"] << std::endl;
    std::cout << "Variable1_0_1_10currentValue: " << *(int *)sigma["Variable1_0_1_10currentValue"] << std::endl;
}
    