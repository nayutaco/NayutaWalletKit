var args = arguments[0] || {};
$.signinView.top = (globals.display.height - 400) / 2;

$.wrapper.width = globals.display.width;

Ti.App.Properties.setString("lndMobileNetwork", Alloy.Globals.network);

function createNewAccount() {

  globals.console.log("creating new account")
  
  if (globals.lnGRPC.checkCapacity() == false) {

    globals.console.error(L("not_enough_space"))
    alert(L("not_enough_space"));
    return;
  }

  globals.util.showDisclaimer(function() {
    showLoading(true);

    globals.console.log("show disclaimer account")
    
    globals.util.loadStartUpInfo(function(error, response) {
      if (error == false) {
        if (OS_IOS) {
          $.signin.close();
        }
        globals.console.log("loaded start up info")
        Alloy.createController("components/auto_pilot_screen")
          .getView()
          .open();
      } else {
        globals.console.error(L("error_loading").format({ message: response }))
        const dialog = globals.util.createDialog({
          title: "",
          message: L("error_loading").format({ message: response }),
          buttonNames: [L("label_tryagain")]
        });
        dialog.addEventListener("click", function(e) {
          showLoading(false);
          createNewAccount();
        });
        dialog.show();
      }
    });
  });
}

function hasPassphrase() {
  Alloy.createController("signin_screen")
    .getView()
    .open();
}

function showLoading(show) {
  if (show) {
    $.loadingSpinner.height = Ti.UI.SIZE; 
    $.loadingSpinner.show();
    $.signin.touchEnabled = false;
    $.buttons.visible = false;
  } else {
    $.loadingSpinner.height = 0; 
    $.loadingSpinner.hide();
    $.signin.touchEnabled = true;
    $.buttons.visible = true;
  }
}

$.signin.addEventListener("android:back", function() {
  return true;
});

showLoading(true);

globals.util.loadStartUpInfo(function(error) {
  if (error == false) {
    showLoading(false);
 
  } else {
    globals.console.error(L("error_loading").format({ message: error }))
    alert(L("error_loading").format({ message: error }))
  }
});

Ti.API.info("is loading");