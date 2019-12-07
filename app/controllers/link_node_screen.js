var attr = Titanium.UI.createAttributedString({
  text: L("link_node_description"),
  attributes: [
    {
      type: Ti.UI.ATTRIBUTE_UNDERLINES_STYLE,
      value:
        Ti.UI.ATTRIBUTE_UNDERLINE_STYLE_DOUBLE |
        Ti.UI.ATTRIBUTE_UNDERLINE_PATTERN_DOT, // Ignored by Android only displays a single line
      range: [
        L("link_node_description").indexOf(L("here_word")),
        L("here_word").length
      ]
    }
  ]
});

$.description.attributedString = attr;

$.firstButtonBack.onClick(function() {
  $.win.close();
});

function goToHelp() {
  Ti.Platform.openURL("http://nayuta.co/wallet/link_node");
}

function startLink() {
  globals.util.readQRcodeAccount(
    {
      callback: function(e) {
        $.loadingSpinnerConnect.show();
        $.innerView.hide();
        globals.continueConnect(
          e,
          function(config) {
            globals.checkConnection(config, function(success, res) {
              if (success) {
                globals.console.log("creating user key");
                globals.nativeCrypto.createUserKey(function(success, userKey) {
                  if (success) {
                    globals.userKey = userKey;

                    Alloy.createController("components/pincode_screen", {
                      type: "set",
                      callback: function(number) {
                        globals.passCodeHash = number;
                        if (globals.userKey == undefined) {
                          throw "error user key should not be undefined";
                        }
                        var encryptedPasscodeHash = globals.cryptoJS.AES.encrypt(
                          globals.passCodeHash,
                          globals.userKey
                        ).toString();

                        Ti.App.Properties.setString(
                          "passcode",
                          encryptedPasscodeHash
                        );
                        globals.unlocked = true;

                        globals.currentConfig = config;
                        globals.screenView = Alloy.createController(
                          "frame"
                        ).getView();
                        globals.screenView.open();
                      },
                      cancel: function() {}
                    })
                      .getView()
                      .open();
                  } else {
                    throw "error creating key";
                  }
                });
              } else {
                $.loadingSpinnerConnect.hide();
                $.innerView.show();
                alert(L("error_connecting"));
              }
            });
          },
          function(error) {
            $.loadingSpinnerConnect.hide();
            $.innerView.show();
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

$.linkBtcPay.onClick(startLink);
$.linkLND.onClick(startLink);
