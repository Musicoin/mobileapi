const express = require('express');
const Router = express.Router();
const Kernel = require('./../app/Kernel');

Router.post('/auth/signup', Kernel.authModule.registerNewUser.bind(Kernel.authModule));
Router.post('/auth/credentials', Kernel.authModule.getAPICredentials.bind(Kernel.userModule));
Router.post('/authenticate', Kernel.authModule.authenticateUser.bind(Kernel.userModule));

module.exports = Router;
