const express = require('express');
const Router = express.Router();
const AuthController = require('../../Controllers/v1/AuthController');
const Controller = new AuthController();

Router.post('/signup', Controller.registerNewUser);
Router.post('/quicklogin', Controller.quickLogin);
Router.post('/clientsecret', Controller.getClientSecret);
Router.post('/verify', Controller.authenticateUser);
Router.post('/accesstoken', Controller.getAccessToken);
Router.post('/accesstoken/refresh', Controller.refreshAccessToken);
Router.post('/accesstoken/timeout', Controller.getTokenValidity);

module.exports = Router;