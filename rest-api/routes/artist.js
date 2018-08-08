const express = require('express');
const Router = express.Router();
const Kernel = require('./../app/Kernel');

const ArtistController = Kernel.artistModule;

Router.get('/profile/:address', ArtistController.getProfileByAddress.bind(ArtistController));
Router.get('/new/',ArtistController.getNewArtists.bind(ArtistController));
Router.get('/featured/',ArtistController.getFeaturedArtists.bind(ArtistController));
Router.get('/find/',ArtistController.find.bind(ArtistController));
Router.post('/profile/', ArtistController.profile.bind(ArtistController));
Router.post('/send/', ArtistController.send.bind(ArtistController));
Router.post('/ppp/', ArtistController.ppp.bind(ArtistController));

module.exports = Router;