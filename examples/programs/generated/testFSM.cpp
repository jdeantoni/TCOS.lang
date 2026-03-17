
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
        
        int main(){
		std::thread thread15([&](){
		bool flag53= true;
while (flag53 == true){
	flag53 = false;
			{Void joinPopped53;
 			synch53.waitAndPop(joinPopped53);}
			bool flag46 = true;
			LockingQueue<Void> synch46;
			std::thread thread25([&](){
			});
			thread25.detach();
		}
	});
	thread15.detach();
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
