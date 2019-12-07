module.exports = (function () {
  var self = {};

  let dummyData = require('vendor/util/dummyData');

  self.getUnZipProgress = function () {
    return googleDrive.unzipProgress;
  }

  self.getDownloadProgress = function () {
    return googleDrive.downloadProgress;
  }

  if (OS_ANDROID && globals.enableLiveView == false) {

    var CallbackInterfaceAndroidCore = require("com.mandelduck.androidcore.CallbackInterface");

    var androidcore = require("com.mandelduck.androidcore.MainController");
    self.androidcore = androidcore;
    var Activity = require('android.app.Activity');

    var activity = new Activity(Ti.Android.currentActivity);
    var contextValue = activity.getApplicationContext();
    var CallbackInterfaceGoogleDrive = require("com.indiesquare.googledrive.CallbackInterface");
    var googleDrive = require("com.indiesquare.googledrive.GoogleDrive")

    var googleDrive = new googleDrive(activity);

  }

  self.registerBackgroundSync = function (limited) {
    if (globals.enableLiveView == true) {
      return;
    }
    androidcore.registerBackgroundSync(limited);
  }

  self.cancelJob = function () {
    if (globals.enableLiveView == true) {
      return;
    }
    androidcore.cancelJob();
  }

  self.setUp = function (config, callback) {

    if (globals.enableLiveView == true) {
      return;
    }


    //check if zmqs enabled
    if (Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 1) {
      globals.console.log("should use zmqs");
      var conf = self.readConf(contextValue);

      if (conf.indexOf("zmqpubrawblock") == -1) {
        globals.console.log("zmqs not added so update");
        self.saveConf(config);
      } else {
        globals.console.log("zmqs already added");
      }
    }

    androidcore.setUp(contextValue, config, activity, new CallbackInterfaceAndroidCore({
      eventFired: function (event) {
        var response = JSON.parse(event);
        callback(response);

      }
    }));
  }

  self.getLogs = function (callback) {
    androidcore.getLogs(new CallbackInterfaceAndroidCore({
      eventFired: function (event) {
        var response = JSON.parse(event);
        callback(response);

      }
    }));
  }

  self.startDownloadCore = function () {

    androidcore.startDownload();

  }

  self.saveConf = function (newConf) {
    if (globals.enableLiveView == true) {
      return;
    }
    androidcore.saveConf(newConf, activity, contextValue);

  }


  self.getDataDir = function () {
    androidcore.getDataDir();

  }
  self.stopCore = function () {
    androidcore.stopCore();
  }

  self.getBlockchainInfo = function () {
    androidcore.getBlockchainInfo();
  }

  self.submitBlock = function () {


    var f = Ti.Filesystem.getFile(
      Ti.Filesystem.resourcesDirectory,
      "/scripts/blockData.txt"
    );

    let aBlock = f.read().text;

    globals.console.log("Ablock is", aBlock.length);

    androidcore.submitBlock(aBlock);

  }

  self.callRPC = function (command) {
    androidcore.callRPC(command)
  }

  self.generateBlocks = function () {
    androidcore.generateBlock();

  }

  self.setStartingUI = function (progressInterval, percentageLabel, valueLabel, statusLabel) {

    if (percentageLabel == undefined) {
      console.error("percentage lab undef");
    }

    if (valueLabel == undefined) {
      console.error("value lab undef");
    }

    if (statusLabel == undefined) {
      console.error("status lab undef");
    }
    clearInterval(progressInterval);
    progressInterval = null;
    progressInterval = setInterval(function () {
      globals.console.log("checking progress");
      globals.fullNodeController.getBlockchainInfo();
    }, 8000);

    percentageLabel.text = "";
    valueLabel.text = L("initiating");
    valueLabel.font = { fontSize: 40, fontFamily: Alloy.Globals.lightFont };
    statusLabel.text = L("full_node_take_a_while");

    valueLabel.animate({});
    valueLabel.animate(
      Ti.UI.createAnimation({
        opacity: 0.1,
        autoreverse: true,
        repeat: 100000,
        duration: 1000
      })
    );

    percentageLabel.animate(
      Ti.UI.createAnimation({
        opacity: 0.1,
        autoreverse: true,
        repeat: 100000,
        duration: 1000
      })
    );
  }

  self.deleteCore = function () {
    androidcore.deleteCore();
    androidcore.deleteData();

  }

  self.isTestnet = function () {
    if (globals.enableLiveView == true) {
      return false;
    }
    return androidcore.isTestnet();


  }
  self.checkIfServiceIsRunning = function (service) {
    return androidcore.checkIfServiceIsRunning(service);
  }

  self.startCore = function (reindex) {
    androidcore.startCore(reindex);

  }

  self.isInstalled = function () {
    if (globals.enableLiveView == true) {
      return false;
    }
    return androidcore.checkIfDownloaded();
  }

  self.getProgress = function () {
    androidcore.getProgress();

  }

  Ti.Android.currentActivity.onPause = function (e) {
    if (androidcore != undefined) {
      androidcore.onPause();
    }
  };


  Ti.Android.currentActivity.onResume = function (e) {
    if (androidcore != undefined) {
      androidcore.onResume();
    }
  };

  self.cancelForeground = function () {
    androidcore.cancelForeground();
  }


  self.readConf = function () {



    return androidcore.readConf(contextValue);
  }

  self.sendCommand = function (command) {
    androidcore.sendCommand(command);
  }





  self.getBitcoinConf = function () {
    var config = ""
    config += "listen=1\n";
    config += "disablewallet=1\n";

    if (Alloy.Globals.network == "testnet") {
      config += "testnet=1\n";
    }

    config += "prune=550\n";
    config += "upnp=0\n";
    config += "blocksonly=1\n";
    config += "rpcpassword=" + globals.createPassword() + "\n";
    config += "rpcuser=bitcoinrpc\n";
    config += "server=1\n";

    if (Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 1) {
      config += "zmqpubrawblock=tcp://127.0.0.1:28332\n"
      config += "zmqpubrawtx=tcp://127.0.0.1:28333\n"
    }

    return config;

  }

  self.formatSyncData = function (val, blocks, headers, progressUI) {

    function formatPercentage(val) {
      val = val + "";
      if (parseFloat(val) >= 1) {
        return 4;
      }
      val = val.split(".");

      if (val.length > 1) {
        val = val[1];
        for (var i = 0; i < val.length; i++) {
          var char = val.charAt(i);
          if (char != "0") {
            return i + 1;
          }
        }
      }
    }


    if (headers > blocks) {//verification can be 1 but there are more headers than blocks so in this case set val to the percentage of blocks comared to headers
      val = (blocks / headers) * 100;
    }

    globals.console.log("blocks headers ", val + " " + blocks + " " + headers);

    progressUI.setValue(val);

    if (Math.ceil(val) == 100) {

      globals.console.log("val is 100", val);

      if (blocks >= headers) {
        globals.console.log("blocks greater than headers", blocks + " " + headers);

        return {
          synced: true,
        }

      }
    }

    var genesis = 1231006505;
    if (Alloy.Globals.network == "testnet") {
      genesis = 1296688602;//testnet
    }

    var nowTS = parseInt(Date.now() / 1000);

    var timeDiff = nowTS - genesis;

    var timeToAdd = parseInt(timeDiff * (val / 100))

    var newTime = genesis + timeToAdd;;

    var date = new Date(newTime * 1000);
    var months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    var daysEnd = { "1": "st", "2": "nd", "3": "rd", "4": "th" }

    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate() + "";

    var dayEnd = daysEnd[day.substr(day.length - 1)];

    if (parseInt(day) > 10 && parseInt(day) < 20) {
      dayEnd = "th";
    }

    if (dayEnd == undefined) {
      dayEnd = "th";
    }

    var formattedTime = day + dayEnd + " " + months[month] + " " + year;

    return {
      showPercentage: true,
      status: "2/2: " + L("validating").format({ time: formattedTime, blocks: blocks, headers: headers }),
      description: val.toFixed(formatPercentage(val)) + ""
    }

  }

  self.checkBlocksAreValid = function (lndGetInfo) {


    let neutrinoBlockHeight = lndGetInfo["block_height"];
    let neutrinoBlockHash = lndGetInfo["block_hash"];

    var neutrinoBlockHashes = JSON.parse(Ti.App.Properties.getString("bestBlockHashesNeutrinoV1", "{}"));
    neutrinoBlockHashes[neutrinoBlockHeight + ""] = neutrinoBlockHash;

    var neutrinoKeys = Object.keys(neutrinoBlockHashes);

    var startPos = 0;
    var endPos = neutrinoKeys.length;

    if (endPos > 100) {
      startPos = endPos - 100;
    }

    var neutrinoBlockHashesNew = {};
    for (var i = startPos; i < endPos; i++) {
      let aKey = neutrinoKeys[i];
      neutrinoBlockHashesNew[aKey] = neutrinoBlockHashes[aKey];
    }

    Ti.App.Properties.setString("bestBlockHashesNeutrinoV1", JSON.stringify(neutrinoBlockHashesNew));


    var blockHashes = globals.util.getAndroidPreferences("bestBlockHashesV1", "{}");
    blockHashes = JSON.parse(blockHashes);

    var keys = Object.keys(blockHashes);
    var neutrinoKeys = Object.keys(neutrinoBlockHashesNew);

    var hashMismatchNumber = 0;
    for (var i = 0; i < neutrinoKeys.length; i++) {
      let aKeyNeutrino = neutrinoKeys[i];
      let aHashNeutrino = neutrinoBlockHashesNew[aKeyNeutrino];

      for (var i2 = 0; i2 < keys.length; i2++) {
        let aKey = keys[i2];
        let aHash = blockHashes[aKey];

        globals.console.log("checking " + aKey + ":" + aHash + " against" + aKeyNeutrino + " " + aHashNeutrino);
        if (parseInt(aKeyNeutrino) === parseInt(aKey)) {
          if (aHashNeutrino !== aHash) {
            globals.console.log("hash mismatch");
            hashMismatchNumber++;
            
            if (hashMismatchNumber > Ti.App.Properties.getInt("reorgThreshold", 6)) {
              alert(L("fork_detected"))
              return;
            }
          }
        }
      }
    }
  }

  self.downloadUTXOSet = function (name, callback) {

    if (globals.enableLiveView == true) {
      callback(false, dummyData["downloadUTXOSet1"]);

      setTimeout(function () {
        callback(false, dummyData["downloadUTXOSet2"]);

        setTimeout(function () {
          callback(false, dummyData["downloadUTXOSet3"]);

          setTimeout(function () {
            callback(false, dummyData["downloadUTXOSet4"]);
          }, 1000);

        }, 1000);

      }, 1000);

      return;

    }


    var folderName = "NayutaWallet";
    var shortFileName = name;


    googleDrive.downloadZipFile("Nayuta Wallet", folderName, shortFileName, new CallbackInterfaceGoogleDrive({
      eventFired: function (error, response) {

        globals.console.log("google drive callback", error);

        globals.console.log("google drive callback", response);


        if (error != null) {
          response = error;
          error = true;
        }

        callback(error, response);


      }
    }));

  }


  self.checkWifi = function () {

    if (globals.enableLiveView == true) {
      return true;
    }

    if (Ti.Network.networkTypeName.indexOf("WIFI") == -1) {
      return false;
    }

    return true;


  }

  self.getRAM = function () {
    return androidcore.getRAM();
  }


  self.unZipUTXOSet = function (name, callback) {

    if (globals.enableLiveView == true) {
      callback(false, dummyData["unZipUTXOSet1"]);

      setTimeout(function () {
        callback(false, dummyData["unZipUTXOSet2"]);

        setTimeout(function () {
          callback(false, dummyData["unZipUTXOSet3"]);


        }, 1000);

      }, 1000);
      return;
    }

    var shortFileName = name;

    globals.console.log("starting unzip cont");
    googleDrive.unpackZip(shortFileName, new CallbackInterfaceGoogleDrive({
      eventFired: function (error, response) {

        globals.console.log("unzip callback", error);

        globals.console.log("unzip callback", response);


        if (error != null) {
          response = error;
          error = true;
        }

        callback(error, response);

      }
    }));

  }

  return self;
}());