#
# Name          : htransanimation
# Author        : Hiswe halya, https://github.com/hiswe
# Version       : 0.2.1
# Repo          :
# Website       :
# Dependencies  : jquery.hclass.coffee
#

(($, Modernizr,document, window) ->

  return console?.warn('Modernizr should be installed for hevet to work') unless Modernizr?

  trace = false
  trans = 'transanimationend'

  # Utility method
  log   = (args...) ->
    return unless trace
    args.unshift('[TRANS-ANIMATION]')
    console?.log?(args...)

  lcFirst = (text) ->
    text.substr(0, 1).toLowerCase() + text.substr(1)

  ucFirst = (text) ->
    text.substr(0, 1).toUpperCase() + text.substr(1)

  # Determine Css Animation/Transition Support
  # Based on Modernizr
  # http://modernizr.com/docs/#prefixed

  sniffer = (->
    transEndEventNames = {
      'transition'      :'transitionend'
      'msTransition'    :'MSTransitionEnd'
      'OTransition'     :'oTransitionEnd'
      'MozTransition'   :'transitionend'
      'WebkitTransition':'webkitTransitionEnd'
    }

    animationEndEventNames = {
      'animation'       :'animationend'
      'msAnimation'     :'MSAnimationEnd'
      'OAnimation'      :'oAnimationEnd'
      'MozAnimation'    :'animationend'
      'WebkitAnimation' :'webkitAnimationEnd'
    }

    result =  {
      transAnimationSupport:  Modernizr.cssanimations is on and Modernizr.csstransitions is on
      transitionend:          transEndEventNames[ Modernizr.prefixed('transition') ]
      animationend:           animationEndEventNames[ Modernizr.prefixed('animation') ]
    }
    log('sniffer', result)
    result

  )()

  triggerCustomEvent = (obj, eventType, event) ->
    log('triggerCustomEvent')
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
    log('isAnimated', 'begin animation check')
    return false unless sniffer.transAnimationSupport
    # Test if slide elements has animations or transitions
    style       = window.getComputedStyle(el) or {}
    prefix      = sniffer.cssPrefix
    animated    = false

    for key in ["TransitionDuration", "AnimationDuration"]
      hasDuration = style[lcFirst(key)] or style["#{prefix}#{key}"]
      if hasDuration? and hasDuration isnt '' and hasDuration isnt '0s'
        animated = true
        break
    log('isAnimated', animated)
    animated

  $.event.special[trans] = {

    sniffer: sniffer

    setup: (data, namespaces, eventHandle) ->
      log('setup')
      thisObject  = this
      $this       = $(thisObject)
      eventName   = data.hevent

      # Listen to classChange event
      $this.on 'classChange', (event) ->
        $.event.special[trans].handleClassChange thisObject, event.target, eventName

      # Regular case
      return log('W3C event name') if eventName is sniffer[eventName]
      # redirect prefixed transition to W3C one
      $this.on sniffer[eventName], (event) ->
        $.event.special[trans].fireEvent thisObject, event.target, eventName

    teardown: (namespaces) ->
      $this = $(this)
      $this.off 'classChange'
      $this.off "#{sniffer.transitionEnd} #{sniffer.animationEnd}"
      $this.off "transitionend animationend"

    handleClassChange: (thisObject, origTarget, eventName) ->
      log('handleClassChange')
      ev = $.Event(trans, { target: origTarget })
      triggerCustomEvent( thisObject, trans, ev )
      return true if isAnimated(thisObject)
      $.event.special[trans].fireEvent thisObject, origTarget, eventName

    fireEvent: (thisObject, origTarget, eventName) ->
      log('fireEvent')
      ev = $.Event( eventName, { target: origTarget })
      triggerCustomEvent( thisObject, eventName, ev)
  }

  # aliases events
  aliasesEvent = (eventName) ->
    $.event.special[ eventName ] = {
      setup: ->
        $(this).on trans, {hevent: eventName}, $.noop
        # Returning false tells jQuery to bind the specified event handler using native DOM methods.
        # http://benalman.com/news/2010/03/jquery-special-events/#api-setup
        if eventName is sniffer[eventName]
          log('Use original event for', eventName)
          return false

      teardown: ->
        $(this).off trans
    }

  aliasesEvent eventName for eventName in ['transitionend', 'animationend']

)(jQuery, Modernizr, document, window)
