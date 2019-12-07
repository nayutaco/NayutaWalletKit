globals.browserBar = {
  addressBar: $.addressBar,
  backButton: $.backButton,
  rightOptions: $.rightOptions,
  activityIndicator: $.activityIndicator,
  homeButton: $.homeButton,
  linkageButton: $.linkageButton,
  reloadButton: $.reloadButton
};
 
function goBack() {
  globals.browserGoBack();
}

function reload() {
  globals.browserReload();
}

function closeBrowser() {
  globals.closeDiscover();
}

function goHome() {
  globals.browserGoHome();
}

function loadUrl(e) {
  var url = e.value;
  globals.console.log(e);

  if (url.indexOf("http://localhost") != -1) {
    globals.loadInDapp(url);
    return;
  }

  function ValidURL(str) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name and extension
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?" + // port
      "(\\/[-a-z\\d%@_.~+&:]*)*" + // path
      "(\\?[;&a-z\\d%@_.,~+&:=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator

    return pattern.test(str);
  }

  if (ValidURL(url) == false) {
    url = url.replace(/\s+/g, "+").toLowerCase();
    url = "https://www.google.com/search?q=" + url;
  } else {
    if (url.indexOf("http") == -1) {
      url = "https://" + url;
    }
  }

  globals.console.log(url);
  globals.loadInDapp(url);
}

$.urlField.width = globals.util.getDisplayWidth() - 200;

$.addressBar.layout = "absolute";
$.urlField.hintText = L("label_browser_enterurl");
$.urlField.hintTextColor = "gray";
