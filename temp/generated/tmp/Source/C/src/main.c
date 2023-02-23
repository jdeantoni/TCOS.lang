#include <stdio.h>
#include <stdlib.h>

#include "unionFind.h"
#include "listeContrainte.h"
#include "tarjan.h"
#include "propag.h"
#include "param.h"
#include "core.h"


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
	char clockNameOfInt[][8] = {"read", "control", "t1", "t2"};
	int isBaseClock[] = {1, 1, 1, 1};
	int counterTicks[N] = {0};
	int timeLastTick[N] = {0};

	Prec2 relPrec2readcontrol;
	initPrec2(&relPrec2readcontrol, 0, 1);

	Caus4 relCaus4t1read01;
	initCaus4(&relCaus4t1read01, 2, 0, 0, 1);

	Caus4 relCaus4t2control01;
	initCaus4(&relCaus4t2control01, 3, 1, 0, 1);

	for(int i = 0; i < NUMSTEP; i++){
		ListeC* in = newListC();

		Contrainte auxRel1;

		auxRel1 = computePrec2(&relPrec2readcontrol);
		addC(in, auxRel1);

		auxRel1 = computeCaus4(&relCaus4t2control01);
		addC(in, auxRel1);

		auxRel1 = computeCaus4(&relCaus4t1read01);
		addC(in, auxRel1);


		int goodRes[N];

		core(in, goodRes);
#ifdef DEBUG_BASE

		printf("Final Decision Result at step %d.\n", i);
#endif
		for(int k = 0; k < N; k++){
			if(goodRes[k] > 0){
				counterTicks[k] += 1;
				timeLastTick[k] = 0;
#ifdef PRINT_SCHEDULE
				printf("%s ", clockNameOfInt[k]);
#endif
			}
			else{
				timeLastTick[k] += 1;			}
		}
#ifdef PRINT_SCHEDULE
		printf("\n\n");
#endif

		updatePrec2(&relPrec2readcontrol, goodRes);

		updateCaus4(&relCaus4t2control01, goodRes);

		updateCaus4(&relCaus4t1read01, goodRes);

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
