#! /bin/bash

# restart the container

cd `dirname $0`
if docker ps -a | grep -i musicoin-api; then
  ./start-ref-services.sh    
  docker restart musicoin-api
  docker logs -f musicoin-api
else
  ./build.sh
fi

