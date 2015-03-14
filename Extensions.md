# jquery.translate.ui #

Simple extension to generate an element based on the translatable languages.
You can try this here: http://docs.jquery.com/Main_Page by running it with Firebug ( http://getfirebug.com/ ).

```
$.getScript('http://jquery-translate.googlecode.com/files/jquery.translate-1.3.9.min.js', function(){ //when the script is loaded
  $.translate(function(){ //when the Google Language API is loaded

    $.translate.ui('select', 'option') //generate dropdown
      .change(function(){ //when selecting another language
        $('body').translate( 'english', $(this).val(), { //translate from english to the selected language
          not: '.option, #demo, #source, pre, .jq-translate-ui', //exclude these elements
          fromOriginal:true //always translate from english (even after the page has been translated)
        })
      })
      .val('en') //select English as default
      .appendTo('#jq-primaryNavigation'); //insert the dropdown to the page
    
    //insert Google's logo after the dropdown:
    $.translate.getBranding().appendTo('#jq-primaryNavigation');

  });
});
```

On other sites this will only work if jQuery was included before. Also, you have to append it to an existing element: `.appendTo('h1')` or `.prependTo('body')`

Since **v1.4**, you can also use a config object as the only argument, for example these are the defaults:
```
$.translate.ui({
  tags: ["select", "option"],
  //a function that filters the languages:
  filter: $.translate.isTranslatable, //this can be an array of languages/language codes too
  //a function that returns the text to display based on the language code:
  label: $.translate.toNativeLanguage ||
         function(langCode, lang){
           return $.translate.capitalize(lang);
         },
  //whether to include the UNKNOWN:"" along with the languages:
  includeUnknown: false
}).prependTo('body');
```

# jquery.translate.progress #

This small extensions helps you to integrate jQuery UI's progressbar component.

```
$(function(){ //DOM ready
  $('body').translate('de',{
    each: function(){
      this.progress("#progressbar" /* , options */ )
    }
  })
});
```

Available options to initialize the progressbar here: http://docs.jquery.com/UI/Progressbar/progressbar#options
The progressbar will be automatically updated as each element gets translated.

Without arguments it will return a number between 0 and 100, with which you can manually update the progressbar component or just update some field on the page.

Official jQuery UI demo: http://ui.jquery.com/demos/progressbar/


---


# Extensions added in **v1.4.0** #

The `translateLanguages` function ~~is currently included in the `native` extension~~ was removed in v1.4.1, you can copy it from here.

### Native language names ###

  * $.translate.nativeLanguages
```
$.translate.nativeLanguages = {
  "sq":"Shqipe",
  "ar":"العربية",
  "bg":"Български",
  "ca":"Català",
  "zh":"中文",
  "zh-CN":"简体中文",
  "zh-TW":"繁體中文",
  "nl":"Nederlands",
  "en":"English",
...
...
};
```
  * $.translate.toNativeLanguage(lang)

### paralell ###
  * $.translate.defer
  * $.translate.run

For example, this can be used to translate language names to the corresponding languages, then get a notification when it's all done:

```
function translateLanguages(languages, callback){
  delete languages.UNKNOWN;
  var deferred = []; //instances to be executed later are collected here
  $.each(languages, function(l, lc){
      if( $.translate.nativeLanguages[lc] ){ return; } //if there's already a translation
      
      var deferredInstance = 
               $.translate.defer( $.translate.capitalize(l), "en", lc, 
                         function(tr){ $.translate.nativeLanguages[lc] = tr; });
      deferred.push( deferredInstance );
  });

  if(!deferred.length) //if there's nothing to translate
    callback();
  else
    $.translate.run(deferred, callback);
}

//translate all translatable languages:
translateLanguages($.translate.getLanguages(true), function(){ alert("done") })
```