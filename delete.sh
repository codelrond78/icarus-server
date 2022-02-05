#!/bin/bash

DIR=/workspaces/$NAME
cd $DIR

echo "$YAML" | docker-compose -f - down -v