#ifndef PARAMH
#define PARAMH

#define N 4
#define NEQUI 10
#define NUMSTEP 19

// Base debug options, usually decided at compilation time using the makefile.

//#define NORMAL
//#define DEBUG
//#define DEBUG_BASE
//#define CORRECT


// Definition of PRINT_SCHEDULE according to base debug options

#ifdef DEBUG_BASE
#ifndef PRINT_SCHEDULE
#define PRINT_SCHEDULE
#endif
#endif

#ifdef CORRECT
#ifndef PRINT_SCHEDULE
#define PRINT_SCHEDULE
#endif
#endif

#define MAXLISTC 3

#endif
