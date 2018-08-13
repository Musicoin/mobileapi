"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const coreConnection = require('./../connections/core');
// create the model for users and expose it to our app
module.exports = coreConnection.model('IPFSResource', mongoose.Schema({
    hash: String,
    dateAdded: {
        type: Date,
        default: Date.now,
        index: true
    }
}));
//# sourceMappingURL=ipfs-resource.js.map
