grammar FiniteStateMachine

entry FSMModel:
    (events+=Event)*
    (fsms+=FSM)*
;
FSM:
    'fsm' name=ID '[' initialState=[State:ID] ']'
    (states+=State | transitions+=Transition)*;

Event:
    "event" name=ID;

State:
    'state' name=ID'{'
        'out'':' (outTransitions+=[Transition:ID])*
    '}';

Transition:
    name=ID':' source=[State:ID] 
    '---'('when' guardEvent=[Event:ID] | 'after' time=INT) 
    '/' 
    sentEvent=[Event:ID] '-->' target=[State:ID];

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
