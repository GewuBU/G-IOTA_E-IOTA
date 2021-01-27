FROM debian:buster

RUN apt update && apt upgrade -y &&\
apt install -y gcc gdb nasm
