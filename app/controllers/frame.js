self = {};
$.progress.hide();
self.transactions = $.transactions;
self.connecting = $.connecting;
globals.LNCurrency = "BTC";
globals.LNCurrencySat = "sat";
globals.settingsIsSelected = false;
globals.merchantIsSelected = false;
$.fullnodeIcon.hide();

var andTimeSince100 = 0;
var continueSyncTimeout = null;
globals.nodeInfo = null;
globals.lnConnected = false;

globals.fiatMode = false;

globals.updateValuesFuncs = [];

function hideUI() {
  $.nayutaIcon.opacity = 0;
}

hideUI();

self.fadeInUI = function () {
  var animation = Ti.UI.createAnimation({
    duration: 800,
    opacity: 1
  });

  $.nayutaIcon.animate(animation);
};

globals.btclnView = $.win;

globals.console.log("opened");

self.launchPayScan = function () {
  globals.util.readQRcodeInvoice(
    {
      callback: globals.util.continuePay
    },
    true
  );
};


$.connecting.visible = true;

var coreDidStart = false;

globals.startLNDMobile = function () {
  hideUI();
  globals.didGetTransactionsOnce = false;
  globals.console.log("starting lnd");
  globals.nodeInfo = null;
  $.transactions.totalBalanceFiat.text = "";
  $.transactions.totalBalance.text = "";
  $.transactions.mainView.hide();
  globals.clearTransactionsTable();

  Ti.App.Properties.setString("mode", "lndMobile");
  startLoadFromCache();
};

function startLoadFromCache() {
  globals.console.log("starting...", Ti.App.Properties.getString("mode", ""));
  globals.nodeInfo = null;
  $.onChainWallet.API.setDidLoad(false);
  $.channelsPage.API.setDidLoad(false);

  if (Ti.App.Properties.getString("mode", "") == "lndMobile") {

    if (Ti.App.Properties.getBool("isRecovering", false) == true) { //didnt finish recovery so resume
      globals.inRecoveryMode = true;
    }

    globals.isREST = false;
    globals.console.log("lndmobile");

    if (Alloy.Globals.network == "testnet") {
      globals.util.setTestnet();
    } else {
      globals.util.setMainnet();
    }

    $.connecting.visible = true;
    $.syncStatus.visible = false;
    $.progress.hide();
    globals.console.log("already unlocked?", globals.alreadyUnlocked);
    if (globals.alreadyUnlocked == false) {
      globals.console.log("is not unlocked")
      if (
        Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 1 &&
        coreDidStart == false
        && OS_ANDROID) {
        $.connecting.visible = false;

        $.progress.show();

        $.centerControls.visible = true;

        globals.fullNodeController = require("/requires/fullnode_controller");

        var config = globals.fullNodeController.getBitcoinConf();
        var checkProgress = null;

        globals.fullNodeController.setUp(config, function (response) {
          globals.console.log("res", response);

          if (coreDidStart) {
            return;
          }
          if (response.response == "rpc") {
            if (response.error == true) {
              var res = response.res.toLowerCase();

              $.statusLabel.text = res + "...";

              if (res == "no value") {
                $.statusLabel.text = "";
              }

              $.percentageLabel.text = "";
              return;
            }

            var response = JSON.parse(response.res);

            globals.console.log("full node progress", response);

            var headersMax = globals.util.getCurrentNetworkBlockHeight(
              Alloy.Globals.network
            );

            let headers = response.headers;
            var val = 0;
            if (headers >= headersMax) { //we have synced headers so val is the percentage of verified blocks
              globals.blockHeight[Alloy.Globals.network] = headers;
              val = response.blocks / response.headers;
            } else {//we are missing headers so val is percentage of headers downloaded

              val = response.headers / headersMax;

            }

            globals.console.log("headers and headersMax", headers + " " + headersMax);


            var res = globals.fullNodeController.formatSyncData(
              parseFloat(response.verificationprogress + "") * 100,
              response.blocks,
              response.headers,
              $.progress
            );
            if (!res.synced) {

              $.statusLabel.text = res.status;
              if (res.showPercentage) {
                $.percentageLabel.text = "%";
              } else {
                $.percentageLabel.text = "";
              }
              $.valueLabel.text = res.description;
            }

            globals.console.log("val", val);

            if (val >= 1 && coreDidStart == false) {

              coreDidStart = true;


              function loadLightning() {

                $.valueLabel.text = L("starting_lnd");
                clearInterval(checkProgress);
                checkProgress = null;
                $.centerControls.hide();
                startLoadFromCache();

              }

              loadLightning();

            }

          } else if (response.response == "already started") {
            clearInterval(checkProgress);
            checkProgress = null;
            checkProgress = setInterval(function () {
              globals.console.log("checking progress");
              globals.fullNodeController.getBlockchainInfo();
            }, 5000);
          } else if (response.response == "starting") {


            globals.fullNodeController.setStartingUI(checkProgress, $.percentageLabel, $.valueLabel, $.statusLabel);

          }
          else {
            globals.fullNodeController.startCore(false);
          }
        });

        let syncMode = Ti.App.Properties.getString("syncMode", "always");

        if (globals.fullNodeController.checkIfServiceIsRunning("com.mandelduck.androidcore.ABCoreService")) {
          globals.console.log("abcore already running");
          globals.fullNodeController.getBlockchainInfo();
          globals.fullNodeController.setStartingUI(checkProgress, $.percentageLabel, $.valueLabel, $.statusLabel);

        } else {
          globals.console.log("abcore not already running");
          globals.fullNodeController.cancelJob();

          globals.fullNodeController.cancelForeground();

          globals.fullNodeController.stopCore();
          if (syncMode == "always") {
            globals.fullNodeController.registerBackgroundSync(false);
          } else if (syncMode == "lite") {
            globals.fullNodeController.registerBackgroundSync(true);
          }
          else {
            globals.fullNodeController.startCore(false);
          }
        }

        return;
      }

      globals.console.log("starting lnd mobile");
      $.connecting.visible = true;
      globals.lnGRPC.startLNDMobile(function (error, response) {
        globals.console.log("lndMobile1", error);
        globals.console.log("lndMobile1", response);

        globals.lnGRPC.unlockWallet(
          globals.createPassword(globals.passCodeHash),
          "",
          function (error, response) {
            globals.console.log("unlock wallet err ", error);
            globals.console.log("unlock wallet", response);

            if (error == true) {
              alert(response);
              return;
            }

            globals.alreadyUnlocked = true;

            if (Ti.App.Properties.getBool("did_sync_once_" + Alloy.Globals.network, false) == true) {
              globals.loadMainScreen();
              showFullNodeIcon();
            }

            andTimeSince100 = 0;
            checkSyncStatus();

          }
        );
      });
    } else {
      globals.console.log("is unlocked")
      checkSyncStatus();

    }
  } else {
    $.smallSync.hide();
    const currentAccount = Ti.App.Properties.getString(
      "currentGRPCAccount",
      undefined
    );
    if (currentAccount != undefined) {
      var accounts = Ti.App.Properties.getString(globals.accountsKey, "{}");
      accounts = JSON.parse(accounts);

      const account = accounts[currentAccount];
      globals.console.log("current account", account);
      if (account != undefined) {
        const config = globals.decryptConfig(account.config, globals.userKey);
        if (config != undefined) {
          globals.connectLNDGRPC(config);
          return;
        } else {
          alert("error decrypting config");
        }
      }

      $.statusText.text = "";
      $.connecting.visible = true;
    } else {
      if (globals.currentConfig != undefined) {
        globals.connectLNDGRPC(globals.currentConfig);
        globals.currentConfig = undefined;
        return;
      }
    }
  }
}

globals.connectLNDGRPC = function (config) {
  globals.synced = true;
  globals.didGetTransactionsOnce = false;
  globals.hideNoTransactions();
  $.transactions.totalBalanceFiat.text = "";
  $.transactions.totalBalance.text = "";
  $.transactions.mainView.hide();

  clearTimeout(continueSyncTimeout);


  globals.console.log("connectLNDGRPC");
  globals.clearTransactionsTable();

  $.statusText.text = "";
  $.connecting.visible = true;
  $.syncStatus.visible = false;
  $.progress.hide();

  $.transactions.totalBalanceFiat.text = "";
  $.transactions.totalBalance.text = "";

  Ti.App.Properties.setString("mode", "grpc");
  Alloy.Globals.openChannels = [];

  Alloy.Globals.pendingChannels = [];
  globals.console.log("connectLNDGRPC");
  const configRes = globals.parseConfig(config);
  globals.console.log("connectLNDGRPC continue");
  if (configRes == "error") {
    alert("error unable to connect");
    return;
  }

  globals.util.setMainnet();
  if (configRes.chainType != undefined) {
    if (configRes.chainType.toLowerCase() == "testnet") {
      globals.util.setTestnet();
    }
  }

  globals.console.log("connectLNDGRPC 2");

  globals.lnGRPC.connect(
    configRes.url,
    configRes.port,
    configRes.certificate,
    configRes.macaroon,
    function (error, response) {
      globals.nodeInfo = null;
      globals.console.log("connecting...");

      if (error == true) {
        $.connecting.visible = false;
        globals.console.log("error", error);
        alert(error);
        return;
      }

      globals.console.log("response", response);

      globals.console.log("getting info");

      globals.lnGRPC.getInfo("", function (error, response) {
        if (error == true) {
          globals.console.error("get info error", error);
          globals.console.error("get info error", response);
          var errorMessage = L("error_connecting");
          if (globals.isREST) {
            Alloy.createController("components/orbot_screen")
              .getView()
              .open();
          }
          const dialog = globals.util.createDialog({
            title: "",
            message: errorMessage,
            buttonNames: [L("label_tryagain")]
          });
          dialog.addEventListener("click", function (e) {
            globals.connectLNDGRPC(config);
          });
          dialog.show();
          return;
        }

        globals.console.log("getting info 2");
        globals.synced = true;
        globals.nodeInfo = response;

        if (response.testnet == true) {
          globals.util.setTestnet();
        }

        globals.lnConnected = true;
        globals.console.log("info", response);

        globals.console.log("getting wallet balance");

        self.fadeInUI();
        globals.loadMainScreen();
        showFullNodeIcon();

        var details = response;
        details.config = globals.encryptConfig(config, globals.userKey);
        if (details.config != undefined) {
          globals.addAccounts(response.identity_pubkey, details);
          Ti.App.Properties.setString(
            "currentGRPCAccount",
            response.identity_pubkey
          );
        } else {
          alert("error adding account");
        }
      });
    }
  );
};

function setSyncingUI() {
  try {
    $.syncStatus.visible = true;
    $.statusText.text = "";

    walletConfirmedBalance = Ti.App.Properties.getInt("last_wallet_balance", 0);
    channelConfirmedBalance = Ti.App.Properties.getInt(
      "last_channel_balance",
      0
    );
    $.transactions.API.setBalances(true);
  } catch (e) {
    globals.console.error(e);
  }
}

function checkSyncStatus() {

  let didSyncOnce = Ti.App.Properties.getBool("did_sync_once_" + Alloy.Globals.network, false);

  if (didSyncOnce == true) {
    var showLargeSync = false;
  } else {
    var showLargeSync = true;
  }

  var nextCheckTime = 500;
  if (OS_IOS) {
    nextCheckTime = 1500;
  }
  globals.lnGRPC.getInfo("", function (error, response) {
    globals.console.log("getInfo1", error);
    globals.console.log("getInfo1", response);

    if (error == true) {
      alert(response);
      return;
    }

    globals.nodeInfo = response;

    globals.currentPubkey = response.identity_pubkey;

    if (response.testnet == true) {
      globals.util.setTestnet();
    }
    if (response.block_height == undefined) {
      response.block_height = 0;
    }

    if (showLargeSync) {
      $.centerControls.hide();
    } else {
      $.smallSync.show();

      globals.console.log("blockheights are", globals.blockHeight);

      var headersMax = globals.util.getCurrentNetworkBlockHeight(
        Alloy.Globals.network
      );

      let headers = response.block_height;

      if (headers > headersMax) {
        globals.blockHeight[Alloy.Globals.network] = headers;
        Ti.App.Properties.getInt(Alloy.Globals.network + "_blockheight", headers);
      }

      $.smallSyncLabel.text = L("synchronizing_small") + " " + headers + "/" + headersMax;

      $.smallSyncSpinner.show();
      $.nayutaIcon.hide();
    }

    if (
      response.synced_to_chain == undefined ||
      response.synced_to_chain == false
    ) {

      if (showLargeSync) {
        $.connecting.visible = false;
        setSyncingUI();
        $.progress.show();
      }

      globals.synced = false;
      const currentNetworkBlockHeight = globals.util.getCurrentNetworkBlockHeight(
        Alloy.Globals.network
      );

      var percentage = Math.floor(
        (response.block_height / currentNetworkBlockHeight) * 100
      );

      globals.console.log("currentNetworkBlockHeight", currentNetworkBlockHeight + " block height " + response.block_height + " percentage " + percentage)

      if (percentage > 100) {
        percentage = 100;
      }

      $.progress.setValue(percentage);

      if (percentage == 100) {
        andTimeSince100++;
      }

      const percentageString = percentage + "";
      const percentSign = "%";
      const percentageText = percentageString + percentSign;
      const attrTotal = Ti.UI.createAttributedString({
        text: percentageText,
        attributes: [
          {
            type: Ti.UI.ATTRIBUTE_FONT,
            value: {
              fontSize: 90,
              fontFamily: Alloy.Globals.lightFont,
              fontWeight: "light"
            },
            range: [
              percentageText.indexOf(percentageString),
              percentageString.length
            ]
          },
          {
            type: Ti.UI.ATTRIBUTE_FONT,
            value: {
              fontSize: 40,
              fontFamily: Alloy.Globals.lightFont,
              fontWeight: "light"
            },
            range: [percentageText.indexOf(percentSign), percentSign.length]
          }
        ]
      });

      $.syncPercentage.attributedString = attrTotal;

      if (percentage < 100 && andTimeSince100 < 20) {
        $.syncText.text =
          L("synchronizing") +
          " " +
          L("block_height_sync").format({
            height: response.block_height
          });
      } else {
        $.syncText.text = L("still_synchronizing");
        if (globals.inRecoveryMode) {
          $.syncText.text = ""
          $.syncPercentage.textAlign = "center";
          $.syncPercentage.attributedString = Ti.UI.createAttributedString({
            text: L("recovering_funds"),
            attributes: [
              {
                type: Ti.UI.ATTRIBUTE_FONT,
                value: {
                  fontSize: 30,
                  fontFamily: Alloy.Globals.lightFont,
                  fontWeight: "light"
                },
                range: [
                  0,
                  L("recovering_funds").length
                ]
              }]
          })
          $.syncTextDescription.text = L("recovering_funds_desc");
          nextCheckTime = 5000;
        } else {
          nextCheckTime = 1000;
        }
      }


      if (OS_IOS) {

        setTimeout(function () {
          globals.console.log("this is needed or the other timout/interval doesn't fire on ios");
        }, nextCheckTime);

        continueSyncTimeout = setTimeout(function () {
          globals.console.log("checking status");
          checkSyncStatus();
        }, nextCheckTime);

      } else {
        continueSyncTimeout = setTimeout(function () {
          checkSyncStatus();
        }, nextCheckTime);

      }

      if (Ti.App.Properties.getBool("did_sync_once_" + Alloy.Globals.network, false) == true) {
        if (globals.didGetTransactionsOnce == false) {
          // kind of heavy so only grab once whilst syncing
          $.transactions.API.setBalances();
          globals.listPayments();
        }
      }

    } else {

      $.smallSync.hide();
      $.nayutaIcon.show();
      $.progress.setValue(100);

      if (response.synced_to_chain == 1) {

        globals.util.checkHashes();

        globals.synced = true;

        Ti.App.Properties.setBool("did_sync_once_" + Alloy.Globals.network, true);

        try {
          Ti.App.Properties.setInt(
            "latest_block_height_" + Alloy.Globals.network,
            response.block_height
          );
          const currentTimeStamp = Math.floor(Date.now() / 1000);
          Ti.App.Properties.setInt(
            "latest_time_stamp_" + Alloy.Globals.network,
            currentTimeStamp
          );

          $.syncStatus.visible = false;
          $.progress.hide();
          globals.lndMobileStarted = true;

          self.fadeInUI();
          globals.loadMainScreen();
          showFullNodeIcon();

        } catch (e) {
          globals.console.error(e);
        }
      }
    }
  });
}

function showFullNodeIcon() {
  if (Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 1) {
    $.fullnodeIcon.show();
  }
}

function checkHashes() {
  if (Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 0) {
    if (globals.fullNodeController != undefined) {
      globals.lnGRPC.getInfo("", function (error, response) {
        if (error == false) {
          globals.fullNodeController.checkBlocksAreValid(response);
        }
      });
    }
  }
}

globals.tryAndBackUpChannels = function () {
  if (
    Ti.App.Properties.getString("google_drive_linked", undefined) != undefined
  ) {
    if (globals.synced == true) {
      globals.console.log("attempting to back up channels");
      globals.util.backUpChannels(function (error, response) { });
    }
  }
};

function goToDeposit() {
  Alloy.createController("receive")
    .getView()
    .open();
}
$.transactions.API.setParentController(self);

function scanNormal() {
  globals.util.readQRcodeNormal(
    {
      callback: function (e) {
        try {
          const data = JSON.parse(e);
        } catch (error) {
          globals.util.continuePay(e);
        }
      }
    },
    true
  );
}

function continueLoad() {
  globals.util.loadStartUpInfo(function (error, response) {

    if (error == false) {
      globals.console.log("loaded start up info, loading from cache...")
      startLoadFromCache();

    } else {
      globals.console.log("error is", response)
      var button2 = L("label_usebackup");
      var button1 = L("label_tryagain")
      var tryAgainIndex = 0;
      if (OS_IOS) {
        tryAgainIndex = 1;
        var button1 = L("label_usebackup");
        var button2 = L("label_tryagain")
      }
      const dialog = globals.util.createDialog({
        title: "",
        message: L("error_loading_api").format({ message: response }),
        buttonNames: [button1, button2]
      });
      dialog.addEventListener("click", function (e) {
        if (e.index == tryAgainIndex) {
          globals.useBackUpAPI = false
          continueLoad();
        } else {
          globals.useBackUpAPI = true
          continueLoad();
        }
      });
      dialog.show();
    }
  });
}

$.transactions.API.setParentController(self);

globals.showHideBluetoothIcon = function (show) {
  if (show) {
    $.bluetoothIcon.show();
  } else {
    $.bluetoothIcon.hide();
  }
};

function showFullNodeIcon() {
  if (Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 1) {
    $.fullnodeIcon.show();
  }
}

function goToDeposit() {
  Alloy.createController("receive")
    .getView()
    .open();
}

function loadOnChain() {
  globals.console.log("onchain selected");

  $.onChainWallet.API.loadOnChain();

}

function loadChannels() {
  globals.console.log("channels selected");

  $.channelsPage.API.loadChannels();

  $.channelsPage.API.setNodeInfo();

}

function selectedSettings() {
  globals.settingsIsSelected = true;
  $.settingsPage.API.loadSettings();
}

function unSelectedSettings() {
  globals.settingsIsSelected = false;
}

function selectedMerchant() {
  globals.merchantIsSelected = true;
  $.merchantPage.API.loadMerchantMenu();
}

function unSelectedMerchant() {
  globals.merchantIsSelected = false;
}

function selectLightning() {
  globals.console.log("select lightning");
  if (OS_IOS) {
    $.syncPercentage.opacity = 1;
  }
}



if (globals.unlocked == true) {
  continueLoad();
} else {
  function showAuth() {
    globals.auth.check({
      hideCancel: true,
      title: "",
      callback: function (e) {
        if (e.success) {
          continueLoad();
        } else {
          showAuth()
        }
      }
    });
  }

  showAuth();

}

if (OS_ANDROID) {

  $.tabGroup.addEventListener("android:back", function (e) {
    e.cancelBubble = true;
    return true;
  });


}