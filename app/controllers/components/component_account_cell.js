var args = arguments[0] || {};

var connect = function() {};
globals.console.log(args);

if (args.isLNDMobile == true) {
  $.pubKey.text = L("local_wallet_description");

  $.alias.text = L("connect_lndmobile");

  if (Ti.App.Properties.getString("mode", "") == "lndMobile") {
    $.selectButtonOuter.hide();
  } else {
    $.selectButtonOuter.show();
    $.selectButton.text = L("label_connect");
  }

  connect = function() {
    globals.closeAccounts();

    Ti.App.Properties.setString("mode", "lndMobile");
    if (globals.lndMobileStarted == true) {
      globals.stopLND(function() {});
    }
    alert(L("restart_app"));
  };
} else if (args.createAccount == true) {
  $.pubKey.text = L("add_remote_node_description");

  $.alias.text = L("add_remote_node");

  $.selectButton.text = L("label_add_remote_button");

  connect = function() {
    addNewAccount();
  };

  setDark();
} else if (args.createLocalWallet == true) {
  setDark();

  $.pubKey.text = L("create_wallet_description");

  $.alias.text = L("create_lndmobile");

  $.selectButtonOuter.show();
  $.selectButton.text = L("label_create_node");

  connect = function() {
    globals.util.showDisclaimer(function() {
      $.spinner.show();
      $.buttons.hide();

      globals.util.loadStartUpInfo(function(error, response) {
        if (error == false) {
          setTimeout(function() {
            globals.console.log("starting lndMobile");

            globals.lnGRPC.startLNDMobile(function(error, response) {
              globals.console.log("lndMobile1", error);
              globals.console.log("lndMobile1", response);

              if (error == true) {
                $.spinner.hide();
                $.buttons.show();
                alert(response);
                return;
              }

              globals.lnGRPC.generateSeed(function(error, response) {
                globals.console.log("generateSeed", response);
                if (error == true) {
                  $.spinner.hide();
                  $.buttons.show();
                  alert(response);
                  return;
                }

                if (response.cipherSeedMnemonic != undefined) {
                  var passphrase = response.cipherSeedMnemonic.join();

                  if (globals.lnGRPC.checkCapacity() == false) {
                    $.spinner.hide();
                    $.buttons.show();
                    alert(L("not_enough_space"));
                    return;
                  }
                  globals.console.log("creating account");

                  globals.decryptedPassphrase = passphrase;

                  $.spinner.hide();
                  $.buttons.show();

                  Alloy.createController("passphrase_screen", {
                    passphrase: globals.decryptedPassphrase.split(","),
                    fromAccounts: true,
                    callback: function() {
                      globals.isREST = false;
                      args.closeAndReload(); 
                    }
                  })
                    .getView()
                    .open();
                } else {
                  alert("error creating passphrase");
                  return;
                }
              });
            });
          }, 100);
        } else {
          alert(L("error_loading").format({ message: response }));
        }
      });
    });
  };
} else {
  $.pubKey.text = args.identity_pubkey.substring(0, 40) + "...";

  if (args.alias == undefined || args.alias == "") {
    args.alias = args.identity_pubkey.substring(0, 10);
  }

  $.alias.text = Ti.App.Properties.getString(
    args.identity_pubkey + "_name_v1",
    args.alias
  );

  connect = function() {
    var config = globals.decryptConfig(args.config, globals.userKey);
    if (config != undefined) {
      globals.console.log("connecting GRPC");
      globals.closeAccounts();
      globals.connectLNDGRPC(config);
    } else {
      globals.console.log("config undefined");
    }
  };
}

function remove() {
  var accounts = JSON.parse(
    Ti.App.Properties.getString(globals.accountsKey, "{}")
  );
  delete accounts[args.identity_pubkey];
  Ti.App.Properties.setString(globals.accountsKey, JSON.stringify(accounts));
  globals.loadAccountsList();
}

function addNewAccount() {
  globals.util.readQRcodeAccount(
    {
      callback: function(e) {
        $.spinner.show();
        $.buttons.hide();
        globals.continueConnect(
          e,
          function(config) {
            globals.checkConnection(config, function(success, res) {
              if (success) {
                globals.stopLND(function() {
                  globals.connectLNDGRPC(config);

                  globals.closeAccounts();
                });
              } else {
                $.spinner.hide();
                $.buttons.show();
                alert(res);
              }
            });
          },
          function(error) {
            $.spinner.hide();
            $.buttons.show();
            if (e.indexOf(".onion") != -1) {
              if (OS_ANDROID) {
                Alloy.createController("components/orbot_screen")
                  .getView()
                  .open();
              } else {
                alert(L("tor_not_ios"));
              }
            } else {
              alert(error);
            }
          }
        );
      }
    },
    true
  );
}

function setDark() {
  $.cell.backgroundColor = Alloy.Globals.nayutaDark;
  $.alias.color = "white";
  $.pubKey.color = "white";
  $.selectButtonOuter.borderColor = "white";
  $.selectButton.color = "white";
}

function showOptions() {
  if (!args.isAccount) {
    return;
  }

  var buttons = [L("label_rename"), L("label_cancel"), L("label_delete")];

  var renameIndex = 0;
  var deleteIndex = 2;

  var dialog = globals.util.createDialog({
    title: L("label_options"),
    message: "",
    buttonNames: buttons
  });
  dialog.addEventListener("click", function(e) {
    if (e.index == renameIndex) {
      var dialog = globals.util.createInputDialog({
        title: L("label_rename"),
        message: "",
        value: "",
        buttonNames: [L("label_apply"), L("label_close")]
      });
      dialog.origin.addEventListener("click", function(e) {
        globals.console.log(e);
        if (OS_IOS) {
          var inputText = e.text;
        } else if (OS_ANDROID) {
          var inputText = dialog.androidField.getValue();
        }
        if (e.index != e.source.cancel) {
          Ti.App.Properties.setString(
            args.identity_pubkey + "_name_v1",
            inputText
          );
          $.alias.text = inputText;
        }
      });
      dialog.origin.show();
    } else if (e.index == deleteIndex) {
      remove();
    }
  });
  dialog.show();
}
