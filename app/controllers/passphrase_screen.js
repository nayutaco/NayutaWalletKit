var args = arguments[0] || {};

console.log("page did load");

if (args.passphrase != undefined) {
  $.loadingSpinner.hide();
  setUI(args.passphrase);
} else {

console.log("creating wallet");
  $.loadingSpinner.show();
  $.scrollView.hide(); 
  createWallet(); 
}

if (args.viewMode == true) {
  scrollToPage2();
}

function scrollToPage2() {
  $.scrollView.scrollToView($.page2);
}

$.firstButton.onClick(scrollToPage2);
 

function scrollToPage3() {
  $.scrollView.scrollToView($.page3);
}
$.secondButton.onClick(scrollToPage3);

function scrollToPage4() {
  $.scrollView.scrollToView($.page4);
}

$.goTo2Button.onClick(scrollToPage2);

$.goTo4Button.onClick(scrollToPage4);

$.goTo3Button.onClick(scrollToPage3);

$.goToTestButton.onClick(scrollToTestPage);

$.lastButton.onClick(scrollToPage4);

 function didLoad(){

 console.log("page did really load");
 }


var word1 = "";
var word2 = "";
var word3 = "";

function scrollToTestPage() {
  if (args.viewMode == true) {
    $.win.close();
    return;
  }

  $.testWordField1.value = "";

  $.testWordField2.value = "";

  $.testWordField3.value = "";

  var testPhraseWords = args.passphrase;

  function setRandomWord(labelLeft, labelRight) {
    var index = Math.floor(Math.random() * testPhraseWords.length);
    if (index == 0) {
      labelLeft.text = "";
      labelRight.text = testPhraseWords[index + 1];
    } else if (index == 23) {
      labelLeft.text = testPhraseWords[index - 1];
      labelRight.text = "";
    } else {
      labelLeft.text = testPhraseWords[index - 1];
      labelRight.text = testPhraseWords[index + 1];
    }
    return testPhraseWords[index];
  }

  word1 = setRandomWord($.testWord1, $.testWord2);

  word2 = setRandomWord($.testWord3, $.testWord4);
  while (word2 == word1) {
    word2 = setRandomWord($.testWord3, $.testWord4);
  }

  word3 = setRandomWord($.testWord5, $.testWord6);
  while (word3 == word1 || word3 == word2) {
    word3 = setRandomWord($.testWord5, $.testWord6);
  }

  $.scrollView.scrollToView($.testPage);
}

var successColor = "#8ce58c";

function checkWord1() {
  if ($.testWordField1.value == word1) {
    $.testWordField1.backgroundColor = successColor;
  } else {
    $.testWordField1.backgroundColor = "transparent";
  }

  checkAllCorrect();
}
function checkWord2() {
  if ($.testWordField2.value == word2) {
    $.testWordField2.backgroundColor = successColor;
  } else {
    $.testWordField2.backgroundColor = "transparent";
  }

  checkAllCorrect();
}
function checkWord3() {
  if ($.testWordField3.value == word3) {
    $.testWordField3.backgroundColor = successColor;
  } else {
    $.testWordField3.backgroundColor = "transparent";
  }

  checkAllCorrect();
}

function checkAllCorrect() {
  if (
    $.testWordField1.value == word1 &&
    $.testWordField2.value == word2 &&
    $.testWordField3.value == word3
  ) {
    continueNext();
  }
}

if (Alloy.CFG.isDevelopment != true) {
  $.skip.hide();
}

function continueNext() { 
    $.lastButton.hide();
    const createWallet = true;
    globals.util.saveAndContinue(createWallet, function() {
      Alloy.createController("components/google_drive_link", {
        fromIntro: true,
        fromAccounts: args.fromAccounts,
        callback: args.callback
      })
        .getView()
        .open();

      if (args.fromAccounts) {
        $.win.close();
      }
    }); 
}

function skip() {
  continueNext();
}

if (OS_ANDROID) {
  $.win.addEventListener("android:back", function() {
    globals.console.log("pressed back");
    return true;
  });
}

function setUI(passphrase) {
  $.word1.text = "1. " + passphrase[0];
  $.word2.text = "2. " + passphrase[1];
  $.word3.text = "3. " + passphrase[2];
  $.word4.text = "4. " + passphrase[3];
  $.word5.text = "5. " + passphrase[4];
  $.word6.text = "6. " + passphrase[5];
  $.word7.text = "7. " + passphrase[6];
  $.word8.text = "8. " + passphrase[7];
  $.word9.text = "9. " + passphrase[8];
  $.word10.text = "10. " + passphrase[9];
  $.word11.text = "11. " + passphrase[10];
  $.word12.text = "12. " + passphrase[11];
  $.word13.text = "13. " + passphrase[12];
  $.word14.text = "14. " + passphrase[13];
  $.word15.text = "15. " + passphrase[14];
  $.word16.text = "16. " + passphrase[15];
  $.word17.text = "17. " + passphrase[16];
  $.word18.text = "18. " + passphrase[17];
  $.word19.text = "19. " + passphrase[18];
  $.word20.text = "20. " + passphrase[19];
  $.word21.text = "21. " + passphrase[20];
  $.word22.text = "22. " + passphrase[21];
  $.word23.text = "23. " + passphrase[22];
  $.word24.text = "24. " + passphrase[23];
}

function createWallet() {
  globals.lnGRPC.startLNDMobile(function(error, response) {
    globals.console.log("lndMobile1", error);
    globals.console.log("lndMobile1", response);

    if (error == true) { 
      alert(response);
      return;
    }
    
    globals.lnGRPC.generateSeed(function(error, response) {
      globals.console.log("generateSeed", response);
      if (error == true) {
        alert(response);
        return;
      }

      if (response.cipherSeedMnemonic != undefined) {
        $.loadingSpinner.hide();
        $.scrollView.show();

        globals.decryptedPassphrase = response.cipherSeedMnemonic.join();

        args.passphrase = response.cipherSeedMnemonic;

        setUI(response.cipherSeedMnemonic);
      } else {
        alert("error creating passphrase");
        return;
      }
    });
  });
}
