const mongoose = require('mongoose');
// const config = require('./../../config/config-utils').loadConfig(process.argv);

mongoose.connect('mongodb://localhost/key-store');

module.exports = mongoose;