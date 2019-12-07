module.exports = (function () {

  var self = {};

  var currentCallbackQR = null;
  var qrMode = "";

  globals.tikerLoaded = false;

  globals.wallets = {};

  function merge(obj1, obj2) {
    if (!obj2) obj2 = {};
    for (var attrname in obj2) {
      if (obj2.hasOwnProperty(attrname)) obj1[attrname] = obj2[attrname];
    }
    return obj1;
  };

  function getFont(params) {
    var basic_font = {
      fontSize: 15,
      fontFamily: "HelveticaNeue-Light"
    };
    if (params.font) basic_font = merge(basic_font, params.font);

    return basic_font;
  };

  function makeAnimation(directory, num, params) {
    var images = [];

    for (var i = 0; i < num; i++) {
      images.push("/images/" + directory + "/" + i + ".png");
    }
    var basic = {
      "images": images,
    };
    var animation = Ti.UI.createImageView(merge(basic, params));
    animation.start();

    return animation;
  };

  self.makeImage = function (params) {
    var image = Ti.UI.createImageView(params);
    return image;
  };

  self.makeImageButton = function (params) {
    var image = Ti.UI.createImageView(params);
    if (params.listener != null) {
      image.addEventListener("click", function () {
        params.listener(image);
      });
    }
    return image;
  };

  self.makeLabel = function (params) {
    var basic = {
      color: "#000000",
      textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
    };
    params.font = getFont(params);
    var label = Ti.UI.createLabel(merge(basic, params));

    return label;
  };

  self.makeAnimation = makeAnimation;
  var showInfoButton = true;
  var infoButtonTitle = L('enter_invoice');


  if (OS_IOS) {

    var enterInfoButton = Ti.UI.createButton({
      title: L('enter_invoice'),
      textAlign: 'center',
      color: '#000',
      backgroundColor: '#fff',
      style: 0,
      font: {
        fontWeight: 'light',
        fontSize: 16
      },
      borderColor: '#000',
      borderRadius: 10,
      borderWidth: 1,
      opacity: 0.5,
      width: 220,
      height: 30,
      bottom: 60
    });

    var overlay = Ti.UI.createView({
      backgroundColor: 'transparent',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: "100%",
      height: "100%",
      layout: "vertical"
    });

    var bottomImage = Ti.UI.createView({
      backgroundColor: Alloy.Globals.nayutaDark,
      width: "100%",
      height: "40%"
    });

    var topImage = Ti.UI.createView({
      backgroundColor: 'transperent',
      width: "100%",
      height: "60%"
    });

    var scanImage = Ti.UI.createImageView({
      image: "/images/qrScanOverlay.png",
      width: "60%",
      oapcity: 0.5,

    });

    var cancelButton = Ti.UI.createButton({
      title: L('label_cancel'),
      textAlign: 'center',
      color: '#000',
      backgroundColor: '#fff',
      style: 0,
      font: {
        fontWeight: 'light',
        fontSize: 16
      },
      borderColor: '#000',
      borderRadius: 10,
      borderWidth: 1,
      opacity: 0.5,
      width: 220,
      height: 30,
      bottom: 10
    });
    cancelButton.addEventListener('click', function () {
      Barcode.cancel();
    });

    var qrMode = "none";

    enterInfoButton.addEventListener('click', function () {
      Barcode.cancel();

      if (qrMode == "invoice") {

        Alloy.createController("transaction_conf", {
          "small": true,
          "message": L("enter_payment_request_description"),
          "enterRequest": true,
          "cancel": function () {

          },
          "confirm": function () {

            globals.loadMainScreen();

          },

        });

      } else if (qrMode == "account") {

        Alloy.createController("transaction_conf", {
          "small": true,
          "conf": true,
          "message": L("enter_grpc_config"),
          "enterConfig": true,
          "cancel": function () {

          },
          "confirm": function (res) {
            currentCallbackQR(res);

          },

        });

      }

    });

    bottomImage.add(enterInfoButton);

    bottomImage.add(cancelButton);

    topImage.add(scanImage);

    overlay.add(topImage);


    overlay.add(bottomImage);

    var Barcode = require("ti.barcode");
    Barcode.allowRotation = false;
    Barcode.displayedMessage = "";
    Barcode.useLED = false;


    var currentV = null;
    Barcode.addEventListener("error", function (e) {
      Ti.API.info("error received");
      if (currentV.error != undefined) {
        currentV.error({
          "error": e
        });
      }
    });
    Barcode.addEventListener("cancel", function (e) {
      if (currentV.cancel != undefined) {
        currentV.cancel({
          "cancel": e
        });
      }
    });
    Barcode.addEventListener("success", function (e) {
      globals.console.log("Success called with barcode: " + e.result);

      currentV.callback({
        "barcode": e.result
      });

    });
  }
  self.openScanner = function (v) {

    currentV = v;

    Barcode.capture({
      animate: true,
      overlay: overlay,
      showCancel: false,
      showRectangle: false,
      keepOpen: false,
      acceptedFormats: [
        Barcode.FORMAT_QR_CODE
      ]
    });

  };

  self.group = function (params, layout) {
    var basic = {
      width: Ti.UI.SIZE,
      height: Ti.UI.SIZE
    };
    if (layout != null) basic.layout = layout;

    var group = Ti.UI.createView(basic);
    for (key in params) {
      group.add(params[key]);
      group[key] = params[key];
    }

    group.addView = function (params) {
      for (key in params) {
        group.add(params[key]);
        group[key] = params[key];
      }
    };

    group.removeView = function (params) {
      for (key in params) {
        group.remove(params[key]);
        group[key] = null;
      }
    };

    return group;
  };

  self.createDialog = function (params, listener) {
    if (params.title == null) params.title = "";

    if (params.buttonNames.length > 1 && params.cancel == undefined) {
      params.cancel = 1;
    }
    var dialog = Ti.UI.createAlertDialog(params);
    if (listener != null) dialog.addEventListener("click", listener);

    return dialog;
  };

  self.createInputDialog = function (params) {
    var dialog = {};
    if (params.title == null) params.title = "";

    var origin;
    if (OS_ANDROID) {
      var inputView = Ti.UI.createView({
        backgroundColor: "#ffffff"
      });
      var style = {
        hintText: (params.hintText) ? params.hintText : "",
        height: 45,
        width: "100%",
        color: "#000000",
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED
      };
      if (params.passwordMask) style.passwordMask = true;
      if (params.keyboardType) style.keyboardType = params.keyboardType;

      dialog.androidField = Ti.UI.createTextField(style);
      inputView.add(dialog.androidField);
      if (params.buttonNames.length > 1 && params.cancel == undefined) {
        params.cancel = 1;
      }
      origin = Ti.UI.createOptionDialog({
        title: params.title,
        message: params.message,
        androidView: inputView,
        buttonNames: params.buttonNames,
        cancel: params.cancel
      });
      if (params.value) dialog.androidField.setValue(params.value);
    } else {
      if (params.buttonNames.length > 1 && params.cancel == undefined) {
        params.cancel = 1;
      }
      var style = {
        title: params.title,
        message: params.message,
        style: Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT,
        buttonNames: params.buttonNames,
        cancel: params.cancel
      };
      if (params.keyboardType) style.keyboardType = params.keyboardType;
      if (params.passwordMask) style.style = Ti.UI.iOS.AlertDialogStyle.SECURE_TEXT_INPUT;
      origin = Ti.UI.createAlertDialog(style);


    }
    dialog.origin = origin;

    return dialog;
  };

  self.showLoading = function (parent, params) {
    params.font = getFont(params);
    params.style = "dark";
    if (params.width == Ti.UI.FILL && params.height == Ti.UI.FILL) {
      params.backgroundColor = "#ffffff";
      if (params.opacity == undefined) {
        params.opacity = 0.7;
      }
      params.font = {
        fontSize: 15,
        fontFamily: "HelveticaNeue-Light"
      };
      params.color = "#333333";
    }
    var style = Ti.UI.ActivityIndicatorStyle.PLAIN;
    if (params.style != null) {
      if (params.style === "dark") style = Ti.UI.ActivityIndicatorStyle.DARK;
    }
    params.style = style;

    var act = Ti.UI.createActivityIndicator(params);
    act.show();

    parent.add(act);

    act.removeSelf = function () {
      if (act != null) {
        parent.remove(act);
        act = null;
      }
    };

    return act;
  };

  self.qrcodeCallback = function (response, params) {
    var uri = globals.bitcoin.decodeBip21((response.indexOf("bitcoin:") >= 0) ? response : "bitcoin:" + response);
    if (uri == null) {
      var matches = response.match(/[a-zA-Z0-9]{27,34}/);
      var vals = {};
      vals.address = (matches != null) ? matches[0] : null;
      if (response.indexOf("&") >= 0) {
        var args = response.split("&");
        for (var i = 1; i < args.length; i++) {
          var a = args[i].split("=");
          vals[a[0]] = a[1];
        }
      }
      uri = vals;

    }
    if (uri != null) params.callback(uri);
  };

  self.readQRcodeAccount = function (params, any) {
    qrMode = "account";
    showInfoButton = true;
    infoButtonTitle = L("enter_config_url");
    self.readQRcode(params, any);
  };

  self.readQRcodeNormal = function (params, any) {
    showInfoButton = false;
    infoButtonTitle = "";
    qrMode = "normal";
    self.readQRcode(params, any);
  };

  self.readQRcodeInvoice = function (params, any) {
    qrMode = "invoice";
    showInfoButton = true;
    infoButtonTitle = L('enter_invoice')
    self.readQRcode(params, any);
  };

  self.readQRcodePubkey = function (params, any) {
    qrMode = "pubkey";
    showInfoButton = false;
    infoButtonTitle = "";
    self.readQRcode(params, any);
  };

  if (OS_ANDROID) {
    var Activity = require('android.app.Activity');
    var qrcodeScanner = require("com.mandelduck.qrcodescanner.CodeScannerLauncher");
    var activity = new Activity(Ti.Android.currentActivity);
    var contextValue = activity.getApplicationContext();
    var CallbackInterface = require("com.mandelduck.qrcodescanner.CallbackInterface");

  }

  self.readQRcode = function (params, any) {
    globals.console.log("read qr code");
    currentCallbackQR = params.callback;

    if (OS_ANDROID) {

      qrcodeScanner.launchQrCodeActivity(contextValue, !showInfoButton, L("label_close"), infoButtonTitle, new CallbackInterface({
        eventFired: function (response) {

          globals.console.log("qrcode response", response);

          var res = JSON.parse(response);

          if (res.error != false) {
            alert(res.response);
            return;
          }

          if (res.response == "button 2 clicked") {
            if (qrMode == "invoice") {

              Alloy.createController("transaction_conf", {
                "small": true,
                "message": L("enter_payment_request_description"),
                "enterRequest": true,
                "cancel": function () {

                },
                "confirm": function () {

                  globals.loadMainScreen();

                },

              });

            } else if (qrMode == "account") {

              Alloy.createController("transaction_conf", {
                "small": true,
                "conf": true,
                "message": L("enter_grpc_config"),
                "enterConfig": true,
                "cancel": function () {

                },
                "confirm": function (res) {
                  currentCallbackQR(res);

                },

              });

            }
            return;
          } else {

            if (OS_IOS) {
              enterInfoButton.visible = showInfoButton
              enterInfoButton.title = infoButtonTitle
            }

            if (qrMode != "invoice" && qrMode != "account" && qrMode != "pubkey") {

              self.qrcodeCallback(res.response, params);

            } else {

              params.callback(res.response);

            }

          }

        }
      }));
      return;
    }
    if (any == false) {

      self.openScanner({
        "callback": function (e) {
          self.qrcodeCallback(e.barcode, params);
        }
      });
    } else {
      globals.console.log("opening scanner any");
      self.openScanner({
        "callback": function (e) {
          globals.console.log("callback qrcode");
          params.callback(e.barcode);
        }
      });
    }
  };

  self.createSlider = function (params) {
    var slider = {};
    var slideColor = "#5c8077";
    slider.is = params.init || false;
    slider.editable = params.editable || true;
    slider.origin = Ti.UI.createView({
      borderRadius: 2,
      backgroundColor: params.init ? slideColor : "#666666",
      width: 60,
      height: 25
    });

    var swit = self.makeImage({
      image: "/images/image_slider.png",
      height: 22.5,
      width: 64.2
    });
    swit.left = (!params.init) ? -18.6 : 16;

    slider.origin.add(swit);
    slider.origin.addEventListener("click", function () {
      if (slider.editable) {
        if (slider.is) {
          if (OS_ANDROID) slider.origin.backgroundColor = "#666666";
          else slider.origin.animate({
            backgroundColor: "#666666",
            duration: 500
          });

          swit.animate({
            left: -18.6,
            duration: 300
          }, params.off);
          slider.is = false;
        } else {
          if (OS_ANDROID) slider.origin.backgroundColor = slideColor;
          else slider.origin.animate({
            backgroundColor: slideColor,
            duration: 500
          });
          swit.animate({
            left: 16,
            duration: 300
          }, params.on);
          slider.is = true;
        }
      }
    });

    slider.on = function () {
      slider.is = true;
      swit.left = 16;
      slider.origin.backgroundColor = slideColor;
    };

    slider.off = function () {
      slider.is = false;
      swit.left = -18.6;
      slider.origin.backgroundColor = "#666666";
    };

    return slider;
  };

  self.getStatusBarHeight = function () {
    switch (Ti.Platform.displayCaps.density) {
      case 160:
        return 25;
      case 120:
        return 19;
      case 240:
        return 38;
      case 320:
        return 50;
      default:
        return 25;
    }
  };

  self.getDisplayHeight = function () {
    if (OS_ANDROID) {
      if (Ti.Platform.displayCaps.platformHeight > Ti.Platform.displayCaps.platformWidth) {
        return (Ti.Platform.displayCaps.platformHeight / Ti.Platform.displayCaps.logicalDensityFactor);
      }
      return (Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor);
    }
    return Ti.Platform.displayCaps.platformHeight;
  };

  self.getDisplayWidth = function () {
    if (OS_ANDROID) {
      if (Ti.Platform.displayCaps.platformHeight > Ti.Platform.displayCaps.platformWidth) {
        return (Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor);
      }
      return (Ti.Platform.displayCaps.platformHeight / Ti.Platform.displayCaps.logicalDensityFactor);
    }
    return Ti.Platform.displayCaps.platformWidth;
  };

  self.convert_x = function (val) {
    return (OS_ANDROID) ? (val / Ti.Platform.displayCaps.logicalDensityFactor) : val;
  };

  self.convert_y = function (val) {
    return (OS_ANDROID) ? (val / Ti.Platform.displayCaps.logicalDensityFactor) : val;
  };

  self.satToBtc = function (value, format) {

    function roundFix(number, precision) {
      var multi = Math.pow(10, precision);
      return Math.round((number * multi).toFixed(precision + 1)) / multi;
    }

    var val = value / 100000000;

    if (format == true) {
      return roundFix(val, 6).toString();
    }

    return val;
  };

  self.btcToSat = function (value) {

    var val = value * 100000000;

    return val;
  };

  self.setReorg = function (parent) {
    var params = {};

    params.width = params.height = Ti.UI.FILL;
    params.backgroundColor = "#e54353";
    params.opacity = 0.0;

    var view = Ti.UI.createView(params);
    var texts = self.group({
      "title": self.makeLabel({
        text: L("label_reorganisation"),
        color: "#ffffff",
        font: {
          fontSize: 18
        },
        top: 0
      }),
      "text": self.makeLabel({
        text: L("text_reorganisation"),
        color: "#ffffff",
        font: {
          fontSize: 15
        },
        top: 10
      }),
      "text2": self.makeLabel({
        text: L("text_reorganisation2"),
        color: "#ffffff",
        font: {
          fontSize: 12
        },
        top: 10
      })
    }, "vertical");
    texts.width = "90%";

    var loading = self.showLoading(texts, {});
    loading.top = 10;

    view.add(texts);
    view.animate({
      opacity: 0.9,
      duration: 300
    });

    parent.add(view);

    view.removeSelf = function () {
      parent.remove(view);
      view = null;
    };

    return view;
  };

  self.getSCBFolderName = function () {
    return "LNDChannelBackups";
  }
  self.getPassphraseHash = function () {
    if (globals.decryptedPassphrase == undefined) {
      globals.decryptedPassphrase = " ";
    }
    var passcodeHash = Titanium.Utils.sha256(globals.decryptedPassphrase).substring(0, 10);
    globals.console.log("passcodeHash", passcodeHash);
    return passcodeHash;
  }
  self.getSCBFileName = function () {
    var trimPubKey = globals.currentPubkey.substring(0, 10);
    var passphraseHash = self.getPassphraseHash();
    var filename = trimPubKey + "_" + Alloy.Globals.network + '_channels_backup_' + passphraseHash + ".txt";
    globals.console.log("filename", filename);
    return filename
  }

  self.getSCBFileNameNoPubKey = function () {
    var trimPubKey = globals.currentPubkey.substring(0, 10);
    var passphraseHash = self.getPassphraseHash();
    var filename = Alloy.Globals.network + '_channels_backup_' + passphraseHash + ".txt";
    globals.console.log("filename", filename);
    return filename
  }

  self.backUpChannels = function (callback) {


    globals.lnGRPC.exportAllChannelBackups(function (error, response) {

      if (error == true) {
        callback(error, response);

        return;
      }
      globals.console.log("back up res ", response + " " + error)
      var fileName = self.getSCBFileName();
      globals.console.log("filename ", fileName)
      var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fileName);
      if (f.exists() === false) {
        f.createFile();
      }

      if (OS_IOS) {
        var multi_chan_backup = response.multi_chan_backup.multi_chan_backup;
      } else if (OS_ANDROID) {
        var multi_chan_backup = response.multi_chan_backup;
      }
      f.write(multi_chan_backup);
      globals.console.log("file name is ", fileName)
      globals.lnGRPC.uploadGoogleDrive(multi_chan_backup, function (error, response) {

        callback(error, response);
      });

    });
  }

  self.getConfig = function (network) {

    var configString = "[Application Options]\n\n";
    configString += "maxbackoff=2s\n"
    configString += "debuglevel=info\n"
    configString += "nolisten=1\n"


    configString += "sync-freelist=0\n"


    configString += "maxlogfiles=3\n"
    configString += "maxlogfilesize=10\n"

    configString += "no-macaroons=1\n"
    configString += "maxpendingchannels=2\n"

    configString += "\n[Bitcoin]\n\n"
    configString += "bitcoin.active=1\n"
    globals.console.log("config network", network);

    if (network == "testnet") {
      configString += "bitcoin.testnet=1\n"
    } else {
      configString += "bitcoin.mainnet=1\n"
    }

    configString += "bitcoin.defaultchanconfs=1\n"

    if (Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 1) {
      configString += "bitcoin.node=bitcoind\n"
    } else {
      configString += "bitcoin.node=neutrino\n"
    }

    if (Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 1) {
      configString += "\n[bitcoind]\n\n"
      configString += "bitcoind.rpchost=localhost\n";
      configString += "bitcoind.rpcpass=" + globals.createPassword() + "\n";
      configString += "bitcoind.rpcuser=bitcoinrpc\n";
      configString += "bitcoind.zmqpubrawblock=tcp://127.0.0.1:28332\n"
      configString += "bitcoind.zmqpubrawtx=tcp://127.0.0.1:28333\n"

    }

    configString += "\n[Routing]\n\n"
    configString += "routing.assumechanvalid=1\n"

    configString += "\n[Autopilot]\n\n"

    configString += "autopilot.active=" + Ti.App.Properties.getInt("autoPilot", 0) + "\n"

    configString += "autopilot.allocation=0.95\n"
    configString += "autopilot.minconfs=1\n"
    configString += "autopilot.private=1\n"
    configString += "autopilot.allocation=0.95\n"

    configString += "autopilot.heuristic=externalscore:0.95\n"
    configString += "autopilot.heuristic=preferential:0.05\n"

    configString += "\n[wtclient]\n\n"
    configString += "wtclient.active=1\n"
    configString += "wtclient.sweep-fee-rate=20\n"



    if (Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 0) {
      configString += "\n[Neutrino]\n\n"

      var neutrinoPeer = globals.neutrinoUri;

      globals.defaultPeer = neutrinoPeer;

      var customPeer = Ti.App.Properties.getString("customPeer", "");
      if (customPeer != "") {
        neutrinoPeer = customPeer;
      }

      configString += "neutrino.addpeer=" + neutrinoPeer + "\n";

      if (network == "testnet") {
        feeUrl = Ti.App.Properties.getString("feeUrlTestnet", "");
      } else {
        feeUrl = Ti.App.Properties.getString("feeUrlMainnet", "");
      }

      configString += "neutrino.feeurl=" + feeUrl + "\n"
    }
    if (OS_ANDROID) {
      globals.console.log("config string", configString);
    }
    else if (OS_IOS) {
      globals.console.log("config string");
      var parts = configString.split("\n");
      for (var i = 0; i < parts.length; i++) {

        globals.console.log(parts[i]);

      }
    }
    return configString;

  }
  self.saveLNDConf = function (network) {

    var configString = self.getConfig(network);

    if (OS_IOS) {
      globals.console.log("saving lnd conf");
      var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "lnd.conf");
      file.write(configString);
    }

  }


  self.saveTxid = function (txid, address) {

    var txids = Ti.App.Properties.getString("txidsV1", "{}");

    txids = JSON.parse(txids);

    txids[txid] = address;

    globals.console.log(txids);

    Ti.App.Properties.setString("txidsV1", JSON.stringify(txids));

  }

  self.scheduleReminderNotif = function () {
    var notification = Ti.App.iOS.scheduleLocalNotification({
      userInfo: {
        "id": "check"
      },
      alertBody: L("check_notification"),
      date: new Date(new Date().getTime() + 172800)
    });
  }

  self.saveAddress = function (address) {

    var addresses = Ti.App.Properties.getString("addresses", "[]");

    addresses = JSON.parse(addresses);
    addresses.push(address);

    globals.console.log(addresses);

    Ti.App.Properties.setString("addresses", JSON.stringify(addresses));

  }

  self.getCurrentNetworkBlockHeight = function (network) {
    globals.console.log("getting current network height " + network, globals.blockHeight);
    return globals.blockHeight[network];

  }

  self.addPullEvent = function (view, params) {
    var a = null;
    if (OS_ANDROID) {
      a = view.children[0].convertPointToView({
        "x": view.children[0].rect.x,
        "y": view.children[0].rect.y
      }, params.parent);
    }

    var reload = self.makeImageButton({
      "image": '/images/icon_reload_off.png',
      "width": 30,
      "top": (a != null) ? self.convert_y(a.y) : params.marginTop,
      opacity: 0.0
    });
    params.parent.add(reload);

    var s = 0,
      s_total = 0,
      top = view.children[0].top;
    var howpull = params.howpull || 60;

    function scroll(y) {
      if (y > -howpull) {
        reload.opacity = (y / -howpull);
        reload.image = '/images/icon_reload_off.png';
      } else {
        reload.opacity = 1.0;
        reload.image = '/images/icon_reload_on.png';
      }
      var t = Ti.UI.create2DMatrix();
      reload.transform = t.rotate(90 - (90 * reload.opacity)).scale(reload.opacity, reload.opacity);
    }

    function release(y) {
      if (y < -howpull) {
        if (OS_ANDROID) {
          view.children[0].animate({
            "top": top,
            "duration": 100
          });
        } else if (OS_IOS) {
          view.children[0].animate({
            "top": top,
            "duration": 100
          });
        }
        params.callback();
      } else if (OS_ANDROID) {
        view.children[0].animate({
          "top": top,
          "duration": 100
        });
        s_total = 0;
      }
      reload.image = '/images/icon_reload_off.png';
      reload.opacity = 0.0;
    }
    if (OS_IOS) {
      view.addEventListener('scroll', function (e) {
        if (view.contentOffset.y <= 0) scroll(view.contentOffset.y);
      });
      view.addEventListener('dragEnd', function (e) {
        release(view.contentOffset.y);
      });
    } else if (OS_ANDROID) {
      var move = 0;
      view.addEventListener('touchstart', function (e) {
        s = e.y;
        move = 0;
        if (s_total < 0) s_total = 0;
      });
      view.addEventListener('touchmove', function (e) {
        if (move++ > 3) {
          globals.isScrolling = true;
          if (view.contentOffset.y <= 0 || view.children[0].top > top) {
            if (s != 0) {
              var diff = (s - e.y) / 2;
              if (Math.abs(diff) < 100) s_total += diff;
              view.children[0].top = -s_total;
              if (view.children[0].top <= top) {
                view.children[0].top = top;
                view.scrollingEnabled = true;
              }
              scroll(-view.children[0].top);
            }
            s = e.y;
          }
        }
      });
      view.addEventListener('touchend', function (e) {
        globals.isScrolling = false;
        release(-view.children[0].top);
        s = 0;
      });
    }
  };

  self.showDisclaimer = function (callback) {
    var dialog = globals.util.createDialog({
      title: L("label_warning"),
      message: L("label_try"),
      buttonNames: [L("label_understand_risks"), L("label_close")],
      cancel: 1
    });
    dialog.id = "disclaimerAlert";
    dialog.accessibilityLabel = "disclaimerAlert";
    dialog.addEventListener("click", function (e) {
      if (e.index != e.source.cancel) {

        var dialog = globals.util.createDialog({
          title: L("label_warning"),
          message: L("label_which_chain"),
          buttonNames: [L("label_testnet"), L("label_close"), L("label_mainnet")],
          cancel: 1
        });
        dialog.addEventListener("click", function (e) {
          globals.console.log(e.index + " " + e.source.cancel);

          if (e.index != e.source.cancel) {

            if (e.index == 0) {
              Alloy.Globals.network = "testnet";

            }
            else if (e.index == 2) {
              Alloy.Globals.network = "mainnet";
            }

            Ti.App.Properties.setString("lndMobileNetwork", Alloy.Globals.network);

            globals.console.log("network", Alloy.Globals.network);
            callback();

          }

        });
        dialog.show();


      }

    });
    dialog.show();
    return;
  }


  self.saveAndContinue = function (createWallet, callback) {
    globals.nativeCrypto.createUserKey(function (success, userKey) {
      if (success) {
        globals.userKey = userKey;


        Alloy.createController("components/pincode_screen", {
          "type": "set",
          "callback": function (number) {

            globals.passCodeHash = number;

            var encryptedPasscodeHash = globals.cryptoJS.AES.encrypt(globals.passCodeHash, globals.userKey).toString();
            globals.encryptedPassphrase = encryptedPasscodeHash;
            Ti.App.Properties.setString("passcode", encryptedPasscodeHash);
            globals.unlocked = true;

            var encrypted = globals.cryptoJS.AES.encrypt(globals.decryptedPassphrase, globals.userKey).toString();
            globals.console.log("encrypted passphrase", encrypted);
            Ti.App.Properties.setString("passphrase", encrypted);


            globals.console.log("decrypted passphrase", globals.decryptedPassphrase);
            var seedArray = globals.decryptedPassphrase.split(",");

            if (!createWallet) {
              callback();
              return;
            }
            globals.lnGRPC.createWallet(globals.createPassword(globals.passCodeHash), seedArray, "", function (error, response) {
              globals.console.log("create wallet", error);
              globals.console.log("create wallet", response);
              if (error == true) {
                alert(response);
                return;
              }

              if (globals.savePassphrase(globals.decryptedPassphrase, globals.userKey)) {

                globals.console.log("setting lnd mobile");

                Ti.App.Properties.setString("mode", "lndMobile");
                Ti.App.Properties.setBool("has_wallet_" + Alloy.Globals.network, true);

                globals.alreadyUnlocked = true; //because we created a new wallet so no need to unlock

                globals.console.log("closing sign");

                callback();

              }

            });



          },
          "cancel": function () { }
        }).getView().open();

      } else {

        alert("error creating user key");

        return;
      }
    });
  }

  self.loadStartUpInfo = function (callback) {

    if (globals.useBackUp == true || Ti.App.Properties.getBool("useAlternativeAPI", false) == true) {

      globals.console.log("using back up api");

      var backUpPublicKey = Ti.App.Properties.getString("altPublicKeyTestnet", "")
      var backUpPeer = Ti.App.Properties.getString("altPeerTestnet", "")
      var feeUrl = Ti.App.Properties.getString("altFeeUrlTestnet", "");
      var blockHeightAPI = Ti.App.Properties.getString("altBlockHeightAPITestnet", "");
      if (Alloy.Globals.network == "mainnet") {
        blockHeightAPI = Ti.App.Properties.getString("altBlockHeightAPIMainnet", "");
        backUpPublicKey = Ti.App.Properties.getString("altPublicKeyMainnet", "")
        backUpPeer = Ti.App.Properties.getString("altPeerMainnet", "")
        feeUrl = Ti.App.Properties.getString("altFeeUrlMainnet", "");
      }


      var xhr = Ti.Network.createHTTPClient();

      xhr.open("GET", blockHeightAPI);

      xhr.onload = function () {

        var res = JSON.parse(this.responseText);

        globals.console.log("backup blockheight api", res);

        let backUpData = {
          publicKey: backUpPublicKey,
          ipAddress: backUpPeer,
          port: "18333",
          network: Alloy.Globals.network,
          feeUrl: feeUrl,
          blockHeight: res.height,
          rateOfBtc: {}
        }
        setData(JSON.stringify(backUpData));


      },
        xhr.onerror = function (e) {
          alert("error geting blockheight, please check the url set in app properties")
        };
      xhr.send();
      xhr.timeout = 10000;

      return;
    }

    function setData(data) {

      globals.console.log("setting data", data);
      var res = null;

      try {
        res = JSON.parse(data);
      }
      catch (e) {
        globals.console.error(e);
        Ti.App.Properties.removeProperty("cache_node_info_" + globals.cacheVersion);
        callback(true, "parse error");
        return;
      }

      globals.neutrinoUri = res.ipAddress + ":" + res.port;
      globals.hubUri = res.publicKey + "@" + res.ipAddress
      if (res.blockHeight != undefined) {
        globals.blockHeight[Alloy.Globals.network] = res.blockHeight;
      }
      globals.console.log("node info is", globals.hubUri + " " + globals.neutrinoUri);

      globals.rates = res.rateOfBtc;

      let currentCode = globals.getCurrency()
      globals.console.log("currentCode", currentCode)

      globals.fiatPrice.last = globals.rates[currentCode.toLowerCase()];

      globals.fiatPrice.symbol = Ti.Locale.getCurrencySymbol(currentCode);

      if (currentCode == "USD") {
        globals.fiatPrice.symbol = globals.fiatPrice.symbol.replace("US", "");
      }
      globals.console.log("current symbol is", globals.fiatPrice.symbol);

      if (globals.fiatPrice.symbol == undefined) {
        globals.fiatPrice.symbol = currency;
      }

      globals.console.log("current symbol is", globals.fiatPrice.symbol);

      callback(false, "");
    }

    var dontCallback = false;
    var url = Alloy.CFG.apiURLMainnet;

    if (Alloy.Globals.network == "testnet") {
      url = Alloy.CFG.apiURLTestnet;
    }

    url = url + "nodeInfo";


    let cachedData = Ti.App.Properties.getString("cache_node_info_" + globals.cacheVersion, undefined);
    if (cachedData != undefined && globals.cacheOn) {

      setData(cachedData);
      globals.console.log("loaded node info from cache");
      dontCallback = true;

    }

    var xhr = Ti.Network.createHTTPClient();

    globals.console.log("network is", Alloy.Globals.network);
    globals.console.log("url is", url);
    xhr.open("GET", url);

    xhr.onload = function () {

      globals.console.log("updating start up cache", this.responseText);

      Ti.App.Properties.setString("cache_node_info_" + globals.cacheVersion, this.responseText);


      if (!dontCallback) {
        setData(this.responseText);
      }


    },
      xhr.onerror = function (e) {
        Ti.App.Properties.removeProperty("cache_node_info_" + globals.cacheVersion);
        globals.console.error("error is", e);
        if (!dontCallback) {
          callback(true, e.error);
        }

      };
    xhr.send();
    xhr.timeout = 10000;
  }

  self.getAndroidPreferences = function (key, defaultVal) {

    let Activity = require('android.app.Activity');

    let PreferenceManager = require('android.preference.PreferenceManager');

    let activity = new Activity(Ti.Android.currentActivity);

    let appContext = activity.getApplicationContext();

    let sharedPref = PreferenceManager.getDefaultSharedPreferences(appContext);

    let intentData = sharedPref.getString(key, defaultVal);

    return intentData;

  }

  self.getRPCPassword = function () {

    return
  }

  self.addTower = function () {
    globals.lnGRPC.listTowers(function (error, response) {

      globals.console.log("list towers", response);


    });

    globals.lnGRPC.getTowerInfo(globals.hubUri, function (error, response) {

      globals.console.log("getTowerInfo", response);


    });
    globals.lnGRPC.addTower(globals.hubUri, function (error, response) {

      if (error == true) {
        alert(L("error_loading").format({ "message": response }))

        return;
      }

      globals.console.log("added tower", response);

    });

  }

  self.isInitialSync = function () {

    if (Ti.App.Properties.getString("mode", "") == "lndMobile") {
      if (Ti.App.Properties.getBool("did_sync_once_" + Alloy.Globals.network, false) == false) {
        return !globals.synced;
      }
    }
    return false;
  }

  self.checkHashes = function () {
    if (Ti.App.Properties.getInt("useBitcoinCore_" + Alloy.Globals.network, 0) == 0) {
      if (globals.fullNodeController != undefined) {
        globals.lnGRPC.getInfo("", function (error, response) {
          if (error == false) {
            globals.fullNodeController.checkBlocksAreValid(response);
          }
        });
      }
    }
  }

  self.continuePay = function (req) {
    globals.console.log("req", req);

    if (
      req.toLowerCase().startsWith("lnurl") ||
      req.toLowerCase().startsWith("lightning:lnurl")
    ) {
      req = req.replace("lightning:", "");
      req = req.replace("LIGHTNING:", "");

      globals.console.log("lnurl", req);

      try {
        const bech32 = require("vendor/util/bech32");

        const dec = bech32.decode(req, 30000);

        const bytes = globals.bitcoin.bitcoin.buffer.from(
          bech32.fromWords(dec.words)
        );

        const url = bytes.toString("utf8");

        globals.console.log("url", url);
        var requestResult = null;
        var callbackUrl = "";
        Alloy.createController("confirmation_screen", {
          showLoading: true,
          message: "",
          cancel: function () { },
          first: function (controller, errorCallback) {
            var xhr = Ti.Network.createHTTPClient({
              onload: function (e) {
                globals.console.log("response data", this.responseText);
                requestResult = JSON.parse(this.responseText);

                callbackUrl =
                  requestResult.callback +
                  "?k1=" +
                  requestResult.k1 +
                  "&remoteid=" +
                  globals.currentPubkey +
                  "&private=1";

                globals.console.log("callback url", callbackUrl);

                if (requestResult.tag == "channelRequest") {
                  const message = L("channel_request").format({
                    uri: requestResult.callback,
                    capacity: requestResult.capacity,
                    push: requestResult.push
                  });

                  controller.setMessage(message);
                }
              },
              onerror: function (e) {
                globals.console.error(e.error);
                alert(e.error);
                errorCallback();
              },
              timeout: 5000 // milliseconds
            });

            xhr.open("GET", url);
            xhr.send();
          },
          task: function (callback, errorCallback) {
            globals.lnGRPC.connectPeer(
              requestResult.uri,

              function (error, res) {
                globals.console.log("res", res);
                globals.console.log("error", error);
                var peerAlreadyAdded = false;

                if ((res + "").indexOf("already connected") != -1) {
                  peerAlreadyAdded = true;
                }

                if (error == 1) {
                  error = true;
                }

                if (error == true && peerAlreadyAdded == false) {
                  errorCallback();
                  return;
                }

                globals.console.log("requesting channel", callbackUrl);

                const xhr = Ti.Network.createHTTPClient({
                  onload: function (e) {
                    globals.console.log("response data", this.responseText);

                    callback();
                  },
                  onerror: function (e) {
                    globals.console.error(e.error);
                    errorCallback();
                    alert(e.error);
                  },
                  timeout: 8000 // milliseconds
                });

                xhr.open("GET", callbackUrl);
                xhr.send();
              }
            );
          },
          confirm: function () { }
        });
      } catch (e) {
        globals.console.error(e);
        alert(e);
      }

      return;
    }

    if (req.indexOf("bitcoin:") != -1) {
      const decodedURI = globals.bitcoin.decodeBip21(req);

      if (decodedURI.address != undefined) {
        try {
          Alloy.createController("withdraw", {
            destination: decodedURI.address,
            amount: decodedURI.amount
          })
            .getView()
            .open();
        } catch (e) {
          globals.console.error(e);
        }
      }
      return;
    }

    if (globals.bitcoin.validateAddress(req, Alloy.Globals.network) == true) {
      Alloy.createController("withdraw", {
        destination: req
      })
        .getView()
        .open();
      return;
    }

    if (req.indexOf("lightning:") != -1) {
      req = req.replace("lightning:", "");
    }

    if (req.indexOf("LIGHTNING:") != -1) {
      req = req.replace("LIGHTNING:", "");
    }

    globals.lnGRPC.decodePayReq(req, function (error, res) {
      if (error == true) {
        alert(res);
        return;
      }

      globals.console.log(res.payment_hash);

      if (res.payment_hash != undefined) {
        const rhash = res.payment_hash;

        globals.console.log(res);
        var memo = null;

        if (res.description != undefined) {
          memo = res.description;
        }

        if (globals.bitcoin.checkExpired(res)) {
          alert(L("text_payment_expired"));
          return;
        }

        var urlName = "";

        if (urlName.length > 10) {
          urlName = urlName.substr(0, 10) + "...";
        }
        var needsAmount = false;

        if (res.num_satoshis == 0) {
          res.num_satoshis = undefined;
        }

        var message = L("text_request_pay_ln").format({
          url: urlName,
          value: res.num_satoshis
        });
        if (res.num_satoshis == undefined) {
          message = L("text_request_pay_ln_no_amount").format({
            url: urlName
          });
        }
        if (memo != null) {
          message = L("text_request_pay_ln_memo").format({
            url: urlName,
            memo: memo,
            value: res.num_satoshis
          });
          if (res.num_satoshis == undefined) {
            message = L("text_request_pay_ln_memo_no_amount").format({
              url: urlName,
              memo: memo
            });
          }
        }
        if (res.num_satoshis == undefined) {
          needsAmount = true;
        }
        Alloy.createController("transaction_conf", {
          small: true,
          message: message,
          payReq: req,
          needsAmount: needsAmount,
          cancel: function () {

          },
          confirm: function () {
            globals.console.log("setting memo", rhash + " " + memo);
            Ti.App.Properties.setString("memo_" + rhash, memo);

            globals.loadMainScreen();

          }
        });
      }
    });
  }

  self.setTestnet = function () {
    globals.console.log("setting testnet");
    Alloy.Globals.network = "testnet";
    globals.LNCurrency = "tBTC";
    globals.LNCurrencySat = "tSat";
  };

  self.setMainnet = function () {
    globals.console.log("setting mainnet");
    Alloy.Globals.network = "mainnet";
    globals.LNCurrency = "BTC";
    globals.LNCurrencySat = "sat";
  };

  self.tryAndBackUpChannels = function () {
    if (
      Ti.App.Properties.getString("google_drive_linked", undefined) != undefined
    ) {
      if (globals.synced == true) {
        globals.console.log("attempting to back up channels");
        globals.util.backUpChannels(function (error, response) { });
      }
    }
  };

  if (OS_ANDROID) {
    globals.webSocketStarted = false;
    var websocket = require("com.indiesquare.websocket.websocket");
    websocket = new websocket(activity);


    self.initDebugLog = function () { //for debug only 

      var webSocketUrl = Ti.App.Properties.getString("logUrl", "none")
        globals.console.log("starting websocket",webSocketUrl);
        var CallbackInterfaceWebSocket = require("com.indiesquare.websocket.CallbackInterface");
        websocket.connect(webSocketUrl, new CallbackInterfaceWebSocket({
          eventFired: function (error, res) {
            globals.console.log("websocket error", error);
            globals.console.log("websocket res", res);
            if(error == null){
              globals.webSocketStarted = true;
              if(res == "disconnected"){
                globals.webSocketStarted = false;
              }
            }else{
              globals.webSocketStarted = false;
            }
          }
        }));
  
    }


    self.sendLog = function (logType,data) {

      if(globals.webSocketStarted == false){
        return;
      }
      websocket.sendMessage(JSON.stringify({logType:data}));

    };

  }

  return self;
}());