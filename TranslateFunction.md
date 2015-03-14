List of available languages: http://code.google.com/apis/ajaxlanguage/documentation/reference.html#LangNameArray

If you don't specify a source language it will be automatically detected. But in many cases it's better to set that too. You can use the long name of the language or just the language code ('en' or 'english'). You can send an array as the first argument or just some text to translate. If it is not an array then the returned values and the object's `source` and `translation` properties will be strings too.

```
//to german from any language:
$.translate( 'some text', 'de', {
  complete: function(translation){ console.log(translation); }
});

//from english to german:
$.translate( 'some text', 'en', 'de', {
  complete: function(translation){ console.log(translation); }
});

//translate an array with `each` callback:
$.translate( ['some text', 'some other text'], 'de', {
  each: function(i, translation){ console.log(translation[i]); }
});

//translate an array with `complete` callback, and source language:
$.translate( ['some text', 'some other text'], 'en', 'de', {
  complete: function(translation){ console.log(translation); }
});

//you can set the languges in the options too (setting as a separate parameter like above overrides it):
$.translate( ['some text', 'some other text'], { 
  from:'de', 
  to:'en', 
  complete: function(translation){ console.log(translation); }
});

//as of v1.4 you can specify the complete callback without the config object:
$.translate( ['some text', 'some other text'], 'de', 'en',  function(translation){
     console.log(translation); 
});
```

## Options ##

Override defaults with `$.translate.defaults`:
```
  $.translate.defaults = { error: function(){ ... } };
  //or
  $.translate.defaults.error = function(){ ... };
```


These are the default values after each option:

  * start: function(){}
    * arguments: source, from, to, options
  * error: function(){}
    * google's results.error will be passed (an error stops the script completely)
    * if you stop the translation with the internal `stop()` method it returns {message:'stopped'}
  * each: function(){}
    * arguments: i, translation[i](i.md), source[i](i.md), from, to, options
  * complete: function(){}
    * arguments: translation, source, from, to, options
    * the translation and source arguments are arrays or strings depending on which was translated
  * onTimeout: function(){}
    * the requests won't be aborted automatically (call `this.stop()` if you want to stop the translation)
    * arguments: source, from, to, options
  * timeout: 0
    * timeout in ms
  * comments: false
    * removed in v1.4
    * false: removes html comments from the source text/array
    * true: comments will be translated too

### options added in v1.4 ###
  * stripWhitespace: true
  * stripScripts: true
  * stripComments: true
  * limit: 1750
    * here you can specify how long the url-encoded text should be that is sent to the Language API
    * the whole url must be less than 2000 characters long including the domain name and other parameters
    * you can increase this value slightly, but if it gets too large some requests will fail
  * separators: /\.\?\!;:/
    * a regex that specifies the end of a sentence

  * parallel (added in 1.4.3)
    * requests can be sent in parallel to speed up the translation
    * false or zero: requests are sent after each response is recieved
    * true: requests are sent all at once (can hang larger pages)
    * number: the delay in milliseconds after each request is initiated


## Public properties ##

You can use the internal methods after `this` inside the callback functions, and the object's properties are also available:
  * this.i //the index of the current element
  * this.translation (array) //if just a single string was translated this is a string too
  * this.source (array) //if just a single string was translated this is a string too
  * this.options
  * this.from //langCode
  * this.to //langCode
```
$.translate(['some text', 'some other text'], 'en', 'de', {
  each: function(i){
    console.log( this.translation[i] ) // i==this.i
  }
})
```