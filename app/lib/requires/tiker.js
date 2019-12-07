module.exports = (function () {
  var self = {};
 
  globals.fiatPrice = {};
  
  function addCommas(nStr) {
    nStr += "";
    x = nStr.split(".");
    x1 = x[0];
    x2 = x.length > 1 ? "." + x[1] : "";
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, "$1" + "," + "$2");
    }
    return x1 + x2;
  }

  self.getFiatValue = function (denomination = "BTC") {
 
    var val = globals.fiatPrice.last;

    if (denomination == "SAT") {
      val = val / 100000000;
    }
    return val;

  };

  self.getFiatSymbol = function () {
  
    
    return globals.fiatPrice.symbol;

  };
  self.ifNoFiat = function(){

    if(globals.fiatPrice.last == undefined || globals.fiatPrice.last == ""){
      return true;
    }

    return false;
  }
  self.to = function (quantity, digit) {

    if (!isFinite(quantity)) return "???";

    var price = globals.fiatPrice.last;
    var symbol = globals.fiatPrice.symbol;

    if (digit == null) digit = 4;
 
    return "{0}{1}".format(symbol, addCommas((quantity * price).toFixed2(digit)));
    
  };
 
 
  return self;
}());