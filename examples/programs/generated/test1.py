import threading 
import time 
from queue import Queue, LifoQueue
##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma 
returnQueue = LifoQueue()
sigma: dict = {}
sigma_mutex = threading.Lock()
def function3perioStart(): 
	print("	function3perioStart started") 
	sigma_mutex.acquire()
	sigma["Perio0_0_2_1blocTrigger"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Perio0_0_2_1blocTrigger"] = 1000
	sigma_mutex.release()
def functioninit31Timer(): 
	print("	functioninit31Timer started") 
	time.sleep(1000//1000) 
def function19fugaceStmt1(): 
	print("	function19fugaceStmt1 started") 
	sigma_mutex.acquire()
	sigma["Stmt11_6_1_11fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt11_6_1_11fakeState"] = 0
	sigma_mutex.release()
def function29fugaceStmt1(): 
	print("	function29fugaceStmt1 started") 
	sigma_mutex.acquire()
	sigma["Stmt11_33_1_38fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt11_33_1_38fakeState"] = 0
	sigma_mutex.release()
def main(): 
	function3perioStart(); 
	sync8 = Queue() 
	sync8.put(42) 
	flag8 = True
	while flag8 == True: 
		flag8 = False 
		sync8.get() 
		functioninit31Timer(); 
		sync14 = Queue() 
		def codeThread9():
			print("thread9 started") 
			def codeThread15():
				print("thread15 started") 
				function19fugaceStmt1(); 
				sync14.put(42) 
			thread15 = threading.Thread(target=codeThread15) 
			thread15.start() 
			thread15.join() 
			def codeThread23():
				print("thread23 started") 
				function29fugaceStmt1(); 
				sync14.put(42) 
			thread23 = threading.Thread(target=codeThread23) 
			thread23.start() 
			thread23.join() 
		thread9 = threading.Thread(target=codeThread9) 
		thread9.start() 
		thread9.join() 
		sync8.put(42) 
		flag8 = True
		sync14.get() 
		sync14.get() 
	for v in sigma:
		print(str(v)+" = " + str(sigma[v])) 
if __name__ == "__main__": 
	main() 
