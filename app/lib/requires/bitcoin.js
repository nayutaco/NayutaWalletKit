module.exports = (function () {
  var self = {};

  var bitcoin = require('vendor/util/bitcoinjs-lib')
  self.bitcoin = bitcoin;
  var bip21lib = bitcoin.bip21;

  self.base64toHEX = function (base64) {

    return bitcoin.buffer(base64, 'base64').toString('hex');

  };

  self.checkExpired = function (req) {

    var timeExp = (Date.now() / 1000) - req.timestamp;

    if (timeExp > req.expiry) {

      return true;

    }

    return false;

  };

  self.decodeLNPayReq = function (req) {
    var res = null;
    try {
      res = tools.bolt11.decode(req);
    } catch (e) {
      console.error(e);
      return null;
    }
    return res;
  };

  self.validateAddress = function (address, network = "mainnet") {
    var bitcoinNetwork = bitcoin.networks.bitcoin;
    if (network == "testnet") {
      bitcoinNetwork = bitcoin.networks.testnet;
    }
    try {
      bitcoin.address.toOutputScript(address, bitcoinNetwork);
      return true
    } catch (e) {
      return false
    }

  }

  self.decodeBip21 = function (uri) {

    try {
      var decoded = bip21lib.decode(uri);

      var uri = {
        "address": decoded.address,
        "amount": decoded.options.amount
      };

      return uri;
    } catch (e) {
      globals.console.error(e);
      return null;
    }

  };

  return self;
}());