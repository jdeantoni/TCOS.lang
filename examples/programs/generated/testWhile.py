import threading 
import time 
from queue import Queue, LifoQueue
##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma 
returnQueue = LifoQueue()
sigma: dict = {}
sigma_mutex = threading.Lock()
def functioninit3Variable(): 
	print("	functioninit3Variable started") 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = int()
	sigma_mutex.release()
def function5initializeVar(): 
	print("	function5initializeVar started") 
	
	Variable0_0_0_101387 = 1 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Variable0_0_0_101387
	sigma_mutex.release()
def functioninit6Variable(): 
	print("	functioninit6Variable started") 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = int()
	sigma_mutex.release()
def function8initializeVar(): 
	print("	function8initializeVar started") 
	
	Variable1_0_1_101387 = 0 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Variable1_0_1_101387
	sigma_mutex.release()
def functioninit9Variable(): 
	print("	functioninit9Variable started") 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_11currentValue"] = int()
	sigma_mutex.release()
def function11initializeVar(): 
	print("	function11initializeVar started") 
	
	Variable2_0_2_111387 = 42 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_11currentValue"] = Variable2_0_2_111387
	sigma_mutex.release()
def function18accessVarRef(): 
	print("	function18accessVarRef started") 
	
	sigma_mutex.acquire()
	VarRef4_7_4_91593 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_7_4_9terminates = VarRef4_7_4_91593 
	return VarRef4_7_4_9terminates 
def function26executeAssignment2(resRight): 
	print("	function26executeAssignment2 started") 
	
	Assignment6_4_6_112534 = resRight 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Assignment6_4_6_112534
	sigma_mutex.release()
def function32executeAssignment2(resRight): 
	print("	function32executeAssignment2 started") 
	
	Assignment7_4_7_112534 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment7_4_7_112534
	sigma_mutex.release()
def function27accessVarRef(): 
	print("	function27accessVarRef started") 
	
	sigma_mutex.acquire()
	VarRef6_9_6_111593 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef6_9_6_11terminates = VarRef6_9_6_111593 
	return VarRef6_9_6_11terminates 
def function33accessVarRef(): 
	print("	function33accessVarRef started") 
	
	sigma_mutex.acquire()
	VarRef7_9_7_111593 = sigma["Variable2_0_2_11currentValue"]
	sigma_mutex.release()
	
	VarRef7_9_7_11terminates = VarRef7_9_7_111593 
	return VarRef7_9_7_11terminates 
def main(): 
	functioninit3Variable(); 
	function5initializeVar(); 
	functioninit6Variable(); 
	function8initializeVar(); 
	functioninit9Variable(); 
	function11initializeVar(); 
	sync17 = Queue() 
	sync17.put(42) 
	flag17 = True
	while flag17 == True: 
		flag17 = False 
		sync17.get() 
		result18accessVarRef = function18accessVarRef(); 
		
		VarRef4_7_4_9terminate = result18accessVarRef 
		if VarRef4_7_4_9terminate == True: 
			print("(VarRef4_7_4_9terminate == True) is TRUE") 
			result27accessVarRef = function27accessVarRef(); 
			function26executeAssignment2(result27accessVarRef); 
			result33accessVarRef = function33accessVarRef(); 
			function32executeAssignment2(result33accessVarRef); 
			sync17.put(42) 
			flag17 = True
		if VarRef4_7_4_9terminate == False: 
			print("(VarRef4_7_4_9terminate == False) is TRUE") 
if __name__ == "__main__": 
	main() 
