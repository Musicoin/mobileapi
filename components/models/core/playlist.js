"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const coreConnection = require('./../connections/core');
// create the model for users and expose it to our app
module.exports = coreConnection.model('Playlist', mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    user: {
        email: String,
        profileAddress: String,
        name: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        }
    },
    songs: [String]
}));