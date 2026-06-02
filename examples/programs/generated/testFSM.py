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
def function0FSMstart(): 
	com_create_event_channel("Event0_0_0_8", 1, "void") 
	com_create_event_channel("Event3_0_3_8", 1, "void") 
	com_create_event_channel("Event1_0_1_8", 1, "void") 
	com_create_event_channel("Event4_0_4_8", 1, "void") 
def function28fire(): 
	global com_last_event_token
	(Event0_0_0_8guardEventPayload, com_last_event_token) = com_wait_event("Event0_0_0_8") 
	Event0_0_0_8Token = com_last_event_token 
	com_ack_event(Event0_0_0_8Token) 
def function29emitsentEvent(): 
	
	Event3_0_3_8sentEventPayload = 0 
	com_emit_event("Event3_0_3_8", Event3_0_3_8sentEventPayload, True) 
def function34fire(): 
	global com_last_event_token
	(Event1_0_1_8guardEventPayload, com_last_event_token) = com_wait_event("Event1_0_1_8") 
	Event1_0_1_8Token = com_last_event_token 
	com_ack_event(Event1_0_1_8Token) 
def function35emitsentEvent(): 
	
	Event4_0_4_8sentEventPayload = 0 
	com_emit_event("Event4_0_4_8", Event4_0_4_8sentEventPayload, True) 
def main(): 
	function0FSMstart() 
	sync39 = Queue() 
	def codeThread15():
		while flag51 == True: 
			flag51 = False 
			sync51.get() 
			sync44 = Queue() 
			function28fire() 
			function29emitsentEvent() 
			sync44.put(42) 
			sync49 = Queue() 
			function34fire() 
			function35emitsentEvent() 
			sync49.put(42) 
			sync49.get() 
			sync44.get() 
	thread15 = threading.Thread(target=codeThread15) 
	thread15.start() 
if __name__ == "__main__": 
	main() 
