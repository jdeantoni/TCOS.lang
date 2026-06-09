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
def function0startsProgram(): 
	print("	function0startsProgram started") 
	com_create_event_channel("ComID0_20_0_24", 1, "void") 
def function6perioStart(): 
	print("	function6perioStart started") 
	sigma_mutex.acquire()
	sigma["Perio2_0_4_1blocTrigger"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Perio2_0_4_1blocTrigger"] = 1000
	sigma_mutex.release()
def functioninit53Timer(): 
	print("	functioninit53Timer started") 
	time.sleep(1000//1000) 
def function25finishWait(): 
	print("	function25finishWait started") 
	global com_last_event_token
	(ComID0_20_0_24waitIDPayload, com_last_event_token) = com_wait_event("ComID0_20_0_24") 
	ComID0_20_0_24Token = com_last_event_token 
	com_ack_event(ComID0_20_0_24Token) 
def function52emitnotifyID(): 
	print("	function52emitnotifyID started") 
	
	ComID0_20_0_24notifyIDPayload = 0 
	com_emit_event("ComID0_20_0_24", ComID0_20_0_24notifyIDPayload, True) 
def function31fugaceStmt1(): 
	print("	function31fugaceStmt1 started") 
	sigma_mutex.acquire()
	sigma["Stmt13_18_3_23fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt13_18_3_23fakeState"] = 0
	sigma_mutex.release()
def function34fugaceStmt1(): 
	print("	function34fugaceStmt1 started") 
	sigma_mutex.acquire()
	sigma["Stmt13_25_3_30fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt13_25_3_30fakeState"] = 0
	sigma_mutex.release()
def function45fugaceStmt2(): 
	print("	function45fugaceStmt2 started") 
	sigma_mutex.acquire()
	sigma["Stmt23_38_3_43fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt23_38_3_43fakeState"] = 0
	sigma_mutex.release()
def function48fugaceStmt2(): 
	print("	function48fugaceStmt2 started") 
	sigma_mutex.acquire()
	sigma["Stmt23_46_3_51fakeState"] = int()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["Stmt23_46_3_51fakeState"] = 0
	sigma_mutex.release()
def main(): 
	function0startsProgram() 
	function6perioStart() 
	sync11 = Queue() 
	sync11.put(42) 
	sync11.get() 
	for v in sigma:
		print(str(v)+" = " + str(sigma[v])) 
if __name__ == "__main__": 
	main() 
