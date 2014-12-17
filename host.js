"use strict";

var CrossDomainStorageHost = (function () {
  var CrossDomainStorageHost = function CrossDomainStorageHost(config) {
    var _this = this;
    this.whitelist = config.whitelist || [];

    window.addEventListener("message", function (event) {
      return _this._onMessage(event);
    }, false);
  };

  CrossDomainStorageHost.prototype.get = function (id, key, event) {
    var msg = {
      id: id };

    if (key) {
      msg.data = localStorage.getItem(key);
    } else {
      msg.data = {};
      for (var i in localStorage) msg.data[i] = localStorage.getItem(i);
    }

    this._respond(msg, event);
  };

  CrossDomainStorageHost.prototype.set = function (id, data, event) {
    data = data || {};
    for (var i in data) {
      if (typeof localStorage[i] == "undefined") localStorage[i] = "";
      if (typeof data[i] == "object") data[i] = JSON.stringify(data[i]);
      localStorage.setItem(i, data[i]);
    }

    this._respond({ id: id }, event);
  };

  CrossDomainStorageHost.prototype.remove = function (id, key, event) {
    if (key) remove(key);else for (var i in localStorage) remove(i);

    function remove(key) {
      delete localStorage[key];
    }

    this._respond({ id: id }, event);
  };

  CrossDomainStorageHost.prototype._respond = function (data, event) {
    var source = event.source, origin = event.origin;

    console.log(localStorage);
    source.postMessage(JSON.stringify(data), origin);
  };

  CrossDomainStorageHost.prototype._verifyOrigin = function (origin) {
    var domain = origin.replace(/^https?:\/\/|:\d{1,4}$/g, "").toLowerCase();

    for (var _iterator = this.whitelist[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      var item = _step.value;
      var re = new RegExp(item + "$");
      if (re.test(domain)) return true;
    }

    return false;
  };

  CrossDomainStorageHost.prototype._onMessage = function (event) {
    if (!this._verifyOrigin(event.origin)) return;

    try {
      var msg = JSON.parse(event.data);
      this[msg.method](msg.id, msg.data, event);
    } catch (e) {
      console.error(e);
    }
  };

  return CrossDomainStorageHost;
})();

module.exports = CrossDomainStorageHost;