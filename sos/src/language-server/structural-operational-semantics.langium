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
    (runtimeState+=(VariableDeclaration))*
    (rules+=RWRule)* 

    '}' 
;

ImportStatement:
	'import' importURI=STRING; 



RWRule:
	premise=Premise
    ('-')+ name=ID
	conclusion=Conclusion
;



EventExpression:
	EventRef |  NaryEventExpression | EventCombination |  ValuedEventRef | ValuedEventRefConstantComparison;

// BooleanExpression:
// 	BooleanConjunction | BooleanDisjunction | DataComparison;

EventEmission:
	SimpleEventEmission | ValuedEventEmission | RuleSync;

Data:
	EventValueRef | Constant | ValuedEventRefConstantComparison;

Expression:
	EventValueRef | Constant | ValuedEventRefConstantComparison | UnaryMinus | FunctionCallExpr | ClassicalExpression;

EString returns string:
	STRING | ID;

Premise:
	'when' eventExpression=EventExpression
	( '[' booleanExpression+=(Comparison) ']' )?
	;


Conclusion:
	'<''this'',''σ''>' '~>' (statemodifications+=StateModification)*
							(eventemissions+=EventEmission)* 
	;

EventRef:
	ExplicitEventRef | SingleRuleSync;


ExplicitEventRef:
	membercall=MemberCall
	;

// BinaryEventExpression_Impl:
// 	'BinaryEventExpression'
// 	'{'
// 		'lhs' lhs=EventExpression
// 		'rhs' rhs=EventExpression
// 	'}';

NaryEventExpression:
	policy = SelectionPolicy '(' (collection=MemberCall)')' 
	;

EventCombination:
	EventConjunction | EventDisjunction;

EventConjunction:
	'('lhs=EventExpression
		'^' rhs=EventExpression')'
	;

EventDisjunction:
	'('lhs=EventExpression
		'v' rhs=EventExpression')'
	;

ValuedEventRef:
	ExplicitValuedEventRef | ImplicitValuedEventRef;

ImplicitValuedEventRef:
	'<'membercall=MemberCall',' 'σ' '>' '->' tempVar=TemporaryVariable;


ExplicitValuedEventRef:
	membercall=MemberCall'['tempVar=TemporaryVariable']'
	;

ValuedEventRefConstantComparison:
	ExplicitValuedEventRefConstantComparison | ImplicitValuedEventRefConstantComparison;

ExplicitValuedEventRefConstantComparison:
	membercall=MemberCall'[='literal=EString'=]'
	;

ImplicitValuedEventRefConstantComparison:
	'<'membercall=MemberCall',' 'σ' '>' '->' literal=(NumberExpression|StringExpression|BooleanExpression);
	



EventValueRef:
	value=[ValuedEventRef:EString]
	;

Constant:
	literal=EString
	;

SimpleEventEmission:
	('emits')? event=MemberCall
	;

StateModification:
	lhs=MemberCall ':=' rhs=ClassicalExpression ';'
	;

ValuedEventEmission:
	('emits')? event=MemberCall '[' data=ClassicalExpression']'
	;

UnaryMinus:
	'-' expression=Expression
;

FunctionCallExpr:
	name=ID
		'(' (parameters+=Expression ( "," parameters+=Expression)*)? ')';


SelectionPolicy:
   {infer SelectionPolicy}
   operator=("firstOf" | "lastOf") ; 

RuleSync:
    (SingleRuleSync | CollectionRuleSync);

SingleRuleSync:
    '<'member=MemberCall',' 'σ' '>' ;//'.' status=(SyncExpression);


CollectionRuleSync:
   collection=MemberCall '->' (order=("concurrent"|"sequential") '.')'foreach''('varDecl=TemporaryVariable ('=>'|'|') singleRule=EventEmission')';

TemporaryVariable returns NamedElement:
    {infer TemporaryVariable} 
    name=ID (':' type=TypeReference)?;


//reused from lox

VariableDeclaration returns NamedElement: 
    {infer VariableDeclaration} 
    ('var') ? name=ID (':' type=TypeReference)? (assignment?='=' value=ClassicalExpression)? ';' ; 

ClassicalExpression:
    Addition;

// SoSAssignment infers Expression:
//     Addition ({infer BinaryExpression.left=current} operator=('=') right=Addition)*;

Addition infers ClassicalExpression: 
    Multiplication ({infer BinaryExpression.left=current} operator=('+' | '-') right=Multiplication)*;

Multiplication infers ClassicalExpression:
    Logical ({infer BinaryExpression.left=current} operator=('*' | '/') right=Logical)*;

Logical infers ClassicalExpression:
    Comparison ({infer BinaryExpression.left=current} operator=('and' | 'or' | 'xor') right=Comparison)*; 

Comparison infers ClassicalExpression:
    MemberCall ({infer BinaryExpression.left=current} operator=('<' | '<=' | '>' | '>=' | '==' | '!=') right=MemberCall)*; 

MemberCall infers ClassicalExpression:
	    Primary
	({infer MemberCall.previous=current}
        // Member call with function call
        ("." element=[NamedElement:ID] (
		explicitOperationCall?='('
		(
		    arguments+=ClassicalExpression (',' arguments+=ClassicalExpression)*
		)?
		')')? 
        // Chained function call
        | (
		explicitOperationCall?='('
		(
		    arguments+=ClassicalExpression (',' arguments+=ClassicalExpression)*
		)?
		')'))
    )*;

MethodMember:
     name=ID '(' (parameters+=Parameter (',' parameters+=Parameter)*)? ')' ':' returnType=TypeReference;  //body=ExpressionBlock;
FieldMember:
    name=ID ':' type=TypeReference;

Primary infers ClassicalExpression:
    '(' ClassicalExpression ')' |
    UnaryExpression |
    PrimaryExpression |
   // RtdOrStructCall |
    FeatureCall;

/*RtdOrStructCall infers Expression:
    ('this''.'rightRTD=[NamedElement:QualifiedName] | 'struct''.'rightStruct=[AbstractElement:ID]);
*/
PrimaryExpression infers ClassicalExpression: 
    StringExpression |
    BooleanExpression |
    NumberExpression |
    NilExpression 
	;

FeatureCall infers ClassicalExpression:
	{infer MemberCall}
	((element=[NamedElement:ID] | element=[NamedElement:'this'] | element=[NamedElement:'struct']))
    // Optional function call after referencing an element
    (explicitOperationCall?='('
	(
	    arguments+=ClassicalExpression (',' arguments+=ClassicalExpression)*
	)?
	')')?;

UnaryExpression:
   operator=('!' | '-' | '+') value=ClassicalExpression
	;

NumberExpression: value=NUMBER;
StringExpression: value=STRING;
BooleanExpression: value = 'true' | 'false';
NilExpression: value='nil';

TypeReference: reference=[AbstractRule:ID]   
    | primitive=SoSPrimitiveType  
;

SoSPrimitiveType:
    name=("string" | "integer" | "boolean" | "void" | "event"); 


type NamedElement = /*Parameter | FunctionDeclaration |*/ MethodMember |VariableDeclaration | RuleOpening | TemporaryVariable | SoSPrimitiveType | RWRule  ;  

// hidden terminal WS: /\s+/;
// terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]+)?/;
// terminal STRING: /"[^"]*"/;

// hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
// hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

QualifiedName returns string:
    ID ('.' ID)*; 