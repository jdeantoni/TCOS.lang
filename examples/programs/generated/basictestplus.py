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
	sigma["Variable2_0_2_10currentValue"] = int()
	sigma_mutex.release()
def function6initializeVar(): 
	
	Variable2_0_2_101376 = 1 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = Variable2_0_2_101376
	sigma_mutex.release()
def functioninit8Variable(): 
	sigma_mutex.acquire()
	sigma["Variable4_0_4_10currentValue"] = int()
	sigma_mutex.release()
def function10initializeVar(): 
	
	Variable4_0_4_101376 = 3 
	sigma_mutex.acquire()
	sigma["Variable4_0_4_10currentValue"] = Variable4_0_4_101376
	sigma_mutex.release()
def function18accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef8_4_8_61582 = sigma["Variable2_0_2_10currentValue"]
	sigma_mutex.release()
	
	VarRef8_4_8_6terminates = VarRef8_4_8_61582 
	return VarRef8_4_8_6terminates 
def function26executeAssignment2(resRight): 
	
	Assignment9_4_9_112523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = Assignment9_4_9_112523
	sigma_mutex.release()
def function35executeAssignment2(resRight): 
	
	Assignment11_4_11_92523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable4_0_4_10currentValue"] = Assignment11_4_11_92523
	sigma_mutex.release()
def function27accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef9_9_9_111582 = sigma["Variable4_0_4_10currentValue"]
	sigma_mutex.release()
	
	VarRef9_9_9_11terminates = VarRef9_9_9_111582 
	return VarRef9_9_9_11terminates 
def function36accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef11_7_11_91582 = sigma["Variable2_0_2_10currentValue"]
	sigma_mutex.release()
	
	VarRef11_7_11_9terminates = VarRef11_7_11_91582 
	return VarRef11_7_11_9terminates 
def main(): 
	functioninit4Variable() 
	function6initializeVar() 
	functioninit8Variable() 
	function10initializeVar() 
	result18accessVarRef = function18accessVarRef(); 
	sync17 = Queue() 
	
	VarRef8_4_8_6terminate = result18accessVarRef 
	if VarRef8_4_8_6terminate == True: 
		result27accessVarRef = function27accessVarRef(); 
		function26executeAssignment2(result27accessVarRef) 
		sync17.put(42) 
	if VarRef8_4_8_6terminate == False: 
		result36accessVarRef = function36accessVarRef(); 
		function35executeAssignment2(result36accessVarRef) 
		sync17.put(42) 
	sync17.get() 
if __name__ == "__main__": 
	main() 
