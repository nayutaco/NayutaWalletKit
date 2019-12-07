var args = arguments[0] || {};
var self = {};
$.loadingSpinner.show();
var currencyFiat = globals.getCurrency();
$.confBox.top = Ti.Platform.displayCaps.platformHeight + $.confBox.height;

if (Alloy.Globals.isiPhoneX) {
  $.buttonsView.top = 0;
}

var win = Ti.UI.createWindow({
  orientationModes: [Ti.UI.PORTRAIT],
  navBarHidden: true,
  backgroundColor: "transparent",
  theme: OS_ANDROID ? "Theme.AppCompat.Translucent.NoTitleBar" : null,
  windowSoftInputMode: OS_ANDROID
    ? Ti.UI.Android.SOFT_INPUT_STATE_ALWAYS_HIDDEN
    : null
});

win.add($.confirmation_screen);
win.open();

$.confBox.height = 250;

function setImg() {
  if (OS_IOS) {
    $.img.image = "/images/image_blank.png";
    $.img.top = $.confBox.top;
    $.img.borderRadius = $.confBox.borderRadius;
    $.img.width = $.confBox.width;
    $.img.height = $.confBox.height;

    // Blur view
    var blur = Ti.UI.iOS.createBlurView({
      width: Ti.UI.FILL,
      height: Ti.UI.FILL
    });
    $.img.add(blur);
    blur.setEffect(Ti.UI.iOS.BLUR_EFFECT_STYLE_EXTRA_LIGHT);
  } else {
    $.img.image = "/images/image_blank.png";
    $.img.backgroundColor = "#ececec";
    $.img.top = $.confBox.top;
    $.img.borderRadius = $.confBox.borderRadius;
    $.img.width = $.confBox.width;
    $.img.height = $.confBox.height;

    $.confBox.top = null;
    $.img.top = null;
    $.confBox.bottom = -$.confBox.height;
    $.img.bottom = -$.confBox.height;
  }
}

function increaseSize(size) {
  $.confBox.height = $.confBox.height + size;

  $.confBox.top = Ti.Platform.displayCaps.platformHeight - $.confBox.height;

  setImg();
}

setImg();

function cancel() {
  args.cancel();
  close();
}

if (OS_ANDROID) {
  win.addEventListener("android:back", function(e) {
    cancel();
  });
}

function close() {
  $.confBox.animate({
    top: Ti.Platform.displayCaps.platformHeight + $.confBox.height,
    duration: 300
  });

  $.img.animate({
    top: Ti.Platform.displayCaps.platformHeight + $.confBox.height,
    duration: 300
  });

  $.background.animate({
    opacity: 0.0,
    duration: 200
  });
  setTimeout(function() {
    win.close();
  }, 600);
}

function confirm() {
  if (args.task != undefined) {
    $.loading.visible = true;
    $.mainInfo.visible = false;
    args.task(
      function() {
        $.loading.visible = false;
        $.success.visible = true;
        setTimeout(function() {
          args.confirm();
          close();
        }, 2000);
      },
      function() {
        $.loading.visible = false;
        $.error.visible = true;
        setTimeout(function() {
          close();
        }, 2000);
      }
    );
    return;
  }
  args.confirm();
  close();
  return;
}

function hideKeyboard(e) {}

self.setMessage = function(message) {
  $.message.text = message;
  $.loading.visible = false;
  $.mainInfo.visible = true;
};
if (args.showLoading == true) {
  $.loading.visible = true;
  $.mainInfo.visible = false;
}

if (args.first != undefined) {
  args.first(self, function() {
    $.loading.visible = false;
    $.error.visible = true;
    setTimeout(function() {
      close();
    }, 2000);
  });
}

$.cancelButton.title = L("label_cancel");

$.confirmButton.title = L("label_confirm");

$.message.text = args.message;

$.background.animate({
  opacity: 0.3,
  duration: 200
});

if (OS_ANDROID) {
  $.confBox.animate({
    bottom: 0,
    duration: 300
  });

  $.img.animate({
    bottom: 0,
    duration: 300
  });
}

if (OS_IOS) {
  $.confBox.animate({
    top: Ti.Platform.displayCaps.platformHeight - $.confBox.height,
    duration: 300
  });

  $.img.animate({
    top: Ti.Platform.displayCaps.platformHeight - $.confBox.height,
    duration: 300
  });
}
