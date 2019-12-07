var devices = [];
var devicesAdd = [];
var currentDevice = null;
$.connectingView.hide();

globals.bluetoothController.setCurrentListener(function(message) {
  if (message.type == "disconnected") {
    $.connectingView.visible = false;
    alert(L("disconnected"));
  }
});
function addDevice(device) {
  if (device.name == undefined) {
    return;
  }

  $.waitingDevices.hide();

  if (devicesAdd.indexOf(device.address) == -1) {
    devices.push(device);
    devicesAdd.push(device.address);
    globals.console.log("adding device");
  } else {
    return;
  }

  var items = [];
  for (var i = 0; i < devices.length; i++) {
    var connectStatus = "connect";
    if (
      globals.bluetoothController.connectedDevice != null &&
      globals.bluetoothController.connectedDevice.address == devices[i].address
    ) {
      connectStatus = "disconnect";
    }
    items.push({
      device: { text: devices[i].name + " " + devices[i].address },
      connect: { text: connectStatus }
    });
  }

  $.deviceList.sections[0].setItems(items);
}

function setAutoConnect(e) {
  if (e.value == true) {
    globals.console.log("set on");
    Ti.App.Properties.setString("ble_autoconnect", currentDevice.address);
  } else {
    globals.console.log("set off");
    Ti.App.Properties.removeProperty("ble_autoconnect");
  }
}
var didClick = false;
function handleClick(e) {
  if (
    currentDevice != null &&
    currentDevice.address == devices[e.itemIndex].address
  ) {
    currentDevice = null;
    globals.bluetoothController.bluetoothController.disconnect();
    globals.bluetoothController.connectedDevice = null;
    close();
    return;
  }
  if (didClick == true) {
    return;
  }
  currentDevice = devices[e.itemIndex];
  $.autoConnectView.hide();

  globals.auth.check({
    title: "",
    callback: function(e) {
      didClick = false;
      if (e.success) {
        $.optionSwitch.value = false;
        if (
          Ti.App.Properties.getString("ble_autoconnect", undefined) ==
          currentDevice.address
        ) {
          $.optionSwitch.value = true;
        }

        $.connectedLabel.hide();
        $.connectingLabel.show();

        $.connectingView.visible = true;

        globals.bluetoothController.connectToDevice(currentDevice, function(
          success
        ) {
          if (success) {
            setTimeout(function() {
              $.autoConnectView.show();
              $.connectedLabel.show();
              $.connectingLabel.hide();
            }, 1000);
          } else {
            $.connectingView.visible = false;
            alert(L("disconnected"));
          }
        });
      }
    }
  });
}

function reload() {
  devices = [];
  devicesAdd = [];
  $.deviceList.sections[0].setItems([]);
}

function close() {
  $.win.close();
  globals.bluetoothController.bluetoothController.stopScan();
}

didLoad = false;
function startScan() {
  if (didLoad == true) {
    return;
  }

  globals.console.log("starting scan");
  didLoad = true;
  globals.bluetoothController.scanDevices("", "", function(device) {
    addDevice(device);
  });
}

function closeConnecting() {
  $.connectingView.hide();
  close();
}

if (globals.bluetoothController.connectedDevice != null) {
  currentDevice = globals.bluetoothController.connectedDevice;
  globals.console.log("currentDevice" + currentDevice);
}
