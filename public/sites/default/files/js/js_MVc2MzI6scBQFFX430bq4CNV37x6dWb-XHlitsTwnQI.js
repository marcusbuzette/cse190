(function(c,q){var m="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(f){function n(){var b=c(j),a=c(h);d&&(h.length?d.reject(e,b,a):d.resolve(e));c.isFunction(f)&&f.call(g,e,b,a)}function p(b){k(b.target,"error"===b.type)}function k(b,a){b.src===m||-1!==c.inArray(b,l)||(l.push(b),a?h.push(b):j.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),r&&d.notifyWith(c(b),[a,e,c(j),c(h)]),e.length===l.length&&(setTimeout(n),e.unbind(".imagesLoaded",
p)))}var g=this,d=c.isFunction(c.Deferred)?c.Deferred():0,r=c.isFunction(d.notify),e=g.find("img").add(g.filter("img")),l=[],j=[],h=[];c.isPlainObject(f)&&c.each(f,function(b,a){if("callback"===b)f=a;else if(d)d[b](a)});e.length?e.bind("load.imagesLoaded error.imagesLoaded",p).each(function(b,a){var d=a.src,e=c.data(a,"imagesLoaded");if(e&&e.src===d)k(a,e.isBroken);else if(a.complete&&a.naturalWidth!==q)k(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=m,a.src=d}):
n();return d?d.promise(g):g}})(jQuery);
;
(function ($) {

/**
 * Attaches the autocomplete behavior to all required fields.
 */
Drupal.behaviors.autocomplete = {
  attach: function (context, settings) {
    var acdb = [];
    $('input.autocomplete', context).once('autocomplete', function () {
      var uri = this.value;
      if (!acdb[uri]) {
        acdb[uri] = new Drupal.ACDB(uri);
      }
      var $input = $('#' + this.id.substr(0, this.id.length - 13))
        .attr('autocomplete', 'OFF')
        .attr('aria-autocomplete', 'list');
      $($input[0].form).submit(Drupal.autocompleteSubmit);
      $input.parent()
        .attr('role', 'application')
        .append($('<span class="element-invisible" aria-live="assertive"></span>')
          .attr('id', $input.attr('id') + '-autocomplete-aria-live')
        );
      new Drupal.jsAC($input, acdb[uri]);
    });
  }
};

/**
 * Prevents the form from submitting if the suggestions popup is open
 * and closes the suggestions popup when doing so.
 */
Drupal.autocompleteSubmit = function () {
  return $('#autocomplete').each(function () {
    this.owner.hidePopup();
  }).length == 0;
};

/**
 * An AutoComplete object.
 */
Drupal.jsAC = function ($input, db) {
  var ac = this;
  this.input = $input[0];
  this.ariaLive = $('#' + this.input.id + '-autocomplete-aria-live');
  this.db = db;

  $input
    .keydown(function (event) { return ac.onkeydown(this, event); })
    .keyup(function (event) { ac.onkeyup(this, event); })
    .blur(function () { ac.hidePopup(); ac.db.cancel(); });

};

/**
 * Handler for the "keydown" event.
 */
Drupal.jsAC.prototype.onkeydown = function (input, e) {
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
    case 40: // down arrow.
      this.selectDown();
      return false;
    case 38: // up arrow.
      this.selectUp();
      return false;
    default: // All other keys.
      return true;
  }
};

/**
 * Handler for the "keyup" event.
 */
Drupal.jsAC.prototype.onkeyup = function (input, e) {
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
    case 16: // Shift.
    case 17: // Ctrl.
    case 18: // Alt.
    case 20: // Caps lock.
    case 33: // Page up.
    case 34: // Page down.
    case 35: // End.
    case 36: // Home.
    case 37: // Left arrow.
    case 38: // Up arrow.
    case 39: // Right arrow.
    case 40: // Down arrow.
      return true;

    case 9:  // Tab.
    case 13: // Enter.
    case 27: // Esc.
      this.hidePopup(e.keyCode);
      return true;

    default: // All other keys.
      if (input.value.length > 0 && !input.readOnly) {
        this.populatePopup();
      }
      else {
        this.hidePopup(e.keyCode);
      }
      return true;
  }
};

/**
 * Puts the currently highlighted suggestion into the autocomplete field.
 */
Drupal.jsAC.prototype.select = function (node) {
  this.input.value = $(node).data('autocompleteValue');
  $(this.input).trigger('autocompleteSelect', [node]);
};

/**
 * Highlights the next suggestion.
 */
Drupal.jsAC.prototype.selectDown = function () {
  if (this.selected && this.selected.nextSibling) {
    this.highlight(this.selected.nextSibling);
  }
  else if (this.popup) {
    var lis = $('li', this.popup);
    if (lis.length > 0) {
      this.highlight(lis.get(0));
    }
  }
};

/**
 * Highlights the previous suggestion.
 */
Drupal.jsAC.prototype.selectUp = function () {
  if (this.selected && this.selected.previousSibling) {
    this.highlight(this.selected.previousSibling);
  }
};

/**
 * Highlights a suggestion.
 */
Drupal.jsAC.prototype.highlight = function (node) {
  if (this.selected) {
    $(this.selected).removeClass('selected');
  }
  $(node).addClass('selected');
  this.selected = node;
  $(this.ariaLive).html($(this.selected).html());
};

/**
 * Unhighlights a suggestion.
 */
Drupal.jsAC.prototype.unhighlight = function (node) {
  $(node).removeClass('selected');
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Hides the autocomplete suggestions.
 */
Drupal.jsAC.prototype.hidePopup = function (keycode) {
  // Select item if the right key or mousebutton was pressed.
  if (this.selected && ((keycode && keycode != 46 && keycode != 8 && keycode != 27) || !keycode)) {
    this.select(this.selected);
  }
  // Hide popup.
  var popup = this.popup;
  if (popup) {
    this.popup = null;
    $(popup).fadeOut('fast', function () { $(popup).remove(); });
  }
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Positions the suggestions popup and starts a search.
 */
Drupal.jsAC.prototype.populatePopup = function () {
  var $input = $(this.input);
  var position = $input.position();
  // Show popup.
  if (this.popup) {
    $(this.popup).remove();
  }
  this.selected = false;
  this.popup = $('<div id="autocomplete"></div>')[0];
  this.popup.owner = this;
  $(this.popup).css({
    top: parseInt(position.top + this.input.offsetHeight, 10) + 'px',
    left: parseInt(position.left, 10) + 'px',
    width: $input.innerWidth() + 'px',
    display: 'none'
  });
  $input.before(this.popup);

  // Do search.
  this.db.owner = this;
  this.db.search(this.input.value);
};

/**
 * Fills the suggestion popup with any matches received.
 */
Drupal.jsAC.prototype.found = function (matches) {
  // If no value in the textfield, do not show the popup.
  if (!this.input.value.length) {
    return false;
  }

  // Prepare matches.
  var ul = $('<ul></ul>');
  var ac = this;
  for (key in matches) {
    $('<li></li>')
      .html($('<div></div>').html(matches[key]))
      .mousedown(function () { ac.hidePopup(this); })
      .mouseover(function () { ac.highlight(this); })
      .mouseout(function () { ac.unhighlight(this); })
      .data('autocompleteValue', key)
      .appendTo(ul);
  }

  // Show popup with matches, if any.
  if (this.popup) {
    if (ul.children().length) {
      $(this.popup).empty().append(ul).show();
      $(this.ariaLive).html(Drupal.t('Autocomplete popup'));
    }
    else {
      $(this.popup).css({ visibility: 'hidden' });
      this.hidePopup();
    }
  }
};

Drupal.jsAC.prototype.setStatus = function (status) {
  switch (status) {
    case 'begin':
      $(this.input).addClass('throbbing');
      $(this.ariaLive).html(Drupal.t('Searching for matches...'));
      break;
    case 'cancel':
    case 'error':
    case 'found':
      $(this.input).removeClass('throbbing');
      break;
  }
};

/**
 * An AutoComplete DataBase object.
 */
Drupal.ACDB = function (uri) {
  this.uri = uri;
  this.delay = 300;
  this.cache = {};
};

/**
 * Performs a cached and delayed search.
 */
Drupal.ACDB.prototype.search = function (searchString) {
  var db = this;
  this.searchString = searchString;

  // See if this string needs to be searched for anyway. The pattern ../ is
  // stripped since it may be misinterpreted by the browser.
  searchString = searchString.replace(/^\s+|\.{2,}\/|\s+$/g, '');
  // Skip empty search strings, or search strings ending with a comma, since
  // that is the separator between search terms.
  if (searchString.length <= 0 ||
    searchString.charAt(searchString.length - 1) == ',') {
    return;
  }

  // See if this key has been searched for before.
  if (this.cache[searchString]) {
    return this.owner.found(this.cache[searchString]);
  }

  // Initiate delayed search.
  if (this.timer) {
    clearTimeout(this.timer);
  }
  this.timer = setTimeout(function () {
    db.owner.setStatus('begin');

    // Ajax GET request for autocompletion. We use Drupal.encodePath instead of
    // encodeURIComponent to allow autocomplete search terms to contain slashes.
    $.ajax({
      type: 'GET',
      url: db.uri + '/' + Drupal.encodePath(searchString),
      dataType: 'json',
      success: function (matches) {
        if (typeof matches.status == 'undefined' || matches.status != 0) {
          db.cache[searchString] = matches;
          // Verify if these are still the matches the user wants to see.
          if (db.searchString == searchString) {
            db.owner.found(matches);
          }
          db.owner.setStatus('found');
        }
      },
      error: function (xmlhttp) {
        Drupal.displayAjaxError(Drupal.ajaxError(xmlhttp, db.uri));
      }
    });
  }, this.delay);
};

/**
 * Cancels the current autocomplete request.
 */
Drupal.ACDB.prototype.cancel = function () {
  if (this.owner) this.owner.setStatus('cancel');
  if (this.timer) clearTimeout(this.timer);
  this.searchString = '';
};

})(jQuery);
;
!function(t,i){"use strict";i.behaviors.slick={attach:function(i,s){var e=this;t(".slick:not(.unslick)",i).once("slick",function(){var i=t(this),n=t("> .slick__slider",i),l=t("> .slick__arrow",i),a=t.extend({},s.slick,n.data("slick"));e.beforeSlick(n,l,a),n.slick(e.globals(n,l,a)),e.afterSlick(n,a)})},beforeSlick:function(s,e,n){var l,a=this;a.randomize(s),s.on("init.slick",function(r,o){var c=o.options.responsive||null;if(c&&c.length>-1)for(l in c)c.hasOwnProperty(l)&&"unslick"!==c[l].settings&&(o.breakpointSettings[c[l].breakpoint]=t.extend({},i.settings.slick,a.globals(s,e,n),c[l].settings))}),s.on("setPosition.slick",function(t,i){a.setPosition(s,e,i)})},afterSlick:function(i,s){var e=this,n=i.slick("getSlick");i.parent().on("click.slick.load",".slick-down",function(i){i.preventDefault();var e=t(this);t("html, body").stop().animate({scrollTop:t(e.data("target")).offset().top-(e.data("offset")||0)},800,s.easing)}),s.mousewheel&&i.on("mousewheel.slick.load",function(t,s){return t.preventDefault(),0>s?i.slick("slickNext"):i.slick("slickPrev")}),i.trigger("afterSlick",[e,n,n.currentSlide])},randomize:function(t){t.parent().hasClass("slick--random")&&!t.hasClass("slick-initiliazed")&&t.children().sort(function(){return.5-Math.random()}).each(function(){t.append(this)})},setPosition:function(i,s,e){if(i.attr("id")===e.$slider.attr("id")){var n=e.options,l=i.parent().parent(".slick-wrapper").length?i.parent().parent(".slick-wrapper"):i.parent(".slick");return t(".slick-slide",l).removeClass("slick-current"),t("[data-slick-index='"+e.currentSlide+"']",l).addClass("slick-current"),n.centerPadding&&"0"!==n.centerPadding||e.$list.css("padding",""),e.slideCount<=n.slidesToShow||n.arrows===!1?s.addClass("element-hidden"):s.removeClass("element-hidden")}},globals:function(s,e,n){return{slide:n.slide,lazyLoad:n.lazyLoad,dotsClass:n.dotsClass,rtl:n.rtl,appendDots:".slick__arrow"===n.appendDots?e:n.appendDots||t(s),prevArrow:t(".slick-prev",e),nextArrow:t(".slick-next",e),appendArrows:e,customPaging:function(t,s){var e=t.$slides.eq(s).find("[data-thumb]")||null,l=i.t(e.attr("alt"))||"",a="<img alt='"+l+"' src='"+e.data("thumb")+"'>",r=e.length&&n.dotsClass.indexOf("thumbnail")>0?"<div class='slick-dots__thumbnail'>"+a+"</div>":"";return r+t.defaults.customPaging(t,s)}}}}}(jQuery,Drupal);;
﻿/** Abstract base class for collection plugins v1.0.1.
	Written by Keith Wood (kbwood{at}iinet.com.au) December 2013.
	Licensed under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. */
(function(){var j=false;window.JQClass=function(){};JQClass.classes={};JQClass.extend=function extender(f){var g=this.prototype;j=true;var h=new this();j=false;for(var i in f){h[i]=typeof f[i]=='function'&&typeof g[i]=='function'?(function(d,e){return function(){var b=this._super;this._super=function(a){return g[d].apply(this,a||[])};var c=e.apply(this,arguments);this._super=b;return c}})(i,f[i]):f[i]}function JQClass(){if(!j&&this._init){this._init.apply(this,arguments)}}JQClass.prototype=h;JQClass.prototype.constructor=JQClass;JQClass.extend=extender;return JQClass}})();(function($){JQClass.classes.JQPlugin=JQClass.extend({name:'plugin',defaultOptions:{},regionalOptions:{},_getters:[],_getMarker:function(){return'is-'+this.name},_init:function(){$.extend(this.defaultOptions,(this.regionalOptions&&this.regionalOptions[''])||{});var c=camelCase(this.name);$[c]=this;$.fn[c]=function(a){var b=Array.prototype.slice.call(arguments,1);if($[c]._isNotChained(a,b)){return $[c][a].apply($[c],[this[0]].concat(b))}return this.each(function(){if(typeof a==='string'){if(a[0]==='_'||!$[c][a]){throw'Unknown method: '+a;}$[c][a].apply($[c],[this].concat(b))}else{$[c]._attach(this,a)}})}},setDefaults:function(a){$.extend(this.defaultOptions,a||{})},_isNotChained:function(a,b){if(a==='option'&&(b.length===0||(b.length===1&&typeof b[0]==='string'))){return true}return $.inArray(a,this._getters)>-1},_attach:function(a,b){a=$(a);if(a.hasClass(this._getMarker())){return}a.addClass(this._getMarker());b=$.extend({},this.defaultOptions,this._getMetadata(a),b||{});var c=$.extend({name:this.name,elem:a,options:b},this._instSettings(a,b));a.data(this.name,c);this._postAttach(a,c);this.option(a,b)},_instSettings:function(a,b){return{}},_postAttach:function(a,b){},_getMetadata:function(d){try{var f=d.data(this.name.toLowerCase())||'';f=f.replace(/'/g,'"');f=f.replace(/([a-zA-Z0-9]+):/g,function(a,b,i){var c=f.substring(0,i).match(/"/g);return(!c||c.length%2===0?'"'+b+'":':b+':')});f=$.parseJSON('{'+f+'}');for(var g in f){var h=f[g];if(typeof h==='string'&&h.match(/^new Date\((.*)\)$/)){f[g]=eval(h)}}return f}catch(e){return{}}},_getInst:function(a){return $(a).data(this.name)||{}},option:function(a,b,c){a=$(a);var d=a.data(this.name);if(!b||(typeof b==='string'&&c==null)){var e=(d||{}).options;return(e&&b?e[b]:e)}if(!a.hasClass(this._getMarker())){return}var e=b||{};if(typeof b==='string'){e={};e[b]=c}this._optionsChanged(a,d,e);$.extend(d.options,e)},_optionsChanged:function(a,b,c){},destroy:function(a){a=$(a);if(!a.hasClass(this._getMarker())){return}this._preDestroy(a,this._getInst(a));a.removeData(this.name).removeClass(this._getMarker())},_preDestroy:function(a,b){}});function camelCase(c){return c.replace(/-([a-z])/g,function(a,b){return b.toUpperCase()})}$.JQPlugin={createPlugin:function(a,b){if(typeof a==='object'){b=a;a='JQPlugin'}a=camelCase(a);var c=camelCase(b.name);JQClass.classes[c]=JQClass.classes[a].extend(b);new JQClass.classes[c]()}}})(jQuery);;
/* http://keith-wood.name/countdown.html
   Countdown for jQuery v2.0.0.
   Written by Keith Wood (kbwood{at}iinet.com.au) January 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */
(function($){var w='countdown';var Y=0;var O=1;var W=2;var D=3;var H=4;var M=5;var S=6;$.JQPlugin.createPlugin({name:w,defaultOptions:{until:null,since:null,timezone:null,serverSync:null,format:'dHMS',layout:'',compact:false,padZeroes:false,significant:0,description:'',expiryUrl:'',expiryText:'',alwaysExpire:false,onExpiry:null,onTick:null,tickInterval:1},regionalOptions:{'':{labels:['Years','Months','Weeks','Days','Hours','Minutes','Seconds'],labels1:['Year','Month','Week','Day','Hour','Minute','Second'],compactLabels:['y','m','w','d'],whichLabels:null,digits:['0','1','2','3','4','5','6','7','8','9'],timeSeparator:':',isRTL:false}},_getters:['getTimes'],_rtlClass:w+'-rtl',_sectionClass:w+'-section',_amountClass:w+'-amount',_periodClass:w+'-period',_rowClass:w+'-row',_holdingClass:w+'-holding',_showClass:w+'-show',_descrClass:w+'-descr',_timerElems:[],_init:function(){var c=this;this._super();this._serverSyncs=[];var d=(typeof Date.now=='function'?Date.now:function(){return new Date().getTime()});var e=(window.performance&&typeof window.performance.now=='function');function timerCallBack(a){var b=(a<1e12?(e?(performance.now()+performance.timing.navigationStart):d()):a||d());if(b-g>=1000){c._updateElems();g=b}f(timerCallBack)}var f=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||null;var g=0;if(!f||$.noRequestAnimationFrame){$.noRequestAnimationFrame=null;setInterval(function(){c._updateElems()},980)}else{g=window.animationStartTime||window.webkitAnimationStartTime||window.mozAnimationStartTime||window.oAnimationStartTime||window.msAnimationStartTime||d();f(timerCallBack)}},UTCDate:function(a,b,c,e,f,g,h,i){if(typeof b=='object'&&b.constructor==Date){i=b.getMilliseconds();h=b.getSeconds();g=b.getMinutes();f=b.getHours();e=b.getDate();c=b.getMonth();b=b.getFullYear()}var d=new Date();d.setUTCFullYear(b);d.setUTCDate(1);d.setUTCMonth(c||0);d.setUTCDate(e||1);d.setUTCHours(f||0);d.setUTCMinutes((g||0)-(Math.abs(a)<30?a*60:a));d.setUTCSeconds(h||0);d.setUTCMilliseconds(i||0);return d},periodsToSeconds:function(a){return a[0]*31557600+a[1]*2629800+a[2]*604800+a[3]*86400+a[4]*3600+a[5]*60+a[6]},_instSettings:function(a,b){return{_periods:[0,0,0,0,0,0,0]}},_addElem:function(a){if(!this._hasElem(a)){this._timerElems.push(a)}},_hasElem:function(a){return($.inArray(a,this._timerElems)>-1)},_removeElem:function(b){this._timerElems=$.map(this._timerElems,function(a){return(a==b?null:a)})},_updateElems:function(){for(var i=this._timerElems.length-1;i>=0;i--){this._updateCountdown(this._timerElems[i])}},_optionsChanged:function(a,b,c){if(c.layout){c.layout=c.layout.replace(/&lt;/g,'<').replace(/&gt;/g,'>')}this._resetExtraLabels(b.options,c);var d=(b.options.timezone!=c.timezone);$.extend(b.options,c);this._adjustSettings(a,b,c.until!=null||c.since!=null||d);var e=new Date();if((b._since&&b._since<e)||(b._until&&b._until>e)){this._addElem(a[0])}this._updateCountdown(a,b)},_updateCountdown:function(a,b){a=a.jquery?a:$(a);b=b||a.data(this.name);if(!b){return}a.html(this._generateHTML(b)).toggleClass(this._rtlClass,b.options.isRTL);if($.isFunction(b.options.onTick)){var c=b._hold!='lap'?b._periods:this._calculatePeriods(b,b._show,b.options.significant,new Date());if(b.options.tickInterval==1||this.periodsToSeconds(c)%b.options.tickInterval==0){b.options.onTick.apply(a[0],[c])}}var d=b._hold!='pause'&&(b._since?b._now.getTime()<b._since.getTime():b._now.getTime()>=b._until.getTime());if(d&&!b._expiring){b._expiring=true;if(this._hasElem(a[0])||b.options.alwaysExpire){this._removeElem(a[0]);if($.isFunction(b.options.onExpiry)){b.options.onExpiry.apply(a[0],[])}if(b.options.expiryText){var e=b.options.layout;b.options.layout=b.options.expiryText;this._updateCountdown(a[0],b);b.options.layout=e}if(b.options.expiryUrl){window.location=b.options.expiryUrl}}b._expiring=false}else if(b._hold=='pause'){this._removeElem(a[0])}},_resetExtraLabels:function(a,b){var c=false;for(var n in b){if(n!='whichLabels'&&n.match(/[Ll]abels/)){c=true;break}}if(c){for(var n in a){if(n.match(/[Ll]abels[02-9]|compactLabels1/)){a[n]=null}}}},_adjustSettings:function(a,b,c){var d;var e=0;var f=null;for(var i=0;i<this._serverSyncs.length;i++){if(this._serverSyncs[i][0]==b.options.serverSync){f=this._serverSyncs[i][1];break}}if(f!=null){e=(b.options.serverSync?f:0);d=new Date()}else{var g=($.isFunction(b.options.serverSync)?b.options.serverSync.apply(a[0],[]):null);d=new Date();e=(g?d.getTime()-g.getTime():0);this._serverSyncs.push([b.options.serverSync,e])}var h=b.options.timezone;h=(h==null?-d.getTimezoneOffset():h);if(c||(!c&&b._until==null&&b._since==null)){b._since=b.options.since;if(b._since!=null){b._since=this.UTCDate(h,this._determineTime(b._since,null));if(b._since&&e){b._since.setMilliseconds(b._since.getMilliseconds()+e)}}b._until=this.UTCDate(h,this._determineTime(b.options.until,d));if(e){b._until.setMilliseconds(b._until.getMilliseconds()+e)}}b._show=this._determineShow(b)},_preDestroy:function(a,b){this._removeElem(a[0]);a.empty()},pause:function(a){this._hold(a,'pause')},lap:function(a){this._hold(a,'lap')},resume:function(a){this._hold(a,null)},toggle:function(a){var b=$.data(a,this.name)||{};this[!b._hold?'pause':'resume'](a)},toggleLap:function(a){var b=$.data(a,this.name)||{};this[!b._hold?'lap':'resume'](a)},_hold:function(a,b){var c=$.data(a,this.name);if(c){if(c._hold=='pause'&&!b){c._periods=c._savePeriods;var d=(c._since?'-':'+');c[c._since?'_since':'_until']=this._determineTime(d+c._periods[0]+'y'+d+c._periods[1]+'o'+d+c._periods[2]+'w'+d+c._periods[3]+'d'+d+c._periods[4]+'h'+d+c._periods[5]+'m'+d+c._periods[6]+'s');this._addElem(a)}c._hold=b;c._savePeriods=(b=='pause'?c._periods:null);$.data(a,this.name,c);this._updateCountdown(a,c)}},getTimes:function(a){var b=$.data(a,this.name);return(!b?null:(b._hold=='pause'?b._savePeriods:(!b._hold?b._periods:this._calculatePeriods(b,b._show,b.options.significant,new Date()))))},_determineTime:function(k,l){var m=this;var n=function(a){var b=new Date();b.setTime(b.getTime()+a*1000);return b};var o=function(a){a=a.toLowerCase();var b=new Date();var c=b.getFullYear();var d=b.getMonth();var e=b.getDate();var f=b.getHours();var g=b.getMinutes();var h=b.getSeconds();var i=/([+-]?[0-9]+)\s*(s|m|h|d|w|o|y)?/g;var j=i.exec(a);while(j){switch(j[2]||'s'){case's':h+=parseInt(j[1],10);break;case'm':g+=parseInt(j[1],10);break;case'h':f+=parseInt(j[1],10);break;case'd':e+=parseInt(j[1],10);break;case'w':e+=parseInt(j[1],10)*7;break;case'o':d+=parseInt(j[1],10);e=Math.min(e,m._getDaysInMonth(c,d));break;case'y':c+=parseInt(j[1],10);e=Math.min(e,m._getDaysInMonth(c,d));break}j=i.exec(a)}return new Date(c,d,e,f,g,h,0)};var p=(k==null?l:(typeof k=='string'?o(k):(typeof k=='number'?n(k):k)));if(p)p.setMilliseconds(0);return p},_getDaysInMonth:function(a,b){return 32-new Date(a,b,32).getDate()},_normalLabels:function(a){return a},_generateHTML:function(c){var d=this;c._periods=(c._hold?c._periods:this._calculatePeriods(c,c._show,c.options.significant,new Date()));var e=false;var f=0;var g=c.options.significant;var h=$.extend({},c._show);for(var i=Y;i<=S;i++){e|=(c._show[i]=='?'&&c._periods[i]>0);h[i]=(c._show[i]=='?'&&!e?null:c._show[i]);f+=(h[i]?1:0);g-=(c._periods[i]>0?1:0)}var j=[false,false,false,false,false,false,false];for(var i=S;i>=Y;i--){if(c._show[i]){if(c._periods[i]){j[i]=true}else{j[i]=g>0;g--}}}var k=(c.options.compact?c.options.compactLabels:c.options.labels);var l=c.options.whichLabels||this._normalLabels;var m=function(a){var b=c.options['compactLabels'+l(c._periods[a])];return(h[a]?d._translateDigits(c,c._periods[a])+(b?b[a]:k[a])+' ':'')};var n=(c.options.padZeroes?2:1);var o=function(a){var b=c.options['labels'+l(c._periods[a])];return((!c.options.significant&&h[a])||(c.options.significant&&j[a])?'<span class="'+d._sectionClass+'">'+'<span class="'+d._amountClass+'">'+d._minDigits(c,c._periods[a],n)+'</span>'+'<span class="'+d._periodClass+'">'+(b?b[a]:k[a])+'</span></span>':'')};return(c.options.layout?this._buildLayout(c,h,c.options.layout,c.options.compact,c.options.significant,j):((c.options.compact?'<span class="'+this._rowClass+' '+this._amountClass+(c._hold?' '+this._holdingClass:'')+'">'+m(Y)+m(O)+m(W)+m(D)+(h[H]?this._minDigits(c,c._periods[H],2):'')+(h[M]?(h[H]?c.options.timeSeparator:'')+this._minDigits(c,c._periods[M],2):'')+(h[S]?(h[H]||h[M]?c.options.timeSeparator:'')+this._minDigits(c,c._periods[S],2):''):'<span class="'+this._rowClass+' '+this._showClass+(c.options.significant||f)+(c._hold?' '+this._holdingClass:'')+'">'+o(Y)+o(O)+o(W)+o(D)+o(H)+o(M)+o(S))+'</span>'+(c.options.description?'<span class="'+this._rowClass+' '+this._descrClass+'">'+c.options.description+'</span>':'')))},_buildLayout:function(c,d,e,f,g,h){var j=c.options[f?'compactLabels':'labels'];var k=c.options.whichLabels||this._normalLabels;var l=function(a){return(c.options[(f?'compactLabels':'labels')+k(c._periods[a])]||j)[a]};var m=function(a,b){return c.options.digits[Math.floor(a/b)%10]};var o={desc:c.options.description,sep:c.options.timeSeparator,yl:l(Y),yn:this._minDigits(c,c._periods[Y],1),ynn:this._minDigits(c,c._periods[Y],2),ynnn:this._minDigits(c,c._periods[Y],3),y1:m(c._periods[Y],1),y10:m(c._periods[Y],10),y100:m(c._periods[Y],100),y1000:m(c._periods[Y],1000),ol:l(O),on:this._minDigits(c,c._periods[O],1),onn:this._minDigits(c,c._periods[O],2),onnn:this._minDigits(c,c._periods[O],3),o1:m(c._periods[O],1),o10:m(c._periods[O],10),o100:m(c._periods[O],100),o1000:m(c._periods[O],1000),wl:l(W),wn:this._minDigits(c,c._periods[W],1),wnn:this._minDigits(c,c._periods[W],2),wnnn:this._minDigits(c,c._periods[W],3),w1:m(c._periods[W],1),w10:m(c._periods[W],10),w100:m(c._periods[W],100),w1000:m(c._periods[W],1000),dl:l(D),dn:this._minDigits(c,c._periods[D],1),dnn:this._minDigits(c,c._periods[D],2),dnnn:this._minDigits(c,c._periods[D],3),d1:m(c._periods[D],1),d10:m(c._periods[D],10),d100:m(c._periods[D],100),d1000:m(c._periods[D],1000),hl:l(H),hn:this._minDigits(c,c._periods[H],1),hnn:this._minDigits(c,c._periods[H],2),hnnn:this._minDigits(c,c._periods[H],3),h1:m(c._periods[H],1),h10:m(c._periods[H],10),h100:m(c._periods[H],100),h1000:m(c._periods[H],1000),ml:l(M),mn:this._minDigits(c,c._periods[M],1),mnn:this._minDigits(c,c._periods[M],2),mnnn:this._minDigits(c,c._periods[M],3),m1:m(c._periods[M],1),m10:m(c._periods[M],10),m100:m(c._periods[M],100),m1000:m(c._periods[M],1000),sl:l(S),sn:this._minDigits(c,c._periods[S],1),snn:this._minDigits(c,c._periods[S],2),snnn:this._minDigits(c,c._periods[S],3),s1:m(c._periods[S],1),s10:m(c._periods[S],10),s100:m(c._periods[S],100),s1000:m(c._periods[S],1000)};var p=e;for(var i=Y;i<=S;i++){var q='yowdhms'.charAt(i);var r=new RegExp('\\{'+q+'<\\}([\\s\\S]*)\\{'+q+'>\\}','g');p=p.replace(r,((!g&&d[i])||(g&&h[i])?'$1':''))}$.each(o,function(n,v){var a=new RegExp('\\{'+n+'\\}','g');p=p.replace(a,v)});return p},_minDigits:function(a,b,c){b=''+b;if(b.length>=c){return this._translateDigits(a,b)}b='0000000000'+b;return this._translateDigits(a,b.substr(b.length-c))},_translateDigits:function(b,c){return(''+c).replace(/[0-9]/g,function(a){return b.options.digits[a]})},_determineShow:function(a){var b=a.options.format;var c=[];c[Y]=(b.match('y')?'?':(b.match('Y')?'!':null));c[O]=(b.match('o')?'?':(b.match('O')?'!':null));c[W]=(b.match('w')?'?':(b.match('W')?'!':null));c[D]=(b.match('d')?'?':(b.match('D')?'!':null));c[H]=(b.match('h')?'?':(b.match('H')?'!':null));c[M]=(b.match('m')?'?':(b.match('M')?'!':null));c[S]=(b.match('s')?'?':(b.match('S')?'!':null));return c},_calculatePeriods:function(c,d,e,f){c._now=f;c._now.setMilliseconds(0);var g=new Date(c._now.getTime());if(c._since){if(f.getTime()<c._since.getTime()){c._now=f=g}else{f=c._since}}else{g.setTime(c._until.getTime());if(f.getTime()>c._until.getTime()){c._now=f=g}}var h=[0,0,0,0,0,0,0];if(d[Y]||d[O]){var i=this._getDaysInMonth(f.getFullYear(),f.getMonth());var j=this._getDaysInMonth(g.getFullYear(),g.getMonth());var k=(g.getDate()==f.getDate()||(g.getDate()>=Math.min(i,j)&&f.getDate()>=Math.min(i,j)));var l=function(a){return(a.getHours()*60+a.getMinutes())*60+a.getSeconds()};var m=Math.max(0,(g.getFullYear()-f.getFullYear())*12+g.getMonth()-f.getMonth()+((g.getDate()<f.getDate()&&!k)||(k&&l(g)<l(f))?-1:0));h[Y]=(d[Y]?Math.floor(m/12):0);h[O]=(d[O]?m-h[Y]*12:0);f=new Date(f.getTime());var n=(f.getDate()==i);var o=this._getDaysInMonth(f.getFullYear()+h[Y],f.getMonth()+h[O]);if(f.getDate()>o){f.setDate(o)}f.setFullYear(f.getFullYear()+h[Y]);f.setMonth(f.getMonth()+h[O]);if(n){f.setDate(o)}}var p=Math.floor((g.getTime()-f.getTime())/1000);var q=function(a,b){h[a]=(d[a]?Math.floor(p/b):0);p-=h[a]*b};q(W,604800);q(D,86400);q(H,3600);q(M,60);q(S,1);if(p>0&&!c._since){var r=[1,12,4.3482,7,24,60,60];var s=S;var t=1;for(var u=S;u>=Y;u--){if(d[u]){if(h[s]>=t){h[s]=0;p=1}if(p>0){h[u]++;p=0;s=u;t=1}}t*=r[u]}}if(e){for(var u=Y;u<=S;u++){if(e&&h[u]){e--}else if(!e){h[u]=0}}}return h}})})(jQuery);;
/**
 * @file
 * File with JS to initialize jQuery plugins on fields.
 */

(function($){
  Drupal.behaviors.field_timer = {
    attach: function() {
      var settings = Drupal.settings.field_timer;
      if ($.countdown != undefined) {
        // Global regional settings must be set to English.
        $.countdown.setDefaults($.countdown.regionalOptions['']);
      }
      for (var key in settings) {
        switch (settings[key].plugin) {
          case 'county':
            var options = settings[key].options;
            $('#county-' + key).not('.field-timer-processed').
              county({
                endDateTime: new Date(settings[key].timestamp * 1000),
                animation: options.animation,
                speed: options.speed,
                theme: options.county_theme,
                reflection: options.reflection,
                reflectionOpacity: options.reflectionOpacity
              }).addClass('field-timer-processed');
            break;

          case 'jquery.countdown':
            var options = settings[key].options;
            $('#jquery-countdown-' + key).not('.field-timer-processed').
              countdown($.extend({
                until: options.until ? new Date(settings[key].timestamp * 1000) : null,
                since: options.since ? new Date(settings[key].timestamp * 1000) : null,
                format: options.format,
                layout: options.layout,
                compact: options.compact,
                significant: options.significant,
                timeSeparator: options.timeSeparator,
                padZeroes: options.padZeroes
              }, $.countdown.regionalOptions[options.regional])).addClass('field-timer-processed');
            break;

          case 'jquery.countdown.led':
            var options = settings[key].options;
            var $elem = $('#jquery-countdown-led-' + key);
            $elem.not('.field-timer-processed').
              countdown({
                until: options.until ? new Date(settings[key].timestamp * 1000) : null,
                since: options.since ? new Date(settings[key].timestamp * 1000) : null,
                layout: $elem.html()
              }).addClass('field-timer-processed');
            break;
        }
      }
    }
  }
})(jQuery);
;
/*! PhotoSwipe - v4.0.5 - 2015-01-15
* http://photoswipe.com
* Copyright (c) 2015 Dmitry Semenov; */
!function(a,b){"function"==typeof define&&define.amd?define(b):"object"==typeof exports?module.exports=b():a.PhotoSwipe=b()}(this,function(){"use strict";var a=function(a,b,c,d){var e={features:null,bind:function(a,b,c,d){var e=(d?"remove":"add")+"EventListener";b=b.split(" ");for(var f=0;f<b.length;f++)b[f]&&a[e](b[f],c,!1)},isArray:function(a){return a instanceof Array},createEl:function(a,b){var c=document.createElement(b||"div");return a&&(c.className=a),c},getScrollY:function(){var a=window.pageYOffset;return void 0!==a?a:document.documentElement.scrollTop},unbind:function(a,b,c){e.bind(a,b,c,!0)},removeClass:function(a,b){var c=new RegExp("(\\s|^)"+b+"(\\s|$)");a.className=a.className.replace(c," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")},addClass:function(a,b){e.hasClass(a,b)||(a.className+=(a.className?" ":"")+b)},hasClass:function(a,b){return a.className&&new RegExp("(^|\\s)"+b+"(\\s|$)").test(a.className)},getChildByClass:function(a,b){for(var c=a.firstChild;c;){if(e.hasClass(c,b))return c;c=c.nextSibling}},arraySearch:function(a,b,c){for(var d=a.length;d--;)if(a[d][c]===b)return d;return-1},extend:function(a,b,c){for(var d in b)if(b.hasOwnProperty(d)){if(c&&a.hasOwnProperty(d))continue;a[d]=b[d]}},easing:{sine:{out:function(a){return Math.sin(a*(Math.PI/2))},inOut:function(a){return-(Math.cos(Math.PI*a)-1)/2}},cubic:{out:function(a){return--a*a*a+1}}},detectFeatures:function(){if(e.features)return e.features;var a=e.createEl(),b=a.style,c="",d={};if(d.oldIE=document.all&&!document.addEventListener,d.touch="ontouchstart"in window,window.requestAnimationFrame&&(d.raf=window.requestAnimationFrame,d.caf=window.cancelAnimationFrame),d.pointerEvent=navigator.pointerEnabled||navigator.msPointerEnabled,!d.pointerEvent){var f=navigator.userAgent;if(/iP(hone|od)/.test(navigator.platform)){var g=navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);g&&g.length>0&&(g=parseInt(g[1],10),g>=1&&8>g&&(d.isOldIOSPhone=!0))}var h=f.match(/Android\s([0-9\.]*)/),i=h?h[1]:0;i=parseFloat(i),i>=1&&(4.4>i&&(d.isOldAndroid=!0),d.androidVersion=i),d.isMobileOpera=/opera mini|opera mobi/i.test(f)}for(var j,k,l=["transform","perspective","animationName"],m=["","webkit","Moz","ms","O"],n=0;4>n;n++){c=m[n];for(var o=0;3>o;o++)j=l[o],k=c+(c?j.charAt(0).toUpperCase()+j.slice(1):j),!d[j]&&k in b&&(d[j]=k);c&&!d.raf&&(c=c.toLowerCase(),d.raf=window[c+"RequestAnimationFrame"],d.raf&&(d.caf=window[c+"CancelAnimationFrame"]||window[c+"CancelRequestAnimationFrame"]))}if(!d.raf){var p=0;d.raf=function(a){var b=(new Date).getTime(),c=Math.max(0,16-(b-p)),d=window.setTimeout(function(){a(b+c)},c);return p=b+c,d},d.caf=function(a){clearTimeout(a)}}return d.svg=!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect,e.features=d,d}};e.detectFeatures(),e.features.oldIE&&(e.bind=function(a,b,c,d){b=b.split(" ");for(var e,f=(d?"detach":"attach")+"Event",g=function(){c.handleEvent.call(c)},h=0;h<b.length;h++)if(e=b[h])if("object"==typeof c&&c.handleEvent){if(d){if(!c["oldIE"+e])return!1}else c["oldIE"+e]=g;a[f]("on"+e,c["oldIE"+e])}else a[f]("on"+e,c)});var f=this,g=25,h=3,i={allowPanToNext:!0,spacing:.12,bgOpacity:1,mouseUsed:!1,loop:!0,pinchToClose:!0,closeOnScroll:!0,closeOnVerticalDrag:!0,hideAnimationDuration:333,showAnimationDuration:333,showHideOpacity:!1,focus:!0,escKey:!0,arrowKeys:!0,mainScrollEndFriction:.35,panEndFriction:.35,isClickableElement:function(a){return"A"===a.tagName},getDoubleTapZoom:function(a,b){return a?1:b.initialZoomLevel<.7?1:1.5},maxSpreadZoom:2,scaleMode:"fit",modal:!0,alwaysFadeIn:!1};e.extend(i,d);var j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,$,_,ab,bb,cb,db,eb,fb,gb,hb,ib,jb,kb,lb,mb,nb=function(){return{x:0,y:0}},ob=nb(),pb=nb(),qb=nb(),rb={},sb=0,tb=nb(),ub=0,vb=!0,wb=[],xb={},yb=function(a,b){e.extend(f,b.publicMethods),wb.push(a)},zb=function(a){var b=_c();return a>b-1?a-b:0>a?b+a:a},Ab={},Bb=function(a,b){return Ab[a]||(Ab[a]=[]),Ab[a].push(b)},Cb=function(a){var b=Ab[a];if(b){var c=Array.prototype.slice.call(arguments);c.shift();for(var d=0;d<b.length;d++)b[d].apply(f,c)}},Db=function(){return(new Date).getTime()},Eb=function(a){kb=a,f.bg.style.opacity=a*i.bgOpacity},Fb=function(a,b,c,d){a[G]=u+b+"px, "+c+"px"+v+" scale("+d+")"},Gb=function(){fb&&Fb(fb,qb.x,qb.y,s)},Hb=function(a){a.container&&Fb(a.container.style,a.initialPosition.x,a.initialPosition.y,a.initialZoomLevel)},Ib=function(a,b){b[G]=u+a+"px, 0px"+v},Jb=function(a,b){if(!i.loop&&b){var c=m+(tb.x*sb-a)/tb.x,d=Math.round(a-sc.x);(0>c&&d>0||c>=_c()-1&&0>d)&&(a=sc.x+d*i.mainScrollEndFriction)}sc.x=a,Ib(a,n)},Kb=function(a,b){var c=tc[a]-y[a];return pb[a]+ob[a]+c-c*(b/t)},Lb=function(a,b){a.x=b.x,a.y=b.y,b.id&&(a.id=b.id)},Mb=function(a){a.x=Math.round(a.x),a.y=Math.round(a.y)},Nb=null,Ob=function(){Nb&&(e.unbind(document,"mousemove",Ob),e.addClass(a,"pswp--has_mouse"),i.mouseUsed=!0,Cb("mouseUsed")),Nb=setTimeout(function(){Nb=null},100)},Pb=function(){e.bind(document,"keydown",f),P.transform&&e.bind(f.scrollWrap,"click",f),i.mouseUsed||e.bind(document,"mousemove",Ob),e.bind(window,"resize scroll",f),Cb("bindEvents")},Qb=function(){e.unbind(window,"resize",f),e.unbind(window,"scroll",r.scroll),e.unbind(document,"keydown",f),e.unbind(document,"mousemove",Ob),P.transform&&e.unbind(f.scrollWrap,"click",f),W&&e.unbind(window,p,f),Cb("unbindEvents")},Rb=function(a,b){var c=hd(f.currItem,rb,a);return b&&(eb=c),c},Sb=function(a){return a||(a=f.currItem),a.initialZoomLevel},Tb=function(a){return a||(a=f.currItem),a.w>0?i.maxSpreadZoom:1},Ub=function(a,b,c,d){return d===f.currItem.initialZoomLevel?(c[a]=f.currItem.initialPosition[a],!0):(c[a]=Kb(a,d),c[a]>b.min[a]?(c[a]=b.min[a],!0):c[a]<b.max[a]?(c[a]=b.max[a],!0):!1)},Vb=function(){if(G){var b=P.perspective&&!I;return u="translate"+(b?"3d(":"("),void(v=P.perspective?", 0px)":")")}G="left",e.addClass(a,"pswp--ie"),Ib=function(a,b){b.left=a+"px"},Hb=function(a){var b=a.container.style,c=a.fitRatio*a.w,d=a.fitRatio*a.h;b.width=c+"px",b.height=d+"px",b.left=a.initialPosition.x+"px",b.top=a.initialPosition.y+"px"},Gb=function(){if(fb){var a=fb,b=f.currItem,c=b.fitRatio*b.w,d=b.fitRatio*b.h;a.width=c+"px",a.height=d+"px",a.left=qb.x+"px",a.top=qb.y+"px"}}},Wb=function(a){var b="";i.escKey&&27===a.keyCode?b="close":i.arrowKeys&&(37===a.keyCode?b="prev":39===a.keyCode&&(b="next")),b&&(a.ctrlKey||a.altKey||a.shiftKey||a.metaKey||(a.preventDefault?a.preventDefault():a.returnValue=!1,f[b]()))},Xb=function(a){a&&(Z||Y||gb||U)&&(a.preventDefault(),a.stopPropagation())},Yb=function(){z=!0,i.closeOnScroll&&j&&(!f.likelyTouchDevice||i.mouseUsed)&&Math.abs(e.getScrollY()-M)>2&&(l=!0,f.close())},Zb={},$b=0,_b=function(a){Zb[a]&&(Zb[a].raf&&K(Zb[a].raf),$b--,delete Zb[a])},ac=function(a){Zb[a]&&_b(a),Zb[a]||($b++,Zb[a]={})},bc=function(){for(var a in Zb)Zb.hasOwnProperty(a)&&_b(a)},cc=function(a,b,c,d,e,f,g){var h,i=Db();ac(a);var j=function(){if(Zb[a]){if(h=Db()-i,h>=d)return _b(a),f(c),void(g&&g());f((c-b)*e(h/d)+b),Zb[a].raf=J(j)}};j()},dc={shout:Cb,listen:Bb,viewportSize:rb,options:i,isMainScrollAnimating:function(){return gb},getZoomLevel:function(){return s},getCurrentIndex:function(){return m},isDragging:function(){return W},isZooming:function(){return bb},applyZoomPan:function(a,b,c){qb.x=b,qb.y=c,s=a,Gb()},init:function(){if(!j&&!k){var c;f.framework=e,f.template=a,f.bg=e.getChildByClass(a,"pswp__bg"),L=a.className,j=!0,P=e.detectFeatures(),J=P.raf,K=P.caf,G=P.transform,N=P.oldIE,f.scrollWrap=e.getChildByClass(a,"pswp__scroll-wrap"),f.container=e.getChildByClass(f.scrollWrap,"pswp__container"),n=f.container.style,f.itemHolders=A=[{el:f.container.children[0],wrap:0,index:-1},{el:f.container.children[1],wrap:0,index:-1},{el:f.container.children[2],wrap:0,index:-1}],A[0].el.style.display=A[2].el.style.display="none",Vb(),r={resize:f.updateSize,scroll:Yb,keydown:Wb,click:Xb};var d=P.isOldIOSPhone||P.isOldAndroid||P.isMobileOpera;for(P.animationName&&P.transform&&!d||(i.showAnimationDuration=i.hideAnimationDuration=0),c=0;c<wb.length;c++)f["init"+wb[c]]();if(b){var g=f.ui=new b(f,e);g.init()}Cb("firstUpdate"),m=m||i.index||0,(isNaN(m)||0>m||m>=_c())&&(m=0),f.currItem=$c(m),(P.isOldIOSPhone||P.isOldAndroid)&&(vb=!1),i.modal&&(a.setAttribute("aria-hidden","false"),vb?a.style.position="fixed":(a.style.position="absolute",a.style.top=e.getScrollY()+"px")),void 0===O&&(Cb("initialLayout"),O=M=e.getScrollY());var l="pswp--open ";for(i.mainClass&&(l+=i.mainClass+" "),i.showHideOpacity&&(l+="pswp--animate_opacity "),l+=I?"pswp--touch":"pswp--notouch",l+=P.animationName?" pswp--css_animation":"",l+=P.svg?" pswp--svg":"",e.addClass(a,l),f.updateSize(),o=-1,ub=null,c=0;h>c;c++)Ib((c+o)*tb.x,A[c].el.style);N||e.bind(f.scrollWrap,q,f),Bb("initialZoomInEnd",function(){f.setContent(A[0],m-1),f.setContent(A[2],m+1),A[0].el.style.display=A[2].el.style.display="block",i.focus&&a.focus(),Pb()}),f.setContent(A[1],m),f.updateCurrItem(),Cb("afterInit"),vb||(w=setInterval(function(){$b||W||bb||s!==f.currItem.initialZoomLevel||f.updateSize()},1e3)),e.addClass(a,"pswp--visible")}},close:function(){j&&(j=!1,k=!0,Cb("close"),Qb(),bd(f.currItem,null,!0,f.destroy))},destroy:function(){Cb("destroy"),Wc&&clearTimeout(Wc),i.modal&&(a.setAttribute("aria-hidden","true"),a.className=L),w&&clearInterval(w),e.unbind(f.scrollWrap,q,f),e.unbind(window,"scroll",f),yc(),bc(),Ab=null},panTo:function(a,b,c){c||(a>eb.min.x?a=eb.min.x:a<eb.max.x&&(a=eb.max.x),b>eb.min.y?b=eb.min.y:b<eb.max.y&&(b=eb.max.y)),qb.x=a,qb.y=b,Gb()},handleEvent:function(a){a=a||window.event,r[a.type]&&r[a.type](a)},goTo:function(a){a=zb(a);var b=a-m;ub=b,m=a,f.currItem=$c(m),sb-=b,Jb(tb.x*sb),bc(),gb=!1,f.updateCurrItem()},next:function(){f.goTo(m+1)},prev:function(){f.goTo(m-1)},updateCurrZoomItem:function(a){if(a&&Cb("beforeChange",0),A[1].el.children.length){var b=A[1].el.children[0];fb=e.hasClass(b,"pswp__zoom-wrap")?b.style:null}else fb=null;eb=f.currItem.bounds,t=s=f.currItem.initialZoomLevel,qb.x=eb.center.x,qb.y=eb.center.y,a&&Cb("afterChange")},invalidateCurrItems:function(){x=!0;for(var a=0;h>a;a++)A[a].item&&(A[a].item.needsUpdate=!0)},updateCurrItem:function(a){if(0!==ub){var b,c=Math.abs(ub);if(!(a&&2>c)){f.currItem=$c(m),Cb("beforeChange",ub),c>=h&&(o+=ub+(ub>0?-h:h),c=h);for(var d=0;c>d;d++)ub>0?(b=A.shift(),A[h-1]=b,o++,Ib((o+2)*tb.x,b.el.style),f.setContent(b,m-c+d+1+1)):(b=A.pop(),A.unshift(b),o--,Ib(o*tb.x,b.el.style),f.setContent(b,m+c-d-1-1));if(fb&&1===Math.abs(ub)){var e=$c(B);e.initialZoomLevel!==s&&(hd(e,rb),Hb(e))}ub=0,f.updateCurrZoomItem(),B=m,Cb("afterChange")}}},updateSize:function(b){if(!vb){var c=e.getScrollY();if(O!==c&&(a.style.top=c+"px",O=c),!b&&xb.x===window.innerWidth&&xb.y===window.innerHeight)return;xb.x=window.innerWidth,xb.y=window.innerHeight,a.style.height=xb.y+"px"}if(rb.x=f.scrollWrap.clientWidth,rb.y=f.scrollWrap.clientHeight,y={x:0,y:O},tb.x=rb.x+Math.round(rb.x*i.spacing),tb.y=rb.y,Jb(tb.x*sb),Cb("beforeResize"),void 0!==o){for(var d,g,j,k=0;h>k;k++)d=A[k],Ib((k+o)*tb.x,d.el.style),j=zb(m+k-1),g=$c(j),x||g.needsUpdate||!g.bounds?(g&&f.cleanSlide(g),f.setContent(d,j),1===k&&(f.currItem=g,f.updateCurrZoomItem(!0)),g.needsUpdate=!1):-1===d.index&&j>=0&&f.setContent(d,j),g&&g.container&&(hd(g,rb),Hb(g));x=!1}t=s=f.currItem.initialZoomLevel,eb=f.currItem.bounds,eb&&(qb.x=eb.center.x,qb.y=eb.center.y,Gb()),Cb("resize")},zoomTo:function(a,b,c,d,f){b&&(t=s,tc.x=Math.abs(b.x)-qb.x,tc.y=Math.abs(b.y)-qb.y,Lb(pb,qb));var g=Rb(a,!1),h={};Ub("x",g,h,a),Ub("y",g,h,a);var i=s,j={x:qb.x,y:qb.y};Mb(h);var k=function(b){1===b?(s=a,qb.x=h.x,qb.y=h.y):(s=(a-i)*b+i,qb.x=(h.x-j.x)*b+j.x,qb.y=(h.y-j.y)*b+j.y),f&&f(b),Gb()};c?cc("customZoomTo",0,1,c,d||e.easing.sine.inOut,k):k(1)}},ec=30,fc=10,gc={},hc={},ic={},jc={},kc={},lc=[],mc={},nc=[],oc={},pc=0,qc=nb(),rc=0,sc=nb(),tc=nb(),uc=nb(),vc=function(a,b){return a.x===b.x&&a.y===b.y},wc=function(a,b){return Math.abs(a.x-b.x)<g&&Math.abs(a.y-b.y)<g},xc=function(a,b){return oc.x=Math.abs(a.x-b.x),oc.y=Math.abs(a.y-b.y),Math.sqrt(oc.x*oc.x+oc.y*oc.y)},yc=function(){$&&(K($),$=null)},zc=function(){W&&($=J(zc),Pc())},Ac=function(){return!("fit"===i.scaleMode&&s===f.currItem.initialZoomLevel)},Bc=function(a,b){return a?a.className&&a.className.indexOf("pswp__scroll-wrap")>-1?!1:b(a)?a:Bc(a.parentNode,b):!1},Cc={},Dc=function(a,b){return Cc.prevent=!Bc(a.target,i.isClickableElement),Cb("preventDragEvent",a,b,Cc),Cc.prevent},Ec=function(a,b){return b.x=a.pageX,b.y=a.pageY,b.id=a.identifier,b},Fc=function(a,b,c){c.x=.5*(a.x+b.x),c.y=.5*(a.y+b.y)},Gc=function(a,b,c){if(a-R>50){var d=nc.length>2?nc.shift():{};d.x=b,d.y=c,nc.push(d),R=a}},Hc=function(){var a=qb.y-f.currItem.initialPosition.y;return 1-Math.abs(a/(rb.y/2))},Ic={},Jc={},Kc=[],Lc=function(a){for(;Kc.length>0;)Kc.pop();return H?(mb=0,lc.forEach(function(a){0===mb?Kc[0]=a:1===mb&&(Kc[1]=a),mb++})):a.type.indexOf("touch")>-1?a.touches&&a.touches.length>0&&(Kc[0]=Ec(a.touches[0],Ic),a.touches.length>1&&(Kc[1]=Ec(a.touches[1],Jc))):(Ic.x=a.pageX,Ic.y=a.pageY,Ic.id="",Kc[0]=Ic),Kc},Mc=function(a,b){var c,d,e,g,h=0,j=qb[a]+b[a],k=b[a]>0,l=sc.x+b.x,m=sc.x-mc.x;return c=j>eb.min[a]||j<eb.max[a]?i.panEndFriction:1,j=qb[a]+b[a]*c,!i.allowPanToNext&&s!==f.currItem.initialZoomLevel||(fb?"h"!==hb||"x"!==a||Y||(k?(j>eb.min[a]&&(c=i.panEndFriction,h=eb.min[a]-j,d=eb.min[a]-pb[a]),(0>=d||0>m)&&_c()>1?(g=l,0>m&&l>mc.x&&(g=mc.x)):eb.min.x!==eb.max.x&&(e=j)):(j<eb.max[a]&&(c=i.panEndFriction,h=j-eb.max[a],d=pb[a]-eb.max[a]),(0>=d||m>0)&&_c()>1?(g=l,m>0&&l<mc.x&&(g=mc.x)):eb.min.x!==eb.max.x&&(e=j))):g=l,"x"!==a)?void(gb||_||s>f.currItem.fitRatio&&(qb[a]+=b[a]*c)):(void 0!==g&&(Jb(g,!0),_=g===mc.x?!1:!0),eb.min.x!==eb.max.x&&(void 0!==e?qb.x=e:_||(qb.x+=b.x*c)),void 0!==g)},Nc=function(a){if(!("mousedown"===a.type&&a.button>0)){if(Zc)return void a.preventDefault();if(!V||"mousedown"!==a.type){if(Dc(a,!0)&&a.preventDefault(),Cb("pointerDown"),H){var b=e.arraySearch(lc,a.pointerId,"id");0>b&&(b=lc.length),lc[b]={x:a.pageX,y:a.pageY,id:a.pointerId}}var c=Lc(a),d=c.length;ab=null,bc(),W&&1!==d||(W=ib=!0,e.bind(window,p,f),T=lb=jb=U=_=Z=X=Y=!1,hb=null,Cb("firstTouchStart",c),Lb(pb,qb),ob.x=ob.y=0,Lb(jc,c[0]),Lb(kc,jc),mc.x=tb.x*sb,nc=[{x:jc.x,y:jc.y}],R=Q=Db(),Rb(s,!0),yc(),zc()),!bb&&d>1&&!gb&&!_&&(t=s,Y=!1,bb=X=!0,ob.y=ob.x=0,Lb(pb,qb),Lb(gc,c[0]),Lb(hc,c[1]),Fc(gc,hc,uc),tc.x=Math.abs(uc.x)-qb.x,tc.y=Math.abs(uc.y)-qb.y,cb=db=xc(gc,hc))}}},Oc=function(a){if(a.preventDefault(),H){var b=e.arraySearch(lc,a.pointerId,"id");if(b>-1){var c=lc[b];c.x=a.pageX,c.y=a.pageY}}if(W){var d=Lc(a);if(hb||Z||bb)ab=d;else{var f=Math.abs(d[0].x-jc.x)-Math.abs(d[0].y-jc.y);Math.abs(f)>=fc&&(hb=f>0?"h":"v",ab=d)}}},Pc=function(){if(ab){var a=ab.length;if(0!==a)if(Lb(gc,ab[0]),ic.x=gc.x-jc.x,ic.y=gc.y-jc.y,bb&&a>1){if(jc.x=gc.x,jc.y=gc.y,!ic.x&&!ic.y&&vc(ab[1],hc))return;Lb(hc,ab[1]),Y||(Y=!0,Cb("zoomGestureStarted"));var b=xc(gc,hc),c=Uc(b);c>f.currItem.initialZoomLevel+f.currItem.initialZoomLevel/15&&(lb=!0);var d=1,e=Sb(),g=Tb();if(e>c)if(i.pinchToClose&&!lb&&t<=f.currItem.initialZoomLevel){var h=e-c,j=1-h/(e/1.2);Eb(j),Cb("onPinchClose",j),jb=!0}else d=(e-c)/e,d>1&&(d=1),c=e-d*(e/3);else c>g&&(d=(c-g)/(6*e),d>1&&(d=1),c=g+d*e);0>d&&(d=0),cb=b,Fc(gc,hc,qc),ob.x+=qc.x-uc.x,ob.y+=qc.y-uc.y,Lb(uc,qc),qb.x=Kb("x",c),qb.y=Kb("y",c),T=c>s,s=c,Gb()}else{if(!hb)return;if(ib&&(ib=!1,Math.abs(ic.x)>=fc&&(ic.x-=ab[0].x-kc.x),Math.abs(ic.y)>=fc&&(ic.y-=ab[0].y-kc.y)),jc.x=gc.x,jc.y=gc.y,0===ic.x&&0===ic.y)return;if("v"===hb&&i.closeOnVerticalDrag&&!Ac()){ob.y+=ic.y,qb.y+=ic.y;var k=Hc();return U=!0,Cb("onVerticalDrag",k),Eb(k),void Gb()}Gc(Db(),gc.x,gc.y),Z=!0,eb=f.currItem.bounds;var l=Mc("x",ic);l||(Mc("y",ic),Mb(qb),Gb())}}},Qc=function(a){if(P.isOldAndroid){if(V&&"mouseup"===a.type)return;a.type.indexOf("touch")>-1&&(clearTimeout(V),V=setTimeout(function(){V=0},600))}Cb("pointerUp"),Dc(a,!1)&&a.preventDefault();var b;if(H){var c=e.arraySearch(lc,a.pointerId,"id");if(c>-1)if(b=lc.splice(c,1)[0],navigator.pointerEnabled)b.type=a.pointerType||"mouse";else{var d={4:"mouse",2:"touch",3:"pen"};b.type=d[a.pointerType],b.type||(b.type=a.pointerType||"mouse")}}var g,h=Lc(a),i=h.length;if("mouseup"===a.type&&(i=0),2===i)return ab=null,!0;1===i&&Lb(kc,h[0]),0!==i||hb||gb||(b||("mouseup"===a.type?b={x:a.pageX,y:a.pageY,type:"mouse"}:a.changedTouches&&a.changedTouches[0]&&(b={x:a.changedTouches[0].pageX,y:a.changedTouches[0].pageY,type:"touch"})),Cb("touchRelease",a,b));var j=-1;if(0===i&&(W=!1,e.unbind(window,p,f),yc(),bb?j=0:-1!==rc&&(j=Db()-rc)),rc=1===i?Db():-1,g=-1!==j&&150>j?"zoom":"swipe",bb&&2>i&&(bb=!1,1===i&&(g="zoomPointerUp"),Cb("zoomGestureEnded")),ab=null,Z||Y||gb||U)if(bc(),S||(S=Rc()),S.calculateSwipeSpeed("x"),U){var k=Hc();if(.6>k)f.close();else{var l=qb.y,m=kb;cc("verticalDrag",0,1,300,e.easing.cubic.out,function(a){qb.y=(f.currItem.initialPosition.y-l)*a+l,Eb((1-m)*a+m),Gb()}),Cb("onVerticalDrag",1)}}else{if((_||gb)&&0===i){var n=Tc(g,S);if(n)return;g="zoomPointerUp"}if(!gb)return"swipe"!==g?void Vc():void(!_&&s>f.currItem.fitRatio&&Sc(S))}},Rc=function(){var a,b,c={lastFlickOffset:{},lastFlickDist:{},lastFlickSpeed:{},slowDownRatio:{},slowDownRatioReverse:{},speedDecelerationRatio:{},speedDecelerationRatioAbs:{},distanceOffset:{},backAnimDestination:{},backAnimStarted:{},calculateSwipeSpeed:function(d){nc.length>1?(a=Db()-R+50,b=nc[nc.length-2][d]):(a=Db()-Q,b=kc[d]),c.lastFlickOffset[d]=jc[d]-b,c.lastFlickDist[d]=Math.abs(c.lastFlickOffset[d]),c.lastFlickSpeed[d]=c.lastFlickDist[d]>20?c.lastFlickOffset[d]/a:0,Math.abs(c.lastFlickSpeed[d])<.1&&(c.lastFlickSpeed[d]=0),c.slowDownRatio[d]=.95,c.slowDownRatioReverse[d]=1-c.slowDownRatio[d],c.speedDecelerationRatio[d]=1},calculateOverBoundsAnimOffset:function(a,b){c.backAnimStarted[a]||(qb[a]>eb.min[a]?c.backAnimDestination[a]=eb.min[a]:qb[a]<eb.max[a]&&(c.backAnimDestination[a]=eb.max[a]),void 0!==c.backAnimDestination[a]&&(c.slowDownRatio[a]=.7,c.slowDownRatioReverse[a]=1-c.slowDownRatio[a],c.speedDecelerationRatioAbs[a]<.05&&(c.lastFlickSpeed[a]=0,c.backAnimStarted[a]=!0,cc("bounceZoomPan"+a,qb[a],c.backAnimDestination[a],b||300,e.easing.sine.out,function(b){qb[a]=b,Gb()}))))},calculateAnimOffset:function(a){c.backAnimStarted[a]||(c.speedDecelerationRatio[a]=c.speedDecelerationRatio[a]*(c.slowDownRatio[a]+c.slowDownRatioReverse[a]-c.slowDownRatioReverse[a]*c.timeDiff/10),c.speedDecelerationRatioAbs[a]=Math.abs(c.lastFlickSpeed[a]*c.speedDecelerationRatio[a]),c.distanceOffset[a]=c.lastFlickSpeed[a]*c.speedDecelerationRatio[a]*c.timeDiff,qb[a]+=c.distanceOffset[a])},panAnimLoop:function(){return Zb.zoomPan&&(Zb.zoomPan.raf=J(c.panAnimLoop),c.now=Db(),c.timeDiff=c.now-c.lastNow,c.lastNow=c.now,c.calculateAnimOffset("x"),c.calculateAnimOffset("y"),Gb(),c.calculateOverBoundsAnimOffset("x"),c.calculateOverBoundsAnimOffset("y"),c.speedDecelerationRatioAbs.x<.05&&c.speedDecelerationRatioAbs.y<.05)?(qb.x=Math.round(qb.x),qb.y=Math.round(qb.y),Gb(),void _b("zoomPan")):void 0}};return c},Sc=function(a){return a.calculateSwipeSpeed("y"),eb=f.currItem.bounds,a.backAnimDestination={},a.backAnimStarted={},Math.abs(a.lastFlickSpeed.x)<=.05&&Math.abs(a.lastFlickSpeed.y)<=.05?(a.speedDecelerationRatioAbs.x=a.speedDecelerationRatioAbs.y=0,a.calculateOverBoundsAnimOffset("x"),a.calculateOverBoundsAnimOffset("y"),!0):(ac("zoomPan"),a.lastNow=Db(),void a.panAnimLoop())},Tc=function(a,b){var c;gb||(pc=m);var d;if("swipe"===a){var g=jc.x-kc.x,h=b.lastFlickDist.x<10;g>ec&&(h||b.lastFlickOffset.x>20)?d=-1:-ec>g&&(h||b.lastFlickOffset.x<-20)&&(d=1)}var j;d&&(m+=d,0>m?(m=i.loop?_c()-1:0,j=!0):m>=_c()&&(m=i.loop?0:_c()-1,j=!0),(!j||i.loop)&&(ub+=d,sb-=d,c=!0));var k,l=tb.x*sb,n=Math.abs(l-sc.x);return c||l>sc.x==b.lastFlickSpeed.x>0?(k=Math.abs(b.lastFlickSpeed.x)>0?n/Math.abs(b.lastFlickSpeed.x):333,k=Math.min(k,400),k=Math.max(k,250)):k=333,pc===m&&(c=!1),gb=!0,cc("mainScroll",sc.x,l,k,e.easing.cubic.out,Jb,function(){bc(),gb=!1,pc=-1,(c||pc!==m)&&f.updateCurrItem(),Cb("mainScrollAnimComplete")}),c&&f.updateCurrItem(!0),c},Uc=function(a){return 1/db*a*t},Vc=function(){var a=s,b=Sb(),c=Tb();b>s?a=b:s>c&&(a=c);var d,g=1,h=kb;return jb&&!T&&!lb&&b>s?(f.close(),!0):(jb&&(d=function(a){Eb((g-h)*a+h)}),f.zoomTo(a,0,300,e.easing.cubic.out,d),!0)};yb("Gestures",{publicMethods:{initGestures:function(){var a=function(a,b,c,d,e){C=a+b,D=a+c,E=a+d,F=e?a+e:""};H=P.pointerEvent,H&&P.touch&&(P.touch=!1),H?navigator.pointerEnabled?a("pointer","down","move","up","cancel"):a("MSPointer","Down","Move","Up","Cancel"):P.touch?(a("touch","start","move","end","cancel"),I=!0):a("mouse","down","move","up"),p=D+" "+E+" "+F,q=C,H&&!I&&(I=navigator.maxTouchPoints>1||navigator.msMaxTouchPoints>1),f.likelyTouchDevice=I,r[C]=Nc,r[D]=Oc,r[E]=Qc,F&&(r[F]=r[E]),P.touch&&(q+=" mousedown",p+=" mousemove mouseup",r.mousedown=r[C],r.mousemove=r[D],r.mouseup=r[E]),I||(i.allowPanToNext=!1)}}});var Wc,Xc,Yc,Zc,$c,_c,ad,bd=function(b,c,d,g){Wc&&clearTimeout(Wc),Zc=!0,Yc=!0;var h;b.initialLayout?(h=b.initialLayout,b.initialLayout=null):h=i.getThumbBoundsFn&&i.getThumbBoundsFn(m);var j=d?i.hideAnimationDuration:i.showAnimationDuration,k=function(){_b("initialZoom"),d?(f.template.removeAttribute("style"),f.bg.removeAttribute("style")):(Eb(1),c&&(c.style.display="block"),e.addClass(a,"pswp--animated-in"),Cb("initialZoom"+(d?"OutEnd":"InEnd"))),g&&g(),Zc=!1};if(!j||!h||void 0===h.x){var n=function(){Cb("initialZoom"+(d?"Out":"In")),s=b.initialZoomLevel,Lb(qb,b.initialPosition),Gb(),a.style.opacity=d?0:1,Eb(1),k()};return void n()}var o=function(){var c=l,g=!f.currItem.src||f.currItem.loadError||i.showHideOpacity;b.miniImg&&(b.miniImg.style.webkitBackfaceVisibility="hidden"),d||(s=h.w/b.w,qb.x=h.x,qb.y=h.y-M,f[g?"template":"bg"].style.opacity=.001,Gb()),ac("initialZoom"),d&&!c&&e.removeClass(a,"pswp--animated-in"),g&&(d?e[(c?"remove":"add")+"Class"](a,"pswp--animate_opacity"):setTimeout(function(){e.addClass(a,"pswp--animate_opacity")},30)),Wc=setTimeout(function(){if(Cb("initialZoom"+(d?"Out":"In")),d){var f=h.w/b.w,i={x:qb.x,y:qb.y},l=s,m=M,n=kb,o=function(b){z&&(m=e.getScrollY(),z=!1),1===b?(s=f,qb.x=h.x,qb.y=h.y-m):(s=(f-l)*b+l,qb.x=(h.x-i.x)*b+i.x,qb.y=(h.y-m-i.y)*b+i.y),Gb(),g?a.style.opacity=1-b:Eb(n-b*n)};c?cc("initialZoom",0,1,j,e.easing.cubic.out,o,k):(o(1),Wc=setTimeout(k,j+20))}else s=b.initialZoomLevel,Lb(qb,b.initialPosition),Gb(),Eb(1),g?a.style.opacity=1:Eb(1),Wc=setTimeout(k,j+20)},d?25:90)};o()},cd={},dd=[],ed={index:0,errorMsg:'<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',forceProgressiveLoading:!1,preload:[1,1],getNumItemsFn:function(){return Xc.length}},fd=function(){return{center:{x:0,y:0},max:{x:0,y:0},min:{x:0,y:0}}},gd=function(a,b,c){var d=a.bounds;d.center.x=Math.round((cd.x-b)/2),d.center.y=Math.round((cd.y-c)/2)+a.vGap.top,d.max.x=b>cd.x?Math.round(cd.x-b):d.center.x,d.max.y=c>cd.y?Math.round(cd.y-c)+a.vGap.top:d.center.y,d.min.x=b>cd.x?0:d.center.x,d.min.y=c>cd.y?a.vGap.top:d.center.y},hd=function(a,b,c){if(a.src&&!a.loadError){var d=!c;if(d&&(a.vGap||(a.vGap={top:0,bottom:0}),Cb("parseVerticalMargin",a)),cd.x=b.x,cd.y=b.y-a.vGap.top-a.vGap.bottom,d){var e=cd.x/a.w,f=cd.y/a.h;a.fitRatio=f>e?e:f;var g=i.scaleMode;"orig"===g?c=1:"fit"===g&&(c=a.fitRatio),c>1&&(c=1),a.initialZoomLevel=c,a.bounds||(a.bounds=fd())}if(!c)return;return gd(a,a.w*c,a.h*c),d&&c===a.initialZoomLevel&&(a.initialPosition=a.bounds.center),a.bounds}return a.w=a.h=0,a.initialZoomLevel=a.fitRatio=1,a.bounds=fd(),a.initialPosition=a.bounds.center,a.bounds},id=function(a,b,c,d,e,g){if(!b.loadError){var h,j=f.isDragging()&&!f.isZooming(),k=a===m||f.isMainScrollAnimating()||j;!e&&(I||i.alwaysFadeIn)&&k&&(h=!0),d&&(h&&(d.style.opacity=0),b.imageAppended=!0,c.appendChild(d),h&&setTimeout(function(){d.style.opacity=1,g&&setTimeout(function(){b&&b.loaded&&b.placeholder&&(b.placeholder.style.display="none",b.placeholder=null)},500)},50))}},jd=function(a){a.loading=!0,a.loaded=!1;var b=a.img=e.createEl("pswp__img","img"),c=function(){a.loading=!1,a.loaded=!0,a.loadComplete?a.loadComplete(a):a.img=null,b.onload=b.onerror=null,b=null};return b.onload=c,b.onerror=function(){a.loadError=!0,c()},b.src=a.src,b},kd=function(a,b){return a.src&&a.loadError&&a.container?(b&&(a.container.innerHTML=""),a.container.innerHTML=i.errorMsg.replace("%url%",a.src),!0):void 0},ld=function(){if(dd.length){for(var a,b=0;b<dd.length;b++)a=dd[b],a.holder.index===a.index&&id(a.index,a.item,a.baseDiv,a.img);dd=[]}};yb("Controller",{publicMethods:{lazyLoadItem:function(a){a=zb(a);var b=$c(a);b&&b.src&&!b.loaded&&!b.loading&&(Cb("gettingData",a,b),jd(b))},initController:function(){e.extend(i,ed,!0),f.items=Xc=c,$c=f.getItemAt,_c=i.getNumItemsFn,ad=i.loop,_c()<3&&(i.loop=!1),Bb("beforeChange",function(a){var b,c=i.preload,d=null===a?!0:a>0,e=Math.min(c[0],_c()),g=Math.min(c[1],_c());for(b=1;(d?g:e)>=b;b++)f.lazyLoadItem(m+b);for(b=1;(d?e:g)>=b;b++)f.lazyLoadItem(m-b)}),Bb("initialLayout",function(){f.currItem.initialLayout=i.getThumbBoundsFn&&i.getThumbBoundsFn(m)}),Bb("mainScrollAnimComplete",ld),Bb("initialZoomInEnd",ld),Bb("destroy",function(){for(var a,b=0;b<Xc.length;b++)a=Xc[b],a.container&&(a.container=null),a.placeholder&&(a.placeholder=null),a.img&&(a.img=null),a.preloader&&(a.preloader=null),a.loadError&&(a.loaded=a.loadError=!1);dd=null})},getItemAt:function(a){return a>=0&&void 0!==Xc[a]?Xc[a]:!1},allowProgressiveImg:function(){return i.forceProgressiveLoading||!I||i.mouseUsed||screen.width>1200},setContent:function(a,b){i.loop&&(b=zb(b));var c=f.getItemAt(a.index);c&&(c.container=null);var d,g=f.getItemAt(b);if(!g)return void(a.el.innerHTML="");Cb("gettingData",b,g),a.index=b,a.item=g;var h=g.container=e.createEl("pswp__zoom-wrap");if(!g.src&&g.html&&(g.html.tagName?h.appendChild(g.html):h.innerHTML=g.html),kd(g),!g.src||g.loadError||g.loaded)g.src&&!g.loadError&&(d=e.createEl("pswp__img","img"),d.style.webkitBackfaceVisibility="hidden",d.style.opacity=1,d.src=g.src,id(b,g,h,d,!0));else{if(g.loadComplete=function(c){if(j){if(c.img.style.webkitBackfaceVisibility="hidden",a&&a.index===b){if(kd(c,!0))return c.loadComplete=c.img=null,hd(c,rb),Hb(c),void(a.index===m&&f.updateCurrZoomItem());c.imageAppended?!Zc&&c.placeholder&&(c.placeholder.style.display="none",c.placeholder=null):P.transform&&(gb||Zc)?dd.push({item:c,baseDiv:h,img:c.img,index:b,holder:a}):id(b,c,h,c.img,gb||Zc)}c.loadComplete=null,c.img=null,Cb("imageLoadComplete",b,c)}},e.features.transform){var k="pswp__img pswp__img--placeholder";k+=g.msrc?"":" pswp__img--placeholder--blank";var l=e.createEl(k,g.msrc?"img":"");g.msrc&&(l.src=g.msrc),l.style.width=g.w+"px",l.style.height=g.h+"px",h.appendChild(l),g.placeholder=l}g.loading||jd(g),f.allowProgressiveImg()&&(!Yc&&P.transform?dd.push({item:g,baseDiv:h,img:g.img,index:b,holder:a}):id(b,g,h,g.img,!0,!0))}hd(g,rb),Yc||b!==m?Hb(g):(fb=h.style,bd(g,d||g.img)),a.el.innerHTML="",a.el.appendChild(h)},cleanSlide:function(a){a.img&&(a.img.onload=a.img.onerror=null),a.loaded=a.loading=a.img=a.imageAppended=!1}}});var md,nd={},od=function(a,b,c){var d=document.createEvent("CustomEvent"),e={origEvent:a,target:a.target,releasePoint:b,pointerType:c||"touch"};d.initCustomEvent("pswpTap",!0,!0,e),a.target.dispatchEvent(d)};yb("Tap",{publicMethods:{initTap:function(){Bb("firstTouchStart",f.onTapStart),Bb("touchRelease",f.onTapRelease),Bb("destroy",function(){nd={},md=null})},onTapStart:function(a){a.length>1&&(clearTimeout(md),md=null)},onTapRelease:function(a,b){if(b&&!Z&&!X&&!$b){var c=b;if(md&&(clearTimeout(md),md=null,wc(c,nd)))return void Cb("doubleTap",c);if("mouse"===b.type)return void od(a,b,"mouse");var d=a.target.tagName.toUpperCase();if("BUTTON"===d||e.hasClass(a.target,"pswp__single-tap"))return void od(a,b);Lb(nd,c),md=setTimeout(function(){od(a,b),md=null},300)}}}});var pd;yb("DesktopZoom",{publicMethods:{initDesktopZoom:function(){N||(I?Bb("mouseUsed",function(){f.setupDesktopZoom()}):f.setupDesktopZoom(!0))},setupDesktopZoom:function(b){pd={};var c="wheel mousewheel DOMMouseScroll";Bb("bindEvents",function(){e.bind(a,c,f.handleMouseWheel)}),Bb("unbindEvents",function(){pd&&e.unbind(a,c,f.handleMouseWheel)}),f.mouseZoomedIn=!1;var d,g=function(){f.mouseZoomedIn&&(e.removeClass(a,"pswp--zoomed-in"),f.mouseZoomedIn=!1),1>s?e.addClass(a,"pswp--zoom-allowed"):e.removeClass(a,"pswp--zoom-allowed"),h()},h=function(){d&&(e.removeClass(a,"pswp--dragging"),d=!1)};Bb("resize",g),Bb("afterChange",g),Bb("pointerDown",function(){f.mouseZoomedIn&&(d=!0,e.addClass(a,"pswp--dragging"))}),Bb("pointerUp",h),b||g()},handleMouseWheel:function(a){if(s<=f.currItem.fitRatio)return i.closeOnScroll||a.preventDefault(),!0;if(a.preventDefault(),a.stopPropagation(),pd.x=0,"deltaX"in a)pd.x=a.deltaX,pd.y=a.deltaY;else if("wheelDelta"in a)a.wheelDeltaX&&(pd.x=-.16*a.wheelDeltaX),pd.y=a.wheelDeltaY?-.16*a.wheelDeltaY:-.16*a.wheelDelta;else{if(!("detail"in a))return;pd.y=a.detail}Rb(s,!0),f.panTo(qb.x-pd.x,qb.y-pd.y)},toggleDesktopZoom:function(b){b=b||{x:rb.x/2,y:rb.y/2+M};var c=i.getDoubleTapZoom(!0,f.currItem),d=s===c;f.mouseZoomedIn=!d,f.zoomTo(d?f.currItem.initialZoomLevel:c,b,333),e[(d?"remove":"add")+"Class"](a,"pswp--zoomed-in")}}});var qd,rd,sd,td,ud,vd,wd,xd,yd,zd,Ad,Bd,Cd={history:!0,galleryUID:1},Dd=function(){return Ad.hash.substring(1)},Ed=function(){qd&&clearTimeout(qd),sd&&clearTimeout(sd)},Fd=function(){var a=Dd(),b={};if(a.length<5)return b;for(var c=a.split("&"),d=0;d<c.length;d++)if(c[d]){var e=c[d].split("=");e.length<2||(b[e[0]]=e[1])}return b.pid=parseInt(b.pid,10)-1,b.pid<0&&(b.pid=0),b},Gd=function(){if(sd&&clearTimeout(sd),$b||W)return void(sd=setTimeout(Gd,500));td?clearTimeout(rd):td=!0;var a=wd+"&gid="+i.galleryUID+"&pid="+(m+1);xd||-1===Ad.hash.indexOf(a)&&(zd=!0);var b=Ad.href.split("#")[0]+"#"+a;Bd?"#"+a!==window.location.hash&&history[xd?"replaceState":"pushState"]("",document.title,b):xd?Ad.replace(b):Ad.hash=a,xd=!0,rd=setTimeout(function(){td=!1},60)};yb("History",{publicMethods:{initHistory:function(){if(e.extend(i,Cd,!0),i.history){Ad=window.location,zd=!1,yd=!1,xd=!1,wd=Dd(),Bd="pushState"in history,wd.indexOf("gid=")>-1&&(wd=wd.split("&gid=")[0],wd=wd.split("?gid=")[0]),Bb("afterChange",f.updateURL),Bb("unbindEvents",function(){e.unbind(window,"hashchange",f.onHashChange)});var a=function(){vd=!0,yd||(zd?history.back():wd?Ad.hash=wd:Bd?history.pushState("",document.title,Ad.pathname+Ad.search):Ad.hash=""),Ed()};Bb("unbindEvents",function(){l&&a()}),Bb("destroy",function(){vd||a()}),Bb("firstUpdate",function(){m=Fd().pid});var b=wd.indexOf("pid=");b>-1&&(wd=wd.substring(0,b),"&"===wd.slice(-1)&&(wd=wd.slice(0,-1))),setTimeout(function(){j&&e.bind(window,"hashchange",f.onHashChange)},40)}},onHashChange:function(){return Dd()===wd?(yd=!0,void f.close()):void(td||(ud=!0,f.goTo(Fd().pid),ud=!1))},updateURL:function(){Ed(),ud||(xd?qd=setTimeout(Gd,800):Gd())}}}),e.extend(f,dc)};return a});;
/*! PhotoSwipe Default UI - 4.0.5 - 2015-01-15
* http://photoswipe.com
* Copyright (c) 2015 Dmitry Semenov; */
!function(a,b){"function"==typeof define&&define.amd?define(b):"object"==typeof exports?module.exports=b():a.PhotoSwipeUI_Default=b()}(this,function(){"use strict";var a=function(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v=this,w=!1,x=!0,y=!0,z={barsSize:{top:44,bottom:"auto"},closeElClasses:["item","caption","zoom-wrap","ui","top-bar"],timeToIdle:4e3,timeToIdleOutside:1e3,loadingIndicatorDelay:1e3,addCaptionHTMLFn:function(a,b){return a.title?(b.children[0].innerHTML=a.title,!0):(b.children[0].innerHTML="",!1)},closeEl:!0,captionEl:!0,fullscreenEl:!0,zoomEl:!0,shareEl:!0,counterEl:!0,arrowEl:!0,preloaderEl:!0,tapToClose:!1,tapToToggleControls:!0,clickToCloseNonZoomable:!0,shareButtons:[{id:"facebook",label:"Share on Facebook",url:"https://www.facebook.com/sharer/sharer.php?u={{url}}"},{id:"twitter",label:"Tweet",url:"https://twitter.com/intent/tweet?text={{text}}&url={{url}}"},{id:"pinterest",label:"Pin it",url:"http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}"},{id:"download",label:"Download image",url:"{{raw_image_url}}",download:!0}],getImageURLForShare:function(){return a.currItem.src||""},getPageURLForShare:function(){return window.location.href},getTextForShare:function(){return a.currItem.title||""},indexIndicatorSep:" / "},A=function(a){if(r)return!0;a=a||window.event,q.timeToIdle&&q.mouseUsed&&!k&&K();for(var c,d,e=a.target||a.srcElement,f=e.className,g=0;g<S.length;g++)c=S[g],c.onTap&&f.indexOf("pswp__"+c.name)>-1&&(c.onTap(),d=!0);if(d){a.stopPropagation&&a.stopPropagation(),r=!0;var h=b.features.isOldAndroid?600:30;s=setTimeout(function(){r=!1},h)}},B=function(){return!a.likelyTouchDevice||q.mouseUsed||screen.width>1200},C=function(a,c,d){b[(d?"add":"remove")+"Class"](a,"pswp__"+c)},D=function(){var a=1===q.getNumItemsFn();a!==p&&(C(d,"ui--one-slide",a),p=a)},E=function(){C(i,"share-modal--hidden",y)},F=function(){return y=!y,y?(b.removeClass(i,"pswp__share-modal--fade-in"),setTimeout(function(){y&&E()},300)):(E(),setTimeout(function(){y||b.addClass(i,"pswp__share-modal--fade-in")},30)),y||H(),!1},G=function(b){b=b||window.event;var c=b.target||b.srcElement;return a.shout("shareLinkClick",b,c),c.href?c.hasAttribute("download")?!0:(window.open(c.href,"pswp_share","scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,top=100,left="+(window.screen?Math.round(screen.width/2-275):100)),y||F(),!1):!1},H=function(){for(var a,b,c,d,e,f="",g=0;g<q.shareButtons.length;g++)a=q.shareButtons[g],c=q.getImageURLForShare(a),d=q.getPageURLForShare(a),e=q.getTextForShare(a),b=a.url.replace("{{url}}",encodeURIComponent(d)).replace("{{image_url}}",encodeURIComponent(c)).replace("{{raw_image_url}}",c).replace("{{text}}",encodeURIComponent(e)),f+='<a href="'+b+'" target="_blank" class="pswp__share--'+a.id+'"'+(a.download?"download":"")+">"+a.label+"</a>",q.parseShareButtonOut&&(f=q.parseShareButtonOut(a,f));i.children[0].innerHTML=f,i.children[0].onclick=G},I=function(a){for(var c=0;c<q.closeElClasses.length;c++)if(b.hasClass(a,"pswp__"+q.closeElClasses[c]))return!0},J=0,K=function(){clearTimeout(u),J=0,k&&v.setIdle(!1)},L=function(a){a=a?a:window.event;var b=a.relatedTarget||a.toElement;b&&"HTML"!==b.nodeName||(clearTimeout(u),u=setTimeout(function(){v.setIdle(!0)},q.timeToIdleOutside))},M=function(){q.fullscreenEl&&(c||(c=v.getFullscreenAPI()),c?(b.bind(document,c.eventK,v.updateFullscreen),v.updateFullscreen(),b.addClass(a.template,"pswp--supports-fs")):b.removeClass(a.template,"pswp--supports-fs"))},N=function(){q.preloaderEl&&(O(!0),l("beforeChange",function(){clearTimeout(o),o=setTimeout(function(){a.currItem&&a.currItem.loading?(!a.allowProgressiveImg()||a.currItem.img&&!a.currItem.img.naturalWidth)&&O(!1):O(!0)},q.loadingIndicatorDelay)}),l("imageLoadComplete",function(b,c){a.currItem===c&&O(!0)}))},O=function(a){n!==a&&(C(m,"preloader--active",!a),n=a)},P=function(a){var c=a.vGap;if(B()){var g=q.barsSize;if(q.captionEl&&"auto"===g.bottom)if(f||(f=b.createEl("pswp__caption pswp__caption--fake"),f.appendChild(b.createEl("pswp__caption__center")),d.insertBefore(f,e),b.addClass(d,"pswp__ui--fit")),q.addCaptionHTMLFn(a,f,!0)){var h=f.clientHeight;c.bottom=parseInt(h,10)||44}else c.bottom=g.top;else c.bottom=g.bottom;c.top=g.top}else c.top=c.bottom=0},Q=function(){q.timeToIdle&&l("mouseUsed",function(){b.bind(document,"mousemove",K),b.bind(document,"mouseout",L),t=setInterval(function(){J++,2===J&&v.setIdle(!0)},q.timeToIdle/2)})},R=function(){l("onVerticalDrag",function(a){x&&.95>a?v.hideControls():!x&&a>=.95&&v.showControls()});var a;l("onPinchClose",function(b){x&&.9>b?(v.hideControls(),a=!0):a&&!x&&b>.9&&v.showControls()}),l("zoomGestureEnded",function(){a=!1,a&&!x&&v.showControls()})},S=[{name:"caption",option:"captionEl",onInit:function(a){e=a}},{name:"share-modal",option:"shareEl",onInit:function(a){i=a},onTap:function(){F()}},{name:"button--share",option:"shareEl",onInit:function(a){h=a},onTap:function(){F()}},{name:"button--zoom",option:"zoomEl",onTap:a.toggleDesktopZoom},{name:"counter",option:"counterEl",onInit:function(a){g=a}},{name:"button--close",option:"closeEl",onTap:a.close},{name:"button--arrow--left",option:"arrowEl",onTap:a.prev},{name:"button--arrow--right",option:"arrowEl",onTap:a.next},{name:"button--fs",option:"fullscreenEl",onTap:function(){c.isFullscreen()?c.exit():c.enter()}},{name:"preloader",option:"preloaderEl",onInit:function(a){m=a}}],T=function(){var a,c,e,f=function(d){if(d)for(var f=d.length,g=0;f>g;g++){a=d[g],c=a.className;for(var h=0;h<S.length;h++)e=S[h],c.indexOf("pswp__"+e.name)>-1&&(q[e.option]?(b.removeClass(a,"pswp__element--disabled"),e.onInit&&e.onInit(a)):b.addClass(a,"pswp__element--disabled"))}};f(d.children);var g=b.getChildByClass(d,"pswp__top-bar");g&&f(g.children)};v.init=function(){b.extend(a.options,z,!0),q=a.options,d=b.getChildByClass(a.scrollWrap,"pswp__ui"),l=a.listen,R(),l("beforeChange",v.update),l("doubleTap",function(b){var c=a.currItem.initialZoomLevel;a.getZoomLevel()!==c?a.zoomTo(c,b,333):a.zoomTo(q.getDoubleTapZoom(!1,a.currItem),b,333)}),l("preventDragEvent",function(a,b,c){var d=a.target||a.srcElement;d&&d.className&&a.type.indexOf("mouse")>-1&&(d.className.indexOf("__caption")>0||/(SMALL|STRONG|EM)/i.test(d.tagName))&&(c.prevent=!1)}),l("bindEvents",function(){b.bind(d,"pswpTap click",A),b.bind(a.scrollWrap,"pswpTap",v.onGlobalTap),a.likelyTouchDevice||b.bind(a.scrollWrap,"mouseover",v.onMouseOver)}),l("unbindEvents",function(){y||F(),t&&clearInterval(t),b.unbind(document,"mouseout",L),b.unbind(document,"mousemove",K),b.unbind(d,"pswpTap click",A),b.unbind(a.scrollWrap,"pswpTap",v.onGlobalTap),b.unbind(a.scrollWrap,"mouseover",v.onMouseOver),c&&(b.unbind(document,c.eventK,v.updateFullscreen),c.isFullscreen()&&(q.hideAnimationDuration=0,c.exit()),c=null)}),l("destroy",function(){q.captionEl&&(f&&d.removeChild(f),b.removeClass(e,"pswp__caption--empty")),i&&(i.children[0].onclick=null),b.removeClass(d,"pswp__ui--over-close"),b.addClass(d,"pswp__ui--hidden"),v.setIdle(!1)}),q.showAnimationDuration||b.removeClass(d,"pswp__ui--hidden"),l("initialZoomIn",function(){q.showAnimationDuration&&b.removeClass(d,"pswp__ui--hidden")}),l("initialZoomOut",function(){b.addClass(d,"pswp__ui--hidden")}),l("parseVerticalMargin",P),T(),q.shareEl&&h&&i&&(y=!0),D(),Q(),M(),N()},v.setIdle=function(a){k=a,C(d,"ui--idle",a)},v.update=function(){x&&a.currItem?(v.updateIndexIndicator(),q.captionEl&&(q.addCaptionHTMLFn(a.currItem,e),C(e,"caption--empty",!a.currItem.title)),w=!0):w=!1,y||F(),D()},v.updateFullscreen=function(){C(a.template,"fs",c.isFullscreen())},v.updateIndexIndicator=function(){q.counterEl&&(g.innerHTML=a.getCurrentIndex()+1+q.indexIndicatorSep+q.getNumItemsFn())},v.onGlobalTap=function(c){c=c||window.event;var d=c.target||c.srcElement;if(!r)if(c.detail&&"mouse"===c.detail.pointerType){if(I(d))return void a.close();b.hasClass(d,"pswp__img")&&(1===a.getZoomLevel()&&a.getZoomLevel()<=a.currItem.fitRatio?q.clickToCloseNonZoomable&&a.close():a.toggleDesktopZoom(c.detail.releasePoint))}else if(q.tapToToggleControls&&(x?v.hideControls():v.showControls()),q.tapToClose&&(b.hasClass(d,"pswp__img")||I(d)))return void a.close()},v.onMouseOver=function(a){a=a||window.event;var b=a.target||a.srcElement;C(d,"ui--over-close",I(b))},v.hideControls=function(){b.addClass(d,"pswp__ui--hidden"),x=!1},v.showControls=function(){x=!0,w||v.update(),b.removeClass(d,"pswp__ui--hidden")},v.supportsFullscreen=function(){var a=document;return!!(a.exitFullscreen||a.mozCancelFullScreen||a.webkitExitFullscreen||a.msExitFullscreen)},v.getFullscreenAPI=function(){var b,c=document.documentElement,d="fullscreenchange";return c.requestFullscreen?b={enterK:"requestFullscreen",exitK:"exitFullscreen",elementK:"fullscreenElement",eventK:d}:c.mozRequestFullScreen?b={enterK:"mozRequestFullScreen",exitK:"mozCancelFullScreen",elementK:"mozFullScreenElement",eventK:"moz"+d}:c.webkitRequestFullscreen?b={enterK:"webkitRequestFullscreen",exitK:"webkitExitFullscreen",elementK:"webkitFullscreenElement",eventK:"webkit"+d}:c.msRequestFullscreen&&(b={enterK:"msRequestFullscreen",exitK:"msExitFullscreen",elementK:"msFullscreenElement",eventK:"MSFullscreenChange"}),b&&(b.enter=function(){return j=q.closeOnScroll,q.closeOnScroll=!1,"webkitRequestFullscreen"!==this.enterK?a.template[this.enterK]():void a.template[this.enterK](Element.ALLOW_KEYBOARD_INPUT)},b.exit=function(){return q.closeOnScroll=j,document[this.exitK]()},b.isFullscreen=function(){return document[this.elementK]}),b}};return a});;
(function ($) {

Drupal.googleanalytics = {};

$(document).ready(function() {

  // Attach mousedown, keyup, touchstart events to document only and catch
  // clicks on all elements.
  $(document.body).bind("mousedown keyup touchstart", function(event) {

    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      // Is the clicked URL internal?
      if (Drupal.googleanalytics.isInternal(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox') && (Drupal.settings.googleanalytics.trackColorbox)) {
          // Do nothing here. The custom event will handle all tracking.
          //console.info("Click on .colorbox item has been detected.");
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (Drupal.settings.googleanalytics.trackDownload && Drupal.googleanalytics.isDownload(this.href)) {
          // Download link clicked.
          ga("send", {
            "hitType": "event",
            "eventCategory": "Downloads",
            "eventAction": Drupal.googleanalytics.getDownloadExtension(this.href).toUpperCase(),
            "eventLabel": Drupal.googleanalytics.getPageUrl(this.href),
            "transport": "beacon"
          });
        }
        else if (Drupal.googleanalytics.isInternalSpecial(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          ga("send", {
            "hitType": "pageview",
            "page": Drupal.googleanalytics.getPageUrl(this.href),
            "transport": "beacon"
          });
        }
      }
      else {
        if (Drupal.settings.googleanalytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          ga("send", {
            "hitType": "event",
            "eventCategory": "Mails",
            "eventAction": "Click",
            "eventLabel": this.href.substring(7),
            "transport": "beacon"
          });
        }
        else if (Drupal.settings.googleanalytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (Drupal.settings.googleanalytics.trackDomainMode !== 2 || (Drupal.settings.googleanalytics.trackDomainMode === 2 && !Drupal.googleanalytics.isCrossDomain(this.hostname, Drupal.settings.googleanalytics.trackCrossDomains))) {
            // External link clicked / No top-level cross domain clicked.
            ga("send", {
              "hitType": "event",
              "eventCategory": "Outbound links",
              "eventAction": "Click",
              "eventLabel": this.href,
              "transport": "beacon"
            });
          }
        }
      }
    });
  });

  // Track hash changes as unique pageviews, if this option has been enabled.
  if (Drupal.settings.googleanalytics.trackUrlFragments) {
    window.onhashchange = function() {
      ga("send", {
        "hitType": "pageview",
        "page": location.pathname + location.search + location.hash
      });
    };
  }

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  if (Drupal.settings.googleanalytics.trackColorbox) {
    $(document).bind("cbox_complete", function () {
      var href = $.colorbox.element().attr("href");
      if (href) {
        ga("send", {
          "hitType": "pageview",
          "page": Drupal.googleanalytics.getPageUrl(href)
        });
      }
    });
  }

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
Drupal.googleanalytics.isCrossDomain = function (hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, http://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
};

/**
 * Check whether this is a download URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isDownload = function (url) {
  var isDownload = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  return isDownload.test(url);
};

/**
 * Check whether this is an absolute internal URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternal = function (url) {
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return isInternal.test(url);
};

/**
 * Check whether this is a special URL or not.
 *
 * URL types:
 *  - gotwo.module /go/* links.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternalSpecial = function (url) {
  var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
  return isInternalSpecial.test(url);
};

/**
 * Extract the relative internal URL from an absolute internal URL.
 *
 * Examples:
 * - http://mydomain.com/node/1 -> /node/1
 * - http://example.com/foo/bar -> http://example.com/foo/bar
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   Internal website URL
 */
Drupal.googleanalytics.getPageUrl = function (url) {
  var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return url.replace(extractInternalUrl, '');
};

/**
 * Extract the download file extension from the URL.
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   The file extension of the passed url. e.g. "zip", "txt"
 */
Drupal.googleanalytics.getDownloadExtension = function (url) {
  var extractDownloadextension = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  var extension = extractDownloadextension.exec(url);
  return (extension === null) ? '' : extension[1];
};

})(jQuery);
;
