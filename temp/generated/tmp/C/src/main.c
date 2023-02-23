#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "unionFind.h"
#include "listeContrainte.h"
#include "tarjan.h"
#include "propag.h"
#include "param.h"
#include "core.h"
#include "test2.h"


typedef struct caus2{
	long int counter;
	int a;
	int b;
} Caus2; //a <= b 

void initCaus2(Caus2* data, int a, int b);

Contrainte computeCaus2(Caus2* data);

void updateCaus2(Caus2* data, int* res);

typedef struct prec2{
	long int counter;
	int a;
	int b;
} Prec2; // a < b 

void initPrec2(Prec2* data, int a, int b);

Contrainte computePrec2(Prec2* data);

typedef struct not{
	int a;
} Not; // not a 

void initNot(Not* data, int a);

Contrainte computeNot(Not* data);


void updatePrec2(Prec2* data, int* res);

typedef struct caus4{
	int counter;
	int a;
	int b;
	int max;
} Caus4; // a <= (init, max) b

void initCaus4(Caus4* data, int a, int b, int init, int max);

Contrainte computeCaus4(Caus4* data);

void updateCaus4(Caus4* data, int* res);

typedef struct prec4{
	int counter;
	int a;
	int b;
	int max;
} Prec4; // a <= (init, max) b

void initPrec4(Prec4* data, int a, int b, int init, int max);

Contrainte computePrec4(Prec4* data);

void updatePrec4(Prec4* data, int* res);

typedef struct exclu{
	int a;
	int b;
} Exclu; // a # b

void initExclu(Exclu* data, int a, int b);

Contrainte computeExclu(Exclu* data);

void updateExclu(Exclu* data, int* res);

typedef struct subcl{
	int a;
	int b;
} Subcl; // a <- b

void initSubcl(Subcl* data, int a, int b);

Contrainte computeSubcl(Subcl* data);

void updateSubcl(Subcl* data, int* res);

typedef struct uni0n{
	int a;
	int b;
	int c;
} Uni0n; // a = b + c

void initUni0n(Uni0n* data, int a, int b, int c);

Contrainte computeUni0n(Uni0n* data);

void updateUni0n(Uni0n* data, int* res);

typedef struct inter{
	int a;
	int b;
	int c;
} Inter; // a = b * c

void initInter(Inter* data, int a, int b, int c);

Contrainte computeInter(Inter* data);

void updateInter(Inter* data, int* res);

typedef struct inf{
	long int counter;
	int a;
	int b;
	int c;
} Inf; // a = inf b c

void initInf(Inf* data, int a, int b, int c);

Contrainte computeInf(Inf* data);

void updateInf(Inf* data, int* res);

typedef struct sup{
	long int counter;
	int a;
	int b;
	int c;
} Sup; // a = sup b c

void initSup(Sup* data, int a, int b, int c);

Contrainte computeSup(Sup* data);

void updateSup(Sup* data, int* res);

typedef struct minus{
	int a;
	int b;
	int c;
} Minus; // a = b - c

void initMinus(Minus* data, int a, int b, int c);

Contrainte computeMinus(Minus* data);

void updateMinus(Minus* data, int* res);

typedef struct sampl{
	int a;
	int b;
	int c;
	int* pile;
	int registre;
	int n;
} Sampl; //a = b$n on c

void initSampl(Sampl* data, int a, int b, int c, int n);

Contrainte computeSampl(Sampl* data);

void updateSampl(Sampl* data, int* res);

void closeSampl(Sampl* data);

int main(int argc, char** argv){
	char clockNameOfInt[][35] = {"Model0_0_8_9_startEvaluation", "Model0_0_8_9_finishEvaluation", "VarDecl0_0_0_9_startEvaluation", "VarDecl0_0_0_9_finishEvaluation", "VarDecl1_0_1_9_startEvaluation", "VarDecl1_0_1_9_finishEvaluation", "Assignment2_0_2_9_startEvaluation", "Assignment2_0_2_9_finishEvaluation", "If3_0_7_1_startEvaluation", "If3_0_7_1_finishEvaluation", "If3_0_7_1_evalCond", "If3_0_7_1_condTrue", "If3_0_7_1_condFalse", "Bloc3_6_5_1_startEvaluation", "Bloc3_6_5_1_finishEvaluation", "Assignment4_4_4_9_startEvaluation", "Assignment4_4_4_9_finishEvaluation", "Bloc5_5_7_1_startEvaluation", "Bloc5_5_7_1_finishEvaluation", "Assignment6_4_6_9_startEvaluation", "Assignment6_4_6_9_finishEvaluation", "Assignment8_0_8_9_startEvaluation", "Assignment8_0_8_9_finishEvaluation", "tmp_If3_0_7_1_xor", "tmp_If3_0_7_1_endThenOrElse"};
	void (*rwrPointerOfInt[35])()  = {NULL, NULL, VarDecl0_0_0_9_evaluate, NULL, VarDecl1_0_1_9_evaluate, NULL, Assignment2_0_2_9_evaluate, NULL, NULL, NULL, If3_0_7_1_evalCond, NULL, NULL, NULL, NULL, Assignment4_4_4_9_evaluate, NULL, NULL, NULL, Assignment6_4_6_9_evaluate, NULL, Assignment8_0_8_9_evaluate, NULL, NULL, NULL};
	int isBaseClock[] = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1};
	int counterTicks[N] = {0};
	int timeLastTick[N] = {0};

	Prec4 relPrec4Model0_0_8_9_startEvaluationModel0_0_8_9_finishEvaluation01;
	initPrec4(&relPrec4Model0_0_8_9_startEvaluationModel0_0_8_9_finishEvaluation01, 0, 1, 0, 1);

	Subcl relSubclModel0_0_8_9_startEvaluationVarDecl0_0_0_9_startEvaluation;
	initSubcl(&relSubclModel0_0_8_9_startEvaluationVarDecl0_0_0_9_startEvaluation, 0, 2);

	Subcl relSubclVarDecl0_0_0_9_startEvaluationModel0_0_8_9_startEvaluation;
	initSubcl(&relSubclVarDecl0_0_0_9_startEvaluationModel0_0_8_9_startEvaluation, 2, 0);

	Subcl relSubclModel0_0_8_9_finishEvaluationAssignment8_0_8_9_finishEvaluation;
	initSubcl(&relSubclModel0_0_8_9_finishEvaluationAssignment8_0_8_9_finishEvaluation, 1, 22);

	Subcl relSubclAssignment8_0_8_9_finishEvaluationModel0_0_8_9_finishEvaluation;
	initSubcl(&relSubclAssignment8_0_8_9_finishEvaluationModel0_0_8_9_finishEvaluation, 22, 1);

	Prec2 relPrec2VarDecl0_0_0_9_startEvaluationVarDecl0_0_0_9_finishEvaluation;
	initPrec2(&relPrec2VarDecl0_0_0_9_startEvaluationVarDecl0_0_0_9_finishEvaluation, 2, 3);

	Prec2 relPrec2VarDecl0_0_0_9_finishEvaluationVarDecl1_0_1_9_startEvaluation;
	initPrec2(&relPrec2VarDecl0_0_0_9_finishEvaluationVarDecl1_0_1_9_startEvaluation, 3, 4);

	Prec2 relPrec2VarDecl1_0_1_9_startEvaluationVarDecl1_0_1_9_finishEvaluation;
	initPrec2(&relPrec2VarDecl1_0_1_9_startEvaluationVarDecl1_0_1_9_finishEvaluation, 4, 5);

	Prec2 relPrec2VarDecl1_0_1_9_finishEvaluationAssignment2_0_2_9_startEvaluation;
	initPrec2(&relPrec2VarDecl1_0_1_9_finishEvaluationAssignment2_0_2_9_startEvaluation, 5, 6);

	Prec2 relPrec2Assignment2_0_2_9_startEvaluationAssignment2_0_2_9_finishEvaluation;
	initPrec2(&relPrec2Assignment2_0_2_9_startEvaluationAssignment2_0_2_9_finishEvaluation, 6, 7);

	Prec2 relPrec2Assignment2_0_2_9_finishEvaluationIf3_0_7_1_startEvaluation;
	initPrec2(&relPrec2Assignment2_0_2_9_finishEvaluationIf3_0_7_1_startEvaluation, 7, 8);

	Prec2 relPrec2If3_0_7_1_startEvaluationIf3_0_7_1_finishEvaluation;
	initPrec2(&relPrec2If3_0_7_1_startEvaluationIf3_0_7_1_finishEvaluation, 8, 9);

	Subcl relSubclIf3_0_7_1_startEvaluationIf3_0_7_1_evalCond;
	initSubcl(&relSubclIf3_0_7_1_startEvaluationIf3_0_7_1_evalCond, 8, 10);

	Subcl relSubclIf3_0_7_1_evalCondIf3_0_7_1_startEvaluation;
	initSubcl(&relSubclIf3_0_7_1_evalCondIf3_0_7_1_startEvaluation, 10, 8);

	Prec2 relPrec2If3_0_7_1_finishEvaluationAssignment8_0_8_9_startEvaluation;
	initPrec2(&relPrec2If3_0_7_1_finishEvaluationAssignment8_0_8_9_startEvaluation, 9, 21);

	Prec2 relPrec2tmp_If3_0_7_1_endThenOrElseIf3_0_7_1_finishEvaluation;
	initPrec2(&relPrec2tmp_If3_0_7_1_endThenOrElseIf3_0_7_1_finishEvaluation, 24, 9);

	Prec2 relPrec2If3_0_7_1_evalCondtmp_If3_0_7_1_xor;
	initPrec2(&relPrec2If3_0_7_1_evalCondtmp_If3_0_7_1_xor, 10, 23);

	Exclu relExcluIf3_0_7_1_condTrueIf3_0_7_1_condFalse;
	initExclu(&relExcluIf3_0_7_1_condTrueIf3_0_7_1_condFalse, 11, 12);

	Subcl relSubclIf3_0_7_1_condTrueBloc3_6_5_1_startEvaluation;
	initSubcl(&relSubclIf3_0_7_1_condTrueBloc3_6_5_1_startEvaluation, 11, 13);

	Subcl relSubclBloc3_6_5_1_startEvaluationIf3_0_7_1_condTrue;
	initSubcl(&relSubclBloc3_6_5_1_startEvaluationIf3_0_7_1_condTrue, 13, 11);

	Subcl relSubclIf3_0_7_1_condFalseBloc5_5_7_1_startEvaluation;
	initSubcl(&relSubclIf3_0_7_1_condFalseBloc5_5_7_1_startEvaluation, 12, 17);

	Subcl relSubclBloc5_5_7_1_startEvaluationIf3_0_7_1_condFalse;
	initSubcl(&relSubclBloc5_5_7_1_startEvaluationIf3_0_7_1_condFalse, 17, 12);

	Prec4 relPrec4Bloc3_6_5_1_startEvaluationBloc3_6_5_1_finishEvaluation01;
	initPrec4(&relPrec4Bloc3_6_5_1_startEvaluationBloc3_6_5_1_finishEvaluation01, 13, 14, 0, 1);

	Subcl relSubclBloc3_6_5_1_startEvaluationAssignment4_4_4_9_startEvaluation;
	initSubcl(&relSubclBloc3_6_5_1_startEvaluationAssignment4_4_4_9_startEvaluation, 13, 15);

	Subcl relSubclAssignment4_4_4_9_startEvaluationBloc3_6_5_1_startEvaluation;
	initSubcl(&relSubclAssignment4_4_4_9_startEvaluationBloc3_6_5_1_startEvaluation, 15, 13);

	Subcl relSubclBloc3_6_5_1_finishEvaluationAssignment4_4_4_9_finishEvaluation;
	initSubcl(&relSubclBloc3_6_5_1_finishEvaluationAssignment4_4_4_9_finishEvaluation, 14, 16);

	Subcl relSubclAssignment4_4_4_9_finishEvaluationBloc3_6_5_1_finishEvaluation;
	initSubcl(&relSubclAssignment4_4_4_9_finishEvaluationBloc3_6_5_1_finishEvaluation, 16, 14);

	Prec2 relPrec2Assignment4_4_4_9_startEvaluationAssignment4_4_4_9_finishEvaluation;
	initPrec2(&relPrec2Assignment4_4_4_9_startEvaluationAssignment4_4_4_9_finishEvaluation, 15, 16);

	Prec4 relPrec4Bloc5_5_7_1_startEvaluationBloc5_5_7_1_finishEvaluation01;
	initPrec4(&relPrec4Bloc5_5_7_1_startEvaluationBloc5_5_7_1_finishEvaluation01, 17, 18, 0, 1);

	Subcl relSubclBloc5_5_7_1_startEvaluationAssignment6_4_6_9_startEvaluation;
	initSubcl(&relSubclBloc5_5_7_1_startEvaluationAssignment6_4_6_9_startEvaluation, 17, 19);

	Subcl relSubclAssignment6_4_6_9_startEvaluationBloc5_5_7_1_startEvaluation;
	initSubcl(&relSubclAssignment6_4_6_9_startEvaluationBloc5_5_7_1_startEvaluation, 19, 17);

	Subcl relSubclBloc5_5_7_1_finishEvaluationAssignment6_4_6_9_finishEvaluation;
	initSubcl(&relSubclBloc5_5_7_1_finishEvaluationAssignment6_4_6_9_finishEvaluation, 18, 20);

	Subcl relSubclAssignment6_4_6_9_finishEvaluationBloc5_5_7_1_finishEvaluation;
	initSubcl(&relSubclAssignment6_4_6_9_finishEvaluationBloc5_5_7_1_finishEvaluation, 20, 18);

	Prec2 relPrec2Assignment6_4_6_9_startEvaluationAssignment6_4_6_9_finishEvaluation;
	initPrec2(&relPrec2Assignment6_4_6_9_startEvaluationAssignment6_4_6_9_finishEvaluation, 19, 20);

	Prec2 relPrec2Assignment8_0_8_9_startEvaluationAssignment8_0_8_9_finishEvaluation;
	initPrec2(&relPrec2Assignment8_0_8_9_startEvaluationAssignment8_0_8_9_finishEvaluation, 21, 22);

	Uni0n defUni0ntmp_If3_0_7_1_xorIf3_0_7_1_condTrueIf3_0_7_1_condFalse;
	initUni0n(&defUni0ntmp_If3_0_7_1_xorIf3_0_7_1_condTrueIf3_0_7_1_condFalse, 23, 11, 12);

	Uni0n defUni0ntmp_If3_0_7_1_endThenOrElseBloc3_6_5_1_finishEvaluationBloc5_5_7_1_finishEvaluation;
	initUni0n(&defUni0ntmp_If3_0_7_1_endThenOrElseBloc3_6_5_1_finishEvaluationBloc5_5_7_1_finishEvaluation, 24, 14, 18);

	bool retFromRwr = false;


	for(int i = 0; i < NUMSTEP; i++){
		ListeC* in = newListC();

		Contrainte auxRel1;

		auxRel1 = computePrec2(&relPrec2VarDecl1_0_1_9_startEvaluationVarDecl1_0_1_9_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclAssignment4_4_4_9_startEvaluationBloc3_6_5_1_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2If3_0_7_1_finishEvaluationAssignment8_0_8_9_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2Assignment6_4_6_9_startEvaluationAssignment6_4_6_9_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2If3_0_7_1_startEvaluationIf3_0_7_1_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec4(&relPrec4Bloc5_5_7_1_startEvaluationBloc5_5_7_1_finishEvaluation01);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclIf3_0_7_1_condTrueBloc3_6_5_1_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclAssignment6_4_6_9_startEvaluationBloc5_5_7_1_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2If3_0_7_1_evalCondtmp_If3_0_7_1_xor);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclBloc5_5_7_1_finishEvaluationAssignment6_4_6_9_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclAssignment6_4_6_9_finishEvaluationBloc5_5_7_1_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclVarDecl0_0_0_9_startEvaluationModel0_0_8_9_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclAssignment4_4_4_9_finishEvaluationBloc3_6_5_1_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclIf3_0_7_1_condFalseBloc5_5_7_1_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclIf3_0_7_1_evalCondIf3_0_7_1_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclAssignment8_0_8_9_finishEvaluationModel0_0_8_9_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeExclu(&relExcluIf3_0_7_1_condTrueIf3_0_7_1_condFalse);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2Assignment4_4_4_9_startEvaluationAssignment4_4_4_9_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec4(&relPrec4Model0_0_8_9_startEvaluationModel0_0_8_9_finishEvaluation01);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2tmp_If3_0_7_1_endThenOrElseIf3_0_7_1_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclBloc3_6_5_1_startEvaluationAssignment4_4_4_9_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclModel0_0_8_9_startEvaluationVarDecl0_0_0_9_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2Assignment2_0_2_9_startEvaluationAssignment2_0_2_9_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2Assignment2_0_2_9_finishEvaluationIf3_0_7_1_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec4(&relPrec4Bloc3_6_5_1_startEvaluationBloc3_6_5_1_finishEvaluation01);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclBloc3_6_5_1_startEvaluationIf3_0_7_1_condTrue);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2VarDecl0_0_0_9_startEvaluationVarDecl0_0_0_9_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclIf3_0_7_1_startEvaluationIf3_0_7_1_evalCond);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclModel0_0_8_9_finishEvaluationAssignment8_0_8_9_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclBloc5_5_7_1_startEvaluationIf3_0_7_1_condFalse);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclBloc5_5_7_1_startEvaluationAssignment6_4_6_9_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2Assignment8_0_8_9_startEvaluationAssignment8_0_8_9_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2VarDecl1_0_1_9_finishEvaluationAssignment2_0_2_9_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeSubcl(&relSubclBloc3_6_5_1_finishEvaluationAssignment4_4_4_9_finishEvaluation);
		addC(in, auxRel1);

		auxRel1 = computePrec2(&relPrec2VarDecl0_0_0_9_finishEvaluationVarDecl1_0_1_9_startEvaluation);
		addC(in, auxRel1);

		auxRel1 = computeUni0n(&defUni0ntmp_If3_0_7_1_xorIf3_0_7_1_condTrueIf3_0_7_1_condFalse);
		addC(in, auxRel1);

		auxRel1 = computeUni0n(&defUni0ntmp_If3_0_7_1_endThenOrElseBloc3_6_5_1_finishEvaluationBloc5_5_7_1_finishEvaluation);
		addC(in, auxRel1);


		//data dependent control test
		Not tmpNot;
		unsigned int sizeofClockTab = sizeof(clockNameOfInt)/sizeof(clockNameOfInt[0]);
		int evalCondi = 0;
		for(; evalCondi < sizeofClockTab; evalCondi++){
			if (strcmp(clockNameOfInt[evalCondi], "If3_0_7_1_evalCond")==0){
				break;
			}
		}
		
		int jdi = 0;
		for(; jdi < sizeofClockTab; jdi++){
			if (strcmp(clockNameOfInt[jdi], "If3_0_7_1_condTrue")==0){
				break;
			}
		}
		if(retFromRwr){
			initNot(&tmpNot, jdi);
			auxRel1 = computeNot(&tmpNot);
			addC(in, auxRel1);
		}

		int goodRes[N];
		// printf("\nstart core\n");
		core(in, goodRes);
		// printf("\nend core\n");
#ifdef DEBUG_BASE

		printf("Final Decision Result at step %d.\n", i);
#endif
		for(int k = 0; k < N; k++){
			if(goodRes[k] > 0){
				counterTicks[k] += 1;
				timeLastTick[k] = 0;
				// printf("\nstart calling rewriting rules %i\n",k);
				if(rwrPointerOfInt[k] != NULL){
					if(k == evalCondi){
						//printf("\ncheck k\n");
						retFromRwr = ((bool (*)()) rwrPointerOfInt[k])();
					}else{
						rwrPointerOfInt[k]();
					}
				}
				// printf("\nend calling rewriting rules %i\n", k);
#ifdef PRINT_SCHEDULE
				printf("%s ", clockNameOfInt[k]);
#endif
			}
			else{
				timeLastTick[k] += 1;			}
		}
		// printf("\nend for goodRes loop !\n");
#ifdef PRINT_SCHEDULE
		printf("\n\n");
#endif

		updatePrec2(&relPrec2VarDecl1_0_1_9_startEvaluationVarDecl1_0_1_9_finishEvaluation, goodRes);

		updateSubcl(&relSubclAssignment4_4_4_9_startEvaluationBloc3_6_5_1_startEvaluation, goodRes);

		updatePrec2(&relPrec2If3_0_7_1_finishEvaluationAssignment8_0_8_9_startEvaluation, goodRes);

		updatePrec2(&relPrec2Assignment6_4_6_9_startEvaluationAssignment6_4_6_9_finishEvaluation, goodRes);

		updatePrec2(&relPrec2If3_0_7_1_startEvaluationIf3_0_7_1_finishEvaluation, goodRes);

		updatePrec4(&relPrec4Bloc5_5_7_1_startEvaluationBloc5_5_7_1_finishEvaluation01, goodRes);

		updateSubcl(&relSubclIf3_0_7_1_condTrueBloc3_6_5_1_startEvaluation, goodRes);

		updateSubcl(&relSubclAssignment6_4_6_9_startEvaluationBloc5_5_7_1_startEvaluation, goodRes);

		updatePrec2(&relPrec2If3_0_7_1_evalCondtmp_If3_0_7_1_xor, goodRes);

		updateSubcl(&relSubclBloc5_5_7_1_finishEvaluationAssignment6_4_6_9_finishEvaluation, goodRes);

		updateSubcl(&relSubclAssignment6_4_6_9_finishEvaluationBloc5_5_7_1_finishEvaluation, goodRes);

		updateSubcl(&relSubclVarDecl0_0_0_9_startEvaluationModel0_0_8_9_startEvaluation, goodRes);

		updateSubcl(&relSubclAssignment4_4_4_9_finishEvaluationBloc3_6_5_1_finishEvaluation, goodRes);

		updateSubcl(&relSubclIf3_0_7_1_condFalseBloc5_5_7_1_startEvaluation, goodRes);

		updateSubcl(&relSubclIf3_0_7_1_evalCondIf3_0_7_1_startEvaluation, goodRes);

		updateSubcl(&relSubclAssignment8_0_8_9_finishEvaluationModel0_0_8_9_finishEvaluation, goodRes);

		updateExclu(&relExcluIf3_0_7_1_condTrueIf3_0_7_1_condFalse, goodRes);

		updatePrec2(&relPrec2Assignment4_4_4_9_startEvaluationAssignment4_4_4_9_finishEvaluation, goodRes);

		updatePrec4(&relPrec4Model0_0_8_9_startEvaluationModel0_0_8_9_finishEvaluation01, goodRes);

		updatePrec2(&relPrec2tmp_If3_0_7_1_endThenOrElseIf3_0_7_1_finishEvaluation, goodRes);

		updateSubcl(&relSubclBloc3_6_5_1_startEvaluationAssignment4_4_4_9_startEvaluation, goodRes);

		updateSubcl(&relSubclModel0_0_8_9_startEvaluationVarDecl0_0_0_9_startEvaluation, goodRes);

		updatePrec2(&relPrec2Assignment2_0_2_9_startEvaluationAssignment2_0_2_9_finishEvaluation, goodRes);

		updatePrec2(&relPrec2Assignment2_0_2_9_finishEvaluationIf3_0_7_1_startEvaluation, goodRes);

		updatePrec4(&relPrec4Bloc3_6_5_1_startEvaluationBloc3_6_5_1_finishEvaluation01, goodRes);

		updateSubcl(&relSubclBloc3_6_5_1_startEvaluationIf3_0_7_1_condTrue, goodRes);

		updatePrec2(&relPrec2VarDecl0_0_0_9_startEvaluationVarDecl0_0_0_9_finishEvaluation, goodRes);

		updateSubcl(&relSubclIf3_0_7_1_startEvaluationIf3_0_7_1_evalCond, goodRes);

		updateSubcl(&relSubclModel0_0_8_9_finishEvaluationAssignment8_0_8_9_finishEvaluation, goodRes);

		updateSubcl(&relSubclBloc5_5_7_1_startEvaluationIf3_0_7_1_condFalse, goodRes);

		updateSubcl(&relSubclBloc5_5_7_1_startEvaluationAssignment6_4_6_9_startEvaluation, goodRes);

		updatePrec2(&relPrec2Assignment8_0_8_9_startEvaluationAssignment8_0_8_9_finishEvaluation, goodRes);

		updatePrec2(&relPrec2VarDecl1_0_1_9_finishEvaluationAssignment2_0_2_9_startEvaluation, goodRes);

		updateSubcl(&relSubclBloc3_6_5_1_finishEvaluationAssignment4_4_4_9_finishEvaluation, goodRes);

		updatePrec2(&relPrec2VarDecl0_0_0_9_finishEvaluationVarDecl1_0_1_9_startEvaluation, goodRes);

	updateUni0n(&defUni0ntmp_If3_0_7_1_xorIf3_0_7_1_condTrueIf3_0_7_1_condFalse, goodRes);

	updateUni0n(&defUni0ntmp_If3_0_7_1_endThenOrElseBloc3_6_5_1_finishEvaluationBloc5_5_7_1_finishEvaluation, goodRes);

	}

#ifdef NORMAL
	printf("Name		Number of ticks	TimeLastTick\n");
	for(int k = 0; k < N; k++){
		if(isBaseClock[k]){
			printf("%s\t\t%d\t\t%d\n", clockNameOfInt[k], counterTicks[k], timeLastTick[k]);
		}
	}
#endif

	return 0;
} // fin main 

void initCaus2(Caus2* data, int a, int b){
	data->a = a;
	data->b = b;
	data->counter = 0;
}

Contrainte computeCaus2(Caus2* data){
	Contrainte aux;
	if(data->counter > 0){
		aux.type = EQUI;
		aux.c0 = data->a;
		aux.c1 = data->a;
	}
	else if(data->counter == 0){
		aux.type = IMPLI;
		aux.c0 = data->b;
		aux.c1 = data->a;
	}
	return aux;
}

void updateCaus2(Caus2* data, int* res){
	if(res[data->a]> 0){
		data->counter += 1;
	}
	if(res[data->b]> 0){
		data->counter -= 1;
	}
	if(data->counter < 0){
		fprintf(stderr, "Broken constraint in %d <= %d. Aborting.\n", data->a, data-> b);
		exit(1);
	}
}
void initPrec2(Prec2* data, int a, int b){
	data->a = a;
	data->b = b;
	data->counter = 0;
}

Contrainte computePrec2(Prec2* data){
	Contrainte aux;
	if(data->counter > 0){
		aux.type = EQUI;
		aux.c0 = data->a;
		aux.c1 = data->a;
	}
	else if(data->counter == 0){
		aux.type = NOT;
		aux.c0 = data->b;
	}
	return aux;
}

void initNot(Not* data, int a){
	data->a = a;
}

Contrainte computeNot(Not* data){
	Contrainte aux;
	aux.type = NOT;
	aux.c0 = data->a;
	return aux;
}

void updatePrec2(Prec2* data, int* res){
	if(res[data->a] > 0){
		data->counter += 1;
	}
	if(res[data->b] > 0){
		data->counter -= 1;
	}
	if(data->counter < 0){
		fprintf(stderr, "Broken constraint in %d < %d. Aborting.\n", data->a, data-> b);
		exit(1);
	}
}
void initCaus4(Caus4* data, int a, int b, int init, int max){
	data->a = a;
	data->b = b;
	data->counter = init;
	data->max = max;
}

Contrainte computeCaus4(Caus4* data){
	Contrainte aux;
	if(data->counter >= data->max){
		aux.type = IMPLI;
		aux.c0 = data->a;
		aux.c1 = data->b;
	}
	else if(data->counter > 0){
		aux.type = EQUI;
		aux.c0 = data->a;
		aux.c1 = data->a;
	}
	else if(data->counter == 0){
		aux.type = IMPLI;
		aux.c0 = data->b;
		aux.c1 = data->a;
	}
	return aux;
}

void updateCaus4(Caus4* data, int* res){
	if(res[data->a] > 0){
		data->counter += 1;
	}
	if(res[data->b] > 0){
		data->counter -= 1;
	}
	if(data->counter < 0 || data->counter > data->max){
		fprintf(stderr, "Broken constraint in %d < %d. Aborting.\n", data->a, data-> b);
		exit(1);
	}
}
void initPrec4(Prec4* data, int a, int b, int init, int max){
	data->a = a;
	data->b = b;
	data->counter = init;
	data->max = max;
}

Contrainte computePrec4(Prec4* data){
	Contrainte aux;
	if(data->counter >= data->max){
		aux.type = NOT;
		aux.c0 = data->a;
	}
	else if(data->counter > 0){
		aux.type = EQUI;
		aux.c0 = data->a;
		aux.c1 = data->a;
	}
	else if(data->counter == 0){
		aux.type = NOT;
		aux.c0 = data->b;
	}
	return aux;
}

void updatePrec4(Prec4* data, int* res){
	if(res[data->a] > 0){
		data->counter += 1;
	}
	if(res[data->b] > 0){
		data->counter -= 1;
	}
	if(data->counter < 0 || data->counter > data->max){
		fprintf(stderr, "Broken constraint in %d < %d. Aborting.\n", data->a, data-> b);
		exit(1);
	}
}
void initExclu(Exclu* data, int a, int b){
	data->a = a;
	data->b = b;
}

Contrainte computeExclu(Exclu* data){
	Contrainte aux;
	aux.type = EXCLU;
	aux.c0 = data->a;
	aux.c1 = data->b;
	return aux;
}

void updateExclu(Exclu* data, int* res){
	if(res[data->a] > 0 && res[data->b] > 0){
		fprintf(stderr, "Broken constraint in %d # %d. Aborting.\n", data->a, data->b);
		exit(1);
	}
}
void initSubcl(Subcl* data, int a, int b){
	data->a = a;
	data->b = b;
}

Contrainte computeSubcl(Subcl* data){
	Contrainte aux;
	aux.type = IMPLI;
	aux.c0 = data->a;
	aux.c1 = data->b;
	return aux;
}

void updateSubcl(Subcl* data, int* res){
	if(res[data->a] > 0 && res[data->b] < 0){
		fprintf(stderr, "Broken constraint in %d <- %d. Aborting.\n", data->a, data->b);
		exit(1);
	}
}
void initUni0n(Uni0n* data, int a, int b, int c){
	data->a = a;
	data->b = b;
	data->c = c;
}

Contrainte computeUni0n(Uni0n* data){
	Contrainte aux;
	aux.type = UNION;
	aux.c0 = data->a;
	aux.c1 = data->b;
	aux.c2 = data->c;
	return aux;
}

void updateUni0n(Uni0n* data, int* res){
	if((res[data->a] > 0) != (res[data->b] > 0 || res[data->c] > 0)){
		fprintf(stderr, "Broken constraint in %d = %d + %d. Aborting.\n", data->a, data->b, data->c);
		exit(1);
	}
}
void initInter(Inter* data, int a, int b, int c){
	data->a = a;
	data->b = b;
	data->c = c;
}

Contrainte computeInter(Inter* data){
	Contrainte aux;
	aux.type = INTER;
	aux.c0 = data->a;
	aux.c1 = data->b;
	aux.c2 = data->c;
	return aux;
}

void updateInter(Inter* data, int* res){
	if((res[data->a] > 0) != (res[data->b] > 0 && res[data->c] > 0)){
		fprintf(stderr, "Broken constraint in %d = %d * %d. Aborting.\n", data->a, data->b, data->c);
		exit(1);
	}
}
void initInf(Inf* data, int a, int b, int c){
	data->a = a;
	data->b = b;
	data->c = c;
	data->counter = 0;
}

Contrainte computeInf(Inf* data){
	Contrainte aux;
	if(data->counter == 0){
		aux.type = UNION;
		aux.c0 = data->a;
		aux.c1 = data->b;
		aux.c2 = data->c;
	}
	else if(data->counter > 0){
		aux.type = EQUI;
		aux.c0 = data->a;
		aux.c1 = data->b;
	}
	else if(data->counter < 0){
		aux.type = EQUI;
		aux.c0 = data->a;
		aux.c1 = data->c;
	}
	return aux;
}

void updateInf(Inf* data, int* res){
	if(((data->counter == 0) && ((res[data->a] > 0) != ((res[data->b] > 0) || (res[data->c] > 0))))||((data->counter > 0) && ((res[data->a] > 0) != (res[data->b] > 0)))||((data->counter < 0) && ((res[data->a] > 0) != (res[data->c] > 0)))){
		fprintf(stderr, "Broken constraint in %d = inf %d %d. Aborting.\n", data->a, data->b, data->c);
		exit(1);
	}
	if(res[data->b] > 0){
		data->counter += 1;
	}
	if(res[data->c] > 0){
		data->counter -= 1;
	}
}

void initSup(Sup* data, int a, int b, int c){
	data->a = a;
	data->b = b;
	data->c = c;
	data->counter = 0;
}

Contrainte computeSup(Sup* data){
	Contrainte aux;
	if(data->counter == 0){
		aux.type = INTER;
		aux.c0 = data->a;
		aux.c1 = data->b;
		aux.c2 = data->c;
	}
	else if(data->counter > 0){
		aux.type = EQUI;
		aux.c0 = data->a;
		aux.c1 = data->c;
	}
	else if(data->counter < 0){
		aux.type = EQUI;
		aux.c0 = data->a;
		aux.c1 = data->b;
	}
	return aux;
}

void updateSup(Sup* data, int* res){
	if(((data->counter == 0) && ((res[data->a] > 0) != ((res[data->b] > 0) && (res[data->c] > 0))))||((data->counter > 0) && ((res[data->a] > 0) != (res[data->c] > 0)))||((data->counter < 0) && ((res[data->a] > 0) != (res[data->b] > 0)))){
		fprintf(stderr, "Broken constraint in %d = sup %d %d. Aborting.\n", data->a, data->b, data->c);
		exit(1);
	}
	if(res[data->b] > 0){
		data->counter += 1;
	}
	if(res[data->c] > 0){
		data->counter -= 1;
	}
}

void initMinus(Minus* data, int a, int b, int c){
	data->a = a;
	data->b = b;
	data->c = c;
}

Contrainte computeMinus(Minus* data){
	Contrainte aux;
	aux.type = MINUS;
	aux.c0 = data->a;
	aux.c1 = data->b;
	aux.c2 = data->c;
	return aux;
}

void updateMinus(Minus* data, int* res){
	if((res[data->a] > 0) != ((res[data->b] > 0) && (res[data->c] < 0))){
		fprintf(stderr, "Broken constraint in %d = %d - %d. Aborting.\n", data->a, data->b, data->c);
		exit(1);
	}
}

void initSampl(Sampl* data, int a, int b, int c, int n){
	data->a = a;
	data->b = b;
	data->c = c;
	data->registre = 0;
	data->n = n;
	data->pile = malloc(n*sizeof(int));
	for(int i = 0; i < n; i++){
		data->pile[i] = 0;
	}
}

Contrainte computeSampl(Sampl* data){
	Contrainte aux;
	aux.type = EQUI;
	if(data->pile[0] > 0){
		aux.c0 = data->c;
		aux.c1 = data->a;
	}
	else{
		aux.type = NOT;
		aux.c1 = data->a;
	}
	return aux;
}

void updateSampl(Sampl* data, int* res){
	if((res[data->a] > 0) != ((res[data->c] > 0) && (data->pile[0] > 0))){
		fprintf(stderr, "Broken constraint in %d = %d$%d on %d. Aborting.\n", data->a, data->b, data->n, data->c);
		exit(1);
	}
	if(res[data->c] > 0){
		for(int i = 0; i < data->n-2; i++){
			data->pile[i] = data->pile[i+1];
		}
		data->pile[data->n-1] = 0;
	}
	if(res[data->b] > 0){
		data->pile[data->n - 1] = 1;
	}
}

void closeSampl(Sampl* data){
	free(data->pile);
}
