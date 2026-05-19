
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
        
        void function0startsProgram(){
std::cout << "	function0startsProgram started" << std::endl;
	com_create_event_channel("ComID0_20_0_24", 1, "void");
}
void function6perioStart(){
std::cout << "	function6perioStart started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Perio2_0_4_1blocTrigger"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Perio2_0_4_1blocTrigger"]) = 1000;}
}
void functioninit53Timer(){
std::cout << "	functioninit53Timer started" << std::endl;
	std::this_thread::sleep_for(1000ms);
}
void function25finishWait(){
std::cout << "	function25finishWait started" << std::endl;
	
		auto event = com_wait_event("ComID0_20_0_24");
		auto ComID0_20_0_24waitIDPayload = std::any{};
		auto ComID0_20_0_24Token = event.second;
		com_last_event_token = event.second;
	
	com_ack_event(ComID0_20_0_24Token);
}
void function52emitnotifyID(){
std::cout << "	function52emitnotifyID started" << std::endl;
	std::any ComID0_20_0_24notifyIDPayload;
	ComID0_20_0_24notifyIDPayload = 0;
	com_emit_event("ComID0_20_0_24", ComID0_20_0_24notifyIDPayload, true);
}
void function31fugaceStmt1(){
std::cout << "	function31fugaceStmt1 started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Stmt13_18_3_23fakeState"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Stmt13_18_3_23fakeState"]) = 0;}
}
void function34fugaceStmt1(){
std::cout << "	function34fugaceStmt1 started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Stmt13_25_3_30fakeState"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Stmt13_25_3_30fakeState"]) = 0;}
}
void function45fugaceStmt2(){
std::cout << "	function45fugaceStmt2 started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Stmt23_38_3_43fakeState"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Stmt23_38_3_43fakeState"]) = 0;}
}
void function48fugaceStmt2(){
std::cout << "	function48fugaceStmt2 started" << std::endl;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Stmt23_46_3_51fakeState"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Stmt23_46_3_51fakeState"]) = 0;}
}
int main(){
		function0startsProgram();
	function6perioStart();
	bool flag11 = true;
	LockingQueue<Void> synch11;
	{Void fakeParam11;
 	synch11.push(fakeParam11);}
	flag11 = true;
	flag11= true;
while (flag11 == true){
	flag11 = false;
		{Void joinPopped11;
 		synch11.waitAndPop(joinPopped11);}
		functioninit53Timer();
		bool flag17 = true;
		LockingQueue<Void> synch17;
		std::thread thread12([&](){
		std::cout << "thread12 started" << std::endl;
			std::thread thread18([&](){
			std::cout << "thread18 started" << std::endl;
				function25finishWait();
				function31fugaceStmt1();
				function34fugaceStmt1();
				{Void fakeParam17;
 				synch17.push(fakeParam17);}
			});
			thread18.detach();
			std::thread thread36([&](){
			std::cout << "thread36 started" << std::endl;
				function45fugaceStmt2();
				function48fugaceStmt2();
				function52emitnotifyID();
				{Void fakeParam17;
 				synch17.push(fakeParam17);}
			});
			thread36.detach();
		});
		thread12.detach();
		{Void fakeParam11;
 		synch11.push(fakeParam11);}
		flag11 = true;
		{Void joinPopped17;
 		synch17.waitAndPop(joinPopped17);}
		{Void joinPopped17;
 		synch17.waitAndPop(joinPopped17);}
	}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
