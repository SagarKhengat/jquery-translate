/*! 
 * jQuery Translate plugin 
 * 
 * Version: ${version}
 * 
 * http://code.google.com/p/jquery-translate/
 * 
 * Copyright (c) 2009 Balazs Endresz (balazs.endresz@gmail.com)
 * Dual licensed under the MIT and GPL licenses.
 * 
 * This plugin uses the 'Google AJAX Language API' (http://code.google.com/apis/ajaxlanguage/)
 * You can read the terms of use at http://code.google.com/apis/ajaxlanguage/terms.html
 * 
 */
;(function($){
		   
function $function(){}

var True = true, False = false, undefined, replace = "".replace,
	GL, GLL, toLangCode, inverseLanguages = {},
	loading, readyList = [],
	defaults = {
		from: "",
		to: "",
		start: $function,
		error: $function,
		each: $function,
		complete: $function,
		onTimeout: $function,
		timeout: 0,
		
		stripComments: True,
		stripWhitespace: True,
		stripScripts: True,
		separators: /\.\?\!;:/,
		limit: 1750,
		
		//TODO
		walk: True,
		returnAll: False,
		replace: True,
		rebind: True,
		data: True,
		setLangAttr: False,
		subject: True,
		not: "",
		altAndVal:True,
		async: False,
		toggle: False,
		fromOriginal: True
		
	};


function loaded(){
	$.translate.GL = GL = google.language;
	$.translate.GLL = GLL = GL.Languages;
	toLangCode = $.translate.toLanguageCode;
	
	$.each(GLL, function(l, lc){
		inverseLanguages[ lc.toUpperCase() ] = l;
	});
	
	$.translate.isReady = True;
	var fn;
	while((fn = readyList.shift())) fn();
}

function filter(obj, fn){
	var newObj = {};
	$.each(obj, function(lang, langCode){
		if( fn(langCode, lang) === True) newObj[ lang ] = langCode;
	});
	return newObj;
}

function bind(fn, thisObj, args){
	return function(){
		return fn.apply(thisObj === True ? arguments[0] : thisObj, args || arguments);
	};
}

function isSet(e){
	return e !== undefined;
}

function validate(args, overload, error){
	args = $.grep(args, isSet);
	
	var matched, obj = {};
	
	$.each(overload, function(_, el){
		var matches = $.grep(el[0], function(e, i){
				return isSet(args[i]) && args[i].constructor === e;
			}).length;
		if(matches === args.length && matches === el[0].length && (matched = True)){
			$.each(el[1], function(i, prop){
				obj[prop] = args[i];
			});
			return False;
		}
	});
	
	if(!matched) throw error;
	return obj;
}


function getOpt(args0, _defaults){
	//args0=[].slice.call(args0, 0)
	var args = validate(args0 , $.translate.overload, "jQuery.translate: Invalid arguments" ),
		o = args.options || {};
	delete args.options;
	o = $.extend({}, defaults, _defaults, $.extend(o, args));
	
	if(o.fromOriginal) o.toggle = True;
	if(o.toggle) o.data = True;
	if(o.async === True) o.async = 2;
	
	return o;
}



function T(){
	//copy over static methods during each instantiation
	//for backward compatibility and access inside callback functions
	this.extend($.translate);
	delete this.defaults;
	delete this.fn;
}

T.prototype = {
	version: "${version}",
	
	_init: function(t, o){ 
		var separator = o.separators.source || o.separators,
			isString = this.isString = typeof t === "string";
		
		$.each(["stripComments", "stripScripts", "stripWhitespace"], function(i, name){
			var fn = $.translate[name];
			if( o[name] )
				t = isString ? fn(t) : $.map(t, fn);
		});

		this.rawSource = "<div>" + (isString ? t : t.join("</div><div>")) + "</div>";
		this._m3 = new RegExp("[" + separator + "](?![^" + separator + "]*[" + separator + "])");
		this.options = o;
		this.from = o.from = toLangCode(o.from) || "";
		this.to = o.to = toLangCode(o.to) || "";
		this.source = t;
		this.rawTranslation = "";
		this.translation = [];
		this.startPos = 0;
		this.i = 0;
		this.stopped = False;
		this.elements = o.nodes;
		
		o.start.call(this, t , o.from, o.to, o);
		
		if(o.timeout)
			this.timeout = setTimeout(bind(o.onTimeout, this, [t, o.from, o.to, o]), o.timeout);
		
		(o.toggle && o.nodes) ?	this._toggle() : this._process();
	},
	
	_process: function(){
		if(this.stopped)
			return;
		var o = this.options,
			i = this.rawTranslation.length,
			lastpos, subst, divst, divcl;

		this.rawSourceSub = this.truncate( this.rawSource.substr(this.startPos), o.limit);
		this.startPos += this.rawSourceSub.length;
		
		while( (lastpos = this.rawTranslation.lastIndexOf("</div>", i)) > -1){

			i = lastpos - 1;
		
			subst = this.rawTranslation.substr(0, i + 1);
			/*jslint skipLines*/		
			divst = subst.match(/<div[> ]/gi);	
			divcl = subst.match(/<\/div>/gi);
			/*jslint skipLinesEnd*/
			
			divst = divst ? divst.length : 0;
			divcl = divcl ? divcl.length : 0;
	
			if(divst !== divcl + 1) continue; //if there are some unclosed divs

			var divscompl = $( this.rawTranslation.substr(0, i + 7) ), 
				divlen = divscompl.length, 
				l = this.i;
			
			if(l === divlen) break; //if no new elements have been completely translated

			divscompl.slice(l, divlen).each( bind(function(j, e){
				if(this.stopped)
					return False;
				var tr = $(e).html().replace(/^\s/, ""), i = l + j, src = this.source,
					from = !this.from && this.detectedSourceLanguage || this.from;
				this.translation[i] = tr;//create an array for complete callback
				this.isString ? this.translation = tr : src = this.source[i];
				
				o.each.call(this, i, tr, src, from, this.to, o);
				
				this.i++;
			}, this));
			
			break;
		}
		
		if(this.rawSourceSub.length)
			this._translate();
		else
			this._complete();
	},
	
	_translate: function(){
		GL.translate(this.rawSourceSub, this.from, this.to, bind(function(result){
			if(result.error)
				return this.options.error.call(this, result.error, this.rawSourceSub, this.from, this.to, this.options);
			
			this.rawTranslation += result.translation || this.rawSourceSub;
			this.detectedSourceLanguage = result.detectedSourceLanguage;
				
			this._process();
		}, this));
	},
	
	_complete: function(){
		clearTimeout(this.timeout);

		this.options.complete.call(this, this.translation, this.source, 
			!this.from && this.detectedSourceLanguage || this.from, this.to, this.options);
	},
	
	stop: function(){
		if(this.stopped)
			return this;
		this.stopped = True;
		this.options.error.call(this, {message:"stopped"});
		return this;
	}
};



$.translate = function(t, a){
	if(t == undefined)
		return new T();
	if( $.isFunction(t) )
		return $.translate.ready(t, a);
	var that = new T();
	
	var args = [].slice.call(arguments, 0);
	args.shift();
	return $.translate.ready( bind(that._init, that, [t, getOpt(args, $.translate.defaults)] ), False, that );
};


$.translate.fn = $.translate.prototype = T.prototype;

$.translate.fn.extend = $.translate.extend = $.extend;


$.translate.extend({
	
	_bind: bind,
	
	_filter: filter,
	
	_validate: validate,
	
	_getOpt: getOpt,
	
	_defaults: defaults, //base defaults used by other components as well //TODO
	
	defaults: $.extend({}, defaults),
	
	capitalize: function(t){ return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase(); },
	
	truncate: function(text, limit){
		var i, m1, m2, m3, m4, t, encoded = encodeURIComponent( text );
		
		for(i = 0; i < 10; i++){
			try { 
				t = decodeURIComponent( encoded.substr(0, limit - i) );
			} catch(e){ continue; }
			if(t) break;
		}
		
		return ( !( m1 = /<(?![^<]*>)/.exec(t) ) ) ? (  //if no broken tag present
			( !( m2 = />\s*$/.exec(t) ) ) ? (  //if doesn't end with '>'
				( m3 = this._m3.exec(t) ) ? (  //if broken sentence present
					( m4 = />(?![^>]*<)/.exec(t) ) ? ( 
						m3.index > m4.index ? t.substring(0, m3.index+1) : t.substring(0, m4.index+1)
					) : t.substring(0, m3.index+1) ) : t ) : t ) : t.substring(0, m1.index);
	},

	getLanguages: function(a, b){
		if(a == undefined || (b == undefined && !a))
			return GLL;
		
		var newObj = {}, typeof_a = typeof a,
			languages = b ? $.translate.getLanguages(a) : GLL,
			filterArg = ( typeof_a  === "object" || typeof_a  === "function" ) ? a : b;
				
		if(filterArg)
			if(filterArg.call) //if it's a filter function
				newObj = filter(languages, filterArg);
			else //if it's an array of languages
				for(var i = 0, length = filterArg.length, lang; i < length; i++){
					lang = $.translate.toLanguage(filterArg[i]);
					if(languages[lang] != undefined)
						newObj[lang] = languages[lang];
				}
		else //if the first argument is true -> only translatable languages
			newObj = filter(GLL, GL.isTranslatable);
		
		return newObj;
	},
	

	toLanguage: function(a, format){
		var u = a.toUpperCase();
		var l = inverseLanguages[u] || 
			(GLL[u] ? u : undefined) || 
			inverseLanguages[($.translate.languageCodeMap[a.toLowerCase()]||"").toUpperCase()];
		return l == undefined ? undefined :
			format === "lowercase" ? l.toLowerCase() : format === "capitalize" ? $.translate.capitalize(l) : l;				
	},
	
	toLanguageCode: function(a){
		return GLL[a] || 
			GLL[ $.translate.toLanguage(a) ] || 
			$.translate.languageCodeMap[a.toLowerCase()];
	},
		
	same: function(a, b){
		return a === b || toLangCode(a) === toLangCode(b);
	},
		
	isTranslatable: function(l){
		return GL.isTranslatable( toLangCode(l) );
	},

	//keys must be lower case, and values must equal to a 
	//language code specified in the Language API
	languageCodeMap: {
		"he": "iw",
		"zlm": "ms",
		"zh-hans": "zh-CN",
		"zh-hant": "zh-TW"
	},
	
	//use only language codes specified in the Language API
	isRtl: {
		"ar": True,
		"iw": True,
		"fa": True,
		"ur": True
	},
	
	getBranding: function(){
		return $( GL.getBranding.apply(GL, arguments) );
	},
	
	load: function(key, version){
		loading = True;
		function load(){ google.load("language", version || "1", {"callback" : loaded}); }
		
		if(typeof google !== "undefined" && google.load)
			load();
		else
			$.getScript("http://www.google.com/jsapi?" + (key ? "key=" + key : ""), load);
		return $.translate;
	},
	
	ready: function(fn, preventAutoload, that){
		$.translate.isReady ? fn() : readyList.push(fn);
		if(!loading && !preventAutoload)
			$.translate.load();
		return that || $.translate;
	},
	
	isReady: False,
	
	overload: [
	    [[],[]],
		[[String, String, Object], 	["from", "to", "options"]	],
		[[String, Object], 			["to", "options"]			],
		[[Object], 					["options"]					],
		[[String, String], 			["from", "to"]				],
		[[String], 					["to"]						],
		[[String, String, Function],["from", "to", "complete"]	],
		[[String, Function], 		["to", "complete"]			]
		 //TODO:remove:
		//,[[String, String, Function, Function], ["from", "to", "each", "complete"]]
	]
	/*jslint skipLines*/
	,
	//jslint doesn't seem to be able to parse some regexes correctly if used on the server,
	//however it works fine if it's run on the command line: java -jar rhino.jar jslint.js file.js
	stripScripts: bind(replace, True, [/<script[^>]*>([\s\S]*?)<\/script>/gi, ""]),
	
	stripWhitespace: bind(replace, True, [/\s\s+/g, " "]),
	
	stripComments: bind(replace, True, [/<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)>/g, ""])
	/*jslint skipLinesEnd*/
});


})(jQuery);