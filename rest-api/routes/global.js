const express = require('express');
const Router = express.Router();
const Kernel = require('./../app/Kernel');

Router.post('/search', Kernel.globalController.search.bind(Kernel.globalController));

module.exports = Router;
