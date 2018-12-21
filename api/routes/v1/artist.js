const express = require('express');
const Router = express.Router();
const ArtistController = require('../../Controllers/v1/ArtistController');

Router.get('/description/:hash', ArtistController.getArtistDescription);

module.exports = Router;