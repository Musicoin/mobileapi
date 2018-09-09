"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('./../connections/core');
module.exports = mongoose.model('UserPlayback', mongoose.Schema({
    contractAddress: String,
    release: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Release',
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    anonymousUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnonymousUser',
        index: true
    },
    playbackDate: {
        type: Date,
        default: Date.now,
        index: true
    }
}));
//# sourceMappingURL=user-playback.js.map
