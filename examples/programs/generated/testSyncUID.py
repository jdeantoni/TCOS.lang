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
	
	Variable0_0_0_101432 = 1 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Variable0_0_0_101432
	sigma_mutex.release()
def functioninit6Variable(): 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = int()
	sigma_mutex.release()
def function8initializeVar(): 
	
	Variable1_0_1_101432 = 4 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Variable1_0_1_101432
	sigma_mutex.release()
def function15executeAssignment2(resRight): 
	
	Assignment3_7_3_142622 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment3_7_3_142622
	sigma_mutex.release()
def function21executeAssignment2(resRight): 
	
	Assignment4_7_4_142622 = resRight 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Assignment4_7_4_142622
	sigma_mutex.release()
def function16accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef3_12_3_141647 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef3_12_3_14terminates = VarRef3_12_3_141647 
	return VarRef3_12_3_14terminates 
def function22accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef4_12_4_141647 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_12_4_14terminates = VarRef4_12_4_141647 
	return VarRef4_12_4_14terminates 
def main(): 
	functioninit3Variable(); 
	function5initializeVar(); 
	functioninit6Variable(); 
	function8initializeVar(); 
	sync32 = Queue() 
	def codeThread12():
		result16accessVarRef = function16accessVarRef(); 
		function15executeAssignment2(result16accessVarRef); 
		sync32.put(42) 
	thread12 = threading.Thread(target=codeThread12) 
	thread12.start() 
	thread12.join() 
	def codeThread18():
		result22accessVarRef = function22accessVarRef(); 
		function21executeAssignment2(result22accessVarRef); 
		sync32.put(42) 
	thread18 = threading.Thread(target=codeThread18) 
	thread18.start() 
	thread18.join() 
	sync32.get() 
if __name__ == "__main__": 
	main() 
