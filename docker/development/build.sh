#! /bin/bash

# build the project image
# if the image exists, remove them and rebuild
# if reference services isnt running, restart them
# recreate container and start it finaly

Dockerfile=$1
# into file dir
cd `dirname $0`

if [ ! -n "$DOCKERFILE" ]; then
Dockerfile=$(pwd)/Dockerfile
fi
echo Dockerfile=$Dockerfile

# remove image
if docker ps -a | grep -i musicoin-api; then    
  docker container rm -f musicoin-api
fi

# remove container
if docker image ls | grep -i musicoin-api:dev; then
  docker image rm -f musicoin-api:dev
fi

echo "--------->build musicoin-api image..." 
docker build -t musicoin-api:dev . -f $Dockerfile
echo "--------->build musicoin-api image complete" 

# start reference services
./start-ref-services.sh

echo "create and start musicoin-api container..."

app_dir=$(cd ../../;pwd)
echo "app-dir=$app_dir"
docker run -d --name musicoin-api --link mongo-node --link gmc-node --link ipfs-node -v $app_dir:/app -p 8082:8082 musicoin-api:dev
docker logs -f musicoin-api