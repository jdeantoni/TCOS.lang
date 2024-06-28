import threading 
import time 
from queue import Queue, LifoQueue
##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma 
returnQueue = LifoQueue()
def functioninit3Variable(): 
	1+1 
def function5initializeVar(): 
	Variable2_0_2_101430 = 1 
	global Variable2_0_2_10currentValue 
	Variable2_0_2_10currentValue = Variable2_0_2_101430 
def functioninit6Variable(): 
	1+1 
def function8initializeVar(): 
	Variable4_0_4_101430 = 3 
	global Variable4_0_4_10currentValue 
	Variable4_0_4_10currentValue = Variable4_0_4_101430 
def function11accessVarRef(): 
	global Variable4_0_4_10currentValue 
	VarRef6_5_6_71645 = Variable4_0_4_10currentValue 
	VarRef6_5_6_7terminates = VarRef6_5_6_71645 
	return VarRef6_5_6_7terminates 
def function13executeAssignment2(resRight): 
	Assignment6_0_6_72620 = resRight 
	global Variable2_0_2_10currentValue 
	Variable2_0_2_10currentValue = Assignment6_0_6_72620 
if __name__ == "__main__": 
	main() 
def main(): 
	functioninit3Variable(); 
	function5initializeVar(); 
	functioninit6Variable(); 
	function8initializeVar(); 
	result11accessVarRef = function11accessVarRef(); 
	function13executeAssignment2(result11accessVarRef); 
