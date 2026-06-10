
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
        
        void functioninit24Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable8_0_8_10currentValue"] = new int();}
}
void function26initializeVar(){
	int Variable8_0_8_101376;
	Variable8_0_8_101376 = 0;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable8_0_8_10currentValue"]) = Variable8_0_8_101376;}
}
int function31accessVarRef(){
	int VarRef9_3_9_51582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef9_3_9_51582 = *(int*)sigma["Variable8_0_8_10currentValue"];}
	int VarRef9_3_9_5terminates;
	VarRef9_3_9_5terminates = VarRef9_3_9_51582;
	return VarRef9_3_9_5terminates;
}
void functioninit10Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable1_4_1_14currentValue"] = new int();}
}
void function12initializeVar(){
	int Variable1_4_1_141376;
	Variable1_4_1_141376 = 1;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_4_1_14currentValue"]) = Variable1_4_1_141376;}
}
void functioninit14Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable2_4_2_14currentValue"] = new int();}
}
void function16initializeVar(){
	int Variable2_4_2_141376;
	Variable2_4_2_141376 = 0;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_4_2_14currentValue"]) = Variable2_4_2_141376;}
}
void function20executeAssignment2(int resRight){
	int Assignment3_4_3_112523;
	Assignment3_4_3_112523 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_4_2_14currentValue"]) = Assignment3_4_3_112523;}
}
int function21accessVarRef(){
	int VarRef3_9_3_111582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef3_9_3_111582 = *(int*)sigma["Variable1_4_1_14currentValue"];}
	int VarRef3_9_3_11terminates;
	VarRef3_9_3_11terminates = VarRef3_9_3_111582;
	return VarRef3_9_3_11terminates;
}
int main(){
		functioninit24Variable();
	function26initializeVar();
	int result31accessVarRef = function31accessVarRef();
	functioninit10Variable();
	function12initializeVar();
	functioninit14Variable();
	function16initializeVar();
	int result21accessVarRef = function21accessVarRef();
	function20executeAssignment2(result21accessVarRef);
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
