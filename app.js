require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const ConfigUtils = require('./config/config');
const RateLimit = require('express-rate-limit');
const AuthMiddleware = require('./api/Middleware/AuthMiddleware');
const config = ConfigUtils.loadConfig(process.argv);
const apollo = require('./apollo/server');

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

const RateLimiter = new RateLimit({
  windowMs: 1000,
  max: 100,
  delayMs: 0
});

app.use(session({
  name: "musicoin-api",
  secret: 'mcapi',
  cookie: {
      maxAge: 60000
  }
}))

app.use("/",require('./api/routes/auth'));
app.use("/v1",require('./api/routes/v1/auth'));
app.use("/v1/track",require('./api/routes/v1/track'));

app.use('/', AuthMiddleware.checkTimeouts(), RateLimiter);

app.use("/v1/artist", require("./api/routes/v1/artist"));

apollo.config(app);

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
