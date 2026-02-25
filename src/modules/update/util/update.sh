#!/usr/bin/env bash

download_url=https://github.com/rrivirr/rriv-ctl/releases/latest/download/rrivctl-installer.sh
if [[ -z "$1" ]]; then
    curl --proto =https --tlsv1.2 -LsSf $download_url | bash 
else
    curl --proto =https --tlsv1.2 -LsSf $download_url | bash -s $1
fi
