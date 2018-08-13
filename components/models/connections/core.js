const mongoose = require('mongoose');

module.exports = mongoose.createConnection('mongodb://localhost/key-store');