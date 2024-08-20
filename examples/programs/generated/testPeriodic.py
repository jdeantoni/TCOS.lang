import threading 
import time 
from queue import Queue, LifoQueue
##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma 
returnQueue = LifoQueue()
sigma: dict = {}
sigma_mutex = threading.Lock()
def functioninit3Variable(): 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = int()
	sigma_mutex.release()
def function5initializeVar(): 
	
	Variable0_0_0_101387 = 1 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Variable0_0_0_101387
	sigma_mutex.release()
def functioninit6Variable(): 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = int()
	sigma_mutex.release()
def function8initializeVar(): 
	
	Variable1_0_1_101387 = 0 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Variable1_0_1_101387
	sigma_mutex.release()
def function9periodicStart(): 
	sigma_mutex.acquire()
	sigma["PeriodicBloc3_0_5_3blocTrigger"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["PeriodicBloc3_0_5_3blocTrigger"] = 1000
	sigma_mutex.release()
def function35executeAssignment2(resRight): 
	
	Assignment7_0_7_72534 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment7_0_7_72534
	sigma_mutex.release()
def functioninit44Timer(): 
	time.sleep(1000//1000) 
def function36accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef7_5_7_71593 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef7_5_7_7terminates = VarRef7_5_7_71593 
	return VarRef7_5_7_7terminates 
def function21executeAssignment2(resRight): 
	
	Assignment4_4_4_162534 = resRight 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Assignment4_4_4_162534
	sigma_mutex.release()
def function27finishPlus(n2, n1): 
	
	Plus4_9_4_164397 = n1 
	
	Plus4_9_4_164402 = n2 
	
	Plus4_9_4_164396 = Plus4_9_4_164397 + Plus4_9_4_164402 
	
	Plus4_9_4_16terminates = Plus4_9_4_164396 
	return Plus4_9_4_16terminates 
def function30accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef4_13_4_151593 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_13_4_15terminates = VarRef4_13_4_151593 
	return VarRef4_13_4_15terminates 
def function28accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef4_10_4_121593 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_10_4_12terminates = VarRef4_10_4_121593 
	return VarRef4_10_4_12terminates 
def main(): 
	functioninit3Variable(); 
	function5initializeVar(); 
	functioninit6Variable(); 
	function8initializeVar(); 
	function9periodicStart(); 
	sync14 = Queue() 
	sync14.put(42) 
	flag14 = True
	while flag14 == True: 
		flag14 = False 
		sync14.get() 
		functioninit44Timer(); 
		queue27 = Queue() 
		def codeThread15():
			def codeThread30():
				result30accessVarRef = function30accessVarRef(); 
				queue27.put(result30accessVarRef) 
			thread30 = threading.Thread(target=codeThread30) 
			thread30.start() 
			thread30.join() 
			def codeThread28():
				result28accessVarRef = function28accessVarRef(); 
				queue27.put(result28accessVarRef) 
			thread28 = threading.Thread(target=codeThread28) 
			thread28.start() 
			thread28.join() 
			
			AndJoinPopped_27_0 = queue27.get() 
			
			AndJoinPopped_27_1 = queue27.get() 
			result27finishPlus = function27finishPlus(AndJoinPopped_27_0, AndJoinPopped_27_1); 
			function21executeAssignment2(result27finishPlus);
			for v in sigma: 
				print(v, sigma[v])
		thread15 = threading.Thread(target=codeThread15) 
		thread15.start() 
		thread15.join() 
		sync14.put(42) 
		flag14 = True
if __name__ == "__main__": 
	main() 
