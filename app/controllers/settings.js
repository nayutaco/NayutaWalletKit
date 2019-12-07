$.background.animate({
  opacity: 0.5,
  duration: 200
});


var pagesNav = {};

if (OS_IOS) {
  $.mainView.animate({
    left: 0,
    duration: 200
  });
}

var version =
  "ver " +
  Ti.App.version +
  (Alloy.CFG.isDevelopment ? " dev" : "") +
  "\n\n" +
  "(c) 2019 Nayuta";

$.version.text = version;

if (Alloy.CFG.isDevelopment == false) {
  $.scrollView.remove($.signOut);
}

function startBluetooth() {
  if (
    !Ti.Geolocation.hasLocationPermissions(
      Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE
    )
  ) {
    Ti.Geolocation.requestLocationPermissions(
      Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE,
      function (e) {
        if (!e.success) {
          alert("you need to accept location permission");
          return;
        }
      }
    );
  }

  checkIfLocationEnabled();
}

$.feeLimitDesc.text = L("set_fee_limit_desc").format({
  feeLimitPercentage: globals.feeLimitPercentage
});


function viewPassphrase() {

  if (pagesNav["passphrase"] == true) {
    return;
  }

  pagesNav["passphrase"] = true;

  globals.auth.check({
    title: "",
    callback: function (e) {
      if (e.success) {
        Alloy.createController("passphrase_screen", {
          passphrase: globals.decryptedPassphrase.split(","),
          viewMode: true
        })
          .getView()
          .open();
        pagesNav["passphrase"] = false;
      }
    }
  });
}

function setFeeLimit(e) {
  if (globals.settingsIsSelected == false || ignoreChange) {
    // for some reason switch change event is triggered when switching tabs
    return;
  }

  if (e.value == true) {
    Alloy.Globals.network = "setting fee limit";
    Ti.App.Properties.setInt("feeLimitPercent", globals.feeLimitPercentage);
  } else {
    globals.console.log("setting no fee limit");
    Ti.App.Properties.setInt("feeLimitPercent", -1);
  }

  globals.console.log(
    "fee limit",
    Ti.App.Properties.getInt("feeLimitPercent", -1)
  );
}

function checkIfBluetoothEnabled() {
  if (
    globals.bluetoothController.bluetoothController.isBluetoothEnabled() == true
  ) {
    Alloy.createController("components/device_list")
      .getView()
      .open();
  } else {
    alert(L("enable_bluetooth"));
  }
}

function addWatchTower() {
  var dialog = globals.util.createInputDialog({
    title: L("add_watch_tower"),
    message: L("add_watch_tower_desc"),
    value: "",
    buttonNames: [L("label_add"), L("label_close")]
  });
  dialog.origin.addEventListener("click", function (e) {
    globals.console.log(e);
    if (OS_IOS) {
      var inputText = e.text;
    } else if (OS_ANDROID) {
      var inputText = dialog.androidField.getValue();
    }
    if (e.index != e.source.cancel) {
      const comps = inputText.split("@");
      if (comps.length != 2) {
        alert(L("watch_tower_format_error"));
        return;
      }
      globals.lnGRPC.addTower(inputText, function (error, response) {
        if (error == true) {
          alert(L("error_loading").format({ message: response }));

          return;
        }

        alert(L("watch_tower_added"), response);
      });
    }
  });
  dialog.origin.show();
}
function checkIfLocationEnabled() {
  if (
    Ti.Geolocation.hasLocationPermissions(
      Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE
    )
  ) {
    checkIfBluetoothEnabled();
  } else {
    alert(L("accept_location"));
  }
}

var ignoreChange = false;

exports.API = {
  loadSettings: function () {
    if (Ti.App.Properties.getString("mode", "") != "lndMobile") {
      $.scrollView.remove($.addWatchTower);
      $.scrollView.remove($.testnet);
      $.scrollView.remove($.passphrase);
      $.scrollView.remove($.feeLimit);
      $.scrollView.remove($.autopilot);
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

      setTimeout(function () {
        ignoreChange = false;
      }, 500);
    }
  }
};

function addNode() {
  if (pagesNav["accounts"] == true) {
    return;
  }

  pagesNav["accounts"] = true;
  Alloy.createController("accounts")
    .getView()
    .open();
  pagesNav["false"] = true;
}

function signOut() {
  globals.removeEverything(function () {
    globals.screenView.close();
    Alloy.createController("signin")
      .getView()
      .open();
  });
}

function exportChannels() {
  if (globals.synced == false) {
    alert(L("wait_for_sync"));
    return;
  }

  if (pagesNav["google"] == true) {
    return;
  }

  pagesNav["google"] = true;

  Alloy.createController("components/google_drive_link")
    .getView()
    .open();

  pagesNav["google"] = false;
}

function setTestnetSwitch(e) {
  if (globals.settingsIsSelected == false || ignoreChange) {
    // for some reason switch change event is triggered when switching tabs
    return;
  }

  if (e.value == true) {
    globals.console.log("setting testnet");
    Alloy.Globals.network = "testnet";
  } else {
    globals.console.log("setting mainnet");
    Alloy.Globals.network = "mainnet";
  }

  Ti.App.Properties.setString("lndMobileNetwork", Alloy.Globals.network);


  if (OS_ANDROID) {
    if (globals.fullNodeController != undefined) {
      globals.fullNodeController.cancelJob();

      globals.fullNodeController.cancelForeground();

      globals.fullNodeController.stopCore();
    }
  }
  alert(L("restart_app"));
}

function setAutoPilot(e) {
  if (globals.settingsIsSelected == false || ignoreChange) {
    // for some reason switch change event is triggered when switching tabs
    return;
  }

  if (e.value == true) {
    Ti.App.Properties.setInt("autoPilot", 1);
  } else {
    Ti.App.Properties.setInt("autoPilot", 0);
  }

  alert(L("restart_app"));
}

function openFullNode() {
  if (pagesNav["node"] == true) {
    return;
  }

  pagesNav["node"] = true;
  Alloy.createController("fullnode")
    .getView()
    .open();

  pagesNav["node"] = false;
}
