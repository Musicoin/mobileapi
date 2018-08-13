const express = require('express');
const request = require('request');
const JsonPromiseRouter = require('../../json-promise-router');
const expressRouter = express.Router();
const router = new JsonPromiseRouter(expressRouter, "tx");
let txModule;
let orbiterEndpoint;

class TxController {

    constructor(_txModule, _orbiterEndpoint) {
        this.txModule = _txModule;
        this.orbiterEndpoint = _orbiterEndpoint;
    };

    getTxDetails(Request, Response) {
        this.txModule.getTransactionDetails(Request.params.hash).then( res => {
            Response.send(res);
        });
    }

    getTx(Request, Response) {
        this.txModule.getTransaction(Request.params.hash).then( res => {
            Response.send(res);
        })
    }
    getTxReceipt(Request, Response) {
        this.txModule.getTransactionReceipt(Request.params.hash).then( res => {
            Response.send(res);
        })
    }
    getTxStatus(Request, Response) {
        this.txModule.getTransactionStatus(Request.params.hash).then( res => {
            Response.send(res);
        })
    }
    getTxHistory(Request, Response) {
        const $this = this;
        this.getJson($this.orbiterEndpoint, {
            addr: Request.params.address,
            length: typeof Request.query.length != "undefined" ? Request.query.length : 10,
            start: Request.query.start
        })
            .then(results => {
                return results.data
                    .filter(tx => tx[4] > 0)
                    .map(tx => {
                        return $this.txModule.getTransactionDetails(tx[0])
                            .then(function (details) {
                                return {
                                    transactionHash: tx[0],
                                    blockNumber: tx[1],
                                    from: tx[2],
                                    to: tx[3],
                                    musicoins: tx[3] == req.params.address ? tx[4] : -tx[4],
                                    timestamp: tx[6],
                                    eventType: details.eventType || "transfer",
                                    txType: details.txType,
                                    title: details.title || details.artistName,
                                    licenseAddress: details.licenseAddress
                                }
                            });
                    })
            })
            .then(function (promises) {
                return Promise.all(promises);
            })
    }

    getJson(url, properties) {
        return new Promise(function(resolve, reject) {
            request({
                method: 'post',
                url: url,
                body: properties,
                json: true,
            }, function(error, response, result) {
                if (error) {
                    console.log(`Request failed with ${error}, url: ${url}, properties: ${JSON.stringify(properties)}`);
                    return reject(error);
                }
                resolve(result)
            })
        }.bind(this));
    }


}



module.exports = TxController;