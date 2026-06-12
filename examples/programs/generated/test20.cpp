
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
void function92executeAssignment2(int resRight){
	int Assignment16_0_16_202622;
	Assignment16_0_16_202622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202622;}
}
int function53accessVarRef(){
	int VarRef7_4_7_61647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef7_4_7_61647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef7_4_7_6terminates;
	VarRef7_4_7_6terminates = VarRef7_4_7_61647;
	return VarRef7_4_7_6terminates;
}
bool function98evaluateConjunction2(){
	bool Conjunction16_5_16_20terminates;
	Conjunction16_5_16_20terminates = false;
	return Conjunction16_5_16_20terminates;
}
bool function99evaluateConjunction3(){
	bool Conjunction16_5_16_20terminates;
	Conjunction16_5_16_20terminates = false;
	return Conjunction16_5_16_20terminates;
}
bool function102evaluateConjunction4(){
	bool Conjunction16_5_16_20terminates;
	Conjunction16_5_16_20terminates = true;
	return Conjunction16_5_16_20terminates;
}
void function21executeAssignment2(int resRight){
	int Assignment4_7_4_212622;
	Assignment4_7_4_212622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment4_7_4_212622;}
}
void function35executeAssignment2(int resRight){
	int Assignment5_7_5_212622;
	Assignment5_7_5_212622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212622;}
}
bool function104evalBooleanConst(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["BooleanConst16_6_16_10constantValue"] = new bool();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["BooleanConst16_6_16_10constantValue"]) = true;}
	bool BooleanConst16_6_16_104771;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	BooleanConst16_6_16_104771 = *(bool*)sigma["BooleanConst16_6_16_10constantValue"];}
	bool BooleanConst16_6_16_10terminates;
	BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104771;
	return BooleanConst16_6_16_10terminates;
}
bool function107evalBooleanConst(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["BooleanConst16_14_16_19constantValue"] = new bool();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["BooleanConst16_14_16_19constantValue"]) = false;}
	bool BooleanConst16_14_16_194771;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	BooleanConst16_14_16_194771 = *(bool*)sigma["BooleanConst16_14_16_19constantValue"];}
	bool BooleanConst16_14_16_19terminates;
	BooleanConst16_14_16_19terminates = BooleanConst16_14_16_194771;
	return BooleanConst16_14_16_19terminates;
}
int function27finishPlus(int n2, int n1){
	int Plus4_12_4_214543;
	Plus4_12_4_214543 = n1;
	int Plus4_12_4_214548;
	Plus4_12_4_214548 = n2;
	int Plus4_12_4_214542;
	Plus4_12_4_214542 = Plus4_12_4_214543 + Plus4_12_4_214548;
	int Plus4_12_4_21terminates;
	Plus4_12_4_21terminates = Plus4_12_4_214542;
	return Plus4_12_4_21terminates;
}
int function41finishPlus(int n2, int n1){
	int Plus5_12_5_214543;
	Plus5_12_5_214543 = n1;
	int Plus5_12_5_214548;
	Plus5_12_5_214548 = n2;
	int Plus5_12_5_214542;
	Plus5_12_5_214542 = Plus5_12_5_214543 + Plus5_12_5_214548;
	int Plus5_12_5_21terminates;
	Plus5_12_5_21terminates = Plus5_12_5_214542;
	return Plus5_12_5_21terminates;
}
void function61executeAssignment2(int resRight){
	int Assignment9_4_9_182622;
	Assignment9_4_9_182622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_182622;}
}
void function78executeAssignment2(int resRight){
	int Assignment12_4_12_182622;
	Assignment12_4_12_182622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_182622;}
}
int function30accessVarRef(){
	int VarRef4_18_4_201647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_18_4_201647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_18_4_20terminates;
	VarRef4_18_4_20terminates = VarRef4_18_4_201647;
	return VarRef4_18_4_20terminates;
}
int function28accessVarRef(){
	int VarRef4_13_4_151647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_13_4_151647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_13_4_15terminates;
	VarRef4_13_4_15terminates = VarRef4_13_4_151647;
	return VarRef4_13_4_15terminates;
}
int function44accessVarRef(){
	int VarRef5_18_5_201647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef5_18_5_201647 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef5_18_5_20terminates;
	VarRef5_18_5_20terminates = VarRef5_18_5_201647;
	return VarRef5_18_5_20terminates;
}
int function42accessVarRef(){
	int VarRef5_13_5_151647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef5_13_5_151647 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef5_13_5_15terminates;
	VarRef5_13_5_15terminates = VarRef5_13_5_151647;
	return VarRef5_13_5_15terminates;
}
int function67finishPlus(int n2, int n1){
	int Plus9_9_9_184543;
	Plus9_9_9_184543 = n1;
	int Plus9_9_9_184548;
	Plus9_9_9_184548 = n2;
	int Plus9_9_9_184542;
	Plus9_9_9_184542 = Plus9_9_9_184543 + Plus9_9_9_184548;
	int Plus9_9_9_18terminates;
	Plus9_9_9_18terminates = Plus9_9_9_184542;
	return Plus9_9_9_18terminates;
}
int function84finishPlus(int n2, int n1){
	int Plus12_9_12_184543;
	Plus12_9_12_184543 = n1;
	int Plus12_9_12_184548;
	Plus12_9_12_184548 = n2;
	int Plus12_9_12_184542;
	Plus12_9_12_184542 = Plus12_9_12_184543 + Plus12_9_12_184548;
	int Plus12_9_12_18terminates;
	Plus12_9_12_18terminates = Plus12_9_12_184542;
	return Plus12_9_12_18terminates;
}
int function70accessVarRef(){
	int VarRef9_15_9_171647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef9_15_9_171647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef9_15_9_17terminates;
	VarRef9_15_9_17terminates = VarRef9_15_9_171647;
	return VarRef9_15_9_17terminates;
}
int function68accessVarRef(){
	int VarRef9_10_9_121647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef9_10_9_121647 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef9_10_9_12terminates;
	VarRef9_10_9_12terminates = VarRef9_10_9_121647;
	return VarRef9_10_9_12terminates;
}
int function87accessVarRef(){
	int VarRef12_15_12_171647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef12_15_12_171647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef12_15_12_17terminates;
	VarRef12_15_12_17terminates = VarRef12_15_12_171647;
	return VarRef12_15_12_17terminates;
}
int function85accessVarRef(){
	int VarRef12_10_12_121647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef12_10_12_121647 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef12_10_12_12terminates;
	VarRef12_10_12_12terminates = VarRef12_10_12_121647;
	return VarRef12_10_12_12terminates;
}
int main(){
		functioninit4Variable();
	function6initializeVar();
	functioninit8Variable();
	function10initializeVar();
	functioninit12Variable();
	function14initializeVar();
	bool flag120 = true;
	LockingQueue<Void> synch120;
	bool flag52 = true;
	LockingQueue<Void> synch52;
	LockingQueue<bool> sync100;
	LockingQueue<bool> sync101;
	LockingQueue<int> sync27;
	LockingQueue<int> sync67;
	std::thread thread18([&](){
		std::thread thread30([&](){
			int result30accessVarRef = function30accessVarRef();
			sync27.push(result30accessVarRef);
		});
		thread30.detach();
		std::thread thread28([&](){
			int result28accessVarRef = function28accessVarRef();
			sync27.push(result28accessVarRef);
		});
		thread28.detach();
		int AndJoinPopped_27_0;
		sync27.waitAndPop(AndJoinPopped_27_0);
		int AndJoinPopped_27_1;
		sync27.waitAndPop(AndJoinPopped_27_1);
		int result27finishPlus = function27finishPlus(AndJoinPopped_27_0, AndJoinPopped_27_1);
		function21executeAssignment2(result27finishPlus);
		{Void fakeParam120;
 		synch120.push(fakeParam120);}
	});
	thread18.detach();
	std::thread thread32([&](){
		LockingQueue<int> sync41;
		std::thread thread44([&](){
			int result44accessVarRef = function44accessVarRef();
			sync41.push(result44accessVarRef);
		});
		thread44.detach();
		std::thread thread42([&](){
			int result42accessVarRef = function42accessVarRef();
			sync41.push(result42accessVarRef);
		});
		thread42.detach();
		int AndJoinPopped_41_0;
		sync41.waitAndPop(AndJoinPopped_41_0);
		int AndJoinPopped_41_1;
		sync41.waitAndPop(AndJoinPopped_41_1);
		int result41finishPlus = function41finishPlus(AndJoinPopped_41_0, AndJoinPopped_41_1);
		function35executeAssignment2(result41finishPlus);
		{Void fakeParam120;
 		synch120.push(fakeParam120);}
	});
	thread32.detach();
	{Void joinPopped120;
 	synch120.waitAndPop(joinPopped120);}
	int result53accessVarRef = function53accessVarRef();
	int VarRef7_4_7_6terminate;
	VarRef7_4_7_6terminate = result53accessVarRef;
	if (VarRef7_4_7_6terminate == true){
		std::thread thread70([&](){
			int result70accessVarRef = function70accessVarRef();
			sync67.push(result70accessVarRef);
		});
		thread70.detach();
		std::thread thread68([&](){
			int result68accessVarRef = function68accessVarRef();
			sync67.push(result68accessVarRef);
		});
		thread68.detach();
		int AndJoinPopped_67_0;
		sync67.waitAndPop(AndJoinPopped_67_0);
		int AndJoinPopped_67_1;
		sync67.waitAndPop(AndJoinPopped_67_1);
		int result67finishPlus = function67finishPlus(AndJoinPopped_67_0, AndJoinPopped_67_1);
		function61executeAssignment2(result67finishPlus);
		{Void fakeParam52;
 		synch52.push(fakeParam52);}
	}
	if (VarRef7_4_7_6terminate == false){
		LockingQueue<int> sync84;
		std::thread thread87([&](){
			int result87accessVarRef = function87accessVarRef();
			sync84.push(result87accessVarRef);
		});
		thread87.detach();
		std::thread thread85([&](){
			int result85accessVarRef = function85accessVarRef();
			sync84.push(result85accessVarRef);
		});
		thread85.detach();
		int AndJoinPopped_84_0;
		sync84.waitAndPop(AndJoinPopped_84_0);
		int AndJoinPopped_84_1;
		sync84.waitAndPop(AndJoinPopped_84_1);
		int result84finishPlus = function84finishPlus(AndJoinPopped_84_0, AndJoinPopped_84_1);
		function78executeAssignment2(result84finishPlus);
		{Void fakeParam52;
 		synch52.push(fakeParam52);}
	}
	{Void joinPopped52;
 	synch52.waitAndPop(joinPopped52);}
	std::thread thread104([&](){
		bool result104evalBooleanConst = function104evalBooleanConst();
		sync101.push(result104evalBooleanConst);
		bool BooleanConst16_6_16_10terminate;
		BooleanConst16_6_16_10terminate = result104evalBooleanConst;
		if (BooleanConst16_6_16_10terminate == false){
			bool result98evaluateConjunction2 = function98evaluateConjunction2();
			sync100.push(result98evaluateConjunction2);
		}
	});
	thread104.detach();
	std::thread thread107([&](){
		bool result107evalBooleanConst = function107evalBooleanConst();
		sync101.push(result107evalBooleanConst);
		bool BooleanConst16_14_16_19terminate;
		BooleanConst16_14_16_19terminate = result107evalBooleanConst;
		if (BooleanConst16_14_16_19terminate == false){
			bool result99evaluateConjunction3 = function99evaluateConjunction3();
			sync100.push(result99evaluateConjunction3);
		}
	});
	thread107.detach();
	bool AndJoinPopped_101_0;
	sync101.waitAndPop(AndJoinPopped_101_0);
	bool AndJoinPopped_101_1;
	sync101.waitAndPop(AndJoinPopped_101_1);
	bool BooleanConst16_6_16_10terminate;
	BooleanConst16_6_16_10terminate = AndJoinPopped_101_0;
	bool BooleanConst16_14_16_19terminate;
	BooleanConst16_14_16_19terminate = AndJoinPopped_101_1;
	if (BooleanConst16_6_16_10terminate == true && BooleanConst16_14_16_19terminate == true){
		bool result102evaluateConjunction4 = function102evaluateConjunction4();
		sync100.push(result102evaluateConjunction4);
		bool OrJoinPopped_100;
		sync100.waitAndPop(OrJoinPopped_100);
		function92executeAssignment2(OrJoinPopped_100);
	}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
