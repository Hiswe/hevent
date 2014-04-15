/**
 * hevent - Css animations & transitions events for all browsers
 * @version v0.4.1
 * @link http://hiswe.github.io/hevent/
 * @license WTFPL
 */
(function($, document, window) {
  var aliases, heventMethod, orginalMethod, _results;
  aliases = {
    heventAddClass: 'addClass',
    heventRemoveClass: 'removeClass',
    heventToggleClass: 'toggleClass'
  };
  _results = [];
  for (heventMethod in aliases) {
    orginalMethod = aliases[heventMethod];
    _results.push((function() {
      return $.fn[heventMethod] = function(className) {
        window.setTimeout((function(_this) {
          return function() {
            return $(_this).trigger('classChange');
          };
        })(this), 1);
        return jQuery.fn[orginalMethod].apply(this, [className]);
      };
    })());
  }
  return _results;
})(jQuery, document, window);

var __slice = [].slice;

(function($, Modernizr, document, window) {
  var aliasesEvent, eventName, isAnimated, lcFirst, log, sniffer, trace, trans, triggerCustomEvent, ucFirst, _i, _len, _ref, _results;
  if (Modernizr == null) {
    return typeof console !== "undefined" && console !== null ? console.warn('Modernizr should be installed for hevet to work') : void 0;
  }
  trace = false;
  trans = 'transanimationend';
  log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (!trace) {
      return;
    }
    args.unshift('[TRANS-ANIMATION]');
    return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log.apply(console, args) : void 0 : void 0;
  };
  lcFirst = function(text) {
    return text.substr(0, 1).toLowerCase() + text.substr(1);
  };
  ucFirst = function(text) {
    return text.substr(0, 1).toUpperCase() + text.substr(1);
  };
  sniffer = (function() {
    var animationEndEventNames, result, transEndEventNames;
    transEndEventNames = {
      'transition': 'transitionend',
      'msTransition': 'MSTransitionEnd',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };
    animationEndEventNames = {
      'animation': 'animationend',
      'msAnimation': 'MSAnimationEnd',
      'OAnimation': 'oAnimationEnd',
      'MozAnimation': 'animationend',
      'WebkitAnimation': 'webkitAnimationEnd'
    };
    result = {
      transAnimationSupport: Modernizr.cssanimations === true && Modernizr.csstransitions === true,
      transitionend: transEndEventNames[Modernizr.prefixed('transition')],
      animationend: animationEndEventNames[Modernizr.prefixed('animation')]
    };
    log('sniffer', result);
    return result;
  })();
  triggerCustomEvent = function(obj, eventType, event) {
    var originalType;
    log('triggerCustomEvent');
    originalType = event.type;
    event.type = eventType;
    $.event.dispatch.call(obj, event);
    return event.type = originalType;
  };
  isAnimated = function(el) {
    var animated, hasDuration, key, prefix, style, _i, _len, _ref;
    log('isAnimated', 'begin animation check');
    if (!sniffer.transAnimationSupport) {
      return false;
    }
    style = window.getComputedStyle(el) || {};
    prefix = sniffer.cssPrefix;
    animated = false;
    _ref = ["TransitionDuration", "AnimationDuration"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      hasDuration = style[lcFirst(key)] || style["" + prefix + key];
      if ((hasDuration != null) && hasDuration !== '' && hasDuration !== '0s') {
        animated = true;
        break;
      }
    }
    log('isAnimated', animated);
    return animated;
  };
  $.event.special[trans] = {
    sniffer: sniffer,
    setup: function(data, namespaces, eventHandle) {
      var $this, eventName, thisObject;
      log('setup');
      thisObject = this;
      $this = $(thisObject);
      eventName = data.hevent;
      $this.on('classChange', function(event) {
        return $.event.special[trans].handleClassChange(thisObject, event.target, eventName);
      });
      if (eventName === sniffer[eventName]) {
        return log('W3C event name');
      }
      return $this.on(sniffer[eventName], function(event) {
        return $.event.special[trans].fireEvent(thisObject, event.target, eventName);
      });
    },
    teardown: function(namespaces) {
      var $this;
      $this = $(this);
      $this.off('classChange');
      $this.off("" + sniffer.transitionEnd + " " + sniffer.animationEnd);
      return $this.off("transitionend animationend");
    },
    handleClassChange: function(thisObject, origTarget, eventName) {
      var ev;
      log('handleClassChange');
      ev = $.Event(trans, {
        target: origTarget
      });
      triggerCustomEvent(thisObject, trans, ev);
      if (isAnimated(thisObject)) {
        return true;
      }
      return $.event.special[trans].fireEvent(thisObject, origTarget, eventName);
    },
    fireEvent: function(thisObject, origTarget, eventName) {
      var ev;
      log('fireEvent');
      ev = $.Event(eventName, {
        target: origTarget
      });
      return triggerCustomEvent(thisObject, eventName, ev);
    }
  };
  aliasesEvent = function(eventName) {
    return $.event.special[eventName] = {
      setup: function() {
        $(this).on(trans, {
          hevent: eventName
        }, $.noop);
        if (eventName === sniffer[eventName]) {
          log('Use original event for', eventName);
          return false;
        }
      },
      teardown: function() {
        return $(this).off(trans);
      }
    };
  };
  _ref = ['transitionend', 'animationend'];
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    eventName = _ref[_i];
    _results.push(aliasesEvent(eventName));
  }
  return _results;
})(jQuery, Modernizr, document, window);
