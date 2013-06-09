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
  jQuery.fn.addClass = function() {
    var result;
    result = originalAddClass.apply(this, arguments);
    $(this).trigger('classChange');
    return result;
  };
  return jQuery.fn.removeClass = function() {
    var result;
    result = originalRemoveClass.apply(this, arguments);
    $(this).trigger('classChange');
    return result;
  };
})(jQuery, document, window);

(function($, document, window) {
  var aliasesEvent, event, isAnimated, lcFirst, sniffer, triggerCustomEvent, ucFirst, _i, _len, _ref, _results;
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
      transitionEvent: transitionEvent,
      animationEvent: animationEvent,
      transAnimationW3c: transAnimationW3c
    };
  })();
  triggerCustomEvent = function(obj, eventType, event) {
    var originalType;
    originalType = event.type;
    event.type = eventType;
    $.event.dispatch.call(obj, event);
    return event.type = originalType;
  };
  isAnimated = function(el) {
    var hasDuration, key, prefix, style, _i, _len, _ref;
    if (!sniffer.transAnimationSupport) {
      return false;
    }
    style = window.getComputedStyle(el) || {};
    prefix = sniffer.cssPrefix;
    isAnimated = false;
    _ref = ["TransitionDuration", "AnimationDuration"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      hasDuration = style[lcFirst(key)] || style["" + prefix + key];
      if ((hasDuration != null) && hasDuration !== '') {
        isAnimated = true;
        break;
      }
    }
    return isAnimated;
  };
  $.event.special.transAnimationEnd = {
    sniffer: sniffer,
    setup: function(data, namespaces, eventHandle) {
      var $this, thisObject;
      thisObject = this;
      $this = $(thisObject);
      $this.on('classChange', function(event) {
        return $.event.special.transAnimationEnd.handleClassChange(thisObject, event.target);
      });
      if (sniffer.transAnimationW3c) {
        return;
      }
      return $this.on("{sniffer.transitionEvent} {sniffer.animationEvent}", $.noop);
    },
    teardown: function(namespaces) {
      var $this;
      $this = $(this);
      $this.off('classChange');
      return $this.off("{sniffer.transitionEvent} {sniffer.animationEvent}");
    },
    handleClassChange: function(thisObject, origTarget) {
      var ev;
      if (isAnimated(thisObject)) {
        return;
      }
      ev = $.Event("pointerswipe", {
        target: origTarget
      });
      return triggerCustomEvent(thisObject, "pointerswipe", ev);
    }
  };
  aliasesEvent = function(event) {
    return $.event.special[event] = {
      setup: function() {
        return $(this).on('transAnimationEnd', $.noop);
      },
      teardown: function() {
        return $(this).off('transAnimationEnd');
      }
    };
  };
  _ref = ['transitionend', 'animationend'];
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    event = _ref[_i];
    _results.push(aliasesEvent(event));
  }
  return _results;
})(jQuery, document, window);
