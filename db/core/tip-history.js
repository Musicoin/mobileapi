"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const coreConnection = require('./../connections/core');
// create the model for users and expose it to our app
module.exports = coreConnection.model('TipHistory', mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    release: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Release',
        index: true
    },
    tipCount: Number,
    date: Date
}));
//# sourceMappingURL=release.js.map
