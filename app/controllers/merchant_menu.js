exports.API = {
  loadMerchantMenu: function() {
    if (Ti.App.Properties.getString("mode", "") != "lndMobile") {
      $.scrollView.remove($.addWatchTower);
      $.scrollView.remove($.testnet);

      $.scrollView.remove($.autopilot);
      if ($.fullnode != undefined) {
        $.scrollView.remove($.fullnode);
      }
    } else {
      ignoreChange = true;
      if (Alloy.Globals.network == "testnet") {
        $.testnetSwitch.value = true;
      }

      if (Ti.App.Properties.getInt("autoPilot", 0) == 1) {
        $.autoPilotSwitch.value = true;
      }

      if (
        Ti.App.Properties.getInt("feeLimitPercent", globals.defaultFeeLimit) !=
        -1
      ) {
        $.feeLimitSwitch.value = true;
      }

      setTimeout(function() {
        ignoreChange = false;
      }, 500);
    }
  }
};

function merchantManager() {
  Alloy.createController("merchantManager")
    .getView()
    .open();
}

function merchantSales() {
  Alloy.createController("merchantSales")
    .getView()
    .open();
}

function merchantSetting() {
  Alloy.createController("merchantSetting")
    .getView()
    .open();
}

function merchantRegister() {
  Alloy.createController("merchantRegister")
    .getView()
    .open();
}
