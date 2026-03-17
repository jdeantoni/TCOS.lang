
        #include <string>
        #include <unordered_map>
        #include <thread>
        #include <mutex>
        #include <iostream>
        #include <chrono>
        #include "../utils/LockingQueue.hpp"
        
        using namespace std::chrono_literals;
        
        class Void{
        };
        
        std::unordered_map<std::string, void*> sigma;
        std::mutex sigma_mutex;  // protects sigma
        
        void functioninit4Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable0_0_0_10currentValue"] = new int();}
}
void function6initializeVar(){
	int Variable0_0_0_101376;
	Variable0_0_0_101376 = 1;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101376;}
}
void functioninit8Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable1_0_1_10currentValue"] = new int();}
}
void function10initializeVar(){
	int Variable1_0_1_101376;
	Variable1_0_1_101376 = 4;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101376;}
}
void functioninit12Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable2_0_2_10currentValue"] = new int();}
}
void function14initializeVar(){
	int Variable2_0_2_101376;
	Variable2_0_2_101376 = 0;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_0_2_10currentValue"]) = Variable2_0_2_101376;}
}
void function92executeAssignment2(int resRight){
	int Assignment16_0_16_202523;
	Assignment16_0_16_202523 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable2_0_2_10currentValue"]) = Assignment16_0_16_202523;}
}
int function53accessVarRef(){
	int VarRef7_4_7_61582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef7_4_7_61582 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef7_4_7_6terminates;
	VarRef7_4_7_6terminates = VarRef7_4_7_61582;
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
	int Assignment4_7_4_212523;
	Assignment4_7_4_212523 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment4_7_4_212523;}
}
void function35executeAssignment2(int resRight){
	int Assignment5_7_5_212523;
	Assignment5_7_5_212523 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment5_7_5_212523;}
}
bool function104evalBooleanConst(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["BooleanConst16_6_16_10constantValue"] = new bool();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["BooleanConst16_6_16_10constantValue"]) = true;}
	bool BooleanConst16_6_16_104605;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	BooleanConst16_6_16_104605 = *(bool*)sigma["BooleanConst16_6_16_10constantValue"];}
	bool BooleanConst16_6_16_10terminates;
	BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104605;
	return BooleanConst16_6_16_10terminates;
}
bool function107evalBooleanConst(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["BooleanConst16_14_16_19constantValue"] = new bool();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((bool*)sigma["BooleanConst16_14_16_19constantValue"]) = false;}
	bool BooleanConst16_14_16_194605;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	BooleanConst16_14_16_194605 = *(bool*)sigma["BooleanConst16_14_16_19constantValue"];}
	bool BooleanConst16_14_16_19terminates;
	BooleanConst16_14_16_19terminates = BooleanConst16_14_16_194605;
	return BooleanConst16_14_16_19terminates;
}
int function27finishPlus(int n2, int n1){
	int Plus4_12_4_214386;
	Plus4_12_4_214386 = n1;
	int Plus4_12_4_214391;
	Plus4_12_4_214391 = n2;
	int Plus4_12_4_214385;
	Plus4_12_4_214385 = Plus4_12_4_214386 + Plus4_12_4_214391;
	int Plus4_12_4_21terminates;
	Plus4_12_4_21terminates = Plus4_12_4_214385;
	return Plus4_12_4_21terminates;
}
int function41finishPlus(int n2, int n1){
	int Plus5_12_5_214386;
	Plus5_12_5_214386 = n1;
	int Plus5_12_5_214391;
	Plus5_12_5_214391 = n2;
	int Plus5_12_5_214385;
	Plus5_12_5_214385 = Plus5_12_5_214386 + Plus5_12_5_214391;
	int Plus5_12_5_21terminates;
	Plus5_12_5_21terminates = Plus5_12_5_214385;
	return Plus5_12_5_21terminates;
}
void function61executeAssignment2(int resRight){
	int Assignment9_4_9_182523;
	Assignment9_4_9_182523 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment9_4_9_182523;}
}
void function78executeAssignment2(int resRight){
	int Assignment12_4_12_182523;
	Assignment12_4_12_182523 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment12_4_12_182523;}
}
int function30accessVarRef(){
	int VarRef4_18_4_201582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_18_4_201582 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_18_4_20terminates;
	VarRef4_18_4_20terminates = VarRef4_18_4_201582;
	return VarRef4_18_4_20terminates;
}
int function28accessVarRef(){
	int VarRef4_13_4_151582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_13_4_151582 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_13_4_15terminates;
	VarRef4_13_4_15terminates = VarRef4_13_4_151582;
	return VarRef4_13_4_15terminates;
}
int function44accessVarRef(){
	int VarRef5_18_5_201582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef5_18_5_201582 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef5_18_5_20terminates;
	VarRef5_18_5_20terminates = VarRef5_18_5_201582;
	return VarRef5_18_5_20terminates;
}
int function42accessVarRef(){
	int VarRef5_13_5_151582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef5_13_5_151582 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef5_13_5_15terminates;
	VarRef5_13_5_15terminates = VarRef5_13_5_151582;
	return VarRef5_13_5_15terminates;
}
int function67finishPlus(int n2, int n1){
	int Plus9_9_9_184386;
	Plus9_9_9_184386 = n1;
	int Plus9_9_9_184391;
	Plus9_9_9_184391 = n2;
	int Plus9_9_9_184385;
	Plus9_9_9_184385 = Plus9_9_9_184386 + Plus9_9_9_184391;
	int Plus9_9_9_18terminates;
	Plus9_9_9_18terminates = Plus9_9_9_184385;
	return Plus9_9_9_18terminates;
}
int function84finishPlus(int n2, int n1){
	int Plus12_9_12_184386;
	Plus12_9_12_184386 = n1;
	int Plus12_9_12_184391;
	Plus12_9_12_184391 = n2;
	int Plus12_9_12_184385;
	Plus12_9_12_184385 = Plus12_9_12_184386 + Plus12_9_12_184391;
	int Plus12_9_12_18terminates;
	Plus12_9_12_18terminates = Plus12_9_12_184385;
	return Plus12_9_12_18terminates;
}
int function70accessVarRef(){
	int VarRef9_15_9_171582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef9_15_9_171582 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef9_15_9_17terminates;
	VarRef9_15_9_17terminates = VarRef9_15_9_171582;
	return VarRef9_15_9_17terminates;
}
int function68accessVarRef(){
	int VarRef9_10_9_121582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef9_10_9_121582 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef9_10_9_12terminates;
	VarRef9_10_9_12terminates = VarRef9_10_9_121582;
	return VarRef9_10_9_12terminates;
}
int function87accessVarRef(){
	int VarRef12_15_12_171582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef12_15_12_171582 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef12_15_12_17terminates;
	VarRef12_15_12_17terminates = VarRef12_15_12_171582;
	return VarRef12_15_12_17terminates;
}
int function85accessVarRef(){
	int VarRef12_10_12_121582;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef12_10_12_121582 = *(int*)sigma["Variable1_0_1_10currentValue"];}
	int VarRef12_10_12_12terminates;
	VarRef12_10_12_12terminates = VarRef12_10_12_121582;
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
	LockingQueue<bool> queue100;
	LockingQueue<bool> queue101;
	LockingQueue<int> queue27;
	LockingQueue<int> queue67;
	std::thread thread18([&](){
		std::thread thread30([&](){
			int result30accessVarRef = function30accessVarRef();
			queue27.push(result30accessVarRef);
		});
		thread30.detach();
		std::thread thread28([&](){
			int result28accessVarRef = function28accessVarRef();
			queue27.push(result28accessVarRef);
		});
		thread28.detach();
		int AndJoinPopped_27_0;
		queue27.waitAndPop(AndJoinPopped_27_0);
		int AndJoinPopped_27_1;
		queue27.waitAndPop(AndJoinPopped_27_1);
		int result27finishPlus = function27finishPlus(AndJoinPopped_27_0, AndJoinPopped_27_1);
		function21executeAssignment2(result27finishPlus);
		{Void fakeParam120;
 		synch120.push(fakeParam120);}
	});
	thread18.detach();
	std::thread thread32([&](){
		LockingQueue<int> queue41;
		std::thread thread44([&](){
			int result44accessVarRef = function44accessVarRef();
			queue41.push(result44accessVarRef);
		});
		thread44.detach();
		std::thread thread42([&](){
			int result42accessVarRef = function42accessVarRef();
			queue41.push(result42accessVarRef);
		});
		thread42.detach();
		int AndJoinPopped_41_0;
		queue41.waitAndPop(AndJoinPopped_41_0);
		int AndJoinPopped_41_1;
		queue41.waitAndPop(AndJoinPopped_41_1);
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
			queue67.push(result70accessVarRef);
		});
		thread70.detach();
		std::thread thread68([&](){
			int result68accessVarRef = function68accessVarRef();
			queue67.push(result68accessVarRef);
		});
		thread68.detach();
		int AndJoinPopped_67_0;
		queue67.waitAndPop(AndJoinPopped_67_0);
		int AndJoinPopped_67_1;
		queue67.waitAndPop(AndJoinPopped_67_1);
		int result67finishPlus = function67finishPlus(AndJoinPopped_67_0, AndJoinPopped_67_1);
		function61executeAssignment2(result67finishPlus);
		{Void fakeParam52;
 		synch52.push(fakeParam52);}
	}
	if (VarRef7_4_7_6terminate == false){
		LockingQueue<int> queue84;
		std::thread thread87([&](){
			int result87accessVarRef = function87accessVarRef();
			queue84.push(result87accessVarRef);
		});
		thread87.detach();
		std::thread thread85([&](){
			int result85accessVarRef = function85accessVarRef();
			queue84.push(result85accessVarRef);
		});
		thread85.detach();
		int AndJoinPopped_84_0;
		queue84.waitAndPop(AndJoinPopped_84_0);
		int AndJoinPopped_84_1;
		queue84.waitAndPop(AndJoinPopped_84_1);
		int result84finishPlus = function84finishPlus(AndJoinPopped_84_0, AndJoinPopped_84_1);
		function78executeAssignment2(result84finishPlus);
		{Void fakeParam52;
 		synch52.push(fakeParam52);}
	}
	{Void joinPopped52;
 	synch52.waitAndPop(joinPopped52);}
	std::thread thread104([&](){
		bool result104evalBooleanConst = function104evalBooleanConst();
		queue101.push(result104evalBooleanConst);
		bool BooleanConst16_6_16_10terminate;
		BooleanConst16_6_16_10terminate = result104evalBooleanConst;
		if (BooleanConst16_6_16_10terminate == false){
			bool result98evaluateConjunction2 = function98evaluateConjunction2();
			queue100.push(result98evaluateConjunction2);
		}
	});
	thread104.detach();
	std::thread thread107([&](){
		bool result107evalBooleanConst = function107evalBooleanConst();
		queue101.push(result107evalBooleanConst);
		bool BooleanConst16_14_16_19terminate;
		BooleanConst16_14_16_19terminate = result107evalBooleanConst;
		if (BooleanConst16_14_16_19terminate == false){
			bool result99evaluateConjunction3 = function99evaluateConjunction3();
			queue100.push(result99evaluateConjunction3);
		}
	});
	thread107.detach();
	bool AndJoinPopped_101_0;
	queue101.waitAndPop(AndJoinPopped_101_0);
	bool AndJoinPopped_101_1;
	queue101.waitAndPop(AndJoinPopped_101_1);
	bool BooleanConst16_6_16_10terminate;
	BooleanConst16_6_16_10terminate = AndJoinPopped_101_0;
	bool BooleanConst16_14_16_19terminate;
	BooleanConst16_14_16_19terminate = AndJoinPopped_101_1;
	if (BooleanConst16_6_16_10terminate == true && BooleanConst16_14_16_19terminate == true){
		bool result102evaluateConjunction4 = function102evaluateConjunction4();
		queue100.push(result102evaluateConjunction4);
		bool OrJoinPopped_100;
		queue100.waitAndPop(OrJoinPopped_100);
		function92executeAssignment2(OrJoinPopped_100);
	}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((bool*)entry.second) << std::endl;}
}
