sudo su coiner

#!/bin/bash
nohup /home/coiner/musicoin/geth --identity 55313717 --datadir chain --rpc --rpcapi=eth,net,web3,personal --rpcport 8545 --rpcaddr 127.0.1 --rpccorsdomain localhost > geth.log &

