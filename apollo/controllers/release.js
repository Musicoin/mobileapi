const Promise = require('bluebird');
const LicenseKey = require('../../db/core/key');
const defaultRecords = 20;
const maxRecords = 100;
const defaultMaxGroupSize = 8;

class Release {
    constructor(_licenseModule, _accountManager, _publishCredentialsProvider, _paymentAccountCredentialsProvider, _contractOwnerAccount) {
        this.accountManager = _accountManager;
        this.licenseModule = _licenseModule;
        this.publishCredentialsProvider = _publishCredentialsProvider;
        this.paymentAccountCredentialsProvider = _paymentAccountCredentialsProvider;
        this.contractOwnerAccount = _contractOwnerAccount;
    }

    async getRecentPlays(args) {
        return this.licenseModule.getRecentPlays(args.limit)
    }

    async getTopPlayed(args) {
        return this.licenseModule.getTopPlayed(args.limit, args.genre)
    }
}

module.exports = Release;