"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const mongoose = require('mongoose');
const connectionMain = require('./../connections/core');

module.exports = connectionMain.model('ReleaseStats', mongoose.Schema({
    release: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Release',
        index: true
    },
    startDate: {
        type: Date,
        index: true
    },
    duration: {
        type: String,
        index: true
    },
    playCount: {
        type: Number,
        default: 0
    },
    tipCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    }
}));