module.exports = (function() {
  var self = {};

  self.handlePayLNRequest = function(evalResult) {

    var payReq = evalResult.data;

    var res = null;

    if (payReq.indexOf("lightning:") != -1) {
      payReq = payReq.replace("lightning:", '');
    }

     globals.lnGRPC.decodePayReq(payReq, function(error, res) {

      if (error == true) {
        globals.clearTask();
        alert(res);
        return;
      }

      if (res.payment_hash != undefined) {

        var rhash = res.payment_hash;

        globals.console.log(res);
        var memo = null;

        if (res.description != undefined) {
          memo = res.description;
        }

        if (globals.bitcoin.checkExpired(res)) {

          alert(L('text_payment_expired'));
          globals.clearTask();
          return;
        }

        globals.console.log(res);

        var urlName = globals.extractHostname(globals.getCurrentUrl());

        if (urlName.length > 30) {
          urlName = urlName.substr(0, 30) + "...";
        }
        if (res.num_satoshis == 0) {
          res.num_satoshis = undefined;
        }
        var message = L('text_request_pay_ln_web').format({
          "url": urlName,
          "value": res.num_satoshis
        });
        if (res.num_satoshis == undefined) {
          message = L('text_request_pay_ln_web').format({
            "url": urlName,
          });
        }
        if (memo != null) {
          message = L('text_request_pay_ln_memo_web').format({
            "url": urlName,
            "memo": memo,
            "value": res.num_satoshis
          });

          if (res.num_satoshis == undefined) {
            message = L('text_request_pay_ln_memo_web_no_amount').format({
              "url": urlName,
              "memo": memo,
            });
          }

        }

        var needsAmount = false;
        if (res.num_satoshis == undefined) {
          needsAmount = true;
        }
        Alloy.createController("transaction_conf", {
          "small": true,
          "message": message,
          "payReq": payReq,
          "needsAmount": needsAmount,
          "sizeToIncrease": 60,
          "cancel": function() {
            globals.lockBrowser(false);
            globals.clearTask();
          },
          "confirm": function() {

            Ti.App.Properties.setString("memo_" + rhash, memo);
            globals.console.log("saving " + rhash + " " + memo);

            globals.loadMainScreen();

            globals.lockBrowser(false);
            globals.clearTask();

          },

        });

      } else {
        globals.clearTask();
      }

    });

  };

  self.handleOpenChannelRequest = function(evalResult) {

    var nodeURI = evalResult.data;
 
    if (nodeURI.indexOf("lightning:") != -1) {
      nodeURI = nodeURI.replace("lightning:", '');
    } 
    var urlName = globals.extractHostname(globals.getCurrentUrl());

    if (urlName.length > 30) {
      urlName = urlName.substr(0, 30) + "...";
    }

    globals.openChannelFromDapp(nodeURI);
    return;
 
  };

  self.handleConnectPeerRequest = function(evalResult) {
    
    var params = evalResult.data; 
    var lightningAddress =  params.peer;

  globals.console.log(lightningAddress);

  var pubKey = lightningAddress.split('@')[0];
  var host = lightningAddress.split('@')[1];
  globals.console.log(pubKey);
  globals.console.log(host);
   
  globals.lnGRPC.connectPeer(lightningAddress,

    function(error, res) {

      globals.console.log("res", res);
      globals.console.log("error", error);
      var peerAlreadyAdded = false;

      if ((res + "").indexOf("already connected") != -1) {

        peerAlreadyAdded = true;

      }

      if(error == 1){
        error = true;
      }

      if (error == true && peerAlreadyAdded == false) {
         
        var returnMessage = JSON.stringify({
          "chain": evalResult.chain,
          "type": evalResult.type,
          "data": res,
          "error":res
        });

        globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function(response, error) {
          if (error != undefined) {
            globals.console.error(error);
          }
          globals.lockBrowser(false);
        });
 

      } else {

        globals.console.log("res", res);

        var returnMessage = JSON.stringify({
          "chain": evalResult.chain,
          "type": evalResult.type,
          "data": "connected"
        });
    
        globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function(response, error) {
          if (error != undefined) {
            globals.console.error(error);
          }
          globals.lockBrowser(false);
        });

      }
    });

  };

  self.handleGetPubKey = function(evalResult) {
 
    var returnMessage = JSON.stringify({
      "chain": evalResult.chain,
      "type": evalResult.type,
      "data":  globals.nodeInfo.identity_pubkey
    });

    globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function(response, error) {
      if (error != undefined) {
        globals.console.error(error);
      }
      globals.lockBrowser(false);
    });

  };

  self.handleGetInfo = function(evalResult) { 
    var returnMessage = JSON.stringify({
      "chain": evalResult.chain,
      "type": evalResult.type,
      "data": {node:{alias:globals.nodeInfo.alias,pubkey:globals.nodeInfo.identity_pubkey,color:globals.nodeInfo.color}}
    });
 
    globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function(response, error) {
      if (error != undefined) {
        globals.console.error(error);
      }
      globals.lockBrowser(false);
    });

  };

  self.handleMakeInvoice = function(evalResult) {
 
  
    var params = evalResult.data; 
    var amount = parseInt(params.amount);
    var memo = null; 
    if(params.memo){
       memo = params.defaultMemo;
    }
    var expiry = globals.defaultExpiry * 60;
    if(params.expiry){
      var expiry = parseInt(params.expiry);
    } 
    globals.lnGRPC.addInvoice(amount, memo, expiry,  function(error, res) {
      globals.console.log("callback");
      globals.console.log("callback",error);

      globals.console.log("callback",res);
      if (error == true) {
        globals.clearTask();
        alert(error);
        return;
      }
 
      var returnMessage = JSON.stringify({
        "chain": evalResult.chain,
        "type": evalResult.type,
        "data": res
      });

      globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function(response, error) {
        if (error != undefined) {
          globals.console.error(error);
        }
        globals.lockBrowser(false);
      });

    });
  
};

  self.handleVerifyMessage = function(evalResult) {
 
    var message = evalResult.data.message; 
    var signature = evalResult.data.signature;  
 
    globals.lnGRPC.verifyMessage(message,signature,  function(error, res) {
      globals.console.log("callback");
      globals.console.log("callback",error);

      globals.console.log("callback",res);
      if (error == true) {
        globals.clearTask();
        alert(error);
        return;
      }
 
      var returnMessage = JSON.stringify({
        "chain": evalResult.chain,
        "type": evalResult.type,
        "data":{valid:res.valid, pubkey:res.pubkey } 
      }); 
 
      globals.console.log("returnMessage",returnMessage);

      globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function(response, error) {
        if (error != undefined) {
          globals.console.error(error);
        }
        globals.lockBrowser(false);
      });

    });
  
};
 
  self.handleSignMessage = function(evalResult) {
 
    var message = evalResult.data;  

    var  messageText =  message ;
    if ( messageText.length > 70) {
      messageText =  messageText.substring(0, 70) + "...";
    }

    Alloy.createController("transaction_conf", {
      "message": L('text_request_sign_message').format({
        "url": globals.extractHostname(globals.getCurrentUrl()),
        "message": messageText, 
      }), 
      "cancel": function() {
        globals.clearTask();
        globals.clearCallback('user cancelled');
      },
      "confirm": function() {

     globals.console.log("signing message",evalResult)
    globals.lnGRPC.signMessage(message,  function(error, res) {
      globals.console.log("callback");
      globals.console.log("callback",error);

      globals.console.log("callback",res);
      if (error == true) {
        globals.clearTask();
        alert(error);
        return;
      }
 
      var returnMessage = JSON.stringify({
        "chain": evalResult.chain,
        "type": evalResult.type,
        "data":{message:message,signature:res.signature } 
      }); 
 
      globals.console.log("returnMessage",returnMessage);

      globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function(response, error) {
        if (error != undefined) {
          globals.console.error(error);
        }
        globals.lockBrowser(false);
      });

    });

  }
});

};
  self.handleAddInvoice = function(evalResult) {
 
    var params = evalResult.data; 
    var amount = parseInt(params.amount);
    var memo = null; 
    if(params.memo){
       memo = params.memo;
    }
    var expiry = globals.defaultExpiry * 60;
    if(params.expiry){
      var expiry = parseInt(params.expiry);
    } 
    globals.lnGRPC.addInvoice(amount, memo, expiry,  function(error, res) {
      globals.console.log("callback");
      globals.console.log("callback",error);

      globals.console.log("callback",res);
      if (error == true) {
        globals.clearTask();
        alert(error);
        return;
      }
 
      var returnMessage = JSON.stringify({
        "chain": evalResult.chain,
        "type": evalResult.type,
        "data": res
      });

      globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function(response, error) {
        if (error != undefined) {
          globals.console.error(error);
        }
        globals.lockBrowser(false);
      });

    });

  };

  self.handleLookUpInvoice = function(evalResult) {

    var params = evalResult.data;
    globals.console.log("here", params);

    globals.console.log("here1", params);

    globals.lnGRPC.lookUpInvoice(params.rhash, function(error, res) {

      try{
        if (error == true) {
        
        globals.clearTask();
 
        alert(res);
 
        return;
      }
 
      var returnMessage = JSON.stringify({
        "chain": evalResult.chain,
        "type": evalResult.type,
        "data": res
      });
 

      globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function(response, error) {

 
        if (error != undefined) {
          globals.console.error(error);
        }
        globals.lockBrowser(false);
      });
    }
    catch(e){
      globals.clearTask();
      alert(e);
    }

    });

  };

  return self;
}());