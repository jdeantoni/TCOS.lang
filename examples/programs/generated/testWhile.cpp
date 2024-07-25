
#include <string>
#include <unordered_map>
#include <thread>
#include <mutex>
#include <iostream>
#include <chrono>
#include "../utils/LockingQueue.hpp"

using namespace std::chrono_literals;

class Void
{
};

std::unordered_map<std::string, void *> sigma;
std::mutex sigma_mutex; // protects sigma

void functioninit3Variable()
{
    sigma["Variable0_0_0_10currentValue"] = new int();
}
void function5initializeVar()
{
    int Variable0_0_0_101430;
    Variable0_0_0_101430 = 1;
    *((int *)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101430;
}
void functioninit6Variable()
{
    sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar()
{
    int Variable1_0_1_101430;
    Variable1_0_1_101430 = 0;
    *((int *)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101430;
}
void functioninit9Variable()
{
    sigma["Variable2_0_2_11currentValue"] = new int();
}
void function11initializeVar()
{
    int Variable2_0_2_111430;
    Variable2_0_2_111430 = 42;
    *((int *)sigma["Variable2_0_2_11currentValue"]) = Variable2_0_2_111430;
}
int function14accessVarRef()
{
    int VarRef4_7_4_91645;
    VarRef4_7_4_91645 = *(int *)sigma["Variable0_0_0_10currentValue"];
    int VarRef4_7_4_9terminates;
    VarRef4_7_4_9terminates = VarRef4_7_4_91645;
    return VarRef4_7_4_9terminates;
}
int function22accessVarRef()
{
    int VarRef6_9_6_111645;
    VarRef6_9_6_111645 = *(int *)sigma["Variable1_0_1_10currentValue"];
    int VarRef6_9_6_11terminates;
    VarRef6_9_6_11terminates = VarRef6_9_6_111645;
    return VarRef6_9_6_11terminates;
}
void function24executeAssignment2(int resRight)
{
    int Assignment6_4_6_112620;
    Assignment6_4_6_112620 = resRight;
    *((int *)sigma["Variable0_0_0_10currentValue"]) = Assignment6_4_6_112620;
}
int function27accessVarRef()
{
    int VarRef7_9_7_111645;
    VarRef7_9_7_111645 = *(int *)sigma["Variable2_0_2_11currentValue"];
    int VarRef7_9_7_11terminates;
    VarRef7_9_7_11terminates = VarRef7_9_7_111645;
    return VarRef7_9_7_11terminates;
}
void function29executeAssignment2(int resRight)
{
    int Assignment7_4_7_112620;
    Assignment7_4_7_112620 = resRight;
    *((int *)sigma["Variable1_0_1_10currentValue"]) = Assignment7_4_7_112620;
}
int main()
{
    functioninit3Variable();
    function5initializeVar();
    functioninit6Variable();
    function8initializeVar();
    functioninit9Variable();
    function11initializeVar();
    lockingQueue<Void> synch31;
    Void fakeParam31;
    synch31.push(fakeParam31);
    goto synch31;
    LockingQueue<Void> queue31;
    Void joinPopped31;
    synch31.waitAndPop();
    int result14accessVarRef = function14accessVarRef();
    int VarRef4_7_4_9terminate;
    VarRef4_7_4_9terminate = result14accessVarRef;
    if (VarRef4_7_4_9terminate == true)
    {
        int result22accessVarRef = function22accessVarRef();
        function24executeAssignment2(result22accessVarRef);
        int result27accessVarRef = function27accessVarRef();
        function29executeAssignment2(result27accessVarRef);
        Void fakeParam31;
        synch31.push(fakeParam31);
        goto synch31;
    }
    if (VarRef4_7_4_9terminate == false)
    {
    }
}
