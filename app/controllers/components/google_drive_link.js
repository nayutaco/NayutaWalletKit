var args = arguments[0] || {};

function startBackUp() {
  globals.console.log("starting backup");
  $.backUpGoogleDrive.hide();
  $.backUpGoogleDriveSpinner.show();

  globals.util.backUpChannels(function (error, response) {
    globals.console.log("backup res", response + " " + error);
    $.backUpGoogleDrive.show();
    $.backUpGoogleDriveSpinner.hide();

    if (error == true) {
      globals.lnGRPC.signOutGoogleDrive();
      alert(response);
      return;
    }

    globals.console.log("error", error);
    globals.console.log("response", response);

    if (response == "file uploaded") {
      setLastBackUp();
      setTimeout(function () {
        alert(L("google_drive_linked"));
        $.win.close();
      }, 1000);
    } else if (response == "file upload error") {
      globals.lnGRPC.signOutGoogleDrive();
      alert(L("google_drive_error"));
    }
  });
}

function startLink() {
  globals.console.log("linking google drive");
  $.linkGoogleButton.hide();
  $.linkGoogleDriveSpinner.show();

  globals.lnGRPC.linkGoogleDrive(function (error, response) {
    globals.console.log("error", error);
    globals.console.log("response", response);
    response = response + "";
    $.linkGoogleButton.show();
    $.linkGoogleDriveSpinner.hide();
    if (error == true) {
      alert(response);
      return;
    }
    if (response == "linked") {
      if (args.fromAccounts == true) {
        args.callback();
      } else {
        globals.screenView = Alloy.createController("frame").getView();
        globals.screenView.open();
      }
      close();
    } else {
      globals.lnGRPC.signOutGoogleDrive();
      alert(L("google_drive_error"));
    }
  });
}
function close() {
  $.win.close();
}
function emailBackUp() {
  globals.lnGRPC.exportAllChannelBackups(function (error, response) {
    if (error == true) {
      alert(response);
      return;
    }

    globals.console.log("re", response);
    var emailDialog = Ti.UI.createEmailDialog();

    if(!emailDialog.isSupported()){
      alert(L('email_no_supported'));
      return;
    }
    emailDialog.subject = L("channels_backup_title_email");
    emailDialog.messageBody = L("channels_backup_description_email");

    var f = Ti.Filesystem.getFile(
      Ti.Filesystem.applicationDataDirectory,
      "channels_backup_" + globals.currentPubkey + ".txt"
    );
    if (f.exists() === false) {
      f.createFile();
    }
    if (OS_IOS) {
      var multi_chan_backup = response.multi_chan_backup.multi_chan_backup;
    } else if (OS_ANDROID) {
      var multi_chan_backup = response.multi_chan_backup;
    }
    f.write(multi_chan_backup);

    emailDialog.addAttachment(f);
    emailDialog.open();
  });
}

function setLastBackUp() {
  var bdate = Ti.App.Properties.getString(
    "last_back_up_" + globals.currentPubkey,
    ""
  );
  if (bdate == "") {
    $.lastBackUp.text = bdate;
    return;
  }
  var bDate = parseInt(bdate);

  var date = new Date(bDate);
  var dateNow = new Date();

  var timeDiff = Math.abs(date.getTime() - dateNow.getTime());
  globals.console.log("time diff", timeDiff);

  var minutesDiff = Math.ceil(timeDiff / (1000 * 60));
  var hoursDiff = Math.ceil(timeDiff / (1000 * 3600));

  if (minutesDiff < 2) {
    $.lastBackUp.text = L("last_back_up") + ": " + L("just_now");
  } else if (minutesDiff < 60) {
    $.lastBackUp.text =
      L("last_back_up") + ": " + minutesDiff + " " + L("mins_ago");
  } else if (hoursDiff < 24) {
    $.lastBackUp.text =
      L("last_back_up") + ": " + hoursDiff + " " + L("hours_ago");
  } else {
    $.lastBackUp.text =
      L("last_back_up") +
      ": " +
      date.getFullYear() +
      "/" +
      (date.getMonth() + 1) +
      "/" +
      date.getDate() +
      " - " +
      date.getHours() +
      ":" +
      date.getMinutes();
  }
}

$.unLinkButton.hide();

if (args.fromSignIn == true) {
  if (OS_ANDROID) {
    $.win.addEventListener("android:back", function () {
      close();
      return true;
    });
  }
  $.restoreButtons.show();
  $.backUpButtons.hide();
  $.linkButtons.hide();
  $.gobackButton.hide();
  $.descriptionLabel.text = L("restore_back_up");

  $.title.text = L("restore_back_up_title");

  $.backupIcon.image = "/images/icon_back_up_restore.png";
} else if (args.fromIntro == true) {
  $.descriptionLabel.text = L("channel_link_description");

  $.gobackButton.hide();
  $.restoreButtons.hide();
  $.linkButtons.show();
  $.backUpButtons.hide();
  setLastBackUp();
} else {
  $.restoreButtons.hide();
  $.linkButtons.hide();
  $.backUpButtons.show();
  $.unLinkButton.show();
  setLastBackUp();
}

function skip() {
  if (args.fromIntro) {
    globals.screenView = Alloy.createController("frame").getView();
    globals.screenView.open();

    return;
  }
  globals.util.saveAndContinue(false, function () {
    continueCreateAccount("");
  });

}

function restoreBackup() {
  $.skipButton.touchEnabled = false;
  $.restoreButton.hide();
  $.restoreSpinner.show();

  // because the use has not logged in we dont know the pubkey so we cant get the backup from google drive as its saved against the pubkey, however we can also add a short hash of the seed in the filename and we can calcualte that hash on load and then see if there is a file with that seed hash contained in the file name, best option would be to somehow calcualte the pubkey from the passphrase but no lib exists for that
  globals.lnGRPC.downloadGoogleDrive(
    globals.util.getSCBFolderName(),
    globals.util.getSCBFileNameNoPubKey(),
    function (error, response) {
      globals.console.log("download error", error);
      globals.console.log("download res", response);

      if (error == true) {
        $.skipButton.touchEnabled = true;
        $.restoreButton.show();
        $.restoreSpinner.hide();
        response = response + "";

        if (response == "file not found") {
          $.skipButton.touchEnabled = true;
          setTimeout(function () {
            alert(L("back_up_not_found"));
          }, 2000)
        } else {
          setTimeout(function () {
            alert(response);
          }, 2000)
        }
        return;
      }

      globals.console.log("channel backup", response);

      globals.util.saveAndContinue(false, function () {
        continueCreateAccount(response);
      });

    }
  );
}

function unLink() {
  globals.lnGRPC.signOutGoogleDrive();
  alert(L("google_unlinked"));
}

function continueCreateAccount(channelBackUp) {
  var seedArray = globals.decryptedPassphrase.split(","); // convert to string array
  var password = globals.createPassword(globals.passCodeHash);
  globals.console.log("creating wallet from google drive screen");
  globals.lnGRPC.createWallet(
    password,
    seedArray, 
    channelBackUp,
    function (error, response) {
      globals.console.log("create wallet", error);
      globals.console.log("create wallet", response);
      if (error == true) {
        alert(response);
        return;
      }

      if (
        globals.savePassphrase(globals.decryptedPassphrase, globals.userKey)
      ) {
        Ti.App.Properties.setString("mode", "lndMobile");
        Ti.App.Properties.setBool("has_wallet_" + Alloy.Globals.network, true);
        globals.console.log("setting already unlocked");
        globals.alreadyUnlocked = true; // because we created a new wallet so no need to unlock

        if (channelBackUp == "") {
          globals.screenView = Alloy.createController("frame").getView();
          globals.screenView.open();
        } else {
          Alloy.createController("components/restore_screen")
            .getView()
            .open();
        }

        $.win.close();
      }
    }
  );
}
