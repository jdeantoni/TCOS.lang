CC := gcc
CFLAGS := -Wall
LDFLAGS :=
DEBUG := PRINT_SCHEDULE

EXEC := main
SOURCE := src
BUILD := build

CFILES := $(foreach dir, $(SOURCE)/, $(notdir $(wildcard $(SOURCE)/*.c)))
OFILES := $(addprefix $(BUILD)/, $(CFILES:.c=.o))

all : $(EXEC)

run : all
	taskset 5 ./$(EXEC)

silent_run : all
	taskset 5 ./$(EXEC) > /dev/null

$(EXEC) : $(OFILES)
	$(CC) -o $@ $^ $(LDFLAGS)

$(BUILD)/%.o : $(SOURCE)/%.c
	mkdir -p build
	$(CC) -o $@ -c $< $(CFLAGS) -D $(DEBUG)

.PHONY : clean mrproper

clean :
	rm -rf $(OFILES)

mrproper : clean
	rm -rf $(EXEC)
