var aezeedWordList = [];

var didAlreadyLoad = false;
function didLoad() {
  if (didAlreadyLoad == true) {
    return;
  }

  didAlreadyLoad = true;

  var f = Ti.Filesystem.getFile(
    Ti.Filesystem.resourcesDirectory,
    "/scripts/aezeedWordList.txt"
  );

  aezeedWordList = f.read().text.split("\n");

  wordFieldsArray.push($.word1);
  wordFieldsArray.push($.word2);
  wordFieldsArray.push($.word3);
  wordFieldsArray.push($.word4);
  wordFieldsArray.push($.word5);
  wordFieldsArray.push($.word6);
  wordFieldsArray.push($.word7);
  wordFieldsArray.push($.word8);
  wordFieldsArray.push($.word9);
  wordFieldsArray.push($.word10);
  wordFieldsArray.push($.word11);
  wordFieldsArray.push($.word12);
  wordFieldsArray.push($.word13);
  wordFieldsArray.push($.word14);
  wordFieldsArray.push($.word15);
  wordFieldsArray.push($.word16);
  wordFieldsArray.push($.word17);
  wordFieldsArray.push($.word18);
  wordFieldsArray.push($.word19);
  wordFieldsArray.push($.word20);
  wordFieldsArray.push($.word21);
  wordFieldsArray.push($.word22);
  wordFieldsArray.push($.word23);
  wordFieldsArray.push($.word24);

  for (var i = 0; i < wordFieldsArray.length; i++) {
    wordFieldsArray[i].hintText = L("enter_word_hint_text").format({
      word: i + 1
    });
  }
}

var didShowTestnetWarning = false;
var isCreatingAccount = false;

function scrollToPage1() {
  $.scrollView.scrollToView($.page1);
}

function scrollToPage2() {
  $.scrollView.scrollToView($.page2);
}

$.recoverSeed.onClick(scrollToPage2);

$.linkNode.onClick(function() {
  Alloy.createController("link_node_screen")
    .getView()
    .open();
});

function scrollToPage3() {
  $.scrollView.scrollToView($.page3);
}
$.firstPageNext.onClick(scrollToPage3);

$.firstPageBack.onClick(scrollToPage1);

function scrollToPage4() {
  $.scrollView.scrollToView($.page4);
}

$.secondPageNext.onClick(scrollToPage4);

$.secondPageBack.onClick(scrollToPage2);

function firstButtonBackClose(e) {
  $.win.close();
  return;
}

$.thirdPageBack.onClick(scrollToPage3);

var wordFieldsArray = [];

$.firstPageNext.enableTouch(false);
$.firstPageNext.setOpacity(0.1);

$.secondPageNext.enableTouch(false);
$.secondPageNext.setOpacity(0.1);

$.thirdPageNext.enableTouch(false);
$.thirdPageNext.setOpacity(0.1);

var successColor = "#8ce58c";

var words = {};
function checkWord(e) {
  var field = e.source;
  if (aezeedWordList.indexOf(field.value) != -1) {
    field.backgroundColor = successColor;
    words[e.source.id] = true;
  } else {
    field.backgroundColor = "white";
    words[e.source.id] = false;
  }

  if (
    words["word1"] == true &&
    words["word2"] == true &&
    words["word3"] == true &&
    words["word4"] == true &&
    words["word5"] == true &&
    words["word6"] == true &&
    words["word7"] == true &&
    words["word8"] == true
  ) {
    $.firstPageNext.enableTouch(true);
    $.firstPageNext.setOpacity(1);
  } else {
    $.firstPageNext.enableTouch(false);
    $.firstPageNext.setOpacity(0.1);
  }

  if (
    words["word9"] == true &&
    words["word10"] == true &&
    words["word11"] == true &&
    words["word12"] == true &&
    words["word13"] == true &&
    words["word14"] == true &&
    words["word15"] == true &&
    words["word16"] == true
  ) {
    $.secondPageNext.enableTouch(true);
    $.secondPageNext.setOpacity(1);
  } else {
    $.secondPageNext.enableTouch(false);
    $.secondPageNext.setOpacity(0.1);
  }

  if (
    words["word17"] == true &&
    words["word18"] == true &&
    words["word19"] == true &&
    words["word20"] == true &&
    words["word21"] == true &&
    words["word22"] == true &&
    words["word23"] == true &&
    words["word24"] == true
  ) {
    $.thirdPageNext.enableTouch(true);
    $.thirdPageNext.setOpacity(1);
  } else {
    $.thirdPageNext.enableTouch(false);
    $.thirdPageNext.setOpacity(0.1);
  }
}

if (Alloy.CFG.isDevelopment != true) {
  $.skip.hide();
}

function skip() {
  var demoWords = globals.demoPhrase.split(" ");

  for (var i = 0; i < wordFieldsArray.length; i++) {
    var wordField = wordFieldsArray[i];
    wordField.value = demoWords[i];
    checkWord({ source: wordField });
  }
}

$.thirdPageNext.onClick(function() {
  var passphrase = "";

  for (var i = 0; i < wordFieldsArray.length; i++) {
    var append = ",";
    if (i == wordFieldsArray.length - 1) {
      append = "";
    }
    passphrase += wordFieldsArray[i].value + append;
  }

  signInFromExisting(passphrase);
});

function signInFromExisting(passphrase) {
  /* double check all the words are valid*/

  var passphraseWords = passphrase.split(",");
  for (var i = 0; i < passphraseWords.length; i++) {
    var aWordToCheck = passphraseWords[i];
    if (aezeedWordList.indexOf(aWordToCheck) == -1) {
      alert(L("label_mnemonic_24") + " Word " + (i + 1));
      return;
    }
  }

  globals.util.showDisclaimer(function() {
    globals.util.loadStartUpInfo(function(error, response) {
      if (error == false) {
        passphrase = passphrase.split(",").join();

        if (isCreatingAccount == false) {
          isCreatingAccount = true;
          setTimeout(function() {
            globals.lnGRPC.startLNDMobile(function(error, response) {
              globals.console.log("lndMobile1", error);
              globals.console.log("lndMobile1", response);

              if (error == true) {
                alert(response);
                return;
              }
              globals.decryptedPassphrase = passphrase;

              const createWallet = false;

                Ti.App.Properties.setBool("isRecovering", true); //recovery started
 
                globals.inRecoveryMode = true;
 
                Alloy.createController("components/google_drive_link", {
                  fromSignIn: true
                })
                  .getView()
                  .open();
              
            });
          }, 100);
        }
      } else {
        alert(L("error_loading").format({ message: response }));
      }
    });
  });
}
