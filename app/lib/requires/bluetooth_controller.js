module.exports = (function () {
  var self = {};

  function isEmulator() { 
  
    return (Ti.Platform.manufacturer == 'Genymotion' || Ti.Platform.model == 'Simulator' || Ti.Platform.model.toLowerCase().indexOf('sdk') != -1);
  } 

  if (!isEmulator() && OS_ANDROID) {
    globals.console.log("loading bluetooth lib")
    var Activity = require('android.app.Activity');

    self.bluetoothController = require("com.mandelduck.lnbluetooth.BluetoothController");

    var CallbackInterface = require("com.mandelduck.lnbluetooth.CallbackInterface");

    var activity = new Activity(Ti.Android.currentActivity);
    var contextValue = activity.getApplicationContext();
    self.connectedDevice = null;
    var currentListener = null;

    self.setCurrentListener = function (listener) {
      currentListener = listener;
    }
    self.bluetoothController.setUp(contextValue, new CallbackInterface({
      eventFired: function (event) {
  
        var message = JSON.parse(event);
  
        if (currentListener != null) {
          currentListener(message);
        }
  
        if (message.type == "disconnected") {
  
          self.connectedDevice = null;
  
          globals.showHideBluetoothIcon(false);
  
  
        }
        else if (message.type == "error") {
          globals.console.error(message);
        }
        else if (message.type == "createInvoice") {

          globals.console.log("createInvoice", message);
  
          var params = {};
          var invoiceData = message.data.split(",");
  
  
  
          if (invoiceData.length > 0) {
  
              params.amount = parseInt(invoiceData[0]);
  
              if (invoiceData.length > 1) {
                  params.expiry = parseInt(parseInt(invoiceData[1])/60);//convert to minuets
              }
  
              if (invoiceData.length > 2) {
                  params.memo = invoiceData[2];
              }
  
              params.start = true;

              globals.console.log("createInvoice params", params);
  
              globals.console.log(params);
               
  
              Alloy.createController("request", params).getView().open();
  
          }
  
  
      }
  
      }
    }));

     

  }else{
    globals.console.log("not loading bluetooth lib")
  }
  


  self.sendMessage = function (data) {
    globals.console.log("sending message", data);
    self.bluetoothController.sendMessage(data);
  }

  self.connectToDevice = function (device, callback) {

    self.bluetoothController.connectToDevice(device.address, new CallbackInterface({
      eventFired: function (event) {
        globals.console.log("connect message", event);
        var message = JSON.parse(event);
        if (message.type == "connected") {
          self.connectedDevice = device;

          globals.showHideBluetoothIcon(true);

          callback(true);


        }
        else if (message.type == "disconnected") {
          self.connectedDevice = null;

          globals.showHideBluetoothIcon(false);

          callback(false);


        }


      }
    }));

  }

  self.scanDevices = function (uuid, name, callback) {
    self.bluetoothController.scanDevices(uuid, name, new CallbackInterface({
      eventFired: function (event) {

        var message = JSON.parse(event);

        if (message.type == "scan") {
          globals.console.log("scan", message);
          callback(message);

        } else {
          globals.console.log(event);
        }



      }
    }));
  }

  if (!isEmulator()) {
    if (Ti.App.Properties.getString("ble_autoconnect", undefined) != undefined) {
      globals.console.log("starting bluetooth auto connect")
      var isConnecting = false;
      self.scanDevices("", "", function (device) {

        if (device.address == Ti.App.Properties.getString("ble_autoconnect")) {
          if (isConnecting == false) {
            isConnecting = true;


            self.connectToDevice(device, function (success) {
              isConnecting = false;
              if (success == true) {
                self.bluetoothController.stopScan();
              }
            });




          }
          return;
        }

      });
    }
  }

  return self;
}());