const express = require('express');
const Router = express.Router();
const jsonParser = require('body-parser').json();
const Kernel = require('./../app/Kernel');

const rewardMax = config.rewardMax; // config reward for the ppp contract
const rewardMin = config.rewardMin; // config reward for the ppp contract

Router.post("/rewardmax", jsonParser, (req, res) => {
  musicoinCore.getWeb3Writer().sendCoins(req.body.recipient, rewardMax, paymentAccountCredentialsProvider)
    .then(tx => {
      res.json({
        tx: tx
      });
    })
    .catch(function(err) {
      console.log(`Reward request failed: ${err}`);
      res.status(500);
      res.send(err);
    });
});

Router.post("/rewardmin", jsonParser, (req, res) => {
  musicoinCore.getWeb3Writer().sendCoins(req.body.recipient, rewardMin, paymentAccountCredentialsProvider)
    .then(tx => {
      res.json({
        tx: tx
      });
    })
    .catch(function(err) {
      console.log(`Reward request failed: ${err}`);
      res.status(500);
      res.send(err);
    });
});

Router.post("/rewardppp", jsonParser, (req, res) => {
  if (rewardP == null) {
    console.log(`PPP Extra Reward request failed: PPP Extra Reward is undefined`);
    res.status(500);
  } else if (rewardP <= 0) {
    //console.log(`PPP Extra Reward request failed: Price is more than 0.01`);
    res.status(500);
  } else {
    musicoinCore.getWeb3Writer().sendCoins(req.body.recipient, rewardP, paymentAccountCredentialsProvider)
      .then(tx => {
        res.json({
          tx: tx
        });
      })
      .catch(function(err) {
        console.log(`PPP Extra Reward request failed: ${err}`);
        res.status(500);
        res.send(err);
      });
  }
});

app.use('/health/deep', function(req, res) {
  console.log("Received deep health check call...");
  return musicoinCore.getWeb3Reader().getBalanceInMusicoins("0x13559ecbdbf8c32d6a86c5a277fd1efbc8409b5b")
    .then(function(result) {
      res.json({
        ok: true
      })
    })
    .then(function() {
      console.log("Health check ok");
    })
    .catch(function(err) {
      console.log("Health check failed: " + err);
      res.status(500);
      res.send("Health check failed");
    })
});

module.exports = Router;
