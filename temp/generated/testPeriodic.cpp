
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
	int Variable0_0_0_101377 = 1; // undefined
	// TODO: fix this and avoid memory leak by deleting, constructing appropriately
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	(*((int *)sigma["Variable0_0_0_10currentValue"])) = Variable0_0_0_101377;
}
void functioninit6Variable()
{
	sigma["Variable1_0_1_10currentValue"] = new int();
}
void function8initializeVar()
{
	int Variable1_0_1_101377 = 0; // undefined
	// TODO: fix this and avoid memory leak by deleting, constructing appropriately
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	(*((int *)sigma["Variable1_0_1_10currentValue"])) = Variable1_0_1_101377;
}
void function9periodicStart()
{
	sigma["PeriodicBloc3_0_5_3blocTrigger"] = new int(1000);
}
void functionstarts11blocTrigger()
{
	std::this_thread::sleep_for(1000ms);
}
int function22accessVarRef()
{
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_13_4_151583 = *(int *)sigma["Variable0_0_0_10currentValue"]; // currentValue}
	int VarRef4_13_4_15terminates = VarRef4_13_4_151583;
	return VarRef4_13_4_15terminates;
}
int function24accessVarRef()
{
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef4_10_4_121583 = *(int *)sigma["Variable0_0_0_10currentValue"]; // currentValue}
	int VarRef4_10_4_12terminates = VarRef4_10_4_121583;
	return VarRef4_10_4_12terminates;
}
int function26finishPlus(int n2, int n1)
{
	int Plus4_9_4_164243 = n2;
	int Plus4_9_4_164268 = n1;
	int Plus4_9_4_164387 = n1; // was Plus4_9_4_164268; but using the parameter name now
	int Plus4_9_4_164392 = n2; // was Plus4_9_4_164243; but using the parameter name now
	int Plus4_9_4_164386 = Plus4_9_4_164387 + Plus4_9_4_164392;
	int Plus4_9_4_16terminates = Plus4_9_4_164386;
	return Plus4_9_4_16terminates;
}
void function27executeAssignment2(int resRight)
{
	int Assignment4_4_4_162524 = resRight; // was Assignment4_4_4_162358; but using the parameter name now
										   // TODO: fix this and avoid memory leak by deleting, constructing appropriately
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	(*((int *)sigma["Variable0_0_0_10currentValue"])) = Assignment4_4_4_162524;
}
int function32accessVarRef()
{
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	int VarRef7_5_7_71583 = *(int *)sigma["Variable0_0_0_10currentValue"]; // currentValue}
	int VarRef7_5_7_7terminates = VarRef7_5_7_71583;
	return VarRef7_5_7_7terminates;
}
void function34executeAssignment2(int resRight)
{
	int Assignment7_0_7_72524 = resRight; // was Assignment7_0_7_72358; but using the parameter name now
										  // TODO: fix this and avoid memory leak by deleting, constructing appropriately
	const std::lock_guard<std::mutex> lock(sigma_mutex);
	(*((int *)sigma["Variable1_0_1_10currentValue"])) = Assignment7_0_7_72524;
}

int main()
{
	functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	function9periodicStart();

	LockingQueue<Void> queue29;
	{

		Void fakeParam29;
		queue29.push(fakeParam29);

		goto queue29;
	}
queue29: // or join node
	Void OrJoinPopped_29;
	queue29.waitAndPop(OrJoinPopped_29);
	functionstarts11blocTrigger();

	LockingQueue<int> queue26;
	std::thread thread14([&]()
						 {
							 std::thread thread22([&]()
												  {
													  int result22accessVarRef = function22accessVarRef();
													  {

														  queue26.push(result22accessVarRef);
													  }
												  });
							 thread22.detach();

							 std::thread thread24([&]()
												  {
													  int result24accessVarRef = function24accessVarRef();
													  {

														  queue26.push(result24accessVarRef);
													  }
												  });
							 thread24.detach();

							 // start of and join node

							 int AndJoinPopped_26_0;
							 queue26.waitAndPop(AndJoinPopped_26_0);

							 int AndJoinPopped_26_1;
							 queue26.waitAndPop(AndJoinPopped_26_1);
							 int result26finishPlus = function26finishPlus(AndJoinPopped_26_0, AndJoinPopped_26_1);

							 // end of and join node
							 function27executeAssignment2(result26finishPlus);
						 });
	thread14.detach();
	{

		Void fakeParam29;
		queue29.push(fakeParam29);
// WARNING !! temporary code to test
	for (auto entry : sigma)
	{
		std::cout << entry.first << " : " << *((int *)entry.second) << std::endl;
	}
		goto queue29;
	}

	// WARNING !! temporary code to test
	for (auto entry : sigma)
	{
		std::cout << entry.first << " : " << *((int *)entry.second) << std::endl;
	}
}
