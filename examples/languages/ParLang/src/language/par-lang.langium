grammar ParLang

entry Program: 
    ("communication" "IDs" ":" comIDs+=ComID* )?
    stmt=Statement;

Statement: 
    Seq | Par | Perio |Stmt1 | Stmt2 | Notify | Wait;

Seq:
    '('lhs=Statement ';' rhs=Statement')';

Par:
    '('lhs=Statement '||' rhs=Statement')';

Perio: 
    'every' p=INT 'ms' '{' stmt=Statement '}';

Stmt1: 
    {infer Stmt1} 'stmt1';

Stmt2: 
    {infer Stmt2} 'stmt2';

Notify:
    {infer Notify} 'notify' notifyID=[ComID:ID];

Wait:
    {infer Wait} 'wait' waitID=[ComID:ID];

ComID:
    {infer ComID} name=ID;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

