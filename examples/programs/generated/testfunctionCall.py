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
def functioninit24Variable(): 
	sigma_mutex.acquire()
	sigma["Variable8_0_8_10currentValue"] = int()
	sigma_mutex.release()
def function26initializeVar(): 
	
	Variable8_0_8_101376 = 0 
	sigma_mutex.acquire()
	sigma["Variable8_0_8_10currentValue"] = Variable8_0_8_101376
	sigma_mutex.release()
def function31accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef9_3_9_51582 = sigma["Variable8_0_8_10currentValue"]
	sigma_mutex.release()
	
	VarRef9_3_9_5terminates = VarRef9_3_9_51582 
	return VarRef9_3_9_5terminates 
def functioninit10Variable(): 
	sigma_mutex.acquire()
	sigma["Variable1_4_1_14currentValue"] = int()
	sigma_mutex.release()
def function12initializeVar(): 
	
	Variable1_4_1_141376 = 1 
	sigma_mutex.acquire()
	sigma["Variable1_4_1_14currentValue"] = Variable1_4_1_141376
	sigma_mutex.release()
def functioninit14Variable(): 
	sigma_mutex.acquire()
	sigma["Variable2_4_2_14currentValue"] = int()
	sigma_mutex.release()
def function16initializeVar(): 
	
	Variable2_4_2_141376 = 0 
	sigma_mutex.acquire()
	sigma["Variable2_4_2_14currentValue"] = Variable2_4_2_141376
	sigma_mutex.release()
def function20executeAssignment2(resRight): 
	
	Assignment3_4_3_112523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable2_4_2_14currentValue"] = Assignment3_4_3_112523
	sigma_mutex.release()
def function21accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef3_9_3_111582 = sigma["Variable1_4_1_14currentValue"]
	sigma_mutex.release()
	
	VarRef3_9_3_11terminates = VarRef3_9_3_111582 
	return VarRef3_9_3_11terminates 
def main(): 
	functioninit24Variable() 
	function26initializeVar() 
	result31accessVarRef = function31accessVarRef(); 
	functioninit10Variable() 
	function12initializeVar() 
	functioninit14Variable() 
	function16initializeVar() 
	result21accessVarRef = function21accessVarRef(); 
	function20executeAssignment2(result21accessVarRef) 
if __name__ == "__main__": 
	main() 
