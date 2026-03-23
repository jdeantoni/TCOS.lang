
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

        struct __AckToken {
            explicit __AckToken(int n) : remaining(n) {}

            void done() {
                if (remaining.fetch_sub(1, std::memory_order_acq_rel) == 1) {
                    std::lock_guard<std::mutex> lk(m);
                    cv.notify_all();
                }
            }

            void wait() {
                std::unique_lock<std::mutex> lk(m);
                cv.wait(lk, [&] { return remaining.load(std::memory_order_acquire) == 0; });
            }

        private:
            std::atomic<int> remaining;
            std::mutex m;
            std::condition_variable cv;
        };

        struct __EventMsg {
            std::any payload;
            std::shared_ptr<__AckToken> ack;
        };

        struct __EventChannel {
            int listenerCount;
            std::string payloadKind;
            std::vector<LockingQueue<__EventMsg>> inboxes;
            std::atomic<size_t> nextListenerIndex{0};
            std::mutex listenersMutex;
            std::unordered_map<std::thread::id, size_t> listenerByThread;
        };

        std::unordered_map<std::string, std::shared_ptr<__EventChannel>> eventChannels;
        std::mutex eventRegistryMutex;
        thread_local std::shared_ptr<__AckToken> __lastEventToken = nullptr;

        std::shared_ptr<__EventChannel> __getEventChannel(const std::string& name){
            const std::lock_guard<std::mutex> lock(eventRegistryMutex);
            auto it = eventChannels.find(name);
            if (it == eventChannels.end()) {
                throw std::runtime_error("Unknown event channel: " + name);
            }
            return it->second;
        }

        void __createEventChannel(const std::string& name, int listenerCount, const std::string& payloadKind){
            auto channel = std::make_shared<__EventChannel>();
            channel->listenerCount = listenerCount > 0 ? listenerCount : 1;
            channel->payloadKind = payloadKind;
            channel->inboxes.resize(static_cast<size_t>(channel->listenerCount));
            const std::lock_guard<std::mutex> lock(eventRegistryMutex);
            eventChannels[name] = channel;
        }

        size_t __resolveListenerIndex(const std::shared_ptr<__EventChannel>& channel){
            const std::lock_guard<std::mutex> lock(channel->listenersMutex);
            auto tid = std::this_thread::get_id();
            auto it = channel->listenerByThread.find(tid);
            if (it != channel->listenerByThread.end()) {
                return it->second;
            }
            size_t index = channel->nextListenerIndex.fetch_add(1) % channel->inboxes.size();
            channel->listenerByThread[tid] = index;
            return index;
        }

        void __emitEvent(const std::string& name, const std::any& payload, bool awaitAcks){
            auto channel = __getEventChannel(name);
            auto ack = std::make_shared<__AckToken>(channel->listenerCount);
            __EventMsg msg{payload, ack};
            for (auto& inbox : channel->inboxes) {
                inbox.push(msg);
            }

            if (awaitAcks){
                ack->wait();
            }
        }

        __EventMsg __waitEvent(const std::string& name){
            auto channel = __getEventChannel(name);
            size_t listenerIndex = __resolveListenerIndex(channel);
            __EventMsg event;
            channel->inboxes[listenerIndex].waitAndPop(event);
            return event;
        }

        void __ackEvent(const std::shared_ptr<__AckToken>& token){
            if (!token){
                return;
            }
            token->done();
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
void function38receiveguardEvent(){
	{
		auto event = __waitEvent("Event0_0_0_8guardEvent");
		//auto Event0_0_0_8guardEventPayload = std::any_cast<std::remove_reference_t<decltype(Event0_0_0_8guardEventPayload)>>(event.payload);
		__lastEventToken = event.ack;
	}
	__ackEvent(__lastEventToken);
}
void function39emitsentEvent(){
	__createEventChannel("Event3_0_3_8sentEvent", 1, "void");
	__emitEvent("Event3_0_3_8sentEvent", 0, true);
}
void functioninit27State(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["State9_4_11_5isInitial"] = new bool();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State9_4_11_5isInitial"]) = false;}
}
void function30firstStartOfInitialState(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["State9_4_11_5isInitial"]) = false;}
}
void function46receiveguardEvent(){
	{
		auto event = __waitEvent("Event1_0_1_8guardEvent");
		//Event1_0_1_8guardEventPayload = std::any_cast<std::remove_reference_t<decltype(Event1_0_1_8guardEventPayload)>>(__event.payload);
		__lastEventToken = event.ack;
	}
	__ackEvent(__lastEventToken);
}
void function47emitsentEvent(){
	__createEventChannel("Event4_0_4_8sentEvent", 1, "void");
	__emitEvent("Event4_0_4_8sentEvent", 0, true);
}
int main(){
		std::thread thread15([&](){
		function18init();
		bool flag64 = true;
		LockingQueue<Void> synch64;
		{Void fakeParam64;
 		synch64.push(fakeParam64);}
		{Void joinPopped64;
 		synch64.waitAndPop(joinPopped64);}
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
			bool flag57 = true;
			LockingQueue<Void> synch57;
			std::thread thread34([&](){
			});
			thread34.detach();
		}
	});
	thread15.detach();
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
