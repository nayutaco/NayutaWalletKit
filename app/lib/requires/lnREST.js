module.exports = (function () {
    var self = {};
    let timeout = 40000;
    var uri = "";
    var macaroon = ""
    let header = "Grpc-Metadata-macaroon";
    self.setUp = function (host, macaroonHex) {
        uri = host;
        macaroon = macaroonHex;
        globals.console.log("set host and macaroon");
    }
    self.isREST = function (host) {

        if(host.indexOf(".onion") != -1 || host.indexOf("lnd-rest") != -1){
            globals.console.log("is REST")
            return true;
        }
        
        globals.console.log("is not REST")
        
        return false;
    }

    function deleteRequest(endpoint, callback) {

        let xhr = Ti.Network.createHTTPClient();

        let url = uri + endpoint; 

        globals.console.log("sending",url); 

        xhr.open("DELETE", url);

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.setRequestHeader(header, macaroon);

        xhr.onload = function () {

            callback(false, JSON.parse(this.responseText));

        },
        xhr.onerror = function (e) {

            callback(true, this.responseText);

        };
        xhr.timeout = timeout;
        xhr.send();
    }

    function postRequest(endpoint, params, callback) {

        let xhr = Ti.Network.createHTTPClient();

        let url = uri + endpoint;

        let postData = JSON.stringify(params);

        globals.console.log("sending",url);

        globals.console.log("postData",postData);

        xhr.open("POST", url);

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.setRequestHeader(header, macaroon);

        xhr.onload = function () {

            callback(false, JSON.parse(this.responseText));

        },
        xhr.onerror = function (e) {

            callback(true, this.responseText);

        };
        xhr.timeout = timeout;
        xhr.send(postData);
    }

    function getRequest(endpoint, callback) {

        let xhr = Ti.Network.createHTTPClient();

        let url = uri + endpoint;

        globals.console.log("url",url);

        xhr.open("GET", url);

        xhr.setRequestHeader(header, macaroon);

        xhr.onload = function () {

            callback(false, JSON.parse(this.responseText));

        },
        xhr.onerror = function (e) {

            callback(true, this.responseText);

        };

        xhr.timeout = timeout;
        xhr.send();
    }
    self.getInfo = function (callback) {

        getRequest("v1/getinfo", callback);

    }

    self.listInvoices = function (callback) {


        getRequest("v1/invoices", callback);

    }

    self.channelBalance = function (callback) {

        getRequest("v1/balance/channels", callback);

    }


    self.walletBalance = function (callback) {

        getRequest("v1/balance/blockchain", callback);

    }

    self.listChannels = function (callback) {

        getRequest("v1/channels", callback);

    }

    self.listPayments = function (callback) {

        getRequest("v1/payments", callback);


    }

    self.getTransactions = function (callback) {

        getRequest("v1/transactions", callback);

    }

    self.pendingChannels = function (callback) {

        getRequest("v1/channels/pending", callback);

    }

    self.getNodeInfo = function (pubkey, callback) {
        getRequest("v1/graph/node/" + pubkey, callback);
    }


    self.sendPayment = function (payReq, amount, callback) { 

        var params = {
            "payment_request":payReq
        }
       
        if(amount != -1){
            params.amt = amount;
        }

        postRequest("v1/channels/transactions", params, callback);
    } 

    self.decodePayReq = function (payReq, callback) {
        getRequest("v1/payreq/"+payReq, callback);
    }

    self.newAddress = function (type, callback) {

        if(type == "p2wkh"){
            type = 0
        }else{
            type = 1
        }

        getRequest("v1/newaddress?type="+type, callback);
    }

    self.lookupInvoice = function (rHash, callback) {
        rHash = globals.bitcoin.base64toHEX(rHash);
        getRequest("v1/invoice/"+rHash, callback);
    }

    self.addInvoice = function (amount, expiry, memo, callback) {

        var params = {value:amount+"",expiry:expiry}

        if(memo != null){
            params.memo = memo;
        }

        postRequest("v1/invoices",params, callback);
    }

    self.verifyMessage = function (msg, signature, callback) {

        let params = {msg:msg,signature:signature}

        postRequest("v1/verifymessage",params, callback);
    }

    self.signMessage = function (msg, callback) {

        let params = {msg:msg}

        postRequest("v1/signmessage", params, callback);
    }

    self.closeChannel = function (funding_txid_str, output_index,force, callback) {
        
        if(force == true){
            force = "true";
        }else{
            force = "false";
        }

        deleteRequest("v1/channels/"+funding_txid_str+"/"+output_index+"?force="+force,callback) 
    }

    self.openChannel = function (pub_key, amount, callback) {

        let params = {node_pubkey_string:pub_key,local_funding_amount:amount}

        postRequest("v1/channels", params, callback);
    }


    self.connectPeer = function (pub_key, host, callback) {

        let params = {addr:{pubkey:pub_key,host:host},perm:false}

        postRequest("v1/peers", params, callback);
    }

    self.sendCoins = function (amount, destination, fee, callback) {

        if(amount == -1){
            globals.console.log("sending all")
            var params = {addr:destination,send_all:true,sat_per_byte:fee}

        } else{
            globals.console.log("not sending all")
            var params = {addr:destination,amount:amount,sat_per_byte:fee}

        }

        
        postRequest("v1/transactions", params, callback);

    }


    self.estimateFee = function (amount, destination, target_conf, callback) {

        if(amount == -1){
            globals.console.log("estimate fee")
            var params = {target_conf:amount,AddrToAmount:{destination:10000}}

        } else{
            globals.console.log("estimate fee")
            var params = {target_conf:amount,AddrToAmount:{destination:amount}}

        }
            var jsonToSend = {};
            jsonToSend[destination] = amount;
        
            callback(false,{"feerate_sat_per_byte":2,"fee_sat":100})
 
      // getRequest("v1/transactions/fee?target_conf="+target_conf+"&AddrToAmount["+destination+"]="+amount, callback);

    }

    self.exportAllChannelBackups = function(callback){

        getRequest("v1/channels/backup",callback);

    }

    self.getFees = function(callback){

        getRequest("v1/fees",callback);

    }
  
    return self;
}());