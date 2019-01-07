const express = require('express');
const Router = express.Router();
const ArtistController = require('../../Controllers/v1/ArtistController');
const Controller = new ArtistController({});

Router.get('/description/:hash', Controller.getArtistDescription);
Router.get('/profile/:address', Controller.getProfileByAddress);
Router.post('/tip', Controller.tipArtist);
Router.get('/ofweek', Controller.getArtistOfWeek);

module.exports = Router;