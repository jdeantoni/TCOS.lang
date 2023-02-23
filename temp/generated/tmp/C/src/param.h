#ifndef PARAMH
#define PARAMH

#define N 25
#define NEQUI 52
#define NUMSTEP 50

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

#define MAXLISTC 41

#endif
