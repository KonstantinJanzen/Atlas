// Global namespace
var Indeko = Indeko || {};
$ = jQuery;


Indeko.Nodecreation = Indeko.Nodecreation || {
    /**
     * Initializes nodecreation.
     */
    init: function () {
      $(document).ready(function () {

        // toggle node creation links on click
        var createElementLink = $("#newelement");
        createElementLink.click(function () {
          $(".nodeAddLink").toggle();

          // toggle css styling on click
          if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
          } else {
            $(this).addClass('selected');
          }
        });
      });
    }
  };

Indeko.Nodecreation.init();
