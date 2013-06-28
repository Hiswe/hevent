/*!
 * jQuery Pointer Events v@VERSION
 * https://github.com/jquery/jquery-pointer-events
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 */
(function( $ ) {

var eventName, lastTouch,
	POINTER_TYPE_UNAVAILABLE = "",
	POINTER_TYPE_TOUCH = "touch",
	POINTER_TYPE_PEN = "pen",
	POINTER_TYPE_MOUSE = "mouse",
	eventMap = (function() {
		if ( "MSPointerEvent" in window ) {
			return {
				pointerdown: "MSPointerDown",
				pointerup: "MSPointerUp",
				pointermove: "MSPointerMove MSPointerHover",
				pointercancel: "MSPointerCancel",
				pointerover: "MSPointerOver",
				pointerout: "MSPointerOut"
			};
		}

		return {
			pointerdown: "touchstart mousedown",
			pointerup: "touchend mouseup",
			pointermove: "touchmove mousemove",
			pointercancel: "touchcancel",
			pointerover: "mouseover",
			pointerout: "mouseout"
		};
	})();

function processEvent( event, pointerType ) {
	var propLength, touch,
		i = 0,
		orig = event,
		mouseProps = $.event.mouseHooks.props;

	event = $.Event( pointerType, {
		bubbles: true,
		cancelable: true,
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tiltX: 0,
		tiltY: 0,
		pointerType: "",
		isPrimary: false
	});

	if ( orig.type.indexOf("mouse") !== -1 ) {
		for ( propLength = mouseProps.length; i < propLength; i++ ) {
			event[ mouseProps[ i ] ] = orig[ mouseProps[ i ] ];
		}

		event.pointerId = 1;
		event.pointerType = POINTER_TYPE_MOUSE;
		event.isPrimary = true;
		event.button = event.button !== undefined ? event.button : -1,
		event.buttons = event.buttons !== undefined ? event.buttons : 0,
		event.pressure = event.buttons > 0 ? 0.5 : 0;
	} else if ( orig.type.indexOf("touch") !== -1 ) {
		touch = orig.originalEvent.changedTouches[ 0 ];
		event.pageX = touch.pageX;
		event.pageY = touch.pageY;
		event.screenX = touch.screenX;
		event.screenY = touch.screenY;
		event.clientX = touch.clientX;
		event.clientY = touch.clientY;
		event.pointerId = touch.identifier;
		event.pointerType = POINTER_TYPE_TOUCH;
		event.button = 0;
		event.buttons = 1;
		event.pressure = 0.5;
		event.originalEvent = orig;
		// TODO: Properly determine primary pointer
		event.isPrimary = true;
	} else if ( orig.type.indexOf("Pointer") !== -1 ) {
		event.pointerId = orig.originalEvent.pointerId;
		event.pointerType = processMSPointerType( orig.originalEvent.pointerType );
		event.button = orig.originalEvent.button;
		event.buttons = event.pointerType === POINTER_TYPE_TOUCH ? 1 : orig.originalEvent.buttons;
		event.width = orig.originalEvent.width;
		event.height = orig.originalEvent.height;
		event.pressure = orig.originalEvent.pressure;
		event.tiltX = orig.originalEvent.tiltX;
		event.tiltY = orig.originalEvent.tiltY;
		event.pageX = orig.originalEvent.pageX;
		event.pageY = orig.originalEvent.pageY;
		event.screenX = orig.originalEvent.screenX;
		event.screenY = orig.originalEvent.screenY;
		event.clientX = orig.originalEvent.clientX;
		event.clientY = orig.originalEvent.clientY;
		event.isPrimary = orig.originalEvent.isPrimary;
	}

	return event;
}

function processMSPointerType( type ) {
	if ( type === 2 ) {
		return POINTER_TYPE_TOUCH;
	} else if ( type === 3 ) {
		return POINTER_TYPE_PEN;
	} else if ( type === 4 ) {
		return POINTER_TYPE_MOUSE;
	} else {
		return POINTER_TYPE_UNAVAILABLE;
	}
}

function createSpecialEvent( eventName ) {
	$.event.special[ eventName ] = {
		setup: function() {
			$( this ).on( eventMap[ eventName ], $.event.special[ eventName ].handler );
		},
		teardown: function() {
			$( this ).off( eventMap[ eventName ], $.event.special[ eventName ].handler );
		},
		handler: function( event ) {
			if ( !lastTouch || event.type.indexOf("touch") !== -1 ||
					( event.type.indexOf("mouse") !== -1 && event.timestamp - lastTouch.timestamp > 1000 ) ) {
				if ( event.type.indexOf("touch") !== -1 ) {
					lastTouch = event;
				}
				if ( eventName === "pointerdown" && event.type.indexOf("touch") !== -1 ) {
					$( event.target ).trigger( processEvent( event, "pointerover" ) );
				}
				$( event.target ).trigger( processEvent( event, eventName ) );
				if ( eventName === "pointerup" && event.type.indexOf("touch") !== -1 ) {
					$( event.target ).trigger( processEvent( event, "pointerout" ) );
				}
			}
		}
	};
}

for ( eventName in eventMap ) {
	createSpecialEvent( eventName );
}

})( jQuery );
;
var __slice = [].slice;

(function($, document, window) {
  var moveEvent, startEvent, stopEvent, triggerCustomEvent;
  startEvent = "pointerdown";
  stopEvent = "pointerup";
  moveEvent = "pointermove";
  triggerCustomEvent = function(obj, eventType, event) {
    var originalType;
    originalType = event.type;
    event.type = eventType;
    $.event.dispatch.call(obj, event);
    return event.type = originalType;
  };
  $.event.special.pointerswipe = {
    scrollSupressionThreshold: 30,
    durationThreshold: 1000,
    horizontalDistanceThreshold: 30,
    verticalDistanceThreshold: 75,
    start: function(event) {
      var data;
      data = event;
      return {
        time: (new Date()).getTime(),
        coords: [data.pageX, data.pageY],
        origin: $(event.target)
      };
    },
    stop: function(event) {
      var data;
      data = event;
      return {
        time: (new Date()).getTime(),
        coords: [data.pageX, data.pageY]
      };
    },
    handleSwipe: function(start, stop, thisObject, origTarget) {
      var direction, durationTest, hDistanceTest, vDistanceTest;
      durationTest = stop.time - start.time < $.event.special.pointerswipe.durationThreshold;
      hDistanceTest = Math.abs(start.coords[0] - stop.coords[0]) > $.event.special.pointerswipe.horizontalDistanceThreshold;
      vDistanceTest = Math.abs(start.coords[1] - stop.coords[1]) < $.event.special.pointerswipe.verticalDistanceThreshold;
      if (durationTest && hDistanceTest && vDistanceTest) {
        direction = start.coords[0] > stop.coords[0];
        direction = direction ? "pointerswipeleft" : "pointerswiperight";
        triggerCustomEvent(thisObject, "pointerswipe", $.Event("pointerswipe", {
          target: origTarget
        }));
        return triggerCustomEvent(thisObject, direction, $.Event(direction, {
          target: origTarget
        }));
      }
    },
    setup: function() {
      var $this, thisObject;
      thisObject = this;
      $this = $(thisObject);
      return $this.on(startEvent, function(event) {
        var moveHandler, origTarget, start, stop;
        stop = false;
        start = $.event.special.pointerswipe.start(event);
        origTarget = event.target;
        moveHandler = function(event) {
          if (!start) {
            return;
          }
          stop = $.event.special.pointerswipe.stop(event);
          if (Math.abs(start.coords[0] - stop.coords[0]) > $.event.special.pointerswipe.scrollSupressionThreshold) {
            return event.preventDefault();
          }
        };
        return $this.on(moveEvent, moveHandler).one(stopEvent, function() {
          $this.off(moveEvent, moveHandler);
          if (start && stop) {
            $.event.special.pointerswipe.handleSwipe(start, stop, thisObject, origTarget);
          }
          return start = stop = void 0;
        });
      });
    },
    teardown: function(e) {
      return $(this).off(startEvent).off(moveEvent).off(stopEvent);
    }
  };
  return $.each({
    pointerswipeleft: "pointerswipe",
    pointerswiperight: "pointerswipe"
  }, function(event, sourceEvent) {
    return $.event.special[event] = {
      setup: function() {
        return $(this).on(sourceEvent, $.noop);
      },
      teardown: function() {
        return $(this).off(sourceEvent);
      }
    };
  });
})(jQuery, document, window);

(function($, document, window) {
  var originalAddClass, originalRemoveClass;
  originalAddClass = jQuery.fn.addClass;
  originalRemoveClass = jQuery.fn.removeClass;
  $.fn.addClass = function(className, silent) {
    var result,
      _this = this;
    if (silent == null) {
      silent = false;
    }
    result = originalAddClass.apply(this, [className]);
    window.setTimeout(function() {
      if (!silent) {
        return $(_this).trigger('classChange');
      }
    }, 1);
    return result;
  };
  return $.fn.removeClass = function(className, silent) {
    var result,
      _this = this;
    if (silent == null) {
      silent = false;
    }
    result = originalRemoveClass.apply(this, [className]);
    window.setTimeout(function() {
      if (!silent) {
        return $(_this).trigger('classChange');
      }
    }, 1);
    return result;
  };
})(jQuery, document, window);

(function($, document, window) {
  var aliasesEvent, eventName, isAnimated, lcFirst, log, sniffer, trace, trans, triggerCustomEvent, ucFirst, _i, _len, _ref, _results;
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
    var animationEvent, animations, bodyStyle, cssPrefix, eventList, match, prop, transAnimationW3c, transitionEvent, transitions, vendorPrefix, vendorRegex;
    vendorPrefix = '';
    cssPrefix = '';
    vendorRegex = /^(Moz|webkit|O|ms)(?=[A-Z])/;
    bodyStyle = document.body && document.body.style;
    transitions = false;
    animations = false;
    transAnimationW3c = false;
    if (bodyStyle) {
      for (prop in bodyStyle) {
        match = vendorRegex.exec(prop);
        if (match) {
          vendorPrefix = ucFirst(match[0]);
          cssPrefix = match[0];
          break;
        }
      }
      transitions = !!((bodyStyle["transition"] != null) || (bodyStyle["" + vendorPrefix + "Transition"] != null));
      animations = !!((bodyStyle["animation"] != null) || (bodyStyle["" + vendorPrefix + "Animation"] != null));
    }
    eventList = {
      'default': ['transitionend', 'animationend'],
      'Ms': ['MSTransitionEnd', 'MSAnimationEnd'],
      'O': ['oTransitionEnd', 'oAnimationEnd'],
      'Moz': ['transitionend', 'animationend'],
      'Webkit': ['webkitTransitionEnd', 'webkitAnimationEnd']
    };
    if (transitions === false && animations === false) {
      transitionEvent = animationEvent = '';
    } else if (vendorPrefix === '') {
      transitionEvent = eventList["default"][0];
      animationEvent = eventList["default"][1];
      transAnimationW3c = true;
    } else {
      transitionEvent = eventList[vendorPrefix][0];
      animationEvent = eventList[vendorPrefix][1];
    }
    return {
      vendorPrefix: vendorPrefix,
      cssPrefix: cssPrefix,
      transitions: transitions,
      animations: animations,
      transAnimationSupport: transitions === true && animations === true,
      transitionend: transitionEvent,
      animationend: animationEvent,
      transAnimationW3c: transAnimationW3c
    };
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
          log('Use original event');
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
})(jQuery, document, window);
