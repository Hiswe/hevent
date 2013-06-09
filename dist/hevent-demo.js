(function ($, document, window){
  $(function (){

    // 'pointermove'
    eventList = ['pointerdown', 'pointerup',  'pointercancel',
      'pointerover', 'pointerout', 'pointerswipe', 'pointerswipeleft',
      'pointerswiperight'].join(" ");

    $feedback = $('.pointer-feedback')

    $('.pointer-demo').on(eventList, function (event){
      $text = $('<p>'+event.type.replace('pointer', "")+'</p>');
      $text.prependTo($feedback);
    });

  });
})(jQuery, document, window);
