var args = arguments[0] || {};

if (args.type == "success") {
  $.colorView.backgroundColor = "#59b14b";
} else {
  $.colorView.backgroundColor = "#c35959";
/*
  try {
    if (args.errorMessage.indexOf("=") != -1) {
      args.errorMessage = args.errorMessage.split("=");
      args.errorMessage = args.errorMessage[args.errorMessage.length - 1];
    }
  } catch (e) {
    // try to format error message remove rpc pretext
  }*/
}

args.parent.add($.mainView);

$.statusLabel.text = L("text_conf_sent").format({
  token: args.token
});

if (args.isInvoice) {
  $.statusLabel.text = L("invoice_paid");
}

$.colorView.animate({
  opacity: 1,
  duration: 500
});

setTimeout(function() {
  $.infoView.animate({
    opacity: 1,
    duration: 500
  });
  $.infoView.top = $.infoView.rect.y;
  $.infoView.animate({
    top: $.infoView.top - 80,
    duration: 800
  });

  setTimeout(function() {
    $.okLabel.animate({
      opacity: 1,
      duration: 800
    });

    $.okLabel.top = $.okLabel.rect.y + 50;

    $.okLabel.animate({
      top: $.okLabel.top - 50,
      duration: 800
    });
  }, 500);
}, 500);

var matrix2d = Ti.UI.create2DMatrix();
matrix2d = matrix2d.scale(1000); // scale to 1.5 times original size
var a = Ti.UI.createAnimation({
  transform: matrix2d,
  duration: 2000
});

if (args.type == "success") {
  $.colorView.animate(a); // set the animation in motion
} else {
  $.colorView.transform = matrix2d;
  $.checkIcon.image = "/images/failedSymbolWhite.png";
  $.statusLabel.text = args.errorMessage;
}

function close() {
  $.mainView.animate({
    opacity: 0,
    duration: 200
  });

  setTimeout(function() {
    args.parent.remove($.mainView);
    args.callback();
  }, 200);
}
