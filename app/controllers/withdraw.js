var args = arguments[0] || {};
var currencyFiat = globals.getCurrency();
$.blockingView.hide();
var timer = null;
 
var currentAmount = 0;
var currentAddress = 0;
var tranConf = null;
var isFiatMode = false;

if(globals.tiker.ifNoFiat()){
  $.fiatView.hide();
}

var FiatSymbol = globals.tiker.getFiatSymbol();
$.fiatSymbol.text = FiatSymbol;

globals.console.log("fiat symbol", FiatSymbol);
var timer = null;
var fiat_conf = "";
var fiatValue = globals.tiker.getFiatValue();

globals.console.log("fiat value", fiatValue);

function selectedFiat() {
  coolDown = false;
  globals.console.log("selected fiat");
  isFiatMode = true;
}
function selectedCrypto() {
  coolDown = false;
  globals.console.log("selected crypto");
  isFiatMode = false;
}
var coolDown = false;
function updateValues(e) {
  if (coolDown) {
    return;
  }

  if (e != null) {
    $.fiat.applyProperties({
      width: "80%"
    });

    $.amount.applyProperties({
      width: "80%"
    });
  }

  if (!isFiatMode) {
    var inputValue = $.amount.value;

    if (inputValue.startsWith("0") && !inputValue.startsWith("0.")) {
      coolDown = true;
      $.amount.value = $.amount.value.substr(1, $.amount.value.length);
      inputValue = $.amount.value;
      coolDown = false;
    }

    var val = (inputValue * fiatValue).toFixed2(4);
    if (isNaN(val)) {
      val = 0;
    }
    if (fiatValue == 0) val = 0;
    $.fiat.value = addCommas(val);
  } else {
    if ($.fiat.value.startsWith("0") && !$.fiat.value.startsWith("0.")) {
      coolDown = true;

      if ($.fiat.value == 0) {
        $.fiat.value = 0;
      } else {
        $.fiat.value = $.fiat.value.substr(1, $.fiat.value.length);
      }

      coolDown = false;
    }

    var inputValue = parseFloat($.fiat.value) / fiatValue;
    globals.console.log("inputvalue", inputValue);
    coolDown = true;
    val = inputValue.toFixed2(4);
    if (isNaN(val)) {
      val = 0;
    }
    $.amount.value = val;
    coolDown = false;
  }
}
function showHideLoading(hide) {
  if (hide) {
    $.blockingView.hide();
    $.sendSpinner.hide();
    $.sendLabel.show();
    $.win.touchEnabled = true;
    return;
  }
  $.blockingView.show();
  $.sendSpinner.show();
  $.sendLabel.hide();
  $.win.touchEnabled = false;
}
 
var inputValue = "";

function isiPhoneX() {
  return (
    (Ti.Platform.displayCaps.platformWidth === 375 &&
      Ti.Platform.displayCaps.platformHeight == 812) || // Portrait
    (Ti.Platform.displayCaps.platformHeight === 812 &&
      Ti.Platform.displayCaps.platformWidth == 375)
  ); // Landscape
}
if (isiPhoneX()) {
  $.win.extendSafeArea = false;
}

function close(e) {
  if (OS_ANDROID) {
    $.win.close();
    return;
  }
  $.background.animate({
    opacity: 0,
    duration: 200
  });

  $.mainView.animate({
    left: globals.display.width,
    duration: 200
  });

  setTimeout(function() {
    $.win.width = 0;
    $.win.close();
  }, 200);
}

if (OS_ANDROID) {
  $.win.addEventListener("android:back", function() {
    close();
    return true;
  });
}

$.inputDestination.hintText = L("label_send_destination");
$.inputDestination.hintTextColor = "gray";

$.background.animate({
  opacity: 0.5,
  duration: 200
});
if (OS_IOS) {
  $.mainView.animate({
    left: 0,
    duration: 200
  });
}

$.amount.value = "0";
$.amountBTC.text = globals.LNCurrency;

function switchAmount(e) {
  if (!isFiatMode) {
    isFiatMode = true;
    inputValue = $.fiat.value.replace(FiatSymbol, "").replace(/[^\d.-]/g, "");

    $.fiat.top = 0;
    $.fiat.applyProperties(
      $.createStyle({
        classes: "size40 white",
        apiName: "Label"
      })
    );

    $.amountView.top = 45;
    $.amountBTC.bottom = 0;
    $.amount.applyProperties(
      $.createStyle({
        classes: "size20 white bold",
        apiName: "Label"
      })
    );
    $.amountBTC.applyProperties(
      $.createStyle({
        classes: "size12 white",
        apiName: "Label"
      })
    );
  } else {
    isFiatMode = false;
    inputValue = $.amount.value;

    $.fiat.top = 45;
    $.fiat.applyProperties(
      $.createStyle({
        classes: "size20 white fiat",
        apiName: "Label"
      })
    );

    $.amountView.top = 0;
    $.amountBTC.bottom = 5;
    $.amount.applyProperties(
      $.createStyle({
        classes: "size40 white bold",
        apiName: "Label"
      })
    );
    $.amountBTC.applyProperties(
      $.createStyle({
        classes: "size20 white amountBTC",
        apiName: "Label"
      })
    );
  }
}

function setFee(fee, isCustom) {
  Ti.App.Properties.setInt("targetConf", fee);
  estimateFee();
  tranConf.API.close();
}
function hideKeyboard(e) {
  $.fiat.blur();
  $.amount.blur();
}

function checkAndSetValue() {
  globals.console.log("checkAndSetValue");
  if (globals.tiker) {
    clearInterval(timer);

    updateFields({
      source: {
        id: "numberPad0"
      }
    });
  }
}
timer = setInterval(checkAndSetValue, 500);

function addCommas(nStr) {
  nStr += "";
  x = nStr.split(".");
  x1 = x[0];
  x2 = x.length > 1 ? "." + x[1] : "";
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + "," + "$2");
  }
  return x1 + x2;
}

function updateFields(button, abstAmount) {
  function updateTheField(button, abstAmount) {
    if (abstAmount != null) {
      inputValue = abstAmount;
    } else if (button.source.id === "numberPadDel") {
      if (inputValue.length > 0) {
        inputValue = inputValue.slice(0, inputValue.length - 1);
      }
      if (inputValue.length <= 0) inputValue = "0";
      if (inputValue.length == undefined) inputValue = "0";
    } else if (button.source.id === "numberPadDot") {
      if (inputValue.indexOf(".") <= -1) inputValue = "" + inputValue + ".";
    } else {
      var intValue = button.source.id.replace("numberPad", "");

      if (inputValue === "0") inputValue = intValue;
      else inputValue = inputValue + intValue;
    }

    return inputValue;
  }

  if (button != null) {
    updateTheField(button, abstAmount);
  } else {
    inputValue = abstAmount;
  }

  globals.console.log(fiatValue);

  function toFixed(x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split("e-")[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = "0." + new Array(e).join("0") + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split("+")[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join("0");
      }
    }
    return x;
  }

  if (!isFiatMode) {
    // for some reasons if some floats are showing as scientific ntoation i.e. 9.2323e-4, so add the chars of teh string directly
    var inputValueStr = inputValue + "";
    $.amount.value = inputValueStr;
    var val = (inputValue * fiatValue).toFixed2(4);
    if (fiatValue == 0) val = 0;
    $.fiat.value = addCommas(val);
  } else {
    $.fiat.value = addCommas(inputValue);
    $.amount.value = (inputValue / fiatValue).toFixed2(4) + "";
  }
}

function prioritySet() {
  Alloy.createController("priority", {
    setFee: setFee
  })
    .getView()
    .open();
}

function scanQRCode() {
  globals.util.readQRcodeNormal(
    {
      callback: function(vals) {
        globals.console.log("vals", vals);

        if (vals.address != null) {
          $.inputDestination.value = vals.address.toString();

          if (vals.amount != null) {
            console.log("float value", parseFloat(vals.amount + ""));
            updateFields(null, parseFloat(vals.amount + ""));
          }
        }
      }
    },
    false
  );
}

function pressedSend() {
  var quantity = $.amount.value.replace(/[^\d.-]/g, "");
  quantity = parseFloat(quantity);
  quantity = globals.util.btcToSat(quantity);

  if ($.inputDestination.value.length == 0) {
    alert(L("label_enter_destination"));
    return;
  }

  if (quantity == 0) {
    alert(L("label_quantity_send"));
    return;
  }

  currentAmount = quantity;
  currentAddress = $.inputDestination.value;

  showHideLoading(false);

  estimateFee();
}

function estimateFee() {
  var targetConf = Ti.App.Properties.getInt(
    "targetConf",
    Alloy.Globals.fastFee
  );

  globals.lnGRPC.estimateFee(
    currentAmount,
    currentAddress,
    targetConf,
    function(error, response) {
      if (error == true) {
        setTimeout(function() {
          alert(L("error_loading").format({ message: response }));
        }, 1000);
        showHideLoading(true);
        Ti.App.Properties.setInt("targetConf", Alloy.Globals.fastFee);
        return;
      }
      globals.console.log("response ", response);

      var fiatSymbol = globals.tiker.getFiatSymbol();
      var fiatVal = (
        globals.util.satToBtc(response.fee_sat) * fiatValue
      ).toFixed2(4);
      const feeText =
        L("fee") +
        " " +
        globals.util.satToBtc(response.fee_sat) +
        " " +
        globals.LNCurrency +
        " (" +
        fiatSymbol +
        fiatVal +
        ")";
      var message = "";

      if (currentAmount == -1) {
        message = L("sendall_amount").format({ address: currentAddress });
      } else {
        message = L("onchain_send_message").format({
          amount:
            globals.util.satToBtc(currentAmount) + " " + globals.LNCurrency,
          address: currentAddress
        });
      }

      tranConf = Alloy.createController("transaction_conf", {
        small: false,
        message: message,
        feeText: feeText,
        onchain: true,
        cancel: function() {
          showHideLoading(true);
        },
        updateFee: function() {
          prioritySet();
        },
        confirm: function() {
          continueSend(response.feerate_sat_per_byte);
        }
      });
    }
  );
}

function sendAll() {
  if ($.inputDestination.value.length == 0) {
    alert(L("label_enter_destination"));
    return;
  }

  currentAddress = $.inputDestination.value;
  currentAmount = -1;

  var dialog = globals.util.createDialog({
    title: L("label_confirm"),
    message: L("label_send_all_check").format({ address: currentAddress }),
    buttonNames: [L("label_send"), L("label_close")]
  });
  dialog.addEventListener("click", function(e) {
    if (e.index != e.source.cancel) {
      showHideLoading(false);
      estimateFee();
    }
  });
  dialog.show();
}

function continueSend(fee) {
  globals.console.log("current fee", fee);

  globals.lnGRPC.sendCoins(
    currentAmount,
    currentAddress,
    parseInt(fee),
    function(error, response) {
      showHideLoading(true);
      if (error == true) {
        alert(response);
        return;
      }
      globals.console.log("send coins res", response);
      globals.util.saveTxid(response.txid, currentAddress);
      var confView = Alloy.createController("components/conf_screen", {
        parent: $.win,
        isInvoice: false,
        token: globals.LNCurrency,
        type: "success",
        callback: function() {
          if (globals.getWalletBalance != undefined) {
            globals.getWalletBalance();
          }
          if (globals.listTransactions != undefined) {
            globals.listTransactions();
          }
          close();
        }
      }).getView();
    }
  );
}

if (args.destination != undefined) {
  $.inputDestination.value = args.destination;
}

if (args.amount != undefined) {
  updateFields(null, args.amount);
}

$.balance.text = L("loading");

setTimeout(function() {
  globals.lnGRPC.getWalletBalance(function(error, response) {
    if (response.confirmed_balance == undefined) {
      response.confirmed_balance = 0;
    }
    globals.console.log("balance ", response.confirmed_balance);

    globals.console.log("balance ", parseInt(response.confirmed_balance));
    globals.currentOnchainBalance = parseInt(response.confirmed_balance);
    $.balance.text =
      globals.util.satToBtc(globals.currentOnchainBalance) +
      " " +
      globals.LNCurrency;
  });
}, 1000);
