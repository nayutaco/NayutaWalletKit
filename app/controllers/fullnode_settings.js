function close() {
  $.win.close();
}

function deleteData() {
  globals.fullNodeController.deleteCore();
  alert("deleted");
  globals.resetFullnodeUI();
}

function goToConfig() {
  if (globals.fullNodeController.isInstalled() == false) {
    alert(L("please_start_core"));
    return;
  }
    let conf = globals.fullNodeController.readConf();
    Alloy.createController("fullnode_conf", { conf: conf })
      .getView()
      .open();
  
}

function viewLogs() {
  Alloy.createController("fullnode_logs")
    .getView()
    .open();
}

function goToConsole() {
  Alloy.createController("fullnode_console")
    .getView()
    .open();
}

function goToDownloadUTXOPage(){
  Alloy.createController("components/full_node_utxo_downloader")
  .getView()
  .open();

}

function reindex(){
  globals.reindex();
  $.win.close();
}
