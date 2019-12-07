var args = arguments[0] || {};

var aPayment = args.payment;
var valueAmt = "";
var isMinus = false;
var hops = "";

if(globals.tiker.ifNoFiat()){
  $.valueFiat.hide();
}

function isInvoice(transaction) {
  if (transaction.isInvoice == undefined) {
    return false;
  }
  return true;
}

function isTransaction(transaction) {
  if (transaction.isTransaction == undefined) {
    return false;
  }
  return true;
}

function updateInvoice(argsNew) {
  aPayment = argsNew;
  $.type.image = "/images/checkSymbol.png";
  setAmount();
}

if (isInvoice(aPayment)) {

  if (aPayment.memo != undefined && aPayment.memo.length > 40) {
    aPayment.memo = aPayment.memo.substring(0, 40) + "...";
  }

  if (aPayment.settled == true || aPayment.settled == 1) {
    $.type.image = "/images/checkSymbol.png";
  } else {
    $.type.image = "/images/clockIcon.png";
  }

  if (aPayment.state == "CANCELED") {
    $.type.image = "/images/dameSymbol.png";
  }

  if (aPayment.amt_paid_sat != undefined && aPayment.amt_paid_sat != 0) {
    aPayment.value = aPayment.amt_paid_sat;
  }

  globals.invoiceUpdateFunctions[aPayment.r_hash] = updateInvoice;
}
if (aPayment.path) {
  if (aPayment.path.length > 1) {
    hops = aPayment.path.length + " " + L("hops");
  }
}

if (isTransaction(aPayment)) {
  if (aPayment.amount == undefined) {
    aPayment.amount = 0;
  }
  $.type.image = "/images/btcSymbol.png";

  var amt = aPayment.amount + "";

  if (amt.indexOf("-") != -1) {
    isMinus = true;
    amt = amt.replace("-", "");
  }

  if (
    aPayment.dest_addresses != undefined &&
    aPayment.dest_addresses.length > 0
  ) {
    if (aPayment.dest_addresses.length > 1) {
      aPayment.memo = aPayment.dest_addresses[1].substring(0, 30) + "...";
    } else if (aPayment.dest_addresses.length == 1) {
      aPayment.memo = aPayment.dest_addresses[0].substring(0, 30) + "...";
    }

    if (aPayment.destinationAddress != undefined) {
      aPayment.memo = aPayment.destinationAddress.substring(0, 30) + "...";
    }
  }

  aPayment.value = amt;

  if (
    aPayment.num_confirmations == undefined ||
    aPayment.num_confirmations == 0
  ) {
    if (aPayment.memo == undefined) {
      aPayment.memo = "";
    }
    aPayment.memo = L("unconfirmed") + " " + aPayment.memo;
    aPayment.memo = aPayment.memo.substring(0, 30) + "...";
  }
}

if (aPayment.value == null) {
  aPayment.value = 0;
}

function setAmount() {
  try {
    if (isTransaction(aPayment)) {
      var currency = globals.LNCurrency;
      var valueAmt = globals.util.satToBtc(parseInt(aPayment.value + ""), true);
      var valueAmtNoFormat = globals.util.satToBtc(
        parseInt(aPayment.value + "")
      );
      var fiatAmt = globals.tiker.to(valueAmtNoFormat, 2) + "";

      var aPaymentValueText = valueAmt + " " + currency + " " + fiatAmt;
    } else {
      var currency = globals.LNCurrencySat;
      var valueAmt = parseInt(aPayment.value + "");
      var valueAmtNoFormat = globals.util.satToBtc(
        parseInt(aPayment.value + "")
      );
      var fiatAmt = globals.tiker.to(valueAmtNoFormat, 2) + "";
    }

    var aPaymentValueText = valueAmt + " " + currency;

    var symbol = "-";
    if (isInvoice(aPayment) || isTransaction(aPayment)) {
      symbol = "+";
    }

    if (isMinus) {
      symbol = "-";
    }

    aPaymentValueText = symbol + aPaymentValueText;
    valueAmt = valueAmt + "";
    currency = " " + currency;

    var attr = Titanium.UI.createAttributedString({
      text: aPaymentValueText,
      attributes: [
        {
          type: Ti.UI.ATTRIBUTE_FONT,
          value: {
            fontSize: 18,
            fontFamily: "GillSans-Light",
            fontWeight: "light"
          },
          range: [aPaymentValueText.indexOf(valueAmt), valueAmt.length]
        },

        {
          type: Ti.UI.ATTRIBUTE_FONT,
          value: {
            fontSize: 12,
            fontFamily: "GillSans-Light",
            fontWeight: "light"
          },
          range: [aPaymentValueText.indexOf(currency), currency.length]
        },
        {
          type: Ti.UI.ATTRIBUTE_FONT,
          value: {
            fontSize: 12,
            fontFamily: "GillSans-Light",
            fontWeight: "light"
          },
          range: [aPaymentValueText.indexOf(symbol), symbol.length]
        }
      ]
    });

    $.value.attributedString = attr;
    $.valueFiat.text = fiatAmt;

  } catch (e) {
    globals.console.error(e);
  }
}

var memo = aPayment.memo;
if (memo == undefined) {
  memo = Ti.App.Properties.getString(
    "memo_" + aPayment.payment_hash,
    undefined
  );
}
if (memo != undefined) {
  $.value.top = 4;
  $.memo.text = memo;
}

if ($.memo != undefined && $.memo.text != undefined && $.memo.text.length > 200) {
  $.memo.text = $.memo.text.substr(0, 200) + "...";
}

setAmount();

globals.updateValuesFuncs.push(setAmount);

var date = new Date(aPayment.creation_date * 1000);
var dateNow = new Date();

var timeDiff = Math.abs(date.getTime() - dateNow.getTime());
var minutesDiff = Math.ceil(timeDiff / (1000 * 60));
var hoursDiff = Math.ceil(timeDiff / (1000 * 3600));

if (minutesDiff < 2) {
  $.date.text = L("just_now");
} else if (minutesDiff < 60) {
  $.date.text = minutesDiff + " " + L("mins_ago");
} else if (hoursDiff < 24) {
  $.date.text = hoursDiff + " " + L("hours_ago");
} else {
  $.date.text =
    date.getFullYear() +
    "/" +
    (date.getMonth() + 1) +
    "/" +
    date.getDate() +
    " - " +
    date.getHours() +
    ":" +
    date.getMinutes();
}
if (hops != "") {
  $.date.text = $.date.text + "\n" + hops;
}

function clickAction() {
  if (isTransaction(aPayment)) {
    if (Alloy.Globals.network == "testnet") {
      Ti.Platform.openURL(
        "https://www.blockstream.info/testnet/tx/" + aPayment.tx_hash
      );
    } else {
      Ti.Platform.openURL(
        "https://www.blockstream.info/tx/" + aPayment.tx_hash
      );
    }
  }
}
