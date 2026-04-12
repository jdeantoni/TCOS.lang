
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
        
        void function0FSMstart(){
	com_create_event_channel("Event0_0_0_8", 1, "void");
	com_create_event_channel("Event3_0_3_8", 1, "void");
	com_create_event_channel("Event1_0_1_8", 1, "void");
	com_create_event_channel("Event4_0_4_8", 1, "void");
}
void function18init(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State6_4_8_5isInitial"]) = true;}
}
void functioninit20State(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["State6_4_8_5isInitial"] = new bool();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State6_4_8_5isInitial"]) = false;}
}
void function23firstStartOfInitialState(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State6_4_8_5isInitial"]) = false;}
}
void function37fire(){
	
		auto event = com_wait_event("Event0_0_0_8");
		auto Event0_0_0_8guardEventPayload = std::any{};
		auto Event0_0_0_8Token = event.second;
		com_last_event_token = event.second;
	
	com_ack_event(Event0_0_0_8Token);
}
void function38emitsentEvent(){
	std::any Event3_0_3_8sentEventPayload;
	Event3_0_3_8sentEventPayload = 0;
	com_emit_event("Event3_0_3_8", Event3_0_3_8sentEventPayload, true);
}
void functioninit27State(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["State9_4_11_5isInitial"] = new bool();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State9_4_11_5isInitial"]) = false;}
}
void function30firstStartOfInitialState(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State9_4_11_5isInitial"]) = false;}
}
void function44fire(){
	
		auto event = com_wait_event("Event1_0_1_8");
		auto Event1_0_1_8guardEventPayload = std::any{};
		auto Event1_0_1_8Token = event.second;
		com_last_event_token = event.second;
	
	com_ack_event(Event1_0_1_8Token);
}
void function45emitsentEvent(){
	std::any Event4_0_4_8sentEventPayload;
	Event4_0_4_8sentEventPayload = 0;
	com_emit_event("Event4_0_4_8", Event4_0_4_8sentEventPayload, true);
}
int main(){
		function0FSMstart();
	bool flag50 = true;
	LockingQueue<Void> synch50;
	std::thread thread15([&](){
		function18init();
		bool flag62 = true;
		LockingQueue<Void> synch62;
		{Void fakeParam62;
 		synch62.push(fakeParam62);}
		{Void joinPopped62;
 		synch62.waitAndPop(joinPopped62);}
		functioninit20State();
		function23firstStartOfInitialState();
		bool flag25 = true;
		LockingQueue<Void> synch25;
		{Void fakeParam25;
 		synch25.push(fakeParam25);}
		flag25 = true;
		flag25= true;
while (flag25 == true){
	flag25 = false;
			{Void joinPopped25;
 			synch25.waitAndPop(joinPopped25);}
			bool flag55 = true;
			LockingQueue<Void> synch55;
			std::thread thread34([&](){
				function37fire();
				function38emitsentEvent();
				bool flag24 = true;
				LockingQueue<Void> synch24;
				std::thread thread35([&](){
					{Void joinPopped55;
 					synch55.waitAndPop(joinPopped55);}
				});
				thread35.detach();
				std::thread thread27([&](){
					functioninit27State();
					function30firstStartOfInitialState();
					bool flag32 = true;
					LockingQueue<Void> synch32;
					{Void fakeParam32;
 					synch32.push(fakeParam32);}
					{Void joinPopped32;
 					synch32.waitAndPop(joinPopped32);}
					bool flag60 = true;
					LockingQueue<Void> synch60;
					std::thread thread41([&](){
						function44fire();
						function45emitsentEvent();
						bool flag31 = true;
						LockingQueue<Void> synch31;
						std::thread thread42([&](){
							{Void joinPopped60;
 							synch60.waitAndPop(joinPopped60);}
						});
						thread42.detach();
						std::thread thread43([&](){
						});
						thread43.detach();
						std::thread thread62([&](){
						});
						thread62.detach();
					});
					thread41.detach();
				});
				thread27.detach();
				{Void joinPopped31;
 				synch31.waitAndPop(joinPopped31);}
				{Void joinPopped31;
 				synch31.waitAndPop(joinPopped31);}
			});
			thread34.detach();
		}
		{Void joinPopped24;
 		synch24.waitAndPop(joinPopped24);}
		{Void joinPopped24;
 		synch24.waitAndPop(joinPopped24);}
	});
	thread15.detach();
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
