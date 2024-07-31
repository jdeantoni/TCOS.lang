
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

void function3perioStart()
{
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		sigma["Perio0_0_2_1blocTrigger"] = new int();
	}
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		*((int *)sigma["Perio0_0_2_1blocTrigger"]) = 1000;
	}
}
void functioninit31Timer()
{
	std::this_thread::sleep_for(1000ms);
}
void function19fugaceStmt1()
{
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		sigma["Stmt11_6_1_11fakeState"] = new int();
	}
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		*((int *)sigma["Stmt11_6_1_11fakeState"]) = 0;
	}
}
void function29fugaceStmt1()
{
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		sigma["Stmt11_33_1_38fakeState"] = new int();
	}
	{
		const std::lock_guard<std::mutex> lock(sigma_mutex);
		*((int *)sigma["Stmt11_33_1_38fakeState"]) = 0;
	}
}
int main()
{
	function3perioStart();
	bool flag8 = true;
	LockingQueue<Void> synch8;
	{
		Void fakeParam8;
		synch8.push(fakeParam8);
	}
	flag8 = true;
	flag8 = true;
	while (flag8 == true)
	{
		flag8 = false;
		{
			Void joinPopped8;
			synch8.waitAndPop(joinPopped8);
		}
		functioninit31Timer();
		bool flag14 = true;
		LockingQueue<Void> synch14;
		std::thread thread9([&]()
							{
	std::thread thread15([&](){
		std::cout << "Thread 15" << std::endl;
	function19fugaceStmt1();
	{Void fakeParam14;
 	synch14.push(fakeParam14);}
	});
	thread15.detach();
	std::thread thread23([&](){
		std::cout << "Thread 23" << std::endl;
	function29fugaceStmt1();
	{Void fakeParam14;
 	synch14.push(fakeParam14);}
	});
	thread23.detach(); });
		thread9.detach();
		{
			Void fakeParam8;
			synch8.push(fakeParam8);
		}
		flag8 = true;
		{
			Void joinPopped14;
			synch14.waitAndPop(joinPopped14);
		}
		{
			Void joinPopped14;
			synch14.waitAndPop(joinPopped14);
		}
	}
	for (auto entry : sigma)
	{
		std::cout << entry.first << " : " << *((int *)entry.second) << std::endl;
	}
}
