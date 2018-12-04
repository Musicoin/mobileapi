const mongoose = require('mongoose');
const url = process.env.MONGO_ENDPOINT?process.env.MONGO_ENDPOINT+"/musicoin-org":'mongodb://localhost/musicoin-org';
module.exports = mongoose.createConnection(url);