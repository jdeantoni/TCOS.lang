#include "unionFind.h"

Clock0* unionFind(ListeC* liste, int numClock){
	
	Clock0* clocks = malloc(numClock * sizeof(Clock0));
	
	for(int i = 0; i < numClock; i++){
		clocks[i].parent = i;
		clocks[i].rank = 0;
	}
	
	Contrainte aux;
	
	while(liste->length > 0){
		aux = firstC(liste);
		if(aux.type != EQUI){
			fprintf(stderr, "Cannot deal with non equivalence constraints in Clock0.\n");
			exit(EXIT_FAILURE);
		}
		
		Union(clocks, aux.c0, aux.c1);
		
		removeC(liste);
	}
	
	return clocks;
}

void Union(Clock0* clocks, int c0, int c1){
	
	int racine0 = Find(clocks, c0);
	int racine1 = Find(clocks, c1);
	
	if(racine0 != racine1){
		
		int rank0 = clocks[racine0].rank;
		int rank1 = clocks[racine1].rank;
		
		if(rank0 < rank1){
			clocks[racine0].parent = racine1;
		}
		else{
			clocks[racine1].parent = racine0;
			if(rank0 == rank1){
				clocks[racine0].rank += 1;
			}
		}
	}
}

int Find(Clock0* clocks, int c){
	if(clocks[c].parent != c){
		clocks[c].parent = Find(clocks, clocks[c].parent);
	}
	return clocks[c].parent;
}

void printC0(Clock0* clocks, int numClock){
	printf("[");
	
	for(int i = 0; i < numClock; i++){
		printf("(%d)", clocks[i].parent);
	}
	printf("]\n");
}