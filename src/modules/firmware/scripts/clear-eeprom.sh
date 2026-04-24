#!/usr/bin/env bash
set -e

dirPath=$1
firmware_version=$2
eeprom_type_firmware=$3
eeprom_file_path=$dirPath/rriv-$3-$firmware_version.elf

if [ ! -e "$eeprom_file_path" ]; then
   echo "Downloading clear eeprom firmware"
   echo $firmware_version
   curl --progress-bar --proto '=https' --tlsv1.2 -fSLo $eeprom_file_path https://github.com/rrivirr/rriv-scripts/releases/download/$firmware_version/$eeprom_type_firmware.elf
fi

probe-rs download $eeprom_file_path \
	--chip STM32F103RE  \
 	--protocol swd \
	--allow-erase-all \
	--chip-erase

probe-rs reset \
	--chip STM32F103RE  \
 	--protocol swd 