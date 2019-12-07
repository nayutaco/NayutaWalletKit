var args = arguments[0] || {};

function close() {
  Alloy.createController("passphrase_screen")
    .getView()
    .open();

  $.win.close();
}

function skip() {
  close();
}

function setAutoPilot() {
  Ti.App.Properties.setInt("autoPilot", 1);

  close();
}
