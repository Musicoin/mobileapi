const express = require('express');
const Router = express.Router();
const Kernel = require('../Kernel');

Router.post('/signup', Kernel.authModule.registerNewUser.bind(Kernel.authModule));
Router.post('/credentials', Kernel.authModule.getAPICredentials.bind(Kernel.userModule));
Router.post('/authenticate', Kernel.authModule.authenticateUser.bind(Kernel.userModule));

module.exports = Router;
