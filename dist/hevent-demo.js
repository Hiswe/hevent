(function ($, document, window){
  $(function (){

    var $transitionFeedback   = $('#transitions .feedback');
    var $transitionDemo       = $('.transition-demo');
    var $transitionCheck      = $('#transition-check');

    $transitionDemo
      .on('tap', function (event){
        $transitionCheck.attr('disabled', true);
        $transitionDemo.heventToggleClass('active');
      })
      .on('transitionend', function (event){
        $transitionCheck.attr('disabled', false);
        // console.log(event.propertyName, event.elapsedTime);
        // console.log(event.originalEvent.type);
        var e = event.originalEvent
        $('<p>' + e.type + '</p>').prependTo($transitionFeedback);
      });
    $transitionCheck.on('change', function (event){
      if ($transitionDemo.hasClass('transition')) {
          $transitionDemo.removeClass('transition');
      } else {
        $transitionDemo.addClass('transition');
      }
    });

    var $animationDemo       = $('.animation-demo');
    var $animationFeedback   = $('#animations .feedback');
    var $animationCheck      = $('#animation-check');

    $animationCheck.on('change', function (event){
      // console.log('toggle animation');
      $animationDemo.toggleClass('animation');
    });

    $animationDemo
      .on('tap', function (event){
        $animationDemo.heventToggleClass('active');
      })
      .on('animationend', function (event){
        // console.log(event.propertyName, event.elapsedTime);
        var e = event.originalEvent;
        $('<p>' + e.type + '</p>').prependTo($animationFeedback);
      });


  });
})(jQuery, document, window);
