
        #include <string>
        #include <unordered_map>
        #include <thread>
        #include <mutex>
        #include <iostream>
        #include <chrono>
        #include "../utils/LockingQueue.hpp"
        
        using namespace std::chrono_literals;
        
        class Void{
        };
        
        std::unordered_map<std::string, void*> sigma;
        std::mutex sigma_mutex;  // protects sigma
        
        void function4perioStart(){
std::cout << "	function4perioStart started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Perio0_0_2_1blocTrigger"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Perio0_0_2_1blocTrigger"]) = 1000;}
}
void functioninit34Timer(){
std::cout << "	functioninit34Timer started" << std::endl;
	std::this_thread::sleep_for(1000ms);
}
void function21fugaceStmt1(){
std::cout << "	function21fugaceStmt1 started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Stmt11_6_1_11fakeState"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Stmt11_6_1_11fakeState"]) = 0;}
}
void function32fugaceStmt1(){
std::cout << "	function32fugaceStmt1 started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Stmt11_33_1_38fakeState"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Stmt11_33_1_38fakeState"]) = 0;}
}
int main(){
		function4perioStart();
	bool flag9 = true;
	LockingQueue<Void> synch9;
	{Void fakeParam9;
 	synch9.push(fakeParam9);}
	flag9 = true;
	flag9= true;
while (flag9 == true){
	flag9 = false;
		{Void joinPopped9;
 		synch9.waitAndPop(joinPopped9);}
		functioninit34Timer();
		bool flag15 = true;
		LockingQueue<Void> synch15;
		std::thread thread10([&](){
		std::cout << "thread10 started" << std::endl;
			std::thread thread16([&](){
			std::cout << "thread16 started" << std::endl;
				function21fugaceStmt1();
				{Void fakeParam15;
 				synch15.push(fakeParam15);}
			});
			thread16.detach();
			std::thread thread25([&](){
			std::cout << "thread25 started" << std::endl;
				function32fugaceStmt1();
				{Void fakeParam15;
 				synch15.push(fakeParam15);}
			});
			thread25.detach();
		});
		thread10.detach();
		{Void fakeParam9;
 		synch9.push(fakeParam9);}
		flag9 = true;
		{Void joinPopped15;
 		synch15.waitAndPop(joinPopped15);}
		{Void joinPopped15;
 		synch15.waitAndPop(joinPopped15);}
	}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
