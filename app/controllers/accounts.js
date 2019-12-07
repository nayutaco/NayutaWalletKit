var tableData = [];

function loadAccounts() {
  let accountsNum = 0;
  tableData = [];
  let accounts = JSON.parse(
    Ti.App.Properties.getString(globals.accountsKey, "{}")
  );

  if (globals.enableLiveView == true) {
    accounts = {
      "03620f31cf2bb95bb70c8c7bcdaa0698cd9bc7f17987290338af301eaa28c351be": {
        identity_pubkey:
          "03620f31cf2bb95bb70c8c7bcdaa0698cd9bc7f17987290338af301eaa28c351be",
        num_active_channels: 55,
        alias: "mandelduck",
        testnet: false,
        synced_to_chain: true,
        block_height: 585784,
        uris: [
          "03620f31cf2bb95bb70c8c7bcdaa0698cd9bc7f17987290338af301eaa28c351be@13.58.198.168:9735"
        ],
        config: ""
      },
      "0266a045ea8b1ae66ee96bbed749c566a8c08223de7fbae59edff3f1fc4782291d": {
        identity_pubkey:
          "0266a045ea8b1ae66ee96bbed749c566a8c08223de7fbae59edff3f1fc4782291d",
        num_active_channels: 4,
        alias: "mandelduck",
        testnet: true,
        synced_to_chain: true,
        block_height: 1569332,
        uris: [
          "0266a045ea8b1ae66ee96bbed749c566a8c08223de7fbae59edff3f1fc4782291d@13.58.198.168:9736"
        ],
        config: ""
      }
    };
  }

  globals.console.log("accounts", accounts);
  const keys = Object.keys(accounts);
  globals.console.log("keys", keys);

  accountsNum += keys.length;
  for (var i = 0; i < keys.length; i++) {
    const anAccount = accounts[keys[i]];

    anAccount.isAccount = true;

    globals.console.log("anaccount", anAccount);

    var row = Ti.UI.createTableViewRow({
      className: "payment",
      backgroundSelectedColor: "transparent",
      rowIndex: i,
      height: Ti.UI.SIZE
    });
    if (accountsNum == 1) {
      anAccount.onlyOne = true;
    }
    row.add(
      Alloy.createController(
        "components/component_account_cell",
        anAccount
      ).getView()
    );

    tableData.push(row);
  }

  if (Ti.App.Properties.getString("passphrase", undefined) != undefined) {
    if (Ti.App.Properties.getString("mode", "") != "lndMobile") {
      accountsNum++;
      var row = Ti.UI.createTableViewRow({
        className: "account",
        backgroundSelectedColor: "transparent",
        rowIndex: i,
        height: Ti.UI.SIZE
      });

      row.add(
        Alloy.createController("components/component_account_cell", {
          isLNDMobile: true
        }).getView()
      );

      tableData.push(row);
    }
  } else {
    accountsNum++;
    var row = Ti.UI.createTableViewRow({
      className: "account",
      backgroundSelectedColor: "transparent",
      rowIndex: i,
      height: Ti.UI.SIZE
    });

    row.add(
      Alloy.createController("components/component_account_cell", {
        createLocalWallet: true,
        closeAndReload: function() {
          $.win.close();
          globals.startLNDMobile();
        }
      }).getView()
    );

    tableData.push(row);
  }

  accountsNum++;
  var row = Ti.UI.createTableViewRow({
    className: "account",
    backgroundSelectedColor: "transparent",
    rowIndex: i,
    height: Ti.UI.SIZE
  });

  row.add(
    Alloy.createController("components/component_account_cell", {
      createAccount: true
    }).getView()
  );

  tableData.push(row);

  $.accountsList.data = tableData;
}

globals.loadAccountsList = function() {
  loadAccounts();
};

if (OS_ANDROID) {
  $.win.addEventListener("android:back", function() {
    close();
    return true;
  });
}

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

globals.closeAccounts = close;

$.accountsList.top = Alloy.Globals.topBarHeight;
$.accountsList.height =
  globals.util.getDisplayHeight() - Alloy.Globals.topBarHeight;

loadAccounts();
