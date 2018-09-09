const express = require('express');
const session = require('express-session');
const { MemoryStore } = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const ConfigUtils = require('../components/config/config-utils');
const RateLimit = require('express-rate-limit');
const AuthMiddleware = require('./app/Middlewares/AuthMiddleware');
const mailer = require('express-mailer');
const config = ConfigUtils.loadConfig(process.argv);



app.use(function (req, res, next)
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());


app.enable('trust proxy');

const store = new MemoryStore();

app.use(session({
    secret: config.sessionSecretKey,
    store: store,
    genid: function(Request) {
        return Request.query.clientId;
    }
}));

const RateLimiter = new RateLimit({
    windowMs: 1000,
    max: 1,
    delayMs:0
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
=======
>>>>>>> rebuild architecture of Controllers, routes and application structure

app.use('/api', AuthMiddleware.checkTokens(store), RateLimiter);
app.use('/api/user', require('./routes/user'));
app.use('/api/package', require('./routes/package'));
app.use('/api/release', require('./routes/release'));
app.use("/api/license", require('./routes/license'));
app.use('/api/artist', require('./routes/artist'));
app.use("/api/tx", require('./routes/tx'));

const Users = require('./../components/models/main/user');

app.get('/check/this', (req, res) => {
    Users.find().then(users => {
        res.send(users);
    })
});


app.listen(config.port, function () {
    console.log('Listening  on port ' + config.port);
});

// function loadApp(config) {
//   const musicoinCore = new MusicoinCore(config);
//   const contractOwnerAccount = config.contractOwnerAccount;
//   const publishCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.publishingAccount, config.publishingAccountPassword);
//   const paymentAccountCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.paymentAccount, config.paymentAccountPassword);
//
//
//
//   const AccountManager = require("../components/account-manager");
//   const accountManager = new AccountManager();
//   const licenseModule = new LicenseController(musicoinCore.getLicenseModule(), accountManager, publishCredentialsProvider, paymentAccountCredentialsProvider, contractOwnerAccount);
//   const artistModule = new ArtistController(musicoinCore.getArtistModule(), publishCredentialsProvider, paymentAccountCredentialsProvider);
//   const txModule = new TxController(musicoinCore.getTxModule(), config.orbiterEndpoint);
//   const packageModule = require('./app/Controllers/PackageController');
//
//   musicoinCore.setCredentials(config.publishingAccount, config.publishingAccountPassword);
//   //mongoose.connect(config.keyCoreDatabaseUrl);
//
//   const LicenseKey = require('../components/models/core/key');
//
//   const get_ip = require('ipware')().get_ip;
//   app.use(function(req, res, next) {
//     get_ip(req);
//     next();
//   });
//
//   app.use('/health/deep', function(req, res) {
//     console.log("Received deep health check call...");
//     return musicoinCore.getWeb3Reader().getBalanceInMusicoins("0x13559ecbdbf8c32d6a86c5a277fd1efbc8409b5b")
//       .then(function(result) {
//         res.json({ok: true})
//       })
//       .then(function() {
//         console.log("Health check ok");
//       })
//       .catch (function(err) {
//         console.log("Health check failed: " + err);
//         res.status(500);
//         res.send("Health check failed");
//       })
//   });
//
//   app.post('/client', jsonParser, function(req, res) {
//     if(req.ip.indexOf('127.0.0.1') !== -1 && req.body) {
//       accountManager.createAccount(req.body.clientId, req.body.name)
//       .then((user) => res.json(user), (error) => res.status(500).json(error));
//     }
//     else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   });
//
//
//
//
//
//   // app.use("/api/balance/:address", function(req, res) {
//   //   musicoinCore.getWeb3Reader().getBalanceInMusicoins(req.params.address)
//   //     .then(function (output) {
//   //       res.json({
//   //         musicoins: output
//   //       });
//   //     })
//   //     .catch(function (err) {
//   //       console.log(`Request failed in /balance/:address: ${err}`);
//   //       res.status(500);
//   //       res.send(err);
//   //     });
//   // });
//   //
//   // app.use("/client/balance", function(req, res) {
//   //   accountManager.getBalance(req.user.clientID)
//   //     .then(function (output) {
//   //       output.musicoins = musicoinCore.getWeb3Reader().convertWeiToMusicoins(output.balance);
//   //       res.json(output);
//   //     })
//   //     .catch(function (err) {
//   //       console.log(`Request failed in ${name}: ${err}`);
//   //       res.status(500);
//   //       res.send(err);
//   //     });
//   // });
//   //
//   // app.post("/reward", jsonParser, (req, res) => {
//   //   musicoinCore.getWeb3Writer().sendCoins(req.body.recipient, req.body.musicoins, paymentAccountCredentialsProvider)
//   //     .then(tx => {
//   //       res.json({tx: tx});
//   //     })
//   //     .catch(function (err) {
//   //       console.log(`Reward request failed: ${err}`);
//   //       res.status(500);
//   //       res.send(err);
//   //     });
//   // });
//   //
//   // app.get("/sample/:address", isMashape, function(req, res) {
//   //   res.json({address: req.params.address, key: req.headers});
//   // });
//
//     process.on('SIGINT', () => {
//
//         console.log('Received SIGINT. Press Control-D to exit.');
//         process.exit();
//     });
//
//   // function isKnownUser(req, res, next) {
//   //
//   //   if (config.isDev) {
//   //     req.user = { clientID: "clientID" };
//   //     return next();
//   //   }
//   //   let clientID = req.headers["clientid"];
//   //   if (clientID) {
//   //     accountManager.validateClient(clientID)
//   //       .then(function() {
//   //         req.user = { clientID: clientID };
//   //         next();
//   //       })
//   //       .catch(function(err) {
//   //         console.warn(err);
//   //         console.warn((`Invalid clientid provided.
//   //         req.originalUrl: ${req.originalUrl},
//   //         req.headers: ${JSON.stringify(req.rawHeaders)},
//   //         req.clientIp: ${req.clientIp}
//   //       `));
//   //         res.status(401).send({ error: 'Invalid clientid: ' + clientID});
//   //       });
//   //   }
//   //   else {
//   //     console.warn((`No clientID provided.
//   //     req.originalUrl: ${req.originalUrl},
//   //     req.headers: ${JSON.stringify(req.rawHeaders)},
//   //     req.clientIp: ${req.clientIp}
//   //   `));
//   //     res.status(401).send({ error: 'Invalid user credentials, you must include a clientid header' });
//   //   }
//   // }
//
//   function isMashape(req, res, next) {
//     // allow all requests when running in dev mode
//     if (config.isDev) return next();
//
//     const secret = req.headers['x-mashape-proxy-secret'] || req.headers['X-Mashape-Proxy-Secret'];
//     if (secret == config.mashapeSecret) {
//       next();
//       return;
//     }
//     res.status(401).send({ error: 'Expected request from Mashape proxy' });
//   }
//
//   app.listen(config.port, function () {
//     console.log('Listening on port ' + config.port);
//     // console.log(JSON.stringify(config, null, 2));
//   });
//
//   Timers.setInterval(tryUpdatePendingReleases, 2*60*1000);
//   function tryUpdatePendingReleases() {
//     console.log("Checking for pending releases...");
//     LicenseKey.find({licenseAddress: null, failed: {"$ne": true}}).exec()
//       .then(function(records) {
//         console.log(`Found ${records.length} records to check`);
//         records.forEach(r => {
//           console.log("Checking tx: " + r.tx);
//           musicoinCore.getTxModule().getTransactionStatus(r.tx)
//             .then(function(result) {
//               if (result.status == "complete" && result.receipt && result.receipt.contractAddress) {
//                 r.licenseAddress = result.receipt.contractAddress;
//                 r.save(function(err) {
//                   if (err) return console.log("Failed to save key record");
//                   console.log("Updated key record: " + r.tx);
//                 })
//               }
//               else if (result.status == "failed") {
//                 console.log("Contract release failed: " + r.tx);
//                 r.failed = true;
//                 r.save(function(err) {
//                   if (err) return console.log("Failed to save key record");
//                   console.log("Updated key record: " + r.tx);
//                 })
//               }
//             })
//             .catch(function(err) {
//               console.log(err);
//             })
//         });
//       })
//   }
// }
