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
	com_create_event_channel("Event3_0_3_8", 1, "void") 
	com_create_event_channel("Event4_0_4_8", 1, "void") 
def function18init(): 
	sigma_mutex.acquire()
	sigma["State6_4_9_5isInitial"] = True
	sigma_mutex.release()
def functioninit20State(): 
	sigma_mutex.acquire()
	sigma["State6_4_9_5isInitial"] = bool()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["State6_4_9_5isInitial"] = False
	sigma_mutex.release()
def function24firstStartOfInitialState(): 
	sigma_mutex.acquire()
	sigma["State6_4_9_5isInitial"] = False
	sigma_mutex.release()
def function40emitsentEvent(): 
	
	Event3_0_3_8sentEventPayload = 0 
	com_emit_event("Event3_0_3_8", Event3_0_3_8sentEventPayload, True) 
def functioninit28State(): 
	sigma_mutex.acquire()
	sigma["State10_4_13_5isInitial"] = bool()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["State10_4_13_5isInitial"] = False
	sigma_mutex.release()
def function32firstStartOfInitialState(): 
	sigma_mutex.acquire()
	sigma["State10_4_13_5isInitial"] = False
	sigma_mutex.release()
def function47emitsentEvent(): 
	
	Event4_0_4_8sentEventPayload = 0 
	com_emit_event("Event4_0_4_8", Event4_0_4_8sentEventPayload, True) 
def main(): 
	function0FSMstart() 
	sync52 = Queue() 
	def codeThread15():
		function18init() 
		sync64 = Queue() 
		sync64.put(42) 
		flag64 = True
		while flag64 == True: 
			flag64 = False 
			sync64.get() 
			functioninit20State() 
			sync25 = Queue() 
			sync26 = Queue() 
			sync57 = Queue() 
			sync39 = Queue() 
			if State6_4_9_5isInitial == True: 
				function24firstStartOfInitialState() 
				sync26.put(42) 
				sync26.get() 
				def codeThread36():
					sync39.get() 
					function40emitsentEvent() 
					def codeThread37():
						sync57.get() 
					thread37 = threading.Thread(target=codeThread37) 
					thread37.start() 
					def codeThread28():
						functioninit28State() 
						sync33 = Queue() 
						sync34 = Queue() 
						sync62 = Queue() 
						sync46 = Queue() 
						if State10_4_13_5isInitial == True: 
							function32firstStartOfInitialState() 
							sync34.put(42) 
							sync34.get() 
							def codeThread43():
								sync46.get() 
								function47emitsentEvent() 
								def codeThread44():
									sync62.get() 
								thread44 = threading.Thread(target=codeThread44) 
								thread44.start() 
								def codeThread45():
								thread45 = threading.Thread(target=codeThread45) 
								thread45.start() 
								def codeThread64():
								thread64 = threading.Thread(target=codeThread64) 
								thread64.start() 
							thread43 = threading.Thread(target=codeThread43) 
							thread43.start() 
						if State10_4_13_5isInitial == False: 
							sync33.get() 
							sync33.put(42) 
					thread28 = threading.Thread(target=codeThread28) 
					thread28.start() 
				thread36 = threading.Thread(target=codeThread36) 
				thread36.start() 
			if State6_4_9_5isInitial == False: 
				sync25.get() 
				sync25.put(42) 
	thread15 = threading.Thread(target=codeThread15) 
	thread15.start() 
if __name__ == "__main__": 
	main() 
