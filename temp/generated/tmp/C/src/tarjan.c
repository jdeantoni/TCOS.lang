#include "tarjan.h"


void tarjan(int* partition, int numClock){
	//int* partition = malloc(numClock * sizeof(int));
	
	ListeInt* pile = newListInt();
	
	int num = 0;
	
	DataTarjan* vertices = malloc(numClock * sizeof(DataTarjan));
	
	for(int i = 0; i < numClock; i++){
		vertices[i].num = -1;
		vertices[i].numAcces = -1;
		vertices[i].inPile = 0;
	}
	
	for(int i = 0; i < numClock; i++){
		if(vertices[i].num < 0){
			parcours(i, partition, pile, vertices, &num, numClock);
		}
	}
	
	freeInt(pile);
	
	free(vertices);
}

void parcours(int sommet, int* partition, ListeInt* pile, DataTarjan* vertices, int* num, int numClock){
	
	vertices[sommet].num = *num;
	vertices[sommet].numAcces = *num;
	vertices[sommet].inPile = 1;
	*num += 1;
	
	addInt(pile, sommet);
	
	for(int j = 0; j < numVoisin[j]; j++){
	
	//for(int j = 0; j < numClock; j++){
		if(exist(sommet, j) >= 0){
			if(vertices[j].num < 0){
				parcours(j, partition, pile, vertices, num, numClock);
				if(vertices[j].numAcces < vertices[sommet].numAcces){
					vertices[sommet].numAcces = vertices[j].numAcces;
				}
			}
			else if(vertices[j].inPile == 1){
				if(vertices[j].num < vertices[sommet].numAcces){
					vertices[sommet].numAcces = vertices[j].num;
				}
			}
		}
	}
	
	if(vertices[sommet].num == vertices[sommet].numAcces){
		int w;
		
		do{
			w = firstInt(pile);
			removeInt(pile);
			vertices[w].inPile = 0;
			partition[w] = vertices[sommet].num;
		} while(w != sommet);
		
	}
}
