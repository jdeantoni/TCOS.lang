#include "propag.h"

void decision(int* res, int numClock, ListeC* liste){
	
	ListeC* listeNot = newListC();
	ListeC* listeTriple = newListC();
	
	Contrainte aux;
	
	while(liste->length > 0){
		aux = firstC(liste);
		
		if(aux.type == NOT){
			addC(listeNot, aux);
		}
		else if(aux.type == UNION || aux.type == INTER || aux.type == MINUS){
			addC(listeTriple, aux);
		}
		else{
			fprintf(stderr, "Unvalid constraint type in decision.\n");
			exit(EXIT_FAILURE);
		}
		
		removeC(liste);
	}
	
	int numCons = listeTriple->length;
	
	CTriple* compCons = malloc(numCons * sizeof(CTriple));
	
	ListeInt** triggerVertex = malloc(numClock * sizeof(ListeInt*));
	
	for(int i = 0; i < numClock; i++){
		triggerVertex[i] = newListInt();
	}
	
	for(int i = 0; listeTriple->length > 0; i++){
		aux = firstC(listeTriple);
		
		compCons[i].active = 1;
		compCons[i].triggered = 0;
		
		if(aux.type == UNION){ // c0 = c1 + c2
			// if c0, not c1 -> c2
			compCons[i].trigger0 = aux.c0;
			compCons[i].i0 = aux.c1 + numClock;
			compCons[i].j0 = aux.c2;
			// if not c1, c0 -> c2
			compCons[i].trigger1 = aux.c1 + numClock;
			compCons[i].i1 = aux.c0;
			compCons[i].j1 = aux.c2;
			// if not c2, c0 -> c1
			compCons[i].trigger2 = aux.c2 + numClock;
			compCons[i].i2 = aux.c0;
			compCons[i].j2 = aux.c1;
		}
		else if(aux.type == INTER){ // c0 = c1 * c2
			// if not c0, c1 -> not c2
			compCons[i].trigger0 = aux.c0 + numClock;
			compCons[i].i0 = aux.c1;
			compCons[i].j0 = aux.c2 + numClock;
			// if c1, c2 -> c0
			compCons[i].trigger1 = aux.c1;
			compCons[i].i1 = aux.c2;
			compCons[i].j1 = aux.c0;
			// if c2, c1 -> c0
			compCons[i].trigger2 = aux.c2;
			compCons[i].i2 = aux.c1;
			compCons[i].j2 = aux.c0;
		}
		else if(aux.type == MINUS){ // c0 = c1 - c2
			// if not c0, c1 -> c2
			compCons[i].trigger0 = aux.c0 + numClock;
			compCons[i].i0 = aux.c1;
			compCons[i].j0 = aux.c2;
			// if not c2, c1 -> c0
			compCons[i].trigger1 = aux.c2 + numClock;
			compCons[i].i1 = aux.c1;
			compCons[i].j1 = aux.c0;
			// if c1, not c2 -> c0
			compCons[i].trigger2 = aux.c1;
			compCons[i].i2 = aux.c2 + numClock;
			compCons[i].j2 = aux.c0;
		}

		addInt(triggerVertex[compCons[i].trigger0%numClock], i);
		addInt(triggerVertex[compCons[i].trigger1%numClock], i);
		addInt(triggerVertex[compCons[i].trigger2%numClock], i);
		
		removeC(listeTriple);
	}
	
	freeC(listeTriple);
	
	int currentNum = 1;
	
	ElementC* currentNot = listeNot->first;
	
	int c;
	
	while(currentNot != NULL){
		c = currentNot->contrainte.c0;
#ifdef DEBUG
		printf("Propaging not from %d.\n", c+numClock);
#endif
		simpleNotPropage(c + numClock, res, numClock, compCons, numCons, triggerVertex, currentNum);
		currentNot = currentNot->next;
	}
	
	freeC(listeNot);
	
	currentNum++;
	
#ifdef DEBUG
	printf("End of not propagation.\n");
#endif
	
	int test;
	
	for(int i = 0; i < numClock; i++){
		if(res[i] == 0){
			test = testYesPropage(i, res, numClock, compCons, numCons, triggerVertex, currentNum);
			
			if(test != 0){
#ifdef DEBUG
				fprintf(stderr, "Yes propagation of %d at currentNum %d failed.\n", i, currentNum);
#endif
				
				unYesPropage(i, res, numClock, compCons, numCons, triggerVertex, currentNum);
				preForceNotPropage((i + numClock)%(2*numClock), res, numClock, compCons, numCons, triggerVertex, currentNum);
			}
			currentNum++;
		}
	}
	
	free(compCons);
	
	for(int i = 0; i < numClock; i++){
		freeInt(triggerVertex[i]);
	}
	
	free(triggerVertex);
	
}

void preForceNotPropage(int sommet, int* res, int numClock, CTriple* compCons, int numCons, ListeInt** triggerVertex, int currentNum){
	if(sommet < numClock){
		fprintf(stderr, "Trying to force-not a positive clock.\n");
		exit(EXIT_FAILURE);
	}
	
	ListeInt* normal = newListInt();
	ListeInt* danger = newListInt();
	ListeInt* propagDanger = newListInt();
	
	ListeInt* sourceDanger = newListInt(); // Retient le sommet source de la liaison dangereuse asocié à danger
	
	addInt(normal, sommet);
	
	int current;
	int currentTargetDanger;
	int currentSourceDanger;
	ElementInt* currentElement;
	int indexTrigger;
	
	int numDanger = 0;
	
	int* dataDanger = malloc(numClock*sizeof(int));
	
	for(int i = 0; i < numClock; i++){
		dataDanger[i] = -1;
	}
	
	while(normal->length > 0 || danger->length > 0 || propagDanger->length > 0){
		if(normal->length > 0){
			current = firstInt(normal);;
			removeInt(normal);
			if(res[current] == 0){
				res[current] = currentNum;
				res[(current + numClock)%(2 * numClock)] = -currentNum;
				
				currentElement = triggerVertex[current%numClock]->first;
				
				while(currentElement != NULL){
					indexTrigger = currentElement->value;
					
					if(compCons[indexTrigger].active == 1){
						if(compCons[indexTrigger].triggered == 0){
							compCons[indexTrigger].triggered = currentNum;
					
							if(sommet == compCons[indexTrigger].trigger0){
								add(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
								add((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
							}
					
							else if(sommet == compCons[indexTrigger].trigger1){
								add(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
								add((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
							}
					
							else if(sommet == compCons[indexTrigger].trigger2){
								add(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
								add((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
							}
						}
					}
			
					currentElement = currentElement->next;
				}
				
				if(current < numClock){
					for(int i = 0; i < numVoisin[current]; i++){
						addInt(normal, base[current][i]);
					}
				}
				else{
					for(int i = 0; i < numVoisin[current]; i++){
						//printf("danger.\n");
						addInt(danger, base[current][i]);
						addInt(sourceDanger, current);
					}
					for(int i = numClock; i < numVoisin[current]; i++){
						addInt(normal, base[current][i]);
					}
				}
				
			}
			else if(res[current] < 0){
				fprintf(stderr, "Trying to forceNot on tick without force.\n");
				exit(EXIT_FAILURE);
			}
		}
		else if(propagDanger->length > 0) {
			current = firstInt(propagDanger);;
			removeInt(propagDanger);
			
			if(res[current] == 0){
				res[current] = currentNum;
				res[(current + numClock)%(2 * numClock)] = -currentNum;
				
				dataDanger[current % numClock] = numDanger;
				
				currentElement = triggerVertex[current%numClock]->first;
				
				while(currentElement != NULL){
					indexTrigger = currentElement->value;
					
					if(compCons[indexTrigger].active == 1){
						if(compCons[indexTrigger].triggered == 0){
							compCons[indexTrigger].triggered = currentNum;
					
							if(sommet == compCons[indexTrigger].trigger0){
								add(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
								add((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
							}
					
							else if(sommet == compCons[indexTrigger].trigger1){
								add(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
								add((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
							}
					
							else if(sommet == compCons[indexTrigger].trigger2){
								add(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
								add((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
							}
						}
					}
			
					currentElement = currentElement->next;
				}
				
				for(int i = 0; i < 2*numClock; i++){
					if(exist(current, i) >= 0){
						addInt(propagDanger, i);
					}
				}
			}
			
			else if(res[current] < 0){
				// On efface toute la propag danger, on trouve le trigger et on force propage depuis
				
				
				
				
				int currentEraseDanger;
				
				for(int i = 0; i < numClock; i++){
					if(dataDanger[i] == numDanger){
						if(res[i] > 0){
							currentEraseDanger = i;
						}
						else{
							currentEraseDanger = i + numClock;
						}
						
						currentElement = triggerVertex[i]->first;
						
						while(currentElement != NULL){
							indexTrigger = currentElement->value;
							
							if(compCons[indexTrigger].active == 1){
								if(compCons[indexTrigger].triggered == currentNum){
									compCons[indexTrigger].triggered = 0;
									
									if(currentEraseDanger == compCons[indexTrigger].trigger0){
										add(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
										add((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
									}
					
									else if(currentEraseDanger == compCons[indexTrigger].trigger1){
										add(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
										add((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
									}
					
									else if(currentEraseDanger == compCons[indexTrigger].trigger2){
										add(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
										add((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
									}		
								}
							}
						}
					}
				}
				
				
				currentElement = triggerVertex[currentTargetDanger%numClock]->first;
				
				int trigger;
				
				if(compCons[indexTrigger].active == 1){
					if(compCons[indexTrigger].triggered > 0){
						if(compCons[indexTrigger].i0 == currentSourceDanger && compCons[indexTrigger].j0 == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger0;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
							rem((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
						}
						else if((compCons[indexTrigger].j0 + numClock)%(2*numClock) == currentSourceDanger && (compCons[indexTrigger].i0 + numClock)%(2*numClock) == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger0;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
							rem((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
						}
						
						else if(compCons[indexTrigger].i1 == currentSourceDanger && compCons[indexTrigger].j1 == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger1;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
							rem((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
						}
						else if((compCons[indexTrigger].j1 + numClock)%(2*numClock) == currentSourceDanger && (compCons[indexTrigger].i1 + numClock)%(2*numClock) == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger1;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
							rem((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
						}
						
						else if(compCons[indexTrigger].i2 == currentSourceDanger && compCons[indexTrigger].j2 == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger2;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
							rem((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
						}
						else if((compCons[indexTrigger].j2 + numClock)%(2*numClock) == currentSourceDanger && (compCons[indexTrigger].i2 + numClock)%(2*numClock) == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger2;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
							rem((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
						}
					}
				}

#ifdef DEBUG
				fprintf(stderr, "Entering forcePropage on %d.\n", (trigger + numClock) % (2*numClock));
#endif
				forcePropage((trigger + numClock) % (2*numClock), res, numClock, compCons, numCons, triggerVertex, currentNum);
				
			}
		}
		
		else if(danger->length > 0){
			current = firstInt(danger);
			currentTargetDanger = current;
			removeInt(danger);
			currentSourceDanger = firstInt(sourceDanger);
			removeInt(sourceDanger);
			
#ifdef DEBUG			
			fprintf(stderr, "Entering danger, source %d, current %d.\n", currentSourceDanger, current);
#endif			
			if(res[current] == 0){
#ifdef DEBUG				
				fprintf(stderr, "Current danger is at 0.\n");
#endif				
				res[current] = currentNum;
				res[(current + numClock)%(2 * numClock)] = -currentNum;
				
				dataDanger[current % numClock] = numDanger;
				
				currentElement = triggerVertex[current%numClock]->first;
				
				while(currentElement != NULL){
					indexTrigger = currentElement->value;
					
					if(compCons[indexTrigger].active == 1){
						if(compCons[indexTrigger].triggered == 0){
							compCons[indexTrigger].triggered = currentNum;
					
							if(sommet == compCons[indexTrigger].trigger0){
								add(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
								add((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
							}
					
							else if(sommet == compCons[indexTrigger].trigger1){
								add(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
								add((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
							}
					
							else if(sommet == compCons[indexTrigger].trigger2){
								add(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
								add((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
							}
						}
					}
			
					currentElement = currentElement->next;
				}
				
				for(int i = 0; i < numVoisin[current]; i++){
					addInt(propagDanger, base[current][i]);
				}
			}
			else if(res[current] < 0){
				//find trigger puis propag avec force depuis le trigger
#ifdef DEBUG
				fprintf(stderr, "Current danger is < 0.\n");
#endif				
				currentElement = triggerVertex[currentTargetDanger%numClock]->first;
				
				int trigger;
				
				if(compCons[indexTrigger].active == 1){
					if(compCons[indexTrigger].triggered > 0){
						if(compCons[indexTrigger].i0 == currentSourceDanger && compCons[indexTrigger].j0 == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger0;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
							rem((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
						}
						else if((compCons[indexTrigger].j0 + numClock)%(2*numClock) == currentSourceDanger && (compCons[indexTrigger].i0 + numClock)%(2*numClock) == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger0;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
							rem((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
						}
						
						else if(compCons[indexTrigger].i1 == currentSourceDanger && compCons[indexTrigger].j1 == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger1;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
							rem((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
						}
						else if((compCons[indexTrigger].j1 + numClock)%(2*numClock) == currentSourceDanger && (compCons[indexTrigger].i1 + numClock)%(2*numClock) == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger1;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
							rem((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
						}
						
						else if(compCons[indexTrigger].i2 == currentSourceDanger && compCons[indexTrigger].j2 == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger2;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
							rem((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
						}
						else if((compCons[indexTrigger].j2 + numClock)%(2*numClock) == currentSourceDanger && (compCons[indexTrigger].i2 + numClock)%(2*numClock) == currentTargetDanger){
							trigger = compCons[indexTrigger].trigger2;
							compCons[indexTrigger].triggered = 0;
							rem(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
							rem((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
						}
					}
				}
#ifdef DEBUG				
				fprintf(stderr, "Entering forcePropage on %d.\n", (trigger + numClock) % (2*numClock));
#endif				
				forcePropage((trigger + numClock) % (2*numClock), res, numClock, compCons, numCons, triggerVertex, currentNum);

			}
			
			numDanger++;
		}
	}
	
	freeInt(normal);
	freeInt(danger);
	freeInt(propagDanger);
	freeInt(sourceDanger);
	
	free(dataDanger);
	
}

void forcePropage(int sommet, int* res, int numClock, CTriple* compCons, int numCons, ListeInt** triggerVertex, int currentNum){
	
	if(res[sommet] <= 0){
	
		res[sommet] = currentNum;
		res[sommet - numClock] = -currentNum;
	
	
	
		ElementInt* currentElement = triggerVertex[sommet%numClock]->first;
		int indexTrigger;

#ifdef DEBUG
		fprintf(stderr, "currentElement fixed in forcePropage.\n");
#endif	
		while(currentElement != NULL){
			indexTrigger = currentElement->value;
			
			if(compCons[indexTrigger].active == 1){
			
				if(compCons[indexTrigger].triggered > 0){
					if(sommet == compCons[indexTrigger].trigger0){
						rem(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
						rem((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
						compCons[indexTrigger].triggered = 0;
					}
					else if((sommet+numClock)%(2*numClock) == compCons[indexTrigger].trigger0){
						compCons[indexTrigger].triggered = 0;
					}
					
					else if(sommet == compCons[indexTrigger].trigger1){
						rem(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
						rem((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
						compCons[indexTrigger].triggered = 0;
					}
					else if((sommet+numClock)%(2*numClock) == compCons[indexTrigger].trigger1){
						compCons[indexTrigger].triggered = 0;
					}
				
					else if(sommet == compCons[indexTrigger].trigger2){
						rem(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
						rem((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
						compCons[indexTrigger].triggered = 0;
					}
					else if((sommet+numClock)%(2*numClock) == compCons[indexTrigger].trigger2){
						compCons[indexTrigger].triggered = 0;
					}
				}
						
				if(compCons[indexTrigger].triggered == 0){
					compCons[indexTrigger].triggered = currentNum;
				
					if(sommet == compCons[indexTrigger].trigger0){
						add(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
						add((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
					}
				
					else if(sommet == compCons[indexTrigger].trigger1){
						add(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
						add((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
					}
				
					else if(sommet == compCons[indexTrigger].trigger2){
						add(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
						add((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
					}
				}
			}
		
			currentElement = currentElement->next;
		
		}
		
		for(int i = 0; i < numVoisin[sommet]; i++){
			forcePropage(base[sommet][i], res, numClock, compCons, numCons, triggerVertex, currentNum);
		}
	}
}

void simpleNotPropage(int sommet, int* res, int numClock, CTriple* compCons, int numCons, ListeInt** triggerVertex, int currentNum){
	if(sommet < numClock){
		fprintf(stderr, "Trying to simple-not on a positive clock %d %d.\n", sommet, numClock);
		exit(EXIT_FAILURE);
	}
	
	if(res[sommet] < 0){
		fprintf(stderr, "Trying to simple-not on a clock that ticks 2.\n");
		exit(EXIT_FAILURE);
	}
	
	if(res[sommet] == 0){
		res[sommet] = currentNum;
		res[sommet - numClock] = -currentNum;
		
		ElementInt* currentElement = triggerVertex[sommet - numClock]->first;
		int indexTrigger;
		
		while(currentElement != NULL){
			indexTrigger = currentElement->value;
			
			if(compCons[indexTrigger].active == 1){
				if(compCons[indexTrigger].triggered == 0){
					compCons[indexTrigger].triggered = currentNum;
					
					if(sommet == compCons[indexTrigger].trigger0){
						add(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
						add((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
					}
					
					else if(sommet == compCons[indexTrigger].trigger1){
						add(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
						add((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
					}
					
					else if(sommet == compCons[indexTrigger].trigger2){
						add(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
						add((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
					}
				}
			}
			
			currentElement = currentElement->next;
			
		}
		
		for(int i = 0; i < numVoisin[sommet]; i++){
			simpleNotPropage(base[sommet][i], res, numClock, compCons, numCons, triggerVertex, currentNum);
		}
		
	}
}

int testYesPropage(int sommet, int* res, int numClock, CTriple* compCons, int numCons, ListeInt** triggerVertex, int currentNum){
	if(res[sommet] < 0){
#ifdef DEBUG
		fprintf(stderr, "Tried to yes an already not vertex.\n");
#endif
		return 1;
	}
	
	if(res[sommet] == 0){
		res[sommet] = currentNum;
		res[(sommet+numClock)%(2*numClock)] = -currentNum;
		
		ElementInt* currentElement = triggerVertex[(sommet)%(numClock)]->first;
		int indexTrigger;
		
		/*
		if(currentElement == NULL){
			printf("no complex rule with %d.\n", sommet);
		}
		*/
		
		while(currentElement != NULL){
			indexTrigger = currentElement->value;
			
			if(compCons[indexTrigger].active == 1){
				if(compCons[indexTrigger].triggered == 0){
					compCons[indexTrigger].triggered = currentNum;
					
					if(sommet == compCons[indexTrigger].trigger0){
						add(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
						add((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
					}
					
					else if(sommet == compCons[indexTrigger].trigger1){
						add(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
						add((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
					}
					
					else if(sommet == compCons[indexTrigger].trigger2){
						add(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
						add((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
					}
				}
			}
			
			currentElement = currentElement->next;
			
		}
		
		int test = 0;
		
		for(int i = 0; i < numVoisin[sommet] && test == 0; i++){
			test = testYesPropage(base[sommet][i], res, numClock, compCons, numCons, triggerVertex, currentNum);
		}
		
		return test;
	}
	
	return 0;
}

void unYesPropage(int sommet, int* res, int numClock, CTriple* compCons, int numCons, ListeInt** triggerVertex, int currentNum){
	if(res[sommet] == currentNum){
		res[sommet] = 0;
		res[(sommet+numClock)%(2*numClock)] = 0;
		
		for(int i = numVoisin[sommet] - 1; i >= 0; i--){
			unYesPropage(base[sommet][i], res, numClock, compCons, numCons, triggerVertex, currentNum);
		}
		
		ElementInt* currentElement = triggerVertex[(sommet)%(numClock)]->first;
		int indexTrigger;
		
		while(currentElement != NULL){
			indexTrigger = currentElement->value;
			
			if(compCons[indexTrigger].active == 1){
				if(compCons[indexTrigger].triggered == currentNum){
					compCons[indexTrigger].triggered = 0;
					
					if(sommet == compCons[indexTrigger].trigger0){
						rem(compCons[indexTrigger].i0, compCons[indexTrigger].j0);
						rem((compCons[indexTrigger].j0 + numClock)%(2*numClock), (compCons[indexTrigger].i0 + numClock)%(2*numClock));
					}
					
					else if(sommet == compCons[indexTrigger].trigger1){
						rem(compCons[indexTrigger].i1, compCons[indexTrigger].j1);
						rem((compCons[indexTrigger].j1 + numClock)%(2*numClock), (compCons[indexTrigger].i1 + numClock)%(2*numClock));
					}
					
					else if(sommet == compCons[indexTrigger].trigger2){
						rem(compCons[indexTrigger].i2, compCons[indexTrigger].j2);
						rem((compCons[indexTrigger].j2 + numClock)%(2*numClock), (compCons[indexTrigger].i2 + numClock)%(2*numClock));
					}					
				}
			}
			
			currentElement = currentElement->next;
		}
	}
}

























