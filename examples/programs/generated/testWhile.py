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
	
	Variable0_0_0_101376 = 1 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Variable0_0_0_101376
	sigma_mutex.release()
def functioninit8Variable(): 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = int()
	sigma_mutex.release()
def function10initializeVar(): 
	
	Variable1_0_1_101376 = 0 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Variable1_0_1_101376
	sigma_mutex.release()
def functioninit12Variable(): 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_11currentValue"] = int()
	sigma_mutex.release()
def function14initializeVar(): 
	
	Variable2_0_2_111376 = 42 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_11currentValue"] = Variable2_0_2_111376
	sigma_mutex.release()
def function21accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef4_7_4_91582 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_7_4_9terminates = VarRef4_7_4_91582 
	return VarRef4_7_4_9terminates 
def function29executeAssignment2(resRight): 
	
	Assignment6_4_6_112523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Assignment6_4_6_112523
	sigma_mutex.release()
def function35executeAssignment2(resRight): 
	
	Assignment7_4_7_112523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment7_4_7_112523
	sigma_mutex.release()
def function30accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef6_9_6_111582 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef6_9_6_11terminates = VarRef6_9_6_111582 
	return VarRef6_9_6_11terminates 
def function36accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef7_9_7_111582 = sigma["Variable2_0_2_11currentValue"]
	sigma_mutex.release()
	
	VarRef7_9_7_11terminates = VarRef7_9_7_111582 
	return VarRef7_9_7_11terminates 
def main(): 
	functioninit4Variable() 
	function6initializeVar() 
	functioninit8Variable() 
	function10initializeVar() 
	functioninit12Variable() 
	function14initializeVar() 
	sync20 = Queue() 
	sync20.put(42) 
	flag20 = True
	while flag20 == True: 
		flag20 = False 
		sync20.get() 
		result21accessVarRef = function21accessVarRef(); 
		
		VarRef4_7_4_9terminate = result21accessVarRef 
		if VarRef4_7_4_9terminate == True: 
			result30accessVarRef = function30accessVarRef(); 
			function29executeAssignment2(result30accessVarRef) 
			result36accessVarRef = function36accessVarRef(); 
			function35executeAssignment2(result36accessVarRef) 
			sync20.put(42) 
			flag20 = True
		if VarRef4_7_4_9terminate == False: 
if __name__ == "__main__": 
	main() 
