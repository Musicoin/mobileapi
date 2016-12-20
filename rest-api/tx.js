const express = require('express');
const JsonPromiseRouter = require('./json-promise-router');
const expressRouter = express.Router();
const router = new JsonPromiseRouter(expressRouter);
let txModule;

router.get('/detail/:hash', req => txModule.getTransactionDetails(req.params.hash));
router.get('/raw/:hash', req => txModule.getTransaction(req.params.hash));
router.get('/receipt/:hash', req => txModule.getTransactionReceipt(req.params.hash));
router.get('/status/:hash', req => txModule.getTransactionStatus(req.params.hash));

module.exports.init = function(_txModule) {
  txModule = _txModule;
  return expressRouter;
};
