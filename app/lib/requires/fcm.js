module.exports = (function () {
  var self = {};

  var util = require("requires/util");
  var network = require("requires/network");

  self.start = function (callback) {
    var deviceToken = null;

    function receivePush(e) {
      try {
        var message;
        if (OS_IOS) message = e.data.aps.alert;
        else message = e.message;

        util.createDialog({
          "message": message,
          "buttonNames": [L("label_close")]
        }).show();
      } catch (e) {
        globals.console.log("Push receive error.");
      }
    }

    function deviceTokenSuccess(e) {
      deviceToken = e.deviceToken;

    }

    function deviceTokenError(e) {
      globals.console.log("Failed to register for push notifications! " + e.error);
      callback(false);
    }

    if (OS_IOS) {
      if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
        Ti.App.iOS.addEventListener("usernotificationsettings", function registerForPush() {
          Ti.App.iOS.removeEventListener("usernotificationsettings", registerForPush);
          Ti.Network.registerForPushNotifications({
            "success": deviceTokenSuccess,
            "error": deviceTokenError,
            "callback": receivePush
          });
        });
        Ti.App.iOS.registerUserNotificationSettings({
          "types": [
            Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
            Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
            Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
          ]
        });

      } else {
        Ti.Network.registerForPushNotifications({
          "types": [
            Ti.Network.NOTIFICATION_TYPE_BADGE,
            Ti.Network.NOTIFICATION_TYPE_ALERT,
            Ti.Network.NOTIFICATION_TYPE_SOUND
          ],
          "success": deviceTokenSuccess,
          "error": deviceTokenError,
          "callback": receivePush
        });
      }
    }
  };

  return self;
}());