const express = require('express');
const Router = express.Router();
const Kernel = require('./../app/Kernel');

Router.post('/auth/signup', Kernel.authModule.registerNewUser.bind(Kernel.authModule));


module.exports = Router;
