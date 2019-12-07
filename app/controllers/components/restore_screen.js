function close() {
  $.win.close();
}

function continueFunc() {
  globals.screenView = Alloy.createController("frame").getView();
  globals.screenView.open();

  close();
}
