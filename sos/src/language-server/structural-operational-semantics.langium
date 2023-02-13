grammar StructuralOperationalSemantics


import "../../node_modules/langium/src/grammar/langium-grammar";

entry SoSSpec:
   name=ID
   imports=ImportStatement
   rtdAndRules+=(RuleOpening)+
   ;

RuleOpening:
    {infer RuleOpening}
   name=ID 'open' onRule=[ParserRule:ID] '{' 
    (runtimeState+=(VariableDeclaration) | 
    rules+=(RWRule))*
    '}' 
;

ImportStatement:
	'import' importURI=STRING; 

// Sigma:
//     '{'
//         stateParts
//     '}';

RWRule:
    {infer RWRule}
        '('(premise=SemanticEquivalence)*')'   
name=ID ":" ('-')+
         conclusion=Conclusion;
 

SemanticEquivalence:
    ('<'('this''.'leftRTD=[NamedElement:QualifiedName] | 'struct''.'leftStruct=[AbstractElement:ID]) ',''σ''>' operator=('->') right=(VariableDeclaration|Primary))*;  
// Premise:
//     {infer Premise}  
//     '('Logical')';

Conclusion:
   '<this,σ>' '~>' outState+=(SoSAssignment)+; 


//reused from lox

VariableDeclaration returns NamedElement: 
    {infer VariableDeclaration} 
    ('var') ? name=ID (':' type=TypeReference)? (assignment?='=' value=Expression)? ;

Expression:
    Addition;

Addition infers Expression:
    Multiplication ({infer BinaryExpression.left=current} operator=('+' | '-') right=Multiplication)*;

Multiplication infers Expression:
    Logical ({infer BinaryExpression.left=current} operator=('*' | '/') right=Logical)*;

Logical infers Expression:
    Comparison ({infer BinaryExpression.left=current} operator=('and' | 'or') right=Comparison)*;

Comparison infers Expression:
    SoSAssignment ({infer BinaryExpression.left=current} operator=('<' | '<=' | '>' | '>=' | '==' | '!=') right=SoSAssignment)*; 

SoSAssignment infers Expression:
    MemberCall ({infer BinaryExpression.left=current} operator=('=') ('this''.'rightRTD=[NamedElement:QualifiedName] | 'struct''.'rightStruct=[AbstractElement:ID]|rightVar=[NamedElement:QualifiedName]))*;

MemberCall infers Expression:
    Primary
	({infer MemberCall.previous=current} 
        // Member call with function call
        ("." element=[NamedElement:QualifiedName] (
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
    StringExpression |
    BooleanExpression |
    NumberExpression |
    NilExpression |
    FeatureCall;

FeatureCall infers Expression:
	{infer MemberCall}
	((element=[NamedElement:QualifiedName] | element=[NamedElement:'this'] | element=[NamedElement:'super']))
    // Optional function call after referencing an element
    (explicitOperationCall?='('
	(
	    arguments+=Expression (',' arguments+=Expression)*
	)?
	')')?;

UnaryExpression:
   operator=('!' | '-' | '+') value=Expression
;

NumberExpression: value=NUMBER;
StringExpression: value=STRING;
BooleanExpression: value?='true' | 'false';
NilExpression: value='nil';

// FunctionDeclaration:
//     'fun' name=ID '(' (parameters+=Parameter (',' parameters+=Parameter)*)? ')' ':' returnType=TypeReference body=ExpressionBlock;

// Parameter: name=ID ':' type=TypeReference;

Struct: 'struct' name=ID ('<' superClass=[Struct:ID])? '{'
    members+=FieldMember*
'}';

// ClassMember: MethodMember | FieldMember;

// MethodMember:
//     name=ID '(' (parameters+=Parameter (',' parameters+=Parameter)*)? ')' ':' returnType=TypeReference body=ExpressionBlock;

FieldMember:
    name=ID ':' type=TypeReference;

TypeReference: reference=/*[Struct:ID]|*/[RuleOpening:ID]  
    | primitive=("string" | "number" | "boolean" | "void") 
  //  | '(' ( parameters+=LambdaParameter (',' parameters+=LambdaParameter)*)? ')' '=>' returnType=TypeReference;
;

LambdaParameter: (name=ID ':')? type=TypeReference;

type NamedElement = /*Parameter | FunctionDeclaration |*/ VariableDeclaration /*| MethodMember*/ | FieldMember | Struct | RuleOpening; 

// hidden terminal WS: /\s+/;
// terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]+)?/;
// terminal STRING: /"[^"]*"/;

// hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
// hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

QualifiedName returns string:
    ID ('.' ID)*; 