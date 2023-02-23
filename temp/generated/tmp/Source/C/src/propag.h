#ifndef PROPAGH
#define PROPAGH

#include <stdio.h>
#include <stdlib.h>

#include "unionFind.h"
#include "listeInt.h"
#include "param.h"
#include "graphe.h"

extern unsigned short base[NEQUI][NEQUI];

extern int numVoisin[NEQUI];

typedef struct cTriple{
	int active;
	int triggered;
	int trigger0;
	int i0;
	int j0;
	int trigger1;
	int i1;
	int j1;
	int trigger2;
	int i2;
	int j2;
} CTriple;

void decision(int* res, int numClock, ListeC* liste);
	
void simpleNotPropage(int sommet, int* res, int numClock, CTriple* compCons, int numCons, ListeInt** triggerVertex, int currentNum);

int testYesPropage(int sommet, int* res, int numClock, CTriple* compCons, int numCons, ListeInt** triggerVertex, int currentNum);

void unYesPropage(int sommet, int* res, int numClock, CTriple* compCons, int numCons, ListeInt** triggerVertex, int currentNum);

void preForceNotPropage(int sommet, int* res, int numClock, CTriple* compCons, int numCons, ListeInt** triggerVertex, int currentNum);

void forcePropage(int sommet, int* res, int numClock, CTriple* compCons, int numCons, ListeInt** triggerVertex, int currentNum);

#endif
