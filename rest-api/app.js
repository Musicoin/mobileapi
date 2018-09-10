const express = require('express');
const session = require('express-session');
const {
  MemoryStore
} = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const ConfigUtils = require('../components/config/config-utils');
const RateLimit = require('express-rate-limit');
const AuthMiddleware = require('./app/Middlewares/AuthMiddleware');
const mailer = require('express-mailer');
const mongoose = require("mongoose");
const config = ConfigUtils.loadConfig(process.argv);

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(bodyParser.raw());

// app.enable('trust proxy');
const store = new MemoryStore();

app.use(session({
  secret: config.sessionSecretKey,
  store: store,
  genid: function(Request) {
    return Request.query.clientId;
  }
}));

app.use(function(Request, Response, next) {
  Request.store = store;
  next();
});

const RateLimiter = new RateLimit({
  windowMs: 1000,
  max: 1,
  delayMs: 0
});

app.set('views', './rest-api/views');
app.set('view engine', 'pug');

mailer.extend(app, {
  from: config.MailClient.email,
  host: config.MailClient.host,
  secureConnection: true,
  port: config.MailClient.port,
  transportMethod: config.MailClient.transportMethod,
  auth: config.MailClient.auth
});

app.use(require('./routes/auth'));
mongoose.connect(config.keyCoreDatabaseUrl);
app.use('/', AuthMiddleware.checkTokens(store), RateLimiter);
app.use('/', require('./routes/global'));
app.use('/user', require('./routes/user'));
app.use('/package', require('./routes/package'));
app.use('/release', require('./routes/release'));
app.use('/license', require('./routes/license'));
app.use('/artist', require('./routes/artist'));
app.use('/tx', require('./routes/tx'));

// reward PPP routes
const rewardMax = config.rewardMax; // config reward for the ppp contract
const rewardMin = config.rewardMin; // config reward for the ppp contract
const jsonParser = require('body-parser').json();
const MusicoinCore = require("./../../mc-core");
const musicoinCore = new MusicoinCore(config);
const paymentAccountCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.paymentAccount, config.paymentAccountPassword);

app.post("/rewardmax", jsonParser, (req, res) => {
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

app.post("/rewardmin", jsonParser, (req, res) => {
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

app.post("/rewardppp", jsonParser, (req, res) => {
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

app.listen(config.port, function() {
  console.log('Listening on port ' + config.port);
});
