var aChannel = arguments[0] || {};
globals.console.log("adding closing channel", aChannel);

if (aChannel.channel.local_balance == undefined) {
  aChannel.channel.local_balance = 0;
}
if (aChannel.channel.remote_balance == undefined) {
  aChannel.channel.remote_balance = 0;
}
$.pubKey.text = aChannel.channel.remote_node_pub.substring(0, 50) + "...";

var totalBalance =
  parseInt(aChannel.channel.local_balance) +
  parseInt(aChannel.channel.remote_balance);
var localPercentage =
  (parseInt(aChannel.channel.local_balance) / totalBalance) * 100;
var remotePercentage =
  (parseInt(aChannel.channel.remote_balance) / totalBalance) * 100;

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

var localBalanceStr = aChannel.channel.local_balance + "";
var localBalanceText = localBalanceStr + " SAT";

if (aChannel.channel.local_balance != undefined) {
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
  parseInt(aChannel.channel.local_balance + "")
);
var fiatAmt = globals.tiker.to(valueAmtNoFormat, 2) + "";

$.localAmountFiat.text = fiatAmt;

var remoteBalanceStr = aChannel.channel.remote_balance;
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
  parseInt(aChannel.channel.remote_balance + "")
);
var fiatAmt = globals.tiker.to(valueAmtNoFormat, 2) + "";

$.remoteAmountFiat.text = fiatAmt;

function viewDetails() {
  if (Alloy.Globals.network == "testnet") {
    Ti.Platform.openURL(
      "https://www.blockstream.info/testnet/tx/" + aChannel.closing_txid
    );
  } else {
    Ti.Platform.openURL(
      "https://www.blockstream.info/tx/" + aChannel.closing_txid
    );
  }
}

globals.console.log("added closed channel");
