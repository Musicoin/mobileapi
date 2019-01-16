FROM node:10.15.0-alpine

RUN apk --no-cache add git
Volume /app
WORKDIR /app
CMD npm install --registry=https://registry.npm.taobao.org && npm start