#ifndef TARJANH
#define TARJANH

#include <stdio.h>
#include <stdlib.h>

#include "param.h"
#include "listeInt.h"
#include "graphe.h"

extern unsigned short base[NEQUI][NEQUI];

extern int numVoisin[NEQUI];

typedef struct dataTarjan{
	int num;
	int numAcces;
	int inPile;
} DataTarjan;

void tarjan(int* partition, int numClock);

void parcours(int sommet, int* partition, ListeInt* pile, DataTarjan* vertices, int* num, int numClock);

#endif
