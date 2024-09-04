
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
        
        void functioninit3Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable0_0_0_10currentValue"] = new int();}
}
void function5initializeVar(){
	int Variable0_0_0_101432;
	Variable0_0_0_101432 = 1;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Variable0_0_0_101432;}
}
void functioninit6Variable(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["Variable1_0_1_10currentValue"] = new int();}
}
void function8initializeVar(){
	int Variable1_0_1_101432;
	Variable1_0_1_101432 = 0;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Variable1_0_1_101432;}
}
void function9periodicStart(){
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	sigma["PeriodicBloc3_0_5_3blocTrigger"] = new int();}
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["PeriodicBloc3_0_5_3blocTrigger"]) = 1000;}
}
void function35executeAssignment2(int resRight){
	int Assignment7_0_7_72622;
	Assignment7_0_7_72622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable1_0_1_10currentValue"]) = Assignment7_0_7_72622;}
}
void functioninit44Timer(){
	std::this_thread::sleep_for(1000ms);
}
int function36accessVarRef(){
	int VarRef7_5_7_71647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef7_5_7_71647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef7_5_7_7terminates;
	VarRef7_5_7_7terminates = VarRef7_5_7_71647;
	return VarRef7_5_7_7terminates;
}
void function21executeAssignment2(int resRight){
	int Assignment4_4_4_162622;
	Assignment4_4_4_162622 = resRight;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	*((int*)sigma["Variable0_0_0_10currentValue"]) = Assignment4_4_4_162622;}
}
int function27finishPlus(int n2, int n1){
	int Plus4_9_4_164539;
	Plus4_9_4_164539 = n1;
	int Plus4_9_4_164544;
	Plus4_9_4_164544 = n2;
	int Plus4_9_4_164538;
	Plus4_9_4_164538 = Plus4_9_4_164539 + Plus4_9_4_164544;
	int Plus4_9_4_16terminates;
	Plus4_9_4_16terminates = Plus4_9_4_164538;
	return Plus4_9_4_16terminates;
}
int function30accessVarRef(){
	int VarRef4_13_4_151647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_13_4_151647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_13_4_15terminates;
	VarRef4_13_4_15terminates = VarRef4_13_4_151647;
	return VarRef4_13_4_15terminates;
}
int function28accessVarRef(){
	int VarRef4_10_4_121647;
	{const std::lock_guard<std::mutex> lock(sigma_mutex);	VarRef4_10_4_121647 = *(int*)sigma["Variable0_0_0_10currentValue"];}
	int VarRef4_10_4_12terminates;
	VarRef4_10_4_12terminates = VarRef4_10_4_121647;
	return VarRef4_10_4_12terminates;
}
int main(){
		functioninit3Variable();
	function5initializeVar();
	functioninit6Variable();
	function8initializeVar();
	function9periodicStart();
	bool flag14 = true;
	LockingQueue<Void> synch14;
	{Void fakeParam14;
 	synch14.push(fakeParam14);}
	flag14 = true;
	flag14= true;
while (flag14 == true){
	flag14 = false;
		{Void joinPopped14;
 		synch14.waitAndPop(joinPopped14);}
		functioninit44Timer();
		LockingQueue<int> queue27;
		std::thread thread15([&](){
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
		});
		thread15.detach();
		{Void fakeParam14;
 		synch14.push(fakeParam14);}
		flag14 = true;
	}
for(auto entry : sigma){ std::cout << entry.first << " : " << *((int*)entry.second) << std::endl;}
}
