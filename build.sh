#! /bin/bash

Dockerfile=$1
work_dir=$(pwd)
echo work_dir=$work_dir

if [ ! -n "$DOCKERFILE" ]; then
Dockerfile=$work_dir/Dockerfile
fi
echo Dockerfile=$Dockerfile

# remove image
if docker ps -a | grep -i musicoin-api; then    
  docker container rm -f musicoin-api
fi

# remove container
if docker image ls | grep -i musicoin-api; then
  docker image rm -f musicoin-api
fi

echo "--------->build musicoin-api image..." 
docker build -t musicoin-api . -f $Dockerfile
echo "--------->build musicoin-api image complete" 

echo "--------->install reference service..."

# mongo
if lsof -i:27017; then
echo "--------->mongodb is running"
else
  if docker image ls | grep -i mongo; then
    if docker ps -a | grep -i mongo-node; then
      echo "--------->restart mongodb"
      docker restart mongo-node
    else
      echo "--------->start mongodb"
      docker run -d --name mongo-node -v ~/mongo:/root -p 27017:27017 mongo
    fi
  else
    echo "--------->install mongodb"
    docker pull mongo
    echo "--------->start mongodb"
    docker run -d --name mongo-node -v ~/mongo:/root -p 27017:27017 mongo
  fi
fi

# gmc
if lsof -i:8545; then
echo "--------->gmc is running"
else
  if docker image ls | grep -i gmc; then
    if docker ps -a | grep -i gmc-node; then
      echo "--------->restart gmc"
      docker restart gmc-node
    else
      echo "--------->start gmc"
      docker run -d --name gmc-node -v ~/musicoin:/root -p 8545:8545 -p 30303:30303 gmc:v1 --fast --cache=512
    fi
  else
    if [ ! -d "~/go-musicoin" ]; then
      echo "--------->clone gmc"
      cd ~/
      git clone https://github.com/Musicoin/go-musicoin.git
    fi
    echo "--------->install gmc"
    cd ~/go-musicoin
    docker build -t gmc .
    echo "--------->start gmc"
    docker run -d --name gmc-node -v ~/musicoin:/root -p 8545:8545 -p 30303:30303 gmc:v1 --fast --cache=512
  fi
fi

# ipfs
if lsof -i:5001; then
echo "--------->ipfs is running"
else
  if docker image ls | grep -i ipfs/go-ipfs; then
    if docker ps -a | grep -i ipfs-node; then
      echo "--------->restart ipfs"
      docker restart ipfs-node
    else
      echo "--------->start ipfs"
      docker run -d --name ipfs-node -v ~/ipfs:/root -p 8080:8080 -p 5001:5001 ipfs/go-ipfs
    fi
  else
    echo "--------->install ipfs"
    docker pull ipfs/go-ipfs
    echo "--------->start ipfs"
    docker run -d --name ipfs-node -v ~/ipfs:/root -p 8080:8080 -p 5001:5001 ipfs/go-ipfs
  fi
fi

cd $work_dir
echo "create and start musicoin-api container..."
docker run -d --name musicoin-api --link mongo-node --link gmc-node --link ipfs-node -v $work_dir:/app -p 8082:8082 musicoin-api