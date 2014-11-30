"use strict";

var _toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var _classProps = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
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

  _classProps(CrossDomainStorage, null, {
    init: {
      writable: true,
      value: function () {
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
      }
    },
    set: {
      writable: true,
      value: function (data, cb) {
        if (!data) return;
        this._send({ method: "set", data: data }, cb);
      }
    },
    get: {
      writable: true,
      value: function (key, cb) {
        key = key || "";
        this._send({ method: "get", data: key }, cb);
      }
    },
    remove: {
      writable: true,
      value: function (key, cb) {
        key = key || "";
        this._send({ method: "remove", data: key }, cb);
      }
    },
    _send: {
      writable: true,
      value: function (msg, cb) {
        if (cb === undefined) cb = function () {
          return false;
        };
        if (!this.ready) return this._queue(msg.method, [msg.data, cb]);

        this.reqId++;
        this.callbacks[this.reqId] = cb;

        msg.id = this.reqId;
        this.iframe.contentWindow.postMessage(JSON.stringify(msg), this.url);
      }
    },
    _queue: {
      writable: true,
      value: function (method, args) {
        console.log("Queued: ", method, args);
        this.queue.push(arguments);
      }
    },
    _ready: {
      writable: true,
      value: function () {
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
      }
    },
    _onMessage: {
      writable: true,
      value: function (event) {
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
      }
    }
  });

  return CrossDomainStorage;
})();

function on(el, event, cb) {
  el.addEventListener(event, cb, false);
}

/*



  request: function (req, callback) {
    req.id = ++this._id

    this._request({
      request: req,
      callback: callback
    })
  },

  //private methods
  _request: function(data) {
    if (this._iframeReady) {
      this._sendRequest(data)
    } else {
      this._queue.push(data)
    }

    if (!this._iframe) this.init()
  },

  _sendRequest: function(data){
    this._requests[data.request.id] = data
    this._iframe.contentWindow.postMessage(JSON.stringify(data.request), this.origin)
  },

  _iframeLoaded: function(){
  },

  _handleMessage: function(event){
    if (event.origin != this.origin) return

    var data

    try {
      data = JSON.parse(event.data)
    } catch (e) {
      console.error('Error while parsing response from remote storage', e)
    }
    var req = this._requests[data.id]
    req.callback && req.callback(data.key, data.value)
    delete this._requests[data.id]
  }

}

*/