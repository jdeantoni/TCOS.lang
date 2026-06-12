
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
        
        void functioninit4Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable0_0_0_10currentValue"] = new int();}
}
void function6initializeVar(){
	int Variable0_0_0_101432;
	Variable0_0_0_101432 = 1;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101432;}
}
void functioninit8Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable1_0_1_10currentValue"] = new int();}
}
void function10initializeVar(){
	int Variable1_0_1_101432;
	Variable1_0_1_101432 = 4;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101432;}
}
void function17executeAssignment2(int resRight){
	int Assignment3_7_3_142622;
	Assignment3_7_3_142622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment3_7_3_142622;}
}
void function23executeAssignment2(int resRight){
	int Assignment4_7_4_142622;
	Assignment4_7_4_142622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment4_7_4_142622;}
}
int function18accessVarRef(){
	int VarRef3_12_3_141647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef3_12_3_141647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef3_12_3_14terminates;
	VarRef3_12_3_14terminates = VarRef3_12_3_141647;
	return VarRef3_12_3_14terminates;
}
int function24accessVarRef(){
	int VarRef4_12_4_141647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_12_4_141647 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef4_12_4_14terminates;
	VarRef4_12_4_14terminates = VarRef4_12_4_141647;
	return VarRef4_12_4_14terminates;
}
int main(){
		functioninit4Variable();
	function6initializeVar();
	functioninit8Variable();
	function10initializeVar();
	bool flag34 = true;
	LockingQueue<Void> synch34;
	std::thread thread14([&](){
		int result18accessVarRef = function18accessVarRef();
		function17executeAssignment2(result18accessVarRef);
		{Void fakeParam34;
 		synch34.push(fakeParam34);}
	});
	thread14.detach();
	std::thread thread20([&](){
		int result24accessVarRef = function24accessVarRef();
		function23executeAssignment2(result24accessVarRef);
		{Void fakeParam34;
 		synch34.push(fakeParam34);}
	});
	thread20.detach();
	{Void joinPopped34;
 	synch34.waitAndPop(joinPopped34);}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
