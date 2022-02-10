const mongoose = require('mongoose');
const url = process.env.MONGO_ENDPOINT?process.env.MONGO_ENDPOINT+"/musicoin-org":'mongodb://localhost/musicoin-org';
mongoose.connect(url, { useNewUrlParser: true , useUnifiedTopology: true, useCreateIndex: true});
module.exports = mongoose;
