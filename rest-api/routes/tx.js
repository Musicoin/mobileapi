const express = require('express');
const Router = express.Router();
const {txModule} = require('./../app/Kernel');

Router.get('/detail/:hash', txModule.getTransactionDetails.bind(txModule));
Router.get('/raw/:hash', txModule.getTransaction.bind(txModule));
Router.get('/receipt/:hash', txModule.getTransactionReceipt.bind(txModule));
Router.get('/status/:hash', txModule.getTransactionStatus.bind(txModule));
Router.get('/history/:address', txModule.getHistoryByAddress.bind(txModule));


module.exports = Router;