This is the file containing all C files generated and used by ECCOGEN.
The generated executable is named "main" by default.
Use:
- "make" to build the project
- "make run" to build and run the project
- "make clean" to clean build files
- "make mrproper" to clean build files and executable

The following options can be used to change the parameters of the build:
- CC : compiler, by default gcc
- CFLAGS : compiler option, by default -Wall
- LDFLAGS : linking options, by default none
- DEBUG : debug options, the following options are available:
    - NORMAL prints the number of ticks per clock at the end of execution.
    - DEBUG_BASE : prints the schedule at each step
    - DEBUG : prints detailed schedule
    - CORRECT : prints schedule according to the correctness evaluation
