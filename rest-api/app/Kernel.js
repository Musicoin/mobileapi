const ConfigUtils = require('./../../components/config/config-utils');
const Web3Writer = require('./../../components/blockchain/web3-writer');
const MusicoinCore = require("./../../mc-core");
const ArtistController = require('./Controllers/ArtistController');
const LicenseController = require('./Controllers/LicenseController');
const TxController = require('./Controllers/TxController');
const UserController = require('./Controllers/UserController');
const GlobalController = require('./Controllers/GlobalController');

const config = ConfigUtils.loadConfig(process.argv);

const musicoinCore = new MusicoinCore(config);
const contractOwnerAccount = config.contractOwnerAccount;
const publishCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.publishingAccount, config.publishingAccountPassword);
const paymentAccountCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.paymentAccount, config.paymentAccountPassword);


const AccountManager = require("./../../components/account-manager");
const accountManager = new AccountManager();
const licenseModule = new LicenseController(musicoinCore.getLicenseModule(), accountManager, publishCredentialsProvider, paymentAccountCredentialsProvider, contractOwnerAccount);
const artistModule = new ArtistController(musicoinCore.getArtistModule(), publishCredentialsProvider, paymentAccountCredentialsProvider);
const txModule = new TxController(musicoinCore.getTxModule(), config.orbiterEndpoint, musicoinCore.getWeb3Reader());
const packageModule = require('./Controllers/PackageController');
const authModule = require('./Controllers/AuthController');
const ReleaseModule = require('./Controllers/ReleaseController');
const UserModule = new UserController(musicoinCore.getWeb3Reader(), config);
const GlobalModule = new GlobalController();


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
