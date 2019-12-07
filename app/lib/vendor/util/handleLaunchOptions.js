module.exports = (function () {

    var currentHOLDStatus = {};
    function urlToObject(url) {

        globals.console.log("url scheme", url);
        var returnObj = {};

        url = url.replace('lightning://?', '');
        url = url.replace('lightning:', '');

        var params = url.split('&');

        params.forEach(function (param) {

            var keyAndValue = param.split('=');

            returnObj[keyAndValue[0]] = decodeURI(keyAndValue[1]);

        });

        return returnObj;
    }

    function checkHOLDGameStatus() {
        //check if our hold invoice has been ACCEPTED AKA paid, and check that we have paid their invoice
        globals.console.log("checking hold status", currentHOLDStatus);
        if (currentHOLDStatus.ourState == "ACCEPTED" && currentHOLDStatus.theirState == "PAID") {

            globals.console.log("hold status ready");

            var intent = Ti.Android.createIntent({
                action: Ti.Android.ACTION_MAIN,
                packageName: currentHOLDStatus.callingApp,
                className: 'com.unity3d.player.UnityPlayerActivity'
            });
            intent.putExtra('status', "complete");

            Ti.Android.currentActivity.startActivity(intent);
            return;

        }
    }
 
    globals.processArgs = function (e) {
 
        if(e == undefined && globals.defferedArgs != null){
            globals.console.log("setting deffered args",globals.defferedArgs);
            e = globals.defferedArgs;
            globals.defferedArgs = null;
        }
        globals.console.log("processing arguments");
        var url = undefined;
        if (OS_IOS) {
            if (Ti.App.getArguments().url) {
                url = Ti.App.getArguments().url;
                Ti.App.getArguments().url = null;


            }
        } else {
            if (e == undefined) {
                e = globals.androidLaunchData;
                globals.androidLaunchData = undefined;
            }
            if (e != undefined) {
                url = e.data;
            }
            globals.console.log("args are ", e);
        }
        if (url != undefined) {
            url = url.replace('lightning://?', '');
            url = url.replace('lightning:', '');
            url = decodeURIComponent(url);
            if (url.indexOf("@") != -1) { //probably open channel nodeURI

            }
            else if (url.indexOf("addinvoice") != -1) { //probably open channel nodeURI
                globals.console.log("url is ", url);
                url = url.replace("addinvoice?", "");

                globals.console.log("url is ", url);
                var amt = parseInt(getParameterValue(url, "amt"));
                var memo = getParameterValue(url, "message");
                var expirySeconds = parseInt(getParameterValue(url, "expiry"));
                var callingApp = getParameterValue(url, "package");

                globals.console.log("amt" + amt + " " + memo + " " + expirySeconds + " " + callingApp);

                globals.lnGRPC.addInvoice(amt, memo, expirySeconds, function (error, response) {

                    if (error == true) {
                        globals.console.error("add invoice", response);
                        alert(response);
                        return;

                    } else {
                        console.log(response.payment_request);
                        var intent = Ti.Android.createIntent({
                            action: Ti.Android.ACTION_MAIN,
                            packageName: callingApp,
                            className: 'com.unity3d.player.UnityPlayerActivity'
                        });
                        //set input data
                        intent.putExtra('payment_request', response.payment_request);

                        Ti.Android.currentActivity.startActivity(intent);
                    }

                });

            } else if (url.indexOf("addholdinvoice") != -1) {

                globals.console.log("add hold invoice");

                currentHOLDStatus = {};
                globals.console.log("url is ", url);
                url = url.replace("addholdinvoice?", "");

                globals.console.log("url is ", url);
                var hash = getParameterValue(url, "hash");
                var amt = parseInt(getParameterValue(url, "amt"));
                var memo = getParameterValue(url, "message");
                var expirySeconds = parseInt(getParameterValue(url, "expiry"));
                var callingApp = getParameterValue(url, "package");
                currentHOLDStatus.callingApp = callingApp;
                currentHOLDStatus.hash = hash;
                globals.console.log("hash" + hash + " " + amt + " " + memo + " " + expirySeconds + " " + callingApp);

                globals.lnGRPC.addHoldInvoice(hash, amt, memo, expirySeconds, function (error, response) {

                    if (error == true) {
                        globals.console.error("add hold invoice", response);
                        alert(response);

                        var intent = Ti.Android.createIntent({
                            action: Ti.Android.ACTION_MAIN,
                            packageName: currentHOLDStatus.callingApp,
                            className: 'com.unity3d.player.UnityPlayerActivity'
                        });
                        //set input data
                        intent.putExtra('error', response);

                        Ti.Android.currentActivity.startActivity(intent);
                        return;

                    } else {

                        //subscribe to our invoice so we can check when it has been paid
                        globals.lnGRPC.subscribeSingleInvoice(hash, function (error, response) {


                            globals.console.log("single invoice subscription res", error, response);

                            if (error == false) {
                                globals.console.log("invoice single res", response);
                                if (response.state == "ACCEPTED") {
                                    currentHOLDStatus.ourState = response.state
                                }
                                checkHOLDGameStatus();

                            }

                        });


                        globals.console.log(response.payment_request);
                        var intent = Ti.Android.createIntent({
                            action: Ti.Android.ACTION_MAIN,
                            packageName: currentHOLDStatus.callingApp,
                            className: 'com.unity3d.player.UnityPlayerActivity'
                        });
                        //set input data
                        intent.putExtra('payment_request', response.payment_request);

                        Ti.Android.currentActivity.startActivity(intent);
                    }

                });

            } else if (url.indexOf("acceptholdinvoice") != -1) {

                globals.console.log("accept hold invoice");
                url = url.replace("acceptholdinvoice?", "");
                var callingApp = getParameterValue(url, "package");
                currentHOLDStatus.callingApp = callingApp;
                var invoice = getParameterValue(url, "invoice");
                globals.console.log(" invoice " + invoice + " package " + callingApp);



                payHoldInvoice(invoice, function () {
                    currentHOLDStatus.theirState = "PAID"
                    checkHOLDGameStatus();
                });


            } else if (url.indexOf("settleholdinvoice") != -1) {
                globals.console.log("settle hold invoice");
                url = url.replace("settleholdinvoice?", "");

                var preimage = getParameterValue(url, "preimage");
                globals.console.log(" preimage " + preimage);

                currentHOLDStatus.settledInvoice = true;
                globals.lnGRPC.sendSettleInvoiceMsg(preimage, function (error, response) {

                    if (error == true) {
                        globals.console.error("settle invoice", response);
                        alert(response);
                        return;

                    } else {

                        globals.console.log("settle response", response);
                        
                        alert("Hold invoice swept!");
                        globals.loadMainScreen(); 
                   
                    }
                });


            } else if (url.indexOf("cancelholdinvoice") != -1) {
                globals.console.log("cancel hold invoice");
                url = url.replace("cancelholdinvoice?", "");

                var hash = getParameterValue(url, "hash");
                globals.console.log(" hash" + hash);


                globals.lnGRPC.sendCancelInvoiceMsg(hash, function (error, response) {

                    if (error == true) {
                        globals.console.error("cancel invoice", response);
                        alert(response);
                        return;

                    } else {

                        globals.console.log("cancel response", response);
                        globals.loadMainScreen(); 


                    }
                });


            } else {
                globals.console.log("parse lightning payreq");
                if (globals.util.continuePay != undefined) {
                    globals.util.continuePay(url);
                } else {
                    globals.console.error("continuePay not defined");
                }
            }

        }
    }


    function payHoldInvoice(req, callback) {

        globals.console.log("req", req);

        globals.lnGRPC.decodePayReq(req, function (error, res) {

            if (error == true) {
                alert(res);
                var intent = Ti.Android.createIntent({
                    action: Ti.Android.ACTION_MAIN,
                    packageName: currentHOLDStatus.callingApp,
                    className: 'com.unity3d.player.UnityPlayerActivity'
                });
                //set input data
                intent.putExtra('error', res);

                Ti.Android.currentActivity.startActivity(intent);
                return;
            }

            globals.console.log(res.payment_hash);

            if (res.payment_hash != undefined) {

                var rhash = res.payment_hash;

                globals.console.log(res);
                var memo = null;

                if (res.description != undefined) {
                    memo = res.description;
                }

                var urlName = "";

                if (urlName.length > 10) {
                    urlName = urlName.substr(0, 10) + "...";
                }
                var needsAmount = false;

                if (res.num_satoshis == 0) {
                    res.num_satoshis = undefined;
                }

                var message = L('text_request_pay_ln').format({
                    "url": urlName,
                    "value": res.num_satoshis,
                });
                if (res.num_satoshis == undefined) {
                    var message = L('text_request_pay_ln_no_amount').format({
                        "url": urlName,
                    });
                }
                if (memo != null) {
                    message = L('text_request_pay_ln_memo').format({
                        "url": urlName,
                        "memo": memo,
                        "value": res.num_satoshis
                    });
                    if (res.num_satoshis == undefined) {
                        message = L('text_request_pay_ln_memo_no_amount').format({
                            "url": urlName,
                            "memo": memo,
                        });
                    }

                }
                if (res.num_satoshis == undefined) {
                    needsAmount = true;
                }
                Alloy.createController("transaction_conf", {
                    "small": true,
                    "message": message,
                    "payReq": req,
                    "closeOnSend": true,//for hold as we get no resposne
                    "needsAmount": needsAmount,
                    "cancel": function () {
                        
                        var intent = Ti.Android.createIntent({
                            action: Ti.Android.ACTION_MAIN,
                            packageName: currentHOLDStatus.callingApp,
                            className: 'com.unity3d.player.UnityPlayerActivity'
                        });
                        //set input data
                        intent.putExtra('error', "user cancelled");

                        Ti.Android.currentActivity.startActivity(intent);
                    },
                    "onerror":function(error){
                       globals.console.error("pay hold error",error);
                       if(currentHOLDStatus.settledInvoice == false){//when the other player cancels their invoice is causes a hash not found error here so only show error before we have settled
                        var intent = Ti.Android.createIntent({
                            action: Ti.Android.ACTION_MAIN,
                            packageName: currentHOLDStatus.callingApp,
                            className: 'com.unity3d.player.UnityPlayerActivity'
                        });
                        //set input data
                        intent.putExtra('error', error);

                        Ti.Android.currentActivity.startActivity(intent);
                    }
                    },
                    "confirm": function () {

                        globals.console.log("setting memo", rhash + " " + memo)
                        Ti.App.Properties.setString("memo_" + rhash, memo);
                        globals.loadMainScreen();
                        callback();
 
                    },

                });
            }

        });

    }

    function getParameterValue(url, parameter) {
        var components = url.split("&");
        for (var i = 0; i < components.length; i++) {
            var comp = components[i];
            if (comp.indexOf(parameter + "=") != -1) {

                var res = comp.replace(parameter + "=", "");
                return res;
            }
        }
        return null;

    }

    if (OS_IOS) {
        // on resume
        Ti.App.addEventListener("resumed", function () {
            globals.processArgs();
        });
    }

    if (OS_ANDROID) {
        
        let intentData = globals.util.getAndroidPreferences("intentData", "");
        
        globals.console.log("*** sav", intentData);

        let main_activity = Ti.Android.currentActivity;

        Ti.Android.currentActivity.addEventListener("resume", function (e) {
            globals.console.log("app resumed2", e);
            globals.processArgs(e);
            return;
        });


        if (intentData != "") {
            let Activity = require('android.app.Activity');
        
            let PreferenceManager = require('android.preference.PreferenceManager');
            
            let activity = new Activity(Ti.Android.currentActivity);
            
            let appContext = activity.getApplicationContext();
            
            let sharedPref = PreferenceManager.getDefaultSharedPreferences(appContext);
            
            var editor = sharedPref.edit();
            editor.remove("intentData");
            editor.commit();
            globals.androidLaunchData = {
                data: intentData
            };
            globals.console.log("launch source check", globals.androidLaunchData);
        }
        Ti.Android.currentActivity.addEventListener("newintent", function (e) {
            globals.console.log("app resumed3", e);
            var intent = main_activity.getIntent();
            // var uri = intent.getData();
            var uri = e.data;
            globals.console.log("uri: ", uri);

            if(globals.canProcessArgs == true){
            globals.processArgs({ data: uri });
            }else{
                
                globals.defferedArgs = { data: uri };
                globals.console.log("setting deffered args",globals.defferedArgs)
            }

        });


    }
}());