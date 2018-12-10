const express = require('express');
const Router = express.Router();
const AuthController = require('../../Controllers/v1/AuthController');

Router.post('/signup', AuthController.registerNewUser);
Router.post('/clientsecret', AuthController.getClientSecret);
Router.post('/verify', AuthController.authenticateUser);
Router.post('/accesstoken', AuthController.getAccessToken);
Router.post('/timeout', AuthController.getTokenValidity);

module.exports = Router;