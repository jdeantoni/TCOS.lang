#ifndef UNIONFINDH
#define UNIONFINDH

#include <stdio.h>
#include <stdlib.h>

#include "listeContrainte.h"

typedef struct clock0{
	int parent;
	int rank;
} Clock0;

Clock0* unionFind(ListeC* liste, int numClock);

void Union(Clock0* clocks, int c0, int c1);

int Find(Clock0* clocks, int c);

void printC0(Clock0* clocks, int numClock);

#endif