var args = arguments[0] || {};

var currentPinCode = [];
var confirmPinCode = [];
var setMode = false;
var authMode = false;

function clear() {
  $.m1.image = "/images/image_easyinput_none.png";
  $.m2.image = "/images/image_easyinput_none.png";
  $.m3.image = "/images/image_easyinput_none.png";
  $.m4.image = "/images/image_easyinput_none.png";
  $.m5.image = "/images/image_easyinput_none.png";
  $.m6.image = "/images/image_easyinput_none.png";
}

function erase() {
  if (setMode || authMode) {
    currentPinCode.pop();
    if (currentPinCode.length == 0) {
      $.e.visible = false;
    }
    globals.console.log("erasing from current " + currentPinCode.length);
  } else {
    confirmPinCode.pop();
    if (confirmPinCode.length == 0) {
      $.e.visible = false;
    }
    globals.console.log("erasing from confirm " + currentPinCode.length);
  }
  clear();
  updateMarks();
}

function updateMarks() {
  if (currentPinCode.length == 0 && confirmPinCode.length == 0) {
    $.e.visible = false;
  }
  if (currentPinCode.length < 6) {
    if (currentPinCode.length > 0) {
      $.m1.image = "/images/image_easyinput_on.png";
    }
    if (currentPinCode.length > 1) {
      $.m2.image = "/images/image_easyinput_on.png";
    }
    if (currentPinCode.length > 2) {
      $.m3.image = "/images/image_easyinput_on.png";
    }
    if (currentPinCode.length > 3) {
      $.m4.image = "/images/image_easyinput_on.png";
    }
    if (currentPinCode.length > 4) {
      $.m5.image = "/images/image_easyinput_on.png";
    }
    if (currentPinCode.length > 5) {
      $.m6.image = "/images/image_easyinput_on.png";
    }
  } else {
    if (confirmPinCode.length > 0) {
      $.m1.image = "/images/image_easyinput_on.png";
    }
    if (confirmPinCode.length > 1) {
      $.m2.image = "/images/image_easyinput_on.png";
    }
    if (confirmPinCode.length > 2) {
      $.m3.image = "/images/image_easyinput_on.png";
    }
    if (confirmPinCode.length > 3) {
      $.m4.image = "/images/image_easyinput_on.png";
    }
    if (confirmPinCode.length > 4) {
      $.m5.image = "/images/image_easyinput_on.png";
    }
    if (confirmPinCode.length > 5) {
      $.m6.image = "/images/image_easyinput_on.png";
    }
  }
}

function pressedButton(e) {
  $.e.visible = true;

  if (e.source.id == "c") {
    if (args.type === "set") {
      clear();
      currentPinCode = [];
      confirmPinCode = [];
      setMode = true;
      $.instructionLabel.text = L("label_easypass_set");

      $.c.visible = false;
      globals.console.log(
        "redo " + currentPinCode.length + " " + confirmPinCode
      );
    } else {
      close();
    }
    return;
  }
  if (e.source.id == "e") {
    erase();
    return;
  }
  clear();
  var num = e.source.id.replace("n", "");

  if (currentPinCode.length < 6) {
    currentPinCode.push(num);

    updateMarks();

    if (currentPinCode.length == 6) {
      if (authMode) {
        var pin = currentPinCode.join("");
        if (Titanium.Utils.sha256(pin) == args.checkHash) {
          globals.console.log("correct");
          args.callback();
          close();
          return;
        } else {
          currentPinCode = [];
          clear();
          updateMarks();
          globals.console.log("incorrect");
          $.instructionLabel.text = L("label_easypass_wrongpass");
          return;
        }
      } else {
        $.instructionLabel.text = L("label_easypass_confirm");
        $.c.title = L("label_easypass_redo");
        $.c.visible = true;
        setMode = false;
        confirmPinCode = [];
        clear();
        globals.console.log("setting confirm mode");
      }
    }
  } else {
    if (confirmPinCode.length < 6) {
      confirmPinCode.push(num);

      updateMarks();

      if (confirmPinCode.length == 6) {
        var pin1 = currentPinCode.join("");
        var pin2 = confirmPinCode.join("");
        if (pin1 != pin2) {
          confirmPinCode = [];
          clear();
          updateMarks();
          globals.console.log("doesn't match");
        } else {
          globals.console.log("matches");
          args.callback(Titanium.Utils.sha256(pin2));
          close();
        }
      }
    }
  }
}

$.n1.title = "1";
$.n2.title = "2";
$.n3.title = "3";
$.n4.title = "4";
$.n5.title = "5";
$.n6.title = "6";
$.n7.title = "7";
$.n8.title = "8";
$.n9.title = "9";
$.n0.title = "0";

$.e.title = L("label_erase");
$.c.title = L("label_close");

if (args.type === "set") {
  setMode = true;
  $.instructionLabel.text = L("label_easypass_set");

  $.c.visible = false;
} else if (args.type == "check") {
  authMode = true;

  $.instructionLabel.text = L("label_easypass");
  $.e.visible = false;
  $.c.visible = true;
} else if (args.type == "checkNoCancel") {
  authMode = true;

  $.instructionLabel.text = L("label_easypass");
  $.e.visible = false;
}

function close() {
  $.main.animate({
    top: Alloy.Globals.display.height,
    duration: 300
  });
  setTimeout(function() {
    $.win.close();
  }, 300);
}

$.main.animate({
  top: 0,
  duration: 300
});

if (OS_ANDROID) {
  $.win.addEventListener("android:back", function() {
    globals.console.log("pressed back");
    return true;
  });
}
