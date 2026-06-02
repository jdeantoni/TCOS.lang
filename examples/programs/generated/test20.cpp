
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
void functioninit12Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable2_0_2_10currentValue"] = new int();}
}
void function14initializeVar(){
	int Variable2_0_2_101432;
	Variable2_0_2_101432 = 0;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101432;}
}
void function80executeAssignment2(int resRight){
	int Assignment16_0_16_202622;
	Assignment16_0_16_202622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202622;}
}
int function47accessVarRef(){
	int VarRef7_4_7_61647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef7_4_7_61647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef7_4_7_6terminates;
	VarRef7_4_7_6terminates = VarRef7_4_7_61647;
	return VarRef7_4_7_6terminates;
}
void function21executeAssignment2(int resRight){
	int Assignment4_7_4_212622;
	Assignment4_7_4_212622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment4_7_4_212622;}
}
void function32executeAssignment2(int resRight){
	int Assignment5_7_5_212622;
	Assignment5_7_5_212622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212622;}
}
bool function85evalBooleanConst(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["BooleanConst16_6_16_10constantValue"] = new bool();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["BooleanConst16_6_16_10constantValue"]) = true;}
	bool BooleanConst16_6_16_104767;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	BooleanConst16_6_16_104767 = *(bool*)sigma["BooleanConst16_6_16_10constantValue"];}
	bool BooleanConst16_6_16_10terminates;
	BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104767;
	return BooleanConst16_6_16_10terminates;
}
void function55executeAssignment2(int resRight){
	int Assignment9_4_9_182622;
	Assignment9_4_9_182622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_182622;}
}
void function69executeAssignment2(int resRight){
	int Assignment12_4_12_182622;
	Assignment12_4_12_182622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_182622;}
}
int function27accessVarRef(){
	int VarRef4_18_4_201647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_18_4_201647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_18_4_20terminates;
	VarRef4_18_4_20terminates = VarRef4_18_4_201647;
	return VarRef4_18_4_20terminates;
}
int function38accessVarRef(){
	int VarRef5_18_5_201647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef5_18_5_201647 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef5_18_5_20terminates;
	VarRef5_18_5_20terminates = VarRef5_18_5_201647;
	return VarRef5_18_5_20terminates;
}
int function61accessVarRef(){
	int VarRef9_15_9_171647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef9_15_9_171647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef9_15_9_17terminates;
	VarRef9_15_9_17terminates = VarRef9_15_9_171647;
	return VarRef9_15_9_17terminates;
}
int function75accessVarRef(){
	int VarRef12_15_12_171647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef12_15_12_171647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef12_15_12_17terminates;
	VarRef12_15_12_17terminates = VarRef12_15_12_171647;
	return VarRef12_15_12_17terminates;
}
int main(){
		functioninit4Variable();
	function6initializeVar();
	functioninit8Variable();
	function10initializeVar();
	functioninit12Variable();
	function14initializeVar();
	bool flag101 = true;
	LockingQueue<Void> synch101;
	std::thread thread18([&](){
		int result27accessVarRef = function27accessVarRef();
	});
	thread18.detach();
	std::thread thread29([&](){
		int result38accessVarRef = function38accessVarRef();
	});
	thread29.detach();
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
