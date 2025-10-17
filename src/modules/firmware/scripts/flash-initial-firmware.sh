#!/bin/bash
set -e

dirPath=$1

curl --progress-bar --proto '=https' --tlsv1.2 -fSLo $dirPath/rriv-firmware.elf https://github.com/rrivirr/rriv-firmware/releases/latest/download/rriv-firmware.elf

probe-rs download $dirPath/rriv-firmware.elf \
      --chip STM32F103RE  \
      --protocol swd \
      --allow-erase-all \
      --chip-erase \
      --connect-under-reset

probe-rs reset \
      --chip STM32F103RE  \
      --protocol swd

rm $dirPath/rriv-firmware.elf