const express = require('express');
const Router = express.Router();
const sendSeekable = require('send-seekable');
const TrackController = require('../../Controllers/v1/TrackController');

Router.get('/download/:address', sendSeekable,TrackController.downloadTrack);

module.exports = Router;