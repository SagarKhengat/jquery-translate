List of available languages: http://code.google.com/apis/ajaxlanguage/documentation/reference.html#LangNameArray

If you don't specify a source language it will be automatically detected. But in many cases it's better to set that too. You can use the long name of the language or just the language code ('en' or 'english') and it isn't case-sensitive either.

```
$(function(){ //on document ready
  //to german from any language:
  $('body').translate('de');
	
  //from english to german:
  $('body').translate('en', 'de');
	
  //with options:
  $('body').translate('de', { toggle: true } );
  $('body').translate('en', 'de', { toggle: true } );
  
  //you can set the languges in the options too (setting as a separate parameter like above overrides it):
  $('body').translate( { from: 'en', to: 'de', toggle: true} );

  //as of v1.4 you can also pass a complete callback as the third argument:
  $('body').translate('en','de', function(){ alert("complete"); });
})
```

## Options ##

Override defaults with `$.fn.translate.defaults`:
```
  $.fn.translate.defaults = { returnAll:true };
  //or
  $.fn.translate.defaults.returnAll = true;
```


These are the default values after each option:

  * fromOriginal: false / default changed to `true` in v1.4 /
    * use only if you have specified a source language
    * if you have translated elements to a language and want to translate them again this will force the plugin to use the original text (from the language you specified to translate from) as the source text
    * `toggle` and `data` will be true automatically
  * toggle: false
    * true: all translation will be cached (stored with $.data) and used if it's found, or translated to otherwise
    * if the text on the page doesn't change you can set it to true: this will return the translation immediately if it was stored before
  * async: false
    * this prevents the browser from freezing on larger sites by executing each DOM filtering iteration with a delay (it doesn't affect the request sent to Google)
    * you can set the length of the delay in ms, setting it true means 2 ms
    * the returnAll option won't work, it will return the jQuery object immediately
  * data: true
    * store source and translated text with $.data
    * `$(el).data("translation")[langCode][type]` where `type` is either `"html"` or the name of an attribute:
    * $("p").data("translation")["en"]["html"] or $(":input").data("translation")["en"]["value"]
    * **changed in 1.4.0:** "$val" and "$html" is used instead of "value" and "html" ("attribute" can be used more safely)

  * walk: true
    * true: finds elements having textnodes and translates only their content; on very large and complex pages this might take some time (see the `async` option)
    * false: translates the given elements' .html(), generates more requests
    * this requires the jQuery.fn.nodesContainingText plugin (included along with other modules)
  * returnAll: false
    * true: returns all elements, which have textnodes (see the `walk` option)
    * using .end() after this returns the caller object
    * false: returns the caller jQuery object
  * not: ""
    * selector - elements to leave out (script, noscript, style, object and iframe elements will be omitted either this is set or not)
    * doesn't work for elements having textnode siblings, as the whole content of their parent node will be translated (see the `walk` option),
    * in this case, you have to add a `notranslate` class to those elements before the translation: `$(selector).addClass("notranslate");  $("body").translate(...);`
    * alternatively you can use the `.translateTextNodes()` method instead, see: TextnodeTranslatorIntegration
  * replace: true
    * replace original text on the page with the translation
  * rebind: true
    * rebind event handlers for elements translated as html (see the `walk` option)

  * subject: true
    * if some text is given, only that html attribute will be translated
  * altAndVal: true
    * translate `alt` and `:button,:text,:reset`'s `value` attribute too when translating text/html
    * these don't have any textnodes, so they can be processed along with other nodes if the `subject` option is `true`
  * setLangAttr: false
    * store destination language code in the html lang attribute for each element
    * true: set the 'lang' attribute
    * false: don't set any attribute
    * string: set that html attribute
  * comments: false
    * removed in v1.4
    * true: translates comments too when an element's .html() is tranlated,
    * false: removes the comments, when an element's .html() is tranlated
    * comments might be only translated if they have textnode siblings (see the `walk` option)

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
  * trim: true (added in 1.4.7)
    * the translation always contains some extra whitespace which is removed by default with `$.trim`, setting this option to `false` keeps the spaces
  * alwaysReplace: false (added in 1.4.7)
    * by default if the translation is in the same language as the current text, then it's not replaced (see [issue #38](https://code.google.com/p/jquery-translate/issues/detail?id=#38))
    * most likely you also have to set `toggle: false, fromOriginal:false`

### Callback functions ###

These are passed to the `options` too. You can use the internal methods after `this` inside these, and the object's properties are also available:
  * this.i //the index of the current element
  * this.elements (array) // filtered elements, this.elements.end() returns the caller object (unfiltered)
  * this.translation (array)
  * this.source (array)
  * this.options
  * this.from //langCode
  * this.to //langCode
```
$('body').translate('en', 'de', {
  each: function(i){
    console.log( this.translation[i] ) // i==this.i
  }
})
```

  * start: function(){}
    * arguments: elements (jQuery object), from, to, options
    * these are the filtered elements if the walk option was true (use .end() to return the original set)
    * **v1.4.0:** arguments: filtered elements, source, from, to, options
  * error: function(){}
    * google's [results.error object](http://code.google.com/apis/ajaxlanguage/documentation/reference.html#translateResult) will be passed (an error stops the script completely)
    * if you stop the translation with the internal `stop()` method it returns {message:'stopped'}
  * each: function(){}
    * executes after each element was translated
    * arguments: i, DOMelement, `translation[i]`, `source[i]`, from, to, options
  * complete: function(){}
    * arguments: original elements, filtered elements, translation (array), source (array), from, to, options
    * **v1.4.0:** the `original elements` object was removed, use elements.end() instead
    * the from argument is the sourceLangCode from the last part of the translation (if it was detected then that one)
  * onTimeout: function(){}
    * the requests won't be aborted automatically (use `this.stop()` inside it if you want to stop it)
    * arguments: filtered elements, from, to, options
    * **v1.4.0:** arguments: filtered elements, source, from, to, options
    * use elements.end() to get the original set of elements
  * timeout: 0
    * time after the onTimeout will fire (in ms)


_In the comment below you may notice the copyEvents plugin: this is no longer needed, a bit different function is included in the plugin._