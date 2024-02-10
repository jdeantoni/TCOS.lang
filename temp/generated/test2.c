#include "test2.h"


    int varList[2] = {0,4};
    

            inline int Variable0_0_0_10_evaluate(){
                return varList[0];
            }

            inline int Variable1_0_1_10_evaluate(){
                return varList[1];
            }

            inline int VarRef6_4_6_6_evaluate(){
                int value = Variable0_0_0_10_evaluate();
                return value;
            }

            inline void Assignment8_4_8_11_evaluate(){
                int resRight = VarRef8_9_8_11_evaluate();
                varList[1] = resRight;
            }

            inline int VarRef8_9_8_11_evaluate(){
                int value = Variable0_0_0_10_evaluate();
                return value;
            }

            inline void Assignment11_4_11_11_evaluate(){
                int resRight = VarRef11_9_11_11_evaluate();
                varList[0] = resRight;
            }

            inline int VarRef11_9_11_11_evaluate(){
                int value = Variable1_0_1_10_evaluate();
                return value;
            }
