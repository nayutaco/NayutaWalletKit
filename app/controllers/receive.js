var qrcode = require("requires/qrcode");

function generateDepositAddress() {
  $.depositAddressView.show();
  $.spinner.show();
  $.generateView.hide();

  globals.lnGRPC.newAddress(
    Ti.App.Properties.getString("address_type", "p2wkh"),
    function(error, response) {
      if (error == true) {
        globals.console.error("new add error", response);
        alert(response);
        return;
      }

      globals.console.log("new address", response.address);

      setAddress(response.address);
    }
  );

  function setAddress(address) {
    globals.util.saveAddress(address);

    $.qrcode.removeAllChildren();

    $.address.text = address;

    var newQrcodeView = qrcode
      .QRCode({
        text: address,
        errorCorrectLevel: "H"
      })
      .createQRCodeView({
        width: 250,
        height: 250
      });

    $.qrcode.add(newQrcodeView);

    $.spinner.hide();
  }
}

function copyClipboard() {
  Ti.UI.Clipboard.setText($.address.text);
  globals.util
    .createDialog({
      message: L("label_copied"),
      buttonNames: [L("label_close")]
    })
    .show();
}

function close(e) {
  globals.console.log("closed");

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
