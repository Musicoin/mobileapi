const mongoose = require('mongoose');
const coreConnection = require('./../connections/core');
const bcrypt = require('bcrypt-nodejs');
let Validator = require('fastest-validator');
let v = new Validator();
let emailSchema = {
    email: { type: "email" }
};
// define the schema for our user model
const userSchema = mongoose.Schema({
    profileAddress: String,
    updatePending: {
        type: Boolean,
        index: true,
        default: false
    },
    AOWBadge:{
        type:Boolean,
        default:false
    },
    pendingTx: String,
    local: {
        id: String,
        email:{
            type: String,
            unique: true
        },
        username: String,
        password: String,
        phone: String,
        resetCode: String,
        resetExpiryTime: Date
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        username: String,
        name: String,
        url: String,
        urlIsPublic: {
            type: Boolean,
            default: true
        }
    },
    twitter: {
        id: String,
        token: String,
        email: String,
        displayName: String,
        username: String,
        picture: String,
        url: String,
        urlIsPublic: {
            type: Boolean,
            default: true
        }
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String,
        url: String,
        picture: String
    },
    soundcloud: {
        id: String,
        token: String,
        name: String,
        username: String,
        picture: String
    },
    draftProfile: {
        artistName: String,
        description: String,
        social: Object,
        ipfsImageUrl: String,
        heroImageUrl: String,
        genres: [String],
        regions: [String],
        version: Number
    },
    hideProfile: Boolean,
    joinDate: {
        type: Date,
        default: Date.now
    },
    mostRecentReleaseDate: Date,
    invitesRemaining: {
        type: Number,
        default: 5
    },
    reusableInviteCode: String,
    following: [String],
    invite: {
        noReward: {
            type: Boolean,
            default: false
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        invitedAs: String,
        invitedOn: {
            type: Date,
            default: Date.now
        },
        inviteCode: String,
        groupInviteCode: String,
        claimed: {
            type: Boolean,
            default: false
        },
        clicked: {
            type: Boolean,
            default: false
        }
    },
    preferences: {
        notifyOnComment: {
            type: Boolean,
            default: true
        },
        minimizeHeroInFeed: Boolean,
        activityReporting: {
            type: String,
            default: 'week'
        },
        feedFilter: String
    },
    directTipCount: {
        type: Number,
        default: 0
    },
    followerCount: {
        type: Number,
        default: 0
    },
    termsOfUseVersion: String,
    pendingInitialization: Boolean,
    isMusician: {
        type: String,
        default: 'listener'
    },
    blocked: Boolean,
    verified: Boolean,
    accountLocked: Boolean,
    freePlaysRemaining: {
        type: Number,
        default: 100
    },
    nextFreePlayback: Date,
    currentPlay: {
        licenseAddress: String,
        release: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Release'
        },
        encryptedKey: String
    },
    voteMultiplier: {
        type: Number,
        default: 1
    },
    primaryEmail: {
        type: String,
        trim: true,
        validate: {
            validator: function (pEmail) {
                v.validate({ email: pEmail }, emailSchema);
            },
            message: '{VALUE} is not a valid email. Please provide a valid email address!'
        }
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    membershipLevel: {
        type: Number,
        default: 1
    }
});

// create the model for users and expose it to our app
module.exports = coreConnection.model('User', userSchema);
//# sourceMappingURL=user.js.map
