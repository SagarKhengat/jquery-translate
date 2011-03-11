/*! 
 * jQuery nodesContainingText plugin 
 * 
 * Version: 1.1.1
 * 
 * http://code.google.com/p/jquery-translate/
 * 
 * Copyright (c) 2009 Balazs Endresz (balazs.endresz@gmail.com)
 * Dual licensed under the MIT and GPL licenses.
 * 
 */
 
;(function($){

function Nct(){}

Nct.prototype = {
	init: function(jq, o){
		this.textArray = [];
		this.elements = [];
		this.options = o;
		this.jquery = jq;
		this.n = -1;
		if(o.async === true)
			o.async = 2;
		
		if(o.not){
			jq = jq.not(o.not);
			jq = jq.add( jq.find("*").not(o.not) ).not( $(o.not).find("*") );
		}else
			jq = jq.add( jq.find("*") );

		this.jq = jq;
		this.jql = this.jq.length;
		return this.process();

	},

	process: function(){
		this.n++;
		var that = this, o = this.options, text = "", hasTextNode = false,
			hasChildNode = false, el = this.jq[this.n], e, c, ret;
		
		if(this.n === this.jql){
			ret = this.jquery.pushStack(this.elements, "nodesContainingText");
			o.complete.call(ret, ret, this.textArray);
			
			if(o.returnAll === false && o.walk === false)
				return this.jquery;
			return ret;
		}
		
		if(!el)
			return this.process();
		e=$(el);

		var nodeName = el.nodeName.toUpperCase(),
			type = nodeName === "INPUT" && $.attr(el, "type").toLowerCase();
		
		if( ({SCRIPT:1, NOSCRIPT:1, STYLE:1, OBJECT:1, IFRAME:1})[ nodeName ] )
			return this.process();
		
		if(typeof o.subject === "string"){
			text=e.attr(o.subject);
		}else{	
			if(o.altAndVal && (nodeName === "IMG" || type === "image" ) )
				text = e.attr("alt");
			else if( o.altAndVal && ({text:1, button:1, submit:1})[ type ] )
				text = e.val();
			else if(nodeName === "TEXTAREA")
				text = e.val();
			else{
				//check childNodes:
				c = el.firstChild;
				if(o.walk !== true)
					hasChildNode = true;
				else{
					while(c){
						if(c.nodeType == 1){
							hasChildNode = true;
							break;
						}
						c=c.nextSibling;
					}
				}

				if(!hasChildNode)
					text = e.text();
				else{//check textNodes:
					if(o.walk !== true)
						hasTextNode = true;
					
					c=el.firstChild;
					while(c){
						if(c.nodeType == 3 && c.nodeValue.match(/\S/) !== null){//textnodes with text
							/*jslint skipLines*/
							if(c.nodeValue.match(/<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)>/) !== null){
								if(c.nodeValue.match(/(\S+(?=.*<))|(>(?=.*\S+))/) !== null){
									hasTextNode = true;
									break;
								}
							}else{
								hasTextNode = true;
								break;
							}
							/*jslint skipLinesEnd*/
						}
						c = c.nextSibling;
					}

					if(hasTextNode){//remove child nodes from jq
						//remove scripts:
						/*jslint skipLines*/
						text = e.html().replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
						/*jslint skipLinesEnd*/
						this.jq = this.jq.not( e.find("*") );
					}
				}
			}
		}

		if(!text)
			return this.process();
		this.elements.push(el);
		this.textArray.push(text);

		o.each.call(el, this.elements.length - 1, el, text);
		
		if(o.async){
			setTimeout(function(){that.process();}, o.async);
			return this.jquery;
		}else
			return this.process();
		
	}
};

var defaults = {
	not: "",
	async: false,
	each: function(){},
	complete: function(){},
	comments: false,
	returnAll: true,
	walk: true,
	altAndVal: false,
	subject: true
};

$.fn.nodesContainingText = function(o){
	o = $.extend({}, defaults, $.fn.nodesContainingText.defaults, o);
	return new Nct().init(this, o);
};

$.fn.nodesContainingText.defaults = defaults;

})(jQuery);/*!
 * Translator
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 5/26/2008
 *
 * @projectDescription JS Class to translate text nodes.
 * @author Ariel Flesler
 * @version 1.0.1
 */
 
/*
 * The constructor must receive the parsing function, which will get the text as parameter
 * To use it, call the method .traverse() on the starting (root) node.
 * If the parsing is asynchronous (f.e AJAX), set sync to false on the instance.
 * When doing so, the parser function receives an extra argument, which is a function
 * that must be called passing it the parsed text.
 */
function Translator( parser, filter ){
	this.parse = parser; // function that parses the original string
	this.filter = filter; // optional filtering function that receives the node, and returns true/false
};
Translator.prototype = {
	translate:function( old ){ // translates a text node
		if( this.sync )
			this.replace( old, this.parse(old.nodeValue) );
		else{
			var self = this;
			this.parse( old.nodeValue, function( text ){
				self.replace( old, text );
			});
		}
	},
	makeNode:function( data ){
		if( data && data.split ) // replacing for a string
			data = document.createTextNode(data);
		return data;
	},
	replace:function( old, text ){ // Replaces a text node with a new (string) text or another node
		if( text != null && text != old.nodeValue ){
			var parent = old.parentNode;
			if( text.splice ){ // Array
				for( var i = 0, l = text.length - 1; i < l; )
					parent.insertBefore( this.makeNode(text[i++]), old );
				text = this.makeNode(text[l] || ''); // Last
			}else
				text = this.makeNode(text);
			parent.replaceChild( text, old );
		}
	},
	valid:/\S/, // Used to skip empty text nodes (modify at your own risk)
	sync:true, // If the parsing requires a callback, set to false
	traverse:function( root ){ // Goes (recursively) thru the text nodes of the root, translating
		var children = root.childNodes,
			l = children.length,
			node;
		
		while( l-- ){
			node = children[l];
			if( node.nodeType == 3 ){ // Text node
				if( this.valid.test(node.nodeValue) ) // Skip empty text nodes
					this.translate( node );
			}else if( node.nodeType == 1 && (!this.filter || this.filter(node)) ) // Element node
				this.traverse( node );
		}
	}
};
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


})(jQuery);/*!-
 * jQuery.fn.nodesContainingText adapter for the jQuery Translate plugin 
 * Version: ${version}
 * http://code.google.com/p/jquery-translate/
 */
;(function($){

var True = true,
	isInput = {text:True, button:True, submit:True},
	dontCopyEvents = {SCRIPT:True, NOSCRIPT:True, STYLE:True, OBJECT:True, IFRAME:True},
	$fly = $([]);

$fly.length = 1;


function toggleDir(e, dir){
	var align = e.css("text-align");
	e.css("direction", dir);
	if(align === "right") e.css("text-align", "left");
	if(align === "left") e.css("text-align", "right");
}

function getType(el, o){
	var nodeName = el.nodeName.toUpperCase(),
		type = nodeName === 'INPUT' && $.attr(el, 'type').toLowerCase();
	o = o || {altAndVal:True, subject:True};
	return typeof o.subject === "string" ? o.subject :
		o.altAndVal && (nodeName === 'IMG' || type === "image" )  ? "alt" :
		o.altAndVal && isInput[ type ] ? "$val" :
		nodeName === "TEXTAREA" ? "$val" : "$html";
}

$.translate.fn._toggle = function(){
	var o = this.options, to = o.to, stop;
	
	this.elements.each($.translate._bind(function(i, el){
		this.i = i;
		var e = $(el), tr = $.translate.getData(e, to, o);
		
		if(!tr) return !(stop = True);
		
		this.translation.push(tr);
		this.replace(e, tr, to, o);
		this.setLangAttr(e, to, o);

		o.each.call(this, i, el, tr, this.source[i], this.from, to, o);
		//'from' will be undefined if it wasn't set
	}, this));
	
	!stop ? this._complete() : this._process();
	//o.complete.call(this, o.nodes, this.translation, this.source, this.from, this.to, o)
};



$.translate.extend({
	_getType: getType,
	
	each: function(i, el, t, s, from, to, o){
		$fly[0] = el;
		$.translate.setData($fly, to, t, from, s, o);
		$.translate.replace($fly, t, to, o);
		$.translate.setLangAttr($fly, to, o);
	},
	
	getData: function(e, lang, o){
		var el = e[0] || e, data = $.data(el, "translation");
		return data && data[lang] && data[lang][ getType(el, o) ];
	},
	
	setData: function(e, to, t, from, s, o){
		if(o && !o.data) return;
		
		var el = e[0] || e,
			type = getType(el, o),
			data = $.data(el, "translation");
		
		data = data || $.data(el, "translation", {});
		(data[from] = data[from] || {})[type] = s;
		(data[to] = data[to] || {})[type] = t;
	},
	
	
	replace: function(e, t, to, o){
		if(o && !o.replace) return;
		
		if(o && typeof o.subject === "string")
			return e.attr(o.subject, t);

		var el = e[0] || e, 
			nodeName = el.nodeName.toUpperCase(),
			type = nodeName === 'INPUT' && $.attr(el, 'type').toLowerCase(),
			isRtl = $.translate.isRtl,
			lang = $.data(el, "lang");
		
		if( lang === to )
			return;
		
		if( isRtl[ to ] !== isRtl[ lang || o && o.from ] ){
			if( isRtl[ to ] )
				toggleDir(e, "rtl");
			else if( e.css("direction") === "rtl" )
				toggleDir(e, "ltr");
		}
				
		if( (!o || o.altAndVal) && (nodeName === 'IMG' || type === "image" ) )
			e.attr("alt", t);
		else if( nodeName === "TEXTAREA" || (!o || o.altAndVal) && isInput[ type ] )
			e.val(t);
		else{
			if(!o || o.rebind){
				var origContents = e.find("*").not("script"), newElem = $("<div/>").html(t);
				$.translate.copyEvents( origContents, newElem.find("*") );
				e.html( newElem.contents() );
			}else
				e.html(t);
		}
		
		//used for determining if the text-align property should be changed,
		//it's much faster than setting the "lang" attribute, see bug #13
		$.data(el, "lang", to);
	},
	
	setLangAttr: function(e, to, o){	
		if(!o || o.setLangAttr)
			e.attr((!o || o.setLangAttr === True) ? "lang" : o.setLangAttr, to);
	},
	
	copyEvents: function(from, to){
		to.each(function(i, to_i){
			var from_i = from[i];
			if( !to_i || !from_i ) //in some rare cases the translated html structure can be slightly different
				return false;
			if( dontCopyEvents[ from_i.nodeName.toUpperCase() ])
				return True;
			var events = $.data(from_i, "events");
			if(!events)
				return True;
			for(var type in events)
				for(var handler in events[type])
					$.event.add(to_i, type, events[type][handler], events[type][handler].data);
		});
	}
	
});


$.fn.translate = function(a, b, c){
	var o = $.translate._getOpt(arguments, $.fn.translate.defaults),
		ncto = $.extend( {}, $.translate._defaults, $.fn.translate.defaults, o,
			{ complete:function(e,t){
				
				if(o.fromOriginal)
					e.each(function(i, el){
						$fly[0] = el;
						var data = $.translate.getData($fly, o.from, o);
						if( !data ) return false;
						t[i] = data;
					});
				
				
				var each = o.each;
				
				function unshiftArgs(method){
					return function(){
						[].unshift.call(arguments, this.elements);
						method.apply(this, arguments);
					};
				}
				
				o.nodes = e;
				o.start = unshiftArgs(o.start);
				o.onTimeout = unshiftArgs(o.onTimeout);
				o.complete = unshiftArgs(o.complete);
				
				o.each = function(i){
					var args = arguments;
					if(arguments.length !== 7) //if isn't called from _toggle
						[].splice.call(args, 1, 0, this.elements[i]);
					this.each.apply(this, args);
					each.apply(this, args);
				};
				
				$.translate(t, o);
			},
			
			each: function(){}
		});

	if(this.nodesContainingText)
		return this.nodesContainingText(ncto);
	
	//fallback if nodesContainingText method is not present:
	o.nodes = this;
	$.translate($.map(this, function(e){ return $(e).html() || $(e).val(); }), o);
	return this;
};

$.fn.translate.defaults = $.extend({}, $.translate._defaults);

})(jQuery);/*!-
 * TextnodeTranslator adapter for the jQuery Translate plugin 
 * Version: ${version}
 * http://code.google.com/p/jquery-translate/
 */

/*globals Translator*/ 
;(function($){

$.translateTextNodes = function(root){
	var args = [].slice.call(arguments,0);
	[].shift.call(args);

	var o = $.translate._getOpt(args, $.translateTextNodes.defaults),
		replaceFunctions = [],
		contents = [],
		each = o.each,
		notType = typeof o.not, //not: function(node){ return node.nodeName != 'A'; }
		filter = notType === "string" ? function(e){ return !$(e).is(o.not); } :
				 notType === "function" ? o.not : 
				 null;

	$.each(root[0] ? root : [root], function(i, e){
		var tr = new Translator(function(str, fn){
			contents.push(str);
			replaceFunctions.push( o.replace ? fn : function(){} );
		}, filter);
		
		tr.sync = false;
		tr.traverse(e);
	});
	
	return $.translate(contents, $.extend(o, {
		each: function(i, translation){
			replaceFunctions[i]( translation );
			each.apply(this, arguments);
		}
	}));
	
};

$.fn.translateTextNodes = function(a, b, c){
	[].unshift.call(arguments, this);
	$.translateTextNodes.apply(null, [].slice.call(arguments,0));
	return this;
};

var defaults = $.extend({}, $.translate._defaults);

$.translateTextNodes.defaults = $.extend({}, defaults);

$.fn.translateTextNodes.defaults = $.extend({}, defaults);


})(jQuery);
/*!-
 * Simple user interface extension for the jQuery Translate plugin 
 * Version: ${version}
 * http://code.google.com/p/jquery-translate/
 */
;(function($){

var defaults = {
	tags: ["select", "option"],
	filter: $.translate.isTranslatable,
	label: $.translate.toNativeLanguage || 
		function(langCode, lang){
			return $.translate.capitalize(lang);
		},
	includeUnknown: false
};

$.translate.ui = function(){
	var o = {}, str='', cs='', cl='';
	
	if(typeof arguments[0] === "string")
		o.tags = $.makeArray(arguments);
	else o = arguments[0];
	
	o = $.extend({}, defaults, $.translate.ui.defaults, o);
		
	if(o.tags[2]){
		cs = '<' + o.tags[2] + '>';
		cl = '</' + o.tags[2] + '>';
	}
	
	var languages = $.translate.getLanguages(o.filter);
	if(!o.includeUnknown) delete languages.UNKNOWN;
	
	$.each( languages, function(l, lc){
		str += ('<' + o.tags[1] + " value=" + lc + '>' + cs +
			//$.translate.capitalize(l) + " - " + 
			o.label(lc, l) +
			cl + '</' + o.tags[1] + '>');
	});

	return $('<' + o.tags[0] + ' class="jq-translate-ui">' + str + '</' + o.tags[0] + '>');

};

$.translate.ui.defaults = $.extend({}, defaults);


})(jQuery);
/*!-
 * Progress indicator extension for the jQuery Translate plugin 
 * Version: ${version}
 * http://code.google.com/p/jquery-translate/
 */

;jQuery.translate.fn.progress = function(selector, options){
	if(!this.i) this._pr = 0;
	this._pr += this.source[this.i].length;
	var progress = 100 * this._pr / ( this.rawSource.length - ( 11 * (this.i + 1) ) );

	if(selector){
		var e = jQuery(selector);
		if( !this.i && !e.hasClass("ui-progressbar") )
			e.progressbar(options);
		e.progressbar( "option", "value", progress );
	}
	
	return progress;
};/*!-
 * Native language names extension for the jQuery Translate plugin 
 * Version: ${version}
 * http://code.google.com/p/jquery-translate/
 */
;(function($){
$.translate.extend({
	//TODO: maybe an inverse function
	toNativeLanguage: function(lang){ 
		return $.translate.nativeLanguages[ lang ] || 
			$.translate.nativeLanguages[ $.translate.toLanguageCode(lang) ];
	},

	translateLanguages: function(languages, callback){
		delete languages.UNKNOWN;
		var deferred = []; //instances to be executed later are collected here
		$.each(languages, function(l, lc){
			if( $.translate.nativeLanguages[lc] ) return;
			console.log(lc);
			deferred.push( $.translate.defer( $.translate.capitalize(l), "en", lc, function(tr){					
					$.translate.nativeLanguages[lc] = tr;
				}) );
		});
		if(!deferred.length) callback();
		else $.translate.run(deferred, callback);
	},
	
	nativeLanguages: {
		"af":"Afrikaans",
		"be":"Беларуская",
		"is":"Íslenska",
		"ga":"Gaeilge",
		"mk":"Македонски",
		"ms":"Bahasa Melayu",
		"sw":"Kiswahili",
		"cy":"Cymraeg",
		"yi":"ייִדיש",
		
		"sq":"Shqipe",
		"ar":"العربية",
		"bg":"Български",
		"ca":"Català",
		"zh":"中文",
		"zh-CN":"简体中文",
		"zh-TW":"繁體中文",
		"hr":"Hrvatski",
		"cs":"Čeština",
		"da":"Dansk",
		"nl":"Nederlands",
		"en":"English",
		"et":"Eesti",
		"tl":"Tagalog",
		"fi":"Suomi",
		"fr":"Français",
		"gl":"Galego",
		"de":"Deutsch",
		"el":"Ελληνικά",
		"iw":"עברית",
		"hi":"हिन्दी",
		"hu":"Magyar",
		"id":"Bahasa Indonesia",
		"it":"Italiano",
		"ja":"日本語",
		"ko":"한국어",
		"lv":"Latviešu",
		"lt":"Lietuvių",
		"mt":"Malti",
		"no":"Norsk",
		"fa":"فارسی",
		"pl":"Polski",
		"pt-PT":"Português",
		"ro":"Român",
		"ru":"Русский",
		"sr":"Српски",
		"sk":"Slovenský",
		"sl":"Slovenski",
		"es":"Español",
		"sv":"Svenska",
		"th":"ไทย",
		"tr":"Türkçe",
		"uk":"Українська",
		"vi":"Tiếng Việt"
	}

});

})(jQuery);/*!-
 * Paralell extension for the jQuery Translate plugin 
 * Version: ${version}
 * http://code.google.com/p/jquery-translate/
 */

;(function($){
$.translate.extend({
	defer: function(){
		return $.translate._bind($.translate, null, arguments);
	},
	
	run: function(array, finished){
		var count = array.length;
		$.each(array, function(){
			var inst = this(),
				complete = inst.options.complete;
			inst.options.complete = function(){
				complete.apply(this, arguments);
				if(!--count) finished();
			};
		});
	}
});

})(jQuery);