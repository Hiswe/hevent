#
# Name          : hCarrousel
# Author        : Hiswe halya, https://github.com/hiswe
# Version       : 0.0.3
# Repo          :
# Website       :
# Dependencies  : jquery.hclass.coffee
#

(($, document, window) ->

  # Utility method
  lcFirst = (text) ->
    text.substr(0, 1).toLowerCase() + text.substr(1)

  ucFirst = (text) ->
    text.substr(0, 1).toUpperCase() + text.substr(1)

  # Determine Css Animation/Transition Support
  # see https://github.com/angular/angular.js/blob/master/src/ng/sniffer.js
  sniffer = (->
    vendorPrefix      = ''
    cssPrefix         = ''
    vendorRegex       = /^(Moz|webkit|O|ms)(?=[A-Z])/
    bodyStyle         = document.body and document.body.style
    transitions       = false
    animations        = false
    transAnimationW3c = false

    if bodyStyle
      for prop of bodyStyle
        match = vendorRegex.exec(prop)
        if match
          vendorPrefix  = ucFirst(match[0])
          # This is the prefix used in getComputedStyle
          cssPrefix     = match[0]
          break

      transitions = !!(bodyStyle["transition"]? or bodyStyle["#{vendorPrefix}Transition"]?)
      animations  = !!(bodyStyle["animation"]? or bodyStyle["#{vendorPrefix}Animation"]?)

    eventList = {
      'default': ['transitionend', 'animationend']
      'Ms': ['MSTransitionEnd', 'MSAnimationEnd']
      'O': ['oTransitionEnd', 'oAnimationEnd']
      'Moz': ['transitionend', 'animationend']
      'Webkit': ['webkitTransitionEnd', 'webkitAnimationEnd']
    }

    if transitions is off and animations is off
      transitionEvent   = animationEvent = ''

    else if vendorPrefix is ''
      transitionEvent   = eventList.default[0]
      animationEvent    = eventList.default[1]
      transAnimationW3c = true
    else
      transitionEvent   = eventList[vendorPrefix][0]
      animationEvent    = eventList[vendorPrefix][1]

    return {
      vendorPrefix:           vendorPrefix
      cssPrefix:              cssPrefix
      transitions:            transitions
      animations:             animations
      transAnimationSupport:  transitions is on and animations is on
      transitionEvent:        transitionEvent
      animationEvent:         animationEvent
      transAnimationW3c:      transAnimationW3c
    }
  )()

  triggerCustomEvent = (obj, eventType, event) ->
    originalType = event.type
    event.type = eventType
    $.event.dispatch.call(obj, event)
    event.type = originalType

  # Check if an element is currently animated
  # It can happen in two ways
  # - No css transitions/animations browser support
  # - No css transitions/animations defined for this element
  #
  # The last case can be changing depending on the CSS rules applied
  # to the element (like media queries, no-animation class, etc.)

  isAnimated = (el) ->
    return false unless sniffer.transAnimationSupport
    # Test if slide elements has animations or transitions
    style       = window.getComputedStyle(el) or {}
    prefix      = sniffer.cssPrefix
    isAnimated  = false
    for key in ["TransitionDuration", "AnimationDuration"]
      hasDuration = style[lcFirst(key)] or style["#{prefix}#{key}"]
      if hasDuration? and hasDuration isnt ''
        isAnimated = true
        break
    isAnimated

  $.event.special.transAnimationEnd = {

    sniffer: sniffer

    setup: (data, namespaces, eventHandle) ->
      thisObject = this
      $this = $(thisObject)

      # Listen to classChange event
      $this.on 'classChange', (event) ->
        $.event.special.transAnimationEnd.handleClassChange thisObject, event.target

      # Regular case
      return if sniffer.transAnimationW3c
      $this.on "{sniffer.transitionEvent} {sniffer.animationEvent}", $.noop


    teardown: (namespaces) ->
      $this = $(this)
      $this.off 'classChange'
      $this.off "{sniffer.transitionEvent} {sniffer.animationEvent}"

    handleClassChange: (thisObject, origTarget) ->
      return if isAnimated(thisObject)
      ev = $.Event("pointerswipe", { target: origTarget })
      triggerCustomEvent( thisObject, "pointerswipe", ev )

  }

  # aliases events
  aliasesEvent = (event) ->
    $.event.special[ event ] = {
      setup: ->
        $(this).on 'transAnimationEnd', $.noop
      teardown: ->
        $(this).off 'transAnimationEnd'
    }

  aliasesEvent event for event in ['transitionend', 'animationend']

)(jQuery, document, window)
