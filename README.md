## extend-es6
  CrossDomainStorage ES6 implementatino

### Installation

    $ bower install --save zheneva/storage-es6

### Running Example

    $ git clone
    $ npm install 
    $ gulp

### API

```js
storage.set({
  es: 5,
  html: 8
})
storage.get('es', function (data) {
  console.log('your data is here:', data)    
})
storage.remove('html')

```

