if (OS_IOS) {
  $.mainView.left = globals.util.getDisplayWidth() * -1;
}

$.nodeInfo.top = globals.util.getDisplayHeight();
$.nodeInfo.hide();
$.nodeInfo.height = globals.util.getDisplayHeight();
$.nodeInfo.width = globals.util.getDisplayWidth();

$.firstLoader.top = Alloy.Globals.btclnTopHeight - 30;

Alloy.Globals.openChannels = [];
Alloy.Globals.pendingChannels = [];
globals.getChannels = function() {
  globals.console.log("getting channels");

  globals.lnGRPC.listChannels(function(error, res) {
    if (error == true) {
      alert(res);
      return;
    } else {
      globals.console.log("channels", res);

      var openChannelsResult = res;

      if (openChannelsResult.channels != undefined) {
        openChannelsResult = openChannelsResult.channels;
      }

      Alloy.Globals.openChannels = [];

      if (openChannelsResult.reverse != undefined) {
        Alloy.Globals.openChannels = openChannelsResult.reverse();
      }
    }
    updateChannelsList();
    globals.util.tryAndBackUpChannels();
  });

  globals.lnGRPC.pendingChannels(function(error, res) {
    globals.console.log("pending channels", res);
    if (error == true) {
      alert(res);
      return;
    } else {
      Alloy.Globals.pendingChannels = res;

      if (Alloy.Globals.pendingChannels != undefined) {
        if (
          Alloy.Globals.pendingChannels.pending_force_closing_channels !=
          undefined
        ) {
          Alloy.Globals.pendingChannels.pending_force_closing_channels.reverse();
        }
        if (
          Alloy.Globals.pendingChannels.pending_closing_channels != undefined
        ) {
          Alloy.Globals.pendingChannels.pending_closing_channels.reverse();
        }
        if (Alloy.Globals.pendingChannels.pending_open_channels != undefined) {
          Alloy.Globals.pendingChannels.pending_open_channels.reverse();
        }

        if (Alloy.Globals.pendingChannels.waiting_close_channels != undefined) {
          Alloy.Globals.pendingChannels.waiting_close_channels.reverse();
        }
      }

      $.firstLoader.hide();
      updateChannelsList();
      control.endRefreshing();
    }
  });
};

function showPeers() {
  Alloy.createController("peers", {}).getView();
}

function showOpenChannel() {
  Alloy.createController("components/component_open_channel_form", {
    parent: globals.channelsFundsView
  });
}

var control = Ti.UI.createRefreshControl({
  tintColor: Alloy.Globals.mainColor
});
control.addEventListener("refreshstart", function(e) {
  globals.getChannels();
});

$.table.refreshControl = control;

function openChannelForm() {
  Alloy.createController("components/component_open_channel_form")
    .getView()
    .open();
}

function updateChannelsList() {
  var tableData = [];
  var sections = [];

  var openChannelsSection = Ti.UI.createTableViewSection();

  var sectionHeaderView = Titanium.UI.createView({
    backgroundColor: "#33FFFFFF",
    width: "100%",
    height: 30
  });
  var headertitle = Ti.UI.createLabel({
    color: Alloy.Globals.fontColor1,
    font: {
      fontSize: 16
    },
    left: 5,
    text: "open",
    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
    width: Ti.UI.SIZE,
    height: Ti.UI.SIZE
  });
  sectionHeaderView.add(headertitle);
  openChannelsSection.setHeaderView(sectionHeaderView);

  var openChannels = Alloy.Globals.openChannels;

  for (var i = 0; i < openChannels.length; i++) {
    var row = Ti.UI.createTableViewRow({
      className: "openChannel",
      backgroundSelectedColor: "transparent",
      rowIndex: i,
      height: 130
    });

    if (OS_IOS) {
      row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.NONE;
    }

    var aChannel = openChannels[i];
    var openChannel = Alloy.createController(
      "components/component_open_channel",
      aChannel
    );
    row.add(openChannel.getView());
    openChannelsSection.add(row);
  }
  var pendingChannelsSection = Ti.UI.createTableViewSection();

  var sectionHeaderView = Titanium.UI.createView({
    backgroundColor: "#33FFFFFF",
    width: "100%",
    height: 30
  });
  var headertitle = Ti.UI.createLabel({
    color: Alloy.Globals.fontColor1,
    font: {
      fontSize: 16
    },
    left: 5,
    text: "pending",
    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
    width: Ti.UI.SIZE,
    height: Ti.UI.SIZE
  });
  sectionHeaderView.add(headertitle);
  pendingChannelsSection.setHeaderView(sectionHeaderView);

  var pendingChannels = Alloy.Globals.pendingChannels.pending_open_channels;
  if (pendingChannels == undefined) {
    pendingChannels = [];
  }

  for (var i = 0; i < pendingChannels.length; i++) {
    var row = Ti.UI.createTableViewRow({
      className: "pendingChannel",
      backgroundSelectedColor: "transparent",
      rowIndex: i,
      height: 120
    });
    if (OS_IOS) {
      row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.NONE;
    }

    var aChannel = pendingChannels[i];
    var pendingChannel = Alloy.createController(
      "components/component_pending_channel",
      aChannel
    );
    row.add(pendingChannel.getView());
    pendingChannelsSection.add(row);
  }

  var closingChannelsSection = Ti.UI.createTableViewSection();

  var sectionHeaderView = Titanium.UI.createView({
    backgroundColor: "#33FFFFFF",
    width: "100%",
    height: 30
  });
  var headertitle = Ti.UI.createLabel({
    color: Alloy.Globals.fontColor1,
    font: {
      fontSize: 16
    },
    left: 5,
    text: "closing",
    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
    width: Ti.UI.SIZE,
    height: Ti.UI.SIZE
  });
  sectionHeaderView.add(headertitle);
  closingChannelsSection.setHeaderView(sectionHeaderView);

  var closingChannels = Alloy.Globals.pendingChannels.waiting_close_channels;
  if (closingChannels == undefined) {
    closingChannels = [];
  }

  for (var i = 0; i < closingChannels.length; i++) {
    var row = Ti.UI.createTableViewRow({
      className: "closingChannel",
      backgroundSelectedColor: "transparent",
      rowIndex: i,
      height: 120
    });
    if (OS_IOS) {
      row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.NONE;
    }

    var aChannel = closingChannels[i];
    var closingChannel = Alloy.createController(
      "components/component_closing_channel",
      aChannel
    );
    row.add(closingChannel.getView());
    closingChannelsSection.add(row);
  }

  var forceClosingChannelsSection = Ti.UI.createTableViewSection();

  var sectionHeaderView = Titanium.UI.createView({
    backgroundColor: "#33FFFFFF",
    width: "100%",
    height: 30
  });
  var headertitle2 = Ti.UI.createLabel({
    color: Alloy.Globals.fontColor1,
    font: {
      fontSize: 16
    },
    left: 5,
    text: "force closing",
    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
    width: Ti.UI.SIZE,
    height: Ti.UI.SIZE
  });
  sectionHeaderView.add(headertitle2);
  forceClosingChannelsSection.setHeaderView(sectionHeaderView);

  var forceClosingChannels =
    Alloy.Globals.pendingChannels.pending_force_closing_channels;

  if (forceClosingChannels == undefined) {
    forceClosingChannels = [];
  }
  for (var i = 0; i < forceClosingChannels.length; i++) {
    var row = Ti.UI.createTableViewRow({
      className: "forceClosingChannel",
      backgroundSelectedColor: "transparent",
      rowIndex: i,
      height: 90
    });
    if (OS_IOS) {
      row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.NONE;
    }

    var aChannel = forceClosingChannels[i];
    var forceClosingChannel = Alloy.createController(
      "components/component_force_closing_channel",
      aChannel
    );
    row.add(forceClosingChannel.getView());
    forceClosingChannelsSection.add(row);
  }

  var tableData = [];

  if (pendingChannels.length > 0) {
    tableData.push(pendingChannelsSection);
  }
  if (closingChannels.length > 0) {
    tableData.push(closingChannelsSection);
  }
  if (forceClosingChannels.length > 0) {
    tableData.push(forceClosingChannelsSection);
  }
  if (Alloy.Globals.openChannels.length > 0) {
    tableData.push(openChannelsSection);
  }

  if (tableData.length == 0) {
    $.noChannels.show();
  } else {
    $.noChannels.hide();
  }
  $.table.data = tableData;
}
 
var didLoad = false;

exports.API = {
  setDidLoad:function(val){
    didLoad = val;
  },
  loadChannels: function() {
    if(globals.util.isInitialSync()){
      $.syncView.show();
      return;
    }
    $.syncView.hide();

    if( didLoad  == false){
    globals.console.log("loading channels");
    $.firstLoader.show();
    globals.getChannels();
    didLoad  = true;

    }
  },
  setNodeInfo: function() {
    setWalletName();
  }
};

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

function setWalletName() {
  if (globals.nodeInfo == undefined) {
    return;
  }
  globals.setNodeInfo(globals.nodeInfo);
  if (globals.nodeInfo.alias != undefined) {
    $.walletName.text = globals.nodeInfo.alias;
    if (globals.nodeInfo.alias == undefined || globals.nodeInfo.alias == "") {
      $.walletName.text = L("wallet_info");
    }
  }
}

function showNodeInfo() {
  globals.console.log("presssed show node info");
  globals.hideShowNodeInfo(true);
}

globals.hideShowNodeInfo = function(show) {
  $.nodeInfo.show();
  if (globals.nodeInfo === undefined) {
    return;
  }
  if (show === false) {
    const a = Ti.UI.createAnimation({
      top: globals.util.getDisplayHeight(),
      duration: 300
    });
    $.nodeInfo.animate(a);
  } else {
    const a = Ti.UI.createAnimation({
      top: 0,
      duration: 300
    });
    $.nodeInfo.animate(a);
  }
};
