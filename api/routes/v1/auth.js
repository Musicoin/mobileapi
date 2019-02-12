const express = require('express');
const Router = express.Router();
const AuthController = require('../../Controllers/v1/AuthController');
const Controller = new AuthController();

const checkLoginParams = Controller.checkParams(Controller.schema.AuthSchema.quickLogin);
const checkSocialLoginParams = Controller.checkParams(Controller.schema.AuthSchema.socialLogin);

Router.post('/signup', Controller.registerNewUser, Controller.sendJson);
Router.post('/login', checkLoginParams, Controller.login, Controller.sendJson);
Router.post('/googlelogin', checkSocialLoginParams, Controller.loginWithGoogle, Controller.sendJson);
Router.post('/facebooklogin', checkSocialLoginParams, Controller.loginWithFacebook, Controller.sendJson);
Router.post('/twitterlogin', checkSocialLoginParams, Controller.loginWithTwitter, Controller.sendJson);
Router.post('/quicklogin', Controller.quickLogin, Controller.sendJson);
Router.post('/clientsecret', Controller.getClientSecret, Controller.sendJson);
Router.post('/verify', Controller.authenticateUser, Controller.sendJson);
Router.post('/accesstoken', Controller.getAccessToken, Controller.sendJson);
Router.post('/accesstoken/refresh', Controller.refreshAccessToken, Controller.sendJson);
Router.post('/accesstoken/timeout', Controller.getTokenValidity, Controller.sendJson);

module.exports = Router;