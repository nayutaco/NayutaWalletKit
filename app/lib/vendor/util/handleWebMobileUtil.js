module.exports = (function () {
	var self = {};


	self.handleGetUserID = function (evalResult) {

		var returnMessage = JSON.stringify({
			"chain": evalResult.chain,
			"type": evalResult.type,
			"data": Titanium.Utils.sha256(globals.cache.data.id)
		});


		globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function (response, error) {
			if (error != undefined) {
				globals.console.error(error);
			}
			globals.lockBrowser(false);
		});


	};



	self.handleUseCamera = function (evalResult) {

		globals.util.openScanner({
			'callback': function (e) {

				var returnMessage = JSON.stringify({
					"chain": evalResult.chain,
					"type": evalResult.type,
					"data": e
				});
				globals.console.log(returnMessage);
				globals.evaluateJS("START_CALLBACK('" + returnMessage + "')", function (response, error) {
					if (error != undefined) {
						globals.console.error(error);
					}
					globals.lockBrowser(false);
				});
			},
			'error': function (e) {
				globals.clearTask();
				globals.clearCallback('user cancelled');
			},
			'cancel': function (e) {
				globals.clearTask();
				globals.clearCallback('user cancelled');
			}
		});

	};


	self.handleUrlScheme = function (evalResult) {
		globals.console.log("handleUrlScheme");
		globals._parseArguments(evalResult.data, {
			qrcode: false,
			completemessage: false
		});
		globals.clearTask();
		globals.clearCallback('no callback');

	};

	self.handleOpenUrl = function (evalResult) {
		globals.console.log("handleOpenScheme", evalResult);

		Ti.Platform.openURL(evalResult.data);
		globals.clearTask();
		globals.clearCallback('no callback');

	};



	return self;
}());

