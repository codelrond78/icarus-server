#!/bin/bash

cd $NAME

echo "$YAML" | docker-compose -f - down