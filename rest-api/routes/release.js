const express = require('express');
const Router = express.Router();
const { releaseModule } = require('./../app/Kernel');

Router.get('/top', releaseModule.getTopTracks.bind(releaseModule));

module.exports = Router;