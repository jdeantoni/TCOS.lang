
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
	Variable1_0_1_101432 = 0;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101432;}
}
void functioninit12Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable2_0_2_11currentValue"] = new int();}
}
void function14initializeVar(){
	int Variable2_0_2_111432;
	Variable2_0_2_111432 = 42;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_0_2_11currentValue"]) = Variable2_0_2_111432;}
}
int function21accessVarRef(){
	int VarRef4_7_4_91647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_7_4_91647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_7_4_9terminates;
	VarRef4_7_4_9terminates = VarRef4_7_4_91647;
	return VarRef4_7_4_9terminates;
}
void function29executeAssignment2(int resRight){
	int Assignment6_4_6_112622;
	Assignment6_4_6_112622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment6_4_6_112622;}
}
void function35executeAssignment2(int resRight){
	int Assignment7_4_7_112622;
	Assignment7_4_7_112622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment7_4_7_112622;}
}
int function30accessVarRef(){
	int VarRef6_9_6_111647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef6_9_6_111647 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef6_9_6_11terminates;
	VarRef6_9_6_11terminates = VarRef6_9_6_111647;
	return VarRef6_9_6_11terminates;
}
int function36accessVarRef(){
	int VarRef7_9_7_111647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef7_9_7_111647 = *(int*)sigma["Variable2_0_2_11currentValue"];}
	int VarRef7_9_7_11terminates;
	VarRef7_9_7_11terminates = VarRef7_9_7_111647;
	return VarRef7_9_7_11terminates;
}
int main(){
		functioninit4Variable();
	function6initializeVar();
	functioninit8Variable();
	function10initializeVar();
	functioninit12Variable();
	function14initializeVar();
	bool flag20 = true;
	LockingQueue<Void> synch20;
	{Void fakeParam20;
 	synch20.push(fakeParam20);}
	flag20 = true;
	flag20= true;
while (flag20 == true){
	flag20 = false;
		{Void joinPopped20;
 		synch20.waitAndPop(joinPopped20);}
		int result21accessVarRef = function21accessVarRef();
		int VarRef4_7_4_9terminate;
		VarRef4_7_4_9terminate = result21accessVarRef;
		if (VarRef4_7_4_9terminate == true){
			int result30accessVarRef = function30accessVarRef();
			function29executeAssignment2(result30accessVarRef);
			int result36accessVarRef = function36accessVarRef();
			function35executeAssignment2(result36accessVarRef);
			{Void fakeParam20;
 			synch20.push(fakeParam20);}
			flag20 = true;
		}
		if (VarRef4_7_4_9terminate == false){
		}
	}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
