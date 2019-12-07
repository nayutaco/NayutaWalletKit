var args = arguments[0] || {};

$.config.value = args.conf;

function close() {
  $.win.close();
}

function save() {
  globals.fullNodeController.saveConf($.config.value);

  $.win.close();
}
