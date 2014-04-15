#
# Tweak the addClass and removeClass methods so they can fire events when used
#
# The classChange event will be used for the CSS transitionend/animationend event handling if:
#   - No CSS transition/animation are supported
#   - No CSS transition/animation are currently applied to an element
#
# The jQuery.css method is left unchanged by design
# If you want to add css transition/animation with css properties
# You'd better look at the jQuery.transit plugin
# http://ricostacruz.com/jquery.transit/
#

(($, document, window) ->

  aliases = {
    heventAddClass: jQuery.fn.addClass
    heventRemoveClass: jQuery.fn.removeClass
    heventToggleClass: jQuery.fn.toggleClass
  }

  for heventMethod, orginalMethod of aliases
    do ->
      $.fn[heventMethod] = (className) ->
        result = orginalMethod.apply this, [className]
        # timeout needed for the event to be properly fired and listened
        window.setTimeout =>
          $(this).trigger 'classChange'
        , 1
        result

)(jQuery, document, window)
