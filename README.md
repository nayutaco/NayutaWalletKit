# NayutaWalletKit

[![Build Status](https://travis-ci.org/NayutaWalletKit/NayutaWalletKit.svg?branch=master)](https://travis-ci.org/NayutaWalletKit/NayutaWalletKit)

Developed using Appcelerator Titanium Alloy SDK with custom native iOS and Java libraries.

Alloy allows app development in Javascript which can cross compile into iOS and Android mobile applications.

With Alloy/Titanium UI is native however any controller functions are run as javascript in a javascript engine which has performance and security (due to errors) implications.
Therefore any controller functions are kept to a minimum with the important functions being coded natively in respective iOS and Java frameworks that are then imported into the Alloy application, the benefit being we can experience native performance and security whilst at the same time having a shared code base for UI and light controller functions for easier development.

# Getting Started

You will need to install the Appcelerator tool kit which can be done by following the instructions here
https://wiki.appcelerator.org/display/guides2/Titanium+SDK+Getting+Started

You will then need to add your own tiapp.xml you can use the SAMPLE_tiapp.xml as a basis and add your own GUID, opening and building the project in Appcelerator Studio should add this for you.

All the native libraries can be found in the app/platform folder apart from the Lndmobile.framework and lndmobile.aar which can be built from LND using gomobile
Source Code:https://github.com/lightningnetwork/lnd/

you need to make sure the correct build flags are set in the Makefile and then run ```make ios``` ```make android```

```

ios: vendor mobile-rpc
	@$(call print, "Building iOS framework ($(IOS_BUILD)).")
	mkdir -p $(IOS_BUILD_DIR)
	$(GOMOBILE_BIN) bind -target=ios -tags="ios $(DEV_TAGS) autopilotrpc experimental  wtclientrpc" $(LDFLAGS) -v -o $(IOS_BUILD) $(MOBILE_PKG)

android: vendor mobile-rpc
	@$(call print, "Building Android library ($(ANDROID_BUILD)).")
	mkdir -p $(ANDROID_BUILD_DIR)
	$(GOMOBILE_BIN) bind -target=android -tags="android $(DEV_TAGS) autopilotrpc experimental  wtclientrpc" $(LDFLAGS) -v -o $(ANDROID_BUILD) $(MOBILE_PKG)


```

The lndmobile libraries need to be placed in the respective folders under app/platform/android, app/platform/ios

You will also need to add a file called passwordStatic.js in app/lib/vendor and add a custom byte array for the password, this password is not needed but is appended to the users pincode hash to add an extra level of obsfucation to data stored in the app, it is a byte array as these are generally stored more randomly in memory
module.exports = (function () {
	//used to obfuscate the key in build as int arrays are not stored in plain text
	Alloy.Globals.passwordBytes = [/*add bytes here*/];
}());

# Build libraries from source

for ios make sure the following repos exist in the same directory as nayuta/, i.e. Projects->nayuta, Projects->ioscrypto

ioscrypto.framework
https://github.com/mandelmonkey/ioscrypto

web3.framework
https://github.com/mandelmonkey/web3iOSWebView

lnGRPCWrapper.framework
https://github.com/mandelmonkey/lnGRPCWrapper

then run ```./CreateFrameworks``` from inside the nayuta/ root directory

this should build the ios libraries and place them inside app/platform/ios as well as building lndmobile.aar and placing it into app/platform/android 

for android the modules should already exist in app/platform/android

androidcrypto-release.aar
androidkeystore-release.aar
customwebview-release.aar
websocket-release.aar
https://github.com/mandelmonkey/AndroidModules
lngrpc-1.0.jar
https://github.com/mandelmonkey/android_lngrpc


# Tests

Current tests are done using Appium (installation instructions can be found at http://appium.io/ ), after you have installed appium you should be able to run them with the command ```PLATFORM=android mocha tests.js``` or ```PLATFORM=ios mocha tests.js``` however tests may fail if you do not have the correct iOS and android platforms available, you can update the platforms in the tests.js file i.e.
```
"platformVersion": '12.0',
"deviceName": 'iPhone X',
```

# Caveats

Development with Alloy can be slow as inorder to view changes to UI you must rebuild the project each time.
Alloy/Titanium does offer a live view option however this does not seem to work if native libraries are loaded.
The project contains and override function which will not load native libraries and instead use dummy data, this allows the use of liveview and thus quicker development
particularly when working on UI.
The override can be enabled by setting ```globals.enableLiveView = true``` in index.js


# Lndmobile

When updating lndmobile on ios for some reason you have to repalce the framework in platform/ios/ and replace the lndmobile framework in the lnGRPCWrapper project rebuild and add the new lnGRPCWrapper.framework
 
# Logging

On iOS building with titanium results in not being able to view logs from modules such as lndmobile
inorder to see these logs it is best to build the module with titanium appc ti build then open the built xcode project and run from xcode, you may need to 
open Xcode's preferences and go to the "Locations" tab. Click the "Advanced" button under the "Derived Data" field. Set the build location to "Custom" and "Relative to Workspace". Lastly set the "Products" location to build/Products and the "Intermediates" location to build/Intermediates. Click "Done" and close the preferences dialog. You only need to do this once.

# Google Drive

Goolge drive linking won't work as you would need to register the app your self on google cloud console and included the various configs, api keys etc


# Attributes
 "https://www.freepik.com/free-photos-vectors/business" - Business vector created by freepik - www.freepik.com
 "https://www.freepik.com/free-photos-vectors/background" - Background vector created by pikisuperstar - www.freepik.com
 
# License

The source code of NayutaWalletKit can be freely modified and redistributed under the [Apache License, Version 2.0](https://github.com/NayutaWalletKit/NayutaWalletKit/blob/master/LICENSE), excluding Nayuta (our name), Nayuta Wallet (the app name), Nayuta logo and trademark.

a
