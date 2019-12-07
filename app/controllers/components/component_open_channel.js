var aChannel = arguments[0] || {};
globals.console.log("adding open channel1");
var channelPoint = aChannel.channel_point;

if(globals.tiker.ifNoFiat()){
  $.localAmountFiat.hide();
  $.remoteAmountFiat.hide();
}

var force = false;
if (aChannel["active"] == "1") {
  $.statusImage.backgroundColor = Alloy.Globals.greenColor;
} else {
  $.statusImage.backgroundColor = "#a84040";
}

var pubkeyShort = aChannel.remote_pubkey.substr(0, 30) + "...";
$.details.text = pubkeyShort;

if (aChannel.local_balance == undefined) {
  aChannel.local_balance = 0;
}

if (aChannel.remote_balance == undefined) {
  aChannel.remote_balance = 0;
}

$.closeChannelButton.text = " " + $.closeChannelButton.text + " ";

if (OS_IOS) {
  $.closeChannelButton.text = $.closeChannelButton.text + "  ";
}

var totalBalance =
  parseInt(aChannel.local_balance) + parseInt(aChannel.remote_balance);
var localPercentage = (parseInt(aChannel.local_balance) / totalBalance) * 100;
var remotePercentage = (parseInt(aChannel.remote_balance) / totalBalance) * 100;

if (localPercentage < 1) {
  localPercentage = 1;
  remotePercentage = 99;
}

if (remotePercentage < 1) {
  remotePercentage = 1;
  localPercentage = 99;
}

$.amountsBarLocal.width = localPercentage + "%";
$.amountsBarRemote.width = remotePercentage + "%";

var localBalanceStr = aChannel.local_balance + "";
var localBalanceText = localBalanceStr + " SAT";

if (aChannel.local_balance != undefined) {
  var attr = Titanium.UI.createAttributedString({
    text: localBalanceText,
    attributes: [
      {
        type: Ti.UI.ATTRIBUTE_FONT,
        value: {
          fontSize: 13,
          fontFamily: "GillSans-Light",
          fontWeight: "light"
        },
        range: [
          localBalanceText.indexOf(localBalanceStr + ""),
          (localBalanceStr + "").length
        ]
      },
      {
        type: Ti.UI.ATTRIBUTE_FONT,
        value: {
          fontSize: 8,
          fontFamily: "GillSans-Light",
          fontWeight: "light"
        },
        range: [localBalanceText.indexOf(" SAT"), " SAT".length]
      }
    ]
  });
}

$.localAmount.attributedString = attr;

var valueAmtNoFormat = globals.util.satToBtc(
  parseInt(aChannel.local_balance + "")
);
var fiatAmt = globals.tiker.to(valueAmtNoFormat, 2) + "";

$.localAmountFiat.text = fiatAmt;

var remoteBalanceStr = aChannel.remote_balance;
var remoteBalanceText = remoteBalanceStr + " SAT";

var attr2 = Titanium.UI.createAttributedString({
  text: remoteBalanceText,
  attributes: [
    {
      type: Ti.UI.ATTRIBUTE_FONT,
      value: {
        fontSize: 13,
        fontFamily: "GillSans-Light",
        fontWeight: "light"
      },
      range: [
        remoteBalanceText.indexOf(remoteBalanceStr + ""),
        (remoteBalanceStr + "").length
      ]
    },
    {
      type: Ti.UI.ATTRIBUTE_FONT,
      value: {
        fontSize: 8,
        fontFamily: "GillSans-Light",
        fontWeight: "light"
      },
      range: [remoteBalanceText.indexOf(" SAT"), " SAT".length]
    }
  ]
});

$.remoteAmount.attributedString = attr2;

var valueAmtNoFormat = globals.util.satToBtc(
  parseInt(aChannel.remote_balance + "")
);
var fiatAmt = globals.tiker.to(valueAmtNoFormat, 2) + "";

$.remoteAmountFiat.text = fiatAmt;

function continueCloseChannel() {
  $.closeChannelButton.hide();
  $.loadingSpinner.show();

  try {
    var channelPointObject = channelPoint.split(":");
    var txid = channelPointObject[0];
    var output = channelPointObject[1];
    output = parseInt(output);

    globals.lnGRPC.closeChannel(txid, output, force, function(error, res) {
      if (error == true) {
        try {
          if (res.indexOf("force closing") != -1) {
            var dialog = globals.util.createDialog({
              title: L("label_closechannel_confirm_title"),
              message: L("label_closechannel_confirm_force_description"),
              buttonNames: [L("label_force_close"), L("label_cancel")]
            });

            dialog.addEventListener("click", function(e) {
              if (e.index != e.source.cancel) { 
                globals.auth.check({
                  title: "",
                  callback: function(e) {
                    if (e.success) {
                      force = true;
                      continueCloseChannel();
                    }else{
                      $.closeChannelButton.show();
                      $.loadingSpinner.hide();
                    }
                  }
                });
              } else {
                $.closeChannelButton.show();
                $.loadingSpinner.hide();
              }
            });
            dialog.show();

            return;
          }

          globals.console.log(error);
          alert(res);

          $.closeChannelButton.show();
          $.loadingSpinner.hide();

          return;
        } catch (e) {
          globals.console.error(e);
        }
      }
      globals.console.log("close channel", res);
      if (globals.getWalletBalance != undefined) {
        globals.getWalletBalance();
      }
      if (globals.listTransactions != undefined) {
        globals.listTransactions();
      }
      if (globals.loadMainScreen != undefined) {
        globals.loadMainScreen();
      }

      Alloy.Globals.getChannels();
      

      try {
        globals.console.log(res);
        try {
          globals.console.log(res.close_pending);
        } catch (e) {}

        if (res != undefined) {
          if (res.channel_close_update != undefined) {
            if (res.channel_close_update.txid != undefined) {
              Alloy.Globals.getChannels();
              return;
            }
          }
          if (res.pending_update != undefined) {
            if (res.pending_update.txid != undefined) {
              alert("channel closing");
              Alloy.Globals.getChannels();
              return;
            }
          }

          // for ios grpc
          if (res.close_pending != undefined) {
            if (res.close_pending.txid != undefined) {
              Alloy.Globals.getChannels();
              return;
            }
          }
        }
 
      } catch (e) {
        globals.console.error(e);
      }
    });
  } catch (e) {
    $.closeChannelButton.show();
    $.loadingSpinner.hide();
    globals.console.error(e);
  }
}

function closeChannel() {
  var buttons = [L("label_force_close"), L("label_cancel"), L("label_close")];

  var forceCloseIndex = 0;
  var closeIndex = 2;

  var dialog = globals.util.createDialog({
    title: L("label_closechannel_confirm_title"),
    message: L("label_closechannel_confirm_description"),
    buttonNames: buttons
  });
  dialog.addEventListener("click", function(e) {
    if (e.index == forceCloseIndex) {
      
      var dialog = globals.util.createDialog({
        title: L("label_closechannel_confirm_title"),
        message: L("label_closechannel_confirm_force_description_check"),
        buttonNames: [L("label_force_close"), L("label_cancel")]
      });

      dialog.addEventListener("click", function(e) {
        if (e.index != e.source.cancel) { 
          globals.auth.check({
            title: "",
            callback: function(e) {
              if (e.success) {
                force = true;
                continueCloseChannel();
              }else{
                $.closeChannelButton.show();
                $.loadingSpinner.hide();
              }
            }
          });
        } else {
          $.closeChannelButton.show();
          $.loadingSpinner.hide();
        }
      });
      dialog.show();

    } else if (e.index == closeIndex) {
      globals.console.log("closing");
      continueCloseChannel();
    }
  });
  dialog.show();
}
var cachedAlias = Ti.App.Properties.getString(
  aChannel.remote_pubkey + "_alias",
  ""
);

if (pubkeyShort.indexOf(cachedAlias) != -1 || cachedAlias == undefined) {
  cachedAlias = "";
}

if (cachedAlias != "") {
  setAlias(cachedAlias);
} else {
  $.details.text = L("label_loading");
  globals.lnGRPC.getNodeInfo(aChannel.remote_pubkey, function(error, res) {
    setAlias(cachedAlias);

    if (error == false) {
      try {
        setAlias(res.node.alias);

        Ti.App.Properties.setString(
          aChannel.remote_pubkey + "_alias",
          res.node.alias
        );
        return;
      } catch (e) {}
    }
  });
}

function setAlias(alias) {
  if (pubkeyShort.indexOf(alias) != -1 || alias == undefined) {
    alias = "";
  }

  if (alias != "") {
    alias += " ";
  }

  var text = alias + pubkeyShort;

  var attr = Titanium.UI.createAttributedString({
    text: text,
    attributes: [
      {
        type: Ti.UI.ATTRIBUTE_FONT,
        value: {
          fontSize: 15,
          fontFamily: "GillSans-Light",
          fontWeight: "light"
        },
        range: [text.indexOf(alias + ""), (alias + "").length]
      },
      {
        type: Ti.UI.ATTRIBUTE_FONT,
        value: {
          fontSize: 12,
          fontFamily: "GillSans-Light",
          fontWeight: "light"
        },
        range: [text.indexOf(pubkeyShort), pubkeyShort.length]
      }
    ]
  });

  $.details.attributedString = attr;
}
