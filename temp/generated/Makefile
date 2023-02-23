res.exe: test2.o test2_main.o
	gcc -o res.exe test2.o test2_main.o

test2_main.o: test2.o
	gcc -c test2_main.c

test2.o: test2.h test2.c
	gcc -c test2.c

clean:
	rm *.o rm res.exe