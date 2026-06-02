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
def functioninit4Variable(): 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = int()
	sigma_mutex.release()
def function6initializeVar(): 
	
	Variable0_0_0_101432 = 1 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Variable0_0_0_101432
	sigma_mutex.release()
def functioninit8Variable(): 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = int()
	sigma_mutex.release()
def function10initializeVar(): 
	
	Variable1_0_1_101432 = 4 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Variable1_0_1_101432
	sigma_mutex.release()
def functioninit12Variable(): 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = int()
	sigma_mutex.release()
def function14initializeVar(): 
	
	Variable2_0_2_101432 = 0 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = Variable2_0_2_101432
	sigma_mutex.release()
def function80executeAssignment2(resRight): 
	
	Assignment16_0_16_202622 = resRight 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = Assignment16_0_16_202622
	sigma_mutex.release()
def function47accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef7_4_7_61647 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef7_4_7_6terminates = VarRef7_4_7_61647 
	return VarRef7_4_7_6terminates 
def function21executeAssignment2(resRight): 
	
	Assignment4_7_4_212622 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment4_7_4_212622
	sigma_mutex.release()
def function32executeAssignment2(resRight): 
	
	Assignment5_7_5_212622 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment5_7_5_212622
	sigma_mutex.release()
def function85evalBooleanConst(): 
	sigma_mutex.acquire()
	sigma["BooleanConst16_6_16_10constantValue"] = bool()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["BooleanConst16_6_16_10constantValue"] = True
	sigma_mutex.release()
	
	sigma_mutex.acquire()
	BooleanConst16_6_16_104767 = sigma["BooleanConst16_6_16_10constantValue"]
	sigma_mutex.release()
	
	BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104767 
	return BooleanConst16_6_16_10terminates 
def function55executeAssignment2(resRight): 
	
	Assignment9_4_9_182622 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment9_4_9_182622
	sigma_mutex.release()
def function69executeAssignment2(resRight): 
	
	Assignment12_4_12_182622 = resRight 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Assignment12_4_12_182622
	sigma_mutex.release()
def function27accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef4_18_4_201647 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_18_4_20terminates = VarRef4_18_4_201647 
	return VarRef4_18_4_20terminates 
def function38accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef5_18_5_201647 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef5_18_5_20terminates = VarRef5_18_5_201647 
	return VarRef5_18_5_20terminates 
def function61accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef9_15_9_171647 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef9_15_9_17terminates = VarRef9_15_9_171647 
	return VarRef9_15_9_17terminates 
def function75accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef12_15_12_171647 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef12_15_12_17terminates = VarRef12_15_12_171647 
	return VarRef12_15_12_17terminates 
def main(): 
	functioninit4Variable() 
	function6initializeVar() 
	functioninit8Variable() 
	function10initializeVar() 
	functioninit12Variable() 
	function14initializeVar() 
	sync101 = Queue() 
	def codeThread18():
		result27accessVarRef = function27accessVarRef(); 
	thread18 = threading.Thread(target=codeThread18) 
	thread18.start() 
	def codeThread29():
		result38accessVarRef = function38accessVarRef(); 
	thread29 = threading.Thread(target=codeThread29) 
	thread29.start() 
if __name__ == "__main__": 
	main() 
