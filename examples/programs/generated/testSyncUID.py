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
	
	Variable1_0_1_101376 = 4 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Variable1_0_1_101376
	sigma_mutex.release()
def function17executeAssignment2(resRight): 
	
	Assignment3_7_3_142523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment3_7_3_142523
	sigma_mutex.release()
def function23executeAssignment2(resRight): 
	
	Assignment4_7_4_142523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Assignment4_7_4_142523
	sigma_mutex.release()
def function18accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef3_12_3_141582 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef3_12_3_14terminates = VarRef3_12_3_141582 
	return VarRef3_12_3_14terminates 
def function24accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef4_12_4_141582 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_12_4_14terminates = VarRef4_12_4_141582 
	return VarRef4_12_4_14terminates 
def main(): 
	functioninit4Variable() 
	function6initializeVar() 
	functioninit8Variable() 
	function10initializeVar() 
	sync34 = Queue() 
	def codeThread14():
		result18accessVarRef = function18accessVarRef(); 
		function17executeAssignment2(result18accessVarRef) 
		sync34.put(42) 
	thread14 = threading.Thread(target=codeThread14) 
	thread14.start() 
	def codeThread20():
		result24accessVarRef = function24accessVarRef(); 
		function23executeAssignment2(result24accessVarRef) 
		sync34.put(42) 
	thread20 = threading.Thread(target=codeThread20) 
	thread20.start() 
	sync34.get() 
if __name__ == "__main__": 
	main() 
