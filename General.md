## Usage ##

Simply include the plugin after jQuery, it loads all the necessary stuff from Google. (If you can load the jsapi.js or the language API before, they won't be loaded again.)
```
<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript" src="js/jquery.translate.js"></script>
```

If you want to use the plugin on page load in most cases you can call it inside `$(document).ready()` but in some cases you have to define a callback function to be executed when the Language API is loaded. It's not `$(document).ready()` but `$.translate.ready()`:

```
$.translate.load(bingAppID_or_GoogleAPIkey);

$(document).ready(function(){
  //this will work,
  //returns a jQuery object and translates the text when the Language API is loaded
  $('body').translate('english');

  //this will work too,
  //returns an internal object and translates the text when the Language API is loaded
  $.translate( 'some text', 'de', {
    complete: function(){
		console.log( this.translation )
    }
  });

  //this won't (always) work!
  //the Language API may not be loaded, the return value cannot be determined
  $.translate.getLanguages();
  
  //this will work, as it will be executed when the Language API is loaded
  $.translate.ready(function(){
    $.translate.getLanguages() 
  })
  
  //you can also use a shorter alias as in jQuery:
  $.translate(function(){
    $.translate.getLanguages()
  })

})
```

As you can see above you can translate an html element (first example) or only some text (second example).
These functions are described in depth in the other wiki pages:
  * [$(...).translate( lang, ... ) ](TranslateMethod.md)
  * [$.translate( text, lang, ... ) ](TranslateFunction.md)
  * [Additional extensions](Extensions.md)

A typical implementation is in the links section on the main page.

## Public methods and properties ##

These methods can be called after `$.translate`, and inside callback functions too after `this`:

```
$('body').translate('english',{
  start:function(){
    var lang = this.getLanguages( true );
	console.log( lang );
  }
});

//if you don't want to translate anything, just get the translatable languages:
var lang = $.translate.getLanguages( true );
console.log( lang );

```


  * ready( function(){...} )
    * executes the function supplied if/when the language API is loaded, see above
  * load( APIkey, version )
    * loads jsapi.js and the Language API, both arguments are optional
  * stop()
    * stops the translation
    * this can't be used as a static method, only after `this` inside callback functions
  * toLanguage( langCode OR language, format  )
    * returns the name of the language based on the first argument
    * `format` can be: 'lowercase', 'uppercase', 'capitalize' (default is uppercase)
  * toLanguageCode( langCode OR language )
    * returns the language code based on the first argument
  * getLanguages( translatable )
    * returns the `google.language.Languages` object (the available languages)
    * if the first argument is `true` it returns only the translatable languages
    * http://code.google.com/apis/ajaxlanguage/documentation/reference.html#LangNameArray
    * if the last argument is an array containing languages then the results will be filtered based on them
  * isTranslatable( langCode OR language )
    * returns `true` if the languge is translatable, `false` if it's not and `undefined` it doesn't exist
  * same(lang1, lang2)
    * determines whether two languages are the same or not
    * this might be useful as the plugin accepts both e.g "en" or "English", and isn't case-sensitive either
  * getBranding( opt\_element, opt\_options )
    * DEPRECATED as of [r244](https://code.google.com/p/jquery-translate/source/detail?r=244): returns an empty jQuery object, will be removed in the future
    * This method is a static helper function that returns a "powered by Google" HTML DOM branding node as a jQuery object, and optionally attaches it to the optional element. The purpose of this method is to ensure that your application has a simple way to comply with branding requirements.
    * opt\_element - The optional element or element id to attach the branding into the DOM.
    * opt\_options - The optional options map. Currently the only supported key value is type which can accept a value of 'vertical' or 'horizontal'
    * http://code.google.com/apis/ajaxlanguage/documentation/reference.html#branding

Added in **v1.4:**
  * capitalize :: function
  * isReady :: boolean
    * shows if the translation API is loaded
  * languageCodeMap :: object
    * you can specify alternative language codes here
    * in v1.4.0 it looks like this:
```
//keys must be lower case, and values must equal to a 
//language code specified in the Language API
$.translate.languageCodeMap = {
  "he": "iw",
  "zlm": "ms",
  "zh-hans": "zh-CN",
  "zh-hant": "zh-TW"
};
```
  * $.translate.overload :: array `*` array `*` array
```
 //you can overload the $.translate and $.fn.translate functions like this:
 $.translate.overload.push([
   [String, String, Function, Function], ["from", "to", "each", "complete"]
 ]);
```


## Components (before v1.4) ##

The plugin initially was just a single file and you can get it like that too, but if you don't need some functionality you can use just the modules you want:
  * core (translation)
    * this contains the above helper functions and the translation stuff
  * jQuery.fn.nodesContainingText
    * this module has become a separate jQuery plugin: it returns those elements, which contain some text
    * you will most likely need this too, but it's not necessary
  * language detection
    * removed since version 1.3
  * other smaller extensions:
    * ui: you can generate html elements containing the translatable languages (e.g. a dropdown menu)
    * progress: returns how much text has been translated, or updates a given jQuery UI progressbar component

( You can also extend it the same way like jQuery: `$.translate.fn.extension=function(){...}` where fn is an alias for the objects prototype. )

## How it works? ##

  1. Gathers all nodes that contain text ( if a node has text and other child nodes at the same level than its innerHTML will be translated).
  1. Serializes the array of extracted texts (puts each one in a div to simulete array functionality).
  1. Splits this string into smaller segments (there's a character limit per request), so that no sentences or html tags will be broken.
  1. Starts translating these segments.
  1. If a `div` (that stands for an item of the 'array') is completely translated it will be inserted to the doocument (then the `each` callback fires).
  1. If some html elements got replaced (not just their textnodes) then it rebinds event handlers attached to them (but won't replace script elements).

## Why use it? ##

  * Safely reduces the number of AJAX API calls (by about 20-40%) compared to translating only innerHTML.
  * You can translate an array of strings and the results are returned faster, don't have to wait for all the elements.
  * Don't have to exactly specify what to translate, just container elements (like `$('body').translate('de')`).
  * Simple jQuery-stlye syntax, automatic event rebinding, `start, each, complete, error, timeout` callback functions and other options.
  * Ability to stop a translation, convenience methods for getting available/translatable languages or getting the language from language code.
  * You don't have to get around the character limit.
  * The translations can be stored and recalled automatically (see: `fromOriginal`, `toggle` and `data` options)

## Some sites using this plugin ##

  * Send me the link of your site if you'd like it listed here. If I come across one I'll put it here without asking, so that I don't have to write demo apps. Let me know if you don't want it listed.
  * [Wordpress plugin](http://wordpress.org/extend/plugins/google-ajax-translation/)
  * http://simos.info/blog
  * http://www.texasonline.com (using a very old version)
  * http://www.seconddrawer.com.au
  * http://www.issaquah.wednet.edu
  * http://www.formreturn.com
  * http://warmshowers.org using a [Drupal module](http://drupal.org/project/translatableregions)

If you have questions, noticed some bug, or have any ideas feel free to write here or by mail. Also, **using the bug tracker is appreciated**!