grammar StructuralOperationalSemantics


import "../../node_modules/langium/src/grammar/langium-grammar";

entry SoSSpec:
   name=ID
   imports=ImportStatement
   rtdAndRules+=(RuleOpening)+
   ;


//on purpose no if conditions. They should be queried and scheduled by CCSL like ordering
RuleOpening:
    {infer RuleOpening} 
    (name=ID)? 'open' onRule=[ParserRule:ID] '{'
    (runtimeState+=(VariableDeclaration) |
    rules+=Rule)* 

    '}' 
;

ImportStatement:
	'import' importURI=STRING; 

// Sigma:
//     '{'
//         stateParts 
//     '}';


Rule:
    (RWRule/*| ExpressionRule | ControlFlowRule*/);

// ControlFlowRule:
//     "sched" (condition=Logical "implies")? (loop=SequenceLoop)? constraint=SchedulingConstraint; 
 
// SequenceLoop:
//     'foreach' itVar=TemporaryVariable 'in' '[' lowerBound=NUMBER ';' upperBound=Expression '['; 

// SchedulingConstraint:
//     '{'left=Expression operator=("precedes" | ("coincides_with")) right=Expression'}';  

RWRule: 
    {infer RWRule}
       ('rwr')? ("when" guardEvents+=MemberCall ('^' guardEvents+=MemberCall )* )? (premise+=SemanticEquivalence (';' premise+=SemanticEquivalence)* )? 
        ('-')+ name=ID
        conclusion=Conclusion; 



SemanticEquivalence: 
    ('<'(left=Expression) ',''σ''>' operator=('->') right=(TemporaryVariable|PrimaryExpression))*;  
// Premise:
//     {infer Premise}  
//     '('Logical')';
 
Conclusion:
   '<''this'',''σ''>' '~>' ( ('!'|'send') (ruleSync=RuleSync  ';') |(outState+=SoSAssignment)+ ";")? (isDying?='⍊')? ; //(isDying?=TerminateExpression)?  

RuleSync:
    rule=(SingleRuleSync | CollectionRuleSync);

SingleRuleSync:
    '<'member=MemberCall',' 'σ' '>' ;//'.' status=(SyncExpression);

CollectionRuleSync:
   collection=MemberCall '->' (order=("parallel"|"sequential") '.')?'foreach''('varDecl=TemporaryVariable ('=>'|'|') singleRule=SingleRuleSync')';

TemporaryVariable returns NamedElement:
    {infer TemporaryVariable} 
    name=ID (':' type=TypeReference)?;


//reused from lox

VariableDeclaration returns NamedElement: 
    {infer VariableDeclaration} 
    ('var') ? name=ID (':' type=TypeReference)? (assignment?='=' value=Expression)? ';' ; 

Expression:
    SoSAssignment;

SoSAssignment infers Expression:
    Addition ({infer BinaryExpression.left=current} operator=('=') right=Addition)*;

Addition infers Expression: 
    Multiplication ({infer BinaryExpression.left=current} operator=('+' | '-') right=Multiplication)*;

Multiplication infers Expression:
    Logical ({infer BinaryExpression.left=current} operator=('*' | '/') right=Logical)*;

Logical infers Expression:
    Comparison ({infer BinaryExpression.left=current} operator=('and' | 'or' | 'xor') right=Comparison)*; 

Comparison infers Expression:
    MemberCall ({infer BinaryExpression.left=current} operator=('<' | '<=' | '>' | '>=' | '==' | '!=') right=MemberCall)*; 


MemberCall infers Expression:
    Primary
	({infer MemberCall.previous=current}
        // Member call with function call
        ("." element=[NamedElement:ID] (
		explicitOperationCall?='('
		(
		    arguments+=Expression (',' arguments+=Expression)*
		)?
		')')? 
        // Chained function call
        | (
		explicitOperationCall?='('
		(
		    arguments+=Expression (',' arguments+=Expression)*
		)?
		')'))
    )*;

Primary infers Expression:
    '(' Expression ')' |
    UnaryExpression |
    PrimaryExpression |
   // RtdOrStructCall |
    FeatureCall;

/*RtdOrStructCall infers Expression:
    ('this''.'rightRTD=[NamedElement:QualifiedName] | 'struct''.'rightStruct=[AbstractElement:ID]);
*/
PrimaryExpression infers Expression: 
    StringExpression |
    BooleanExpression |
    NumberExpression |
    NilExpression; //|
    // SyncExpression;

FeatureCall infers Expression:
	{infer MemberCall}
	((element=[NamedElement:ID] | element=[NamedElement:'this'] | element=[NamedElement:'struct']))
    // Optional function call after referencing an element
    (explicitOperationCall?='('
	(
	    arguments+=Expression (',' arguments+=Expression)*
	)?
	')')?;

UnaryExpression:
   operator=('!' | '-' | '+') value=Expression
;
// SyncExpression:
//     (StartExpression | TerminateExpression);

NumberExpression: value=NUMBER;
StringExpression: value=STRING;
BooleanExpression: value?='true' | 'false';
NilExpression: value='nil';
// StartExpression: value='starts' | '⊤';
// TerminateExpression: value='terminates' | '⍊';


// FunctionDeclaration:
//     'fun' name=ID '(' (parameters+=Parameter (',' parameters+=Parameter)*)? ')' ':' returnType=TypeReference body=ExpressionBlock;

// Parameter: name=ID ':' type=TypeReference;

Struct: 'struct' name=ID ('<' superClass=[Struct:ID])? '{'
    members+=FieldMember*
'}';

// ClassMember: MethodMember | FieldMember; 

MethodMember:
     name=ID '(' (parameters+=Parameter (',' parameters+=Parameter)*)? ')' ':' returnType=TypeReference;  //body=ExpressionBlock;

FieldMember:
    name=ID ':' type=TypeReference;

TypeReference: reference=/*[Struct:ID]|*/[AbstractRule:ID]   
    | primitive=SoSPrimitiveType  
  //  | '(' ( parameters+=LambdaParameter (',' parameters+=LambdaParameter)*)? ')' '=>' returnType=TypeReference;
;

SoSPrimitiveType:
    name=("string" | "number" | "boolean" | "void" | "event"); 

LambdaParameter: (name=ID ':')? type=TypeReference;

type NamedElement = /*Parameter | FunctionDeclaration |*/ VariableDeclaration /*| MethodMember*/ | FieldMember | Struct | RuleOpening | TemporaryVariable | SoSPrimitiveType | RWRule |MethodMember ;  

// hidden terminal WS: /\s+/;
// terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]+)?/;
// terminal STRING: /"[^"]*"/;

// hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
// hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

QualifiedName returns string:
    ID ('.' ID)*; 