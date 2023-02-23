#include "listeContrainte.h"

void printContrainte(Contrainte contrainte){
	switch(contrainte.type){
		case EQUI:
			printf("(%d <-> %d)", contrainte.c0, contrainte.c1);
			break;
		case IMPLI:
			printf("(%d -> %d)", contrainte.c0, contrainte.c1);
			break;
		case UNION:
			printf("(%d = %d + %d)", contrainte.c0, contrainte.c1, contrainte.c2);
			break;
		case INTER:
			printf("(%d = %d * %d)", contrainte.c0, contrainte.c1, contrainte.c2);
			break;
		case MINUS:
			printf("(%d = %d - %d)", contrainte.c0, contrainte.c1, contrainte.c2);
			break;
		case EXCLU:
			printf("(%d # %d)", contrainte.c0, contrainte.c1);
			break;
		case NOT:
			printf("(not %d)", contrainte.c0);
			break;
		default:
			fprintf(stderr, "Unknown constraint type.\n");
			exit(EXIT_FAILURE);
	}
}

ListeC *newListC(){
	ListeC *liste = malloc(sizeof(ListeC));
	
	if(liste == NULL){
		fprintf(stderr, "Cannot create new constraint liste.\n");
		exit(EXIT_FAILURE);
	}
	
	liste->length = 0;
	liste->first = NULL;
	
	return liste;
}

void addC(ListeC* liste, Contrainte contrainte){
	ElementC* new = malloc(sizeof(ElementC));
	
	if(liste == NULL || new == NULL){
		fprintf(stderr, "Cannot add new constraint element.\n");
	}
	printf(".");
	new->contrainte = contrainte;
	
	new->next = liste->first;
	liste->first = new;
	liste->length++;
}

void removeC(ListeC* liste){
	if(liste == NULL){
		fprintf(stderr, "Cannot remove from constraint liste.\n");
		exit(EXIT_FAILURE);
	}
	
	if(liste->length > 0 && liste->first != NULL){
		ElementC* aux =liste->first;
		liste->first = liste->first->next;
		free(aux);
		liste->length--;
	}
}

Contrainte firstC(ListeC* liste){
	if(liste == NULL){
		fprintf(stderr, "Cannot read first from constraint liste.\n");
		exit(EXIT_FAILURE);
	}
	
	if(liste->length > 0 && liste->first != NULL){
		return liste->first->contrainte;
	}
	else{
		fprintf(stderr, "Cannot read from empty constraint list.\n");
		exit(EXIT_FAILURE);
	}
}

void printC(ListeC* liste){
	if(liste == NULL){
		fprintf(stderr, "Cannot print constraint liste.\n");
		exit(EXIT_FAILURE);
	}
	
	int n = liste->length;
	ElementC* current = liste->first;
	
	printf("[");
	
	while(n>0){
		printContrainte(current->contrainte);
		current = current->next;
		n--;
	}
	printf("]\n");
}

void freeC(ListeC* liste){
	if(liste != NULL){
		while(liste->length > 0){
			removeC(liste);
		}
		
		free(liste);
	}
}



