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
	global Variable2_0_2_10currentValue 
	VarRef8_4_8_61645 = Variable2_0_2_10currentValue 
	VarRef8_4_8_6terminates = VarRef8_4_8_61645 
	return VarRef8_4_8_6terminates 
def function19accessVarRef(): 
	global Variable4_0_4_10currentValue 
	VarRef9_9_9_111645 = Variable4_0_4_10currentValue 
	VarRef9_9_9_11terminates = VarRef9_9_9_111645 
	return VarRef9_9_9_11terminates 
def function21executeAssignment2(resRight): 
	Assignment9_4_9_112620 = resRight 
	global Variable2_0_2_10currentValue 
	Variable2_0_2_10currentValue = Assignment9_4_9_112620 
def function28accessVarRef(): 
	global Variable2_0_2_10currentValue 
	VarRef11_7_11_91645 = Variable2_0_2_10currentValue 
	VarRef11_7_11_9terminates = VarRef11_7_11_91645 
	return VarRef11_7_11_9terminates 
def function30executeAssignment2(resRight): 
	Assignment11_4_11_92620 = resRight 
	global Variable4_0_4_10currentValue 
	Variable4_0_4_10currentValue = Assignment11_4_11_92620 
def main(): 
	functioninit3Variable(); 
	function5initializeVar(); 
	functioninit6Variable(); 
	function8initializeVar(); 
	result11accessVarRef = function11accessVarRef(); 
	sync32 = threading.Event() 
	VarRef8_4_8_6terminate = result11accessVarRef 
	if VarRef8_4_8_6terminate == True: 
		result19accessVarRef = function19accessVarRef(); 
		function21executeAssignment2(result19accessVarRef); 
		sync32.set() 
	if VarRef8_4_8_6terminate == False: 
		result28accessVarRef = function28accessVarRef(); 
		function30executeAssignment2(result28accessVarRef); 
		sync32.set() 
	sync32.wait() 
	print("variable2: ", Variable2_0_2_10currentValue)
if __name__ == "__main__": 
	main() 
