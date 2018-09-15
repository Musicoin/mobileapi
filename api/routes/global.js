const express = require('express');
const Router = express.Router();
const Kernel = require('../Kernel');

Router.post('/search', Kernel.globalController.search.bind(Kernel.globalController));

module.exports = Router;
