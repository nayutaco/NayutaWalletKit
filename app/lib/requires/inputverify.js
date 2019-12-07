module.exports = (function () {
  var self = {};

  self.set = function (verifies) {
    self.verifies = verifies;
  };

  self.push = function (verify) {
    if (self.verifies == null) self.verifies = new Array();
    self.verifies.push(verify);
  };

  self.unshift = function (verify) {
    if (self.verifies == null) self.verifies = new Array();
    self.verifies.unshift(verify);
  };

  self.check = function () {
    for (var i = 0; i < self.verifies.length; i++) {
      var verify = self.verifies[i];
      var checkValue = verify.target.value;
      if (checkValue == undefined) checkValue = verify.target.text;
      if (checkValue == undefined) checkValue = verify.target;

      if (verify.type === "number") {
        if (isNaN(checkValue)) {
          return {
            target: verify.target,
            message: L("label_inputverify_number").format({
              "name": verify.name
            })
          };
        }
      }
      if ("equal" in verify) {
        if (checkValue != verify.equal.value) return {
          target: verify.target,
          message: L("label_inputverify_equal").format({
            "name": verify.name
          })
        };
      }
      if ("over" in verify) {
        if (verify.over == 0 && checkValue.length <= 0) {
          return {
            target: verify.target,
            message: L("label_inputverify_empty").format({
              "name": verify.name
            })
          };
        }
        if (checkValue.length < verify.over) {
          return {
            target: verify.target,
            message: L("label_inputverify_more").format({
              "name": verify.name,
              "over": verify.over
            })
          };
        }
      }
      if ("shouldvalue" in verify) {
        if (checkValue <= 0) {
          return {
            target: verify.target,
            message: L("label_inputverify_shouldvalue").format({
              "name": verify.name
            })
          };
        }
      }
    }
    return true;
  };

  return self;
}());
