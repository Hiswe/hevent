#
# Name          : htransanimation
# Author        : Hiswe halya, https://github.com/hiswe
# Version       : 0.4.8
# Repo          : git://github.com/Hiswe/hevent
# Website       : https://github.com/Hiswe/hevent
# Dependencies  : Modernizr, jQuery, jquery.hclass.coffee
#

hevent = ($, Modernizr) ->

  return console?.warn('Modernizr should be installed for hevent to work') unless Modernizr?

  trace = false

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
      transitionendSupport:   Modernizr.csstransitions is on
      animationendSupport:    Modernizr.cssanimations is on
      transAnimationSupport:  Modernizr.cssanimations is on and Modernizr.csstransitions is on
      transitionend:          transEndEventNames[ Modernizr.prefixed('transition') ]
      animationend:           animationEndEventNames[ Modernizr.prefixed('animation') ]
      durations:              [Modernizr.prefixed('TransitionDuration'), Modernizr.prefixed('AnimationDuration')]
    }
    log('sniffer', result)
    result

  )()

  # Check if an element is currently animated
  # It can happen in two ways
  # - No css transitions/animations browser support
  # - No css transitions/animations defined for this element
  #
  # The last case can be changing depending on the CSS rules applied
  # to the element (like media queries, no-animation class, etc.)

  isAnimated = (el) ->
    return false unless sniffer.transAnimationSupport

    # Test if elements has animations or transitions
    style       = getComputedStyle(el) or {}
    animated    = false

    for key in sniffer.durations
      # Sometines it doesn't need to be lcFirst
      hasDuration = style[key]
      if hasDuration? and hasDuration isnt '' and hasDuration isnt '0s'
        animated = true
        break
      # But let's  also try with lcFirst
      hasDuration = style[lcFirst(key)]
      if hasDuration? and hasDuration isnt '' and hasDuration isnt '0s'
        animated = true
        break
    log('[IS ANIMATED]', animated)
    animated

  #
  triggerCustomEvent = (obj, eventType, event) ->
    log('[TRIGGER CUSTOM EVENT]', event)
    originalType = event.type
    event.type = eventType
    $.event.dispatch.call(obj, event)
    event.type = originalType

  # Make a jQuery special event:
  # heventend
  # this is a common event for both transitionend & animationend
  # Here we can hook it and check to custom classChange event
  $.event.special.heventend = {

    sniffer: sniffer

    setup: (data, namespaces) ->
      log('setup')
      thisObject  = this
      $this       = $(thisObject)
      eventName   = data.hevent

      # Listen to classChange event
      $this.on 'classChange', (event) ->
        $.event.special.heventend.handleClassChange(thisObject, event, eventName)

      # Regular case: no need to aliase a prefixed DOM event
      if eventName is sniffer[eventName]
        log('W3C event', eventName)
        return false

      # redirect prefixed transition to W3C one
      $this.on sniffer[eventName], (event) ->
        log('original event', event)
        $.event.special.heventend.fireEvent(thisObject, event, eventName)

    teardown: (namespaces) ->
      $this = $(this)
      $this.off 'classChange'
      $this.off "#{sniffer.transitionEnd} #{sniffer.animationEnd}"
      $this.off "transitionend animationend"

    handleClassChange: (thisObject, event, eventName) ->
      origTarget = event.target
      log('[HANDLE CLASS CHANGE]', event)
      ev = $.Event('heventend', { target: origTarget })
      triggerCustomEvent( thisObject, 'heventend', ev )
      return true if isAnimated(origTarget)
      $.event.special.heventend.fireEvent(thisObject, event, eventName)

    # proxy prefixed event to non-prefixed one
    fireEvent: (thisObject, event, eventName) ->
      log('[FIRE EVENT]', event.type)

      if event.type is sniffer[eventName] or event.type is eventName
        log('[FIRE EVENT]', 'use DOM originalEvent')
        originalEvent = event
      else
        log('[FIRE EVENT]', 'Create custom original')
        # Simulate an original event
        # this is to be able to determine if it's truly an *end
        # or a simulated one
        originalEvent = $.Event( 'hevent', {target: event.target})

      # Create a new jquery Event
      # https://api.jquery.com/category/events/event-object/
      newEvent         = $.Event( eventName, {
        target: event.target
        originalEvent: originalEvent
      })
      log('[FIRE EVENT] final event')
      $.event.dispatch.call(thisObject, newEvent)
  }

  # Aliases transitionend & animationend
  # so they point to heventend events
  aliasesEvent = (eventName) ->
    # Don't normalize those properties
    # http://learn.jquery.com/events/event-extensions/#jquery-event-fixhooks-object
    jQuery.event.fixHooks[eventName] = {
      props: ['propertyName', 'elapsedTime']
    }

    $.event.special[ eventName ] = {
      setup: ->
        $(this).on('heventend', {hevent: eventName}, $.noop)
        # Returning false tells jQuery to bind the specified event handler using native DOM methods.
        # http://benalman.com/news/2010/03/jquery-special-events/#api-setup
        if sniffer[eventName + 'Support']
          log('Use browser event for', eventName)
          return false

      teardown: ->
        $(this).off('heventend')
    }

  for eventName in ['transitionend', 'animationend']
    do (eventName) -> aliasesEvent(eventName )


# UMD
# https://github.com/umdjs/umd/blob/master/jqueryPluginCommonjs.js
((factory) ->
  if typeof define is 'function' and define.amd
    # AMD. Register as an anonymous module.
    define(['jquery', 'modernizr'], factory)
  else if typeof exports is 'object'
    # Node/CommonJS
    factory(require('jquery', ''), require('modernizr', ''))
  else
    # Browser globals
    factory(jQuery, Modernizr)
)(hevent)
