$(function() {
 removeSection = function(e) {
     $(e).parents(".section").remove();
     $('[data-spy="scroll"]').each(function() {
         var $spy = $(this).scrollspy('refresh')
     });
 };
 $("#myScrollspy").scrollspy();
 $(".loading").show();

$(".loadingsb").show();

// getJSON
//loadRawTranJson();
//这样很不合理啊
//loadunIssuecertificate()

});