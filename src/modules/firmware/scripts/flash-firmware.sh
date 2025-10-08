#!/bin/bash
set -e

dirPath=$1
firmware_version=$2

curl --progress-bar --proto '=https' --tlsv1.2 -fSLo $dirPath/rriv-firmware.bin https://github.com/rrivirr/rriv-firmware/releases/download/$firmware_version/rriv-firmware.bin

probe-rs download $dirPath/rriv-firmware.bin \
      --chip STM32F103RE  \
      --protocol swd \
      --allow-erase-all \
      --chip-erase

rm $dirPath/rriv-firmware.bin