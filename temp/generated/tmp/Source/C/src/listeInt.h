#ifndef LISTEINTH
#define LISTEINTH

#include <stdio.h>
#include <stdlib.h>

typedef struct ElementInt{
	int value;
	struct ElementInt *next;
} ElementInt;

typedef struct ListeInt{
	int length;
	ElementInt* first;
} ListeInt;

ListeInt *newListInt();

void addInt(ListeInt* liste, int value);

void removeInt(ListeInt* liste);

int firstInt(ListeInt* liste);

void freeInt(ListeInt* liste);

#endif