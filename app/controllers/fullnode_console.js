function close() {
  $.win.close();
}
var showRes = false;

function run() {
  var command = $.command.value;
  showRes = true;
  globals.fullNodeController.sendCommand(command);
  
}

globals.setConsole = function(val){
  if(showRes == true){
  $.console.value = val;
  }
  showRes = false;
}
