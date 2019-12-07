var args = arguments[0] || {};
var lastLength = -1;
var logsString = "";
var updateTimeout = null;
var logs = "";

function share() {
  var emailDialog = Ti.UI.createEmailDialog();
  emailDialog.subject = "logs";
  emailDialog.messageBody = "logs";
  if (OS_IOS) {
    var f = Ti.Filesystem.getFile(globals.dataDir);
  } else if (OS_ANDROID) {
    var f = Ti.Filesystem.getFile(globals.dataDir);
    if (f.exists() === false) {
      f.createFile();
    }
    f.write(logs);
  }

  emailDialog.addAttachment(f);
  emailDialog.open();
}

function close(e) {
  clearTimeout(updateTimeout);
  if (OS_ANDROID) {
    $.win.close();
    return;
  }

  $.background.animate({
    opacity: 0,
    duration: 200
  });

  $.mainView.animate({
    left: globals.display.width,
    duration: 200
  });

  setTimeout(function() {
    $.win.width = 0;
    $.win.close();
  }, 200);
}

if (OS_ANDROID) {
  $.win.addEventListener("android:back", function() {
    close();
    return true;
  });
}

$.background.animate({
  opacity: 0.5,
  duration: 200
});

if (OS_IOS) {
  $.mainView.animate({
    left: 0,
    duration: 200
  });
}
$.logs_text.width = globals.util.getDisplayWidth();
$.scrollView.width = $.logs_text.width;

function loadLogs() {
  globals.dataDir =
    Ti.Filesystem.applicationDataDirectory +
    "logs/bitcoin/" +
    globals.network +
    "/lnd.log";

  globals.console.log("logs", globals.dataDir);
  try {
    if (OS_IOS) {
      var f = Ti.Filesystem.getFile(globals.dataDir);

      globals.console.log("exists", f.exists());

      var contents = f.read();

      logs = contents.text;
    } else if (OS_ANDROID) {
      var Activity = require("android.app.Activity");
      var activity = new Activity(Ti.Android.currentActivity);
      var contextValue = activity.getApplicationContext();

      var path =
        contextValue.getFilesDir().getAbsolutePath() +
        "/logs/bitcoin/" +
        globals.network +
        "/lnd.log";
      globals.console.log("path", path);
      logs = globals.lnGRPC.loadLogs(path);
    }

    var logsArray = logs.split("\n");
    logsString = logs;

    if (lastLength == -1) {
      lastLength = logsArray.length;
      var startI = logsArray.length - 2;
      if (logsArray.length > 50) {
        startI = logsArray.length - 50;
      }

      for (var i = startI; i < logsArray.length; i++) {
        var nextLog = logsArray[i];

        globals.console.log(logsArray.length + "  -  " + nextLog);

        $.logs_text.text += "\n" + nextLog;
      }
    }

    if (lastLength != logsArray.length) {
      lastLength = logsArray.length;
      var nextLog = logsArray[logsArray.length - 2];
      globals.console.log(logsArray.length + "  -  " + nextLog);

      $.logs_text.text += "\n" + nextLog;
    }
    updateLogs();
  } catch (e) {
    globals.console.error(e);
    globals.console.log(globals.dataDir);
  }
}

function updateLogs() {
  updateTimeout = setTimeout(function() {
    loadLogs();
  }, 100);
}
updateLogs();
