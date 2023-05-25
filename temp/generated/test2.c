#include "test2.h"


    int varList[2] = {0,4};
    

            inline int VarDecl0_0_0_10_evaluate(){
                return varList[0];
            }

            inline int VarDecl1_0_1_10_evaluate(){
                return varList[1];
            }

            inline void Assignment3_6_3_18_evaluate(){
                int resRight = Plus3_11_3_18_evaluate();
                varList[0] = resRight;
            }

            inline int Plus3_11_3_18_evaluate(){
                int n1 = VarRef3_11_3_13_evaluate();
                int n2 = VarRef3_16_3_18_evaluate();
                return n1 + n2;
            }

            inline int VarRef3_11_3_13_evaluate(){
                int value = VarDecl0_0_0_10_evaluate();
                return value;
            }

            inline int VarRef3_16_3_18_evaluate(){
                int value = VarDecl0_0_0_10_evaluate();
                return value;
            }

            inline void Assignment4_6_4_18_evaluate(){
                int resRight = Plus4_11_4_18_evaluate();
                varList[1] = resRight;
            }

            inline int Plus4_11_4_18_evaluate(){
                int n1 = VarRef4_11_4_13_evaluate();
                int n2 = VarRef4_16_4_18_evaluate();
                return n1 + n2;
            }

            inline int VarRef4_11_4_13_evaluate(){
                int value = VarDecl1_0_1_10_evaluate();
                return value;
            }

            inline int VarRef4_16_4_18_evaluate(){
                int value = VarDecl1_0_1_10_evaluate();
                return value;
            }

            inline int VarRef6_4_6_6_evaluate(){
                int value = VarDecl0_0_0_10_evaluate();
                return value;
            }

            inline void Assignment8_4_8_11_evaluate(){
                int resRight = VarRef8_9_8_11_evaluate();
                varList[1] = resRight;
            }

            inline int VarRef8_9_8_11_evaluate(){
                int value = VarDecl0_0_0_10_evaluate();
                return value;
            }

            inline void Assignment11_4_11_11_evaluate(){
                int resRight = VarRef11_9_11_11_evaluate();
                varList[0] = resRight;
            }

            inline int VarRef11_9_11_11_evaluate(){
                int value = VarDecl1_0_1_10_evaluate();
                return value;
            }
