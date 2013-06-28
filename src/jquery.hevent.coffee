#
# Name          : hswipe
# Author        : Hiswe halya, https://github.com/hiswe
# Version       : 0.2.0
# Repo          :
# Website       :
# Dependencies  : https://github.com/jquery/jquery-pointer-events
#
# Adapted from jQuery.mobile
# https://github.com/jquery/jquery-mobile/blob/master/js/events/touch.js
#

(($, document, window) ->
  startEvent  = "pointerdown"
  stopEvent   = "pointerup"
  moveEvent   = "pointermove"

  triggerCustomEvent = (obj, eventType, event) ->
    originalType = event.type
    event.type = eventType
    $.event.dispatch.call(obj, event)
    event.type = originalType

  $.event.special.pointerswipe = {
    scrollSupressionThreshold: 30 # More than this horizontal displacement, and we will suppress scrolling.

    durationThreshold: 1000  # More time than this, and it isn't a swipe.

    horizontalDistanceThreshold: 30 # Swipe horizontal displacement must be more than this.

    verticalDistanceThreshold: 75  # Swipe vertical displacement must be less than this.

    start: (event) ->
      data = event
      {
        time: ( new Date() ).getTime()
        coords: [ data.pageX, data.pageY ]
        origin: $( event.target )
      }

    stop: (event) ->
      data = event
      {
        time: ( new Date() ).getTime()
        coords: [ data.pageX, data.pageY ]
      }

    handleSwipe: (start, stop, thisObject, origTarget) ->
      durationTest = stop.time - start.time < $.event.special.pointerswipe.durationThreshold
      hDistanceTest = Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.pointerswipe.horizontalDistanceThreshold
      vDistanceTest = Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.pointerswipe.verticalDistanceThreshold

      if durationTest and hDistanceTest and vDistanceTest
        direction = start.coords[0] > stop.coords[0]

        direction = if direction then "pointerswipeleft" else "pointerswiperight"
        triggerCustomEvent( thisObject, "pointerswipe", $.Event("pointerswipe", { target: origTarget }) )
        triggerCustomEvent( thisObject, direction, $.Event(direction, { target: origTarget }) )

    setup: ->
      thisObject = this
      $this = $(thisObject)

      $this.on(startEvent, (event) ->
        stop = false
        start = $.event.special.pointerswipe.start(event)
        origTarget = event.target

        moveHandler = ( event ) ->
          return unless start
          stop = $.event.special.pointerswipe.stop(event)
          # prevent scrolling
          if Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.pointerswipe.scrollSupressionThreshold
            event.preventDefault()

        $this.on(moveEvent, moveHandler)
          .one(stopEvent, ->
            $this.off(moveEvent, moveHandler)
            if start and stop
              $.event.special.pointerswipe.handleSwipe(start, stop, thisObject, origTarget)

            start = stop = undefined
        )
      )

    teardown: (e) ->
      $(this).off(startEvent).off(moveEvent).off(stopEvent)

  }

  $.each({
    pointerswipeleft: "pointerswipe"
    pointerswiperight: "pointerswipe"
  }, ( event, sourceEvent ) ->
    $.event.special[ event ] = {
      setup: ->
        $(this).on(sourceEvent, $.noop)
      teardown: ->
        $(this).off(sourceEvent)
    }
  )

)(jQuery, document, window)
