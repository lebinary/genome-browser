#!/bin/bash

g++ -c -fPIC clib.cc -o clib.o
g++ -shared -Wl,-soname,libclib.so -o libclib.so  clib.o

g++ filter_dbnsfp_database.cc -lz -lpthread -o filter_dbnsfp_database


