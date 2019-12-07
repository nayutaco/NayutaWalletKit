var args = arguments[0] || {};
globals.console.log(args);
try {
  args.image = args.image.replace("\\", "//");
  if (args.image == "") {
    args.image =
      "https://www.google.com/s2/favicons?domain=" + args.url + "&size=256";
  }
  $.iconImage.image = args.image;
  $.iconLabel.text = args.title;
} catch (e) {
  globals.console.log(e);
}

function openDapp() {
  if ($.deleteImage.visible == true) {
    return;
  }

  if (globals.loadedWebView == false) {
    globals.loadWebView();
    setTimeout(function() {
      openDapp();
    }, 2000);
    return;
  }
  globals.loadDiscover();
  globals.loadInDapp(args.url);

  globals.openCloseMenu();
}

function deleteDapp() {
  var favs = JSON.parse(Ti.App.Properties.getString("favourites", "{}"));

  delete favs[args.hostname];
  Ti.App.Properties.setString("favourites", JSON.stringify(favs));

  globals.loadFavourites();
}

function showDelete() {
  $.deleteImage.visible = true;
}

function errorLoad() {
  alert("error");
  $.iconImage.image = $.iconImage.defaultImage;
}
