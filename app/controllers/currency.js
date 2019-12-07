var args = arguments[0] || {};

function close(e) {
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
  duration: 200
});

$.mainView.animate({
  bottom: 0,
  duration: 200
});

var currentTiker = {};

for (key in currentTiker) {
  var tiker = currentTiker[key];
  var args2 = {
    name: key,
    symbol: tiker.symbol,
    currentCurrency: globals.getCurrency(),
    callback: function(currency) {
      args.setLabel(currency);
      Ti.App.Properties.setString("currency", currency);
      globals.loadMainScreen();
      close();
    }
  };
  var currencyBox = Alloy.createController(
    "components/component_currency_box",
    args2
  );
  $.currencyList.add(currencyBox.getView());
}

$.background.addEventListener("touchend", close);
$.closeIcon.addEventListener("touchend", close);
