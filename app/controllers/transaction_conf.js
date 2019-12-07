var args = arguments[0] || {};

$.loadingSpinner.show();
var currencyFiat = globals.getCurrency();
$.confBox.top = Ti.Platform.displayCaps.platformHeight + $.confBox.height;

$.paymentAmountFiat.hintText = L("enter_payment_amount_fiat").format({
  currency: globals.getCurrency()
});

if (Alloy.Globals.isiPhoneX) {
  $.buttonsView.top = 0;
}

var win = Ti.UI.createWindow({
  orientationModes: [Ti.UI.PORTRAIT],
  navBarHidden: true,
  backgroundColor: "transparent",
  windowSoftInputMode: OS_ANDROID
    ? Ti.UI.Android.SOFT_INPUT_STATE_ALWAYS_HIDDEN
    : null
});

var currentRHASH = null;
var currentMemo = null;
win.add($.transaction_conf);
win.open();

if (args.small == true) {
  $.confBox.height = 250;
}

function setImg() {
  if (OS_IOS) {
    $.img.image = "/images/image_blank.png";
    $.img.top = $.confBox.top;
    $.img.borderRadius = $.confBox.borderRadius;
    $.img.width = $.confBox.width;
    $.img.height = $.confBox.height;

    // Blur view
    var blur = Ti.UI.iOS.createBlurView({
      width: Ti.UI.FILL,
      height: Ti.UI.FILL
    });
    $.img.add(blur);
    blur.setEffect(Ti.UI.iOS.BLUR_EFFECT_STYLE_EXTRA_LIGHT);
  } else {
    $.img.image = "/images/image_blank.png";
    $.img.backgroundColor = "#ececec";
    $.img.top = $.confBox.top;
    $.img.borderRadius = $.confBox.borderRadius;
    $.img.width = $.confBox.width;
    $.img.height = $.confBox.height;

    $.confBox.top = null;
    $.img.top = null;
    $.confBox.bottom = -$.confBox.height;
    $.img.bottom = -$.confBox.height;
  }
}

function increaseSize(size) {
 
  $.confBox.height = $.confBox.height + size; 
  $.confBox.top = Ti.Platform.displayCaps.platformHeight - $.confBox.height;
 
    setImg();
   
}

setImg();

function cancel() {
  args.cancel();
  close();
}

function cancelPayment() {
  args.cancel();
  close();
}

if (OS_ANDROID) {
  win.addEventListener("android:back", function (e) {
    cancel();
  });
}

function close() {
  $.confBox.animate({
    top: Ti.Platform.displayCaps.platformHeight + $.confBox.height,
    duration: 300
  });

  $.img.animate({
    top: Ti.Platform.displayCaps.platformHeight + $.confBox.height,
    duration: 300
  });

  $.background.animate({
    opacity: 0.0,
    duration: 200
  });
  setTimeout(function () {
    win.close();
  }, 600);
}

if (args.nodeURI == undefined) {
  $.info.remove($.channelAmount);
}

if (args.enterRequest == undefined) {
  $.info.remove($.paymentRequest);
}

if (args.enterConfig == undefined) {
  $.info.remove($.configField);
}

var oldCustomPaymentHeight = $.customPayment.getRect().height; 
if (args.needsAmount == undefined || args.needsAmount == false) {
  $.customPayment.height = 0;
  $.customPayment.hide();
} else {
  var sizeToIncrease = 30;
  if (args.sizeToIncrease != undefined) {
    sizeToIncrease = args.sizeToIncrease;
  }
  increaseSize(sizeToIncrease);
}

if (args.onchain == false || args.onchain == undefined) {
  $.onChainPayment.height = 0;
  $.onChainPayment.hide();
} else {
  $.feeLabel.text = args.feeText;
}

function updateFee() {
  args.updateFee();
}

exports.API = {
  close: function () {
    close();
  }
};

function confirm() {
  if (args.enterConfig) {
    if ($.configField.value.length > 0) {
      args.confirm($.configField.value);
      close();
      return;
    } else {
      alert(L("enter_config_url"))
      return;
    }
  } else if (args.enterRequest) {
    if ($.paymentRequest.value.length > 0) {
      var payReq = $.paymentRequest.value;

      if (payReq.indexOf("lightning:") != -1) {
        payReq = payReq.replace("lightning:", "");
      }

      globals.lnGRPC.decodePayReq(payReq, function (error, res) {
        if (error == true) {
          alert(res);
          return;
        }

        if (res.payment_hash != undefined) {
          var rhash = res.payment_hash;
          currentRHASH = rhash;
          globals.console.log(res);
          var memo = null;

          if (res.description != undefined) {
            memo = res.description;
          }
          currentMemo = memo;

          if (globals.bitcoin.checkExpired(res)) {
            alert(L("text_payment_expired"));
            globals.clearTask();
            return;
          }
          if (res.num_satoshis == 0) {
            res.num_satoshis = undefined;
          }

          globals.console.log(res);
          needsAmount = false;
          var message = L("text_request_pay_ln").format({
            value: res.num_satoshis
          });
          if (res.num_satoshis == undefined) {
            message = L("text_request_pay_ln_no_amount").format({});
          }
          if (memo != null) {
            message = L("text_request_pay_ln_memo").format({
              memo: memo,
              value: res.num_satoshis
            });

            if (res.num_satoshis == undefined) {
              message = L("text_request_pay_ln_memo_no_amount").format({
                memo: memo
              });
            }
          }

          $.message.text = message;
          args.enterRequest = null;
          args.payReq = payReq;

          $.info.remove($.paymentRequest);

          if (res.num_satoshis == undefined) {
 
            var sizeToIncrease = 30;

            if (args.sizeToIncrease != undefined) {
               sizeToIncrease = args.sizeToIncrease;
            } 

            $.confBox.bottom = 0;
            
            $.message.top=10;
            
            if(oldCustomPaymentHeight == 0){
               oldCustomPaymentHeight = 100;
            }
            
            
            $.message.height = 20;
            $.customPayment.height = oldCustomPaymentHeight;
            
            $.customPayment.show();
            

          }
        } else {
          globals.console.error("payment hash is null");
        }
      });
    }

    return;
  }

  if (args.nodeURI != undefined) {
    $.cancelButtonSmall.visible = true;
    $.loading.visible = true;
    $.mainInfo.visible = false;

    globals.lnGRPC.connectPeer(args.nodeURI, function (error, res) {
      if (error == true) {
        if (res.indexOf("already connected to peer") == -1) {
          $.loading.visible = false;
          $.cancelButtonSmall.visible = false;
          $.notpaid.visible = true;
          setTimeout(function () {
            setTimeout(function () {
              alert(res);
            }, 1000);
            close();
          }, 1000);
          return;
        }
      }
      globals.console.log("res", res);
      var pub_key = args.nodeURI.split("@")[0];

      var fundingAmt = $.channelAmount.value;
      if (fundingAmt.length == 0) {
        alert(L("label_enter_funding_amt"));

        $.cancelButtonSmall.visible = false;
        $.loading.visible = false;
        $.mainInfo.visible = true;

        return;
      }
      globals.lnGRPC.openChannel(pub_key, fundingAmt, function (error, res) {
        globals.console.log(res);
        $.cancelButtonSmall.visible = false;
        $.loading.visible = false;
        if (error == true) {
          alert(res);
          $.cancelButtonSmall.visible = false;
          $.loading.visible = false;
          $.mainInfo.visible = true;
          return;
        }

        try {
          var txid = null;

          if (
            res.pending_update != undefined &&
            res.pending_update.txid != undefined
          ) {
            txid = res.pending_update.txid;
          }

          if (res.funding_txid_bytes != undefined) {
            txid = res.funding_txid_bytes;
          }

          if (txid != null) {
            alert(L("channel_opening"));

            $.paid.visible = true;

            setTimeout(function () {
              args.confirm();
              close();
            }, 1000);
            return;
          }
        } catch (e) {
          globals.console.error(e);
        }
      });
    });
  } else if (args.payReq != undefined) { 
    if (args.num_satoshis == 0) {
      args.num_satoshis = undefined;
    }
      
    $.cancelButtonSmall.visible = true;
    $.loading.visible = true;
    $.mainInfo.visible = false;
    if ($.customPayment.visible == true && args.num_satoshis == undefined) {
      var amt = $.paymentAmount.value;
      if (!isNaN(amt) && amt .toString().indexOf('.') != -1){
        $.cancelButtonSmall.visible = false;
        $.loading.visible = false;
        $.mainInfo.visible = true;
  
        alert(L('millisat_error'));
        return
      }

      args.num_satoshis = parseInt(amt);
      globals.console.log("setting value from field");
    } else {
      args.num_satoshis = -1;
    } 
  
    globals.lnGRPC.sendPayment(args.payReq, args.num_satoshis, function (
      error,
      response
    ) {
      $.loading.visible = false;
      $.cancelButtonSmall.visible = false;
      if (error == true) {
        globals.console.error(response);
        alert(response);
        if (args.onerror != undefined) {
          args.onerror(response);
          return;
        }

        $.cancelButtonSmall.visible = false;
        $.loading.visible = false;
        $.mainInfo.visible = true;
        return;
      }

      if (response.payment_error != undefined && response.payment_error != "") {
        $.notpaid.visible = true;

        setTimeout(function () {
          close();
          setTimeout(function () {
            if (args.onerror != undefined) {
              args.onerror(response.payment_error);
            } else {
              alert(response.payment_error);
            }
          }, 1000);
        }, 1000);
        return;
      }
      globals.console.log(response);
      $.paid.visible = true;

      if (currentRHASH != null && currentMemo != null) {
        Ti.App.Properties.setString("memo_" + currentRHASH, currentMemo);
      }
      setTimeout(function () {
        close();
        args.confirm();
      }, 1000);
    });

    if (args.closeOnSend == true) {
      close();
      args.confirm();
    }
  } else {
    globals.auth.check({
      title: L("text_confirmsend"),
      callback: function (e) {
        if (e.success) {
          args.confirm();
          close();
        } else {
          args.cancel();
        }
      }
    });
  }
}

function hideKeyboard(e) { }

$.cancelButton.title = L("label_cancel");

$.confirmButton.title = L("label_confirm");

$.message.text = args.message;

$.background.animate({
  opacity: 0.3,
  duration: 200,
  delay: 600
});

if (OS_ANDROID) {
  $.confBox.animate({
    bottom: 0,
    duration: 300
  });

  $.img.animate({
    bottom: 0,
    duration: 300
  });
}

if (OS_IOS) {
  $.confBox.animate({
    top: Ti.Platform.displayCaps.platformHeight - $.confBox.height,
    duration: 300
  });

  $.img.animate({
    top: Ti.Platform.displayCaps.platformHeight - $.confBox.height,
    duration: 300
  });
}

function hideKeyboard() {
  $.paymentAmount.blur();
  $.paymentAmountFiat.blur();
}

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

function updateAmountFiat() {
  setTimeout(function () {
    if ($.paymentAmountFiat.value.length == 0) {
      $.paymentAmount.value = "0";
      return;
    }

    var amountString = $.paymentAmountFiat.value;

    var FiatSymbol = globals.tiker.getFiatSymbol();

    amountString = amountString.replace(FiatSymbol, "");

    if (amountString == "") {
      amountString = "0";
    }
    var amount = parseFloat(amountString);

    var fiatValue = globals.tiker.getFiatValue();
    var cryptoAmount = amount / fiatValue;
    var valueAmt = Math.floor(globals.util.btcToSat(cryptoAmount));

    $.paymentAmount.value = valueAmt;
  }, 100);
}

function updateAmount() {
  setTimeout(function () {
    if ($.paymentAmount.value.length == 0) {
      $.paymentAmountFiat.value = "0";
      return;
    }
    var amount = parseInt($.paymentAmount.value);

    var valueAmt = globals.util.satToBtc(amount, true);

    valueAmt = globals.tiker.to(valueAmt, 2);

    $.paymentAmountFiat.value = valueAmt;
  }, 100);
}
