const MediaProvider = require('./media-provider');
const instance = new MediaProvider("http://localhost:8080","http://localhost:5001");

module.exports = instance;