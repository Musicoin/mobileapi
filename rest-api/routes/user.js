const express = require('express');
const Router = express.Router();
const Kernel = require('./../app/Kernel');

Router.post('/delete', Kernel.userModule.deleteUserAccount.bind(Kernel.userModule));
Router.delete('/delete', Kernel.userModule.deleteUserAccount.bind(Kernel.userModule));
Router.get('/delete/verify/:token', Kernel.userModule.verifyUserAccountDeleting.bind(Kernel.userModule));
Router.get('/ismember/:id', Kernel.userModule.isMember.bind(Kernel.userModule));
Router.get('/info/:id', Kernel.userModule.getUserInfo.bind(Kernel.userModule));
module.exports = Router;
