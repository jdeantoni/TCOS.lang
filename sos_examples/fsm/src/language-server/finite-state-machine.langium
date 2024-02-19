grammar FiniteStateMachine

entry FSMModel:
    events+=Event
    fsms+=FSM;

FSM:
    name=ID ':' initialState=[State:ID] 
    (states+=State | transitions+=Transition)*;

Event:
    name=ID;

State:
    (isInitial?='*')? 'state' name=ID'{'
        'in'':' inTransitions+=[Transition:ID]
        'out'':' outTransitions+=[Transition:ID]
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
