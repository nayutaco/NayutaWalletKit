$.win.addEventListener("open", function (e) {
  $.win.activity.actionBar.hide();
});


var progressInterval = null;
var fullNodeSynced = false;

var didGenerateBlocks = false;

resetFullnodeUI();

if (globals.fullNodeController == undefined) {
  globals.fullNodeController = require("/requires/fullnode_controller");
}
var config = globals.fullNodeController.getBitcoinConf();
var oldConf = globals.fullNodeController.readConf();
globals.console.log("config", config);
globals.console.log("old config", oldConf);
if (Alloy.Globals.network == "testnet") {
  globals.console.log("network is testnet");
  if (oldConf.indexOf("testnet") == -1) {
    globals.console.log("config is not testnet");
    updateConf();
  }
  $.testnet.show();
} else {
  globals.console.log("network is not testnet");
  if (oldConf.indexOf("testnet") != -1) {
    globals.console.log("config is testnet");
    updateConf();
  }

  $.testnet.hide();
}

globals.fullNodeController.setUp(config, function (response) {

  globals.console.log(response);


  if (response.response == "download") {
    var val = (response.bytesDownloaded / response.byteSize) * 100;
    $.progress.setValue(val);
    $.statusLabel.text = L("downloading");
    $.valueLabel.text = parseInt(val) + "";
  } else if (response.response == "uncompressing") {
    $.progress.setValue(99);
    $.valueLabel.text = 99 + "";
    $.statusLabel.text = L("uncompressing");
  } else if (response.response == "downloaded") {
    $.statusLabel.text = L("downloaded");
    $.valueLabel.text = 100 + "";
    $.progress.setValue(100);
    setTimeout(function () {
      finishDownload();
    }, 2000);
  } else if (response.response == "already started") {

    setStopButton(true);
    $.valueLabel.font = { fontSize: 40, fontFamily: Alloy.Globals.lightFont };

    globals.console.log("already started");

    if (progressInterval == null) {
      progressInterval = setInterval(function () {
        globals.console.log("checking progress");
        globals.fullNodeController.getBlockchainInfo();
      }, 8000);
    }
  } else if (response.response == "starting") {
    setStopButton(true);

    globals.fullNodeController.setStartingUI(progressInterval, $.percentageLabel, $.valueLabel, $.statusLabel);


  } else if (response.response == "rpc") {
    if (response.error == true) {
      var res = response.res.toLowerCase();

      $.statusLabel.text = res + "...";

      if (res == "no value") {

        $.statusLabel.text = "";
      }

      if (globals.setConsole != undefined) {
        globals.setConsole(res);
      }

      $.percentageLabel.text = "";
      return;
    }


    if (globals.setConsole != undefined) {
      globals.setConsole(response.res);
    }

    var response = JSON.parse(response.res);

    if (response.blocks == 0) {
      $.percentageLabel.text = "%";

      var headersMax = globals.blockHeight.mainnet;
      if (Alloy.Globals.network == "testnet") {
        headersMax = globals.blockHeight.testnet;

        $.testnet.show();
      } else {

        $.testnet.hide();
      }
      $.statusLabel.text =
        "1/2: " +
        L("downloading_headers") +
        "\n\n" +
        response.headers +
        "/" +
        headersMax;

      var val = response.headers / headersMax;

      $.valueLabel.text = parseInt(val * 100);

      $.progressGreen.setValue(val * 100);
    } else {
      var res = globals.fullNodeController.formatSyncData(
        parseFloat(response.verificationprogress + "") * 100,
        response.blocks,
        response.headers,
        $.progressGreen
      );
      if (res.synced) {
        fullNodeSynced = true;
        $.percentageLabel.text = "";
        ($.valueLabel.text = L("running")),
          ($.statusLabel.text = L("fully_synced"));
      } else {
        fullNodeSynced = false;
        $.valueLabel.text = res.description;
        if (res.showPercentage) {
          $.percentageLabel.text = "%";
        } else {
          $.percentageLabel.text = "";
        }
        $.statusLabel.text = res.status;
      }
    }
  }
});


$.background.backgroundColor = $.valueLabel.color;

$.backgroundInner.width = globals.display.width - 1;

$.backgroundInner.height = globals.display.height - 1;

function updateConf() {

  var config = globals.fullNodeController.getBitcoinConf();
  globals.console.log("saving conf",config);
  globals.fullNodeController.saveConf(config);

}

function startDownload() {
  $.centerButton.top = 0;
  $.valueLabel.font = { fontSize: 50, fontFamily: Alloy.Globals.lightFont };
  $.valueLabel.text = 0 + "";
  $.percentageLabel.text = "%";

  if (globals.fullNodeController.isInstalled() == false) {
    $.statusLabel.text = L("downloading");

    globals.fullNodeController.startDownloadCore();
  } else {
    $.statusLabel.text = "";

    globals.console.log("starting core with service");
    startCoreWithService();
  }
}

function finishDownload() {

  $.progress.hide();
  $.progressGreen.show();
  $.centerButton.top = 20;
  $.statusLabel.text = "";
  $.valueLabel.font = { fontSize: 20, fontFamily: Alloy.Globals.lightFont };

  $.valueLabel.color = "#79debc";
  $.percentageLabel.color = $.valueLabel.color;
  $.background.backgroundColor = $.valueLabel.color;
  $.valueLabel.text = L("start_core");
  $.percentageLabel.text = "";
}

function goToPage3() {
  $.page1.hide();
  $.page2.hide();
  $.page3.show();
}

function goToPage2() {
  $.page1.hide();
  $.page2.show();
  $.page3.hide();
}

function closeIntro() {
  $.page1.hide();
  $.page2.hide();
  $.page3.hide();
}

function close() {
  $.win.close();
}

function goToSettings() {
  Alloy.createController("fullnode_settings")
    .getView()
    .open();
}

function setStopButton(show) {

  if (show) {
    $.stopButton.top = 10;
    $.stopButton.height = 30;
    $.stopButton.show();
    return;
  }

  $.stopButton.top = 0;
  $.stopButton.height = 0;
  $.stopButton.hide();

}

function stopCore() {

  globals.fullNodeController.cancelJob();

  globals.fullNodeController.cancelForeground();

  globals.fullNodeController.stopCore();

  clearInterval(progressInterval);

  setStopButton(false);

  if (globals.fullNodeController.isInstalled() == true) {
    finishDownload();
  }

  const animation = Ti.UI.createAnimation({
    opacity: 1.0,
    repeat: 1,
    duration: 1000
  });

  $.valueLabel.animate(animation);
  $.percentageLabel.animate(animation);
  $.centerControls.hide();
  setTimeout(function () {

    $.centerControls.show();


    if (globals.fullNodeController.isInstalled() == false) {
      resetFullnodeUI()

    }
  }, 2000);
}

function setLite() {

  globals.console.log("set lite");
  Ti.App.Properties.setString("syncMode", "lite");

  globals.fullNodeController.cancelJob();
  $.always.opacity = 0.4;
  $.lite.opacity = 1.0;
  $.never.opacity = 0.4;
  stopCore();
  updateConf();
  alert(L("restart_app_start"));
}


function setAlways() {
  globals.console.log("set always");
  Ti.App.Properties.setString("syncMode", "always");

  globals.fullNodeController.cancelJob();
  $.always.opacity = 1.0;
  $.lite.opacity = 0.4;
  $.never.opacity = 0.4;
  stopCore();
  updateConf();
  alert(L("restart_app_start"));
}


function setNever() {

  globals.console.log("set never");
  Ti.App.Properties.setString("syncMode", "never");
  $.always.opacity = 0.4;
  $.lite.opacity = 0.4;
  $.never.opacity = 1.0;
  globals.fullNodeController.cancelJob();
  stopCore();
  updateConf();
  alert(L("restart_app"));
}

function setNeutrino() {
  if (Ti.App.Properties.getString("mode", "") != "lndMobile") {
    alert(L("only_in_lndmobile"));
    return;
  }
  globals.console.log("set neutrino");
  Ti.App.Properties.setInt("useBitcoinCore_" + Alloy.Globals.network, 0);
  globals.fullNodeController.cancelJob();

  $.never.opacity = 0.4;
  $.bitcoind.opacity = 0.4;
  $.neutrino.opacity = 1.0;

  stopCore();


  alert(L("restart_app"));

}

function setBitcoinD() {
  globals.console.log("set bitcoind");

  if (Ti.App.Properties.getString("mode", "") != "lndMobile") {
    alert(L("only_in_lndmobile"));
    return;
  }
  if (fullNodeSynced == false) {
    alert(L("wait_for_sync"));
    return;
  }

  globals.console.log("setting bitcoin core mode");
  Ti.App.Properties.setInt("useBitcoinCore_" + Alloy.Globals.network, 1);

  $.bitcoind.opacity = 1.0;
  $.neutrino.opacity = 0.5;

  startCoreWithService()

  alert(L("restart_app"));

}

globals.reindex = function () {
  globals.fullNodeController.startCore(true);
}

function startCoreWithService() {

  $.statusLabel.text = "";
  globals.fullNodeController.cancelJob();
  let syncMode = Ti.App.Properties.getString("syncMode", "always");
  if (syncMode == "always") {
    globals.fullNodeController.registerBackgroundSync(false);
  } else if (syncMode == "lite") {
    globals.fullNodeController.registerBackgroundSync(true);
  }
  else {
    globals.fullNodeController.startCore(false);
  }
}




if (Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 0) {

  $.bitcoind.opacity = 0.5;

} else {
  $.neutrino.opacity = 0.5;
}

if (Ti.App.Properties.getString("syncMode", "always") == "always") {

  $.lite.opacity = 0.5;

} else {
  $.always.opacity = 0.5;
}


$.lite.opacity = 0.5;
$.always.opacity = 0.5;
$.never.opacity = 0.5;


let syncMode = Ti.App.Properties.getString("syncMode", "always");
if (syncMode == "always") {

  $.always.opacity = 1.0;
} else if (syncMode == "lite") {

  $.lite.opacity = 1.0;
}
else {
  $.never.opacity = 1.0;
}

globals.resetFullnodeUI = resetFullnodeUI;

function resetFullnodeUI() {
  progressInterval = null;
  fullNodeSynced = false;
  didGenerateBlocks = false;
  $.progressGreen.hide();

  setStopButton(false);
  $.valueLabel.text = L("download_core");
  $.percentageLabel.text = "";

  $.centerButton.top = 20;
}


if (globals.fullNodeController.isInstalled() == true) {
  finishDownload();

}

if (globals.fullNodeController.checkIfServiceIsRunning("com.mandelduck.androidcore.ABCoreService")) {
  $.statusLabel.text = "";
  $.valueLabel.text = "";
  $.percentageLabel.text = "";
  globals.fullNodeController.getBlockchainInfo();
  setStopButton(true);
}

function didLoad() {
  let ramInGB = globals.fullNodeController.getRAM() / 1000000000;

  if (ramInGB < 2.7) {
    const dialog = globals.util.createDialog({
      title: "",
      message: L("not_enought_ram"),
      buttonNames: [L("label_ok")]
    });
    dialog.addEventListener("click", function (e) {

    });
    dialog.show();
  }

  globals.console.log("ram is", ramInGB);
}
