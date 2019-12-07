globals = Alloy.Globals;
globals.networkType = Alloy.CFG.network
globals.androidLaunchData = undefined;
globals.allwaysShowGuides = false;
globals.callbackApp = null;
globals.canProcessArgs = false;
globals.neutrinoUri = null; 
Ti.App.forceSplashAsSnapshot = true;

globals.blockHeight = {
  testnet: Ti.App.Properties.getInt("testnet_blockheight", 1610873),
  mainnet: Ti.App.Properties.getInt("mainnet_blockheight", 606367),
}

if (Alloy.CFG.isDevelopment != true) {
  Alloy.Globals.logLevel = "none";
}

globals.console = {
  "log": function (str, data) {
    if (data == null) {
      data = "";
    }
    if (Alloy.CFG.isDevelopment && Alloy.Globals.logLevel == "debug") console.log(str, data);
    if(OS_ANDROID && Alloy.CFG.isDevelopment && globals.util  != undefined && Alloy.Globals.logLevel == "debug"){
      globals.util.sendLog('console_log', str+" "+data);
    }
  },
  "error": function (str, data) {
    if (data == null) {
      data = "";
    }
    if (Alloy.CFG.isDevelopment && (Alloy.Globals.logLevel == "error" || Alloy.Globals.logLevel == "debug")) console.error(str, data);
    if(OS_ANDROID && Alloy.CFG.isDevelopment && globals.util  != undefined && Alloy.Globals.logLevel == "debug"){
      globals.util.sendLog('console_error', str+" "+data);
    }
  },
  "warn": function (str, data) {
    if (data == null) {
      data = "";
    }
    if (Alloy.CFG.isDevelopment && Alloy.Globals.logLevel == "debug") console.warn(str, data);
    if(OS_ANDROID && Alloy.CFG.isDevelopment && globals.util  != undefined && Alloy.Globals.logLevel == "debug"){
      globals.util.sendLog('console_warn', str+" "+data);
    }
  }
};

globals.feeTexts = {
  "fastest_fee": L("label_priority_high"),
  "half_hour_fee": L("label_priority_med"),
  "low_fee": L("label_priority_low"),
};

globals.addButtonEvent = function (button, callback) {
  button.addEventListener("touchstart", function (e) {
    touchPos = {
      "x": e.x,
      "y": e.y
    };
    button.opacity = 0.2;
    enabledButton = true;
  });
  button.addEventListener("touchmove", function (e) {
    let a = Math.pow(touchPos.x - e.x, 2) + Math.pow(touchPos.y - e.y, 2);
    if (a > 50) {
      button.animate({
        "opacity": 1.0,
        "duration": 200
      });
      enabledButton = false;
    }
  });
  button.addEventListener("touchend", function (e) {
    button.animate({
      "opacity": 1.0,
      "duration": 200
    });
    if (enabledButton) {
      enabledButton = false;
      callback(e);
    }
  });
};

String.prototype.format = function (arg) {
  let rep_fn = null;
  if (typeof arg == "object") rep_fn = function (m, k) {
    return arg[k];
  };
  else {
    let args = arguments;
    rep_fn = function (m, k) {
      return args[parseInt(k)];
    };
  }
  return this.replace(/\{(\w+)\}/g, rep_fn);
};
if (OS_ANDROID) {
  Number.prototype.toLocaleString = function () {

    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  };
}

Number.prototype.toFixed2 = function (digit) {
  if (digit == null) digit = 8;
  return this.toFixed(digit).replace(/0+$/, "").replace(/\.$/, "");
};

globals.identity = require('ti.identity');
globals.util = require("requires/util");

globals.display = {
  "height": globals.util.getDisplayHeight(),
  "width": globals.util.getDisplayWidth()
};

globals.cryptoJS = require("vendor/crypto-js.js");
globals.auth = require("requires/auth");

globals.bitcoin = require("requires/bitcoin");
globals.tiker = require("requires/tiker");
globals.nativeCrypto = require("crypt/nativeCrypto");

require("vendor/passwordStatic.js");

function loadingFromInit() {
  if (loading != null) loading.removeSelf();
  if (globals.screenView != null) {
    return globals.util.showLoading(globals.screenView, {
      width: Ti.UI.FILL,
      height: Ti.UI.FILL,
      message: L("label_please_wait")
    });
  }

  return null;
}




require("vendor/util/handleLaunchOptions.js");