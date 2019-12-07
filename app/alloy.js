// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

Alloy.Globals = { 
  copyright: '© 2019 Nayuta',
  defaultExpiry :10,
  recoveryWindow :250, 
  slowFee:100,
  medFee:5,
  fastFee:2,
  feeLimitPercentage:20,
  defaultFeeLimit:-1,
  cacheVersion:"V2",
  cacheOn:true, // cache start up requests
  logLevel:Ti.App.Properties.getString("logLevel", "none"),
  enableLiveView:false, // set this to enable liveview by not loading hyperloop modules (which break live view
  useBackUpAPI:false
};

Alloy.Globals.accountsKey = "AccountsV1";

function isiPhoneX() {
  return (Ti.Platform.displayCaps.platformWidth === 375 && Ti.Platform.displayCaps.platformHeight == 812) || // Portrait
    (Ti.Platform.displayCaps.platformHeight === 812 && Ti.Platform.displayCaps.platformWidth == 375); // Landscape
}

function isSmallScreen() {

  if (Ti.Platform.displayCaps.platformHeight < 570) {

    return true;
  }
  return false;
}

Alloy.Globals.isiPhoneX = isiPhoneX();

Alloy.Globals.isSmallScreen = isSmallScreen();

Alloy.Globals.isAndroid = (OS_ANDROID);

Alloy.Globals.nayutaDark = "#454647";
Alloy.Globals.mainColor = "#bfbfc6";
Alloy.Globals.mainColorDarker = "#6ea18f";

Alloy.Globals.mainColorLighter = "#aeccc4";

Alloy.Globals.cancelColor = "#ba6464";

Alloy.Globals.currentBarImage = "/images/gradientIndiePink.jpg";
Alloy.Globals.currentMenuButton = "/images/menuButton.png";
Alloy.Globals.currentMenuButtonClose = "/images/menuButtonClose.png";
Alloy.Globals.tabBarHeight = 40;
Alloy.Globals.topBarHeight = 60;
Alloy.Globals.bottomButtonPos = 20;
Alloy.Globals.statusBarSize = 20;
Alloy.Globals.windowColor = "white";
if (Alloy.Globals.isiPhoneX) {
  Alloy.Globals.tabBarHeight = 52;
  Alloy.Globals.topBarHeight = 75;

  Alloy.Globals.bottomButtonPos = 45;
}
if (OS_ANDROID) {
  Alloy.Globals.topBarHeight = 60;
  Alloy.Globals.bottomButtonPos = 40;

  Alloy.Globals.statusBarSize = 0;
}

Alloy.Globals.fontColor1 = "#414141";
Alloy.Globals.btclnTopBarHeight = 200;
Alloy.Globals.btclnTopHeight = Alloy.Globals.btclnTopBarHeight;
Alloy.Globals.btclnAddressBarTop = 30;
Alloy.Globals.lightFont = 'GillSans-light';
Alloy.Globals.boldFont = 'GillSans-bold';
Alloy.Globals.normalFont = 'GillSans';

Alloy.Globals.lightFontItalic = 'GillSans-Light Italic';
Alloy.Globals.greenColor = "#56a840";
Alloy.Globals.confirmColor = "#7ab992";
Alloy.Globals.dappBarTop = 0;
Alloy.Globals.infoTop = 20;
Alloy.Globals.dappBarHeight = 42;

if (OS_IOS) {
  Alloy.Globals.dappBarTop = 20;
  Alloy.Globals.infoTop = 30;

}

if (Alloy.Globals.isiPhoneX) {
  Alloy.Globals.dappBarTop = 52;
  Alloy.Globals.dappBarHeight = 35;
  Alloy.Globals.infoTop = 35;
}

Alloy.Globals.buttonFont = {
  fontFamily: "Gil sans",
  fontSize: 13
}
Alloy.Globals.network = "mainnet";
Alloy.Globals.bootstrap = false;

Alloy.Globals.getFixedPassword = function () {
  var result = "";
  var codeArray = Alloy.Globals.passwordBytes;
  for (var i = 0; i < codeArray.length; i++) {
    var aCode = codeArray[i];
    aCode = aCode / 736;
    var res = String.fromCharCode(aCode);
    result += res;

  }
  return result;
};

// color
Alloy.Globals.themeColor = "#383D3F";
Alloy.Globals.dangerColor = "#C51616";
Alloy.Globals.infoColor = "#0099E5";

// font
Alloy.Globals.mediumFont = {
  fontFamily: Alloy.Globals.normalFont,
  fontSize: 20
};
Alloy.Globals.bodyFont = {
  fontFamily: Alloy.Globals.normalFont,
  fontSize: 16
};
Alloy.Globals.subTitleFont = {
  fontFamily: Alloy.Globals.normalFont,
  fontSize: 14
};

// top
Alloy.Globals.headerTop = 35;
Alloy.Globals.headerTopIphoneX = 55;

// right
Alloy.Globals.headerRight = 20;

// left
Alloy.Globals.headerLeft = 20;
