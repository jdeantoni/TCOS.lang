import threading 
import time 
from queue import Queue, LifoQueue
##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma 
returnQueue = LifoQueue()
sigma: dict = {}
sigma_mutex = threading.Lock()
def functioninit3Variable(): 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = int()
	sigma_mutex.release()
def function5initializeVar(): 
	
	Variable2_0_2_101432 = 1 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = Variable2_0_2_101432
	sigma_mutex.release()
def functioninit6Variable(): 
	sigma_mutex.acquire()
	sigma["Variable4_0_4_10currentValue"] = int()
	sigma_mutex.release()
def function8initializeVar(): 
	
	Variable4_0_4_101432 = 3 
	sigma_mutex.acquire()
	sigma["Variable4_0_4_10currentValue"] = Variable4_0_4_101432
	sigma_mutex.release()
def function16accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef8_4_8_61647 = sigma["Variable2_0_2_10currentValue"]
	sigma_mutex.release()
	
	VarRef8_4_8_6terminates = VarRef8_4_8_61647 
	return VarRef8_4_8_6terminates 
def function24executeAssignment2(resRight): 
	
	Assignment9_4_9_112622 = resRight 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = Assignment9_4_9_112622
	sigma_mutex.release()
def function33executeAssignment2(resRight): 
	
	Assignment11_4_11_92622 = resRight 
	sigma_mutex.acquire()
	sigma["Variable4_0_4_10currentValue"] = Assignment11_4_11_92622
	sigma_mutex.release()
def function25accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef9_9_9_111647 = sigma["Variable4_0_4_10currentValue"]
	sigma_mutex.release()
	
	VarRef9_9_9_11terminates = VarRef9_9_9_111647 
	return VarRef9_9_9_11terminates 
def function34accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef11_7_11_91647 = sigma["Variable2_0_2_10currentValue"]
	sigma_mutex.release()
	
	VarRef11_7_11_9terminates = VarRef11_7_11_91647 
	return VarRef11_7_11_9terminates 
def main(): 
	functioninit3Variable(); 
	function5initializeVar(); 
	functioninit6Variable(); 
	function8initializeVar(); 
	result16accessVarRef = function16accessVarRef(); 
	sync15 = Queue() 
	
	VarRef8_4_8_6terminate = result16accessVarRef 
	if VarRef8_4_8_6terminate == True: 
		result25accessVarRef = function25accessVarRef(); 
		function24executeAssignment2(result25accessVarRef); 
		sync15.put(42) 
	if VarRef8_4_8_6terminate == False: 
		result34accessVarRef = function34accessVarRef(); 
		function33executeAssignment2(result34accessVarRef); 
		sync15.put(42) 
	sync15.get() 
if __name__ == "__main__": 
	main() 
