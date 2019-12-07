var args = arguments[0] || {};

globals.closeTouchID = function() {
  $.main.animate({
    top: Alloy.Globals.display.height,
    duration: 200
  });
  setTimeout(function() {
    $.win.close();
  }, 300);
};

$.main.animate({
  top: 0,
  duration: 300
});

if (OS_ANDROID) {
  $.win.addEventListener("android:back", function() {
    return true;
  });
}

function usePassCode(){ 
  args.usePassCode();
}
