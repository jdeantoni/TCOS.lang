grammar SimpleL

entry Model:
    (functionDefs+=FunctionDef)*
    (statements+=Statement)*;

Bloc:
    '{'
    statements+=(Statement)*
    '}';

ParallelBloc:
    '|'
    ('|' statements+=Statement)*
    '|';

PeriodicBloc:
    'every' time=INT 'ms'
    bloc=Bloc;

Statement:
    Variable | Expr | Assignment | Bloc | ParallelBloc | PeriodicBloc| While | If | FunctionCall;

Expr:
    VarRef|Plus|BooleanExpression;

BooleanExpression:
    Conjunction | Disjunction | BooleanConst;

BooleanConst:
    value=('true' | 'false');

Conjunction:
    '('lhs=BooleanExpression '&&' rhs=BooleanExpression')';

Disjunction:
    '('lhs=BooleanExpression '||' rhs=BooleanExpression')';


While:
    'while' '('cond=VarRef ')'
    body=Bloc;

If:
    'if' '('cond=VarRef ')'
    then=Bloc
    ('else' else=Bloc);

Variable:
    'var' name=ID ('=' initialValue=INT)?;
Plus:
    "("left=Expr '+' right=Expr")" ;
Assignment:
    variable=[Variable:ID] '=' expr=Expr;
VarRef:
    theVar=[Variable:ID];


FunctionDef: //no return yet
    'function' name=ID '(' (params+=ID)* ')' body=Bloc;



FunctionCall:
    theFunction=[FunctionDef:ID] '(' (args+=Expr)* ')';







hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
