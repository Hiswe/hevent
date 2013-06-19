#
# Tweak the addClass and removeClass methods so they can fire events when used
#
# This will be used for the CSS transitionend/animationend event handling if:
#   - No CSS transition/animation are supported
#   - No CSS transition/animation are applied to an element
#
# The jQuery.css method is left unchanged by design
# If you want to add css transition/animation with css properties
# You'd better look at the jQuery.transit plugin
# http://ricostacruz.com/jquery.transit/
#

(($, document, window) ->

  originalAddClass      = jQuery.fn.addClass
  originalRemoveClass   = jQuery.fn.removeClass

  $.fn.addClass    = (className, silent = false) ->
    result = originalAddClass.apply this, [className]
    window.setTimeout =>
      $(this).trigger 'classChange' unless silent
    , 1
    result

  $.fn.removeClass = (className, silent = false ) ->
    result = originalRemoveClass.apply this, [className]
    window.setTimeout =>
      $(this).trigger 'classChange' unless silent
    , 1
    result

)(jQuery, document, window)
