
import threading
import time
from queue import Queue, LifoQueue



##std::unordered_map<std::string, void*> sigma;
##std::mutex sigma_mutex;  // protects sigma
returnQueue = LifoQueue()

def functioninit3Variable() :
	global Variable2_0_2_10currentValue
def function5initializeVar() :
	
	Variable2_0_2_101430 = 1
	global Variable2_0_2_10currentValue
	Variable2_0_2_10currentValue = Variable2_0_2_101430
def functioninit6Variable() :
	global Variable4_0_4_10currentValue
def function8initializeVar() :
	
	Variable4_0_4_101430 = 3
	global Variable4_0_4_10currentValue
	Variable4_0_4_10currentValue = Variable4_0_4_101430
def function11accessVarRef() :
	## std::lock_guard<std::mutex> lock(sigma_mutex);
	
	global Variable4_0_4_10currentValue
	VarRef6_5_6_71645 = Variable4_0_4_10currentValue
	
	VarRef6_5_6_7terminates = VarRef6_5_6_71645
	return VarRef6_5_6_7terminates
def function13executeAssignment2(resRight) :
	
	Assignment6_0_6_72620 = resRight
	global Variable2_0_2_10currentValue
	Variable2_0_2_10currentValue = Assignment6_0_6_72620
def function16accessVarRef() :
	## std::lock_guard<std::mutex> lock(sigma_mutex);
	
	global Variable2_0_2_10currentValue
	VarRef8_4_8_61645 = Variable2_0_2_10currentValue
	
	VarRef8_4_8_6terminates = VarRef8_4_8_61645
	return VarRef8_4_8_6terminates
def function24accessVarRef() :
	## std::lock_guard<std::mutex> lock(sigma_mutex);
	
	global Variable4_0_4_10currentValue
	VarRef9_7_9_91645 = Variable4_0_4_10currentValue
	
	VarRef9_7_9_9terminates = VarRef9_7_9_91645
	return VarRef9_7_9_9terminates
def function26executeAssignment2(resRight) :
	
	Assignment9_4_9_92620 = resRight
	global Variable2_0_2_10currentValue
	Variable2_0_2_10currentValue = Assignment9_4_9_92620
def function33accessVarRef() :
	## std::lock_guard<std::mutex> lock(sigma_mutex);
	
	global Variable2_0_2_10currentValue
	VarRef11_7_11_91645 = Variable2_0_2_10currentValue
	
	VarRef11_7_11_9terminates = VarRef11_7_11_91645
	return VarRef11_7_11_9terminates
def function35executeAssignment2(resRight) :
	
	Assignment11_4_11_92620 = resRight
	global Variable4_0_4_10currentValue
	Variable4_0_4_10currentValue = Assignment11_4_11_92620

def main():
	functioninit3Variable()
	function5initializeVar()
	functioninit6Variable()
	function8initializeVar()
	returnQueue.put(function11accessVarRef())
	function13executeAssignment2(returnQueue.get())
	returnQueue.put(function16accessVarRef())
	
    ##LockingQueue<Void> queue37;
	queue37 = Queue()

##Choice node
	if VarRef8_4_8_6terminates not in locals():
		VarRef8_4_8_6terminates = returnQueue.get()

	if VarRef8_4_8_6terminates == True :
		returnQueue.put(function24accessVarRef())
		function26executeAssignment2(returnQueue.get())
		{

            Void fakeParam37;
            queue37.push(fakeParam37);
                }

            ##END IF VarRef8_4_8_6terminates == True##Choice node
	if VarRef8_4_8_6terminates not in locals():
		VarRef8_4_8_6terminates = returnQueue.get()

	if VarRef8_4_8_6terminates == False :
		returnQueue.put(function33accessVarRef())
		function35executeAssignment2(returnQueue.get())
		{

            Void fakeParam37;
            queue37.push(fakeParam37);
                }

            ##END IF VarRef8_4_8_6terminates == False //or join node
        Void OrJoinPopped_37;
        queue37.waitAndPop(OrJoinPopped_37);
        
if __name__ == "__main__":
    main()
    