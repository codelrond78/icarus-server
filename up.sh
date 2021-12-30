#!/bin/bash

DIR=/workspaces/$NAME
mkdir -p $DIR
cd $DIR

echo "$YAML" | docker-compose -f - up -d