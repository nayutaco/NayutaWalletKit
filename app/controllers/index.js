require("init");
globals.demoPhrase = "abandon acid over maximum media busy true price laugh elegant boil iron slot february fan wait alpha current powder manage draft surge recycle company";

globals.display.width70 = globals.display.width * 0.7;
globals.display.width90 = globals.display.width * 0.9;

globals.synced = false;
globals.unlocked = false;
globals.dataDir = "";
globals.lndMobileStarted = false;
globals.alreadyUnlocked = false;
globals.lnGRPC = require("/requires/lnrpc_controller");
globals.currentPubkey = "";
globals.inRecoveryMode = false;
globals.blockHeight = {
  mainnet: 585935,
  testnet: 1569489
};


globals.getCurrency = function () {
  if (OS_ANDROID) {
    var currentCode = Ti.App.Properties.getString(
      "currency",
      Ti.Locale.getCurrencyCode(Ti.Platform.locale)
    );
  } else {
    var currentCode = Ti.App.Properties.getString(
      "currency",
      Ti.Locale.getCurrencyCode(Ti.Locale.currentLocale)
    );
  }

  let availableCurrencies = Object.keys(globals.rates);

  globals.console.log("currentCode", currentCode)


  if (currentCode == undefined || currentCode == "" || availableCurrencies.indexOf(currentCode.toLowerCase()) == -1) {

    globals.console.error("currency " + currentCode + " not found setting USD")
    currentCode = "USD";

  }
  globals.console.log("currentCode", currentCode)

  return currentCode;


};

globals.bluetoothController = require("/requires/bluetooth_controller");

if (Ti.App.Properties.getString("mode", "") == "lndMobile") {
  Alloy.Globals.network = Ti.App.Properties.getString(
    "lndMobileNetwork",
    "mainnet"
  );

  if (Ti.App.Properties.getBool("alreadyUpgradedV1", false) == false) {
    Ti.App.Properties.setBool("has_wallet_" + Alloy.Globals.network, true);
  }
}

Ti.App.Properties.setBool("alreadyUpgradedV1", true);

globals.invoiceUpdateFunctions = {};
var denomination = Ti.App.Properties.getString("denomination", "");
if (denomination == "") {
  Ti.App.Properties.setString("denomination", "SAT");
}

globals.removeEverything = function (callback) {
  Ti.App.Properties.removeAllProperties();
  globals.console.log("removing user data");
  globals.nativeCrypto.resetItem(function (success) {
    if (success) {
      globals.console.log("loading!");

      callback(true);
    } else {
      globals.console.error("removing user data error");
      callback(false);
    }
  });
};

globals.console.log("loading keychain");
globals.nativeCrypto.loadItem(function (success, userKey) {
  globals.console.log("loading keychain res");
  if (success) {
    if (userKey != undefined) {
      globals.console.log("loading keychain can load");

      globals.userKey = userKey;

      if (
        Ti.App.Properties.getString(globals.accountsKey, undefined) ==
        undefined &&
        Ti.App.Properties.getString("passphrase", undefined) == undefined
      ) {
        globals.console.log("going to sign in 1");

        // no grpc or passphrase saved
        goToSignIn();
        return;
      }

      var passcodeHashEncrypted = Ti.App.Properties.getString("passcode");

      globals.passCodeHash = globals.cryptoJS.AES.decrypt(
        passcodeHashEncrypted,
        globals.userKey
      ).toString(globals.cryptoJS.enc.Utf8);

      if (
        Ti.App.Properties.getString("mode", "") == "lndMobile" &&
        Ti.App.Properties.getString("passphrase", undefined) != undefined
      ) {
        globals.decryptedPassphrase = globals.decryptPassphrase(
          Ti.App.Properties.getString("passphrase", undefined),
          globals.userKey
        );
      } else {
        globals.decryptedPassphrase = " ";
      }

      // check if they have switched network, if they have we need to check if they have a wallet and if not create it
      if (
        Ti.App.Properties.getString("mode", "") == "lndMobile" &&
        Ti.App.Properties.getBool(
          "has_wallet_" + Alloy.Globals.network,
          false
        ) == false
      ) {
        globals.util.loadStartUpInfo(function (error, response) {
          if (error == false) {
            globals.console.log("creating wallet for new network");
            globals.lnGRPC.startLNDMobile(function (error, response) {
              globals.console.log("lndMobile1", error);
              globals.console.log("lndMobile1", response);

              if (error == true) {
                alert(response);
                return;
              }
              globals.lnGRPC.createWallet(
                globals.createPassword(globals.passCodeHash),
                globals.decryptedPassphrase.split(","),
                "",
                function (error, response) {
                  globals.console.log("create wallet", error);
                  globals.console.log("create wallet", response);
                  if (error == true) {
                    alert(response);
                    return;
                  }

                  if (
                    globals.savePassphrase(
                      globals.decryptedPassphrase,
                      globals.userKey
                    )
                  ) {
                    Ti.App.Properties.setString("mode", "lndMobile");
                    Ti.App.Properties.setBool(
                      "has_wallet_" + Alloy.Globals.network,
                      true
                    );

                    globals.alreadyUnlocked = true; // because we created a new wallet so no need to unlock

                    startFrame();
                  }
                }
              );
            });
          } else {
            alert(L("error_loading").format({ message: response }));
          }
        });
      } else {
        startFrame();
      }

      return;
    }
  } else {
    globals.console.error("error loading from keychain");
  }
  globals.console.log("going to sign in 2");
  goToSignIn();
});

function goToSignIn() {
  Alloy.createController("signin")
    .getView()
    .open();
}

function startFrame() {
  globals.console.log("start frame");
  globals.screenView = Alloy.createController("frame").getView();

  globals.screenView.open();
}

globals.savePassphrase = function (passphrase, key) {
  if (key == undefined || key == "") {
    alert("user key should not be null");
    return false;
  }

  if (passphrase == undefined || passphrase == "") {
    alert("user key should not be null");
    return false;
  }

  var encrypted = globals.cryptoJS.AES.encrypt(passphrase, key).toString();
  Ti.App.Properties.setString("passphrase", encrypted);
  Ti.App.Properties.setString("mode", "lndMobile");
  return true;
};

globals.encryptConfig = function (config, key) {
  config = JSON.stringify(config);
  if (key == undefined || key == "") {
    throw "user key should not be null";
  }
  var encrypted = globals.cryptoJS.AES.encrypt(config, key).toString();
  return encrypted;
};

globals.decryptConfig = function (encryptedConfig, key) {
  if (key == undefined || key == "") {
    throw "user key should not be null";
  }

  if (encryptedConfig == undefined) {
    globals.console.log("config undefined");
    return undefined;
  }
  try {
    var decryptedObj = globals.cryptoJS.AES.decrypt(
      encryptedConfig,
      key
    ).toString(globals.cryptoJS.enc.Utf8);
    return JSON.parse(decryptedObj);
  } catch (e) {
    globals.console.error("error decrypt", e);
    return undefined;
  }
};

globals.decryptPassphrase = function (encryptedPassphrase, key) {
  if (key == undefined || key == "") {
    throw "user key should not be null";
  }

  if (encryptedPassphrase == undefined) {
    globals.console.log("encryptedPassphrase undefined");
    return undefined;
  }
  try {
    var decryptedObj = globals.cryptoJS.AES.decrypt(
      encryptedPassphrase,
      key
    ).toString(globals.cryptoJS.enc.Utf8);
    return decryptedObj;
  } catch (e) {
    globals.console.error("error decrypt", e);
    return undefined;
  }
};

function decodeBase64Url(input) {
  // Replace non-url compatible chars with base64 standard chars
  input = input.replace(/-/g, "+").replace(/_/g, "/");

  // Pad out with standard base64 required padding characters
  var pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error(
        "InvalidLengthError: Input base64url string is the wrong length to determine padding"
      );
    }
    input += new Array(5 - pad).join("=");
  }

  return input;
}
globals.parseConfig = function (config) {
  globals.console.log("config is", config);
  var certificate = "";

  if (config.configurations != undefined) {
    // probably btcpay qrcode
    globals.console.log("btcpay");

    var configs = config.configurations;

    var mainConfig = configs[0];

    if (mainConfig.host == undefined) {
      mainConfig.host = mainConfig.uri;
    }

    var url = mainConfig.host;

    mainConfig.certificate = "";
    mainConfig.url = url;

    return mainConfig;
  } else if ((config + "").indexOf("lndconnect:") != -1) {
    // probably lnd connect
    globals.console.log("lndconnect");
    config = config.replace("lndconnect://", "");
    config = config.split("?cert=");

    var ip = config[0];
    var rest = config[1];

    rest = rest.split("&macaroon=");

    var cert = rest[0];
    cert = decodeBase64Url(cert);
    cert =
      "-----BEGIN CERTIFICATE-----\n" + cert + "\n-----END CERTIFICATE-----";

    var macaroon = rest[1];
    macaroon = decodeBase64Url(macaroon);

    var urlPort = ip.split(":");

    var mainConfig = {
      port: urlPort[1],
      url: urlPort[0],
      certificate: cert,
      macaroon: globals.bitcoin.base64toHEX(macaroon)
    };
    return mainConfig;
  } else {
    // probably zapconnect
    globals.console.log("zap connect");
    if (
      config.ip == undefined ||
      config.c == undefined ||
      config.m == undefined
    ) {
      return "error";
    }
    var certificate = "";
    if (config.c != undefined && config.c != "") {
      certificate =
        "-----BEGIN CERTIFICATE-----\n" +
        config.c +
        "\n-----END CERTIFICATE-----";
    }
    var urlPort = config.ip.split(":");

    var mainConfig = {
      port: urlPort[1],
      url: urlPort[0],
      certificate: certificate,
      macaroon: globals.bitcoin.base64toHEX(config.m)
    };

    return mainConfig;
  }
};

globals.continueConnect = function (e, callback, error) {
  if (e.indexOf("lndconnect:") != -1) {
    callback(e);
  } else if (e.indexOf("config=") != -1) {
    var xhr = Ti.Network.createHTTPClient();

    var url = e.replace("config=", "");

    xhr.open("GET", url);
    (xhr.onload = function () {
      var config = JSON.parse(this.responseText);

      callback(config);
    }),
      (xhr.onerror = function (e) {
        globals.console.error(e);
        error(e);
      });
    xhr.send();
  } else {
    try {
      var config = JSON.parse(e);
    } catch (e) {
      globals.console.error(e);
      error(L("error_parsing_config"));
      return;
    }

    callback(config);
  }
};

if (OS_IOS) {
  if (Ti.App.Properties.getString("mode", "") == "lndMobile") {
    Ti.App.addEventListener("close", function () {
      globals.lnGRPC.stopLND(function (error, response) {
        globals.console.log("stopLND1", error);
        globals.console.log("stopLND1", response);
      });
    });
  }
}

globals.addAccounts = function (pubkey, details) {
  globals.console.log(pubkey, details);
  var accounts = Ti.App.Properties.getString(globals.accountsKey, "{}");
  accounts = JSON.parse(accounts);

  accounts[pubkey] = details;
  var accountsJSON = JSON.stringify(accounts);
  globals.console.log(accounts);
  Ti.App.Properties.setString(globals.accountsKey, accountsJSON);
};

globals.checkConnection = function (configRaw, callback) {
  config = globals.parseConfig(configRaw);
  if (config == "error") {
    callback(false, "error unable to parse config");
    return;
  }
  globals.console.log("connecting via gRPC or REST");
  globals.lnGRPC.connect(
    config.url,
    config.port,
    config.certificate,
    config.macaroon,
    function (error, response) {
      globals.console.log("connected", response);
      globals.console.log("connected error", error);
      if (error == true) {
        globals.console.log("error", error);

        callback(false, response);
        return;
      }

      globals.console.log("checking getinfo");
      globals.stopPing();
      globals.lnGRPC.getInfo("grpc", function (error, response) {
        if (error == true) {
          callback(false, response);
          return;
        }

        callback(true, "");
      });
    }
  );
};
if (OS_IOS) {
  Ti.Gesture.addEventListener("shake", function (e) {
    if (Ti.App.Properties.getString("mode", "") == "lndMobile") {
      Alloy.createController("/components/logs_view")
        .getView()
        .open();
    }
  });
}

globals.stopLND = function (callback) {
  if (Ti.App.Properties.getString("mode", "") == "lndMobile") {
    globals.console.log("stopping LND");
    globals.lnGRPC.stopLND(function (error, response) {
      if (error == true) {
        globals.console.error(response);
      }

      callback();
    });
  } else {
    callback();
  }
};

globals.createPassword = function (usersPassCodeHash) {
  return Titanium.Utils.sha256(
    usersPassCodeHash + Alloy.Globals.getFixedPassword()
  );
};

if (OS_ANDROID) {

  Ti.Android.currentActivity.onDestroy = function () {
    console.log("destroyed");
    try {

      if (globals.alreadyUnlocked) {
        globals.lnGRPC.closeApp();
      }
    }
    catch (e) {
      console.error(e);
    }
  };


}


if (Alloy.CFG.isDevelopment) {
  if(OS_ANDROID){
    globals.util.initDebugLog();
  }
}