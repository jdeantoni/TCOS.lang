
        #include <string>
        #include <unordered_map>
        #include <thread>
        #include <mutex>
        #include <iostream>
        #include <chrono>
        #include <any>
        #include <condition_variable>
        #include <atomic>
        #include <memory>
        #include <vector>
        #include <type_traits>
        #include <stdexcept>
        #include "../utils/LockingQueue.hpp"
        
        using namespace std::chrono_literals;
        
        class Void{
        };
        
        std::unordered_map<std::string, void*> sigma;
        std::mutex sigma_mutex;  // protects sigma

        struct com_EventChannel {
            int listenerCount;
            std::string payloadKind;
            LockingQueue<std::pair<std::any, int>> queue;
            int nextToken;
            std::unordered_map<int, int> pendingAcks;
        };

        std::unordered_map<std::string, std::shared_ptr<com_EventChannel>> eventChannels;
        std::unordered_map<int, std::string> eventTokenToChannel;
        std::mutex eventMutex;
        int com_last_event_token = -1;

        std::shared_ptr<com_EventChannel> com_get_event_channel(const std::string& name){
            const std::lock_guard<std::mutex> lock(eventMutex);
            auto it = eventChannels.find(name);
            if (it == eventChannels.end()) {
                throw std::runtime_error("Unknown event channel: " + name);
            }
            return it->second;
        }

        void com_create_event_channel(const std::string& name, int listenerCount, const std::string& payloadKind){
            const std::lock_guard<std::mutex> lock(eventMutex);
            if (eventChannels.find(name) != eventChannels.end()) {
                return;
            }
            auto channel = std::make_shared<com_EventChannel>();
            channel->listenerCount = listenerCount;
            channel->payloadKind = payloadKind;
            channel->nextToken = 1;
            eventChannels[name] = channel;
        }

        void com_emit_event(const std::string& name, const std::any& payload, bool awaitAcks){
            auto channel = com_get_event_channel(name);

            int token;
            {
                const std::lock_guard<std::mutex> lock(eventMutex);
                token = channel->nextToken;
                channel->nextToken += 1;
                int expectedAcks = awaitAcks ? channel->listenerCount : 0;
                if (expectedAcks > 0) {
                    channel->pendingAcks[token] = expectedAcks;
                    eventTokenToChannel[token] = name;
                }
            }

            channel->queue.push({payload, token});

            if (awaitAcks){
                int remaining = 0;
                do {
                    {
                        const std::lock_guard<std::mutex> lock(eventMutex);
                        auto it = channel->pendingAcks.find(token);
                        remaining = (it == channel->pendingAcks.end()) ? 0 : it->second;
                    }
                    if (remaining > 0) {
                        std::this_thread::sleep_for(10ms);
                    }
                } while (remaining > 0);

                const std::lock_guard<std::mutex> lock(eventMutex);
                channel->pendingAcks.erase(token);
                eventTokenToChannel.erase(token);
            }
        }

        std::pair<std::any, int> com_wait_event(const std::string& name){
            auto channel = com_get_event_channel(name);
            std::pair<std::any, int> event;
            channel->queue.waitAndPop(event);
            return event;
        }

        void com_ack_event(int token){
            const std::lock_guard<std::mutex> lock(eventMutex);
            auto tokenIt = eventTokenToChannel.find(token);
            if (tokenIt == eventTokenToChannel.end()) {
                return;
            }

            auto channelIt = eventChannels.find(tokenIt->second);
            if (channelIt == eventChannels.end()) {
                return;
            }

            auto channel = channelIt->second;
            int remaining = 0;
            auto pendingIt = channel->pendingAcks.find(token);
            if (pendingIt != channel->pendingAcks.end()) {
                remaining = pendingIt->second;
            }
            remaining -= 1;

            if (remaining <= 0) {
                channel->pendingAcks.erase(token);
                eventTokenToChannel.erase(token);
            } else {
                channel->pendingAcks[token] = remaining;
            }
        }
        
        void function4perioStart(){
std::cout << "	function4perioStart started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Perio0_0_2_1blocTrigger"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Perio0_0_2_1blocTrigger"]) = 1000;}
}
void functioninit36Timer(){
std::cout << "	functioninit36Timer started" << std::endl;
	std::this_thread::sleep_for(1000ms);
}
void function21fugaceStmt1(){
std::cout << "	function21fugaceStmt1 started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Stmt11_6_1_11fakeState"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Stmt11_6_1_11fakeState"]) = 0;}
}
void function24fugaceStmt2(){
std::cout << "	function24fugaceStmt2 started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Stmt21_14_1_19fakeState"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Stmt21_14_1_19fakeState"]) = 0;}
}
void function31fugaceStmt2(){
std::cout << "	function31fugaceStmt2 started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Stmt21_25_1_30fakeState"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Stmt21_25_1_30fakeState"]) = 0;}
}
void function34fugaceStmt1(){
std::cout << "	function34fugaceStmt1 started" << std::endl;
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
		functioninit36Timer();
		bool flag15 = true;
		LockingQueue<Void> synch15;
		std::thread thread10([&](){
		std::cout << "thread10 started" << std::endl;
			std::thread thread16([&](){
			std::cout << "thread16 started" << std::endl;
				function21fugaceStmt1();
				function24fugaceStmt2();
				{Void fakeParam15;
 				synch15.push(fakeParam15);}
			});
			thread16.detach();
			std::thread thread26([&](){
			std::cout << "thread26 started" << std::endl;
				function31fugaceStmt2();
				function34fugaceStmt1();
				{Void fakeParam15;
 				synch15.push(fakeParam15);}
			});
			thread26.detach();
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
