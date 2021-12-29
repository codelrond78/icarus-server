#!/bin/bash

PATH=/workspaces/$NAME
cd $PATH

echo "$YAML" | docker-compose -f - down