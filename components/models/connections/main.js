const mongoose = require('mongoose');
// const config = require('./../../config/config-utils').loadConfig();

mongoose.connect('mongodb://localhost/musicoin-org');

module.exports = mongoose;