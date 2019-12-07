var args = arguments[0] || {};

$.mainView.height = globals.util.getDisplayHeight();

$.mainView.top = globals.util.getDisplayHeight();

$.mainView.animate({
  top: 0,
  duration: 200
});
function download() {
  Ti.Platform.openURL(
    "https://play.google.com/store/apps/details?id=org.torproject.android&hl=en"
  );
}
function close(e) {
  $.mainView.animate({
    top: globals.util.getDisplayHeight(),
    duration: 200
  });

  setTimeout(function() {
    $.win.close();
  }, 200);
}
