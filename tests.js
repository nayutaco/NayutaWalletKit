"use strict";

var wd = require("wd");
var ext = "" //android needs an extra . appended to ids in appium WD
var android = false;
if (process.env.PLATFORM == "android") {
  ext = ".";
  android = true;
}

var capabilities = {
  browserName: '',
  platformName: 'Android',
  avd: "test",
  deviceName: 'test',
  app: process.cwd() + "/build/android/bin/Nayuta.apk",
  automationName: "UiAutomator2",
  "appActivity": ".NayutaActivity",
  "appPackage": "co.nayuta.wallet"
};

if (process.env.ENVIRONMENT != "travis") {
  capabilities.deviceName = "iPhone 11 Pro Max";
  capabilities.avd = "Pixel_2_API_28"
}

if (process.env.PLATFORM == "ios") {
  capabilities = {
    "platformName": "ios",
    "platformVersion": '12.0',
    "deviceName": 'iPhone X',
    "app": process.cwd() + "/build/iphone/build/Products/Debug-iphonesimulator/Nayuta.app",
    "automationName": "XCUITest",
    "useNewWDA": false,
    "noReset": true,
    "showXcodeLog": false,
  };

  if (process.env.ENVIRONMENT != "travis") {
    capabilities.deviceName = "iPhone 11 Pro Max";
    capabilities.platformVersion = "13.0"

  }

}


describe("Nayuta Test", function () {
  this.timeout(100000000);
  var driver;
  var allPassed = true;

  before(function () {
    var serverConfig = {
      host: 'localhost',
      port: 4723
    };

    driver = wd.promiseChainRemote(serverConfig);

    return driver.init(capabilities);
  });

  after(function () {
    return driver
      .quit()
      .finally(function () {
        if (process.env.npm_package_config_sauce) {
          return driver.sauceJobStatus(allPassed);
        }
      });
  });

  afterEach(function () {
    allPassed = allPassed && this.currentTest.state === 'passed';
  });


  function waitForElement(name) {

    return new Promise(function (resolve, reject) {
      function checkIfExists() {

        driver.
          elementByAccessibilityIdIfExists(name, function (err, cb) {

            if (cb == undefined) {


              driver.
                elementByAccessibilityIdIfExists("errorMessage" + ext, function (err, cb) {
                  console.log("cb", cb);
                  console.log("err", err);
                  if (cb != undefined) {
                    console.log(cb);
                    console.error("found error");
                    throw "error";
                  } else {
                    setTimeout(checkIfExists, 5000);
                  }
                });


            } else {
              console.log("resolve");
              resolve();
            }
          });

      }

      checkIfExists();


    })


  }
  it("Should Press Create New Wallet", async function () {
    var name = 'Create New Wallet' + ext;
    await waitForElement(name);

    return driver.
      elementByAccessibilityId(name)
      .click().sleep(5000);

  });

  it("Should Accept Disclaimer", async function () {

    if (android) {
      return driver.acceptAlert().sleep(5000);
    } else {
      return driver.dismissAlert().sleep(5000)
    }
  });

  it("Should Press Testnet", async function () {

    if (android) {
      return driver.acceptAlert()
    } else {
      return driver.dismissAlert()
    }

  });

  it("Should Skip Auto Pilot", async function () {

    var name = 'Skip Auto Pilot' + ext;

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()

  });

  async function logs() {
    const logs = await driver.log('logcat');
    for (var i = 0; i < logs.length; i++) {
      var aLog = logs[i];
      try {
        if (aLog.message.indexOf("I appium  :") == -1) {
          console.log(aLog.message);
        }
      } catch (e) {
        console.log(e);
      }


    }
  }

  it("Should Press Next 1", async function () {

    var name = 'Passphrase Next 1' + ext;
    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()

  });


  it("Should Press Next 2", async function () {
    logs();
    var name = 'Passphrase Next 2' + ext;

    await waitForElement(name);

    return driver.
      elementByAccessibilityId(name)
      .click()

  });

  it("Should Press Next 3", async function () {
    var name = 'Passphrase Next 3' + ext;

    await waitForElement(name);

    return driver.
      elementByAccessibilityId(name)
      .click()

  });


  it("Should Press Next 4", async function () {
    var name = 'Passphrase Next 4' + ext

    await waitForElement(name);

    return driver.
      elementByAccessibilityId(name)
      .click()

  });


  it("Should Press Skip Dev", async function () {
    var name = 'Skip Dev' + ext

    await waitForElement(name);

    return driver.
      elementByAccessibilityId(name)
      .click()

  });


  it("Should Press Key Pad 1", async function () {

    var name = 'keypad1' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });


  it("Should Press Key Pad 2", async function () {

    var name = 'keypad2' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });


  it("Should Press Key Pad 3", async function () {

    var name = 'keypad3' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });


  it("Should Press Key Pad 4", async function () {

    var name = 'keypad4' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });

  it("Should Press Key Pad 5", async function () {
    var name = 'keypad5' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });


  it("Should Press Key Pad 6", async function () {

    var name = 'keypad6' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });


  it("Should Press Key Pad 1", async function () {
    var name = 'keypad1' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });


  it("Should Press Key Pad 2", async function () {

    var name = 'keypad2' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });


  it("Should Press Key Pad 3", async function () {

    var name = 'keypad3' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });


  it("Should Press Key Pad 4", async function () {

    var name = 'keypad4' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });

  it("Should Press Key Pad 5", async function () {

    var name = 'keypad5' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()


  });


  it("Should Press Key Pad 6", async function () {

    var name = 'keypad6' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()

  });


  it("Should Press Link Later", async function () {

    var name = 'link later' + ext

    await waitForElement(name);
    return driver.
      elementByAccessibilityId(name)
      .click()

  });


});