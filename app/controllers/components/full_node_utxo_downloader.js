var didWarnWifi = false;
let name = globals.network+".zip";

if(name == "testnet.zip"){
    name = "testnet3.zip";
}

function downloadUTXOSet() {

  downloadInterval = null;

  globals.console.log("downloading UTXO set");
    if(globals.fullNodeController.checkWifi() == false &&  didWarnWifi == false){
        didWarnWifi = true;
        alert("use_wifi");
        return;
    }

    $.downloadGoogleDrive.hide();
    $.status.show();
    $.status.text = L("signing_in_google_drive");
   

  globals.console.log("downloading UTXO set cont");
    globals.fullNodeController.downloadUTXOSet(name,function(error, response) {

    globals.console.log("downloading UTXO set res",response);

      if (error == true) {
        $.status.text = L("error_loading").format({ message: response })
        return;
      }
      
      try {
        
        
      
        var res = JSON.parse(response);
        if (res.type == "download") {


          if (res.complete == true) {
            clearInterval(downloadInterval);
            if(res.checksum == undefined){
                $.status.text = L("calculating_checksum");
            }else{
                
                $.controls.hide();
                $.checkSumView.show();
                $.checkSumLabel.text = res.checksum;
                 
             }
          }else{
            downloadInterval = setInterval(function () {
              getDownloadProgress()
            }, 2000);
          }
        }
      } catch (e) {}
    }); 
  }
  function getUnZipProgress(){

    var progress = globals.fullNodeController.getUnZipProgress();
    progress =  (parseFloat(progress+"") * 100).toFixed2(2);
    $.status.text = L("unzipping_file")+" "+progress+ "%";

  }

  function getDownloadProgress(){

    var progress = globals.fullNodeController.getDownloadProgress();
    globals.console.log("progress",progress);
    progress =  (parseFloat(progress+"") * 100).toFixed2(2);
    $.status.text = L("downloading")+" "+progress+ "%";
 
  }

  function unZip(){
    var unZipInterval = null;
    $.controls.show();
    $.checkSumView.hide();

    globals.console.log("starting unzip");


    globals.fullNodeController.unZipUTXOSet(name,function(error, response) {
        globals.console.log("error",error)
        globals.console.log("response",response)
     
      if (error == true) {
        $.status.text = L("error_loading").format({ message: response })
        return;
      }
      

      unZipInterval = setInterval(function () {
        getUnZipProgress()
      }, 2000);

      globals.console.log("response", response);
      var res = JSON.parse(response);
      progress =  (parseFloat(res.progress+"") * 100).toFixed2(2);
        $.status.text = L("unzipping_file")+" "+progress+ "%";

        if (res.complete == true) {
            clearInterval(unZipInterval);
            $.status.text = L("utxo_complete");
        }
    });
  }

function close() {
   $.win.close();
  }
   

  function goToPage2() {
    $.page1.hide();
    $.page2.show();
  }
  
  function closeIntro() {
    $.page1.hide();
    $.page2.hide();
  }

  function goToGuide(){
    Ti.Platform.openURL("https://nayuta.co/fullnodeguide");
  }

  function reset(){
    var dialog = globals.util.createDialog({
      title: "",
      message: L("label_reset_desc"),
      value: "",
      buttonNames: [L("label_ok"), L("label_close")]
    });
    dialog.addEventListener("click", function(e) {
       if (e.index != e.source.cancel) {
          globals.lnGRPC.signOutGoogleDrive();
          globals.fullNodeController.deleteCore();
        }
    });
    dialog.show();
  }
  