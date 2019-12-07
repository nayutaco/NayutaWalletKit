function close() {
  globals.hideShowNodeInfo(false);
}

function copyClipboard() {
  Ti.UI.Clipboard.setText($.pubkey.text);
  globals.util
    .createDialog({
      message: L("label_copied"),
      buttonNames: [L("label_close")]
    })
    .show();
}

var qrcode = require("requires/qrcode");

function setURI(uri) {
  $.qrcode.removeAllChildren();

  $.pubkey.text = uri;

  var newQrcodeView = qrcode
    .QRCode({
      text: uri,
      errorCorrectLevel: "H"
    })
    .createQRCodeView({
      width: 250,
      height: 250
    });

  $.qrcode.add(newQrcodeView);
}

globals.setNodeInfo = function(nodeInfo) {
  globals.console.log("setting node info", nodeInfo);
  $.pubkey.text = "";
  globals.currentPubkey = nodeInfo.identity_pubkey;
  globals.currentAlias = nodeInfo.alias;
  if (nodeInfo.alias == undefined || nodeInfo.alias == "") {
    globals.currentAlias = nodeInfo.identity_pubkey.substr(0, 10) + "...";
  }
  $.alias.text = globals.currentAlias;
  if (nodeInfo.uris == undefined) {
    nodeInfo.uris = [];
  }
  $.hostTitle.show();
  var nodeURI = nodeInfo.uris[0];
  if (nodeURI != undefined) {
    $.pubkey.text = nodeURI;
    var comps = nodeURI.split("@");
    if (comps.length == 2) {
      $.host.text = comps[1];
    } else {
      $.host.text = "";
      $.hostTitle.hide();
    }
  } else {
    $.pubkey.text = nodeInfo.identity_pubkey;
    $.host.text = "";
    $.hostTitle.hide();
  }
  try {
    $.chain.text = "bitcoin";
    if (nodeInfo.testnet == true || nodeInfo.testnet == 1) {
      $.chain.text = $.chain.text + " " + Alloy.Globals.network;
    }
  } catch (e) {
    globals.console.error(e);
    $.chain.text = "bitcoin" + " " + Alloy.Globals.network;
  }

  setURI($.pubkey.text);
};
