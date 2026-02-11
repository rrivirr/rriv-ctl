#!/usr/bin/env bash
set -e

dirPath=$1
firmware_version=$2
file_path=$dirPath/rriv-firmware-$firmware_version.elf

if [ ! -e "$file_path" ]; then
   echo "Downloading firmware"
   curl --progress-bar --proto '=https' --tlsv1.2 -fSLo $file_path https://github.com/rrivirr/rriv-firmware/releases/download/$firmware_version/rriv-firmware.elf
fi

probe-rs download $file_path \
      --chip STM32F103RE  \
      --protocol swd \
      --allow-erase-all \
      --chip-erase \
      --connect-under-reset

probe-rs reset \
      --chip STM32F103RE  \
      --protocol swd