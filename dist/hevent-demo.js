(function ($, document, window){
  $(function (){

    var $transitionFeedback   = $('#transitions .feedback');
    var $transitionDemo       = $('.transition-demo');
    var $transitionCheck      = $('#transition-check');

    $transitionDemo
      .on('tap', function (event){
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
