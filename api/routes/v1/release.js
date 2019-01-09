const express = require('express');
const Router = express.Router();
const ReleaseController = require('../../Controllers/v1/ReleaseController');
const Controller = new ReleaseController();

Router.get('/detail/:address', Controller.getTrackDetail);
Router.get('/recent', Controller.getRecentTracks);
Router.get('/bygenre', Controller.getTracksByGenre);
Router.get('/byartist', Controller.getTracksByArtist);
Router.post('/tip', Controller.tipTrack);

module.exports = Router;