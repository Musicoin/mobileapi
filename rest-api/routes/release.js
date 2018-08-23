const express = require('express');
const Router = express.Router();
const { releaseModule } = require('./../app/Kernel');

Router.get('/top', releaseModule.getTopTracks.bind(releaseModule));
Router.get('/genres', releaseModule.getGenres.bind(releaseModule));
Router.get('/details/:id', releaseModule.getTrackDetails.bind(releaseModule));
Router.get('/random', releaseModule.getRandomTrack.bind(releaseModule));
module.exports = Router;