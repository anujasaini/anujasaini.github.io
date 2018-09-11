(function(window,$){'use strict';var counter=0,$headCache=$('head'),oldBigText=window.BigText,oldjQueryMethod=$.fn.bigtext,BigText={DEBUG_MODE:false,DEFAULT_MIN_FONT_SIZE_PX:null,DEFAULT_MAX_FONT_SIZE_PX:528,GLOBAL_STYLE_ID:'bigtext-style',STYLE_ID:'bigtext-id',LINE_CLASS_PREFIX:'bigtext-line',EXEMPT_CLASS:'bigtext-exempt',noConflict:function(restore)
{if(restore){$.fn.bigtext=oldjQueryMethod;window.BigText=oldBigText;}
return BigText;},supports:{wholeNumberFontSizeOnly:(function(){if(!('getComputedStyle'in window)){return true;}
var test=$('<div/>').css({position:'absolute','font-size':'14.1px'}).insertBefore($('script').eq(0)),computedStyle=window.getComputedStyle(test[0],null);var ret=computedStyle&&computedStyle.getPropertyValue('font-size')==='14px';test.remove();return ret;})()},init:function(){if(!$('#'+BigText.GLOBAL_STYLE_ID).length){$headCache.append(BigText.generateStyleTag(BigText.GLOBAL_STYLE_ID,['.bigtext * { white-space: nowrap; } .bigtext > * { display: block; }','.bigtext .'+ BigText.EXEMPT_CLASS+', .bigtext .'+ BigText.EXEMPT_CLASS+' * { white-space: normal; }']));}},bindResize:function(eventName,resizeFunction){var timeoutId;$(window).unbind(eventName).bind(eventName,function(){if(timeoutId){clearTimeout(timeoutId);}
timeoutId=setTimeout(resizeFunction,300);});},getStyleId:function(id)
{return BigText.STYLE_ID+'-'+ id;},generateStyleTag:function(id,css)
{return $('<style>'+ css.join('\n')+'</style>').attr('id',id);},clearCss:function(id)
{var styleId=BigText.getStyleId(id);$('#'+ styleId).remove();},generateCss:function(id,linesFontSizes,lineWordSpacings,minFontSizes)
{var css=[];BigText.clearCss(id);for(var j=0,k=linesFontSizes.length;j<k;j++){css.push('#'+ id+' .'+ BigText.LINE_CLASS_PREFIX+ j+' {'+
(minFontSizes[j]?' white-space: normal;':'')+
(linesFontSizes[j]?' font-size: '+ linesFontSizes[j]+'px;':'')+
(lineWordSpacings[j]?' word-spacing: '+ lineWordSpacings[j]+'px;':'')+'}');}
return BigText.generateStyleTag(BigText.getStyleId(id),css);},jQueryMethod:function(options)
{BigText.init();options=$.extend({minfontsize:BigText.DEFAULT_MIN_FONT_SIZE_PX,maxfontsize:BigText.DEFAULT_MAX_FONT_SIZE_PX,childSelector:'',resize:true},options||{});this.each(function()
{var $t=$(this).addClass('bigtext'),maxWidth=$t.width(),id=$t.attr('id'),$children=options.childSelector?$t.find(options.childSelector):$t.children();if(!id){id='bigtext-id'+(counter++);$t.attr('id',id);}
if(options.resize){BigText.bindResize('resize.bigtext-event-'+ id,function()
{BigText.jQueryMethod.call($('#'+ id),options);});}
BigText.clearCss(id);$children.addClass(function(lineNumber,className)
{return[className.replace(new RegExp('\\b'+ BigText.LINE_CLASS_PREFIX+'\\d+\\b'),''),BigText.LINE_CLASS_PREFIX+ lineNumber].join(' ');});var sizes=calculateSizes($t,$children,maxWidth,options.maxfontsize,options.minfontsize);$headCache.append(BigText.generateCss(id,sizes.fontSizes,sizes.wordSpacings,sizes.minFontSizes));});return this.trigger('bigtext:complete');}};function testLineDimensions($line,maxWidth,property,size,interval,units,previousWidth)
{var width;previousWidth=typeof previousWidth==='number'?previousWidth:0;$line.css(property,size+ units);width=$line.width();if(width>=maxWidth){$line.css(property,'');if(width===maxWidth){return{match:'exact',size:parseFloat((parseFloat(size)- 0.1).toFixed(3))};}
var under=maxWidth- previousWidth,over=width- maxWidth;return{match:'estimate',size:parseFloat((parseFloat(size)-(property==='word-spacing'&&previousWidth&&(over<under)?0:interval)).toFixed(3))};}
return width;}
function calculateSizes($t,$children,maxWidth,maxFontSize,minFontSize)
{var $c=$t.clone(true).addClass('bigtext-cloned').css({fontFamily:$t.css('font-family'),textTransform:$t.css('text-transform'),wordSpacing:$t.css('word-spacing'),letterSpacing:$t.css('letter-spacing'),position:'absolute',left:BigText.DEBUG_MODE?0:-9999,top:BigText.DEBUG_MODE?0:-9999}).appendTo(document.body);var fontSizes=[],wordSpacings=[],minFontSizes=[],ratios=[];$children.css('float','left').each(function(){var $line=$(this),intervals=BigText.supports.wholeNumberFontSizeOnly?[8,4,1]:[8,4,1,0.1],lineMax,newFontSize;if($line.hasClass(BigText.EXEMPT_CLASS)){fontSizes.push(null);ratios.push(null);minFontSizes.push(false);return;}
var autoGuessSubtraction=32,currentFontSize=parseFloat($line.css('font-size')),ratio=($line.width()/ currentFontSize ).toFixed(6);
newFontSize=parseInt(maxWidth/ratio,10)- autoGuessSubtraction;outer:for(var m=0,n=intervals.length;m<n;m++){inner:for(var j=1,k=10;j<=k;j++){if(newFontSize+ j*intervals[m]>maxFontSize){newFontSize=maxFontSize;break outer;}
lineMax=testLineDimensions($line,maxWidth,'font-size',newFontSize+ j*intervals[m],intervals[m],'px',lineMax);if(typeof lineMax!=='number'){newFontSize=lineMax.size;if(lineMax.match==='exact'){break outer;}
break inner;}}}
ratios.push(maxWidth/newFontSize);if(newFontSize>maxFontSize){fontSizes.push(maxFontSize);minFontSizes.push(false);}else if(!!minFontSize&&newFontSize<minFontSize){fontSizes.push(minFontSize);minFontSizes.push(true);}else{fontSizes.push(newFontSize);minFontSizes.push(false);}}).each(function(lineNumber){var $line=$(this),wordSpacing=0,interval=1,maxWordSpacing;if($line.hasClass(BigText.EXEMPT_CLASS)){wordSpacings.push(null);return;}
$line.css('font-size',fontSizes[lineNumber]+'px');for(var m=1,n=3;m<n;m+=interval){maxWordSpacing=testLineDimensions($line,maxWidth,'word-spacing',m,interval,'px',maxWordSpacing);if(typeof maxWordSpacing!=='number'){wordSpacing=maxWordSpacing.size;break;}}
$line.css('font-size','');wordSpacings.push(wordSpacing);}).removeAttr('style');if(!BigText.DEBUG_MODE){$c.remove();}else{$c.css({'background-color':'rgba(255,255,255,.4)'});}
return{fontSizes:fontSizes,wordSpacings:wordSpacings,ratios:ratios,minFontSizes:minFontSizes};}
$.fn.bigtext=BigText.jQueryMethod;window.BigText=BigText;})(this,jQuery);(function(window){var slice=Array.prototype.slice;function noop(){}
function defineBridget($){if(!$){return;}
function addOptionMethod(PluginClass){if(PluginClass.prototype.option){return;}
PluginClass.prototype.option=function(opts){if(!$.isPlainObject(opts)){return;}
this.options=$.extend(true,this.options,opts);};}
var logError=typeof console==='undefined'?noop:function(message){console.error(message);};function bridge(namespace,PluginClass){$.fn[namespace]=function(options){if(typeof options==='string'){var args=slice.call(arguments,1);for(var i=0,len=this.length;i<len;i++){var elem=this[i];var instance=$.data(elem,namespace);if(!instance){logError("cannot call methods on "+ namespace+" prior to initialization; "+"attempted to call '"+ options+"'");continue;}
if(!$.isFunction(instance[options])||options.charAt(0)==='_'){logError("no such method '"+ options+"' for "+ namespace+" instance");continue;}
var returnValue=instance[options].apply(instance,args);if(returnValue!==undefined){return returnValue;}}
return this;}else{return this.each(function(){var instance=$.data(this,namespace);if(instance){instance.option(options);instance._init();}else{instance=new PluginClass(this,options);$.data(this,namespace,instance);}});}};}
$.bridget=function(namespace,PluginClass){addOptionMethod(PluginClass);bridge(namespace,PluginClass);};return $.bridget;}
if(typeof define==='function'&&define.amd){define('jquery-bridget/jquery.bridget',['jquery'],defineBridget);}else if(typeof exports==='object'){defineBridget(require('jquery'));}else{defineBridget(window.jQuery);}})(window);(function(window){var docElem=document.documentElement;var bind=function(){};function getIEEvent(obj){var event=window.event;event.target=event.target||event.srcElement||obj;return event;}
if(docElem.addEventListener){bind=function(obj,type,fn){obj.addEventListener(type,fn,false);};}else if(docElem.attachEvent){bind=function(obj,type,fn){obj[type+ fn]=fn.handleEvent?function(){var event=getIEEvent(obj);fn.handleEvent.call(fn,event);}:function(){var event=getIEEvent(obj);fn.call(obj,event);};obj.attachEvent("on"+ type,obj[type+ fn]);};}
var unbind=function(){};if(docElem.removeEventListener){unbind=function(obj,type,fn){obj.removeEventListener(type,fn,false);};}else if(docElem.detachEvent){unbind=function(obj,type,fn){obj.detachEvent("on"+ type,obj[type+ fn]);try{delete obj[type+ fn];}catch(err){obj[type+ fn]=undefined;}};}
var eventie={bind:bind,unbind:unbind};if(typeof define==='function'&&define.amd){define('eventie/eventie',eventie);}else if(typeof exports==='object'){module.exports=eventie;}else{window.eventie=eventie;}})(window);;(function(){'use strict';function EventEmitter(){}
var proto=EventEmitter.prototype;var exports=this;var originalGlobalValue=exports.EventEmitter;function indexOfListener(listeners,listener){var i=listeners.length;while(i--){if(listeners[i].listener===listener){return i;}}
return-1;}
function alias(name){return function aliasClosure(){return this[name].apply(this,arguments);};}
proto.getListeners=function getListeners(evt){var events=this._getEvents();var response;var key;if(evt instanceof RegExp){response={};for(key in events){if(events.hasOwnProperty(key)&&evt.test(key)){response[key]=events[key];}}}
else{response=events[evt]||(events[evt]=[]);}
return response;};proto.flattenListeners=function flattenListeners(listeners){var flatListeners=[];var i;for(i=0;i<listeners.length;i+=1){flatListeners.push(listeners[i].listener);}
return flatListeners;};proto.getListenersAsObject=function getListenersAsObject(evt){var listeners=this.getListeners(evt);var response;if(listeners instanceof Array){response={};response[evt]=listeners;}
return response||listeners;};proto.addListener=function addListener(evt,listener){var listeners=this.getListenersAsObject(evt);var listenerIsWrapped=typeof listener==='object';var key;for(key in listeners){if(listeners.hasOwnProperty(key)&&indexOfListener(listeners[key],listener)===-1){listeners[key].push(listenerIsWrapped?listener:{listener:listener,once:false});}}
return this;};proto.on=alias('addListener');proto.addOnceListener=function addOnceListener(evt,listener){return this.addListener(evt,{listener:listener,once:true});};proto.once=alias('addOnceListener');proto.defineEvent=function defineEvent(evt){this.getListeners(evt);return this;};proto.defineEvents=function defineEvents(evts){for(var i=0;i<evts.length;i+=1){this.defineEvent(evts[i]);}
return this;};proto.removeListener=function removeListener(evt,listener){var listeners=this.getListenersAsObject(evt);var index;var key;for(key in listeners){if(listeners.hasOwnProperty(key)){index=indexOfListener(listeners[key],listener);if(index!==-1){listeners[key].splice(index,1);}}}
return this;};proto.off=alias('removeListener');proto.addListeners=function addListeners(evt,listeners){return this.manipulateListeners(false,evt,listeners);};proto.removeListeners=function removeListeners(evt,listeners){return this.manipulateListeners(true,evt,listeners);};proto.manipulateListeners=function manipulateListeners(remove,evt,listeners){var i;var value;var single=remove?this.removeListener:this.addListener;var multiple=remove?this.removeListeners:this.addListeners;if(typeof evt==='object'&&!(evt instanceof RegExp)){for(i in evt){if(evt.hasOwnProperty(i)&&(value=evt[i])){if(typeof value==='function'){single.call(this,i,value);}
else{multiple.call(this,i,value);}}}}
else{i=listeners.length;while(i--){single.call(this,evt,listeners[i]);}}
return this;};proto.removeEvent=function removeEvent(evt){var type=typeof evt;var events=this._getEvents();var key;if(type==='string'){delete events[evt];}
else if(evt instanceof RegExp){for(key in events){if(events.hasOwnProperty(key)&&evt.test(key)){delete events[key];}}}
else{delete this._events;}
return this;};proto.removeAllListeners=alias('removeEvent');proto.emitEvent=function emitEvent(evt,args){var listeners=this.getListenersAsObject(evt);var listener;var i;var key;var response;for(key in listeners){if(listeners.hasOwnProperty(key)){i=listeners[key].length;while(i--){listener=listeners[key][i];if(listener.once===true){this.removeListener(evt,listener.listener);}
response=listener.listener.apply(this,args||[]);if(response===this._getOnceReturnValue()){this.removeListener(evt,listener.listener);}}}}
return this;};proto.trigger=alias('emitEvent');proto.emit=function emit(evt){var args=Array.prototype.slice.call(arguments,1);return this.emitEvent(evt,args);};proto.setOnceReturnValue=function setOnceReturnValue(value){this._onceReturnValue=value;return this;};proto._getOnceReturnValue=function _getOnceReturnValue(){if(this.hasOwnProperty('_onceReturnValue')){return this._onceReturnValue;}
else{return true;}};proto._getEvents=function _getEvents(){return this._events||(this._events={});};EventEmitter.noConflict=function noConflict(){exports.EventEmitter=originalGlobalValue;return EventEmitter;};if(typeof define==='function'&&define.amd){define('eventEmitter/EventEmitter',[],function(){return EventEmitter;});}
else if(typeof module==='object'&&module.exports){module.exports=EventEmitter;}
else{exports.EventEmitter=EventEmitter;}}.call(this));(function(window){var prefixes='Webkit Moz ms Ms O'.split(' ');var docElemStyle=document.documentElement.style;function getStyleProperty(propName){if(!propName){return;}
if(typeof docElemStyle[propName]==='string'){return propName;}
propName=propName.charAt(0).toUpperCase()+ propName.slice(1);var prefixed;for(var i=0,len=prefixes.length;i<len;i++){prefixed=prefixes[i]+ propName;if(typeof docElemStyle[prefixed]==='string'){return prefixed;}}}
if(typeof define==='function'&&define.amd){define('get-style-property/get-style-property',[],function(){return getStyleProperty;});}else if(typeof exports==='object'){module.exports=getStyleProperty;}else{window.getStyleProperty=getStyleProperty;}})(window);(function(window,undefined){function getStyleSize(value){var num=parseFloat(value);var isValid=value.indexOf('%')===-1&&!isNaN(num);return isValid&&num;}
function noop(){}
var logError=typeof console==='undefined'?noop:function(message){console.error(message);};var measurements=['paddingLeft','paddingRight','paddingTop','paddingBottom','marginLeft','marginRight','marginTop','marginBottom','borderLeftWidth','borderRightWidth','borderTopWidth','borderBottomWidth'];function getZeroSize(){var size={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0};for(var i=0,len=measurements.length;i<len;i++){var measurement=measurements[i];size[measurement]=0;}
return size;}
function defineGetSize(getStyleProperty){var isSetup=false;var getStyle,boxSizingProp,isBoxSizeOuter;function setup(){if(isSetup){return;}
isSetup=true;var getComputedStyle=window.getComputedStyle;getStyle=(function(){var getStyleFn=getComputedStyle?function(elem){return getComputedStyle(elem,null);}:function(elem){return elem.currentStyle;};return function getStyle(elem){var style=getStyleFn(elem);if(!style){logError('Style returned '+ style+'. Are you running this code in a hidden iframe on Firefox? '+'See http://bit.ly/getsizebug1');}
return style;};})();boxSizingProp=getStyleProperty('boxSizing');if(boxSizingProp){var div=document.createElement('div');div.style.width='200px';div.style.padding='1px 2px 3px 4px';div.style.borderStyle='solid';div.style.borderWidth='1px 2px 3px 4px';div.style[boxSizingProp]='border-box';var body=document.body||document.documentElement;body.appendChild(div);var style=getStyle(div);isBoxSizeOuter=getStyleSize(style.width)===200;body.removeChild(div);}}
function getSize(elem){setup();if(typeof elem==='string'){elem=document.querySelector(elem);}
if(!elem||typeof elem!=='object'||!elem.nodeType){return;}
var style=getStyle(elem);if(style.display==='none'){return getZeroSize();}
var size={};size.width=elem.offsetWidth;size.height=elem.offsetHeight;var isBorderBox=size.isBorderBox=!!(boxSizingProp&&style[boxSizingProp]&&style[boxSizingProp]==='border-box');for(var i=0,len=measurements.length;i<len;i++){var measurement=measurements[i];var value=style[measurement];value=mungeNonPixel(elem,value);var num=parseFloat(value);size[measurement]=!isNaN(num)?num:0;}
var paddingWidth=size.paddingLeft+ size.paddingRight;var paddingHeight=size.paddingTop+ size.paddingBottom;var marginWidth=size.marginLeft+ size.marginRight;var marginHeight=size.marginTop+ size.marginBottom;var borderWidth=size.borderLeftWidth+ size.borderRightWidth;var borderHeight=size.borderTopWidth+ size.borderBottomWidth;var isBorderBoxSizeOuter=isBorderBox&&isBoxSizeOuter;var styleWidth=getStyleSize(style.width);if(styleWidth!==false){size.width=styleWidth+
(isBorderBoxSizeOuter?0:paddingWidth+ borderWidth);}
var styleHeight=getStyleSize(style.height);if(styleHeight!==false){size.height=styleHeight+
(isBorderBoxSizeOuter?0:paddingHeight+ borderHeight);}
size.innerWidth=size.width-(paddingWidth+ borderWidth);size.innerHeight=size.height-(paddingHeight+ borderHeight);size.outerWidth=size.width+ marginWidth;size.outerHeight=size.height+ marginHeight;return size;}
function mungeNonPixel(elem,value){if(window.getComputedStyle||value.indexOf('%')===-1){return value;}
var style=elem.style;var left=style.left;var rs=elem.runtimeStyle;var rsLeft=rs&&rs.left;if(rsLeft){rs.left=elem.currentStyle.left;}
style.left=value;value=style.pixelLeft;style.left=left;if(rsLeft){rs.left=rsLeft;}
return value;}
return getSize;}
if(typeof define==='function'&&define.amd){define('get-size/get-size',['get-style-property/get-style-property'],defineGetSize);}else if(typeof exports==='object'){module.exports=defineGetSize(require('desandro-get-style-property'));}else{window.getSize=defineGetSize(window.getStyleProperty);}})(window);(function(window){var document=window.document;var queue=[];function docReady(fn){if(typeof fn!=='function'){return;}
if(docReady.isReady){fn();}else{queue.push(fn);}}
docReady.isReady=false;function onReady(event){var isIE8NotReady=event.type==='readystatechange'&&document.readyState!=='complete';if(docReady.isReady||isIE8NotReady){return;}
trigger();}
function trigger(){docReady.isReady=true;for(var i=0,len=queue.length;i<len;i++){var fn=queue[i];fn();}}
function defineDocReady(eventie){if(document.readyState==='complete'){trigger();}else{eventie.bind(document,'DOMContentLoaded',onReady);eventie.bind(document,'readystatechange',onReady);eventie.bind(window,'load',onReady);}
return docReady;}
if(typeof define==='function'&&define.amd){define('doc-ready/doc-ready',['eventie/eventie'],defineDocReady);}else if(typeof exports==='object'){module.exports=defineDocReady(require('eventie'));}else{window.docReady=defineDocReady(window.eventie);}})(window);(function(ElemProto){'use strict';var matchesMethod=(function(){if(ElemProto.matches){return'matches';}
if(ElemProto.matchesSelector){return'matchesSelector';}
var prefixes=['webkit','moz','ms','o'];for(var i=0,len=prefixes.length;i<len;i++){var prefix=prefixes[i];var method=prefix+'MatchesSelector';if(ElemProto[method]){return method;}}})();function match(elem,selector){return elem[matchesMethod](selector);}
function checkParent(elem){if(elem.parentNode){return;}
var fragment=document.createDocumentFragment();fragment.appendChild(elem);}
function query(elem,selector){checkParent(elem);var elems=elem.parentNode.querySelectorAll(selector);for(var i=0,len=elems.length;i<len;i++){if(elems[i]===elem){return true;}}
return false;}
function matchChild(elem,selector){checkParent(elem);return match(elem,selector);}
var matchesSelector;if(matchesMethod){var div=document.createElement('div');var supportsOrphans=match(div,'div');matchesSelector=supportsOrphans?match:matchChild;}else{matchesSelector=query;}
if(typeof define==='function'&&define.amd){define('matches-selector/matches-selector',[],function(){return matchesSelector;});}else if(typeof exports==='object'){module.exports=matchesSelector;}
else{window.matchesSelector=matchesSelector;}})(Element.prototype);(function(window,factory){'use strict';if(typeof define=='function'&&define.amd){define('fizzy-ui-utils/utils',['doc-ready/doc-ready','matches-selector/matches-selector'],function(docReady,matchesSelector){return factory(window,docReady,matchesSelector);});}else if(typeof exports=='object'){module.exports=factory(window,require('doc-ready'),require('desandro-matches-selector'));}else{window.fizzyUIUtils=factory(window,window.docReady,window.matchesSelector);}}(window,function factory(window,docReady,matchesSelector){var utils={};utils.extend=function(a,b){for(var prop in b){a[prop]=b[prop];}
return a;};utils.modulo=function(num,div){return((num%div)+ div)%div;};var objToString=Object.prototype.toString;utils.isArray=function(obj){return objToString.call(obj)=='[object Array]';};utils.makeArray=function(obj){var ary=[];if(utils.isArray(obj)){ary=obj;}else if(obj&&typeof obj.length=='number'){for(var i=0,len=obj.length;i<len;i++){ary.push(obj[i]);}}else{ary.push(obj);}
return ary;};utils.indexOf=Array.prototype.indexOf?function(ary,obj){return ary.indexOf(obj);}:function(ary,obj){for(var i=0,len=ary.length;i<len;i++){if(ary[i]===obj){return i;}}
return-1;};utils.removeFrom=function(ary,obj){var index=utils.indexOf(ary,obj);if(index!=-1){ary.splice(index,1);}};utils.isElement=(typeof HTMLElement=='function'||typeof HTMLElement=='object')?function isElementDOM2(obj){return obj instanceof HTMLElement;}:function isElementQuirky(obj){return obj&&typeof obj=='object'&&obj.nodeType==1&&typeof obj.nodeName=='string';};utils.setText=(function(){var setTextProperty;function setText(elem,text){setTextProperty=setTextProperty||(document.documentElement.textContent!==undefined?'textContent':'innerText');elem[setTextProperty]=text;}
return setText;})();utils.getParent=function(elem,selector){while(elem!=document.body){elem=elem.parentNode;if(matchesSelector(elem,selector)){return elem;}}};utils.getQueryElement=function(elem){if(typeof elem=='string'){return document.querySelector(elem);}
return elem;};utils.handleEvent=function(event){var method='on'+ event.type;if(this[method]){this[method](event);}};utils.filterFindElements=function(elems,selector){elems=utils.makeArray(elems);var ffElems=[];for(var i=0,len=elems.length;i<len;i++){var elem=elems[i];if(!utils.isElement(elem)){continue;}
if(selector){if(matchesSelector(elem,selector)){ffElems.push(elem);}
var childElems=elem.querySelectorAll(selector);for(var j=0,jLen=childElems.length;j<jLen;j++){ffElems.push(childElems[j]);}}else{ffElems.push(elem);}}
return ffElems;};utils.debounceMethod=function(_class,methodName,threshold){var method=_class.prototype[methodName];var timeoutName=methodName+'Timeout';_class.prototype[methodName]=function(){var timeout=this[timeoutName];if(timeout){clearTimeout(timeout);}
var args=arguments;var _this=this;this[timeoutName]=setTimeout(function(){method.apply(_this,args);delete _this[timeoutName];},threshold||100);};};utils.toDashed=function(str){return str.replace(/(.)([A-Z])/g,function(match,$1,$2){return $1+'-'+ $2;}).toLowerCase();};var console=window.console;utils.htmlInit=function(WidgetClass,namespace){docReady(function(){var dashedNamespace=utils.toDashed(namespace);var elems=document.querySelectorAll('.js-'+ dashedNamespace);var dataAttr='data-'+ dashedNamespace+'-options';for(var i=0,len=elems.length;i<len;i++){var elem=elems[i];var attr=elem.getAttribute(dataAttr);var options;try{options=attr&&JSON.parse(attr);}catch(error){if(console){console.error('Error parsing '+ dataAttr+' on '+
elem.nodeName.toLowerCase()+(elem.id?'#'+ elem.id:'')+': '+
error);}
continue;}
var instance=new WidgetClass(elem,options);var jQuery=window.jQuery;if(jQuery){jQuery.data(elem,namespace,instance);}}});};return utils;}));(function(window,factory){'use strict';if(typeof define==='function'&&define.amd){define('outlayer/item',['eventEmitter/EventEmitter','get-size/get-size','get-style-property/get-style-property','fizzy-ui-utils/utils'],function(EventEmitter,getSize,getStyleProperty,utils){return factory(window,EventEmitter,getSize,getStyleProperty,utils);});}else if(typeof exports==='object'){module.exports=factory(window,require('wolfy87-eventemitter'),require('get-size'),require('desandro-get-style-property'),require('fizzy-ui-utils'));}else{window.Outlayer={};window.Outlayer.Item=factory(window,window.EventEmitter,window.getSize,window.getStyleProperty,window.fizzyUIUtils);}}(window,function factory(window,EventEmitter,getSize,getStyleProperty,utils){'use strict';var getComputedStyle=window.getComputedStyle;var getStyle=getComputedStyle?function(elem){return getComputedStyle(elem,null);}:function(elem){return elem.currentStyle;};function isEmptyObj(obj){for(var prop in obj){return false;}
prop=null;return true;}
var transitionProperty=getStyleProperty('transition');var transformProperty=getStyleProperty('transform');var supportsCSS3=transitionProperty&&transformProperty;var is3d=!!getStyleProperty('perspective');var transitionEndEvent={WebkitTransition:'webkitTransitionEnd',MozTransition:'transitionend',OTransition:'otransitionend',transition:'transitionend'}[transitionProperty];var prefixableProperties=['transform','transition','transitionDuration','transitionProperty'];var vendorProperties=(function(){var cache={};for(var i=0,len=prefixableProperties.length;i<len;i++){var prop=prefixableProperties[i];var supportedProp=getStyleProperty(prop);if(supportedProp&&supportedProp!==prop){cache[prop]=supportedProp;}}
return cache;})();function Item(element,layout){if(!element){return;}
this.element=element;this.layout=layout;this.position={x:0,y:0};this._create();}
utils.extend(Item.prototype,EventEmitter.prototype);Item.prototype._create=function(){this._transn={ingProperties:{},clean:{},onEnd:{}};this.css({position:'absolute'});};Item.prototype.handleEvent=function(event){var method='on'+ event.type;if(this[method]){this[method](event);}};Item.prototype.getSize=function(){this.size=getSize(this.element);};Item.prototype.css=function(style){var elemStyle=this.element.style;for(var prop in style){var supportedProp=vendorProperties[prop]||prop;elemStyle[supportedProp]=style[prop];}};Item.prototype.getPosition=function(){var style=getStyle(this.element);var layoutOptions=this.layout.options;var isOriginLeft=layoutOptions.isOriginLeft;var isOriginTop=layoutOptions.isOriginTop;var xValue=style[isOriginLeft?'left':'right'];var yValue=style[isOriginTop?'top':'bottom'];var layoutSize=this.layout.size;var x=xValue.indexOf('%')!=-1?(parseFloat(xValue)/ 100 ) * layoutSize.width : parseInt( xValue, 10 );
var y=yValue.indexOf('%')!=-1?(parseFloat(yValue)/ 100 ) * layoutSize.height : parseInt( yValue, 10 );
x=isNaN(x)?0:x;y=isNaN(y)?0:y;x-=isOriginLeft?layoutSize.paddingLeft:layoutSize.paddingRight;y-=isOriginTop?layoutSize.paddingTop:layoutSize.paddingBottom;this.position.x=x;this.position.y=y;};Item.prototype.layoutPosition=function(){var layoutSize=this.layout.size;var layoutOptions=this.layout.options;var style={};var xPadding=layoutOptions.isOriginLeft?'paddingLeft':'paddingRight';var xProperty=layoutOptions.isOriginLeft?'left':'right';var xResetProperty=layoutOptions.isOriginLeft?'right':'left';var x=this.position.x+ layoutSize[xPadding];style[xProperty]=this.getXValue(x);style[xResetProperty]='';var yPadding=layoutOptions.isOriginTop?'paddingTop':'paddingBottom';var yProperty=layoutOptions.isOriginTop?'top':'bottom';var yResetProperty=layoutOptions.isOriginTop?'bottom':'top';var y=this.position.y+ layoutSize[yPadding];style[yProperty]=this.getYValue(y);style[yResetProperty]='';this.css(style);this.emitEvent('layout',[this]);};Item.prototype.getXValue=function(x){var layoutOptions=this.layout.options;return layoutOptions.percentPosition&&!layoutOptions.isHorizontal?((x/this.layout.size.width)*100)+'%':x+'px';};Item.prototype.getYValue=function(y){var layoutOptions=this.layout.options;return layoutOptions.percentPosition&&layoutOptions.isHorizontal?((y/this.layout.size.height)*100)+'%':y+'px';};Item.prototype._transitionTo=function(x,y){this.getPosition();var curX=this.position.x;var curY=this.position.y;var compareX=parseInt(x,10);var compareY=parseInt(y,10);var didNotMove=compareX===this.position.x&&compareY===this.position.y;this.setPosition(x,y);if(didNotMove&&!this.isTransitioning){this.layoutPosition();return;}
var transX=x- curX;var transY=y- curY;var transitionStyle={};transitionStyle.transform=this.getTranslate(transX,transY);this.transition({to:transitionStyle,onTransitionEnd:{transform:this.layoutPosition},isCleaning:true});};Item.prototype.getTranslate=function(x,y){var layoutOptions=this.layout.options;x=layoutOptions.isOriginLeft?x:-x;y=layoutOptions.isOriginTop?y:-y;if(is3d){return'translate3d('+ x+'px, '+ y+'px, 0)';}
return'translate('+ x+'px, '+ y+'px)';};Item.prototype.goTo=function(x,y){this.setPosition(x,y);this.layoutPosition();};Item.prototype.moveTo=supportsCSS3?Item.prototype._transitionTo:Item.prototype.goTo;Item.prototype.setPosition=function(x,y){this.position.x=parseInt(x,10);this.position.y=parseInt(y,10);};Item.prototype._nonTransition=function(args){this.css(args.to);if(args.isCleaning){this._removeStyles(args.to);}
for(var prop in args.onTransitionEnd){args.onTransitionEnd[prop].call(this);}};Item.prototype._transition=function(args){if(!parseFloat(this.layout.options.transitionDuration)){this._nonTransition(args);return;}
var _transition=this._transn;for(var prop in args.onTransitionEnd){_transition.onEnd[prop]=args.onTransitionEnd[prop];}
for(prop in args.to){_transition.ingProperties[prop]=true;if(args.isCleaning){_transition.clean[prop]=true;}}
if(args.from){this.css(args.from);var h=this.element.offsetHeight;h=null;}
this.enableTransition(args.to);this.css(args.to);this.isTransitioning=true;};function toDashedAll(str){return str.replace(/([A-Z])/g,function($1){return'-'+ $1.toLowerCase();});}
var transitionProps='opacity,'+
toDashedAll(vendorProperties.transform||'transform');Item.prototype.enableTransition=function(){if(this.isTransitioning){return;}
this.css({transitionProperty:transitionProps,transitionDuration:this.layout.options.transitionDuration});this.element.addEventListener(transitionEndEvent,this,false);};Item.prototype.transition=Item.prototype[transitionProperty?'_transition':'_nonTransition'];Item.prototype.onwebkitTransitionEnd=function(event){this.ontransitionend(event);};Item.prototype.onotransitionend=function(event){this.ontransitionend(event);};var dashedVendorProperties={'-webkit-transform':'transform','-moz-transform':'transform','-o-transform':'transform'};Item.prototype.ontransitionend=function(event){if(event.target!==this.element){return;}
var _transition=this._transn;var propertyName=dashedVendorProperties[event.propertyName]||event.propertyName;delete _transition.ingProperties[propertyName];if(isEmptyObj(_transition.ingProperties)){this.disableTransition();}
if(propertyName in _transition.clean){this.element.style[event.propertyName]='';delete _transition.clean[propertyName];}
if(propertyName in _transition.onEnd){var onTransitionEnd=_transition.onEnd[propertyName];onTransitionEnd.call(this);delete _transition.onEnd[propertyName];}
this.emitEvent('transitionEnd',[this]);};Item.prototype.disableTransition=function(){this.removeTransitionStyles();this.element.removeEventListener(transitionEndEvent,this,false);this.isTransitioning=false;};Item.prototype._removeStyles=function(style){var cleanStyle={};for(var prop in style){cleanStyle[prop]='';}
this.css(cleanStyle);};var cleanTransitionStyle={transitionProperty:'',transitionDuration:''};Item.prototype.removeTransitionStyles=function(){this.css(cleanTransitionStyle);};Item.prototype.removeElem=function(){this.element.parentNode.removeChild(this.element);this.css({display:''});this.emitEvent('remove',[this]);};Item.prototype.remove=function(){if(!transitionProperty||!parseFloat(this.layout.options.transitionDuration)){this.removeElem();return;}
var _this=this;this.once('transitionEnd',function(){_this.removeElem();});this.hide();};Item.prototype.reveal=function(){delete this.isHidden;this.css({display:''});var options=this.layout.options;var onTransitionEnd={};var transitionEndProperty=this.getHideRevealTransitionEndProperty('visibleStyle');onTransitionEnd[transitionEndProperty]=this.onRevealTransitionEnd;this.transition({from:options.hiddenStyle,to:options.visibleStyle,isCleaning:true,onTransitionEnd:onTransitionEnd});};Item.prototype.onRevealTransitionEnd=function(){if(!this.isHidden){this.emitEvent('reveal');}};Item.prototype.getHideRevealTransitionEndProperty=function(styleProperty){var optionStyle=this.layout.options[styleProperty];if(optionStyle.opacity){return'opacity';}
for(var prop in optionStyle){return prop;}};Item.prototype.hide=function(){this.isHidden=true;this.css({display:''});var options=this.layout.options;var onTransitionEnd={};var transitionEndProperty=this.getHideRevealTransitionEndProperty('hiddenStyle');onTransitionEnd[transitionEndProperty]=this.onHideTransitionEnd;this.transition({from:options.visibleStyle,to:options.hiddenStyle,isCleaning:true,onTransitionEnd:onTransitionEnd});};Item.prototype.onHideTransitionEnd=function(){if(this.isHidden){this.css({display:'none'});this.emitEvent('hide');}};Item.prototype.destroy=function(){this.css({position:'',left:'',right:'',top:'',bottom:'',transition:'',transform:''});};return Item;}));(function(window,factory){'use strict';if(typeof define=='function'&&define.amd){define('outlayer/outlayer',['eventie/eventie','eventEmitter/EventEmitter','get-size/get-size','fizzy-ui-utils/utils','./item'],function(eventie,EventEmitter,getSize,utils,Item){return factory(window,eventie,EventEmitter,getSize,utils,Item);});}else if(typeof exports=='object'){module.exports=factory(window,require('eventie'),require('wolfy87-eventemitter'),require('get-size'),require('fizzy-ui-utils'),require('./item'));}else{window.Outlayer=factory(window,window.eventie,window.EventEmitter,window.getSize,window.fizzyUIUtils,window.Outlayer.Item);}}(window,function factory(window,eventie,EventEmitter,getSize,utils,Item){'use strict';var console=window.console;var jQuery=window.jQuery;var noop=function(){};var GUID=0;var instances={};function Outlayer(element,options){var queryElement=utils.getQueryElement(element);if(!queryElement){if(console){console.error('Bad element for '+ this.constructor.namespace+': '+(queryElement||element));}
return;}
this.element=queryElement;if(jQuery){this.$element=jQuery(this.element);}
this.options=utils.extend({},this.constructor.defaults);this.option(options);var id=++GUID;this.element.outlayerGUID=id;instances[id]=this;this._create();if(this.options.isInitLayout){this.layout();}}
Outlayer.namespace='outlayer';Outlayer.Item=Item;Outlayer.defaults={containerStyle:{position:'relative'},isInitLayout:true,isOriginLeft:true,isOriginTop:true,isResizeBound:true,isResizingContainer:true,transitionDuration:'0.4s',hiddenStyle:{opacity:0,transform:'scale(0.001)'},visibleStyle:{opacity:1,transform:'scale(1)'}};utils.extend(Outlayer.prototype,EventEmitter.prototype);Outlayer.prototype.option=function(opts){utils.extend(this.options,opts);};Outlayer.prototype._create=function(){this.reloadItems();this.stamps=[];this.stamp(this.options.stamp);utils.extend(this.element.style,this.options.containerStyle);if(this.options.isResizeBound){this.bindResize();}};Outlayer.prototype.reloadItems=function(){this.items=this._itemize(this.element.children);};Outlayer.prototype._itemize=function(elems){var itemElems=this._filterFindItemElements(elems);var Item=this.constructor.Item;var items=[];for(var i=0,len=itemElems.length;i<len;i++){var elem=itemElems[i];var item=new Item(elem,this);items.push(item);}
return items;};Outlayer.prototype._filterFindItemElements=function(elems){return utils.filterFindElements(elems,this.options.itemSelector);};Outlayer.prototype.getItemElements=function(){var elems=[];for(var i=0,len=this.items.length;i<len;i++){elems.push(this.items[i].element);}
return elems;};Outlayer.prototype.layout=function(){this._resetLayout();this._manageStamps();var isInstant=this.options.isLayoutInstant!==undefined?this.options.isLayoutInstant:!this._isLayoutInited;this.layoutItems(this.items,isInstant);this._isLayoutInited=true;};Outlayer.prototype._init=Outlayer.prototype.layout;Outlayer.prototype._resetLayout=function(){this.getSize();};Outlayer.prototype.getSize=function(){this.size=getSize(this.element);};Outlayer.prototype._getMeasurement=function(measurement,size){var option=this.options[measurement];var elem;if(!option){this[measurement]=0;}else{if(typeof option==='string'){elem=this.element.querySelector(option);}else if(utils.isElement(option)){elem=option;}
this[measurement]=elem?getSize(elem)[size]:option;}};Outlayer.prototype.layoutItems=function(items,isInstant){items=this._getItemsForLayout(items);this._layoutItems(items,isInstant);this._postLayout();};Outlayer.prototype._getItemsForLayout=function(items){var layoutItems=[];for(var i=0,len=items.length;i<len;i++){var item=items[i];if(!item.isIgnored){layoutItems.push(item);}}
return layoutItems;};Outlayer.prototype._layoutItems=function(items,isInstant){this._emitCompleteOnItems('layout',items);if(!items||!items.length){return;}
var queue=[];for(var i=0,len=items.length;i<len;i++){var item=items[i];var position=this._getItemLayoutPosition(item);position.item=item;position.isInstant=isInstant||item.isLayoutInstant;queue.push(position);}
this._processLayoutQueue(queue);};Outlayer.prototype._getItemLayoutPosition=function(){return{x:0,y:0};};Outlayer.prototype._processLayoutQueue=function(queue){for(var i=0,len=queue.length;i<len;i++){var obj=queue[i];this._positionItem(obj.item,obj.x,obj.y,obj.isInstant);}};Outlayer.prototype._positionItem=function(item,x,y,isInstant){if(isInstant){item.goTo(x,y);}else{item.moveTo(x,y);}};Outlayer.prototype._postLayout=function(){this.resizeContainer();};Outlayer.prototype.resizeContainer=function(){if(!this.options.isResizingContainer){return;}
var size=this._getContainerSize();if(size){this._setContainerMeasure(size.width,true);this._setContainerMeasure(size.height,false);}};Outlayer.prototype._getContainerSize=noop;Outlayer.prototype._setContainerMeasure=function(measure,isWidth){if(measure===undefined){return;}
var elemSize=this.size;if(elemSize.isBorderBox){measure+=isWidth?elemSize.paddingLeft+ elemSize.paddingRight+
elemSize.borderLeftWidth+ elemSize.borderRightWidth:elemSize.paddingBottom+ elemSize.paddingTop+
elemSize.borderTopWidth+ elemSize.borderBottomWidth;}
measure=Math.max(measure,0);this.element.style[isWidth?'width':'height']=measure+'px';};Outlayer.prototype._emitCompleteOnItems=function(eventName,items){var _this=this;function onComplete(){_this.dispatchEvent(eventName+'Complete',null,[items]);}
var count=items.length;if(!items||!count){onComplete();return;}
var doneCount=0;function tick(){doneCount++;if(doneCount===count){onComplete();}}
for(var i=0,len=items.length;i<len;i++){var item=items[i];item.once(eventName,tick);}};Outlayer.prototype.dispatchEvent=function(type,event,args){var emitArgs=event?[event].concat(args):args;this.emitEvent(type,emitArgs);if(jQuery){this.$element=this.$element||jQuery(this.element);if(event){var $event=jQuery.Event(event);$event.type=type;this.$element.trigger($event,args);}else{this.$element.trigger(type,args);}}};Outlayer.prototype.ignore=function(elem){var item=this.getItem(elem);if(item){item.isIgnored=true;}};Outlayer.prototype.unignore=function(elem){var item=this.getItem(elem);if(item){delete item.isIgnored;}};Outlayer.prototype.stamp=function(elems){elems=this._find(elems);if(!elems){return;}
this.stamps=this.stamps.concat(elems);for(var i=0,len=elems.length;i<len;i++){var elem=elems[i];this.ignore(elem);}};Outlayer.prototype.unstamp=function(elems){elems=this._find(elems);if(!elems){return;}
for(var i=0,len=elems.length;i<len;i++){var elem=elems[i];utils.removeFrom(this.stamps,elem);this.unignore(elem);}};Outlayer.prototype._find=function(elems){if(!elems){return;}
if(typeof elems==='string'){elems=this.element.querySelectorAll(elems);}
elems=utils.makeArray(elems);return elems;};Outlayer.prototype._manageStamps=function(){if(!this.stamps||!this.stamps.length){return;}
this._getBoundingRect();for(var i=0,len=this.stamps.length;i<len;i++){var stamp=this.stamps[i];this._manageStamp(stamp);}};Outlayer.prototype._getBoundingRect=function(){var boundingRect=this.element.getBoundingClientRect();var size=this.size;this._boundingRect={left:boundingRect.left+ size.paddingLeft+ size.borderLeftWidth,top:boundingRect.top+ size.paddingTop+ size.borderTopWidth,right:boundingRect.right-(size.paddingRight+ size.borderRightWidth),bottom:boundingRect.bottom-(size.paddingBottom+ size.borderBottomWidth)};};Outlayer.prototype._manageStamp=noop;Outlayer.prototype._getElementOffset=function(elem){var boundingRect=elem.getBoundingClientRect();var thisRect=this._boundingRect;var size=getSize(elem);var offset={left:boundingRect.left- thisRect.left- size.marginLeft,top:boundingRect.top- thisRect.top- size.marginTop,right:thisRect.right- boundingRect.right- size.marginRight,bottom:thisRect.bottom- boundingRect.bottom- size.marginBottom};return offset;};Outlayer.prototype.handleEvent=function(event){var method='on'+ event.type;if(this[method]){this[method](event);}};Outlayer.prototype.bindResize=function(){if(this.isResizeBound){return;}
eventie.bind(window,'resize',this);this.isResizeBound=true;};Outlayer.prototype.unbindResize=function(){if(this.isResizeBound){eventie.unbind(window,'resize',this);}
this.isResizeBound=false;};Outlayer.prototype.onresize=function(){if(this.resizeTimeout){clearTimeout(this.resizeTimeout);}
var _this=this;function delayed(){_this.resize();delete _this.resizeTimeout;}
this.resizeTimeout=setTimeout(delayed,100);};Outlayer.prototype.resize=function(){if(!this.isResizeBound||!this.needsResizeLayout()){return;}
this.layout();};Outlayer.prototype.needsResizeLayout=function(){var size=getSize(this.element);var hasSizes=this.size&&size;return hasSizes&&size.innerWidth!==this.size.innerWidth;};Outlayer.prototype.addItems=function(elems){var items=this._itemize(elems);if(items.length){this.items=this.items.concat(items);}
return items;};Outlayer.prototype.appended=function(elems){var items=this.addItems(elems);if(!items.length){return;}
this.layoutItems(items,true);this.reveal(items);};Outlayer.prototype.prepended=function(elems){var items=this._itemize(elems);if(!items.length){return;}
var previousItems=this.items.slice(0);this.items=items.concat(previousItems);this._resetLayout();this._manageStamps();this.layoutItems(items,true);this.reveal(items);this.layoutItems(previousItems);};Outlayer.prototype.reveal=function(items){this._emitCompleteOnItems('reveal',items);var len=items&&items.length;for(var i=0;len&&i<len;i++){var item=items[i];item.reveal();}};Outlayer.prototype.hide=function(items){this._emitCompleteOnItems('hide',items);var len=items&&items.length;for(var i=0;len&&i<len;i++){var item=items[i];item.hide();}};Outlayer.prototype.revealItemElements=function(elems){var items=this.getItems(elems);this.reveal(items);};Outlayer.prototype.hideItemElements=function(elems){var items=this.getItems(elems);this.hide(items);};Outlayer.prototype.getItem=function(elem){for(var i=0,len=this.items.length;i<len;i++){var item=this.items[i];if(item.element===elem){return item;}}};Outlayer.prototype.getItems=function(elems){elems=utils.makeArray(elems);var items=[];for(var i=0,len=elems.length;i<len;i++){var elem=elems[i];var item=this.getItem(elem);if(item){items.push(item);}}
return items;};Outlayer.prototype.remove=function(elems){var removeItems=this.getItems(elems);this._emitCompleteOnItems('remove',removeItems);if(!removeItems||!removeItems.length){return;}
for(var i=0,len=removeItems.length;i<len;i++){var item=removeItems[i];item.remove();utils.removeFrom(this.items,item);}};Outlayer.prototype.destroy=function(){var style=this.element.style;style.height='';style.position='';style.width='';for(var i=0,len=this.items.length;i<len;i++){var item=this.items[i];item.destroy();}
this.unbindResize();var id=this.element.outlayerGUID;delete instances[id];delete this.element.outlayerGUID;if(jQuery){jQuery.removeData(this.element,this.constructor.namespace);}};Outlayer.data=function(elem){elem=utils.getQueryElement(elem);var id=elem&&elem.outlayerGUID;return id&&instances[id];};Outlayer.create=function(namespace,options){function Layout(){Outlayer.apply(this,arguments);}
if(Object.create){Layout.prototype=Object.create(Outlayer.prototype);}else{utils.extend(Layout.prototype,Outlayer.prototype);}
Layout.prototype.constructor=Layout;Layout.defaults=utils.extend({},Outlayer.defaults);utils.extend(Layout.defaults,options);Layout.prototype.settings={};Layout.namespace=namespace;Layout.data=Outlayer.data;Layout.Item=function LayoutItem(){Item.apply(this,arguments);};Layout.Item.prototype=new Item();utils.htmlInit(Layout,namespace);if(jQuery&&jQuery.bridget){jQuery.bridget(namespace,Layout);}
return Layout;};Outlayer.Item=Item;return Outlayer;}));(function(window,factory){'use strict';if(typeof define=='function'&&define.amd){define('isotope/js/item',['outlayer/outlayer'],factory);}else if(typeof exports=='object'){module.exports=factory(require('outlayer'));}else{window.Isotope=window.Isotope||{};window.Isotope.Item=factory(window.Outlayer);}}(window,function factory(Outlayer){'use strict';function Item(){Outlayer.Item.apply(this,arguments);}
Item.prototype=new Outlayer.Item();Item.prototype._create=function(){this.id=this.layout.itemGUID++;Outlayer.Item.prototype._create.call(this);this.sortData={};};Item.prototype.updateSortData=function(){if(this.isIgnored){return;}
this.sortData.id=this.id;this.sortData['original-order']=this.id;this.sortData.random=Math.random();var getSortData=this.layout.options.getSortData;var sorters=this.layout._sorters;for(var key in getSortData){var sorter=sorters[key];this.sortData[key]=sorter(this.element,this);}};var _destroy=Item.prototype.destroy;Item.prototype.destroy=function(){_destroy.apply(this,arguments);this.css({display:''});};return Item;}));(function(window,factory){'use strict';if(typeof define=='function'&&define.amd){define('isotope/js/layout-mode',['get-size/get-size','outlayer/outlayer'],factory);}else if(typeof exports=='object'){module.exports=factory(require('get-size'),require('outlayer'));}else{window.Isotope=window.Isotope||{};window.Isotope.LayoutMode=factory(window.getSize,window.Outlayer);}}(window,function factory(getSize,Outlayer){'use strict';function LayoutMode(isotope){this.isotope=isotope;if(isotope){this.options=isotope.options[this.namespace];this.element=isotope.element;this.items=isotope.filteredItems;this.size=isotope.size;}}
(function(){var facadeMethods=['_resetLayout','_getItemLayoutPosition','_manageStamp','_getContainerSize','_getElementOffset','needsResizeLayout'];for(var i=0,len=facadeMethods.length;i<len;i++){var methodName=facadeMethods[i];LayoutMode.prototype[methodName]=getOutlayerMethod(methodName);}
function getOutlayerMethod(methodName){return function(){return Outlayer.prototype[methodName].apply(this.isotope,arguments);};}})();LayoutMode.prototype.needsVerticalResizeLayout=function(){var size=getSize(this.isotope.element);var hasSizes=this.isotope.size&&size;return hasSizes&&size.innerHeight!=this.isotope.size.innerHeight;};LayoutMode.prototype._getMeasurement=function(){this.isotope._getMeasurement.apply(this,arguments);};LayoutMode.prototype.getColumnWidth=function(){this.getSegmentSize('column','Width');};LayoutMode.prototype.getRowHeight=function(){this.getSegmentSize('row','Height');};LayoutMode.prototype.getSegmentSize=function(segment,size){var segmentName=segment+ size;var outerSize='outer'+ size;this._getMeasurement(segmentName,outerSize);if(this[segmentName]){return;}
var firstItemSize=this.getFirstItemSize();this[segmentName]=firstItemSize&&firstItemSize[outerSize]||this.isotope.size['inner'+ size];};LayoutMode.prototype.getFirstItemSize=function(){var firstItem=this.isotope.filteredItems[0];return firstItem&&firstItem.element&&getSize(firstItem.element);};LayoutMode.prototype.layout=function(){this.isotope.layout.apply(this.isotope,arguments);};LayoutMode.prototype.getSize=function(){this.isotope.getSize();this.size=this.isotope.size;};LayoutMode.modes={};LayoutMode.create=function(namespace,options){function Mode(){LayoutMode.apply(this,arguments);}
Mode.prototype=new LayoutMode();if(options){Mode.options=options;}
Mode.prototype.namespace=namespace;LayoutMode.modes[namespace]=Mode;return Mode;};return LayoutMode;}));(function(window,factory){'use strict';if(typeof define==='function'&&define.amd){define('masonry/masonry',['outlayer/outlayer','get-size/get-size','fizzy-ui-utils/utils'],factory);}else if(typeof exports==='object'){module.exports=factory(require('outlayer'),require('get-size'),require('fizzy-ui-utils'));}else{window.Masonry=factory(window.Outlayer,window.getSize,window.fizzyUIUtils);}}(window,function factory(Outlayer,getSize,utils){var Masonry=Outlayer.create('masonry');Masonry.prototype._resetLayout=function(){this.getSize();this._getMeasurement('columnWidth','outerWidth');this._getMeasurement('gutter','outerWidth');this.measureColumns();var i=this.cols;this.colYs=[];while(i--){this.colYs.push(0);}
this.maxY=0;};Masonry.prototype.measureColumns=function(){this.getContainerWidth();if(!this.columnWidth){var firstItem=this.items[0];var firstItemElem=firstItem&&firstItem.element;this.columnWidth=firstItemElem&&getSize(firstItemElem).outerWidth||this.containerWidth;}
var columnWidth=this.columnWidth+=this.gutter;var containerWidth=this.containerWidth+ this.gutter;var cols=containerWidth/columnWidth;var excess=columnWidth- containerWidth%columnWidth;var mathMethod=excess&&excess<1?'round':'floor';cols=Math[mathMethod](cols);this.cols=Math.max(cols,1);};Masonry.prototype.getContainerWidth=function(){var container=this.options.isFitWidth?this.element.parentNode:this.element;var size=getSize(container);this.containerWidth=size&&size.innerWidth;};Masonry.prototype._getItemLayoutPosition=function(item){item.getSize();var remainder=item.size.outerWidth%this.columnWidth;var mathMethod=remainder&&remainder<1?'round':'ceil';var colSpan=Math[mathMethod](item.size.outerWidth/this.columnWidth);colSpan=Math.min(colSpan,this.cols);var colGroup=this._getColGroup(colSpan);var minimumY=Math.min.apply(Math,colGroup);var shortColIndex=utils.indexOf(colGroup,minimumY);var position={x:this.columnWidth*shortColIndex,y:minimumY};var setHeight=minimumY+ item.size.outerHeight;var setSpan=this.cols+ 1- colGroup.length;for(var i=0;i<setSpan;i++){this.colYs[shortColIndex+ i]=setHeight;}
return position;};Masonry.prototype._getColGroup=function(colSpan){if(colSpan<2){return this.colYs;}
var colGroup=[];var groupCount=this.cols+ 1- colSpan;for(var i=0;i<groupCount;i++){var groupColYs=this.colYs.slice(i,i+ colSpan);colGroup[i]=Math.max.apply(Math,groupColYs);}
return colGroup;};Masonry.prototype._manageStamp=function(stamp){var stampSize=getSize(stamp);var offset=this._getElementOffset(stamp);var firstX=this.options.isOriginLeft?offset.left:offset.right;var lastX=firstX+ stampSize.outerWidth;var firstCol=Math.floor(firstX/this.columnWidth);firstCol=Math.max(0,firstCol);var lastCol=Math.floor(lastX/this.columnWidth);lastCol-=lastX%this.columnWidth?0:1;lastCol=Math.min(this.cols- 1,lastCol);var stampMaxY=(this.options.isOriginTop?offset.top:offset.bottom)+
stampSize.outerHeight;for(var i=firstCol;i<=lastCol;i++){this.colYs[i]=Math.max(stampMaxY,this.colYs[i]);}};Masonry.prototype._getContainerSize=function(){this.maxY=Math.max.apply(Math,this.colYs);var size={height:this.maxY};if(this.options.isFitWidth){size.width=this._getContainerFitWidth();}
return size;};Masonry.prototype._getContainerFitWidth=function(){var unusedCols=0;var i=this.cols;while(--i){if(this.colYs[i]!==0){break;}
unusedCols++;}
return(this.cols- unusedCols)*this.columnWidth- this.gutter;};Masonry.prototype.needsResizeLayout=function(){var previousWidth=this.containerWidth;this.getContainerWidth();return previousWidth!==this.containerWidth;};return Masonry;}));(function(window,factory){'use strict';if(typeof define=='function'&&define.amd){define('isotope/js/layout-modes/masonry',['../layout-mode','masonry/masonry'],factory);}else if(typeof exports=='object'){module.exports=factory(require('../layout-mode'),require('masonry-layout'));}else{factory(window.Isotope.LayoutMode,window.Masonry);}}(window,function factory(LayoutMode,Masonry){'use strict';function extend(a,b){for(var prop in b){a[prop]=b[prop];}
return a;}
var MasonryMode=LayoutMode.create('masonry');var _getElementOffset=MasonryMode.prototype._getElementOffset;var layout=MasonryMode.prototype.layout;var _getMeasurement=MasonryMode.prototype._getMeasurement;extend(MasonryMode.prototype,Masonry.prototype);MasonryMode.prototype._getElementOffset=_getElementOffset;MasonryMode.prototype.layout=layout;MasonryMode.prototype._getMeasurement=_getMeasurement;var measureColumns=MasonryMode.prototype.measureColumns;MasonryMode.prototype.measureColumns=function(){this.items=this.isotope.filteredItems;measureColumns.call(this);};var _manageStamp=MasonryMode.prototype._manageStamp;MasonryMode.prototype._manageStamp=function(){this.options.isOriginLeft=this.isotope.options.isOriginLeft;this.options.isOriginTop=this.isotope.options.isOriginTop;_manageStamp.apply(this,arguments);};return MasonryMode;}));(function(window,factory){'use strict';if(typeof define=='function'&&define.amd){define('isotope/js/layout-modes/fit-rows',['../layout-mode'],factory);}else if(typeof exports=='object'){module.exports=factory(require('../layout-mode'));}else{factory(window.Isotope.LayoutMode);}}(window,function factory(LayoutMode){'use strict';var FitRows=LayoutMode.create('fitRows');FitRows.prototype._resetLayout=function(){this.x=0;this.y=0;this.maxY=0;this._getMeasurement('gutter','outerWidth');};FitRows.prototype._getItemLayoutPosition=function(item){item.getSize();var itemWidth=item.size.outerWidth+ this.gutter;var containerWidth=this.isotope.size.innerWidth+ this.gutter;if(this.x!==0&&itemWidth+ this.x>containerWidth){this.x=0;this.y=this.maxY;}
var position={x:this.x,y:this.y};this.maxY=Math.max(this.maxY,this.y+ item.size.outerHeight);this.x+=itemWidth;return position;};FitRows.prototype._getContainerSize=function(){return{height:this.maxY};};return FitRows;}));(function(window,factory){'use strict';if(typeof define=='function'&&define.amd){define('isotope/js/layout-modes/vertical',['../layout-mode'],factory);}else if(typeof exports=='object'){module.exports=factory(require('../layout-mode'));}else{factory(window.Isotope.LayoutMode);}}(window,function factory(LayoutMode){'use strict';var Vertical=LayoutMode.create('vertical',{horizontalAlignment:0});Vertical.prototype._resetLayout=function(){this.y=0;};Vertical.prototype._getItemLayoutPosition=function(item){item.getSize();var x=(this.isotope.size.innerWidth- item.size.outerWidth)*this.options.horizontalAlignment;var y=this.y;this.y+=item.size.outerHeight;return{x:x,y:y};};Vertical.prototype._getContainerSize=function(){return{height:this.y};};return Vertical;}));(function(window,factory){'use strict';if(typeof define=='function'&&define.amd){define(['outlayer/outlayer','get-size/get-size','matches-selector/matches-selector','fizzy-ui-utils/utils','isotope/js/item','isotope/js/layout-mode','isotope/js/layout-modes/masonry','isotope/js/layout-modes/fit-rows','isotope/js/layout-modes/vertical'],function(Outlayer,getSize,matchesSelector,utils,Item,LayoutMode){return factory(window,Outlayer,getSize,matchesSelector,utils,Item,LayoutMode);});}else if(typeof exports=='object'){module.exports=factory(window,require('outlayer'),require('get-size'),require('desandro-matches-selector'),require('fizzy-ui-utils'),require('./item'),require('./layout-mode'),require('./layout-modes/masonry'),require('./layout-modes/fit-rows'),require('./layout-modes/vertical'));}else{window.Isotope=factory(window,window.Outlayer,window.getSize,window.matchesSelector,window.fizzyUIUtils,window.Isotope.Item,window.Isotope.LayoutMode);}}(window,function factory(window,Outlayer,getSize,matchesSelector,utils,Item,LayoutMode){var jQuery=window.jQuery;var trim=String.prototype.trim?function(str){return str.trim();}:function(str){return str.replace(/^\s+|\s+$/g,'');};var docElem=document.documentElement;var getText=docElem.textContent?function(elem){return elem.textContent;}:function(elem){return elem.innerText;};var Isotope=Outlayer.create('isotope',{layoutMode:"masonry",isJQueryFiltering:true,sortAscending:true});Isotope.Item=Item;Isotope.LayoutMode=LayoutMode;Isotope.prototype._create=function(){this.itemGUID=0;this._sorters={};this._getSorters();Outlayer.prototype._create.call(this);this.modes={};this.filteredItems=this.items;this.sortHistory=['original-order'];for(var name in LayoutMode.modes){this._initLayoutMode(name);}};Isotope.prototype.reloadItems=function(){this.itemGUID=0;Outlayer.prototype.reloadItems.call(this);};Isotope.prototype._itemize=function(){var items=Outlayer.prototype._itemize.apply(this,arguments);for(var i=0,len=items.length;i<len;i++){var item=items[i];item.id=this.itemGUID++;}
this._updateItemsSortData(items);return items;};Isotope.prototype._initLayoutMode=function(name){var Mode=LayoutMode.modes[name];var initialOpts=this.options[name]||{};this.options[name]=Mode.options?utils.extend(Mode.options,initialOpts):initialOpts;this.modes[name]=new Mode(this);};Isotope.prototype.layout=function(){if(!this._isLayoutInited&&this.options.isInitLayout){this.arrange();return;}
this._layout();};Isotope.prototype._layout=function(){var isInstant=this._getIsInstant();this._resetLayout();this._manageStamps();this.layoutItems(this.filteredItems,isInstant);this._isLayoutInited=true;};Isotope.prototype.arrange=function(opts){this.option(opts);this._getIsInstant();var filtered=this._filter(this.items);this.filteredItems=filtered.matches;var _this=this;function hideReveal(){_this.reveal(filtered.needReveal);_this.hide(filtered.needHide);}
this._bindArrangeComplete();if(this._isInstant){this._noTransition(hideReveal);}else{hideReveal();}
this._sort();this._layout();};Isotope.prototype._init=Isotope.prototype.arrange;Isotope.prototype._getIsInstant=function(){var isInstant=this.options.isLayoutInstant!==undefined?this.options.isLayoutInstant:!this._isLayoutInited;this._isInstant=isInstant;return isInstant;};Isotope.prototype._bindArrangeComplete=function(){var isLayoutComplete,isHideComplete,isRevealComplete;var _this=this;function arrangeParallelCallback(){if(isLayoutComplete&&isHideComplete&&isRevealComplete){_this.dispatchEvent('arrangeComplete',null,[_this.filteredItems]);}}
this.once('layoutComplete',function(){isLayoutComplete=true;arrangeParallelCallback();});this.once('hideComplete',function(){isHideComplete=true;arrangeParallelCallback();});this.once('revealComplete',function(){isRevealComplete=true;arrangeParallelCallback();});};Isotope.prototype._filter=function(items){var filter=this.options.filter;filter=filter||'*';var matches=[];var hiddenMatched=[];var visibleUnmatched=[];var test=this._getFilterTest(filter);for(var i=0,len=items.length;i<len;i++){var item=items[i];if(item.isIgnored){continue;}
var isMatched=test(item);if(isMatched){matches.push(item);}
if(isMatched&&item.isHidden){hiddenMatched.push(item);}else if(!isMatched&&!item.isHidden){visibleUnmatched.push(item);}}
return{matches:matches,needReveal:hiddenMatched,needHide:visibleUnmatched};};Isotope.prototype._getFilterTest=function(filter){if(jQuery&&this.options.isJQueryFiltering){return function(item){return jQuery(item.element).is(filter);};}
if(typeof filter=='function'){return function(item){return filter(item.element);};}
return function(item){return matchesSelector(item.element,filter);};};Isotope.prototype.updateSortData=function(elems){var items;if(elems){elems=utils.makeArray(elems);items=this.getItems(elems);}else{items=this.items;}
this._getSorters();this._updateItemsSortData(items);};Isotope.prototype._getSorters=function(){var getSortData=this.options.getSortData;for(var key in getSortData){var sorter=getSortData[key];this._sorters[key]=mungeSorter(sorter);}};Isotope.prototype._updateItemsSortData=function(items){var len=items&&items.length;for(var i=0;len&&i<len;i++){var item=items[i];item.updateSortData();}};var mungeSorter=(function(){function mungeSorter(sorter){if(typeof sorter!='string'){return sorter;}
var args=trim(sorter).split(' ');var query=args[0];var attrMatch=query.match(/^\[(.+)\]$/);var attr=attrMatch&&attrMatch[1];var getValue=getValueGetter(attr,query);var parser=Isotope.sortDataParsers[args[1]];sorter=parser?function(elem){return elem&&parser(getValue(elem));}:function(elem){return elem&&getValue(elem);};return sorter;}
function getValueGetter(attr,query){var getValue;if(attr){getValue=function(elem){return elem.getAttribute(attr);};}else{getValue=function(elem){var child=elem.querySelector(query);return child&&getText(child);};}
return getValue;}
return mungeSorter;})();Isotope.sortDataParsers={'parseInt':function(val){return parseInt(val,10);},'parseFloat':function(val){return parseFloat(val);}};Isotope.prototype._sort=function(){var sortByOpt=this.options.sortBy;if(!sortByOpt){return;}
var sortBys=[].concat.apply(sortByOpt,this.sortHistory);var itemSorter=getItemSorter(sortBys,this.options.sortAscending);this.filteredItems.sort(itemSorter);if(sortByOpt!=this.sortHistory[0]){this.sortHistory.unshift(sortByOpt);}};function getItemSorter(sortBys,sortAsc){return function sorter(itemA,itemB){for(var i=0,len=sortBys.length;i<len;i++){var sortBy=sortBys[i];var a=itemA.sortData[sortBy];var b=itemB.sortData[sortBy];if(a>b||a<b){var isAscending=sortAsc[sortBy]!==undefined?sortAsc[sortBy]:sortAsc;var direction=isAscending?1:-1;return(a>b?1:-1)*direction;}}
return 0;};}
Isotope.prototype._mode=function(){var layoutMode=this.options.layoutMode;var mode=this.modes[layoutMode];if(!mode){throw new Error('No layout mode: '+ layoutMode);}
mode.options=this.options[layoutMode];return mode;};Isotope.prototype._resetLayout=function(){Outlayer.prototype._resetLayout.call(this);this._mode()._resetLayout();};Isotope.prototype._getItemLayoutPosition=function(item){return this._mode()._getItemLayoutPosition(item);};Isotope.prototype._manageStamp=function(stamp){this._mode()._manageStamp(stamp);};Isotope.prototype._getContainerSize=function(){return this._mode()._getContainerSize();};Isotope.prototype.needsResizeLayout=function(){return this._mode().needsResizeLayout();};Isotope.prototype.appended=function(elems){var items=this.addItems(elems);if(!items.length){return;}
var filteredItems=this._filterRevealAdded(items);this.filteredItems=this.filteredItems.concat(filteredItems);};Isotope.prototype.prepended=function(elems){var items=this._itemize(elems);if(!items.length){return;}
this._resetLayout();this._manageStamps();var filteredItems=this._filterRevealAdded(items);this.layoutItems(this.filteredItems);this.filteredItems=filteredItems.concat(this.filteredItems);this.items=items.concat(this.items);};Isotope.prototype._filterRevealAdded=function(items){var filtered=this._filter(items);this.hide(filtered.needHide);this.reveal(filtered.matches);this.layoutItems(filtered.matches,true);return filtered.matches;};Isotope.prototype.insert=function(elems){var items=this.addItems(elems);if(!items.length){return;}
var i,item;var len=items.length;for(i=0;i<len;i++){item=items[i];this.element.appendChild(item.element);}
var filteredInsertItems=this._filter(items).matches;for(i=0;i<len;i++){items[i].isLayoutInstant=true;}
this.arrange();for(i=0;i<len;i++){delete items[i].isLayoutInstant;}
this.reveal(filteredInsertItems);};var _remove=Isotope.prototype.remove;Isotope.prototype.remove=function(elems){elems=utils.makeArray(elems);var removeItems=this.getItems(elems);_remove.call(this,elems);var len=removeItems&&removeItems.length;if(!len){return;}
for(var i=0;i<len;i++){var item=removeItems[i];utils.removeFrom(this.filteredItems,item);}};Isotope.prototype.shuffle=function(){for(var i=0,len=this.items.length;i<len;i++){var item=this.items[i];item.sortData.random=Math.random();}
this.options.sortBy='random';this._sort();this._layout();};Isotope.prototype._noTransition=function(fn){var transitionDuration=this.options.transitionDuration;this.options.transitionDuration=0;var returnValue=fn.call(this);this.options.transitionDuration=transitionDuration;return returnValue;};Isotope.prototype.getFilteredItemElements=function(){var elems=[];for(var i=0,len=this.filteredItems.length;i<len;i++){elems.push(this.filteredItems[i].element);}
return elems;};return Isotope;}));!function(a){function b(a){return new RegExp("(^|\\s+)"+a+"(\\s+|$)")}function c(a,b){var c=d(a,b)?f:e;c(a,b)}var d,e,f;"classList"in document.documentElement?(d=function(a,b){return a.classList.contains(b)},e=function(a,b){a.classList.add(b)},f=function(a,b){a.classList.remove(b)}):(d=function(a,c){return b(c).test(a.className)},e=function(a,b){d(a,b)||(a.className=a.className+" "+b)},f=function(a,c){a.className=a.className.replace(b(c)," ")});var g={hasClass:d,addClass:e,removeClass:f,toggleClass:c,has:d,add:e,remove:f,toggle:c};"function"==typeof define&&define.amd?define("classie/classie",g):"object"==typeof exports?module.exports=g:a.classie=g}(window),function(a){function b(){function a(b){for(var c in a.defaults)this[c]=a.defaults[c];for(c in b)this[c]=b[c]}return c.Rect=a,a.defaults={x:0,y:0,width:0,height:0},a.prototype.contains=function(a){var b=a.width||0,c=a.height||0;return this.x<=a.x&&this.y<=a.y&&this.x+this.width>=a.x+b&&this.y+this.height>=a.y+c},a.prototype.overlaps=function(a){var b=this.x+this.width,c=this.y+this.height,d=a.x+a.width,e=a.y+a.height;return this.x<d&&b>a.x&&this.y<e&&c>a.y},a.prototype.getMaximalFreeRects=function(b){if(!this.overlaps(b))return!1;var c,d=[],e=this.x+this.width,f=this.y+this.height,g=b.x+b.width,h=b.y+b.height;return this.y<b.y&&(c=new a({x:this.x,y:this.y,width:this.width,height:b.y-this.y}),d.push(c)),e>g&&(c=new a({x:g,y:this.y,width:e-g,height:this.height}),d.push(c)),f>h&&(c=new a({x:this.x,y:h,width:this.width,height:f-h}),d.push(c)),this.x<b.x&&(c=new a({x:this.x,y:this.y,width:b.x-this.x,height:this.height}),d.push(c)),d},a.prototype.canFit=function(a){return this.width>=a.width&&this.height>=a.height},a}var c=a.Packery=function(){};"function"==typeof define&&define.amd?define("packery/js/rect",b):"object"==typeof exports?module.exports=b():(a.Packery=a.Packery||{},a.Packery.Rect=b())}(window),function(a){function b(a){function b(a,b,c){this.width=a||0,this.height=b||0,this.sortDirection=c||"downwardLeftToRight",this.reset()}b.prototype.reset=function(){this.spaces=[],this.newSpaces=[];var b=new a({x:0,y:0,width:this.width,height:this.height});this.spaces.push(b),this.sorter=c[this.sortDirection]||c.downwardLeftToRight},b.prototype.pack=function(a){for(var b=0,c=this.spaces.length;c>b;b++){var d=this.spaces[b];if(d.canFit(a)){this.placeInSpace(a,d);break}}},b.prototype.placeInSpace=function(a,b){a.x=b.x,a.y=b.y,this.placed(a)},b.prototype.placed=function(a){for(var b=[],c=0,d=this.spaces.length;d>c;c++){var e=this.spaces[c],f=e.getMaximalFreeRects(a);f?b.push.apply(b,f):b.push(e)}this.spaces=b,this.mergeSortSpaces()},b.prototype.mergeSortSpaces=function(){b.mergeRects(this.spaces),this.spaces.sort(this.sorter)},b.prototype.addSpace=function(a){this.spaces.push(a),this.mergeSortSpaces()},b.mergeRects=function(a){for(var b=0,c=a.length;c>b;b++){var d=a[b];if(d){var e=a.slice(0);e.splice(b,1);for(var f=0,g=0,h=e.length;h>g;g++){var i=e[g],j=b>g?0:1;d.contains(i)&&(a.splice(g+j-f,1),f++)}}}return a};var c={downwardLeftToRight:function(a,b){return a.y-b.y||a.x-b.x},rightwardTopToBottom:function(a,b){return a.x-b.x||a.y-b.y}};return b}if("function"==typeof define&&define.amd)define("packery/js/packer",["./rect"],b);else if("object"==typeof exports)module.exports=b(require("./rect"));else{var c=a.Packery=a.Packery||{};c.Packer=b(c.Rect)}}(window),function(a){function b(a,b,c){var d=a("transform"),e=function(){b.Item.apply(this,arguments)};e.prototype=new b.Item;var f=e.prototype._create;return e.prototype._create=function(){f.call(this),this.rect=new c,this.placeRect=new c},e.prototype.dragStart=function(){this.getPosition(),this.removeTransitionStyles(),this.isTransitioning&&d&&(this.element.style[d]="none"),this.getSize(),this.isPlacing=!0,this.needsPositioning=!1,this.positionPlaceRect(this.position.x,this.position.y),this.isTransitioning=!1,this.didDrag=!1},e.prototype.dragMove=function(a,b){this.didDrag=!0;var c=this.layout.size;a-=c.paddingLeft,b-=c.paddingTop,this.positionPlaceRect(a,b)},e.prototype.dragStop=function(){this.getPosition();var a=this.position.x!==this.placeRect.x,b=this.position.y!==this.placeRect.y;this.needsPositioning=a||b,this.didDrag=!1},e.prototype.positionPlaceRect=function(a,b,c){this.placeRect.x=this.getPlaceRectCoord(a,!0),this.placeRect.y=this.getPlaceRectCoord(b,!1,c)},e.prototype.getPlaceRectCoord=function(a,b,c){var d=b?"Width":"Height",e=this.size["outer"+d],f=this.layout[b?"columnWidth":"rowHeight"],g=this.layout.size["inner"+d];b||(g=Math.max(g,this.layout.maxY),this.layout.rowHeight||(g-=this.layout.gutter));var h;if(f){f+=this.layout.gutter,g+=b?this.layout.gutter:0,a=Math.round(a/f);var i;i=this.layout.options.isHorizontal?b?"ceil":"floor":b?"floor":"ceil";var j=Math[i](g/f);j-=Math.ceil(e/f),h=j}else h=g-e;return a=c?a:Math.min(a,h),a*=f||1,Math.max(0,a)},e.prototype.copyPlaceRectPosition=function(){this.rect.x=this.placeRect.x,this.rect.y=this.placeRect.y},e.prototype.removeElem=function(){this.element.parentNode.removeChild(this.element),this.layout.packer.addSpace(this.rect),this.emitEvent("remove",[this])},e}"function"==typeof define&&define.amd?define("packery/js/item",["get-style-property/get-style-property","outlayer/outlayer","./rect"],b):"object"==typeof exports?module.exports=b(require("desandro-get-style-property"),require("outlayer"),require("./rect")):a.Packery.Item=b(a.getStyleProperty,a.Outlayer,a.Packery.Rect)}(window),function(a){function b(a,b,c,d,e,f){function g(a,b){return a.position.y-b.position.y||a.position.x-b.position.x}function h(a,b){return a.position.x-b.position.x||a.position.y-b.position.y}d.prototype.canFit=function(a){return this.width>=a.width-1&&this.height>=a.height-1};var i=c.create("packery");return i.Item=f,i.prototype._create=function(){c.prototype._create.call(this),this.packer=new e,this.stamp(this.options.stamped);var a=this;this.handleDraggabilly={dragStart:function(b){a.itemDragStart(b.element)},dragMove:function(b){a.itemDragMove(b.element,b.position.x,b.position.y)},dragEnd:function(b){a.itemDragEnd(b.element)}},this.handleUIDraggable={start:function(b){a.itemDragStart(b.currentTarget)},drag:function(b,c){a.itemDragMove(b.currentTarget,c.position.left,c.position.top)},stop:function(b){a.itemDragEnd(b.currentTarget)}}},i.prototype._resetLayout=function(){this.getSize(),this._getMeasurements();var a=this.packer;this.options.isHorizontal?(a.width=Number.POSITIVE_INFINITY,a.height=this.size.innerHeight+this.gutter,a.sortDirection="rightwardTopToBottom"):(a.width=this.size.innerWidth+this.gutter,a.height=Number.POSITIVE_INFINITY,a.sortDirection="downwardLeftToRight"),a.reset(),this.maxY=0,this.maxX=0},i.prototype._getMeasurements=function(){this._getMeasurement("columnWidth","width"),this._getMeasurement("rowHeight","height"),this._getMeasurement("gutter","width")},i.prototype._getItemLayoutPosition=function(a){return this._packItem(a),a.rect},i.prototype._packItem=function(a){this._setRectSize(a.element,a.rect),this.packer.pack(a.rect),this._setMaxXY(a.rect)},i.prototype._setMaxXY=function(a){this.maxX=Math.max(a.x+a.width,this.maxX),this.maxY=Math.max(a.y+a.height,this.maxY)},i.prototype._setRectSize=function(a,c){var d=b(a),e=d.outerWidth,f=d.outerHeight;(e||f)&&(e=this._applyGridGutter(e,this.columnWidth),f=this._applyGridGutter(f,this.rowHeight)),c.width=Math.min(e,this.packer.width),c.height=Math.min(f,this.packer.height)},i.prototype._applyGridGutter=function(a,b){if(!b)return a+this.gutter;b+=this.gutter;var c=a%b,d=c&&1>c?"round":"ceil";return a=Math[d](a/b)*b},i.prototype._getContainerSize=function(){return this.options.isHorizontal?{width:this.maxX-this.gutter}:{height:this.maxY-this.gutter}},i.prototype._manageStamp=function(a){var b,c=this.getItem(a);if(c&&c.isPlacing)b=c.placeRect;else{var e=this._getElementOffset(a);b=new d({x:this.options.isOriginLeft?e.left:e.right,y:this.options.isOriginTop?e.top:e.bottom})}this._setRectSize(a,b),this.packer.placed(b),this._setMaxXY(b)},i.prototype.sortItemsByPosition=function(){var a=this.options.isHorizontal?h:g;this.items.sort(a)},i.prototype.fit=function(a,b,c){var d=this.getItem(a);d&&(this._getMeasurements(),this.stamp(d.element),d.getSize(),d.isPlacing=!0,b=void 0===b?d.rect.x:b,c=void 0===c?d.rect.y:c,d.positionPlaceRect(b,c,!0),this._bindFitEvents(d),d.moveTo(d.placeRect.x,d.placeRect.y),this.layout(),this.unstamp(d.element),this.sortItemsByPosition(),d.isPlacing=!1,d.copyPlaceRectPosition())},i.prototype._bindFitEvents=function(a){function b(){d++,2===d&&c.emitEvent("fitComplete",[c,a])}var c=this,d=0;a.on("layout",function(){return b(),!0}),this.on("layoutComplete",function(){return b(),!0})},i.prototype.resize=function(){var a=b(this.element),c=this.size&&a,d=this.options.isHorizontal?"innerHeight":"innerWidth";c&&a[d]===this.size[d]||this.layout()},i.prototype.itemDragStart=function(a){this.stamp(a);var b=this.getItem(a);b&&b.dragStart()},i.prototype.itemDragMove=function(a,b,c){function d(){f.layout(),delete f.dragTimeout}var e=this.getItem(a);e&&e.dragMove(b,c);var f=this;this.clearDragTimeout(),this.dragTimeout=setTimeout(d,40)},i.prototype.clearDragTimeout=function(){this.dragTimeout&&clearTimeout(this.dragTimeout)},i.prototype.itemDragEnd=function(b){var c,d=this.getItem(b);if(d&&(c=d.didDrag,d.dragStop()),!d||!c&&!d.needsPositioning)return void this.unstamp(b);a.add(d.element,"is-positioning-post-drag");var e=this._getDragEndLayoutComplete(b,d);d.needsPositioning?(d.on("layout",e),d.moveTo(d.placeRect.x,d.placeRect.y)):d&&d.copyPlaceRectPosition(),this.clearDragTimeout(),this.on("layoutComplete",e),this.layout()},i.prototype._getDragEndLayoutComplete=function(b,c){var d=c&&c.needsPositioning,e=0,f=d?2:1,g=this;return function(){return e++,e!==f?!0:(c&&(a.remove(c.element,"is-positioning-post-drag"),c.isPlacing=!1,c.copyPlaceRectPosition()),g.unstamp(b),g.sortItemsByPosition(),d&&g.emitEvent("dragItemPositioned",[g,c]),!0)}},i.prototype.bindDraggabillyEvents=function(a){a.on("dragStart",this.handleDraggabilly.dragStart),a.on("dragMove",this.handleDraggabilly.dragMove),a.on("dragEnd",this.handleDraggabilly.dragEnd)},i.prototype.bindUIDraggableEvents=function(a){a.on("dragstart",this.handleUIDraggable.start).on("drag",this.handleUIDraggable.drag).on("dragstop",this.handleUIDraggable.stop)},i.Rect=d,i.Packer=e,i}"function"==typeof define&&define.amd?define("packery/js/packery",["classie/classie","get-size/get-size","outlayer/outlayer","./rect","./packer","./item"],b):"object"==typeof exports?module.exports=b(require("desandro-classie"),require("get-size"),require("outlayer"),require("./rect"),require("./packer"),require("./item")):a.Packery=b(a.classie,a.getSize,a.Outlayer,a.Packery.Rect,a.Packery.Packer,a.Packery.Item)}(window),function(a){function b(a,b){for(var c in b)a[c]=b[c];return a}function c(a,c,d){var e=a.create("packery"),f=e.prototype._getElementOffset,g=e.prototype._getMeasurement;b(e.prototype,c.prototype),e.prototype._getElementOffset=f,e.prototype._getMeasurement=g;var h=e.prototype._resetLayout;e.prototype._resetLayout=function(){this.packer=this.packer||new c.Packer,h.apply(this,arguments)};var i=e.prototype._getItemLayoutPosition;e.prototype._getItemLayoutPosition=function(a){return a.rect=a.rect||new c.Rect,i.call(this,a)};var j=e.prototype._manageStamp;return e.prototype._manageStamp=function(){this.options.isOriginLeft=this.isotope.options.isOriginLeft,this.options.isOriginTop=this.isotope.options.isOriginTop,j.apply(this,arguments)},e.prototype.needsResizeLayout=function(){var a=d(this.element),b=this.size&&a,c=this.options.isHorizontal?"innerHeight":"innerWidth";return b&&a[c]!==this.size[c]},e}"function"==typeof define&&define.amd?define(["isotope/js/layout-mode","packery/js/packery","get-size/get-size"],c):"object"==typeof exports?module.exports=c(require("isotope-layout/js/layout-mode"),require("packery"),require("get-size")):c(a.Isotope.LayoutMode,a.Packery,a.getSize)}(window);(function(window,factory){if(typeof define==='function'&&define.amd){define(['isotope/js/layout-mode'],factory);}else if(typeof exports==='object'){module.exports=factory(require('isotope-layout/js/layout-mode'));}else{factory(window.Isotope.LayoutMode);}}(window,function factory(LayoutMode){'use strict';var CellsByRow=LayoutMode.create('cellsByRow');var proto=CellsByRow.prototype;proto._resetLayout=function(){this.itemIndex=0;this.getColumnWidth();this.getRowHeight();this.cols=Math.floor(this.isotope.size.innerWidth/this.columnWidth);this.cols=Math.max(this.cols,1);};proto._getItemLayoutPosition=function(item){item.getSize();var col=this.itemIndex%this.cols;var row=Math.floor(this.itemIndex/this.cols);var x=(col+ 0.5)*this.columnWidth- item.size.outerWidth/2;var y=(row+ 0.5)*this.rowHeight- item.size.outerHeight/2;this.itemIndex++;return{x:x,y:y};};proto._getContainerSize=function(){return{height:Math.ceil(this.itemIndex/this.cols)*this.rowHeight};};return CellsByRow;}));;(function(e){if(typeof define==="function"&&define.amd){define(["jquery"],e)}else{e(jQuery)}})(function(e,t){"use strict";e.infinitescroll=function(n,r,i){this.element=e(i);if(!this._create(n,r)){this.failed=true}};e.infinitescroll.defaults={loading:{finished:t,finishedMsg:"<em>Congratulations, you've reached the end of the internet.</em>",img:"data:image/gif;base64,R0lGODlh3AATAPQeAPDy+MnQ6LW/4N3h8MzT6rjC4sTM5r/I5NHX7N7j8c7U6tvg8OLl8uXo9Ojr9b3G5MfP6Ovu9tPZ7PT1+vX2+tbb7vf4+8/W69jd7rC73vn5/O/x+K243ai02////wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQECgD/ACwAAAAA3AATAAAF/6AnjmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEj0BAScpHLJbDqf0Kh0Sq1ar9isdioItAKGw+MAKYMFhbF63CW438f0mg1R2O8EuXj/aOPtaHx7fn96goR4hmuId4qDdX95c4+RBIGCB4yAjpmQhZN0YGYGXitdZBIVGAsLoq4BBKQDswm1CQRkcG6ytrYKubq8vbfAcMK9v7q7EMO1ycrHvsW6zcTKsczNz8HZw9vG3cjTsMIYqQkCLBwHCgsMDQ4RDAYIqfYSFxDxEfz88/X38Onr16+Bp4ADCco7eC8hQYMAEe57yNCew4IVBU7EGNDiRn8Z831cGLHhSIgdFf9chIeBg7oA7gjaWUWTVQAGE3LqBDCTlc9WOHfm7PkTqNCh54rePDqB6M+lR536hCpUqs2gVZM+xbrTqtGoWqdy1emValeXKzggYBBB5y1acFNZmEvXAoN2cGfJrTv3bl69Ffj2xZt3L1+/fw3XRVw4sGDGcR0fJhxZsF3KtBTThZxZ8mLMgC3fRatCbYMNFCzwLEqLgE4NsDWs/tvqdezZf13Hvk2A9Szdu2X3pg18N+68xXn7rh1c+PLksI/Dhe6cuO3ow3NfV92bdArTqC2Ebd3A8vjf5QWfH6Bg7Nz17c2fj69+fnq+8N2Lty+fuP78/eV2X13neIcCeBRwxorbZrA1ANoCDGrgoG8RTshahQ9iSKEEzUmYIYfNWViUhheCGJyIP5E4oom7WWjgCeBFAJNv1DVV01MAdJhhjdkplWNzO/5oXI846njjVEIqR2OS2B1pE5PVscajkxhMycqLJghQSwT40PgfAl4GqNSXYdZXJn5gSkmmmmJu1aZYb14V51do+pTOCmA40AqVCIhG5IJ9PvYnhIFOxmdqhpaI6GeHCtpooisuutmg+Eg62KOMKuqoTaXgicQWoIYq6qiklmoqFV0UoeqqrLbq6quwxirrrLTWauutJ4QAACH5BAUKABwALAcABADOAAsAAAX/IPd0D2dyRCoUp/k8gpHOKtseR9yiSmGbuBykler9XLAhkbDavXTL5k2oqFqNOxzUZPU5YYZd1XsD72rZpBjbeh52mSNnMSC8lwblKZGwi+0QfIJ8CncnCoCDgoVnBHmKfByGJimPkIwtiAeBkH6ZHJaKmCeVnKKTHIihg5KNq4uoqmEtcRUtEREMBggtEr4QDrjCuRC8h7/BwxENeicSF8DKy82pyNLMOxzWygzFmdvD2L3P0dze4+Xh1Arkyepi7dfFvvTtLQkZBC0T/FX3CRgCMOBHsJ+EHYQY7OinAGECgQsB+Lu3AOK+CewcWjwxQeJBihtNGHSoQOE+iQ3//4XkwBBhRZMcUS6YSXOAwIL8PGqEaSJCiYt9SNoCmnJPAgUVLChdaoFBURN8MAzl2PQphwQLfDFd6lTowglHve6rKpbjhK7/pG5VinZP1qkiz1rl4+tr2LRwWU64cFEihwEtZgbgR1UiHaMVvxpOSwBA37kzGz9e8G+B5MIEKLutOGEsAH2ATQwYfTmuX8aETWdGPZmiZcccNSzeTCA1Sw0bdiitC7LBWgu8jQr8HRzqgpK6gX88QbrB14z/kF+ELpwB8eVQj/JkqdylAudji/+ts3039vEEfK8Vz2dlvxZKG0CmbkKDBvllRd6fCzDvBLKBDSCeffhRJEFebFk1k/Mv9jVIoIJZSeBggwUaNeB+Qk34IE0cXlihcfRxkOAJFFhwGmKlmWDiakZhUJtnLBpnWWcnKaAZcxI0piFGGLBm1mc90kajSCveeBVWKeYEoU2wqeaQi0PetoE+rr14EpVC7oAbAUHqhYExbn2XHHsVqbcVew9tx8+XJKk5AZsqqdlddGpqAKdbAYBn1pcczmSTdWvdmZ17c1b3FZ99vnTdCRFM8OEcAhLwm1NdXnWcBBSMRWmfkWZqVlsmLIiAp/o1gGV2vpS4lalGYsUOqXrddcKCmK61aZ8SjEpUpVFVoCpTj4r661Km7kBHjrDyc1RAIQAAIfkEBQoAGwAsBwAEAM4ACwAABf/gtmUCd4goQQgFKj6PYKi0yrrbc8i4ohQt12EHcal+MNSQiCP8gigdz7iCioaCIvUmZLp8QBzW0EN2vSlCuDtFKaq4RyHzQLEKZNdiQDhRDVooCwkbfm59EAmKi4SGIm+AjIsKjhsqB4mSjT2IOIOUnICeCaB/mZKFNTSRmqVpmJqklSqskq6PfYYCDwYHDC4REQwGCBLGxxIQDsHMwhAIX8bKzcENgSLGF9PU1j3Sy9zX2NrgzQziChLk1BHWxcjf7N046tvN82715czn9Pryz6Ilc4ACj4EBOCZM8KEnAYYADBRKnACAYUMFv1wotIhCEcaJCisqwJFgAUSQGyX/kCSVUUTIdKMwJlyo0oXHlhskwrTJciZHEXsgaqS4s6PJiCAr1uzYU8kBBSgnWFqpoMJMUjGtDmUwkmfVmVypakWhEKvXsS4nhLW5wNjVroJIoc05wSzTr0PtiigpYe4EC2vj4iWrFu5euWIMRBhacaVJhYQBEFjA9jHjyQ0xEABwGceGAZYjY0YBOrRLCxUp29QM+bRkx5s7ZyYgVbTqwwti2ybJ+vLtDYpycyZbYOlptxdx0kV+V7lC5iJAyyRrwYKxAdiz82ng0/jnAdMJFz0cPi104Ec1Vj9/M6F173vKL/feXv156dw11tlqeMMnv4V5Ap53GmjQQH97nFfg+IFiucfgRX5Z8KAgbUlQ4IULIlghhhdOSB6AgX0IVn8eReghen3NRIBsRgnH4l4LuEidZBjwRpt6NM5WGwoW0KSjCwX6yJSMab2GwwAPDXfaBCtWpluRTQqC5JM5oUZAjUNS+VeOLWpJEQ7VYQANW0INJSZVDFSnZphjSikfmzE5N4EEbQI1QJmnWXCmHulRp2edwDXF43txukenJwvI9xyg9Q26Z3MzGUcBYFEChZh6DVTq34AU8Iflh51Sd+CnKFYQ6mmZkhqfBKfSxZWqA9DZanWjxmhrWwi0qtCrt/43K6WqVjjpmhIqgEGvculaGKklKstAACEAACH5BAUKABwALAcABADOAAsAAAX/ICdyQmaMYyAUqPgIBiHPxNpy79kqRXH8wAPsRmDdXpAWgWdEIYm2llCHqjVHU+jjJkwqBTecwItShMXkEfNWSh8e1NGAcLgpDGlRgk7EJ/6Ae3VKfoF/fDuFhohVeDeCfXkcCQqDVQcQhn+VNDOYmpSWaoqBlUSfmowjEA+iEAEGDRGztAwGCDcXEA60tXEiCrq8vREMEBLIyRLCxMWSHMzExnbRvQ2Sy7vN0zvVtNfU2tLY3rPgLdnDvca4VQS/Cpk3ABwSLQkYAQwT/P309vcI7OvXr94jBQMJ/nskkGA/BQBRLNDncAIAiDcG6LsxAWOLiQzmeURBKWSLCQbv/1F0eDGinJUKR47YY1IEgQASKk7Yc7ACRwZm7mHweRJoz59BJUogisKCUaFMR0x4SlJBVBFTk8pZivTR0K73rN5wqlXEAq5Fy3IYgHbEzQ0nLy4QSoCjXLoom96VOJEeCosK5n4kkFfqXjl94wa+l1gvAcGICbewAOAxY8l/Ky/QhAGz4cUkGxu2HNozhwMGBnCUqUdBg9UuW9eUynqSwLHIBujePef1ZGQZXcM+OFuEBeBhi3OYgLyqcuaxbT9vLkf4SeqyWxSQpKGB2gQpm1KdWbu72rPRzR9Ne2Nu9Kzr/1Jqj0yD/fvqP4aXOt5sW/5qsXXVcv1Nsp8IBUAmgswGF3llGgeU1YVXXKTN1FlhWFXW3gIE+DVChApysACHHo7Q4A35lLichh+ROBmLKAzgYmYEYDAhCgxKGOOMn4WR4kkDaoBBOxJtdNKQxFmg5JIWIBnQc07GaORfUY4AEkdV6jHlCEISSZ5yTXpp1pbGZbkWmcuZmQCaE6iJ0FhjMaDjTMsgZaNEHFRAQVp3bqXnZED1qYcECOz5V6BhSWCoVJQIKuKQi2KFKEkEFAqoAo7uYSmO3jk61wUUMKmknJ4SGimBmAa0qVQBhAAAIfkEBQoAGwAsBwAEAM4ACwAABf/gJm5FmRlEqhJC+bywgK5pO4rHI0D3pii22+Mg6/0Ej96weCMAk7cDkXf7lZTTnrMl7eaYoy10JN0ZFdco0XAuvKI6qkgVFJXYNwjkIBcNBgR8TQoGfRsJCRuCYYQQiI+ICosiCoGOkIiKfSl8mJkHZ4U9kZMbKaI3pKGXmJKrngmug4WwkhA0lrCBWgYFCCMQFwoQDRHGxwwGCBLMzRLEx8iGzMMO0cYNeCMKzBDW19lnF9DXDIY/48Xg093f0Q3s1dcR8OLe8+Y91OTv5wrj7o7B+7VNQqABIoRVCMBggsOHE36kSoCBIcSH3EbFangxogJYFi8CkJhqQciLJEf/LDDJEeJIBT0GsOwYUYJGBS0fjpQAMidGmyVP6sx4Y6VQhzs9VUwkwqaCCh0tmKoFtSMDmBOf9phg4SrVrROuasRQAaxXpVUhdsU6IsECZlvX3kwLUWzRt0BHOLTbNlbZG3vZinArge5Dvn7wbqtQkSYAAgtKmnSsYKVKo2AfW048uaPmG386i4Q8EQMBAIAnfB7xBxBqvapJ9zX9WgRS2YMpnvYMGdPK3aMjt/3dUcNI4blpj7iwkMFWDXDvSmgAlijrt9RTR78+PS6z1uAJZIe93Q8g5zcsWCi/4Y+C8bah5zUv3vv89uft30QP23punGCx5954oBBwnwYaNCDY/wYrsYeggnM9B2Fpf8GG2CEUVWhbWAtGouEGDy7Y4IEJVrbSiXghqGKIo7z1IVcXIkKWWR361QOLWWnIhwERpLaaCCee5iMBGJQmJGyPFTnbkfHVZGRtIGrg5HALEJAZbu39BuUEUmq1JJQIPtZilY5hGeSWsSk52G9XqsmgljdIcABytq13HyIM6RcUA+r1qZ4EBF3WHWB29tBgAzRhEGhig8KmqKFv8SeCeo+mgsF7YFXa1qWSbkDpom/mqR1PmHCqJ3fwNRVXjC7S6CZhFVCQ2lWvZiirhQq42SACt25IK2hv8TprriUV1usGgeka7LFcNmCldMLi6qZMgFLgpw16Cipb7bC1knXsBiEAACH5BAUKABsALAcABADOAAsAAAX/4FZsJPkUmUGsLCEUTywXglFuSg7fW1xAvNWLF6sFFcPb42C8EZCj24EJdCp2yoegWsolS0Uu6fmamg8n8YYcLU2bXSiRaXMGvqV6/KAeJAh8VgZqCX+BexCFioWAYgqNi4qAR4ORhRuHY408jAeUhAmYYiuVlpiflqGZa5CWkzc5fKmbbhIpsAoQDRG8vQwQCBLCwxK6vb5qwhfGxxENahvCEA7NzskSy7vNzzzK09W/PNHF1NvX2dXcN8K55cfh69Luveol3vO8zwi4Yhj+AQwmCBw4IYclDAAJDlQggVOChAoLKkgFkSCAHDwWLKhIEOONARsDKryogFPIiAUb/95gJNIiw4wnI778GFPhzBKFOAq8qLJEhQpiNArjMcHCmlTCUDIouTKBhApELSxFWiGiVKY4E2CAekPgUphDu0742nRrVLJZnyrFSqKQ2ohoSYAMW6IoDpNJ4bLdILTnAj8KUF7UeENjAKuDyxIgOuGiOI0EBBMgLNew5AUrDTMGsFixwBIaNCQuAXJB57qNJ2OWm2Aj4skwCQCIyNkhhtMkdsIuodE0AN4LJDRgfLPtn5YDLdBlraAByuUbBgxQwICxMOnYpVOPej074OFdlfc0TqC62OIbcppHjV4o+LrieWhfT8JC/I/T6W8oCl29vQ0XjLdBaA3s1RcPBO7lFvpX8BVoG4O5jTXRQRDuJ6FDTzEWF1/BCZhgbyAKE9qICYLloQYOFtahVRsWYlZ4KQJHlwHS/IYaZ6sZd9tmu5HQm2xi1UaTbzxYwJk/wBF5g5EEYOBZeEfGZmNdFyFZmZIR4jikbLThlh5kUUVJGmRT7sekkziRWUIACABk3T4qCsedgO4xhgGcY7q5pHJ4klBBTQRJ0CeHcoYHHUh6wgfdn9uJdSdMiebGJ0zUPTcoS286FCkrZxnYoYYKWLkBowhQoBeaOlZAgVhLidrXqg2GiqpQpZ4apwSwRtjqrB3muoF9BboaXKmshlqWqsWiGt2wphJkQbAU5hoCACH5BAUKABsALAcABADOAAsAAAX/oGFw2WZuT5oZROsSQnGaKjRvilI893MItlNOJ5v5gDcFrHhKIWcEYu/xFEqNv6B1N62aclysF7fsZYe5aOx2yL5aAUGSaT1oTYMBwQ5VGCAJgYIJCnx1gIOBhXdwiIl7d0p2iYGQUAQBjoOFSQR/lIQHnZ+Ue6OagqYzSqSJi5eTpTxGcjcSChANEbu8DBAIEsHBChe5vL13G7fFuscRDcnKuM3H0La3EA7Oz8kKEsXazr7Cw9/Gztar5uHHvte47MjktznZ2w0G1+D3BgirAqJmJMAQgMGEgwgn5Ei0gKDBhBMALGRYEOJBb5QcWlQo4cbAihZz3GgIMqFEBSM1/4ZEOWPAgpIIJXYU+PIhRG8ja1qU6VHlzZknJNQ6UanCjQkWCIGSUGEjAwVLjc44+DTqUQtPPS5gejUrTa5TJ3g9sWCr1BNUWZI161StiQUDmLYdGfesibQ3XMq1OPYthrwuA2yU2LBs2cBHIypYQPPlYAKFD5cVvNPtW8eVGbdcQADATsiNO4cFAPkvHpedPzc8kUcPgNGgZ5RNDZG05reoE9s2vSEP79MEGiQGy1qP8LA4ZcdtsJE48ONoLTBtTV0B9LsTnPceoIDBDQvS7W7vfjVY3q3eZ4A339J4eaAmKqU/sV58HvJh2RcnIBsDUw0ABqhBA5aV5V9XUFGiHfVeAiWwoFgJJrIXRH1tEMiDFV4oHoAEGlaWhgIGSGBO2nFomYY3mKjVglidaNYJGJDkWW2xxTfbjCbVaOGNqoX2GloR8ZeTaECS9pthRGJH2g0b3Agbk6hNANtteHD2GJUucfajCQBy5OOTQ25ZgUPvaVVQmbKh9510/qQpwXx3SQdfk8tZJOd5b6JJFplT3ZnmmX3qd5l1eg5q00HrtUkUn0AKaiGjClSAgKLYZcgWXwocGRcCFGCKwSB6ceqphwmYRUFYT/1WKlOdUpipmxW0mlCqHjYkAaeoZlqrqZ4qd+upQKaapn/AmgAegZ8KUtYtFAQQAgAh+QQFCgAbACwHAAQAzgALAAAF/+C2PUcmiCiZGUTrEkKBis8jQEquKwU5HyXIbEPgyX7BYa5wTNmEMwWsSXsqFbEh8DYs9mrgGjdK6GkPY5GOeU6ryz7UFopSQEzygOGhJBjoIgMDBAcBM0V/CYqLCQqFOwobiYyKjn2TlI6GKC2YjJZknouaZAcQlJUHl6eooJwKooobqoewrJSEmyKdt59NhRKFMxLEEA4RyMkMEAjDEhfGycqAG8TQx9IRDRDE3d3R2ctD1RLg0ttKEnbY5wZD3+zJ6M7X2RHi9Oby7u/r9g38UFjTh2xZJBEBMDAboogAgwkQI07IMUORwocSJwCgWDFBAIwZOaJIsOBjRogKJP8wTODw5ESVHVtm3AhzpEeQElOuNDlTZ0ycEUWKWFASqEahGwYUPbnxoAgEdlYSqDBkgoUNClAlIHbSAoOsqCRQnQHxq1axVb06FWFxLIqyaze0Tft1JVqyE+pWXMD1pF6bYl3+HTqAWNW8cRUFzmih0ZAAB2oGKukSAAGGRHWJgLiR6AylBLpuHKKUMlMCngMpDSAa9QIUggZVVvDaJobLeC3XZpvgNgCmtPcuwP3WgmXSq4do0DC6o2/guzcseECtUoO0hmcsGKDgOt7ssBd07wqesAIGZC1YIBa7PQHvb1+SFo+++HrJSQfB33xfav3i5eX3Hnb4CTJgegEq8tH/YQEOcIJzbm2G2EoYRLgBXFpVmFYDcREV4HIcnmUhiGBRouEMJGJGzHIspqgdXxK0yCKHRNXoIX4uorCdTyjkyNtdPWrA4Up82EbAbzMRxxZRR54WXVLDIRmRcag5d2R6ugl3ZXzNhTecchpMhIGVAKAYpgJjjsSklBEd99maZoo535ZvdamjBEpusJyctg3h4X8XqodBMx0tiNeg/oGJaKGABpogS40KSqiaEgBqlQWLUtqoVQnytekEjzo0hHqhRorppOZt2p923M2AAV+oBtpAnnPNoB6HaU6mAAIU+IXmi3j2mtFXuUoHKwXpzVrsjcgGOauKEjQrwq157hitGq2NoWmjh7z6Wmxb0m5w66+2VRAuXN/yFUAIACH5BAUKABsALAcABADOAAsAAAX/4CZuRiaM45MZqBgIRbs9AqTcuFLE7VHLOh7KB5ERdjJaEaU4ClO/lgKWjKKcMiJQ8KgumcieVdQMD8cbBeuAkkC6LYLhOxoQ2PF5Ys9PKPBMen17f0CCg4VSh32JV4t8jSNqEIOEgJKPlkYBlJWRInKdiJdkmQlvKAsLBxdABA4RsbIMBggtEhcQsLKxDBC2TAS6vLENdJLDxMZAubu8vjIbzcQRtMzJz79S08oQEt/guNiyy7fcvMbh4OezdAvGrakLAQwyABsELQkY9BP+//ckyPDD4J9BfAMh1GsBoImMeQUN+lMgUJ9CiRMa5msxoB9Gh/o8GmxYMZXIgxtR/yQ46S/gQAURR0pDwYDfywoyLPip5AdnCwsMFPBU4BPFhKBDi444quCmDKZOfwZ9KEGpCKgcN1jdALSpPqIYsabS+nSqvqplvYqQYAeDPgwKwjaMtiDl0oaqUAyo+3TuWwUAMPpVCfee0cEjVBGQq2ABx7oTWmQk4FglZMGN9fGVDMCuiH2AOVOu/PmyxM630gwM0CCn6q8LjVJ8GXvpa5Uwn95OTC/nNxkda1/dLSK475IjCD6dHbK1ZOa4hXP9DXs5chJ00UpVm5xo2qRpoxptwF2E4/IbJpB/SDz9+q9b1aNfQH08+p4a8uvX8B53fLP+ycAfemjsRUBgp1H20K+BghHgVgt1GXZXZpZ5lt4ECjxYR4ScUWiShEtZqBiIInRGWnERNnjiBglw+JyGnxUmGowsyiiZg189lNtPGACjV2+S9UjbU0JWF6SPvEk3QZEqsZYTk3UAaRSUnznJI5LmESCdBVSyaOWUWLK4I5gDUYVeV1T9l+FZClCAUVA09uSmRHBCKAECFEhW51ht6rnmWBXkaR+NjuHpJ40D3DmnQXt2F+ihZxlqVKOfQRACACH5BAUKABwALAcABADOAAsAAAX/ICdyUCkUo/g8mUG8MCGkKgspeC6j6XEIEBpBUeCNfECaglBcOVfJFK7YQwZHQ6JRZBUqTrSuVEuD3nI45pYjFuWKvjjSkCoRaBUMWxkwBGgJCXspQ36Bh4EEB0oKhoiBgyNLjo8Ki4QElIiWfJqHnISNEI+Ql5J9o6SgkqKkgqYihamPkW6oNBgSfiMMDQkGCBLCwxIQDhHIyQwQCGMKxsnKVyPCF9DREQ3MxMPX0cu4wt7J2uHWx9jlKd3o39MiuefYEcvNkuLt5O8c1ePI2tyELXGQwoGDAQf+iEC2xByDCRAjTlAgIUWCBRgCPJQ4AQBFXAs0coT40WLIjRxL/47AcHLkxIomRXL0CHPERZkpa4q4iVKiyp0tR/7kwHMkTUBBJR5dOCEBAVcKKtCAyOHpowXCpk7goABqBZdcvWploACpBKkpIJI1q5OD2rIWE0R1uTZu1LFwbWL9OlKuWb4c6+o9i3dEgw0RCGDUG9KlRw56gDY2qmCByZBaASi+TACA0TucAaTteCcy0ZuOK3N2vJlx58+LRQyY3Xm0ZsgjZg+oPQLi7dUcNXi0LOJw1pgNtB7XG6CBy+U75SYfPTSQAgZTNUDnQHt67wnbZyvwLgKiMN3oCZB3C76tdewpLFgIP2C88rbi4Y+QT3+8S5USMICZXWj1pkEDeUU3lOYGB3alSoEiMIjgX4WlgNF2EibIwQIXauWXSRg2SAOHIU5IIIMoZkhhWiJaiFVbKo6AQEgQXrTAazO1JhkBrBG3Y2Y6EsUhaGn95hprSN0oWpFE7rhkeaQBchGOEWnwEmc0uKWZj0LeuNV3W4Y2lZHFlQCSRjTIl8uZ+kG5HU/3sRlnTG2ytyadytnD3HrmuRcSn+0h1dycexIK1KCjYaCnjCCVqOFFJTZ5GkUUjESWaUIKU2lgCmAKKQIUjHapXRKE+t2og1VgankNYnohqKJ2CmKplso6GKz7WYCgqxeuyoF8u9IQAgA7",msg:null,msgText:"<em>Loading the next set of posts...</em>",selector:null,speed:"fast",start:t},state:{isDuringAjax:false,isInvalidPage:false,isDestroyed:false,isDone:false,isPaused:false,isBeyondMaxPage:false,currPage:1},debug:false,behavior:t,binder:e(window),nextSelector:"div.navigation a:first",navSelector:"div.navigation",contentSelector:null,extraScrollPx:150,itemSelector:"div.post",animate:false,pathParse:t,dataType:"html",appendCallback:true,bufferPx:40,errorCallback:function(){},infid:0,pixelsFromNavToBottom:t,path:t,prefill:false,maxPage:t};e.infinitescroll.prototype={_binding:function(n){var r=this,i=r.options;i.v="2.0b2.120520";if(!!i.behavior&&this["_binding_"+i.behavior]!==t){this["_binding_"+i.behavior].call(this);return}if(n!=="bind"&&n!=="unbind"){this._debug("Binding value  "+n+" not valid");return false}if(n==="unbind"){this.options.binder.unbind("smartscroll.infscr."+r.options.infid)}else{this.options.binder[n]("smartscroll.infscr."+r.options.infid,function(){r.scroll()})}this._debug("Binding",n)},_create:function(r,i){var s=e.extend(true,{},e.infinitescroll.defaults,r);this.options=s;var o=e(window);var u=this;if(!u._validate(r)){return false}var a=e(s.nextSelector).attr("href");if(!a){this._debug("Navigation selector not found");return false}s.path=s.path||this._determinepath(a);s.contentSelector=s.contentSelector||this.element;s.loading.selector=s.loading.selector||s.contentSelector;s.loading.msg=s.loading.msg||e('<div id="infscr-loading"><img alt="Loading..." src="'+s.loading.img+'" /><div>'+s.loading.msgText+"</div></div>");(new Image).src=s.loading.img;if(s.pixelsFromNavToBottom===t){s.pixelsFromNavToBottom=e(document).height()-e(s.navSelector).offset().top;this._debug("pixelsFromNavToBottom: "+s.pixelsFromNavToBottom)}var f=this;s.loading.start=s.loading.start||function(){e(s.navSelector).hide();s.loading.msg.appendTo(s.loading.selector).show(s.loading.speed,e.proxy(function(){this.beginAjax(s)},f))};s.loading.finished=s.loading.finished||function(){if(!s.state.isBeyondMaxPage)s.loading.msg.fadeOut(s.loading.speed)};s.callback=function(n,r,u){if(!!s.behavior&&n["_callback_"+s.behavior]!==t){n["_callback_"+s.behavior].call(e(s.contentSelector)[0],r,u)}if(i){i.call(e(s.contentSelector)[0],r,s,u)}if(s.prefill){o.bind("resize.infinite-scroll",n._prefill)}};if(r.debug){if(Function.prototype.bind&&(typeof console==="object"||typeof console==="function")&&typeof console.log==="object"){["log","info","warn","error","assert","dir","clear","profile","profileEnd"].forEach(function(e){console[e]=this.call(console[e],console)},Function.prototype.bind)}}this._setup();if(s.prefill){this._prefill()}return true},_prefill:function(){function i(){return e(n.options.contentSelector).height()<=r.height()}var n=this;var r=e(window);this._prefill=function(){if(i()){n.scroll()}r.bind("resize.infinite-scroll",function(){if(i()){r.unbind("resize.infinite-scroll");n.scroll()}})};this._prefill()},_debug:function(){if(true!==this.options.debug){return}if(typeof console!=="undefined"&&typeof console.log==="function"){if(Array.prototype.slice.call(arguments).length===1&&typeof Array.prototype.slice.call(arguments)[0]==="string"){console.log(Array.prototype.slice.call(arguments).toString())}else{console.log(Array.prototype.slice.call(arguments))}}else if(!Function.prototype.bind&&typeof console!=="undefined"&&typeof console.log==="object"){Function.prototype.call.call(console.log,console,Array.prototype.slice.call(arguments))}},_determinepath:function(n){var r=this.options;if(!!r.behavior&&this["_determinepath_"+r.behavior]!==t){return this["_determinepath_"+r.behavior].call(this,n)}if(!!r.pathParse){this._debug("pathParse manual");return r.pathParse(n,this.options.state.currPage+1)}else if(n.match(/^(.*?)\b2\b(.*?$)/)){n=n.match(/^(.*?)\b2\b(.*?$)/).slice(1)}else if(n.match(/^(.*?)2(.*?$)/)){if(n.match(/^(.*?page=)2(\/.*|$)/)){n=n.match(/^(.*?page=)2(\/.*|$)/).slice(1);return n}n=n.match(/^(.*?)2(.*?$)/).slice(1)}else{if(n.match(/^(.*?page=)1(\/.*|$)/)){n=n.match(/^(.*?page=)1(\/.*|$)/).slice(1);return n}else{this._debug("Sorry, we couldn't parse your Next (Previous Posts) URL. Verify your the css selector points to the correct A tag. If you still get this error: yell, scream, and kindly ask for help at infinite-scroll.com.");r.state.isInvalidPage=true}}this._debug("determinePath",n);return n},_error:function(n){var r=this.options;if(!!r.behavior&&this["_error_"+r.behavior]!==t){this["_error_"+r.behavior].call(this,n);return}if(n!=="destroy"&&n!=="end"){n="unknown"}this._debug("Error",n);if(n==="end"||r.state.isBeyondMaxPage){this._showdonemsg()}r.state.isDone=true;r.state.currPage=1;r.state.isPaused=false;r.state.isBeyondMaxPage=false;this._binding("unbind")},_loadcallback:function(r,i,s){var o=this.options,u=this.options.callback,a=o.state.isDone?"done":!o.appendCallback?"no-append":"append",f;if(!!o.behavior&&this["_loadcallback_"+o.behavior]!==t){this["_loadcallback_"+o.behavior].call(this,r,i);return}switch(a){case"done":this._showdonemsg();return false;case"no-append":if(o.dataType==="html"){i="<div>"+i+"</div>";i=e(i).find(o.itemSelector)}if(i.length===0){return this._error("end")}break;case"append":var l=r.children();if(l.length===0){return this._error("end")}f=document.createDocumentFragment();while(r[0].firstChild){f.appendChild(r[0].firstChild)}this._debug("contentSelector",e(o.contentSelector)[0]);e(o.contentSelector)[0].appendChild(f);i=l.get();break}o.loading.finished.call(e(o.contentSelector)[0],o);if(o.animate){var c=e(window).scrollTop()+e(o.loading.msg).height()+o.extraScrollPx+"px";e("html,body").animate({scrollTop:c},800,function(){o.state.isDuringAjax=false})}if(!o.animate){o.state.isDuringAjax=false}u(this,i,s);if(o.prefill){this._prefill()}},_nearbottom:function(){var r=this.options,i=0+e(document).height()-r.binder.scrollTop()-e(window).height();if(!!r.behavior&&this["_nearbottom_"+r.behavior]!==t){return this["_nearbottom_"+r.behavior].call(this)}this._debug("math:",i,r.pixelsFromNavToBottom);return i-r.bufferPx<r.pixelsFromNavToBottom},_pausing:function(n){var r=this.options;if(!!r.behavior&&this["_pausing_"+r.behavior]!==t){this["_pausing_"+r.behavior].call(this,n);return}if(n!=="pause"&&n!=="resume"&&n!==null){this._debug("Invalid argument. Toggling pause value instead")}n=n&&(n==="pause"||n==="resume")?n:"toggle";switch(n){case"pause":r.state.isPaused=true;break;case"resume":r.state.isPaused=false;break;case"toggle":r.state.isPaused=!r.state.isPaused;break}this._debug("Paused",r.state.isPaused);return false},_setup:function(){var n=this.options;if(!!n.behavior&&this["_setup_"+n.behavior]!==t){this["_setup_"+n.behavior].call(this);return}this._binding("bind");return false},_showdonemsg:function(){var r=this.options;if(!!r.behavior&&this["_showdonemsg_"+r.behavior]!==t){this["_showdonemsg_"+r.behavior].call(this);return}r.loading.msg.find("img").hide().parent().find("div").html(r.loading.finishedMsg).animate({opacity:1},2e3,function(){e(this).parent().fadeOut(r.loading.speed)});r.errorCallback.call(e(r.contentSelector)[0],"done")},_validate:function(n){for(var r in n){if(r.indexOf&&r.indexOf("Selector")>-1&&e(n[r]).length===0){this._debug("Your "+r+" found no elements.");return false}}return true},bind:function(){this._binding("bind")},destroy:function(){this.options.state.isDestroyed=true;this.options.loading.finished();return this._error("destroy")},pause:function(){this._pausing("pause")},resume:function(){this._pausing("resume")},beginAjax:function(r){var i=this,s=r.path,o,u,a,f;r.state.currPage++;if(r.maxPage!==t&&r.state.currPage>r.maxPage){r.state.isBeyondMaxPage=true;this.destroy();return}o=e(r.contentSelector).is("table, tbody")?e("<tbody/>"):e("<div/>");u=typeof s==="function"?s(r.state.currPage):s.join(r.state.currPage);i._debug("heading into ajax",u);a=r.dataType==="html"||r.dataType==="json"?r.dataType:"html+callback";if(r.appendCallback&&r.dataType==="html"){a+="+callback"}switch(a){case"html+callback":i._debug("Using HTML via .load() method");o.load(u+" "+r.itemSelector,t,function(t){i._loadcallback(o,t,u)});break;case"html":i._debug("Using "+a.toUpperCase()+" via $.ajax() method");e.ajax({url:u,dataType:r.dataType,complete:function(t,n){f=typeof t.isResolved!=="undefined"?t.isResolved():n==="success"||n==="notmodified";if(f){i._loadcallback(o,t.responseText,u)}else{i._error("end")}}});break;case"json":i._debug("Using "+a.toUpperCase()+" via $.ajax() method");e.ajax({dataType:"json",type:"GET",url:u,success:function(e,n,s){f=typeof s.isResolved!=="undefined"?s.isResolved():n==="success"||n==="notmodified";if(r.appendCallback){if(r.template!==t){var a=r.template(e);o.append(a);if(f){i._loadcallback(o,a)}else{i._error("end")}}else{i._debug("template must be defined.");i._error("end")}}else{if(f){i._loadcallback(o,e,u)}else{i._error("end")}}},error:function(){i._debug("JSON ajax request failed.");i._error("end")}});break}},retrieve:function(r){r=r||null;var i=this,s=i.options;if(!!s.behavior&&this["retrieve_"+s.behavior]!==t){this["retrieve_"+s.behavior].call(this,r);return}if(s.state.isDestroyed){this._debug("Instance is destroyed");return false}s.state.isDuringAjax=true;s.loading.start.call(e(s.contentSelector)[0],s)},scroll:function(){var n=this.options,r=n.state;if(!!n.behavior&&this["scroll_"+n.behavior]!==t){this["scroll_"+n.behavior].call(this);return}if(r.isDuringAjax||r.isInvalidPage||r.isDone||r.isDestroyed||r.isPaused){return}if(!this._nearbottom()){return}this.retrieve()},toggle:function(){this._pausing()},unbind:function(){this._binding("unbind")},update:function(n){if(e.isPlainObject(n)){this.options=e.extend(true,this.options,n)}}};e.fn.infinitescroll=function(n,r){var i=typeof n;switch(i){case"string":var s=Array.prototype.slice.call(arguments,1);this.each(function(){var t=e.data(this,"infinitescroll");if(!t){return false}if(!e.isFunction(t[n])||n.charAt(0)==="_"){return false}t[n].apply(t,s)});break;case"object":this.each(function(){var t=e.data(this,"infinitescroll");if(t){t.update(n)}else{t=new e.infinitescroll(n,r,this);if(!t.failed){e.data(this,"infinitescroll",t)}}});break}return this};var n=e.event,r;n.special.smartscroll={setup:function(){e(this).bind("scroll",n.special.smartscroll.handler)},teardown:function(){e(this).unbind("scroll",n.special.smartscroll.handler)},handler:function(t,n){var i=this,s=arguments;t.type="smartscroll";if(r){clearTimeout(r)}r=setTimeout(function(){e(i).trigger("smartscroll",s)},n==="execAsap"?0:100)}};e.fn.smartscroll=function(e){return e?this.bind("smartscroll",e):this.trigger("smartscroll",["execAsap"])}});(function(){'use strict'
var keyCounter=0
var allWaypoints={}
function Waypoint(options){if(!options){throw new Error('No options passed to Waypoint constructor')}
if(!options.element){throw new Error('No element option passed to Waypoint constructor')}
if(!options.handler){throw new Error('No handler option passed to Waypoint constructor')}
this.key='waypoint-'+ keyCounter
this.options=Waypoint.Adapter.extend({},Waypoint.defaults,options)
this.element=this.options.element
this.adapter=new Waypoint.Adapter(this.element)
this.callback=options.handler
this.axis=this.options.horizontal?'horizontal':'vertical'
this.enabled=this.options.enabled
this.triggerPoint=null
this.group=Waypoint.Group.findOrCreate({name:this.options.group,axis:this.axis})
this.context=Waypoint.Context.findOrCreateByElement(this.options.context)
if(Waypoint.offsetAliases[this.options.offset]){this.options.offset=Waypoint.offsetAliases[this.options.offset]}
this.group.add(this)
this.context.add(this)
allWaypoints[this.key]=this
keyCounter+=1}
Waypoint.prototype.queueTrigger=function(direction){this.group.queueTrigger(this,direction)}
Waypoint.prototype.trigger=function(args){if(!this.enabled){return}
if(this.callback){this.callback.apply(this,args)}}
Waypoint.prototype.destroy=function(){this.context.remove(this)
this.group.remove(this)
delete allWaypoints[this.key]}
Waypoint.prototype.disable=function(){this.enabled=false
return this}
Waypoint.prototype.enable=function(){this.context.refresh()
this.enabled=true
return this}
Waypoint.prototype.next=function(){return this.group.next(this)}
Waypoint.prototype.previous=function(){return this.group.previous(this)}
Waypoint.invokeAll=function(method){var allWaypointsArray=[]
for(var waypointKey in allWaypoints){allWaypointsArray.push(allWaypoints[waypointKey])}
for(var i=0,end=allWaypointsArray.length;i<end;i++){allWaypointsArray[i][method]()}}
Waypoint.destroyAll=function(){Waypoint.invokeAll('destroy')}
Waypoint.disableAll=function(){Waypoint.invokeAll('disable')}
Waypoint.enableAll=function(){Waypoint.Context.refreshAll()
for(var waypointKey in allWaypoints){allWaypoints[waypointKey].enabled=true}
return this}
Waypoint.refreshAll=function(){Waypoint.Context.refreshAll()}
Waypoint.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight}
Waypoint.viewportWidth=function(){return document.documentElement.clientWidth}
Waypoint.adapters=[]
Waypoint.defaults={context:window,continuous:true,enabled:true,group:'default',horizontal:false,offset:0}
Waypoint.offsetAliases={'bottom-in-view':function(){return this.context.innerHeight()- this.adapter.outerHeight()},'right-in-view':function(){return this.context.innerWidth()- this.adapter.outerWidth()}}
window.Waypoint=Waypoint}());(function(){'use strict'
function requestAnimationFrameShim(callback){window.setTimeout(callback,1000/60)}
var keyCounter=0
var contexts={}
var Waypoint=window.Waypoint
var oldWindowLoad=window.onload
function Context(element){this.element=element
this.Adapter=Waypoint.Adapter
this.adapter=new this.Adapter(element)
this.key='waypoint-context-'+ keyCounter
this.didScroll=false
this.didResize=false
this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()}
this.waypoints={vertical:{},horizontal:{}}
element.waypointContextKey=this.key
contexts[element.waypointContextKey]=this
keyCounter+=1
if(!Waypoint.windowContext){Waypoint.windowContext=true
Waypoint.windowContext=new Context(window)}
this.createThrottledScrollHandler()
this.createThrottledResizeHandler()}
Context.prototype.add=function(waypoint){var axis=waypoint.options.horizontal?'horizontal':'vertical'
this.waypoints[axis][waypoint.key]=waypoint
this.refresh()}
Context.prototype.checkEmpty=function(){var horizontalEmpty=this.Adapter.isEmptyObject(this.waypoints.horizontal)
var verticalEmpty=this.Adapter.isEmptyObject(this.waypoints.vertical)
var isWindow=this.element==this.element.window
if(horizontalEmpty&&verticalEmpty&&!isWindow){this.adapter.off('.waypoints')
delete contexts[this.key]}}
Context.prototype.createThrottledResizeHandler=function(){var self=this
function resizeHandler(){self.handleResize()
self.didResize=false}
this.adapter.on('resize.waypoints',function(){if(!self.didResize){self.didResize=true
Waypoint.requestAnimationFrame(resizeHandler)}})}
Context.prototype.createThrottledScrollHandler=function(){var self=this
function scrollHandler(){self.handleScroll()
self.didScroll=false}
this.adapter.on('scroll.waypoints',function(){if(!self.didScroll||Waypoint.isTouch){self.didScroll=true
Waypoint.requestAnimationFrame(scrollHandler)}})}
Context.prototype.handleResize=function(){Waypoint.Context.refreshAll()}
Context.prototype.handleScroll=function(){var triggeredGroups={}
var axes={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:'right',backward:'left'},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:'down',backward:'up'}}
for(var axisKey in axes){var axis=axes[axisKey]
var isForward=axis.newScroll>axis.oldScroll
var direction=isForward?axis.forward:axis.backward
for(var waypointKey in this.waypoints[axisKey]){var waypoint=this.waypoints[axisKey][waypointKey]
if(waypoint.triggerPoint===null){continue}
var wasBeforeTriggerPoint=axis.oldScroll<waypoint.triggerPoint
var nowAfterTriggerPoint=axis.newScroll>=waypoint.triggerPoint
var crossedForward=wasBeforeTriggerPoint&&nowAfterTriggerPoint
var crossedBackward=!wasBeforeTriggerPoint&&!nowAfterTriggerPoint
if(crossedForward||crossedBackward){waypoint.queueTrigger(direction)
triggeredGroups[waypoint.group.id]=waypoint.group}}}
for(var groupKey in triggeredGroups){triggeredGroups[groupKey].flushTriggers()}
this.oldScroll={x:axes.horizontal.newScroll,y:axes.vertical.newScroll}}
Context.prototype.innerHeight=function(){if(this.element==this.element.window){return Waypoint.viewportHeight()}
return this.adapter.innerHeight()}
Context.prototype.remove=function(waypoint){delete this.waypoints[waypoint.axis][waypoint.key]
this.checkEmpty()}
Context.prototype.innerWidth=function(){if(this.element==this.element.window){return Waypoint.viewportWidth()}
return this.adapter.innerWidth()}
Context.prototype.destroy=function(){var allWaypoints=[]
for(var axis in this.waypoints){for(var waypointKey in this.waypoints[axis]){allWaypoints.push(this.waypoints[axis][waypointKey])}}
for(var i=0,end=allWaypoints.length;i<end;i++){allWaypoints[i].destroy()}}
Context.prototype.refresh=function(){var isWindow=this.element==this.element.window
var contextOffset=isWindow?undefined:this.adapter.offset()
var triggeredGroups={}
var axes
this.handleScroll()
axes={horizontal:{contextOffset:isWindow?0:contextOffset.left,contextScroll:isWindow?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:'right',backward:'left',offsetProp:'left'},vertical:{contextOffset:isWindow?0:contextOffset.top,contextScroll:isWindow?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:'down',backward:'up',offsetProp:'top'}}
for(var axisKey in axes){var axis=axes[axisKey]
for(var waypointKey in this.waypoints[axisKey]){var waypoint=this.waypoints[axisKey][waypointKey]
var adjustment=waypoint.options.offset
var oldTriggerPoint=waypoint.triggerPoint
var elementOffset=0
var freshWaypoint=oldTriggerPoint==null
var contextModifier,wasBeforeScroll,nowAfterScroll
var triggeredBackward,triggeredForward
if(waypoint.element!==waypoint.element.window){elementOffset=waypoint.adapter.offset()[axis.offsetProp]}
if(typeof adjustment==='function'){adjustment=adjustment.apply(waypoint)}
else if(typeof adjustment==='string'){adjustment=parseFloat(adjustment)
if(waypoint.options.offset.indexOf('%')>- 1){adjustment=Math.ceil(axis.contextDimension*adjustment/100)}}
contextModifier=axis.contextScroll- axis.contextOffset
waypoint.triggerPoint=Math.floor(elementOffset+ contextModifier- adjustment)
wasBeforeScroll=oldTriggerPoint<axis.oldScroll
nowAfterScroll=waypoint.triggerPoint>=axis.oldScroll
triggeredBackward=wasBeforeScroll&&nowAfterScroll
triggeredForward=!wasBeforeScroll&&!nowAfterScroll
if(!freshWaypoint&&triggeredBackward){waypoint.queueTrigger(axis.backward)
triggeredGroups[waypoint.group.id]=waypoint.group}
else if(!freshWaypoint&&triggeredForward){waypoint.queueTrigger(axis.forward)
triggeredGroups[waypoint.group.id]=waypoint.group}
else if(freshWaypoint&&axis.oldScroll>=waypoint.triggerPoint){waypoint.queueTrigger(axis.forward)
triggeredGroups[waypoint.group.id]=waypoint.group}}}
Waypoint.requestAnimationFrame(function(){for(var groupKey in triggeredGroups){triggeredGroups[groupKey].flushTriggers()}})
return this}
Context.findOrCreateByElement=function(element){return Context.findByElement(element)||new Context(element)}
Context.refreshAll=function(){for(var contextId in contexts){contexts[contextId].refresh()}}
Context.findByElement=function(element){return contexts[element.waypointContextKey]}
window.onload=function(){if(oldWindowLoad){oldWindowLoad()}
Context.refreshAll()}
Waypoint.requestAnimationFrame=function(callback){var requestFn=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||requestAnimationFrameShim
requestFn.call(window,callback)}
Waypoint.Context=Context}());(function(){'use strict'
function byTriggerPoint(a,b){return a.triggerPoint- b.triggerPoint}
function byReverseTriggerPoint(a,b){return b.triggerPoint- a.triggerPoint}
var groups={vertical:{},horizontal:{}}
var Waypoint=window.Waypoint
function Group(options){this.name=options.name
this.axis=options.axis
this.id=this.name+'-'+ this.axis
this.waypoints=[]
this.clearTriggerQueues()
groups[this.axis][this.name]=this}
Group.prototype.add=function(waypoint){this.waypoints.push(waypoint)}
Group.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}}
Group.prototype.flushTriggers=function(){for(var direction in this.triggerQueues){var waypoints=this.triggerQueues[direction]
var reverse=direction==='up'||direction==='left'
waypoints.sort(reverse?byReverseTriggerPoint:byTriggerPoint)
for(var i=0,end=waypoints.length;i<end;i+=1){var waypoint=waypoints[i]
if(waypoint.options.continuous||i===waypoints.length- 1){waypoint.trigger([direction])}}}
this.clearTriggerQueues()}
Group.prototype.next=function(waypoint){this.waypoints.sort(byTriggerPoint)
var index=Waypoint.Adapter.inArray(waypoint,this.waypoints)
var isLast=index===this.waypoints.length- 1
return isLast?null:this.waypoints[index+ 1]}
Group.prototype.previous=function(waypoint){this.waypoints.sort(byTriggerPoint)
var index=Waypoint.Adapter.inArray(waypoint,this.waypoints)
return index?this.waypoints[index- 1]:null}
Group.prototype.queueTrigger=function(waypoint,direction){this.triggerQueues[direction].push(waypoint)}
Group.prototype.remove=function(waypoint){var index=Waypoint.Adapter.inArray(waypoint,this.waypoints)
if(index>-1){this.waypoints.splice(index,1)}}
Group.prototype.first=function(){return this.waypoints[0]}
Group.prototype.last=function(){return this.waypoints[this.waypoints.length- 1]}
Group.findOrCreate=function(options){return groups[options.axis][options.name]||new Group(options)}
Waypoint.Group=Group}());(function(){'use strict'
var $=window.jQuery
var Waypoint=window.Waypoint
function JQueryAdapter(element){this.$element=$(element)}
$.each(['innerHeight','innerWidth','off','offset','on','outerHeight','outerWidth','scrollLeft','scrollTop'],function(i,method){JQueryAdapter.prototype[method]=function(){var args=Array.prototype.slice.call(arguments)
return this.$element[method].apply(this.$element,args)}})
$.each(['extend','inArray','isEmptyObject'],function(i,method){JQueryAdapter[method]=$[method]})
Waypoint.adapters.push({name:'jquery',Adapter:JQueryAdapter})
Waypoint.Adapter=JQueryAdapter}());(function(){'use strict'
var Waypoint=window.Waypoint
function createExtension(framework){return function(){var waypoints=[]
var overrides=arguments[0]
if(framework.isFunction(arguments[0])){overrides=framework.extend({},arguments[1])
overrides.handler=arguments[0]}
this.each(function(){var options=framework.extend({},overrides,{element:this})
if(typeof options.context==='string'){options.context=framework(this).closest(options.context)[0]}
waypoints.push(new Waypoint(options))})
return waypoints}}
if(window.jQuery){window.jQuery.fn.waypoint=createExtension(window.jQuery)}
if(window.Zepto){window.Zepto.fn.waypoint=createExtension(window.Zepto)}}());(function(){'use strict'
function noop(){}
var Waypoint=window.Waypoint
function Inview(options){this.options=Waypoint.Adapter.extend({},Inview.defaults,options)
this.axis=this.options.horizontal?'horizontal':'vertical'
this.waypoints=[]
this.element=this.options.element
this.createWaypoints()}
Inview.prototype.createWaypoints=function(){var configs={vertical:[{down:'enter',up:'exited',offset:'100%'},{down:'entered',up:'exit',offset:'bottom-in-view'},{down:'exit',up:'entered',offset:0},{down:'exited',up:'enter',offset:function(){return-this.adapter.outerHeight()}}],horizontal:[{right:'enter',left:'exited',offset:'100%'},{right:'entered',left:'exit',offset:'right-in-view'},{right:'exit',left:'entered',offset:0},{right:'exited',left:'enter',offset:function(){return-this.adapter.outerWidth()}}]}
for(var i=0,end=configs[this.axis].length;i<end;i++){var config=configs[this.axis][i]
this.createWaypoint(config)}}
Inview.prototype.createWaypoint=function(config){var self=this
this.waypoints.push(new Waypoint({context:this.options.context,element:this.options.element,enabled:this.options.enabled,handler:(function(config){return function(direction){self.options[config[direction]].call(self,direction)}}(config)),offset:config.offset,horizontal:this.options.horizontal}))}
Inview.prototype.destroy=function(){for(var i=0,end=this.waypoints.length;i<end;i++){this.waypoints[i].destroy()}
this.waypoints=[]}
Inview.prototype.disable=function(){for(var i=0,end=this.waypoints.length;i<end;i++){this.waypoints[i].disable()}}
Inview.prototype.enable=function(){for(var i=0,end=this.waypoints.length;i<end;i++){this.waypoints[i].enable()}}
Inview.defaults={context:window,enabled:true,enter:noop,entered:noop,exit:noop,exited:noop}
Waypoint.Inview=Inview}());(function($){var menuTrees=[],IE=!!window.createPopup,IElt9=IE&&!document.defaultView,IElt8=IE&&!document.querySelector,IE6=IE&&typeof document.documentElement.currentStyle.minWidth=='undefined',mouse=false,mouseDetectionEnabled=false;function initMouseDetection(disable){if(!mouseDetectionEnabled&&!disable){var firstTime=true,lastMove=null;$(document).bind({'mousemove.smartmenus_mouse':function(e){var thisMove={x:e.pageX,y:e.pageY,timeStamp:new Date().getTime()};if(lastMove){var deltaX=Math.abs(lastMove.x- thisMove.x),deltaY=Math.abs(lastMove.y- thisMove.y);if((deltaX>0||deltaY>0)&&deltaX<=2&&deltaY<=2&&thisMove.timeStamp- lastMove.timeStamp<=300){mouse=true;if(firstTime){var $a=$(e.target).closest('a');if($a.is('a')){$.each(menuTrees,function(){if($.contains(this.$root[0],$a[0])){this.itemEnter({currentTarget:$a[0]});return false;}});}
firstTime=false;}}}
lastMove=thisMove;},'touchstart.smartmenus_mouse pointerover.smartmenus_mouse MSPointerOver.smartmenus_mouse':function(e){if(!/^(4|mouse)$/.test(e.originalEvent.pointerType)){mouse=false;}}});mouseDetectionEnabled=true;}else if(mouseDetectionEnabled&&disable){$(document).unbind('.smartmenus_mouse');mouseDetectionEnabled=false;}};$.SmartMenus=function(elm,options){this.$root=$(elm);this.opts=options;this.rootId='';this.$subArrow=null;this.subMenus=[];this.activatedItems=[];this.visibleSubMenus=[];this.showTimeout=0;this.hideTimeout=0;this.scrollTimeout=0;this.clickActivated=false;this.zIndexInc=0;this.$firstLink=null;this.$firstSub=null;this.disabled=false;this.$disableOverlay=null;this.init();};$.extend($.SmartMenus,{hideAll:function(){$.each(menuTrees,function(){this.menuHideAll();});},destroy:function(){while(menuTrees.length){menuTrees[0].destroy();}
initMouseDetection(true);},prototype:{init:function(refresh){var self=this;if(!refresh){menuTrees.push(this);this.rootId=(new Date().getTime()+ Math.random()+'').replace(/\D/g,'');if(this.$root.hasClass('sm-rtl')){this.opts.rightToLeftSubMenus=true;}
this.$root.data('smartmenus',this).attr('data-smartmenus-id',this.rootId).dataSM('level',1).bind({'mouseover.smartmenus focusin.smartmenus':$.proxy(this.rootOver,this),'mouseout.smartmenus focusout.smartmenus':$.proxy(this.rootOut,this)}).delegate('a',{'mouseenter.smartmenus':$.proxy(this.itemEnter,this),'mouseleave.smartmenus':$.proxy(this.itemLeave,this),'mousedown.smartmenus':$.proxy(this.itemDown,this),'focus.smartmenus':$.proxy(this.itemFocus,this),'blur.smartmenus':$.proxy(this.itemBlur,this),'click.smartmenus':$.proxy(this.itemClick,this),'touchend.smartmenus':$.proxy(this.itemTouchEnd,this)});var eNamespace='.smartmenus'+ this.rootId;if(this.opts.hideOnClick){$(document).bind('touchstart'+ eNamespace,$.proxy(this.docTouchStart,this)).bind('touchmove'+ eNamespace,$.proxy(this.docTouchMove,this)).bind('touchend'+ eNamespace,$.proxy(this.docTouchEnd,this)).bind('click'+ eNamespace,$.proxy(this.docClick,this));}
$(window).bind('resize'+ eNamespace+' orientationchange'+ eNamespace,$.proxy(this.winResize,this));$(window).bind('scroll'+ eNamespace+' orientationchange'+ eNamespace,$.proxy(this.winResize,this));if(this.opts.subIndicators){this.$subArrow=$('<span/>').addClass('sub-arrow');if(this.opts.subIndicatorsText){this.$subArrow.html(this.opts.subIndicatorsText);}}
initMouseDetection();}
this.$firstSub=this.$root.find('ul').each(function(){self.menuInit($(this));}).eq(0);this.$firstLink=this.$root.find('a').eq(0);if(this.opts.markCurrentItem){var reDefaultDoc=/(index|default)\.[^#\?\/]*/i,reHash=/#.*/,locHref=window.location.href.replace(reDefaultDoc,''),locHrefNoHash=locHref.replace(reHash,'');this.$root.find('a').each(function(){var href=this.href.replace(reDefaultDoc,''),$this=$(this);if(href==locHref||href==locHrefNoHash){$this.addClass('current');if(self.opts.markCurrentTree){$this.parents('li').each(function(){var $this=$(this);if($this.dataSM('sub')){$this.children('a').addClass('current');}});}}});}},destroy:function(){this.menuHideAll();this.$root.removeData('smartmenus').removeAttr('data-smartmenus-id').removeDataSM('level').unbind('.smartmenus').undelegate('.smartmenus');var eNamespace='.smartmenus'+ this.rootId;$(document).unbind(eNamespace);$(window).unbind(eNamespace);if(this.opts.subIndicators){this.$subArrow=null;}
var self=this;$.each(this.subMenus,function(){if(this.hasClass('mega-menu')){this.find('ul').removeDataSM('in-mega');}
if(this.dataSM('shown-before')){if(IElt8){this.children().css({styleFloat:'',width:''});}
if(self.opts.subMenusMinWidth||self.opts.subMenusMaxWidth){if(!IE6){this.css({width:'',minWidth:'',maxWidth:''}).removeClass('sm-nowrap');}else{this.css({width:'',overflowX:'',overflowY:''}).children().children('a').css('white-space','');}}
if(this.dataSM('scroll-arrows')){this.dataSM('scroll-arrows').remove();}
this.css({zIndex:'',top:'',left:'',marginLeft:'',marginTop:'',display:''});}
if(self.opts.subIndicators){this.dataSM('parent-a').removeClass('has-submenu').children('span.sub-arrow').remove();}
this.removeDataSM('shown-before').removeDataSM('ie-shim').removeDataSM('scroll-arrows').removeDataSM('parent-a').removeDataSM('level').removeDataSM('beforefirstshowfired').parent().removeDataSM('sub');});if(this.opts.markCurrentItem){this.$root.find('a.current').removeClass('current');}
this.$root=null;this.$firstLink=null;this.$firstSub=null;if(this.$disableOverlay){this.$disableOverlay.remove();this.$disableOverlay=null;}
menuTrees.splice($.inArray(this,menuTrees),1);},disable:function(noOverlay){if(!this.disabled){this.menuHideAll();if(!noOverlay&&!this.opts.isPopup&&this.$root.is(':visible')){var pos=this.$root.offset();this.$disableOverlay=$('<div class="sm-jquery-disable-overlay"/>').css({position:'absolute',top:pos.top,left:pos.left,width:this.$root.outerWidth(),height:this.$root.outerHeight(),zIndex:this.getStartZIndex()+ 1,opacity:0}).appendTo(document.body);}
this.disabled=true;}},docClick:function(e){if(this.visibleSubMenus.length&&!$.contains(this.$root[0],e.target)||$(e.target).is('a')){this.menuHideAll($(e.target));}},docTouchEnd:function(e){if(!this.lastTouch){return;}
if(this.visibleSubMenus.length&&(this.lastTouch.x2===undefined||this.lastTouch.x1==this.lastTouch.x2)&&(this.lastTouch.y2===undefined||this.lastTouch.y1==this.lastTouch.y2)&&(!this.lastTouch.target||!$.contains(this.$root[0],this.lastTouch.target))){if(this.hideTimeout){clearTimeout(this.hideTimeout);this.hideTimeout=0;}
var self=this;this.hideTimeout=setTimeout(function(){self.menuHideAll($(e.target));},350);}
this.lastTouch=null;},docTouchMove:function(e){if(!this.lastTouch){return;}
var touchPoint=e.originalEvent.touches[0];this.lastTouch.x2=touchPoint.pageX;this.lastTouch.y2=touchPoint.pageY;},docTouchStart:function(e){var touchPoint=e.originalEvent.touches[0];this.lastTouch={x1:touchPoint.pageX,y1:touchPoint.pageY,target:touchPoint.target};},enable:function(){if(this.disabled){if(this.$disableOverlay){this.$disableOverlay.remove();this.$disableOverlay=null;}
this.disabled=false;}},getHeight:function($elm){return this.getOffset($elm,true);},getOffset:function($elm,height){var old;if($elm.css('display')=='none'){old={position:$elm[0].style.position,visibility:$elm[0].style.visibility};$elm.css({position:'absolute',visibility:'hidden'}).show();}
var defaultView=$elm[0].ownerDocument.defaultView,compStyle=defaultView&&defaultView.getComputedStyle&&defaultView.getComputedStyle($elm[0],null),val=compStyle&&parseFloat(compStyle[height?'height':'width']);if(val){val+=parseFloat(compStyle[height?'paddingTop':'paddingLeft'])
+ parseFloat(compStyle[height?'paddingBottom':'paddingRight'])
+ parseInt(compStyle[height?'borderTopWidth':'borderLeftWidth'])
+ parseInt(compStyle[height?'borderBottomWidth':'borderRightWidth']);}else{val=height?$elm[0].offsetHeight:$elm[0].offsetWidth;}
if(old){$elm.hide().css(old);}
return val;},getWidth:function($elm){return this.getOffset($elm);},getStartZIndex:function(){var zIndex=parseInt(this.$root.css('z-index'));return!isNaN(zIndex)?zIndex:1;},handleEvents:function(){return!this.disabled&&this.isCSSOn();},handleItemEvents:function($a){return this.handleEvents()&&!this.isLinkInMegaMenu($a);},isCollapsible:function(){return this.$firstSub.css('position')=='static';},isCSSOn:function(){return this.$firstLink.css('display')=='block'||this.$firstLink.css('display')=='inline';},isFixed:function(){return this.$root.css('position')=='fixed';},isLinkInMegaMenu:function($a){return!$a.parent().parent().dataSM('level');},isTouchMode:function(){return!mouse||this.isCollapsible();},itemActivate:function($a){var $li=$a.parent(),$ul=$li.parent(),level=$ul.dataSM('level');if(level>1&&(!this.activatedItems[level- 2]||this.activatedItems[level- 2][0]!=$ul.dataSM('parent-a')[0])){var self=this;$($ul.parentsUntil('[data-smartmenus-id]','ul').get().reverse()).add($ul).each(function(){self.itemActivate($(this).dataSM('parent-a'));});}
if(this.visibleSubMenus.length>level){for(var i=this.visibleSubMenus.length- 1,l=!this.activatedItems[level- 1]||this.activatedItems[level- 1][0]!=$a[0]?level- 1:level;i>l;i--){this.menuHide(this.visibleSubMenus[i]);}}
this.activatedItems[level- 1]=$a;this.visibleSubMenus[level- 1]=$ul;if(this.$root.triggerHandler('activate.smapi',$a[0])===false){return;}
var $sub=$li.dataSM('sub');if($sub&&(this.isTouchMode()||(!this.opts.showOnClick||this.clickActivated))){this.menuShow($sub);}},itemBlur:function(e){var $a=$(e.currentTarget);if(!this.handleItemEvents($a)){return;}
this.$root.triggerHandler('blur.smapi',$a[0]);},itemClick:function(e){var $a=$(e.currentTarget);if(!this.handleItemEvents($a)){return;}
$a.removeDataSM('mousedown');if(this.$root.triggerHandler('click.smapi',$a[0])===false){return false;}
var $sub=$a.parent().dataSM('sub');if(this.isTouchMode()){if($a.dataSM('href')){$a.attr('href',$a.dataSM('href')).removeDataSM('href');}
if($sub&&(!$sub.dataSM('shown-before')||!$sub.is(':visible'))){this.itemActivate($a);if($sub.is(':visible')){return false;}}}else if(this.opts.showOnClick&&$a.parent().parent().dataSM('level')==1&&$sub){this.clickActivated=true;this.menuShow($sub);return false;}
if($a.hasClass('disabled')){return false;}
if(this.$root.triggerHandler('select.smapi',$a[0])===false){return false;}},itemDown:function(e){var $a=$(e.currentTarget);if(!this.handleItemEvents($a)){return;}
$a.dataSM('mousedown',true);},itemEnter:function(e){var $a=$(e.currentTarget);if(!this.handleItemEvents($a)){return;}
if(!this.isTouchMode()){if(this.showTimeout){clearTimeout(this.showTimeout);this.showTimeout=0;}
var self=this;this.showTimeout=setTimeout(function(){self.itemActivate($a);},this.opts.showOnClick&&$a.parent().parent().dataSM('level')==1?1:this.opts.showTimeout);}
this.$root.triggerHandler('mouseenter.smapi',$a[0]);},itemFocus:function(e){var $a=$(e.currentTarget);if(!this.handleItemEvents($a)){return;}
if((!this.isTouchMode()||!$a.dataSM('mousedown'))&&(!this.activatedItems.length||this.activatedItems[this.activatedItems.length- 1][0]!=$a[0])){this.itemActivate($a);}
this.$root.triggerHandler('focus.smapi',$a[0]);},itemLeave:function(e){var $a=$(e.currentTarget);if(!this.handleItemEvents($a)){return;}
if(!this.isTouchMode()){if($a[0].blur){$a[0].blur();}
if(this.showTimeout){clearTimeout(this.showTimeout);this.showTimeout=0;}}
$a.removeDataSM('mousedown');this.$root.triggerHandler('mouseleave.smapi',$a[0]);},itemTouchEnd:function(e){var $a=$(e.currentTarget);if(!this.handleItemEvents($a)){return;}
var $sub=$a.parent().dataSM('sub');if($a.attr('href').charAt(0)!=='#'&&$sub&&(!$sub.dataSM('shown-before')||!$sub.is(':visible'))){$a.dataSM('href',$a.attr('href'));$a.attr('href','#');}},menuFixLayout:function($ul){if(!$ul.dataSM('shown-before')){$ul.hide().dataSM('shown-before',true);if(IElt8){$ul.children().css({styleFloat:'left',width:'100%'});}}},menuHide:function($sub){if(this.$root.triggerHandler('beforehide.smapi',$sub[0])===false){return;}
$sub.stop(true,true);if($sub.is(':visible')){var complete=function(){if(IElt9){$sub.parent().css('z-index','');}else{$sub.css('z-index','');}};if(this.isCollapsible()){if(this.opts.collapsibleHideFunction){this.opts.collapsibleHideFunction.call(this,$sub,complete);}else{$sub.hide(this.opts.collapsibleHideDuration,complete);}}else{if(this.opts.hideFunction){this.opts.hideFunction.call(this,$sub,complete);}else{$sub.hide(this.opts.hideDuration,complete);}}
if($sub.dataSM('ie-shim')){$sub.dataSM('ie-shim').remove();}
if($sub.dataSM('scroll')){$sub.unbind('.smartmenus_scroll').removeDataSM('scroll').dataSM('scroll-arrows').hide();}
$sub.dataSM('parent-a').removeClass('highlighted');var level=$sub.dataSM('level');this.activatedItems.splice(level- 1,1);this.visibleSubMenus.splice(level- 1,1);this.$root.triggerHandler('hide.smapi',$sub[0]);}},menuHideAll:function($item){if($item!=undefined&&$item.parent().hasClass('menu-item')&&!$item.parent().hasClass('menu-item-has-children'))return;if(this.showTimeout){clearTimeout(this.showTimeout);this.showTimeout=0;}
for(var i=this.visibleSubMenus.length- 1;i>0;i--){this.menuHide(this.visibleSubMenus[i]);}
if(this.opts.isPopup){this.$root.stop(true,true);if(this.$root.is(':visible')){if(this.opts.hideFunction){this.opts.hideFunction.call(this,this.$root);}else{this.$root.hide(this.opts.hideDuration);}
if(this.$root.dataSM('ie-shim')){this.$root.dataSM('ie-shim').remove();}}}
this.activatedItems=[];this.visibleSubMenus=[];this.clickActivated=false;this.zIndexInc=0;},menuIframeShim:function($ul){if(IE&&this.opts.overlapControlsInIE&&!$ul.dataSM('ie-shim')){$ul.dataSM('ie-shim',$('<iframe/>').attr({src:'javascript:0',tabindex:-9}).css({position:'absolute',top:'auto',left:'0',opacity:0,border:'0'}));}},menuInit:function($ul){if(!$ul.dataSM('in-mega')){this.subMenus.push($ul);if($ul.hasClass('mega-menu')){$ul.find('ul').dataSM('in-mega',true);}
var level=2,par=$ul[0];while((par=par.parentNode.parentNode)!=this.$root[0]){level++;}
$ul.dataSM('parent-a',$ul.prevAll('a').eq(-1)).dataSM('level',level).parent().dataSM('sub',$ul);if(this.opts.subIndicators){$ul.dataSM('parent-a').addClass('has-submenu')[this.opts.subIndicatorsPos](this.$subArrow.clone());}}},menuPosition:function($sub){var fixIE=$('html.ie').length;var $a=$sub.dataSM('parent-a'),$li=$sub.parent(),$ul=$sub.parent().parent(),$container=$ul.closest('.row-menu-inner'),level=$sub.dataSM('level'),subW=this.getWidth($sub),subH=this.getHeight($sub),itemOffset=$a.offset(),itemX=itemOffset.left,itemY=itemOffset.top,itemW=this.getWidth($a),itemH=this.getHeight($a),$win=$(window),winX=$win.scrollLeft(),winY=$win.scrollTop(),winW=$win.width(),winH=$win.height(),containerW=$container.width(),containerOffsetX=containerW+((winW- containerW)/ 2),
horizontalParent=$ul.hasClass('sm')&&!$ul.hasClass('sm-vertical'),subOffsetX=level==2?this.opts.mainMenuSubOffsetX:this.opts.subMenusSubOffsetX,subOffsetY=level==2?this.opts.mainMenuSubOffsetY:this.opts.subMenusSubOffsetY,x,y,leftPos;if(horizontalParent){x=this.opts.rightToLeftSubMenus?itemW- subW- subOffsetX:subOffsetX;y=this.opts.bottomToTopSubMenus?-subH- subOffsetY:itemH+ subOffsetY;}else{x=this.opts.rightToLeftSubMenus?subOffsetX- subW:itemW- subOffsetX;y=this.opts.bottomToTopSubMenus?itemH- subOffsetY- subH:subOffsetY;}
if(this.opts.keepInViewport&&!this.isCollapsible()){if(this.isFixed()){itemX-=winX;itemY-=winY;winX=winY=0;}
var absX=itemX+ x,absY=itemY+ y;if(this.opts.rightToLeftSubMenus&&absX<winX){x=horizontalParent?winX- absX+ x:itemW- subOffsetX;}else if(!this.opts.rightToLeftSubMenus&&absX+ subW>winX+ containerOffsetX){x=horizontalParent?winX+ containerOffsetX- subW- absX+ x:subOffsetX- subW;}
if(!horizontalParent){if(subH<winH&&absY+ subH>winY+ winH){y+=winY+ winH- subH- absY;}else if(subH>=winH||absY<winY){y+=winY- absY;}}
if(mouse&&(horizontalParent&&(absY+ subH>winY+ winH+ 0.49||absY<winY)||!horizontalParent&&subH>winH+ 0.49)){var self=this;if(!$sub.dataSM('scroll-arrows')){$sub.dataSM('scroll-arrows',$([$('<span class="scroll-up"><span class="scroll-up-arrow"></span></span>')[0],$('<span class="scroll-down"><span class="scroll-down-arrow"></span></span>')[0]]).bind({mouseenter:function(){self.menuScroll($sub,$(this).hasClass('scroll-up'));},mouseleave:function(e){self.menuScrollStop($sub);self.menuScrollOut($sub,e);},'mousewheel DOMMouseScroll':function(e){e.preventDefault();}}).insertAfter($sub));}
var vportY=winY-(itemY+ itemH);$sub.dataSM('scroll',{vportY:vportY,subH:subH,winH:winH,step:1}).bind({'mouseover.smartmenus_scroll':function(e){self.menuScrollOver($sub,e);},'mouseout.smartmenus_scroll':function(e){self.menuScrollOut($sub,e);},'mousewheel.smartmenus_scroll DOMMouseScroll.smartmenus_scroll':function(e){self.menuScrollMousewheel($sub,e);}}).dataSM('scroll-arrows').css({top:'auto',left:'0',marginLeft:x+(parseInt($sub.css('border-left-width'))||0),width:this.getWidth($sub)-(parseInt($sub.css('border-left-width'))||0)-(parseInt($sub.css('border-right-width'))||0),zIndex:this.getStartZIndex()+ this.zIndexInc}).eq(0).css('margin-top',vportY).end().eq(1).css('margin-top',vportY+ winH- this.getHeight($sub.dataSM('scroll-arrows').eq(1))).end().eq(horizontalParent&&this.opts.bottomToTopSubMenus?0:1).show();}}
if($sub.hasClass('mega-menu-inner')){$sub.css({width:containerW});if($('body.hmenu-center-split').length>0){leftPos=-($sub.closest('.menu-primary-inner')[0].offsetLeft)+'px';}else{if($sub.closest('.row-menu-inner').find('.logo-container').length>0){leftPos=-(parseFloat($sub.closest('.row-menu-inner').find('.logo-container').css('paddingRight'))+($sub.closest('.row-menu-inner').find('.logo-container').width()))+'px';}else{leftPos='0px';}}}else{leftPos=(level>2?$li.position().left- parseFloat($li.closest('ul').css('paddingLeft')):$li.position().left)+'px';x=(level>2&&x>=0)?x+(parseFloat($li.closest('ul').css('paddingLeft'))*2)+ 1:x- 1;}
$sub.css({top:(level>2)?$a[0].offsetTop:(fixIE?itemH:'100%'),left:leftPos,marginLeft:x,marginTop:(level>2)?0:y- itemH+($sub.closest('.menu-mini').length?0:1)});this.menuIframeShim($sub);if($sub.dataSM('ie-shim')){$sub.dataSM('ie-shim').css({zIndex:$sub.css('z-index'),width:subW,height:subH,marginLeft:x,marginTop:y- itemH+($sub.closest('.menu-mini').length?0:1)});}},menuScroll:function($sub,up,wheel){var y=parseFloat($sub.css('margin-top')),scroll=$sub.dataSM('scroll'),end=scroll.vportY+(up?0:scroll.winH- scroll.subH),step=wheel||!this.opts.scrollAccelerate?this.opts.scrollStep:Math.floor($sub.dataSM('scroll').step);$sub.add($sub.dataSM('ie-shim')).css('margin-top',Math.abs(end- y)>step?y+(up?step:-step):end);y=parseFloat($sub.css('margin-top'));if(up&&y+ scroll.subH>scroll.vportY+ scroll.winH||!up&&y<scroll.vportY){$sub.dataSM('scroll-arrows').eq(up?1:0).show();}
if(!wheel&&this.opts.scrollAccelerate&&$sub.dataSM('scroll').step<this.opts.scrollStep){$sub.dataSM('scroll').step+=0.5;}
if(Math.abs(y- end)<1){$sub.dataSM('scroll-arrows').eq(up?0:1).hide();$sub.dataSM('scroll').step=1;}else if(!wheel){var self=this;this.scrollTimeout=setTimeout(function(){self.menuScroll($sub,up);},this.opts.scrollInterval);}},menuScrollMousewheel:function($sub,e){var $closestSub=$(e.target).closest('ul');while($closestSub.dataSM('in-mega')){$closestSub=$closestSub.parent().closest('ul');}
if($closestSub[0]==$sub[0]){var up=(e.originalEvent.wheelDelta||-e.originalEvent.detail)>0;if($sub.dataSM('scroll-arrows').eq(up?0:1).is(':visible')){this.menuScroll($sub,up,true);}}
e.preventDefault();},menuScrollOut:function($sub,e){var reClass=/^scroll-(up|down)/,$closestSub=$(e.relatedTarget).closest('ul');while($closestSub.dataSM('in-mega')){$closestSub=$closestSub.parent().closest('ul');}
if(!reClass.test((e.relatedTarget||'').className)&&($sub[0]!=e.relatedTarget&&!$.contains($sub[0],e.relatedTarget)||$closestSub[0]!=$sub[0])){$sub.dataSM('scroll-arrows').css('visibility','hidden');}},menuScrollOver:function($sub,e){var reClass=/^scroll-(up|down)/,$closestSub=$(e.target).closest('ul');while($closestSub.dataSM('in-mega')){$closestSub=$closestSub.parent().closest('ul');}
if(!reClass.test(e.target.className)&&$closestSub[0]==$sub[0]){$sub.dataSM('scroll-arrows').css('visibility','visible');}},menuScrollStop:function($sub){if(this.scrollTimeout){clearTimeout(this.scrollTimeout);this.scrollTimeout=0;$sub.dataSM('scroll').step=1;}},menuShow:function($sub){if(!$sub.dataSM('beforefirstshowfired')){$sub.dataSM('beforefirstshowfired',true);if(this.$root.triggerHandler('beforefirstshow.smapi',$sub[0])===false){return;}}
if(this.$root.triggerHandler('beforeshow.smapi',$sub[0])===false){return;}
this.menuFixLayout($sub);$sub.stop(true,true);if(!$sub.is(':visible')){var zIndex=this.getStartZIndex()+(++this.zIndexInc);if(IElt9){$sub.parent().css('z-index',zIndex);}else{$sub.css('z-index',zIndex);}
if(this.opts.keepHighlighted||this.isCollapsible()){if($sub.dataSM('parent-a').attr('data-type')!='title')
$sub.dataSM('parent-a').addClass('highlighted');}
if(this.opts.subMenusMinWidth||this.opts.subMenusMaxWidth){if(!IElt8){$sub.css({width:($sub.hasClass('mega-menu-inner'))?$('.box-container').outerWidth()+'px':'auto',minWidth:'',maxWidth:''}).addClass('sm-nowrap');if(this.opts.subMenusMinWidth){$sub.css('min-width',this.opts.subMenusMinWidth);}
if(this.opts.subMenusMaxWidth){var noMaxWidth=this.getWidth($sub);$sub.css('max-width',this.opts.subMenusMaxWidth);if(noMaxWidth>this.getWidth($sub)){$sub.removeClass('sm-nowrap').css('width',this.opts.subMenusMaxWidth);}}}else{$sub.children().css('styleFloat','none');if(IE6){$sub.width(this.opts.subMenusMinWidth?this.opts.subMenusMinWidth:1).children().children('a').css('white-space','nowrap');}else{$sub.css({width:($sub.hasClass('mega-menu-inner'))?$('.box-container').outerWidth()+'px':'auto',minWidth:'',maxWidth:''}).addClass('sm-nowrap');if(this.opts.subMenusMinWidth){$sub.css('min-width',this.opts.subMenusMinWidth);}}
if(this.opts.subMenusMaxWidth){var noMaxWidth=$sub.width();if(IE6){var maxWidth=$sub.css({width:this.opts.subMenusMaxWidth,overflowX:'hidden',overflowY:'hidden'}).width();if(noMaxWidth>maxWidth){$sub.css({width:maxWidth,overflowX:'visible',overflowY:'visible'}).children().children('a').css('white-space','');}else{$sub.css({width:noMaxWidth,overflowX:'visible',overflowY:'visible'});}}else{$sub.css('max-width',this.opts.subMenusMaxWidth);if(noMaxWidth>$sub.width()){$sub.removeClass('sm-nowrap').css('width',this.opts.subMenusMaxWidth);}else{$sub.width(noMaxWidth);}}}else{$sub.width($sub.width());}
$sub.children().css('styleFloat','left');}}
this.menuPosition($sub);if($sub.dataSM('ie-shim')){$sub.dataSM('ie-shim').insertBefore($sub);}
var complete=function(){$sub.css('overflow','');};if(this.isCollapsible()){if(this.opts.collapsibleShowFunction){this.opts.collapsibleShowFunction.call(this,$sub,complete);}else{$sub.show(this.opts.collapsibleShowDuration,complete);}}else{if(this.opts.showFunction){this.opts.showFunction.call(this,$sub,complete);}else{$sub.show(this.opts.showDuration,complete);}}
this.visibleSubMenus[$sub.dataSM('level')- 1]=$sub;this.$root.triggerHandler('show.smapi',$sub[0]);}},popupHide:function(noHideTimeout){if(this.hideTimeout){clearTimeout(this.hideTimeout);this.hideTimeout=0;}
var self=this;this.hideTimeout=setTimeout(function(){self.menuHideAll();},noHideTimeout?1:this.opts.hideTimeout);},popupShow:function(left,top){if(!this.opts.isPopup){alert('SmartMenus jQuery Error:\n\nIf you want to show this menu via the "popupShow" method, set the isPopup:true option.');return;}
if(this.hideTimeout){clearTimeout(this.hideTimeout);this.hideTimeout=0;}
this.menuFixLayout(this.$root);this.$root.stop(true,true);if(!this.$root.is(':visible')){this.$root.css({left:left,top:top});this.menuIframeShim(this.$root);if(this.$root.dataSM('ie-shim')){this.$root.dataSM('ie-shim').css({zIndex:this.$root.css('z-index'),width:this.getWidth(this.$root),height:this.getHeight(this.$root),left:left,top:top}).insertBefore(this.$root);}
if(this.opts.showFunction){this.opts.showFunction.call(this,this.$root);}else{this.$root.show(this.opts.showDuration);}
this.visibleSubMenus[0]=this.$root;}},refresh:function(){this.menuHideAll();this.$root.find('ul').each(function(){var $this=$(this);if($this.dataSM('scroll-arrows')){$this.dataSM('scroll-arrows').remove();}}).removeDataSM('in-mega').removeDataSM('shown-before').removeDataSM('ie-shim').removeDataSM('scroll-arrows').removeDataSM('parent-a').removeDataSM('level').removeDataSM('beforefirstshowfired');this.$root.find('a.has-submenu').removeClass('has-submenu').parent().removeDataSM('sub');if(this.opts.subIndicators){this.$root.find('span.sub-arrow').remove();}
if(this.opts.markCurrentItem){this.$root.find('a.current').removeClass('current');}
this.subMenus=[];this.init(true);},rootOut:function(e){if(!this.handleEvents()||this.isTouchMode()||e.target==this.$root[0]){return;}
if(this.hideTimeout){clearTimeout(this.hideTimeout);this.hideTimeout=0;}
if(!this.opts.showOnClick||!this.opts.hideOnClick){var self=this;this.hideTimeout=setTimeout(function(){self.menuHideAll();},this.opts.hideTimeout);}},rootOver:function(e){if(!this.handleEvents()||this.isTouchMode()||e.target==this.$root[0]){return;}
if(this.hideTimeout){clearTimeout(this.hideTimeout);this.hideTimeout=0;}},winResize:function(e){if(!this.handleEvents()){if(this.$disableOverlay){var pos=this.$root.offset();this.$disableOverlay.css({top:pos.top,left:pos.left,width:this.$root.outerWidth(),height:this.$root.outerHeight()});}
return;}
if(!this.isCollapsible()&&(!('onorientationchange'in window)||e.type=='orientationchange')){if(this.activatedItems.length){this.activatedItems[this.activatedItems.length- 1][0].blur();}
this.menuHideAll();}}}});$.fn.dataSM=function(key,val){if(val){return this.data(key+'_smartmenus',val);}
return this.data(key+'_smartmenus');}
$.fn.removeDataSM=function(key){return this.removeData(key+'_smartmenus');}
$.fn.smartmenus=function(options){if(typeof options=='string'){var args=arguments,method=options;Array.prototype.shift.call(args);return this.each(function(){var smartmenus=$(this).data('smartmenus');if(smartmenus&&smartmenus[method]){smartmenus[method].apply(smartmenus,args);}});}
var opts=$.extend({},$.fn.smartmenus.defaults,options);return this.each(function(){new $.SmartMenus(this,opts);});}
$.fn.smartmenus.defaults={isPopup:false,mainMenuSubOffsetX:0,mainMenuSubOffsetY:0,subMenusSubOffsetX:0,subMenusSubOffsetY:0,subMenusMinWidth:'10em',subMenusMaxWidth:'20em',subIndicators:true,subIndicatorsPos:'prepend',subIndicatorsText:'+',scrollStep:30,scrollInterval:30,scrollAccelerate:true,showTimeout:250,hideTimeout:500,showDuration:0,showFunction:null,hideDuration:0,hideFunction:function($ul,complete){$ul.fadeOut(200,complete);},collapsibleShowDuration:0,collapsibleShowFunction:function($ul,complete){$ul.slideDown(200,complete);},collapsibleHideDuration:0,collapsibleHideFunction:function($ul,complete){$ul.slideUp(200,complete);},showOnClick:false,hideOnClick:true,keepInViewport:true,keepHighlighted:true,markCurrentItem:false,markCurrentTree:true,rightToLeftSubMenus:false,bottomToTopSubMenus:false,overlapControlsInIE:true};})(jQuery);jQuery.easing['jswing']=jQuery.easing['swing'];jQuery.extend(jQuery.easing,{def:'easeOutQuad',swing:function(x,t,b,c,d){return jQuery.easing[jQuery.easing.def](x,t,b,c,d);},easeInQuad:function(x,t,b,c,d){return c*(t/=d)*t+ b;},easeOutQuad:function(x,t,b,c,d){return-c*(t/=d)*(t-2)+ b;},easeInOutQuad:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t+ b;return-c/2*((--t)*(t-2)- 1)+ b;},easeInCubic:function(x,t,b,c,d){return c*(t/=d)*t*t+ b;},easeOutCubic:function(x,t,b,c,d){return c*((t=t/d-1)*t*t+ 1)+ b;},easeInOutCubic:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t*t+ b;return c/2*((t-=2)*t*t+ 2)+ b;},easeInQuart:function(x,t,b,c,d){return c*(t/=d)*t*t*t+ b;},easeOutQuart:function(x,t,b,c,d){return-c*((t=t/d-1)*t*t*t- 1)+ b;},easeInOutQuart:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t*t*t+ b;return-c/2*((t-=2)*t*t*t- 2)+ b;},easeInQuint:function(x,t,b,c,d){return c*(t/=d)*t*t*t*t+ b;},easeOutQuint:function(x,t,b,c,d){return c*((t=t/d-1)*t*t*t*t+ 1)+ b;},easeInOutQuint:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t*t*t*t+ b;return c/2*((t-=2)*t*t*t*t+ 2)+ b;},easeInSine:function(x,t,b,c,d){return-c*Math.cos(t/d*(Math.PI/2))+ c+ b;},easeOutSine:function(x,t,b,c,d){return c*Math.sin(t/d*(Math.PI/2))+ b;},easeInOutSine:function(x,t,b,c,d){return-c/2*(Math.cos(Math.PI*t/d)- 1)+ b;},easeInExpo:function(x,t,b,c,d){return(t==0)?b:c*Math.pow(2,10*(t/d- 1))+ b;},easeOutExpo:function(x,t,b,c,d){return(t==d)?b+c:c*(-Math.pow(2,-10*t/d)+ 1)+ b;},easeInOutExpo:function(x,t,b,c,d){if(t==0)return b;if(t==d)return b+c;if((t/=d/2)<1)return c/2*Math.pow(2,10*(t- 1))+ b;return c/2*(-Math.pow(2,-10*--t)+ 2)+ b;},easeInCirc:function(x,t,b,c,d){return-c*(Math.sqrt(1-(t/=d)*t)- 1)+ b;},easeOutCirc:function(x,t,b,c,d){return c*Math.sqrt(1-(t=t/d-1)*t)+ b;},easeInOutCirc:function(x,t,b,c,d){if((t/=d/2)<1)return-c/2*(Math.sqrt(1- t*t)- 1)+ b;return c/2*(Math.sqrt(1-(t-=2)*t)+ 1)+ b;},easeInElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d)==1)return b+c;if(!p)p=d*.3;if(a<Math.abs(c)){a=c;var s=p/4;}
else var s=p/(2*Math.PI)*Math.asin(c/a);return-(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
},easeOutElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d)==1)return b+c;if(!p)p=d*.3;if(a<Math.abs(c)){a=c;var s=p/4;}
else var s=p/(2*Math.PI)*Math.asin(c/a);return a*Math.pow(2,-10*t)*Math.sin((t*d-s)*(2*Math.PI)/p ) + c + b;
},easeInOutElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d/2)==2)return b+c;if(!p)p=d*(.3*1.5);if(a<Math.abs(c)){a=c;var s=p/4;}
else var s=p/(2*Math.PI)*Math.asin(c/a);if(t<1)return-.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p )*.5 + c + b;
},easeInBack:function(x,t,b,c,d,s){if(s==undefined)s=1.70158;return c*(t/=d)*t*((s+1)*t- s)+ b;},easeOutBack:function(x,t,b,c,d,s){if(s==undefined)s=1.70158;return c*((t=t/d-1)*t*((s+1)*t+ s)+ 1)+ b;},easeInOutBack:function(x,t,b,c,d,s){if(s==undefined)s=1.70158;if((t/=d/2)<1)return c/2*(t*t*(((s*=(1.525))+1)*t- s))+ b;return c/2*((t-=2)*t*(((s*=(1.525))+1)*t+ s)+ 2)+ b;},easeInBounce:function(x,t,b,c,d){return c- jQuery.easing.easeOutBounce(x,d-t,0,c,d)+ b;},easeOutBounce:function(x,t,b,c,d){if((t/=d)<(1/2.75)){return c*(7.5625*t*t)+ b;}else if(t<(2/2.75)){return c*(7.5625*(t-=(1.5/2.75))*t+.75)+ b;}else if(t<(2.5/2.75)){return c*(7.5625*(t-=(2.25/2.75))*t+.9375)+ b;}else{return c*(7.5625*(t-=(2.625/2.75))*t+.984375)+ b;}},easeInOutBounce:function(x,t,b,c,d){if(t<d/2)return jQuery.easing.easeInBounce(x,t*2,0,c,d)*.5+ b;return jQuery.easing.easeOutBounce(x,t*2-d,0,c,d)*.5+ c*.5+ b;}});(function($,window,undefined){var lastTime=0,running,animate=function(elem){if(running){window.requestAnimationFrame(animate,elem);jQuery.fx.tick();}},vendors=['ms','moz','webkit','o'];for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x){window.requestAnimationFrame=window[vendors[x]+'RequestAnimationFrame'];window.cancelAnimationFrame=window[vendors[x]+'CancelAnimationFrame']||window[vendors[x]+'CancelRequestAnimationFrame'];}
if(!window.requestAnimationFrame)
window.requestAnimationFrame=function(fn,element){var currTime=new Date().getTime(),delta=currTime- lastTime,timeToCall=Math.max(0,16- delta);var id=window.setTimeout(function(){fn(currTime+ timeToCall);},timeToCall);lastTime=currTime+ timeToCall;return id;};if(!window.cancelAnimationFrame){window.cancelAnimationFrame=function(id){clearTimeout(id);};}
jQuery.fx.timer=function(timer){if(timer()&&jQuery.timers.push(timer)&&!running){running=true;animate(timer.elem);}};jQuery.fx.stop=function(){running=false;};}(jQuery,this));(function($){var types=['DOMMouseScroll','mousewheel'];if($.event.fixHooks){for(var i=types.length;i;){$.event.fixHooks[types[--i]]=$.event.mouseHooks;}}
$.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var i=types.length;i;){this.addEventListener(types[--i],handler,false);}}else{this.onmousewheel=handler;}},teardown:function(){if(this.removeEventListener){for(var i=types.length;i;){this.removeEventListener(types[--i],handler,false);}}else{this.onmousewheel=null;}}};$.fn.extend({mousewheel:function(fn){return fn?this.bind("mousewheel",fn):this.trigger("mousewheel");},unmousewheel:function(fn){return this.unbind("mousewheel",fn);}});function handler(event){var orgEvent=event||window.event,args=[].slice.call(arguments,1),delta=0,returnValue=true,deltaX=0,deltaY=0;event=$.event.fix(orgEvent);event.type="mousewheel";if(orgEvent.wheelDelta){delta=orgEvent.wheelDelta/120;}
if(orgEvent.detail){delta=-orgEvent.detail/3;}
deltaY=delta;if(orgEvent.axis!==undefined&&orgEvent.axis===orgEvent.HORIZONTAL_AXIS){deltaY=0;deltaX=-1*delta;}
if(orgEvent.wheelDeltaY!==undefined){deltaY=orgEvent.wheelDeltaY/120;}
if(orgEvent.wheelDeltaX!==undefined){deltaX=-1*orgEvent.wheelDeltaX/120;}
args.unshift(event,delta,deltaX,deltaY);return($.event.dispatch||$.event.handle).apply(this,args);}})(jQuery);(function($,window,undefined){var extensions={flash:['swf'],image:['bmp','gif','jpeg','jpg','png','tiff','tif','jfif','jpe'],iframe:['asp','aspx','cgi','cfm','htm','html','jsp','php','pl','php3','php4','php5','phtml','rb','rhtml','shtml','txt'],video:['avi','mov','mpg','mpeg','movie','mp4','webm','ogv','ogg','3gp','m4v']},$win=$(window),$doc=$(document),browser,transform,gpuAcceleration,fullScreenApi='',supportTouch=!!('ontouchstart'in window)&&(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)),clickEvent=supportTouch?"itap.iLightBox":"click.iLightBox",touchStartEvent=supportTouch?"touchstart.iLightBox":"mousedown.iLightBox",touchStopEvent=supportTouch?"touchend.iLightBox":"mouseup.iLightBox",touchMoveEvent=supportTouch?"touchmove.iLightBox":"mousemove.iLightBox",abs=Math.abs,sqrt=Math.sqrt,round=Math.round,max=Math.max,min=Math.min,floor=Math.floor,random=Math.random,pluginspages={quicktime:'http://www.apple.com/quicktime/download',flash:'http://www.adobe.com/go/getflash'},iLightBox=function(el,options,items,instant){var iL=this;iL.options=options,iL.selector=el.selector||el,iL.context=el.context,iL.instant=instant;if(items.length<1)iL.attachItems();else iL.items=items;iL.vars={total:iL.items.length,start:0,current:null,next:null,prev:null,BODY:$('body'),loadRequests:0,overlay:$('<div class="ilightbox-overlay"></div>'),loader:$('<div class="ilightbox-loader"><div></div></div>'),toolbar:$('<div class="ilightbox-toolbar"></div>'),innerToolbar:$('<div class="ilightbox-inner-toolbar"></div>'),title:$('<div class="ilightbox-title"></div>'),closeButton:$('<a class="ilightbox-close" title="'+ iL.options.text.close+'"></a>'),fullScreenButton:$('<a class="ilightbox-fullscreen" title="'+ iL.options.text.enterFullscreen+'"></a>'),innerPlayButton:$('<a class="ilightbox-play" title="'+ iL.options.text.slideShow+'"></a>'),innerNextButton:$('<a class="ilightbox-next-button" title="'+ iL.options.text.next+'"></a>'),innerPrevButton:$('<a class="ilightbox-prev-button" title="'+ iL.options.text.previous+'"></a>'),holder:$('<div class="ilightbox-holder'+(supportTouch?' supportTouch':'')+'" ondragstart="return false;"><div class="ilightbox-container"></div></div>'),nextPhoto:$('<div class="ilightbox-holder'+(supportTouch?' supportTouch':'')+' ilightbox-next" ondragstart="return false;"><div class="ilightbox-container"></div></div>'),prevPhoto:$('<div class="ilightbox-holder'+(supportTouch?' supportTouch':'')+' ilightbox-prev" ondragstart="return false;"><div class="ilightbox-container"></div></div>'),nextButton:$('<a class="ilightbox-button ilightbox-next-button" ondragstart="return false;" title="'+ iL.options.text.next+'"><span></span></a>'),prevButton:$('<a class="ilightbox-button ilightbox-prev-button" ondragstart="return false;" title="'+ iL.options.text.previous+'"><span></span></a>'),thumbnails:$('<div class="ilightbox-thumbnails" ondragstart="return false;"><div class="ilightbox-thumbnails-container"><a class="ilightbox-thumbnails-dragger"></a><div class="ilightbox-thumbnails-grid"></div></div></div>'),thumbs:false,nextLock:false,prevLock:false,hashLock:false,isMobile:false,mobileMaxWidth:980,isInFullScreen:false,isSwipe:false,mouseID:0,cycleID:0,isPaused:0,captionHeight:39,};iL.vars.hideableElements=iL.vars.nextButton.add(iL.vars.prevButton);iL.normalizeItems();iL.availPlugins();iL.options.startFrom=(iL.options.startFrom>0&&iL.options.startFrom>=iL.vars.total)?iL.vars.total- 1:iL.options.startFrom;iL.options.startFrom=(iL.options.randomStart)?floor(random()*iL.vars.total):iL.options.startFrom;iL.vars.start=iL.options.startFrom;if(instant)iL.instantCall();else iL.patchItemsEvents();if(iL.options.linkId){iL.hashChangeHandler();$win.iLightBoxHashChange(function(){iL.hashChangeHandler();});}
if(supportTouch){var RegExp=/(click|mouseenter|mouseleave|mouseover|mouseout)/ig,replace="itap";iL.options.caption.show=iL.options.caption.show.replace(RegExp,replace),iL.options.caption.hide=iL.options.caption.hide.replace(RegExp,replace),iL.options.social.show=iL.options.social.show.replace(RegExp,replace),iL.options.social.hide=iL.options.social.hide.replace(RegExp,replace);}
if(iL.options.controls.arrows){$.extend(iL.options.styles,{nextOffsetX:($(window).width()>UNCODE.mediaQuery)?36:4,prevOffsetX:($(window).width()>UNCODE.mediaQuery)?36:4,nextOpacity:0,prevOpacity:0});}};iLightBox.prototype={showLoader:function(){var iL=this;iL.vars.loadRequests+=1;if(iL.options.path.toLowerCase()=="horizontal")iL.vars.loader.stop().animate({opacity:'1'},iL.options.show.speed,'easeOutCirc');else iL.vars.loader.stop().animate({opacity:'1'},iL.options.show.speed,'easeOutCirc');},hideLoader:function(){var iL=this;iL.vars.loadRequests-=1;iL.vars.loadRequests=(iL.vars.loadRequests<0)?0:iL.vars.loadRequests;if(iL.options.path.toLowerCase()=="horizontal"){if(iL.vars.loadRequests<=0)iL.vars.loader.stop().animate({opacity:'0'},iL.options.show.speed,'easeInCirc');}else{if(iL.vars.loadRequests<=0)iL.vars.loader.stop().animate({opacity:'0'},iL.options.show.speed,'easeInCirc');}},createUI:function(){var iL=this;iL.ui={currentElement:iL.vars.holder,nextElement:iL.vars.nextPhoto,prevElement:iL.vars.prevPhoto,currentItem:iL.vars.current,nextItem:iL.vars.next,prevItem:iL.vars.prev,hide:function(){iL.closeAction();},refresh:function(){(arguments.length>0)?iL.repositionPhoto(true):iL.repositionPhoto();},fullscreen:function(){iL.fullScreenAction();}};},attachItems:function(){var iL=this,itemsObject=new Array(),items=new Array();$(iL.selector,iL.context).each(function(){var t=$(this),URL=t.attr(iL.options.attr)||null,options=t.data("options")&&eval("({"+ t.data("options")+"})")||{},caption=t.data('caption'),title=t.data('title'),type=t.data('type')||getTypeByExtension(URL),clone=t.data('lbox-clone')||false;if(t.data('lbox-clone')!=undefined)return;items.push({URL:URL,caption:caption,title:title,type:type,options:options,clone:clone});if(!iL.instant)itemsObject.push(t);});if(iL.vars!=undefined)iL.vars.total=items.length;iL.items=items,iL.itemsObject=itemsObject;},normalizeItems:function(){var iL=this,newItems=new Array();$.each(iL.items,function(key,val){if(typeof val=="string")val={url:val};var URL=val.url||val.URL||null,options=val.options||{},caption=val.caption||null,title=val.title||null,type=(val.type)?val.type.toLowerCase():getTypeByExtension(URL),ext=(typeof URL!='object')?getExtension(URL):'';options.thumbnail=options.thumbnail||((type=="image")?URL:null),options.videoType=options.videoType||null,options.skin=options.skin||iL.options.skin,options.width=options.width||null,options.height=options.height||null,options.mousewheel=(typeof options.mousewheel!='undefined')?options.mousewheel:true,options.swipe=(typeof options.swipe!='undefined')?options.swipe:true,options.social=(typeof options.social!='undefined')?options.social:iL.options.social.buttons&&$.extend({},{},iL.options.social.buttons);if(type=="video"){options.html5video=(typeof options.html5video!='undefined')?options.html5video:{};options.html5video.webm=options.html5video.webm||options.html5video.WEBM||null;options.html5video.controls=(typeof options.html5video.controls!='undefined')?options.html5video.controls:"controls";options.html5video.preload=options.html5video.preload||"metadata";options.html5video.autoplay=(typeof options.html5video.autoplay!='undefined')?options.html5video.autoplay:false;}
if(!options.width||!options.height){if(type=="video")options.width=1280,options.height=720;else if(type=="iframe")options.width='100%',options.height='90%';else if(type=="flash")options.width=1280,options.height=720;}
delete val.url;val.index=key;val.URL=URL;val.caption=caption;val.title=title;val.type=type;val.options=options;val.ext=ext;newItems.push(val);});iL.items=newItems;},instantCall:function(){var iL=this,key=iL.vars.start;iL.vars.current=key;iL.vars.next=(iL.items[key+ 1])?key+ 1:null;iL.vars.prev=(iL.items[key- 1])?key- 1:null;iL.addContents();iL.patchEvents();},addContents:function(){var iL=this,vars=iL.vars,opts=iL.options,viewport=getViewport(),path=opts.path.toLowerCase(),recognizingItems=vars.total>0&&iL.items.filter(function(e,i,arr){return['image','flash','video'].indexOf(e.type)===-1&&typeof e.recognized==='undefined'&&(opts.smartRecognition||e.options.smartRecognition);}),needRecognition=recognizingItems.length>0;if(opts.mobileOptimizer&&!opts.innerToolbar)
vars.isMobile=viewport.width<=vars.mobileMaxWidth;vars.overlay.addClass(opts.skin).hide().css('opacity',opts.overlay.opacity);if(opts.linkId)
vars.overlay[0].setAttribute('linkid',opts.linkId);if(opts.controls.toolbar){vars.toolbar.addClass(opts.skin).append(vars.closeButton);if(opts.controls.fullscreen)
vars.toolbar.append(vars.fullScreenButton);if(opts.controls.slideshow)
vars.toolbar.append(vars.innerPlayButton);if(vars.total>1)
vars.toolbar.append(vars.innerPrevButton).append(vars.innerNextButton);}
vars.BODY.addClass('ilightbox-noscroll').append(vars.overlay).append(vars.loader).append(vars.holder).append(vars.nextPhoto).append(vars.prevPhoto);if(!opts.innerToolbar)
vars.BODY.append(vars.toolbar);if(opts.controls.arrows)
vars.BODY.append(vars.nextButton).append(vars.prevButton);if(opts.controls.thumbnail&&vars.total>1){vars.BODY.append(vars.thumbnails);vars.thumbnails.addClass(opts.skin).addClass('ilightbox-'+ path);$('div.ilightbox-thumbnails-grid',vars.thumbnails).empty();vars.thumbs=true;}
var loaderCss=(opts.path.toLowerCase()=="horizontal")?{left:parseInt((viewport.width/2)-(vars.loader.outerWidth()/ 2))
}:{top:parseInt((viewport.height/2)-(vars.loader.outerHeight()/ 2))
};vars.loader.addClass(opts.skin).css(loaderCss);vars.nextButton.add(vars.prevButton).addClass(opts.skin);if(path=="horizontal")
vars.loader.add(vars.nextButton).add(vars.prevButton).addClass('horizontal');vars.BODY[vars.isMobile?'addClass':'removeClass']('isMobile');if(!opts.infinite){vars.prevButton.add(vars.prevButton).add(vars.innerPrevButton).add(vars.nextButton).add(vars.innerNextButton).removeClass('disabled');if(vars.current==0)
vars.prevButton.add(vars.innerPrevButton).addClass('disabled');if(vars.current>=vars.total- 1)
vars.nextButton.add(vars.innerNextButton).addClass('disabled');}
if(opts.show.effect){vars.overlay.stop().fadeIn(opts.show.speed);vars.toolbar.stop().fadeIn(opts.show.speed);}else{vars.overlay.show();vars.toolbar.show();}
var length=recognizingItems.length;if(needRecognition){iL.showLoader();$.each(recognizingItems,function(key,val){var resultFnc=function(result){var key=-1,filter=iL.items.filter(function(e,i,arr){if(e.URL==result.url)
key=i;return e.URL==result.url;}),self=iL.items[key];if(result)
$.extend(true,self,{URL:result.source,type:result.type,recognized:true,options:{html5video:result.html5video,width:(result.type=="image")?0:(result.width||self.width),height:(result.type=="image")?0:(result.height||self.height),thumbnail:self.options.thumbnail||result.thumbnail}});length--;if(length==0){iL.hideLoader();vars.dontGenerateThumbs=false;iL.generateThumbnails();if(opts.show.effect)
setTimeout(function(){iL.generateBoxes();},opts.show.speed);else
iL.generateBoxes();}};iL.ogpRecognition(this,resultFnc);});}
else{if(opts.show.effect)
setTimeout(function(){iL.generateBoxes();},opts.show.speed);else
iL.generateBoxes();}
iL.createUI();window.iLightBox={close:function(){iL.closeAction();},fullscreen:function(){iL.fullScreenAction();},moveNext:function(){iL.moveTo('next');},movePrev:function(){iL.moveTo('prev');},goTo:function(index){iL.goTo(index);},refresh:function(){iL.refresh();},reposition:function(){(arguments.length>0)?iL.repositionPhoto(true):iL.repositionPhoto();},setOption:function(options){iL.setOption(options);},destroy:function(){iL.closeAction();iL.dispatchItemsEvents();}};if(opts.linkId){vars.hashLock=true;window.location.hash=opts.linkId+'/'+ vars.current;setTimeout(function(){vars.hashLock=false;},55);}
if(!opts.slideshow.startPaused){iL.resume();vars.innerPlayButton.removeClass('ilightbox-play').addClass('ilightbox-pause');}
if(typeof iL.options.callback.onOpen=='function')iL.options.callback.onOpen.call(iL);},loadContent:function(obj,opt,speed){var iL=this,holder,item;iL.createUI();obj.speed=speed||iL.options.effects.loadedFadeSpeed;if(opt=='current'){if(!obj.options.mousewheel)iL.vars.lockWheel=true;else iL.vars.lockWheel=false;if(!obj.options.swipe)iL.vars.lockSwipe=true;else iL.vars.lockSwipe=false;}
switch(opt){case'current':holder=iL.vars.holder,item=iL.vars.current;break;case'next':holder=iL.vars.nextPhoto,item=iL.vars.next;break;case'prev':holder=iL.vars.prevPhoto,item=iL.vars.prev;break;}
holder.removeAttr('style class').addClass('ilightbox-holder'+(supportTouch?' supportTouch':'')).addClass(obj.options.skin);$('div.ilightbox-inner-toolbar',holder).remove();if(obj.title||iL.options.innerToolbar){var innerToolbar=iL.vars.innerToolbar.clone();if(obj.title&&iL.options.show.title){var title=iL.vars.title.clone();title.empty().html(obj.title);innerToolbar.append(title);}
if(iL.options.innerToolbar){innerToolbar.append((iL.vars.total>1)?iL.vars.toolbar.clone():iL.vars.toolbar);}
holder.prepend(innerToolbar);}
iL.loadSwitcher(obj,holder,item,opt);},loadSwitcher:function(obj,holder,item,opt){var iL=this,opts=iL.options,api={element:holder,position:item};switch(obj.type){case'image':if(typeof opts.callback.onBeforeLoad=='function')opts.callback.onBeforeLoad.call(iL,iL.ui,item);if(typeof obj.options.onBeforeLoad=='function')obj.options.onBeforeLoad.call(iL,api);iL.loadImage(obj.URL,function(img){if(typeof opts.callback.onAfterLoad=='function')opts.callback.onAfterLoad.call(iL,iL.ui,item);if(typeof obj.options.onAfterLoad=='function')obj.options.onAfterLoad.call(iL,api);var width=(img)?img.width:400,height=(img)?img.height:200;holder.data({naturalWidth:width,naturalHeight:height});$('div.ilightbox-container',holder).empty().append((img)?'<img src="'+ obj.URL+'" class="ilightbox-image" />':'<span class="ilightbox-alert">'+ opts.errors.loadImage+'</span>');if(typeof opts.callback.onRender=='function')opts.callback.onRender.call(iL,iL.ui,item);if(typeof obj.options.onRender=='function')obj.options.onRender.call(iL,api);iL.configureHolder(obj,opt,holder);});break;case'video':holder.data({naturalWidth:obj.options.width,naturalHeight:obj.options.height});iL.addContent(holder,obj);if(typeof opts.callback.onRender=='function')opts.callback.onRender.call(iL,iL.ui,item);if(typeof obj.options.onRender=='function')obj.options.onRender.call(iL,api);iL.configureHolder(obj,opt,holder);break;case'iframe':iL.showLoader();holder.data({naturalWidth:obj.options.width,naturalHeight:obj.options.height});var el=iL.addContent(holder,obj);if(typeof opts.callback.onRender=='function')opts.callback.onRender.call(iL,iL.ui,item);if(typeof obj.options.onRender=='function')obj.options.onRender.call(iL,api);if(typeof opts.callback.onBeforeLoad=='function')opts.callback.onBeforeLoad.call(iL,iL.ui,item);if(typeof obj.options.onBeforeLoad=='function')obj.options.onBeforeLoad.call(iL,api);el.bind('load',function(){if(typeof opts.callback.onAfterLoad=='function')opts.callback.onAfterLoad.call(iL,iL.ui,item);if(typeof obj.options.onAfterLoad=='function')obj.options.onAfterLoad.call(iL,api);iL.hideLoader();iL.configureHolder(obj,opt,holder);el.unbind('load');});break;case'inline':var el=$(obj.URL),content=iL.addContent(holder,obj),images=findImageInElement(holder);holder.data({naturalWidth:(iL.items[item].options.width||el.outerWidth()),naturalHeight:(iL.items[item].options.height||el.outerHeight())});content.children().eq(0).show();if(typeof opts.callback.onRender=='function')opts.callback.onRender.call(iL,iL.ui,item);if(typeof obj.options.onRender=='function')obj.options.onRender.call(iL,api);if(typeof opts.callback.onBeforeLoad=='function')opts.callback.onBeforeLoad.call(iL,iL.ui,item);if(typeof obj.options.onBeforeLoad=='function')obj.options.onBeforeLoad.call(iL,api);iL.loadImage(images,function(){if(typeof opts.callback.onAfterLoad=='function')opts.callback.onAfterLoad.call(iL,iL.ui,item);if(typeof obj.options.onAfterLoad=='function')obj.options.onAfterLoad.call(iL,api);iL.configureHolder(obj,opt,holder);});break;case'flash':var el=iL.addContent(holder,obj);holder.data({naturalWidth:(iL.items[item].options.width||el.outerWidth()),naturalHeight:(iL.items[item].options.height||el.outerHeight())});if(typeof opts.callback.onRender=='function')opts.callback.onRender.call(iL,iL.ui,item);if(typeof obj.options.onRender=='function')obj.options.onRender.call(iL,api);iL.configureHolder(obj,opt,holder);break;case'ajax':var ajax=obj.options.ajax||{};if(typeof opts.callback.onBeforeLoad=='function')opts.callback.onBeforeLoad.call(iL,iL.ui,item);if(typeof obj.options.onBeforeLoad=='function')obj.options.onBeforeLoad.call(iL,api);iL.showLoader();$.ajax({url:obj.URL||opts.ajaxSetup.url,data:ajax.data||null,dataType:ajax.dataType||"html",type:ajax.type||opts.ajaxSetup.type,cache:ajax.cache||opts.ajaxSetup.cache,crossDomain:ajax.crossDomain||opts.ajaxSetup.crossDomain,global:ajax.global||opts.ajaxSetup.global,ifModified:ajax.ifModified||opts.ajaxSetup.ifModified,username:ajax.username||opts.ajaxSetup.username,password:ajax.password||opts.ajaxSetup.password,beforeSend:ajax.beforeSend||opts.ajaxSetup.beforeSend,complete:ajax.complete||opts.ajaxSetup.complete,success:function(data,textStatus,jqXHR){iL.hideLoader();var el=$(data),container=$('div.ilightbox-container',holder),elWidth=iL.items[item].options.width||parseInt(el[0].getAttribute('width')),elHeight=iL.items[item].options.height||parseInt(el[0].getAttribute('height')),css=(el[0].getAttribute('width')&&el[0].getAttribute('height'))?{'overflow':'hidden'}:{};container.empty().append($('<div class="ilightbox-wrapper"></div>').css(css).html(el));holder.show().data({naturalWidth:(elWidth||container.outerWidth()),naturalHeight:(elHeight||container.outerHeight())}).hide();if(typeof opts.callback.onRender=='function')opts.callback.onRender.call(iL,iL.ui,item);if(typeof obj.options.onRender=='function')obj.options.onRender.call(iL,api);var images=findImageInElement(holder);iL.loadImage(images,function(){if(typeof opts.callback.onAfterLoad=='function')opts.callback.onAfterLoad.call(iL,iL.ui,item);if(typeof obj.options.onAfterLoad=='function')obj.options.onAfterLoad.call(iL,api);iL.configureHolder(obj,opt,holder);});opts.ajaxSetup.success(data,textStatus,jqXHR);if(typeof ajax.success=='function')ajax.success(data,textStatus,jqXHR);},error:function(jqXHR,textStatus,errorThrown){if(typeof opts.callback.onAfterLoad=='function')opts.callback.onAfterLoad.call(iL,iL.ui,item);if(typeof obj.options.onAfterLoad=='function')obj.options.onAfterLoad.call(iL,api);iL.hideLoader();$('div.ilightbox-container',holder).empty().append('<span class="ilightbox-alert">'+ opts.errors.loadContents+'</span>');iL.configureHolder(obj,opt,holder);opts.ajaxSetup.error(jqXHR,textStatus,errorThrown);if(typeof ajax.error=='function')ajax.error(jqXHR,textStatus,errorThrown);}});break;case'html':var object=obj.URL,el
container=$('div.ilightbox-container',holder);if(object[0].nodeName)el=object.clone();else{var dom=$(object);if(dom.selector)el=$('<div>'+ dom+'</div>');else el=dom;}
var elWidth=iL.items[item].options.width||parseInt(el.attr('width')),elHeight=iL.items[item].options.height||parseInt(el.attr('height'));iL.addContent(holder,obj);el.appendTo(document.documentElement).hide();if(typeof opts.callback.onRender=='function')opts.callback.onRender.call(iL,iL.ui,item);if(typeof obj.options.onRender=='function')obj.options.onRender.call(iL,api);var images=findImageInElement(holder);if(typeof opts.callback.onBeforeLoad=='function')opts.callback.onBeforeLoad.call(iL,iL.ui,item);if(typeof obj.options.onBeforeLoad=='function')obj.options.onBeforeLoad.call(iL,api);iL.loadImage(images,function(){if(typeof opts.callback.onAfterLoad=='function')opts.callback.onAfterLoad.call(iL,iL.ui,item);if(typeof obj.options.onAfterLoad=='function')obj.options.onAfterLoad.call(iL,api);holder.show().data({naturalWidth:(elWidth||container.outerWidth()),naturalHeight:(elHeight||container.outerHeight())}).hide();el.remove();iL.configureHolder(obj,opt,holder);});break;}},configureHolder:function(obj,opt,holder){var iL=this,vars=iL.vars,opts=iL.options;if(opt!="current")(opt=="next")?holder.addClass('ilightbox-next'):holder.addClass('ilightbox-prev');if(opt=="current")
var item=vars.current;else if(opt=="next")
var opacity=opts.styles.nextOpacity,item=vars.next;else
var opacity=opts.styles.prevOpacity,item=vars.prev;var api={element:holder,position:item};iL.items[item].options.width=iL.items[item].options.width||0,iL.items[item].options.height=iL.items[item].options.height||0;if(opt=="current"){if(opts.show.effect)holder.css(transform,gpuAcceleration).fadeIn(obj.speed,function(){holder.css(transform,'');if(obj.caption){iL.setCaption(obj,holder);var caption=$('div.ilightbox-caption',holder),percent=parseInt((caption.outerHeight()/ holder.outerHeight()) * 100);
if(opts.caption.start&percent<=50)caption.fadeIn(opts.effects.fadeSpeed);}
var social=obj.options.social;if(social){iL.setSocial(social,obj.URL,holder);if(opts.social.start)$('div.ilightbox-social',holder).fadeIn(opts.effects.fadeSpeed);}
iL.generateThumbnails();if(typeof opts.callback.onShow=='function')opts.callback.onShow.call(iL,iL.ui,item);if(typeof obj.options.onShow=='function')obj.options.onShow.call(iL,api);});else{holder.show();iL.generateThumbnails();if(typeof opts.callback.onShow=='function')opts.callback.onShow.call(iL,iL.ui,item);if(typeof obj.options.onShow=='function')obj.options.onShow.call(iL,api);}}else{if(opts.show.effect)holder.fadeTo(obj.speed,opacity,function(){if(opt=="next")vars.nextLock=false;else vars.prevLock=false;iL.generateThumbnails();if(typeof opts.callback.onShow=='function')opts.callback.onShow.call(iL,iL.ui,item);if(typeof obj.options.onShow=='function')obj.options.onShow.call(iL,api);});else{holder.css({opacity:opacity}).show();if(opt=="next")vars.nextLock=false;else vars.prevLock=false;iL.generateThumbnails();if(typeof opts.callback.onShow=='function')opts.callback.onShow.call(iL,iL.ui,item);if(typeof obj.options.onShow=='function')obj.options.onShow.call(iL,api);}}
setTimeout(function(){iL.repositionPhoto();},0);},generateBoxes:function(){var iL=this,vars=iL.vars,opts=iL.options;if(opts.infinite&&vars.total>=3){if(vars.current==vars.total- 1)vars.next=0;if(vars.current==0)vars.prev=vars.total- 1;}else opts.infinite=false;iL.loadContent(iL.items[vars.current],'current',opts.show.speed);if(iL.items[vars.next])iL.loadContent(iL.items[vars.next],'next',opts.show.speed);if(iL.items[vars.prev])iL.loadContent(iL.items[vars.prev],'prev',opts.show.speed);},generateThumbnails:function(){var iL=this,vars=iL.vars,opts=iL.options,timeOut=null;if(vars.thumbs&&!iL.vars.dontGenerateThumbs){var thumbnails=vars.thumbnails,container=$('div.ilightbox-thumbnails-container',thumbnails),grid=$('div.ilightbox-thumbnails-grid',container),i=0;grid.removeAttr('style').empty();$.each(iL.items,function(key,val){var isActive=(vars.current==key)?'ilightbox-active':'',opacity=(vars.current==key)?opts.thumbnails.activeOpacity:opts.thumbnails.normalOpacity,thumb=val.options.thumbnail,thumbnail=$('<div class="ilightbox-thumbnail"></div>'),icon=$('<div class="ilightbox-thumbnail-icon"></div>');thumbnail.css({opacity:0}).addClass(isActive);if((val.type=="video"||val.type=="flash")&&typeof val.options.icon=='undefined'){icon.addClass('ilightbox-thumbnail-video');thumbnail.append(icon);}else if(val.options.icon){icon.addClass('ilightbox-thumbnail-'+ val.options.icon);thumbnail.append(icon);}
if(thumb)iL.loadImage(thumb,function(img){i++;if(img)thumbnail.data({naturalWidth:img.width,naturalHeight:img.height}).append('<img src="'+ thumb+'" border="0" />');else thumbnail.data({naturalWidth:opts.thumbnails.maxWidth,naturalHeight:opts.thumbnails.maxHeight});clearTimeout(timeOut);timeOut=setTimeout(function(){iL.positionThumbnails(thumbnails,container,grid);},20);setTimeout(function(){thumbnail.fadeTo(opts.effects.loadedFadeSpeed,opacity);},i*20);});grid.append(thumbnail);});iL.vars.dontGenerateThumbs=true;}},positionThumbnails:function(thumbnails,container,grid){var iL=this,vars=iL.vars,opts=iL.options,viewport=getViewport(),path=opts.path.toLowerCase();if(!thumbnails)thumbnails=vars.thumbnails;if(!container)container=$('div.ilightbox-thumbnails-container',thumbnails);if(!grid)grid=$('div.ilightbox-thumbnails-grid',container);var thumbs=$('.ilightbox-thumbnail',grid),widthAvail=(path=='horizontal')?viewport.width- opts.styles.pageOffsetX:thumbs.eq(0).outerWidth()- opts.styles.pageOffsetX,heightAvail=(path=='horizontal')?thumbs.eq(0).outerHeight()- opts.styles.pageOffsetY:viewport.height- opts.styles.pageOffsetY,gridWidth=(path=='horizontal')?0:widthAvail,gridHeight=(path=='horizontal')?heightAvail:0,active=$('.ilightbox-active',grid),gridCss={},css={};if(arguments.length<3){thumbs.css({opacity:opts.thumbnails.normalOpacity});active.css({opacity:opts.thumbnails.activeOpacity});}
thumbs.each(function(i){var t=$(this),data=t.data(),width=(path=='horizontal')?0:opts.thumbnails.maxWidth;height=(path=='horizontal')?opts.thumbnails.maxHeight:0;dims=iL.getNewDimenstions(width,height,data.naturalWidth,data.naturalHeight,true);t.css({width:dims.width,height:dims.height});if(path=='horizontal')t.css({'float':'left'});(path=='horizontal')?(gridWidth+=t.outerWidth()):(gridHeight+=t.outerHeight());});gridCss={width:gridWidth,height:gridHeight};grid.css(gridCss);gridCss={};var gridOffset=grid.offset(),activeOffset=(active.length)?active.offset():{top:parseInt(heightAvail/2),left:parseInt(widthAvail/2)};gridOffset.top=(gridOffset.top- $doc.scrollTop()),gridOffset.left=(gridOffset.left- $doc.scrollLeft()),activeOffset.top=(activeOffset.top- gridOffset.top- $doc.scrollTop()),activeOffset.left=(activeOffset.left- gridOffset.left- $doc.scrollLeft());(path=='horizontal')?(gridCss.top=0,gridCss.left=parseInt((widthAvail/2)- activeOffset.left-(active.outerWidth()/ 2))
):(gridCss.top=parseInt(((heightAvail/2)- activeOffset.top-(active.outerHeight()/ 2))),
gridCss.left=0);if(arguments.length<3)grid.stop().animate(gridCss,opts.effects.repositionSpeed,'easeOutCirc');else grid.css(gridCss);},loadImage:function(image,callback){if(!$.isArray(image))image=[image];var iL=this,length=image.length;if(length>0){iL.showLoader();$.each(image,function(index,value){var img=new Image();img.onload=function(){length-=1;if(length==0){iL.hideLoader();callback(img);}};img.onerror=img.onabort=function(){length-=1;if(length==0){iL.hideLoader();callback(false);}};img.src=image[index];});}else callback(false);},patchItemsEvents:function(){var iL=this,vars=iL.vars,clickEvent=supportTouch?"itap.iL":"click.iL",vEvent=supportTouch?"click.iL":"itap.iL";if(iL.context&&iL.selector){var $items=$(iL.selector,iL.context);$(iL.context).on(clickEvent,iL.selector,function(){var $this=$(this),key=$(this).closest('.owl-item').length?($(this).closest('.owl-item').data('index')- 1):$items.index($this);if(UNCODE.isMobile){var isCarousel=$this.closest('.owl-carousel');if(isCarousel.length){if(isCarousel.hasClass('owl-translating'))return false;}}
vars.current=key;vars.next=iL.items[key+ 1]?key+ 1:null;vars.prev=iL.items[key- 1]?key- 1:null;iL.addContents();iL.patchEvents();return false;}).on(vEvent,iL.selector,function(){return false;});}else
$.each(iL.itemsObject,function(key,val){val.on(clickEvent,function(){vars.current=key;vars.next=iL.items[key+ 1]?key+ 1:null;vars.prev=iL.items[key- 1]?key- 1:null;iL.addContents();iL.patchEvents();return false;}).on(vEvent,function(){return false;});});},dispatchItemsEvents:function(){var iL=this,vars=iL.vars,opts=iL.options;if(iL.context&&iL.selector)
$(iL.context).off('.iL',iL.selector);else
$.each(iL.itemsObject,function(key,val){val.off('.iL');});},refresh:function(){var iL=this;iL.dispatchItemsEvents();iL.attachItems();iL.normalizeItems();iL.patchItemsEvents();},patchEvents:function(){var iL=this,vars=iL.vars,opts=iL.options,path=opts.path.toLowerCase(),holders=$('.ilightbox-holder'),fullscreenEvent=fullScreenApi.fullScreenEventName+'.iLightBox',durationThreshold=1000,horizontalDistanceThreshold=verticalDistanceThreshold=100,buttonsArray=[vars.nextButton[0],vars.prevButton[0],vars.nextButton[0].firstChild,vars.prevButton[0].firstChild];$win.bind('resize.iLightBox',function(){var viewport=getViewport();if(opts.mobileOptimizer&&!opts.innerToolbar)vars.isMobile=viewport.width<=vars.mobileMaxWidth;vars.BODY[vars.isMobile?'addClass':'removeClass']('isMobile');iL.repositionPhoto(null);if(supportTouch){clearTimeout(vars.setTime);vars.setTime=setTimeout(function(){var scrollTop=getScrollXY().y;window.scrollTo(0,scrollTop- 30);window.scrollTo(0,scrollTop+ 30);window.scrollTo(0,scrollTop);},2000);}
if(vars.thumbs)iL.positionThumbnails();}).bind('keydown.iLightBox',function(event){if(opts.controls.keyboard){switch(event.keyCode){case 13:if(event.shiftKey&&opts.keyboard.shift_enter)iL.fullScreenAction();break;case 27:if(opts.keyboard.esc)iL.closeAction();break;case 37:if(opts.keyboard.left&&!vars.lockKey)iL.moveTo('prev');break;case 38:if(opts.keyboard.up&&!vars.lockKey)iL.moveTo('prev');break;case 39:if(opts.keyboard.right&&!vars.lockKey)iL.moveTo('next');break;case 40:if(opts.keyboard.down&&!vars.lockKey)iL.moveTo('next');break;}}});if(fullScreenApi.supportsFullScreen)$win.bind(fullscreenEvent,function(){iL.doFullscreen();});var holderEventsArr=[opts.caption.show+'.iLightBox',opts.caption.hide+'.iLightBox',opts.social.show+'.iLightBox',opts.social.hide+'.iLightBox'].filter(function(e,i,arr){return arr.lastIndexOf(e)===i;}),holderEvents="";$.each(holderEventsArr,function(key,val){if(key!=0)holderEvents+=' ';holderEvents+=val;});$doc.on(clickEvent,'.ilightbox-overlay',function(){if(opts.overlay.blur)iL.closeAction();}).on(clickEvent,'.ilightbox-next, .ilightbox-next-button',function(){iL.moveTo('next');}).on(clickEvent,'.ilightbox-prev, .ilightbox-prev-button',function(){iL.moveTo('prev');}).on(clickEvent,'.ilightbox-thumbnail',function(){var t=$(this),thumbs=$('.ilightbox-thumbnail',vars.thumbnails),index=thumbs.index(t);if(index!=vars.current)iL.goTo(index);}).on(holderEvents,'.ilightbox-holder:not(.ilightbox-next, .ilightbox-prev)',function(e){var caption=$('div.ilightbox-caption',vars.holder),social=$('div.ilightbox-social',vars.holder),fadeSpeed=opts.effects.fadeSpeed;if(vars.nextLock||vars.prevLock){if(e.type==opts.caption.show&&!caption.is(':visible'))caption.fadeIn(fadeSpeed);else if(e.type==opts.caption.hide&&caption.is(':visible'))caption.fadeOut(fadeSpeed);if(e.type==opts.social.show&&!social.is(':visible'))social.fadeIn(fadeSpeed);else if(e.type==opts.social.hide&&social.is(':visible'))social.fadeOut(fadeSpeed);}else{if(e.type==opts.caption.show&&!caption.is(':visible'))caption.stop().fadeIn(fadeSpeed);else if(e.type==opts.caption.hide&&caption.is(':visible'))caption.stop().fadeOut(fadeSpeed);if(e.type==opts.social.show&&!social.is(':visible'))social.stop().fadeIn(fadeSpeed);else if(e.type==opts.social.hide&&social.is(':visible'))social.stop().fadeOut(fadeSpeed);}}).on('mouseenter.iLightBox mouseleave.iLightBox','.ilightbox-wrapper',function(e){if(e.type=='mouseenter')vars.lockWheel=true;else vars.lockWheel=false;}).on(clickEvent,'.ilightbox-toolbar a.ilightbox-close, .ilightbox-toolbar a.ilightbox-fullscreen, .ilightbox-toolbar a.ilightbox-play, .ilightbox-toolbar a.ilightbox-pause',function(){var t=$(this);if(t.hasClass('ilightbox-fullscreen'))iL.fullScreenAction();else if(t.hasClass('ilightbox-play')){iL.resume();t.addClass('ilightbox-pause').removeClass('ilightbox-play');}else if(t.hasClass('ilightbox-pause')){iL.pause();t.addClass('ilightbox-play').removeClass('ilightbox-pause');}else iL.closeAction();}).on(touchMoveEvent,'.ilightbox-overlay, .ilightbox-thumbnails-container',function(e){e.preventDefault();});function mouseMoveHandler(e){if(!vars.isMobile){if(!vars.mouseID){vars.hideableElements.show();}
vars.mouseID=clearTimeout(vars.mouseID);if(buttonsArray.indexOf(e.target)===-1)
vars.mouseID=setTimeout(function(){vars.hideableElements.hide();vars.mouseID=clearTimeout(vars.mouseID);},3000);}}
if(opts.controls.arrows&&!supportTouch)$doc.on('mousemove.iLightBox',mouseMoveHandler);if(opts.controls.slideshow&&opts.slideshow.pauseOnHover)$doc.on('mouseenter.iLightBox mouseleave.iLightBox','.ilightbox-holder:not(.ilightbox-next, .ilightbox-prev)',function(e){if(e.type=='mouseenter'&&vars.cycleID)iL.pause();else if(e.type=='mouseleave'&&vars.isPaused)iL.resume();});var switchers=$('.ilightbox-overlay, .ilightbox-holder, .ilightbox-thumbnails');if(opts.controls.mousewheel)switchers.on('mousewheel.iLightBox',function(event,delta){if(!vars.lockWheel){event.preventDefault();if(delta<0)iL.moveTo('next');else if(delta>0)iL.moveTo('prev');}});if(opts.controls.swipe)holders.on(touchStartEvent,function(event){if(vars.nextLock||vars.prevLock||vars.total==1||vars.lockSwipe)return;vars.BODY.addClass('ilightbox-closedhand');var data=event.originalEvent.touches?event.originalEvent.touches[0]:event,scrollTop=$doc.scrollTop(),scrollLeft=$doc.scrollLeft(),offsets=[holders.eq(0).offset(),holders.eq(1).offset(),holders.eq(2).offset()],offSet=[{top:offsets[0].top- scrollTop,left:offsets[0].left- scrollLeft},{top:offsets[1].top- scrollTop,left:offsets[1].left- scrollLeft},{top:offsets[2].top- scrollTop,left:offsets[2].left- scrollLeft}],start={time:(new Date()).getTime(),coords:[data.pageX- scrollLeft,data.pageY- scrollTop]},stop;function moveEachHandler(i){var t=$(this),offset=offSet[i],scroll=[(start.coords[0]- stop.coords[0]),(start.coords[1]- stop.coords[1])];t[0].style[path=="horizontal"?'left':'top']=(path=="horizontal"?offset.left- scroll[0]:offset.top- scroll[1])+'px';}
function moveHandler(event){if(!start)return;var data=event.originalEvent.touches?event.originalEvent.touches[0]:event;stop={time:(new Date()).getTime(),coords:[data.pageX- scrollLeft,data.pageY- scrollTop]};holders.each(moveEachHandler);event.preventDefault();}
function repositionHolders(){holders.each(function(){var t=$(this),offset=t.data('offset')||{top:t.offset().top- scrollTop,left:t.offset().left- scrollLeft},top=offset.top,left=offset.left;t.css(transform,gpuAcceleration).stop().animate({top:top,left:left},500,'easeOutCirc',function(){t.css(transform,'');});});}
holders.bind(touchMoveEvent,moveHandler);$doc.one(touchStopEvent,function(event){holders.unbind(touchMoveEvent,moveHandler);vars.BODY.removeClass('ilightbox-closedhand');if(start&&stop){if(path=="horizontal"&&stop.time- start.time<durationThreshold&&abs(start.coords[0]- stop.coords[0])>horizontalDistanceThreshold&&abs(start.coords[1]- stop.coords[1])<verticalDistanceThreshold){if(start.coords[0]>stop.coords[0]){if(vars.current==vars.total- 1&&!opts.infinite)repositionHolders();else{vars.isSwipe=true;iL.moveTo('next');}}else{if(vars.current==0&&!opts.infinite)repositionHolders();else{vars.isSwipe=true;iL.moveTo('prev');}}}else if(path=="vertical"&&stop.time- start.time<durationThreshold&&abs(start.coords[1]- stop.coords[1])>horizontalDistanceThreshold&&abs(start.coords[0]- stop.coords[0])<verticalDistanceThreshold){if(start.coords[1]>stop.coords[1]){if(vars.current==vars.total- 1&&!opts.infinite)repositionHolders();else{vars.isSwipe=true;iL.moveTo('next');}}else{if(vars.current==0&&!opts.infinite)repositionHolders();else{vars.isSwipe=true;iL.moveTo('prev');}}}else repositionHolders();}
start=stop=undefined;});});},goTo:function(index){var iL=this,vars=iL.vars,opts=iL.options,diff=(index- vars.current);if(opts.infinite){if(index==vars.total- 1&&vars.current==0)diff=-1;if(vars.current==vars.total- 1&&index==0)diff=1;}
if(diff==1)iL.moveTo('next');else if(diff==-1)iL.moveTo('prev');else{if(vars.nextLock||vars.prevLock)return false;if(typeof opts.callback.onBeforeChange=='function')opts.callback.onBeforeChange.call(iL,iL.ui);if(opts.linkId){vars.hashLock=true;window.location.hash=opts.linkId+'/'+ index;}
if(iL.items[index]){if(!iL.items[index].options.mousewheel)vars.lockWheel=true;else iL.vars.lockWheel=false;if(!iL.items[index].options.swipe)vars.lockSwipe=true;else vars.lockSwipe=false;}
$.each([vars.holder,vars.nextPhoto,vars.prevPhoto],function(key,val){val.css(transform,gpuAcceleration).fadeOut(opts.effects.loadedFadeSpeed);});vars.current=index;vars.next=index+ 1;vars.prev=index- 1;iL.createUI();setTimeout(function(){iL.generateBoxes();},opts.effects.loadedFadeSpeed+ 50);$('.ilightbox-thumbnail',vars.thumbnails).removeClass('ilightbox-active').eq(index).addClass('ilightbox-active');iL.positionThumbnails();if(opts.linkId)setTimeout(function(){vars.hashLock=false;},55);if(!opts.infinite){vars.nextButton.add(vars.prevButton).add(vars.innerPrevButton).add(vars.innerNextButton).removeClass('disabled');if(vars.current==0){vars.prevButton.add(vars.innerPrevButton).addClass('disabled');}
if(vars.current>=vars.total- 1){vars.nextButton.add(vars.innerNextButton).addClass('disabled');}}
iL.resetCycle();if(typeof opts.callback.onAfterChange=='function')opts.callback.onAfterChange.call(iL,iL.ui);}},moveTo:function(side){var iL=this,vars=iL.vars,opts=iL.options,path=opts.path.toLowerCase(),viewport=getViewport(),switchSpeed=opts.effects.switchSpeed;if(vars.nextLock||vars.prevLock)return false;else{var item=(side=="next")?vars.next:vars.prev;if(opts.linkId){vars.hashLock=true;window.location.hash=opts.linkId+'/'+ item;}
if(side=="next"){if(!iL.items[item])return false;var firstHolder=vars.nextPhoto,secondHolder=vars.holder,lastHolder=vars.prevPhoto,firstClass='ilightbox-prev',secondClass='ilightbox-next';}else if(side=="prev"){if(!iL.items[item])return false;var firstHolder=vars.prevPhoto,secondHolder=vars.holder,lastHolder=vars.nextPhoto,firstClass='ilightbox-next',secondClass='ilightbox-prev';}
if(typeof opts.callback.onBeforeChange=='function')
opts.callback.onBeforeChange.call(iL,iL.ui);(side=="next")?vars.nextLock=true:vars.prevLock=true;var captionFirst=$('div.ilightbox-caption',secondHolder),socialFirst=$('div.ilightbox-social',secondHolder);if(captionFirst.length)
captionFirst.stop().fadeOut(switchSpeed,function(){$(this).remove();});if(socialFirst.length)
socialFirst.stop().fadeOut(switchSpeed,function(){$(this).remove();});if(iL.items[item].caption){iL.setCaption(iL.items[item],firstHolder);var caption=$('div.ilightbox-caption',firstHolder),percent=parseInt((caption.outerHeight()/ firstHolder.outerHeight()) * 100);
if(opts.caption.start&&percent<=50)caption.fadeIn(switchSpeed);}
var social=iL.items[item].options.social;if(social){iL.setSocial(social,iL.items[item].URL,firstHolder);if(opts.social.start)$('div.ilightbox-social',firstHolder).fadeIn(opts.effects.fadeSpeed);}
$.each([firstHolder,secondHolder,lastHolder],function(key,val){val.removeClass('ilightbox-next ilightbox-prev');});var firstOffset=firstHolder.data('offset'),winW=(viewport.width-(opts.styles.pageOffsetX)),winH=(viewport.height-(opts.styles.pageOffsetY)),width=firstOffset.newDims.width,height=firstOffset.newDims.height,thumbsOffset=firstOffset.thumbsOffset,diff=firstOffset.diff,top=parseInt((winH/2)-(height/2)- diff.H-(thumbsOffset.H/2)),left=parseInt((winW/2)-(width/2)- diff.W-(thumbsOffset.W/2));var secondOffset=secondHolder.data('offset'),object=secondOffset.object;if(object.item.caption&&!isNaN(width)&&!isNaN(height)&&UNCODE.wwidth>UNCODE.mediaQuery){var objRatio=width/height;height=height- vars.captionHeight;width=height*objRatio;top=parseInt((winH/2)-(height/2)- diff.H-(thumbsOffset.H/2)),left=parseInt((winW/2)-(width/2)- diff.W-(thumbsOffset.W/2));}
firstHolder.css(transform,gpuAcceleration).animate({top:top,left:left,opacity:1},switchSpeed,(vars.isSwipe)?'easeOutCirc':'easeInOutCirc',function(){firstHolder.css(transform,'');});$('div.ilightbox-container',firstHolder).animate({width:width,height:height},switchSpeed,(vars.isSwipe)?'easeOutCirc':'easeInOutCirc');diff=secondOffset.diff;width=secondOffset.newDims.width,height=secondOffset.newDims.height;width=parseInt(width*opts.styles[side=='next'?'prevScale':'nextScale']),height=parseInt(height*opts.styles[side=='next'?'prevScale':'nextScale']),top=(path=='horizontal')?parseInt((winH/2)- object.offsetY-(height/2)- diff.H-(thumbsOffset.H/2)):parseInt(winH- object.offsetX- diff.H-(thumbsOffset.H/2));if(side=='prev')
left=(path=='horizontal')?parseInt(winW- object.offsetX- diff.W-(thumbsOffset.W/2)):parseInt((winW/2)-(width/2)- diff.W- object.offsetY-(thumbsOffset.W/2));else{top=(path=='horizontal')?top:parseInt(object.offsetX- diff.H- height-(thumbsOffset.H/2)),left=(path=='horizontal')?parseInt(object.offsetX- diff.W- width-(thumbsOffset.W/2)):parseInt((winW/2)- object.offsetY-(width/2)- diff.W-(thumbsOffset.W/2));}
if(object.item.caption&&!isNaN(width)&&!isNaN(height)&&UNCODE.wwidth>UNCODE.mediaQuery){var objRatio=width/height;height=height- vars.captionHeight;width=height*objRatio;top=parseInt((winH/2)-(height/2)- diff.H-(thumbsOffset.H/2));}
$('div.ilightbox-container',secondHolder).animate({width:width,height:height},switchSpeed,(vars.isSwipe)?'easeOutCirc':'easeInOutCirc');secondHolder.addClass(firstClass).css(transform,gpuAcceleration).animate({top:top,left:left,opacity:opts.styles.prevOpacity},switchSpeed,(vars.isSwipe)?'easeOutCirc':'easeInOutCirc',function(){secondHolder.css(transform,'');$('.ilightbox-thumbnail',vars.thumbnails).removeClass('ilightbox-active').eq(item).addClass('ilightbox-active');iL.positionThumbnails();if(iL.items[item]){if(!iL.items[item].options.mousewheel)vars.lockWheel=true;else vars.lockWheel=false;if(!iL.items[item].options.swipe)vars.lockSwipe=true;else vars.lockSwipe=false;}
vars.isSwipe=false;if(side=="next"){vars.nextPhoto=lastHolder,vars.prevPhoto=secondHolder,vars.holder=firstHolder;vars.nextPhoto.hide();vars.next=vars.next+ 1,vars.prev=vars.current,vars.current=vars.current+ 1;if(opts.infinite){if(vars.current>vars.total- 1)vars.current=0;if(vars.current==vars.total- 1)vars.next=0;if(vars.current==0)vars.prev=vars.total- 1;}
iL.createUI();if(!iL.items[vars.next])
vars.nextLock=false;else
iL.loadContent(iL.items[vars.next],'next');}else{vars.prevPhoto=lastHolder;vars.nextPhoto=secondHolder;vars.holder=firstHolder;vars.prevPhoto.hide();vars.next=vars.current;vars.current=vars.prev;vars.prev=vars.current- 1;if(opts.infinite){if(vars.current==vars.total- 1)vars.next=0;if(vars.current==0)vars.prev=vars.total- 1;}
iL.createUI();if(!iL.items[vars.prev])
vars.prevLock=false;else
iL.loadContent(iL.items[vars.prev],'prev');}
if(opts.linkId)setTimeout(function(){vars.hashLock=false;},55);if(!opts.infinite){vars.nextButton.add(vars.prevButton).add(vars.innerPrevButton).add(vars.innerNextButton).removeClass('disabled');if(vars.current==0)
vars.prevButton.add(vars.innerPrevButton).addClass('disabled');if(vars.current>=vars.total- 1)
vars.nextButton.add(vars.innerNextButton).addClass('disabled');}
iL.repositionPhoto();iL.resetCycle();if(typeof opts.callback.onAfterChange=='function')
opts.callback.onAfterChange.call(iL,iL.ui);});top=(path=='horizontal')?getPixel(lastHolder,'top'):((side=="next")?parseInt(-(winH/2)- lastHolder.outerHeight()):parseInt(top*2)),left=(path=='horizontal')?((side=="next")?parseInt(-(winW/2)- lastHolder.outerWidth()):parseInt(left*2)):getPixel(lastHolder,'left');lastHolder.css(transform,gpuAcceleration).animate({top:top,left:left,opacity:opts.styles.nextOpacity},switchSpeed,(vars.isSwipe)?'easeOutCirc':'easeInOutCirc',function(){lastHolder.css(transform,'');}).addClass(secondClass);}},setCaption:function(obj,target){var iL=this,caption=$('<div class="ilightbox-caption"></div>');if(obj.caption){caption.html(obj.caption);$('div.ilightbox-container',target).append(caption);}},normalizeSocial:function(obj,url){var iL=this,vars=iL.vars,opts=iL.options,baseURL=window.location.href;$.each(obj,function(key,value){if(!value)
return true;var item=key.toLowerCase(),source,text;switch(item){case'facebook':source="http://www.facebook.com/share.php?v=4&src=bm&u={URL}",text="Share on Facebook";break;case'twitter':source="http://twitter.com/home?status={URL}",text="Share on Twitter";break;case'googleplus':source="https://plus.google.com/share?url={URL}",text="Share on Google+";break;case'delicious':source="http://delicious.com/post?url={URL}",text="Share on Delicious";break;case'digg':source="http://digg.com/submit?phase=2&url={URL}",text="Share on Digg";break;case'reddit':source="http://reddit.com/submit?url={URL}",text="Share on reddit";break;}
obj[key]={URL:value.URL&&absolutizeURI(baseURL,value.URL)||opts.linkId&&window.location.href||typeof url!=='string'&&baseURL||url&&absolutizeURI(baseURL,url)||baseURL,source:value.source||source||value.URL&&absolutizeURI(baseURL,value.URL)||url&&absolutizeURI(baseURL,url),text:value.text||text||"Share on "+ key,width:(typeof(value.width)!='undefined'&&!isNaN(value.width))?parseInt(value.width):640,height:value.height||360};});return obj;},setSocial:function(obj,url,target){var iL=this,socialBar=$('<div class="ilightbox-social"></div>'),buttons='<ul>';obj=iL.normalizeSocial(obj,url);$.each(obj,function(key,value){var item=key.toLowerCase(),source=value.source.replace(/\{URL\}/g,encodeURIComponent(value.URL).replace(/!/g,'%21').replace(/'/g,'%27').replace(/\(/g,'%28').replace(/\)/g,'%29').replace(/\*/g,'%2A').replace(/%20/g,'+'));buttons+='<li class="'+ key+'"><a href="'+ source+'" onclick="javascript:window.open(this.href'+((value.width<=0||value.height<=0)?'':', \'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height='+ value.height+',width='+ value.width+',left=40,top=40\'')+');return false;" title="'+ value.text+'" target="_blank"></a></li>';});buttons+='</ul>';socialBar.html(buttons);$('div.ilightbox-container',target).append(socialBar);},fullScreenAction:function(){var iL=this,vars=iL.vars;if(fullScreenApi.supportsFullScreen){if(fullScreenApi.isFullScreen())fullScreenApi.cancelFullScreen(document.documentElement);else fullScreenApi.requestFullScreen(document.documentElement);}else{iL.doFullscreen();}},doFullscreen:function(){var iL=this,vars=iL.vars,viewport=getViewport(),opts=iL.options;if(opts.fullAlone){var currentHolder=vars.holder,current=iL.items[vars.current],windowWidth=viewport.width,windowHeight=viewport.height,elements=[currentHolder,vars.nextPhoto,vars.prevPhoto,vars.nextButton,vars.prevButton,vars.overlay,vars.toolbar,vars.thumbnails,vars.loader],hideElements=[vars.nextPhoto,vars.prevPhoto,vars.nextButton,vars.prevButton,vars.loader,vars.thumbnails];if(!vars.isInFullScreen){vars.isInFullScreen=vars.lockKey=vars.lockWheel=vars.lockSwipe=true;vars.overlay.css({opacity:1});$.each(hideElements,function(i,element){element.hide();});vars.fullScreenButton.attr('title',opts.text.exitFullscreen);if(opts.fullStretchTypes.indexOf(current.type)!=-1)currentHolder.data({naturalWidthOld:currentHolder.data('naturalWidth'),naturalHeightOld:currentHolder.data('naturalHeight'),naturalWidth:windowWidth,naturalHeight:windowHeight});else{var viewport=current.options.fullViewPort||opts.fullViewPort||'',newWidth=windowWidth,newHeight=windowHeight,width=currentHolder.data('naturalWidth'),height=currentHolder.data('naturalHeight');if(viewport.toLowerCase()=='fill'){newHeight=(newWidth/width)*height;if(newHeight<windowHeight){newWidth=(windowHeight/height)*width,newHeight=windowHeight;}}else if(viewport.toLowerCase()=='fit'){var dims=iL.getNewDimenstions(newWidth,newHeight,width,height,true);newWidth=dims.width,newHeight=dims.height;}else if(viewport.toLowerCase()=='stretch'){newWidth=newWidth,newHeight=newHeight;}else{var scale=(width>newWidth||height>newHeight)?true:false,dims=iL.getNewDimenstions(newWidth,newHeight,width,height,scale);newWidth=dims.width,newHeight=dims.height;}
currentHolder.data({naturalWidthOld:currentHolder.data('naturalWidth'),naturalHeightOld:currentHolder.data('naturalHeight'),naturalWidth:newWidth,naturalHeight:newHeight});}
$.each(elements,function(key,val){val.addClass('ilightbox-fullscreen');});if(typeof opts.callback.onEnterFullScreen=='function')opts.callback.onEnterFullScreen.call(iL,iL.ui);}else{vars.isInFullScreen=vars.lockKey=vars.lockWheel=vars.lockSwipe=false;vars.overlay.css({opacity:iL.options.overlay.opacity});$.each(hideElements,function(i,element){element.show();});vars.fullScreenButton.attr('title',opts.text.enterFullscreen);currentHolder.data({naturalWidth:currentHolder.data('naturalWidthOld'),naturalHeight:currentHolder.data('naturalHeightOld'),naturalWidthOld:null,naturalHeightOld:null});$.each(elements,function(key,val){val.removeClass('ilightbox-fullscreen');});if(typeof opts.callback.onExitFullScreen=='function')opts.callback.onExitFullScreen.call(iL,iL.ui);}}else{if(!vars.isInFullScreen)vars.isInFullScreen=true;else vars.isInFullScreen=false;}
iL.repositionPhoto(true);},closeAction:function(){var iL=this,vars=iL.vars,opts=iL.options;$win.unbind('.iLightBox');$doc.off('.iLightBox');if(vars.isInFullScreen)fullScreenApi.cancelFullScreen(document.documentElement);$('.ilightbox-overlay, .ilightbox-holder, .ilightbox-thumbnails').off('.iLightBox');if(opts.hide.effect)vars.overlay.stop().fadeOut(opts.hide.speed,function(){vars.overlay.remove();vars.BODY.removeClass('ilightbox-noscroll').off('.iLightBox');});else{vars.overlay.remove();vars.BODY.removeClass('ilightbox-noscroll').off('.iLightBox');}
var fadeOuts=[vars.toolbar,vars.holder,vars.nextPhoto,vars.prevPhoto,vars.nextButton,vars.prevButton,vars.loader,vars.thumbnails];$.each(fadeOuts,function(i,element){element.removeAttr('style').remove();});vars.dontGenerateThumbs=vars.isInFullScreen=false;window.iLightBox=null;if(opts.linkId){vars.hashLock=true;removeHash();setTimeout(function(){vars.hashLock=false;},55);}
if(typeof opts.callback.onHide=='function')opts.callback.onHide.call(iL,iL.ui);},repositionPhoto:function(){var iL=this,vars=iL.vars,opts=iL.options,path=opts.path.toLowerCase(),viewport=getViewport(),winWidth=viewport.width,winHeight=viewport.height;if(viewport.width<UNCODE.mediaQuery)opts.styles.nextOffsetX=0;var thumbsOffsetW=(vars.isInFullScreen&&opts.fullAlone||vars.isMobile)?0:((path=='horizontal')?0:vars.thumbnails.outerWidth()),thumbsOffsetH=vars.isMobile?vars.toolbar.outerHeight():((vars.isInFullScreen&&opts.fullAlone)?0:((path=='horizontal')?vars.thumbnails.outerHeight():0)),width=(vars.isInFullScreen&&opts.fullAlone)?winWidth:(winWidth-(opts.styles.pageOffsetX)),height=(vars.isInFullScreen&&opts.fullAlone)?winHeight:(winHeight-(opts.styles.pageOffsetY)),offsetW=(path=='horizontal')?parseInt((iL.items[vars.next]||iL.items[vars.prev])?((opts.styles.nextOffsetX+ opts.styles.prevOffsetX))*2:(((width/10)<=30)?30:(width/10))):parseInt(((width/10)<=30)?30:(width/10))+ thumbsOffsetW,offsetH=(path=='horizontal')?parseInt(((height/10)<=30)?30:(height/10))+ thumbsOffsetH:parseInt((iL.items[vars.next]||iL.items[vars.prev])?((opts.styles.nextOffsetX+ opts.styles.prevOffsetX))*2:(((height/10)<=30)?30:(height/10)));var elObject={type:'current',width:width,height:height,item:iL.items[vars.current],offsetW:offsetW,offsetH:offsetH,thumbsOffsetW:thumbsOffsetW,thumbsOffsetH:thumbsOffsetH,animate:arguments.length,holder:vars.holder};iL.repositionEl(elObject);if(iL.items[vars.next]){elObject=$.extend(elObject,{type:'next',item:iL.items[vars.next],offsetX:(viewport.width>UNCODE.mediaQuery)?opts.styles.nextOffsetX:0,offsetY:opts.styles.nextOffsetY,holder:vars.nextPhoto});iL.repositionEl(elObject);}
if(iL.items[vars.prev]){elObject=$.extend(elObject,{type:'prev',item:iL.items[vars.prev],offsetX:(viewport.width>UNCODE.mediaQuery)?opts.styles.prevOffsetX:0,offsetY:opts.styles.prevOffsetY,holder:vars.prevPhoto});iL.repositionEl(elObject);}
var loaderCss=(path=="horizontal")?{left:parseInt((width/2)-(vars.loader.outerWidth()/ 2))
}:{top:parseInt((height/2)-(vars.loader.outerHeight()/ 2))
};vars.loader.css(loaderCss);},repositionEl:function(obj){var iL=this,vars=iL.vars,opts=iL.options,path=opts.path.toLowerCase(),widthAvail=(obj.type=='current')?((vars.isInFullScreen&&opts.fullAlone)?obj.width:(obj.width- obj.offsetW)):(obj.width- obj.offsetW),heightAvail=(obj.type=='current')?((vars.isInFullScreen&&opts.fullAlone)?obj.height:(obj.height- obj.offsetH)):(obj.height- obj.offsetH),itemParent=obj.item,item=obj.item.options,holder=obj.holder,offsetX=obj.offsetX||0,offsetY=obj.offsetY||0,thumbsOffsetW=obj.thumbsOffsetW,thumbsOffsetH=obj.thumbsOffsetH;if(obj.type=='current'){if(typeof item.width=='number'&&item.width)widthAvail=((vars.isInFullScreen&&opts.fullAlone)&&(opts.fullStretchTypes.indexOf(itemParent.type)!=-1||item.fullViewPort||opts.fullViewPort))?widthAvail:((item.width>widthAvail)?widthAvail:item.width);if(typeof item.height=='number'&&item.height)heightAvail=((vars.isInFullScreen&&opts.fullAlone)&&(opts.fullStretchTypes.indexOf(itemParent.type)!=-1||item.fullViewPort||opts.fullViewPort))?heightAvail:((item.height>heightAvail)?heightAvail:item.height);}else{if(typeof item.width=='number'&&item.width)widthAvail=(item.width>widthAvail)?widthAvail:item.width;if(typeof item.height=='number'&&item.height)heightAvail=(item.height>heightAvail)?heightAvail:item.height;}
heightAvail=parseInt(heightAvail- $('.ilightbox-inner-toolbar',holder).outerHeight());var width=(typeof item.width=='string'&&item.width.indexOf('%')!=-1)?percentToValue(parseInt(item.width.replace('%','')),obj.width):holder.data('naturalWidth'),height=(typeof item.height=='string'&&item.height.indexOf('%')!=-1)?percentToValue(parseInt(item.height.replace('%','')),obj.height):holder.data('naturalHeight');var dims=((typeof item.width=='string'&&item.width.indexOf('%')!=-1||typeof item.height=='string'&&item.height.indexOf('%')!=-1)?{width:width,height:height}:iL.getNewDimenstions(widthAvail,heightAvail,width,height)),newDims=$.extend({},dims,{});if(obj.type=='prev'||obj.type=='next')
width=parseInt(dims.width*((obj.type=='next')?opts.styles.nextScale:opts.styles.prevScale)),height=parseInt(dims.height*((obj.type=='next')?opts.styles.nextScale:opts.styles.prevScale));else
width=dims.width,height=dims.height;var widthDiff=parseInt((getPixel(holder,'padding-left')+ getPixel(holder,'padding-right')+ getPixel(holder,'border-left-width')+ getPixel(holder,'border-right-width'))/ 2),
heightDiff=parseInt((getPixel(holder,'padding-top')+ getPixel(holder,'padding-bottom')+ getPixel(holder,'border-top-width')+ getPixel(holder,'border-bottom-width')+ $('.ilightbox-inner-toolbar',holder).outerHeight())/ 2);
if(obj.item.caption&&!isNaN(width)&&!isNaN(height)&&UNCODE.wwidth>UNCODE.mediaQuery){var objRatio=width/height;height=height- vars.captionHeight;width=height*objRatio;}
switch(obj.type){case'current':var top=parseInt((obj.height/2)-(height/2)- heightDiff-(thumbsOffsetH/2)),left=parseInt((obj.width/2)-(width/2)- widthDiff-(thumbsOffsetW/2));break;case'next':var top=(path=='horizontal')?parseInt((obj.height/2)- offsetY-(height/2)- heightDiff-(thumbsOffsetH/2)):parseInt(obj.height- offsetX- heightDiff-(thumbsOffsetH/2)),left=(path=='horizontal')?parseInt(obj.width- offsetX- widthDiff-(thumbsOffsetW/2)):parseInt((obj.width/2)-(width/2)- widthDiff- offsetY-(thumbsOffsetW/2));break;case'prev':var top=(path=='horizontal')?parseInt((obj.height/2)- offsetY-(height/2)- heightDiff-(thumbsOffsetH/2)):parseInt(offsetX- heightDiff- height-(thumbsOffsetH/2)),left=(path=='horizontal')?parseInt(offsetX- widthDiff- width-(thumbsOffsetW/2)):parseInt((obj.width/2)- offsetY-(width/2)- widthDiff-(thumbsOffsetW/2));break;}
holder.data('offset',{top:top,left:left,newDims:newDims,diff:{W:widthDiff,H:heightDiff},thumbsOffset:{W:thumbsOffsetW,H:thumbsOffsetH},object:obj});if(obj.animate>0&&opts.effects.reposition){holder.css(transform,gpuAcceleration).stop().animate({top:top,left:left},opts.effects.repositionSpeed,'easeOutCirc',function(){holder.css(transform,'');});$('div.ilightbox-container',holder).stop().animate({width:width,height:height},opts.effects.repositionSpeed,'easeOutCirc');$('div.ilightbox-inner-toolbar',holder).stop().animate({width:width},opts.effects.repositionSpeed,'easeOutCirc',function(){$(this).css('overflow','visible');});}else{holder.css({top:top,left:left});$('div.ilightbox-container',holder).css({width:width,height:height});$('div.ilightbox-inner-toolbar',holder).css({width:width});}},resume:function(priority){var iL=this,vars=iL.vars,opts=iL.options;if(!opts.slideshow.pauseTime||opts.controls.slideshow&&vars.total<=1||priority<vars.isPaused){return;}
vars.isPaused=0;if(vars.cycleID){vars.cycleID=clearTimeout(vars.cycleID);}
vars.cycleID=setTimeout(function(){if(vars.current==vars.total- 1)iL.goTo(0);else iL.moveTo('next');},opts.slideshow.pauseTime);},pause:function(priority){var iL=this,vars=iL.vars,opts=iL.options;if(priority<vars.isPaused){return;}
vars.isPaused=priority||100;if(vars.cycleID){vars.cycleID=clearTimeout(vars.cycleID);}},resetCycle:function(){var iL=this,vars=iL.vars,opts=iL.options;if(opts.controls.slideshow&&vars.cycleID&&!vars.isPaused){iL.resume();}},getNewDimenstions:function(width,height,width_old,height_old,thumb){var iL=this;if(!width)factor=height/height_old;else if(!height)factor=width/width_old;else factor=min(width/width_old,height/height_old);if(!thumb){if(factor>iL.options.maxScale)factor=iL.options.maxScale;else if(factor<iL.options.minScale)factor=iL.options.minScale;}
var final_width=(iL.options.keepAspectRatio)?round(width_old*factor):width,final_height=(iL.options.keepAspectRatio)?round(height_old*factor):height;return{width:final_width,height:final_height,ratio:factor};},setOption:function(options){var iL=this;iL.options=$.extend(true,iL.options,options||{});iL.refresh();},availPlugins:function(){var iL=this,testEl=document.createElement("video");iL.plugins={flash:false,quicktime:(parseInt(PluginDetect.getVersion("QuickTime"))>=0)?true:false,html5H264:!!(testEl.canPlayType&&testEl.canPlayType('video/mp4').replace(/no/,'')),html5WebM:!!(testEl.canPlayType&&testEl.canPlayType('video/webm').replace(/no/,'')),html5Vorbis:!!(testEl.canPlayType&&testEl.canPlayType('video/ogg').replace(/no/,'')),html5QuickTime:!!(testEl.canPlayType&&testEl.canPlayType('video/quicktime').replace(/no/,''))};},addContent:function(element,obj){var iL=this,el;switch(obj.type){case'video':var HTML5=false,videoType=obj.videoType,html5video=obj.options.html5video;if(((videoType=='video/mp4'||obj.ext=='mp4'||obj.ext=='m4v')||html5video.h264)&&iL.plugins.html5H264)
obj.ext='mp4',obj.URL=html5video.h264||obj.URL;else if(html5video.webm&&iL.plugins.html5WebM)
obj.ext='webm',obj.URL=html5video.webm||obj.URL;else if(html5video.ogg&&iL.plugins.html5Vorbis)
obj.ext='ogv',obj.URL=html5video.ogg||obj.URL;if(iL.plugins.html5H264&&(videoType=='video/mp4'||obj.ext=='mp4'||obj.ext=='m4v'))HTML5=true,videoType="video/mp4";else if(iL.plugins.html5WebM&&(videoType=='video/webm'||obj.ext=='webm'))HTML5=true,videoType="video/webm";else if(iL.plugins.html5Vorbis&&(videoType=='video/ogg'||obj.ext=='ogv'))HTML5=true,videoType="video/ogg";else if(iL.plugins.html5QuickTime&&(videoType=='video/quicktime'||obj.ext=='mov'||obj.ext=='qt'))HTML5=true,videoType="video/quicktime";if(HTML5){el=$('<video />',{"width":"100%","height":"100%","preload":html5video.preload,"autoplay":html5video.autoplay,"poster":html5video.poster,"controls":html5video.controls}).append($('<source />',{"src":obj.URL,"type":videoType}));}else{if(!iL.plugins.quicktime)el=$('<span />',{"class":"ilightbox-alert",html:iL.options.errors.missingPlugin.replace('{pluginspage}',pluginspages.quicktime).replace('{type}','QuickTime')});else{el=$('<object />',{"type":"video/quicktime","pluginspage":pluginspages.quicktime}).attr({"data":obj.URL,"width":"100%","height":"100%"}).append($('<param />',{"name":"src","value":obj.URL})).append($('<param />',{"name":"autoplay","value":"false"})).append($('<param />',{"name":"loop","value":"false"})).append($('<param />',{"name":"scale","value":"tofit"}));if(browser.msie)el=QT_GenerateOBJECTText(obj.URL,'100%','100%','','SCALE','tofit','AUTOPLAY','false','LOOP','false');}}
break;case'flash':if(!iL.plugins.flash)el=$('<span />',{"class":"ilightbox-alert",html:iL.options.errors.missingPlugin.replace('{pluginspage}',pluginspages.flash).replace('{type}','Adobe Flash player')});else{var flashvars="",i=0;if(obj.options.flashvars)$.each(obj.options.flashvars,function(k,v){if(i!=0)flashvars+="&";flashvars+=k+"="+ encodeURIComponent(v);i++;});else flashvars=null;el=$('<embed />').attr({"type":"application/x-shockwave-flash","src":obj.URL,"width":(typeof obj.options.width=='number'&&obj.options.width&&iL.options.minScale=='1'&&iL.options.maxScale=='1')?obj.options.width:"100%","height":(typeof obj.options.height=='number'&&obj.options.height&&iL.options.minScale=='1'&&iL.options.maxScale=='1')?obj.options.height:"100%","quality":"high","bgcolor":"#000000","play":"true","loop":"true","menu":"true","wmode":"transparent","scale":"showall","allowScriptAccess":"always","allowFullScreen":"true","flashvars":flashvars,"fullscreen":"yes"});}
break;case'iframe':el=$('<iframe />').attr({"width":(typeof obj.options.width=='number'&&obj.options.width&&iL.options.minScale=='1'&&iL.options.maxScale=='1')?obj.options.width:"100%","height":(typeof obj.options.height=='number'&&obj.options.height&&iL.options.minScale=='1'&&iL.options.maxScale=='1')?obj.options.height:"100%",src:obj.URL,frameborder:0,'hspace':0,'vspace':0,'scrolling':supportTouch?'auto':'scroll','webkitAllowFullScreen':'','mozallowfullscreen':'','allowFullScreen':''});break;case'inline':el=$('<div class="ilightbox-wrapper"></div>').html($(obj.URL).clone(true));break;case'html':var object=obj.URL,el;if(object[0].nodeName){el=$('<div class="ilightbox-wrapper"></div>').html(object);}else{var dom=$(obj.URL),html=(dom.selector)?$('<div>'+ dom+'</div>'):dom;el=$('<div class="ilightbox-wrapper"></div>').html(html);}
break;}
$('div.ilightbox-container',element).empty().html(el);if(el[0].tagName.toLowerCase()==='video'&&browser.webkit)setTimeout(function(){var src=el[0].currentSrc+'?'+ floor(random()*30000);el[0].currentSrc=src;el[0].src=src;});return el;},ogpRecognition:function(obj,callback){var iL=this,url=obj.URL;iL.showLoader();doAjax(url,function(data){iL.hideLoader();if(data){var object=new Object();object.length=false,object.url=data.url;if(data.status==200){var result=data.results,type=result.type,source=result.source;object.source=source.src,object.width=source.width&&parseInt(source.width)||0,object.height=source.height&&parseInt(source.height)||0,object.type=type,object.thumbnail=source.thumbnail||result.images[0],object.html5video=result.html5video||{},object.length=true;if(source.type=='application/x-shockwave-flash')object.type="flash";else if(source.type.indexOf("video/")!=-1)object.type="video";else if(source.type.indexOf("/html")!=-1)object.type="iframe";else if(source.type.indexOf("image/")!=-1)object.type="image";}else if(typeof data.response!='undefined')
throw data.response;callback.call(this,object.length?object:false);}});},hashChangeHandler:function(url){var iL=this,vars=iL.vars,opts=iL.options,URL=url||window.location.href,hash=parseURI(URL).hash,split=hash.split('/'),index=split[1];if(vars.hashLock||('#'+ opts.linkId!=split[0]&&hash.length>1))return;if(index){var target=split[1]||0;if(iL.items[target]){var overlay=$('.ilightbox-overlay');if(overlay.length&&overlay.attr('linkid')==opts.linkId){iL.goTo(target);}else{iL.itemsObject[target].trigger(supportTouch?'itap':'click');}}else{var overlay=$('.ilightbox-overlay');if(overlay.length)iL.closeAction();}}else{var overlay=$('.ilightbox-overlay');if(overlay.length)iL.closeAction();}}};function getPixel($element,property){return parseInt($element.css(property),10)||0;}
function within(number,min,max){return number<min?min:number>max?max:number;}
function getViewport(){var e=window,a='inner';if(!('innerWidth'in window)){a='client';e=document.documentElement||document.body;}
return{width:e[a+'Width'],height:e[a+'Height']}}
function removeHash(){var scroll=getScrollXY();window.location.hash="";window.scrollTo(scroll.x,scroll.y);}
function doAjax(url,callback){var url="http://ilightbox.net/getSource/jsonp.php?url="+ encodeURIComponent(url).replace(/!/g,'%21').replace(/'/g,'%27').replace(/\(/g,'%28').replace(/\)/g,'%29').replace(/\*/g,'%2A');$.ajax({url:url,dataType:'jsonp'});iLCallback=function(data){callback.call(this,data);};}
function findImageInElement(element){var elements=$('*',element),imagesArr=new Array();elements.each(function(){var url="",element=this;if($(element).css("background-image")!="none"){url=$(element).css("background-image");}else if(typeof($(element).attr("src"))!="undefined"&&element.nodeName.toLowerCase()=="img"){url=$(element).attr("src");}
if(url.indexOf("gradient")==-1){url=url.replace(/url\(\"/g,"");url=url.replace(/url\(/g,"");url=url.replace(/\"\)/g,"");url=url.replace(/\)/g,"");var urls=url.split(",");for(var i=0;i<urls.length;i++){if(urls[i].length>0&&$.inArray(urls[i],imagesArr)==-1){var extra="";if(browser.msie&&browser.version<9){extra="?"+ floor(random()*3000);}
imagesArr.push(urls[i]+ extra);}}}});return imagesArr;}
function getExtension(URL){if(URL!==null){var ext=URL.split('.').pop().toLowerCase(),extra=ext.indexOf('?')!==-1?ext.split('?').pop():'';return ext.replace(extra,'');}}
function getTypeByExtension(URL){var type,ext=getExtension(URL);if(extensions.image.indexOf(ext)!==-1)type='image';else if(extensions.flash.indexOf(ext)!==-1)type='flash';else if(extensions.video.indexOf(ext)!==-1)type='video';else type='iframe';return type;}
function percentToValue(percent,total){return parseInt((total/100)*percent);}
function parseURI(url){var m=String(url).replace(/^\s+|\s+$/g,'').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);return(m?{href:m[0]||'',protocol:m[1]||'',authority:m[2]||'',host:m[3]||'',hostname:m[4]||'',port:m[5]||'',pathname:m[6]||'',search:m[7]||'',hash:m[8]||''}:null);}
function absolutizeURI(base,href){var iL=this;function removeDotSegments(input){var output=[];input.replace(/^(\.\.?(\/|$))+/,'').replace(/\/(\.(\/|$))+/g,'/').replace(/\/\.\.$/,'/../').replace(/\/?[^\/]*/g,function(p){if(p==='/..'){output.pop();}else{output.push(p);}});return output.join('').replace(/^\//,input.charAt(0)==='/'?'/':'');}
href=parseURI(href||'');base=parseURI(base||'');return!href||!base?null:(href.protocol||base.protocol)+
(href.protocol||href.authority?href.authority:base.authority)+
removeDotSegments(href.protocol||href.authority||href.pathname.charAt(0)==='/'?href.pathname:(href.pathname?((base.authority&&!base.pathname?'/':'')+ base.pathname.slice(0,base.pathname.lastIndexOf('/')+ 1)+ href.pathname):base.pathname))+
(href.protocol||href.authority||href.pathname?href.search:(href.search||base.search))+
href.hash;}
function version_compare(v1,v2,operator){this.php_js=this.php_js||{};this.php_js.ENV=this.php_js.ENV||{};var i=0,x=0,compare=0,vm={'dev':-6,'alpha':-5,'a':-5,'beta':-4,'b':-4,'RC':-3,'rc':-3,'#':-2,'p':1,'pl':1},prepVersion=function(v){v=(''+ v).replace(/[_\-+]/g,'.');v=v.replace(/([^.\d]+)/g,'.$1.').replace(/\.{2,}/g,'.');return(!v.length?[-8]:v.split('.'));},numVersion=function(v){return!v?0:(isNaN(v)?vm[v]||-7:parseInt(v,10));};v1=prepVersion(v1);v2=prepVersion(v2);x=max(v1.length,v2.length);for(i=0;i<x;i++){if(v1[i]==v2[i]){continue;}
v1[i]=numVersion(v1[i]);v2[i]=numVersion(v2[i]);if(v1[i]<v2[i]){compare=-1;break;}else if(v1[i]>v2[i]){compare=1;break;}}
if(!operator){return compare;}
switch(operator){case'>':case'gt':return(compare>0);case'>=':case'ge':return(compare>=0);case'<=':case'le':return(compare<=0);case'==':case'=':case'eq':return(compare===0);case'<>':case'!=':case'ne':return(compare!==0);case'':case'<':case'lt':return(compare<0);default:return null;}}
$.fn.iLightBox=function(){var args=arguments,opt=($.isPlainObject(args[0]))?args[0]:args[1],items=($.isArray(args[0])||typeof args[0]=='string')?args[0]:args[1];if(!opt)opt={};var options=$.extend(true,{attr:'href',path:'vertical',skin:'dark',linkId:false,infinite:false,startFrom:0,randomStart:false,keepAspectRatio:true,maxScale:1,minScale:.2,innerToolbar:false,smartRecognition:false,mobileOptimizer:true,fullAlone:true,fullViewPort:null,fullStretchTypes:'flash, video',overlay:{blur:true,opacity:.85},controls:{arrows:false,slideshow:false,toolbar:true,fullscreen:true,thumbnail:true,keyboard:true,mousewheel:true,swipe:true},keyboard:{left:true,right:true,up:true,down:true,esc:true,shift_enter:true},show:{effect:true,speed:300,title:true},hide:{effect:true,speed:300},caption:{start:true,show:'mouseenter',hide:'mouseleave'},social:{start:true,show:'mouseenter',hide:'mouseleave',buttons:false},styles:{pageOffsetX:0,pageOffsetY:0,nextOffsetX:45,nextOffsetY:0,nextOpacity:1,nextScale:1,prevOffsetX:45,prevOffsetY:0,prevOpacity:1,prevScale:1},thumbnails:{maxWidth:120,maxHeight:80,normalOpacity:1,activeOpacity:.6},effects:{reposition:true,repositionSpeed:200,switchSpeed:500,loadedFadeSpeed:180,fadeSpeed:200},slideshow:{pauseTime:5000,pauseOnHover:false,startPaused:true},text:{close:"Press Esc to close",enterFullscreen:"Enter Fullscreen (Shift+Enter)",exitFullscreen:"Exit Fullscreen (Shift+Enter)",slideShow:"Slideshow",next:"Next",previous:"Previous"},errors:{loadImage:"An error occurred when trying to load photo.",loadContents:"An error occurred when trying to load contents.",missingPlugin:"The content your are attempting to view requires the <a href='{pluginspage}' target='_blank'>{type} plugin<\/a>."},ajaxSetup:{url:'',beforeSend:function(jqXHR,settings){},cache:false,complete:function(jqXHR,textStatus){},crossDomain:false,error:function(jqXHR,textStatus,errorThrown){},success:function(data,textStatus,jqXHR){},global:true,ifModified:false,username:null,password:null,type:'GET'},callback:{}},opt);var instant=($.isArray(items)||typeof items=='string')?true:false;items=$.isArray(items)?items:new Array();if(typeof args[0]=='string')items[0]=args[0];if(version_compare($.fn.jquery,'1.8','>=')){var iLB=new iLightBox($(this),options,items,instant);return{close:function(){iLB.closeAction();},fullscreen:function(){iLB.fullScreenAction();},moveNext:function(){iLB.moveTo('next');},movePrev:function(){iLB.moveTo('prev');},goTo:function(index){iLB.goTo(index);},refresh:function(){iLB.refresh();},reposition:function(){(arguments.length>0)?iLB.repositionPhoto(true):iLB.repositionPhoto();},setOption:function(options){iLB.setOption(options);},destroy:function(){iLB.closeAction();iLB.dispatchItemsEvents();}};}else{throw"The jQuery version that was loaded is too old. iLightBox requires jQuery 1.8+";}};$.iLightBox=function(){return $.fn.iLightBox(arguments[0],arguments[1]);};$.extend($.easing,{easeInCirc:function(x,t,b,c,d){return-c*(sqrt(1-(t/=d)*t)- 1)+ b;},easeOutCirc:function(x,t,b,c,d){return c*sqrt(1-(t=t/d- 1)*t)+ b;},easeInOutCirc:function(x,t,b,c,d){if((t/=d/2)<1)return-c/2*(sqrt(1- t*t)- 1)+ b;return c/2*(sqrt(1-(t-=2)*t)+ 1)+ b;}});function getScrollXY(){var scrOfX=0,scrOfY=0;if(typeof(window.pageYOffset)=='number'){scrOfY=window.pageYOffset;scrOfX=window.pageXOffset;}else if(document.body&&(document.body.scrollLeft||document.body.scrollTop)){scrOfY=document.body.scrollTop;scrOfX=document.body.scrollLeft;}else if(document.documentElement&&(document.documentElement.scrollLeft||document.documentElement.scrollTop)){scrOfY=document.documentElement.scrollTop;scrOfX=document.documentElement.scrollLeft;}
return{x:scrOfX,y:scrOfY};}
(function(){$.each(("touchstart touchmove touchend "+"tap taphold "+"swipe swipeleft swiperight "+"scrollstart scrollstop").split(" "),function(i,name){$.fn[name]=function(fn){return fn?this.bind(name,fn):this.trigger(name);};});var tapSettings={startEvent:'touchstart.iTap',endEvent:'touchend.iTap'};$.event.special.itap={setup:function(){var self=this,$self=$(this),start,stop;$self.bind(tapSettings.startEvent,function(event){start=getScrollXY();$self.one(tapSettings.endEvent,function(event){stop=getScrollXY();var orgEvent=event||window.event;event=$.event.fix(orgEvent);event.type="itap";if((start&&stop)&&(start.x==stop.x&&start.y==stop.y))($.event.dispatch||$.event.handle).call(self,event);start=stop=undefined;});});},teardown:function(){$(this).unbind(tapSettings.startEvent);}};}());(function(){fullScreenApi={supportsFullScreen:false,isFullScreen:function(){return false;},requestFullScreen:function(){},cancelFullScreen:function(){},fullScreenEventName:'',prefix:''},browserPrefixes='webkit moz o ms khtml'.split(' ');if(typeof document.cancelFullScreen!='undefined'){fullScreenApi.supportsFullScreen=true;}else{for(var i=0,il=browserPrefixes.length;i<il;i++){fullScreenApi.prefix=browserPrefixes[i];if(typeof document[fullScreenApi.prefix+'CancelFullScreen']!='undefined'){fullScreenApi.supportsFullScreen=true;break;}}}
if(fullScreenApi.supportsFullScreen){fullScreenApi.fullScreenEventName=fullScreenApi.prefix+'fullscreenchange';fullScreenApi.isFullScreen=function(){switch(this.prefix){case'':return document.fullScreen;case'webkit':return document.webkitIsFullScreen;default:return document[this.prefix+'FullScreen'];}}
fullScreenApi.requestFullScreen=function(el){return(this.prefix==='')?el.requestFullScreen():el[this.prefix+'RequestFullScreen']();}
fullScreenApi.cancelFullScreen=function(el){return(this.prefix==='')?document.cancelFullScreen():document[this.prefix+'CancelFullScreen']();}}}());(function(){function uaMatch(ua){ua=ua.toLowerCase();var match=/(chrome)[ \/]([\w.]+)/.exec(ua)||/(webkit)[ \/]([\w.]+)/.exec(ua)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)||/(msie) ([\w.]+)/.exec(ua)||ua.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)||[];return{browser:match[1]||"",version:match[2]||"0"};}
var matched=uaMatch(navigator.userAgent);browser={};if(matched.browser){browser[matched.browser]=true;browser.version=matched.version;}
if(browser.chrome){browser.webkit=true;}else if(browser.webkit){browser.safari=true;}}());(function(){var prefixes=['','webkit','moz','ms','o'];var el=document.createElement('div');function testProp(prop){for(var p=0,pl=prefixes.length;p<pl;p++){var prefixedProp=prefixes[p]?prefixes[p]+ prop.charAt(0).toUpperCase()+ prop.slice(1):prop;if(el.style[prefixedProp]!==undefined){return prefixedProp;}}}
transform=testProp('transform')||'';gpuAcceleration=testProp('perspective')?'translateZ(0) ':'';}());var PluginDetect={version:"0.7.9",name:"PluginDetect",handler:function(c,b,a){return function(){c(b,a)}},openTag:"<",isDefined:function(b){return typeof b!="undefined"},isArray:function(b){return(/array/i).test(Object.prototype.toString.call(b))},isFunc:function(b){return typeof b=="function"},isString:function(b){return typeof b=="string"},isNum:function(b){return typeof b=="number"},isStrNum:function(b){return(typeof b=="string"&&(/\d/).test(b))},getNumRegx:/[\d][\d\.\_,-]*/,splitNumRegx:/[\.\_,-]/g,getNum:function(b,c){var d=this,a=d.isStrNum(b)?(d.isDefined(c)?new RegExp(c):d.getNumRegx).exec(b):null;return a?a[0]:null},compareNums:function(h,f,d){var e=this,c,b,a,g=parseInt;if(e.isStrNum(h)&&e.isStrNum(f)){if(e.isDefined(d)&&d.compareNums){return d.compareNums(h,f)}c=h.split(e.splitNumRegx);b=f.split(e.splitNumRegx);for(a=0;a<min(c.length,b.length);a++){if(g(c[a],10)>g(b[a],10)){return 1}if(g(c[a],10)<g(b[a],10)){return-1}}}return 0},formatNum:function(b,c){var d=this,a,e;if(!d.isStrNum(b)){return null}if(!d.isNum(c)){c=4}c--;e=b.replace(/\s/g,"").split(d.splitNumRegx).concat(["0","0","0","0"]);for(a=0;a<4;a++){if(/^(0+)(.+)$/.test(e[a])){e[a]=RegExp.$2}if(a>c||!(/\d/).test(e[a])){e[a]="0"}}return e.slice(0,4).join(",")},$$hasMimeType:function(a){return function(c){if(!a.isIE&&c){var f,e,b,d=a.isArray(c)?c:(a.isString(c)?[c]:[]);for(b=0;b<d.length;b++){if(a.isString(d[b])&&/[^\s]/.test(d[b])){f=navigator.mimeTypes[d[b]];e=f?f.enabledPlugin:0;if(e&&(e.name||e.description)){return f}}}}return null}},findNavPlugin:function(l,e,c){var j=this,h=new RegExp(l,"i"),d=(!j.isDefined(e)||e)?/\d/:0,k=c?new RegExp(c,"i"):0,a=navigator.plugins,g="",f,b,m;for(f=0;f<a.length;f++){m=a[f].description||g;b=a[f].name||g;if((h.test(m)&&(!d||d.test(RegExp.leftContext+RegExp.rightContext)))||(h.test(b)&&(!d||d.test(RegExp.leftContext+RegExp.rightContext)))){if(!k||!(k.test(m)||k.test(b))){return a[f]}}}return null},getMimeEnabledPlugin:function(k,m,c){var e=this,f,b=new RegExp(m,"i"),h="",g=c?new RegExp(c,"i"):0,a,l,d,j=e.isString(k)?[k]:k;for(d=0;d<j.length;d++){if((f=e.hasMimeType(j[d]))&&(f=f.enabledPlugin)){l=f.description||h;a=f.name||h;if(b.test(l)||b.test(a)){if(!g||!(g.test(l)||g.test(a))){return f}}}}return 0},getPluginFileVersion:function(f,b){var h=this,e,d,g,a,c=-1;if(h.OS>2||!f||!f.version||!(e=h.getNum(f.version))){return b}if(!b){return e}e=h.formatNum(e);b=h.formatNum(b);d=b.split(h.splitNumRegx);g=e.split(h.splitNumRegx);for(a=0;a<d.length;a++){if(c>-1&&a>c&&d[a]!="0"){return b}if(g[a]!=d[a]){if(c==-1){c=a}if(d[a]!="0"){return b}}}return e},AXO:window.ActiveXObject,getAXO:function(a){var f=null,d,b=this,c={};try{f=new b.AXO(a)}catch(d){}return f},convertFuncs:function(f){var a,g,d,b=/^[\$][\$]/,c=this;for(a in f){if(b.test(a)){try{g=a.slice(2);if(g.length>0&&!f[g]){f[g]=f[a](f);delete f[a]}}catch(d){}}}},initObj:function(e,b,d){var a,c;if(e){if(e[b[0]]==1||d){for(a=0;a<b.length;a=a+2){e[b[a]]=b[a+1]}}for(a in e){c=e[a];if(c&&c[b[0]]==1){this.initObj(c,b)}}}},initScript:function(){var d=this,a=navigator,h,i=document,l=a.userAgent||"",j=a.vendor||"",b=a.platform||"",k=a.product||"";d.initObj(d,["$",d]);for(h in d.Plugins){if(d.Plugins[h]){d.initObj(d.Plugins[h],["$",d,"$$",d.Plugins[h]],1)}}d.convertFuncs(d);d.OS=100;if(b){var g=["Win",1,"Mac",2,"Linux",3,"FreeBSD",4,"iPhone",21.1,"iPod",21.2,"iPad",21.3,"Win.*CE",22.1,"Win.*Mobile",22.2,"Pocket\\s*PC",22.3,"",100];for(h=g.length-2;h>=0;h=h-2){if(g[h]&&new RegExp(g[h],"i").test(b)){d.OS=g[h+1];break}}};d.head=i.getElementsByTagName("head")[0]||i.getElementsByTagName("body")[0]||i.body||null;d.isIE=new Function("return/*@cc_on!@*/!1")();d.verIE=d.isIE&&(/MSIE\s*(\d+\.?\d*)/i).test(l)?parseFloat(RegExp.$1,10):null;d.verIEfull=null;d.docModeIE=null;if(d.isIE){var f,n,c=document.createElement("div");try{c.style.behavior="url(#default#clientcaps)";d.verIEfull=(c.getComponentVersion("{89820200-ECBD-11CF-8B85-00AA005B4383}","componentid")).replace(/,/g,".")}catch(f){}n=parseFloat(d.verIEfull||"0",10);d.docModeIE=i.documentMode||((/back/i).test(i.compatMode||"")?5:n)||d.verIE;d.verIE=n||d.docModeIE};d.ActiveXEnabled=false;if(d.isIE){var h,m=["Msxml2.XMLHTTP","Msxml2.DOMDocument","Microsoft.XMLDOM","ShockwaveFlash.ShockwaveFlash","TDCCtl.TDCCtl","Shell.UIHelper","Scripting.Dictionary","wmplayer.ocx"];for(h=0;h<m.length;h++){if(d.getAXO(m[h])){d.ActiveXEnabled=true;break}}};d.isGecko=(/Gecko/i).test(k)&&(/Gecko\s*\/\s*\d/i).test(l);d.verGecko=d.isGecko?d.formatNum((/rv\s*\:\s*([\.\,\d]+)/i).test(l)?RegExp.$1:"0.9"):null;d.isChrome=(/Chrome\s*\/\s*(\d[\d\.]*)/i).test(l);d.verChrome=d.isChrome?d.formatNum(RegExp.$1):null;d.isSafari=((/Apple/i).test(j)||(!j&&!d.isChrome))&&(/Safari\s*\/\s*(\d[\d\.]*)/i).test(l);d.verSafari=d.isSafari&&(/Version\s*\/\s*(\d[\d\.]*)/i).test(l)?d.formatNum(RegExp.$1):null;d.isOpera=(/Opera\s*[\/]?\s*(\d+\.?\d*)/i).test(l);d.verOpera=d.isOpera&&((/Version\s*\/\s*(\d+\.?\d*)/i).test(l)||1)?parseFloat(RegExp.$1,10):null;d.addWinEvent("load",d.handler(d.runWLfuncs,d))},init:function(d){var c=this,b,d,a={status:-3,plugin:0};if(!c.isString(d)){return a}if(d.length==1){c.getVersionDelimiter=d;return a}d=d.toLowerCase().replace(/\s/g,"");b=c.Plugins[d];if(!b||!b.getVersion){return a}a.plugin=b;if(!c.isDefined(b.installed)){b.installed=null;b.version=null;b.version0=null;b.getVersionDone=null;b.pluginName=d}c.garbage=false;if(c.isIE&&!c.ActiveXEnabled&&d!=="java"){a.status=-2;return a}a.status=1;return a},fPush:function(b,a){var c=this;if(c.isArray(a)&&(c.isFunc(b)||(c.isArray(b)&&b.length>0&&c.isFunc(b[0])))){a.push(b)}},callArray:function(b){var c=this,a;if(c.isArray(b)){for(a=0;a<b.length;a++){if(b[a]===null){return}c.call(b[a]);b[a]=null}}},call:function(c){var b=this,a=b.isArray(c)?c.length:-1;if(a>0&&b.isFunc(c[0])){c[0](b,a>1?c[1]:0,a>2?c[2]:0,a>3?c[3]:0)}else{if(b.isFunc(c)){c(b)}}},getVersionDelimiter:",",$$getVersion:function(a){return function(g,d,c){var e=a.init(g),f,b,h={};if(e.status<0){return null};f=e.plugin;if(f.getVersionDone!=1){f.getVersion(null,d,c);if(f.getVersionDone===null){f.getVersionDone=1}}a.cleanup();b=(f.version||f.version0);b=b?b.replace(a.splitNumRegx,a.getVersionDelimiter):b;return b}},cleanup:function(){var a=this;if(a.garbage&&a.isDefined(window.CollectGarbage)){window.CollectGarbage()}},isActiveXObject:function(d,b){var f=this,a=false,g,c='<object width="1" height="1" style="display:none" '+d.getCodeBaseVersion(b)+">"+d.HTML+f.openTag+"/object>";if(!f.head){return a}f.head.insertBefore(document.createElement("object"),f.head.firstChild);f.head.firstChild.outerHTML=c;try{f.head.firstChild.classid=d.classID}catch(g){}try{if(f.head.firstChild.object){a=true}}catch(g){}try{if(a&&f.head.firstChild.readyState<4){f.garbage=true}}catch(g){}f.head.removeChild(f.head.firstChild);return a},codebaseSearch:function(f,b){var c=this;if(!c.ActiveXEnabled||!f){return null}if(f.BIfuncs&&f.BIfuncs.length&&f.BIfuncs[f.BIfuncs.length-1]!==null){c.callArray(f.BIfuncs)}var d,o=f.SEARCH,k={};if(c.isStrNum(b)){if(o.match&&o.min&&c.compareNums(b,o.min)<=0){return true}if(o.match&&o.max&&c.compareNums(b,o.max)>=0){return false}d=c.isActiveXObject(f,b);if(d&&(!o.min||c.compareNums(b,o.min)>0)){o.min=b}if(!d&&(!o.max||c.compareNums(b,o.max)<0)){o.max=b}return d};var e=[0,0,0,0],l=[].concat(o.digits),a=o.min?1:0,j,i,h,g,m,n=function(p,r){var q=[].concat(e);q[p]=r;return c.isActiveXObject(f,q.join(","))};if(o.max){g=o.max.split(c.splitNumRegx);for(j=0;j<g.length;j++){g[j]=parseInt(g[j],10)}if(g[0]<l[0]){l[0]=g[0]}}if(o.min){m=o.min.split(c.splitNumRegx);for(j=0;j<m.length;j++){m[j]=parseInt(m[j],10)}if(m[0]>e[0]){e[0]=m[0]}}if(m&&g){for(j=1;j<m.length;j++){if(m[j-1]!=g[j-1]){break}if(g[j]<l[j]){l[j]=g[j]}if(m[j]>e[j]){e[j]=m[j]}}}if(o.max){for(j=1;j<l.length;j++){if(g[j]>0&&l[j]==0&&l[j-1]<o.digits[j-1]){l[j-1]+=1;break}}};for(j=0;j<l.length;j++){h={};for(i=0;i<20;i++){if(l[j]-e[j]<1){break}d=round((l[j]+e[j])/2);if(h["a"+d]){break}h["a"+d]=1;if(n(j,d)){e[j]=d;a=1}else{l[j]=d}}l[j]=e[j];if(!a&&n(j,e[j])){a=1};if(!a){break}};return a?e.join(","):null},addWinEvent:function(d,c){var e=this,a=window,b;if(e.isFunc(c)){if(a.addEventListener){a.addEventListener(d,c,false)}else{if(a.attachEvent){a.attachEvent("on"+d,c)}else{b=a["on"+d];a["on"+d]=e.winHandler(c,b)}}}},winHandler:function(d,c){return function(){d();if(typeof c=="function"){c()}}},WLfuncs0:[],WLfuncs:[],runWLfuncs:function(a){var b={};a.winLoaded=true;a.callArray(a.WLfuncs0);a.callArray(a.WLfuncs);if(a.onDoneEmptyDiv){a.onDoneEmptyDiv()}},winLoaded:false,$$onWindowLoaded:function(a){return function(b){if(a.winLoaded){a.call(b)}else{a.fPush(b,a.WLfuncs)}}},div:null,divID:"plugindetect",divWidth:50,pluginSize:1,emptyDiv:function(){var d=this,b,h,c,a,f,g;if(d.div&&d.div.childNodes){for(b=d.div.childNodes.length-1;b>=0;b--){c=d.div.childNodes[b];if(c&&c.childNodes){for(h=c.childNodes.length-1;h>=0;h--){g=c.childNodes[h];try{c.removeChild(g)}catch(f){}}}if(c){try{d.div.removeChild(c)}catch(f){}}}}if(!d.div){a=document.getElementById(d.divID);if(a){d.div=a}}if(d.div&&d.div.parentNode){try{d.div.parentNode.removeChild(d.div)}catch(f){}d.div=null}},DONEfuncs:[],onDoneEmptyDiv:function(){var c=this,a,b;if(!c.winLoaded){return}if(c.WLfuncs&&c.WLfuncs.length&&c.WLfuncs[c.WLfuncs.length-1]!==null){return}for(a in c){b=c[a];if(b&&b.funcs){if(b.OTF==3){return}if(b.funcs.length&&b.funcs[b.funcs.length-1]!==null){return}}}for(a=0;a<c.DONEfuncs.length;a++){c.callArray(c.DONEfuncs)}c.emptyDiv()},getWidth:function(c){if(c){var a=c.scrollWidth||c.offsetWidth,b=this;if(b.isNum(a)){return a}}return -1},getTagStatus:function(m,g,a,b){var c=this,f,k=m.span,l=c.getWidth(k),h=a.span,j=c.getWidth(h),d=g.span,i=c.getWidth(d);if(!k||!h||!d||!c.getDOMobj(m)){return -2}if(j<i||l<0||j<0||i<0||i<=c.pluginSize||c.pluginSize<1){return 0}if(l>=i){return -1}try{if(l==c.pluginSize&&(!c.isIE||c.getDOMobj(m).readyState==4)){if(!m.winLoaded&&c.winLoaded){return 1}if(m.winLoaded&&c.isNum(b)){if(!c.isNum(m.count)){m.count=b}if(b-m.count>=10){return 1}}}}catch(f){}return 0},getDOMobj:function(g,a){var f,d=this,c=g?g.span:0,b=c&&c.firstChild?1:0;try{if(b&&a){d.div.focus()}}catch(f){}return b?c.firstChild:null},setStyle:function(b,g){var f=b.style,a,d,c=this;if(f&&g){for(a=0;a<g.length;a=a+2){try{f[g[a]]=g[a+1]}catch(d){}}}},insertDivInBody:function(i,g){var f,c=this,h="pd33993399",b=null,d=g?window.top.document:window.document,a=d.getElementsByTagName("body")[0]||d.body;if(!a){try{d.write('<div id="'+h+'">.'+c.openTag+"/div>");b=d.getElementById(h)}catch(f){}}a=d.getElementsByTagName("body")[0]||d.body;if(a){a.insertBefore(i,a.firstChild);if(b){a.removeChild(b)}}},insertHTML:function(f,b,g,a,k){var l,m=document,j=this,p,o=m.createElement("span"),n,i;var c=["outlineStyle","none","borderStyle","none","padding","0px","margin","0px","visibility","visible"];var h="outline-style:none;border-style:none;padding:0px;margin:0px;visibility:visible;";if(!j.isDefined(a)){a=""}if(j.isString(f)&&(/[^\s]/).test(f)){f=f.toLowerCase().replace(/\s/g,"");p=j.openTag+f+' width="'+j.pluginSize+'" height="'+j.pluginSize+'" ';p+='style="'+h+'display:inline;" ';for(n=0;n<b.length;n=n+2){if(/[^\s]/.test(b[n+1])){p+=b[n]+'="'+b[n+1]+'" '}}p+=">";for(n=0;n<g.length;n=n+2){if(/[^\s]/.test(g[n+1])){p+=j.openTag+'param name="'+g[n]+'" value="'+g[n+1]+'" />'}}p+=a+j.openTag+"/"+f+">"}else{p=a}if(!j.div){i=m.getElementById(j.divID);if(i){j.div=i}else{j.div=m.createElement("div");j.div.id=j.divID}j.setStyle(j.div,c.concat(["width",j.divWidth+"px","height",(j.pluginSize+3)+"px","fontSize",(j.pluginSize+3)+"px","lineHeight",(j.pluginSize+3)+"px","verticalAlign","baseline","display","block"]));if(!i){j.setStyle(j.div,["position","absolute","right","0px","top","0px"]);j.insertDivInBody(j.div)}}if(j.div&&j.div.parentNode){j.setStyle(o,c.concat(["fontSize",(j.pluginSize+3)+"px","lineHeight",(j.pluginSize+3)+"px","verticalAlign","baseline","display","inline"]));try{o.innerHTML=p}catch(l){};try{j.div.appendChild(o)}catch(l){};return{span:o,winLoaded:j.winLoaded,tagName:f,outerHTML:p}}return{span:null,winLoaded:j.winLoaded,tagName:"",outerHTML:p}},Plugins:{quicktime:{mimeType:["video/quicktime","application/x-quicktimeplayer","image/x-macpaint","image/x-quicktime"],progID:"QuickTimeCheckObject.QuickTimeCheck.1",progID0:"QuickTime.QuickTime",classID:"clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",minIEver:7,HTML:'<param name="src" value="" /><param name="controller" value="false" />',getCodeBaseVersion:function(a){return'codebase="#version='+a+'"'},SEARCH:{min:0,max:0,match:0,digits:[16,128,128,0]},getVersion:function(c){var f=this,d=f.$,a=null,e=null,b;if(!d.isIE){if(d.hasMimeType(f.mimeType)){e=d.OS!=3?d.findNavPlugin("QuickTime.*Plug-?in",0):null;if(e&&e.name){a=d.getNum(e.name)}}}else{if(d.isStrNum(c)){b=c.split(d.splitNumRegx);if(b.length>3&&parseInt(b[3],10)>0){b[3]="9999"}c=b.join(",")}if(d.isStrNum(c)&&d.verIE>=f.minIEver&&f.canUseIsMin()>0){f.installed=f.isMin(c);f.getVersionDone=0;return}f.getVersionDone=1;if(!a&&d.verIE>=f.minIEver){a=f.CDBASE2VER(d.codebaseSearch(f))}if(!a){e=d.getAXO(f.progID);if(e&&e.QuickTimeVersion){a=e.QuickTimeVersion.toString(16);a=parseInt(a.charAt(0),16)+"."+parseInt(a.charAt(1),16)+"."+parseInt(a.charAt(2),16)}}}f.installed=a?1:(e?0:-1);f.version=d.formatNum(a,3)},cdbaseUpper:["7,60,0,0","0,0,0,0"],cdbaseLower:["7,50,0,0",null],cdbase2ver:[function(c,b){var a=b.split(c.$.splitNumRegx);return[a[0],a[1].charAt(0),a[1].charAt(1),a[2]].join(",")},null],CDBASE2VER:function(f){var e=this,c=e.$,b,a=e.cdbaseUpper,d=e.cdbaseLower;if(f){f=c.formatNum(f);for(b=0;b<a.length;b++){if(a[b]&&c.compareNums(f,a[b])<0&&d[b]&&c.compareNums(f,d[b])>=0&&e.cdbase2ver[b]){return e.cdbase2ver[b](e,f)}}}return f},canUseIsMin:function(){var f=this,d=f.$,b,c=f.canUseIsMin,a=f.cdbaseUpper,e=f.cdbaseLower;if(!c.value){c.value=-1;for(b=0;b<a.length;b++){if(a[b]&&d.codebaseSearch(f,a[b])){c.value=1;break}if(e[b]&&d.codebaseSearch(f,e[b])){c.value=-1;break}}}f.SEARCH.match=c.value==1?1:0;return c.value},isMin:function(c){var b=this,a=b.$;return a.codebaseSearch(b,c)?0.7:-1}},flash:{mimeType:"application/x-shockwave-flash",progID:"ShockwaveFlash.ShockwaveFlash",classID:"clsid:D27CDB6E-AE6D-11CF-96B8-444553540000",getVersion:function(){var b=function(i){if(!i){return null}var e=/[\d][\d\,\.\s]*[rRdD]{0,1}[\d\,]*/.exec(i);return e?e[0].replace(/[rRdD\.]/g,",").replace(/\s/g,""):null};var j=this,g=j.$,k,h,l=null,c=null,a=null,f,m,d;if(!g.isIE){m=g.hasMimeType(j.mimeType);if(m){f=g.getDOMobj(g.insertHTML("object",["type",j.mimeType],[],"",j));try{l=g.getNum(f.GetVariable("$version"))}catch(k){}}if(!l){d=m?m.enabledPlugin:null;if(d&&d.description){l=b(d.description)}if(l){l=g.getPluginFileVersion(d,l)}}}else{for(h=15;h>2;h--){c=g.getAXO(j.progID+"."+h);if(c){a=h.toString();break}}if(!c){c=g.getAXO(j.progID)}if(a=="6"){try{c.AllowScriptAccess="always"}catch(k){return"6,0,21,0"}}try{l=b(c.GetVariable("$version"))}catch(k){}if(!l&&a){l=a}}j.installed=l?1:-1;j.version=g.formatNum(l);return true}},shockwave:{mimeType:"application/x-director",progID:"SWCtl.SWCtl",classID:"clsid:166B1BCA-3F9C-11CF-8075-444553540000",getVersion:function(){var a=null,b=null,g,f,d=this,c=d.$;if(!c.isIE){f=c.findNavPlugin("Shockwave\\s*for\\s*Director");if(f&&f.description&&c.hasMimeType(d.mimeType)){a=c.getNum(f.description)}if(a){a=c.getPluginFileVersion(f,a)}}else{try{b=c.getAXO(d.progID).ShockwaveVersion("")}catch(g){}if(c.isString(b)&&b.length>0){a=c.getNum(b)}else{if(c.getAXO(d.progID+".8")){a="8"}else{if(c.getAXO(d.progID+".7")){a="7"}else{if(c.getAXO(d.progID+".1")){a="6"}}}}}d.installed=a?1:-1;d.version=c.formatNum(a)}},zz:0}};PluginDetect.initScript();
var gArgCountErr='The "%%" function requires an even number of arguments.\nArguments should be in the form "atttributeName", "attributeValue", ...',gTagAttrs=null,gQTGeneratorVersion=1;function AC_QuickTimeVersion(){return gQTGeneratorVersion}function _QTComplain(a,b){b=b.replace("%%",a);alert(b)}function _QTAddAttribute(a,b,c){var d;d=gTagAttrs[a+b];null==d&&(d=gTagAttrs[b]);return null!=d?(0==b.indexOf(a)&&null==c&&(c=b.substring(a.length)),null==c&&(c=b),c+'="'+d+'" '):""}function _QTAddObjectAttr(a,b){if(0==a.indexOf("emb#"))return"";0==a.indexOf("obj#")&&null==b&&(b=a.substring(4));return _QTAddAttribute("obj#",a,b)}function _QTAddEmbedAttr(a,b){if(0==a.indexOf("obj#"))return"";0==a.indexOf("emb#")&&null==b&&(b=a.substring(4));return _QTAddAttribute("emb#",a,b)}function _QTAddObjectParam(a,b){var c,d="",e=b?" />":">";-1==a.indexOf("emb#")&&(c=gTagAttrs["obj#"+a],null==c&&(c=gTagAttrs[a]),0==a.indexOf("obj#")&&(a=a.substring(4)),null!=c&&(d='  <param name="'+a+'" value="'+c+'"'+e+"\n"));return d}function _QTDeleteTagAttrs(){for(var a=0;a<arguments.length;a++){var b=arguments[a];delete gTagAttrs[b];delete gTagAttrs["emb#"+b];delete gTagAttrs["obj#"+b]}}function _QTGenerate(a,b,c){if(4>c.length||0!=c.length%2)return _QTComplain(a,gArgCountErr),"";gTagAttrs=[];gTagAttrs.src=c[0];gTagAttrs.width=c[1];gTagAttrs.height=c[2];gTagAttrs.classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B";gTagAttrs.pluginspage="http://www.apple.com/quicktime/download/";a=c[3];if(null==a||""==a)a="6,0,2,0";gTagAttrs.codebase="http://www.apple.com/qtactivex/qtplugin.cab#version="+a;for(var d,e=4;e<c.length;e+=2)d=c[e].toLowerCase(),a=c[e+1],"name"==d||"id"==d?gTagAttrs.name=a:gTagAttrs[d]=a;c="<object "+_QTAddObjectAttr("classid")+_QTAddObjectAttr("width")+_QTAddObjectAttr("height")+_QTAddObjectAttr("codebase")+_QTAddObjectAttr("name","id")+_QTAddObjectAttr("tabindex")+_QTAddObjectAttr("hspace")+_QTAddObjectAttr("vspace")+_QTAddObjectAttr("border")+_QTAddObjectAttr("align")+_QTAddObjectAttr("class")+_QTAddObjectAttr("title")+_QTAddObjectAttr("accesskey")+_QTAddObjectAttr("noexternaldata")+">\n"+_QTAddObjectParam("src",b);e="  <embed "+_QTAddEmbedAttr("src")+_QTAddEmbedAttr("width")+_QTAddEmbedAttr("height")+_QTAddEmbedAttr("pluginspage")+_QTAddEmbedAttr("name")+_QTAddEmbedAttr("align")+_QTAddEmbedAttr("tabindex");_QTDeleteTagAttrs("src","width","height","pluginspage","classid","codebase","name","tabindex","hspace","vspace","border","align","noexternaldata","class","title","accesskey");for(d in gTagAttrs)a=gTagAttrs[d],null!=a&&(e+=_QTAddEmbedAttr(d),c+=_QTAddObjectParam(d,b));return c+e+"> </embed>\n</object>"}function QT_GenerateOBJECTText(){return _QTGenerate("QT_GenerateOBJECTText",!1,arguments)};(function(){function e(a){a=a||location.href;return"#"+a.replace(/^[^#]*#?(.*)$/,"$1")}var k=document,b,f=$.event.special,p=k.documentMode,m="oniLightBoxHashChange"in window&&(void 0===p||7<p);$.fn.iLightBoxHashChange=function(a){return a?this.bind("iLightBoxHashChange",a):this.trigger("iLightBoxHashChange")};$.fn.iLightBoxHashChange.delay=50;f.iLightBoxHashChange=$.extend(f.iLightBoxHashChange,{setup:function(){if(m)return!1;$(b.start)},teardown:function(){if(m)return!1;$(b.stop)}});b=function(){function a(){var c=e(),d=f(l);c!==l?(n(l=c,d),$(window).trigger("iLightBoxHashChange")):d!==l&&(location.href=location.href.replace(/#.*/,"")+d);g=setTimeout(a,$.fn.iLightBoxHashChange.delay)}var h={},g,l=e(),b=function(c){return c},n=b,f=b;h.start=function(){g||a()};h.stop=function(){g&&clearTimeout(g);g=void 0};browser.msie&&!m&&function(){var c,d;h.start=function(){c||(d=(d=$.fn.iLightBoxHashChange.src)&&d+e(),c=$('<iframe tabindex="-1" title="empty"/>').hide().one("load",function(){d||n(e());a()}).attr("src",d||"javascript:0").insertAfter("body")[0].contentWindow,k.onpropertychange=function(){try{"title"===event.propertyName&&(c.document.title=k.title)}catch(a){}})};h.stop=b;f=function(){return e(c.location.href)};n=function(a,d){var b=c.document,e=$.fn.iLightBoxHashChange.domain;a!==d&&(b.title=k.title,b.open(),e&&b.write('<script>document.domain="'+e+'"\x3c/script>'),b.close(),c.location.hash=a)}}();return h}()})();if(!Array.prototype.filter){Array.prototype.filter=function(fun){"use strict";if(this==null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(typeof fun!="function")
throw new TypeError();var res=[];var thisp=arguments[1];for(var i=0;i<len;i++){if(i in t){var val=t[i];if(fun.call(thisp,val,i,t))
res.push(val);}}
return res;};}
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(searchElement,fromIndex){var k;if(this==null){throw new TypeError('"this" is null or not defined');}
var O=Object(this);var len=O.length>>>0;if(len===0){return-1;}
var n=+fromIndex||0;if(abs(n)===Infinity){n=0;}
if(n>=len){return-1;}
k=max(n>=0?n:len- abs(n),0);while(k<len){var kValue;if(k in O&&O[k]===searchElement){return k;}
k++;}
return-1;};}
if(!Array.prototype.lastIndexOf){Array.prototype.lastIndexOf=function(searchElement){"use strict";if(this==null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(len===0)
return-1;var n=len;if(arguments.length>1){n=Number(arguments[1]);if(n!=n)
n=0;else if(n!=0&&n!=(1/0)&&n!=-(1/0))
n=(n>0||-1)*floor(abs(n));}
var k=n>=0?min(n,len- 1):len- abs(n);for(;k>=0;k--){if(k in t&&t[k]===searchElement)
return k;}
return-1;};}})(jQuery,this);;(function($,window,document,undefined){function Owl(element,options){this.settings=null;this.options=$.extend({},Owl.Defaults,options);this.$element=$(element);this._handlers={};this._plugins={};this._supress={};this._current=null;this._speed=null;this._coordinates=[];this._breakpoint=null;this._width=null;this._items=[];this._clones=[];this._mergers=[];this._widths=[];this._invalidated={};this._pipe=[];this._drag={time:null,target:null,pointer:null,stage:{start:null,current:null},direction:null};this._states={current:{},tags:{'initializing':['busy'],'animating':['busy'],'dragging':['interacting']}};$.each(['onResize','onThrottledResize'],$.proxy(function(i,handler){this._handlers[handler]=$.proxy(this[handler],this);},this));$.each(Owl.Plugins,$.proxy(function(key, plugin) {
			this._plugins[key.charAt(0).toLowerCase() + key.slice(1)]
				= new plugin(this);
		}, this));

		$.each(Owl.Workers, $.proxy(function(priority, worker) {
			this._pipe.push({
				'filter': worker.filter,
				'run': $.proxy(worker.run, this)
			});
		}, this));

		this.setup();
		this.initialize();
	}

	/**
	 * Default options for the carousel.
	 * @public
	 */
	Owl.Defaults = {
		items: 3,
		loop: false,
		center: false,
		rewind: false,

		mouseDrag: true,
		touchDrag: true,
		pullDrag: true,
		freeDrag: false,

		margin: 0,
		stagePadding: 0,

		merge: false,
		mergeFit: true,
		autoWidth: false,

		startPosition: 0,
		rtl: false,

		smartSpeed: 250,
		fluidSpeed: false,
		dragEndSpeed: false,

		responsive: {},
		responsiveRefreshRate: 200,
		responsiveBaseElement: window,

		fallbackEasing: 'swing',

		info: false,

		nestedItemSelector: false,
		itemElement: 'div',
		stageElement: 'div',

		refreshClass: 'owl-refresh',
		loadedClass: 'owl-loaded',
		loadingClass: 'owl-loading',
		rtlClass: 'owl-rtl',
		responsiveClass: 'owl-responsive',
		dragClass: 'owl-drag',
		itemClass: 'owl-item',
		stageClass: 'owl-stage',
		stageOuterClass: 'owl-stage-outer',
		grabClass: 'owl-grab'
	};

	/**
	 * Enumeration for width.
	 * @public
	 * @readonly
	 * @enum {String}
	 */
	Owl.Width = {
		Default: 'default',
		Inner: 'inner',
		Outer: 'outer'
	};

	/**
	 * Enumeration for types.
	 * @public
	 * @readonly
	 * @enum {String}
	 */
	Owl.Type = {
		Event: 'event',
		State: 'state'
	};

	/**
	 * Contains all registered plugins.
	 * @public
	 */
	Owl.Plugins = {};

	/**
	 * List of workers involved in the update process.
	 */
	Owl.Workers = [ {
		filter: [ 'width', 'settings' ],
		run: function() {
			this._width = (this.$element.closest('.px-gutter').length) ? 12 * Math.ceil(this.$element.width() / 12) : this.$element.width();
			//this._width = (UNCODE.isMobile) ? this.$element.width() : 12 * Math.ceil(this.$element.width() / 12);
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function(cache) {
			cache.current = this._items && this._items[this.relative(this._current)];
		}
	}, {
		filter: [ 'items', 'settings' ],
		run: function() {
			this.$stage.children('.cloned').remove();
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function(cache) {
			var margin = this.settings.margin || '',
				grid = !this.settings.autoWidth,
				rtl = this.settings.rtl,
				css = {
					'width': 'auto',
					'margin-left': rtl ? margin : '',
					'margin-right': rtl ? '' : margin
				};

			!grid && this.$stage.children().css(css);

			cache.css = css;
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function(cache) {
			var width = (this.width() / this.settings.items).toFixed(3) - this.settings.margin,
				merge = null,
				iterator = this._items.length,
				grid = !this.settings.autoWidth,
				widths = [];

			cache.items = {
				merge: false,
				width: width
			};

			while (iterator--) {
				merge = this._mergers[iterator];
				merge = this.settings.mergeFit && Math.min(merge, this.settings.items) || merge;

				cache.items.merge = merge > 1 || cache.items.merge;

				widths[iterator] = !grid ? this._items[iterator].width() : width * merge;
			}

			this._widths = widths;
		}
	}, {
		filter: [ 'items', 'settings' ],
		run: function() {
			var clones = [],
				items = this._items,
				settings = this.settings,
				view = Math.max(settings.items * 2, 4),
				size = Math.ceil(items.length / 2) * 2,
				repeat = settings.loop && items.length ? settings.rewind ? view : Math.max(view, size) : 0,
				append = '',
				prepend = '';

			repeat /= 2;

			while (repeat--) {
				clones.push(this.normalize(clones.length / 2, true));
				append = append + items[clones[clones.length - 1]][0].outerHTML;
				clones.push(this.normalize(items.length - 1 - (clones.length - 1) / 2, true));
				prepend = items[clones[clones.length - 1]][0].outerHTML + prepend;
			}

			this._clones = clones;

			// var appendVideo = $(append).find('.uncode-video-container');
			// if (appendVideo.length) {
			// 	appendVideo.attr('data-id', Math.round(Math.random() * 100000));
			// }
			// var prependVideo = $(prepend).find('.uncode-video-container');
			// if (prependVideo.length) {
			// 	prependVideo.attr('data-id', Math.round(Math.random() * 100000));
			// }
			$(append).addClass('cloned').appendTo(this.$stage);
			$(prepend).addClass('cloned').prependTo(this.$stage);
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function() {
			var rtl = this.settings.rtl ? 1 : -1,
				size = this._clones.length + this._items.length,
				iterator = -1,
				previous = 0,
				current = 0,
				coordinates = [];

			while (++iterator < size) {
				previous = coordinates[iterator - 1] || 0;
				current = this._widths[this.relative(iterator)] + this.settings.margin;
				coordinates.push(previous + current * rtl);
			}

			this._coordinates = coordinates;
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function() {
			var stagePadding = (this._width < 480 && this.settings.stagePadding > 0) ? 41 : (this._width * this.settings.stagePadding) / 200,
				padding = stagePadding,
				coordinates = this._coordinates,
				css = {
					'width': Math.ceil(Math.abs(coordinates[coordinates.length - 1])) + padding * 2,
					'padding-left': padding || '',
					'padding-right': padding || ''
				};

			this.$stage.css(css);
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function(cache) {
			var iterator = this._coordinates.length,
				grid = !this.settings.autoWidth,
				items = this.$stage.children();

			if (grid && cache.items.merge) {
				while (iterator--) {
					cache.css.width = this._widths[this.relative(iterator)];
					items.eq(iterator).css(cache.css);
				}
			} else if (grid) {
				cache.css.width = cache.items.width;
				items.css(cache.css);
			}
		}
	}, {
		filter: [ 'items' ],
		run: function() {
			this._coordinates.length < 1 && this.$stage.removeAttr('style');
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function(cache) {
			cache.current = cache.current ? this.$stage.children().index(cache.current) : 0;
			cache.current = Math.max(this.minimum(), Math.min(this.maximum(), cache.current));
			this.reset(cache.current);
		}
	}, {
		filter: [ 'position' ],
		run: function() {
			this.animate(this.coordinates(this._current));
		}
	}, {
		filter: [ 'width', 'position', 'items', 'settings' ],
		run: function() {
			var stagePadding = (this._width < 480 && this.settings.stagePadding > 0) ? 41 : (this._width * this.settings.stagePadding) / 200,
				rtl = this.settings.rtl ? 1 : -1,
				padding = this.settings.stagePadding * 2,
				begin = this.coordinates(this.current()) + padding,
				end = begin + this.width() * rtl,
				inner, outer, matches = [], i, n;

			for (i = 0, n = this._coordinates.length; i < n; i++) {
				inner = this._coordinates[i - 1] || 0;
				outer = Math.abs(this._coordinates[i]) + padding * rtl;

				if ((this.op(inner, '<=', begin) && (this.op(inner, '>', end)))
					|| (this.op(outer, '<', begin) && this.op(outer, '>', end))) {
					matches.push(i);
				}
			}

			this.$stage.children('.active').removeClass('active');
			this.$stage.children(':eq(' + matches.join('), :eq(') + ')').addClass('active');

			if (this.settings.center) {
				this.$stage.children('.center').removeClass('center');
				this.$stage.children().eq(this.current()).addClass('center');
			}
		}
	} ];

	/**
	 * Initializes the carousel.
	 * @protected
	 */
	Owl.prototype.initialize = function() {
		this.enter('initializing');
		this.trigger('initialize');

		this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl);

		if (this.settings.autoWidth && !this.is('pre-loading')) {
			var imgs, nestedSelector, width;
			imgs = this.$element.find('img');
			nestedSelector = this.settings.nestedItemSelector ? '.' + this.settings.nestedItemSelector : undefined;
			width = this.$element.children(nestedSelector).width();

			if (imgs.length && width <= 0) {
				this.preloadAutoWidthImages(imgs);
			}
		}

		this.$element.addClass(this.options.loadingClass);

		// create stage
		this.$stage = $('<' + this.settings.stageElement + ' class="' + this.settings.stageClass + '"/>')
			.wrap('<div class="' + this.settings.stageOuterClass + '"/>');

		// append stage
		this.$element.append(this.$stage.parent());

		// append content
		this.replace(this.$element.children().not(this.$stage.parent()));

		// check visibility
		if (this.$element.is(':visible')) {
			// update view
			this.refresh();
		} else {
			// invalidate width
			this.invalidate('width');
		}

		this.$element
			.removeClass(this.options.loadingClass)
			.addClass(this.options.loadedClass);

		// register event handlers
		this.registerEventHandlers();

		this.leave('initializing');
		this.trigger('initialized');
	};

	/**
	 * Setups the current settings.
	 * @todo Remove responsive classes. Why should adaptive designs be brought into IE8?
	 * @todo Support for media queries by using `matchMedia` would be nice.
	 * @public
	 */
	Owl.prototype.setup = function() {
		var viewport = this.viewport(),
			overwrites = this.options.responsive,
			match = -1,
			settings = null;

		if (!overwrites) {
			settings = $.extend({}, this.options);
		} else {
			$.each(overwrites, function(breakpoint) {
				if (breakpoint <= viewport && breakpoint > match) {
					match = Number(breakpoint);
				}
			});

			settings = $.extend({}, this.options, overwrites[match]);
			delete settings.responsive;

			// responsive class
			if (settings.responsiveClass) {
				this.$element.attr('class',
					this.$element.attr('class').replace(new RegExp('(' + this.options.responsiveClass + '-)\\S+\\s', 'g'), '$1' + match)
				);
			}
		}

		if (this.settings === null || this._breakpoint !== match) {
			this.trigger('change', { property: { name: 'settings', value: settings } });
			this._breakpoint = match;
			this.settings = settings;
			this.invalidate('settings');
			this.trigger('changed', { property: { name: 'settings', value: this.settings } });
		}
	};

	/**
	 * Updates option logic if necessery.
	 * @protected
	 */
	Owl.prototype.optionsLogic = function() {
		if (this.settings.autoWidth) {
			this.settings.stagePadding = false;
			this.settings.merge = false;
		}
	};

	/**
	 * Prepares an item before add.
	 * @todo Rename event parameter `content` to `item`.
	 * @protected
	 * @returns {jQuery|HTMLElement} - The item container.
	 */
	Owl.prototype.prepare = function(item, index) {
		var event = this.trigger('prepare', { content: item });
		if (!event.data) {
			event.data = $('<' + this.settings.itemElement + '/>')
				.addClass(this.options.itemClass).attr('data-index', index + 1).append(item)
		}

		this.trigger('prepared', { content: event.data });

		return event.data;
	};

	/**
	 * Updates the view.
	 * @public
	 */
	Owl.prototype.update = function() {
		var i = 0,
			n = this._pipe.length,
			filter = $.proxy(function(p) { return this[p] }, this._invalidated),
			cache = {};

		while (i < n) {
			if (this._invalidated.all || $.grep(this._pipe[i].filter, filter).length > 0) {
				this._pipe[i].run(cache);
			}
			i++;
		}

		this._invalidated = {};

		!this.is('valid') && this.enter('valid');
	};

	/**
	 * Gets the width of the view.
	 * @public
	 * @param {Owl.Width} [dimension=Owl.Width.Default] - The dimension to return.
	 * @returns {Number} - The width of the view in pixel.
	 */
	Owl.prototype.width = function(dimension) {
		dimension = dimension || Owl.Width.Default;
		var stagePadding = (this._width < 480 && this.settings.stagePadding > 0) ? 41 : (this._width * this.settings.stagePadding) / 200;
		switch (dimension) {
			case Owl.Width.Inner:
			case Owl.Width.Outer:
				return this._width;
			default:
				return this._width - stagePadding * 2 + this.settings.margin;
		}
	};

	/**
	 * Refreshes the carousel primarily for adaptive purposes.
	 * @public
	 */
	Owl.prototype.refresh = function() {
		this.enter('refreshing');
		this.trigger('refresh');

		this.setup();

		this.optionsLogic();

		this.$element.addClass(this.options.refreshClass);

		this.update();

		this.$element.removeClass(this.options.refreshClass);

		this.leave('refreshing');
		this.trigger('refreshed');
	};

	/**
	 * Checks window `resize` event.
	 * @protected
	 */
	Owl.prototype.onThrottledResize = function() {
		window.clearTimeout(this.resizeTimer);
		this.resizeTimer = window.setTimeout(this._handlers.onResize, this.settings.responsiveRefreshRate);
	};

	/**
	 * Checks window `resize` event.
	 * @protected
	 */
	Owl.prototype.onResize = function() {
		if (!this._items.length) {
			return false;
		}

		if (this._width === this.$element.width()) {
			return false;
		}

		if (!this.$element.is(':visible')) {
			return false;
		}

		this.enter('resizing');

		if (this.trigger('resize').isDefaultPrevented()) {
			this.leave('resizing');
			return false;
		}

		this.invalidate('width');

		this.refresh();

		this.leave('resizing');
		this.trigger('resized');
	};

	/**
	 * Registers event handlers.
	 * @todo Check `msPointerEnabled`
	 * @todo #261
	 * @protected
	 */
	Owl.prototype.registerEventHandlers = function() {
		if ($.support.transition) {
			this.$stage.on($.support.transition.end + '.owl.core', $.proxy(this.onTransitionEnd, this));
		}

		if (this.settings.responsive !== false) {
			this.on(window, 'resize', this._handlers.onThrottledResize);
		}

		if (this.settings.mouseDrag) {
			this.$element.addClass(this.options.dragClass);
			this.$stage.on('mousedown.owl.core', $.proxy(this.onDragStart, this));
			this.$stage.on('dragstart.owl.core selectstart.owl.core', function() { return false });
		}

		if (this.settings.touchDrag){
			this.$stage.on('touchstart.owl.core', $.proxy(this.onDragStart, this));
			this.$stage.on('touchcancel.owl.core', $.proxy(this.onDragEnd, this));
		}
	};

	/**
	 * Handles `touchstart` and `mousedown` events.
	 * @todo Horizontal swipe threshold as option
	 * @todo #261
	 * @protected
	 * @param {Event} event - The event arguments.
	 */
	Owl.prototype.onDragStart = function(event) {
		var stage = null;

		if (event.which === 3) {
			return;
		}

		if ($.support.transform) {
			stage = this.$stage.css('transform').replace(/.*\(|\)| /g, '').split(',');
			stage = {
				x: stage[stage.length === 16 ? 12 : 4],
				y: stage[stage.length === 16 ? 13 : 5]
			};
		} else {
			stage = this.$stage.position();
			stage = {
				x: this.settings.rtl ?
					stage.left + this.$stage.width() - this.width() + this.settings.margin :
					stage.left,
				y: stage.top
			};
		}

		if (this.is('animating')) {
			$.support.transform ? this.animate(stage.x) : this.$stage.stop()
			this.invalidate('position');
		}

		this.$element.toggleClass(this.options.grabClass, event.type === 'mousedown');

		this.speed(0);

		this._drag.time = new Date().getTime();
		this._drag.target = $(event.target);
		this._drag.stage.start = stage;
		this._drag.stage.current = stage;
		this._drag.pointer = this.pointer(event);

		$(document).on('mouseup.owl.core touchend.owl.core', $.proxy(this.onDragEnd, this));

		$(document).one('mousemove.owl.core touchmove.owl.core', $.proxy(function(event) {
			var delta = this.difference(this._drag.pointer, this.pointer(event));

			$(document).on('mousemove.owl.core touchmove.owl.core', $.proxy(this.onDragMove, this));

			if (Math.abs(delta.x) < Math.abs(delta.y) && this.is('valid')) {
				return;
			}

			event.preventDefault();

			this.enter('dragging');
			this.trigger('drag');
		}, this));
	};

	/**
	 * Handles the `touchmove` and `mousemove` events.
	 * @todo #261
	 * @protected
	 * @param {Event} event - The event arguments.
	 */
	Owl.prototype.onDragMove = function(event) {
		var minimum = null,
			maximum = null,
			pull = null,
			delta = this.difference(this._drag.pointer, this.pointer(event)),
			stage = this.difference(this._drag.stage.start, delta);

		if (!this.is('dragging')) {
			return;
		}

		event.preventDefault();

		if (this.settings.loop) {
			minimum = this.coordinates(this.minimum());
			maximum = this.coordinates(this.maximum() + 1) - minimum;
			stage.x = (((stage.x - minimum) % maximum + maximum) % maximum) + minimum;
		} else {
			minimum = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum());
			maximum = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum());
			pull = this.settings.pullDrag ? -1 * delta.x / 5 : 0;
			stage.x = Math.max(Math.min(stage.x, minimum + pull), maximum + pull);
		}

		this._drag.stage.current = stage;

		this.animate(stage.x);
	};

	/**
	 * Handles the `touchend` and `mouseup` events.
	 * @todo #261
	 * @todo Threshold for click event
	 * @protected
	 * @param {Event} event - The event arguments.
	 */
	Owl.prototype.onDragEnd = function(event) {
		var delta = this.difference(this._drag.pointer, this.pointer(event)),
			stage = this._drag.stage.current,
			direction = delta.x > 0 ^ this.settings.rtl ? 'left' : 'right';

		$(document).off('.owl.core');

		this.$element.removeClass(this.options.grabClass);

		if (delta.x !== 0 && this.is('dragging') || !this.is('valid')) {
			this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed);
			this.current(this.closest(stage.x, delta.x !== 0 ? direction : this._drag.direction));
			this.invalidate('position');
			this.update();

			this._drag.direction = direction;

			if (Math.abs(delta.x) > 3 || new Date().getTime() - this._drag.time > 300) {
				this._drag.target.one('click.owl.core', function() { return false; });
			}
		}

		if (!this.is('dragging')) {
			return;
		}

		this.leave('dragging');
		this.trigger('dragged');
	};

	/**
	 * Gets absolute position of the closest item for a coordinate.
	 * @todo Setting `freeDrag` makes `closest` not reusable. See #165.
	 * @protected
	 * @param {Number} coordinate - The coordinate in pixel.
	 * @param {String} direction - The direction to check for the closest item. Ether `left` or `right`.
	 * @return {Number} - The absolute position of the closest item.
	 */
	Owl.prototype.closest = function(coordinate, direction) {
		var position = -1,
			pull = 30,
			width = this.width(),
			coordinates = this.coordinates();

		if (!this.settings.freeDrag) {
			// check closest item
			$.each(coordinates, $.proxy(function(index, value) {
				if (coordinate > value - pull && coordinate < value + pull) {
					position = index;
				} else if (this.op(coordinate, '<', value)
					&& this.op(coordinate, '>', coordinates[index + 1] || value - width)) {
					position = direction === 'left' ? index + 1 : index;
				}
				return position === -1;
			}, this));
		}

		if (!this.settings.loop) {
			// non loop boundries
			if (this.op(coordinate, '>', coordinates[this.minimum()])) {
				position = coordinate = this.minimum();
			} else if (this.op(coordinate, '<', coordinates[this.maximum()])) {
				position = coordinate = this.maximum();
			}
		}

		return position;
	};

	/**
	 * Animates the stage.
	 * @todo #270
	 * @public
	 * @param {Number} coordinate - The coordinate in pixels.
	 */
	Owl.prototype.animate = function(coordinate) {
		var animate = this.speed() > 0;

		this.is('animating') && this.onTransitionEnd();

		if (animate) {
			this.enter('animating');
			this.trigger('translate');
		}

		if ($.support.transform3d && $.support.transition) {
			this.$stage.css({
				transform: 'translate3d(' + coordinate + 'px,0px,0px)',
				transition: (this.speed() / 1000) + 's'
			});
		} else if (animate) {
			this.$stage.animate({
				left: coordinate + 'px'
			}, this.speed(), this.settings.fallbackEasing, $.proxy(this.onTransitionEnd, this));
		} else {
			this.$stage.css({
				left: coordinate + 'px'
			});
		}
	};

	/**
	 * Checks whether the carousel is in a specific state or not.
	 * @param {String} state - The state to check.
	 * @returns {Boolean} - The flag which indicates if the carousel is busy.
	 */
	Owl.prototype.is = function(state) {
		return this._states.current[state] && this._states.current[state] > 0;
	};

	/**
	 * Sets the absolute position of the current item.
	 * @public
	 * @param {Number} [position] - The new absolute position or nothing to leave it unchanged.
	 * @returns {Number} - The absolute position of the current item.
	 */
	Owl.prototype.current = function(position) {
		if (position === undefined) {
			return this._current;
		}

		if (this._items.length === 0) {
			return undefined;
		}

		position = this.normalize(position);

		if (this._current !== position) {
			var event = this.trigger('change', { property: { name: 'position', value: position } });

			if (event.data !== undefined) {
				position = this.normalize(event.data);
			}

			this._current = position;

			this.invalidate('position');

			this.trigger('changed', { property: { name: 'position', value: this._current } });
		}

		return this._current;
	};

	/**
	 * Invalidates the given part of the update routine.
	 * @param {String} [part] - The part to invalidate.
	 * @returns {Array.<String>} - The invalidated parts.
	 */
	Owl.prototype.invalidate = function(part) {
		if ($.type(part) === 'string') {
			this._invalidated[part] = true;
			this.is('valid') && this.leave('valid');
		}
		return $.map(this._invalidated, function(v, i) { return i });
	};

	/**
	 * Resets the absolute position of the current item.
	 * @public
	 * @param {Number} position - The absolute position of the new item.
	 */
	Owl.prototype.reset = function(position) {
		position = this.normalize(position);

		if (position === undefined) {
			return;
		}

		this._speed = 0;
		this._current = position;

		this.suppress([ 'translate', 'translated' ]);

		this.animate(this.coordinates(position));

		this.release([ 'translate', 'translated' ]);
	};

	/**
	 * Normalizes an absolute or a relative position of an item.
	 * @public
	 * @param {Number} position - The absolute or relative position to normalize.
	 * @param {Boolean} [relative=false] - Whether the given position is relative or not.
	 * @returns {Number} - The normalized position.
	 */
	Owl.prototype.normalize = function(position, relative) {
		var n = this._items.length,
			m = relative ? 0 : this._clones.length;

		if (!$.isNumeric(position) || n < 1) {
			position = undefined;
		} else if (position < 0 || position >= n + m) {
			position = ((position - m / 2) % n + n) % n + m / 2;
		}

		return position;
	};

	/**
	 * Converts an absolute position of an item into a relative one.
	 * @public
	 * @param {Number} position - The absolute position to convert.
	 * @returns {Number} - The converted position.
	 */
	Owl.prototype.relative = function(position) {
		position -= this._clones.length / 2;
		return this.normalize(position, true);
	};

	/**
	 * Gets the maximum position for the current item.
	 * @public
	 * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
	 * @returns {Number}
	 */
	Owl.prototype.maximum = function(relative) {
		var settings = this.settings,
			maximum = this._coordinates.length,
			boundary = Math.abs(this._coordinates[maximum - 1]) - this._width,
			i = -1, j;

		if (settings.loop) {
			maximum = this._clones.length / 2 + this._items.length - 1;
		} else if (settings.autoWidth || settings.merge) {
			// binary search
			while (maximum - i > 1) {
				Math.abs(this._coordinates[j = maximum + i >> 1]) < boundary
					? i = j : maximum = j;
			}
		} else if (settings.center) {
			maximum = this._items.length - 1;
		} else {
			maximum = this._items.length - settings.items;
		}

		if (relative) {
			maximum -= this._clones.length / 2;
		}

		return Math.max(maximum, 0);
	};

	/**
	 * Gets the minimum position for the current item.
	 * @public
	 * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
	 * @returns {Number}
	 */
	Owl.prototype.minimum = function(relative) {
		return relative ? 0 : this._clones.length / 2;
	};

	/**
	 * Gets an item at the specified relative position.
	 * @public
	 * @param {Number} [position] - The relative position of the item.
	 * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
	 */
	Owl.prototype.items = function(position) {
		if (position === undefined) {
			return this._items.slice();
		}

		position = this.normalize(position, true);
		return this._items[position];
	};

	/**
	 * Gets an item at the specified relative position.
	 * @public
	 * @param {Number} [position] - The relative position of the item.
	 * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
	 */
	Owl.prototype.mergers = function(position) {
		if (position === undefined) {
			return this._mergers.slice();
		}

		position = this.normalize(position, true);
		return this._mergers[position];
	};

	/**
	 * Gets the absolute positions of clones for an item.
	 * @public
	 * @param {Number} [position] - The relative position of the item.
	 * @returns {Array.<Number>} - The absolute positions of clones for the item or all if no position was given.
	 */
	Owl.prototype.clones = function(position) {
		var odd = this._clones.length / 2,
			even = odd + this._items.length,
			map = function(index) { return index % 2 === 0 ? even + index / 2 : odd - (index + 1) / 2 };

		if (position === undefined) {
			return $.map(this._clones, function(v, i) { return map(i) });
		}

		return $.map(this._clones, function(v, i) { return v === position ? map(i) : null });
	};

	/**
	 * Sets the current animation speed.
	 * @public
	 * @param {Number} [speed] - The animation speed in milliseconds or nothing to leave it unchanged.
	 * @returns {Number} - The current animation speed in milliseconds.
	 */
	Owl.prototype.speed = function(speed) {
		if (speed !== undefined) {
			this._speed = speed;
		}

		return this._speed;
	};

	/**
	 * Gets the coordinate of an item.
	 * @todo The name of this method is missleanding.
	 * @public
	 * @param {Number} position - The absolute position of the item within `minimum()` and `maximum()`.
	 * @returns {Number|Array.<Number>} - The coordinate of the item in pixel or all coordinates.
	 */
	Owl.prototype.coordinates = function(position) {
		var coordinate = null;

		if (position === undefined) {
			return $.map(this._coordinates, $.proxy(function(coordinate, index) {
				return this.coordinates(index);
			}, this));
		}

		if (this.settings.center) {
			coordinate = this._coordinates[position];
			coordinate += (this.width() - coordinate + (this._coordinates[position - 1] || 0)) / 2 * (this.settings.rtl ? -1 : 1);
		} else {
			coordinate = this._coordinates[position - 1] || 0;
		}

		return coordinate;
	};

	/**
	 * Calculates the speed for a translation.
	 * @protected
	 * @param {Number} from - The absolute position of the start item.
	 * @param {Number} to - The absolute position of the target item.
	 * @param {Number} [factor=undefined] - The time factor in milliseconds.
	 * @returns {Number} - The time in milliseconds for the translation.
	 */
	Owl.prototype.duration = function(from, to, factor) {
		return Math.min(Math.max(Math.abs(to - from), 1), 6) * Math.abs((factor || this.settings.smartSpeed));
	};

	/**
	 * Slides to the specified item.
	 * @public
	 * @param {Number} position - The position of the item.
	 * @param {Number} [speed] - The time in milliseconds for the transition.
	 */
	Owl.prototype.to = function(position, speed) {
		var current = this.current(),
			revert = null,
			distance = position - this.relative(current),
			direction = (distance > 0) - (distance < 0),
			items = this._items.length,
			minimum = this.minimum(),
			maximum = this.maximum();

		if (this.settings.loop) {
			if (!this.settings.rewind && Math.abs(distance) > items / 2) {
				distance += direction * -1 * items;
			}

			position = current + distance;
			revert = ((position - minimum) % items + items) % items + minimum;

			if (revert !== position && revert - distance <= maximum && revert - distance > 0) {
				current = revert - distance;
				position = revert;
				this.reset(current);
			}
		} else if (this.settings.rewind) {
			maximum += 1;
			position = (position % maximum + maximum) % maximum;
		} else {
			position = Math.max(minimum, Math.min(maximum, position));
		}

		this.speed(this.duration(current, position, speed));
		this.current(position);

		if (this.$element.is(':visible')) {
			this.update();
		}
	};

	/**
	 * Slides to the next item.
	 * @public
	 * @param {Number} [speed] - The time in milliseconds for the transition.
	 */
	Owl.prototype.next = function(speed) {
		speed = speed || false;
		this.to(this.relative(this.current()) + 1, speed);
	};

	/**
	 * Slides to the previous item.
	 * @public
	 * @param {Number} [speed] - The time in milliseconds for the transition.
	 */
	Owl.prototype.prev = function(speed) {
		speed = speed || false;
		this.to(this.relative(this.current()) - 1, speed);
	};

	/**
	 * Handles the end of an animation.
	 * @protected
	 * @param {Event} event - The event arguments.
	 */
	Owl.prototype.onTransitionEnd = function(event) {

		// if css2 animation then event object is undefined
		if (event !== undefined) {
			event.stopPropagation();

			// Catch only owl-stage transitionEnd event
			if ((event.target || event.srcElement || event.originalTarget) !== this.$stage.get(0)) {
				return false;
			}
		}

		this.leave('animating');
		this.trigger('translated');
	};

	/**
	 * Gets viewport width.
	 * @protected
	 * @return {Number} - The width in pixel.
	 */
	Owl.prototype.viewport = function() {
		var width;
		if (this.options.responsiveBaseElement !== window) {
			width = $(this.options.responsiveBaseElement).width();
		} else if (window.innerWidth) {
			width = window.innerWidth;
		} else if (document.documentElement && document.documentElement.clientWidth) {
			width = document.documentElement.clientWidth;
		} else {
			throw 'Can not detect viewport width.';
		}

		return width;
	};

	/**
	 * Replaces the current content.
	 * @public
	 * @param {HTMLElement|jQuery|String} content - The new content.
	 */
	Owl.prototype.replace = function(content) {
		this.$stage.empty();
		this._items = [];

		if (content) {
			content = (content instanceof jQuery) ? content : $(content);
		}

		if (this.settings.nestedItemSelector) {
			content = content.find('.' + this.settings.nestedItemSelector);
		}

		content.filter(function() {
			return this.nodeType === 1;
		}).each($.proxy(function(index, item) {
			item = this.prepare(item, index);
			this.$stage.append(item);
			this._items.push(item);
			this._mergers.push(item.find('[data-merge]').addBack('[data-merge]').attr('data-merge') * 1 || 1);
		}, this));

		this.reset($.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0);

		this.invalidate('items');
	};

	/**
	 * Adds an item.
	 * @todo Use `item` instead of `content` for the event arguments.
	 * @public
	 * @param {HTMLElement|jQuery|String} content - The item content to add.
	 * @param {Number} [position] - The relative position at which to insert the item otherwise the item will be added to the end.
	 */
	Owl.prototype.add = function(content, position) {
		var current = this.relative(this._current);

		position = position === undefined ? this._items.length : this.normalize(position, true);
		content = content instanceof jQuery ? content : $(content);

		this.trigger('add', { content: content, position: position });

		content = this.prepare(content, this._items[current].index());

		if (this._items.length === 0 || position === this._items.length) {
			this._items.length === 0 && this.$stage.append(content);
			this._items.length !== 0 && this._items[position - 1].after(content);
			this._items.push(content);
			this._mergers.push(content.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
		} else {
			this._items[position].before(content);
			this._items.splice(position, 0, content);
			this._mergers.splice(position, 0, content.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
		}

		this._items[current] && this.reset(this._items[current].index());

		this.invalidate('items');

		this.trigger('added', { content: content, position: position });
	};

	/**
	 * Removes an item by its position.
	 * @todo Use `item` instead of `content` for the event arguments.
	 * @public
	 * @param {Number} position - The relative position of the item to remove.
	 */
	Owl.prototype.remove = function(position) {
		position = this.normalize(position, true);

		if (position === undefined) {
			return;
		}

		this.trigger('remove', { content: this._items[position], position: position });

		this._items[position].remove();
		this._items.splice(position, 1);
		this._mergers.splice(position, 1);

		this.invalidate('items');

		this.trigger('removed', { content: null, position: position });
	};

	/**
	 * Preloads images with auto width.
	 * @todo Replace by a more generic approach
	 * @protected
	 */
	Owl.prototype.preloadAutoWidthImages = function(images) {
		images.each($.proxy(function(i, element) {
			this.enter('pre-loading');
			element = $(element);
			$(new Image()).one('load', $.proxy(function(e) {
				element.attr('src', e.target.src);
				element.css('opacity', 1);
				this.leave('pre-loading');
				!this.is('pre-loading') && !this.is('initializing') && this.refresh();
			}, this)).attr('src', element.attr('src') || element.attr('data-src') || element.attr('data-src-retina'));
		}, this));
	};

	/**
	 * Destroys the carousel.
	 * @public
	 */
	Owl.prototype.destroy = function() {

		this.$element.off('.owl.core');
		this.$stage.off('.owl.core');
		$(document).off('.owl.core');

		if (this.settings.responsive !== false) {
			window.clearTimeout(this.resizeTimer);
			this.off(window, 'resize', this._handlers.onThrottledResize);
		}

		for (var i in this._plugins) {
			this._plugins[i].destroy();
		}

		this.$stage.children('.cloned').remove();

		this.$stage.unwrap();
		this.$stage.children().contents().unwrap();
		this.$stage.children().unwrap();

		this.$element
			.removeClass(this.options.refreshClass)
			.removeClass(this.options.loadingClass)
			.removeClass(this.options.loadedClass)
			.removeClass(this.options.rtlClass)
			.removeClass(this.options.dragClass)
			.removeClass(this.options.grabClass)
			.attr('class', this.$element.attr('class').replace(new RegExp(this.options.responsiveClass + '-\\S+\\s', 'g'), ''))
			.removeData('owl.carousel');
	};

	/**
	 * Operators to calculate right-to-left and left-to-right.
	 * @protected
	 * @param {Number} [a] - The left side operand.
	 * @param {String} [o] - The operator.
	 * @param {Number} [b] - The right side operand.
	 */
	Owl.prototype.op = function(a, o, b) {
		var rtl = this.settings.rtl;
		switch (o) {
			case '<':
				return rtl ? a > b : a < b;
			case '>':
				return rtl ? a < b : a > b;
			case '>=':
				return rtl ? a <= b : a >= b;
			case '<=':
				return rtl ? a >= b : a <= b;
			default:
				break;
		}
	};

	/**
	 * Attaches to an internal event.
	 * @protected
	 * @param {HTMLElement} element - The event source.
	 * @param {String} event - The event name.
	 * @param {Function} listener - The event handler to attach.
	 * @param {Boolean} capture - Wether the event should be handled at the capturing phase or not.
	 */
	Owl.prototype.on = function(element, event, listener, capture) {
		if (element.addEventListener) {
			element.addEventListener(event, listener, capture);
		} else if (element.attachEvent) {
			element.attachEvent('on' + event, listener);
		}
	};

	/**
	 * Detaches from an internal event.
	 * @protected
	 * @param {HTMLElement} element - The event source.
	 * @param {String} event - The event name.
	 * @param {Function} listener - The attached event handler to detach.
	 * @param {Boolean} capture - Wether the attached event handler was registered as a capturing listener or not.
	 */
	Owl.prototype.off = function(element, event, listener, capture) {
		if (element.removeEventListener) {
			element.removeEventListener(event, listener, capture);
		} else if (element.detachEvent) {
			element.detachEvent('on' + event, listener);
		}
	};

	/**
	 * Triggers a public event.
	 * @todo Remove `status`, `relatedTarget` should be used instead.
	 * @protected
	 * @param {String} name - The event name.
	 * @param {*} [data=null] - The event data.
	 * @param {String} [namespace=carousel] - The event namespace.
	 * @param {String} [state] - The state which is associated with the event.
	 * @param {Boolean} [enter=false] - Indicates if the call enters the specified state or not.
	 * @returns {Event} - The event arguments.
	 */
	Owl.prototype.trigger = function(name, data, namespace, state, enter) {
		var status = {
			item: { count: this._items.length, index: this.current() }
		}, handler = $.camelCase(
			$.grep([ 'on', name, namespace ], function(v) { return v })
				.join('-').toLowerCase()
		), event = $.Event(
			[ name, 'owl', namespace || 'carousel' ].join('.').toLowerCase(),
			$.extend({ relatedTarget: this }, status, data)
		);

		if (!this._supress[name]) {
			$.each(this._plugins, function(name, plugin) {
				if (plugin.onTrigger) {
					plugin.onTrigger(event);
				}
			});

			this.register({ type: Owl.Type.Event, name: name });
			this.$element.trigger(event);

			if (this.settings && typeof this.settings[handler] === 'function') {
				this.settings[handler].call(this, event);
			}
		}

		return event;
	};

	/**
	 * Enters a state.
	 * @param name - The state name.
	 */
	Owl.prototype.enter = function(name) {
		$.each([ name ].concat(this._states.tags[name] || []), $.proxy(function(i, name) {
			if (this._states.current[name] === undefined) {
				this._states.current[name] = 0;
			}

			this._states.current[name]++;
		}, this));
	};

	/**
	 * Leaves a state.
	 * @param name - The state name.
	 */
	Owl.prototype.leave = function(name) {
		$.each([ name ].concat(this._states.tags[name] || []), $.proxy(function(i, name) {
			this._states.current[name]--;
		}, this));
	};

	/**
	 * Registers an event or state.
	 * @public
	 * @param {Object} object - The event or state to register.
	 */
	Owl.prototype.register = function(object) {
		if (object.type === Owl.Type.Event) {
			if (!$.event.special[object.name]) {
				$.event.special[object.name] = {};
			}

			if (!$.event.special[object.name].owl) {
				var _default = $.event.special[object.name]._default;
				$.event.special[object.name]._default = function(e) {
					if (_default && _default.apply && (!e.namespace || e.namespace.indexOf('owl') === -1)) {
						return _default.apply(this, arguments);
					}
					return e.namespace && e.namespace.indexOf('owl') > -1;
				};
				$.event.special[object.name].owl = true;
			}
		} else if (object.type === Owl.Type.State) {
			if (!this._states.tags[object.name]) {
				this._states.tags[object.name] = object.tags;
			} else {
				this._states.tags[object.name] = this._states.tags[object.name].concat(object.tags);
			}

			this._states.tags[object.name] = $.grep(this._states.tags[object.name], $.proxy(function(tag, i) {
				return $.inArray(tag, this._states.tags[object.name]) === i;
			}, this));
		}
	};

	/**
	 * Suppresses events.
	 * @protected
	 * @param {Array.<String>} events - The events to suppress.
	 */
	Owl.prototype.suppress = function(events) {
		$.each(events, $.proxy(function(index, event) {
			this._supress[event] = true;
		}, this));
	};

	/**
	 * Releases suppressed events.
	 * @protected
	 * @param {Array.<String>} events - The events to release.
	 */
	Owl.prototype.release = function(events) {
		$.each(events, $.proxy(function(index, event) {
			delete this._supress[event];
		}, this));
	};

	/**
	 * Gets unified pointer coordinates from event.
	 * @todo #261
	 * @protected
	 * @param {Event} - The `mousedown` or `touchstart` event.
	 * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
	 */
	Owl.prototype.pointer = function(event) {
		var result = { x: null, y: null };

		event = event.originalEvent || event || window.event;

		event = event.touches && event.touches.length ?
			event.touches[0] : event.changedTouches && event.changedTouches.length ?
				event.changedTouches[0] : event;

		if (event.pageX) {
			result.x = event.pageX;
			result.y = event.pageY;
		} else {
			result.x = event.clientX;
			result.y = event.clientY;
		}

		return result;
	};

	/**
	 * Gets the difference of two vectors.
	 * @todo #261
	 * @protected
	 * @param {Object} - The first vector.
	 * @param {Object} - The second vector.
	 * @returns {Object} - The difference.
	 */
	Owl.prototype.difference = function(first, second) {
		return {
			x: first.x - second.x,
			y: first.y - second.y
		};
	};

	/**
	 * The jQuery Plugin for the Owl Carousel
	 * @todo Navigation plugin `next` and `prev`
	 * @public
	 */
	$.fn.owlCarousel = function(option) {
		var args = Array.prototype.slice.call(arguments, 1);

		return this.each(function() {
			var $this = $(this),
				data = $this.data('owl.carousel');

			if (!data) {
				data = new Owl(this, typeof option == 'object' && option);
				$this.data('owl.carousel', data);

				$.each([
					'next', 'prev', 'to', 'destroy', 'refresh', 'replace', 'add', 'remove'
				], function(i, event) {
					data.register({ type: Owl.Type.Event, name: event });
					data.$element.on(event + '.owl.carousel.core', $.proxy(function(e) {
						if (e.namespace && e.relatedTarget !== this) {
							this.suppress([ event ]);
							data[event].apply(this, [].slice.call(arguments, 1));
							this.release([ event ]);
						}
					}, data));
				});
			}

			if (typeof option == 'string' && option.charAt(0) !== '_') {
				data[option].apply(data, args);
			}
		});
	};

	/**
	 * The constructor for the jQuery Plugin
	 * @public
	 */
	$.fn.owlCarousel.Constructor = Owl;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoRefresh Plugin
 * @version 2.0.0-beta.3
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the auto refresh plugin.
	 * @class The Auto Refresh Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var AutoRefresh = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Refresh interval.
		 * @protected
		 * @type {number}
		 */
		this._interval = null;

		/**
		 * Whether the element is currently visible or not.
		 * @protected
		 * @type {Boolean}
		 */
		this._visible = null;

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.autoRefresh) {
					this.watch();
				}
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, AutoRefresh.Defaults, this._core.options);

		// register event handlers
		this._core.$element.on(this._handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	AutoRefresh.Defaults = {
		autoRefresh: true,
		autoRefreshInterval: 500
	};

	/**
	 * Watches the element.
	 */
	AutoRefresh.prototype.watch = function() {
		if (this._interval) {
			return;
		}

		this._visible = this._core.$element.is(':visible');
		this._interval = window.setInterval($.proxy(this.refresh, this), this._core.settings.autoRefreshInterval);
	};

	/**
	 * Refreshes the element.
	 */
	AutoRefresh.prototype.refresh = function() {
		if (this._core.$element.is(':visible') === this._visible) {
			return;
		}

		this._visible = !this._visible;

		this._core.$element.toggleClass('owl-hidden', !this._visible);

		this._visible && (this._core.invalidate('width') && this._core.refresh());
	};

	/**
	 * Destroys the plugin.
	 */
	AutoRefresh.prototype.destroy = function() {
		var handler, property;

		window.clearInterval(this._interval);

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.AutoRefresh = AutoRefresh;

})(window.Zepto || window.jQuery, window, document);

/**
 * Lazy Plugin
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the lazy plugin.
	 * @class The Lazy Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Lazy = function(carousel) {

		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Already loaded items.
		 * @protected
		 * @type {Array.<jQuery>}
		 */
		this._loaded = [];

		/**
		 * Event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel change.owl.carousel': $.proxy(function(e) {
				if (!e.namespace) {
					return;
				}

				if (!this._core.settings || !this._core.settings.lazyLoad) {
					return;
				}

				if ((e.property && e.property.name == 'position') || e.type == 'initialized') {
					var settings = this._core.settings,
						n = (settings.center && Math.ceil(settings.items / 2) || settings.items),
						i = ((settings.center && n * -1) || 0),
						position = ((e.property && e.property.value) || this._core.current()) + i,
						clones = this._core.clones().length,
						load = $.proxy(function(i, v) { this.load(v) }, this);

					while (i++ < n) {
						this.load(clones / 2 + this._core.relative(position));
						clones && $.each(this._core.clones(this._core.relative(position)), load);
						position++;
					}
				}
			}, this)
		};

		// set the default options
		this._core.options = $.extend({}, Lazy.Defaults, this._core.options);

		// register event handler
		this._core.$element.on(this._handlers);
	}

	/**
	 * Default options.
	 * @public
	 */
	Lazy.Defaults = {
		lazyLoad: false
	}

	/**
	 * Loads all resources of an item at the specified position.
	 * @param {Number} position - The absolute position of the item.
	 * @protected
	 */
	Lazy.prototype.load = function(position) {
		var $item = this._core.$stage.children().eq(position),
			$elements = $item && $item.find('.owl-lazy');

		if (!$elements || $.inArray($item.get(0), this._loaded) > -1) {
			return;
		}

		$elements.each($.proxy(function(index, element) {
			var $element = $(element), image,
				url = (window.devicePixelRatio > 1 && $element.attr('data-src-retina')) || $element.attr('data-src');

			this._core.trigger('load', { element: $element, url: url }, 'lazy');

			if ($element.is('img')) {
				$element.one('load.owl.lazy', $.proxy(function() {
					$element.css('opacity', 1);
					this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
				}, this)).attr('src', url);
			} else {
				image = new Image();
				image.onload = $.proxy(function() {
					$element.css({
						'background-image': 'url(' + url + ')',
						'opacity': '1'
					});
					this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
				}, this);
				image.src = url;
			}
		}, this));

		this._loaded.push($item.get(0));
	}

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Lazy.prototype.destroy = function() {
		var handler, property;

		for (handler in this.handlers) {
			this._core.$element.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Lazy = Lazy;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoHeight Plugin
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the auto height plugin.
	 * @class The Auto Height Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var AutoHeight = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel refreshed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.autoHeight) {
					this.update();
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.autoHeight && e.property.name == 'position'){
					this.update();
				}
			}, this),
			'loaded.owl.lazy': $.proxy(function(e) {
				if (e.namespace && this._core.settings.autoHeight
					&& e.element.closest('.' + this._core.settings.itemClass).index() === this._core.current()) {
					this.update();
				}
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, AutoHeight.Defaults, this._core.options);

		// register event handlers
		this._core.$element.on(this._handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	AutoHeight.Defaults = {
		autoHeight: false,
		autoHeightClass: 'owl-height'
	};

	/**
	 * Updates the view.
	 */
	AutoHeight.prototype.update = function() {
		var start = this._core._current,
			end = start + this._core.settings.items,
			visible = this._core.$stage.children().toArray().slice(start, end);
			heights = [],
			maxheight = 0;

		$.each(visible, function(index, item) {
			heights.push($(item).height());
		});

		maxheight = Math.max.apply(null, heights);

		this._core.$stage.parent()
			.height(maxheight)
			.addClass(this._core.settings.autoHeightClass);
	};

	AutoHeight.prototype.destroy = function() {
		var handler, property;

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.AutoHeight = AutoHeight;

})(window.Zepto || window.jQuery, window, document);

/**
 * Video Plugin
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the video plugin.
	 * @class The Video Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Video = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Cache all video URLs.
		 * @protected
		 * @type {Object}
		 */
		this._videos = {};

		/**
		 * Current playing item.
		 * @protected
		 * @type {jQuery}
		 */
		this._playing = null;

		/**
		 * All event handlers.
		 * @todo The cloned content removale is too late
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace) {
					this._core.register({ type: 'state', name: 'playing', tags: [ 'interacting' ] });
				}
			}, this),
			'resize.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.video && this.isInFullScreen()) {
					e.preventDefault();
				}
			}, this),
			'refreshed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.is('resizing')) {
					this._core.$stage.find('.cloned .owl-video-frame').remove();
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && e.property.name === 'position' && this._playing) {
					this.stop();
				}
			}, this),
			'prepared.owl.carousel': $.proxy(function(e) {
				if (!e.namespace) {
					return;
				}

				var $element = $(e.content).find('.owl-video');

				if ($element.length) {
					$element.css('display', 'none');
					this.fetch($element, $(e.content));
				}
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, Video.Defaults, this._core.options);

		// register event handlers
		this._core.$element.on(this._handlers);

		this._core.$element.on('click.owl.video', '.owl-video-play-icon', $.proxy(function(e) {
			this.play(e);
		}, this));
	};

	/**
	 * Default options.
	 * @public
	 */
	Video.Defaults = {
		video: false,
		videoHeight: false,
		videoWidth: false
	};

	/**
	 * Gets the video ID and the type (YouTube/Vimeo only).
	 * @protected
	 * @param {jQuery} target - The target containing the video data.
	 * @param {jQuery} item - The item containing the video.
	 */
	Video.prototype.fetch = function(target, item) {
		var type = target.attr('data-vimeo-id') ? 'vimeo' : 'youtube',
			id = target.attr('data-vimeo-id') || target.attr('data-youtube-id'),
			width = target.attr('data-width') || this._core.settings.videoWidth,
			height = target.attr('data-height') || this._core.settings.videoHeight,
			url = target.attr('href');

		if (url) {
			id = url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

			if (id[3].indexOf('youtu') > -1) {
				type = 'youtube';
			} else if (id[3].indexOf('vimeo') > -1) {
				type = 'vimeo';
			} else {
				throw new Error('Video URL not supported.');
			}
			id = id[6];
		} else {
			throw new Error('Missing video URL.');
		}

		this._videos[url] = {
			type: type,
			id: id,
			width: width,
			height: height
		};

		item.attr('data-video', url);

		this.thumbnail(target, this._videos[url]);
	};

	/**
	 * Creates video thumbnail.
	 * @protected
	 * @param {jQuery} target - The target containing the video data.
	 * @param {Object} info - The video info object.
	 * @see `fetch`
	 */
	Video.prototype.thumbnail = function(target, video) {
		var tnLink,
			icon,
			path,
			dimensions = video.width && video.height ? 'style="width:' + video.width + 'px;height:' + video.height + 'px;"' : '',
			customTn = target.find('img'),
			srcType = 'src',
			lazyClass = '',
			settings = this._core.settings,
			create = function(path) {
				icon = '<div class="owl-video-play-icon"></div>';

				if (settings.lazyLoad) {
					tnLink = '<div class="owl-video-tn ' + lazyClass + '" ' + srcType + '="' + path + '"></div>';
				} else {
					tnLink = '<div class="owl-video-tn" style="opacity:1;background-image:url(' + path + ')"></div>';
				}
				target.after(tnLink);
				target.after(icon);
			};

		// wrap video content into owl-video-wrapper div
		target.wrap('<div class="owl-video-wrapper"' + dimensions + '></div>');

		if (this._core.settings.lazyLoad) {
			srcType = 'data-src';
			lazyClass = 'owl-lazy';
		}

		// custom thumbnail
		if (customTn.length) {
			create(customTn.attr(srcType));
			customTn.remove();
			return false;
		}

		if (video.type === 'youtube') {
			path = "http://img.youtube.com/vi/" + video.id + "/hqdefault.jpg";
			create(path);
		} else if (video.type === 'vimeo') {
			$.ajax({
				type: 'GET',
				url: 'http://vimeo.com/api/v2/video/' + video.id + '.json',
				jsonp: 'callback',
				dataType: 'jsonp',
				success: function(data) {
					path = data[0].thumbnail_large;
					create(path);
				}
			});
		}
	};

	/**
	 * Stops the current video.
	 * @public
	 */
	Video.prototype.stop = function() {
		this._core.trigger('stop', null, 'video');
		this._playing.find('.owl-video-frame').remove();
		this._playing.removeClass('owl-video-playing');
		this._playing = null;
		this._core.leave('playing');
		this._core.trigger('stopped', null, 'video');
	};

	/**
	 * Starts the current video.
	 * @public
	 * @param {Event} event - The event arguments.
	 */
	Video.prototype.play = function(event) {
		var target = $(event.target),
			item = target.closest('.' + this._core.settings.itemClass),
			video = this._videos[item.attr('data-video')],
			width = video.width || '100%',
			height = video.height || this._core.$stage.height(),
			html;

		if (this._playing) {
			return;
		}

		this._core.enter('playing');
		this._core.trigger('play', null, 'video');

		item = this._core.items(this._core.relative(item.index()));

		this._core.reset(item.index());

		if (video.type === 'youtube') {
			html = '<iframe width="' + width + '" height="' + height + '" src="http://www.youtube.com/embed/' +
				video.id + '?autoplay=1&v=' + video.id + '" frameborder="0" allowfullscreen></iframe>';
		} else if (video.type === 'vimeo') {
			html = '<iframe src="http://player.vimeo.com/video/' + video.id +
				'?autoplay=1" width="' + width + '" height="' + height +
				'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
		}

		$('<div class="owl-video-frame">' + html + '</div>').insertAfter(item.find('.owl-video'));

		this._playing = item.addClass('owl-video-playing');
	};

	/**
	 * Checks whether an video is currently in full screen mode or not.
	 * @todo Bad style because looks like a readonly method but changes members.
	 * @protected
	 * @returns {Boolean}
	 */
	Video.prototype.isInFullScreen = function() {
		var element = document.fullscreenElement || document.mozFullScreenElement ||
				document.webkitFullscreenElement;

		return element && $(element).parent().hasClass('owl-video-frame');
	};

	/**
	 * Destroys the plugin.
	 */
	Video.prototype.destroy = function() {
		var handler, property;

		this._core.$element.off('click.owl.video');

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Video = Video;

})(window.Zepto || window.jQuery, window, document);

/**
 * Animate Plugin
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the animate plugin.
	 * @class The Navigation Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	var Animate = function(scope) {
		this.core = scope;
		this.core.options = $.extend({}, Animate.Defaults, this.core.options);
		this.swapping = true;
		this.previous = undefined;
		this.next = undefined;

		this.handlers = {
			'change.owl.carousel': $.proxy(function(e) {
				if (e.namespace && e.property.name == 'position') {
					this.previous = this.core.current();
					this.next = e.property.value;
				}
			}, this),
			'drag.owl.carousel dragged.owl.carousel translated.owl.carousel': $.proxy(function(e) {
				if (e.namespace) {
					this.swapping = e.type == 'translated';
				}
			}, this),
			'translate.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this.swapping && (this.core.options.animateOut || this.core.options.animateIn)) {
					this.swap();
				}
			}, this)
		};

		this.core.$element.on(this.handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	Animate.Defaults = {
		animateOut: false,
		animateIn: false
	};

	/**
	 * Toggles the animation classes whenever an translations starts.
	 * @protected
	 * @returns {Boolean|undefined}
	 */
	Animate.prototype.swap = function() {

		if (this.core.settings.items !== 1) {
			return;
		}

		if (!$.support.animation || !$.support.transition) {
			return;
		}

		this.core.speed(0);

		var left,
			clear = $.proxy(this.clear, this),
			previous = this.core.$stage.children().eq(this.previous),
			next = this.core.$stage.children().eq(this.next),
			incoming = this.core.settings.animateIn,
			outgoing = this.core.settings.animateOut;

		if (this.core.current() === this.previous) {
			return;
		}

		if (outgoing) {
			left = this.core.coordinates(this.previous) - this.core.coordinates(this.next);
			previous.css( { 'left': left + 'px' } )
				.addClass('animated owl-animated-out')
				.addClass(outgoing)
				.on($.support.animation.end, clear);
		}

		if (incoming) {
			next.addClass('animated owl-animated-in')
				.addClass(incoming)
				.on($.support.animation.end, clear);
		}
	};

	Animate.prototype.clear = function(e) {
		if ($(e.target).hasClass('animated')) {
			$(e.target).css( { 'left': '' } )
				.removeClass('animated owl-animated-out owl-animated-in')
				.removeClass(this.core.settings.animateIn)
				.removeClass(this.core.settings.animateOut);
			this.core.onTransitionEnd();
		}
	};

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Animate.prototype.destroy = function() {
		var handler, property;

		for (handler in this.handlers) {
			this.core.$element.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Animate = Animate;

})(window.Zepto || window.jQuery, window, document);

/**
 * Autoplay Plugin
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the autoplay plugin.
	 * @class The Autoplay Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	var Autoplay = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * The autoplay interval.
		 * @type {Number}
		 */
		this._interval = null;

		/**
		 * Indicates whenever the autoplay is paused.
		 * @type {Boolean}
		 */
		this._paused = false;

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && e.property.name === 'settings') {
					if (this._core.settings.autoplay) {
						this.play();
					} else {
						this.stop();
					}
				}
			}, this),
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.autoplay) {
					this.play();
				}
			}, this),
			'play.owl.autoplay': $.proxy(function(e, t, s) {
				if (e.namespace) {
					this.play(t, s);
				}
			}, this),
			'stop.owl.autoplay': $.proxy(function(e) {
				if (e.namespace) {
					this.stop();
				}
			}, this),
			'mouseover.owl.autoplay': $.proxy(function() {
				if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
					this.pause();
				}
			}, this),
			'mouseleave.owl.autoplay': $.proxy(function() {
				if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
					this.play();
				}
			}, this)
		};

		// register event handlers
		this._core.$element.on(this._handlers);

		// set default options
		this._core.options = $.extend({}, Autoplay.Defaults, this._core.options);
	};

	/**
	 * Default options.
	 * @public
	 */
	Autoplay.Defaults = {
		autoplay: false,
		autoplayTimeout: 5000,
		autoplayHoverPause: false,
		autoplaySpeed: false
	};

	/**
	 * Starts the autoplay.
	 * @public
	 * @param {Number} [timeout] - The interval before the next animation starts.
	 * @param {Number} [speed] - The animation speed for the animations.
	 */
	Autoplay.prototype.play = function(timeout, speed) {
		this._paused = false;

		if (this._core.is('rotating')) {
			return;
		}

		this._core.enter('rotating');

		this._interval = window.setInterval($.proxy(function() {
			if (this._paused || this._core.is('busy') || this._core.is('interacting') || document.hidden) {
				return;
			}
			this._core.next(speed || this._core.settings.autoplaySpeed);
		}, this), timeout || this._core.settings.autoplayTimeout);
	};

	/**
	 * Stops the autoplay.
	 * @public
	 */
	Autoplay.prototype.stop = function() {
		if (!this._core.is('rotating')) {
			return;
		}

		window.clearInterval(this._interval);
		this._core.leave('rotating');
	};

	/**
	 * Stops the autoplay.
	 * @public
	 */
	Autoplay.prototype.pause = function() {
		if (!this._core.is('rotating')) {
			return;
		}

		this._paused = true;
	};

	/**
	 * Destroys the plugin.
	 */
	Autoplay.prototype.destroy = function() {
		var handler, property;

		this.stop();

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;

})(window.Zepto || window.jQuery, window, document);

/**
 * Navigation Plugin
 * @version 2.0.0-beta.3
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	'use strict';

	/**
	 * Creates the navigation plugin.
	 * @class The Navigation Plugin
	 * @param {Owl} carousel - The Owl Carousel.
	 */
	var Navigation = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Indicates whether the plugin is initialized or not.
		 * @protected
		 * @type {Boolean}
		 */
		this._initialized = false;

		/**
		 * The current paging indexes.
		 * @protected
		 * @type {Array}
		 */
		this._pages = [];

		/**
		 * All DOM elements of the user interface.
		 * @protected
		 * @type {Object}
		 */
		this._controls = {};

		/**
		 * Markup for an indicator.
		 * @protected
		 * @type {Array.<String>}
		 */
		this._templates = [];

		/**
		 * The carousel element.
		 * @type {jQuery}
		 */
		this.$element = this._core.$element;

		/**
		 * Overridden methods of the carousel.
		 * @protected
		 * @type {Object}
		 */
		this._overrides = {
			next: this._core.next,
			prev: this._core.prev,
			to: this._core.to
		};

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'prepared.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.dotsData) {
					this._templates.push('<div class="' + this._core.settings.dotClass + '">' +
						$(e.content).find('[data-dot]').andSelf('[data-dot]').attr('data-dot') + '</div>');
				}
			}, this),
			'added.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.dotsData) {
					this._templates.splice(e.position, 0, this._templates.pop());
				}
			}, this),
			'remove.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.dotsData) {
					this._templates.splice(e.position, 1);
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && e.property.name == 'position') {
					this.draw();
				}
			}, this),
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace && !this._initialized) {
					this._core.trigger('initialize', null, 'navigation');
					this.initialize();
					this.update();
					this.draw();
					this._initialized = true;
					this._core.trigger('initialized', null, 'navigation');
				}
			}, this),
			'refreshed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._initialized) {
					this._core.trigger('refresh', null, 'navigation');
					this.update();
					this.draw();
					this._core.trigger('refreshed', null, 'navigation');
				}
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, Navigation.Defaults, this._core.options);

		// register event handlers
		this.$element.on(this._handlers);
	};

	/**
	 * Default options.
	 * @public
	 * @todo Rename `slideBy` to `navBy`
	 */
	Navigation.Defaults = {
		nav: false,
		navText: [ 'prev', 'next' ],
		navSpeed: false,
		navElement: 'div',
		navContainer: false,
		navContainerClass: 'owl-nav',
		navClass: [ 'owl-prev', 'owl-next' ],
		slideBy: 1,
		dotClass: 'owl-dot',
		dotsClass: 'owl-dots',
		dots: true,
		dotsEach: false,
		dotsData: false,
		dotsSpeed: false,
		dotsContainer: false
	};

	/**
	 * Initializes the layout of the plugin and extends the carousel.
	 * @protected
	 */
	Navigation.prototype.initialize = function() {
		var override,
			settings = this._core.settings;

		// create DOM structure for relative navigation
		this._controls.$relative = (settings.navContainer ? $(settings.navContainer)
			: $('<div>').addClass(settings.navContainerClass).appendTo(this.$element)).addClass('disabled');

		this._controls.$previous = $('<' + settings.navElement + '>')
			.addClass(settings.navClass[0])
			.html(settings.navText[0])
			.prependTo(this._controls.$relative)
			.on('click', $.proxy(function(e) {
				this.prev(settings.navSpeed);
			}, this));
		this._controls.$next = $('<' + settings.navElement + '>')
			.addClass(settings.navClass[1])
			.html(settings.navText[1])
			.appendTo(this._controls.$relative)
			.on('click', $.proxy(function(e) {
				this.next(settings.navSpeed);
			}, this));

		// create DOM structure for absolute navigation
		if (!settings.dotsData) {
			this._templates = [ $('<div>')
				.addClass(settings.dotClass)
				.append($('<span>'))
				.prop('outerHTML') ];
		}

		this._controls.$absolute = (settings.dotsContainer ? $(settings.dotsContainer)
			: $('<div>').addClass(settings.dotsClass).appendTo(this.$element)).addClass('disabled');

		this._controls.$absolute.on('click', 'div', $.proxy(function(e) {
			var index = $(e.target).parent().is(this._controls.$absolute)
				? $(e.target).index() : $(e.target).parent().index();

			e.preventDefault();

			this.to(index, settings.dotsSpeed);
		}, this));

		// override public methods of the carousel
		for (override in this._overrides) {
			this._core[override] = $.proxy(this[override], this);
		}
	};

	/**
	 * Destroys the plugin.
	 * @protected
	 */
	Navigation.prototype.destroy = function() {
		var handler, control, property, override;

		for (handler in this._handlers) {
			this.$element.off(handler, this._handlers[handler]);
		}
		for (control in this._controls) {
			this._controls[control].remove();
		}
		for (override in this.overides) {
			this._core[override] = this._overrides[override];
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	/**
	 * Updates the internal state.
	 * @protected
	 */
	Navigation.prototype.update = function() {
		var i, j, k,
			lower = this._core.clones().length / 2,
			upper = lower + this._core.items().length,
			maximum = this._core.maximum(true),
			settings = this._core.settings,
			size = settings.center || settings.autoWidth || settings.dotsData
				? 1 : settings.dotsEach || settings.items;

		if (settings.slideBy !== 'page') {
			settings.slideBy = Math.min(settings.slideBy, settings.items);
		}

		if (settings.dots || settings.slideBy == 'page') {
			this._pages = [];

			for (i = lower, j = 0, k = 0; i < upper; i++) {
				if (j >= size || j === 0) {
					this._pages.push({
						start: Math.min(maximum, i - lower),
						end: i - lower + size - 1
					});
					if (Math.min(maximum, i - lower) === maximum) {
						break;
					}
					j = 0, ++k;
				}
				j += this._core.mergers(this._core.relative(i));
			}
		}
	};

	/**
	 * Draws the user interface.
	 * @todo The option `dotsData` wont work.
	 * @protected
	 */
	Navigation.prototype.draw = function() {
		var difference,
			settings = this._core.settings,
			disabled = this._core.items().length <= settings.items,
			index = this._core.relative(this._core.current()),
			loop = settings.loop || settings.rewind;

		this._controls.$relative.toggleClass('disabled', !settings.nav || disabled);

		if (settings.nav) {
			this._controls.$previous.toggleClass('disabled', !loop && index <= this._core.minimum(true));
			this._controls.$next.toggleClass('disabled', !loop && index >= this._core.maximum(true));
		}

		this._controls.$absolute.toggleClass('disabled', !settings.dots || disabled);

		if (settings.dots) {
			difference = this._pages.length - this._controls.$absolute.children().length;

			if (settings.dotsData && difference !== 0) {
				this._controls.$absolute.html(this._templates.join(''));
			} else if (difference > 0) {
				this._controls.$absolute.append(new Array(difference + 1).join(this._templates[0]));
			} else if (difference < 0) {
				this._controls.$absolute.children().slice(difference).remove();
			}

			this._controls.$absolute.find('.active').removeClass('active');
			this._controls.$absolute.children().eq($.inArray(this.current(), this._pages)).addClass('active');
		}
	};

	/**
	 * Extends event data.
	 * @protected
	 * @param {Event} event - The event object which gets thrown.
	 */
	Navigation.prototype.onTrigger = function(event) {
		var settings = this._core.settings;

		event.page = {
			index: $.inArray(this.current(), this._pages),
			count: this._pages.length,
			size: settings && (settings.center || settings.autoWidth || settings.dotsData
				? 1 : settings.dotsEach || settings.items)
		};
	};

	/**
	 * Gets the current page position of the carousel.
	 * @protected
	 * @returns {Number}
	 */
	Navigation.prototype.current = function() {
		var current = this._core.relative(this._core.current());
		return $.grep(this._pages, $.proxy(function(page, index) {
			return page.start <= current && page.end >= current;
		}, this)).pop();
	};

	/**
	 * Gets the current succesor/predecessor position.
	 * @protected
	 * @returns {Number}
	 */
	Navigation.prototype.getPosition = function(successor) {
		var position, length,
			settings = this._core.settings;

		if (settings.slideBy == 'page') {
			position = $.inArray(this.current(), this._pages);
			length = this._pages.length;
			successor ? ++position : --position;
			position = this._pages[((position % length) + length) % length].start;
		} else {
			position = this._core.relative(this._core.current());
			length = this._core.items().length;
			successor ? position += settings.slideBy : position -= settings.slideBy;
		}

		return position;
	};

	/**
	 * Slides to the next item or page.
	 * @public
	 * @param {Number} [speed=false] - The time in milliseconds for the transition.
	 */
	Navigation.prototype.next = function(speed) {
		$.proxy(this._overrides.to, this._core)(this.getPosition(true), speed);
	};

	/**
	 * Slides to the previous item or page.
	 * @public
	 * @param {Number} [speed=false] - The time in milliseconds for the transition.
	 */
	Navigation.prototype.prev = function(speed) {
		$.proxy(this._overrides.to, this._core)(this.getPosition(false), speed);
	};

	/**
	 * Slides to the specified item or page.
	 * @public
	 * @param {Number} position - The position of the item or page.
	 * @param {Number} [speed] - The time in milliseconds for the transition.
	 * @param {Boolean} [standard=false] - Whether to use the standard behaviour or not.
	 */
	Navigation.prototype.to = function(position, speed, standard) {
		var length;

		if (!standard) {
			length = this._pages.length;
			$.proxy(this._overrides.to, this._core)(this._pages[((position % length) + length) % length].start, speed);
		} else {
			$.proxy(this._overrides.to, this._core)(position, speed);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;

})(window.Zepto || window.jQuery, window, document);

/**
 * Hash Plugin
 * @version 2.0.0-beta.3
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	'use strict';

	/**
	 * Creates the hash plugin.
	 * @class The Hash Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Hash = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Hash index for the items.
		 * @protected
		 * @type {Object}
		 */
		this._hashes = {};

		/**
		 * The carousel element.
		 * @type {jQuery}
		 */
		this.$element = this._core.$element;

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.startPosition === 'URLHash') {
					$(window).trigger('hashchange.owl.navigation');
				}
			}, this),
			'prepared.owl.carousel': $.proxy(function(e) {
				if (e.namespace) {
					var hash = $(e.content).find('[data-hash]').addBack('[data-hash]').attr('data-hash');

					if (!hash) {
						return;
					}

					this._hashes[hash] = e.content;
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && e.property.name === 'position') {
					var current = this._core.items(this._core.relative(this._core.current())),
						hash = $.map(this._hashes, function(item, hash) {
							return item === current ? hash : null;
						}).join();

					if (!hash || window.location.hash.slice(1) === hash) {
						return;
					}

					window.location.hash = hash;
				}
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, Hash.Defaults, this._core.options);

		// register the event handlers
		this.$element.on(this._handlers);

		// register event listener for hash navigation
		$(window).on('hashchange.owl.navigation', $.proxy(function(e) {
			var hash = window.location.hash.substring(1),
				items = this._core.$stage.children(),
				position = this._hashes[hash] && items.index(this._hashes[hash]);

			if (position === undefined || position === this._core.current()) {
				return;
			}

			this._core.to(this._core.relative(position), false, true);
		}, this));
	};

	/**
	 * Default options.
	 * @public
	 */
	Hash.Defaults = {
		URLhashListener: false
	};

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Hash.prototype.destroy = function() {
		var handler, property;

		$(window).off('hashchange.owl.navigation');

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Hash = Hash;

})(window.Zepto || window.jQuery, window, document);

/**
 * Support Plugin
 *
 * @version 2.0.0-beta.3
 * @author Vivid Planet Software GmbH
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	var style = $('<support>').get(0).style,
		prefixes = 'Webkit Moz O ms'.split(' '),
		events = {
			transition: {
				end: {
					WebkitTransition: 'webkitTransitionEnd',
					MozTransition: 'transitionend',
					OTransition: 'oTransitionEnd',
					transition: 'transitionend'
				}
			},
			animation: {
				end: {
					WebkitAnimation: 'webkitAnimationEnd',
					MozAnimation: 'animationend',
					OAnimation: 'oAnimationEnd',
					animation: 'animationend'
				}
			}
		},
		tests = {
			csstransforms: function() {
				return !!test('transform');
			},
			csstransforms3d: function() {
				return !!test('perspective');
			},
			csstransitions: function() {
				return !!test('transition');
			},
			cssanimations: function() {
				return !!test('animation');
			}
		};

	function test(property, prefixed) {
		var result = false,
			upper = property.charAt(0).toUpperCase() + property.slice(1);

		$.each((property + ' ' + prefixes.join(upper + ' ') + upper).split(' '), function(i, property) {
			if (style[property] !== undefined) {
				result = prefixed ? property : true;
				return false;
			}
		});

		return result;
	}

	function prefixed(property) {
		return test(property, true);
	}

	if (tests.csstransitions()) {
		/* jshint -W053 */
		$.support.transition = new String(prefixed('transition'))
		$.support.transition.end = events.transition.end[ $.support.transition ];
	}

	if (tests.cssanimations()) {
		/* jshint -W053 */
		$.support.animation = new String(prefixed('animation'))
		$.support.animation.end = events.animation.end[ $.support.animation ];
	}

	if (tests.csstransforms()) {
		/* jshint -W053 */
		$.support.transform = new String(prefixed('transform'));
		$.support.transform3d = tests.csstransforms3d();
	}

})(window.Zepto || window.jQuery, window, document);

(function(window, document, undefined) {

    /**
     * Find the absolute position of an element
     */
    var absPos = function(element) {
        var offsetLeft, offsetTop;
        offsetLeft = offsetTop = 0;
        if (element.offsetParent) {
            do {
                offsetLeft += element.offsetLeft;
                offsetTop += element.offsetTop;
            } while (element = element.offsetParent);
        }
        return [offsetLeft, offsetTop];
    };

    /**
     * @constructor Progress Circle class
     * @param params.canvas Canvas on which the circles will be drawn.
     * @param params.minRadius Inner radius of the innermost circle, in px.
     * @param params.arcWidth Width of each circle(to be more accurate, ring).
     * @param params.gapWidth Space between each circle.
     * @param params.centerX X coordinate of the center of circles.
     * @param params.centerY Y coordinate of the center of circles.
     * @param params.infoLineBaseAngle Base angle of the info line.
     * @param params.infoLineAngleInterval Angles between the info lines.
     */
    var ProgressCircle = function(params) {
        this.canvas = params.canvas;
        this.minRadius = params.minRadius || 15;
        this.arcWidth = params.arcWidth || 5;
        this.gapWidth = params.gapWidth || 3;
        this.centerX = params.centerX || this.canvas.width / 2;
        this.centerY = params.centerY || this.canvas.height / 2;
        this.infoLineLength = params.infoLineLength || 60;
        this.horizLineLength = params.horizLineLength || 10;
        this.infoLineAngleInterval = params.infoLineAngleInterval || Math.PI / 8;
        this.infoLineBaseAngle = params.infoLineBaseAngle || Math.PI / 6;

        this.context = this.canvas.getContext('2d');

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.circles = [];
        this.runningCount = 0;
    };

    ProgressCircle.prototype = {
        constructor: ProgressCircle,

        /**
         * @method Adds an progress monitor entry.
         * @param params.fillColor Color to fill in the circle.
         * @param params.outlineColor Color to outline the circle.
         * @param params.progressListener Callback function to fetch the progress.
         * @param params.infoListener Callback function to fetch the info.
         * @returns this
         */
        addEntry: function(params) {
            this.circles.push(new Circle({
                canvas: this.canvas,
                context: this.context,
                centerX: this.centerX,
                centerY: this.centerY,
                innerRadius: this.minRadius + this.circles.length *
                    (this.gapWidth + this.arcWidth),
                arcWidth: this.arcWidth,
                infoLineLength: this.infoLineLength,
                horizLineLength: this.horizLineLength,

                id: this.circles.length,
                fillColor: params.fillColor,
                outlineColor: params.outlineColor,
                progressListener: params.progressListener,
                infoListener: params.infoListener,
                infoLineAngle: this.infoLineBaseAngle +
                    this.circles.length * this.infoLineAngleInterval,
            }));

            return this;
        },

        /**
         * @method Starts the monitor and updates with the given interval.
         * @param interval Interval between updates, in millisecond.
         * @returns this
         */
        start: function(interval) {
            var self = this;
            this.timer = setInterval(function() {
                self._update();
            }, interval || 33);

            return this;
        },

        /**
         * @method Stop the animation.
         */
        stop: function() {
            clearTimeout(this.timer);
        },

        /**
         * @private
         * @method Call update on each circle and redraw them.
         * @returns this
         */
        _update: function() {
            this._clear();
            this.circles.forEach(function(circle, idx, array) {
                circle.update();
            });

            return this;
        },

        /**
         * @private
         * @method Clear the canvas.
         * @returns this
         */
        _clear: function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            return this;
        },

    };

    /**
     * @private
     * @class Individual progress circle.
     * @param params.canvas Canvas on which the circle will be drawn.
     * @param params.context Context of the canvas.
     * @param params.innerRadius Inner radius of the circle, in px.
     * @param params.arcWidth Width of each arc(circle).
     * @param params.gapWidth Distance between each arc.
     * @param params.centerX X coordinate of the center of circles.
     * @param params.centerY Y coordinate of the center of circles.
     * @param params.fillColor Color to fill in the circle.
     * @param params.outlineColor Color to outline the circle.
     * @param params.progressListener Callback function to fetch the progress.
     * @param params.infoListener Callback function to fetch the info.
     * @param params.infoLineAngle Angle of info line.
     */
    var Circle = function(params) {
        this.id = params.id;
        this.canvas = params.canvas;
        this.context = params.context;
        this.centerX = params.centerX;
        this.centerY = params.centerY;
        this.arcWidth = params.arcWidth;
        this.innerRadius = params.innerRadius || 0;
        this.fillColor = params.fillColor || '#fff';
        this.outlineColor = params.outlineColor || this.fillColor;
        this.progressListener = params.progressListener;
        this.infoLineLength = params.infoLineLength || 250;
        this.horizLineLength = params.horizLineLength || 50;
        this.infoListener = params.infoListener;
        this.infoLineAngle = params.infoLineAngle;

        this.outerRadius = this.innerRadius + this.arcWidth;

        // If the info listener is not registered, then don't calculate
        // the related coordinates
        if (!this.infoListener) return;

        // calculate the info-line turning points
        var angle = this.infoLineAngle,
            arcDistance = (this.innerRadius + this.outerRadius) / 2,

            sinA = Math.sin(angle),
            cosA = Math.cos(angle);

        this.infoLineStartX = this.centerX + sinA * arcDistance;
        this.infoLineStartY = this.centerY - cosA * arcDistance;

        this.infoLineMidX = this.centerX + sinA * this.infoLineLength;
        this.infoLineMidY = this.centerY - cosA * this.infoLineLength;

        this.infoLineEndX = this.infoLineMidX +
             (sinA < 0 ? -this.horizLineLength : this.horizLineLength);
        this.infoLineEndY = this.infoLineMidY;

        var infoText = document.createElement('div'),
            style = infoText.style;

        style.color = this.fillColor;
        style.position = 'absolute';
        style.left = this.infoLineEndX + absPos(this.canvas)[0] + 'px';
        // style.top will be calculated in the `drawInfo` method. Since
        // user may want to change the size of the font, so the top offset
        // must be updated in each loop.
        infoText.className = 'ProgressCircleInfo'; // For css styling
        infoText.id = 'progress_circle_info_' + this.id;
        document.body.appendChild(infoText);
        this.infoText = infoText;
    };

    Circle.prototype = {
        constructor: Circle,

        update: function() {
            this.progress = this.progressListener();
            this._draw();

            if (this.infoListener) {
                this.info = this.infoListener();
                this._drawInfo();
            }
        },

        /**
         * @private
         * @method Draw the circle on the canvas.
         * @returns this
         */
        _draw: function() {
            var ctx = this.context,

                ANGLE_OFFSET = -Math.PI / 2,

                startAngle = 0 + ANGLE_OFFSET,
                endAngle= startAngle + this.progress * Math.PI * 2,

                x = this.centerX,
                y = this.centerY,

                innerRadius = this.innerRadius - this.arcWidth - 1,
                outerRadius = this.outerRadius - this.arcWidth - 1;

            ctx.fillStyle = this.fillColor;
            ctx.strokeStyle = this.outlineColor;

            ctx.beginPath();
            ctx.arc(x, y, innerRadius, startAngle, endAngle, false);
            ctx.arc(x, y, outerRadius, endAngle, startAngle, true);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            return this;
        },

        /**
         * @private
         * @method Draw the info lines and info text.
         * @returns this
         */
        _drawInfo: function() {

            var pointList, lineHeight;

            pointList = [
                [this.infoLineStartX, this.infoLineStartY],
                [this.infoLineMidX, this.infoLineMidY],
                [this.infoLineEndX, this.infoLineEndY],
            ];
            this._drawSegments(pointList, false);

            this.infoText.innerHTML = this.info;

            lineHeight = this.infoText.offsetHeight;
            this.infoText.style.top = this.infoLineEndY +
                absPos(this.canvas)[1] - lineHeight / 2 + 'px';

            return this;
        },

        /**
         * @private
         * @method Helper function to draw the segments
         * @param pointList An array of points in the form of [x, y].
         * @param close Whether to connect the first and last point.
         */
        _drawSegments: function(pointList, close) {
            var ctx = this.context;

            ctx.beginPath();
            ctx.moveTo(pointList[0][0], pointList[0][1]);
            for (var i = 1; i < pointList.length; ++i) {
                ctx.lineTo(pointList[i][0], pointList[i][1]);
            }

            if (close) {
                ctx.closePath();
            }
            ctx.stroke();
        },
    };

    window.ProgressCircle = ProgressCircle;

})(window, document);




/* =========================================================
 * jquery.vc_chart.js v1.0
 * =========================================================
 * Copyright 2013 Wpbakery
 *
 * Jquery chart plugin for the Visual Composer.
 * ========================================================= */
(function($){
    /**
     * Pie chart animated.
     * @param element - DOM element
     * @param options - settings object.
     * @constructor
     */
    var VcChart = function(element, options) {
        this.el = element;
        this.$el = $(this.el);
        this.options = $.extend({
            color: 'wpb_button',
            units: '',
            width: '',
            label_selector: '.vc_pie_chart_value',
            back_selector: '.vc_pie_chart_back',
            responsive: true
        }, options);
        this.init();
    };
    VcChart.prototype = {
        constructor: VcChart,
        _progress_v: 0,
        animated: false,
        colors: {
            'wpb_button': 'rgba(247, 247, 247, 1)',
            'btn-primary': 'rgba(0, 136, 204, 1)',
            'btn-info': 'rgba(88, 185, 218, 1)',
            'btn-success': 'rgba(106, 177, 101, 1)',
            'btn-warning': 'rgba(255, 153, 0, 1)',
            'btn-danger': 'rgba(255, 103, 91, 1)',
            'btn-inverse': 'rgba(85, 85, 85, 1)'
        },
        init: function() {
            this.setupColor();
            this.value = this.$el.data('pie-value')/100;
            this.label_value = this.$el.data('pie-label-value') || this.$el.data('pie-value');
            this.$wrapper = $('.vc_pie_wrapper', this.$el);
            this.$label = $(this.options.label_selector, this.$el);
            this.$back = $(this.options.back_selector, this.$el);
            this.$canvas = this.$el.find('canvas');
            this.arcWidth = this.$el.data('pie-width') * 2;
            this.draw();
            this.setWayPoint();
            if(this.options.responsive === true) this.setResponsive();
            if (UNCODE.isMobile) this._progress_v = this.value;
        },
        setupColor: function() {
            // if(typeof this.colors[this.options.color] !== 'undefined') {
            //     this.color = this.colors[this.options.color];
            // } else if(typeof this.options.color === 'string' && this.options.color.match(/^rgba?\([^\)]+\)/)) {
            //     this.color = this.options.color;
            // } else {
            //     this.color = 'rgba(247, 247, 247, 0.2)';
            // }
            if(typeof this.options.color !== 'undefined') {
                this.color = this.options.color;
            } else this.color = 'rgba(247, 247, 247, 0.2)';

        },
        setResponsive: function() {
            var that = this;
            if (!UNCODE.isMobile) {
                $(window).resize(function(){
                    if(that.animated === true) that.circle.stop();
                    that.draw(true);
                });
            }
        },
          draw: function(redraw) {
            var w = this.$el.addClass('vc_ready').width() * 2,
                border_w = this.arcWidth,
                radius;
            if(!w) w = this.$el.parents(':visible').first().width()-2;
            //w = Math.round(w/100*80);
            //if (w < 250) w = 250;
            radius = w/2;
            this.$wrapper.css({"width" : (w / 2) + "px"});
            this.$label.css({"width" : (w / 2), "height" : (w / 2), "line-height" : (w / 2)+"px"});
            this.$back.css({"width" : (w / 2), "height" : (w / 2)});
            this.$canvas.attr({"width" : w + "px", "height" : w + "px"});
            this.$el.addClass('vc_ready');
            this.circle = new ProgressCircle({
                canvas: this.$canvas.get(0),
                minRadius: radius,
                arcWidth: border_w
            });
            if(redraw === true && this.animated === true) {
                this._progress_v = this.value;
                this.circle.addEntry({
                    fillColor: this.color,
                    progressListener: $.proxy(this.setProgress, this)
                }).start();
            }
        },
        setProgress: function() {
            if (this._progress_v >= this.value) {
                this.circle.stop();
                this.$label.html(this.label_value + this.options.units);
                return this._progress_v;
            }
            this._progress_v += 0.01;
            if (!isNaN(this.label_value)) {
                var label_value = this._progress_v/this.value*this.label_value;
                var val = Math.round(label_value) + this.options.units;
                this.$label.html(val);
            } else this.$label.html(this.label_value + this.options.units);
            return this._progress_v;
        },
        animate: function() {
            if(this.animated !== true) {
                this.animated = true;
                this.circle.addEntry({
                    fillColor: this.color,
                    progressListener: $.proxy(this.setProgress, this)
                }).start(5);
            }
        },
        setWayPoint: function() {
            if (typeof $.fn.waypoint !== 'undefined' && !UNCODE.isMobile) {
                this.$el.waypoint($.proxy(this.animate, this), { offset: '85%' });
            } else {
                this.animate();
            }
        }
    };
    /**
     * jQuery plugin
     * @param option - object with settings
     * @return {*}
     */
    $.fn.vcChat = function(option, value) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('vc_chart'),
                options = typeof option === 'object' ? option : {
                    color: $this.data('pie-color'),
                    units: $this.data('pie-units')
                };
            if (typeof option == 'undefined') $this.data('vc_chart', (data = new VcChart(this, options)));
            if (typeof option == 'string') data[option](value);
        });
    };
    /**
     * Allows users to rewrite function inside theme.
     */
    if ( typeof window['vc_pieChart'] !== 'function' ) {
        window.vc_pieChart = function() {
            $('.vc_pie_chart:visible').vcChat();
        }
    }
    $(document).ready(function(){
        !window.vc_iframe && vc_pieChart();
    });

})(window.jQuery);


/* Progress bar
 ---------------------------------------------------------- */
function uncode_progress_bar() {    
	jQuery.each(jQuery('.vc_progress_bar'), function(index, val) {
		if (!UNCODE.isMobile) {
			new Waypoint({
				element: val,
				handler: function() {
					var element = jQuery(this.element);
					element.find('.vc_single_bar').each(function(index) {          
						var $this = jQuery(this),
							            bar = $this.find('.vc_bar'),
							            val = bar.data('percentage-value');          
						setTimeout(function() {            
							bar.css({
								"width": val + '%'
							});          
						}, index * 200);        
					});
				},
				offset: '80%'
			});
		} else {
			var element = jQuery(val);
			element.find('.vc_single_bar').each(function(index) {          
				var $this = jQuery(this),
					            bar = $this.find('.vc_bar'),
					            val = bar.data('percentage-value');          
				setTimeout(function() {            
					bar.css({
						"width": val + '%'
					});          
				}, index * 200);        
			});
		}
	});
};
uncode_progress_bar();

/*!
 * jquery.counterup.js 1.0
 *
 * Copyright 2013, Benjamin Intal http://gambit.ph @bfintal
 * Released under the GPL v2 License
 *
 * Date: Nov 26, 2013
 */
(function($) {
	"use strict";
	$.fn.counterUp = function(options) {
		// Defaults
		var settings = $.extend({
			'time': 400,
			'delay': 10
		}, options);
		return this.each(function() {
			// Store the object
			var $this = $(this);
			var $settings = settings;
			var counterUpper = function() {
				var nums = [];
				var divisions = $settings.time / $settings.delay;
				var numReal = $this.text(),
				num = numReal;
				var isComma = /[0-9]+,[0-9]+/.test(num);
				num = num.replace(/,/g, '');
				var isInt = /^[0-9]+$/.test(num);
				var isFloat = /^[0-9]+\.[0-9]+$/.test(num);
				var decimalPlaces = isFloat ? (num.split('.')[1] || []).length : 0;
				// Generate list of incremental numbers to display
				for (var i = divisions; i >= 1; i--) {
					// Preserve as int if input was int
					var newNum = parseInt(num / divisions * i);
					// Preserve float if input was float
					if (isFloat) {
						newNum = parseFloat(num / divisions * i).toFixed(decimalPlaces);
					}
					// Preserve commas if input had commas
					if (isComma) {
						while (/(\d+)(\d{3})/.test(newNum.toString())) {
							newNum = newNum.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
						}
					}
					nums.unshift(newNum);
				}
				nums.push(numReal);
				$this.data('counterup-nums', nums);
				$this.text('0');
				// Updates the number until we're done
				var f = function() {
					if ($this.data('counterup-nums') != null) {
						$this.text($this.data('counterup-nums').shift());
						if ($this.data('counterup-nums').length) {
							setTimeout($this.data('counterup-func'), $settings.delay);
						} else {
							delete $this.data('counterup-nums');
							$this.data('counterup-nums', null);
							$this.data('counterup-func', null);
						}
					}
				};
				$this.data('counterup-func', f);
				// Start the count up
				setTimeout($this.data('counterup-func'), $settings.delay);
			};
			// Perform counts when the element gets into view
			new Waypoint({
				element: this,
				handler: function() {
					counterUpper();
					this.destroy();
				},
				offset: '80%'
			});
		});
	};
})(jQuery);

/*!
 * The Final Countdown for jQuery v2.0.4 (http://hilios.github.io/jQuery.countdown/)
 * Copyright (c) 2014 Edson Hilios
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
!function(a){"use strict";"function"==typeof define&&define.amd?define(["jquery"],a):a(jQuery)}(function(a){"use strict";function b(a){if(a instanceof Date)return a;if(String(a).match(h))return String(a).match(/^[0-9]*$/)&&(a=Number(a)),String(a).match(/\-/)&&(a=String(a).replace(/\-/g,"/")),new Date(a);throw new Error("Couldn't cast `"+a+"` to a date object.")}function c(a){var b=a.toString().replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1");return new RegExp(b)}function d(a){return function(b){var d=b.match(/%(-|!)?[A-Z]{1}(:[^;]+;)?/gi);if(d)for(var f=0,g=d.length;g>f;++f){var h=d[f].match(/%(-|!)?([a-zA-Z]{1})(:[^;]+;)?/),j=c(h[0]),k=h[1]||"",l=h[3]||"",m=null;h=h[2],i.hasOwnProperty(h)&&(m=i[h],m=Number(a[m])),null!==m&&("!"===k&&(m=e(l,m)),""===k&&10>m&&(m="0"+m.toString()),b=b.replace(j,m.toString()))}return b=b.replace(/%%/,"%")}}function e(a,b){var c="s",d="";return a&&(a=a.replace(/(:|;|\s)/gi,"").split(/\,/),1===a.length?c=a[0]:(d=a[0],c=a[1])),1===Math.abs(b)?d:c}var f=100,g=[],h=[];h.push(/^[0-9]*$/.source),h.push(/([0-9]{1,2}\/){2}[0-9]{4}( [0-9]{1,2}(:[0-9]{2}){2})?/.source),h.push(/[0-9]{4}([\/\-][0-9]{1,2}){2}( [0-9]{1,2}(:[0-9]{2}){2})?/.source),h=new RegExp(h.join("|"));var i={Y:"years",m:"months",w:"weeks",d:"days",D:"totalDays",H:"hours",M:"minutes",S:"seconds"},j=function(b,c,d){this.el=b,this.$el=a(b),this.interval=null,this.offset={},this.instanceNumber=g.length,g.push(this),this.$el.data("countdown-instance",this.instanceNumber),d&&(this.$el.on("update.countdown",d),this.$el.on("stoped.countdown",d),this.$el.on("finish.countdown",d)),this.setFinalDate(c),this.start()};a.extend(j.prototype,{start:function(){null!==this.interval&&clearInterval(this.interval);var a=this;this.update(),this.interval=setInterval(function(){a.update.call(a)},f)},stop:function(){clearInterval(this.interval),this.interval=null,this.dispatchEvent("stoped")},toggle:function(){this.interval?this.stop():this.start()},pause:function(){this.stop()},resume:function(){this.start()},remove:function(){this.stop.call(this),g[this.instanceNumber]=null,delete this.$el.data().countdownInstance},setFinalDate:function(a){this.finalDate=b(a)},update:function(){return 0===this.$el.closest("html").length?void this.remove():(this.totalSecsLeft=this.finalDate.getTime()-(new Date).getTime(),this.totalSecsLeft=Math.ceil(this.totalSecsLeft/1e3),this.totalSecsLeft=this.totalSecsLeft<0?0:this.totalSecsLeft,this.offset={seconds:this.totalSecsLeft%60,minutes:Math.floor(this.totalSecsLeft/60)%60,hours:Math.floor(this.totalSecsLeft/60/60)%24,days:Math.floor(this.totalSecsLeft/60/60/24)%7,totalDays:Math.floor(this.totalSecsLeft/60/60/24),weeks:Math.floor(this.totalSecsLeft/60/60/24/7),months:Math.floor(this.totalSecsLeft/60/60/24/30),years:Math.floor(this.totalSecsLeft/60/60/24/365)},void(0===this.totalSecsLeft?(this.stop(),this.dispatchEvent("finish")):this.dispatchEvent("update")))},dispatchEvent:function(b){var c=a.Event(b+".countdown");c.finalDate=this.finalDate,c.offset=a.extend({},this.offset),c.strftime=d(this.offset),this.$el.trigger(c)}}),a.fn.countdown=function(){var b=Array.prototype.slice.call(arguments,0);return this.each(function(){var c=a(this).data("countdown-instance");if(void 0!==c){var d=g[c],e=b[0];j.prototype.hasOwnProperty(e)?d[e].apply(d,b.slice(1)):null===String(e).match(/^[$A-Z_][0-9A-Z_$]*$/i)?(d.setFinalDate.call(d,e),d.start()):a.error("Method %s does not exist on jQuery.countdown".replace(/\%s/gi,e))}else new j(this,b[0],b[1])})}});

/*! waitForImages jQuery Plugin - v2.0.2 - 2015-05-05
* https://github.com/alexanderdickson/waitForImages
* Copyright (c) 2015 Alex Dickson; Licensed MIT */
;(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS / nodejs module
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    // Namespace all events.
    var eventNamespace = 'waitForImages';

    // CSS properties which contain references to images.
    $.waitForImages = {
        hasImageProperties: [
            'backgroundImage',
            'listStyleImage',
            'borderImage',
            'borderCornerImage',
            'cursor'
        ],
        hasImageAttributes: ['srcset']
    };

    // Custom selector to find `img` elements that have a valid `src`
    // attribute and have not already loaded.
    $.expr[':'].uncached = function (obj) {
        // Ensure we are dealing with an `img` element with a valid
        // `src` attribute.
        if (!$(obj).is('img[src][src!=""]')) {
            return false;
        }

        return !obj.complete;
    };

    $.fn.waitForImages = function () {

        var allImgsLength = 0;
        var allImgsLoaded = 0;
        var deferred = $.Deferred();

        var finishedCallback;
        var eachCallback;
        var waitForAll;

        // Handle options object (if passed).
        if ($.isPlainObject(arguments[0])) {

            waitForAll = arguments[0].waitForAll;
            eachCallback = arguments[0].each;
            finishedCallback = arguments[0].finished;

        } else {

            // Handle if using deferred object and only one param was passed in.
            if (arguments.length === 1 && $.type(arguments[0]) === 'boolean') {
                waitForAll = arguments[0];
            } else {
                finishedCallback = arguments[0];
                eachCallback = arguments[1];
                waitForAll = arguments[2];
            }

        }

        // Handle missing callbacks.
        finishedCallback = finishedCallback || $.noop;
        eachCallback = eachCallback || $.noop;

        // Convert waitForAll to Boolean
        waitForAll = !! waitForAll;

        // Ensure callbacks are functions.
        if (!$.isFunction(finishedCallback) || !$.isFunction(eachCallback)) {
            throw new TypeError('An invalid callback was supplied.');
        }

        this.each(function () {
            // Build a list of all imgs, dependent on what images will
            // be considered.
            var obj = $(this);
            var allImgs = [];
            // CSS properties which may contain an image.
            var hasImgProperties = $.waitForImages.hasImageProperties || [];
            // Element attributes which may contain an image.
            var hasImageAttributes = $.waitForImages.hasImageAttributes || [];
            // To match `url()` references.
            // Spec: http://www.w3.org/TR/CSS2/syndata.html#value-def-uri
            var matchUrl = /url\(\s*(['"]?)(.*?)\1\s*\)/g;

            if (waitForAll) {

                // Get all elements (including the original), as any one of
                // them could have a background image.
                obj.find('*').addBack().each(function () {
                    var element = $(this);

                    // If an `img` element, add it. But keep iterating in
                    // case it has a background image too.
                    if (element.is('img:uncached')) {
                        allImgs.push({
                            src: element.attr('src'),
                            element: element[0]
                        });
                    }

                    $.each(hasImgProperties, function (i, property) {
                        var propertyValue = element.css(property);
                        var match;

                        // If it doesn't contain this property, skip.
                        if (!propertyValue) {
                            return true;
                        }

                        // Get all url() of this element.
                        while (match = matchUrl.exec(propertyValue)) {
                            allImgs.push({
                                src: match[2],
                                element: element[0]
                            });
                        }
                    });

                    $.each(hasImageAttributes, function (i, attribute) {
                        var attributeValue = element.attr(attribute);
                        var attributeValues;

                        // If it doesn't contain this property, skip.
                        if (!attributeValue) {
                            return true;
                        }

                        // Check for multiple comma separated images
                        attributeValues = attributeValue.split(',');

                        $.each(attributeValues, function(i, value) {
                            // Trim value and get string before first
                            // whitespace (for use with srcset).
                            value = $.trim(value).split(' ')[0];
                            allImgs.push({
                                src: value,
                                element: element[0]
                            });
                        });
                    });
                });
            } else {
                // For images only, the task is simpler.
                obj.find('img:uncached')
                    .each(function () {
                    allImgs.push({
                        src: this.src,
                        element: this
                    });
                });
            }

            allImgsLength = allImgs.length;
            allImgsLoaded = 0;

            // If no images found, don't bother.
            if (allImgsLength === 0) {
                finishedCallback.call(obj[0]);
                deferred.resolveWith(obj[0]);
            }

            $.each(allImgs, function (i, img) {

                var image = new Image();
                var events =
                  'load.' + eventNamespace + ' error.' + eventNamespace;

                // Handle the image loading and error with the same callback.
                $(image).one(events, function me (event) {
                    // If an error occurred with loading the image, set the
                    // third argument accordingly.
                    var eachArguments = [
                        allImgsLoaded,
                        allImgsLength,
                        event.type == 'load'
                    ];
                    allImgsLoaded++;

                    eachCallback.apply(img.element, eachArguments);
                    deferred.notifyWith(img.element, eachArguments);

                    // Unbind the event listeners. I use this in addition to
                    // `one` as one of those events won't be called (either
                    // 'load' or 'error' will be called).
                    $(this).off(events, me);

                    if (allImgsLoaded == allImgsLength) {
                        finishedCallback.call(obj[0]);
                        deferred.resolveWith(obj[0]);
                        return false;
                    }

                });

                image.src = img.src;
            });
        });

        return deferred.promise();

    };
}));

/**
 * @preserve  textfill
 * @name      jquery.textfill.js
 * @author    Russ Painter
 * @author    Yu-Jie Lin
 * @author    Alexandre Dantas
 * @version   0.6.0
 * @date      2014-08-19
 * @copyright (c) 2014 Alexandre Dantas
 * @copyright (c) 2012-2013 Yu-Jie Lin
 * @copyright (c) 2009 Russ Painter
 * @license   MIT License
 * @homepage  https://github.com/jquery-textfill/jquery-textfill
 * @example   http://jquery-textfill.github.io/jquery-textfill/index.html
 */
; (function($) {

	/**
	 * Resizes an inner element's font so that the
	 * inner element completely fills the outer element.
	 *
	 * @param {Object} options User options that take
	 *                         higher precedence when
	 *                         merging with the default ones.
	 *
	 * @return All outer elements processed
	 */
	$.fn.textfill = function(options) {

		// ______  _______ _______ _______ _     _        _______ _______
		// |     \ |______ |______ |_____| |     | |         |    |______
		// |_____/ |______ |       |     | |_____| |_____    |    ______|
        //
		// Merging user options with the default values

		var defaults = {
			debug            : false,
			maxFontPixels    : 40,
			minFontPixels    : 4,
			innerTag         : 'span',
			widthOnly        : false,
			success          : null, // callback when a resizing is done
			callback         : null, // callback when a resizing is done (deprecated, use success)
			fail             : null, // callback when a resizing is failed
			complete         : null, // callback when all is done
			explicitWidth    : null,
			explicitHeight   : null,
			changeLineHeight : false
		};

		var Opts = $.extend(defaults, options);

		// _______ _     _ __   _ _______ _______ _____  _____  __   _ _______
		// |______ |     | | \  | |          |      |   |     | | \  | |______
		// |       |_____| |  \_| |_____     |    __|__ |_____| |  \_| ______|
		//
		// Predefining the awesomeness

		// Output arguments to the Debug console
		// if "Debug Mode" is enabled
		function _debug() {
			if (!Opts.debug
				||  typeof console       == 'undefined'
				||  typeof console.debug == 'undefined') {
				return;
			}
			console.debug.apply(console, arguments);
		}

		// Output arguments to the Warning console
		function _warn() {
			if (typeof console      == 'undefined' ||
				typeof console.warn == 'undefined') {
				return;
			}
			console.warn.apply(console, arguments);
		}

		// Outputs all information on the current sizing
		// of the font.
		function _debug_sizing(prefix, ourText, maxHeight, maxWidth, minFontPixels, maxFontPixels) {

			function _m(v1, v2) {

				var marker = ' / ';

				if (v1 > v2)
					marker = ' > ';

				else if (v1 == v2)
					marker = ' = ';

				return marker;
			}

			_debug(
				'[TextFill] '  + prefix + ' { ' +
				'font-size: ' + ourText.css('font-size') + ',' +
				'Height: '    + ourText.height() + 'px ' + _m(ourText.height(), maxHeight) + maxHeight + 'px,' +
				'Width: '     + ourText.width()  + _m(ourText.width() , maxWidth)  + maxWidth + ',' +
				'minFontPixels: ' + minFontPixels + 'px, ' +
				'maxFontPixels: ' + maxFontPixels + 'px }'
			);
		}

		/**
		 * Calculates which size the font can get resized,
		 * according to constrains.
		 *
		 * @param {String} prefix Gets shown on the console before
		 *                        all the arguments, if debug mode is on.
		 * @param {Object} ourText The DOM element to resize,
		 *                         that contains the text.
		 * @param {function} func Function called on `ourText` that's
		 *                        used to compare with `max`.
		 * @param {number} max Maximum value, that gets compared with
		 *                     `func` called on `ourText`.
		 * @param {number} minFontPixels Minimum value the font can
		 *                               get resized to (in pixels).
		 * @param {number} maxFontPixels Maximum value the font can
		 *                               get resized to (in pixels).
		 *
		 * @return Size (in pixels) that the font can be resized.
		 */
		function _sizing(prefix, ourText, func, max, maxHeight, maxWidth, minFontPixels, maxFontPixels) {

			_debug_sizing(
				prefix, ourText,
				maxHeight, maxWidth,
				minFontPixels, maxFontPixels
			);

			// The kernel of the whole plugin, take most attention
			// on this part.
			//
			// This is a loop that keeps increasing the `font-size`
			// until it fits the parent element.
			//
			// - Start from the minimal allowed value (`minFontPixels`)
			// - Guesses an average font size (in pixels) for the font,
			// - Resizes the text and sees if its size is within the
			//   boundaries (`minFontPixels` and `maxFontPixels`).
			//   - If so, keep guessing until we break.
			//   - If not, return the last calculated size.
			//
			// I understand this is not optimized and we should
			// consider implementing something akin to
			// Daniel Hoffmann's answer here:
			//
			//     http://stackoverflow.com/a/17433451/1094964
			//

			while (minFontPixels < (maxFontPixels - 1)) {

				var fontSize = Math.floor((minFontPixels + maxFontPixels) / 2);
				ourText.css('font-size', fontSize);

				if (func.call(ourText) <= max) {
					minFontPixels = fontSize;

					if (func.call(ourText) == max)
						break;
				}
				else
					maxFontPixels = fontSize;

				_debug_sizing(
					prefix, ourText,
					maxHeight, maxWidth,
					minFontPixels, maxFontPixels
				);
			}

			ourText.css('font-size', maxFontPixels);

			if (func.call(ourText) <= max) {
				minFontPixels = maxFontPixels;

				_debug_sizing(
					prefix + '* ', ourText,
					maxHeight, maxWidth,
					minFontPixels, maxFontPixels
				);
			}
			return minFontPixels;
		}

		// _______ _______ _______  ______ _______
		// |______    |    |_____| |_____/    |
		// ______|    |    |     | |    \_    |
        //
		// Let's get it started (yeah)!

		_debug('[TextFill] Start Debug');

		this.each(function() {

			// Contains the child element we will resize.
			// $(this) means the parent container
			var ourText = $(Opts.innerTag + ':visible:first', this);

			// Will resize to this dimensions.
			// Use explicit dimensions when specified
			var maxHeight = Opts.explicitHeight || $(this).height();
			var maxWidth  = Opts.explicitWidth  || $(this).width();

			var oldFontSize = ourText.css('font-size');

			var lineHeight  = parseFloat(ourText.css('line-height')) / parseFloat(oldFontSize);

			_debug('[TextFill] Inner text: ' + ourText.text());
			_debug('[TextFill] All options: ', Opts);
			_debug('[TextFill] Maximum sizes: { ' +
				   'Height: ' + maxHeight + 'px, ' +
				   'Width: '  + maxWidth  + 'px' + ' }'
				  );

			var minFontPixels = Opts.minFontPixels;

			// Remember, if this `maxFontPixels` is negative,
			// the text will resize to as long as the container
			// can accomodate
			var maxFontPixels = (Opts.maxFontPixels <= 0 ?
								 maxHeight :
								 Opts.maxFontPixels);


			// Let's start it all!

			// 1. Calculate which `font-size` would
			//    be best for the Height
			var fontSizeHeight = undefined;

			if (! Opts.widthOnly)
				fontSizeHeight = _sizing(
					'Height', ourText,
					$.fn.height, maxHeight,
					maxHeight, maxWidth,
					minFontPixels, maxFontPixels
				);

			// 2. Calculate which `font-size` would
			//    be best for the Width
			var fontSizeWidth = undefined;

			fontSizeWidth = _sizing(
				'Width', ourText,
				$.fn.width, maxWidth,
				maxHeight, maxWidth,
				minFontPixels, maxFontPixels
			);

			// 3. Actually resize the text!

			if (Opts.widthOnly) {
				ourText.css({
					'font-size'  : fontSizeWidth,
					'white-space': 'nowrap'
				});

				if (Opts.changeLineHeight)
					ourText.parent().css(
						'line-height',
						(lineHeight * fontSizeWidth + 'px')
					);
			}
			else {
				var fontSizeFinal = Math.min(fontSizeHeight, fontSizeWidth);

				ourText.css('font-size', fontSizeFinal);

				if (Opts.changeLineHeight)
					ourText.parent().css(
						'line-height',
						(lineHeight * fontSizeFinal) + 'px'
					);
			}

			_debug(
				'[TextFill] Finished { ' +
				'Old font-size: ' + oldFontSize              + ', ' +
				'New font-size: ' + ourText.css('font-size') + ' }'
			);

			// Oops, something wrong happened!
			// We weren't supposed to exceed the original size
			if ((ourText.width()  > maxWidth) ||
				(ourText.height() > maxHeight && !Opts.widthOnly)) {

				ourText.css('font-size', oldFontSize);

				// Failure callback
				if (Opts.fail)
					Opts.fail(this);

				_debug(
					'[TextFill] Failure { ' +
					'Current Width: '  + ourText.width()  + ', ' +
					'Maximum Width: '  + maxWidth         + ', ' +
					'Current Height: ' + ourText.height() + ', ' +
					'Maximum Height: ' + maxHeight        + ' }'
				);
			}
			else if (Opts.success) {
				Opts.success(this);
			}
			else if (Opts.callback) {
				_warn('callback is deprecated, use success, instead');

				// Success callback
				Opts.callback(this);
			}
		});

		// Complete callback
		if (Opts.complete)
			Opts.complete(this);

		_debug('[TextFill] End Debug');
		return this;
	};

})(window.jQuery);


!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Share=e()}}(function(){var define,module,exports;
function getStyles(config){
  // return ""+config.selector+"{width:92px;height:20px;-webkit-touch-callout:none;-khtml-user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}"+config.selector+" [class*=social-]:before{font-family:'uncodeicon'}"+config.selector+" label{font-size:16px;cursor:pointer;margin:0;padding:5px 10px;border-radius:5px;background:#a29baa;-webkit-transition:all .3s ease-in-out;transition:all .3s ease-in-out}"+config.selector+" label:hover{opacity:.8}"+config.selector+" label span{text-transform:uppercase;font-size:.9em;font-family:Lato,sans-serif;font-weight:700;-webkit-font-smoothing:antialiased;padding-left:6px}"+config.selector+" .social{opacity:0;-webkit-transition:all .2s ease-in-out;transition:all .2s ease-in-out;margin-left:-15px;visibility:hidden}"+config.selector+" .social.top{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0;margin-top:-80px}"+config.selector+" .social.bottom{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0;margin-top:5px}"+config.selector+" .social.middle{margin-top:-34px}"+config.selector+" .social.middle.right{-webkit-transform-origin:5% 50%;-ms-transform-origin:5% 50%;transform-origin:5% 50%;margin-left:105px}"+config.selector+" .social.middle.left{-webkit-transform-origin:5% 50%;-ms-transform-origin:5% 50%;transform-origin:5% 50%}"+config.selector+" .social.right{margin-left:14px}"+config.selector+" .social.load{-webkit-transition:none!important;transition:none!important}"+config.selector+" .social.networks-1{width:60px}"+config.selector+" .social.networks-1.center,"+config.selector+" .social.networks-1.left{margin-left:14px}"+config.selector+" .social.networks-1.middle.left{margin-left:-70px}"+config.selector+" .social.networks-1 ul{width:60px}"+config.selector+" .social.networks-2{width:120px}"+config.selector+" .social.networks-2.center{margin-left:-13px}"+config.selector+" .social.networks-2.left{margin-left:-44px}"+config.selector+" .social.networks-2.middle.left{margin-left:-130px}"+config.selector+" .social.networks-2 ul{width:120px}"+config.selector+" .social.networks-3{width:180px}"+config.selector+" .social.networks-3.center{margin-left:-45px}"+config.selector+" .social.networks-3.left{margin-left:-102px}"+config.selector+" .social.networks-3.middle.left{margin-left:-190px}"+config.selector+" .social.networks-3 ul{width:180px}"+config.selector+" .social.networks-4{width:240px}"+config.selector+" .social.networks-4.center{margin-left:-75px}"+config.selector+" .social.networks-4.left{margin-left:162px}"+config.selector+" .social.networks-4.middle.left{margin-left:-250px}"+config.selector+" .social.networks-4 ul{width:240px}"+config.selector+" .social.networks-5{width:300px}"+config.selector+" .social.networks-5.center{margin-left:-105px}"+config.selector+" .social.networks-5.left{margin-left:-225px}"+config.selector+" .social.networks-5.middle.left{margin-left:-320px}"+config.selector+" .social.networks-5 ul{width:300px}"+config.selector+" .social.active{opacity:1;-webkit-transition:all .2s ease-in-out;transition:all .2s ease-in-out;visibility:visible}"+config.selector+" .social.active.top{-webkit-transform:scale(1) translateY(-20px);-ms-transform:scale(1) translateY(-20px);transform:scale(1) translateY(-20px)}"+config.selector+" .social.active.bottom{-webkit-transform:scale(1) translateY(15px);-ms-transform:scale(1) translateY(15px);transform:scale(1) translateY(15px)}"+config.selector+" .social.active.middle.right{-webkit-transform:scale(1) translateX(10px);-ms-transform:scale(1) translateX(10px);transform:scale(1) translateX(10px)}"+config.selector+" .social.active.middle.left{-webkit-transform:scale(1) translateX(-20px);-ms-transform:scale(1) translateX(-20px);transform:scale(1) translateX(-20px)}"+config.selector+" .social ul{position:relative;left:0;right:0;height:46px;color:#fff;margin:auto;padding:0;list-style:none}"+config.selector+" .social ul li{font-size:20px;cursor:pointer;width:60px;margin:0;padding:12px 0;text-align:center;float:left;display:none;height:22px;position:relative;z-index:2;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;-webkit-transition:all .3s ease-in-out;transition:all .3s ease-in-out}"+config.selector+" .social ul li:hover{}"+config.selector+" .social li[class*=facebook]{display:"+config.networks.facebook.display+"}"+config.selector+" .social li[class*=twitter]{display:"+config.networks.twitter.display+"}"+config.selector+" .social li[class*=gplus]{display:"+config.networks.google_plus.display+"}"+config.selector+" .social li[class*=pinterest]{display:"+config.networks.pinterest.display+"}"+config.selector+" .social li[class*=paper-plane]{display:"+config.networks.email.display+"}"
};
  var ShareUtils;

if ((!("classList" in document.documentElement)) && Object.defineProperty && typeof HTMLElement !== "undefined") {
  Object.defineProperty(HTMLElement.prototype, "classList", {
    get: function() {
      var ret, self, update;
      update = function(fn) {
        return function(value) {
          var classes, index;
          classes = self.className.split(/\s+/);
          index = classes.indexOf(value);
          fn(classes, index, value);
          self.className = classes.join(" ");
        };
      };
      self = this;
      ret = {
        add: update(function(classes, index, value) {
          ~index || classes.push(value);
        }),
        remove: update(function(classes, index) {
          ~index && classes.splice(index, 1);
        }),
        toggle: update(function(classes, index, value) {
          if (~index) {
            classes.splice(index, 1);
          } else {
            classes.push(value);
          }
        }),
        contains: function(value) {
          return !!~self.className.split(/\s+/).indexOf(value);
        },
        item: function(i) {
          return self.className.split(/\s+/)[i] || null;
        }
      };
      Object.defineProperty(ret, "length", {
        get: function() {
          return self.className.split(/\s+/).length;
        }
      });
      return ret;
    }
  });
}

String.prototype.to_rfc3986 = function() {
  var tmp;
  tmp = encodeURIComponent(this);
  return tmp.replace(/[!'()*]/g, function(c) {
    return "%" + c.charCodeAt(0).toString(16);
  });
};

ShareUtils = (function() {
  function ShareUtils() {}

  ShareUtils.prototype.extend = function(to, from, overwrite) {
    var hasProp, prop;
    for (prop in from) {
      hasProp = to[prop] !== undefined;
      if (hasProp && typeof from[prop] === "object") {
        this.extend(to[prop], from[prop], overwrite);
      } else {
        if (overwrite || !hasProp) {
          to[prop] = from[prop];
        }
      }
    }
  };

  ShareUtils.prototype.hide = function(el) {
    return el.style.display = "none";
  };

  ShareUtils.prototype.show = function(el) {
    return el.style.display = "block";
  };

  ShareUtils.prototype.has_class = function(el, class_name) {
    return el.classList.contains(class_name);
  };

  ShareUtils.prototype.add_class = function(el, class_name) {
    return el.classList.add(class_name);
  };

  ShareUtils.prototype.remove_class = function(el, class_name) {
    return el.classList.remove(class_name);
  };

  ShareUtils.prototype.is_encoded = function(str) {
    str = str.to_rfc3986();
    return decodeURIComponent(str) !== str;
  };

  ShareUtils.prototype.encode = function(str) {
    if (typeof str === "undefined" || this.is_encoded(str)) {
      return str;
    } else {
      return str.to_rfc3986();
    }
  };

  ShareUtils.prototype.popup = function(url, params) {
    var k, popup, qs, v;
    if (params == null) {
      params = {};
    }
    popup = {
      width: 500,
      height: 350
    };
    popup.top = (screen.height / 2) - (popup.height / 2);
    popup.left = (screen.width / 2) - (popup.width / 2);
    qs = ((function() {
      var _results;
      _results = [];
      for (k in params) {
        v = params[k];
        _results.push("" + k + "=" + (this.encode(v)));
      }
      return _results;
    }).call(this)).join('&');
    if (qs) {
      qs = "?" + qs;
    }
    return window.open(url + qs, 'targetWindow', "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,left=" + popup.left + ",top=" + popup.top + ",width=" + popup.width + ",height=" + popup.height);
  };

  return ShareUtils;

})();
var Share,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Share = (function(_super) {
  __extends(Share, _super);

  function Share(element, options) {
    this.element = element;
    this.el = {
      head: document.getElementsByTagName('head')[0],
      body: document.getElementsByTagName('body')[0]
    };
    this.config = {
      enabled_networks: 0,
      protocol: ['http', 'https'].indexOf(window.location.href.split(':')[0]) === -1 ? 'https://' : '//',
      url: window.location.href,
      caption: null,
      title: this.default_title(),
      image: this.default_image(),
      description: this.default_description(),
      ui: {
        flyout: 'top center',
        button_text: 'Share',
        button_font: true,
        icon_font: true
      },
      networks: {
        google_plus: {
          enabled: true,
          url: null
        },
        twitter: {
          enabled: true,
          url: null,
          title: null,
          description: null
        },
        facebook: {
          enabled: true,
          load_sdk: true,
          url: null,
          app_id: null,
          title: null,
          caption: null,
          description: null,
          image: null
        },
        pinterest: {
          enabled: true,
          url: null,
          image: null,
          description: null
        },
        reddit: {
          enabled: true,
          url: null,
          title: null
        },
        linkedin: {
          enabled: true,
          url: null,
          title: null,
          description: null
        },
        xing: {
          enabled: true,
          url: null,
          title: null,
          image: null,
          description: null
        },
        whatsapp: {
          enabled: true,
          description: null,
          url: null
        },
        email: {
          enabled: true,
          title: null,
          description: null,
          url: null
        }
      }
    };
    this.setup(element, options);
    return this;
  }

  Share.prototype.setup = function(element, opts) {
    var index, instance, instances, _i, _len;
    instances = document.querySelectorAll(element);
    this.extend(this.config, opts, true);
    this.set_global_configuration();
    this.normalize_network_configuration();
    if (this.config.ui.icon_font) {
      this.inject_icons();
    }
    if (this.config.ui.button_font) {
      this.inject_fonts();
    }
    if (this.config.networks.facebook.enabled && this.config.networks.facebook.load_sdk) {
      this.inject_facebook_sdk();
    }
    for (index = _i = 0, _len = instances.length; _i < _len; index = ++_i) {
      instance = instances[index];
      this.setup_instance(element, index);
    }
  };

  Share.prototype.setup_instance = function(element, index) {
    var button, instance, label, network, networks, _i, _len, _results,
      _this = this;
    instance = document.querySelectorAll(element)[index];
    this.hide(instance);
    this.add_class(instance, "sharer-" + index);
    instance = document.querySelectorAll(element)[index];
    this.inject_css(instance);
    this.inject_html(instance);
    this.show(instance);
    label = instance.getElementsByTagName("label")[0];
    button = instance.getElementsByClassName("social")[0];
    networks = instance.getElementsByTagName('li');
    this.add_class(button, "networks-" + this.config.enabled_networks);
    label.addEventListener("click", function() {
      return _this.event_toggle(button);
    });
    _this = this;
    _results = [];
    for (index = _i = 0, _len = networks.length; _i < _len; index = ++_i) {
      network = networks[index];
      _results.push(network.addEventListener("click", function() {
        _this.event_network(instance, this);
        return _this.event_close(button);
      }));
    }
    return _results;
  };

  Share.prototype.event_toggle = function(button) {
    if (this.has_class(button, "active")) {
      return this.event_close(button);
    } else {
      return this.event_open(button);
    }
  };

  Share.prototype.event_open = function(button) {
    if (this.has_class(button, "load")) {
      this.remove_class(button, "load");
    }
    return this.add_class(button, "active");
  };

  Share.prototype.event_close = function(button) {
    return this.remove_class(button, "active");
  };

  Share.prototype.event_network = function(instance, network) {
    var name;
    name = network.getAttribute("data-network");
    this.hook("before", name, instance);
    this["network_" + name]();
    return this.hook("after", name, instance);
  };

  Share.prototype.open = function() {
    return this["public"]("open");
  };

  Share.prototype.close = function() {
    return this["public"]("close");
  };

  Share.prototype.toggle = function() {
    return this["public"]("toggle");
  };

  Share.prototype["public"] = function(action) {
    var button, index, instance, _i, _len, _ref, _results;
    _ref = document.querySelectorAll(this.element);
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      instance = _ref[index];
      button = instance.getElementsByClassName("social")[0];
      _results.push(this["event_" + action](button));
    }
    return _results;
  };

  Share.prototype.network_facebook = function() {
    if (this.config.networks.facebook.load_sdk) {
      if (!window.FB) {
        return console.error("The Facebook JS SDK hasn't loaded yet.");
      }
      return FB.ui({
        method: 'feed',
        name: this.config.networks.facebook.title,
        link: this.config.networks.facebook.url,
        picture: this.config.networks.facebook.image,
        caption: this.config.networks.facebook.caption,
        description: this.config.networks.facebook.description
      });
    } else {
      return this.popup('https://www.facebook.com/sharer/sharer.php', {
        u: this.config.networks.facebook.url
      });
    }
  };

  Share.prototype.network_twitter = function() {
    return this.popup('https://twitter.com/intent/tweet', {
      text: this.config.networks.twitter.title,
      url: this.config.networks.twitter.url
    });
  };

  Share.prototype.network_google_plus = function() {
    return this.popup('https://plus.google.com/share', {
      url: this.config.networks.google_plus.url
    });
  };

  Share.prototype.network_pinterest = function() {
    return this.popup('https://www.pinterest.com/pin/create/button', {
      url: this.config.networks.pinterest.url,
      media: this.config.networks.pinterest.image,
      description: this.config.networks.pinterest.description
    });
  };

  Share.prototype.network_linkedin = function() {
    return this.popup('https://www.linkedin.com/shareArticle', {
      url: this.config.networks.linkedin.url,
      title: this.config.networks.linkedin.title,
      summary: this.config.networks.linkedin.description
    });
  }

  Share.prototype.network_xing = function() {
    return this.popup('https://www.xing.com/spi/shares/new', {
      url: this.config.networks.xing.url,
      image: this.config.networks.xing.image,
      title: this.config.networks.xing.title,
      summary: this.config.networks.xing.description
    });
  }

  Share.prototype.network_email = function() {
    return this.popup('mailto:', {
      subject: this.config.networks.email.title,
      body: this.config.networks.email.url + '%0A%0A' + this.config.networks.email.description,
    });
  };

  Share.prototype.inject_icons = function() {
  //  return this.inject_stylesheet("https://www.sharebutton.co/fonts/v2/entypo.min.css");
  };

  Share.prototype.inject_fonts = function() {
   // return this.inject_stylesheet("http://fonts.googleapis.com/css?family=Lato:900&text=" + this.config.ui.button_text);
  };

  Share.prototype.inject_stylesheet = function(url) {
    var link;
    if (!this.el.head.querySelector("link[href=\"" + url + "\"]")) {
      link = document.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", url);
      return this.el.head.appendChild(link);
    }
  };

  Share.prototype.inject_css = function(instance) {
    var css, meta, selector, style;
    selector = "." + (instance.getAttribute('class').split(" ").join("."));
    if (!this.el.head.querySelector("meta[name='sharer" + selector + "']")) {
      this.config.selector = selector;
      css = getStyles(this.config);
      style = document.createElement("style");
      style.type = "text/css";
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      this.el.head.appendChild(style);
      delete this.config.selector;
      meta = document.createElement("meta");
      meta.setAttribute("name", "sharer" + selector);
      return this.el.head.appendChild(meta);
    }
  };

  Share.prototype.inject_html = function(instance) {
    return instance.innerHTML = "<label class='social-export'><span>" + this.config.ui.button_text + "</span></label><div class='social load " + this.config.ui.flyout + "'><ul><li class='social-facebook' data-network='facebook' tabindex='0'></li><li class='social-twitter' data-network='twitter' tabindex='0'></li><li class='social-gplus' data-network='google_plus' tabindex='0'></li><li class='social-pinterest' data-network='pinterest' tabindex='0'></li><li class='social-linkedin' data-network='linkedin' tabindex='0'></li><li class='social-xing' data-network='xing' tabindex='0'></li><li class='social-paper-plane' data-network='email' tabindex='0'></li></ul></div>";
  };

  Share.prototype.inject_facebook_sdk = function() {
    var fb_root, script;
    if (!window.FB && this.config.networks.facebook.app_id && !this.el.body.querySelector('#fb-root')) {
      script = document.createElement("script");
      script.text = "window.fbAsyncInit=function(){FB.init({appId:'" + this.config.networks.facebook.app_id + "',status:true,xfbml:true})};(function(e,t,n){var r,i=e.getElementsByTagName(t)[0];if(e.getElementById(n)){return}r=e.createElement(t);r.id=n;r.src='" + this.config.protocol + "connect.facebook.net/en_US/all.js';i.parentNode.insertBefore(r,i)})(document,'script','facebook-jssdk')";
      fb_root = document.createElement("div");
      fb_root.id = "fb-root";
      this.el.body.appendChild(fb_root);
      return this.el.body.appendChild(script);
    }
  };

  Share.prototype.hook = function(type, network, instance) {
    var fn, opts;
    fn = this.config.networks[network][type];
    if (typeof fn === "function") {
      opts = fn.call(this.config.networks[network], instance);
      if (opts !== void 0) {
        opts = this.normalize_filter_config_updates(opts);
        this.extend(this.config.networks[network], opts, true);
        this.normalize_network_configuration();
      }
    }
  };

  Share.prototype.default_title = function() {
    var content;
    if (content = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]')) {
      return encodeURIComponent(content.getAttribute('content'));
    } else if (content = document.querySelector('title')) {
      return encodeURIComponent(content.innerText);
    }
  };

  Share.prototype.default_image = function() {
    var content;
    if (content = document.querySelector('meta[property="og:image"]') || document.querySelector('meta[name="twitter:image"]')) {
      return content.getAttribute('content');
    }
  };

  Share.prototype.default_description = function() {
    var content;
    if (content = document.querySelector('meta[property="og:description"]') || document.querySelector('meta[name="twitter:description"]') || document.querySelector('meta[name="description"]')) {
      return content.getAttribute('content');
    } else {
      return '';
    }
  };

  Share.prototype.set_global_configuration = function() {
    var display, network, option, options, _ref, _results;
    _ref = this.config.networks;
    _results = [];
    for (network in _ref) {
      options = _ref[network];
      for (option in options) {
        if (this.config.networks[network][option] == null) {
          this.config.networks[network][option] = this.config[option];
        }
      }
      if (this.config.networks[network].enabled) {
        display = 'block';
        this.config.enabled_networks += 1;
      } else {
        display = 'none';
      }
      _results.push(this.config.networks[network].display = display);
    }
    return _results;
  };

  Share.prototype.normalize_network_configuration = function() {
    if (!this.config.networks.facebook.app_id) {
      this.config.networks.facebook.load_sdk = false;
    }
    if (!this.is_encoded(this.config.networks.twitter.description)) {
      this.config.networks.twitter.description = encodeURIComponent(this.config.networks.twitter.description);
    }
    if (typeof this.config.networks.facebook.app_id === 'number') {
      return this.config.networks.facebook.app_id = this.config.networks.facebook.app_id.toString();
    }
  };

  Share.prototype.normalize_filter_config_updates = function(opts) {
    if (this.config.networks.facebook.app_id !== opts.app_id) {
      console.warn("You are unable to change the Facebook app_id after the button has been initialized. Please-in-out update your Facebook filters accordingly.");
      delete opts.app_id;
    }
    if (this.config.networks.facebook.load_sdk !== opts.load_sdk) {
      console.warn("You are unable to change the Facebook load_sdk option after the button has been initialized. Please-in-out update your Facebook filters accordingly.");
      delete opts.app_id;
    }
    return opts;
  };

  return Share;

})(ShareUtils);
 return Share;
});


// Generated by CoffeeScript 1.9.2

// @license Sticky-kit v1.1.2 | WTFPL | Leaf Corcoran 2015 | http://leafo.net

(function() {
  var $, win;

  $ = this.jQuery || window.jQuery;

  win = $(window);

  $.fn.stick_in_parent = function(opts) {
    var doc, elm, enable_bottoming, fn, i, inner_scrolling, len, manual_spacer, offset_top, outer_width, parent_selector, recalc_every, sticky_class;
    if (opts == null) {
      opts = {};
    }
    sticky_class = opts.sticky_class, inner_scrolling = opts.inner_scrolling, recalc_every = opts.recalc_every, parent_selector = opts.parent, offset_top = opts.offset_top, manual_spacer = opts.spacer, enable_bottoming = opts.bottoming;
    if (offset_top == null) {
      offset_top = 0;
    }
    if (parent_selector == null) {
      parent_selector = void 0;
    }
    if (inner_scrolling == null) {
      inner_scrolling = true;
    }
    if (sticky_class == null) {
      sticky_class = "is_stuck";
    }
    doc = $(document);
    if (enable_bottoming == null) {
      enable_bottoming = true;
    }
    outer_width = function(el) {
      var _el, computed, w;
      if (window.getComputedStyle) {
        _el = el[0];
        computed = window.getComputedStyle(el[0]);
        w = parseFloat(computed.getPropertyValue("width")) + parseFloat(computed.getPropertyValue("margin-left")) + parseFloat(computed.getPropertyValue("margin-right"));
        if (computed.getPropertyValue("box-sizing") !== "border-box") {
          w += parseFloat(computed.getPropertyValue("border-left-width")) + parseFloat(computed.getPropertyValue("border-right-width")) + parseFloat(computed.getPropertyValue("padding-left")) + parseFloat(computed.getPropertyValue("padding-right"));
        }
        return w;
      } else {
        return el.outerWidth(true);
      }
    };
    fn = function(elm, padding_bottom, parent_top, parent_height, top, height, el_float, detached) {
      var bottomed, detach, fixed, last_pos, last_scroll_height, offset, parent, recalc, recalc_and_tick, recalc_counter, spacer, tick;
      if (elm.data("sticky_kit")) {
        return;
      }
      elm.data("sticky_kit", true);
      last_scroll_height = doc.height();
      parent = elm.parent();
      if (parent_selector != null) {
        parent = parent.closest(parent_selector);
      }
      if (!parent.length) {
        throw "failed to find stick parent";
      }
      fixed = false;
      bottomed = false;
      spacer = manual_spacer != null ? manual_spacer && elm.closest(manual_spacer) : $("<div />");
      if (spacer) {
        spacer.css('position', elm.css('position'));
      }
      recalc = function() {
        var border_top, padding_top, restore;
        if (detached) {
          return;
        }
        last_scroll_height = doc.height();
        border_top = parseInt(parent.css("border-top-width"), 10);
        padding_top = parseInt(parent.css("padding-top"), 10);
        padding_bottom = parseInt(parent.css("padding-bottom"), 10);
        parent_top = parent.offset().top + border_top + padding_top;
        parent_height = parent.height();
        if (fixed) {
          fixed = false;
          bottomed = false;
          if (manual_spacer == null) {
            elm.insertAfter(spacer);
            spacer.detach();
          }
          elm.css({
            position: "",
            top: "",
            width: "",
            bottom: ""
          }).removeClass(sticky_class);
          restore = true;
        }
        top = elm.offset().top - (parseInt(elm.css("margin-top"), 10) || 0) - offset_top;
        height = elm.outerHeight(true);
        el_float = elm.css("float");
        if (spacer) {
          spacer.css({
            width: outer_width(elm),
            height: height,
            display: elm.css("display"),
            "vertical-align": elm.css("vertical-align"),
            "float": el_float
          });
        }
        if (restore) {
          return tick();
        }
      };
      recalc();
      if (height === parent_height) {
        return;
      }
      last_pos = void 0;
      offset = offset_top;
      recalc_counter = recalc_every;
      tick = function() {
        var css, delta, recalced, scroll, will_bottom, win_height;
        if (detached) {
          return;
        }
        recalced = false;
        if (recalc_counter != null) {
          recalc_counter -= 1;
          if (recalc_counter <= 0) {
            recalc_counter = recalc_every;
            recalc();
            recalced = true;
          }
        }
        if (!recalced && doc.height() !== last_scroll_height) {
          recalc();
          recalced = true;
        }
        scroll = win.scrollTop();
        if (last_pos != null) {
          delta = scroll - last_pos;
        }
        last_pos = scroll;
        if (fixed) {
          if (enable_bottoming) {
            will_bottom = scroll + height + offset > parent_height + parent_top;
            if (bottomed && !will_bottom) {
              bottomed = false;
              elm.css({
                position: "fixed",
                bottom: "",
                top: offset
              }).trigger("sticky_kit:unbottom");
            }
          }
          if (scroll < top) {
            fixed = false;
            offset = offset_top;
            if (manual_spacer == null) {
              if (el_float === "left" || el_float === "right") {
                elm.insertAfter(spacer);
              }
              spacer.detach();
            }
            css = {
              position: "",
              width: "",
              top: ""
            };
            elm.css(css).removeClass(sticky_class).trigger("sticky_kit:unstick");
          }
          if (inner_scrolling) {
            win_height = win.height();
            if (height + offset_top > win_height) {
              if (!bottomed) {
                offset -= delta;
                offset = Math.max(win_height - height, offset);
                offset = Math.min(offset_top, offset);
                if (fixed) {
                  elm.css({
                    top: offset + "px"
                  });
                }
              }
            }
          }
        } else {
          if (scroll > top) {
            fixed = true;
            css = {
              position: "fixed",
              top: offset
            };
            css.width = elm.css("box-sizing") === "border-box" ? elm.outerWidth() + "px" : elm.width() + "px";
            elm.css(css).addClass(sticky_class);
            if (manual_spacer == null) {
              elm.after(spacer);
              if (el_float === "left" || el_float === "right") {
                spacer.append(elm);
              }
            }
            elm.trigger("sticky_kit:stick");
          }
        }
        if (fixed && enable_bottoming) {
          if (will_bottom == null) {
            will_bottom = scroll + height + offset > parent_height + parent_top;
          }
          if (!bottomed && will_bottom) {
            bottomed = true;
            if (parent.css("position") === "static") {
              parent.css({
                position: "relative"
              });
            }
            return elm.css({
              position: "absolute",
              bottom: padding_bottom,
              top: "auto"
            }).trigger("sticky_kit:bottom");
          }
        }
      };
      recalc_and_tick = function() {
        recalc();
        return tick();
      };
      detach = function() {
        detached = true;
        win.off("touchmove", tick);
        win.off("scroll", tick);
        win.off("resize", recalc_and_tick);
        $(document.body).off("sticky_kit:recalc", recalc_and_tick);
        elm.off("sticky_kit:detach", detach);
        elm.removeData("sticky_kit");
        elm.css({
          position: "",
          bottom: "",
          top: "",
          width: ""
        });
        parent.position("position", "");
        if (fixed) {
          if (manual_spacer == null) {
            if (el_float === "left" || el_float === "right") {
              elm.insertAfter(spacer);
            }
            spacer.remove();
          }
          return elm.removeClass(sticky_class);
        }
      };
      win.on("touchmove", tick);
      win.on("scroll", tick);
      win.on("resize", recalc_and_tick);
      $(document.body).on("sticky_kit:recalc", recalc_and_tick);
      elm.on("sticky_kit:detach", detach);
      return setTimeout(tick, 0);
    };
    for (i = 0, len = this.length; i < len; i++) {
      elm = this[i];
      fn($(elm));
    }
    return this;
  };

}).call(this);

/*!
 * Justified Gallery - v3.6.3
 * http://miromannino.github.io/Justified-Gallery/
 * Copyright (c) 2016 Miro Mannino
 * Licensed under the MIT license.
 */
(function($) {

  function hasScrollBar() {
    return $("body").height() > $(window).height();
  }
  /**
   * Justified Gallery controller constructor
   *
   * @param $gallery the gallery to build
   * @param settings the settings (the defaults are in $.fn.justifiedGallery.defaults)
   * @constructor
   */
  var JustifiedGallery = function ($gallery, settings) {
    
    this.settings = settings;
    this.checkSettings();

    this.imgAnalyzerTimeout = null;
    this.entries = null;
    this.buildingRow = {
      entriesBuff : [],
      width : 0,
      height : 0,
      aspectRatio : 0
    };
    this.lastFetchedEntry = null;
    this.lastAnalyzedIndex = -1;
    this.yield = {
      every : 2, // do a flush every n flushes (must be greater than 1)
      flushed : 0 // flushed rows without a yield
    };
    this.border = settings.border >= 0 ? settings.border : settings.margins;
    this.maxRowHeight = this.retrieveMaxRowHeight();
    this.suffixRanges = this.retrieveSuffixRanges();
    this.offY = this.border;
    this.rows = 0;
    this.spinner = {
      phase : 0,
      timeSlot : 150,
      $el : $('<div class="spinner"><span></span><span></span><span></span></div>'),
      intervalId : null
    };
    this.checkWidthIntervalId = null;
    this.galleryWidth = $gallery.width();
    this.$gallery = $gallery;

  };

  /** @returns {String} the best suffix given the width and the height */
  JustifiedGallery.prototype.getSuffix = function (width, height) {
    var longestSide, i;
    longestSide = (width > height) ? width : height;
    for (i = 0; i < this.suffixRanges.length; i++) {
      if (longestSide <= this.suffixRanges[i]) {
        return this.settings.sizeRangeSuffixes[this.suffixRanges[i]];
      }
    }
    return this.settings.sizeRangeSuffixes[this.suffixRanges[i - 1]];
  };

  /**
   * Remove the suffix from the string
   *
   * @returns {string} a new string without the suffix
   */
  JustifiedGallery.prototype.removeSuffix = function (str, suffix) {
    return str.substring(0, str.length - suffix.length);
  };

  /**
   * @returns {boolean} a boolean to say if the suffix is contained in the str or not
   */
  JustifiedGallery.prototype.endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  /**
   * Get the used suffix of a particular url
   *
   * @param str
   * @returns {String} return the used suffix
   */
  JustifiedGallery.prototype.getUsedSuffix = function (str) {
    for (var si in this.settings.sizeRangeSuffixes) {
      if (this.settings.sizeRangeSuffixes.hasOwnProperty(si)) {
        if (this.settings.sizeRangeSuffixes[si].length === 0) continue;
        if (this.endsWith(str, this.settings.sizeRangeSuffixes[si])) return this.settings.sizeRangeSuffixes[si];
      }
    }
    return '';
  };

  /**
   * Given an image src, with the width and the height, returns the new image src with the
   * best suffix to show the best quality thumbnail.
   *
   * @returns {String} the suffix to use
   */
  JustifiedGallery.prototype.newSrc = function (imageSrc, imgWidth, imgHeight, image) {
    var newImageSrc;

    if (this.settings.thumbnailPath) {
      newImageSrc = this.settings.thumbnailPath(imageSrc, imgWidth, imgHeight, image);
    } else {
      var matchRes = imageSrc.match(this.settings.extension);
      var ext = (matchRes !== null) ? matchRes[0] : '';
      newImageSrc = imageSrc.replace(this.settings.extension, '');
      newImageSrc = this.removeSuffix(newImageSrc, this.getUsedSuffix(newImageSrc));
      newImageSrc += this.getSuffix(imgWidth, imgHeight) + ext;
    }

    return newImageSrc;
  };

  /**
   * Shows the images that is in the given entry
   *
   * @param $entry the entry
   * @param callback the callback that is called when the show animation is finished
   */
  JustifiedGallery.prototype.showImg = function ($entry, callback) {
    if (this.settings.cssAnimation) {
      $entry.addClass('entry-visible');
      if (callback) callback();
    } else {
      $entry.stop().fadeTo(this.settings.imagesAnimationDuration, 1.0, callback);
      $entry.find('> img, > a > img').stop().fadeTo(this.settings.imagesAnimationDuration, 1.0, callback);
    }
  };

  /**
   * Extract the image src form the image, looking from the 'safe-src', and if it can't be found, from the
   * 'src' attribute. It saves in the image data the 'jg.originalSrc' field, with the extracted src.
   *
   * @param $image the image to analyze
   * @returns {String} the extracted src
   */
  JustifiedGallery.prototype.extractImgSrcFromImage = function ($image) {
    var imageSrc = (typeof $image.data('safe-src') !== 'undefined') ? $image.data('safe-src') : $image.attr('src');
    $image.data('jg.originalSrc', imageSrc);
    return imageSrc;
  };

  /** @returns {jQuery} the image in the given entry */
  JustifiedGallery.prototype.imgFromEntry = function ($entry) {
    var $img = $entry.find('> img');
    if ($img.length === 0) $img = $entry.find('> a > img');
    if ($img.length === 0) $img = $entry.find('.t-entry-visual-cont img');//hacked by Uncode
    return $img.length === 0 ? null : $img;
  };

  /** @returns {jQuery} the caption in the given entry */
  JustifiedGallery.prototype.captionFromEntry = function ($entry) {
    var $caption = $entry.find('> .caption');
    return $caption.length === 0 ? null : $caption;
  };

  /**
   * Display the entry
   *
   * @param {jQuery} $entry the entry to display
   * @param {int} x the x position where the entry must be positioned
   * @param y the y position where the entry must be positioned
   * @param imgWidth the image width
   * @param imgHeight the image height
   * @param rowHeight the row height of the row that owns the entry
   */
  JustifiedGallery.prototype.displayEntry = function ($entry, x, y, imgWidth, imgHeight, rowHeight) {
    $entry.width(imgWidth);
    $entry.height(Math.floor(rowHeight));//hacked by Uncode
    $entry.css('top', Math.floor(y));//hacked by Uncode
    $entry.css('left', x);

    var $image = this.imgFromEntry($entry);
    if ($image !== null) {
      $image.css('width', imgWidth);
      $image.css('height', imgHeight);
      $image.css('margin-left', - imgWidth / 2);
      $image.css('margin-top', - imgHeight / 2);

      // Image reloading for an high quality of thumbnails
      var imageSrc = $image.attr('src');
      var newImageSrc = this.newSrc(imageSrc, imgWidth, imgHeight, $image[0]);

      $image.one('error', function () {
        $image.attr('src', $image.data('jg.originalSrc')); //revert to the original thumbnail, we got it.
      });

      var loadNewImage = function () {
        if (imageSrc !== newImageSrc) { //load the new image after the fadeIn
          $image.attr('src', newImageSrc);
        }
      };

      if ($entry.data('jg.loaded') === 'skipped') {
        this.onImageEvent(imageSrc, $.proxy(function() {
          this.showImg($entry, loadNewImage);
          $entry.data('jg.loaded', true);
        }, this));
      } else {
        this.showImg($entry, loadNewImage);
      }

    } else {
      this.showImg($entry);
    }

    this.displayEntryCaption($entry);
  };

  /**
   * Display the entry caption. If the caption element doesn't exists, it creates the caption using the 'alt'
   * or the 'title' attributes.
   *
   * @param {jQuery} $entry the entry to process
   */
  JustifiedGallery.prototype.displayEntryCaption = function ($entry) {
    var $image = this.imgFromEntry($entry);
    if ($image !== null && this.settings.captions) {
      var $imgCaption = this.captionFromEntry($entry);

      // Create it if it doesn't exists
      if ($imgCaption === null) {
        var caption = $image.attr('alt');
        if (!this.isValidCaption(caption)) caption = $entry.attr('title');
        if (this.isValidCaption(caption)) { // Create only we found something
          $imgCaption = $('<div class="caption">' + caption + '</div>');
          $entry.append($imgCaption);
          $entry.data('jg.createdCaption', true);
        }
      }

      // Create events (we check again the $imgCaption because it can be still inexistent)
      if ($imgCaption !== null) {
        if (!this.settings.cssAnimation) $imgCaption.stop().fadeTo(0, this.settings.captionSettings.nonVisibleOpacity);
        this.addCaptionEventsHandlers($entry);
      }
    } else {
      this.removeCaptionEventsHandlers($entry);
    }
  };

  /**
   * Validates the caption
   *
   * @param caption The caption that should be validated
   * @return {boolean} Validation result
   */
  JustifiedGallery.prototype.isValidCaption = function (caption) {
    return (typeof caption !== 'undefined' && caption.length > 0);
  };

  /**
   * The callback for the event 'mouseenter'. It assumes that the event currentTarget is an entry.
   * It shows the caption using jQuery (or using CSS if it is configured so)
   *
   * @param {Event} eventObject the event object
   */
  JustifiedGallery.prototype.onEntryMouseEnterForCaption = function (eventObject) {
    var $caption = this.captionFromEntry($(eventObject.currentTarget));
    if (this.settings.cssAnimation) {
      $caption.addClass('caption-visible').removeClass('caption-hidden');
    } else {
      $caption.stop().fadeTo(this.settings.captionSettings.animationDuration,
          this.settings.captionSettings.visibleOpacity);
    }
  };

  /**
   * The callback for the event 'mouseleave'. It assumes that the event currentTarget is an entry.
   * It hides the caption using jQuery (or using CSS if it is configured so)
   *
   * @param {Event} eventObject the event object
   */
  JustifiedGallery.prototype.onEntryMouseLeaveForCaption = function (eventObject) {
    var $caption = this.captionFromEntry($(eventObject.currentTarget));
    if (this.settings.cssAnimation) {
      $caption.removeClass('caption-visible').removeClass('caption-hidden');
    } else {
      $caption.stop().fadeTo(this.settings.captionSettings.animationDuration,
          this.settings.captionSettings.nonVisibleOpacity);
    }
  };

  /**
   * Add the handlers of the entry for the caption
   *
   * @param $entry the entry to modify
   */
  JustifiedGallery.prototype.addCaptionEventsHandlers = function ($entry) {
    var captionMouseEvents = $entry.data('jg.captionMouseEvents');
    if (typeof captionMouseEvents === 'undefined') {
      captionMouseEvents = {
        mouseenter: $.proxy(this.onEntryMouseEnterForCaption, this),
        mouseleave: $.proxy(this.onEntryMouseLeaveForCaption, this)
      };
      $entry.on('mouseenter', undefined, undefined, captionMouseEvents.mouseenter);
      $entry.on('mouseleave', undefined, undefined, captionMouseEvents.mouseleave);
      $entry.data('jg.captionMouseEvents', captionMouseEvents);
    }
  };

  /**
   * Remove the handlers of the entry for the caption
   *
   * @param $entry the entry to modify
   */
  JustifiedGallery.prototype.removeCaptionEventsHandlers = function ($entry) {
    var captionMouseEvents = $entry.data('jg.captionMouseEvents');
    if (typeof captionMouseEvents !== 'undefined') {
      $entry.off('mouseenter', undefined, captionMouseEvents.mouseenter);
      $entry.off('mouseleave', undefined, captionMouseEvents.mouseleave);
      $entry.removeData('jg.captionMouseEvents');
    }
  };

  /**
   * Justify the building row, preparing it to
   *
   * @param isLastRow
   * @returns a boolean to know if the row has been justified or not
   */
  JustifiedGallery.prototype.prepareBuildingRow = function (isLastRow) {
    var i, $entry, imgAspectRatio, newImgW, newImgH, justify = true;
    var minHeight = 0;
    var availableWidth = this.galleryWidth - 2 * this.border - (
        (this.buildingRow.entriesBuff.length - 1) * this.settings.margins);
    var rowHeight = Math.floor( availableWidth / this.buildingRow.aspectRatio );//hacked by Uncode
    var defaultRowHeight = this.settings.rowHeight;
    var justifiable = this.buildingRow.width / availableWidth > this.settings.justifyThreshold;

    //Skip the last row if we can't justify it and the lastRow == 'hide'
    if (isLastRow && this.settings.lastRow === 'hide' && !justifiable) {
      for (i = 0; i < this.buildingRow.entriesBuff.length; i++) {
        $entry = this.buildingRow.entriesBuff[i];
        if (this.settings.cssAnimation)
          $entry.removeClass('entry-visible');
        else {
          $entry.stop().fadeTo(0, 0.1);
          $entry.find('> img, > a > img').fadeTo(0, 0);
        }
      }
      return -1;
    }

    // With lastRow = nojustify, justify if is justificable (the images will not become too big)
    if (isLastRow && !justifiable && this.settings.lastRow !== 'justify' && this.settings.lastRow !== 'hide') {
      justify = false;

      if (this.rows > 0) {
        defaultRowHeight = (this.offY - this.border - this.settings.margins * this.rows) / this.rows;
        justify = defaultRowHeight * this.buildingRow.aspectRatio / availableWidth > this.settings.justifyThreshold;
      }
    }

    for (i = 0; i < this.buildingRow.entriesBuff.length; i++) {
      $entry = this.buildingRow.entriesBuff[i];
      imgAspectRatio = $entry.data('jg.width') / $entry.data('jg.height');

      if (justify) {
        newImgW = (i === this.buildingRow.entriesBuff.length - 1) ? availableWidth : rowHeight * imgAspectRatio;
        newImgH = rowHeight;
      } else {
        newImgW = defaultRowHeight * imgAspectRatio;
        newImgH = defaultRowHeight;
      }

      availableWidth -= Math.round(newImgW);
      $entry.data('jg.jwidth', Math.round(newImgW));
      $entry.data('jg.jheight', Math.ceil(newImgH));
      if (i === 0 || minHeight > newImgH) minHeight = newImgH;
    }

    this.buildingRow.height = minHeight;
    return justify;
  };

  /**
   * Clear the building row data to be used for a new row
   */
  JustifiedGallery.prototype.clearBuildingRow = function () {
    this.buildingRow.entriesBuff = [];
    this.buildingRow.aspectRatio = 0;
    this.buildingRow.width = 0;
  };

  /**
   * Flush a row: justify it, modify the gallery height accordingly to the row height
   *
   * @param isLastRow
   */
  JustifiedGallery.prototype.flushRow = function (isLastRow) {
    var settings = this.settings;
    var $entry, buildingRowRes, offX = this.border, i;

    buildingRowRes = this.prepareBuildingRow(isLastRow);
    if (isLastRow && settings.lastRow === 'hide' && buildingRowRes === -1) {
      this.clearBuildingRow();
      return;
    }

    if (this.maxRowHeight) {
      if (this.maxRowHeight.isPercentage && this.maxRowHeight.value * settings.rowHeight < this.buildingRow.height) {
        this.buildingRow.height = this.maxRowHeight.value * settings.rowHeight;
      } else if (this.maxRowHeight.value >= settings.rowHeight && this.maxRowHeight.value < this.buildingRow.height) {
        this.buildingRow.height = this.maxRowHeight.value;
      }
    }

    //Align last (unjustified) row
    if (settings.lastRow === 'center' || settings.lastRow === 'right') {
      var availableWidth = this.galleryWidth - 2 * this.border - (this.buildingRow.entriesBuff.length - 1) * settings.margins;

      for (i = 0; i < this.buildingRow.entriesBuff.length; i++) {
        $entry = this.buildingRow.entriesBuff[i];
        availableWidth -= $entry.data('jg.jwidth');
      }

      if (settings.lastRow === 'center')
        offX += availableWidth / 2;
      else if (settings.lastRow === 'right')
        offX += availableWidth;
    }

    for (i = 0; i < this.buildingRow.entriesBuff.length; i++) {
      $entry = this.buildingRow.entriesBuff[i];
      this.displayEntry($entry, offX, this.offY, $entry.data('jg.jwidth'), $entry.data('jg.jheight'), this.buildingRow.height);
      offX += $entry.data('jg.jwidth') + settings.margins;
    }

    //Gallery Height
    this.galleryHeightToSet = this.offY + this.buildingRow.height + this.border;
    this.$gallery.height(this.galleryHeightToSet + this.getSpinnerHeight());

    if (!isLastRow || (this.buildingRow.height <= settings.rowHeight && buildingRowRes)) {
      //Ready for a new row
      this.offY += this.buildingRow.height + settings.margins;
      this.rows += 1;
      this.clearBuildingRow();
      this.$gallery.trigger('jg.rowflush');
    }
  };

  /**
   * Checks the width of the gallery container, to know if a new justification is needed
   */
  var scrollBarOn = false;
  JustifiedGallery.prototype.checkWidth = function () {
    this.checkWidthIntervalId = setInterval($.proxy(function () {
      var galleryWidth = parseFloat(this.$gallery.width());
      if (hasScrollBar() === scrollBarOn) {
        if (Math.abs(galleryWidth - this.galleryWidth) > this.settings.refreshSensitivity) {
          this.galleryWidth = galleryWidth;
          this.rewind();

          // Restart to analyze
          this.startImgAnalyzer(true);
        }
      } else {
        scrollBarOn = hasScrollBar();
        this.galleryWidth = galleryWidth;
      }
    }, this), this.settings.refreshTime);
  };

  /**
   * @returns {boolean} a boolean saying if the spinner is active or not
   */
  JustifiedGallery.prototype.isSpinnerActive = function () {
    return this.spinner.intervalId !== null;
  };

  /**
   * @returns {int} the spinner height
   */
  JustifiedGallery.prototype.getSpinnerHeight = function () {
    return this.spinner.$el.innerHeight();
  };

  /**
   * Stops the spinner animation and modify the gallery height to exclude the spinner
   */
  JustifiedGallery.prototype.stopLoadingSpinnerAnimation = function () {
    clearInterval(this.spinner.intervalId);
    this.spinner.intervalId = null;
    this.$gallery.height(this.$gallery.height() - this.getSpinnerHeight());
    this.spinner.$el.detach();
  };

  /**
   * Starts the spinner animation
   */
  JustifiedGallery.prototype.startLoadingSpinnerAnimation = function () {
    var spinnerContext = this.spinner;
    var $spinnerPoints = spinnerContext.$el.find('span');
    clearInterval(spinnerContext.intervalId);
    this.$gallery.append(spinnerContext.$el);
    this.$gallery.height(this.offY + this.buildingRow.height + this.getSpinnerHeight());
    spinnerContext.intervalId = setInterval(function () {
      if (spinnerContext.phase < $spinnerPoints.length) {
        $spinnerPoints.eq(spinnerContext.phase).fadeTo(spinnerContext.timeSlot, 1);
      } else {
        $spinnerPoints.eq(spinnerContext.phase - $spinnerPoints.length).fadeTo(spinnerContext.timeSlot, 0);
      }
      spinnerContext.phase = (spinnerContext.phase + 1) % ($spinnerPoints.length * 2);
    }, spinnerContext.timeSlot);
  };

  /**
   * Rewind the image analysis to start from the first entry.
   */
  JustifiedGallery.prototype.rewind = function () {
    this.lastFetchedEntry = null;
    this.lastAnalyzedIndex = -1;
    this.offY = this.border;
    this.rows = 0;
    this.clearBuildingRow();
  };

  /**
   * Update the entries searching it from the justified gallery HTML element
   *
   * @param norewind if norewind only the new entries will be changed (i.e. randomized, sorted or filtered)
   * @returns {boolean} true if some entries has been founded
   */
  JustifiedGallery.prototype.updateEntries = function (norewind) {
    var newEntries;

    if (norewind && this.lastFetchedEntry != null) {
      newEntries = $(this.lastFetchedEntry).nextAll(this.settings.selector).toArray();
    } else {
      this.entries = [];
      newEntries = this.$gallery.children(this.settings.selector).toArray();
    }

    if (newEntries.length > 0) {

      // Sort or randomize
      if ($.isFunction(this.settings.sort)) {
        newEntries = this.sortArray(newEntries);
      } else if (this.settings.randomize) {
        newEntries = this.shuffleArray(newEntries);
      }
      this.lastFetchedEntry = newEntries[newEntries.length - 1];

      // Filter
      if (this.settings.filter) {
        newEntries = this.filterArray(newEntries);
      } else {
        this.resetFilters(newEntries);
      }

    }

    this.entries = this.entries.concat(newEntries);
    return true;
  };

  /**
   * Apply the entries order to the DOM, iterating the entries and appending the images
   *
   * @param entries the entries that has been modified and that must be re-ordered in the DOM
   */
  JustifiedGallery.prototype.insertToGallery = function (entries) {
    var that = this;
    $.each(entries, function () {
      $(this).appendTo(that.$gallery);
    });
  };

  /**
   * Shuffle the array using the Fisher-Yates shuffle algorithm
   *
   * @param a the array to shuffle
   * @return the shuffled array
   */
  JustifiedGallery.prototype.shuffleArray = function (a) {
    var i, j, temp;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    this.insertToGallery(a);
    return a;
  };

  /**
   * Sort the array using settings.comparator as comparator
   *
   * @param a the array to sort (it is sorted)
   * @return the sorted array
   */
  JustifiedGallery.prototype.sortArray = function (a) {
    a.sort(this.settings.sort);
    this.insertToGallery(a);
    return a;
  };

  /**
   * Reset the filters removing the 'jg-filtered' class from all the entries
   *
   * @param a the array to reset
   */
  JustifiedGallery.prototype.resetFilters = function (a) {
    for (var i = 0; i < a.length; i++) $(a[i]).removeClass('jg-filtered');
  };

  /**
   * Filter the entries considering theirs classes (if a string has been passed) or using a function for filtering.
   *
   * @param a the array to filter
   * @return the filtered array
   */
  JustifiedGallery.prototype.filterArray = function (a) {
    var settings = this.settings;
    if ($.type(settings.filter) === 'string') {
      // Filter only keeping the entries passed in the string
      return a.filter(function (el) {
        var $el = $(el);
        if ($el.is(settings.filter)) {
          $el.removeClass('jg-filtered');
          return true;
        } else {
          $el.addClass('jg-filtered').removeClass('jg-visible');
          return false;
        }
      });
    } else if ($.isFunction(settings.filter)) {
      // Filter using the passed function
      var filteredArr = a.filter(settings.filter);
      for (var i = 0; i < a.length; i++) {
        if (filteredArr.indexOf(a[i]) == -1) {
          $(a[i]).addClass('jg-filtered').removeClass('jg-visible');
        } else {
          $(a[i]).removeClass('jg-filtered');
        }
      }
      return filteredArr;
    }
  };

  /**
   * Destroy the Justified Gallery instance.
   *
   * It clears all the css properties added in the style attributes. We doesn't backup the original
   * values for those css attributes, because it costs (performance) and because in general one
   * shouldn't use the style attribute for an uniform set of images (where we suppose the use of
   * classes). Creating a backup is also difficult because JG could be called multiple times and
   * with different style attributes.
   */
  JustifiedGallery.prototype.destroy = function () {
    clearInterval(this.checkWidthIntervalId);

    $.each(this.entries, $.proxy(function(_, entry) {
      var $entry = $(entry);

      // Reset entry style
      $entry.css('width', '');
      $entry.css('height', '');
      $entry.css('top', '');
      $entry.css('left', '');
      $entry.data('jg.loaded', undefined);
      $entry.removeClass('jg-entry');

      // Reset image style
      var $img = this.imgFromEntry($entry);
      $img.css('width', '');
      $img.css('height', '');
      $img.css('margin-left', '');
      $img.css('margin-top', '');
      $img.attr('src', $img.data('jg.originalSrc'));
      $img.data('jg.originalSrc', undefined);

      // Remove caption
      this.removeCaptionEventsHandlers($entry);
      var $caption = this.captionFromEntry($entry);
      if ($entry.data('jg.createdCaption')) {
        // remove also the caption element (if created by jg)
        $entry.data('jg.createdCaption', undefined);
        if ($caption !== null) $caption.remove();
      } else {
        if ($caption !== null) $caption.fadeTo(0, 1);
      }

    }, this));

    this.$gallery.css('height', '');
    this.$gallery.removeClass('justified-gallery');
    this.$gallery.data('jg.controller', undefined);
  };

  /**
   * Analyze the images and builds the rows. It returns if it found an image that is not loaded.
   *
   * @param isForResize if the image analyzer is called for resizing or not, to call a different callback at the end
   */
  JustifiedGallery.prototype.analyzeImages = function (isForResize) {
    for (var i = this.lastAnalyzedIndex + 1; i < this.entries.length; i++) {
      var $entry = $(this.entries[i]);
      if ($entry.data('jg.loaded') === true || $entry.data('jg.loaded') === 'skipped') {
        var availableWidth = this.galleryWidth - 2 * this.border - (
            (this.buildingRow.entriesBuff.length - 1) * this.settings.margins);
        var imgAspectRatio = $entry.data('jg.width') / $entry.data('jg.height');
        if (availableWidth / (this.buildingRow.aspectRatio + imgAspectRatio) < this.settings.rowHeight) {
          this.flushRow(false);
          if(++this.yield.flushed >= this.yield.every) {
            this.startImgAnalyzer(isForResize);
            return;
          }
        }

        this.buildingRow.entriesBuff.push($entry);
        this.buildingRow.aspectRatio += imgAspectRatio;
        this.buildingRow.width += imgAspectRatio * this.settings.rowHeight;
        this.lastAnalyzedIndex = i;

      } else if ($entry.data('jg.loaded') !== 'error') {
        return;
      }
    }

    // Last row flush (the row is not full)
    if (this.buildingRow.entriesBuff.length > 0) this.flushRow(true);

    if (this.isSpinnerActive()) {
      this.stopLoadingSpinnerAnimation();
    }

    /* Stop, if there is, the timeout to start the analyzeImages.
     This is because an image can be set loaded, and the timeout can be set,
     but this image can be analyzed yet.
     */
    this.stopImgAnalyzerStarter();

    //On complete callback
    this.$gallery.trigger(isForResize ? 'jg.resize' : 'jg.complete');
    this.$gallery.height(this.galleryHeightToSet);
  };

  /**
   * Stops any ImgAnalyzer starter (that has an assigned timeout)
   */
  JustifiedGallery.prototype.stopImgAnalyzerStarter = function () {
    this.yield.flushed = 0;
    if (this.imgAnalyzerTimeout !== null) clearTimeout(this.imgAnalyzerTimeout);
  };

  /**
   * Starts the image analyzer. It is not immediately called to let the browser to update the view
   *
   * @param isForResize specifies if the image analyzer must be called for resizing or not
   */
  JustifiedGallery.prototype.startImgAnalyzer = function (isForResize) {
    var that = this;
    this.stopImgAnalyzerStarter();
    this.imgAnalyzerTimeout = setTimeout(function () {
      that.analyzeImages(isForResize);
    }, 0.001); // we can't start it immediately due to a IE different behaviour
  };

  /**
   * Checks if the image is loaded or not using another image object. We cannot use the 'complete' image property,
   * because some browsers, with a 404 set complete = true.
   *
   * @param imageSrc the image src to load
   * @param onLoad callback that is called when the image has been loaded
   * @param onError callback that is called in case of an error
   */
  JustifiedGallery.prototype.onImageEvent = function (imageSrc, onLoad, onError) {
    if (!onLoad && !onError) return;

    var memImage = new Image();
    var $memImage = $(memImage);
    if (onLoad) {
      $memImage.one('load', function () {
        $memImage.off('load error');
        onLoad(memImage);
      });
    }
    if (onError) {
      $memImage.one('error', function() {
        $memImage.off('load error');
        onError(memImage);
      });
    }
    memImage.src = imageSrc;
  };

  /**
   * Init of Justified Gallery controlled
   * It analyzes all the entries starting theirs loading and calling the image analyzer (that works with loaded images)
   */
  JustifiedGallery.prototype.init = function () {
    var imagesToLoad = false, skippedImages = false, that = this;
    $.each(this.entries, function (index, entry) {
      var $entry = $(entry);
      var $image = that.imgFromEntry($entry);

      $entry.addClass('jg-entry');

      if ($entry.data('jg.loaded') !== true && $entry.data('jg.loaded') !== 'skipped') {

        // Link Rel global overwrite
        if (that.settings.rel !== null) $entry.attr('rel', that.settings.rel);

        // Link Target global overwrite
        if (that.settings.target !== null) $entry.attr('target', that.settings.target);

        if ($image !== null) {

          // Image src
          var imageSrc = that.extractImgSrcFromImage($image);
          $image.attr('src', imageSrc);

          /* If we have the height and the width, we don't wait that the image is loaded, but we start directly
           * with the justification */
          if (that.settings.waitThumbnailsLoad === false) {
            var width = parseFloat($image.attr('width'));
            var height = parseFloat($image.attr('height'));
            if (!isNaN(width) && !isNaN(height)) {
              $entry.data('jg.width', width);
              $entry.data('jg.height', height);
              $entry.data('jg.loaded', 'skipped');
              skippedImages = true;
              that.startImgAnalyzer(false);
              return true; // continue
            }
          }

          $entry.data('jg.loaded', false);
          imagesToLoad = true;

          // Spinner start
          if (!that.isSpinnerActive()) that.startLoadingSpinnerAnimation();

          that.onImageEvent(imageSrc, function (loadImg) { // image loaded
            $entry.data('jg.width', loadImg.width);
            $entry.data('jg.height', loadImg.height);
            $entry.data('jg.loaded', true);
            that.startImgAnalyzer(false);
          }, function () { // image load error
            $entry.data('jg.loaded', 'error');
            that.startImgAnalyzer(false);
          });

        } else {
          $entry.data('jg.loaded', true);
          $entry.data('jg.width', $entry.width() | parseFloat($entry.css('width')) | 1);
          $entry.data('jg.height', $entry.height() | parseFloat($entry.css('height')) | 1);
        }

      }

    });

    if (!imagesToLoad && !skippedImages) this.startImgAnalyzer(false);
    this.checkWidth();
  };

  /**
   * Checks that it is a valid number. If a string is passed it is converted to a number
   *
   * @param settingContainer the object that contains the setting (to allow the conversion)
   * @param settingName the setting name
   */
  JustifiedGallery.prototype.checkOrConvertNumber = function (settingContainer, settingName) {
    if ($.type(settingContainer[settingName]) === 'string') {
      settingContainer[settingName] = parseFloat(settingContainer[settingName]);
    }

    if ($.type(settingContainer[settingName]) === 'number') {
      if (isNaN(settingContainer[settingName])) throw 'invalid number for ' + settingName;
    } else {
      throw settingName + ' must be a number';
    }
  };

  /**
   * Checks the sizeRangeSuffixes and, if necessary, converts
   * its keys from string (e.g. old settings with 'lt100') to int.
   */
  JustifiedGallery.prototype.checkSizeRangesSuffixes = function () {
    if ($.type(this.settings.sizeRangeSuffixes) !== 'object') {
      throw 'sizeRangeSuffixes must be defined and must be an object';
    }

    var suffixRanges = [];
    for (var rangeIdx in this.settings.sizeRangeSuffixes) {
      if (this.settings.sizeRangeSuffixes.hasOwnProperty(rangeIdx)) suffixRanges.push(rangeIdx);
    }

    var newSizeRngSuffixes = {0: ''};
    for (var i = 0; i < suffixRanges.length; i++) {
      if ($.type(suffixRanges[i]) === 'string') {
        try {
          var numIdx = parseInt(suffixRanges[i].replace(/^[a-z]+/, ''), 10);
          newSizeRngSuffixes[numIdx] = this.settings.sizeRangeSuffixes[suffixRanges[i]];
        } catch (e) {
          throw 'sizeRangeSuffixes keys must contains correct numbers (' + e + ')';
        }
      } else {
        newSizeRngSuffixes[suffixRanges[i]] = this.settings.sizeRangeSuffixes[suffixRanges[i]];
      }
    }

    this.settings.sizeRangeSuffixes = newSizeRngSuffixes;
  };

  /**
   * check and convert the maxRowHeight setting
   */
  JustifiedGallery.prototype.retrieveMaxRowHeight = function () {
    var newMaxRowHeight = { };

    if ($.type(this.settings.maxRowHeight) === 'string') {
      if (this.settings.maxRowHeight.match(/^[0-9]+%$/)) {
        newMaxRowHeight.value = parseFloat(this.settings.maxRowHeight.match(/^([0-9]+)%$/)[1]) / 100;
        newMaxRowHeight.isPercentage = false;
      } else {
        newMaxRowHeight.value = parseFloat(this.settings.maxRowHeight);
        newMaxRowHeight.isPercentage = true;
      }
    } else if ($.type(this.settings.maxRowHeight) === 'number') {
      newMaxRowHeight.value = this.settings.maxRowHeight;
      newMaxRowHeight.isPercentage = false;
    } else if (this.settings.maxRowHeight === false ||
        this.settings.maxRowHeight === null ||
        typeof this.settings.maxRowHeight == 'undefined') {
      return null;
    } else {
      throw 'maxRowHeight must be a number or a percentage';
    }

    // check if the converted value is not a number
    if (isNaN(newMaxRowHeight.value)) throw 'invalid number for maxRowHeight';

    // check values
    if (newMaxRowHeight.isPercentage) {
      if (newMaxRowHeight.value < 100) newMaxRowHeight.value = 100;
    }

    return newMaxRowHeight;
  };

  /**
   * Checks the settings
   */
  JustifiedGallery.prototype.checkSettings = function () {
    this.checkSizeRangesSuffixes();

    this.checkOrConvertNumber(this.settings, 'rowHeight');
    this.checkOrConvertNumber(this.settings, 'margins');
    this.checkOrConvertNumber(this.settings, 'border');

    var lastRowModes = [
      'justify',
      'nojustify',
      'left',
      'center',
      'right',
      'hide'
    ];
    if (lastRowModes.indexOf(this.settings.lastRow) === -1) {
      throw 'lastRow must be one of: ' + lastRowModes.join(', ');
    }

    this.checkOrConvertNumber(this.settings, 'justifyThreshold');
    if (this.settings.justifyThreshold < 0 || this.settings.justifyThreshold > 1) {
      throw 'justifyThreshold must be in the interval [0,1]';
    }
    if ($.type(this.settings.cssAnimation) !== 'boolean') {
      throw 'cssAnimation must be a boolean';
    }

    if ($.type(this.settings.captions) !== 'boolean') throw 'captions must be a boolean';
    this.checkOrConvertNumber(this.settings.captionSettings, 'animationDuration');

    this.checkOrConvertNumber(this.settings.captionSettings, 'visibleOpacity');
    if (this.settings.captionSettings.visibleOpacity < 0 ||
        this.settings.captionSettings.visibleOpacity > 1) {
      throw 'captionSettings.visibleOpacity must be in the interval [0, 1]';
    }

    this.checkOrConvertNumber(this.settings.captionSettings, 'nonVisibleOpacity');
    if (this.settings.captionSettings.nonVisibleOpacity < 0 ||
        this.settings.captionSettings.nonVisibleOpacity > 1) {
      throw 'captionSettings.nonVisibleOpacity must be in the interval [0, 1]';
    }

    this.checkOrConvertNumber(this.settings, 'imagesAnimationDuration');
    this.checkOrConvertNumber(this.settings, 'refreshTime');
    this.checkOrConvertNumber(this.settings, 'refreshSensitivity');
    if ($.type(this.settings.randomize) !== 'boolean') throw 'randomize must be a boolean';
    if ($.type(this.settings.selector) !== 'string') throw 'selector must be a string';

    if (this.settings.sort !== false && !$.isFunction(this.settings.sort)) {
      throw 'sort must be false or a comparison function';
    }

    if (this.settings.filter !== false && !$.isFunction(this.settings.filter) &&
        $.type(this.settings.filter) !== 'string') {
      throw 'filter must be false, a string or a filter function';
    }
  };

  /**
   * It brings all the indexes from the sizeRangeSuffixes and it orders them. They are then sorted and returned.
   * @returns {Array} sorted suffix ranges
   */
  JustifiedGallery.prototype.retrieveSuffixRanges = function () {
    var suffixRanges = [];
    for (var rangeIdx in this.settings.sizeRangeSuffixes) {
      if (this.settings.sizeRangeSuffixes.hasOwnProperty(rangeIdx)) suffixRanges.push(parseInt(rangeIdx, 10));
    }
    suffixRanges.sort(function (a, b) { return a > b ? 1 : a < b ? -1 : 0; });
    return suffixRanges;
  };

  /**
   * Update the existing settings only changing some of them
   *
   * @param newSettings the new settings (or a subgroup of them)
   */
  JustifiedGallery.prototype.updateSettings = function (newSettings) {
    // In this case Justified Gallery has been called again changing only some options
    this.settings = $.extend({}, this.settings, newSettings);
    this.checkSettings();

    // As reported in the settings: negative value = same as margins, 0 = disabled
    this.border = this.settings.border >= 0 ? this.settings.border : this.settings.margins;

    this.maxRowHeight = this.retrieveMaxRowHeight();
    this.suffixRanges = this.retrieveSuffixRanges();
  };

  /**
   * Justified Gallery plugin for jQuery
   *
   * Events
   *  - jg.complete : called when all the gallery has been created
   *  - jg.resize : called when the gallery has been resized
   *  - jg.rowflush : when a new row appears
   *
   * @param arg the action (or the settings) passed when the plugin is called
   * @returns {*} the object itself
   */
  $.fn.justifiedGallery = function (arg) {
    return this.each(function (index, gallery) {

      var $gallery = $(gallery);
      $gallery.addClass('justified-gallery');

      var controller = $gallery.data('jg.controller');
      if (typeof controller === 'undefined') {
        // Create controller and assign it to the object data
        if (typeof arg !== 'undefined' && arg !== null && $.type(arg) !== 'object') {
          if (arg === 'destroy') return; // Just a call to an unexisting object
          throw 'The argument must be an object';
        }
        controller = new JustifiedGallery($gallery, $.extend({}, $.fn.justifiedGallery.defaults, arg));
        $gallery.data('jg.controller', controller);
      } else if (arg === 'norewind') {
        // In this case we don't rewind: we analyze only the latest images (e.g. to complete the last unfinished row
        // ... left to be more readable
      } else if (arg === 'destroy') {
        controller.destroy();
        return;
      } else {
        // In this case Justified Gallery has been called again changing only some options
        controller.updateSettings(arg);
        controller.rewind();
      }

      // Update the entries list
      if (!controller.updateEntries(arg === 'norewind')) return;

      // Init justified gallery
      controller.init();

    });
  };

  // Default options
  $.fn.justifiedGallery.defaults = {
    sizeRangeSuffixes: { }, /* e.g. Flickr configuration
        {
          100: '_t',  // used when longest is less than 100px
          240: '_m',  // used when longest is between 101px and 240px
          320: '_n',  // ...
          500: '',
          640: '_z',
          1024: '_b'  // used as else case because it is the last
        }
    */
    thumbnailPath: undefined, /* If defined, sizeRangeSuffixes is not used, and this function is used to determine the
    path relative to a specific thumbnail size. The function should accept respectively three arguments:
    current path, width and height */
    rowHeight: 120,
    maxRowHeight: false, // false or negative value to deactivate. Positive number to express the value in pixels,
                         // A string '[0-9]+%' to express in percentage (e.g. 300% means that the row height
                         // can't exceed 3 * rowHeight)
    margins: 1,
    border: -1, // negative value = same as margins, 0 = disabled, any other value to set the border

    lastRow: 'nojustify', // … which is the same as 'left', or can be 'justify', 'center', 'right' or 'hide'

    justifyThreshold: 0.90, /* if row width / available space > 0.90 it will be always justified
                             * (i.e. lastRow setting is not considered) */
    waitThumbnailsLoad: true,
    captions: true,
    cssAnimation: true,
    imagesAnimationDuration: 500, // ignored with css animations
    captionSettings: { // ignored with css animations
      animationDuration: 500,
      visibleOpacity: 0.7,
      nonVisibleOpacity: 0.0
    },
    rel: null, // rewrite the rel of each analyzed links
    target: null, // rewrite the target of all links
    extension: /\.[^.\\/]+$/, // regexp to capture the extension of an image
    refreshTime: 200, // time interval (in ms) to check if the page changes its width
    refreshSensitivity: 0, // change in width allowed (in px) without re-building the gallery
    randomize: false,
    sort: false, /*
      - false: to do not sort
      - function: to sort them using the function as comparator (see Array.prototype.sort())
    */
    filter: false, /*
      - false, null or undefined: for a disabled filter
      - a string: an entry is kept if entry.is(filter string) returns true
                  see jQuery's .is() function for further information
      - a function: invoked with arguments (entry, index, array). Return true to keep the entry, false otherwise.
                    It follows the specifications of the Array.prototype.filter() function of JavaScript.
    */
    selector: 'a, div:not(.spinner)' // The selector that is used to know what are the entries of the gallery
  };

}(jQuery));

/* ==========================================================================
 * bootstrap-tab-history.js
 * Author: Michael Narayan <mnarayan01@gmail.com>
 * Repository: https://github.com/mnarayan01/bootstrap-tab-history/
 * ==========================================================================
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain a
 * copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 * ========================================================================== */

/* ========================================================================== */
/* JSHint directives                                                          */
/*                                                                            */
/* global BootstrapTabHistory: true                                           */
/*                                                                            */
/* global document                                                            */
/* global jQuery                                                              */
/* global history                                                             */
/* global window                                                              */
/* ========================================================================== */

/**
 * Integrate [HTML5 history state tracking](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history)
 * with [`bootstrap/tab.js`](http://getbootstrap.com/javascript/#tabs). To enable tracking on a tab element, simply set
 * the `data-tab-history` attribute to true (or a string denoting a tab grouping).
 *
 * See the README for additional information.
 *
 * Functionality based upon bootstrap/tab.js v3.1.0; reference it when making any changes.
 */

BootstrapTabHistory = {
  options: {
    /**
     * When the anchor portion of the URI is used to activate a tab, scroll down to the given offset, rather than the
     * element with the given `id` attribute. Set to null to disable. Only relevant if showTabsBasedOnAnchor is true.
     *
     * May be overriden on a per-element basis by the attribute `data-tab-history-anchor-y-offset`.
     *
     * @public
     * @type {?number}
     */
    defaultAnchorYOffset: 0,
    /**
     * Either 'push' or 'replace', for whether to use `history.pushState` or `history.replaceState`, resp.
     *
     * May be overriden on a per-element basis by the attribute `data-tab-history-changer`.
     *
     * @public
     * @type {string}
     */
    defaultChanger: 'replace',
    /**
     * If true, update the URL in onShownTab in the calls to `history.pushState` and `history.replaceState`. Otherwise,
     * `null` is passed as the third parameter to these calls.
     *
     * May be overriden on a per-element basis by the attribute `data-tab-history-update-url`.
     *
     * @public
     * @type {boolean}
     */
    defaultUpdateURL: false,
    /**
     * Should the anchor portion of the loaded URI be used to activate a single tab if no history was present on page
     * load.
     *
     * @public
     * @type {boolean}
     */
    showTabsBasedOnAnchor: true
  }
};

(function () {
  'use strict';

  jQuery(function () {
    if(history && history.pushState && history.replaceState) {
      var bootstrapTabHistory = history.state && history.state.bootstrapTabHistory;

      if(bootstrapTabHistory) {
        showTabsBasedOnState(bootstrapTabHistory);
      } else {
        showTabsBasedOnAnchor();
      }

      backfillHistoryState();

      jQuery(document).on('shown.bs.tab show.bs.collapse', onShownTab);
      jQuery(window).on('popstate', onPopState);
    } else {
      showTabsBasedOnAnchor();
    }
  });

  /**
   * Used to prevent onShownTab from registering shown events that we triggered via showTabsBasedOnState.
   *
   * @type {boolean}
   */
  var showingTabsBasedOnState = false;

  /**
   * Used to update `history.state` to reflect the default active tabs on initial page load. This supports proper
   * `history.back` handling when `data-tab-history-update-url` is true.
   */
  function backfillHistoryState() {
    var newState = null;

    jQuery('li.active > [data-tab-history], .panel-title.active [data-tab-history]').each(function () {//edited by Uncode
      var $activeTabElement = jQuery(this);
      var selector = getTabSelector($activeTabElement);

      if(selector) {
        var tabGroup = getTabGroup($activeTabElement);

        if(tabGroup) {
          newState = createNewHistoryState(newState || history.state, tabGroup, selector);
        }
      }
    });

    if(newState) {
      history.replaceState(newState, '', null);
    }
  }

  /**
   * Clone the existing state, ensure its bootstrapTabHistory attribute is an Object, and add the provided tabGroup to
   * said bootstrapTabHistory attribute.
   *
   * @param {?object} existingState
   * @param {!string} tabGroup
   * @param {!string} selector
   * @returns {!object}
   */
  function createNewHistoryState(existingState, tabGroup, selector) {
    // Clone history.state and ensure it has a bootstrapTabHistory entry.
    var newState = jQuery.extend(true, {}, existingState, {
      bootstrapTabHistory: {}
    });

    newState.bootstrapTabHistory[tabGroup] = selector;

    return newState;
  }

  /**
   * @param {jQuery} $tab
   * @returns {?string}
   */
  function getTabGroup($tab) {
    return parseTruthyAttributeValue($tab.data('tab-history'));
  }

  /**
   * @param {jQuery} $tab
   * @returns {?string}
   */
  function getTabSelector($tab) {
    return $tab.data('target') || $tab.attr('href');
  }

  /**
   * Receives the `shown.bs.tab` event. Updates `history.state` as appropriate.
   *
   * @param {jQuery.Event} shownEvt
   */
  function onShownTab(shownEvt) {
    if(!showingTabsBasedOnState) {
      var $activatedTab = jQuery(shownEvt.target);
      if ( $activatedTab.hasClass('panel-collapse') )
        $activatedTab = $activatedTab.closest('.panel').find('a');
      var selector = getTabSelector($activatedTab);

      if(selector) {
        var tabGroup = getTabGroup($activatedTab);

        if(tabGroup) {
          var historyChanger = $activatedTab.data('tab-history-changer') || BootstrapTabHistory.options.defaultChanger;
          var newState = createNewHistoryState(history.state, tabGroup, selector);
          var updateURL = (function ($activatedTab) {
            if(selector[0] === '#') {
              var elementUpdateURLOption = parseTruthyAttributeValue($activatedTab.data('tab-history-update-url'));

              if(elementUpdateURLOption === undefined) {
                return BootstrapTabHistory.options.defaultUpdateURL;
              } else {
                return elementUpdateURLOption;
              }
            } else {
              return false;
            }
          })($activatedTab);

          switch(historyChanger) {
            case 'push':
              history.pushState(newState, '', updateURL ? selector : null);
              break;
            case 'replace':
              history.replaceState(newState, '', updateURL ? selector : null);
              break;
            default:
              throw new Error('Unknown tab-history-changer: ' + historyChanger);
          }
        }
      }
    }
  }

  /**
   * Receives the `popstate` event. Shows tabs based on the value of `history.state` as appropriate.
   */
  function onPopState() {
    var bootstrapTabHistory = history.state && history.state.bootstrapTabHistory;

    if(bootstrapTabHistory) {
      showTabsBasedOnState(bootstrapTabHistory);
    }
  }

  /**
   * Returns the given value, _unless_ that value is an empty string, in which case `true` is returned.
   *
   * Rationale: HAML data attributes which are set to `true` are rendered as a blank string.
   *
   * @param {*} value
   * @returns {*}
   */
  function parseTruthyAttributeValue(value) {
    if(value) {
      return value;
    } else if(value === '') {
      return true;
    } else {
      return value;
    }
  }

  /**
   * Show tabs based upon the anchor component of `window.location`.
   */
  function showTabsBasedOnAnchor() {
    if(BootstrapTabHistory.options.showTabsBasedOnAnchor) {
      var anchor = window.location && window.location.hash;

      if(anchor) {
        var $tabElement = showTabForSelector(anchor);

        if($tabElement && window.addEventListener && window.removeEventListener) {
          var anchorYOffset = (function ($tabElement) {
            var elementSetting = $tabElement.data('tab-history-anchor-y-offset');

            if(elementSetting === undefined) {
              return BootstrapTabHistory.options.defaultAnchorYOffset;
            } else {
              return elementSetting;
            }
          })($tabElement);

          // HACK: This prevents scrolling to the tab on page load. This relies on the fact that we should never get
          //   here on `history.forward`, `history.back`, or `location.reload`, since in all those situations the
          //   `history.state` object should have been used (unless the browser did not support the modern History API).
          if(anchorYOffset || anchorYOffset === 0) {
            var scrollListener = function resetAnchorScroll () {
              window.removeEventListener('scroll', scrollListener);
              window.scrollTo(0, anchorYOffset);
            };

            window.addEventListener('scroll', scrollListener);
          }
        }
      }
    }
  }

  /**
   * Show a tab which corresponds to the provided selector.
   *
   * @param {string} selector - A CSS selector.
   * @returns {?jQuery} - The tab which was found to show (even if said tab was already active).
   */
  function showTabForSelector(selector) {
    var $tabElement = (function (selector) {
      var $ret = null;

      jQuery('[data-toggle="tab"], [data-toggle="pill"], [data-toggle="collapse"]').each(function () {
        var $potentialTab = jQuery(this);

        if(($potentialTab.attr('href') === selector || $potentialTab.data('target') === selector ) && getTabGroup($potentialTab)) {
          $ret = $potentialTab;
          return false;
        } else {
         return null;
        }
      });

      return $ret;
    })(selector);

    if($tabElement) {
      $tabElement.trigger('click');
      //$tabElement.tab('show');
    }

    return $tabElement;
  }

  /**
   * Iterate through the provided set of tab tab groups, showing the tabs based on the stored selectors.
   *
   * @param {object} bootstrapTabHistory - Each of the values is passed to showTabForSelector; the keys are actually irrelevant.
   */
  function showTabsBasedOnState(bootstrapTabHistory) {
    showingTabsBasedOnState = true;

    try {
      for(var k in bootstrapTabHistory) {
        if(bootstrapTabHistory.hasOwnProperty(k)) {
          showTabForSelector(bootstrapTabHistory[k]);
        }
      }
    } finally {
      showingTabsBasedOnState = false;
    }
  }
})();




/* ========================================================================
 * Bootstrap: collapse.js v3.1.1
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)

    this.transitioning = 1

    var complete = function (e) {
      if (e && e.target != this.$element[0]) return
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function (e) {
      if (e && e.target != this.$element[0]) return
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    //Edited by Uncode to replace ID in panel [START]
    var _target = href.replace(/^#/, "");
    if ( $('[data-id="' + _target + '"]').length ) {
      var $target = $('[data-id="' + _target + '"]')
    } else {
      var $target = $(target)
    }
    //Edited by Uncode to replace ID in panel [END]
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(jQuery);


/* ========================================================================
 * Bootstrap: tab.js v3.1.1
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    //Edited by Uncode to replace ID in panel [START]
    var _target = selector.replace(/^#/, "");
    if ( $('[data-id="' + _target + '"]').length )
      var $target = $('[data-id="' + _target + '"]')
    else
      var $target = $(selector)
    //Edited by Uncode to replace ID in panel [END]

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(jQuery);


/* ========================================================================
 * Bootstrap: tooltip.js v3.1.1
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return
      var that = this;

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var $parent      = this.$element.parent()
        var parentDim    = this.getPosition($parent)

        placement = placement == 'bottom' && pos.top   + pos.height       + actualHeight - parentDim.scroll > parentDim.height ? 'top'    :
                    placement == 'top'    && pos.top   - parentDim.scroll - actualHeight < 0                                   ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth      > parentDim.width                                    ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth      < parentDim.left                                     ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.hoverState = null

      var complete = function() {
        that.$element.trigger('shown.bs.' + that.type)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one($.support.transition.end, complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var arrowDelta          = delta.left ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowPosition       = delta.left ? 'left'        : 'top'
    var arrowOffsetPosition = delta.left ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], arrowPosition)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one($.support.transition.end, complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element
    var el     = $element[0]
    var isBody = el.tagName == 'BODY'
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width:  isBody ? $(window).width()  : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? {top: 0, left: 0} : $element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);


/* ========================================================================
 * Bootstrap: transition.js v3.1.1
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(jQuery);


