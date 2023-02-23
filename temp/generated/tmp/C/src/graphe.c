#include "graphe.h"

unsigned short base[NEQUI][NEQUI];

int numVoisin[NEQUI];

int exist(int a, int b){
	if(numVoisin[a] == 0){
		return -1;
	}
	else{
		int i = numVoisin[a] - 1;
		while(i >= 0 && base[a][i] > b){
			i--;
		}
		if(i < 0){
			return -2;
		}
		else if(base[a][i] == b){
			return i;
		}
		else{
			return -i-3;
		}
	}
}

void add(int a, int b){
	int aux = exist(a, b);
	if(aux < 0){
		if(aux == -1){
			base[a][0] = b;
			numVoisin[a] = 1;
		}
		else{
			int i;
			for(i = numVoisin[a] -1; i >= -aux-2; i--){
				base[a][i+1] = base[a][i];
			}
			base[a][i+1] = b;
			numVoisin[a] += 1;
		}
	}
}

void rem(int a, int b){
	if(exist(a, b) >= 0){
		int i = 0;
		
		while(base[a][i] != b){
			i++;
		}
		
		while(i < numVoisin[a] - 1){
			base[a][i] = base[a][i + 1];
			i++;
		}
		
		numVoisin[a] -= 1;
	}
}
