const express = require('express');
const session = require('express-session');
const {
  MemoryStore
} = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const ConfigUtils = require('./config/config-utils');
const RateLimit = require('express-rate-limit');
const AuthMiddleware = require('./api/Middlewares/AuthMiddleware');
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

app.set('views', './api/views');
app.set('view engine', 'pug');

mailer.extend(app, {
  from: config.MailClient.email,
  host: config.MailClient.host,
  secureConnection: true,
  port: config.MailClient.port,
  transportMethod: config.MailClient.transportMethod,
  auth: config.MailClient.auth
});

app.use(require('./api/routes/auth'));
mongoose.connect(config.keyCoreDatabaseUrl);
app.use('/', AuthMiddleware.checkTokens(store), RateLimiter);
app.use('/', require('./api/routes/global'));
app.use('/user', require('./api/routes/user'));
app.use('/package', require('./api/routes/package'));
app.use('/release', require('./api/routes/release'));
app.use('/license', require('./api/routes/license'));
app.use('/artist', require('./api/routes/artist'));
app.use('/tx', require('./api/routes/tx'));

app.listen(config.port, function() {
  console.log('Listening on port ' + config.port);
});
