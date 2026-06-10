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
def functioninit12Variable(): 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = int()
	sigma_mutex.release()
def function14initializeVar(): 
	
	Variable2_0_2_101376 = 0 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = Variable2_0_2_101376
	sigma_mutex.release()
def function92executeAssignment2(resRight): 
	
	Assignment16_0_16_202523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable2_0_2_10currentValue"] = Assignment16_0_16_202523
	sigma_mutex.release()
def function53accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef7_4_7_61582 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef7_4_7_6terminates = VarRef7_4_7_61582 
	return VarRef7_4_7_6terminates 
def function98evaluateConjunction2(): 
	
	Conjunction16_5_16_20terminates = False 
	return Conjunction16_5_16_20terminates 
def function99evaluateConjunction3(): 
	
	Conjunction16_5_16_20terminates = False 
	return Conjunction16_5_16_20terminates 
def function102evaluateConjunction4(): 
	
	Conjunction16_5_16_20terminates = True 
	return Conjunction16_5_16_20terminates 
def function21executeAssignment2(resRight): 
	
	Assignment4_7_4_212523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment4_7_4_212523
	sigma_mutex.release()
def function35executeAssignment2(resRight): 
	
	Assignment5_7_5_212523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment5_7_5_212523
	sigma_mutex.release()
def function104evalBooleanConst(): 
	sigma_mutex.acquire()
	sigma["BooleanConst16_6_16_10constantValue"] = bool()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["BooleanConst16_6_16_10constantValue"] = True
	sigma_mutex.release()
	
	sigma_mutex.acquire()
	BooleanConst16_6_16_104609 = sigma["BooleanConst16_6_16_10constantValue"]
	sigma_mutex.release()
	
	BooleanConst16_6_16_10terminates = BooleanConst16_6_16_104609 
	return BooleanConst16_6_16_10terminates 
def function107evalBooleanConst(): 
	sigma_mutex.acquire()
	sigma["BooleanConst16_14_16_19constantValue"] = bool()
	sigma_mutex.release()
	sigma_mutex.acquire()
	sigma["BooleanConst16_14_16_19constantValue"] = False
	sigma_mutex.release()
	
	sigma_mutex.acquire()
	BooleanConst16_14_16_194609 = sigma["BooleanConst16_14_16_19constantValue"]
	sigma_mutex.release()
	
	BooleanConst16_14_16_19terminates = BooleanConst16_14_16_194609 
	return BooleanConst16_14_16_19terminates 
def function27finishPlus(n2, n1): 
	
	Plus4_12_4_214390 = n1 
	
	Plus4_12_4_214395 = n2 
	
	Plus4_12_4_214389 = Plus4_12_4_214390 + Plus4_12_4_214395 
	
	Plus4_12_4_21terminates = Plus4_12_4_214389 
	return Plus4_12_4_21terminates 
def function41finishPlus(n2, n1): 
	
	Plus5_12_5_214390 = n1 
	
	Plus5_12_5_214395 = n2 
	
	Plus5_12_5_214389 = Plus5_12_5_214390 + Plus5_12_5_214395 
	
	Plus5_12_5_21terminates = Plus5_12_5_214389 
	return Plus5_12_5_21terminates 
def function61executeAssignment2(resRight): 
	
	Assignment9_4_9_182523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable1_0_1_10currentValue"] = Assignment9_4_9_182523
	sigma_mutex.release()
def function78executeAssignment2(resRight): 
	
	Assignment12_4_12_182523 = resRight 
	sigma_mutex.acquire()
	sigma["Variable0_0_0_10currentValue"] = Assignment12_4_12_182523
	sigma_mutex.release()
def function30accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef4_18_4_201582 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_18_4_20terminates = VarRef4_18_4_201582 
	return VarRef4_18_4_20terminates 
def function28accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef4_13_4_151582 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef4_13_4_15terminates = VarRef4_13_4_151582 
	return VarRef4_13_4_15terminates 
def function44accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef5_18_5_201582 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef5_18_5_20terminates = VarRef5_18_5_201582 
	return VarRef5_18_5_20terminates 
def function42accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef5_13_5_151582 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef5_13_5_15terminates = VarRef5_13_5_151582 
	return VarRef5_13_5_15terminates 
def function67finishPlus(n2, n1): 
	
	Plus9_9_9_184390 = n1 
	
	Plus9_9_9_184395 = n2 
	
	Plus9_9_9_184389 = Plus9_9_9_184390 + Plus9_9_9_184395 
	
	Plus9_9_9_18terminates = Plus9_9_9_184389 
	return Plus9_9_9_18terminates 
def function84finishPlus(n2, n1): 
	
	Plus12_9_12_184390 = n1 
	
	Plus12_9_12_184395 = n2 
	
	Plus12_9_12_184389 = Plus12_9_12_184390 + Plus12_9_12_184395 
	
	Plus12_9_12_18terminates = Plus12_9_12_184389 
	return Plus12_9_12_18terminates 
def function70accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef9_15_9_171582 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef9_15_9_17terminates = VarRef9_15_9_171582 
	return VarRef9_15_9_17terminates 
def function68accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef9_10_9_121582 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef9_10_9_12terminates = VarRef9_10_9_121582 
	return VarRef9_10_9_12terminates 
def function87accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef12_15_12_171582 = sigma["Variable0_0_0_10currentValue"]
	sigma_mutex.release()
	
	VarRef12_15_12_17terminates = VarRef12_15_12_171582 
	return VarRef12_15_12_17terminates 
def function85accessVarRef(): 
	
	sigma_mutex.acquire()
	VarRef12_10_12_121582 = sigma["Variable1_0_1_10currentValue"]
	sigma_mutex.release()
	
	VarRef12_10_12_12terminates = VarRef12_10_12_121582 
	return VarRef12_10_12_12terminates 
def main(): 
	functioninit4Variable() 
	function6initializeVar() 
	functioninit8Variable() 
	function10initializeVar() 
	functioninit12Variable() 
	function14initializeVar() 
	sync120 = Queue() 
	sync52 = Queue() 
	queue100 = Queue() 
	queue101 = Queue() 
	queue27 = Queue() 
	queue67 = Queue() 
	def codeThread18():
		def codeThread30():
			result30accessVarRef = function30accessVarRef(); 
			queue27.put(result30accessVarRef) 
		thread30 = threading.Thread(target=codeThread30) 
		thread30.start() 
		def codeThread28():
			result28accessVarRef = function28accessVarRef(); 
			queue27.put(result28accessVarRef) 
		thread28 = threading.Thread(target=codeThread28) 
		thread28.start() 
		
		AndJoinPopped_27_0 = queue27.get() 
		
		AndJoinPopped_27_1 = queue27.get() 
		result27finishPlus = function27finishPlus(AndJoinPopped_27_0, AndJoinPopped_27_1); 
		function21executeAssignment2(result27finishPlus) 
		sync120.put(42) 
	thread18 = threading.Thread(target=codeThread18) 
	thread18.start() 
	def codeThread32():
		queue41 = Queue() 
		def codeThread44():
			result44accessVarRef = function44accessVarRef(); 
			queue41.put(result44accessVarRef) 
		thread44 = threading.Thread(target=codeThread44) 
		thread44.start() 
		def codeThread42():
			result42accessVarRef = function42accessVarRef(); 
			queue41.put(result42accessVarRef) 
		thread42 = threading.Thread(target=codeThread42) 
		thread42.start() 
		
		AndJoinPopped_41_0 = queue41.get() 
		
		AndJoinPopped_41_1 = queue41.get() 
		result41finishPlus = function41finishPlus(AndJoinPopped_41_0, AndJoinPopped_41_1); 
		function35executeAssignment2(result41finishPlus) 
		sync120.put(42) 
	thread32 = threading.Thread(target=codeThread32) 
	thread32.start() 
	sync120.get() 
	result53accessVarRef = function53accessVarRef(); 
	
	VarRef7_4_7_6terminate = result53accessVarRef 
	if VarRef7_4_7_6terminate == True: 
		def codeThread70():
			result70accessVarRef = function70accessVarRef(); 
			queue67.put(result70accessVarRef) 
		thread70 = threading.Thread(target=codeThread70) 
		thread70.start() 
		def codeThread68():
			result68accessVarRef = function68accessVarRef(); 
			queue67.put(result68accessVarRef) 
		thread68 = threading.Thread(target=codeThread68) 
		thread68.start() 
		
		AndJoinPopped_67_0 = queue67.get() 
		
		AndJoinPopped_67_1 = queue67.get() 
		result67finishPlus = function67finishPlus(AndJoinPopped_67_0, AndJoinPopped_67_1); 
		function61executeAssignment2(result67finishPlus) 
		sync52.put(42) 
	if VarRef7_4_7_6terminate == False: 
		queue84 = Queue() 
		def codeThread87():
			result87accessVarRef = function87accessVarRef(); 
			queue84.put(result87accessVarRef) 
		thread87 = threading.Thread(target=codeThread87) 
		thread87.start() 
		def codeThread85():
			result85accessVarRef = function85accessVarRef(); 
			queue84.put(result85accessVarRef) 
		thread85 = threading.Thread(target=codeThread85) 
		thread85.start() 
		
		AndJoinPopped_84_0 = queue84.get() 
		
		AndJoinPopped_84_1 = queue84.get() 
		result84finishPlus = function84finishPlus(AndJoinPopped_84_0, AndJoinPopped_84_1); 
		function78executeAssignment2(result84finishPlus) 
		sync52.put(42) 
	sync52.get() 
	def codeThread104():
		result104evalBooleanConst = function104evalBooleanConst(); 
		queue101.put(result104evalBooleanConst) 
		
		BooleanConst16_6_16_10terminate = result104evalBooleanConst 
		if BooleanConst16_6_16_10terminate == False: 
			result98evaluateConjunction2 = function98evaluateConjunction2(); 
			queue100.put(result98evaluateConjunction2) 
	thread104 = threading.Thread(target=codeThread104) 
	thread104.start() 
	def codeThread107():
		result107evalBooleanConst = function107evalBooleanConst(); 
		queue101.put(result107evalBooleanConst) 
		
		BooleanConst16_14_16_19terminate = result107evalBooleanConst 
		if BooleanConst16_14_16_19terminate == False: 
			result99evaluateConjunction3 = function99evaluateConjunction3(); 
			queue100.put(result99evaluateConjunction3) 
	thread107 = threading.Thread(target=codeThread107) 
	thread107.start() 
	
	AndJoinPopped_101_0 = queue101.get() 
	
	AndJoinPopped_101_1 = queue101.get() 
	
	BooleanConst16_6_16_10terminate = AndJoinPopped_101_0 
	
	BooleanConst16_14_16_19terminate = AndJoinPopped_101_1 
	if BooleanConst16_6_16_10terminate == True and BooleanConst16_14_16_19terminate == True: 
		result102evaluateConjunction4 = function102evaluateConjunction4(); 
		queue100.put(result102evaluateConjunction4) 
		
		OrJoinPopped_100 = queue100.get() 
		function92executeAssignment2(OrJoinPopped_100) 
if __name__ == "__main__": 
	main() 
