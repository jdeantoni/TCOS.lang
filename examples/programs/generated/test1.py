import threading 
import time 
from queue import Queue
from dataclasses import dataclass


@dataclass()
class EventChannel:
	listener_count: int
	payload_kind: str
	queue: Queue[tuple[object, int]]
	next_token: int
	pending_acks: dict[int, int]

sigma: dict[str, object] = {}
sigma_mutex = threading.Lock()
event_channels: dict[str, EventChannel] = {}
event_token_to_channel: dict[int, str] = {}
event_mutex = threading.Lock()
com_last_event_token = None # seems weak

def com_create_event_channel(name: str, listener_count: int, payload_kind: str) -> None:
	with event_mutex:
		if name in event_channels:
			return
		event_channels[name] = EventChannel(
								listener_count=listener_count,
								payload_kind=payload_kind,
								queue=Queue(),
								next_token=1,
								pending_acks={}
							)
	

def com_get_event_channel(name: str) -> EventChannel:
	if name not in event_channels:
		raise RuntimeError(f"Unknown event channel: {name}")
	return event_channels[name]

def com_emit_event(name: str, payload:object, await_acks: bool) -> None:
	channel: EventChannel = com_get_event_channel(name)
	with event_mutex:
		token = channel.next_token
		channel.next_token += 1
		expected_acks: int = channel.listener_count if await_acks else 0
		if expected_acks > 0:
			channel.pending_acks[token] = expected_acks
			event_token_to_channel[token] = name
	channel.queue.put((payload, token))
	#should it be built-in or a TCOS semantic result ?
	if await_acks:
		remaining: int = channel.pending_acks.get(token, 0)
		while remaining > 0:	
			remaining = channel.pending_acks.get(token, 0)	
			time.sleep(0.01)
		
		with event_mutex:
			channel.pending_acks.pop(token, None)
			event_token_to_channel.pop(token, None)

def com_wait_event(name:str)-> tuple[object, int]:
	channel: EventChannel = com_get_event_channel(name)
	return channel.queue.get(block=True)

def com_ack_event(token: int) -> None:
	with event_mutex:
		channel_name: str|None = event_token_to_channel.get(token)
		if channel_name is None:
			return
		channel: EventChannel = com_get_event_channel(channel_name)
		remaining = channel.pending_acks.get(token, 0) - 1
		if remaining <= 0:
			channel.pending_acks.pop(token, None)
			event_token_to_channel.pop(token, None)
		else:
			channel.pending_acks[token] = remaining
def function4perioStart(): 
	print("	function4perioStart started") 
	sigma_mutex.acquire()
	sigma["Perio0_0_2_1blocTrigger"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Perio0_0_2_1blocTrigger"] = 1000
	sigma_mutex.release()
def functioninit36Timer(): 
	print("	functioninit36Timer started") 
	time.sleep(1000//1000) 
def function21fugaceStmt1(): 
	print("	function21fugaceStmt1 started") 
	sigma_mutex.acquire()
	sigma["Stmt11_6_1_11fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt11_6_1_11fakeState"] = 0
	sigma_mutex.release()
def function24fugaceStmt2(): 
	print("	function24fugaceStmt2 started") 
	sigma_mutex.acquire()
	sigma["Stmt21_14_1_19fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt21_14_1_19fakeState"] = 0
	sigma_mutex.release()
def function31fugaceStmt2(): 
	print("	function31fugaceStmt2 started") 
	sigma_mutex.acquire()
	sigma["Stmt21_25_1_30fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt21_25_1_30fakeState"] = 0
	sigma_mutex.release()
def function34fugaceStmt1(): 
	print("	function34fugaceStmt1 started") 
	sigma_mutex.acquire()
	sigma["Stmt11_33_1_38fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt11_33_1_38fakeState"] = 0
	sigma_mutex.release()
def main(): 
	function4perioStart() 
	sync9 = Queue() 
	sync9.put(42) 
	flag9 = True
	while flag9 == True: 
		flag9 = False 
		sync9.get() 
		functioninit36Timer() 
		sync15 = Queue() 
		def codeThread10():
			print("thread10 started") 
			def codeThread16():
				print("thread16 started") 
				function21fugaceStmt1() 
				function24fugaceStmt2() 
				sync15.put(42) 
			thread16 = threading.Thread(target=codeThread16) 
			thread16.start() 
			def codeThread26():
				print("thread26 started") 
				function31fugaceStmt2() 
				function34fugaceStmt1() 
				sync15.put(42) 
			thread26 = threading.Thread(target=codeThread26) 
			thread26.start() 
		thread10 = threading.Thread(target=codeThread10) 
		thread10.start() 
		sync9.put(42) 
		flag9 = True
		sync15.get() 
		sync15.get() 
	for v in sigma:
		print(str(v)+" = " + str(sigma[v])) 
if __name__ == "__main__": 
	main() 
