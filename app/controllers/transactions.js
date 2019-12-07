globals.transactions = [];
var didGetArguments = false;
globals.didGetTransactionsOnce = false;
var parent = null;
globals.hideNoTransactions = function() {
  $.noTransactions.hide();
};

$.noTransactions.hide();
globals.clearTransactionsTable = function() {
  $.paymentList.data = [];
};

var channelConfirmedBalance = 0;

function setBalances() {
  var channelConfirmedValueBTC = globals.util.satToBtc(
    parseInt(channelConfirmedBalance),
    true
  );

  var currentCurrency = globals.LNCurrencySat;

  var channelConfirmedValueStr = "";
  if (Ti.App.Properties.getString("denomination", "") == "BTC") {
    channelConfirmedValueStr = channelConfirmedValueBTC;
    currentCurrency = globals.LNCurrency;
  } else {
    channelConfirmedValueStr = parseInt(
      channelConfirmedBalance
    ).toLocaleString();
  }

  globals.console.log("confirmed bal", channelConfirmedValueStr);
  var totalText = channelConfirmedValueStr + " " + currentCurrency;

  var channelConfirmedValueFiat = globals.util.satToBtc(
    parseInt(channelConfirmedBalance)
  );

  var currencyFiat = globals.getCurrency();

  channelConfirmedValueFiat = globals.tiker.to(channelConfirmedValueFiat, 2);

  if (Alloy.Globals.network == "testnet") {
    currencyFiat = "t" + currencyFiat;
  }
  var totalTextFiat = channelConfirmedValueFiat + " " + currencyFiat;

  var attrTotal = Ti.UI.createAttributedString({
    text: totalText,
    attributes: [
      {
        type: Ti.UI.ATTRIBUTE_FONT,
        value: {
          fontSize: 50,
          fontFamily: Alloy.Globals.lightFont,
          fontWeight: "light"
        },
        range: [
          totalText.indexOf(channelConfirmedValueStr),
          channelConfirmedValueStr.length
        ]
      },
      {
        type: Ti.UI.ATTRIBUTE_FONT,
        value: {
          fontSize: 30,
          fontFamily: Alloy.Globals.lightFont,
          fontWeight: "light"
        },
        range: [
          totalText.indexOf(" " + currentCurrency),
          (" " + currentCurrency).length
        ]
      }
    ]
  });

  $.totalBalance.attributedString = attrTotal;

  attrTotal = Ti.UI.createAttributedString({
    text: totalTextFiat,
    attributes: [
      {
        type: Ti.UI.ATTRIBUTE_FONT,
        value: {
          fontSize: 30,
          fontFamily: Alloy.Globals.lightFont,
          fontWeight: "light"
        },
        range: [
          totalTextFiat.indexOf(channelConfirmedValueFiat + ""),
          (channelConfirmedValueFiat + "").length
        ]
      },
      {
        type: Ti.UI.ATTRIBUTE_FONT,
        value: {
          fontSize: 30,
          fontFamily: Alloy.Globals.lightFont,
          fontWeight: "light"
        },
        range: [
          totalTextFiat.indexOf(" " + currencyFiat),
          (" " + currencyFiat).length
        ]
      }
    ]
  });

  $.totalBalanceFiat.attributedString = attrTotal;

  if(globals.tiker.ifNoFiat()){
    $.totalBalanceFiat.hide();
  }
}

function listPayments(dontShowSpinner = false) {
  parent.connecting.visible = false;
  $.noTransactions.hide();
  if (dontShowSpinner == true) {
    $.listTopSpinner.hide();
  } else {
    $.listTopSpinner.show();
  }
  globals.lnGRPC.listInvoices(function(error, invoicesResponse) {
    globals.console.log("invoices", invoicesResponse);

    if (error == true) {
      globals.console.error("list invoices error", error);

      alert("error getting invoices");
      return;
    }

    if (OS_IOS) {
      if (invoicesResponse.invoices != undefined) {
        invoicesResponse = invoicesResponse.invoices;
      } else {
        invoicesResponse = [];
      }
    }

    for (var i = 0; i < invoicesResponse.length; i++) {
      var anInvoice = invoicesResponse[i];
      anInvoice.isInvoice = true;
    }

    globals.lnGRPC.listPayments(function(error, paymentsResponse) {
      if (error == true) {
        globals.console.error("list payments error", error);

        alert("error getting payments");
        return;
      }

      if (OS_IOS) {
        if (paymentsResponse.payments == undefined) {
          paymentsResponse.payments = [];
        }

        paymentsResponse = paymentsResponse.payments;
        delete paymentsResponse.payments;
      }

      if(globals.isREST){
        paymentsResponse = paymentsResponse.payments;
      }

      var transactions = invoicesResponse
        .concat(paymentsResponse)
        .sort(function(x, y) {
          return y.creation_date - x.creation_date;
        });

      globals.transactions = transactions;
      globals.didGetTransactionsOnce = true;

      addPayments(transactions);
    });
  });
}

globals.listPayments = listPayments;

var control = Ti.UI.createRefreshControl({
  tintColor: Alloy.Globals.mainColor
});
control.id = "refreshControl";

control.addEventListener("refreshstart", function(e) {
  globals.loadMainScreen();
});

$.paymentList.refreshControl = control;

function addPayments(payments) {
  globals.console.log("adding payments", payments);
  globals.updateValuesFuncs = [];
  control.endRefreshing();
  var tableData = [];
  var paymentCount = 0;
  for (var i = 0; i < payments.length; i++) {
    var aPayment = payments[i];
    if(aPayment != undefined){
      if (Object.keys(aPayment).length == 0) {
        // tor rest returns an array with an empty object inside for some reason [{}];
        continue;
      }
    }
    paymentCount++;
    var args = {
      id: i,
      payment: aPayment
    };

    var row = Ti.UI.createTableViewRow({
      className: "payment",
      backgroundSelectedColor: "transparent",
      rowIndex: i,
      height: Ti.UI.SIZE
    });

    row.add(
      Alloy.createController(
        "components/component_payment_cell",
        args
      ).getView()
    );

    tableData.push(row);
  }

  tableData.push(
    Ti.UI.createTableViewRow({
      height: 200
    })
  );

  $.paymentList.data = tableData;

  globals.console.log("finished payments");

  $.listTopSpinner.hide();

  if (paymentCount == 0) {
    $.noTransactions.show();
  }
}
exports.API = {
  totalBalanceFiat: $.totalBalanceFiat,
  totalBalance: $.totalBalance,
  setParentController: function(par) {
    parent = par;
  },
  setBalances: setBalances
};

globals.loadMainScreen = function(dontShowSpinner) {

  Ti.App.Properties.setBool("isRecovering", false);//recovery finished as app loaded so set to false

  globals.console.log("loading main screen");
  globals.lnGRPC.getChannelBalance(function(error, response) {
    if (error == true) {
      globals.console.log("error", error);
    }

    globals.console.log("get channel balance", response.balance);

    channelConfirmedBalance = 0;
    if (response.balance != undefined) {
      channelConfirmedBalance = parseInt(response.balance);
    }

    totalConfirmedBalance = channelConfirmedBalance;

    setBalances(true);

    $.mainView.show();

    listPayments();
    startSubscribeInvoices();

    globals.canProcessArgs = true;
    if (didGetArguments == false) {
      didGetArguments = true;
      globals.console.log("processing args start");

      globals.processArgs();
    }
  });
};
function startSubscribeInvoices() {
  globals.console.log("starting subscribe invoice");
  setTimeout(function() {
    globals.lnGRPC.subscribeInvoices(function(error, response) {
      globals.console.log("invoice subscription res", error, response);

      if (error == false) {
        globals.console.log("invoice res", response);

        if (response.settled != undefined && response.settled == true) {
          if (globals.updateCurrentInvoice != undefined) {
            globals.updateCurrentInvoice(response);
          }

          var cellUpdateFunction =
            globals.invoiceUpdateFunctions[response.r_hash];
          if (cellUpdateFunction != undefined) {
            cellUpdateFunction(response);
          }
        }
      } else {
        if (response.indexOf("io.grpc.StatusRuntimeException:") != -1) {
          // some bug in grpc or btcpay if this error shows need to restart subscription invoice
          globals.console.log("restart invoice subscription");
          startSubscribeInvoices();
        }
      }
    });
  }, 1000);
}

function showPay() {
  parent.launchPayScan();
}

function showReceive() {
  Alloy.createController("request")
    .getView()
    .open();
}
