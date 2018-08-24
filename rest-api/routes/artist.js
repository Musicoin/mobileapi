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
Router.get('/info/:publicKey', ArtistController.getArtistInfo.bind(ArtistController));
Router.get('/totalplays/:publicKey', ArtistController.getArtistPlays.bind(ArtistController));
Router.get('/totaltips/:publicKey', ArtistController.getArtistTips.bind(ArtistController));
Router.get('/isartist', ArtistController.isArtist.bind(ArtistController));
Router.get('/isverified', ArtistController.isArtistVerified.bind(ArtistController));
Router.get('/earnings/:publicKey', ArtistController.getArtistEarnings.bind(ArtistController));
module.exports = Router;