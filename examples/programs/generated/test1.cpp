
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
