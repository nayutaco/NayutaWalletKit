var args = arguments[0] || {};

$.bitcoinFees.visible = true;

$.topbar.backgroundColor = globals.currentColor;

function close() {
  if (OS_ANDROID) {
    $.win.close();
    return;
  }
  $.background.animate({
    opacity: 0,
    duration: 200
  });

  $.mainView.animate({
    bottom: -292,
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

$.background.animate({
  opacity: 0.5,
  duration: 200,
  delay: 600
});

$.mainView.animate({
  bottom: 0,
  duration: 200
});

var currentConf = Ti.App.Properties.getInt("targetConf", 2);
if (currentConf === globals.fastFee) $.checkedHigh.visible = true;
else if (currentConf === globals.slowFee) $.checkedLow.visible = true;
else if (currentConf === globals.medFee) $.checkedMed.visible = true;
else $.checkedCustom.visible = true;

function setCurrentFee(fee, isCustom) {
  fee = parseInt(fee);

  globals.console.log("custom fee", fee);

  globals.console.log("custom fee", fee);

  Ti.App.Properties.setInt("targetConf", fee);
  $.checkedHigh.visible = false;
  $.checkedMed.visible = false;
  $.checkedLow.visible = false;
  $.checkedCustom.visible = false;
  args.setFee(fee, isCustom);
}

$.highButton.addEventListener("click", function() {
  setCurrentFee(globals.fastFee, false);
  $.checkedHigh.visible = true;
  close();
});

$.medButton.addEventListener("click", function() {
  setCurrentFee(globals.medFee, false);
  $.checkedMed.visible = true;
  close();
});

$.lowButton.addEventListener("click", function() {
  setCurrentFee(globals.slowFee, false);
  $.checkedLow.visible = true;
  close();
});

$.customButtonBtc.addEventListener("click", function() {
  var dialog = globals.util.createInputDialog({
    title: L("label_inputcustom"),
    message: L("label_inputcustom_message"),
    value: "",
    keyboardType: Ti.UI.KEYBOARD_TYPE_DECIMAL_PAD,
    buttonNames: [L("label_apply"), L("label_close")]
  });
  dialog.origin.addEventListener("click", function(e) {
    globals.console.log(e);
    if (OS_IOS) {
      var inputText = e.text;
    } else if (OS_ANDROID) {
      var inputText = dialog.androidField.getValue();
    }
    if (e.index != e.source.cancel) {
      globals.console.log("custom fee", inputText);

      if (isFinite(inputText)) {
        setCurrentFee(inputText, true);
        $.checkedCustom.visible = true;
        close();
      } else {
        self
          .createDialog({
            message: L("label_inputcustom_error"),
            buttonNames: [L("label_close")]
          })
          .show();
      }
    }
  });
  dialog.origin.show();
});
