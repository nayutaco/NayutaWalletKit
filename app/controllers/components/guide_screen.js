var args = arguments[0] || {};

$.guide_title.text = args.title;

$.guide_text.text = args.text;

$.mainView.height = globals.util.getDisplayHeight();

$.mainView.top = globals.util.getDisplayHeight();

$.mainView.animate({
  top: 0,
  duration: 200
});

function close(e) {
  $.mainView.animate({
    top: globals.util.getDisplayHeight(),
    duration: 200
  });

  setTimeout(function() {
    $.win.close();
  }, 200);
}
