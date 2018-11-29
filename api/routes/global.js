const express = require('express');
const Router = express.Router();
const Kernel = require('../Kernel');

Router.post('/search', Kernel.globalController.search.bind(Kernel.globalController));
Router.post('/v1.0/search', Kernel.globalController.searchV1.bind(Kernel.globalController));
Router.post('/getsongsbya', Kernel.globalController.getAllSongs.bind(Kernel.globalController));
Router.post('/getsongsbyn', Kernel.globalController.getAllSongsByName.bind(Kernel.globalController));

module.exports = Router;
