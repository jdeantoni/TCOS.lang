#include "listeInt.h"

ListeInt *newListInt(){
	ListeInt *liste = malloc(sizeof(ListeInt));
	
	if(liste == NULL){
		fprintf(stderr, "Cannot create new int liste.\n");
		exit(EXIT_FAILURE);
	}
	
	liste->length = 0;
	liste->first = NULL;
	
	return liste;
}

void addInt(ListeInt* liste, int value){
	ElementInt* new = malloc(sizeof(ElementInt));
	
	if(liste == NULL || new == NULL){
		fprintf(stderr, "Cannot add new int element.\n");
	}
	
	new->value = value;
	
	new->next = liste->first;
	liste->first = new;
	liste->length++;
}

void removeInt(ListeInt* liste){
	if(liste == NULL){
		fprintf(stderr, "Cannot remove from int liste.\n");
		exit(EXIT_FAILURE);
	}
	
	if(liste->length > 0 && liste->first != NULL){
		ElementInt* aux =liste->first;
		liste->first = liste->first->next;
		free(aux);
		liste->length--;
	}
}

int firstInt(ListeInt* liste){
	if(liste == NULL){
		fprintf(stderr, "Cannot read first from int liste.\n");
		exit(EXIT_FAILURE);
	}
	
	if(liste->length > 0 && liste->first != NULL){
		return liste->first->value;
	}
	else{
		fprintf(stderr, "Cannot read from empty int list.\n");
		exit(EXIT_FAILURE);
	}
}

void freeInt(ListeInt* liste){
	if(liste != NULL){
		while(liste->length > 0){
			removeInt(liste);
		}
		
		free(liste);
	}
}
