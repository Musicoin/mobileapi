## quick start with docker

### install project
`git clone https://github.com/Musicoin/api.git && cd api`

### switch to dev branch
`git checkout -b river/dev --track origin/river/dev`

### install node modules
`npm install`

### setup required variable
`cp .env.docker .env`

### build docker container
`./build.sh` 
- if no exec permision
`sudo chmod +x build.sh` 

### restart if codes changed
`./run.sh`
- if no exec permision
`sudo chmod +x run.sh` 

Documentation over at [doc](https://documenter.getpostman.com/view/6054511/Rzn6wiiB)
