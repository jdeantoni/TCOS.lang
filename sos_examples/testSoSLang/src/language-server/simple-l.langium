grammar SimpleL

entry Model:
    statements+=(Statement)*;

Bloc:
    '{'
    statements+=(Statement)*
    '}';

ParallelBloc:
    '|'
    ('|' statements+=Statement)*
    '|';

Statement:
    VarDecl | Expr | Assignment | Bloc | ParallelBloc;

Expr:
    VarRef|Plus|If;

If:
    'if' '('cond=VarRef ')'
    then=Bloc
    ('else' else=Bloc)?;

VarDecl:
    'var' name=ID ('=' initialValue=INT)?;
Plus:
    left=VarRef '+' right=Expr ;
Assignment:
    left=[VarDecl:ID] '=' right=Expr;
VarRef:
    ref=[VarDecl:ID];











hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
