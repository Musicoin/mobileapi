#! /bin/bash

if docker ps -a | grep -i musicoin-api; then    
  docker restart musicoin-api
else
  ./build.sh
fi

