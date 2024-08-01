
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
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		sigma["Variable2_0_2_10currentValue"] = new int();
	}
}
void function5initializeVar()
{
	int Variable2_0_2_101387;
	Variable2_0_2_101387 = 1;
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		*((int *)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101387;
	}
}
void functioninit6Variable()
{
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		sigma["Variable4_0_4_10currentValue"] = new int();
	}
}
void function8initializeVar()
{
	int Variable4_0_4_101387;
	Variable4_0_4_101387 = 3;
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		*((int *)sigma["Variable4_0_4_10currentValue"]) = Variable4_0_4_101387;
	}
}
int function16accessVarRef()
{
	int VarRef8_4_8_61593;
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		VarRef8_4_8_61593 = *(int *)sigma["Variable2_0_2_10currentValue"];
	}
	int VarRef8_4_8_6terminates;
	VarRef8_4_8_6terminates = VarRef8_4_8_61593;
	return VarRef8_4_8_6terminates;
}
void function24executeAssignment2(int resRight)
{
	int Assignment9_4_9_112534;
	Assignment9_4_9_112534 = resRight;
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		*((int *)sigma["Variable2_0_2_10currentValue"]) = Assignment9_4_9_112534;
	}
}
void function33executeAssignment2(int resRight)
{
	int Assignment11_4_11_92534;
	Assignment11_4_11_92534 = resRight;
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		*((int *)sigma["Variable4_0_4_10currentValue"]) = Assignment11_4_11_92534;
	}
}
int function25accessVarRef()
{
	int VarRef9_9_9_111593;
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		VarRef9_9_9_111593 = *(int *)sigma["Variable4_0_4_10currentValue"];
	}
	int VarRef9_9_9_11terminates;
	VarRef9_9_9_11terminates = VarRef9_9_9_111593;
	return VarRef9_9_9_11terminates;
}
int function34accessVarRef()
{
	int VarRef11_7_11_91593;
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		VarRef11_7_11_91593 = *(int *)sigma["Variable2_0_2_10currentValue"];
	}
	int VarRef11_7_11_9terminates;
	VarRef11_7_11_9terminates = VarRef11_7_11_91593;
	return VarRef11_7_11_9terminates;
}
int main()
{
	functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	int result16accessVarRef = function16accessVarRef();
	bool flag15 = true;
	LockingQueue<Void> synch15;
	int VarRef8_4_8_6terminate;
	VarRef8_4_8_6terminate = result16accessVarRef;
	if (VarRef8_4_8_6terminate == true)
	{
		int result25accessVarRef = function25accessVarRef();
		function24executeAssignment2(result25accessVarRef);
		{
			Void fakeParam15;
			synch15.push(fakeParam15);
		}
	}
	if (VarRef8_4_8_6terminate == false)
	{
		int result34accessVarRef = function34accessVarRef();
		function33executeAssignment2(result34accessVarRef);
		{
			Void fakeParam15;
			synch15.push(fakeParam15);
		}
	}
	{
		Void joinPopped15;
		synch15.waitAndPop(joinPopped15);
	}
	for (auto entry : sigma)
	{
		std::cout << entry.first << " : " << *((int *)entry.second) << std::endl;
	}
}
