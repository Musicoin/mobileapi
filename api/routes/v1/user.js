const express = require('express');
const Router = express.Router();
const UserController = require('../../Controllers/v1/UserController');
const Controller = new UserController();

Router.post('/playlist/delete', Controller.deletePlayList);
Router.post('/playlist/add', Controller.addPlayList);
Router.get('/playlist/all', Controller.getAllPlayList);
Router.get('/playlist', Controller.getPlayList);

module.exports = Router;