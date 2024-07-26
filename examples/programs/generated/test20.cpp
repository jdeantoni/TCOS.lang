
#include <string>
#include <unordered_map>
#include <thread>
#include <mutex>
#include <iostream>
#include <chrono>
#include "../utils/LockingQueue.hpp"

using namespace std::chrono_literals;

#define DEBUG 1

class Void
{
};

std::unordered_map<std::string, void *> sigma;
std::mutex sigma_mutex; // protects sigma

void functioninit3Variable()
{
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        sigma["Variable0_0_0_10currentValue"] = new int();
}
void function5initializeVar()
{
        int Variable0_0_0_101377;
        Variable0_0_0_101377 = 1;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        *((int *)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101377;
}
void functioninit6Variable()
{
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar()
{
        int Variable1_0_1_101377;
        Variable1_0_1_101377 = 4;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        *((int *)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101377;
}
void functioninit9Variable()
{
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        sigma["Variable2_0_2_10currentValue"] = new int();
}
void function11initializeVar()
{
        int Variable2_0_2_101377;
        Variable2_0_2_101377 = 0;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        *((int *)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101377;
}
void function89executeAssignment2(int resRight)
{
        int Assignment16_0_16_202524;
        Assignment16_0_16_202524 = resRight;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        *((int *)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202524;
}
int function50accessVarRef()
{
        int VarRef7_4_7_61583;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        VarRef7_4_7_61583 = *(int *)sigma["Variable0_0_0_10currentValue"];
        int VarRef7_4_7_6terminates;
        VarRef7_4_7_6terminates = VarRef7_4_7_61583;
        return VarRef7_4_7_6terminates;
}
bool function95evaluateConjunction2()
{
        bool Conjunction16_5_16_20terminates;
        Conjunction16_5_16_20terminates = false;
        return Conjunction16_5_16_20terminates;
}
bool function96evaluateConjunction3()
{
        bool Conjunction16_5_16_20terminates;
        Conjunction16_5_16_20terminates = false;
        return Conjunction16_5_16_20terminates;
}
bool function99evaluateConjunction4()
{
        bool Conjunction16_5_16_20terminates;
        Conjunction16_5_16_20terminates = true;
        return Conjunction16_5_16_20terminates;
}
void function18executeAssignment2(int resRight)
{
        int Assignment4_7_4_212524;
        Assignment4_7_4_212524 = resRight;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        *((int *)sigma["Variable1_0_1_10currentValue"]) = Assignment4_7_4_212524;
}
void function32executeAssignment2(int resRight)
{
        int Assignment5_7_5_212524;
        Assignment5_7_5_212524 = resRight;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        *((int *)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212524;
}
bool function100evalBooleanConst()
{
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        sigma["BooleanConst16_6_16_10constantValue"] = new bool(true);
        bool BooleanConst16_6_16_104606;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        BooleanConst16_6_16_104606 = *(bool *)sigma["BooleanConst16_6_16_10constantValue"];
        bool BooleanConst16_6_16_10terminates;
        BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104606;
        return BooleanConst16_6_16_10terminates;
}
bool function102evalBooleanConst()
{
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        sigma["BooleanConst16_14_16_19constantValue"] = new bool(false);
        bool BooleanConst16_14_16_194606;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        BooleanConst16_14_16_194606 = *(bool *)sigma["BooleanConst16_14_16_19constantValue"];
        bool BooleanConst16_14_16_19terminates;
        BooleanConst16_14_16_19terminates = BooleanConst16_14_16_194606;
        return BooleanConst16_14_16_19terminates;
}
int function24finishPlus(int n2, int n1)
{
        int Plus4_12_4_214387;
        Plus4_12_4_214387 = n1;
        int Plus4_12_4_214392;
        Plus4_12_4_214392 = n2;
        Plus4_12_4_214386 undefined;
        Plus4_12_4_214386 = Plus4_12_4_214387 + Plus4_12_4_214392;
        int Plus4_12_4_21terminates;
        Plus4_12_4_21terminates = Plus4_12_4_214386;
        return Plus4_12_4_21terminates;
}
int function38finishPlus(int n2, int n1)
{
        int Plus5_12_5_214387;
        Plus5_12_5_214387 = n1;
        int Plus5_12_5_214392;
        Plus5_12_5_214392 = n2;
        Plus5_12_5_214386 undefined;
        Plus5_12_5_214386 = Plus5_12_5_214387 + Plus5_12_5_214392;
        int Plus5_12_5_21terminates;
        Plus5_12_5_21terminates = Plus5_12_5_214386;
        return Plus5_12_5_21terminates;
}
void function58executeAssignment2(int resRight)
{
        int Assignment9_4_9_182524;
        Assignment9_4_9_182524 = resRight;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        *((int *)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_182524;
}
void function75executeAssignment2(int resRight)
{
        int Assignment12_4_12_182524;
        Assignment12_4_12_182524 = resRight;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        *((int *)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_182524;
}
int function27accessVarRef()
{
        int VarRef4_18_4_201583;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        VarRef4_18_4_201583 = *(int *)sigma["Variable0_0_0_10currentValue"];
        int VarRef4_18_4_20terminates;
        VarRef4_18_4_20terminates = VarRef4_18_4_201583;
        return VarRef4_18_4_20terminates;
}
int function25accessVarRef()
{
        int VarRef4_13_4_151583;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        VarRef4_13_4_151583 = *(int *)sigma["Variable0_0_0_10currentValue"];
        int VarRef4_13_4_15terminates;
        VarRef4_13_4_15terminates = VarRef4_13_4_151583;
        return VarRef4_13_4_15terminates;
}
int function41accessVarRef()
{
        int VarRef5_18_5_201583;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        VarRef5_18_5_201583 = *(int *)sigma["Variable1_0_1_10currentValue"];
        int VarRef5_18_5_20terminates;
        VarRef5_18_5_20terminates = VarRef5_18_5_201583;
        return VarRef5_18_5_20terminates;
}
int function39accessVarRef()
{
        int VarRef5_13_5_151583;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        VarRef5_13_5_151583 = *(int *)sigma["Variable1_0_1_10currentValue"];
        int VarRef5_13_5_15terminates;
        VarRef5_13_5_15terminates = VarRef5_13_5_151583;
        return VarRef5_13_5_15terminates;
}
int function64finishPlus(int n2, int n1)
{
        int Plus9_9_9_184387;
        Plus9_9_9_184387 = n1;
        int Plus9_9_9_184392;
        Plus9_9_9_184392 = n2;
        Plus9_9_9_184386 undefined;
        Plus9_9_9_184386 = Plus9_9_9_184387 + Plus9_9_9_184392;
        int Plus9_9_9_18terminates;
        Plus9_9_9_18terminates = Plus9_9_9_184386;
        return Plus9_9_9_18terminates;
}
int function81finishPlus(int n2, int n1)
{
        int Plus12_9_12_184387;
        Plus12_9_12_184387 = n1;
        int Plus12_9_12_184392;
        Plus12_9_12_184392 = n2;
        Plus12_9_12_184386 undefined;
        Plus12_9_12_184386 = Plus12_9_12_184387 + Plus12_9_12_184392;
        int Plus12_9_12_18terminates;
        Plus12_9_12_18terminates = Plus12_9_12_184386;
        return Plus12_9_12_18terminates;
}
int function67accessVarRef()
{
        int VarRef9_15_9_171583;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        VarRef9_15_9_171583 = *(int *)sigma["Variable0_0_0_10currentValue"];
        int VarRef9_15_9_17terminates;
        VarRef9_15_9_17terminates = VarRef9_15_9_171583;
        return VarRef9_15_9_17terminates;
}
int function65accessVarRef()
{
        int VarRef9_10_9_121583;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        VarRef9_10_9_121583 = *(int *)sigma["Variable1_0_1_10currentValue"];
        int VarRef9_10_9_12terminates;
        VarRef9_10_9_12terminates = VarRef9_10_9_121583;
        return VarRef9_10_9_12terminates;
}
int function84accessVarRef()
{
        int VarRef12_15_12_171583;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        VarRef12_15_12_171583 = *(int *)sigma["Variable0_0_0_10currentValue"];
        int VarRef12_15_12_17terminates;
        VarRef12_15_12_17terminates = VarRef12_15_12_171583;
        return VarRef12_15_12_17terminates;
}
int function82accessVarRef()
{
        int VarRef12_10_12_121583;
        const std::lock_guard<std::mutex> lock(sigma_mutex);
        VarRef12_10_12_121583 = *(int *)sigma["Variable1_0_1_10currentValue"];
        int VarRef12_10_12_12terminates;
        VarRef12_10_12_12terminates = VarRef12_10_12_121583;
        return VarRef12_10_12_12terminates;
}
int main()
{
        functioninit3Variable();
        function5initializeVar();
        for (auto entry : sigma)
        {
                std::cout << entry.first << " : " << *((int *)entry.second) << std::endl;
        }
}
