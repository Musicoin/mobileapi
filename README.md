Musicoin API
===============

To get setup, run `npm install`

You need to run a gmc / parity node and ipfs on the backend in order to test this effectively

```
screen -S gmc ./go-musicoin/build/bin/gmc --rpc --rpcapi=eth,net,web3,personal --rpcport 8545 --rpcaddr 127.0.0.1 --rpccorsdomain lcoalhost
```

```
screen -S ipfs ./go-ipfs/ipfs daemon --init=true --migrate=true
```

`node app.js --ipfsHost http://localhost:8080 --web3Host http://localhost:8545`

Requires environment variables to be set (refer config.js)

Documentation over at developers.musicoin.org and docs/
