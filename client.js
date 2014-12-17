"use strict";

var _toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var CrossDomainStorage = (function () {
  var CrossDomainStorage = function CrossDomainStorage(config) {
    if (!config.origin) throw "URL is not specified";
    this.origin = config.origin;
    this.path = config.path || "/";
    this.url = this.origin + this.path;
    this.iframe = false;
    this.ready = false;
    this.queue = [];
    this.reqId = 0;
    this.callbacks = {};

    this.init();
  };

  CrossDomainStorage.prototype.init = function () {
    var _this = this;
    var iframe = document.createElement("iframe");
    iframe.src = this.url;
    iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;";
    document.body.appendChild(iframe);

    on(iframe, "load", function () {
      return _this._ready();
    });
    on(window, "message", function (event) {
      return _this._onMessage(event);
    });

    this.iframe = iframe;
  };

  CrossDomainStorage.prototype.set = function (data, cb) {
    if (!data) return;
    this._send({ method: "set", data: data }, cb);
  };

  CrossDomainStorage.prototype.get = function (key, cb) {
    key = key || "";
    this._send({ method: "get", data: key }, cb);
  };

  CrossDomainStorage.prototype.remove = function (key, cb) {
    key = key || "";
    this._send({ method: "remove", data: key }, cb);
  };

  CrossDomainStorage.prototype._send = function (msg, cb) {
    if (cb === undefined) cb = function () {
      return false;
    };
    if (!this.ready) return this._queue(msg.method, [msg.data, cb]);

    this.reqId++;
    this.callbacks[this.reqId] = cb;

    msg.id = this.reqId;
    this.iframe.contentWindow.postMessage(JSON.stringify(msg), this.url);
  };

  CrossDomainStorage.prototype._queue = function (method, args) {
    console.log("Queued: ", method, args);
    this.queue.push(arguments);
  };

  CrossDomainStorage.prototype._ready = function () {
    this.ready = true;

    if (!this.queue.length) return;

    for (var _iterator = this.queue[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      var call = _step.value;
      var method = call[0];
      var args = call[1];

      if (!this[method]) continue;
      this[method].apply(this, _toArray(args));
    }

    this.queue = [];
  };

  CrossDomainStorage.prototype._onMessage = function (event) {
    if (this.origin != event.origin) return;

    var msg;

    try {
      msg = JSON.parse(event.data);
    } catch (e) {
      console.error("Error while parsing response from remote storage", e);
    }

    var cb = this.callbacks[msg.id];
    cb && cb(msg.data);
    delete this.callbacks[msg.id];
  };

  return CrossDomainStorage;
})();

module.exports = CrossDomainStorage;


function on(el, event, cb) {
  el.addEventListener(event, cb, false);
}