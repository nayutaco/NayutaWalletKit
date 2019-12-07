function close() {
  $.win.close();
}

function refresh() {
  $.logs.value = "";
  globals.fullNodeController.getLogs(function(response) {
    $.logs.value += response.res;
  });
}
function copy() {
  Ti.UI.Clipboard.setText($.logs.value);
  alert("copied to clipboard");
}

refresh();
