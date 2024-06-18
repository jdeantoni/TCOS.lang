
import threading
import time
import queue



##std::unordered_map<std::string, void*> sigma;
##std::mutex sigma_mutex;  // protects sigma

def functioninit3Variable() :
	global Variable2_0_2_10currentValue
def function5initializeVar() :
	
	Variable2_0_2_101430 = 1
	global Variable2_0_2_10currentValue
	Variable2_0_2_10currentValue = Variable2_0_2_101430
def functioninit6Variable() :
	global Variable4_0_4_10currentValue
def function8initializeVar() :
	
	Variable4_0_4_101430 = 3
	global Variable4_0_4_10currentValue
	Variable4_0_4_10currentValue = Variable4_0_4_101430
def function11accessVarRef() :
	## std::lock_guard<std::mutex> lock(sigma_mutex);
	
	global Variable2_0_2_10currentValue
	VarRef6_4_6_61645 = Variable2_0_2_10currentValue
	
	VarRef6_4_6_6terminates = VarRef6_4_6_61645
	return VarRef6_4_6_6terminates
def function19accessVarRef() :
	## std::lock_guard<std::mutex> lock(sigma_mutex);
	
	global Variable4_0_4_10currentValue
	VarRef7_9_7_111645 = Variable4_0_4_10currentValue
	
	VarRef7_9_7_11terminates = VarRef7_9_7_111645
	return VarRef7_9_7_11terminates
def function21executeAssignment2(resRight) :
	
	Assignment7_4_7_112620 = resRight
	global Variable2_0_2_10currentValue
	Variable2_0_2_10currentValue = Assignment7_4_7_112620
def function28accessVarRef() :
	## std::lock_guard<std::mutex> lock(sigma_mutex);
	
	global Variable2_0_2_10currentValue
	VarRef10_9_10_111645 = Variable2_0_2_10currentValue
	
	VarRef10_9_10_11terminates = VarRef10_9_10_111645
	return VarRef10_9_10_11terminates
def function30executeAssignment2(resRight) :
	
	Assignment10_4_10_112620 = resRight
	global Variable4_0_4_10currentValue
	Variable4_0_4_10currentValue = Assignment10_4_10_112620

def main():
	functioninit3Variable()
	function5initializeVar()
	functioninit6Variable()
	function8initializeVar()
	result11accessVarRef = function11accessVarRef()
	
        LockingQueue<Void> queue32;
            
    int return,VarRef6_4_6_6terminate = result11accessVarRef;//Choice node
    if((bool)VarRef6_4_6_6terminates == true){result19accessVarRef = function19accessVarRef()
	function21executeAssignment2(result19accessVarRef)
	{

            Void fakeParam32;
            queue32.push(fakeParam32);
                }

            //END IF (bool)VarRef6_4_6_6terminates == true
        }
            //Choice node
        if((bool)VarRef6_4_6_6terminates == false){result28accessVarRef = function28accessVarRef()
	function30executeAssignment2(result28accessVarRef)
	{

            Void fakeParam32;
            queue32.push(fakeParam32);
                }

            //END IF (bool)VarRef6_4_6_6terminates == false
        }
             //or join node
        Void OrJoinPopped_32;
        queue32.waitAndPop(OrJoinPopped_32);
        
if __name__ == "__main__":
    main()
    