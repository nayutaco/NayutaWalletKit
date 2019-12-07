module.exports = (function() {
  var self = {};
  var alias = "userKeyStoreV1";
  var Identity = require("ti.identity");

  self.createUserKey = function(callback) {

    if(globals.userKey != null){
      globals.console.log("user key already exists")
      callback(true, globals.userKey);
      return;
    }

    globals.console.log("generating user key and saving to keychain")
    var userKey = self.generateRandomData(16);

    if (userKey != undefined && userKey != "" && userKey.length == 32) { //check hex string is 32 chars long for 128 bit key
     
      self.saveItem(
        userKey,
        function(success) {

          callback(success, userKey);

        });

    } else {
      callback(false, "error creating user key");
    }

  }

  self.generateRandomData = function(size) {

    if (OS_IOS) {

      var secureRandom = require("ioscrypto/secureRandom");
      size = 16;
      var secureRandomObj = new secureRandom();

      //need to convert to string by adding "" as native iOS module returns NSString object
      var entropy = secureRandomObj.generateRandomBytes() + "";

      if (entropy == undefined || entropy == "") {
        throw "error creating entropy";
      }
      return entropy;

    } else if (OS_ANDROID) {
      var androidCrypto = require("com.indiesquare.androidcrypto.AndroidCrypto")
      var entropy = androidCrypto.generateRandomBytes(size) + "";

      return entropy;
    }
    throw "not supported";

  };

  self.sha256 = function(hexString) {

    if (OS_IOS) {

      throw "not implemented"

    } else if (OS_ANDROID) {
      var androidCrypto = require("com.indiesquare.androidcrypto.AndroidCrypto")
      var hash = androidCrypto.sha256(hexString) + "";

      return hash;
    }
    throw "not supported";

  };



  self.saveItem = function(data, callback) {

    var keychainItem = Identity.createKeychainItem({
      identifier: alias
    });

    // Triggered when the keychain item was successfully saved
    keychainItem.addEventListener('save', function(e) {
      // Notify the user that the operation succeeded or failed
      if (e.success == 1) {
        callback(true);
      } else {
        callback(false);
      }
      globals.console.log("key chain save", e);
    });

    // Triggered when the keychain item was successfully saved
    keychainItem.addEventListener('update', function(e) {
      // Notify the user that the operation succeeded or failed
      if (e.success == 1) {
        callback(true);
      } else {
        callback(false);
      }
      globals.console.log("key chain updated", e);
    });

    keychainItem.fetchExistence(function(e) {
      if (e.exists) {

        keychainItem.update(data);

      } else {

        keychainItem.save(data);

      }
    });

  };

  self.loadItem = function(callback) {
    globals.console.log("loading " + alias + " from keystore");

    var keychainItem = Identity.createKeychainItem({
      identifier: alias
    });

    keychainItem.addEventListener('read', function(e) {

      if (e.success == 1) {
        
          callback(true, e.value);
        

      } else {

        globals.console.error("read keychain error", e);
        callback(false);

      }
    });
    keychainItem.fetchExistence(function(e) {
      globals.console.log("keychain item check", e);
      if (e.exists) {

        keychainItem.read();

      } else {

        callback(true, undefined);

      }
    });

  };

  self.resetItem = function(callback) {

    var keychainItem = Identity.createKeychainItem({
      identifier: alias
    });

    keychainItem.addEventListener('reset', function(e) {
      globals.console.log("reset keychain", e);
      if (e.success == 1) {

        callback(true);

      } else {

        globals.console.error("reset keychain error", e);
        callback(false);

      }
    });
    keychainItem.fetchExistence(function(e) {
      globals.console.log("keychain item check", e);
      if (e.exists) {

        keychainItem.reset();

      } else {

        callback(true);

      }
    });

  };

  return self;
}());