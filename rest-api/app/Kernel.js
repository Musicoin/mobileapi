// load the core repo
const MusicoinCore = require("./../../mc-core");
const ConfigUtils = require('./../../components/config/config-utils');
const config = ConfigUtils.loadConfig(process.argv);
const contractOwnerAccount = config.contractOwnerAccount;
const musicoinCore = new MusicoinCore(config);

const Web3Writer = require('./../../components/blockchain/web3-writer');
const AccountManager = require("./../../components/account-manager");
const accountManager = new AccountManager();
const ArtistController = require('./Controllers/ArtistController');
const LicenseController = require('./Controllers/LicenseController');
const TxController = require('./Controllers/TxController');
const UserController = require('./Controllers/UserController');
const GlobalController = require('./Controllers/GlobalController');
const GlobalModule = new GlobalController();
const packageModule = require('./Controllers/PackageController');
const authModule = require('./Controllers/AuthController');
const ReleaseModule = require('./Controllers/ReleaseController');

const publishCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.publishingAccount, config.publishingAccountPassword);
const paymentAccountCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.paymentAccount, config.paymentAccountPassword);
const licenseModule = new LicenseController(musicoinCore.getLicenseModule(), accountManager, publishCredentialsProvider, paymentAccountCredentialsProvider, contractOwnerAccount);
const artistModule = new ArtistController(musicoinCore.getArtistModule(), publishCredentialsProvider, paymentAccountCredentialsProvider);
const txModule = new TxController(musicoinCore.getTxModule(), config.orbiterEndpoint, musicoinCore.getWeb3Reader());
const UserModule = new UserController(musicoinCore.getWeb3Reader(), config);

module.exports = {
  licenseModule: licenseModule,
  artistModule: artistModule,
  txModule: txModule,
  packageModule: packageModule,
  authModule: authModule,
  releaseModule: ReleaseModule,
  userModule: UserModule,
  globalController: GlobalModule
};
