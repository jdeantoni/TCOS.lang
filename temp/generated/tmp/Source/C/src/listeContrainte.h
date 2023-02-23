#ifndef LISTECONTRAINTEH
#define LISTECONTRAINTEH

#include <stdio.h>
#include <stdlib.h>

typedef enum Type {
	EQUI, IMPLI, UNION, INTER, MINUS, EXCLU, NOT
} Type;

typedef struct Contrainte{
	Type type;
	int c0;
	int c1;
	int c2;
} Contrainte;

typedef struct ElementC{
	Contrainte contrainte;
	struct ElementC *next;
} ElementC;

typedef struct ListeC{
	int length;
	ElementC* first;
} ListeC;

void printContrainte(Contrainte contrainte);

ListeC *newListC();

void addC(ListeC* liste, Contrainte contrainte);

void removeC(ListeC* liste);

Contrainte firstC(ListeC* liste);

void printC(ListeC* liste);

void freeC(ListeC* liste);

#endif