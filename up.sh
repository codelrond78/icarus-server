#!/bin/bash

mkdir -p $NAME
cd $NAME

echo "$YAML" | docker-compose -f - up -d