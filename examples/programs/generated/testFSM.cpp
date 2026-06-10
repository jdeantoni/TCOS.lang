
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
	com_create_event_channel("Event3_0_3_8", 1, "void");
	com_create_event_channel("Event4_0_4_8", 1, "void");
}
void function18init(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State6_4_9_5isInitial"]) = true;}
}
void functioninit20State(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["State6_4_9_5isInitial"] = new bool();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State6_4_9_5isInitial"]) = false;}
}
void function24firstStartOfInitialState(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State6_4_9_5isInitial"]) = false;}
}
void function40emitsentEvent(){
	std::any Event3_0_3_8sentEventPayload;
	Event3_0_3_8sentEventPayload = 0;
	com_emit_event("Event3_0_3_8", Event3_0_3_8sentEventPayload, true);
}
void functioninit28State(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["State10_4_13_5isInitial"] = new bool();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State10_4_13_5isInitial"]) = false;}
}
void function32firstStartOfInitialState(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State10_4_13_5isInitial"]) = false;}
}
void function47emitsentEvent(){
	std::any Event4_0_4_8sentEventPayload;
	Event4_0_4_8sentEventPayload = 0;
	com_emit_event("Event4_0_4_8", Event4_0_4_8sentEventPayload, true);
}
int main(){
		function0FSMstart();
	bool flag52 = true;
	LockingQueue<Void> synch52;
	std::thread thread15([&](){
		function18init();
		bool flag64 = true;
		LockingQueue<Void> synch64;
		{Void fakeParam64;
 		synch64.push(fakeParam64);}
		flag64 = true;
		flag64= true;
while (flag64 == true){
	flag64 = false;
			{Void joinPopped64;
 			synch64.waitAndPop(joinPopped64);}
			functioninit20State();
			bool flag25 = true;
			LockingQueue<Void> synch25;
			bool flag26 = true;
			LockingQueue<Void> synch26;
			bool flag57 = true;
			LockingQueue<Void> synch57;
			bool flag39 = true;
			LockingQueue<Void> synch39;
			if (State6_4_9_5isInitial == true){
				function24firstStartOfInitialState();
				{Void fakeParam26;
 				synch26.push(fakeParam26);}
				{Void joinPopped26;
 				synch26.waitAndPop(joinPopped26);}
				std::thread thread36([&](){
					{Void joinPopped39;
 					synch39.waitAndPop(joinPopped39);}
					function40emitsentEvent();
					std::thread thread37([&](){
						{Void joinPopped57;
 						synch57.waitAndPop(joinPopped57);}
					});
					thread37.detach();
					std::thread thread28([&](){
						functioninit28State();
						bool flag33 = true;
						LockingQueue<Void> synch33;
						bool flag34 = true;
						LockingQueue<Void> synch34;
						bool flag62 = true;
						LockingQueue<Void> synch62;
						bool flag46 = true;
						LockingQueue<Void> synch46;
						if (State10_4_13_5isInitial == true){
							function32firstStartOfInitialState();
							{Void fakeParam34;
 							synch34.push(fakeParam34);}
							{Void joinPopped34;
 							synch34.waitAndPop(joinPopped34);}
							std::thread thread43([&](){
								{Void joinPopped46;
 								synch46.waitAndPop(joinPopped46);}
								function47emitsentEvent();
								std::thread thread44([&](){
									{Void joinPopped62;
 									synch62.waitAndPop(joinPopped62);}
								});
								thread44.detach();
								std::thread thread45([&](){
								});
								thread45.detach();
								std::thread thread64([&](){
								});
								thread64.detach();
							});
							thread43.detach();
						}
						if (State10_4_13_5isInitial == false){
							{Void joinPopped33;
 							synch33.waitAndPop(joinPopped33);}
							{Void fakeParam33;
 							synch33.push(fakeParam33);}
						}
					});
					thread28.detach();
				});
				thread36.detach();
			}
			if (State6_4_9_5isInitial == false){
				{Void joinPopped25;
 				synch25.waitAndPop(joinPopped25);}
				{Void fakeParam25;
 				synch25.push(fakeParam25);}
			}
		}
	});
	thread15.detach();
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
