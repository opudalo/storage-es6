class CrossDomainStorageHost {
  constructor(config) {
    this.whitelist = config.whitelist || []

    window.addEventListener("message", (event) => this._onMessage(event), false);

  }

  get(id, key, event) {
    var msg = {
      id: id,
    }

    if (key) {
      msg.data = localStorage.getItem(key)
    } else {
      msg.data = {}
      for (var i in localStorage) msg.data[i] = localStorage.getItem(i)
    }

    this._respond(msg, event)
  }

  set(id, data, event) {
    data = data || {}
    for (var i in data) {
      if (typeof localStorage[i] == 'undefined') localStorage[i] = ''
      if (typeof data[i] == 'object') data[i] = JSON.stringify(data[i])
      localStorage.setItem(i, data[i])
    }

    this._respond({id: id}, event)
  }

  remove(id, key, event) {
    if (key) remove(key)
    else for (var i in localStorage) remove(i)

    function remove(key) {
      delete localStorage[key]
    }

    this._respond({id: id}, event)
  }

  _respond(data, event) {
    var source = event.source,
    origin = event.origin
  
    console.log(localStorage)
    source.postMessage(JSON.stringify(data), origin)
  }


  _verifyOrigin(origin) {
    var domain = origin.replace(/^https?:\/\/|:\d{1,4}$/g, "").toLowerCase()

    for (let item of this.whitelist) {
      let re = new RegExp(item + '$')
      if (re.test(domain)) return true
    }
    return false
  }

  _onMessage(event){
    if (!this._verifyOrigin(event.origin)) return

    try {
      var msg = JSON.parse(event.data)
      this[msg.method](msg.id, msg.data, event)
    } catch(e) {
      console.error(e);
    }
  }
}
