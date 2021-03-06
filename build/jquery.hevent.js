/**
 * hevent - Css animations & transitions events for all browsers
 * @version v0.4.9
 * @link http://hiswe.github.io/hevent/
 * @license WTFPL
 */
(function(window, factory) {
  if (typeof define === 'function' && define.amd) {
    return define([window, 'jquery'], factory);
  } else if (typeof (typeof module !== "undefined" && module !== null ? module.exports : void 0) === 'object') {
    return module.exports = factory(window, require('jquery'));
  } else {
    return factory(window, window.jQuery);
  }
})(window || this, function(window, $){
  var hclass;

hclass = function(window, $) {
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
            jQuery.fn[orginalMethod].apply(_this, [className]);
            return $(_this).trigger('classChange');
          };
        })(this), 1);
        return this;
      };
    })());
  }
  return _results;
};

var hevent,
  __slice = [].slice;

hevent = function(window, $) {
  var Modernizr, aliasesEvent, eventName, isAnimated, lcFirst, log, sniffer, trace, triggerCustomEvent, ucFirst, _i, _len, _ref, _results;
  Modernizr = Modernizr != null ? Modernizr : window.Modernizr;
  if (Modernizr == null) {
    return typeof console !== "undefined" && console !== null ? console.warn('Modernizr should be installed for hevent to work') : void 0;
  }
  if (Modernizr.prefixed == null) {
    return typeof console !== "undefined" && console !== null ? console.warn('Modernizr should have the method "prefixed"') : void 0;
  }
  if (Modernizr.csstransitions == null) {
    return typeof console !== "undefined" && console !== null ? console.warn('Modernizr should have the test csstransitions') : void 0;
  }
  if (Modernizr.cssanimations == null) {
    return typeof console !== "undefined" && console !== null ? console.warn('Modernizr should have the test cssanimations') : void 0;
  }
  trace = false;
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
      transitionendSupport: Modernizr.csstransitions === true,
      animationendSupport: Modernizr.cssanimations === true,
      transAnimationSupport: Modernizr.cssanimations === true && Modernizr.csstransitions === true,
      transitionend: transEndEventNames[Modernizr.prefixed('transition')],
      animationend: animationEndEventNames[Modernizr.prefixed('animation')],
      durations: [Modernizr.prefixed('TransitionDuration'), Modernizr.prefixed('AnimationDuration')]
    };
    log('sniffer', result);
    return result;
  })();
  isAnimated = function(el) {
    var animated, hasDuration, key, style, _i, _len, _ref;
    if (!sniffer.transAnimationSupport) {
      return false;
    }
    style = getComputedStyle(el) || {};
    animated = false;
    _ref = sniffer.durations;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      hasDuration = style[key];
      if ((hasDuration != null) && hasDuration !== '' && hasDuration !== '0s') {
        animated = true;
        break;
      }
      hasDuration = style[lcFirst(key)];
      if ((hasDuration != null) && hasDuration !== '' && hasDuration !== '0s') {
        animated = true;
        break;
      }
    }
    log('[IS ANIMATED]', animated);
    return animated;
  };
  triggerCustomEvent = function(obj, eventType, event) {
    var originalType;
    log('[TRIGGER CUSTOM EVENT]', event);
    originalType = event.type;
    event.type = eventType;
    $.event.dispatch.call(obj, event);
    return event.type = originalType;
  };
  $.event.special.heventend = {
    sniffer: sniffer,
    setup: function(data, namespaces) {
      var $this, eventName, thisObject;
      log('setup');
      thisObject = this;
      $this = $(thisObject);
      eventName = data.hevent;
      $this.on('classChange', function(event) {
        return $.event.special.heventend.handleClassChange(thisObject, event, eventName);
      });
      if (eventName === sniffer[eventName]) {
        log('W3C event', eventName);
        return false;
      }
      return $this.on(sniffer[eventName], function(event) {
        log('original event', event);
        return $.event.special.heventend.fireEvent(thisObject, event, eventName);
      });
    },
    teardown: function(namespaces) {
      var $this;
      $this = $(this);
      $this.off('classChange');
      $this.off("" + sniffer.transitionEnd + " " + sniffer.animationEnd);
      return $this.off("transitionend animationend");
    },
    handleClassChange: function(thisObject, event, eventName) {
      var ev, origTarget;
      origTarget = event.target;
      log('[HANDLE CLASS CHANGE]', event);
      ev = $.Event('heventend', {
        target: origTarget
      });
      triggerCustomEvent(thisObject, 'heventend', ev);
      if (isAnimated(origTarget)) {
        return true;
      }
      return $.event.special.heventend.fireEvent(thisObject, event, eventName);
    },
    fireEvent: function(thisObject, event, eventName) {
      var newEvent, originalEvent;
      log('[FIRE EVENT]', event.type);
      if (event.type === sniffer[eventName] || event.type === eventName) {
        log('[FIRE EVENT]', 'use DOM originalEvent');
        originalEvent = event;
      } else {
        log('[FIRE EVENT]', 'Create custom original');
        originalEvent = $.Event('hevent', {
          target: event.target
        });
      }
      newEvent = $.Event(eventName, {
        target: event.target,
        originalEvent: originalEvent
      });
      log('[FIRE EVENT] final event');
      return $.event.dispatch.call(thisObject, newEvent);
    }
  };
  aliasesEvent = function(eventName) {
    jQuery.event.fixHooks[eventName] = {
      props: ['propertyName', 'elapsedTime']
    };
    return $.event.special[eventName] = {
      setup: function() {
        $(this).on('heventend', {
          hevent: eventName
        }, $.noop);
        if (sniffer[eventName + 'Support']) {
          log('Use browser event for', eventName);
          return false;
        }
      },
      teardown: function() {
        return $(this).off('heventend');
      }
    };
  };
  _ref = ['transitionend', 'animationend'];
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    eventName = _ref[_i];
    _results.push((function(eventName) {
      return aliasesEvent(eventName);
    })(eventName));
  }
  return _results;
};

  hclass(window, $);
  hevent(window, $);
});
