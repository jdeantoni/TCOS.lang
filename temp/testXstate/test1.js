import { createMachine } from 'xstate';
const toggleMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBc7IHQEsB2nmYEMAbAZWQNXQCcwpMB7bARnVnNSYGIBRANzGzIABEyYBtAAwBdRKAAO9WHgbZZIAB6IATFoAc6AJwB2A0wMAWCUwCsu3QDZHAGhABPRAGZzLCefu6jLwkDCS1rcyMAX0iXVDYsXHxiMgowaloVFmwwAHchNlShLR5+QREtSRkkEAUlfEY1TQRzAPQPDwd-EJ17MOsXdwQg9C0mD2sjLUcDR2smaNi0BOVk9jSaOkYs3Py1oQ8SgWExyrVa5QbqppajNo7HXW6pvoHtM0N-I3M9SestYK0CxAcQwOBWpDW6U22C0rDWXD4RyK4mkZ0UF1UV20ekMJjMlhsdkc9leCHs30MBgCvg89jMui8QJByySENSUJUsOyeQKqCKhzKOlO1XO9UxoGuVPQ3gMXiM1gVJjppPJHnQDP+1i89gmfnmMWBSzBrJSlA2nPQ3N2hQOiMEWg8wvk6LFjUQ1gkEnQoQkRke5OsjjCpPMBgMbRaFmJkxC9miBuw9AgcDUILRdRUboQAFpvqTcyww0Xi8WHEyjYlCGzUOmMVmSW5EOZrG0dKZ7HKtF8OuX4saq6b1hktrXXViEOFSWNYQGNfYLOEAuZe6DK6t2eatnDUkxR5nx0xQqSdC2jKJdIe5XYDLYVyyB5DN8xLTteWAinvLhLPC1cQZ-t4WqjI45iksMHhfGG9hGPKWoRHe-brmaw7Plab77J+4oaIgdIsBMvh+s8Ei6M2x44qMTAmLSWiyh4vpRAazKIdWQ7QlomFZpOjbNEwsKhPYEh0R4-xWL0CFrixHKMLCb67iKLr7t+CCHlopIei2AJWN43w6v+1jieCg5STCL48ns7HyRmX7YUMfzoLBQltu05h+Cq7ywSJ+F0S5Bkmo+KFcq+eweBx469DOHQSEGJESOERhqb66DWP+WlMDpyVhPGkRAA */
  id: 'test',
  type: 'parallel',
  initial: 'initialState',
  states: {
    initialState: {
        type: "parallel",
        states: {
            region1: {
                id: 'region1',
                initial: "state1",
                states:{
                    "state1": {
                        on: {
                          "Event 11": "new state 2"
                        }
                      },
                  
                      "new state 2": {
                        on: {
                          "Event 12": "new state 3"
                        }
                      },
                  
                      "new state 3": {
                        on: {
                          "Event 13": "state1"
                        }
                      }
                }
        },
        region2: {
            id: 'region1',
            initial: "state1",
            states:{
                "state1": {
                    on: {
                      "Event 21": "new state 2"
                    }
                  },
              
                  "new state 2": {
                    on: {
                      "Event 22": "new state 3"
                    },
                    exit: {
                        actions:{
                            actionSendMyEvent: 
                            send('Event 11', {to: region1})
                        }

                    }
                  },
              
                  "new state 3": {
                    on: {
                      "Event23": "state1"
                    }
                  }
            }
        },
    }
    }
},
});
