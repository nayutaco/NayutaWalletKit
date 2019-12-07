var currencyFiat = globals.getCurrency();

$.mainView.height = globals.util.getDisplayHeight();

function androidChangeValue() {
  // keypressed event not firing on android
  if (OS_ANDROID) {
    updateAmount();
  }
}

function androidChangeValueFiat() {
  if (OS_ANDROID) {
    updateAmountFiat();
  }
}

if(globals.tiker.ifNoFiat()){
  $.fiatView.hide();
  $.fiatSeperator.hide();
}

function setUp() {
  $.amountField.addEventListener("change", function(e) {});

  $.amountFieldFiat.addEventListener("change", function(e) {
    updateAmountFiat();
  });
  currencyFiat = globals.getCurrency();
  $.amountFieldFiat.hintText = L("label_enter_funding_hint_fiat").format({
    currency: currencyFiat
  });
  $.statusLabel.hide();
  $.openChannelButton.show();
  $.openChannelButton.title = "  " + L("open_channel_text") + "  ";

  $.cryptoSymbol.text = globals.LNCurrencySat;

  $.fiatSymbol.text = currencyFiat;
}

function hideKeyboard() {
  $.peerField.blur();
  $.amountField.blur();
  $.amountFieldFiat.blur();
}

exports.API = {
  setUp: function() {
    setUp();
  },
  setPubKey: function(pubkey) {
    $.peerField.value = pubkey;
  }
};

function updateAmountFiat() {
  setTimeout(function() {
    if ($.amountFieldFiat.value.length == 0) {
      $.amountField.value = "0";
      return;
    }

    var amountString = $.amountFieldFiat.value;

    var FiatSymbol = globals.tiker.getFiatSymbol();

    amountString = amountString.replace(FiatSymbol, "");

    if (amountString == "") {
      amountString = "0";
    }

    var amount = parseFloat(amountString.replace(/,/g, ""));

    var fiatValue = globals.tiker.getFiatValue();

    var cryptoAmount = amount / fiatValue;
    var valueAmt = Math.floor(globals.util.btcToSat(cryptoAmount));

    $.amountField.value = valueAmt;
  }, 100);
}

function updateAmount() {
  setTimeout(function() {
    if ($.amountField.value.length == 0) {
      $.amountFieldFiat.value = "0";
      return;
    }
    var amount = parseInt($.amountField.value);

    var valueAmt = globals.util.satToBtc(amount, true);

    valueAmt = globals.tiker.to(valueAmt, 2);
    $.amountFieldFiat.value = valueAmt;
  }, 100);
}

function startOpenChannel() {
 
  var lightningAddress = $.peerField.value;

  globals.console.log(lightningAddress);
  let components = lightningAddress.split("@");

  if(components.length != 2){
    alert(L("please_enter_valid_lnaddress"))
    return;
  }


  if($.amountField.value.length == 0 || parseInt($.amountField.value) == 0){
    
    alert(L("please_enter_valid_amount"))
    return;
   
  }
  
  var pubKey = components[0];
  var host = components[1];
  globals.console.log(pubKey);
  globals.console.log(host);
  $.statusLabel.text = L("label_loading");
  $.statusLabel.show();
  $.openChannelButton.hide();
  $.amountField.blur();
  $.peerField.blur();
  globals.lnGRPC.connectPeer(
    lightningAddress,
    function(error, res) {
      globals.console.log("res", res);
      var peerAlreadyAdded = false;

      if ((res + "").indexOf("already connected") != -1) {
        peerAlreadyAdded = true;
      }

      if (error == true && peerAlreadyAdded == false) {
        Alloy.createController("components/conf_screen", {
          parent: $.getView(),
          errorMessage: res,
          type: "fail",
          callback: function() {}
        }).getView();

        $.statusLabel.hide();
        $.openChannelButton.show();
      } else {
        globals.console.log("res", res);

        globals.console.log(pubKey);
        var amount = $.amountField.value;
        globals.console.log("trying to open channel");
        globals.lnGRPC.openChannel(pubKey, amount, function(error, res) {
          globals.console.log("error", error);
          if (error == true) {
            
            globals.console.log("is error", error);
            globals.console.log("error res", res);

            Alloy.createController("components/conf_screen", {
              parent: $.getView(),
              errorMessage: res,
              type: "fail",
              callback: function() {}
            }).getView();
            $.statusLabel.hide();
            $.openChannelButton.show();
          } else {
            
            globals.console.log("res is ", res);

            var fundingTxidStr = res["funding_txid_str"];
            globals.console.log("funding tx", fundingTxidStr);
            if (fundingTxidStr != undefined) {
              $.statusLabel.text = L("label_channel_opening");
            }
            setTimeout(function() {
              close();
              if (Alloy.Globals.getChannels != undefined) {
                Alloy.Globals.getChannels();
              }

              if (globals.getWalletBalance != undefined) {
                globals.getWalletBalance();
              }
              if (globals.listTransactions != undefined) {
                globals.listTransactions();
              }
              
            }, 4000);
          }
        });
      }
    }
  );
}

var startScan = function() {
  Alloy.Globals.util.readQRcodePubkey({
    callback: function(e) {
      globals.console.log(e);
      globals.console.log("callback ", e);

      var qrcodeData = e;

      $.peerField.value = qrcodeData;
    },
    textCallback: function(e) {
      globals.console.log(e);
    }
  });
};

setUp();

function close(e) {
  $.background.animate({
    opacity: 0,
    duration: 200
  });

  $.mainView.animate({
    top: globals.display.height,
    duration: 200
  });

  setTimeout(function() {
    $.win.width = 0;
    $.win.close();
  }, 200);
}

$.background.animate({
  opacity: 0.5,
  duration: 200
});

$.mainView.animate({
  top: 0,
  duration: 200
});
