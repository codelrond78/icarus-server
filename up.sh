#!/bin/bash

PATH=/workspaces/$NAME
mkdir -p $PATH
cd $PATH

echo "$YAML" | docker-compose -f - up -d