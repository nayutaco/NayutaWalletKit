var qrcode = require("requires/qrcode");

globals.lnGRPC.newAddress("np2wkh", function(error, response) {
  if (error == true) {
    globals.console.error("new add error", response);
    alert(response);
    return;
  }

  globals.console.log("new address", response.address);

  setAddress(response.address);
});

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

function closeQR() {
  $.args.parent.remove($.getView());
}
$.spinner.show();

$.args.parent.add($.getView());
