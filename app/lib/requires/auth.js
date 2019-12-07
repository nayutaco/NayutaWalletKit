module.exports = (function () {
  var self = {};

  // You can set the authentication policy on iOS (biometric or passcode)
  // In this case, we also check for Touch ID vs Face ID for a more personalized UI

  if (OS_IOS) {
    if (globals.identity.biometryType == globals.identity.BIOMETRY_TYPE_FACE_ID) {
      authPhrase = 'Face ID';
    } else if (globals.identity.biometryType == globals.identity.BIOMETRY_TYPE_TOUCH_ID) {
      authPhrase = 'Touch ID';
    } else {
      authPhrase = '(None available)';
    }
    globals.identity.setAuthenticationPolicy(globals.identity.AUTHENTICATION_POLICY_BIOMETRICS); // or: AUTHENTICATION_POLICY_PASSCODE
  }

  self.REASON_CANCEL = -1;
  self.REASON_EASY = 0;
  self.REASON_SECONDEPASSWORD = 1;
  self.REASON_PASSWORD = 2;
  self.REASON_TOUCHID = 3;

  self.check = function (params) {

    var type = "check";

    if(params.hideCancel == true){
      type = "checkNoCancel";
    }

    function input_passcode() {
      if (globals.passCodeHash != null) {
        globals.console.log("calling pincode");
        Alloy.createController("components/pincode_screen", {
          "type": type,
          "checkHash": globals.passCodeHash,
          "callback": function () {
            params.callback({
              success: true,
              reason: self.REASON_EASY,
            });


          },
          "cancel": function () {
            params.callback({
              success: false,
              reason: self.REASON_CANCEL
            });
          }
        }).getView().open();

      }
    }
    if (OS_IOS) {
      authenticate()
    }
    else {
      setTimeout(function () {
        authenticate()
      }, 500);
    }

    function authenticate() {
      var didShowPassCodeScreen = false;
      if (OS_ANDROID) {
        if (globals.identity.isSupported() && globals.identity.deviceCanAuthenticate().canAuthenticate) {
          Alloy.createController("components/component_touchid",{usePassCode:function(){
            globals.identity.invalidate();
          }}).getView().open();
        } else {
          input_passcode();
        }
      }

      globals.identity.authenticate({
        reason: L("label_fingerprint"),
        callback: function (e) {
          globals.console.log(e);
          if (globals.closeTouchID != undefined) {
            globals.closeTouchID();
          }
          globals.identity.invalidate();
          if (e.success) {
            params.callback({
              success: true,
              reason: self.REASON_TOUCHID
            });
          }
          else {

            if (e.code == globals.identity.ERROR_USER_CANCEL && globals.identity.ERROR_USER_CANCEL != undefined) {
              params.callback({
                success: false,
                reason: self.REASON_CANCEL
              });  
            }
            else {
              if (didShowPassCodeScreen == false) { //on android passcode shows more than once on error
                didShowPassCodeScreen = true;
                input_passcode();
              }
            }
          }
        }
      });

    }

  };

  return self;
}());