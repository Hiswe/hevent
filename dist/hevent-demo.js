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
        // console.log(event.propertyName, event.elapsedTime);
        $('<p>End</p>').prependTo($transitionFeedback);
        $transitionCheck.attr('disabled', false);
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

    $animationDemo
      .on('tap', function (event){
        // $transitionCheck.attr('disabled', true);
        $animationDemo.heventToggleClass('active');
      })
      .on('animationend', function (event){
        // console.log(event.propertyName, event.elapsedTime);
        $('<p>End</p>').prependTo($animationFeedback);
        // $transitionCheck.attr('disabled', false);
      });

  });
})(jQuery, document, window);
