
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
void function12periodicStart(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["PeriodicBloc3_0_5_3blocTrigger"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["PeriodicBloc3_0_5_3blocTrigger"]) = 1000;}
}
void function38executeAssignment2(int resRight){
	int Assignment7_0_7_72622;
	Assignment7_0_7_72622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment7_0_7_72622;}
}
void functioninit47Timer(){
	std::this_thread::sleep_for(1000ms);
}
int function39accessVarRef(){
	int VarRef7_5_7_71647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef7_5_7_71647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef7_5_7_7terminates;
	VarRef7_5_7_7terminates = VarRef7_5_7_71647;
	return VarRef7_5_7_7terminates;
}
void function24executeAssignment2(int resRight){
	int Assignment4_4_4_162622;
	Assignment4_4_4_162622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment4_4_4_162622;}
}
int function30finishPlus(int n2, int n1){
	int Plus4_9_4_164543;
	Plus4_9_4_164543 = n1;
	int Plus4_9_4_164548;
	Plus4_9_4_164548 = n2;
	int Plus4_9_4_164542;
	Plus4_9_4_164542 = Plus4_9_4_164543 + Plus4_9_4_164548;
	int Plus4_9_4_16terminates;
	Plus4_9_4_16terminates = Plus4_9_4_164542;
	return Plus4_9_4_16terminates;
}
int function33accessVarRef(){
	int VarRef4_13_4_151647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_13_4_151647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_13_4_15terminates;
	VarRef4_13_4_15terminates = VarRef4_13_4_151647;
	return VarRef4_13_4_15terminates;
}
int function31accessVarRef(){
	int VarRef4_10_4_121647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_10_4_121647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_10_4_12terminates;
	VarRef4_10_4_12terminates = VarRef4_10_4_121647;
	return VarRef4_10_4_12terminates;
}
int main(){
		functioninit4Variable();
	function6initializeVar();
	functioninit8Variable();
	function10initializeVar();
	function12periodicStart();
	bool flag17 = true;
	LockingQueue<Void> synch17;
	{Void fakeParam17;
 	synch17.push(fakeParam17);}
	flag17 = true;
	flag17= true;
while (flag17 == true){
	flag17 = false;
		{Void joinPopped17;
 		synch17.waitAndPop(joinPopped17);}
		functioninit47Timer();
		LockingQueue<int> sync30;
		std::thread thread18([&](){
			std::thread thread33([&](){
				int result33accessVarRef = function33accessVarRef();
				sync30.push(result33accessVarRef);
			});
			thread33.detach();
			std::thread thread31([&](){
				int result31accessVarRef = function31accessVarRef();
				sync30.push(result31accessVarRef);
			});
			thread31.detach();
			int AndJoinPopped_30_0;
			sync30.waitAndPop(AndJoinPopped_30_0);
			int AndJoinPopped_30_1;
			sync30.waitAndPop(AndJoinPopped_30_1);
			int result30finishPlus = function30finishPlus(AndJoinPopped_30_0, AndJoinPopped_30_1);
			function24executeAssignment2(result30finishPlus);
		});
		thread18.detach();
		{Void fakeParam17;
 		synch17.push(fakeParam17);}
		flag17 = true;
	}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
