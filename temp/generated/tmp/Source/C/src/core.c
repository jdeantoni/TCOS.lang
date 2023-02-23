#include "core.h"

void core(ListeC* in, int* goodRes){
	
	//Suppresion de tous les not sauf 1.
	
	Contrainte aux;
	Contrainte newEqui;
	
	int precNot = -1;
	int seenNot = 0;
	
	ListeC* inNot = newListC();
	
	while(in->length > 0){
		aux = firstC(in);
		if(aux.type == NOT){
			if(seenNot){
				newEqui.type = EQUI;
				newEqui.c0 = precNot;
				newEqui.c1 = aux.c0;
				addC(inNot, newEqui);
			}
			else{
				seenNot = 1;
				precNot = aux.c0;
				addC(inNot, aux);
			}
		}
		else{
			addC(inNot, aux);
		}
		removeC(in);
	}
	
	// Isolation et union find des équivalences	
	
	ListeC* equivalences = newListC();
	ListeC* others = newListC();
	
	while(inNot->length > 0){
		aux = firstC(inNot);
		if(aux.type == EQUI){
			addC(equivalences, aux);
		}
		else{
			addC(others, aux);
		}
		removeC(inNot);
	}
	
#ifdef DEBUG
	printC(in);
	printC(equivalences);
	printC(others);
#endif
	
	Clock0* noequi = unionFind(equivalences, N);
	
	freeC(equivalences);
	
#ifdef DEBUG
	printf("Résultat de l'union find des équivalences.\n");
	
	printC0(noequi, N);
#endif

	//Fin de l'équivalence
	
	//Normalisation des numéros de clock
	
	/*
	Dans cette partie je veux assigner un nouveau numéro à tous les représentants de clock
	*/
	
	int traduction0[N];
	
	for(int i = 0; i < N; i++){
		traduction0[i] = -1;
	}
	
	int numClock = 0;
	
	int currentParent;
	
	for(int i = 0; i < N; i++){
		currentParent = noequi[i].parent;
		if(traduction0[currentParent] == -1){
			traduction0[currentParent] = numClock;
			numClock++;
		}
		
		traduction0[i] = traduction0[currentParent];
	}
	
	free(noequi);
	
#ifdef DEBUG
	printf("Tableau normalisé des clocks.\n");
	printf("[");
	for(int i = 0; i < N; i++){
		printf("(%d)", traduction0[i]);
	}
	printf("]\n");
#endif
	
	// Fin de la normalisation 
	
	// Séparation des implications
	
	/* 
	Dans cette partie je mets à jour les contraintes et extrait les implications 
	*/	
	
	for(int i = 0; i < numClock; i++){
		numVoisin[i] = 0;
	}
	
	ListeC* normCons = newListC();
	
	
	ElementC* element= others->first;
	
	Contrainte new;
	
	
	int c0;
	int c1;
	int c2;
	
	while(element != NULL){
		aux = element->contrainte;
		
		c0 = traduction0[aux.c0];
		
		switch(aux.type){
		case EQUI:
			fprintf(stderr, "Equivalence is no more a valid contraint type");
			break;
		case IMPLI:
			c1 = traduction0[aux.c1];
			new.c0 = c0;
			new.c1 = c1;
			new.type = IMPLI;
			if(new.c0 != new.c1){
				add(new.c0, new.c1);
				addC(normCons, new);
			}
			break;
		case UNION:
			c1 = traduction0[aux.c1];
			c2 = traduction0[aux.c2];
			
			if(c0 == c1 && c1 == c2){
				
			}
			else if(c0 == c1){
				new.c0 = c2;
				new.c1 = c0;
				add(new.c2, new.c0);
				new.type = IMPLI;
				addC(normCons, new);
			}
			else if(c0 == c2){
				new.c0 = c1;
				new.c1 = c0;
				add(new.c1, new.c0);;
				new.type = IMPLI;
				addC(normCons, new);
			}
			else if(c1 == c2){
				new.c0 = c0;
				new.c1 = c1;
				new.type = IMPLI;
				addC(normCons, new);
				new.c0 = c1;
				new.c1 = c0;
				new.type = IMPLI;
				addC(normCons, new);
				add(new.c0, new.c1);
				add(new.c1, new.c0);
			}
			else{
				new.c0 = c0;
				new.c1 = c1;
				new.c2 = c2;
				new.type = UNION;
				addC(normCons, new);
				add(new.c1, new.c0);
				add(new.c2, new.c0);
			}
			break;
		case INTER:
			c1 = traduction0[aux.c1];
			c2 = traduction0[aux.c2];
			
			if(c0 == c1 && c1 == c2){
				
			}
			else if(c0 == c1){
				new.c0 = c0;
				new.c1 = c2;
				add(new.c0, new.c2);
				new.type = IMPLI;
				addC(normCons, new);
			}
			else if(c0 == c2){
				new.c0 = c0;
				new.c1 = c1;
				add(new.c0, new.c1);
				new.type = IMPLI;
				addC(normCons, new);
			}
			else if(c1 == c2){
				new.c0 = c0;
				new.c1 = c1;
				new.type = IMPLI;
				addC(normCons, new);
				new.c0 = c1;
				new.c1 = c0;
				new.type = IMPLI;
				addC(normCons, new);
				add(new.c0, new.c1);
				add(new.c1, new.c0);
			}
			else{
				new.c0 = c0;
				new.c1 = c1;
				new.c2 = c2;
				new.type = INTER;
				addC(normCons, new);
				add(new.c0, new.c1);
				add(new.c0, new.c2);				
			}
			break;
		case MINUS:
			c1 = traduction0[aux.c1];
			c2 = traduction0[aux.c2];
			
			if(c0 == c1 && c1 == c2){
				new.c0 = c0;
				new.type = NOT;
				addC(normCons, new);
			}
			else if(c0 == c1){
				new.c0 = c0;
				new.c1 = c2;
				new.type = EXCLU;
				addC(normCons, new);
			}
			else if(c0 == c2){
				new.c0 = c0;
				new.c1 = c1;
				new.type = EXCLU;
				addC(normCons, new);
			}
			else if(c1 == c2){
				new.c0 = c0;
				new.type = NOT;
				addC(normCons, new);
			}
			else{
				new.c0 = c0;
				new.c1 = c1;
				new.c2 = c2;
				new.type = MINUS;
				addC(normCons, new);
				add(new.c0, new.c1);
			}
			break;
		case EXCLU:
			c1 = traduction0[aux.c1];
			
			if(c0 == c1){
				new.c0 = c0;
				new.type = NOT;
				addC(normCons, new);
			}
			else{
				new.c0 = c0;
				new.c1 = c1;
				new.type = EXCLU;
				addC(normCons, new);
			}
			break;
		case NOT:
			new.c0 = c0;
			new.type = NOT;
			addC(normCons, new);
			break;
		}
		
		element = element->next;
	}
	
	
	freeC(others);
	
#ifdef DEBUG
	printf("Normalized contraints.\n");
	printC(normCons);
	
	printf("Tableau des implications.\n");
	
	for(int i = 0; i < numClock; i++){
		for(int j = 0; j < numClock; j++){
			printf("%d\t", base[i][j]);
		}
		printf("\n");
	}
#endif
	
	// Fin de la séparation des implications
	
	// Début de l'analyse des implications
	
	int* res = malloc(numClock * sizeof(int));
	
	tarjan(res, numClock);
	
#ifdef DEBUG
	printf("Partition tarjan.\n[");
	for(int i = 0; i < numClock; i++){
		printf("(%d)", res[i]);
	}
	printf("]\n");
#endif
	
	// Fin de l'analyse des implications
	
	// Normalisation des numéros de clock
	
	int* traduction1 = malloc(numClock * sizeof(int));
	
	int* auxTraduction1 = malloc(numClock * sizeof(int));
	
	for(int i = 0; i < numClock; i++){
		traduction1[i] = -1;
		auxTraduction1[i] = -1;
	}
	
	int numClock1 = 0;
	
	int currentSet;
	
	for(int i = 0; i < numClock; i++){
		currentSet = res[i];
		if(auxTraduction1[currentSet] < 0){
			auxTraduction1[currentSet] = numClock1;
			numClock1++;
		}
		
		traduction1[i] = auxTraduction1[currentSet];
	}
	
	free(auxTraduction1);
	free(res);
	
#ifdef DEBUG
	printf("Tarjan Normalisé.\n[");
	for(int i = 0; i < numClock; i++){
		printf("(%d)", traduction1[i]);
	}
	printf("]\n");
#endif
	
	// Fin de la normalisation
	
	// Deuxième mise à jour des contraintes.
	
	ListeC* compCons = newListC();
		
	element = normCons->first;
	
	for(int i = 0; i < 2*numClock1; i++){
		numVoisin[i] = 0;
	}
	
	while(element != NULL){
		aux = element->contrainte;
		
		c0 = traduction1[aux.c0];
		
		switch(aux.type){
		case EQUI:
			fprintf(stderr, "Equivalence is no more a valid contraint type");
			break;
		case IMPLI:
			c1 = traduction1[aux.c1];
			if(c0 != c1){
				add(c0, c1);
				add(c1 + numClock1, c0 + numClock1);
			}
			break;
		case UNION:
			c1 = traduction1[aux.c1];
			c2 = traduction1[aux.c2];
			
			if(c0 == c1 && c1 == c2){
				
			}
			else if(c0 == c1){
				add(c2, c0);
				add(c0 + numClock1, c2 + numClock1);
			}
			else if(c0 == c2){
				add(c1, c0);
				add(c0 + numClock1, c1 + numClock1);
			}
			else if(c1 == c2){
				add(c0, c1);
				add(c1, c0);
				add(c0 + numClock1, c1 + numClock1);
				add(c1 + numClock1, c0 + numClock1);
			}
			else{
				new.c0 = c0;
				new.c1 = c1;
				new.c2 = c2;
				new.type = UNION;
				addC(compCons, new);
				add(c1, c0);
				add(c2, c0);
				add(c0 + numClock1, c1 + numClock1);
				add(c0 + numClock1, c2 + numClock1);
			}
			break;
		case INTER:
			c1 = traduction1[aux.c1];
			c2 = traduction1[aux.c2];
			
			if(c0 == c1 && c1 == c2){
				
			}
			else if(c0 == c1){
				add(c0, c2);
				add(c2 + numClock1, c0 + numClock1);
			}
			else if(c0 == c2){
				add(c0, c1);
				add(c1 + numClock1, c0 + numClock1);;
			}
			else if(c1 == c2){
				add(c0, c1);
				add(c1, c0);
				add(c0 + numClock1, c1 + numClock1);
				add(c1 + numClock1, c0 + numClock1);
			}
			else{
				new.c0 = c0;
				new.c1 = c1;
				new.c2 = c2;
				new.type = INTER;
				addC(compCons, new);
				add(c0, c1);
				add(c0, c2);
				add(c2 + numClock1, c0 + numClock1);
				add(c1 + numClock1, c0 + numClock1);
			}
			break;
		case MINUS:
			c1 = traduction1[aux.c1];
			c2 = traduction1[aux.c2];
			
			if(c0 == c1 && c1 == c2){
				new.c0 = c0;
				new.type = NOT;
				addC(compCons, new);
			}
			else if(c0 == c1){
				add(c0, c2 + numClock1);
				add(c2, c0 + numClock1);
			}
			else if(c0 == c2){
				add(c0, c1 + numClock1);
				add(c1, c0 + numClock1);
			}
			else if(c1 == c2){
				new.c0 = c0;
				new.type = NOT;
				addC(compCons, new);
			}
			else{
				new.c0 = c0;
				new.c1 = c1;
				new.c2 = c2;
				new.type = MINUS;
				addC(compCons, new);
				add(c0, c1);
				add(c1 + numClock1, c0 + numClock1);
				add(c0, c2 + numClock1);
				add(c2, c0 + numClock1);
			}
			break;
		case EXCLU:
			c1 = traduction1[aux.c1];
			
			if(c0 == c1){
				new.c0 = c0;
				new.type = NOT;
				addC(compCons, new);
			}
			else{
				add(c0, c1 + numClock1);
				add(c1, c0 + numClock1);
			}
			break;
		case NOT:
			new.c0 = c0;
			new.type = NOT;
			addC(compCons, new);
			break;
		}
		
		element = element->next;
	}
	
	freeC(normCons);
	
#ifdef DEBUG
	printf("Complex normalized constraints.\n");
	printC(compCons);
	
	printf("Double Implication Graph.\n");
	for(int i = 0; i < NEQUI; i++){
		for(int j = 0; j < NEQUI; j++){
			printf("%d\t", base[i][j]);
		}
		printf("\n");
	}
#endif
	
	// Fin de la deuxième mise à jour des contraintes
	
	// Début de l'analyse de contraintes complexes, calcul d'ordre de passage
	
	
	
	// Fin de l'analyse.
	
	// Algo de propagataion et de décision
	
	int* finalRes = malloc(2 * numClock1 * sizeof(int));
	
	for(int i = 0; i < 2 * numClock1; i++){
		finalRes[i] = 0;
	}
	
	decision(finalRes, numClock1, compCons);
	
	int numberTick = 0;
	
	for(int i = 0; i < numClock1; i++){
		if(finalRes[i] > 0){
			numberTick++;
		}
	}
	
	if(numberTick == 0){
#ifdef DEBUG
		fprintf(stderr, "No clock tick, end of schedule.\n");
#endif
		exit(1);
	}
	
	freeC(compCons);
	
#ifdef DEBUG
	printf("Simple decision result.\n[");
	for(int i = 0; i < 2*numClock1; i++){
		printf("(%d)", finalRes[i]);
	}
	printf("]\n");
#endif
	
	for(int i = 0; i < N; i++){
		goodRes[i] = finalRes[traduction1[traduction0[i]]];
	}
	
	free(traduction1);
	free(finalRes);
}
