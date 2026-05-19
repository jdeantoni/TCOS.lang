import threading 
import time 
from queue import Queue, LifoQueue
##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma 
returnQueue = LifoQueue()
sigma: dict = {}
sigma_mutex = threading.Lock()
def functioninit21Variable(): 
	sigma_mutex.acquire()
	sigma["Variable8_0_8_10currentValue"] = int()
	sigma_mutex.release()
def function23initializeVar(): 
	
	Variable8_0_8_101432 = 0 
	sigma_mutex.acquire()
	sigma["Variable8_0_8_10currentValue"] = Variable8_0_8_101432
	sigma_mutex.release()
def function28accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef9_3_9_51647 = sigma["Variable8_0_8_10currentValue"]
	sigma_mutex.release()
	
	VarRef9_3_9_5terminates = VarRef9_3_9_51647 
	return VarRef9_3_9_5terminates 
def functioninit9Variable(): 
	sigma_mutex.acquire()
	sigma["Variable1_4_1_14currentValue"] = int()
	sigma_mutex.release()
def function11initializeVar(): 
	
	Variable1_4_1_141432 = 1 
	sigma_mutex.acquire()
	sigma["Variable1_4_1_14currentValue"] = Variable1_4_1_141432
	sigma_mutex.release()
def functioninit12Variable(): 
	sigma_mutex.acquire()
	sigma["Variable2_4_2_14currentValue"] = int()
	sigma_mutex.release()
def function14initializeVar(): 
	
	Variable2_4_2_141432 = 0 
	sigma_mutex.acquire()
	sigma["Variable2_4_2_14currentValue"] = Variable2_4_2_141432
	sigma_mutex.release()
def function18executeAssignment2(resRight): 
	
	Assignment3_4_3_112622 = resRight 
	sigma_mutex.acquire()
	sigma["Variable2_4_2_14currentValue"] = Assignment3_4_3_112622
	sigma_mutex.release()
def function19accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef3_9_3_111647 = sigma["Variable1_4_1_14currentValue"]
	sigma_mutex.release()
	
	VarRef3_9_3_11terminates = VarRef3_9_3_111647 
	return VarRef3_9_3_11terminates 
def main(): 
	functioninit21Variable(); 
	function23initializeVar(); 
	result28accessVarRef = function28accessVarRef(); 
	functioninit9Variable(); 
	function11initializeVar(); 
	functioninit12Variable(); 
	function14initializeVar(); 
	result19accessVarRef = function19accessVarRef(); 
	function18executeAssignment2(result19accessVarRef); 
if __name__ == "__main__": 
	main() 
