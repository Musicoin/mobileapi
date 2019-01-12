const express = require('express');
const Router = express.Router();
const GlobalController = require('../../Controllers/v1/GlobalController');
const Controller = new GlobalController();

Router.post('/search', Controller.search, Controller.sendJson);

module.exports = Router;