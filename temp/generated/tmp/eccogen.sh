#!/bin/bash

ECCOGEN_PATH=$(pwd -P)

# Recuperation of the arguments given to eccogen.sh. 

# The first argument is the path to the .lc file, the second is the number of steps to be executed.

GIVEN_LC_PATH=$1
GIVEN_STEP_NUMBER=$2


# Processing of arguments.

if ! [ -f "$GIVEN_LC_PATH" ]; then 
	echo "Error: $GIVEN_LC_PATH given as first argument does not exist."
	exit 1
fi
if ! [[ $GIVEN_LC_PATH == *.lc ]]; then 
	echo "Error: $GIVEN_LC_PATH given as first argument is not a .lc file."
	exit 1
fi
LC_PATH=$GIVEN_LC_PATH

num='^[0-9]+$'
if ! [[ $GIVEN_STEP_NUMBER =~ $num ]]; then
	echo "Error: $GIVEN_STEP_NUMBER given as second argument should be a positive integer."
	exit 1
fi
STEP_NUMBER=$GIVEN_STEP_NUMBER


# Retrieval of directory path from target.

DIR_PATH="$(cd "$(dirname "$LC_PATH")"; pwd -P)"


# Generation of .java file from .lc file.

java -jar Source/Java/lccsl-main.jar $LC_PATH $DIR_PATH > /dev/null

echo "Successful generation of .java file from .lc file."

# Normalization of .java file to deal with big specifications.

LC_NAME=$(basename "$LC_PATH")
BASE_NAME="${LC_NAME%.*}"
JAVA_NAME=Lc${BASE_NAME^}.java
AUX_JAVA_NAME=Norm$FIRST_JAVA_NAME

mv $DIR_PATH/lccsl/$JAVA_NAME $DIR_PATH/lccsl/$AUX_JAVA_NAME

cat $DIR_PATH/lccsl/$AUX_JAVA_NAME | java -jar Source/Java/normalize.jar > $DIR_PATH/lccsl/$JAVA_NAME

rm $DIR_PATH/lccsl/$AUX_JAVA_NAME

# Generation of .class file from .java file.

javac -classpath Source/Java/eccogen.jar $DIR_PATH/lccsl/$JAVA_NAME

echo "Successful generation of .class file from .java file."


# Preparation of C target.

rm -r $DIR_PATH/C/* 2> /dev/null
cp -r $ECCOGEN_PATH/Source/C/ $DIR_PATH
rm $DIR_PATH/C/src/main.c $DIR_PATH/C/src/param.h
cd $DIR_PATH/C/
make mrproper 1> /dev/null
cd $ECCOGEN_PATH


# Generation of C files.

CLASS_NAME=Lc${BASE_NAME^}
cd $DIR_PATH
(echo $DIR_PATH; echo $STEP_NUMBER) | java -classpath $ECCOGEN_PATH/Source/Java/eccogen.jar:. lccsl.$CLASS_NAME
cd $ECCOGEN_PATH

echo "Successful generation of C files."







