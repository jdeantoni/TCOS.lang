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
	
	Variable1_0_1_101387 = 4 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Variable1_0_1_101387
	sigma_mutex.release()
def functioninit9Variable(): 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = int()
	sigma_mutex.release()
def function11initializeVar(): 
	
	Variable2_0_2_101387 = 0 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = Variable2_0_2_101387
	sigma_mutex.release()
def function89executeAssignment2(resRight): 
	
	Assignment16_0_16_202534 = resRight 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = Assignment16_0_16_202534
	sigma_mutex.release()
def function50accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef7_4_7_61593 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef7_4_7_6terminates = VarRef7_4_7_61593 
	return VarRef7_4_7_6terminates 
def function95evaluateConjunction2(): 
	
	Conjunction16_5_16_20terminates = False 
	return Conjunction16_5_16_20terminates 
def function96evaluateConjunction3(): 
	
	Conjunction16_5_16_20terminates = False 
	return Conjunction16_5_16_20terminates 
def function99evaluateConjunction4(): 
	
	Conjunction16_5_16_20terminates = True 
	return Conjunction16_5_16_20terminates 
def function18executeAssignment2(resRight): 
	
	Assignment4_7_4_212534 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment4_7_4_212534
	sigma_mutex.release()
def function32executeAssignment2(resRight): 
	
	Assignment5_7_5_212534 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment5_7_5_212534
	sigma_mutex.release()
def function100evalBooleanConst(): 
	sigma_mutex.acquire()
	sigma["BooleanConst16_6_16_10constantValue"] = bool()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["BooleanConst16_6_16_10constantValue"] = True
	sigma_mutex.release()
	
	sigma_mutex.acquire()
	BooleanConst16_6_16_104616 = sigma["BooleanConst16_6_16_10constantValue"]
	sigma_mutex.release()
	
	BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104616 
	return BooleanConst16_6_16_10terminates 
def function102evalBooleanConst(): 
	sigma_mutex.acquire()
	sigma["BooleanConst16_14_16_19constantValue"] = bool()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["BooleanConst16_14_16_19constantValue"] = False
	sigma_mutex.release()
	
	sigma_mutex.acquire()
	BooleanConst16_14_16_194616 = sigma["BooleanConst16_14_16_19constantValue"]
	sigma_mutex.release()
	
	BooleanConst16_14_16_19terminates = BooleanConst16_14_16_194616 
	return BooleanConst16_14_16_19terminates 
def function24finishPlus(n2, n1): 
	
	Plus4_12_4_214397 = n1 
	
	Plus4_12_4_214402 = n2 
	
	Plus4_12_4_214396 = Plus4_12_4_214397 + Plus4_12_4_214402 
	
	Plus4_12_4_21terminates = Plus4_12_4_214396 
	return Plus4_12_4_21terminates 
def function38finishPlus(n2, n1): 
	
	Plus5_12_5_214397 = n1 
	
	Plus5_12_5_214402 = n2 
	
	Plus5_12_5_214396 = Plus5_12_5_214397 + Plus5_12_5_214402 
	
	Plus5_12_5_21terminates = Plus5_12_5_214396 
	return Plus5_12_5_21terminates 
def function58executeAssignment2(resRight): 
	
	Assignment9_4_9_182534 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment9_4_9_182534
	sigma_mutex.release()
def function75executeAssignment2(resRight): 
	
	Assignment12_4_12_182534 = resRight 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Assignment12_4_12_182534
	sigma_mutex.release()
def function27accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef4_18_4_201593 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_18_4_20terminates = VarRef4_18_4_201593 
	return VarRef4_18_4_20terminates 
def function25accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef4_13_4_151593 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_13_4_15terminates = VarRef4_13_4_151593 
	return VarRef4_13_4_15terminates 
def function41accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef5_18_5_201593 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef5_18_5_20terminates = VarRef5_18_5_201593 
	return VarRef5_18_5_20terminates 
def function39accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef5_13_5_151593 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef5_13_5_15terminates = VarRef5_13_5_151593 
	return VarRef5_13_5_15terminates 
def function64finishPlus(n2, n1): 
	
	Plus9_9_9_184397 = n1 
	
	Plus9_9_9_184402 = n2 
	
	Plus9_9_9_184396 = Plus9_9_9_184397 + Plus9_9_9_184402 
	
	Plus9_9_9_18terminates = Plus9_9_9_184396 
	return Plus9_9_9_18terminates 
def function81finishPlus(n2, n1): 
	
	Plus12_9_12_184397 = n1 
	
	Plus12_9_12_184402 = n2 
	
	Plus12_9_12_184396 = Plus12_9_12_184397 + Plus12_9_12_184402 
	
	Plus12_9_12_18terminates = Plus12_9_12_184396 
	return Plus12_9_12_18terminates 
def function67accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef9_15_9_171593 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef9_15_9_17terminates = VarRef9_15_9_171593 
	return VarRef9_15_9_17terminates 
def function65accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef9_10_9_121593 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef9_10_9_12terminates = VarRef9_10_9_121593 
	return VarRef9_10_9_12terminates 
def function84accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef12_15_12_171593 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef12_15_12_17terminates = VarRef12_15_12_171593 
	return VarRef12_15_12_17terminates 
def function82accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef12_10_12_121593 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef12_10_12_12terminates = VarRef12_10_12_121593 
	return VarRef12_10_12_12terminates 
def main(): 
	functioninit3Variable(); 
	function5initializeVar(); 
	functioninit6Variable(); 
	function8initializeVar(); 
	functioninit9Variable(); 
	function11initializeVar(); 
	sync49 = Queue() 
	sync115 = Queue() 
	queue97 = Queue() 
	queue98 = Queue() 
	queue24 = Queue() 
	queue64 = Queue() 
	def codeThread15():
		def codeThread27():
			result27accessVarRef = function27accessVarRef(); 
			queue24.put(result27accessVarRef) 
		thread27 = threading.Thread(target=codeThread27) 
		thread27.start() 
		thread27.join() 
		def codeThread25():
			result25accessVarRef = function25accessVarRef(); 
			queue24.put(result25accessVarRef) 
		thread25 = threading.Thread(target=codeThread25) 
		thread25.start() 
		thread25.join() 
		
		AndJoinPopped_24_0 = queue24.get() 
		
		AndJoinPopped_24_1 = queue24.get() 
		result24finishPlus = function24finishPlus(AndJoinPopped_24_0, AndJoinPopped_24_1); 
		function18executeAssignment2(result24finishPlus); 
		sync115.put(42) 
	thread15 = threading.Thread(target=codeThread15) 
	thread15.start() 
	thread15.join() 
	def codeThread29():
		queue38 = Queue() 
		def codeThread41():
			result41accessVarRef = function41accessVarRef(); 
			queue38.put(result41accessVarRef) 
		thread41 = threading.Thread(target=codeThread41) 
		thread41.start() 
		thread41.join() 
		def codeThread39():
			result39accessVarRef = function39accessVarRef(); 
			queue38.put(result39accessVarRef) 
		thread39 = threading.Thread(target=codeThread39) 
		thread39.start() 
		thread39.join() 
		
		AndJoinPopped_38_0 = queue38.get() 
		
		AndJoinPopped_38_1 = queue38.get() 
		result38finishPlus = function38finishPlus(AndJoinPopped_38_0, AndJoinPopped_38_1); 
		function32executeAssignment2(result38finishPlus); 
		sync115.put(42) 
	thread29 = threading.Thread(target=codeThread29) 
	thread29.start() 
	thread29.join() 
	sync115.get() 
	result50accessVarRef = function50accessVarRef(); 
	
	VarRef7_4_7_6terminate = result50accessVarRef 
	if VarRef7_4_7_6terminate == True: 
		def codeThread67():
			result67accessVarRef = function67accessVarRef(); 
			queue64.put(result67accessVarRef) 
		thread67 = threading.Thread(target=codeThread67) 
		thread67.start() 
		thread67.join() 
		def codeThread65():
			result65accessVarRef = function65accessVarRef(); 
			queue64.put(result65accessVarRef) 
		thread65 = threading.Thread(target=codeThread65) 
		thread65.start() 
		thread65.join() 
		
		AndJoinPopped_64_0 = queue64.get() 
		
		AndJoinPopped_64_1 = queue64.get() 
		result64finishPlus = function64finishPlus(AndJoinPopped_64_0, AndJoinPopped_64_1); 
		function58executeAssignment2(result64finishPlus); 
		sync49.put(42) 
	if VarRef7_4_7_6terminate == False: 
		queue81 = Queue() 
		def codeThread84():
			result84accessVarRef = function84accessVarRef(); 
			queue81.put(result84accessVarRef) 
		thread84 = threading.Thread(target=codeThread84) 
		thread84.start() 
		thread84.join() 
		def codeThread82():
			result82accessVarRef = function82accessVarRef(); 
			queue81.put(result82accessVarRef) 
		thread82 = threading.Thread(target=codeThread82) 
		thread82.start() 
		thread82.join() 
		
		AndJoinPopped_81_0 = queue81.get() 
		
		AndJoinPopped_81_1 = queue81.get() 
		result81finishPlus = function81finishPlus(AndJoinPopped_81_0, AndJoinPopped_81_1); 
		function75executeAssignment2(result81finishPlus); 
		sync49.put(42) 
	sync49.get() 
	def codeThread100():
		result100evalBooleanConst = function100evalBooleanConst(); 
		queue98.put(result100evalBooleanConst) 
		
		BooleanConst16_6_16_10terminate = result100evalBooleanConst 
		if BooleanConst16_6_16_10terminate == False: 
			result95evaluateConjunction2 = function95evaluateConjunction2(); 
			queue97.put(result95evaluateConjunction2) 
	thread100 = threading.Thread(target=codeThread100) 
	thread100.start() 
	thread100.join() 
	def codeThread102():
		result102evalBooleanConst = function102evalBooleanConst(); 
		queue98.put(result102evalBooleanConst) 
		
		BooleanConst16_14_16_19terminate = result102evalBooleanConst 
		if BooleanConst16_14_16_19terminate == False: 
			result96evaluateConjunction3 = function96evaluateConjunction3(); 
			queue97.put(result96evaluateConjunction3) 
	thread102 = threading.Thread(target=codeThread102) 
	thread102.start() 
	thread102.join() 
	
	AndJoinPopped_98_0 = queue98.get() 
	
	AndJoinPopped_98_1 = queue98.get() 
	
	BooleanConst16_6_16_10terminate = AndJoinPopped_98_0 
	
	BooleanConst16_14_16_19terminate = AndJoinPopped_98_1 
	if BooleanConst16_6_16_10terminate == True and BooleanConst16_14_16_19terminate == True: 
		result99evaluateConjunction4 = function99evaluateConjunction4(); 
		queue97.put(result99evaluateConjunction4) 
		
		OrJoinPopped_97 = queue97.get() 
		function89executeAssignment2(OrJoinPopped_97); 
if __name__ == "__main__": 
	main() 
