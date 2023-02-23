#ifndef COREH
#define COREH

#include <stdio.h>
#include <stdlib.h>

#include "param.h"
#include "unionFind.h"
#include "listeContrainte.h"
#include "tarjan.h"
#include "propag.h"
#include "graphe.h"

extern unsigned short base[NEQUI][NEQUI];

extern int numVoisin[NEQUI];

void core(ListeC* in, int* goodRes);

#endif
