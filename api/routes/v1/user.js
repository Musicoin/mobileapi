const express = require('express');
const Router = express.Router();
const UserController = require('../../Controllers/v1/UserController');
const Controller = new UserController();

Router.post('/playlist/create', Controller.createPlayList);
Router.post('/playlist/add', Controller.addToPlayList);
Router.get('/playlist/:id', Controller.getPlayList);
Router.get('/playlist', Controller.getAllPlayList);

module.exports = Router;