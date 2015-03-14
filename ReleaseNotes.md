Up to v1.4.6, the release notes were added on the [jQuery plugins site](http://plugins.jquery.com/project/translate), but they are not even visible for 1.4.x, also I can't access any page if I'm logged in, so it's no longer maintained there.

### 1.4.7 ###
  * languageCodeMap: "pt-br" -> "pt-PT"
  * new options: trim:true, alwaysReplace:false
  * translateTextNodes: spaces are no longer removed (trim:false)


### 1.4.1 ###

  * "yi" is listed in the rtl languages
  * fixed: the second translation didn't work properly
  * fixed: stripScripts:false didn't work
  * $.translate.translateLanguages function removed, you can find it in the wiki

# 1.4.0 #

download builder: http://jquery-translate.appspot.com/

  * $.translate.ui "overhaul"
  * new: native language support
    * $.translate.nativeLanguages
    * $.translate.toNativeLanguage(langCode)
    * $.translate.translateLanguages(languagesEnum, callback)
  * $.translate.getLanguages accepts a function as a filter
  * $.translate.toLanguageCode typo fixed -> faster
  * toLanguage enhanced
  * new: $.translate.languageCodeMap
    * alternative language code scan be specified here
    * see [issue 11](https://code.google.com/p/jquery-translate/issues/detail?id=11)
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
  * removed:
> > $.data(el, "translation." + from + "." + type, s);


> $.data(el, "translation." + to   + "." + type, t);

  * changed default: fromOriginal: true
  * new: $.translate.capitalize
  * new: stripWhitespace:true, stripScripts:true, stripComments:true (comments option removed)
  * new: $.translate.overload
```
   //you can overload the $.translate and $.fn.translate functions like this:
   $.translate.overload.push([
     [String, String, Function, Function], ["from", "to", "each", "complete"]
   ]);
```
  * new: $.translate last argument can be a callback function, if there aren't any options
  * $.translate.load: apiName argument removed
  * $.fn.translate: complete callback: second elements was removed, use this.elements.end() instead
  * $.fn.translate: start and onTimeout callbacks: this.elements is inserted before this.source, not replaced with it
  * $.translate static methods: getData, setData, replace, each:
```
	each: function(){
	 	//do something with the arguments
		this.each.apply(this, arguments);
	}
```
  * new option: limit (max length of urlEncoded string)
  * new option: separators: a regex that specifies the end of a sentence, default: /\.\?\!;:/
  * data changes: "$val" and "$html" is used instead of "value" and "html" ("attribute" can be used more safely)
  * $.translate.isReady: true if the Language API is loaded
  * $.translate.fn.`_`translate can be overridden allowing to plug in other translation services:
```
	//the Google API won't be loaded, you have to load the other service manually
	$.translate.isReady = true; 
    
	//this is a basic implementation for the Google Language API:
	$.translate.fn._translate = function(){ //or $.translate.prototype._translate
		var instance = this;
		google.language.translate(this.rawSourceSub, this.from, this.to, function(result){
			instance.rawTranslation += result.translation;
			instance._process();
		});
	};
```