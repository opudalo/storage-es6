export default class CrossDomainStorage {
  constructor(config) {
    if (!config.origin) throw "URL is not specified"
    this.origin = config.origin
    this.path = config.path || '/'
    this.url = this.origin + this.path
    this.iframe = false
    this.ready = false
    this.queue = []
    this.reqId = 0
    this.callbacks = {}
    
    this.init()
  }
  
  init() {
    var iframe = document.createElement('iframe')
    iframe.src = this.url
    iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;"
    document.body.appendChild(iframe)
 
    on(iframe, 'load', () => this._ready())
    on(window, 'message', (event) => this._onMessage(event))
    
    this.iframe = iframe
  }
  
  set(data, cb) {
    if (!data) return
    this._send({method: 'set', data: data}, cb)
  }
  
  get(key, cb) {
    key = key || ''
    this._send({method: 'get', data: key}, cb)
  }

  remove(key, cb) {
    key = key || ''
    this._send({method: 'remove', data: key}, cb)
  }

  _send(msg, cb = () => false) {
    if (!this.ready) return this._queue(msg.method, [msg.data, cb])
    
    this.reqId++
    this.callbacks[this.reqId] = cb
    
    msg.id = this.reqId
    this.iframe.contentWindow.postMessage(JSON.stringify(msg), this.url)
  }
  
  _queue(method, args) {
    console.log('Queued: ', method, args)
    this.queue.push(arguments)
  }

  _ready() {
    this.ready = true

    if (!this.queue.length) return

    for (let call of this.queue) {
      let method = call[0]
      let args = call[1]

      if (!this[method]) continue
      this[method](...args)
    }

    this.queue = []
  }

  _onMessage(event) {
    if (this.origin != event.origin) return
    
    var msg
  
    try {
      msg = JSON.parse(event.data)
    } catch (e) {
      console.error('Error while parsing response from remote storage', e)
    }
    
    var cb = this.callbacks[msg.id]
    cb && cb(msg.data)
    delete this.callbacks[msg.id]
  }
}

function on(el, event, cb) {
  el.addEventListener(event, cb, false)
}
