import threading 
import time 
from queue import Queue, LifoQueue
##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma 
returnQueue = LifoQueue()
sigma: dict = {}
sigma_mutex = threading.Lock()
def function4perioStart(): 
	sigma_mutex.acquire()
	sigma["Perio0_0_2_1blocTrigger"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Perio0_0_2_1blocTrigger"] = 1000
	sigma_mutex.release()
def functioninit34Timer(): 
	time.sleep(1000//1000) 
def function21fugaceStmt1(): 
	print("function21fugaceStmt1")
	sigma_mutex.acquire()
	sigma["Stmt11_6_1_11fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt11_6_1_11fakeState"] = 0
	sigma_mutex.release()
def function32fugaceStmt1():
	print("function32fugaceStmt1") 
	sigma_mutex.acquire()
	sigma["Stmt11_33_1_38fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt11_33_1_38fakeState"] = 0
	sigma_mutex.release()
def main(): 
	function4perioStart(); 
	sync9 = Queue() 
	sync9.put(42) 
	flag9 = True
	while flag9 == True: 
		flag9 = False 
		sync9.get() 
		functioninit34Timer(); 
		sync15 = Queue() 
		def codeThread10():
			def codeThread16():
				function21fugaceStmt1(); 
				sync15.put(42) 
			thread16 = threading.Thread(target=codeThread16) 
			thread16.start() 
			thread16.join() 
			def codeThread25():
				function32fugaceStmt1(); 
				sync15.put(42) 
			thread25 = threading.Thread(target=codeThread25) 
			thread25.start() 
			thread25.join() 
		thread10 = threading.Thread(target=codeThread10) 
		thread10.start() 
		thread10.join() 
		sync9.put(42) 
		flag9 = True
		sync15.get() 
		sync15.get() 
if __name__ == "__main__": 
	main() 
