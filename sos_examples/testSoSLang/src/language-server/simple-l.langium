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
    Variable | Expr | Assignment | Bloc | ParallelBloc;

Expr:
    VarRef|Plus|If|BooleanExpression;

BooleanExpression:
    Conjunction | Disjunction | BooleanConst;

BooleanConst:
    value=('true' | 'false');

Conjunction:
    '('lhs=BooleanExpression '&&' rhs=BooleanExpression')';

Disjunction:
    '('lhs=BooleanExpression '||' rhs=BooleanExpression')';

If:
    'if' '('cond=VarRef ')'
    then=Bloc
    ('else' else=Bloc)?;

Variable:
    'var' name=ID ('=' initialValue=INT)?;
Plus:
    "("left=Expr '+' right=Expr")" ;
Assignment:
    variable=[Variable:ID] '=' expr=Expr;
VarRef:
    ref=[Variable:ID];











hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
