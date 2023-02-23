#include "test1.h"

int varList[2] = {3, 4};

inline int VarDecl0_0_0_9_evaluate()
{
    return varList[0];
}

inline int VarDecl1_0_1_9_evaluate()
{
    return varList[1];
}

inline int Assignment2_0_2_9_evaluate()
{
    int resRight = Plus2_4_2_9_evaluate();
    return varList[0] = resRight;
}

inline int Plus2_4_2_9_evaluate()
{
    int n2 = VarRef2_8_2_9_evaluate();
    int n1 = VarRef2_4_2_5_evaluate();
    return (n1 + n2);
}

inline int VarRef2_4_2_5_evaluate()
{
    int value = VarDecl0_0_0_9_evaluate();
    return value;
}

inline int VarRef2_8_2_9_evaluate()
{
    int value = VarDecl0_0_0_9_evaluate();
    return value;
}

inline bool If3_0_7_1_evalCond()
{
    bool resCond = VarRef3_4_3_5_evaluate();
    return resCond;
}

inline void If3_0_7_1_condTrue()
{
}

inline void If3_0_7_1_condFalse()
{
}

inline int VarRef3_4_3_5_evaluate()
{
    int value = VarDecl0_0_0_9_evaluate();
    return value;
}

inline int Assignment4_4_4_9_evaluate()
{
    int resRight = VarRef4_8_4_9_evaluate();
    return varList[1] = resRight;
}

inline int VarRef4_8_4_9_evaluate()
{
    int value = VarDecl0_0_0_9_evaluate();
    return value;
}

inline int Assignment6_4_6_9_evaluate()
{
    int resRight = VarRef6_8_6_9_evaluate();
    return varList[0] = resRight;
}

inline int VarRef6_8_6_9_evaluate()
{
    int value = VarDecl1_0_1_9_evaluate();
    return value;
}

inline int Assignment8_0_8_9_evaluate()
{
    int resRight = Plus8_4_8_9_evaluate();
    return varList[1] = resRight;
}

inline int Plus8_4_8_9_evaluate()
{
    int n2 = VarRef8_8_8_9_evaluate();
    int n1 = VarRef8_4_8_5_evaluate();
    return (n1 + n2);
}

inline int VarRef8_4_8_5_evaluate()
{
    int value = VarDecl1_0_1_9_evaluate();
    return value;
}

inline int VarRef8_8_8_9_evaluate()
{
    int value = VarDecl1_0_1_9_evaluate();
    return value;
}
