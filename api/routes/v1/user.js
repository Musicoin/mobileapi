const express = require('express');
const Router = express.Router();
const UserController = require('../../Controllers/v1/UserController');
const Controller = new UserController();

Router.post('/playlist/delete', Controller.deletePlayList, Controller.sendJson);
Router.post('/playlist/add', Controller.addPlayList, Controller.sendJson);
Router.get('/playlist/all', Controller.getAllPlayList, Controller.sendJson);
Router.get('/playlist', Controller.getPlayList, Controller.sendJson);

module.exports = Router;