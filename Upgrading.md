**This page is supposed to ease the transition to newer versions of the plugin. Only those changes are listed here that affect backwards compatibility, for a more complete list including new features see the ReleaseNotes.**


---

**1.4.3**
  * new option: `parallel`
    * requests can be sent in parallel to speed up the translation
    * `false` or zero: requests are sent after each response is recieved
    * `true`: requests are sent all at once (can hang larger pages)
    * number: the delay in milliseconds after each request is initiated

**1.4.2**
  * `$(...).translateTextNodes()` has mostly the same functionality as `$(...).translate()` (TextnodeTranslatorIntegration)

# 1.4.0 #

  * $.translate.ui:
    * The html structure changed: when generating a dropdown the value of each field is now a language code,
> > which means jQuery's `.val()` method now returns a language code instead of the displayed text.
> > You have the modify you're code accordingly if you compared for example "English" to that value, now you have to do that with "en"!

  * $.data storage: the old method is now removed
    * old: `$(el).data("translation." + language + "." + type);`
    * new: `$(el).data("translation")[language][type];`
  * $.data changes: `"$val"` and `"$html"` is used as `type` instead of `"value"` and `"html"` ("attribute" can be used more safely)

  * $.fn.translate callback function arguments changed:
    * `complete`: the second `elements` object was removed, use this.elements.end() instead
    * `start` and `onTimeout`: this.elements is inserted before this.source, not replaced with it

  * the `fromOriginal` option is now defaults to true (you can omit this option now)
    * if you haven't used this option before you might have to make changes to your code

  * `comments` option removed, these can be used instead: stripWhitespace:true, stripScripts:true, stripComments:true


---


**1.3.6**: script, noscript, style, object, and iframe tags are all excluded by default

**1.3.5**: when the altAndVal option is enabled, the alt attribute of input type="image" is also translated

# 1.3 #

### API changes ###

  * utility methods are basically static, but copied over on instantiation, i.e. you can now use `$.translate.getLanguages()` instead of `$.translate().getLanguages()` but the latter will work too

  * $.data storage: the old method is deprecated (it will work until the next major version)
    * old: `$(el).data("translation." + language + "." + type);`
    * new: `$(el).data("translation")[language][type];`
    * this is much more useful in many cases

  * `toLanguage` method now returns undefined instead of "unknown" if there's no match (unlike in the example code on the official Language API docs site)

### The Google API is loaded only when it's needed ###

  * the Google jsapi and the Language API isn't loaded right when the plugin loads only when its first used
  * you can load it manually by calling $.translate.load() but it's not necessary
  * if you use the ready callback then it's loaded automatically:
```
$.translate.ready(function(){
alert( $.translate.getLanguages() );
});  //things load, function fires when it's done
```
  * using $.translate("text", {...}) and $("#content").translate({...}) triggers .load() automatically, you don't need to put them in a ready callback.

  * if the second argument in the ready callback is true then things don't load automatically:
```
$.translate.ready(function(){
alert( $.translate.getLanguages() );
}, true);  //things will NOT start loading now
```

### Language detection removed ###

  * The language detection part has been removed. It doesn't really need that much abstraction, it's much easier to use the original API. (But that doesn't hold for the translation at all!) Here's a short example using only the core module:
```
$(function(){ //DOM ready
$.translate(function(){ //when the api is loaded

    $('body').nodesContainingText().each(function(){
    //or only $('body').find("*").each(function(){
  
      var $el = $(this), text = $el.text() || $el.val();
  
      google.language.detect(text, function(result) {
        if (!result.error) {
            //convert the languageCode:
            var language = $.translate.toLanguage(result.language);
            //do something with it:
            $('body').prepend(text + " is: " + language + "( " + result.language + ") <br/>");
            $el.attr("lang", result.language);
        }
      });
  
    });

});
});
```

### New features ###

  * `getLanguages` method: the last argument can be used for filtering languages:
    * `$.translate.getLanguages(true, ["en", "de", "af"])` //filters only from translatable ones ("af" is not included)
    * `$.translate.getLanguages(["en", "af"])` //returns both: {ENGLISH: "en", AFRIKAANS: "af"}
  * `same` method: `$.translate.same(lang1, lang2) => Boolean`
  * `extend` method: `$.translate.extend({...})` and `$.translate.fn.extend({...})` (works the same way as `$.extend`)
  * `load` method

### Some other notable changes ###

  * The length of each chunks of text is now determined by their urlencoded length, which greatly increases reliability. (The GET request sent to Google has to be at most 2000 (urlencoded) characters long due to mainly IE's restriction)
  * limit option has been removed, because it would have different meaning and isn't necessary any more (see the previous point)
  * The plugin works without the nodesContainingText plugin or without the separated DOM module. (In case you need only some basic functionality)
  * numberOfCalls property is removed