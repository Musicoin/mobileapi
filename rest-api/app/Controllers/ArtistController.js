const express = require('express');

const LicenseKey = require('../../../components/models/core/key');

const defaultRecords = 20;
const maxRecords = 100;



function getLimit(req) {
    return Math.max(0, Math.min(req.query.limit || defaultRecords, maxRecords));
}

class ArtistController {

    constructor(_artistModule, _publishCredentialsProvider, _hotWalletCredentialsProvider) {
        this.artistModule = _artistModule;
        this.publishCredentialsProvider = _publishCredentialsProvider;
        this.hotWalletCredentialsProvider = _hotWalletCredentialsProvider;
    };

    getProfileByAddress(Request) {
        this.artistModule.getArtistByProfile(Request.params.address).then(res => {
            Response.send(res);
        });
    }

    getNewArtists(Request, Response) {
       this.artistModule.getNewArtists(getLimit(Request)).then(res => {
           Response.send(res);
       });
    }

    getFeaturedArtists(Request) {
       this.artistModule.getFeaturedArtists(getLimit(Request)).then(res => {
           Response.send(res);
       })
    }

    find(Request) {
       this.artistModule.findArtists(getLimit(Request), Request.query.term).then(res => {
           Response.send(res);
       })
    }

    profile(Request) {
        this.publishCredentialsProvider.getCredentials()
            .then(function(credentials) {
                const releaseRequest = {
                    profileAddress: Request.body.profileAddress,
                    owner: credentials.account,
                    artistName: Request.body.artistName,
                    imageUrl: Request.body.imageUrl,
                    socialUrl: Request.body.socialUrl,
                    descriptionUrl: Request.body.descriptionUrl
                };
                console.log("Got profile POST request: " + JSON.stringify(releaseRequest));
                return  this.artistModule.releaseProfile(releaseRequest)
            })
            .then(function(tx) {
                Response.send( {tx: tx} );
            });
    }

    send(Request) {
          this.artistModule.sendFromProfile(Request.body.profileAddress, Request.body.recipientAddress, Request.body.musicoins)
            .then(function(tx) {
                Response.send({tx: tx});
            });
    }

    ppp(Request, Response) {
        const context = {};
        return LicenseKey.findOne({licenseAddress: Request.body.licenseAddress}).exec()
            .then(record => {
                if (!record) throw new Error("Key not found for license: " + Request.body.licenseAddress);
                context.key = record.key;
                return  this.artistModule.pppFromProfile(Request.body.profileAddress, Request.body.licenseAddress,  this.hotWalletCredentialsProvider)
            })
            .then(transactions => {
                context.transactions = transactions;
                Response.send(context);
            })
    }
}




module.exports = ArtistController;
