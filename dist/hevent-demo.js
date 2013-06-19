(function ($, document, window){
  $(function (){

    // Pointer events
    // 'pointermove'
    eventList = ['pointerdown', 'pointerup',  'pointercancel',
      'pointerover', 'pointerout', 'pointerswipe', 'pointerswipeleft',
      'pointerswiperight'].join(" ");

    var $pointerFeedback = $('#pointers .feedback');

    $('.pointer-demo').on(eventList, function (event){
      var $text = $('<p>'+event.type.replace('pointer', "")+'</p>');
      $text.prependTo($pointerFeedback);
    });

    // Transitions
    var $transitionFeedback   = $('#transitions .feedback');
    var $transitionDemo       = $('.transition-demo');
    var $transitionCheck      = $('#transition-check');

    $transitionDemo
      .on('click', function (event){
        $transitionCheck.attr('disabled', true);
        $transitionDemo.toggleClass('active');
      })
      .on('transitionend', function (event){
        $('<p>End</p>').prependTo($transitionFeedback);
        $transitionCheck.attr('disabled', false);
      });
    $transitionCheck.on('change', function (event){
      if ($transitionDemo.hasClass('transition')) {
          $transitionDemo.removeClass('transition', true);
      } else {
        $transitionDemo.addClass('transition', true);
      }
    });

  });
})(jQuery, document, window);
