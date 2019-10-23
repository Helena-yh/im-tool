function APIResult(code, result, message) {
    this.code = code;
    this.result = result;
    this.message = message;
    if (this.code === null || this.code === void 0) {
      throw new Error('Code is null.');
    }
    if (this.result === null) {
      delete this.result;
    }
    if (this.message === null) {
      delete this.message;
    }
  }
  var formatRegion = function (region) {
    region = String(region);
    var plusPrefix = region.indexOf('+');
    if (plusPrefix > -1) {
      region = region.substring(plusPrefix + 1);
    }
    return region;
  };
  
  var Cache = function () {
    var cache = {};
    var set = (key, value) => {
      cache[key] = value;
    };
    var get = (key) => {
      return cache[key];
    };
    var remove = (key) => {
      delete cache[key];
    };
    return {
      set: set,
      get: get,
      remove: remove
    };
  };
  var toJSON = (obj) => {
    return JSON.stringify(obj);
  };
  module.exports = {
    Cache,
    APIResult,
    formatRegion,
    toJSON
  };