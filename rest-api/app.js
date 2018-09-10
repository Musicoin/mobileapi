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
app.use("/license", require('./routes/license'));
app.use('/artist', require('./routes/artist'));
app.use("/tx", require('./routes/tx'));

const Users = require('./../components/models/main/user');

app.get('/check/this', (req, res) => {
  Users.find().then(users => {
    res.send(users);
  })
});

app.listen(config.port, function() {
  console.log('Listening on port ' + config.port);
});
