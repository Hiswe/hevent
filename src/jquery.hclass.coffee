#
# Name          : hclass
# Author        : Hiswe halya, https://github.com/hiswe
# Version       : 0.4.6
# Repo          : git://github.com/Hiswe/hevent
# Website       : https://github.com/Hiswe/hevent
# Dependencies  : Modernizr, jQuery, jquery.hclass.coffee
#

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
    heventAddClass:     'addClass'
    heventRemoveClass:  'removeClass'
    heventToggleClass:  'toggleClass'
  }

  for heventMethod, orginalMethod of aliases
    do ->
      $.fn[heventMethod] = (className) ->
        # timeout needed for the event to be properly fired and listened
        # http://stackoverflow.com/questions/7069167/css-transition-not-firing
        window.setTimeout =>
          jQuery.fn[orginalMethod].apply this, [className]
          $(this).trigger 'classChange'
        , 1

        return this


)(jQuery, document, window)
