const mongoose = require('mongoose');
const coreConnection = require('./../connections/core');
// define the schema for our user model
const userSchema = mongoose.Schema({
  clientId: {
    type: Object,
    unique: true,
    required: true
  },
  clientSecret: {
    type: String,
    unique: true,
    required: true
  },
  limitApiCalls: {
    type: Number,
    default: 1000
  },
  calls: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    min: 0,
    default: 0
  },
  tie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApiPackage'
  }
});

// create the model for users and expose it to our app
module.exports = coreConnection.model('APIUserAccount', userSchema);