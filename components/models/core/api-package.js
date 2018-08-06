const mongoose = require('./../connections/core');

// define the schema for our user model
const packageSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    limitApiCalls: {
        type: Number,
        default: 1000
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('APIpackages', packageSchema);