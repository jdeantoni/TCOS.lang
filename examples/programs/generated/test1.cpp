
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
        
        void function3perioStart(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Perio0_0_2_1blocTrigger"] = new int();}
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Perio0_0_2_1blocTrigger"]) = 1000;}
}
void functioninit31Timer(){
std::this_thread::sleep_for(1000ms);}
void function19fugaceStmt1(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Stmt11_6_1_11fakeState"] = new int();}
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Stmt11_6_1_11fakeState"]) = 0;}
}
void function21fugaceStmt1(){
{const std::lock_guard<std::mutex> lock(sigma_mutex);sigma["Stmt11_14_1_19fakeState"] = new int();}
{const std::lock_guard<std::mutex> lock(sigma_mutex);*((int*)sigma["Stmt11_14_1_19fakeState"]) = 0;}
}
int main(){
		function3perioStart();
	LockingQueue<Void> synch8;
	{Void fakeParam8;
 	synch8.push(fakeParam8);}
	goto flag8;
	flag8 :
	{Void joinPopped8;
 	synch8.waitAndPop(joinPopped8);}
	functioninit31Timer();
	LockingQueue<Void> synch14;
	std::thread thread9([&](){
	std::thread thread15([&](){

        std::cout << "Hello from thread 15" << std::endl;
	function19fugaceStmt1();
	function21fugaceStmt1();
	{Void fakeParam14;
 	synch14.push(fakeParam14);}
	});
	thread15.detach();
	std::thread thread23([&](){
        std::cout << "Hello from thread 23" << std::endl;
	});
	thread23.detach();
	});
	thread9.detach();
	{Void fakeParam8;
 	synch8.push(fakeParam8);}
	goto flag8;
	{Void joinPopped14;
 	synch14.waitAndPop(joinPopped14);}
	{Void joinPopped14;
 	synch14.waitAndPop(joinPopped14);}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}}
